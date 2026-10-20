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
/** 장소 — 신청 포스터(public/edu/sales-ops/poster.jpg)에 기재된 내용 */
export const SO_PLACE: string | Pending = "한국에너지기술인협회 교육장 (서울 영등포구 당산로41길 11 E동 601호)";
/** 정원 — 신청 포스터의 "100명 한정" */
export const SO_CAPACITY: number | Pending = 100;
/** 정상가 (원) — products 의 sales-ops 가격과 같아야 한다 (서버가 DB 가격으로 금액을 검증한다) */
export const SO_PRICE_NORMAL = 165000;
/** 스토리 인증가 (원) — products 의 sales-ops-story 가격과 같아야 한다 */
export const SO_PRICE_STORY = 99000;
/** 신청 마감 시각 — 세미나 시작 시각(2026-11-21 13:00 KST). 하단 바의 카운트다운 기준 */
export const SO_DEADLINE_ISO = "2026-11-21T13:00:00+09:00";
export const SO_DEADLINE_MS = Date.parse(SO_DEADLINE_ISO);
/** 잔여석 집계 시작 시각(KST) — 상품을 연 날. 이전 거래는 세지 않는다 */
export const SO_SALES_FROM = "2026-10-15T00:00:00";
/* ▲▲ 여기까지 ▲▲ */

/** 신청 폼의 역할 선택값 중 대표·원장 — components/edu/SalesOpsPay.tsx 의 ROLES 와 같은 문자열이어야 한다 */
export const SO_ROLE_OWNER = "대표 · 원장";

/** 결제 상품 슬러그 — Supabase products 테이블의 slug(is_active=true)와 일치해야 결제창이 뜬다 */
export const SO_PRODUCT_NORMAL = "sales-ops";
export const SO_PRODUCT_STORY = "sales-ops-story";

/** 랜딩 구분값 — 어느 신청 페이지에서 결제까지 왔는지 (시트 "랜딩" 열, GA4·메타 이벤트의 landing) */
export const SO_LANDING_V1 = "sales-ops";
export const SO_LANDING_V3 = "sales-ops3";

/**
 * 결제 상품 슬러그와 (있다면) 신청 페이지가 남긴 랜딩 값으로 최종 랜딩을 정한다.
 *  · 신청 페이지가 값을 남겼으면 그 값 (영문 소문자·숫자·'-', 30자 이내만 인정)
 *  · 없으면 sales-ops 상품은 "sales-ops", 다른 상품은 빈 값
 */
export function soResolveLanding(productSlug: string, landing?: string | null): string {
  const clean = (landing ?? "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 30);
  if (clean) return clean;
  return productSlug === SO_PRODUCT_NORMAL || productSlug === SO_PRODUCT_STORY ? SO_LANDING_V1 : "";
}

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
