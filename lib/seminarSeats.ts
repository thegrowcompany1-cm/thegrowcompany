// ─────────────────────────────────────────────────────────────────────────────
// 세미나 잔여석 집계 (서버 전용) — /api/seminar-seats 와 결제 승인(/api/payments/confirm)이 같이 쓴다.
//
//  · 결제는 DB 가 아니라 토스에만 남으므로(시트는 기록 전용) 토스 거래 조회 API 에서 세미나 주문
//    (TGC-sales-ops[-story]-…)만 센다. 한 결제(paymentKey)에 승인(DONE)이 있고 전액 취소(CANCELED)가 없으면 1건.
//  · 개인정보는 읽지도 내보내지도 않는다 — 숫자와 결제키 집합만 다룬다.
//  · 못 가져오면 null — 부르는 쪽이 '막지 않고 통과'(가짜 매진 방지) 또는 '줄 숨김'으로 처리한다.
// ─────────────────────────────────────────────────────────────────────────────

import { SO_CAPACITY, SO_DEADLINE_MS, SO_PRODUCT_NORMAL, SO_PRODUCT_STORY, SO_SALES_FROM, soIsPending } from "@/lib/salesOps";

const TOSS_TRANSACTIONS_URL = "https://api.tosspayments.com/v1/transactions";
const PAGE = 1000;
const MAX_PAGES = 10;
const CACHE_MS = 60_000;

type Tx = { transactionKey?: string; paymentKey?: string; orderId?: string; status?: string };

export type SeatInfo = { capacity: number; taken: number; remaining: number; paidKeys: Set<string> };

const ORDER_RE = new RegExp(`^TGC-(?:${SO_PRODUCT_NORMAL}|${SO_PRODUCT_STORY})-\\d{13,}$`);
const nowKst = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 19);

let cache: { at: number; info: SeatInfo } | null = null;

/** 토스에서 지금 집계한다 (캐시 없음). 못 가져오면 null */
export async function fetchSeminarSeats(): Promise<SeatInfo | null> {
  const secret = process.env.TOSS_SECRET_KEY?.trim();
  if (!secret || soIsPending(SO_CAPACITY)) return null;
  try {
    const auth = `Basic ${Buffer.from(`${secret}:`).toString("base64")}`;
    const paid = new Map<string, { done: boolean; canceled: boolean }>();
    let after: string | null = null;
    for (let i = 0; i < MAX_PAGES; i++) {
      const url = new URL(TOSS_TRANSACTIONS_URL);
      url.searchParams.set("startDate", SO_SALES_FROM);
      url.searchParams.set("endDate", nowKst());
      url.searchParams.set("limit", String(PAGE));
      if (after) url.searchParams.set("startingAfter", after);
      const res = await fetch(url, { headers: { Authorization: auth }, cache: "no-store" });
      if (!res.ok) return null;
      const rows = (await res.json()) as Tx[];
      if (!Array.isArray(rows)) return null;
      for (const t of rows) {
        if (!t.paymentKey || !t.orderId || !ORDER_RE.test(t.orderId)) continue;
        const cur = paid.get(t.paymentKey) ?? { done: false, canceled: false };
        if (t.status === "DONE") cur.done = true;
        if (t.status === "CANCELED") cur.canceled = true;
        paid.set(t.paymentKey, cur);
      }
      if (rows.length < PAGE) break;
      after = rows[rows.length - 1].transactionKey ?? null;
      if (!after) break;
    }
    const paidKeys = new Set([...paid].filter(([, p]) => p.done && !p.canceled).map(([k]) => k));
    const taken = paidKeys.size;
    return { capacity: SO_CAPACITY, taken, remaining: Math.max(0, SO_CAPACITY - taken), paidKeys };
  } catch {
    return null;
  }
}

/** 화면용 — 60초 메모리 캐시 */
export async function getSeminarSeatsCached(): Promise<SeatInfo | null> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.info;
  const info = await fetchSeminarSeats();
  if (info) cache = { at: Date.now(), info };
  return info;
}

/**
 * 결제 승인 직전 마감·매진 확인. 막아야 하면 사유를, 통과면 null.
 *  · 세미나 상품이 아니면 항상 통과.
 *  · 이미 결제 완료로 잡힌 결제(paymentKey)는 통과 — 결제한 사람이 완료 화면을 새로고침해도 거부되면 안 된다.
 *  · 마감 시각(SO_DEADLINE_MS)이 지났으면 "closed".
 *  · 잔여석이 0 이하면 "soldout". 잔여석을 못 가져오면 매진으로 막지 않는다(가짜 매진 방지).
 */
export async function seminarClosedReason(slug: string, paymentKey: string): Promise<"closed" | "soldout" | null> {
  if (slug !== SO_PRODUCT_NORMAL && slug !== SO_PRODUCT_STORY) return null;
  const deadlinePassed = Date.now() >= SO_DEADLINE_MS;
  const seats = await fetchSeminarSeats();
  if (seats?.paidKeys.has(paymentKey)) return null;
  if (deadlinePassed) return "closed";
  if (seats && seats.remaining <= 0) return "soldout";
  return null;
}
