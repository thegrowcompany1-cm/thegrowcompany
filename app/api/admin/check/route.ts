// 현재 세션이 관리자인지 boolean 하나만 돌려준다 — 헤더의 관리자 메뉴 노출용.
//
// 판정은 서버에서만 한다. 관리자 이메일 목록(ADMIN_EMAILS)은 응답에도, 번들에도
// 들어가지 않는다. 클라이언트가 알 수 있는 것은 "나는 관리자다/아니다" 뿐이고,
// 그건 본인이 이미 아는 사실이라 노출될 것이 없다.
//
// 이 응답으로 메뉴가 보인다고 해서 접근 권한이 생기는 것은 아니다. /admin 과
// /admin/export 는 각자 서버에서 다시 검사한다.

import { isAdminSession } from "@/app/admin/_lib/guard";
import { NextResponse } from "next/server";

export async function GET() {
  const isAdmin = await isAdminSession();
  return NextResponse.json(
    { isAdmin },
    { headers: { "Cache-Control": "no-store" } },
  );
}
