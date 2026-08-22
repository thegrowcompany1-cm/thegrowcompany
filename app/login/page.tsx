import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: { absolute: "로그인 | 더그로우컴퍼니" },
  description: "더그로우컴퍼니 회원 로그인 화면입니다.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  // LoginForm 이 useSearchParams(redirect) 를 쓰므로 Suspense 로 감싼다
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d0d0d]" />}>
      <LoginForm />
    </Suspense>
  );
}
