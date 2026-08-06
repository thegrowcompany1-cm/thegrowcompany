import type { Metadata } from "next";
import { Suspense } from "react";
import CheckoutSuccess from "./CheckoutSuccess";

export const metadata: Metadata = {
  title: "결제 확인 중 | 더그로우컴퍼니",
  description: "결제 정보를 확인하는 중입니다.",
  robots: { index: false },
};

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccess />
    </Suspense>
  );
}
