import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "아파트 커뮤니티 위탁운영 | 아파트 헬스장·커뮤니티 시설 운영" },
  description:
    "헬스장·필라테스를 직접 운영해 온 팀이 아파트 커뮤니티 시설의 프로그램, 인력, 수지까지 함께 맡습니다. 현장 실사와 운영 제안서는 무상입니다.",
  keywords: [
    "아파트 헬스장",
    "아파트 커뮤니티 헬스장",
    "시설 위탁운영",
    "위탁운영",
    "커뮤니티 피트니스 위탁운영",
  ],
  alternates: { canonical: "/consulting/community" },
  openGraph: {
    title: { absolute: "아파트 커뮤니티 위탁운영 | 아파트 헬스장·커뮤니티 시설 운영" },
    description:
      "아파트 커뮤니티 헬스장·필라테스를 직접 운영해 온 팀의 위탁운영. 프로그램, 인력, 수지까지 함께 맡습니다.",
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
