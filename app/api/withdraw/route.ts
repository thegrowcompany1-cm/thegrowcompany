// 회원탈퇴 — 30일 유예 soft delete
//
//  1) 요청자의 세션으로 getUser() 본인 확인 (getSession() 금지)
//  2) profiles.deleted_at = now(), scheduled_deletion_at = now() + 30일
//  3) 전 기기 로그아웃
//
// SUPABASE_SERVICE_ROLE_KEY 가 있으면 admin API 로 처리하고,
// 없으면 요청자 본인 세션으로 처리한다. profiles 의 RLS 정책이
// "본인 프로필 수정 (auth.uid() = id)" 이라 본인 행만 수정 가능하므로
// 폴백 경로도 다른 사람의 계정을 건드릴 수 없다.
//
// 30일 경과분의 영구 삭제는 docs/purge-cron.sql 을 Supabase 에서 직접 실행한다.

import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/** 유예 기간(일) — docs/purge-cron.sql 의 기준과 반드시 같아야 한다 */
export const GRACE_DAYS = 30;

export async function POST() {
  const supabase = await createServerClient();

  // 1) 본인 확인
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json(
      { ok: false, message: "로그인 후 이용하실 수 있습니다." },
      { status: 401 },
    );
  }

  const now = new Date();
  const scheduled = new Date(now.getTime() + GRACE_DAYS * 24 * 60 * 60 * 1000);
  const patch = {
    deleted_at: now.toISOString(),
    scheduled_deletion_at: scheduled.toISOString(),
  };

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (serviceKey) {
    // service role 경로 — 지정된 방식
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { error: updErr } = await admin
      .from("profiles")
      .update(patch)
      .eq("id", user.id);

    if (updErr) {
      console.error("withdraw update 실패:", updErr.message);
      return NextResponse.json(
        { ok: false, message: "탈퇴 처리 중 문제가 발생했습니다." },
        { status: 500 },
      );
    }

    // 전 기기 로그아웃
    const { error: outErr } = await admin.auth.admin.signOut(user.id, "global");
    if (outErr) console.error("admin.signOut 실패:", outErr.message);

    return NextResponse.json({
      ok: true,
      graceDays: GRACE_DAYS,
      scheduledDeletionAt: patch.scheduled_deletion_at,
      // admin 이 세션을 정리했으므로 클라이언트에서 추가 로그아웃은 필요 없다
      clientSignOut: false,
    });
  }

  // 폴백 — 요청자 본인 세션으로 처리 (RLS 가 본인 행으로 제한)
  const { error: updErr } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", user.id);

  if (updErr) {
    console.error("withdraw update 실패(폴백):", updErr.message);
    return NextResponse.json(
      { ok: false, message: "탈퇴 처리 중 문제가 발생했습니다." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    graceDays: GRACE_DAYS,
    scheduledDeletionAt: patch.scheduled_deletion_at,
    // service role 이 없으므로 클라이언트가 signOut({ scope: "global" }) 로
    // 전 기기 세션을 정리해야 한다
    clientSignOut: true,
  });
}
