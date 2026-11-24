// ─────────────────────────────────────────────────────────────────────────────
// 관리자 — 그로우 에듀 "오픈 알림" 신청 목록 (/admin/notify)
//
//  · 서버 컴포넌트. 접근 제어는 requireAdmin() 한 줄(ADMIN_EMAILS) — 권한이 없으면 404.
//  · 테이블 edu_notify 는 RLS 가 켜져 있고 정책이 없다. service role 로만 읽힌다(키가 없으면 빈 목록 + 경고).
//  · 최신순 목록 · 과정 필터(?course=) · CSV 다운로드(/admin/notify/export). 연락처는 기본 마스킹, 클릭하면 전체.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "../_lib/guard";
import { kstDateTime, maskPhone, formatPhone, num } from "../_lib/format";
import { loadNotifies, countNotifies } from "../_lib/eduNotify";
import AdminTabs from "../_components/AdminTabs";
import PhoneCell from "../PhoneCell";
import { EDU_NOTIFY_COURSES, EDU_NOTIFY_COURSE_LABEL, isEduNotifyCourse } from "@/lib/eduNotify";

export const metadata: Metadata = {
  title: { absolute: "오픈 알림 | 관리자 | 더그로우컴퍼니" },
  robots: { index: false, follow: false },
};

const GREEN = "#22B573";
/** 화면에 불러오는 최대 건수 — 전체는 CSV 로 받는다 */
const TABLE_LIMIT = 500;

export default async function NotifyAdminPage({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  const ctx = await requireAdmin();
  const { course: courseParam } = await searchParams;
  const course = isEduNotifyCourse(courseParam) ? courseParam : null;

  const [{ rows, error }, { counts, error: countError }] = await Promise.all([
    loadNotifies(ctx, course, TABLE_LIMIT),
    countNotifies(ctx),
  ]);
  const total = EDU_NOTIFY_COURSES.reduce((a, c) => a + (counts[c] ?? 0), 0);
  const issues = [error, countError].filter(Boolean) as string[];

  const card = "rounded-2xl border border-white/10 bg-[#141414] p-5";
  const chip = (on: boolean) =>
    "rounded-full border px-4 py-2 text-[13px] font-bold transition-colors " +
    (on ? "border-[#22B573] bg-[#22B573] text-white" : "border-white/15 text-gray-300 hover:border-white/40 hover:text-white");
  const exportHref = course ? `/admin/notify/export?course=${course}` : "/admin/notify/export";

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6">
          <h1 className="text-2xl font-black sm:text-3xl">관리자 대시보드</h1>
          <p className="mt-1.5 text-sm text-gray-400">{ctx.email} · 모든 시각은 KST 기준입니다</p>
        </header>
        <AdminTabs active="notify" />

        {!ctx.usingServiceRole && (
          <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-200">
            <b className="font-bold">SUPABASE_SERVICE_ROLE_KEY 가 설정되지 않았습니다.</b>
            <br />
            오픈 알림 테이블은 service role 로만 읽을 수 있어 지금은 목록이 비어 있습니다.
          </div>
        )}
        {issues.length > 0 && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm leading-relaxed text-red-200">
            <b className="font-bold">조회에 실패했습니다.</b>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {issues.map((m) => (
                <li key={m} className="break-all">
                  {m}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[12px] text-red-300">
              테이블이 아직 없다면 supabase/migrations/20261124_edu_notify.sql 을 먼저 적용해주세요.
            </p>
          </div>
        )}

        {/* 과정별 건수 */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <div className={card}>
            <p className="text-[12px] font-bold text-gray-400">전체</p>
            <p className="mt-2 text-3xl font-black" style={{ color: GREEN }}>
              {num(total)}
              <span className="ml-1 text-base font-bold text-gray-300">건</span>
            </p>
          </div>
          {EDU_NOTIFY_COURSES.map((c) => (
            <div key={c} className={card}>
              <p className="text-[12px] font-bold text-gray-400">{EDU_NOTIFY_COURSE_LABEL[c]}</p>
              <p className="mt-2 text-3xl font-black" style={{ color: GREEN }}>
                {num(counts[c] ?? 0)}
                <span className="ml-1 text-base font-bold text-gray-300">건</span>
              </p>
            </div>
          ))}
        </section>

        {/* 목록 */}
        <section className={`${card} mt-6 mb-10`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2" role="group" aria-label="과정 필터">
              <Link href="/admin/notify" className={chip(!course)} aria-current={!course ? "true" : undefined}>
                전체
              </Link>
              {EDU_NOTIFY_COURSES.map((c) => (
                <Link
                  key={c}
                  href={`/admin/notify?course=${c}`}
                  className={chip(course === c)}
                  aria-current={course === c ? "true" : undefined}
                >
                  {EDU_NOTIFY_COURSE_LABEL[c]}
                </Link>
              ))}
            </div>
            <a href={exportHref} className="rounded-full px-4 py-2 text-[13px] font-bold text-white" style={{ backgroundColor: GREEN }}>
              CSV 다운로드
            </a>
          </div>

          {rows.length >= TABLE_LIMIT && (
            <p className="mb-3 rounded-lg bg-white/5 px-3 py-2 text-[12px] text-gray-400">
              최근 {num(TABLE_LIMIT)}건만 불러왔습니다. 전체 명단은 CSV 다운로드를 이용해주세요.
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-white/10 text-[12px] text-gray-400">
                  <th className="px-3 py-2.5 font-bold">접수일</th>
                  <th className="px-3 py-2.5 font-bold">과정</th>
                  <th className="px-3 py-2.5 font-bold">성함</th>
                  <th className="px-3 py-2.5 font-bold">연락처</th>
                  <th className="px-3 py-2.5 font-bold">이메일</th>
                  <th className="px-3 py-2.5 font-bold">지역</th>
                  <th className="px-3 py-2.5 font-bold">직책</th>
                  <th className="px-3 py-2.5 font-bold">광고수신동의</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-10 text-center text-gray-500">
                      접수된 신청이 없습니다.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="border-b border-white/5 align-top hover:bg-white/[0.03]">
                      <td className="whitespace-nowrap px-3 py-2.5 text-gray-300">{kstDateTime(r.created_at)}</td>
                      <td className="whitespace-nowrap px-3 py-2.5">
                        {isEduNotifyCourse(r.course) ? EDU_NOTIFY_COURSE_LABEL[r.course] : r.course}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 font-bold">{r.name}</td>
                      <td className="whitespace-nowrap px-3 py-2.5">
                        <PhoneCell masked={maskPhone(r.phone)} full={formatPhone(r.phone)} />
                      </td>
                      <td className="px-3 py-2.5 break-all text-gray-300">{r.email || "-"}</td>
                      <td className="px-3 py-2.5 text-gray-300">{r.region || "-"}</td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-gray-300">{r.role || "-"}</td>
                      <td className="whitespace-nowrap px-3 py-2.5">
                        {r.marketing_agree ? <span style={{ color: GREEN }}>동의</span> : <span className="text-gray-500">미동의</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
