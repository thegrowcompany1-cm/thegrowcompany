// ─────────────────────────────────────────────────────────────────────────────
// 관리자 대시보드 — 회원 현황
//
//  · 서버 컴포넌트. 모든 조회는 서버에서만 일어나고, 클라이언트로 내려가는 것은
//    이미 가공된 표시용 문자열뿐이다. SUPABASE_SERVICE_ROLE_KEY 는 이 파일과
//    _lib/ 밖으로 나가지 않는다.
//  · 접근 제어는 requireAdmin() 한 줄. 권한이 없으면 notFound() 로 404 다.
//  · 결제·주문은 구글시트에서 관리하므로 이 화면에서는 다루지 않는다.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { requireAdmin } from "./_lib/guard";
import { loadMembers, countActiveSince } from "./_lib/members";
import {
  kstDateTime,
  kstDateKey,
  kstDayStart,
  kstRecentDays,
  maskPhone,
  formatPhone,
  num,
} from "./_lib/format";
import MembersTable, { type MemberRow } from "./MembersTable";

export const metadata: Metadata = {
  title: { absolute: "관리자 | 더그로우컴퍼니" },
  robots: { index: false, follow: false },
};

// 이 페이지는 requireAdmin() 안에서 cookies() 를 읽으므로 Next 가 자동으로
// 동적 렌더로 잡는다. 빌드 출력에 f(dynamic) 로 찍히는지로 확인한다.

const GREEN = "#22B573";
const CHART_DAYS = 30;
/** 차트 계산을 위해 한 번에 읽는 행 수 상한 */
const SCAN_LIMIT = 5000;
/** 표에 넘기는 회원 수 상한 — 전체는 CSV 로 받는다 */
const TABLE_LIMIT = 500;

export default async function AdminPage() {
  const ctx = await requireAdmin();
  const { email, db, usingServiceRole } = ctx;

  const issues: string[] = [];
  const note = (label: string, message?: string) => {
    if (message) issues.push(`${label}: ${message}`);
  };

  // ── 가입자 집계 ───────────────────────────────────────────────────────────
  const live = () =>
    db.from("profiles").select("*", { count: "exact", head: true }).is("deleted_at", null);

  const [totalRes, todayRes, weekRes, monthRes, pendingRes] = await Promise.all([
    live(),
    live().gte("created_at", kstDayStart(0).toISOString()),
    live().gte("created_at", kstDayStart(6).toISOString()),
    live().gte("created_at", kstDayStart(29).toISOString()),
    db.from("profiles").select("*", { count: "exact", head: true }).not("deleted_at", "is", null),
  ]);

  note("전체 가입자", totalRes.error?.message);
  note("오늘 가입자", todayRes.error?.message);
  note("최근 7일", weekRes.error?.message);
  note("최근 30일", monthRes.error?.message);
  note("탈퇴 예정", pendingRes.error?.message);

  const pendingDeletion = pendingRes.count ?? 0;

  // ── 회원 목록 (auth.users 결합) ───────────────────────────────────────────
  const {
    members,
    authAvailable,
    truncated,
    issues: memberIssues,
  } = await loadMembers(ctx, TABLE_LIMIT);
  issues.push(...memberIssues);

  // 최근 7일 로그인 — auth.users 의 last_sign_in_at 기준이라 결합이 돼야 셀 수 있다.
  // 표에 불러온 범위(TABLE_LIMIT) 안에서 센 값이다.
  const activeWeek = authAvailable ? countActiveSince(members, kstDayStart(6)) : null;

  const kpis: { label: string; value: number | null; hint?: string }[] = [
    { label: "전체 가입자", value: totalRes.count ?? 0 },
    { label: "오늘", value: todayRes.count ?? 0 },
    { label: "최근 7일", value: weekRes.count ?? 0 },
    { label: "최근 30일", value: monthRes.count ?? 0 },
    {
      label: "최근 7일 로그인",
      value: activeWeek,
      hint: authAvailable ? undefined : "service role 키 필요",
    },
  ];

  // ── 일별 가입 추이 (최근 30일) ────────────────────────────────────────────
  const trendRes = await db
    .from("profiles")
    .select("created_at")
    .is("deleted_at", null)
    .gte("created_at", kstDayStart(CHART_DAYS - 1).toISOString())
    .limit(SCAN_LIMIT);
  note("가입 추이", trendRes.error?.message);

  const buckets = new Map<string, number>(kstRecentDays(CHART_DAYS).map((d) => [d, 0]));
  for (const row of (trendRes.data ?? []) as { created_at: string | null }[]) {
    if (!row.created_at) continue;
    const key = kstDateKey(row.created_at);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }
  const trend = [...buckets.entries()].map(([day, count]) => ({ day, count }));
  const peak = Math.max(1, ...trend.map((t) => t.count));

  // 클라이언트로는 가공된 문자열만 넘긴다
  const rows: MemberRow[] = members.map((m) => ({
    id: m.id,
    joinedAt: kstDateTime(m.createdAt),
    username: m.username,
    nickname: m.nickname,
    email: m.email,
    phoneMasked: maskPhone(m.phone),
    phoneFull: formatPhone(m.phone),
    provider: m.provider,
    lastSignInAt: kstDateTime(m.lastSignInAt),
    role: m.role,
  }));

  const card = "rounded-2xl border border-white/10 bg-[#141414] p-5";

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6">
          <h1 className="text-2xl font-black sm:text-3xl">관리자 대시보드</h1>
          <p className="mt-1.5 text-sm text-gray-400">{email} · 모든 시각은 KST 기준입니다</p>
        </header>

        {!usingServiceRole && (
          <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-200">
            <b className="font-bold">SUPABASE_SERVICE_ROLE_KEY 가 설정되지 않았습니다.</b>
            <br />
            이메일·가입 방식·마지막 로그인은 auth.users 에서 오는 값이라 지금은 비어 있습니다.
            서버 전용 환경변수로 키를 추가하면 채워집니다.
          </div>
        )}

        {issues.length > 0 && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm leading-relaxed text-red-200">
            <b className="font-bold">일부 조회가 실패했습니다.</b>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {issues.map((m) => (
                <li key={m} className="break-all">
                  {m}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── KPI ─────────────────────────────────────────────────────── */}
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {kpis.map((k) => (
            <div key={k.label} className={card}>
              <p className="text-[12px] font-bold text-gray-400">{k.label}</p>
              <p className="mt-2 text-3xl font-black" style={{ color: GREEN }}>
                {k.value === null ? "-" : num(k.value)}
                {k.value !== null && (
                  <span className="ml-1 text-base font-bold text-gray-300">명</span>
                )}
              </p>
              {k.hint && <p className="mt-1 text-[11px] text-gray-500">{k.hint}</p>}
            </div>
          ))}
        </section>
        <p className="mt-2 text-[12px] text-gray-500">
          탈퇴 신청 후 삭제 대기 중인 계정 {num(pendingDeletion)}명은 가입자 수에서 제외했습니다.
          {authAvailable
            ? ` 최근 7일 로그인은 표에 불러온 ${num(members.length)}명 안에서 센 값입니다.`
            : ""}
        </p>

        {/* ── 일별 가입 추이 ──────────────────────────────────────────── */}
        <section className={`${card} mt-6`}>
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="text-base font-black">일별 가입 추이</h2>
            <span className="text-[12px] text-gray-500">
              최근 {CHART_DAYS}일 · 최대 {num(peak)}명
            </span>
          </div>
          {/* 외부 차트 라이브러리 없이 flex + 높이 비율로 그린다 */}
          <div className="flex h-40 items-end gap-[3px]">
            {trend.map((t) => (
              <div
                key={t.day}
                className="flex h-full flex-1 items-end"
                title={`${t.day} · ${t.count}명`}
              >
                <div
                  className="w-full rounded-t-[3px]"
                  style={{
                    height: `${Math.max(t.count === 0 ? 2 : 6, (t.count / peak) * 100)}%`,
                    backgroundColor: t.count === 0 ? "rgba(255,255,255,.10)" : GREEN,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-gray-500">
            <span>{trend[0]?.day ?? ""}</span>
            <span>{trend[trend.length - 1]?.day ?? ""}</span>
          </div>
        </section>

        {/* ── 회원 ────────────────────────────────────────────────────── */}
        <section className={`${card} mt-6 mb-10`}>
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-base font-black">회원</h2>
            <a
              href="/admin/export"
              className="rounded-full px-4 py-2 text-[13px] font-bold text-white"
              style={{ backgroundColor: GREEN }}
            >
              CSV 다운로드
            </a>
          </div>

          {truncated && (
            <p className="mb-3 rounded-lg bg-white/5 px-3 py-2 text-[12px] text-gray-400">
              최근 {num(TABLE_LIMIT)}명만 불러왔습니다. 전체 명단은 CSV 다운로드를 이용해주세요.
            </p>
          )}

          <MembersTable rows={rows} />
        </section>
      </div>
    </main>
  );
}
