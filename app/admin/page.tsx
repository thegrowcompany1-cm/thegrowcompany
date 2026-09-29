// ─────────────────────────────────────────────────────────────────────────────
// 관리자 대시보드 — 가입자 · 주문 현황
//
//  · 서버 컴포넌트. 모든 조회는 서버에서만 일어나고, 클라이언트로 내려가는 것은
//    이미 가공된 표시용 문자열뿐이다. SUPABASE_SERVICE_ROLE_KEY 는 이 파일과
//    _lib/guard.ts 밖으로 나가지 않는다.
//  · 접근 제어는 requireAdmin() 한 줄. 권한이 없으면 notFound() 로 404 다.
//  · orders 는 확정된 컬럼으로 고정 쿼리를 쏜다. 스키마는 건드리지 않는다.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { requireAdmin } from "./_lib/guard";
import {
  kstDateTime,
  kstDateKey,
  kstDayStart,
  kstRecentDays,
  maskPhone,
  formatPhone,
  num,
  won,
} from "./_lib/format";
import PhoneCell from "./PhoneCell";

export const metadata: Metadata = {
  title: { absolute: "관리자 | 더그로우컴퍼니" },
  robots: { index: false, follow: false },
};

// 이 페이지는 requireAdmin() 안에서 cookies() 를 읽으므로 Next 가 자동으로
// 동적 렌더로 잡는다. route segment config(dynamic/revalidate)는 Next 16 에서
// 정리되는 옵션이라 쓰지 않았다 — 빌드 출력에 f(dynamic) 로 찍히는지로 확인한다.

const GREEN = "#22B573";
const CHART_DAYS = 30;
/** 합계·차트 계산을 위해 한 번에 읽는 행 수 상한 (메모리 보호) */
const SCAN_LIMIT = 5000;

type ProfileRow = {
  created_at: string | null;
  username: string | null;
  nickname: string | null;
  phone: string | null;
  role: string | null;
};

type OrderRow = {
  created_at: string | null;
  paid_at: string | null;
  amount: number | null;
  status: string | null;
  canceled_at: string | null;
  product_name: string | null;
  buyer_name: string | null;
  buyer_phone: string | null;
};

const ORDER_COLS =
  "created_at, paid_at, amount, status, canceled_at, product_name, buyer_name, buyer_phone";

/** 매출로 잡는 주문 — 결제완료이면서 취소되지 않은 건 */
const PAID_STATUS = "PAID";

/** 취소 여부는 status 가 아니라 canceled_at 으로 판단한다 */
const isCanceled = (o: OrderRow) => o.canceled_at !== null && o.canceled_at !== undefined;

export default async function AdminPage() {
  const { email, db, usingServiceRole } = await requireAdmin();

  const issues: string[] = [];
  const note = (label: string, message?: string) => {
    if (message) issues.push(`${label}: ${message}`);
  };

  // ── 가입자 집계 ───────────────────────────────────────────────────────────
  const live = () => db.from("profiles").select("*", { count: "exact", head: true }).is("deleted_at", null);

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

  const kpis = [
    { label: "전체 가입자", value: totalRes.count ?? 0 },
    { label: "오늘", value: todayRes.count ?? 0 },
    { label: "최근 7일", value: weekRes.count ?? 0 },
    { label: "최근 30일", value: monthRes.count ?? 0 },
  ];
  const pendingDeletion = pendingRes.count ?? 0;

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

  // ── 최근 가입자 50명 ──────────────────────────────────────────────────────
  const recentRes = await db
    .from("profiles")
    .select("created_at, username, nickname, phone, role")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(50);
  note("최근 가입자", recentRes.error?.message);
  const recent = (recentRes.data ?? []) as ProfileRow[];

  // ── 주문 ─────────────────────────────────────────────────────────────────
  // 총 건수는 취소분까지 포함한 전체, 총액은 결제완료(PAID) + 미취소 건만 합산한다.
  // PostgREST 로는 SUM 을 못 쓰므로 amount 만 읽어와 JS 에서 더한다 (SCAN_LIMIT 상한).
  const [orderCountRes, paidCountRes, recentOrderRes, amountRes] = await Promise.all([
    db.from("orders").select("*", { count: "exact", head: true }),
    db
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", PAID_STATUS)
      .is("canceled_at", null),
    db.from("orders").select(ORDER_COLS).order("created_at", { ascending: false }).limit(10),
    db
      .from("orders")
      .select("amount")
      .eq("status", PAID_STATUS)
      .is("canceled_at", null)
      .limit(SCAN_LIMIT),
  ]);

  const ordersAvailable = !orderCountRes.error;
  note("주문 건수", orderCountRes.error?.message);
  note("결제완료 건수", paidCountRes.error?.message);
  note("최근 주문", recentOrderRes.error?.message);
  note("주문 합계", amountRes.error?.message);

  const orderCount = orderCountRes.count ?? 0;
  const paidCount = paidCountRes.count ?? 0;
  const recentOrders = (recentOrderRes.data ?? []) as OrderRow[];
  const amountRows = (amountRes.data ?? []) as { amount: number | null }[];
  const orderSumCapped = amountRows.length >= SCAN_LIMIT;
  const orderSum = amountRows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);

  const card = "rounded-2xl border border-white/10 bg-[#141414] p-5";
  const th = "whitespace-nowrap px-3 py-2.5 text-left text-[12px] font-bold text-gray-400";
  const td = "whitespace-nowrap px-3 py-2.5 text-[13px] text-gray-200";

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6">
          <h1 className="text-2xl font-black sm:text-3xl">관리자 대시보드</h1>
          <p className="mt-1.5 text-sm text-gray-400">
            {email} · 모든 수치는 KST 기준입니다
          </p>
        </header>

        {!usingServiceRole && (
          <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-200">
            <b className="font-bold">SUPABASE_SERVICE_ROLE_KEY 가 설정되지 않았습니다.</b>
            <br />
            지금은 로그인한 관리자 세션으로 조회하고 있어 RLS 가 막는 테이블은 비어 보일 수
            있습니다. 서버 전용 환경변수로 키를 추가하면 정확한 수치가 나옵니다.
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
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className={card}>
              <p className="text-[12px] font-bold text-gray-400">{k.label}</p>
              <p className="mt-2 text-3xl font-black" style={{ color: GREEN }}>
                {num(k.value)}
                <span className="ml-1 text-base font-bold text-gray-300">명</span>
              </p>
            </div>
          ))}
        </section>
        <p className="mt-2 text-[12px] text-gray-500">
          탈퇴 신청 후 삭제 대기 중인 계정 {num(pendingDeletion)}명은 위 수치에서 제외했습니다.
        </p>

        {/* ── 일별 가입 추이 ──────────────────────────────────────────── */}
        <section className={`${card} mt-6`}>
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="text-base font-black">일별 가입 추이</h2>
            <span className="text-[12px] text-gray-500">최근 {CHART_DAYS}일 · 최대 {num(peak)}명</span>
          </div>
          {/* 외부 차트 라이브러리 없이 flex + 높이 비율로 그린다 */}
          <div className="flex h-40 items-end gap-[3px]">
            {trend.map((t) => (
              <div
                key={t.day}
                className="group relative flex h-full flex-1 items-end"
                title={`${t.day} · ${t.count}명`}
              >
                <div
                  className="w-full rounded-t-[3px] transition-colors"
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

        {/* ── 최근 가입자 ─────────────────────────────────────────────── */}
        <section className={`${card} mt-6`}>
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="text-base font-black">최근 가입자</h2>
            <span className="text-[12px] text-gray-500">최대 50명 · 연락처를 누르면 전체가 보입니다</span>
          </div>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">표시할 가입자가 없습니다.</p>
          ) : (
            <div className="-mx-2 overflow-x-auto px-2">
              <table className="w-full min-w-[620px] border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className={th}>가입일시</th>
                    <th className={th}>이름</th>
                    <th className={th}>닉네임</th>
                    <th className={th}>연락처</th>
                    <th className={th}>role</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r, i) => (
                    <tr key={`${r.created_at}-${i}`} className="border-b border-white/5">
                      <td className={`${td} font-mono text-gray-400`}>{kstDateTime(r.created_at)}</td>
                      <td className={td}>{r.username?.trim() || "-"}</td>
                      <td className={td}>{r.nickname?.trim() || "-"}</td>
                      <td className={td}>
                        <PhoneCell masked={maskPhone(r.phone)} full={formatPhone(r.phone)} />
                      </td>
                      <td className={td}>
                        <span
                          className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                          style={
                            r.role === "admin"
                              ? { backgroundColor: GREEN, color: "#fff" }
                              : { backgroundColor: "rgba(255,255,255,.08)", color: "#9CA3AF" }
                          }
                        >
                          {r.role?.trim() || "user"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── 주문 ────────────────────────────────────────────────────── */}
        <section className={`${card} mt-6 mb-10`}>
          <h2 className="mb-4 text-base font-black">주문</h2>

          {!ordersAvailable ? (
            <p className="py-8 text-center text-sm text-gray-500">
              주문 데이터를 불러오지 못했습니다. 위 오류 내용을 확인해주세요.
            </p>
          ) : orderCount === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">주문 내역 없음</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-[#0A0A0A] p-4">
                  <p className="text-[12px] font-bold text-gray-400">총 건수</p>
                  <p className="mt-1.5 text-2xl font-black" style={{ color: GREEN }}>
                    {num(orderCount)}
                    <span className="ml-1 text-base font-bold text-gray-300">건</span>
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0A0A0A] p-4">
                  <p className="text-[12px] font-bold text-gray-400">총액</p>
                  <p className="mt-1.5 text-2xl font-black" style={{ color: GREEN }}>
                    {won(orderSum)}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-[12px] text-gray-500">
                총액은 결제완료({PAID_STATUS}) 이면서 취소되지 않은 {num(paidCount)}건 기준입니다.
                총 건수는 취소분을 포함한 전체입니다.
              </p>
              {orderSumCapped && (
                <p className="mt-1 text-[12px] text-gray-500">
                  합산은 최근 {num(SCAN_LIMIT)}건까지만 반영했습니다.
                </p>
              )}

              <h3 className="mt-6 mb-3 text-sm font-bold text-gray-300">최근 10건</h3>
              <div className="-mx-2 overflow-x-auto px-2">
                <table className="w-full min-w-[720px] border-collapse">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className={th}>주문일시</th>
                      <th className={th}>결제일시</th>
                      <th className={th}>상품명</th>
                      <th className={th}>구매자</th>
                      <th className={th}>연락처</th>
                      <th className={`${th} text-right`}>금액</th>
                      <th className={th}>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o, i) => {
                      const canceled = isCanceled(o);
                      return (
                        <tr key={`${o.created_at}-${i}`} className="border-b border-white/5">
                          <td className={`${td} font-mono text-gray-400`}>
                            {kstDateTime(o.created_at)}
                          </td>
                          <td className={`${td} font-mono text-gray-400`}>
                            {kstDateTime(o.paid_at)}
                          </td>
                          <td className={td}>{o.product_name?.trim() || "-"}</td>
                          <td className={td}>{o.buyer_name?.trim() || "-"}</td>
                          <td className={td}>
                            <PhoneCell
                              masked={maskPhone(o.buyer_phone)}
                              full={formatPhone(o.buyer_phone)}
                            />
                          </td>
                          <td className={`${td} text-right font-mono`}>
                            {o.amount === null ? "-" : won(Number(o.amount))}
                          </td>
                          <td className={td}>
                            <span
                              className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                              style={
                                canceled
                                  ? { backgroundColor: "rgba(239,68,68,.18)", color: "#FCA5A5" }
                                  : o.status === PAID_STATUS
                                    ? { backgroundColor: GREEN, color: "#fff" }
                                    : { backgroundColor: "rgba(255,255,255,.08)", color: "#9CA3AF" }
                              }
                            >
                              {canceled ? "취소" : o.status?.trim() || "-"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
