"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 랜딩 성과 탭 — 랜딩별 섹션 도달 퍼널 / 이탈 지점 Top
//  · 자체 방문 추적(/api/admin/track) 데이터를 기간(from~to) 기준으로 집계한다 (실시간 탭에서 옮김).
//  · 이탈 지점은 60초마다 갱신한다. 탭을 떠나면(언마운트) interval·요청을 정리한다.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import { funnelDrop } from "@/lib/gaInsights";
import { SECTION_TRACK_FIX_DATE, TRACK_SECTION_LABEL } from "@/lib/trackSections";
import { Empty, ErrBox, Insight, Skel, fetchJson, num, pct, type ApiError } from "./ga-shared";

type FunnelRes = {
  ok: true;
  days: number;
  paths: { path: string; sessions: number }[];
  path?: string;
  totalSessions?: number;
  rows?: { section: string; sessions: number; direct: number; rate: number }[];
};
type ExitsRes = { ok: true; sessions: number; exited: number; top: { path: string; section: string; count: number }[] };

const FUNNEL_MIN = 30;
const secLabel = (s: string | null) => (s ? (TRACK_SECTION_LABEL[s] ? `${TRACK_SECTION_LABEL[s]}(${s})` : s) : "-");

export default function LandingFunnel({ from, to }: { from: string; to: string }) {
  const periodLabel = from === to ? from : `${from} ~ ${to}`;

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

  const drop = useMemo(() => (funnel?.rows ? funnelDrop(funnel.rows) : null), [funnel]);
  const notReady = [funnelErr, exitsErr].find((e) => e?.code === "TRACK_NOT_READY") ?? null;

  const funnelInsight = drop
    ? `${secLabel(drop.from)} → ${secLabel(drop.to)} 구간에서 ${(drop.drop * 100).toFixed(0)}%p 이탈 — 가장 많이 떨어지는 지점입니다`
    : funnel?.rows && funnel.rows.length
      ? "섹션 사이에 뚜렷한 이탈 구간이 없습니다"
      : null;

  return (
    <div>
      {notReady && (
        <div style={{ marginTop: 14 }}>
          <ErrBox title="자체 방문 추적 준비 중" err={notReady} />
        </div>
      )}
      {!notReady && (
        <>
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
            {from < SECTION_TRACK_FIX_DATE && (
              <p className="ga-notice" role="note">
                {SECTION_TRACK_FIX_DATE.replace(/-/g, ".")} 이전 데이터는 화면 높이의 2배가 넘는 긴 섹션이 과소 기록됐습니다 — 이 날짜 이전을 포함한 기간의 긴 섹션(신청 폼 등) 수치는 실제보다 낮게 보일 수 있습니다.
              </p>
            )}
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
                        <span className="ga-fbar-v" title={`직접 기록 ${num(r.direct)}명 (이 섹션을 직접 본 것으로 기록된 세션)`}>도달 {num(r.sessions)}명 · {Math.round(r.rate * 100)}%</span>
                        <span className="ga-fbar-d" title="직전 섹션 대비">
                          {dr === null ? "–" : dr > 0 ? `−${(dr * 100).toFixed(0)}%p` : dr < 0 ? `+${(-dr * 100).toFixed(0)}%p` : "0%p"}
                        </span>
                      </span>
                    </div>
                  );
                })}
                <p className="ga-sub">기준: 이 랜딩에 들어온 {num(funnel.totalSessions ?? 0)}세션 중 그 섹션 또는 그보다 뒤 섹션을 본 세션 (섹션은 절반 또는 화면 절반 이상 보였을 때 기록) · 빨강 = 직전 대비 가장 크게 떨어진 구간 · 주황 = 20%p 이상 하락</p>
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
