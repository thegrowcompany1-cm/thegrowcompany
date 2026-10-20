import type { Metadata } from "next";

export const metadata: Metadata = {
  // layout 의 title.template 이 사이트명을 또 붙이지 않게 absolute 로 둔다
  title: { absolute: "황현진 멘토 | 헬스장·필라테스 상담·세일즈 진단 솔루션" },
  description:
    "세일즈작가 황현진의 1:1 진단으로 상담 등록률과 재등록을 바꿉니다. 센터 맞춤 상담 대본을 함께 씁니다. 더그로우컴퍼니 진단 솔루션.",
  keywords: ["헬스장 상담", "PT 세일즈", "필라테스 상담", "세일즈 화법", "진단 솔루션", "황현진"],
  alternates: { canonical: "/consulting/diagnosis/hwang-hyunjin" },
  openGraph: {
    title: "황현진 멘토 | 헬스장·필라테스 상담·세일즈 진단 솔루션",
    description:
      "세일즈작가 황현진의 1:1 진단으로 상담 등록률과 재등록을 바꿉니다. 센터 맞춤 상담 대본을 함께 씁니다.",
    url: "/consulting/diagnosis/hwang-hyunjin",
    type: "profile",
    images: ["/consultants/hwang-hyunjin.png"],
  },
};

export default function DiagnosisConsultantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
