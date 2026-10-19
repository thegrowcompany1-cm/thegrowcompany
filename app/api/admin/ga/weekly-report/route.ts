// 주간 AI 리포트 (관리자) — /api/admin/ga/weekly-report
//  · GET            리포트 목록(최신순) + 지금 만들면 잡히는 기간(next)
//  · GET ?id=<uuid> 리포트 한 건 (마크다운 본문 · 오류 내용 포함. input_json 은 용량이 커서 제외)
//  · POST {overwrite?:boolean}  직전 7일 리포트를 지금 생성. 같은 기간의 정상 리포트가 있고 overwrite 가 아니면 409.
//    메일은 자동 크론에서만 보낸다 (수동 생성 때는 보내지 않음).
//  · 관리자가 아니면 401. 생성에는 60초까지 걸릴 수 있다.

import { NextResponse } from "next/server";
import { getAdminContext } from "@/app/admin/_lib/guard";
import { runWeeklyReport } from "@/lib/weeklyRun";
import { weeklyPeriod } from "@/lib/weeklyReport";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const NO_STORE = { "Cache-Control": "no-store" };
const fail = (status: number, code: string, message: string) =>
  NextResponse.json({ ok: false, code, message }, { status, headers: NO_STORE });

const isMissingTable = (e: { code?: string; message?: string } | null) =>
  !!e && (e.code === "42P01" || e.code === "PGRST205" || /does not exist|schema cache/i.test(e.message ?? ""));
const NOT_READY = "weekly_reports 테이블이 아직 없습니다. Supabase SQL Editor 에서 supabase/migrations/20261020_weekly_reports.sql 을 실행해주세요.";

export async function GET(request: Request) {
  const admin = await getAdminContext();
  if (!admin) return fail(401, "UNAUTHORIZED", "권한이 없습니다.");

  const id = new URL(request.url).searchParams.get("id");
  if (id) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) return fail(400, "BAD_ID", "리포트 ID 가 올바르지 않습니다.");
    const { data, error } = await admin.db
      .from("weekly_reports")
      .select("id, period_from, period_to, created_at, status, summary_md, error, model")
      .eq("id", id)
      .maybeSingle();
    if (error) return isMissingTable(error) ? fail(503, "NOT_READY", NOT_READY) : fail(500, "QUERY_FAILED", "리포트를 불러오지 못했습니다.");
    if (!data) return fail(404, "NOT_FOUND", "리포트를 찾을 수 없습니다.");
    return NextResponse.json({ ok: true, report: data }, { headers: NO_STORE });
  }

  const p = weeklyPeriod();
  const { data, error } = await admin.db
    .from("weekly_reports")
    .select("id, period_from, period_to, created_at, status")
    .order("period_from", { ascending: false })
    .limit(52);
  if (error) return isMissingTable(error) ? fail(503, "NOT_READY", NOT_READY) : fail(500, "QUERY_FAILED", "리포트 목록을 불러오지 못했습니다.");
  return NextResponse.json({ ok: true, reports: data ?? [], next: { from: p.from, to: p.to } }, { headers: NO_STORE });
}

export async function POST(request: Request) {
  const admin = await getAdminContext();
  if (!admin) return fail(401, "UNAUTHORIZED", "권한이 없습니다.");

  const body = (await request.json().catch(() => null)) as { overwrite?: unknown } | null;
  const overwrite = body?.overwrite === true;
  const period = weeklyPeriod();

  const result = await runWeeklyReport({ writer: admin.db, trackDb: admin.db, period, overwrite, sendMail: false });
  if (!result.ok) {
    const status = result.code === "EXISTS" ? 409 : result.code === "NOT_READY" ? 503 : 500;
    return fail(status, result.code, result.message);
  }
  return NextResponse.json({ ok: true, status: result.status, error: result.error ?? null, period: { from: period.from, to: period.to } }, { headers: NO_STORE });
}
