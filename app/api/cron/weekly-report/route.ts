// 주간 AI 리포트 크론 — GET /api/cron/weekly-report
//  · vercel.json 의 crons 가 매주 목요일 23:00 UTC(= KST 금요일 08:00)에 부른다.
//  · Authorization: Bearer ${CRON_SECRET} 이 아니면 401 (CRON_SECRET 이 비어 있어도 401).
//  · 기간은 호출 시점(KST) 기준 직전 7일. 같은 기간의 정상 리포트가 이미 있으면 건너뛴다(중복 호출 안전).
//  · 저장·추적 조회에는 SUPABASE_SERVICE_ROLE_KEY 가 필요하다.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { runWeeklyReport } from "@/lib/weeklyRun";
import { weeklyPeriod } from "@/lib/weeklyReport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401, headers: NO_STORE });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json(
      { ok: false, code: "NO_SERVICE_ROLE", message: "SUPABASE_SERVICE_ROLE_KEY 가 설정되지 않아 리포트를 저장할 수 없습니다." },
      { status: 500, headers: NO_STORE },
    );
  }
  const db = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

  const period = weeklyPeriod();
  const result = await runWeeklyReport({ writer: db, trackDb: db, period, overwrite: false, sendMail: true });
  const status = result.ok || result.code === "EXISTS" ? 200 : 500;
  return NextResponse.json({ period: { from: period.from, to: period.to }, ...result }, { status, headers: NO_STORE });
}
