import type { Metadata } from "next";
import UpdatePasswordForm from "./UpdatePasswordForm";

export const metadata: Metadata = {
  title: { absolute: "비밀번호 재설정 | 더그로우컴퍼니" },
  description: "더그로우컴퍼니 비밀번호 재설정 화면입니다.",
  robots: { index: false, follow: false },
};

export default function UpdatePasswordPage() {
  return <UpdatePasswordForm />;
}
