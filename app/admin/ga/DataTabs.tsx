"use client";

// 랜딩 성과 · 검색·SEO · AI 유입(AEO) · 채널 비교 탭
// 데이터: 기간 리포트(report, GaDashboard 가 불러온 것) + 서치콘솔(/api/admin/gsc, 검색·SEO 탭을 열 때만 호출)

import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  GSC_OPP_MIN_IMPRESSIONS,
  GSC_OPP_POS_MAX,
  GSC_OPP_POS_MIN,
  type GscReport,
  type LandingRow,
  type ReportPayload,
} from "@/lib/gaTypes";
import { isWeekend, weekdayKo } from "@/lib/gaRange";
import { VERDICT_LABEL, aiInsight, buildChannelCompare, channelInsight, judgeLanding, landingInsight, searchInsight } from "@/lib/gaInsights";
import LandingFunnel from "./LandingFunnel";
import TrendChart, { createHoverLink } from "./TrendChartSvg";
import { BarNum, Empty, ErrBox, Insight, Skel, mmss, num, pct } from "./ga-shared";
import { useGaData } from "./useGaData";

function Badge({ row }: { row: LandingRow }) {
  const v = judgeLanding(row.avgEngagementSec, row.sessions);
  return <span className={`ga-badge ${v}`}>{VERDICT_LABEL[v]}</span>;
}

function LandingTable({ rows, empty, selected, tracked, onPickRow }: { rows: LandingRow[]; empty: string; selected?: string; tracked?: ReadonlySet<string>; onPickRow?: (path: string) => void }) {
  if (!rows.length) return <Empty hint="기간을 넓히면 더 많은 데이터가 보입니다">{empty.replace(/[.]$/, "")}</Empty>;
  const maxS = Math.max(0, ...rows.map((r) => r.sessions));
  const sumS = rows.reduce((s, r) => s + r.sessions, 0);
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
            <tr
              key={r.landing}
              className={(tracked?.has(r.landing) ? "is-link" : "") + (selected === r.landing ? " is-selected" : "")}
              {...(tracked?.has(r.landing)
                ? {
                    tabIndex: 0,
                    role: "button",
                    "aria-pressed": selected === r.landing,
                    onClick: () => onPickRow?.(r.landing),
                    onKeyDown: (e: React.KeyboardEvent) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onPickRow?.(r.landing);
                      }
                    },
                  }
                : {})}
            >
              <td title={r.landing}>{r.landing}{tracked?.has(r.landing) && <span className="ga-rowhint">퍼널 보기 ›</span>}</td>
              <td className="is-key"><BarNum value={r.sessions} max={maxS} sum={sumS} /></td>
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

/** 검색 평균 순위 — 3위 이내 강조, 10위 이내 보통, 그 밖은 흐리게 (표현만 다르고 값은 그대로) */
function RankPos({ v }: { v: number }) {
  return <span className={"ga-rank " + (v <= 3 ? "top" : v <= 10 ? "mid" : "low")}>{v.toFixed(1)}위</span>;
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

function DailyTabImpl({ report, onPickDay }: { report: ReportPayload; onPickDay: (date: string) => void }) {
  const { from, to } = report;
  const trackRes = useGaData<TrackDaily>(`/api/admin/track?view=daily&from=${from}&to=${to}`, { staleMs: 60_000, netMsg: "자체 추적 일별 데이터를 불러오지 못했습니다." });
  const track = trackRes.data;
  const trackErr = trackRes.error;
  // 차트 ↔ 표 연동: 차트에서 날짜를 고정하면 표의 그 행이 강조되고, 표 행에 마우스를 올리면 차트의 그 날짜 점이 강조된다
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const link = useMemo(() => createHoverLink(), []);
  const wrapRef = useRef<HTMLDivElement>(null);
  // 호버 날짜가 바뀌면 표의 해당 행에 연동 강조 클래스를 직접 붙인다 (React 상태가 아니라 표를 다시 그리지 않는다)
  useEffect(
    () =>
      link.subscribe(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;
        wrap.querySelector("tr.is-linked")?.classList.remove("is-linked");
        const d = link.get();
        if (d) wrap.querySelector(`tr[data-date="${d}"]:not(.is-selected)`)?.classList.add("is-linked");
      }),
    [link],
  );
  useEffect(() => {
    if (!selectedDate) return;
    const wrap = wrapRef.current;
    const tr = wrap?.querySelector<HTMLElement>(`tr[data-date="${selectedDate}"]`);
    if (!wrap || !tr) return;
    const rw = wrap.getBoundingClientRect(), rt = tr.getBoundingClientRect();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    wrap.scrollTo({ top: Math.max(0, wrap.scrollTop + (rt.top - rw.top) - wrap.clientHeight / 2 + rt.height / 2), behavior: reduce ? "auto" : "smooth" });
  }, [selectedDate]);

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
      <TrendChart report={report} selectedDate={selectedDate} onSelectDate={setSelectedDate} link={link} onPickDay={onPickDay} />
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
            <div className="ga-table-wrap" ref={wrapRef}>
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
                        data-date={d.date}
                        className={"is-click" + (isWeekend(d.date) ? " is-weekend" : "") + (selectedDate === d.date ? " is-selected" : "")}
                        onPointerEnter={(e) => { if (e.pointerType !== "touch") link.set(d.date); }}
                        onPointerLeave={(e) => { if (e.pointerType !== "touch") link.set(null); }}
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
                        <td className="is-key">
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
function LandingTabImpl({ report, from, to }: { report: ReportPayload; from: string; to: string }) {
  // 랜딩 표의 행을 누르면 아래 섹션 도달 퍼널이 그 랜딩으로 바뀐다 (자체 추적 대상인 랜딩만)
  const listRes = useGaData<{ ok: true; paths: { path: string; sessions: number }[] }>(`/api/admin/track?view=funnel&from=${from}&to=${to}`, { staleMs: 60_000, keepPrevious: true });
  const tracked = useMemo(() => new Set((listRes.data?.paths ?? []).map((p) => p.path)), [listRes.data]);
  const [pick, setPick] = useState("");
  const funnelRef = useRef<HTMLDivElement>(null);
  const onPickRow = (path: string) => {
    setPick(path);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    funnelRef.current?.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
  };
  return (
    <div>
      <section className="ga-card">
        <h2 className="ga-h">랜딩 성과 <span className="ga-sub">· 세션이 시작된 첫 페이지 기준 (쿼리스트링 제외)</span></h2>
        <Insight text={landingInsight(report.landings, "랜딩")} />
        <LandingTable rows={report.landings} empty="이 기간의 랜딩 데이터가 없습니다." selected={pick} tracked={tracked} onPickRow={onPickRow} />
        <p className="ga-sub" style={{ marginTop: 10 }}>{BADGE_GUIDE}{tracked.size ? " · 퍼널 보기 표시가 있는 행을 누르면 아래 섹션 도달 퍼널이 그 랜딩으로 바뀝니다" : ""}</p>
      </section>
      <div ref={funnelRef} className="ga-funnel-anchor">
        <LandingFunnel from={from} to={to} pick={pick} onPick={setPick} />
      </div>
    </div>
  );
}

// ── 검색·SEO ─────────────────────────────────────────────────────────────────
function SearchTabImpl({ report, from, to }: { report: ReportPayload; from: string; to: string }) {
  const gscRes = useGaData<GscReport>(`/api/admin/gsc?from=${from}&to=${to}`, { staleMs: 5 * 60_000, netMsg: "네트워크 오류로 서치콘솔 데이터를 불러오지 못했습니다." });
  const gsc = gscRes.data;
  const gscErr = gscRes.error;

  const maxOpp = Math.max(0, ...(gsc?.opportunities ?? []).map((r) => r.impressions));
  const maxQ = Math.max(0, ...(gsc?.queries ?? []).map((r) => r.clicks));
  const maxP = Math.max(0, ...(gsc?.pages ?? []).map((r) => r.clicks));
  const maxOrg = Math.max(0, ...report.organic.sources.map((s) => s.sessions));
  const sumOpp = (gsc?.opportunities ?? []).reduce((a, r) => a + r.impressions, 0);
  const sumQ = (gsc?.queries ?? []).reduce((a, r) => a + r.clicks, 0);
  const sumP = (gsc?.pages ?? []).reduce((a, r) => a + r.clicks, 0);
  const sumOrg = report.organic.sources.reduce((a, s) => a + s.sessions, 0);
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
                        <td className="is-key"><BarNum value={r.impressions} max={maxOpp} sum={sumOpp} /></td>
                        <td>{num(r.clicks)}</td>
                        <td>{pct(r.ctr)}</td>
                        <td><RankPos v={r.position} /></td>
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
                      <td className="is-key"><BarNum value={r.clicks} max={maxQ} sum={sumQ} /></td>
                      <td>{num(r.impressions)}</td>
                      <td>{pct(r.ctr)}</td>
                      <td><RankPos v={r.position} /></td>
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
                    <td className="is-key"><BarNum value={r.clicks} max={maxP} sum={sumP} /></td>
                    <td>{num(r.impressions)}</td>
                    <td>{pct(r.ctr)}</td>
                    <td><RankPos v={r.position} /></td>
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
                      <td className="is-key"><BarNum value={s.sessions} max={maxOrg} sum={sumOrg} /></td>
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
function AiTabImpl({ report }: { report: ReportPayload }) {
  const { sources, landings } = report.ai;
  const maxAi = Math.max(0, ...sources.map((s) => s.sessions));
  const sumAi = sources.reduce((a, s) => a + s.sessions, 0);
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
                    <td className="is-key"><BarNum value={s.sessions} max={maxAi} sum={sumAi} /></td>
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
function ChannelTabImpl({ report }: { report: ReportPayload }) {
  const rows = useMemo(() => buildChannelCompare(report), [report]);
  const maxCmp = Math.max(0, ...rows.map((r) => r.sessions));
  const maxCh = Math.max(0, ...report.channels.map((c) => c.sessions));
  const sumCmp = rows.reduce((a, r) => a + r.sessions, 0);
  const sumCh = report.channels.reduce((a, c) => a + c.sessions, 0);
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
                  <td className="is-key"><BarNum value={r.sessions} max={maxCmp} sum={sumCmp} /></td>
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
                    <td className="is-key"><BarNum value={c.sessions} max={maxCh} sum={sumCh} /></td>
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

// 숨겨 둔 탭을 다시 열 때, 같은 데이터면 다시 그리지 않는다 (props 가 같으면 렌더 생략)
export const DailyTab = memo(DailyTabImpl);
export const LandingTab = memo(LandingTabImpl);
export const SearchTab = memo(SearchTabImpl);
export const AiTab = memo(AiTabImpl);
export const ChannelTab = memo(ChannelTabImpl);
