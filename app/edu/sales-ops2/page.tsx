import type { Metadata } from "next";
import SalesOps2 from "@/components/edu/SalesOps2";

// 리얼세일즈 측 기획안 시안을 그대로 옮긴 비공개 페이지다.
//  · robots: index/follow 모두 false
//  · 헤더 네비, /edu 허브, sitemap 어디에도 이 경로를 넣지 않았다.
export const metadata: Metadata = {
  title: "성장 마스터키 · 운영키 × 매출키",
  description: "11월 21일 공동 강의 신청 상세페이지 시안",
  robots: { index: false, follow: false },
};

export default function SalesOps2Page() {
  return <SalesOps2 />;
}
