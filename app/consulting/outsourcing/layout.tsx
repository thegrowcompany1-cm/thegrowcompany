import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "헬스장·필라테스 위탁운영 | 더그로우컴퍼니",
  description:
    "헬스장 위탁·필라테스 위탁 전문가가 1개월 동안 매장에 직접 상주합니다. 회원 모집부터 상담·등록, 운영까지 함께 실행하는 더그로우컴퍼니 위탁운영. 무료 방문 진단을 신청해 보세요.",
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
      "헬스장 위탁·필라테스 위탁 전문가가 매장에 직접 상주하며 회원 모집부터 상담·등록, 운영까지 함께 실행합니다.",
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
