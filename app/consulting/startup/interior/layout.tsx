import type { Metadata } from "next";

// 메인 노출 전까지 색인하지 않는다. canonical·sitemap 에도 넣지 않는다.
export const metadata: Metadata = {
  title: "그로우 인테리어 - 피트니스 전문 인테리어 | 더그로우컴퍼니",
  description:
    "매출 동선 설계부터 직접 시공, 기구 연결까지. 헬스장·필라테스만 시공해 온 팀이 맡습니다.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function StartupInteriorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
