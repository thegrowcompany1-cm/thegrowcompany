import type { Metadata } from "next";
import DiagnosticConsultant from "./DiagnosticConsultant";

// 공개 전까지 비노출 페이지다.
//  · robots: index/follow 모두 false
//  · 네비(PC 드롭다운/모바일 아코디언), /edu 허브, 메인 그리드, sitemap 어디에도
//    이 경로를 추가하지 않았다. 링크를 아는 사람만 들어올 수 있다.
//  · 공개 시에는 아래 robots 를 지우고 app/sitemap.ts 의 ROUTES 에 경로를 더하면 된다.
export const metadata: Metadata = {
  title: "진단 컨설턴트 양성과정 1기 | 그로우 에듀 | 더그로우컴퍼니",
  description:
    "배우고, 진단하고, 현장에서 검증하는 현장형 컨설턴트 양성과정 1기. 전문교육 5회 + 과제발표 3회 + 현장실습 1회, 최대 10명 선발.",
  robots: { index: false, follow: false },
};

export default function DiagnosticConsultantPage() {
  return <DiagnosticConsultant />;
}
