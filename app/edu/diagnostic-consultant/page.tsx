import type { Metadata } from "next";
import DiagnosticConsultant from "./DiagnosticConsultant";

// 공개 페이지다. 그로우 에듀 카테고리 하위로 편입했다.
//  · 헤더 네비(PC 드롭다운 / 모바일 아코디언)와 /edu 허브 카드, sitemap 에 등록.
//  · 진단 솔루션 메뉴·허브에는 넣지 않는다 (교육 과정이지 컨설팅 상품이 아니다).
export const metadata: Metadata = {
  title: "진단 컨설턴트 양성과정 1기 | 그로우 에듀 | 더그로우컴퍼니",
  description:
    "배우고, 진단하고, 현장에서 검증하는 현장형 컨설턴트 양성과정 1기. 전문교육 5회 + 과제발표 3회 + 현장실습 1회, 최대 10명 선발.",
  alternates: { canonical: "/edu/diagnostic-consultant" },
};

export default function DiagnosticConsultantPage() {
  return <DiagnosticConsultant />;
}
