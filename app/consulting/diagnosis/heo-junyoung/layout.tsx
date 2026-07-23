import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "헬스장·필라테스 마케팅 컨설팅 | 더그로우컴퍼니",
  description:
    "허준영 컨설턴트의 헬스장 마케팅·필라테스 마케팅 1:1 진단. 광고보다 구조를 바꿔 매출로 이어지는 마케팅을 설계합니다.",
  keywords: [
    "헬스장 마케팅",
    "필라테스 마케팅",
    "헬스장운영",
    "필라테스운영",
    "허준영 컨설턴트",
  ],
  alternates: { canonical: "/consulting/diagnosis/heo-junyoung" },
  openGraph: {
    title: "헬스장·필라테스 마케팅 컨설팅 | 더그로우컴퍼니",
    description:
      "허준영 컨설턴트의 헬스장 마케팅·필라테스 마케팅 1:1 진단으로 매출로 이어지는 구조를 설계합니다.",
    url: "/consulting/diagnosis/heo-junyoung",
    type: "profile",
    images: ["/consultants/heo-junyoung.jpg"],
  },
};

export default function DiagnosisConsultantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
