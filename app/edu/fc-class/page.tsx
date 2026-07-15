import type { Metadata } from "next";
import FcClass from "./FcClass";

export const metadata: Metadata = {
  title: "정규 FC 클래스 | 그로우 에듀 | 더그로우컴퍼니",
  description:
    "매출에 관련된 모든 것 — 고객관리·상담·재등록·서비스·관리시스템·마케팅을 현장 전문가 2인이 직강하는 그로우 아카데미 정규 FC 클래스.",
};

export default function FCClassPage() {
  return <FcClass />;
}
