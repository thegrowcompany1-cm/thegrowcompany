import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: { absolute: "로그인 | 더그로우컴퍼니" },
  description: "더그로우컴퍼니 회원 로그인 화면입니다.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return <LoginForm />;
}
