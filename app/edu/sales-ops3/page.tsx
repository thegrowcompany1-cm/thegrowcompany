import type { Metadata } from "next";
import SalesOps3 from "@/components/edu/SalesOps3";

// 같은 세미나를 다른 구성(후킹 → 문제 구체화 → 증거 → 수강 결과물 → 결제)으로 짠 전환율 비교용 테스트 랜딩이다.
//  · robots: index/follow 모두 false
//  · 헤더 네비, /edu 허브, sitemap 어디에도 이 경로를 넣지 않았다.
export const metadata: Metadata = {
  title: "피트니스 성장 마스터키 세미나 | 그로우 에듀 | 더그로우컴퍼니",
  description:
    "운영과 세일즈, 센터 매출을 여는 두 개의 열쇠. 김재강 대표의 운영치트키와 황현진 대표의 매출치트키를 하루에 만나는 세미나입니다.",
  robots: { index: false, follow: false },
};

export default function SalesOps3Page() {
  return <SalesOps3 />;
}
