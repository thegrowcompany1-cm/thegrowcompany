import type { Metadata } from "next";

export const metadata: Metadata = {
  // layout 의 title.template 이 사이트명을 또 붙이지 않게 absolute 로 둔다
  title: { absolute: "박국진 컨설턴트 | 사업장 정책자금·신용보증·기술보증 자금진단" },
  description:
    "정책자금·신용보증·기술보증, 우리 사업장이 받을 수 있는지부터 확인합니다. 박국진 컨설턴트의 자금진단. 더그로우컴퍼니 진단 솔루션.",
  keywords: ["정책자금", "신용보증기금", "기술보증기금", "사업자 대출", "자금진단", "박국진"],
  alternates: { canonical: "/consulting/diagnosis/park-gukjin" },
  openGraph: {
    title: "박국진 컨설턴트 | 사업장 정책자금·신용보증·기술보증 자금진단",
    description: "정책자금·신용보증·기술보증, 우리 사업장이 받을 수 있는지부터 확인합니다.",
    url: "/consulting/diagnosis/park-gukjin",
    type: "profile",
    images: ["/consultants/park-gukjin.jpg"],
  },
};

export default function DiagnosisConsultantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
