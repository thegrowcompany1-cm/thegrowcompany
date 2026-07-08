import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "구진완 컨설턴트 | 헬스장·필라테스 운영 진단 컨설팅",
  description:
    "구진완 컨설턴트의 1:1 현장 진단으로 헬스장운영·필라테스운영을 개선합니다. FC운영·리더십 중심의 더그로우컴퍼니 진단 컨설팅.",
  keywords: [
    "헬스장운영",
    "필라테스운영",
    "진단 컨설팅",
    "구진완 컨설턴트",
    "피트니스 운영 컨설팅",
  ],
  alternates: { canonical: "/consulting/diagnosis/gu-jinwan" },
  openGraph: {
    title: "구진완 컨설턴트 | 헬스장·필라테스 운영 진단 컨설팅 | 더그로우컴퍼니",
    description:
      "구진완 컨설턴트의 1:1 현장 진단으로 헬스장운영·필라테스운영을 개선합니다.",
    url: "/consulting/diagnosis/gu-jinwan",
    type: "profile",
    images: ["/consultants/gu-jinwan.png"],
  },
};

export default function DiagnosisConsultantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
