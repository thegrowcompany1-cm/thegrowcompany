import type { Metadata } from "next";

// 검색 노출 허용(2026-11-11 공개). canonical 은 자기 경로, sitemap.ts 에 등록되어 있다.
export const metadata: Metadata = {
  title: "헬스장·필라테스 인수창업 컨설팅 | 더그로우컴퍼니",
  description:
    "매물로 나온 헬스장·필라테스, 이 가격에 들어가도 되는지 권리금·회원 승계·실제 매출을 계약 전에 같이 확인합니다.",
  alternates: { canonical: "/consulting/startup/takeover" },
};

export default function StartupTakeoverLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
