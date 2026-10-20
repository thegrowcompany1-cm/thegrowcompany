// ─────────────────────────────────────────────────────────────────────────────
// 세미나 잔여석 — GET /api/seminar-seats
//
//  · 잔여석 = 정원(SO_CAPACITY) − 실제 결제 완료 건수. 결제는 DB 가 아니라 토스에만 남으므로(시트는 기록 전용)
//    토스 거래 조회 API 에서 세미나 주문(TGC-sales-ops[-story]-…)만 센다.
//  · 한 결제(paymentKey)에 승인(DONE)이 있고 전액 취소(CANCELED)가 없으면 1건. 부분 취소는 자리를 유지한 것으로 본다.
//  · 개인정보는 읽지도 내보내지도 않는다 — 숫자만 돌려준다.
//  · 못 가져오면(키 없음·토스 오류·정원 미정) { ok:false } — 화면은 잔여석 줄을 숨긴다. 임의 숫자를 만들지 않는다.
//  · 요청마다 토스를 부르지 않게 60초 메모리 캐시 + CDN 캐시(s-maxage=60).
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { SO_CAPACITY, SO_PRODUCT_NORMAL, SO_PRODUCT_STORY, SO_SALES_FROM, soIsPending } from "@/lib/salesOps";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOSS_TRANSACTIONS_URL = "https://api.tosspayments.com/v1/transactions";
const PAGE = 1000;
const MAX_PAGES = 10;
const CACHE_MS = 60_000;

type Tx = { transactionKey?: string; paymentKey?: string; orderId?: string; status?: string };
type Body = { ok: true; capacity: number; taken: number; remaining: number } | { ok: false };

let cache: { at: number; body: Body } | null = null;

const ORDER_RE = new RegExp(`^TGC-(?:${SO_PRODUCT_NORMAL}|${SO_PRODUCT_STORY})-\\d{13,}$`);
const nowKst = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 19);

async function countTaken(secret: string): Promise<number> {
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
    if (!res.ok) throw new Error(`toss ${res.status}`);
    const rows = (await res.json()) as Tx[];
    if (!Array.isArray(rows)) throw new Error("toss shape");
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
  return [...paid.values()].filter((p) => p.done && !p.canceled).length;
}

export async function GET() {
  const fail = () => NextResponse.json({ ok: false } satisfies Body, { status: 503, headers: { "Cache-Control": "no-store" } });
  const secret = process.env.TOSS_SECRET_KEY?.trim();
  if (!secret || soIsPending(SO_CAPACITY)) return fail();

  if (cache && Date.now() - cache.at < CACHE_MS) {
    return NextResponse.json(cache.body, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  }
  try {
    const taken = await countTaken(secret);
    const body: Body = { ok: true, capacity: SO_CAPACITY, taken, remaining: Math.max(0, SO_CAPACITY - taken) };
    cache = { at: Date.now(), body };
    return NextResponse.json(body, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
  } catch {
    return fail();
  }
}
