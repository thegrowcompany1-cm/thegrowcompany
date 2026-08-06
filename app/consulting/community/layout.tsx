import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "아파트 헬스장·커뮤니티 시설 위탁운영 | 더그로우컴퍼니",
  description:
    "아파트, 기업, 공공기관 커뮤니티 헬스장 위탁운영 전문. 시설 기획부터 운영까지 더그로우컴퍼니가 책임집니다.",
  keywords: [
    "아파트 헬스장",
    "아파트 커뮤니티 헬스장",
    "시설 위탁운영",
    "위탁운영",
    "커뮤니티 피트니스 위탁운영",
  ],
  alternates: { canonical: "/consulting/community" },
  openGraph: {
    title: "아파트 헬스장·커뮤니티 시설 위탁운영 | 더그로우컴퍼니",
    description:
      "아파트 헬스장·아파트 커뮤니티 헬스장부터 기업·공공기관까지, 더그로우컴퍼니의 시설 위탁운영 솔루션.",
    url: "/consulting/community",
    type: "website",
    images: ["/wt/community.png"],
  },
};

export default function CommunityConsultingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
