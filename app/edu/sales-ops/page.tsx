import type { Metadata } from "next";
import SalesOps from "./SalesOps";

// 장소·정원·가격이 미정이고 결제 연동 전이라 아직 공개하지 않는다.
//  · robots: index/follow 모두 false
//  · 헤더 네비, /edu 허브, sitemap 어디에도 이 경로를 넣지 않았다.
//  · 공개할 때 아래 robots 를 지우고 app/sitemap.ts 의 ROUTES 에 경로를 더하면 된다.
export const metadata: Metadata = {
  title: "피트니스 성장 마스터키 세미나 | 그로우 에듀 | 더그로우컴퍼니",
  description:
    "운영과 세일즈, 센터 매출을 여는 두 개의 열쇠. 김재강 대표의 운영치트키와 황현진 대표의 매출치트키를 하루에 만나는 세미나입니다.",
  robots: { index: false, follow: false },
};

export default function SalesOpsPage() {
  return <SalesOps />;
}
