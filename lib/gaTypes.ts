// GA 리포트 응답 타입 — 서버 라우트(app/api/admin/ga/report)와 /admin/ga 화면이 함께 쓴다.
// (route.ts 는 GET 외의 이름을 export 할 수 없어서 별도 파일로 뺐다.)

/** AI 검색(AEO) 유입으로 보는 sessionSource 패턴 (부분 일치 정규식) */
export const AI_SOURCE_REGEX = "chatgpt\\.com|chat\\.openai\\.com|perplexity\\.ai|gemini\\.google\\.com|copilot\\.microsoft\\.com|claude\\.ai|wrtn";

export type LandingRow = {
  landing: string;
  sessions: number;
  engagedSessions: number;
  engagementRate: number;
  /** 세션당 평균 참여 시간(초) = userEngagementDuration / sessions */
  avgEngagementSec: number;
  keyEvents: number;
};
export type SourceRow = { source: string; sessions: number; engagementRate: number };
export type AiSourceRow = SourceRow & { users: number; avgSessionDuration: number; keyEvents: number };

export type Totals = {
  users: number;
  sessions: number;
  engagementRate: number;
  avgSessionDuration: number;
  keyEvents: number;
};

/** 날짜별 한 줄 (일별 보기·추이 차트) */
export type DailyRow = {
  date: string; // YYYY-MM-DD (GA 속성 시간대 = KST 기준)
  users: number;
  sessions: number;
  engagementRate: number;
  /** 세션당 평균 참여 시간(초) = userEngagementDuration / sessions */
  avgEngagementSec: number;
  keyEvents: number;
};

export type ReportPayload = {
  ok: true;
  from: string;
  to: string;
  /** 선택 기간에 오늘(KST)이 들어 있는지 — GA 집계 지연으로 오늘 숫자가 작게 보일 수 있다 */
  includesToday: boolean;
  totals: Totals;
  /** compare=1 일 때: 같은 길이의 직전 기간 합계 */
  prev?: { from: string; to: string; totals: Totals };
  daily: DailyRow[];
  channels: {
    channel: string;
    sessions: number;
    users: number;
    engagementRate: number;
    avgSessionDuration: number;
    keyEvents: number;
  }[];
  pages: {
    path: string;
    views: number;
    users: number;
    avgEngagementSec: number;
    scrollRate: number | null;
  }[];
  landings: LandingRow[];
  organic: { sources: SourceRow[]; landings: LandingRow[] };
  ai: { sources: AiSourceRow[]; landings: LandingRow[] };
  cachedAt: string;
};

// ── 서치콘솔 (클라이언트에서도 쓰는 타입·상수 — 서버 전용 패키지는 lib/gsc.ts 에만 있다) ──
export type GscRow = {
  key: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type GscReport = {
  ok: true;
  /** 조회 기간 (선택한 기간 그대로) */
  startDate: string;
  endDate: string;
  queries: GscRow[];
  pages: GscRow[];
  /** 노출 ≥ 50 이고 평균 순위 4~15위 — SEO 우선 작업 대상 (노출 많은 순) */
  opportunities: GscRow[];
  /** 종료일이 최근 3일 안이면 true — 서치콘솔은 약 2~3일 지연된다 */
  delayed: boolean;
  fetchedAt: string;
};

export const GSC_OPP_MIN_IMPRESSIONS = 50;
export const GSC_OPP_POS_MIN = 4;
export const GSC_OPP_POS_MAX = 15;
