// 주간 AI 리포트 — 2단계: Claude 분석 (서버 전용)
//  · 환경변수 ANTHROPIC_API_KEY. 모델 claude-sonnet-5-5, max_tokens 4000.
//  · 입력은 lib/weeklyReport.ts 가 만든 집계 JSON 뿐이다 (개인 식별값 없음).

import Anthropic from "@anthropic-ai/sdk";
import type { WeeklyInput } from "@/lib/weeklyReport";

export const WEEKLY_MODEL = "claude-sonnet-5-5";
const MAX_TOKENS = 4000;
/** 함수 maxDuration(60초) 안에서 끝내려고 AI 호출은 이 시간까지만 기다린다 */
const AI_TIMEOUT_MS = 48_000;

export const WEEKLY_SECTIONS = [
  "한 줄 결론",
  "지난주 핵심 숫자 (전주 대비 ▲▼)",
  "돈이 새는 곳 (메타 유입 대비 20초 미만·키 이벤트 0인 랜딩)",
  "키울 곳 (자연검색·기회 키워드 → 어떤 글/페이지를 어떻게)",
  "랜딩별 우선 수정 (어느 랜딩, 어느 섹션, 무엇을)",
  "AI 검색(AEO) 현황과 할 일",
  "이번 주 할 일 3개 (담당·예상 효과)",
  "데이터 한계",
] as const;

export const SYSTEM_PROMPT = `너는 피트니스 B2B(헬스장·필라테스 창업/위탁/진단 컨설팅, 원장 대상 교육) 회사의 퍼포먼스 마케팅 분석가다.
데이터에 있는 숫자만 근거로 쓰고, 없는 건 추측하지 말고 '데이터 없음'이라 써라.
표본이 30세션 미만이면 판단 보류라고 명시. 랜딩 기준: 평균 참여 20초 이상 양호.

입력은 지난 7일과 그 전 7일을 비교한 집계 JSON 이다. notes 와 각 소스의 available/reason 을 먼저 읽고, available:false 인 소스는 '데이터 없음'으로 처리해라.
전주 대비는 ▲▼ 와 증감률(또는 %p)로 쓰고, 이전 값이 0 이면 '비교 불가'라고 써라.
사용자에게 보이는 문장에 물음표(?)를 쓰지 마라.
간결하게, 전체 3,000자 이내로 써라. 표는 핵심 숫자 섹션에만 쓰고 나머지는 짧은 불릿으로 써라.

출력은 마크다운이며 아래 제목과 순서를 그대로 지켜라. 제목을 바꾸거나 빼지 마라.
${WEEKLY_SECTIONS.map((s) => `## ${s}`).join("\n")}

'이번 주 할 일 3개' 는 정확히 3개의 번호 목록(1. 2. 3.)으로, 각 줄에 "무엇을 — 담당(대표/마케팅/개발 중 하나) — 예상 효과" 를 담아라.
첫 줄(제목 앞)에는 아무것도 쓰지 마라.`;

export type AiResult = { ok: true; markdown: string } | { ok: false; error: string };

export async function analyzeWeekly(input: WeeklyInput): Promise<AiResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) return { ok: false, error: "ANTHROPIC_API_KEY 환경변수가 설정되지 않았습니다." };

  const client = new Anthropic({ apiKey, timeout: AI_TIMEOUT_MS, maxRetries: 0 });
  try {
    const res = await client.messages.create({
      model: WEEKLY_MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: `아래 집계 데이터로 주간 마케팅 리포트를 써줘.\n\n\`\`\`json\n${JSON.stringify(input)}\n\`\`\`` }],
    });
    const text = res.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("")
      .trim();
    if (!text) return { ok: false, error: "AI 응답이 비어 있습니다." };
    const missing = WEEKLY_SECTIONS.filter((s) => !text.includes(`## ${s}`));
    // 잘림(max_tokens)·형식 어긋남은 리포트를 버리지 않고 저장하되 맨 뒤에 경고를 붙인다
    const warn = res.stop_reason === "max_tokens" ? "\n\n> 주의: 응답이 길이 제한에서 잘렸습니다." : missing.length ? `\n\n> 주의: 일부 섹션이 빠졌습니다 (${missing.join(", ")}).` : "";
    return { ok: true, markdown: text + warn };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `AI 분석 호출 실패: ${msg}`.slice(0, 500) };
  }
}
