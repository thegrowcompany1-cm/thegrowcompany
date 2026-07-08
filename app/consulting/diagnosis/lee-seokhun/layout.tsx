import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이석훈 컨설턴트 | 헬스장·필라테스 운영 진단 컨설팅",
  description:
    "이석훈 컨설턴트의 1:1 현장 진단으로 헬스장운영·필라테스운영을 개선합니다. FC운영·시스템 중심의 더그로우컴퍼니 진단 컨설팅.",
  keywords: [
    "헬스장운영",
    "필라테스운영",
    "진단 컨설팅",
    "이석훈 컨설턴트",
    "피트니스 운영 컨설팅",
  ],
  alternates: { canonical: "/consulting/diagnosis/lee-seokhun" },
  openGraph: {
    title: "이석훈 컨설턴트 | 헬스장·필라테스 운영 진단 컨설팅 | 더그로우컴퍼니",
    description:
      "이석훈 컨설턴트의 1:1 현장 진단으로 헬스장운영·필라테스운영을 개선합니다.",
    url: "/consulting/diagnosis/lee-seokhun",
    type: "profile",
    images: ["/consultants/lee-seokhun.png"],
  },
};

export default function DiagnosisConsultantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
