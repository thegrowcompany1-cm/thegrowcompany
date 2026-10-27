import type { Metadata } from "next";
import DiagnosticConsultant from "./DiagnosticConsultant";
import { DCC_END_ISO, DCC_OPEN_KO, DCC_START_ISO } from "@/lib/dccSchedule";

// 공개 페이지다. 그로우 에듀 카테고리 하위로 편입했다.
//  · 헤더 네비(PC 드롭다운 / 모바일 아코디언)와 /edu 허브 카드, sitemap 에 등록.
//  · 진단 솔루션 메뉴·허브에는 넣지 않는다 (교육 과정이지 컨설팅 상품이 아니다).
//  · 개강·종강 날짜는 lib/dccSchedule.ts 한 곳에서 가져온다.
export const metadata: Metadata = {
  title: "진단 컨설턴트 양성과정 1기 | 그로우 에듀 | 더그로우컴퍼니",
  description: `배우고, 진단하고, 현장에서 검증하는 현장형 컨설턴트 양성과정 1기. 전문교육 5회 + 과제발표 3회 + 현장실습 1회, 최대 10명 선발, ${DCC_OPEN_KO} 개강.`,
  alternates: { canonical: "/edu/diagnostic-consultant" },
};

const COURSE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "진단 컨설턴트 양성과정 1기",
  description: "배우고, 진단하고, 현장에서 검증하는 현장형 컨설턴트 양성과정. 전문교육 5회 + 과제발표 3회 + 현장실습 1회.",
  provider: { "@type": "Organization", name: "더그로우컴퍼니", sameAs: "https://www.thegrowcompany.kr" },
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "onsite",
    startDate: DCC_START_ISO,
    endDate: DCC_END_ISO,
  },
};

export default function DiagnosticConsultantPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(COURSE_SCHEMA) }} />
      <DiagnosticConsultant />
    </>
  );
}
