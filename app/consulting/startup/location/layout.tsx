import type { Metadata } from "next";

// 메인 노출 전까지 색인하지 않는다. canonical·sitemap 에도 넣지 않는다.
export const metadata: Metadata = {
  title: "헬스장·필라테스 입지·상권 분석 컨설팅 | 더그로우컴퍼니",
  description:
    "후보지 비교부터 임대 조건 협상, 계약 동행까지. 헬스장·필라테스 자리 하나만 제대로 골라 드립니다.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function StartupLocationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
