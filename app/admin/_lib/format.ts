// /admin 공용 포맷 유틸 — KST 날짜 경계와 마스킹.
//
// Supabase 는 timestamptz(UTC) 로 저장한다. "오늘 가입자" 같은 숫자는 KST 자정을
// 기준으로 잘라야 하므로, UTC 시각에 +9h 를 더한 뒤 날짜를 읽는 방식으로 계산한다.
// (서버가 어느 타임존에서 돌든 같은 결과가 나오도록 로컬 타임존 API 를 쓰지 않는다)

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** KST 기준 "오늘 - daysAgo" 일의 00:00 에 해당하는 실제(UTC) 시각 */
export function kstDayStart(daysAgo = 0): Date {
  const nowKst = new Date(Date.now() + KST_OFFSET_MS);
  const y = nowKst.getUTCFullYear();
  const m = nowKst.getUTCMonth();
  const d = nowKst.getUTCDate();
  return new Date(Date.UTC(y, m, d - daysAgo) - KST_OFFSET_MS);
}

/** KST 기준 YYYY-MM-DD */
export function kstDateKey(value: string | Date): string {
  const t = new Date(new Date(value).getTime() + KST_OFFSET_MS);
  return t.toISOString().slice(0, 10);
}

/** KST 기준 YYYY-MM-DD HH:MM */
export function kstDateTime(value: string | Date | null | undefined): string {
  if (!value) return "-";
  const base = new Date(value);
  if (Number.isNaN(base.getTime())) return "-";
  const t = new Date(base.getTime() + KST_OFFSET_MS);
  return t.toISOString().slice(0, 16).replace("T", " ");
}

/** 최근 n일의 KST 날짜 키를 오래된 순으로 */
export function kstRecentDays(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(kstDateKey(kstDayStart(i)));
  return out;
}

/**
 * 연락처 가운데 4자리 마스킹. 010-1234-5678 → 010-****-5678
 * 자리수가 모자라면 원본을 그대로 돌려준다 (잘못 가린 값을 보여주지 않기 위해).
 */
export function maskPhone(raw: string | null | undefined): string {
  const digits = (raw ?? "").replace(/[^0-9]/g, "");
  if (digits.length < 9) return raw?.trim() || "-";
  const tail = digits.slice(-4);
  const head = digits.slice(0, digits.length - 8);
  return `${head}-****-${tail}`;
}

/** 010-1234-5678 형태로 하이픈을 넣어준다 (원본에 하이픈이 없을 수 있어서) */
export function formatPhone(raw: string | null | undefined): string {
  const digits = (raw ?? "").replace(/[^0-9]/g, "");
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return raw?.trim() || "-";
}

export const won = (n: number) => n.toLocaleString("ko-KR") + "원";
export const num = (n: number) => n.toLocaleString("ko-KR");
