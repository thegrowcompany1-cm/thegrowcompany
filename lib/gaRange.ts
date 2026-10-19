// /admin/ga 기간 선택 공용 — 모든 날짜 경계는 KST(Asia/Seoul) 기준이다.
// 서버 라우트와 화면이 같이 쓰는 순수 함수만 둔다 (Date.now() 는 인자로 받을 수 있게 해서 테스트가 쉽다).
//
//  · 날짜는 "YYYY-MM-DD" 문자열로만 주고받는다. 시각이 필요하면 kstBounds() 로 UTC ISO 로 바꾼다.
//  · 한국은 서머타임이 없어 KST = UTC+9 고정이다.

export const KST_MS = 9 * 3600_000;
const DAY_MS = 86400_000;
/** 최대 선택 범위(일) — 1년 */
export const MAX_RANGE_DAYS = 366;

export type PresetKey = "today" | "yesterday" | "last7" | "last28" | "last90" | "thisMonth" | "lastMonth";

export const PRESET_LABEL: Record<PresetKey, string> = {
  today: "오늘",
  yesterday: "어제",
  last7: "최근 7일",
  last28: "최근 28일",
  last90: "최근 90일",
  thisMonth: "이번 달",
  lastMonth: "지난 달",
};
export const PRESET_ORDER: PresetKey[] = ["today", "yesterday", "last7", "last28", "last90", "thisMonth", "lastMonth"];

/** 오늘 날짜(KST) */
export const todayKst = (now: number = Date.now()): string => new Date(now + KST_MS).toISOString().slice(0, 10);

const utcMs = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

/** 실제로 있는 날짜인지 ("2026-02-30" 같은 값은 거른다) */
export function isYmd(v: unknown): v is string {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  return new Date(utcMs(v)).toISOString().slice(0, 10) === v;
}

export const addDays = (ymd: string, n: number): string => new Date(utcMs(ymd) + n * DAY_MS).toISOString().slice(0, 10);
/** b - a (일) */
export const daysBetween = (a: string, b: string): number => Math.round((utcMs(b) - utcMs(a)) / DAY_MS);
/** from ~ to 포함 일수 */
export const rangeLength = (from: string, to: string): number => daysBetween(from, to) + 1;

export function listDays(from: string, to: string): string[] {
  const out: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];
export const weekdayKo = (ymd: string): string => WEEKDAY[new Date(utcMs(ymd)).getUTCDay()];
export const isWeekend = (ymd: string): boolean => {
  const d = new Date(utcMs(ymd)).getUTCDay();
  return d === 0 || d === 6;
};

export function presetRange(key: PresetKey, today: string = todayKst()): { from: string; to: string } {
  switch (key) {
    case "today":
      return { from: today, to: today };
    case "yesterday": {
      const y = addDays(today, -1);
      return { from: y, to: y };
    }
    case "last7":
      return { from: addDays(today, -6), to: today };
    case "last28":
      return { from: addDays(today, -27), to: today };
    case "last90":
      return { from: addDays(today, -89), to: today };
    case "thisMonth":
      return { from: `${today.slice(0, 7)}-01`, to: today };
    case "lastMonth": {
      const firstThis = `${today.slice(0, 7)}-01`;
      const last = addDays(firstThis, -1);
      return { from: `${last.slice(0, 7)}-01`, to: last };
    }
  }
}

/** 지금 기간이 어느 프리셋과 같은지 (없으면 null = 직접 선택) */
export function matchPreset(from: string, to: string, today: string = todayKst()): PresetKey | null {
  for (const k of PRESET_ORDER) {
    const r = presetRange(k, today);
    if (r.from === from && r.to === to) return k;
  }
  return null;
}

/** 같은 길이의 직전 기간 */
export function previousRange(from: string, to: string): { from: string; to: string } {
  const len = rangeLength(from, to);
  return { from: addDays(from, -len), to: addDays(from, -1) };
}

export type RangeParseResult = { ok: true; from: string; to: string } | { ok: false; message: string };

/**
 * 쿼리 파라미터 → 기간. from/to 가 우선이고, 없으면 예전 range=7|28|90 (오늘까지 N일)을 받는다.
 * 둘 다 없으면 최근 28일. 잘못된 날짜 · from>to · 1년 초과 · 미래 날짜는 오류 메시지를 돌려준다.
 */
export function parseRange(
  params: { from?: string | null; to?: string | null; range?: string | null },
  today: string = todayKst(),
): RangeParseResult {
  const { from, to, range } = params;
  if (from || to) {
    if (!isYmd(from) || !isYmd(to)) return { ok: false, message: "from·to 는 YYYY-MM-DD 형식의 실제 날짜여야 합니다." };
    if (from > to) return { ok: false, message: "시작일이 종료일보다 늦을 수 없습니다." };
    if (to > today) return { ok: false, message: "오늘 이후 날짜는 선택할 수 없습니다." };
    if (rangeLength(from, to) > MAX_RANGE_DAYS) return { ok: false, message: "기간은 최대 1년까지 선택할 수 있습니다." };
    return { ok: true, from, to };
  }
  const n = Number(range);
  if (n === 7 || n === 28 || n === 90) return { ok: true, from: addDays(today, -(n - 1)), to: today };
  return { ok: true, ...presetRange("last28", today) };
}

/** KST 날짜 경계 → UTC ISO (from 00:00:00 ~ to 23:59:59.999 KST) */
export function kstBounds(from: string, to: string): { gte: string; lte: string } {
  return {
    gte: new Date(`${from}T00:00:00+09:00`).toISOString(),
    lte: new Date(`${to}T23:59:59.999+09:00`).toISOString(),
  };
}

/** ISO 시각이 속한 KST 날짜 */
export const kstDateOf = (iso: string): string => new Date(Date.parse(iso) + KST_MS).toISOString().slice(0, 10);
