// ─────────────────────────────────────────────────────────────────────────────
// 회원 목록 로딩 — profiles + auth.users 결합
//
//  · auth.users 는 service role 키가 있어야 읽을 수 있다(auth.admin API).
//    키가 없으면 profiles 만 돌려주고 authAvailable=false 로 알린다.
//  · 화면과 CSV 라우트가 같은 함수를 쓴다. 두 곳의 숫자가 어긋나지 않게 하려는 것이다.
//
// 서버 전용. "use client" 파일에서 import 하지 말 것.
// ─────────────────────────────────────────────────────────────────────────────

import type { AdminContext } from "./guard";

export type Member = {
  id: string;
  createdAt: string | null;
  username: string;
  nickname: string;
  phone: string;
  role: string;
  email: string;
  /** 가입 방식 — email / google / kakao … (auth.users 없으면 빈 값) */
  provider: string;
  lastSignInAt: string | null;
};

export type MembersResult = {
  members: Member[];
  /** auth.users 결합 성공 여부 (service role 키 유무) */
  authAvailable: boolean;
  /** 조회 상한에 걸려 잘렸는지 */
  truncated: boolean;
  issues: string[];
};

/** auth.admin.listUsers 한 번에 가져오는 수 (Supabase 상한이 1000) */
const AUTH_PAGE_SIZE = 1000;
/** auth.users 페이지 순회 상한 — 무한 루프 방지 */
const AUTH_MAX_PAGES = 10;

type AuthInfo = { email: string; provider: string; lastSignInAt: string | null };

/**
 * auth.users 전체를 id → {email, provider, last_sign_in_at} 로 만든다.
 * service role 이 아니면 빈 맵과 authAvailable=false 를 돌려준다.
 */
async function loadAuthMap(
  ctx: AdminContext,
  issues: string[],
): Promise<{ map: Map<string, AuthInfo>; available: boolean }> {
  const map = new Map<string, AuthInfo>();
  if (!ctx.usingServiceRole) return { map, available: false };

  for (let page = 1; page <= AUTH_MAX_PAGES; page++) {
    const { data, error } = await ctx.db.auth.admin.listUsers({
      page,
      perPage: AUTH_PAGE_SIZE,
    });

    if (error) {
      issues.push(`auth.users 조회: ${error.message}`);
      return { map, available: map.size > 0 };
    }

    const users = data?.users ?? [];
    for (const u of users) {
      const meta = (u.app_metadata ?? {}) as { provider?: string };
      const fromIdentity = u.identities?.[0]?.provider;
      map.set(u.id, {
        email: u.email ?? "",
        provider: meta.provider ?? fromIdentity ?? "",
        lastSignInAt: u.last_sign_in_at ?? null,
      });
    }

    if (users.length < AUTH_PAGE_SIZE) break;
  }

  return { map, available: true };
}

/**
 * 탈퇴하지 않은 회원을 최근 가입순으로 limit 명까지.
 * profiles 를 먼저 읽고 auth.users 정보를 붙인다.
 */
export async function loadMembers(
  ctx: AdminContext,
  limit: number,
): Promise<MembersResult> {
  const issues: string[] = [];

  // phone 은 service role 로만 읽을 수 있다 (anon/authenticated 에서 SELECT 권한 회수 예정).
  // 폴백 경로에서 phone 을 요청하면 쿼리 전체가 실패하므로 컬럼 목록에서 뺀다.
  const columns = ctx.usingServiceRole
    ? "id, created_at, username, nickname, phone, role"
    : "id, created_at, username, nickname, role";

  const { data, error } = await ctx.db
    .from("profiles")
    .select(columns)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) issues.push(`회원 목록: ${error.message}`);

  const rows = (data ?? []) as {
    id: string;
    created_at: string | null;
    username: string | null;
    nickname: string | null;
    phone?: string | null;
    role: string | null;
  }[];

  const { map, available } = await loadAuthMap(ctx, issues);

  const members: Member[] = rows.map((r) => {
    const auth = map.get(r.id);
    return {
      id: r.id,
      createdAt: r.created_at,
      username: r.username?.trim() ?? "",
      nickname: r.nickname?.trim() ?? "",
      phone: r.phone?.trim() ?? "",
      role: r.role?.trim() || "user",
      email: auth?.email ?? "",
      provider: auth?.provider ?? "",
      lastSignInAt: auth?.lastSignInAt ?? null,
    };
  });

  return {
    members,
    authAvailable: available,
    truncated: rows.length >= limit,
    issues,
  };
}

/** 마지막 로그인이 기준 시각 이후인 회원 수 */
export function countActiveSince(members: Member[], since: Date): number {
  const t = since.getTime();
  return members.filter(
    (m) => m.lastSignInAt !== null && new Date(m.lastSignInAt).getTime() >= t,
  ).length;
}
