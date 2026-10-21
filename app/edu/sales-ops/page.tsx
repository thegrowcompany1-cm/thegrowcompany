import type { Metadata } from "next";
import SalesOps from "./SalesOps";
import { SITE_URL } from "@/lib/site";

// 공개 상태 (2026-10-21~)
//  · robots 는 지정하지 않는다 → layout 기본값(index, follow). 광고 전용 /edu/sales-ops2·3 은 각 페이지에서 noindex 를 유지한다.
//  · app/sitemap.ts · 그로우 에듀 메뉴(Header) · /edu 허브 카드에 노출한다. 일자·장소·정원·가격은 lib/salesOps.ts 상수.
const TITLE = "피트니스 성장 마스터키 세미나 | 그로우 에듀";
const DESCRIPTION =
  "운영과 세일즈, 센터 매출을 여는 두 개의 열쇠. 김재강 대표의 운영치트키와 황현진 대표의 매출치트키를 하루에 만나는 세미나입니다.";
const POSTER = "/edu/sales-ops/poster.jpg";

export const metadata: Metadata = {
  // layout 의 title.template("%s | 더그로우컴퍼니")를 타지 않게 absolute 로 둔다 — 안 그러면 사이트명이 두 번 붙는다.
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/edu/sales-ops" },
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
};

export default function SalesOpsPage() {
  return <SalesOps />;
}
