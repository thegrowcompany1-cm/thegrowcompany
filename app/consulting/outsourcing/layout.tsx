import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "헬스장·필라테스 위탁운영, 매장 상주 운영 컨설팅",
  description:
    "위탁운영 전문가가 직접 매장에 상주하며 헬스장운영·필라테스운영을 개선합니다. 매출이 오를 때까지 함께하는 더그로우컴퍼니 매장 위탁운영 컨설팅.",
  keywords: [
    "위탁운영",
    "헬스장운영",
    "필라테스운영",
    "매장 위탁운영",
    "헬스장 위탁운영",
    "필라테스 위탁운영",
  ],
  alternates: { canonical: "/consulting/outsourcing" },
  openGraph: {
    title: "헬스장·필라테스 위탁운영, 매장 상주 운영 컨설팅 | 더그로우컴퍼니",
    description:
      "위탁운영 전문가가 매장에 직접 상주하며 헬스장운영·필라테스운영을 개선합니다.",
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
