// 주간 AI 리포트 — 1단계: 데이터 수집 (서버 전용)
//
//  · 기간: 오늘 기준 직전 7일(어제까지, KST). 금요일 아침에 돌리면 "지난주 금 ~ 이번 주 목" 이 된다.
//    비교 기간은 그 바로 앞 7일.
//  · 기존 GA(lib/gaReport.ts) · 서치콘솔(lib/gsc.ts) · 자체 추적(lib/trackAgg.ts) 집계를 그대로 재사용한다.
//  · 결과(WeeklyInput)는 집계 숫자뿐이다. visitor_id · session_id · IP · 개인정보는 넣지 않는다.
//  · 소스 하나가 실패해도 나머지로 리포트를 만든다 — 실패한 소스는 { available:false, reason } 로 남겨
//    AI 가 "데이터 없음" 으로 쓰게 한다. 단, GA 가 실패하면 분석할 게 없으므로 예외를 던진다.

import type { SupabaseClient } from "@supabase/supabase-js";
import { addDays, kstBounds, todayKst } from "@/lib/gaRange";
import { buildGaReport } from "@/lib/gaReport";
import { GOOD_SEC, MIN_SESSIONS, buildChannelCompare, judgeLanding, VERDICT_LABEL } from "@/lib/gaInsights";
import { gscErrorBody, fetchGsc } from "@/lib/gsc";
import { exitsData, funnelData } from "@/lib/trackAgg";
import { TRACK_SECTION_LABEL } from "@/lib/trackSections";
import type { LandingRow, ReportPayload } from "@/lib/gaTypes";

export const WEEKLY_DAYS = 7;
/** 퍼널을 보여줄 랜딩의 최소 세션 */
export const FUNNEL_MIN_SESSIONS = 30;
const LANDING_LIMIT = 15;

export type WeeklyPeriod = { from: string; to: string; prevFrom: string; prevTo: string };

/** today(KST) 기준 직전 7일 + 그 앞 7일 */
export function weeklyPeriod(today = todayKst()): WeeklyPeriod {
  const to = addDays(today, -1);
  const from = addDays(to, -(WEEKLY_DAYS - 1));
  return { from, to, prevFrom: addDays(from, -WEEKLY_DAYS), prevTo: addDays(from, -1) };
}

type Unavailable = { available: false; reason: string };

const r1 = (v: number) => Math.round(v * 10) / 10;
const r3 = (v: number) => Math.round(v * 1000) / 1000;

function landingRows(cur: LandingRow[], prev: LandingRow[]) {
  const prevBy = new Map(prev.map((l) => [l.landing, l]));
  return cur.slice(0, LANDING_LIMIT).map((l) => {
    const p = prevBy.get(l.landing);
    return {
      landing: l.landing,
      sessions: l.sessions,
      engagementRate: r3(l.engagementRate),
      avgEngagementSec: r1(l.avgEngagementSec),
      verdict: VERDICT_LABEL[judgeLanding(l.avgEngagementSec, l.sessions)],
      keyEvents: l.keyEvents,
      prev: p ? { sessions: p.sessions, avgEngagementSec: r1(p.avgEngagementSec), keyEvents: p.keyEvents } : null,
    };
  });
}

function channelRows(rep: ReportPayload) {
  return buildChannelCompare(rep).map((c) => ({
    channel: c.label,
    sessions: c.sessions,
    users: c.users,
    engagementRate: r3(c.engagementRate),
    keyEvents: c.keyEvents,
  }));
}

const kpi = (rep: ReportPayload) => ({
  users: rep.totals.users,
  sessions: rep.totals.sessions,
  engagementRate: r3(rep.totals.engagementRate),
  avgSessionDurationSec: r1(rep.totals.avgSessionDuration),
  keyEvents: rep.totals.keyEvents,
});

export async function collectWeeklyInput(db: SupabaseClient | null, period: WeeklyPeriod) {
  const { from, to, prevFrom, prevTo } = period;

  const [cur, prev] = await Promise.all([buildGaReport(from, to, false), buildGaReport(prevFrom, prevTo, false)]);

  // 서치콘솔 (실패해도 계속)
  let gsc:
    | Unavailable
    | {
        available: true;
        delayedNote: string | null;
        queries: { query: string; clicks: number; impressions: number; ctr: number; position: number }[];
        opportunities: { query: string; clicks: number; impressions: number; ctr: number; position: number }[];
        pages: { page: string; clicks: number; impressions: number; ctr: number; position: number }[];
      };
  try {
    const g = await fetchGsc(from, to);
    const q = (r: { key: string; clicks: number; impressions: number; ctr: number; position: number }) => ({
      query: r.key,
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: r3(r.ctr),
      position: r1(r.position),
    });
    gsc = {
      available: true,
      delayedNote: g.delayed ? "서치콘솔은 약 2~3일 지연돼 기간 끝 며칠은 비어 있거나 작을 수 있음" : null,
      queries: g.queries.slice(0, 50).map(q),
      opportunities: g.opportunities.map(q),
      pages: g.pages.slice(0, 30).map((r) => ({
        page: r.key.replace(/^https?:\/\/[^/]+/, "") || "/",
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: r3(r.ctr),
        position: r1(r.position),
      })),
    };
  } catch (err) {
    gsc = { available: false, reason: gscErrorBody(err).body.message };
  }

  // 자체 추적: 세션 30 이상 랜딩의 섹션 퍼널 + 이탈 지점 Top 10
  let tracking:
    | Unavailable
    | {
        available: true;
        funnels: { path: string; sessions: number; sections: { section: string; label: string; sessions: number; reachRate: number }[] }[];
        smallSampleLandings: { path: string; sessions: number }[];
        exits: { path: string; lastSection: string; sessions: number }[];
        exitedSessions: number;
      };
  if (!db) {
    tracking = { available: false, reason: "서버에 Supabase 조회 키가 없어 자체 추적 데이터를 읽지 못함" };
  } else {
    try {
      const { gte, lte } = kstBounds(from, to);
      const list = await funnelData(db, gte, lte);
      if (list.error) throw new Error(list.error.message ?? "방문 기록 조회 실패");
      const big = list.paths.filter((p) => p.sessions >= FUNNEL_MIN_SESSIONS);
      const funnels = [];
      for (const p of big.slice(0, 6)) {
        const f = await funnelData(db, gte, lte, p.path);
        if (f.error || !f.detail) continue;
        funnels.push({
          path: p.path,
          sessions: f.detail.totalSessions,
          sections: f.detail.rows.map((r) => ({ section: r.section, label: TRACK_SECTION_LABEL[r.section] ?? r.section, sessions: r.sessions, reachRate: r3(r.rate) })),
        });
      }
      const ex = await exitsData(db, gte, lte, 10);
      if (ex.error) throw new Error(ex.error.message ?? "방문 기록 조회 실패");
      tracking = {
        available: true,
        funnels,
        smallSampleLandings: list.paths.filter((p) => p.sessions < FUNNEL_MIN_SESSIONS).map((p) => ({ path: p.path, sessions: p.sessions })),
        exits: ex.top.map((t) => ({ path: t.path, lastSection: TRACK_SECTION_LABEL[t.section] ?? t.section, sessions: t.count })),
        exitedSessions: ex.exited,
      };
    } catch (err) {
      tracking = { available: false, reason: `자체 추적 조회 실패 (${err instanceof Error ? err.message : "원인 미상"})` };
    }
  }

  return {
    period: { from, to, days: WEEKLY_DAYS },
    prevPeriod: { from: prevFrom, to: prevTo },
    notes: [
      `랜딩 판정 기준: 평균 참여 ${GOOD_SEC}초 이상 양호, 세션 ${MIN_SESSIONS} 미만은 표본 적음`,
      "GA 는 '20초 이상 머문 세션 비율' 을 직접 주지 않는다. 대신 참여율(engagementRate = 10초 이상 · 전환 · 2페이지 이상) 과 랜딩별 평균 참여 시간(avgEngagementSec)으로 판단할 것",
      "channel 은 GA 기본 채널 기준(메타광고 = Paid Social). AI 행은 소스 합계라 다른 채널과 중복될 수 있음",
      "금액·매출 데이터는 없음",
    ],
    kpi: { current: kpi(cur), previous: kpi(prev) },
    channels: { current: channelRows(cur), previous: channelRows(prev) },
    landings: landingRows(cur.landings, prev.landings),
    organic: {
      sources: cur.organic.sources.map((s) => ({ source: s.source, sessions: s.sessions, engagementRate: r3(s.engagementRate) })),
      landings: landingRows(cur.organic.landings, prev.organic.landings),
    },
    ai: {
      sources: cur.ai.sources.map((s) => ({ source: s.source, sessions: s.sessions, users: s.users, engagementRate: r3(s.engagementRate), keyEvents: s.keyEvents })),
      previousSessions: prev.ai.sources.reduce((n, s) => n + s.sessions, 0),
      landings: landingRows(cur.ai.landings, prev.ai.landings),
    },
    searchConsole: gsc,
    tracking,
  };
}

export type WeeklyInput = Awaited<ReturnType<typeof collectWeeklyInput>>;
