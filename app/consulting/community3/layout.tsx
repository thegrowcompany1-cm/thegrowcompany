import type { Metadata } from "next";

// 광고·테스트용 세그먼트 랜딩 — 검색 제외, sitemap·헤더·메인·푸터 어디에도 링크하지 않는다.
export const metadata: Metadata = {
  title: "대학교 체육시설 위탁운영",
  description: "학기와 방학에 맞춘 대학교 체육시설 위탁운영. 리뉴얼부터 프로그램, 운영까지 한 팀이 맡습니다.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
