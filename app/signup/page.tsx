import type { Metadata } from "next";
import { Suspense } from "react";
import SignupForm from "./SignupForm";

export const metadata: Metadata = {
  title: { absolute: "회원가입 | 더그로우컴퍼니" },
  description:
    "더그로우컴퍼니 회원가입. 이메일로 간단히 가입하고 정보마당과 교육 신청을 이용하세요.",
  alternates: { canonical: "/signup" },
  robots: { index: false, follow: true },
};

export default function SignupPage() {
  // SignupForm 이 useSearchParams(redirect) 를 쓰므로 Suspense 로 감싼다
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d0d0d]" />}>
      <SignupForm />
    </Suspense>
  );
}
