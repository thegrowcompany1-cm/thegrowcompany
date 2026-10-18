// 실시간 접속 현황 — GET /api/admin/ga/realtime
//
//  · 관리자(ADMIN_EMAILS)가 아니면 401. 가드는 /admin 과 같은 getAdminContext() 를 쓴다.
//  · 최근 30분: 총 activeUsers / 페이지(unifiedScreenName)별 상위 10 / 기기(deviceCategory)별
//  · 캐시 없음 (no-store). 서버 전용 — 서비스 계정 키는 이 경로 밖으로 나가지 않는다.

import { NextResponse } from "next/server";
import { getAdminContext } from "@/app/admin/_lib/guard";
import { gaErrorBody, getGa } from "@/lib/ga";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };
/** 실시간 리포트가 허용하는 가장 긴 구간 (30분 = 0~29분 전) */
const MINUTE_RANGES = [{ startMinutesAgo: 29, endMinutesAgo: 0 }];

type Row = { dimensionValues?: { value?: string | null }[] | null; metricValues?: { value?: string | null }[] | null };

const rowsOf = (rows: Row[] | null | undefined) =>
  (rows ?? []).map((r) => ({
    name: r.dimensionValues?.[0]?.value || "(알 수 없음)",
    users: Number(r.metricValues?.[0]?.value ?? 0),
  }));

export async function GET() {
  const admin = await getAdminContext();
  if (!admin) {
    return NextResponse.json({ ok: false, code: "UNAUTHORIZED", message: "권한이 없습니다." }, { status: 401, headers: NO_STORE });
  }

  try {
    const { client, property } = getGa();
    const metrics = [{ name: "activeUsers" }];

    const [[total], [pages], [devices]] = await Promise.all([
      client.runRealtimeReport({ property, metrics, minuteRanges: MINUTE_RANGES }),
      client.runRealtimeReport({
        property,
        dimensions: [{ name: "unifiedScreenName" }],
        metrics,
        minuteRanges: MINUTE_RANGES,
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 10,
      }),
      client.runRealtimeReport({
        property,
        dimensions: [{ name: "deviceCategory" }],
        metrics,
        minuteRanges: MINUTE_RANGES,
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
      }),
    ]);

    return NextResponse.json(
      {
        ok: true,
        total: Number(total.rows?.[0]?.metricValues?.[0]?.value ?? 0),
        pages: rowsOf(pages.rows as Row[]),
        devices: rowsOf(devices.rows as Row[]),
        fetchedAt: new Date().toISOString(),
      },
      { headers: NO_STORE },
    );
  } catch (err) {
    const { status, body } = gaErrorBody(err);
    return NextResponse.json(body, { status, headers: NO_STORE });
  }
}
