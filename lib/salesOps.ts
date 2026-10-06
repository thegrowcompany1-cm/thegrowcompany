// ─────────────────────────────────────────────────────────────────────────────
// 피트니스 성장 마스터키 세미나 (/edu/sales-ops) — 회차마다 바뀌는 값은 이 파일만 수정한다.
//
// 확정 전인 값은 "미정" 이다. 값만 바꾸면 화면 표기(원·명 포맷)는 아래 함수가 처리한다.
// 구조는 lib/gxClass.ts 와 같다. 결제 연동은 다음 작업이라 가격은 아직 표기용일 뿐이다.
// ─────────────────────────────────────────────────────────────────────────────

export type Pending = "미정";
export const SO_PENDING: Pending = "미정";

/* ▼▼ 회차마다 이 상수만 수정 ▼▼ */
/** 일자 — 확정 */
export const SO_DATE = "2026.11.21(토)";
/** 시간 — 확정 */
export const SO_TIME = "13:00~17:00";
/** TODO: 장소 확정 후 문자열로 교체 (예: "서울 영등포구 ○○ 5층") */
export const SO_PLACE: string | Pending = SO_PENDING;
/** TODO: 정원 확정 후 숫자로 교체 (예: 30) */
export const SO_CAPACITY: number | Pending = SO_PENDING;
/** TODO: 가격 확정 후 숫자로 교체 (원, VAT 포함 여부는 표기 시 함께 결정) */
export const SO_PRICE: number | Pending = SO_PENDING;
/* ▲▲ 여기까지 ▲▲ */

export const soIsPending = (v: unknown): v is Pending => v === SO_PENDING;

/** 일자·시간 — "2026.11.21(토) 13:00~17:00" */
export const SO_SCHEDULE = `${SO_DATE} ${SO_TIME}`;

/** 209000 → "209,000원" */
export function soFormatPrice(v: number | Pending): string {
  return soIsPending(v) ? SO_PENDING : `${v.toLocaleString("ko-KR")}원`;
}

/** 30 → "30명" */
export function soFormatCapacity(v: number | Pending): string {
  return soIsPending(v) ? SO_PENDING : `${v}명`;
}
