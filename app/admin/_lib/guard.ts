// ─────────────────────────────────────────────────────────────────────────────
// /admin 접근 제어
//
//  · app/admin/ 하위의 모든 페이지는 렌더 첫 줄에서 requireAdmin() 을 호출한다.
//    layout.tsx 에 두지 않는 이유: App Router 는 layout 과 page 를 병렬로 렌더하므로
//    layout 의 가드가 page 의 데이터 조회를 막아주지 못한다. 가드는 page 안에 있어야 한다.
//  · 권한이 없으면 redirect 가 아니라 notFound() 다. 로그인 페이지로 튕기면
//    "/admin 이라는 경로가 있다" 는 사실이 드러난다. 404 는 존재 자체를 숨긴다.
//  · 인증 확인은 반드시 getUser(). getSession() 은 쿠키를 검증 없이 믿는다.
//  · _lib 은 언더스코어 프리픽스라 라우팅 대상이 아니다 (private folder).
//
// 주의: 이 파일은 서버 전용이다. 클라이언트 컴포넌트에서 import 하면
//       SUPABASE_SERVICE_ROLE_KEY 가 브라우저 번들로 새어나간다.
//       ("use client" 가 붙은 파일에서 절대 import 하지 말 것)
// ─────────────────────────────────────────────────────────────────────────────

import { notFound } from "next/navigation";
import { createClient as createSessionClient } from "@/lib/supabase/server";
import { createClient as createRawClient } from "@supabase/supabase-js";

/** 관리자로 인정하는 profiles.role 값 — DB 값을 바꾸지 않는다 */
const ADMIN_ROLE = "admin";

export type AdminContext = {
  userId: string;
  email: string;
  /** 데이터 조회용 클라이언트 (service role 이 있으면 그것, 없으면 요청자 세션) */
  db: ReturnType<typeof createRawClient>;
  /** service role 키로 조회 중인지 — 화면에 경고를 띄우는 데 쓴다 */
  usingServiceRole: boolean;
};

/**
 * 로그인 + profiles.role === 'admin' 을 확인한다.
 * 하나라도 어긋나면 notFound() 로 렌더를 중단한다(반환하지 않는다).
 */
export async function requireAdmin(): Promise<AdminContext> {
  const session = await createSessionClient();

  const {
    data: { user },
    error: authErr,
  } = await session.auth.getUser();

  if (authErr || !user) notFound();

  const { data: profile, error: roleErr } = await session
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  // 조회가 실패한 경우(컬럼 없음·RLS 거부 등)도 권한 없음으로 본다 — fail closed.
  // 스키마가 달라서 에러가 났는데 통과시키면 권한 검사가 통째로 무력해진다.
  if (roleErr || !profile) notFound();
  if ((profile as { role?: unknown }).role !== ADMIN_ROLE) notFound();

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (serviceKey && url) {
    return {
      userId: user.id,
      email: user.email ?? "",
      db: createRawClient(url, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      }),
      usingServiceRole: true,
    };
  }

  // 폴백 — 요청자 세션으로 조회한다. 이미 관리자임을 확인한 뒤이고,
  // 세션 클라이언트는 anon 키 + RLS 라 권한이 늘어나지 않는다.
  // profiles 는 SELECT 정책이 공개라 읽히지만, orders 처럼 RLS 가 막힌 테이블은
  // 빈 결과가 돌아올 수 있다. 그래서 화면에 키가 없다는 경고를 띄운다.
  return {
    userId: user.id,
    email: user.email ?? "",
    db: session as unknown as ReturnType<typeof createRawClient>,
    usingServiceRole: false,
  };
}
