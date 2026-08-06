import type { Metadata } from "next";
import { Suspense } from "react";
import CheckoutFail from "./CheckoutFail";

export const metadata: Metadata = {
  title: "결제 실패 | 더그로우컴퍼니",
  description: "결제에 실패했습니다.",
  robots: { index: false },
};

export default function CheckoutFailPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutFail />
    </Suspense>
  );
}
