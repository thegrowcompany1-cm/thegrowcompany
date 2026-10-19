// ─────────────────────────────────────────────────────────────────────────────
// 관리자 — GA 분석 탭
//
//  · 서버 컴포넌트. 접근 제어는 /admin 과 같은 requireAdmin() 한 줄 (권한이 없으면 404).
//  · 데이터는 클라이언트가 /api/admin/ga/* 를 호출해 가져온다. 그 라우트가 서버에서
//    GA4 Data API 를 부르므로 서비스 계정 키는 브라우저로 나가지 않는다.
// ─────────────────────────────────────────────────────────────────────────────

import { Suspense } from "react";
import type { Metadata } from "next";
import { requireAdmin } from "../_lib/guard";
import AdminTabs from "../_components/AdminTabs";
import GaDashboard from "./GaDashboard";

export const metadata: Metadata = {
  title: { absolute: "GA 분석 | 관리자 | 더그로우컴퍼니" },
  robots: { index: false, follow: false },
};

export default async function AdminGaPage() {
  const { email } = await requireAdmin();

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-4">
          <h1 className="text-2xl font-black sm:text-3xl">관리자 대시보드</h1>
          <p className="mt-1.5 text-sm text-gray-400">{email} · 모든 시각은 KST 기준입니다</p>
        </header>
        <AdminTabs active="ga" />
        <Suspense fallback={null}>
          <GaDashboard />
        </Suspense>
      </div>
    </main>
  );
}
