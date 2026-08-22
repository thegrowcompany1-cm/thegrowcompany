// 닉네임 중복확인.
//
// profiles 를 lower(nickname) 일치로 조회한다. DB 의 profiles_nickname_unique
// 인덱스가 lower(nickname) 기준(탈퇴하지 않은 행 한정)이라 같은 조건으로 맞춘다.
//
// profiles 의 SELECT 정책이 공개라 anon 키로 조회가 되므로 service role 은 쓰지 않는다.
// 이 라우트는 닉네임의 사용 가능 여부(boolean)만 돌려주고 다른 회원 정보는 노출하지 않는다.

import { createClient } from "@/lib/supabase/server";
import { validateNickname } from "@/lib/authStyles";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("nickname") ?? "";
  const nickname = raw.trim();

  // 형식 검증 — 클라이언트를 우회해 들어와도 동일하게 막는다
  const formatErr = validateNickname(nickname);
  if (formatErr) {
    return NextResponse.json(
      { available: false, message: formatErr },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  // 자기 자신은 중복으로 보지 않는다 (마이페이지에서 닉네임을 그대로 두고 저장하는 경우)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("profiles")
    .select("id")
    .ilike("nickname", nickname)
    .is("deleted_at", null)
    .limit(1);

  if (user) query = query.neq("id", user.id);

  const { data, error } = await query;

  if (error) {
    console.error("닉네임 중복확인 실패:", error.message);
    return NextResponse.json(
      { available: false, message: "확인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 },
    );
  }

  const taken = (data?.length ?? 0) > 0;

  return NextResponse.json({
    available: !taken,
    message: taken
      ? "이미 사용 중인 닉네임입니다."
      : "사용하실 수 있는 닉네임입니다.",
  });
}
