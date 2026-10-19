// GA4 기간 리포트 생성 (서버 전용) — /api/admin/ga/report 와 주간 AI 리포트(lib/weeklyReport.ts)가 같이 쓴다.
//  · 인증·캐시·HTTP 응답은 호출하는 쪽이 맡는다. 여기는 GA Data API 호출과 가공만 한다.
//  · batchRunReports 는 한 번에 최대 5개라 두 번(5개 + 4개)으로 나눠 동시에 호출한다.
//  · compare=true 면 같은 길이의 직전 기간 합계를 별도 runReport 로 받아 prev 에 넣는다.

import { protos } from "@google-analytics/data";
import { getGa } from "@/lib/ga";
import { listDays, previousRange, todayKst } from "@/lib/gaRange";
import { AI_SOURCE_REGEX, type DailyRow, type LandingRow, type ReportPayload, type Totals } from "@/lib/gaTypes";

type Row = { dimensionValues?: { value?: string | null }[] | null; metricValues?: { value?: string | null }[] | null };

const n = (v: string | null | undefined) => Number(v ?? 0) || 0;
const dim = (r: Row, i = 0) => r.dimensionValues?.[i]?.value ?? "";
const met = (r: Row, i: number) => n(r.metricValues?.[i]?.value);
const isoDate = (d: string) => (d.length === 8 ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}` : d);

const { MetricAggregation } = protos.google.analytics.data.v1beta;
const { Filter } = protos.google.analytics.data.v1beta;

const eqFilter = (fieldName: string, value: string) => ({
  filter: { fieldName, stringFilter: { matchType: Filter.StringFilter.MatchType.EXACT, value } },
});
const regexFilter = (fieldName: string, value: string) => ({
  filter: { fieldName, stringFilter: { matchType: Filter.StringFilter.MatchType.PARTIAL_REGEXP, value } },
});

const LANDING_METRICS = [
  { name: "sessions" },
  { name: "engagedSessions" },
  { name: "engagementRate" },
  { name: "userEngagementDuration" },
  { name: "keyEvents" },
];

const toLanding = (r: Row): LandingRow => {
  const sessions = met(r, 0);
  return {
    landing: dim(r) || "(not set)",
    sessions,
    engagedSessions: met(r, 1),
    engagementRate: met(r, 2),
    avgEngagementSec: sessions > 0 ? met(r, 3) / sessions : 0,
    keyEvents: met(r, 4),
  };
};

export async function buildGaReport(from: string, to: string, compare: boolean): Promise<ReportPayload> {
  const includesToday = to >= todayKst();
    const { client, property } = getGa();
  const dateRanges = [{ startDate: from, endDate: to }];
  const bySessions = [{ metric: { metricName: "sessions" }, desc: true }];
  const prevRange = compare ? previousRange(from, to) : null;

  const [[res1], [res2], prevRes] = await Promise.all([
    client.batchRunReports({
      property,
      requests: [
        // a) 날짜별 추이 + 기간 전체 합계
        {
          dateRanges,
          dimensions: [{ name: "date" }],
          metrics: [
            { name: "activeUsers" },
            { name: "sessions" },
            { name: "engagementRate" },
            { name: "averageSessionDuration" },
            { name: "keyEvents" },
            { name: "userEngagementDuration" },
          ],
          orderBys: [{ dimension: { dimensionName: "date" } }],
          metricAggregations: [MetricAggregation.TOTAL],
          limit: 400,
        },
        // b) 채널별
        {
          dateRanges,
          dimensions: [{ name: "sessionDefaultChannelGroup" }],
          metrics: [
            { name: "sessions" },
            { name: "activeUsers" },
            { name: "engagementRate" },
            { name: "averageSessionDuration" },
            { name: "keyEvents" },
          ],
          orderBys: bySessions,
          limit: 20,
        },
        // c) 페이지별 조회수 상위 20
        {
          dateRanges,
          dimensions: [{ name: "pagePath" }],
          metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }, { name: "userEngagementDuration" }],
          orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
          limit: 20,
        },
        // d) 페이지별 스크롤(90%) 이벤트 수
        {
          dateRanges,
          dimensions: [{ name: "pagePath" }],
          metrics: [{ name: "eventCount" }],
          dimensionFilter: eqFilter("eventName", "scroll"),
          limit: 1000,
        },
        // e) 랜딩 성과 (landingPage = 쿼리스트링 제외)
        {
          dateRanges,
          dimensions: [{ name: "landingPage" }],
          metrics: LANDING_METRICS,
          orderBys: bySessions,
          limit: 40,
        },
      ],
    }),
    client.batchRunReports({
      property,
      requests: [
        // f) 자연검색 — 소스별
        {
          dateRanges,
          dimensions: [{ name: "sessionSource" }],
          metrics: [{ name: "sessions" }, { name: "engagementRate" }],
          dimensionFilter: eqFilter("sessionDefaultChannelGroup", "Organic Search"),
          orderBys: bySessions,
          limit: 20,
        },
        // g) 자연검색 유입 랜딩 Top 20
        {
          dateRanges,
          dimensions: [{ name: "landingPage" }],
          metrics: LANDING_METRICS,
          dimensionFilter: eqFilter("sessionDefaultChannelGroup", "Organic Search"),
          orderBys: bySessions,
          limit: 20,
        },
        // h) AI 검색 — 소스별
        {
          dateRanges,
          dimensions: [{ name: "sessionSource" }],
          metrics: [
            { name: "sessions" },
            { name: "engagementRate" },
            { name: "activeUsers" },
            { name: "averageSessionDuration" },
            { name: "keyEvents" },
          ],
          dimensionFilter: regexFilter("sessionSource", AI_SOURCE_REGEX),
          orderBys: bySessions,
          limit: 20,
        },
        // i) AI 유입 랜딩
        {
          dateRanges,
          dimensions: [{ name: "landingPage" }],
          metrics: LANDING_METRICS,
          dimensionFilter: regexFilter("sessionSource", AI_SOURCE_REGEX),
          orderBys: bySessions,
          limit: 20,
        },
      ],
    }),
    // 직전 기간 비교 — dateRanges 를 2개 주면 행마다 dateRange 차원(date_range_0 / date_range_1)이 붙는다
    prevRange
      ? client.runReport({
          property,
          dateRanges: [dateRanges[0], { startDate: prevRange.from, endDate: prevRange.to }],
          metrics: [
            { name: "activeUsers" },
            { name: "sessions" },
            { name: "engagementRate" },
            { name: "averageSessionDuration" },
            { name: "keyEvents" },
          ],
        })
      : Promise.resolve(null),
  ]);

  const [a, b, c, d, e] = res1.reports ?? [];
  const [f, g, h, i] = res2.reports ?? [];

  // 합계·직전 기간 행의 열 순서: users, sessions, engagementRate, averageSessionDuration, keyEvents
  const totalsOf = (r: Row | null | undefined): Totals => ({
    users: r ? met(r, 0) : 0,
    sessions: r ? met(r, 1) : 0,
    engagementRate: r ? met(r, 2) : 0,
    avgSessionDuration: r ? met(r, 3) : 0,
    keyEvents: r ? met(r, 4) : 0,
  });

  // a) 날짜별 — 데이터가 없는 날도 0 으로 채워 표·차트가 빠짐없이 그려지게 한다
  const byDate = new Map<string, DailyRow>();
  for (const r of (a?.rows ?? []) as Row[]) {
    const sessions = met(r, 1);
    const date = isoDate(dim(r));
    byDate.set(date, {
      date,
      users: met(r, 0),
      sessions,
      engagementRate: met(r, 2),
      avgEngagementSec: sessions > 0 ? met(r, 5) / sessions : 0,
      keyEvents: met(r, 4),
    });
  }
  const daily = listDays(from, to).map(
    (date) => byDate.get(date) ?? { date, users: 0, sessions: 0, engagementRate: 0, avgEngagementSec: 0, keyEvents: 0 },
  );
  const totals = totalsOf((a?.totals?.[0] ?? null) as Row | null);

  let prev: ReportPayload["prev"];
  if (prevRange && prevRes) {
    const rows = ((prevRes[0].rows ?? []) as Row[]).filter((r) => /_1$/.test(dim(r)));
    prev = { from: prevRange.from, to: prevRange.to, totals: totalsOf(rows[0]) };
  }

  const channels = ((b?.rows ?? []) as Row[]).map((r) => ({
    channel: dim(r) || "(기타)",
    sessions: met(r, 0),
    users: met(r, 1),
    engagementRate: met(r, 2),
    avgSessionDuration: met(r, 3),
    keyEvents: met(r, 4),
  }));

  const scrollByPath = new Map<string, number>();
  for (const r of (d?.rows ?? []) as Row[]) scrollByPath.set(dim(r), met(r, 0));
  const pages = ((c?.rows ?? []) as Row[]).map((r) => {
    const path = dim(r);
    const views = met(r, 0);
    const users = met(r, 1);
    const scrolls = scrollByPath.get(path);
    return {
      path,
      views,
      users,
      avgEngagementSec: users > 0 ? met(r, 2) / users : 0,
      scrollRate: scrolls === undefined || views <= 0 ? null : Math.min(1, scrolls / views),
    };
  });

  const data: ReportPayload = {
    ok: true,
    from,
    to,
    includesToday,
    totals,
    ...(prev ? { prev } : {}),
    daily,
    channels,
    pages,
    landings: ((e?.rows ?? []) as Row[]).map(toLanding),
    organic: {
      sources: ((f?.rows ?? []) as Row[]).map((r) => ({ source: dim(r) || "(not set)", sessions: met(r, 0), engagementRate: met(r, 1) })),
      landings: ((g?.rows ?? []) as Row[]).map(toLanding),
    },
    ai: {
      sources: ((h?.rows ?? []) as Row[]).map((r) => ({
        source: dim(r) || "(not set)",
        sessions: met(r, 0),
        engagementRate: met(r, 1),
        users: met(r, 2),
        avgSessionDuration: met(r, 3),
        keyEvents: met(r, 4),
      })),
      landings: ((i?.rows ?? []) as Row[]).map(toLanding),
    },
    cachedAt: new Date().toISOString(),
  };
  return data;
}
