"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 결제 승인 화면 — /checkout/success?paymentKey=..&orderId=..&amount=..
//  · 마운트 시 서버 승인 라우트(/api/payments/confirm)를 호출해 결제를 완결한다.
//  · 진행 중 / 완료 / 실패 세 가지 상태를 화면으로 구분한다.
//  · 금액은 서버가 DB 가격과 대조하므로, URL 에 임의 amount 를 넣어도 승인되지 않는다.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CHK_STYLE } from "../Checkout";
import {
  clearCheckoutCustomer,
  parseOrderIdSlug,
  readCheckoutCustomer,
} from "@/lib/products";

type Payment = {
  orderId: string;
  orderName: string;
  productSlug: string;
  amount: number;
  method: string;
  status: string;
  approvedAt: string;
  paymentKey: string;
  receiptUrl: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
};

type Phase =
  | { kind: "confirming" }
  | { kind: "done"; payment: Payment }
  | { kind: "error"; message: string; code?: string };

const formatKRW = (n: number) => `${n.toLocaleString("ko-KR")}원`;

const Contact = () => (
  <p className="chk-center-p">
    결제 관련 문의: <b>1551-4476</b>
  </p>
);

function FailScreen({
  message,
  code,
  orderId,
}: {
  message: string;
  code?: string;
  orderId: string | null;
}) {
  const slug = orderId ? parseOrderIdSlug(orderId) : null;
  return (
    <div className="chk">
      <style dangerouslySetInnerHTML={{ __html: CHK_STYLE }} />
      <div className="chk-center">
        <h1 className="chk-center-t">결제가 완료되지 않았습니다</h1>
        <p className="chk-center-p">
          {message}
          {code ? (
            <>
              <br />
              (오류 코드: {code})
            </>
          ) : null}
        </p>
        <Contact />
        <Link
          href={slug ? `/checkout?product=${slug}` : "/"}
          className="chk-home"
        >
          다시 시도하기
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  const [phase, setPhase] = useState<Phase>({ kind: "confirming" });
  // 같은 paymentKey 로 승인이 두 번 나가지 않게 하는 가드
  // (React StrictMode 는 개발 모드에서 이펙트를 두 번 실행한다)
  const confirmedKey = useRef<string | null>(null);

  // 쿼리 자체가 없는 경우(직접 접속 등)는 렌더 단계에서 바로 실패 화면으로 처리한다.
  const missingParams = !paymentKey || !orderId || !amount;

  useEffect(() => {
    if (!paymentKey || !orderId || !amount) return;
    if (confirmedKey.current === paymentKey) return;
    confirmedKey.current = paymentKey;

    const customer = readCheckoutCustomer(orderId);

    (async () => {
      try {
        const res = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: Number(amount),
            productSlug: parseOrderIdSlug(orderId) ?? undefined,
            customer: customer ?? undefined,
          }),
        });
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          payment?: Payment;
          code?: string;
          message?: string;
        };

        if (!res.ok || !data.ok || !data.payment) {
          setPhase({
            kind: "error",
            message: data.message ?? "결제 승인에 실패했습니다.",
            code: data.code,
          });
          return;
        }

        clearCheckoutCustomer(orderId);
        setPhase({ kind: "done", payment: data.payment });
      } catch {
        setPhase({
          kind: "error",
          message:
            "결제 승인 중 통신 오류가 발생했습니다. 결제가 완료되지 않았을 수 있으니 고객센터로 문의해주세요.",
        });
      }
    })();
  }, [paymentKey, orderId, amount]);

  // 구매 전환 — 서버 승인이 성공(done)했을 때만 보낸다. 실패 화면에서는 절대 보내지 않는다.
  // 매출이 부풀지 않도록 주문당 1회:
  //  · useRef      — StrictMode 이중 실행 · 재렌더 가드
  //  · localStorage — 새로고침 가드. 새로고침하면 승인 라우트가 토스의 멱등 응답으로
  //                   다시 성공해 done 이 또 오는데, useRef 는 새로고침에서 초기화된다.
  //  · eventID / transaction_id = 주문번호 — 메타·GA4 쪽 중복 제거 키
  const purchasedRef = useRef<string | null>(null);
  useEffect(() => {
    if (phase.kind !== "done") return;
    const { payment } = phase;
    if (purchasedRef.current === payment.orderId) return;
    purchasedRef.current = payment.orderId;

    const sentKey = `tgc-purchase-sent:${payment.orderId}`;
    try {
      if (window.localStorage.getItem(sentKey)) return;
      window.localStorage.setItem(sentKey, "1");
    } catch {
      // 저장소를 쓸 수 없는 환경 — useRef 가드와 eventID 중복 제거에 맡긴다
    }

    if (typeof window.__tgcFbTrack === "function") {
      window.__tgcFbTrack(
        "Purchase",
        {
          content_name: payment.orderName,
          content_ids: [payment.productSlug],
          value: payment.amount,
          currency: "KRW",
        },
        { eventID: payment.orderId },
      );
    }

    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void })
      .gtag;
    if (typeof gtag === "function") {
      gtag("event", "purchase", {
        transaction_id: payment.orderId,
        value: payment.amount,
        currency: "KRW",
      });
    }
  }, [phase]);

  if (missingParams) {
    return (
      <FailScreen
        message="결제 정보가 확인되지 않았습니다. 다시 시도해주세요."
        orderId={orderId}
      />
    );
  }

  // ── 승인 진행 중 ──────────────────────────────────────────────────────────
  if (phase.kind === "confirming") {
    return (
      <div className="chk">
        <style dangerouslySetInnerHTML={{ __html: CHK_STYLE }} />
        <div className="chk-center">
          <h1 className="chk-center-t">결제 정보를 확인하는 중입니다</h1>
          <p className="chk-center-p">
            잠시만 기다려주세요.
            <br />
            결제 승인이 완료되면 안내드립니다.
          </p>
        </div>
      </div>
    );
  }

  // ── 승인 실패 ────────────────────────────────────────────────────────────
  if (phase.kind === "error") {
    return (
      <FailScreen message={phase.message} code={phase.code} orderId={orderId} />
    );
  }

  // ── 승인 성공 ────────────────────────────────────────────────────────────
  const { payment } = phase;
  return (
    <div className="chk">
      <style dangerouslySetInnerHTML={{ __html: CHK_STYLE }} />
      <div className="chk-center">
        <h1 className="chk-center-t">결제가 완료됐습니다</h1>
        <p className="chk-center-p">
          결제해주셔서 감사합니다.
          <br />
          안내 사항은 입력해주신 연락처로 전달드립니다.
        </p>
        <div className="chk-info">
          <div className="chk-info-row">
            <b>주문번호</b>
            <span>{payment.orderId}</span>
          </div>
          <div className="chk-info-row">
            <b>상품명</b>
            <span>{payment.orderName}</span>
          </div>
          <div className="chk-info-row">
            <b>결제금액</b>
            <span>{formatKRW(payment.amount)}</span>
          </div>
          {payment.method ? (
            <div className="chk-info-row">
              <b>결제수단</b>
              <span>{payment.method}</span>
            </div>
          ) : null}
        </div>
        <Contact />
        <Link href="/" className="chk-home">
          홈으로
        </Link>
      </div>
    </div>
  );
}
