// 회원탈퇴 설정 — route 파일은 HTTP 핸들러만 export 해야 해서 상수는 여기 둔다.

/** 유예 기간(일) — docs/purge-cron.sql 의 기준과 반드시 같아야 한다 */
export const GRACE_DAYS = 30;
