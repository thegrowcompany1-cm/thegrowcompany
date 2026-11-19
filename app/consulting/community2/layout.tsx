import type { Metadata } from "next";

// 광고·테스트용 세그먼트 랜딩 — 검색 제외, sitemap·헤더·메인·푸터 어디에도 링크하지 않는다.
export const metadata: Metadata = {
  title: "기업·호텔·공공기관 시설 위탁운영",
  description: "기업 사내 피트니스, 호텔 피트니스, 공공체육시설 위탁운영. 이용률을 만들고 보고서로 증명합니다.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
