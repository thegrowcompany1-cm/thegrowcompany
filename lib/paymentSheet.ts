// ─────────────────────────────────────────────────────────────────────────────
// 결제내역 → 구글시트 기록 (Apps Script 웹앱)
//
//  · 서버 전용. 승인 라우트(app/api/payments/confirm)에서만 import 한다.
//  · URL·토큰은 상담 폼 Apps Script 와 같은 방식으로 코드에 직접 둔다 (환경변수 아님).
//  · 이 모듈의 전송 함수는 절대 예외를 던지지 않는다. 시트 기록이 실패해도
//    결제 승인은 이미 끝났으므로, 고객에게 실패 화면을 보여주면 안 된다.
//    실패 시에는 수동 복구에 필요한 값(orderId · paymentKey · 사유)을 서버 로그로 남긴다.
// ─────────────────────────────────────────────────────────────────────────────

export const PAYMENT_SHEET_URL =
  "https://script.google.com/macros/s/AKfycbxmo4P7VOk4fGsLY6ZOHQL819Eoe7un_KboLj6BHY6JUuxM0dsFWC2UyMdc0YP0EAk/exec";

export const PAYMENT_SHEET_TOKEN = "grow2026pay";

/** 시트 응답을 기다리는 최대 시간 — 결제 완료 화면이 늦어지지 않게 */
const PAYMENT_SHEET_TIMEOUT_MS = 5000;

/** 승인 라우트가 만든 결제 정보 중 시트에 기록하는 값 */
export type PaymentSheetRow = {
  approvedAt: string;
  orderId: string;
  productSlug: string;
  orderName: string;
  amount: number;
  method: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  paymentKey: string;
  receiptUrl: string | null;
};

/**
 * 결제내역 1건을 시트로 전송한다. 실패·타임아웃이어도 throw 하지 않는다.
 * 반환값은 기록 성공 여부 (호출부에서 승인 응답을 바꾸는 데 쓰지 말 것).
 */
export async function sendPaymentToSheet(p: PaymentSheetRow): Promise<boolean> {
  // Apps Script 가 읽는 키 이름과 정확히 일치시킨다 — 키를 명시해 목록 밖 값이 섞이지 않게
  const body = {
    token: PAYMENT_SHEET_TOKEN,
    approvedAt: p.approvedAt,
    orderId: p.orderId,
    productSlug: p.productSlug,
    orderName: p.orderName,
    amount: p.amount,
    method: p.method,
    customerName: p.customerName,
    customerPhone: p.customerPhone,
    customerEmail: p.customerEmail,
    paymentKey: p.paymentKey,
    receiptUrl: p.receiptUrl,
  };

  const logFail = (reason: string) =>
    console.error(
      `결제내역 시트 기록 실패 — orderId=${p.orderId} paymentKey=${p.paymentKey} amount=${p.amount} 사유=${reason}`,
    );

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PAYMENT_SHEET_TIMEOUT_MS);

  try {
    const res = await fetch(PAYMENT_SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    });

    const text = await res.text().catch(() => "");

    if (!res.ok) {
      logFail(`HTTP ${res.status} ${text.slice(0, 200)}`);
      return false;
    }

    // Apps Script 는 오류도 200 으로 돌려줄 수 있다 (예: 토큰 불일치) — 본문의 실패 표시도 확인
    try {
      const json = JSON.parse(text) as { ok?: unknown; result?: unknown; error?: unknown };
      if (json.ok === false || json.result === "error" || json.error) {
        logFail(`시트 응답 실패 ${text.slice(0, 200)}`);
        return false;
      }
    } catch {
      // JSON 이 아닌 응답은 HTTP 성공만으로 기록 완료로 본다
    }

    return true;
  } catch (err) {
    const reason =
      err instanceof Error && err.name === "AbortError"
        ? `타임아웃(${PAYMENT_SHEET_TIMEOUT_MS}ms)`
        : err instanceof Error
          ? err.message
          : String(err);
    logFail(reason);
    return false;
  } finally {
    clearTimeout(timer);
  }
}
