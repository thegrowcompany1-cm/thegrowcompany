// 자체 방문 추적 조회 (관리자) — GET /api/admin/track?view=live|journey|funnel|exits
//
//  · 관리자가 아니면 401. 조회는 getAdminContext() 의 db(service role 이 있으면 그것, 없으면 관리자 세션 +
//    visits/section_views 의 관리자 이메일 select 정책)로 한다.
//  · view=live     지금 접속 중인 세션 (최근 60초 안에 핑이 온 방문)
//  · view=journey  session=<id> 한 세션의 페이지별 여정
//  · view=funnel   path=<경로>&from&to  섹션 도달 퍼널 (도달 세션 ÷ 그 경로에 들어온 세션)
//  · view=exits    이탈 지점 Top (페이지, 마지막 섹션) — from/to 가 없으면 최근 24시간
//  · view=daily    from&to  날짜별 방문 수와 유입 구성 (일별 보기 · 유입 분류) + stay(20초 이상 머문 방문 수)
//  · from/to 는 KST 날짜(YYYY-MM-DD). from 00:00:00 ~ to 23:59:59.999 KST 로 거른다. 잘못된 값은 400.
//  · 테이블이 아직 없으면(마이그레이션 전) 안내 메시지를 돌려준다.
//  · 같은 session_id + path 로 3초 안에 들어온 visits 행은 한 번의 방문으로 묶어 센다 (lib/trackDedupe.ts).
//    인앱 브라우저에서 진입 기록이 두 번 생기는 문제의 집계 쪽 안전장치다.

import { NextResponse } from "next/server";
import { getAdminContext } from "@/app/admin/_lib/guard";
import { GONE_AFTER_MS, VISIT_COLS, fetchAll, funnelData, exitsData, isMissingTable, type Visit } from "@/lib/trackAgg";
import { dedupeVisits } from "@/lib/trackDedupe";
import { kstBounds, kstDateOf, listDays, parseRange, todayKst } from "@/lib/gaRange";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };
const LIVE_WINDOW_MS = 60_000;

type Db = Awaited<ReturnType<typeof getAdminContext>> extends infer C ? (C extends { db: infer D } ? D : never) : never;

const fail = (status: number, code: string, message: string) =>
  NextResponse.json({ ok: false, code, message }, { status, headers: NO_STORE });

const iso = (ms: number) => new Date(ms).toISOString();

export async function GET(request: Request) {
  const admin = await getAdminContext();
  if (!admin) return fail(401, "UNAUTHORIZED", "권한이 없습니다.");
  const db = admin.db as Db;

  const url = new URL(request.url);
  const view = url.searchParams.get("view");
  const now = Date.now();

  // 선택 기간 (KST). from/to 가 없으면 null — 뷰마다 예전 기본값(days, 24시간)으로 돌아간다.
  const hasRange = url.searchParams.has("from") || url.searchParams.has("to");
  let period: { from: string; to: string; gte: string; lte: string } | null = null;
  if (hasRange) {
    const pr = parseRange({ from: url.searchParams.get("from"), to: url.searchParams.get("to") }, todayKst(now));
    if (!pr.ok) return fail(400, "BAD_RANGE", pr.message);
    period = { from: pr.from, to: pr.to, ...kstBounds(pr.from, pr.to) };
  }

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
      .order("entered_at", { ascending: true })
      .limit(300);
    if (error) return dbFail(error);

    // 세션당 가장 최근 방문 한 줄 (3초 안 중복 진입은 한 건으로 합친 뒤)
    const latest = new Map<string, Visit>();
    for (const v of dedupeVisits((liveVisits ?? []) as Visit[])) latest.set(v.session_id, v); // 오름차순이라 마지막 값이 최신
    const ids = [...latest.keys()];

    // 세션 시작 시각·본 페이지 수 — 오늘 안의 방문만 본다
    const starts = new Map<string, { start: string; pages: number }>();
    if (ids.length) {
      const { data: all, error: e2 } = await db
        .from("visits")
        .select(VISIT_COLS)
        .in("session_id", ids)
        .gte("entered_at", iso(now - 6 * 3600_000))
        .order("entered_at", { ascending: true })
        .limit(2000);
      if (e2) return dbFail(e2);
      for (const r of dedupeVisits((all ?? []) as Visit[])) {
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
    const visits = dedupeVisits((vis.data ?? []) as Visit[]);
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
    const since = period ? period.gte : iso(now - days * 86400_000);
    const until = period ? period.lte : iso(now);
    const path = url.searchParams.get("path") ?? "";
    const r = await funnelData(db, since, until, path || undefined);
    if (r.error) return dbFail(r.error);
    if (!r.detail) return NextResponse.json({ ok: true, days, paths: r.paths, capped: r.capped }, { headers: NO_STORE });
    return NextResponse.json(
      { ok: true, days, path: r.detail.path, totalSessions: r.detail.totalSessions, paths: r.paths, rows: r.detail.rows, capped: r.capped },
      { headers: NO_STORE },
    );
  }

  // ── 이탈 지점 Top (기간이 없으면 최근 24시간) ──────────────────────────────
  if (view === "exits") {
    const r = await exitsData(db, period ? period.gte : iso(now - 86400_000), period ? period.lte : iso(now), 15, now);
    if (r.error) return dbFail(r.error);
    return NextResponse.json({ ok: true, sessions: r.sessions, exited: r.exited, top: r.top, capped: r.capped }, { headers: NO_STORE });
  }

  // ── 날짜별 방문 수 · 유입 구성 (일별 보기) ─────────────────────────────────
  if (view === "daily") {
    if (!period) return fail(400, "BAD_RANGE", "from·to 가 필요합니다.");
    const all = await fetchAll<Visit>((f, t) =>
      db
        .from("visits")
        .select(VISIT_COLS)
        .gte("entered_at", period!.gte)
        .lte("entered_at", period!.lte)
        .order("entered_at", { ascending: true })
        .range(f, t),
    );
    if (all.error) return dbFail(all.error);

    type Day = { date: string; visits: number; sessions: number; meta: number; organic: number; ai: number; direct: number; other: number };
    const days = new Map<string, Day>(
      listDays(period.from, period.to).map((d) => [d, { date: d, visits: 0, sessions: 0, meta: 0, organic: 0, ai: 0, direct: 0, other: 0 }]),
    );
    const group = (st: string): "meta" | "organic" | "ai" | "direct" | "other" =>
      st === "paid_meta" ? "meta" : st.startsWith("organic_") ? "organic" : st === "ai" ? "ai" : st === "direct" ? "direct" : "other";
    const seenSession = new Set<string>(); // 날짜별로 한 세션은 한 번만 센다
    const total = { sessions: new Set<string>(), meta: 0, organic: 0, ai: 0, direct: 0, other: 0 };
    const stay = { visits: 0, over20: 0 }; // 방문(세션+경로, 3초 묶음) 중 20초 이상 머문 비율의 분모·분자
    for (const v of dedupeVisits(all.rows)) {
      const date = kstDateOf(v.entered_at);
      const day = days.get(date);
      if (!day) continue;
      day.visits += 1;
      stay.visits += 1;
      if ((v.duration_sec ?? 0) >= 20) stay.over20 += 1;
      const sk = `${date}|${v.session_id}`;
      if (!seenSession.has(sk)) {
        seenSession.add(sk);
        day.sessions += 1;
        day[group(v.source_type)] += 1;
      }
      if (!total.sessions.has(v.session_id)) {
        total.sessions.add(v.session_id);
        total[group(v.source_type)] += 1;
      }
    }
    return NextResponse.json(
      {
        ok: true,
        from: period.from,
        to: period.to,
        days: [...days.values()],
        stay,
        sources: { sessions: total.sessions.size, meta: total.meta, organic: total.organic, ai: total.ai, direct: total.direct, other: total.other },
        capped: all.capped,
      },
      { headers: NO_STORE },
    );
  }

  return fail(400, "BAD_VIEW", "view 값이 올바르지 않습니다.");
}
