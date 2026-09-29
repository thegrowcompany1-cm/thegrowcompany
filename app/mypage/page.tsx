import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import MyPageView from "./MyPageView";

/**
 * 본인 연락처만 service role 로 읽는다.
 *
 * 왜: profiles.phone 의 SELECT 권한을 anon/authenticated 에서 회수할 예정이라
 * 세션 클라이언트로는 더 이상 읽을 수 없다. 여기서는 위에서 getUser() 로 본인을
 * 확인한 뒤 그 uid 의 한 행만 읽으므로 남의 번호는 조회되지 않는다.
 *
 * service role 키가 없으면 null 을 돌려주고, 호출부가 가입 시 메타데이터로 대체한다.
 */
async function loadOwnPhone(userId: string): Promise<string | null> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !url) return null;

  const admin = createAdminClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin
    .from("profiles")
    .select("phone")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("본인 연락처 조회 실패:", error.message);
    return null;
  }
  return (data as { phone?: string | null } | null)?.phone ?? null;
}

export const metadata: Metadata = {
  title: { absolute: "마이페이지 | 더그로우컴퍼니" },
  description: "더그로우컴퍼니 회원 정보 확인 및 수정 화면입니다.",
  robots: { index: false, follow: false },
};

export default async function MyPage() {
  const supabase = await createClient();

  // 인증 확인은 반드시 getUser() — getSession() 은 서버에서 신뢰할 수 없다
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) redirect("/login");

  // phone 은 여기서 뽑지 않는다 — 세션 클라이언트의 SELECT 권한에서 빠질 컬럼이다.
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, nickname")
    .eq("id", user.id)
    .maybeSingle();

  const ownPhone = await loadOwnPhone(user.id);

  // 트리거로 만들어지는 profiles 행이 아직 없을 수 있으므로 메타데이터로 보완
  const meta = user.user_metadata as {
    username?: string;
    phone?: string;
    nickname?: string;
  };

  return (
    <MyPageView
      email={user.email ?? ""}
      initialName={profile?.username ?? meta.username ?? ""}
      initialPhone={ownPhone ?? meta.phone ?? ""}
      initialNickname={profile?.nickname ?? meta.nickname ?? ""}
    />
  );
}
