import type { Metadata } from "next";
import EduHub from "./EduHub";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "그로우 에듀 | 더그로우컴퍼니",
  description:
    "체육시설업 종사자를 위한 성장 교육. 필라테스·헬스·PT·바레 현장에서 통하는 창업 세미나와 정규 FC 클래스를 제공합니다.",
};

// 세미나 2개 목록 구조화 데이터
const ITEM_LIST_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      url: `${SITE_URL}/edu/startup-class`,
      name: "창업 세미나",
    },
    {
      "@type": "ListItem",
      position: 2,
      url: `${SITE_URL}/edu/fc-class`,
      name: "정규 FC 클래스",
    },
  ],
};

// AEO 대응 FAQ 구조화 데이터
const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "그로우 에듀는 어떤 교육인가요",
      acceptedAnswer: {
        "@type": "Answer",
        text: "체육시설업(필라테스, 헬스, PT, 바레) 종사자를 위한 성장 교육입니다. 창업 세미나와 정규 FC 클래스를 운영합니다.",
      },
    },
  ],
};

export default function EduPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ITEM_LIST_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
      <EduHub />
    </>
  );
}
