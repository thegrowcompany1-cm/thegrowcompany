import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "황봉남 멘토 | 헬스장·필라테스 운영 진단 솔루션",
  description:
    "황봉남 멘토의 1:1 현장 진단으로 헬스장운영·필라테스운영을 개선합니다. 인적자원·PT 중심의 더그로우컴퍼니 진단 솔루션.",
  keywords: [
    "헬스장운영",
    "필라테스운영",
    "진단 솔루션",
    "황봉남 멘토",
    "피트니스 운영 솔루션",
  ],
  alternates: { canonical: "/consulting/diagnosis/hwang-bongnam" },
  openGraph: {
    title: "황봉남 멘토 | 헬스장·필라테스 운영 진단 솔루션 | 더그로우컴퍼니",
    description:
      "황봉남 멘토의 1:1 현장 진단으로 헬스장운영·필라테스운영을 개선합니다.",
    url: "/consulting/diagnosis/hwang-bongnam",
    type: "profile",
    images: ["/consultants/hwang-bongnam.jpg"],
  },
};

export default function DiagnosisConsultantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
