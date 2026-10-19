// /admin/ga 표 상단의 "한 줄 자동 코멘트" — 규칙 기반 (AI 호출 없음).
// 입력은 서버가 준 리포트 값이고, 출력은 사람이 읽는 문장 한 줄(없으면 null)이다.
// 순수 함수라 화면과 분리해 단위로 확인할 수 있다.

import type { LandingRow, AiSourceRow, ReportPayload, GscRow } from "@/lib/gaTypes";

/** 표본이 너무 적은 랜딩은 판정하지 않는다 */
export const MIN_SESSIONS = 10;
export const GOOD_SEC = 20;
export const MID_SEC = 10;

export type Verdict = "good" | "mid" | "bad" | "low";

/** 평균 참여시간(초)과 세션 수로 랜딩 판정 — 20초 이상 좋음 / 10~20초 보통 / 10초 미만 개선 필요 / 세션 10 미만 표본 적음 */
export function judgeLanding(avgSec: number, sessions: number): Verdict {
  if (sessions < MIN_SESSIONS) return "low";
  if (avgSec >= GOOD_SEC) return "good";
  if (avgSec >= MID_SEC) return "mid";
  return "bad";
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  good: "좋음",
  mid: "보통",
  bad: "개선 필요",
  low: "표본 적음",
};

const sec = (v: number) => `${Math.round(v)}초`;

/** 가장 나쁜 랜딩(표본 충분한 것 중 평균 참여가 가장 짧은 것)을 짚는다 */
function worst(rows: LandingRow[]): LandingRow | null {
  const ok = rows.filter((r) => r.sessions >= MIN_SESSIONS);
  if (!ok.length) return null;
  return [...ok].sort((a, b) => a.avgEngagementSec - b.avgEngagementSec)[0];
}

/** 랜딩 성과 한 줄 코멘트. label 은 "랜딩" / "자연검색 랜딩" / "AI 유입 랜딩" 처럼 앞에 붙는 말 */
export function landingInsight(rows: LandingRow[], label = "랜딩"): string | null {
  if (!rows.length) return null;
  const w = worst(rows);
  if (!w) return `${label}: 세션 ${MIN_SESSIONS} 이상인 페이지가 아직 없어 판정하지 않습니다 (표본 적음)`;
  if (judgeLanding(w.avgEngagementSec, w.sessions) === "bad") {
    return `${label} 중 ${w.landing} 평균 참여 ${sec(w.avgEngagementSec)} — 상단 카피 점검 필요`;
  }
  if (w.avgEngagementSec < GOOD_SEC) {
    return `${label} 중 ${w.landing} 평균 참여 ${sec(w.avgEngagementSec)}로 가장 짧습니다 — 20초 이상을 목표로 첫 화면 이후 흐름 점검`;
  }
  return `${label}: 표본이 충분한 페이지는 모두 평균 참여 ${GOOD_SEC}초 이상입니다`;
}

/** 서치콘솔 한 줄 코멘트 */
export function searchInsight(opps: GscRow[]): string | null {
  if (!opps.length) return "기회 키워드(노출 50 이상 · 4~15위)가 아직 없습니다";
  const top = opps[0];
  return `기회 키워드 ${opps.length}개 — '${top.key}' (노출 ${top.impressions.toLocaleString("ko-KR")}, 평균 ${top.position.toFixed(1)}위)부터 제목·본문 보강을 권장`;
}

/** AI 검색 유입 한 줄 코멘트 */
export function aiInsight(sources: AiSourceRow[]): string | null {
  const total = sources.reduce((s, r) => s + r.sessions, 0);
  if (!total) return "AI 검색에서 들어온 세션이 아직 없습니다 — FAQ·답변형 문장을 늘리면 인용 가능성이 올라갑니다";
  const top = [...sources].sort((a, b) => b.sessions - a.sessions)[0];
  return `AI 유입 ${total.toLocaleString("ko-KR")}세션 — 가장 많은 소스는 ${top.source} (${top.sessions.toLocaleString("ko-KR")}세션, 참여율 ${(top.engagementRate * 100).toFixed(0)}%)`;
}

export type ChannelCompareRow = {
  key: string;
  label: string;
  sessions: number;
  users: number;
  engagementRate: number;
  avgSessionDuration: number;
  keyEvents: number;
};

/** 채널 비교 표 5행: Paid Social(메타) / Organic Search / Direct / Referral / AI(소스 합계) */
export function buildChannelCompare(report: ReportPayload): ChannelCompareRow[] {
  const by = (name: string) => report.channels.find((c) => c.channel === name);
  const pick = (key: string, label: string, name: string): ChannelCompareRow => {
    const c = by(name);
    return {
      key,
      label,
      sessions: c?.sessions ?? 0,
      users: c?.users ?? 0,
      engagementRate: c?.engagementRate ?? 0,
      avgSessionDuration: c?.avgSessionDuration ?? 0,
      keyEvents: c?.keyEvents ?? 0,
    };
  };
  const ai = report.ai.sources;
  const sessions = ai.reduce((s, r) => s + r.sessions, 0);
  const weighted = (f: (r: AiSourceRow) => number) => (sessions ? ai.reduce((s, r) => s + f(r) * r.sessions, 0) / sessions : 0);
  return [
    pick("paid", "메타 광고 (Paid Social)", "Paid Social"),
    pick("organic", "자연검색 (Organic Search)", "Organic Search"),
    pick("direct", "직접 (Direct)", "Direct"),
    pick("referral", "추천 (Referral)", "Referral"),
    {
      key: "ai",
      label: "AI 검색",
      sessions,
      users: ai.reduce((s, r) => s + r.users, 0),
      engagementRate: weighted((r) => r.engagementRate),
      avgSessionDuration: weighted((r) => r.avgSessionDuration),
      keyEvents: ai.reduce((s, r) => s + r.keyEvents, 0),
    },
  ];
}

export function channelInsight(rows: ChannelCompareRow[]): string | null {
  const active = rows.filter((r) => r.sessions >= MIN_SESSIONS);
  if (active.length < 2) return "비교할 채널의 표본(세션 10 이상)이 아직 부족합니다";
  const best = [...active].sort((a, b) => b.engagementRate - a.engagementRate)[0];
  const low = [...active].sort((a, b) => a.engagementRate - b.engagementRate)[0];
  const paid = rows.find((r) => r.key === "paid");
  const organic = rows.find((r) => r.key === "organic");
  let line = `참여율은 ${best.label} ${(best.engagementRate * 100).toFixed(0)}%가 가장 높고 ${low.label} ${(low.engagementRate * 100).toFixed(0)}%가 가장 낮습니다`;
  if (paid && organic && paid.sessions >= MIN_SESSIONS && organic.sessions >= MIN_SESSIONS && paid.avgSessionDuration < organic.avgSessionDuration * 0.6) {
    line += " — 광고 유입의 평균 세션 시간이 자연검색의 60% 미만이라 광고 소재와 랜딩 첫 화면의 일치 여부 점검 필요";
  }
  return line;
}

/** 섹션 도달 퍼널에서 가장 많이 떨어지는 구간 */
export function funnelDrop(rows: { section: string; rate: number }[]): { from: string; to: string; drop: number; index: number } | null {
  let best: { from: string; to: string; drop: number; index: number } | null = null;
  for (let i = 1; i < rows.length; i++) {
    const drop = rows[i - 1].rate - rows[i].rate;
    if (drop > 0 && (!best || drop > best.drop)) best = { from: rows[i - 1].section, to: rows[i].section, drop, index: i };
  }
  return best;
}
