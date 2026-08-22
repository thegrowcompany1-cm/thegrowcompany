import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MyPageView from "./MyPageView";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, phone, nickname")
    .eq("id", user.id)
    .maybeSingle();

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
      initialPhone={profile?.phone ?? meta.phone ?? ""}
      initialNickname={profile?.nickname ?? meta.nickname ?? ""}
    />
  );
}
