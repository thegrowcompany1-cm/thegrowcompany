"use client";

// ─────────────────────────────────────────────────────────────────────────────
// GA 분석 화면 (클라이언트)
//
//  · 실시간: /api/admin/ga/realtime 을 60초마다 다시 부른다. 탭을 떠나면(언마운트·숨김) 정리한다.
//  · 기간 리포트: /api/admin/ga/report?range=7|28|90. 기간을 바꾸면 이전 요청은 취소한다.
//  · 차트는 recharts. CSS 클래스 접두사 ga-.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Realtime = {
  ok: true;
  total: number;
  pages: { name: string; users: number }[];
  devices: { name: string; users: number }[];
  fetchedAt: string;
};
type Report = {
  ok: true;
  range: 7 | 28 | 90;
  totals: { users: number; sessions: number; engagementRate: number; avgSessionDuration: number };
  daily: { date: string; users: number; sessions: number }[];
  channels: { channel: string; sessions: number; users: number; engagementRate: number; avgSessionDuration: number; keyEvents: number }[];
  pages: { path: string; views: number; users: number; avgEngagementSec: number; scrollRate: number | null }[];
  cachedAt: string;
};
type ApiError = { ok: false; code: string; message: string };

const REFRESH_MS = 60_000;
const RANGES = [7, 28, 90] as const;
const DEVICE_LABEL: Record<string, string> = { mobile: "모바일", desktop: "데스크톱", tablet: "태블릿", "smart tv": "스마트 TV" };

const num = (v: number) => v.toLocaleString("ko-KR");
const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
/** 초 → 분:초 */
const mmss = (sec: number) => {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T | ApiError> {
  const res = await fetch(url, { cache: "no-store", signal });
  const data = (await res.json().catch(() => null)) as T | ApiError | null;
  if (data) return data;
  return { ok: false, code: "BAD_RESPONSE", message: `응답을 읽을 수 없습니다 (HTTP ${res.status})` };
}

const GA_STYLE = `
.ga{color:#fff;font-family:inherit}
.ga *{box-sizing:border-box}
.ga-card{background:#141414;border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:20px}
.ga-h{margin:0 0 14px;font-size:16px;font-weight:900}
.ga-sub{font-size:12px;color:#8b8b8b}
.ga-live{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.4fr) minmax(0,1fr);gap:20px;align-items:start}
.ga-live>div{min-width:0}
.ga-live-num{display:flex;align-items:center;gap:12px;font-size:56px;font-weight:900;line-height:1;color:#22B573}
.ga-live-num small{font-size:14px;font-weight:700;color:#9a9a9a}
.ga-dot{width:12px;height:12px;border-radius:50%;background:#22B573;box-shadow:0 0 0 0 rgba(34,181,115,.6);animation:ga-pulse 1.6s ease-out infinite;flex:0 0 auto}
@keyframes ga-pulse{0%{box-shadow:0 0 0 0 rgba(34,181,115,.55)}70%{box-shadow:0 0 0 12px rgba(34,181,115,0)}100%{box-shadow:0 0 0 0 rgba(34,181,115,0)}}
@media(prefers-reduced-motion:reduce){.ga-dot{animation:none}}
.ga-list{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:minmax(0,1fr);gap:8px}
.ga-list li{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:13px;line-height:1.4}
.ga-list li span:first-child{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#d6d6d6}
.ga-list li b{flex:0 0 auto;font-weight:800;color:#22B573}
.ga-bar{height:8px;border-radius:8px;background:rgba(255,255,255,.08);overflow:hidden;margin-top:4px}
.ga-bar i{display:block;height:100%;background:#22B573;border-radius:8px}
.ga-dev{display:grid;grid-template-columns:minmax(0,1fr);gap:12px}
.ga-dev-row{font-size:13px}
.ga-dev-row div:first-child{display:flex;justify-content:space-between;color:#d6d6d6}
.ga-toolbar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin:28px 0 14px}
.ga-seg{display:inline-flex;border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:3px;gap:2px}
.ga-seg button{appearance:none;border:0;background:none;color:#a8a8a8;font:inherit;font-size:13px;font-weight:800;padding:8px 16px;border-radius:999px;cursor:pointer;min-height:36px}
.ga-seg button[aria-pressed="true"]{background:#22B573;color:#fff}
.ga-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.ga-kpi-l{font-size:12px;font-weight:700;color:#9a9a9a}
.ga-kpi-v{margin-top:8px;font-size:30px;font-weight:900;color:#22B573}
.ga-chart{height:300px}
.ga-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
.ga-table{width:100%;border-collapse:collapse;font-size:13px;min-width:560px}
.ga-table th,.ga-table td{padding:10px 12px;text-align:right;border-top:1px solid rgba(255,255,255,.08);white-space:nowrap}
.ga-table th:first-child,.ga-table td:first-child{text-align:left}
.ga-table thead th{border-top:0;color:#9a9a9a;font-weight:700;font-size:12px}
.ga-table td:first-child{max-width:320px;overflow:hidden;text-overflow:ellipsis}
.ga-sort{appearance:none;border:0;background:none;color:inherit;font:inherit;cursor:pointer;padding:0;display:inline-flex;align-items:center;gap:4px}
.ga-sort[aria-sort],.ga-sort.is-on{color:#fff}
.ga-note{margin:24px 0 8px;font-size:12px;line-height:1.7;color:#8b8b8b}
.ga-err{border:1px solid rgba(239,68,68,.4);background:rgba(239,68,68,.1);color:#fecaca;border-radius:12px;padding:14px 16px;font-size:13px;line-height:1.6}
.ga-err b{display:block;margin-bottom:2px;color:#fff}
.ga-skel{height:18px;border-radius:8px;background:linear-gradient(90deg,rgba(255,255,255,.06),rgba(255,255,255,.14),rgba(255,255,255,.06));background-size:200% 100%;animation:ga-sk 1.2s linear infinite}
@keyframes ga-sk{to{background-position:-200% 0}}
@media(prefers-reduced-motion:reduce){.ga-skel{animation:none}}
.ga-empty{padding:28px 0;text-align:center;font-size:13px;color:#8b8b8b}
@media(max-width:860px){.ga-live{grid-template-columns:minmax(0,1fr)}.ga-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:560px){.ga-live-num{font-size:46px}.ga-kpi-v{font-size:24px}.ga-chart{height:240px}.ga-card{padding:16px}}
`;

type SortKey = "path" | "views" | "users" | "avgEngagementSec" | "scrollRate";

export default function GaDashboard() {
  const [range, setRange] = useState<(typeof RANGES)[number]>(28);

  const [rt, setRt] = useState<Realtime | null>(null);
  const [rtErr, setRtErr] = useState<ApiError | null>(null);
  const [rtAt, setRtAt] = useState<Date | null>(null);

  const [report, setReport] = useState<Report | null>(null);
  const [repErr, setRepErr] = useState<ApiError | null>(null);
  const [repLoading, setRepLoading] = useState(true);

  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "views", dir: "desc" });

  // 실시간 — 60초 간격. 숨겨진 탭에서는 건너뛰고, 언마운트 때 interval 을 정리한다.
  const loadRealtime = useCallback(async (signal?: AbortSignal) => {
    try {
      const data = await fetchJson<Realtime>("/api/admin/ga/realtime", signal);
      if (data.ok) {
        setRt(data);
        setRtErr(null);
        setRtAt(new Date());
      } else {
        setRtErr(data);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") setRtErr({ ok: false, code: "NETWORK", message: "네트워크 오류로 실시간 데이터를 불러오지 못했습니다." });
    }
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    loadRealtime(ctrl.signal);
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") loadRealtime(ctrl.signal);
    }, REFRESH_MS);
    return () => {
      window.clearInterval(id);
      ctrl.abort();
    };
  }, [loadRealtime]);

  // 기간 리포트 — 기간이 바뀌면 이전 요청을 취소한다
  useEffect(() => {
    const ctrl = new AbortController();
    setRepLoading(true);
    (async () => {
      try {
        const data = await fetchJson<Report>(`/api/admin/ga/report?range=${range}`, ctrl.signal);
        if (data.ok) {
          setReport(data);
          setRepErr(null);
        } else {
          setRepErr(data);
        }
      } catch (e) {
        if ((e as Error).name !== "AbortError") setRepErr({ ok: false, code: "NETWORK", message: "네트워크 오류로 리포트를 불러오지 못했습니다." });
      } finally {
        if (!ctrl.signal.aborted) setRepLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [range]);

  const sortedPages = useMemo(() => {
    const rows = [...(report?.pages ?? [])];
    const { key, dir } = sort;
    const val = (r: Report["pages"][number]) => (key === "path" ? r.path : key === "scrollRate" ? (r.scrollRate ?? -1) : r[key]);
    rows.sort((a, b) => {
      const x = val(a);
      const y = val(b);
      const c = typeof x === "string" ? x.localeCompare(y as string) : (x as number) - (y as number);
      return dir === "asc" ? c : -c;
    });
    return rows;
  }, [report, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "path" ? "asc" : "desc" }));

  const SortTh = ({ k, children }: { k: SortKey; children: React.ReactNode }) => (
    <th aria-sort={sort.key === k ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
      <button type="button" className={"ga-sort" + (sort.key === k ? " is-on" : "")} onClick={() => toggleSort(k)}>
        {children}
        <span aria-hidden="true">{sort.key === k ? (sort.dir === "asc" ? "▲" : "▼") : ""}</span>
      </button>
    </th>
  );

  const deviceTotal = rt?.devices.reduce((s, d) => s + d.users, 0) ?? 0;
  const pageMax = Math.max(1, ...(rt?.pages.map((p) => p.users) ?? [1]));

  return (
    <div className="ga">
      <style dangerouslySetInnerHTML={{ __html: GA_STYLE }} />

      {/* ── 실시간 ─────────────────────────────────────────────── */}
      <section className="ga-card" aria-label="실시간 접속 현황">
        <h2 className="ga-h">실시간 (최근 30분)</h2>
        {rtErr && !rt ? (
          <div className="ga-err" role="alert">
            <b>실시간 데이터를 불러오지 못했습니다</b>
            {rtErr.message}
          </div>
        ) : !rt ? (
          <div className="ga-live" aria-busy="true">
            <div className="ga-skel" style={{ height: 56 }} />
            <div className="ga-skel" style={{ height: 120 }} />
            <div className="ga-skel" style={{ height: 120 }} />
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
                <p className="ga-empty">지금 접속 중인 사용자가 없습니다.</p>
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
                <p className="ga-empty">데이터가 없습니다.</p>
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

      {/* ── 기간 토글 ───────────────────────────────────────────── */}
      <div className="ga-toolbar">
        <h2 className="ga-h" style={{ margin: 0 }}>기간 리포트</h2>
        <div className="ga-seg" role="group" aria-label="기간 선택">
          {RANGES.map((r) => (
            <button key={r} type="button" aria-pressed={range === r} onClick={() => setRange(r)}>
              {r}일
            </button>
          ))}
        </div>
      </div>

      {repErr && (
        <div className="ga-err" role="alert" style={{ marginBottom: 14 }}>
          <b>{repErr.code === "PERMISSION_DENIED" ? "접근 권한 오류" : "리포트를 불러오지 못했습니다"}</b>
          {repErr.message}
        </div>
      )}

      {repLoading && !report ? (
        <div className="ga-card" aria-busy="true">
          <div className="ga-skel" style={{ height: 80, marginBottom: 14 }} />
          <div className="ga-skel" style={{ height: 240 }} />
        </div>
      ) : report ? (
        <div style={{ opacity: repLoading ? 0.55 : 1, transition: "opacity .2s" }} aria-busy={repLoading}>
          {/* KPI */}
          <section className="ga-kpis" aria-label="핵심 지표">
            {[
              { l: "사용자", v: num(report.totals.users) },
              { l: "세션", v: num(report.totals.sessions) },
              { l: "참여율", v: pct(report.totals.engagementRate) },
              { l: "평균 세션 시간", v: mmss(report.totals.avgSessionDuration) },
            ].map((k) => (
              <div className="ga-card" key={k.l}>
                <p className="ga-kpi-l">{k.l}</p>
                <p className="ga-kpi-v">{k.v}</p>
              </div>
            ))}
          </section>

          {/* 일별 추이 */}
          <section className="ga-card" style={{ marginTop: 14 }}>
            <h3 className="ga-h">일별 사용자 · 세션</h3>
            <div className="ga-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={report.daily} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                  <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(d: string) => d.slice(5)} stroke="#777" fontSize={11} minTickGap={24} />
                  <YAxis stroke="#777" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#1c1c1c", border: "1px solid rgba(255,255,255,.15)", borderRadius: 10, fontSize: 12 }} labelStyle={{ color: "#fff" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="users" name="사용자" stroke="#22B573" strokeWidth={2.2} dot={false} />
                  <Line type="monotone" dataKey="sessions" name="세션" stroke="#60a5fa" strokeWidth={2.2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* 채널 */}
          <section className="ga-card" style={{ marginTop: 14 }}>
            <h3 className="ga-h">채널별 성과</h3>
            {report.channels.length === 0 ? (
              <p className="ga-empty">이 기간의 채널 데이터가 없습니다.</p>
            ) : (
              <div className="ga-table-wrap">
                <table className="ga-table">
                  <thead>
                    <tr><th>채널</th><th>세션</th><th>사용자</th><th>참여율</th><th>평균 체류</th><th>키 이벤트</th></tr>
                  </thead>
                  <tbody>
                    {report.channels.map((c) => (
                      <tr key={c.channel}>
                        <td>{c.channel}</td>
                        <td>{num(c.sessions)}</td>
                        <td>{num(c.users)}</td>
                        <td>{pct(c.engagementRate)}</td>
                        <td>{mmss(c.avgSessionDuration)}</td>
                        <td>{num(c.keyEvents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* 페이지 */}
          <section className="ga-card" style={{ marginTop: 14 }}>
            <h3 className="ga-h">페이지별 (조회수 상위 20)</h3>
            {sortedPages.length === 0 ? (
              <p className="ga-empty">이 기간의 페이지 데이터가 없습니다.</p>
            ) : (
              <div className="ga-table-wrap">
                <table className="ga-table">
                  <thead>
                    <tr>
                      <SortTh k="path">경로</SortTh>
                      <SortTh k="views">조회수</SortTh>
                      <SortTh k="users">사용자</SortTh>
                      <SortTh k="avgEngagementSec">평균 체류시간</SortTh>
                      <SortTh k="scrollRate">스크롤 도달률</SortTh>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPages.map((p) => (
                      <tr key={p.path}>
                        <td title={p.path}>{p.path}</td>
                        <td>{num(p.views)}</td>
                        <td>{num(p.users)}</td>
                        <td>{mmss(p.avgEngagementSec)}</td>
                        <td>{p.scrollRate === null ? "-" : pct(p.scrollRate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="ga-sub" style={{ marginTop: 10 }}>
              스크롤 도달률은 90% 스크롤 이벤트 수 ÷ 조회수입니다. 스크롤 추적이 시작되기 전 기간의 값은 낮거나 비어 있을 수 있습니다.
            </p>
          </section>
        </div>
      ) : null}

      <p className="ga-note">
        기간 리포트는 GA 집계 특성상 최대 24~48시간 지연될 수 있음
        {report ? ` · 서버 캐시 10분 (조회 ${new Date(report.cachedAt).toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul", hour12: false })})` : ""}
      </p>
    </div>
  );
}
