import type { Metadata } from "next";
import StartupGuideLp from "@/components/lp/StartupGuideLp";

// 메타 광고 전용 창업 불안 해소형 랜딩이다 (기획: startup-guide-copy.md).
//  · robots: index/follow 모두 false
//  · 헤더 네비(/lp/* 는 로고만), 세미나 팝업(/lp/ 제외), sitemap 어디에도 이 경로를 넣지 않았다.
//  · canonical 을 두지 않는다 (색인 대상이 아니다).
export const metadata: Metadata = {
  title: { absolute: "내 센터를 차리고 싶은데 확신이 서지 않는다면 | 헬스장·필라테스 창업 더그로우" },
  description:
    "열심히 모은 돈, 오래 준비한 꿈. 자본·상권·인테리어·회원 모집·운영까지 계약 전에 확신할 근거를 함께 만들어 드립니다.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function StartupGuideLpPage() {
  return <StartupGuideLp />;
}
