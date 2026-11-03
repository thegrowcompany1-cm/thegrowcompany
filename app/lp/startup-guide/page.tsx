import type { Metadata } from "next";
import StartupGuideLp from "@/components/lp/StartupGuideLp";

// 메타 광고 전용 창업 불안 해소형 랜딩이다 (기획: startup-guide-copy.md).
//  · robots: index/follow 모두 false
//  · 헤더 네비(/lp/* 는 로고만), 세미나 팝업(/lp/ 제외), sitemap 어디에도 이 경로를 넣지 않았다.
//  · canonical 을 두지 않는다 (색인 대상이 아니다).
export const metadata: Metadata = {
  title: "헬스장·필라테스 창업 계획 검토",
  description:
    "헬스장·필라테스 창업 250회. 자본, 자리, 인테리어, 회원 모집, 운영까지 계약하기 전에 창업 계획을 함께 검토해 드립니다.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function StartupGuideLpPage() {
  return <StartupGuideLp />;
}
