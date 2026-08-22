// 공개 표시명 결정 유틸.
//
// 정책: 공개되는 이름은 닉네임이다. 실명(username)은 상담·결제 확인용이라
//       외부에 노출하지 않는 것이 원칙이고, 닉네임이 아직 없는 기존 회원에
//       한해서만 예외적으로 실명으로 대체한다.
//
// 우선순위: nickname → username → 이메일 앞부분 → fallback

export type DisplaySource = {
  nickname?: string | null;
  username?: string | null;
  email?: string | null;
};

export function displayName(
  src: DisplaySource | null | undefined,
  fallback = "회원",
): string {
  if (!src) return fallback;

  const nick = src.nickname?.trim();
  if (nick) return nick;

  const user = src.username?.trim();
  if (user) return user;

  const local = src.email?.trim().split("@")[0];
  if (local) return local;

  return fallback;
}

/** 표시명 뒤에 "님" 을 붙인 형태 (헤더 등에서 사용) */
export function displayNameWithHonorific(
  src: DisplaySource | null | undefined,
  fallback = "회원",
): string {
  return `${displayName(src, fallback)}님`;
}
