"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 실시간 방문자 탭
//  · GA4 실시간(최근 30분) — 60초 갱신. 자체 추적 — 15초 폴링 (Realtime 구독 대신 폴링: 별도 publication 설정 없이 동작).
//  · 자체 추적: 지금 접속 중인 세션 → 클릭하면 여정 타임라인 (섹션 도달 퍼널·이탈 지점은 랜딩 성과 탭)
//  · 탭을 떠나도 언마운트하지 않고 숨긴다 — 비활성 동안은 폴링·1초 시계·애니메이션이 모두 멈춘다 (useTabActive).
// ─────────────────────────────────────────────────────────────────────────────

import { memo, useState, useSyncExternalStore } from "react";
import { TRACK_SECTION_LABEL, TRACK_SOURCE_LABEL } from "@/lib/trackSections";
import { Empty, ErrBox, Insight, Skel, mmss, num, useTabActive } from "./ga-shared";
import { useGaData } from "./useGaData";
import { CountUp } from "./ga-motion";

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

const fmtInt = (n: number) => num(Math.round(n));
const DEVICE_LABEL: Record<string, string> = { mobile: "모바일", desktop: "데스크톱", tablet: "태블릿", "smart tv": "스마트 TV" };
const LIVE_MS = 15_000;
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

// 1초 시계 — 구독자가 있을 때만 하나의 타이머가 돈다. 체류 시간 칸만 다시 그린다 (목록 전체 재렌더 없음).
const clockSubs = new Set<() => void>();
let clockId = 0;
const subscribeClock = (fn: () => void) => {
  clockSubs.add(fn);
  if (!clockId) {
    clockId = window.setInterval(() => {
      clockSubs.forEach((f) => f());
    }, 1000);
  }
  return () => {
    clockSubs.delete(fn);
    if (!clockSubs.size) {
      window.clearInterval(clockId);
      clockId = 0;
    }
  };
};
const noopSubscribe = () => () => {};
const clockNow = () => Math.floor(Date.now() / 1000) * 1000; // 초 단위로 고정된 현재 시각 (같은 초 안에서는 같은 값)

function Elapsed({ iso, skew }: { iso: string; skew: number }) {
  const active = useTabActive();
  const now = useSyncExternalStore(active ? subscribeClock : noopSubscribe, clockNow, clockNow);
  return <>{mmss(Math.max(0, Math.round((now + skew - Date.parse(iso)) / 1000)))}</>;
}

function LiveTabImpl() {
  const active = useTabActive();

  // ── GA4 실시간 (60초 갱신 · SummaryStrip 과 같은 요청을 공유) ──
  const rtRes = useGaData<Realtime>("/api/admin/ga/realtime", { staleMs: 20_000, pollMs: GA_RT_MS, active, netMsg: "네트워크 오류로 실시간 데이터를 불러오지 못했습니다." });
  const rt = rtRes.data;
  const rtErr = rtRes.error;
  const rtAt = rtRes.at ? new Date(rtRes.at) : null;

  // ── 자체 추적: 실시간 세션 (15초 갱신) ──
  const liveRes = useGaData<LiveRes>("/api/admin/track?view=live", { staleMs: 5_000, pollMs: LIVE_MS, active, netMsg: "네트워크 오류로 방문자 목록을 불러오지 못했습니다." });
  const live = liveRes.data;
  const liveErr = liveRes.error;
  // 서버 시계 - 브라우저 시계 (응답을 받은 시각 기준)
  const skew = live && liveRes.at ? Date.parse(live.now) - liveRes.at : 0;

  // 처음 불러온 뒤 새로 들어온 세션: 직전 응답에 없던 세션을 강조한다 (렌더 중 파생 상태 — 새 응답이 올 때만 갱신)
  const [seen, setSeen] = useState<{ src: LiveRes; ids: ReadonlySet<string>; fresh: ReadonlySet<string> } | null>(null);
  if (live && (!seen || seen.src !== live)) {
    const ids = new Set(live.sessions.map((x) => x.sessionId));
    setSeen({ src: live, ids, fresh: seen ? new Set([...ids].filter((id) => !seen.ids.has(id))) : new Set() });
  }
  const fresh = seen?.fresh;
  const [openSid, setOpenSid] = useState<string | null>(null);

  // 세션 클릭 → 여정 (열려 있는 동안 15초마다 새로 고침)
  const journeyRes = useGaData<Journey>(openSid ? `/api/admin/track?view=journey&session=${encodeURIComponent(openSid)}` : null, { staleMs: 5_000, pollMs: LIVE_MS, active, netMsg: "여정을 불러오지 못했습니다." });
  const journey = journeyRes.data;
  const journeyErr = journeyRes.error;

  const deviceTotal = rt?.devices.reduce((s, d) => s + d.users, 0) ?? 0;
  const pageMax = Math.max(1, ...(rt?.pages.map((p) => p.users) ?? [1]));
  const notReady = [liveErr].find((e) => e?.code === "TRACK_NOT_READY") ?? null;

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
                <span aria-live="polite" aria-atomic="true"><span aria-hidden="true"><CountUp value={rt.total} format={fmtInt} /></span><span className="ga-sr">{num(rt.total)}</span></span>
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
                    <button type="button" className={fresh?.has(s.sessionId) ? "is-new" : undefined} aria-pressed={openSid === s.sessionId} onClick={() => setOpenSid((cur) => (cur === s.sessionId ? null : s.sessionId))}>
                      <span className="ga-sess-top">
                        <SourceBadge type={s.sourceType} />
                        <span className="ga-sess-path" title={s.path}>{s.path}</span>
                        <span className="ga-sess-t" title="이 페이지에서 머문 시간"><Elapsed iso={s.enteredAt} skew={skew} /></span>
                      </span>
                      <span className="ga-sess-chips">
                        <span className="ga-chip" title={s.device ? DEVICE_LABEL[s.device] ?? s.device : "기기 미상"}>
                          <DeviceIcon device={s.device} />{s.device ? DEVICE_LABEL[s.device] ?? s.device : "기기 미상"}
                        </span>
                        <span className="ga-chip" title="지나온 페이지 수">{s.pages}페이지</span>
                        <span className="ga-chip" title="최대 스크롤 깊이">스크롤 {s.maxScrollPct}%</span>
                        <span className="ga-chip is-sec" title={`마지막 섹션 ${secLabel(s.lastSection)}`}>섹션 {s.lastSection ? TRACK_SECTION_LABEL[s.lastSection] ?? s.lastSection : "-"}</span>
                      </span>
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

        </>
      )}
    </div>
  );
}

const LiveTab = memo(LiveTabImpl);
export default LiveTab;
