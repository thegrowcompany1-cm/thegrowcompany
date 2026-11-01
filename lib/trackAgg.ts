// 자체 방문 추적 집계 (서버 전용) — /api/admin/track 의 funnel · exits 뷰와 주간 AI 리포트가 같이 쓴다.
//  · 호출하는 쪽이 Supabase 클라이언트(service role 또는 관리자 세션)를 넘긴다.
//  · 반환값은 집계 숫자뿐이다. session_id · visitor_id 는 계산에만 쓰고 결과에 넣지 않는다.
//  · 같은 session_id + path 로 3초 안에 들어온 visits 행은 한 번의 방문으로 묶는다 (lib/trackDedupe.ts).

import type { SupabaseClient } from "@supabase/supabase-js";
import { dedupeVisits } from "@/lib/trackDedupe";
import { TRACK_SECTION_ORDER } from "@/lib/trackSections";

export type DbErr = { code?: string; message?: string };

export type Visit = {
  id: string;
  session_id: string;
  visitor_id: string;
  path: string;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  source_type: string;
  device: string | null;
  entered_at: string;
  left_at: string | null;
  last_seen_at: string;
  duration_sec: number | null;
  max_scroll_pct: number | null;
  last_section: string | null;
};

export const VISIT_COLS =
  "id, session_id, visitor_id, path, referrer, utm_source, utm_medium, utm_campaign, source_type, device, entered_at, left_at, last_seen_at, duration_sec, max_scroll_pct, last_section";

/** 마지막 핑이 이보다 오래됐으면 이탈한 것으로 본다 */
export const GONE_AFTER_MS = 90_000;
const PAGE = 1000;
const CAP = 20_000;

export const isMissingTable = (e: DbErr | null) =>
  !!e && (e.code === "42P01" || e.code === "PGRST205" || /does not exist|schema cache/i.test(e.message ?? ""));

/** 페이지를 한꺼번에 요청하는 수 — 예전에는 한 페이지씩 순서대로 기다려 행이 많은 기간일수록 왕복 시간이 그대로 쌓였다 */
const PAGE_BATCH = 4;

/**
 * PostgREST 는 한 번에 1000행까지라 페이지를 넘겨 가며 모은다.
 * 페이지는 PAGE_BATCH 개씩 동시에 요청하고 결과는 페이지 순서대로 이어 붙인다 (순서·내용·상한 동작은 순차 방식과 같다:
 * 짧은 페이지를 만나면 거기서 끝이고, 오류는 그 앞 페이지까지 모은 행과 함께 돌려준다).
 */
export async function fetchAll<T>(
  build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: DbErr | null }>,
): Promise<{ rows: T[]; error: DbErr | null; capped: boolean }> {
  const rows: T[] = [];
  const pages = CAP / PAGE;
  for (let first = 0; first < pages; first += PAGE_BATCH) {
    const n = Math.min(PAGE_BATCH, pages - first);
    const got = await Promise.all(Array.from({ length: n }, (_, i) => build((first + i) * PAGE, (first + i + 1) * PAGE - 1)));
    for (const { data, error } of got) {
      if (error) return { rows, error, capped: false };
      rows.push(...(data ?? []));
      if (!data || data.length < PAGE) return { rows, error: null, capped: false };
    }
  }
  return { rows, error: null, capped: true }; // 상한(CAP)까지 읽고도 더 있을 수 있다
}

/**
 * 기간 안의 방문 행 전체 — 퍼널(목록·상세)과 이탈 지점이 모두 같은 조회를 쓴다.
 * 예전에는 랜딩 성과 탭을 열 때, 그리고 랜딩을 고를 때마다 같은 기간의 방문 행을 처음부터 다시 읽었다(요청마다 전체 스캔).
 * 같은 기간의 조회는 진행 중이면 합류하고, 끝난 뒤 짧은 시간(VISIT_SCAN_TTL_MS) 동안 결과를 재사용한다. 오류는 보관하지 않는다.
 * 반환 행은 읽기 전용으로만 쓴다(dedupeVisits 는 복사본을 만든다).
 */
const VISIT_SCAN_TTL_MS = 15_000;
const VISIT_SCAN_MAX = 8;
type VisitScan = { rows: Visit[]; error: DbErr | null; capped: boolean };
const visitScans = new Map<string, { at: number; p: Promise<VisitScan> }>();

function scanVisits(db: SupabaseClient, since: string, until: string): Promise<VisitScan> {
  const key = `${since}|${until}`;
  const hit = visitScans.get(key);
  if (hit && Date.now() - hit.at < VISIT_SCAN_TTL_MS) return hit.p;
  const p = fetchAll<Visit>((f, t) =>
    db.from("visits").select(VISIT_COLS).gte("entered_at", since).lte("entered_at", until).order("entered_at", { ascending: true }).range(f, t),
  );
  visitScans.set(key, { at: Date.now(), p });
  const drop = () => {
    if (visitScans.get(key)?.p === p) visitScans.delete(key);
  };
  p.then((r) => r.error && drop(), drop);
  while (visitScans.size > VISIT_SCAN_MAX) visitScans.delete(visitScans.keys().next().value as string);
  return p;
}

export type FunnelPath = { path: string; sessions: number; tracked: boolean };
export type FunnelResult =
  | { error: DbErr }
  | {
      error: null;
      paths: FunnelPath[];
      /** path 를 줬을 때만 */
      detail?: { path: string; totalSessions: number; rows: { section: string; sessions: number; direct: number; rate: number }[] };
      capped: boolean;
    };

/** 기간(UTC ISO) 안의 랜딩별 섹션 도달 퍼널. path 가 없으면 경로 목록만. */
export async function funnelData(db: SupabaseClient, since: string, until: string, path?: string): Promise<FunnelResult> {
  // 방문 행 조회와 (path 가 있으면) 섹션 조회는 서로 의존하지 않으므로 동시에 시작한다 — 예전에는 방문 조회가 끝난 뒤에야 섹션 조회를 시작했다
  const svPromise = path
    ? fetchAll<{ session_id: string; section: string }>((f, t) =>
        db.from("section_views").select("session_id, section").eq("path", path).gte("seen_at", since).lte("seen_at", until).order("seen_at", { ascending: false }).range(f, t),
      )
    : null;
  const pv = await scanVisits(db, since, until);
  if (pv.error) {
    svPromise?.catch(() => {});
    return { error: pv.error };
  }
  const sessionsByPath = new Map<string, Set<string>>();
  for (const r of dedupeVisits(pv.rows)) {
    if (!sessionsByPath.has(r.path)) sessionsByPath.set(r.path, new Set());
    sessionsByPath.get(r.path)!.add(r.session_id);
  }
  const paths = [...sessionsByPath.entries()]
    .map(([p, s]) => ({ path: p, sessions: s.size, tracked: p in TRACK_SECTION_ORDER }))
    .filter((p) => p.tracked)
    .sort((a, b) => b.sessions - a.sessions);
  if (!path) return { error: null, paths, capped: pv.capped };

  const total = sessionsByPath.get(path)?.size ?? 0;
  const sv = await svPromise!;
  if (sv.error) return { error: sv.error };
  const reached = new Map<string, Set<string>>(); // 직접 기록된 섹션별 세션
  const deepest = new Map<string, number>(); // 세션별 가장 뒤 섹션의 순서 번호
  const order = TRACK_SECTION_ORDER[path] ?? [];
  const orderIdx = new Map(order.map((s, i) => [s, i]));
  for (const r of sv.rows) {
    if (!reached.has(r.section)) reached.set(r.section, new Set());
    reached.get(r.section)!.add(r.session_id);
    const i = orderIdx.get(r.section);
    if (i !== undefined && i > (deepest.get(r.session_id) ?? -1)) deepest.set(r.session_id, i);
  }
  // 도달 = 그 섹션 또는 그보다 뒤 섹션을 본 세션 (뒤를 봤으면 앞도 지나간 것으로 본다) → 단조 감소.
  // 직접 기록 수는 direct 로 함께 돌려준다. 한 번도 안 본(도달 0) 섹션은 막대를 그리지 않는다.
  const cumulative = order.map(() => 0);
  for (const i of deepest.values()) for (let k = 0; k <= i; k++) cumulative[k] += 1;
  const rows = order
    .map((s, i) => ({ section: s, sessions: cumulative[i], direct: reached.get(s)?.size ?? 0 }))
    .filter((r) => r.sessions > 0)
    .map((r) => ({ ...r, rate: total > 0 ? Math.min(1, r.sessions / total) : 0 }));
  return { error: null, paths, detail: { path, totalSessions: total, rows }, capped: pv.capped || sv.capped };
}

export type ExitsResult =
  | { error: DbErr }
  | { error: null; sessions: number; exited: number; top: { path: string; section: string; count: number }[]; capped: boolean };

/** 기간(UTC ISO) 안의 이탈 지점 Top — (페이지, 마지막으로 본 섹션) 조합 */
export async function exitsData(db: SupabaseClient, since: string, until: string, limit = 15, now = Date.now()): Promise<ExitsResult> {
  const all = await scanVisits(db, since, until);
  if (all.error) return { error: all.error };
  const lastBySession = new Map<string, Visit>();
  for (const v of dedupeVisits(all.rows)) lastBySession.set(v.session_id, v); // 오름차순이라 마지막 값이 세션의 마지막 방문
  const counts = new Map<string, { path: string; section: string; count: number }>();
  let exited = 0;
  for (const v of lastBySession.values()) {
    const gone = !!v.left_at || now - Date.parse(v.last_seen_at) > GONE_AFTER_MS;
    if (!gone) continue; // 아직 보고 있는 세션은 이탈이 아니다
    exited += 1;
    const section = v.last_section || "(섹션 도달 전)";
    const key = `${v.path}\u0000${section}`;
    const cur = counts.get(key);
    if (cur) cur.count += 1;
    else counts.set(key, { path: v.path, section, count: 1 });
  }
  const top = [...counts.values()].sort((a, b) => b.count - a.count).slice(0, limit);
  return { error: null, sessions: lastBySession.size, exited, top, capped: all.capped };
}
