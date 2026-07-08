import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "김승호 컨설턴트 | 헬스장·필라테스 운영 진단 컨설팅",
  description:
    "김승호 컨설턴트의 1:1 현장 진단으로 헬스장운영·필라테스운영을 개선합니다. FC운영·PT 중심의 더그로우컴퍼니 진단 컨설팅.",
  keywords: [
    "헬스장운영",
    "필라테스운영",
    "진단 컨설팅",
    "김승호 컨설턴트",
    "피트니스 운영 컨설팅",
  ],
  alternates: { canonical: "/consulting/diagnosis/kim-seungho" },
  openGraph: {
    title: "김승호 컨설턴트 | 헬스장·필라테스 운영 진단 컨설팅 | 더그로우컴퍼니",
    description:
      "김승호 컨설턴트의 1:1 현장 진단으로 헬스장운영·필라테스운영을 개선합니다.",
    url: "/consulting/diagnosis/kim-seungho",
    type: "profile",
    images: ["/consultants/kim-seungho.jpg"],
  },
};

export default function DiagnosisConsultantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
