import type { Metadata } from "next";
import GxClass from "./GxClass";

// 공개 페이지 — 헤더 드롭다운 · 에듀 허브 · sitemap 에 노출된다.
// TODO: JSON-LD(Course) 추가
export const metadata: Metadata = {
  title: "그룹운동 비즈니스 클래스 | 그로우 에듀 | 더그로우컴퍼니",
  description:
    "체험은 오는데 등록이 안 되는 그룹운동 센터를 위한 4시간 특강. 신규 전환율 48.4%, 재등록률 63%를 만든 운영 구조를 다룹니다.",
};

export default function GxClassPage() {
  return <GxClass />;
}
