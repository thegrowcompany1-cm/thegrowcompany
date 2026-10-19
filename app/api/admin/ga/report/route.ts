// 기간 리포트 — GET /api/admin/ga/report?from=YYYY-MM-DD&to=YYYY-MM-DD[&compare=1]
//
//  · 관리자가 아니면 401. 잘못된 날짜 · from>to · 1년 초과 · 미래 날짜는 400.
//  · 예전 ?range=7|28|90 도 받는다 (오늘까지 N일). from/to 가 모두 없으면 최근 28일.
//  · 모든 날짜 경계는 KST 기준이다 (GA 속성 시간대가 Asia/Seoul 이라고 가정 — lib/gaRange.ts).
//  · GA 호출·가공은 lib/gaReport.ts (주간 AI 리포트와 공용). 여기는 인증 · 캐시 · 응답만 맡는다.
//  · 서버 메모리 캐시: 키에 from/to/compare 포함. 오늘이 들어 있으면 5분, 아니면 10분.

import { NextResponse } from "next/server";
import { getAdminContext } from "@/app/admin/_lib/guard";
import { gaErrorBody } from "@/lib/ga";
import { buildGaReport } from "@/lib/gaReport";
import { parseRange, todayKst } from "@/lib/gaRange";
import type { ReportPayload } from "@/lib/gaTypes";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };
const TTL_DEFAULT_MS = 10 * 60 * 1000;
const TTL_TODAY_MS = 5 * 60 * 1000;
const CACHE_MAX = 60;

const cache = new Map<string, { at: number; ttl: number; data: ReportPayload }>();

const bad = (message: string) =>
  NextResponse.json({ ok: false, code: "BAD_RANGE", message }, { status: 400, headers: NO_STORE });

export async function GET(request: Request) {
  const admin = await getAdminContext();
  if (!admin) {
    return NextResponse.json({ ok: false, code: "UNAUTHORIZED", message: "권한이 없습니다." }, { status: 401, headers: NO_STORE });
  }

  const q = new URL(request.url).searchParams;
  const today = todayKst();
  const parsed = parseRange({ from: q.get("from"), to: q.get("to"), range: q.get("range") }, today);
  if (!parsed.ok) return bad(parsed.message);
  const { from, to } = parsed;
  const compare = q.get("compare") === "1";
  const includesToday = to >= today;

  const key = `${from}|${to}|${compare ? 1 : 0}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < hit.ttl) {
    return NextResponse.json(hit.data, { headers: NO_STORE });
  }

  try {
    const data = await buildGaReport(from, to, compare);
    if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value as string); // 가장 오래된 항목부터 비운다
    cache.set(key, { at: Date.now(), ttl: includesToday ? TTL_TODAY_MS : TTL_DEFAULT_MS, data });
    return NextResponse.json(data, { headers: NO_STORE });
  } catch (err) {
    const { status, body } = gaErrorBody(err);
    return NextResponse.json(body, { status, headers: NO_STORE });
  }
}
