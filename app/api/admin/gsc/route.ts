// 서치콘솔 — GET /api/admin/gsc
//  · 관리자가 아니면 401 (GA 라우트와 같은 가드).
//  · 최근 28일 검색어 Top 50 / 페이지 Top 30 / 기회 키워드. 서버 메모리 캐시 1시간 (lib/gsc.ts).

import { NextResponse } from "next/server";
import { getAdminContext } from "@/app/admin/_lib/guard";
import { fetchGsc, gscErrorBody } from "@/lib/gsc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET() {
  const admin = await getAdminContext();
  if (!admin) {
    return NextResponse.json({ ok: false, code: "UNAUTHORIZED", message: "권한이 없습니다." }, { status: 401, headers: NO_STORE });
  }
  try {
    return NextResponse.json(await fetchGsc(), { headers: NO_STORE });
  } catch (err) {
    const { status, body } = gscErrorBody(err);
    return NextResponse.json(body, { status, headers: NO_STORE });
  }
}
