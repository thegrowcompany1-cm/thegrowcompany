"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 결제 실패 리다이렉트 화면 — /checkout/fail?code=..&message=..
//  · 실패 사유 표시 + 다시 시도(뒤로가기)
// ─────────────────────────────────────────────────────────────────────────────

import { useSearchParams } from "next/navigation";
import { CHK_STYLE } from "../Checkout";

export default function CheckoutFail() {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const message = searchParams.get("message");

  return (
    <div className="chk">
      <style dangerouslySetInnerHTML={{ __html: CHK_STYLE }} />
      <div className="chk-center">
        <h1 className="chk-center-t">결제에 실패했습니다</h1>
        <p className="chk-center-p">
          {message ?? "결제 진행 중 문제가 발생했습니다."}
          {code ? (
            <>
              <br />
              (오류 코드: {code})
            </>
          ) : null}
        </p>
        <button
          type="button"
          className="chk-home"
          onClick={() => window.history.back()}
        >
          다시 시도하기
        </button>
      </div>
    </div>
  );
}
