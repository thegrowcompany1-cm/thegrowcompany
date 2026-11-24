// ─────────────────────────────────────────────────────────────────────────────
// 오픈 알림 신청 CSV 다운로드 — /admin/notify/export[?course=...]
//
//  · 페이지와 같은 권한 검사(getAdminContext). null 이면 404 로 존재를 숨긴다.
//  · 화면과 같은 loadNotifies() 를 쓴다. CSV 에는 연락처·이메일 전체가 들어간다(다운로드한 파일은 관리 책임이 있다).
// ─────────────────────────────────────────────────────────────────────────────

import { getAdminContext } from "../../_lib/guard";
import { loadNotifies } from "../../_lib/eduNotify";
import { kstDateTime, formatPhone } from "../../_lib/format";
import { EDU_NOTIFY_COURSE_LABEL, isEduNotifyCourse } from "@/lib/eduNotify";

export const dynamic = "force-dynamic";

/** CSV 로 내보내는 최대 건수 */
const EXPORT_LIMIT = 10000;

const HEADERS = ["접수일시(KST)", "과정", "성함", "연락처", "이메일", "지역", "직책", "광고수신동의", "개인정보동의", "신청페이지"];

/** CSV 한 칸 — 큰따옴표 이중화 + 수식 시작 문자(=,+,-,@) 앞에 작은따옴표(CSV 인젝션 방지) */
function cell(value: string): string {
  const v = value ?? "";
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET(req: Request) {
  const ctx = await getAdminContext();
  if (!ctx) return new Response(null, { status: 404 });

  const param = new URL(req.url).searchParams.get("course");
  const course = isEduNotifyCourse(param) ? param : null;

  const { rows, error } = await loadNotifies(ctx, course, EXPORT_LIMIT);
  if (error) return new Response(`조회 실패: ${error}`, { status: 500 });

  const lines = [
    HEADERS.map(cell).join(","),
    ...rows.map((r) =>
      [
        kstDateTime(r.created_at),
        isEduNotifyCourse(r.course) ? EDU_NOTIFY_COURSE_LABEL[r.course] : r.course,
        r.name,
        formatPhone(r.phone),
        r.email ?? "",
        r.region ?? "",
        r.role ?? "",
        r.marketing_agree ? "동의" : "미동의",
        r.privacy_agree ? "동의" : "미동의",
        r.page ?? "",
      ]
        .map(cell)
        .join(","),
    ),
  ];

  // 엑셀에서 한글이 깨지지 않게 BOM 을 붙인다
  const body = "﻿" + lines.join("\r\n") + "\r\n";
  const stamp = kstDateTime(new Date()).slice(0, 10);
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="edu-notify-${course ?? "all"}-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
