// 기간 리포트 — GET /api/admin/ga/report?range=7|28|90 (기본 28)
//
//  · 관리자가 아니면 401.
//  · batchRunReports 는 한 번에 최대 5개라 두 번(5개 + 4개)으로 나눠 동시에 호출한다.
//    [묶음 1]
//      a) 날짜별 activeUsers·sessions (+ 기간 전체 합계: 사용자 · 참여율 · 평균 세션 시간)
//      b) 채널(sessionDefaultChannelGroup)별 sessions · activeUsers · engagementRate ·
//         averageSessionDuration · keyEvents
//      c) 페이지(pagePath)별 screenPageViews · activeUsers · userEngagementDuration, 조회수 상위 20
//      d) 페이지별 eventName='scroll' 의 eventCount (90% 스크롤 도달) → 스크롤 도달률
//      e) 랜딩(landingPage)별 sessions · engagedSessions · engagementRate · userEngagementDuration · keyEvents
//    [묶음 2]
//      f) 자연검색(Organic Search) sessionSource 별 세션·참여율
//      g) 자연검색 유입 랜딩 Top 20
//      h) AI 검색 소스(chatgpt·perplexity·gemini·copilot·claude·wrtn 등)별 세션
//      i) AI 유입 랜딩
//  · landingPage 는 쿼리스트링이 없는 경로 기준이다 (landingPagePlusQueryString 을 쓰지 않는다).
//  · 서버 메모리 캐시 10분 (기간별). GA 집계 특성상 최대 24~48시간 지연될 수 있다.

import { NextResponse } from "next/server";
import { protos } from "@google-analytics/data";
import { getAdminContext } from "@/app/admin/_lib/guard";
import { gaErrorBody, getGa } from "@/lib/ga";
import { AI_SOURCE_REGEX, RANGES, type LandingRow, type Range, type ReportPayload } from "@/lib/gaTypes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };
const CACHE_TTL_MS = 10 * 60 * 1000;

type Row = { dimensionValues?: { value?: string | null }[] | null; metricValues?: { value?: string | null }[] | null };

const cache = new Map<Range, { at: number; data: ReportPayload }>();

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

export async function GET(request: Request) {
  const admin = await getAdminContext();
  if (!admin) {
    return NextResponse.json({ ok: false, code: "UNAUTHORIZED", message: "권한이 없습니다." }, { status: 401, headers: NO_STORE });
  }

  const asked = Number(new URL(request.url).searchParams.get("range"));
  const range: Range = (RANGES as readonly number[]).includes(asked) ? (asked as Range) : 28;

  const hit = cache.get(range);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return NextResponse.json(hit.data, { headers: NO_STORE });
  }

  try {
    const { client, property } = getGa();
    const dateRanges = [{ startDate: `${range - 1}daysAgo`, endDate: "today" }];
    const bySessions = [{ metric: { metricName: "sessions" }, desc: true }];

    const [[res1], [res2]] = await Promise.all([
      client.batchRunReports({
        property,
        requests: [
          // a) 날짜별 추이 + 기간 전체 합계
          {
            dateRanges,
            dimensions: [{ name: "date" }],
            metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "engagementRate" }, { name: "averageSessionDuration" }],
            orderBys: [{ dimension: { dimensionName: "date" } }],
            metricAggregations: [MetricAggregation.TOTAL],
            limit: 200,
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
    ]);

    const [a, b, c, d, e] = res1.reports ?? [];
    const [f, g, h, i] = res2.reports ?? [];

    const totalRow = (a?.totals?.[0] ?? null) as Row | null;
    const daily = ((a?.rows ?? []) as Row[]).map((r) => ({ date: isoDate(dim(r)), users: met(r, 0), sessions: met(r, 1) }));
    const totals = totalRow
      ? { users: met(totalRow, 0), sessions: met(totalRow, 1), engagementRate: met(totalRow, 2), avgSessionDuration: met(totalRow, 3) }
      : { users: 0, sessions: 0, engagementRate: 0, avgSessionDuration: 0 };

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
      range,
      totals,
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
    cache.set(range, { at: Date.now(), data });
    return NextResponse.json(data, { headers: NO_STORE });
  } catch (err) {
    const { status, body } = gaErrorBody(err);
    return NextResponse.json(body, { status, headers: NO_STORE });
  }
}
