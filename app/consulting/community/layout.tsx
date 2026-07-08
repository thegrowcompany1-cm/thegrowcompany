import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "기업·아파트 커뮤니티 피트니스 시설 위탁운영",
  description:
    "아파트·기업·공공기관·호텔 커뮤니티 피트니스 시설 위탁운영. 진단·기획·운영·교육을 한 회사에서 제공하는 더그로우컴퍼니 시설 위탁운영 컨설팅.",
  keywords: [
    "위탁운영",
    "시설 위탁운영",
    "커뮤니티 피트니스 위탁운영",
    "아파트 피트니스 위탁",
    "기업 피트니스 위탁",
  ],
  alternates: { canonical: "/consulting/community" },
  openGraph: {
    title: "기업·아파트 커뮤니티 피트니스 시설 위탁운영 | 더그로우컴퍼니",
    description:
      "아파트·기업·공공기관·호텔 커뮤니티 피트니스 시설 위탁운영 전문 컨설팅.",
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
