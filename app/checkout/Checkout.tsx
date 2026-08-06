"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 결제 페이지 — /checkout?product=<슬러그>
//  · Supabase products 테이블에서 slug 일치 + is_active=true 상품 조회
//  · 좌: 주문 상품 정보 / 주문자 정보 · 우: 주문 요약 / 결제 수단(위젯) / 약관 / 결제하기
//  · 토스페이먼츠 결제위젯 v2 (주문서형): loadTossPayments → widgets(ANONYMOUS)
//    → setAmount → renderPaymentMethods + renderAgreement → requestPayment
//  · "구매조건 확인 및 결제진행 동의"는 위젯 약관(renderAgreement)으로 대체,
//    "개인정보 수집 및 이용 동의"는 자체 체크박스 유지
//  · 승인 처리(successUrl 도착 후 서버 승인 API)는 2단계
//  · CSS 클래스 접두사 chk-
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  loadTossPayments,
  ANONYMOUS,
  type TossPaymentsWidgets,
  type WidgetPaymentMethodWidget,
  type WidgetAgreementWidget,
} from "@tosspayments/tosspayments-sdk";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
};

export const CHK_STYLE = `
.chk{min-height:100vh;background:#f6f5f2;color:#161616;font-family:'Pretendard',-apple-system,BlinkMacSystemFont,system-ui,'Apple SD Gothic Neo',sans-serif;letter-spacing:-0.01em;overflow-x:hidden}
.chk *{box-sizing:border-box}
.chk-wrap{max-width:1080px;margin:0 auto;padding:48px 20px 80px}
.chk-title{font-size:26px;font-weight:900;margin:0 0 28px}
.chk-grid{display:grid;grid-template-columns:1.6fr 1fr;gap:20px;align-items:start}
.chk-col{display:flex;flex-direction:column;gap:20px;min-width:0}
.chk-card{background:#fff;border:1px solid #e8e6e1;border-radius:16px;padding:26px 24px;box-shadow:0 4px 16px rgba(0,0,0,.04)}
.chk-card-t{font-size:16px;font-weight:800;margin:0 0 18px}
.chk-prod{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
.chk-prod-name{font-size:16px;font-weight:700;margin:0}
.chk-prod-price{font-size:17px;font-weight:900;white-space:nowrap}
.chk-vat{font-size:12px;font-weight:600;color:#8a8a8a;margin-left:4px}
.chk-field{margin-bottom:14px}
.chk-field:last-child{margin-bottom:0}
.chk-label{display:block;font-size:13px;font-weight:700;color:#555;margin-bottom:7px}
.chk-input{width:100%;height:48px;border:1px solid #ddd;border-radius:10px;padding:0 14px;font-size:15px;color:#161616;background:#fff;outline:none;transition:border-color .2s}
.chk-input:focus{border-color:#009519}
.chk-input::placeholder{color:#b5b5b5}
.chk-row{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:14px;color:#555;margin-bottom:12px}
.chk-row b{font-weight:700;color:#161616}
.chk-total{display:flex;align-items:center;justify-content:space-between;gap:12px;border-top:1px solid #eee;padding-top:16px;margin-top:4px;font-size:15px;font-weight:800}
.chk-total-amt{font-size:22px;font-weight:900;color:#009519}
.chk-widget-card{background:#fff;border:1px solid #e8e6e1;border-radius:16px;padding:10px 4px;box-shadow:0 4px 16px rgba(0,0,0,.04);overflow:hidden}
.chk-agree{display:flex;flex-direction:column;gap:12px}
.chk-check{display:flex;align-items:flex-start;gap:10px;font-size:13.5px;color:#444;line-height:1.5;cursor:pointer;padding:0 20px 16px}
.chk-check input{flex:0 0 auto;width:18px;height:18px;margin:1px 0 0;accent-color:#009519;cursor:pointer}
.chk-check a{color:#009519;font-weight:700;text-decoration:underline;text-underline-offset:2px}
.chk-pay{width:100%;height:56px;border:none;border-radius:12px;background:#009519;color:#fff;font-size:16px;font-weight:800;cursor:pointer;transition:opacity .2s}
.chk-pay:hover{opacity:.9}
.chk-pay:disabled{opacity:.5;cursor:not-allowed}
.chk-center{min-height:60vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;text-align:center;padding:40px 20px}
.chk-center-t{font-size:20px;font-weight:800;margin:0}
.chk-center-p{font-size:14px;color:#777;margin:0;line-height:1.6}
.chk-info{width:100%;max-width:420px;background:#fff;border:1px solid #e8e6e1;border-radius:16px;padding:20px 22px;box-shadow:0 4px 16px rgba(0,0,0,.04);text-align:left}
.chk-info-row{display:flex;align-items:baseline;justify-content:space-between;gap:12px;font-size:13.5px;color:#555;padding:6px 0;border-bottom:1px solid #f2f0eb;word-break:break-all}
.chk-info-row:last-child{border-bottom:none}
.chk-info-row b{flex:0 0 auto;font-weight:700;color:#161616}
.chk-home{display:inline-block;background:#161616;color:#fff;font-size:14px;font-weight:800;padding:14px 32px;border-radius:12px;text-decoration:none;border:none;cursor:pointer}
@media(max-width:820px){.chk-grid{grid-template-columns:1fr}.chk-wrap{padding:32px 16px 64px}.chk-title{font-size:22px}}
`;

const formatKRW = (n: number) => `${n.toLocaleString("ko-KR")}원`;

export default function Checkout() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("product");

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);
  const [widgetsReady, setWidgetsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!slug) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, slug, name, price")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      if (cancelled) return;
      setProduct(error ? null : (data as Product | null));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // 상품 로드 완료 후 결제위젯 초기화 (비회원 ANONYMOUS)
  useEffect(() => {
    if (!product) return;
    let cancelled = false;
    let paymentMethodWidget: WidgetPaymentMethodWidget | null = null;
    let agreementWidget: WidgetAgreementWidget | null = null;

    (async () => {
      try {
        const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
        if (!clientKey) {
          console.error("NEXT_PUBLIC_TOSS_CLIENT_KEY 가 설정되지 않았습니다.");
          return;
        }
        const tossPayments = await loadTossPayments(clientKey);
        if (cancelled) return;
        const widgets = tossPayments.widgets({ customerKey: ANONYMOUS });
        widgetsRef.current = widgets;
        await widgets.setAmount({ currency: "KRW", value: product.price });
        if (cancelled) return;
        [paymentMethodWidget, agreementWidget] = await Promise.all([
          widgets.renderPaymentMethods({
            selector: "#chk-payment-methods",
            variantKey: "DEFAULT",
          }),
          widgets.renderAgreement({
            selector: "#chk-agreement",
            variantKey: "AGREEMENT",
          }),
        ]);
        if (cancelled) return;
        setWidgetsReady(true);
      } catch (err) {
        console.error("결제위젯 초기화 실패:", err);
      }
    })();

    return () => {
      cancelled = true;
      setWidgetsReady(false);
      widgetsRef.current = null;
      paymentMethodWidget?.destroy().catch(() => {});
      agreementWidget?.destroy().catch(() => {});
    };
  }, [product]);

  const handlePay = async () => {
    if (!product) return;
    if (!name.trim()) {
      alert("주문자 이름을 입력해주세요.");
      return;
    }
    if (!phone.trim()) {
      alert("연락처를 입력해주세요.");
      return;
    }
    if (!email.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }
    if (!agreePrivacy) {
      alert("개인정보 수집 및 이용에 동의해주세요.");
      return;
    }
    const widgets = widgetsRef.current;
    if (!widgets) {
      alert("결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    const orderId = `TGC-${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      await widgets.requestPayment({
        orderId,
        orderName: product.name,
        customerName: name.trim(),
        customerEmail: email.trim(),
        customerMobilePhone: phone.replace(/\D/g, ""),
        successUrl: `${window.location.origin}/checkout/success`,
        failUrl: `${window.location.origin}/checkout/fail`,
      });
    } catch (err) {
      // 사용자가 결제창을 닫은 경우 등 — 위젯이 표시하는 메시지 외 별도 처리 없음
      const e = err as { code?: string; message?: string };
      if (e?.code !== "USER_CANCEL" && e?.message) {
        alert(e.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="chk">
        <style dangerouslySetInnerHTML={{ __html: CHK_STYLE }} />
        <div className="chk-center">
          <p className="chk-center-p">상품 정보를 불러오는 중입니다.</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="chk">
        <style dangerouslySetInnerHTML={{ __html: CHK_STYLE }} />
        <div className="chk-center">
          <h1 className="chk-center-t">상품을 찾을 수 없습니다</h1>
          <p className="chk-center-p">
            상품이 존재하지 않거나 현재 판매중이 아닙니다.
            <br />
            링크를 다시 확인해주세요.
          </p>
          <Link href="/" className="chk-home">
            홈으로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="chk">
      <style dangerouslySetInnerHTML={{ __html: CHK_STYLE }} />
      <div className="chk-wrap">
        <h1 className="chk-title">결제하기</h1>
        <div className="chk-grid">
          {/* 좌측 */}
          <div className="chk-col">
            <section className="chk-card">
              <h2 className="chk-card-t">주문 상품 정보</h2>
              <div className="chk-prod">
                <p className="chk-prod-name">{product.name}</p>
                <p className="chk-prod-price">
                  {formatKRW(product.price)}
                  <span className="chk-vat">(VAT포함)</span>
                </p>
              </div>
            </section>

            <section className="chk-card">
              <h2 className="chk-card-t">주문자 정보</h2>
              <div className="chk-field">
                <label className="chk-label" htmlFor="chk-name">
                  이름
                </label>
                <input
                  id="chk-name"
                  className="chk-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력해주세요"
                  autoComplete="name"
                />
              </div>
              <div className="chk-field">
                <label className="chk-label" htmlFor="chk-phone">
                  연락처
                </label>
                <input
                  id="chk-phone"
                  className="chk-input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  autoComplete="tel"
                />
              </div>
              <div className="chk-field">
                <label className="chk-label" htmlFor="chk-email">
                  이메일
                </label>
                <input
                  id="chk-email"
                  className="chk-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  autoComplete="email"
                />
              </div>
            </section>
          </div>

          {/* 우측 */}
          <div className="chk-col">
            <section className="chk-card">
              <h2 className="chk-card-t">주문 요약</h2>
              <div className="chk-row">
                <span>상품가격</span>
                <b>{formatKRW(product.price)}</b>
              </div>
              <div className="chk-total">
                <span>총 주문금액</span>
                <span className="chk-total-amt">{formatKRW(product.price)}</span>
              </div>
            </section>

            {/* 결제 수단 (토스 위젯) */}
            <section className="chk-widget-card">
              <div id="chk-payment-methods" />
            </section>

            {/* 약관: 위젯 약관(구매조건 동의) + 자체 개인정보 동의 */}
            <section className="chk-widget-card">
              <div id="chk-agreement" />
              <label className="chk-check">
                <input
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                />
                <span>
                  개인정보 수집 및 이용 동의{" "}
                  <a href="/legal/privacy" target="_blank" rel="noopener noreferrer">
                    자세히 보기
                  </a>
                </span>
              </label>
            </section>

            <button
              type="button"
              className="chk-pay"
              onClick={handlePay}
              disabled={!widgetsReady}
            >
              {widgetsReady ? "결제하기" : "결제 모듈 불러오는 중"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
