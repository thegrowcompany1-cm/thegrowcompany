// ─────────────────────────────────────────────────────────────────────────────
// 피트니스 성장 마스터키 세미나 (/edu/sales-ops) — 회차마다 바뀌는 값은 이 파일만 수정한다.
//
// 확정 전인 값은 "미정" 이다. 값만 바꾸면 화면 표기(원·명 포맷)는 아래 함수가 처리한다.
// 구조는 lib/gxClass.ts 와 같다. 결제는 Supabase products 의 슬러그(아래 SO_PRODUCT_*)로 진행한다.
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
/** 정상가 (원) — products 의 sales-ops 가격과 같아야 한다 (서버가 DB 가격으로 금액을 검증한다) */
export const SO_PRICE_NORMAL = 165000;
/** 스토리 인증가 (원) — products 의 sales-ops-story 가격과 같아야 한다 */
export const SO_PRICE_STORY = 99000;
/* ▲▲ 여기까지 ▲▲ */

/** 결제 상품 슬러그 — Supabase products 테이블의 slug(is_active=true)와 일치해야 결제창이 뜬다 */
export const SO_PRODUCT_NORMAL = "sales-ops";
export const SO_PRODUCT_STORY = "sales-ops-story";

/** 인증가 조건 미충족 시 안내하는 차액 (원) */
export const SO_PRICE_DIFF = SO_PRICE_NORMAL - SO_PRICE_STORY;

/** 인증가 할인율(%) — 소수점 버림 */
export const SO_STORY_DISCOUNT_PCT = Math.floor((SO_PRICE_DIFF / SO_PRICE_NORMAL) * 100);

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
