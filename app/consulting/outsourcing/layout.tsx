import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "헬스장·필라테스 위탁운영 | 더그로우컴퍼니",
  description:
    "헬스장 위탁·필라테스 위탁 전문가가 매장에 직접 상주합니다. 헬스장 위탁운영으로 매출이 오를 때까지 함께하는 더그로우컴퍼니 컨설팅.",
  keywords: [
    "헬스장 위탁",
    "필라테스 위탁",
    "헬스장 위탁운영",
    "위탁운영",
    "매장 위탁운영",
  ],
  alternates: { canonical: "/consulting/outsourcing" },
  openGraph: {
    title: "헬스장·필라테스 위탁운영 | 더그로우컴퍼니",
    description:
      "헬스장 위탁·필라테스 위탁 전문가가 매장에 직접 상주하며 헬스장 위탁운영으로 매출을 끌어올립니다.",
    url: "/consulting/outsourcing",
    type: "website",
    images: ["/wt/wt.png"],
  },
};

export default function OutsourcingConsultingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
