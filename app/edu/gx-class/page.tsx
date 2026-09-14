import type { Metadata } from "next";
import GxClass from "./GxClass";

// 카피 확정 전 기본값 — 확정 시 description 교체. JSON-LD(Course)는 일정 확정 후 추가.
export const metadata: Metadata = {
  title: "그룹운동 비즈니스 클래스 | 그로우 에듀 | 더그로우컴퍼니",
  description: "[메타 설명 — 그룹운동 비즈니스 클래스 소개 1~2문장]",
};

export default function GxClassPage() {
  return <GxClass />;
}
