// ─────────────────────────────────────────────────────────────────────────────
// 세미나 잔여석 — GET /api/seminar-seats
//  · 집계는 lib/seminarSeats.ts (토스 결제 완료 건수). 숫자만 돌려주고 개인정보는 내보내지 않는다.
//  · 못 가져오면 { ok:false } — 화면은 잔여석 줄을 숨기고, 매진으로 막지도 않는다. 임의 숫자를 만들지 않는다.
//  · 60초 메모리 캐시 + CDN 캐시(s-maxage=60).
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { getSeminarSeatsCached } from "@/lib/seminarSeats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const info = await getSeminarSeatsCached();
  if (!info) {
    return NextResponse.json({ ok: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.json(
    { ok: true, capacity: info.capacity, taken: info.taken, remaining: info.remaining },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } },
  );
}
