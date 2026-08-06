"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 결제 성공 리다이렉트 화면 — /checkout/success?paymentKey=..&orderId=..&amount=..
//  · 1단계: 쿼리 값 표시까지만 (테스트 확인용)
//  · TODO 2단계: paymentKey/orderId/amount 로 서버 승인 API 호출 후 결제 완료 처리
// ─────────────────────────────────────────────────────────────────────────────

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CHK_STYLE } from "../Checkout";

export default function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

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
        <div className="chk-info">
          <div className="chk-info-row">
            <b>주문번호</b>
            <span>{orderId ?? "-"}</span>
          </div>
          <div className="chk-info-row">
            <b>결제금액</b>
            <span>
              {amount ? `${Number(amount).toLocaleString("ko-KR")}원` : "-"}
            </span>
          </div>
          <div className="chk-info-row">
            <b>paymentKey</b>
            <span>{paymentKey ?? "-"}</span>
          </div>
        </div>
        <Link href="/" className="chk-home">
          홈으로
        </Link>
      </div>
    </div>
  );
}
