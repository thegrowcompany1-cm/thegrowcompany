import type { Metadata } from "next";
import EduHub from "./EduHub";

export const metadata: Metadata = {
  title: "그로우 에듀 | 더그로우컴퍼니",
  description:
    "체육시설업 종사자를 위한 성장 교육. 필라테스·헬스·PT·바레 현장에서 통하는 창업 세미나와 정규 FC 클래스를 제공합니다.",
};

export default function EduPage() {
  return <EduHub />;
}
