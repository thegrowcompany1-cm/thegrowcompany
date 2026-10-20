import type { Metadata } from "next";
import SalesOps from "./SalesOps";
import { SITE_URL } from "@/lib/site";

// 장소·정원·가격이 미정이고 결제 연동 전이라 아직 공개하지 않는다.
//  · robots: index/follow 모두 false
//  · 헤더 네비, /edu 허브, sitemap 어디에도 이 경로를 넣지 않았다.
//  · 공개할 때 아래 robots 를 지우고 app/sitemap.ts 의 ROUTES 에 경로를 더하면 된다.
const TITLE = "피트니스 성장 마스터키 세미나 | 그로우 에듀";
const DESCRIPTION =
  "운영과 세일즈, 센터 매출을 여는 두 개의 열쇠. 김재강 대표의 운영치트키와 황현진 대표의 매출치트키를 하루에 만나는 세미나입니다.";
const POSTER = "/edu/sales-ops/poster.jpg";

export const metadata: Metadata = {
  // layout 의 title.template("%s | 더그로우컴퍼니")를 타지 않게 absolute 로 둔다 — 안 그러면 사이트명이 두 번 붙는다.
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/edu/sales-ops" },
  // noindex 여도 카톡·인스타 링크 미리보기는 og 를 읽는다. 공개 전환은 아래 robots 만 지우면 된다.
  openGraph: {
    type: "website",
    url: `${SITE_URL}/edu/sales-ops`,
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: POSTER, width: 1500, height: 1875, alt: "피트니스 성장 마스터키 세미나 포스터" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [POSTER],
  },
  robots: { index: false, follow: false },
};

export default function SalesOpsPage() {
  return <SalesOps />;
}
