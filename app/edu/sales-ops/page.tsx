import type { Metadata } from "next";
import SalesOps from "./SalesOps";

// 아직 영상 섹션만 있는 미완성 페이지다. 그래서 검색에 노출하지 않는다.
//  · robots: index/follow 모두 false
//  · 헤더 네비, /edu 허브, sitemap 어디에도 이 경로를 넣지 않았다.
//  · 커리큘럼·강사 소개 등 나머지 섹션이 채워져 공개할 때 아래 robots 를 지우고
//    app/sitemap.ts 의 ROUTES 에 경로를 더하면 된다.
export const metadata: Metadata = {
  title: "황현진 대표의 세일즈 화법 | 그로우 에듀 | 더그로우컴퍼니",
  description: "황현진 대표의 세일즈 화법을 영상으로 먼저 만나보세요.",
  robots: { index: false, follow: false },
};

export default function SalesOpsPage() {
  return <SalesOps />;
}
