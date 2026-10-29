import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "이석훈 멘토 | 센터 운영시스템·데이터 AI 운영 진단" },
  description:
    "매출은 오르는데 통장에 남는 돈이 없다면. 이석훈 멘토가 매출·선수금 구조, 회원 이탈, 강사 정산, 대표 없이 돌아가는 운영 루틴을 데이터로 점검합니다. 더그로우컴퍼니 진단 솔루션.",
  keywords: ["헬스장 운영", "센터 운영시스템", "선수금", "회원 이탈 관리", "강사 정산", "바디코디", "이석훈 멘토"],
  alternates: { canonical: "/consulting/diagnosis/lee-seokhoon" },
  openGraph: {
    title: "이석훈 멘토 | 센터 운영시스템·데이터 AI 운영 진단",
    description:
      "센터 안에서 새는 돈을 데이터로 찾아드립니다. 이석훈 멘토의 운영 진단.",
    url: "/consulting/diagnosis/lee-seokhoon",
    type: "profile",
    images: ["/consultants/lee-seokhun.png"],
  },
};

export default function DiagnosisMentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
