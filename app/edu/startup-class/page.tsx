import type { Metadata } from "next";
import StartupClass from "./StartupClass";

export const metadata: Metadata = {
  title: "창업 세미나 | 그로우 에듀 | 더그로우컴퍼니",
  description:
    "단 하루만에 끝내는 헬스장·필라테스 창업 노하우. 입지선정·인테리어·오픈 프리세일까지, 창업 200회 경험을 원데이 클래스로 공개합니다.",
};

export default function StartupClassPage() {
  return <StartupClass />;
}
