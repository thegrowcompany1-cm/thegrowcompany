import type { Metadata } from "next";

// 광고 A/B 실험용 신규 랜딩(B안). 원본(/consulting/outsourcing)과 중복 노출되지 않도록 색인하지 않는다.
//  · robots: index/follow 모두 false, canonical 없음, sitemap 에도 넣지 않는다.
export const metadata: Metadata = {
  title: "헬스장·필라테스 위탁운영 무료 진단 | 더그로우컴퍼니",
  description:
    "헬스장·필라테스 1개월 현장 상주 위탁운영. 회원 모집부터 상담·등록, 운영까지 함께 실행합니다. 무료 방문 진단을 신청해 보세요.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function OutsourcingV2Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
