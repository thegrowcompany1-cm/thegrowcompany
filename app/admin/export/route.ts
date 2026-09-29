// ─────────────────────────────────────────────────────────────────────────────
// 회원 명단 CSV 다운로드 — /admin/export
//
//  · 페이지와 같은 권한 검사를 거친다. getAdminContext() 가 null 이면 404 다.
//    (라우트 핸들러라 notFound() 대신 404 Response 를 직접 돌려준다. 결과는 같다)
//  · 화면 표와 같은 loadMembers() 를 쓴다. 두 곳의 숫자가 어긋나지 않게 하려는 것.
//  · CSV 에는 연락처·이메일 전체가 들어간다. 다운로드한 파일은 관리 책임이 있다.
// ─────────────────────────────────────────────────────────────────────────────

import { getAdminContext } from "../_lib/guard";
import { loadMembers } from "../_lib/members";
import { kstDateTime, kstDateKey, formatPhone } from "../_lib/format";

/** CSV 로 내보내는 최대 인원 */
const EXPORT_LIMIT = 5000;

const HEADERS = [
  "가입일시(KST)",
  "이름",
  "닉네임",
  "이메일",
  "연락처",
  "가입방식",
  "마지막로그인(KST)",
  "role",
];

/**
 * CSV 한 칸 이스케이프.
 * 큰따옴표는 두 번 겹치고, 앞이 =,+,-,@ 로 시작하면 작은따옴표를 붙인다
 * (엑셀이 수식으로 해석해 실행하는 CSV 인젝션 방지).
 */
function cell(value: string): string {
  const v = value ?? "";
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET() {
  const ctx = await getAdminContext();
  if (!ctx) {
    // 권한 없음도 "없는 경로" 로 응답해 존재를 숨긴다
    return new Response(null, { status: 404 });
  }

  const { members } = await loadMembers(ctx, EXPORT_LIMIT);

  const lines = [
    HEADERS.map(cell).join(","),
    ...members.map((m) =>
      [
        kstDateTime(m.createdAt),
        m.username,
        m.nickname,
        m.email,
        formatPhone(m.phone),
        m.provider,
        kstDateTime(m.lastSignInAt),
        m.role,
      ]
        .map(cell)
        .join(","),
    ),
  ];

  // 엑셀이 UTF-8 로 인식하도록 BOM 을 붙인다. 없으면 한글이 깨진다.
  const body = "﻿" + lines.join("\r\n") + "\r\n";
  const filename = `members-${kstDateKey(new Date())}.csv`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
