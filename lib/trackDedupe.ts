// 방문 기록 중복 정리 — 같은 session_id + path 로 3초 안에 들어온 visits 행은 한 번의 방문으로 센다.
//
// 인스타그램 인앱 브라우저 등에서 페이지 진입 때 추적 코드가 두 번 실행되면 수십 ms 간격으로 visits 행이
// 2개 생긴다. 클라이언트 가드와 DB 함수(20261020_visit_tracking_dedupe.sql)가 막지만, 이미 쌓인 행과
// 구버전 클라이언트가 만든 행까지 집계에서 한 건으로 묶기 위해 이 함수를 쓴다.
// 순수 함수라 서버 라우트와 테스트가 같이 쓴다.

export const DEDUPE_WINDOW_MS = 3000;

type VisitLike = {
  session_id: string;
  path: string;
  entered_at: string;
  left_at: string | null;
  last_seen_at: string;
  duration_sec: number | null;
  max_scroll_pct: number | null;
  last_section: string | null;
};

const ms = (iso: string) => Date.parse(iso);

/**
 * entered_at 오름차순으로 정렬된 방문 목록을 받아, (session_id, path) 가 같고 직전 "대표 행"의
 * 진입 시각과 3초 이내인 행을 대표 행에 합친다. 합칠 때는 더 긴 체류·더 깊은 스크롤·더 늦은 마지막 접속을 남긴다.
 * 입력은 바꾸지 않고, 대표 행(복사본)만 순서대로 돌려준다.
 */
export function dedupeVisits<T extends VisitLike>(sorted: T[]): T[] {
  const out: T[] = [];
  const lastByKey = new Map<string, T>();
  for (const v of sorted) {
    const key = `${v.session_id}\u0000${v.path}`;
    const head = lastByKey.get(key);
    if (head && ms(v.entered_at) - ms(head.entered_at) <= DEDUPE_WINDOW_MS) {
      head.duration_sec = Math.max(head.duration_sec ?? 0, v.duration_sec ?? 0) || null;
      head.max_scroll_pct = Math.max(head.max_scroll_pct ?? 0, v.max_scroll_pct ?? 0) || null;
      if (ms(v.last_seen_at) > ms(head.last_seen_at)) head.last_seen_at = v.last_seen_at;
      if (v.left_at && (!head.left_at || ms(v.left_at) > ms(head.left_at))) head.left_at = v.left_at;
      if (!head.last_section && v.last_section) head.last_section = v.last_section;
      continue;
    }
    const copy = { ...v };
    lastByKey.set(key, copy);
    out.push(copy);
  }
  return out;
}
