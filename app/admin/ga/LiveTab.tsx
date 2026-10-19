"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 실시간 방문자 탭
//  · GA4 실시간(최근 30분) — 60초 갱신. 자체 추적 — 15초 폴링 (Realtime 구독 대신 폴링: 별도 publication 설정 없이 동작).
//  · 자체 추적: 지금 접속 중인 세션 → 클릭하면 여정 타임라인 / 랜딩별 섹션 도달 퍼널 / 최근 24시간 이탈 지점
//  · 탭을 떠나면(언마운트) 모든 interval·요청을 정리한다.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { funnelDrop } from "@/lib/gaInsights";
import { TRACK_SECTION_LABEL, TRACK_SOURCE_LABEL } from "@/lib/trackSections";
import { Empty, ErrBox, Insight, Skel, fetchJson, mmss, num, pct, type ApiError } from "./ga-shared";

type Realtime = {
  ok: true;
  total: number;
  pages: { name: string; users: number }[];
  devices: { name: string; users: number }[];
  fetchedAt: string;
};
type LiveSession = {
  sessionId: string;
  sourceType: string;
  device: string | null;
  path: string;
  enteredAt: string;
  sessionStart: string;
  pages: number;
  durationSec: number;
  maxScrollPct: number;
  lastSection: string | null;
};
type LiveRes = { ok: true; now: string; sessions: LiveSession[] };
type Journey = {
  ok: true;
  ended: boolean;
  pages: { path: string; enteredAt: string; durationSec: number; maxScrollPct: number; lastSection: string | null; sourceType: string }[];
  sections: { path: string; section: string }[];
};
type FunnelRes = {
  ok: true;
  days: number;
  paths: { path: string; sessions: number }[];
  path?: string;
  totalSessions?: number;
  rows?: { section: string; sessions: number; rate: number }[];
};
type ExitsRes = { ok: true; sessions: number; exited: number; top: { path: string; section: string; count: number }[] };

const DEVICE_LABEL: Record<string, string> = { mobile: "모바일", desktop: "데스크톱", tablet: "태블릿", "smart tv": "스마트 TV" };
const LIVE_MS = 15_000;
const FUNNEL_MIN = 30;
const GA_RT_MS = 60_000;
const secLabel = (s: string | null) => (s ? (TRACK_SECTION_LABEL[s] ? `${TRACK_SECTION_LABEL[s]}(${s})` : s) : "-");

function DeviceIcon({ device }: { device: string | null }) {
  const d = (device ?? "").toLowerCase();
  const common = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  return (
    <span className="ga-dev-ic" title={DEVICE_LABEL[d] ?? device ?? "기기 미상"}>
      {d === "desktop" ? (
        <svg {...common}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>
      ) : d === "tablet" ? (
        <svg {...common}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M11 18h2" /></svg>
      ) : (
        <svg {...common}><rect x="7" y="3" width="10" height="18" rx="2" /><path d="M11 18h2" /></svg>
      )}
    </span>
  );
}

function SourceBadge({ type }: { type: string }) {
  return <span className={`ga-src ${type}`}>{TRACK_SOURCE_LABEL[type] ?? type}</span>;
}

export default function LiveTab({ from, to }: { from: string; to: string }) {
  const periodLabel = from === to ? from : `${from} ~ ${to}`;
  // ── GA4 실시간 ──
  const [rt, setRt] = useState<Realtime | null>(null);
  const [rtErr, setRtErr] = useState<ApiError | null>(null);
  const [rtAt, setRtAt] = useState<Date | null>(null);

  const loadRealtime = useCallback(async (signal?: AbortSignal) => {
    try {
      const data = await fetchJson<Realtime>("/api/admin/ga/realtime", signal);
      if (data.ok) {
        setRt(data);
        setRtErr(null);
        setRtAt(new Date());
      } else setRtErr(data);
    } catch (e) {
      if ((e as Error).name !== "AbortError") setRtErr({ ok: false, code: "NETWORK", message: "네트워크 오류로 실시간 데이터를 불러오지 못했습니다." });
    }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    loadRealtime(ctrl.signal);
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") loadRealtime(ctrl.signal);
    }, GA_RT_MS);
    return () => {
      window.clearInterval(id);
      ctrl.abort();
    };
  }, [loadRealtime]);

  // ── 자체 추적: 실시간 세션 ──
  const [live, setLive] = useState<LiveRes | null>(null);
  const [liveErr, setLiveErr] = useState<ApiError | null>(null);
  const [skew, setSkew] = useState(0); // 서버 시계 - 브라우저 시계
  const [tick, setTick] = useState(0); // 체류 시간을 1초마다 다시 그리기 위한 값
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const knownIds = useRef<Set<string> | null>(null);
  const [openSid, setOpenSid] = useState<string | null>(null);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [journeyErr, setJourneyErr] = useState<ApiError | null>(null);

  const loadLive = useCallback(async (signal?: AbortSignal) => {
    try {
      const data = await fetchJson<LiveRes>("/api/admin/track?view=live", signal);
      if (data.ok) {
        // 처음 불러온 뒤에 새로 들어온 세션은 3초간 강조한다
        const fresh = knownIds.current ? data.sessions.filter((x) => !knownIds.current!.has(x.sessionId)).map((x) => x.sessionId) : [];
        knownIds.current = new Set(data.sessions.map((x) => x.sessionId));
        if (fresh.length) {
          setNewIds((cur) => new Set([...cur, ...fresh]));
          window.setTimeout(() => setNewIds((cur) => new Set([...cur].filter((id) => !fresh.includes(id)))), 3000);
        }
        setLive(data);
        setLiveErr(null);
        setSkew(Date.parse(data.now) - Date.now());
      } else setLiveErr(data);
    } catch (e) {
      if ((e as Error).name !== "AbortError") setLiveErr({ ok: false, code: "NETWORK", message: "네트워크 오류로 방문자 목록을 불러오지 못했습니다." });
    }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    loadLive(ctrl.signal);
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") loadLive(ctrl.signal);
    }, LIVE_MS);
    const clock = window.setInterval(() => setTick((v) => v + 1), 1000);
    return () => {
      window.clearInterval(id);
      window.clearInterval(clock);
      ctrl.abort();
    };
  }, [loadLive]);

  // 세션 클릭 → 여정 (열려 있는 동안 15초마다 새로 고침)
  useEffect(() => {
    if (!openSid) return;
    const ctrl = new AbortController();
    const load = async () => {
      try {
        const data = await fetchJson<Journey>(`/api/admin/track?view=journey&session=${encodeURIComponent(openSid)}`, ctrl.signal);
        if (data.ok) {
          setJourney(data);
          setJourneyErr(null);
        } else setJourneyErr(data);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setJourneyErr({ ok: false, code: "NETWORK", message: "여정을 불러오지 못했습니다." });
      }
    };
    setJourney(null);
    load();
    const id = window.setInterval(load, LIVE_MS);
    return () => {
      window.clearInterval(id);
      ctrl.abort();
    };
  }, [openSid]);

  // ── 섹션 도달 퍼널 / 이탈 지점 ──
  const [funnelPath, setFunnelPath] = useState<string>("");
  const [funnel, setFunnel] = useState<FunnelRes | null>(null);
  const [funnelErr, setFunnelErr] = useState<ApiError | null>(null);
  const [exits, setExits] = useState<ExitsRes | null>(null);
  const [exitsErr, setExitsErr] = useState<ApiError | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const q = `/api/admin/track?view=funnel&from=${from}&to=${to}${funnelPath ? `&path=${encodeURIComponent(funnelPath)}` : ""}`;
        const data = await fetchJson<FunnelRes>(q, ctrl.signal);
        if (data.ok) {
          setFunnel(data);
          setFunnelErr(null);
          if (!funnelPath && data.paths.length) setFunnelPath(data.paths[0].path);
        } else setFunnelErr(data);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setFunnelErr({ ok: false, code: "NETWORK", message: "퍼널을 불러오지 못했습니다." });
      }
    })();
    return () => ctrl.abort();
  }, [from, to, funnelPath]);

  useEffect(() => {
    const ctrl = new AbortController();
    const load = async () => {
      try {
        const data = await fetchJson<ExitsRes>(`/api/admin/track?view=exits&from=${from}&to=${to}`, ctrl.signal);
        if (data.ok) {
          setExits(data);
          setExitsErr(null);
        } else setExitsErr(data);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setExitsErr({ ok: false, code: "NETWORK", message: "이탈 지점을 불러오지 못했습니다." });
      }
    };
    load();
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 60_000);
    return () => {
      window.clearInterval(id);
      ctrl.abort();
    };
  }, [from, to]);

  const now = Date.now() + skew + tick * 0; // tick 은 재렌더 트리거
  const elapsed = (iso: string) => Math.max(0, Math.round((now - Date.parse(iso)) / 1000));

  const drop = useMemo(() => (funnel?.rows ? funnelDrop(funnel.rows) : null), [funnel]);
  const deviceTotal = rt?.devices.reduce((s, d) => s + d.users, 0) ?? 0;
  const pageMax = Math.max(1, ...(rt?.pages.map((p) => p.users) ?? [1]));
  const notReady = [liveErr, funnelErr, exitsErr].find((e) => e?.code === "TRACK_NOT_READY") ?? null;

  const liveInsight = live
    ? live.sessions.length
      ? (() => {
          const by = new Map<string, number>();
          live.sessions.forEach((s) => by.set(s.sourceType, (by.get(s.sourceType) ?? 0) + 1));
          const top = [...by.entries()].sort((a, b) => b[1] - a[1])[0];
          return `지금 사이트에 ${live.sessions.length}명 — ${TRACK_SOURCE_LABEL[top[0]] ?? top[0]} 유입이 ${top[1]}명으로 가장 많습니다`;
        })()
      : "지금 사이트에 머무는 방문자가 없습니다"
    : null;
  const funnelInsight = drop
    ? `${secLabel(drop.from)} → ${secLabel(drop.to)} 구간에서 ${(drop.drop * 100).toFixed(0)}%p 이탈 — 가장 많이 떨어지는 지점입니다`
    : funnel?.rows && funnel.rows.length
      ? "섹션 사이에 뚜렷한 이탈 구간이 없습니다"
      : null;

  return (
    <div>
      {/* ── GA4 실시간 ─────────────────────────────────────────────── */}
      <section className="ga-card" aria-label="GA4 실시간 접속 현황">
        <h2 className="ga-h">GA4 실시간 (최근 30분)</h2>
        {rtErr && !rt ? (
          <ErrBox title="실시간 데이터를 불러오지 못했습니다" err={rtErr} />
        ) : !rt ? (
          <div className="ga-live" aria-busy="true">
            <Skel h={56} />
            <Skel h={120} />
            <Skel h={120} />
          </div>
        ) : (
          <div className="ga-live">
            <div>
              <div className="ga-live-num">
                <span className="ga-dot" aria-hidden="true" />
                <span aria-live="polite">{num(rt.total)}</span>
                <small>명 접속 중</small>
              </div>
              <p className="ga-sub" style={{ marginTop: 10 }}>
                60초마다 자동 갱신{rtAt ? ` · 마지막 ${rtAt.toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul", hour12: false })}` : ""}
              </p>
              {rtErr && <p className="ga-sub" style={{ color: "#fca5a5", marginTop: 6 }}>갱신 실패: {rtErr.message}</p>}
            </div>
            <div>
              <h3 className="ga-kpi-l" style={{ marginBottom: 10 }}>지금 보는 페이지 Top 10</h3>
              {rt.pages.length === 0 ? (
                <Empty hint="접속이 생기면 60초 안에 나타납니다">지금 접속 중인 사용자가 없습니다</Empty>
              ) : (
                <ul className="ga-list">
                  {rt.pages.map((p) => (
                    <li key={p.name}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                          <span title={p.name}>{p.name}</span>
                          <b>{num(p.users)}</b>
                        </div>
                        <div className="ga-bar"><i style={{ width: `${(p.users / pageMax) * 100}%` }} /></div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h3 className="ga-kpi-l" style={{ marginBottom: 10 }}>기기</h3>
              {rt.devices.length === 0 ? (
                <Empty hint="접속이 생기면 나타납니다">데이터가 없습니다</Empty>
              ) : (
                <div className="ga-dev">
                  {rt.devices.map((d) => (
                    <div className="ga-dev-row" key={d.name}>
                      <div>
                        <span>{DEVICE_LABEL[d.name.toLowerCase()] ?? d.name}</span>
                        <b>{deviceTotal ? Math.round((d.users / deviceTotal) * 100) : 0}% · {num(d.users)}명</b>
                      </div>
                      <div className="ga-bar"><i style={{ width: `${deviceTotal ? (d.users / deviceTotal) * 100 : 0}%` }} /></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {notReady && (
        <div style={{ marginTop: 14 }}>
          <ErrBox title="자체 방문 추적 준비 중" err={notReady} />
        </div>
      )}

      {/* ── 자체 추적: 지금 사이트에 있는 세션 ─────────────────────────── */}
      {!notReady && (
        <>
          <section className="ga-card" aria-label="지금 접속 중인 세션">
            <h2 className="ga-h">지금 사이트에 있는 방문자 <span className="ga-sub">· 15초마다 갱신 · 세션을 누르면 여정을 봅니다</span></h2>
            {live && live.sessions.length > 0 && <Insight text={liveInsight} />}
            {liveErr && !live ? (
              <ErrBox title="방문자 목록을 불러오지 못했습니다" err={liveErr} />
            ) : !live ? (
              <Skel h={72} />
            ) : live.sessions.length === 0 ? (
              <Empty hint="방문이 생기면 15초 안에 여기에 나타납니다">지금 접속 중인 방문자가 없습니다</Empty>
            ) : (
              <ul className="ga-sess">
                {live.sessions.map((s) => (
                  <li key={s.sessionId}>
                    <button type="button" className={newIds.has(s.sessionId) ? "is-new" : undefined} aria-pressed={openSid === s.sessionId} onClick={() => setOpenSid((cur) => (cur === s.sessionId ? null : s.sessionId))}>
                      <SourceBadge type={s.sourceType} />
                      <span className="ga-sess-main">
                        <div className="ga-sess-path" title={s.path}>{s.path}</div>
                        <div className="ga-sess-meta">
                          <DeviceIcon device={s.device} /> {s.device ? `${DEVICE_LABEL[s.device] ?? s.device} · ` : ""}{s.pages}페이지 지나옴 · 스크롤 {s.maxScrollPct}% · 마지막 섹션 {secLabel(s.lastSection)}
                        </div>
                      </span>
                      <span className="ga-sess-t" title="이 페이지에서 머문 시간">{mmss(elapsed(s.enteredAt))}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {openSid && (
              <div className="ga-journey" aria-live="polite">
                <h3 className="ga-kpi-l" style={{ marginBottom: 12 }}>방문 여정</h3>
                {journeyErr ? (
                  <ErrBox title="여정을 불러오지 못했습니다" err={journeyErr} />
                ) : !journey ? (
                  <Skel h={60} />
                ) : (
                  <ol className="ga-tl">
                    {journey.pages.map((p, i) => (
                      <li key={`${p.enteredAt}-${i}`}>
                        <b>{p.path}</b> ({p.durationSec}초, 스크롤 {p.maxScrollPct}%
                        {p.lastSection ? `, 마지막 섹션 ${p.lastSection}` : ""})
                      </li>
                    ))}
                    <li className={journey.ended ? "is-end" : undefined}>{journey.ended ? "이탈" : "접속 중"}</li>
                  </ol>
                )}
              </div>
            )}
          </section>

          {/* ── 섹션 도달 퍼널 ───────────────────────────────────────── */}
          <section className="ga-card" aria-label="섹션 도달 퍼널">
            <div className="ga-row">
              <h2 className="ga-h" style={{ margin: 0 }}>랜딩 섹션 도달 퍼널 <span className="ga-sub">· {periodLabel}</span></h2>
              <span className="ga-fsel">
                <select className="ga-select" aria-label="랜딩 선택" value={funnelPath} onChange={(e) => setFunnelPath(e.target.value)}>
                  {(funnel?.paths ?? []).map((p) => (
                    <option key={p.path} value={p.path}>{p.path}</option>
                  ))}
                </select>
                {funnel?.paths.find((p) => p.path === funnelPath) && (
                  <span className="ga-sub">세션 {num(funnel.paths.find((p) => p.path === funnelPath)!.sessions)}</span>
                )}
              </span>
            </div>
            <Insight text={funnelInsight} />
            {funnelErr && !funnel ? (
              funnelErr.code === "TRACK_NOT_READY" ? null : <ErrBox title="퍼널을 불러오지 못했습니다" err={funnelErr} />
            ) : !funnel ? (
              <Skel h={90} />
            ) : !funnel.rows || funnel.rows.length === 0 ? (
              <Empty hint="방문이 생기면 이 기간 안에서 집계됩니다">{funnel.paths.length === 0 ? "추적된 랜딩 방문이 아직 없습니다" : "이 랜딩의 섹션 도달 기록이 아직 없습니다"}</Empty>
            ) : (
              <div className={"ga-fbars" + (funnel.totalSessions !== undefined && funnel.totalSessions < FUNNEL_MIN ? " is-low" : "")}>
                {funnel.totalSessions !== undefined && funnel.totalSessions < FUNNEL_MIN && (
                  <p><span className="ga-warnbadge">표본 적음 ({num(funnel.totalSessions)}세션) — 판단 보류 권장</span></p>
                )}
                {funnel.rows.map((r, i) => {
                  const prev = i > 0 ? funnel.rows![i - 1].rate : null;
                  const dr = prev === null ? null : prev - r.rate;
                  const isDrop = !!drop && drop.index === i;
                  const isWarn = !isDrop && dr !== null && Math.round(dr * 100) >= 20;
                  return (
                    <div className={"ga-fbar" + (isDrop ? " is-drop" : isWarn ? " is-warn" : "")} key={r.section}>
                      <span className="ga-fbar-name" title={r.section}>{TRACK_SECTION_LABEL[r.section] ?? r.section}</span>
                      <span className="ga-fbar-track"><i style={{ width: `${Math.max(2, r.rate * 100)}%` }} /></span>
                      <span className="ga-fbar-r">
                        <span className="ga-fbar-v">도달 {num(r.sessions)}명 · {Math.round(r.rate * 100)}%</span>
                        <span className="ga-fbar-d" title="직전 섹션 대비">
                          {dr === null ? "–" : dr > 0 ? `−${(dr * 100).toFixed(0)}%p` : dr < 0 ? `+${(-dr * 100).toFixed(0)}%p` : "0%p"}
                        </span>
                      </span>
                    </div>
                  );
                })}
                <p className="ga-sub">기준: 이 랜딩에 들어온 {num(funnel.totalSessions ?? 0)}세션 중 섹션을 50% 이상 본 세션 · 빨강 = 직전 대비 가장 크게 떨어진 구간 · 주황 = 20%p 이상 하락</p>
              </div>
            )}
          </section>

          {/* ── 이탈 지점 ───────────────────────────────────────────── */}
          <section className="ga-card" aria-label="이탈 지점">
            <h2 className="ga-h">이탈 지점 Top <span className="ga-sub">· {periodLabel} · (페이지, 마지막으로 본 섹션) 조합</span></h2>
            {exitsErr && !exits ? (
              exitsErr.code === "TRACK_NOT_READY" ? null : <ErrBox title="이탈 지점을 불러오지 못했습니다" err={exitsErr} />
            ) : !exits ? (
              <Skel h={90} />
            ) : exits.top.length === 0 ? (
              <Empty hint="방문자가 사이트를 떠나면 여기에 쌓입니다">이탈로 집계된 세션이 아직 없습니다</Empty>
            ) : (
              <div className="ga-table-wrap">
                <table className="ga-table">
                  <thead>
                    <tr><th>페이지</th><th>마지막 섹션</th><th>이탈 세션</th><th>비율</th></tr>
                  </thead>
                  <tbody>
                    {exits.top.map((r) => (
                      <tr key={`${r.path}|${r.section}`}>
                        <td title={r.path}>{r.path}</td>
                        <td>{secLabel(r.section)}</td>
                        <td>{num(r.count)}</td>
                        <td>{exits.exited ? pct(r.count / exits.exited) : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
