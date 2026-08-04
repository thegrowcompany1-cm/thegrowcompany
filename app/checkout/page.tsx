import type { Metadata } from "next";
import { Suspense } from "react";
import Checkout from "./Checkout";

export const metadata: Metadata = {
  title: "결제하기 | 더그로우컴퍼니",
  description: "그로우 아카데미 강의 결제 페이지입니다.",
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <Checkout />
    </Suspense>
  );
}
