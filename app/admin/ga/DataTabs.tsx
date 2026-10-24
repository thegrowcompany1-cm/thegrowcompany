"use client";

// 랜딩 성과 · 검색·SEO · AI 유입(AEO) · 채널 비교 탭
// 데이터: 기간 리포트(report, GaDashboard 가 불러온 것) + 서치콘솔(/api/admin/gsc, 검색·SEO 탭을 열 때만 호출)

import { useEffect, useMemo, useState } from "react";
import {
  GSC_OPP_MIN_IMPRESSIONS,
  GSC_OPP_POS_MAX,
  GSC_OPP_POS_MIN,
  type GscReport,
  type LandingRow,
  type ReportPayload,
} from "@/lib/gaTypes";
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { isWeekend, todayKst, weekdayKo } from "@/lib/gaRange";
import { VERDICT_LABEL, aiInsight, buildChannelCompare, channelInsight, judgeLanding, landingInsight, searchInsight } from "@/lib/gaInsights";
import LandingFunnel from "./LandingFunnel";
import { Empty, ErrBox, Insight, Skel, fetchJson, mmss, num, pct, type ApiError } from "./ga-shared";

function Badge({ row }: { row: LandingRow }) {
  const v = judgeLanding(row.avgEngagementSec, row.sessions);
  return <span className={`ga-badge ${v}`}>{VERDICT_LABEL[v]}</span>;
}

function LandingTable({ rows, empty }: { rows: LandingRow[]; empty: string }) {
  if (!rows.length) return <Empty hint="기간을 넓히면 더 많은 데이터가 보입니다">{empty.replace(/[.]$/, "")}</Empty>;
  return (
    <div className="ga-table-wrap">
      <table className="ga-table">
        <thead>
          <tr>
            <th>랜딩</th><th>세션</th><th>참여 세션</th><th>참여율</th><th>평균 참여시간</th><th>키 이벤트</th><th>판정</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.landing}>
              <td title={r.landing}>{r.landing}</td>
              <td>{num(r.sessions)}</td>
              <td>{num(r.engagedSessions)}</td>
              <td>{pct(r.engagementRate)}</td>
              <td>{mmss(r.avgEngagementSec)}</td>
              <td>{num(r.keyEvents)}</td>
              <td><Badge row={r} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const BADGE_GUIDE = "판정: 평균 참여 20초 이상 좋음 · 10~20초 보통 · 10초 미만 개선 필요 · 세션 10 미만은 표본 적음 (평균 참여 = 참여시간 ÷ 세션)";

// ── 일별 ─────────────────────────────────────────────────────────────────────
type TrackDay = { date: string; visits: number; sessions: number; meta: number; organic: number; ai: number; direct: number; other: number };
type TrackDaily = { ok: true; days: TrackDay[]; capped?: boolean };

const MIX_LABEL: Record<string, string> = { m: "메타광고", o: "자연검색", a: "AI", d: "직접", x: "기타" };
const MIX_KEYS = [
  ["m", "meta"],
  ["o", "organic"],
  ["a", "ai"],
  ["d", "direct"],
  ["x", "other"],
] as const;

function csvCell(v: string | number) {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// ── 일별 추이 차트 (일별 탭 전용) ─────────────────────────────────────────────
type ChartMetric = "both" | "users" | "sessions" | "engagementRate" | "keyEvents";
const CHART_OPTIONS: { key: ChartMetric; label: string }[] = [
  { key: "both", label: "사용자 · 세션" },
  { key: "users", label: "사용자" },
  { key: "sessions", label: "세션" },
  { key: "engagementRate", label: "참여율" },
  { key: "keyEvents", label: "키 이벤트" },
];
type Raw = { users: number; sessions: number; engagementRate: number; keyEvents: number };

/**
 * 오늘은 아직 집계 중이라 값이 작다. 확정된 날은 실선(__d), 어제→오늘 구간은 점선(__p)으로 따로 그리고,
 * y축은 0 부터 시작해 오늘 값이 축 범위를 흔들지 않게 한다. 툴팁은 원본 값(raw)으로 직접 그린다.
 */
function TrendChart({ report }: { report: ReportPayload }) {
  const [metric, setMetric] = useState<ChartMetric>("both");
  const today = todayKst();
  const hasToday = report.daily.some((d) => d.date === today);

  const lines = useMemo(() => {
    if (metric === "both")
      return [
        { key: "users" as const, name: "사용자", color: "#22B573" },
        { key: "sessions" as const, name: "세션", color: "#60a5fa" },
      ];
    const o = CHART_OPTIONS.find((c) => c.key === metric)!;
    return [{ key: metric as keyof Raw, name: o.label, color: metric === "keyEvents" ? "#fbbf24" : metric === "engagementRate" ? "#c084fc" : "#22B573" }];
  }, [metric]);

  const data = useMemo(() => {
    const days = [...report.daily].sort((a, b) => (a.date < b.date ? -1 : 1));
    const todayIdx = days.findIndex((d) => d.date === today);
    return days.map((d, i) => {
      const row: Record<string, number | string | null | Raw> = { date: d.date, raw: { users: d.users, sessions: d.sessions, engagementRate: d.engagementRate, keyEvents: d.keyEvents } };
      for (const l of lines) {
        const v = d[l.key];
        row[`${l.key}__d`] = i === todayIdx ? null : v;
        row[`${l.key}__p`] = todayIdx >= 0 && (i === todayIdx || i === todayIdx - 1) ? v : null;
      }
      return row;
    });
  }, [report.daily, lines, today]);

  const fmt = (k: keyof Raw, v: number) => (k === "engagementRate" ? pct(v) : num(v));

  return (
    <section className="ga-card">
      <div className="ga-row">
        <h3 className="ga-h" style={{ margin: 0 }}>일별 추이 <span className="ga-sub">· {report.from === report.to ? report.from : `${report.from} ~ ${report.to}`}</span></h3>
        <select className="ga-select" aria-label="차트 지표" value={metric} onChange={(e) => setMetric(e.target.value as ChartMetric)}>
          {CHART_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="ga-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
            <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
            <XAxis dataKey="date" tickFormatter={(d: string) => d.slice(5)} stroke="#777" fontSize={11} minTickGap={24} />
            <YAxis
              stroke="#777"
              fontSize={11}
              domain={[0, "auto"]}
              allowDecimals={metric === "engagementRate"}
              tickFormatter={metric === "engagementRate" ? (v: number) => `${Math.round(v * 100)}%` : undefined}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const raw = (payload[0].payload as { raw: Raw }).raw;
                return (
                  <div style={{ background: "#1c1c1c", border: "1px solid rgba(255,255,255,.15)", borderRadius: 10, padding: "8px 12px", fontSize: 12 }}>
                    <p style={{ margin: 0, color: "#fff", fontWeight: 800 }}>{String(label)}{label === today ? " · 집계 중" : ""}</p>
                    {lines.map((l) => (
                      <p key={l.key} style={{ margin: "4px 0 0", color: l.color }}>{l.name} : {fmt(l.key, raw[l.key])}</p>
                    ))}
                  </div>
                );
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {hasToday && (
              <ReferenceLine x={today} stroke="rgba(255,255,255,.25)" strokeDasharray="3 3" label={{ value: "집계 중", position: "insideTopRight", fill: "#fde68a", fontSize: 11 }} />
            )}
            {lines.map((l) => (
              <Line key={`${l.key}__d`} type="monotone" dataKey={`${l.key}__d`} name={l.name} stroke={l.color} strokeWidth={2.2} dot={report.daily.length <= 2} isAnimationActive={false} />
            ))}
            {hasToday &&
              lines.map((l) => (
                <Line
                  key={`${l.key}__p`}
                  type="linear"
                  dataKey={`${l.key}__p`}
                  stroke={l.color}
                  strokeWidth={2.2}
                  strokeDasharray="5 4"
                  legendType="none"
                  isAnimationActive={false}
                  dot={(p: { cx?: number; cy?: number; payload?: { date: string }; index?: number }) =>
                    p.payload?.date === today && p.cx !== undefined && p.cy !== undefined ? (
                      <circle key={`pd-${l.key}`} cx={p.cx} cy={p.cy} r={4} fill="#141414" stroke={l.color} strokeWidth={2} />
                    ) : (
                      <g key={`pe-${l.key}-${p.index}`} />
                    )
                  }
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function DailyTab({ report, onPickDay }: { report: ReportPayload; onPickDay: (date: string) => void }) {
  const [track, setTrack] = useState<TrackDaily | null>(null);
  const [trackErr, setTrackErr] = useState<ApiError | null>(null);
  const { from, to } = report;

  useEffect(() => {
    const ctrl = new AbortController();
    setTrack(null);
    setTrackErr(null);
    (async () => {
      try {
        const data = await fetchJson<TrackDaily>(`/api/admin/track?view=daily&from=${from}&to=${to}`, ctrl.signal);
        if (data.ok) setTrack(data);
        else setTrackErr(data);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setTrackErr({ ok: false, code: "NETWORK", message: "자체 추적 일별 데이터를 불러오지 못했습니다." });
      }
    })();
    return () => ctrl.abort();
  }, [from, to]);

  const byDate = useMemo(() => new Map((track?.days ?? []).map((d) => [d.date, d])), [track]);
  const rows = useMemo(() => [...report.daily].sort((a, b) => (a.date < b.date ? 1 : -1)), [report.daily]);
  const avgSessions = report.daily.length ? report.daily.reduce((s, d) => s + d.sessions, 0) / report.daily.length : 0;

  const download = () => {
    const head = ["날짜", "요일", "사용자", "세션", "참여율", "평균 참여시간(초)", "키 이벤트", "자체추적 방문", "메타광고", "자연검색", "AI", "직접", "기타"];
    const lines = [...rows].reverse().map((d) => {
      const t = byDate.get(d.date);
      return [d.date, weekdayKo(d.date), d.users, d.sessions, (d.engagementRate * 100).toFixed(1) + "%", Math.round(d.avgEngagementSec), d.keyEvents, t?.visits ?? "", t?.meta ?? "", t?.organic ?? "", t?.ai ?? "", t?.direct ?? "", t?.other ?? ""];
    });
    const csv = "﻿" + [head, ...lines].map((r) => r.map(csvCell).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `ga-daily_${from}_${to}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <TrendChart report={report} />
      <section className="ga-card">
        <div className="ga-row">
          <h2 className="ga-h" style={{ margin: 0 }}>일별 보기 <span className="ga-sub">· 최신 날짜가 위 · 행을 누르면 그날 하루만 봅니다</span></h2>
          <button type="button" className="ga-btn" onClick={download} disabled={!rows.length}>CSV 다운로드</button>
        </div>
        {rows.length === 0 ? (
          <Empty hint="기간을 넓히면 더 많은 데이터가 보입니다">이 기간의 일별 데이터가 없습니다</Empty>
        ) : (
          <>
            <p className="ga-sub" style={{ margin: "10px 0" }}>
              세션 배지: 기간 일평균({Math.round(avgSessions).toLocaleString("ko-KR")}) 대비 30% 이상 많으면 ▲, 적으면 ▼
            </p>
            <div className="ga-legend" aria-label="유입 비중 범례">
              {MIX_KEYS.map(([k]) => (
                <span key={k} className={k}>{MIX_LABEL[k]}</span>
              ))}
            </div>
            <div className="ga-table-wrap">
              <table className="ga-table">
                <thead>
                  <tr>
                    <th>날짜</th><th>사용자</th><th>세션</th><th>참여율</th><th>평균 참여시간</th><th>키 이벤트</th><th>자체추적 방문</th><th>유입 비중</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((d) => {
                    const t = byDate.get(d.date);
                    const ratio = avgSessions > 0 ? d.sessions / avgSessions : 1;
                    const hi = report.daily.length > 1 && ratio >= 1.3;
                    const lo = report.daily.length > 1 && ratio <= 0.7;
                    const total = t ? t.meta + t.organic + t.ai + t.direct + t.other : 0;
                    return (
                      <tr
                        key={d.date}
                        className={"is-click" + (isWeekend(d.date) ? " is-weekend" : "")}
                        tabIndex={0}
                        onClick={() => onPickDay(d.date)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onPickDay(d.date);
                          }
                        }}
                      >
                        <td className="ga-dayname">{d.date}<small>({weekdayKo(d.date)})</small></td>
                        <td>{num(d.users)}</td>
                        <td>
                          {num(d.sessions)}
                          {hi && <span className="ga-delta up" style={{ display: "inline", marginLeft: 6 }}>▲ {Math.round((ratio - 1) * 100)}%</span>}
                          {lo && <span className="ga-delta down" style={{ display: "inline", marginLeft: 6 }}>▼ {Math.round((1 - ratio) * 100)}%</span>}
                        </td>
                        <td>{pct(d.engagementRate)}</td>
                        <td>{mmss(d.avgEngagementSec)}</td>
                        <td>{num(d.keyEvents)}</td>
                        <td>{t ? num(t.visits) : "-"}</td>
                        <td>
                          {t && total > 0 ? (
                            <div className="ga-mix" title={MIX_KEYS.map(([k, f]) => `${MIX_LABEL[k]} ${t[f]}`).join(" · ")}>
                              {MIX_KEYS.map(([k, f]) => (t[f] ? <i key={k} className={k} style={{ width: `${(t[f] / total) * 100}%` }} /> : null))}
                            </div>
                          ) : (
                            <span className="ga-sub">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {trackErr && <p className="ga-sub" style={{ marginTop: 10 }}>자체 추적 열은 표시하지 못했습니다 — {trackErr.message}</p>}
            {track?.capped && <p className="ga-sub" style={{ marginTop: 10 }}>자체 추적 기록이 많아 일부만 집계됐습니다.</p>}
            <p className="ga-sub" style={{ marginTop: 10 }}>날짜는 KST 기준 · 자체추적은 /admin 과 봇을 제외한 익명 방문입니다 (GA 와 숫자가 다를 수 있음).</p>
          </>
        )}
      </section>
    </div>
  );
}

// ── 랜딩 성과 ────────────────────────────────────────────────────────────────
export function LandingTab({ report, from, to }: { report: ReportPayload; from: string; to: string }) {
  return (
    <div>
      <section className="ga-card">
        <h2 className="ga-h">랜딩 성과 <span className="ga-sub">· 세션이 시작된 첫 페이지 기준 (쿼리스트링 제외)</span></h2>
        <Insight text={landingInsight(report.landings, "랜딩")} />
        <LandingTable rows={report.landings} empty="이 기간의 랜딩 데이터가 없습니다." />
        <p className="ga-sub" style={{ marginTop: 10 }}>{BADGE_GUIDE}</p>
      </section>
      <LandingFunnel from={from} to={to} />
    </div>
  );
}

// ── 검색·SEO ─────────────────────────────────────────────────────────────────
export function SearchTab({ report, from, to }: { report: ReportPayload; from: string; to: string }) {
  const [gsc, setGsc] = useState<GscReport | null>(null);
  const [gscErr, setGscErr] = useState<ApiError | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    setGsc(null);
    setGscErr(null);
    (async () => {
      try {
        const data = await fetchJson<GscReport>(`/api/admin/gsc?from=${from}&to=${to}`, ctrl.signal);
        if (data.ok) setGsc(data);
        else setGscErr(data);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setGscErr({ ok: false, code: "NETWORK", message: "네트워크 오류로 서치콘솔 데이터를 불러오지 못했습니다." });
      }
    })();
    return () => ctrl.abort();
  }, [from, to]);

  const oppKeys = useMemo(() => new Set((gsc?.opportunities ?? []).map((o) => o.key)), [gsc]);
  const MAIN_ENGINES = ["google", "naver", "daum", "bing"];

  return (
    <div>
      <section className="ga-card">
        <h2 className="ga-h">서치콘솔 <span className="ga-sub">{gsc ? `· ${gsc.startDate} ~ ${gsc.endDate} (1시간 캐시)` : ""}</span></h2>
        {gsc?.delayed && <p className="ga-notice" role="note">서치콘솔은 약 2~3일 지연됩니다 — 선택한 기간의 끝 며칠은 숫자가 비어 있거나 작게 보일 수 있습니다.</p>}
        {gscErr ? (
          <ErrBox title="서치콘솔 데이터를 불러오지 못했습니다" err={gscErr} />
        ) : !gsc ? (
          <Skel h={120} />
        ) : (
          <>
            <Insight text={searchInsight(gsc.opportunities)} />

            <h3 className="ga-kpi-l" style={{ margin: "6px 0 8px" }}>
              기회 키워드 <span className="ga-sub">노출 {GSC_OPP_MIN_IMPRESSIONS} 이상 · 순위 {GSC_OPP_POS_MIN}~{GSC_OPP_POS_MAX}위 — SEO 우선 작업 대상</span>
            </h3>
            {gsc.opportunities.length === 0 ? (
              <Empty hint="기간을 넓히면 더 많은 데이터가 보입니다">조건에 맞는 검색어가 아직 없습니다</Empty>
            ) : (
              <div className="ga-table-wrap" style={{ marginBottom: 18 }}>
                <table className="ga-table">
                  <thead><tr><th>검색어</th><th>노출</th><th>클릭</th><th>CTR</th><th>평균 순위</th></tr></thead>
                  <tbody>
                    {gsc.opportunities.map((r) => (
                      <tr key={r.key} className="is-opp">
                        <td title={r.key}>{r.key}</td>
                        <td>{num(r.impressions)}</td>
                        <td>{num(r.clicks)}</td>
                        <td>{pct(r.ctr)}</td>
                        <td>{r.position.toFixed(1)}위</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <h3 className="ga-kpi-l" style={{ margin: "6px 0 8px" }}>검색어 Top 50</h3>
            <div className="ga-table-wrap">
              <table className="ga-table">
                <thead><tr><th>검색어</th><th>클릭</th><th>노출</th><th>CTR</th><th>평균 순위</th></tr></thead>
                <tbody>
                  {gsc.queries.map((r) => (
                    <tr key={r.key} className={oppKeys.has(r.key) ? "is-opp" : undefined}>
                      <td title={r.key}>{r.key}</td>
                      <td>{num(r.clicks)}</td>
                      <td>{num(r.impressions)}</td>
                      <td>{pct(r.ctr)}</td>
                      <td>{r.position.toFixed(1)}위</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {gsc && (
        <section className="ga-card">
          <h2 className="ga-h">페이지별 Top 30</h2>
          <div className="ga-table-wrap">
            <table className="ga-table">
              <thead><tr><th>페이지</th><th>클릭</th><th>노출</th><th>CTR</th><th>평균 순위</th></tr></thead>
              <tbody>
                {gsc.pages.map((r) => (
                  <tr key={r.key}>
                    <td title={r.key}>{r.key.replace(/^https?:\/\/[^/]+/, "") || "/"}</td>
                    <td>{num(r.clicks)}</td>
                    <td>{num(r.impressions)}</td>
                    <td>{pct(r.ctr)}</td>
                    <td>{r.position.toFixed(1)}위</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="ga-card">
        <h2 className="ga-h">GA4 자연검색 유입 <span className="ga-sub">· 채널 = Organic Search</span></h2>
        <h3 className="ga-kpi-l" style={{ margin: "0 0 8px" }}>검색엔진별</h3>
        {report.organic.sources.length === 0 ? (
          <Empty hint="기간을 넓히면 더 많은 데이터가 보입니다">이 기간의 자연검색 유입이 없습니다</Empty>
        ) : (
          <div className="ga-table-wrap" style={{ marginBottom: 18 }}>
            <table className="ga-table">
              <thead><tr><th>소스</th><th>세션</th><th>참여율</th></tr></thead>
              <tbody>
                {[...report.organic.sources]
                  .sort((a, b) => Number(MAIN_ENGINES.includes(b.source)) - Number(MAIN_ENGINES.includes(a.source)) || b.sessions - a.sessions)
                  .map((s) => (
                    <tr key={s.source}>
                      <td>{s.source}</td>
                      <td>{num(s.sessions)}</td>
                      <td>{pct(s.engagementRate)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
        <h3 className="ga-kpi-l" style={{ margin: "0 0 8px" }}>자연검색 유입 랜딩 Top 20</h3>
        <Insight text={landingInsight(report.organic.landings, "자연검색 랜딩")} />
        <LandingTable rows={report.organic.landings} empty="이 기간의 자연검색 랜딩 데이터가 없습니다." />
        <p className="ga-sub" style={{ marginTop: 10 }}>{BADGE_GUIDE}</p>
      </section>
    </div>
  );
}

// ── AI 유입(AEO) ─────────────────────────────────────────────────────────────
export function AiTab({ report }: { report: ReportPayload }) {
  const { sources, landings } = report.ai;
  return (
    <div>
      <section className="ga-card">
        <h2 className="ga-h">AI 검색 유입 (AEO) <span className="ga-sub">· chatgpt · perplexity · gemini · copilot · claude · wrtn</span></h2>
        <Insight text={aiInsight(sources)} />
        {sources.length === 0 ? (
          <Empty hint="기간을 넓히면 더 많은 데이터가 보입니다">이 기간에 AI 검색에서 들어온 세션이 없습니다</Empty>
        ) : (
          <div className="ga-table-wrap">
            <table className="ga-table">
              <thead><tr><th>소스</th><th>세션</th><th>사용자</th><th>참여율</th><th>평균 세션 시간</th><th>키 이벤트</th></tr></thead>
              <tbody>
                {sources.map((s) => (
                  <tr key={s.source}>
                    <td>{s.source}</td>
                    <td>{num(s.sessions)}</td>
                    <td>{num(s.users)}</td>
                    <td>{pct(s.engagementRate)}</td>
                    <td>{mmss(s.avgSessionDuration)}</td>
                    <td>{num(s.keyEvents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className="ga-card">
        <h2 className="ga-h">AI 유입 랜딩페이지</h2>
        <Insight text={landingInsight(landings, "AI 유입 랜딩")} />
        <LandingTable rows={landings} empty="이 기간의 AI 유입 랜딩 데이터가 없습니다." />
        <p className="ga-sub" style={{ marginTop: 10 }}>{BADGE_GUIDE}</p>
      </section>
    </div>
  );
}

// ── 채널 비교 ────────────────────────────────────────────────────────────────
export function ChannelTab({ report }: { report: ReportPayload }) {
  const rows = useMemo(() => buildChannelCompare(report), [report]);
  return (
    <div>
      <section className="ga-card">
        <h2 className="ga-h">유입 채널 비교 <span className="ga-sub">· 메타 광고 · 자연검색 · 직접 · 추천 · AI</span></h2>
        <Insight text={channelInsight(rows)} />
        <div className="ga-table-wrap">
          <table className="ga-table">
            <thead><tr><th>채널</th><th>세션</th><th>사용자</th><th>참여율</th><th>평균 세션 시간</th><th>키 이벤트</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key}>
                  <td>{r.label}</td>
                  <td>{num(r.sessions)}</td>
                  <td>{num(r.users)}</td>
                  <td>{r.sessions ? pct(r.engagementRate) : "-"}</td>
                  <td>{r.sessions ? mmss(r.avgSessionDuration) : "-"}</td>
                  <td>{num(r.keyEvents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="ga-sub" style={{ marginTop: 10 }}>AI 행은 소스(chatgpt · perplexity 등) 합계이고, 참여율·세션 시간은 세션 수로 가중 평균했습니다. AI 소스는 GA 기본 채널(Referral 등)에도 함께 잡힐 수 있어 행끼리 더하면 중복됩니다.</p>
      </section>

      <section className="ga-card">
        <h2 className="ga-h">전체 채널</h2>
        {report.channels.length === 0 ? (
          <Empty hint="기간을 넓히면 더 많은 데이터가 보입니다">이 기간의 채널 데이터가 없습니다</Empty>
        ) : (
          <div className="ga-table-wrap">
            <table className="ga-table">
              <thead><tr><th>채널</th><th>세션</th><th>사용자</th><th>참여율</th><th>평균 체류</th><th>키 이벤트</th></tr></thead>
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
    </div>
  );
}
