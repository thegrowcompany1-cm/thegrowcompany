// ─────────────────────────────────────────────────────────────────────────────
// 그룹운동 비즈니스 클래스 — 기수마다 바뀌는 값은 이 파일 상단 상수만 수정한다.
//
// 확정 전에는 전부 "미정" 이다. 타입은 확정 후 형태로 고정해 두었으니 값만 바꾸면
// 되고, 화면 표기(원·명·날짜 포맷)는 아래 format* 함수가 처리한다.
//   CLASS_DATE / CLASS_TIME / CLASS_PLACE → 문자열
//   CAPACITY / PRICE_NORMAL / PRICE_EARLYBIRD → 숫자 (예: 30, 290000)
//   EARLYBIRD_UNTIL → +09:00 오프셋이 붙은 ISO 문자열 (예: "2026-10-01T00:00:00+09:00")
//     서버가 UTC 로 돌아도 한국시간 기준으로 정확히 해석되게 하기 위함
// ─────────────────────────────────────────────────────────────────────────────

export type Pending = "미정";
export const PENDING: Pending = "미정";

/* ▼▼ 기수마다 이 상수만 수정 ▼▼ */
/** 강의 일자 (예: "2026년 10월 18일 (토)") */
export const CLASS_DATE: string | Pending = PENDING;
/** 강의 시간 (예: "13:00 ~ 17:00 · 총 4시간") */
export const CLASS_TIME: string | Pending = PENDING;
/** 강의 장소 (예: "서울 강남구 ○○빌딩 5층") */
export const CLASS_PLACE: string | Pending = PENDING;
/** 정원 (명) */
export const CAPACITY: number | Pending = PENDING;
/** 정상가 (원, VAT 포함) */
export const PRICE_NORMAL: number | Pending = PENDING;
/** 얼리버드가 (원, VAT 포함) */
export const PRICE_EARLYBIRD: number | Pending = PENDING;
/** 얼리버드 마감 시각 — 반드시 +09:00 오프셋 포함 ISO 문자열 */
export const EARLYBIRD_UNTIL: string | Pending = PENDING;
/* ▲▲ 여기까지 ▲▲ */

export const isPending = (v: unknown): v is Pending => v === PENDING;

/** 290000 → "290,000원" */
export function formatPrice(v: number | Pending): string {
  return isPending(v) ? PENDING : `${v.toLocaleString("ko-KR")}원`;
}

/** 30 → "30명" */
export function formatCapacity(v: number | Pending): string {
  return isPending(v) ? PENDING : `${v}명`;
}

/** 일자·시간 중 확정된 것만 " · " 로 잇는다. 둘 다 미정이면 "미정" */
export function formatSchedule(
  date: string | Pending,
  time: string | Pending,
): string {
  const parts = [date, time].filter((v) => !isPending(v));
  return parts.length ? parts.join(" · ") : PENDING;
}

/** 얼리버드가 + 마감일 — "190,000원 (10월 1일까지)". 마감 미정이면 가격만 */
export function formatEarlybird(
  price: number | Pending,
  until: string | Pending,
): string {
  const p = formatPrice(price);
  if (isPending(until)) return p;
  const d = new Date(until);
  if (Number.isNaN(d.getTime())) return p;
  // 타임존을 고정해 서버/브라우저 렌더 결과가 같게 한다 (하이드레이션 불일치 방지)
  const day = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "long",
    day: "numeric",
  }).format(d);
  return `${p} (${day}까지)`;
}
