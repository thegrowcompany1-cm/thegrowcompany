import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "김재강 멘토 | 헬스장·필라테스 운영 진단 솔루션",
  description:
    "김재강 멘토의 1:1 현장 진단으로 헬스장운영·필라테스운영을 개선합니다. FC운영·리더십 중심의 더그로우컴퍼니 진단 솔루션.",
  keywords: [
    "헬스장운영",
    "필라테스운영",
    "진단 솔루션",
    "김재강 멘토",
    "피트니스 운영 솔루션",
  ],
  alternates: { canonical: "/consulting/diagnosis/kim-jaegang" },
  openGraph: {
    title: "김재강 멘토 | 헬스장·필라테스 운영 진단 솔루션 | 더그로우컴퍼니",
    description:
      "김재강 멘토의 1:1 현장 진단으로 헬스장운영·필라테스운영을 개선합니다.",
    url: "/consulting/diagnosis/kim-jaegang",
    type: "profile",
    images: ["/consultants/kim-jaegang.jpg"],
  },
};

export default function DiagnosisConsultantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
