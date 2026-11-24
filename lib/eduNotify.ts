// ─────────────────────────────────────────────────────────────────────────────
// 그로우 에듀 "오픈 알림 받기" 공통 상수 — 폼(components/edu/OpenNotifyForm.tsx),
// API(app/api/edu-notify/route.ts), 관리자(app/admin/notify)가 같이 쓴다.
//  · 테이블: supabase/migrations/20261124_edu_notify.sql
//  · 서버 비밀값은 여기에 두지 않는다(클라이언트 컴포넌트도 import 한다).
// ─────────────────────────────────────────────────────────────────────────────

export const EDU_NOTIFY_COURSES = ["sales-ops", "fc-class", "startup-class", "gx-class"] as const;
export type EduNotifyCourse = (typeof EDU_NOTIFY_COURSES)[number];

/** 과정 표시 이름 */
export const EDU_NOTIFY_COURSE_LABEL: Record<EduNotifyCourse, string> = {
  "sales-ops": "운영/세일즈 세미나",
  "fc-class": "정규 FC 세미나",
  "startup-class": "창업 세미나",
  "gx-class": "그룹운동 비즈니스 클래스",
};

export const EDU_NOTIFY_ROLES = ["대표 · 원장", "관리자 · 실장", "트레이너 · 강사", "예비 창업자"] as const;

/** GA form_source / 메타 Lead content_name */
export const EDU_NOTIFY_SOURCE = "에듀_오픈알림";

/** 폼 성공 문구 */
export const EDU_NOTIFY_DONE = "신청되었습니다. 일정이 확정되면 가장 먼저 안내드립니다.";

export function isEduNotifyCourse(v: unknown): v is EduNotifyCourse {
  return typeof v === "string" && (EDU_NOTIFY_COURSES as readonly string[]).includes(v);
}
