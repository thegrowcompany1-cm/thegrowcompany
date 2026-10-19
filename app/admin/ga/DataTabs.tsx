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
import { VERDICT_LABEL, aiInsight, buildChannelCompare, channelInsight, judgeLanding, landingInsight, searchInsight } from "@/lib/gaInsights";
import { Empty, ErrBox, Insight, Skel, fetchJson, mmss, num, pct, type ApiError } from "./ga-shared";

function Badge({ row }: { row: LandingRow }) {
  const v = judgeLanding(row.avgEngagementSec, row.sessions);
  return <span className={`ga-badge ${v}`}>{VERDICT_LABEL[v]}</span>;
}

function LandingTable({ rows, empty }: { rows: LandingRow[]; empty: string }) {
  if (!rows.length) return <Empty>{empty}</Empty>;
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

// ── 랜딩 성과 ────────────────────────────────────────────────────────────────
export function LandingTab({ report }: { report: ReportPayload }) {
  return (
    <div>
      <section className="ga-card">
        <h2 className="ga-h">랜딩 성과 <span className="ga-sub">· 세션이 시작된 첫 페이지 기준 (쿼리스트링 제외)</span></h2>
        <Insight text={landingInsight(report.landings, "랜딩")} />
        <LandingTable rows={report.landings} empty="이 기간의 랜딩 데이터가 없습니다." />
        <p className="ga-sub" style={{ marginTop: 10 }}>{BADGE_GUIDE}</p>
      </section>
    </div>
  );
}

// ── 검색·SEO ─────────────────────────────────────────────────────────────────
export function SearchTab({ report }: { report: ReportPayload }) {
  const [gsc, setGsc] = useState<GscReport | null>(null);
  const [gscErr, setGscErr] = useState<ApiError | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const data = await fetchJson<GscReport>("/api/admin/gsc", ctrl.signal);
        if (data.ok) setGsc(data);
        else setGscErr(data);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setGscErr({ ok: false, code: "NETWORK", message: "네트워크 오류로 서치콘솔 데이터를 불러오지 못했습니다." });
      }
    })();
    return () => ctrl.abort();
  }, []);

  const oppKeys = useMemo(() => new Set((gsc?.opportunities ?? []).map((o) => o.key)), [gsc]);
  const MAIN_ENGINES = ["google", "naver", "daum", "bing"];

  return (
    <div>
      <section className="ga-card">
        <h2 className="ga-h">서치콘솔 <span className="ga-sub">{gsc ? `· ${gsc.startDate} ~ ${gsc.endDate} (최근 28일, 1시간 캐시)` : ""}</span></h2>
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
              <Empty>조건에 맞는 검색어가 아직 없습니다.</Empty>
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
          <Empty>이 기간의 자연검색 유입이 없습니다.</Empty>
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
          <Empty>이 기간에 AI 검색에서 들어온 세션이 없습니다.</Empty>
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
          <Empty>이 기간의 채널 데이터가 없습니다.</Empty>
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
