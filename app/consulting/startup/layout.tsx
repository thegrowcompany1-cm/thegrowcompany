import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "헬스장 창업·필라테스 창업 컨설팅",
  description:
    "헬스장창업·필라테스창업부터 피트니스 인테리어까지. 오픈 이후에도 살아남는 운영 구조를 설계하는 더그로우컴퍼니 창업 컨설팅.",
  keywords: [
    "헬스장창업",
    "필라테스창업",
    "피트니스 인테리어",
    "헬스장 창업 컨설팅",
    "필라테스 창업 컨설팅",
  ],
  alternates: { canonical: "/consulting/startup" },
  openGraph: {
    title: "헬스장 창업·필라테스 창업 컨설팅 | 더그로우컴퍼니",
    description:
      "헬스장창업·필라테스창업, 피트니스 인테리어 전문 컨설팅. 오픈 이후 살아남는 구조를 설계합니다.",
    url: "/consulting/startup",
    type: "website",
    images: ["/startup/startup50.png"],
  },
};

export default function StartupConsultingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
