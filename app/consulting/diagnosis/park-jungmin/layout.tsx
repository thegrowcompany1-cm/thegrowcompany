import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "박정민 멘토 | 헬스장·필라테스 운영 진단 솔루션",
  description:
    "박정민 멘토의 1:1 현장 진단으로 헬스장운영·필라테스운영을 개선합니다. FC운영·PT 중심의 더그로우컴퍼니 진단 솔루션.",
  keywords: [
    "헬스장운영",
    "필라테스운영",
    "진단 솔루션",
    "박정민 멘토",
    "피트니스 운영 솔루션",
  ],
  alternates: { canonical: "/consulting/diagnosis/park-jungmin" },
  openGraph: {
    title: "박정민 멘토 | 헬스장·필라테스 운영 진단 솔루션 | 더그로우컴퍼니",
    description:
      "박정민 멘토의 1:1 현장 진단으로 헬스장운영·필라테스운영을 개선합니다.",
    url: "/consulting/diagnosis/park-jungmin",
    type: "profile",
    images: ["/consultants/park-jungmin.png"],
  },
};

export default function DiagnosisConsultantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
