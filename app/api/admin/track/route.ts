// 자체 방문 추적 조회 (관리자) — GET /api/admin/track?view=live|journey|funnel|exits
//
//  · 관리자가 아니면 401. 조회는 getAdminContext() 의 db(service role 이 있으면 그것, 없으면 관리자 세션 +
//    visits/section_views 의 관리자 이메일 select 정책)로 한다.
//  · view=live     지금 접속 중인 세션 (최근 60초 안에 핑이 온 방문)
//  · view=journey  session=<id> 한 세션의 페이지별 여정
//  · view=funnel   path=<경로>&days=7 섹션 도달 퍼널 (도달 세션 ÷ 그 경로에 들어온 세션)
//  · view=exits    최근 24시간 이탈 지점 Top (페이지, 마지막 섹션)
//  · 테이블이 아직 없으면(마이그레이션 전) 안내 메시지를 돌려준다.

import { NextResponse } from "next/server";
import { getAdminContext } from "@/app/admin/_lib/guard";
import { TRACK_SECTION_ORDER } from "@/lib/trackSections";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };
const LIVE_WINDOW_MS = 60_000;
/** 마지막 핑이 이보다 오래됐으면 이탈한 것으로 본다 */
const GONE_AFTER_MS = 90_000;
const PAGE = 1000;
const CAP = 20_000;

type Visit = {
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

type Db = Awaited<ReturnType<typeof getAdminContext>> extends infer C ? (C extends { db: infer D } ? D : never) : never;

const VISIT_COLS =
  "id, session_id, visitor_id, path, referrer, utm_source, utm_medium, utm_campaign, source_type, device, entered_at, left_at, last_seen_at, duration_sec, max_scroll_pct, last_section";

const fail = (status: number, code: string, message: string) =>
  NextResponse.json({ ok: false, code, message }, { status, headers: NO_STORE });

const isMissingTable = (e: { code?: string; message?: string } | null) =>
  !!e && (e.code === "42P01" || e.code === "PGRST205" || /does not exist|schema cache/i.test(e.message ?? ""));

/** PostgREST 는 한 번에 1000행까지라 페이지를 넘겨 가며 모은다 */
async function fetchAll<T>(
  build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { code?: string; message?: string } | null }>,
): Promise<{ rows: T[]; error: { code?: string; message?: string } | null }> {
  const rows: T[] = [];
  for (let from = 0; from < CAP; from += PAGE) {
    const { data, error } = await build(from, from + PAGE - 1);
    if (error) return { rows, error };
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return { rows, error: null };
}

const iso = (ms: number) => new Date(ms).toISOString();

export async function GET(request: Request) {
  const admin = await getAdminContext();
  if (!admin) return fail(401, "UNAUTHORIZED", "권한이 없습니다.");
  const db = admin.db as Db;

  const url = new URL(request.url);
  const view = url.searchParams.get("view");
  const now = Date.now();

  const notReady = () =>
    fail(
      503,
      "TRACK_NOT_READY",
      "방문 기록 테이블이 아직 없습니다. Supabase SQL Editor 에서 supabase/migrations/20261019_visit_tracking.sql 을 실행해주세요.",
    );
  const dbFail = (e: { code?: string; message?: string }) => {
    if (isMissingTable(e)) return notReady();
    console.error("방문 기록 조회 실패:", e.message);
    return fail(500, "TRACK_QUERY_FAILED", "방문 기록을 불러오지 못했습니다.");
  };

  // ── 지금 접속 중인 세션 ────────────────────────────────────────────────────
  if (view === "live") {
    const { data: liveVisits, error } = await db
      .from("visits")
      .select(VISIT_COLS)
      .gte("last_seen_at", iso(now - LIVE_WINDOW_MS))
      .is("left_at", null)
      .order("entered_at", { ascending: false })
      .limit(300);
    if (error) return dbFail(error);

    // 세션당 가장 최근 방문 한 줄
    const latest = new Map<string, Visit>();
    for (const v of (liveVisits ?? []) as Visit[]) if (!latest.has(v.session_id)) latest.set(v.session_id, v);
    const ids = [...latest.keys()];

    // 세션 시작 시각·본 페이지 수 — 오늘 안의 방문만 본다
    const starts = new Map<string, { start: string; pages: number }>();
    if (ids.length) {
      const { data: all, error: e2 } = await db
        .from("visits")
        .select("session_id, entered_at")
        .in("session_id", ids)
        .gte("entered_at", iso(now - 6 * 3600_000))
        .limit(2000);
      if (e2) return dbFail(e2);
      for (const r of (all ?? []) as { session_id: string; entered_at: string }[]) {
        const cur = starts.get(r.session_id);
        if (!cur) starts.set(r.session_id, { start: r.entered_at, pages: 1 });
        else {
          cur.pages += 1;
          if (r.entered_at < cur.start) cur.start = r.entered_at;
        }
      }
    }

    const sessions = ids.map((sid) => {
      const v = latest.get(sid)!;
      const meta = starts.get(sid);
      return {
        sessionId: sid,
        sourceType: v.source_type,
        device: v.device,
        path: v.path,
        enteredAt: v.entered_at,
        sessionStart: meta?.start ?? v.entered_at,
        pages: meta?.pages ?? 1,
        durationSec: v.duration_sec ?? 0,
        maxScrollPct: v.max_scroll_pct ?? 0,
        lastSection: v.last_section,
        referrer: v.referrer,
        utmSource: v.utm_source,
        utmCampaign: v.utm_campaign,
      };
    });
    return NextResponse.json({ ok: true, now: iso(now), sessions }, { headers: NO_STORE });
  }

  // ── 한 세션의 여정 ─────────────────────────────────────────────────────────
  if (view === "journey") {
    const sid = url.searchParams.get("session") ?? "";
    if (!/^[A-Za-z0-9_-]{8,64}$/.test(sid)) return fail(400, "BAD_SESSION", "세션 ID 가 올바르지 않습니다.");
    const [vis, secs] = await Promise.all([
      db.from("visits").select(VISIT_COLS).eq("session_id", sid).order("entered_at", { ascending: true }).limit(200),
      db.from("section_views").select("path, section, seen_at").eq("session_id", sid).order("seen_at", { ascending: true }).limit(500),
    ]);
    if (vis.error) return dbFail(vis.error);
    if (secs.error) return dbFail(secs.error);
    const visits = (vis.data ?? []) as Visit[];
    const last = visits[visits.length - 1];
    const ended = !!last && (!!last.left_at || now - Date.parse(last.last_seen_at) > GONE_AFTER_MS);
    return NextResponse.json(
      {
        ok: true,
        sessionId: sid,
        ended,
        pages: visits.map((v) => ({
          path: v.path,
          enteredAt: v.entered_at,
          durationSec: v.duration_sec ?? 0,
          maxScrollPct: v.max_scroll_pct ?? 0,
          lastSection: v.last_section,
          sourceType: v.source_type,
        })),
        sections: (secs.data ?? []) as { path: string; section: string; seen_at: string }[],
      },
      { headers: NO_STORE },
    );
  }

  // ── 랜딩별 섹션 도달 퍼널 ──────────────────────────────────────────────────
  if (view === "funnel") {
    const days = Math.min(Math.max(Number(url.searchParams.get("days")) || 7, 1), 90);
    const since = iso(now - days * 86400_000);
    const path = url.searchParams.get("path") ?? "";

    // 경로 목록: 방문이 있는 경로 (세션 수 많은 순)
    const pv = await fetchAll<{ path: string; session_id: string }>((f, t) =>
      db.from("visits").select("path, session_id").gte("entered_at", since).order("entered_at", { ascending: false }).range(f, t),
    );
    if (pv.error) return dbFail(pv.error);
    const sessionsByPath = new Map<string, Set<string>>();
    for (const r of pv.rows) {
      if (!sessionsByPath.has(r.path)) sessionsByPath.set(r.path, new Set());
      sessionsByPath.get(r.path)!.add(r.session_id);
    }
    const paths = [...sessionsByPath.entries()]
      .map(([p, s]) => ({ path: p, sessions: s.size, tracked: p in TRACK_SECTION_ORDER }))
      .filter((p) => p.tracked)
      .sort((a, b) => b.sessions - a.sessions);

    if (!path) return NextResponse.json({ ok: true, days, paths }, { headers: NO_STORE });

    const total = sessionsByPath.get(path)?.size ?? 0;
    const sv = await fetchAll<{ session_id: string; section: string }>((f, t) =>
      db.from("section_views").select("session_id, section").eq("path", path).gte("seen_at", since).order("seen_at", { ascending: false }).range(f, t),
    );
    if (sv.error) return dbFail(sv.error);
    const reached = new Map<string, Set<string>>();
    for (const r of sv.rows) {
      if (!reached.has(r.section)) reached.set(r.section, new Set());
      reached.get(r.section)!.add(r.session_id);
    }
    const order = TRACK_SECTION_ORDER[path] ?? [...reached.keys()];
    // 페이지에 없는(숨겨진) 섹션은 도달 0 이어도 막대를 그리지 않는다 — 한 번도 안 본 섹션은 제외
    const rows = order
      .filter((s) => reached.has(s))
      .map((s) => ({ section: s, sessions: reached.get(s)!.size }))
      .map((r) => ({ ...r, rate: total > 0 ? Math.min(1, r.sessions / total) : 0 }));
    return NextResponse.json({ ok: true, days, path, totalSessions: total, paths, rows }, { headers: NO_STORE });
  }

  // ── 최근 24시간 이탈 지점 Top ──────────────────────────────────────────────
  if (view === "exits") {
    const all = await fetchAll<Visit>((f, t) =>
      db.from("visits").select(VISIT_COLS).gte("entered_at", iso(now - 86400_000)).order("entered_at", { ascending: true }).range(f, t),
    );
    if (all.error) return dbFail(all.error);
    const lastBySession = new Map<string, Visit>();
    for (const v of all.rows) lastBySession.set(v.session_id, v); // 오름차순이라 마지막 값이 세션의 마지막 방문
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
    const top = [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 15);
    return NextResponse.json({ ok: true, sessions: lastBySession.size, exited, top }, { headers: NO_STORE });
  }

  return fail(400, "BAD_VIEW", "view 값이 올바르지 않습니다.");
}
