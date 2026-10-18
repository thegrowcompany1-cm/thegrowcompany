// 기간 리포트 — GET /api/admin/ga/report?range=7|28|90 (기본 28)
//
//  · 관리자가 아니면 401.
//  · batchRunReports 한 번으로 4종을 가져온다.
//      a) 날짜별 activeUsers·sessions (+ 기간 전체 합계: 사용자 · 참여율 · 평균 세션 시간)
//      b) 채널(sessionDefaultChannelGroup)별 sessions · activeUsers · engagementRate ·
//         averageSessionDuration · keyEvents
//      c) 페이지(pagePath)별 screenPageViews · activeUsers · userEngagementDuration, 조회수 상위 20
//         → 페이지당 평균 체류시간 = userEngagementDuration / activeUsers
//      d) 페이지별 eventName='scroll' 의 eventCount (90% 스크롤 도달)
//         → 스크롤 도달률 = scroll eventCount / screenPageViews (c 와 pagePath 로 합침)
//  · 서버 메모리 캐시 10분 (기간별). 서버리스 인스턴스마다 따로 갖는 단순 캐시다.
//  · GA 집계 특성상 최대 24~48시간 지연될 수 있다 (화면에 안내).

import { NextResponse } from "next/server";
import { protos } from "@google-analytics/data";
import { getAdminContext } from "@/app/admin/_lib/guard";
import { gaErrorBody, getGa } from "@/lib/ga";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };
const CACHE_TTL_MS = 10 * 60 * 1000;
const RANGES = [7, 28, 90] as const;
type Range = (typeof RANGES)[number];

type Row = { dimensionValues?: { value?: string | null }[] | null; metricValues?: { value?: string | null }[] | null };

type ReportPayload = {
  ok: true;
  range: Range;
  totals: { users: number; sessions: number; engagementRate: number; avgSessionDuration: number };
  daily: { date: string; users: number; sessions: number }[];
  channels: {
    channel: string;
    sessions: number;
    users: number;
    engagementRate: number;
    avgSessionDuration: number;
    keyEvents: number;
  }[];
  pages: {
    path: string;
    views: number;
    users: number;
    /** 사용자당 평균 참여 시간(초) */
    avgEngagementSec: number;
    /** 스크롤 90% 도달률 (0~1). 스크롤 이벤트 데이터가 없으면 null */
    scrollRate: number | null;
  }[];
  cachedAt: string;
};

const cache = new Map<Range, { at: number; data: ReportPayload }>();

const n = (v: string | null | undefined) => Number(v ?? 0) || 0;
const dim = (r: Row, i = 0) => r.dimensionValues?.[i]?.value ?? "";
const met = (r: Row, i: number) => n(r.metricValues?.[i]?.value);

/** GA 날짜 "20261018" → "2026-10-18" */
const isoDate = (d: string) => (d.length === 8 ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}` : d);

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

    const [res] = await client.batchRunReports({
      property,
      requests: [
        // a) 날짜별 추이 + 기간 전체 합계 (totals 는 중복 제거된 실제 합계다)
        {
          dateRanges,
          dimensions: [{ name: "date" }],
          metrics: [
            { name: "activeUsers" },
            { name: "sessions" },
            { name: "engagementRate" },
            { name: "averageSessionDuration" },
          ],
          orderBys: [{ dimension: { dimensionName: "date" } }],
          metricAggregations: [protos.google.analytics.data.v1beta.MetricAggregation.TOTAL],
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
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
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
        // d) 페이지별 스크롤(90%) 이벤트 수 — c 의 상위 20 을 넉넉히 덮도록 많이 받는다
        {
          dateRanges,
          dimensions: [{ name: "pagePath" }],
          metrics: [{ name: "eventCount" }],
          dimensionFilter: {
            filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: "scroll" } },
          },
          limit: 1000,
        },
      ],
    });

    const [a, b, c, d] = res.reports ?? [];

    const totalRow = (a?.totals?.[0] ?? null) as Row | null;
    const daily = ((a?.rows ?? []) as Row[]).map((r) => ({
      date: isoDate(dim(r)),
      users: met(r, 0),
      sessions: met(r, 1),
    }));
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
      const engagement = met(r, 2);
      const scrolls = scrollByPath.get(path);
      return {
        path,
        views,
        users,
        avgEngagementSec: users > 0 ? engagement / users : 0,
        scrollRate: scrolls === undefined || views <= 0 ? null : Math.min(1, scrolls / views),
      };
    });

    const data: ReportPayload = { ok: true, range, totals, daily, channels, pages, cachedAt: new Date().toISOString() };
    cache.set(range, { at: Date.now(), data });
    return NextResponse.json(data, { headers: NO_STORE });
  } catch (err) {
    const { status, body } = gaErrorBody(err);
    return NextResponse.json(body, { status, headers: NO_STORE });
  }
}
