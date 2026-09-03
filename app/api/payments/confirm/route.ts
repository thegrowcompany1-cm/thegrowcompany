// ─────────────────────────────────────────────────────────────────────────────
// 토스페이먼츠 결제 승인 (2단계) — POST /api/payments/confirm
//
//  결제창 인증(1단계)만으로는 돈이 빠져나가지 않는다. successUrl 로 돌아온 뒤
//  서버가 시크릿 키로 승인(confirm)을 호출해야 결제가 완결된다.
//
//  1) { paymentKey, orderId, amount } 수신
//  2) orderId 에 심긴 슬러그로 서버가 DB 에서 원래 가격을 조회해 amount 대조
//     → 불일치면 400, 토스에 승인 요청조차 하지 않는다
//  3) 통과 시 토스 승인 API 호출 → 성공하면 결제 정보를 정리해 반환
//
//  ※ 이 파일은 라우트 핸들러(서버 전용)라 TOSS_SECRET_KEY 가 클라이언트 번들에
//    포함되지 않는다. 절대 클라이언트 컴포넌트에서 import 하지 말 것.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { fetchProductBySlug, parseOrderIdSlug } from "@/lib/products";

// Buffer(Basic 인증 헤더) 사용 — Node 런타임 고정
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TOSS_CONFIRM_URL = "https://api.tosspayments.com/v1/payments/confirm";

type ConfirmRequest = {
  paymentKey?: unknown;
  orderId?: unknown;
  amount?: unknown;
  /** orderId 파싱 실패 시의 예비 경로 (가격은 언제나 DB 기준으로 검증한다) */
  productSlug?: unknown;
  customer?: { name?: unknown; phone?: unknown; email?: unknown };
};

/** 토스 승인 응답 중 실제로 쓰는 필드만 */
type TossPayment = {
  paymentKey?: string;
  orderId?: string;
  orderName?: string;
  status?: string;
  method?: string;
  totalAmount?: number;
  approvedAt?: string;
  receipt?: { url?: string } | null;
  code?: string;
  message?: string;
};

const str = (v: unknown, max = 200) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

const fail = (status: number, code: string, message: string) =>
  NextResponse.json({ ok: false, code, message }, { status });

export async function POST(request: Request) {
  let body: ConfirmRequest;
  try {
    body = (await request.json()) as ConfirmRequest;
  } catch {
    return fail(400, "INVALID_BODY", "잘못된 요청입니다.");
  }

  const paymentKey = str(body.paymentKey);
  const orderId = str(body.orderId, 64);
  const amount =
    typeof body.amount === "number"
      ? body.amount
      : Number.parseInt(str(body.amount), 10);

  if (!paymentKey || !orderId || !Number.isInteger(amount) || amount <= 0) {
    return fail(400, "INVALID_PARAMS", "결제 정보가 올바르지 않습니다.");
  }

  // ── 금액 검증 ─────────────────────────────────────────────────────────────
  // 상품은 orderId 에 심긴 슬러그로 판별한다. 클라이언트가 보낸 productSlug 는
  // orderId 형식이 깨졌을 때의 예비 수단일 뿐이고, 어느 경로든 가격은 DB 값과
  // 대조하므로 임의 금액을 밀어 넣어도 여기서 걸린다.
  const slug = parseOrderIdSlug(orderId) ?? str(body.productSlug, 64);
  if (!slug) {
    return fail(400, "UNKNOWN_ORDER", "주문 정보를 확인할 수 없습니다.");
  }

  const product = await fetchProductBySlug(slug);
  if (!product) {
    return fail(400, "PRODUCT_NOT_FOUND", "상품 정보를 확인할 수 없습니다.");
  }

  if (product.price !== amount) {
    console.error(
      `결제 금액 불일치 — orderId=${orderId} slug=${slug} 요청=${amount} 상품가격=${product.price}`,
    );
    return fail(
      400,
      "AMOUNT_MISMATCH",
      "결제 금액이 상품 가격과 일치하지 않습니다.",
    );
  }

  // ── 승인 요청 ─────────────────────────────────────────────────────────────
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    console.error("TOSS_SECRET_KEY 가 설정되지 않았습니다. 승인 불가.");
    return fail(
      500,
      "SERVER_MISCONFIGURED",
      "결제 승인 설정에 문제가 있습니다. 고객센터로 문의해주세요.",
    );
  }

  let res: Response;
  try {
    res = await fetch(TOSS_CONFIRM_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`,
        "Content-Type": "application/json",
        // 같은 주문으로 승인이 두 번 날아와도 토스가 첫 결과를 되돌려준다
        // (StrictMode 이중 실행·새로고침 대비)
        "Idempotency-Key": orderId,
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
      cache: "no-store",
    });
  } catch (err) {
    console.error("토스 승인 API 호출 실패:", err);
    return fail(
      502,
      "CONFIRM_REQUEST_FAILED",
      "결제 승인 요청에 실패했습니다. 잠시 후 다시 확인해주세요.",
    );
  }

  const data = (await res.json().catch(() => ({}))) as TossPayment;

  if (!res.ok) {
    // 토스가 준 사유를 그대로 전달 (예: ALREADY_PROCESSED_PAYMENT)
    console.error(
      `토스 승인 거절 — orderId=${orderId} status=${res.status} code=${data.code} message=${data.message}`,
    );
    return NextResponse.json(
      {
        ok: false,
        code: data.code ?? "CONFIRM_FAILED",
        message: data.message ?? "결제 승인에 실패했습니다.",
      },
      { status: res.status },
    );
  }

  // ── 승인 성공 ─────────────────────────────────────────────────────────────
  const payment = {
    orderId: data.orderId ?? orderId,
    orderName: data.orderName ?? product.name,
    productSlug: product.slug,
    amount: data.totalAmount ?? amount,
    method: data.method ?? "",
    status: data.status ?? "DONE",
    approvedAt: data.approvedAt ?? new Date().toISOString(),
    paymentKey: data.paymentKey ?? paymentKey,
    receiptUrl: data.receipt?.url ?? null,
    // 주문자 정보 — 결제창 진입 직전 sessionStorage 에 담아 둔 값
    customerName: str(body.customer?.name, 50),
    customerPhone: str(body.customer?.phone, 30),
    customerEmail: str(body.customer?.email, 120),
  };

  // TODO: 시트 기록 (Apps Script POST) — payment 를 "결제내역" 시트로 전송

  return NextResponse.json({ ok: true, payment });
}
