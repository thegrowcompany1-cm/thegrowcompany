import type { Metadata } from "next";

// 검색 노출 허용(2026-11-11 공개). canonical 은 자기 경로, sitemap.ts 에 등록되어 있다.
export const metadata: Metadata = {
  title: "헬스장·필라테스 입지·상권 분석 컨설팅 | 더그로우컴퍼니",
  description:
    "후보지 비교부터 임대 조건 협상, 계약 동행까지. 헬스장·필라테스 자리 하나만 제대로 골라 드립니다.",
  alternates: { canonical: "/consulting/startup/location" },
};

export default function StartupLocationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
