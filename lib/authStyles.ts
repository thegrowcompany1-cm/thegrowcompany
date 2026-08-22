// 인증 화면(가입/로그인/비밀번호 변경/마이페이지) 공용 Tailwind 클래스.
// 다크톤 통일 + 모바일 가로 오버플로우 방지(w-full + min-w-0)를 한곳에서 관리한다.

export const AUTH_PAGE =
  "min-h-screen bg-[#0d0d0d] text-white px-4 py-14 sm:px-6 sm:py-16";

export const AUTH_CARD =
  "mx-auto w-full max-w-md rounded-2xl border border-[#242424] bg-[#141414] p-6 sm:p-8";

export const AUTH_TITLE = "text-xl font-extrabold sm:text-2xl";

export const AUTH_SUB = "mt-2 text-sm leading-relaxed text-[#8a8a8a]";

export const LABEL = "mb-2 block text-[13px] font-bold text-[#bbb]";

export const INPUT =
  "w-full min-w-0 rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] px-4 py-3 text-[15px] text-white outline-none transition-colors placeholder:text-[#5a5a5a] focus:border-[#22B573] disabled:opacity-50";

export const INPUT_ERR = "border-[#e05555] focus:border-[#e05555]";

export const FIELD_ERR = "mt-1.5 text-xs text-[#ff8080]";

export const BTN_PRIMARY =
  "w-full rounded-xl bg-[#22B573] px-4 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-[#1a9c60] disabled:cursor-not-allowed disabled:opacity-50";

export const BTN_GHOST =
  "w-full rounded-xl border border-[#2a2a2a] bg-[#191919] px-4 py-3 text-sm font-bold text-[#ddd] transition-colors hover:border-[#22B573] hover:text-[#22B573] disabled:cursor-not-allowed disabled:opacity-50";

export const ALERT_ERR =
  "rounded-xl border border-[#5a2626] bg-[#2a1414] px-4 py-3 text-[13px] leading-relaxed text-[#ff9a9a]";

export const ALERT_OK =
  "rounded-xl border border-[#22B573]/40 bg-[#22B573]/10 px-4 py-3 text-[13px] leading-relaxed text-[#7fe0b0]";

export const LINK = "font-semibold text-[#22B573] hover:underline";

/** 전화번호 자동 하이픈 — 010-1234-5678 형태로 정규화 */
export function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 010-1234-5678 / 011-123-4567 등 국내 휴대폰 형식 */
export const PHONE_RE = /^01[016789]-\d{3,4}-\d{4}$/;

export const MIN_PASSWORD = 8;

// ── 닉네임 ────────────────────────────────────────────────────────────────
// 공개 표시명. 2~12자, 한글/영문/숫자만 허용 (공백·특수문자 불가).
// DB 의 profiles_nickname_unique 인덱스가 lower(nickname) 기준이라
// 대소문자만 다른 닉네임은 같은 것으로 취급된다.
export const NICKNAME_MIN = 2;
export const NICKNAME_MAX = 12;
export const NICKNAME_RE = /^[가-힣a-zA-Z0-9]+$/;

/** 형식 검증 — 통과하면 null, 아니면 안내 문구를 돌려준다 */
export function validateNickname(raw: string): string | null {
  const v = raw.trim();
  if (!v) return "닉네임을 입력해주세요.";
  if (v.length < NICKNAME_MIN || v.length > NICKNAME_MAX)
    return `닉네임은 ${NICKNAME_MIN}자 이상 ${NICKNAME_MAX}자 이하로 입력해주세요.`;
  if (!NICKNAME_RE.test(v))
    return "닉네임은 한글, 영문, 숫자만 사용하실 수 있습니다.";
  return null;
}
