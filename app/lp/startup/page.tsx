import type { Metadata } from "next";
import StartupLp from "@/components/lp/StartupLp";

// 메타 광고 전용 창업솔루션 랜딩이다.
//  · robots: index/follow 모두 false
//  · 헤더 네비, 허브, 푸터, sitemap 어디에도 이 경로를 넣지 않았다.
//  · canonical 을 두지 않는다 (색인 대상이 아니다).
export const metadata: Metadata = {
  title: "헬스장·필라테스 창업 솔루션",
  description:
    "헬스장·필라테스 창업 300회. 입지 선정부터 오픈세일 현장 상주까지, 한 팀이 끝까지 갑니다.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function StartupLpPage() {
  return <StartupLp />;
}
