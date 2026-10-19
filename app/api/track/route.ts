// 익명 방문 기록 수집 — POST /api/track
//
//  · VisitTracker(클라이언트)가 보낸다. 이탈 시에는 navigator.sendBeacon 이라 본문이 text/plain 이므로
//    JSON 으로 직접 파싱한다.
//  · 기록은 Supabase 의 security definer 함수(track_*)로만 한다 (supabase/migrations/20261019_visit_tracking.sql).
//    테이블에 직접 insert/update 하지 않으므로 anon 키로 호출해도 안전하다.
//  · 개인정보는 받지 않는다. 허용 필드만 골라 길이를 자르고, 경로는 쿼리스트링을 떼서 저장한다.
//  · 봇 UA 는 기록하지 않는다. 응답은 항상 204 에 가깝게 빠르게 돌려준다 (추적 실패가 사이트에 영향 없게).

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BOT_RE = /bot|crawl|spider|slurp|facebookexternalhit|bingpreview|headless|lighthouse|pagespeed|monitor|uptime|curl|wget|python-requests|node-fetch|axios|go-http/i;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ID_RE = /^[A-Za-z0-9_-]{8,64}$/;
const SOURCE_TYPES = new Set(["paid_meta", "organic_google", "organic_naver", "organic_other", "ai", "direct", "referral"]);
const DEVICES = new Set(["mobile", "tablet", "desktop"]);

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// 간단한 방문자별 호출 제한 (서버리스 인스턴스 단위) — 폭주 방지용
const hits = new Map<string, { n: number; at: number }>();
function limited(key: string): boolean {
  const now = Date.now();
  const h = hits.get(key);
  if (!h || now - h.at > 60_000) {
    hits.set(key, { n: 1, at: now });
    if (hits.size > 5000) hits.clear();
    return false;
  }
  h.n += 1;
  return h.n > 60;
}

const text = (v: unknown, max: number): string | null => {
  if (typeof v !== "string") return null;
  const s = v.trim().slice(0, max);
  return s || null;
};
const int = (v: unknown, max: number): number => {
  const n = typeof v === "number" ? Math.round(v) : Number.parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), max) : 0;
};
/** 경로만 남긴다 (쿼리·해시 제거, 슬래시로 시작) */
const cleanPath = (v: unknown): string | null => {
  const s = text(v, 300);
  if (!s || !s.startsWith("/")) return null;
  return s.split(/[?#]/)[0] || "/";
};

const done = () => new NextResponse(null, { status: 204 });

export async function POST(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOT_RE.test(ua)) return done();

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await request.text()) as Record<string, unknown>;
  } catch {
    return done();
  }

  const type = body.type;
  const visitor = typeof body.visitorId === "string" && ID_RE.test(body.visitorId) ? body.visitorId : null;
  if (!visitor || limited(visitor)) return done();

  try {
    if (type === "start") {
      const id = typeof body.id === "string" && UUID_RE.test(body.id) ? body.id : null;
      const session = typeof body.sessionId === "string" && ID_RE.test(body.sessionId) ? body.sessionId : null;
      const path = cleanPath(body.path);
      if (!id || !session || !path || path.startsWith("/admin") || path.startsWith("/api")) return done();
      const st = text(body.sourceType, 30);
      const dv = text(body.device, 20);
      await db.rpc("track_visit_start", {
        p_id: id,
        p_visitor: visitor,
        p_session: session,
        p_path: path,
        p_referrer: text(body.referrer, 300),
        p_utm_source: text(body.utmSource, 100),
        p_utm_medium: text(body.utmMedium, 100),
        p_utm_campaign: text(body.utmCampaign, 150),
        p_source_type: st && SOURCE_TYPES.has(st) ? st : "direct",
        p_device: dv && DEVICES.has(dv) ? dv : null,
      });
    } else if (type === "ping" || type === "end") {
      const id = typeof body.id === "string" && UUID_RE.test(body.id) ? body.id : null;
      if (!id) return done();
      await db.rpc("track_visit_ping", {
        p_id: id,
        p_duration: int(body.durationSec, 86400),
        p_scroll: int(body.maxScrollPct, 100),
        p_section: text(body.lastSection, 60),
        p_end: type === "end",
      });
    } else if (type === "section") {
      const session = typeof body.sessionId === "string" && ID_RE.test(body.sessionId) ? body.sessionId : null;
      const path = cleanPath(body.path);
      const section = text(body.section, 60);
      if (!session || !path || !section || path.startsWith("/admin")) return done();
      await db.rpc("track_section", { p_session: session, p_path: path, p_section: section });
    }
  } catch (err) {
    // 추적 실패는 조용히 넘긴다 (함수가 아직 DB 에 없을 때도 사이트는 정상)
    console.error("방문 기록 실패:", err instanceof Error ? err.message : err);
  }
  return done();
}
