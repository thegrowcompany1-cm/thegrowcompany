// 주간 AI 리포트 — 실행 (수집 → 분석 → 저장 → 메일). 크론 라우트와 관리자 "지금 생성" 이 같이 쓴다. 서버 전용.
//  · 저장은 security definer 함수 save_weekly_report() 로만 한다 (supabase/migrations/20261020_weekly_reports.sql).
//    service role 클라이언트든 관리자 세션 클라이언트든 같은 함수를 부른다.
//  · 수집·분석 중 실패하면 error 행으로 저장한다 (같은 기간을 다시 만들면 덮어쓴다).

import type { SupabaseClient } from "@supabase/supabase-js";
import { WEEKLY_MODEL, analyzeWeekly } from "@/lib/weeklyAi";
import { sendWeeklyMail, type MailResult } from "@/lib/weeklyMail";
import { collectWeeklyInput, type WeeklyPeriod } from "@/lib/weeklyReport";

export type RunResult =
  | { ok: true; status: "ok" | "error"; error?: string; mail: MailResult | null }
  | { ok: false; code: "EXISTS" | "NOT_READY" | "SAVE_FAILED"; message: string };

const isMissingTable = (e: { code?: string; message?: string } | null) =>
  !!e && (e.code === "42P01" || e.code === "PGRST205" || e.code === "PGRST202" || /does not exist|schema cache/i.test(e.message ?? ""));

const NOT_READY_MSG =
  "weekly_reports 테이블 또는 save_weekly_report 함수가 아직 없습니다. Supabase SQL Editor 에서 supabase/migrations/20261020_weekly_reports.sql 을 실행해주세요.";

/**
 * @param writer   weekly_reports 읽기·저장에 쓰는 클라이언트 (service role 또는 관리자 세션)
 * @param trackDb  자체 추적 조회용 클라이언트 (없으면 추적 섹션은 '데이터 없음')
 * @param overwrite true 면 같은 기간의 정상(ok) 리포트도 덮어쓴다. false 면 error 행만 덮어쓴다.
 */
export async function runWeeklyReport(opts: {
  writer: SupabaseClient;
  trackDb: SupabaseClient | null;
  period: WeeklyPeriod;
  overwrite: boolean;
  sendMail: boolean;
}): Promise<RunResult> {
  const { writer, trackDb, period, overwrite, sendMail } = opts;

  const ex = await writer.from("weekly_reports").select("status").eq("period_from", period.from).eq("period_to", period.to).maybeSingle();
  if (ex.error) {
    if (isMissingTable(ex.error)) return { ok: false, code: "NOT_READY", message: NOT_READY_MSG };
    console.error("주간 리포트 조회 실패:", ex.error.message);
    return { ok: false, code: "SAVE_FAILED", message: "기존 리포트를 확인하지 못했습니다." };
  }
  if (ex.data && ex.data.status === "ok" && !overwrite) {
    return { ok: false, code: "EXISTS", message: "같은 기간의 리포트가 이미 있습니다." };
  }

  let inputJson: unknown = null;
  let summary: string | null = null;
  let error: string | null = null;
  try {
    const input = await collectWeeklyInput(trackDb, period);
    inputJson = input;
    const ai = await analyzeWeekly(input);
    if (ai.ok) summary = ai.markdown;
    else error = ai.error;
  } catch (err) {
    console.error("주간 리포트 수집 실패:", err);
    error = `데이터 수집 실패: ${err instanceof Error ? err.message : String(err)}`.slice(0, 500);
  }

  const status = summary ? "ok" : "error";
  const saved = await writer.rpc("save_weekly_report", {
    p_period_from: period.from,
    p_period_to: period.to,
    p_status: status,
    p_summary_md: summary,
    p_input_json: inputJson,
    p_error: error,
    p_model: WEEKLY_MODEL,
  });
  if (saved.error) {
    console.error("주간 리포트 저장 실패:", saved.error.message);
    if (isMissingTable(saved.error)) return { ok: false, code: "NOT_READY", message: NOT_READY_MSG };
    return { ok: false, code: "SAVE_FAILED", message: "리포트를 저장하지 못했습니다." };
  }

  const mail = status === "ok" && sendMail && summary ? await sendWeeklyMail({ from: period.from, to: period.to, markdown: summary }) : null;
  return { ok: true, status, ...(error ? { error } : {}), mail };
}
