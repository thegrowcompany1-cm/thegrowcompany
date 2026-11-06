import type { Metadata } from "next";

// 메인 노출 전까지 색인하지 않는다. canonical·sitemap 에도 넣지 않는다.
export const metadata: Metadata = {
  title: "헬스장·필라테스 인수창업 컨설팅 | 더그로우컴퍼니",
  description:
    "매물로 나온 헬스장·필라테스, 이 가격에 들어가도 되는지 권리금·회원 승계·실제 매출을 계약 전에 같이 확인합니다.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function StartupTakeoverLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
