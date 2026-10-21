"use client";

// 진단솔루션 허브 인트로 — 그로우 에듀 허브(app/edu/EduHub.tsx)와 같은 타이핑 방식 (lib/useTypewriter.ts 공용).
//
//  질문 타이핑(70ms/글자) → 0.8초 멈춤 → 뒤에서부터 지우기(35ms/글자) → 0.3초(커서만) → 답변을 줄 단위로 타이핑(줄 사이 400ms)
//  → 보조 줄·"컨설턴트 구경하러 가기 ↓" 버튼이 페이드업. 끝나면 커서는 마지막 줄 끝에서 계속 깜박인다.
//
//  · 레이아웃이 들썩이지 않게 아직 안 쓴 글자는 투명(invisible)으로 자리를 잡아 둔다. 질문과 답변은 같은 영역에서 바뀐다.
//  · 인트로 영역을 누르면(탭 포함) 애니메이션을 건너뛰고 최종 상태를 보여준다. 모션 줄이기면 처음부터 최종 상태.
//  · SEO·접근성: 질문(h1)과 답변 문장은 sr-only 로 처음부터 DOM 에 있고, 타이핑되는 글자는 aria-hidden.
//  · 타이머는 훅이 언마운트 시 전부 정리한다.

import { TYPE_CURSOR_CSS, useTypewriter, type TypeStep } from "@/lib/useTypewriter";
import MentorScrollButton from "./MentorScrollButton";

const QUESTION = "진단솔루션이 뭐예요..?";
// 줄마다 초록으로 보일 구절 — 타이핑되는 순간부터 초록
const ANSWER: { key: string; text: string; green: string[] }[] = [
  { key: "a1", text: "각 분야의 전문가가", green: [] },
  { key: "a2", text: "대표님의 매장에 직접 방문하여", green: ["직접 방문"] },
  { key: "a3", text: "1:1로 문제를 진단하고", green: ["1:1"] },
  { key: "a4", text: "개선까지 함께하는 서비스입니다.", green: [] },
];
const SUB = "헬스장 솔루션, 필라테스 솔루션 모두 가능합니다.";

const STEPS: TypeStep[] = [
  { type: "type", key: "q", text: QUESTION },
  { type: "wait", ms: 800 },
  { type: "erase", key: "q", speed: 35 },
  { type: "wait", ms: 300 },
  ...ANSWER.flatMap((a, i): TypeStep[] => [
    ...(i > 0 ? ([{ type: "wait", ms: 400 }] as TypeStep[]) : []),
    { type: "type", key: a.key, text: a.text },
  ]),
];

const INTRO_STYLE = `${TYPE_CURSOR_CSS}
@keyframes diUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.di-up{animation:diUp .55s ease both}
@media(prefers-reduced-motion:reduce){.di-up{animation:none}}
`;

/** 글자가 쓰인 만큼은 보이고(green 구절은 초록), 나머지는 투명으로 자리만 잡는다. 커서는 쓴 글자 바로 뒤. */
function Typed({ full, typed, green, cursor }: { full: string; typed: string; green: string[]; cursor: boolean }) {
  const isGreen = new Array<boolean>(full.length).fill(false);
  for (const g of green) {
    const at = full.indexOf(g);
    if (at >= 0) for (let i = at; i < at + g.length; i++) isGreen[i] = true;
  }
  const parts: { text: string; green: boolean }[] = [];
  for (let i = 0; i < typed.length; i++) {
    const last = parts[parts.length - 1];
    if (last && last.green === isGreen[i]) last.text += typed[i];
    else parts.push({ text: typed[i], green: isGreen[i] });
  }
  return (
    <>
      {parts.map((p, i) => (p.green ? <span key={i} className="text-[#22B573]">{p.text}</span> : <span key={i}>{p.text}</span>))}
      {cursor && (
        <span className="edu-cursor" style={{ width: 0, overflow: "visible" }}>
          |
        </span>
      )}
      <span className="invisible">{full.slice(typed.length)}</span>
    </>
  );
}

export default function DiagnosisIntro() {
  const { texts, cursorKey, done, skip } = useTypewriter(STEPS, { startDelay: 300, respectReducedMotion: true });
  const answering = texts.a1 !== "";

  return (
    <div
      onClick={skip}
      className="relative flex min-h-[340px] items-center justify-center sm:min-h-[400px]"
    >
      <style dangerouslySetInnerHTML={{ __html: INTRO_STYLE }} />

      {/* 검색엔진·스크린리더용 실제 텍스트 — 처음부터 DOM 에 있다 */}
      <h1 className="sr-only">{QUESTION}</h1>
      <p className="sr-only">
        {ANSWER.map((a) => a.text).join(" ")} {SUB}
      </p>

      {/* 질문 — 답변이 시작되면 같은 자리에서 사라진다 */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 flex items-center justify-center px-4 text-center ${answering ? "invisible" : ""}`}
      >
        <p className="text-4xl font-black leading-tight text-white sm:text-6xl">
          <Typed full={QUESTION} typed={texts.q} green={[]} cursor={cursorKey === "q" && !answering} />
        </p>
      </div>

      {/* 답변 — 높이는 처음부터 확보(invisible), 쓰이기 시작하면 보인다 */}
      <div aria-hidden={!done ? "true" : undefined} className={`space-y-2 px-4 text-center sm:space-y-3 ${answering ? "" : "invisible"}`}>
        {ANSWER.map((a) => (
          <p key={a.key} aria-hidden="true" className="text-xl font-black leading-snug text-white sm:text-3xl">
            <Typed full={a.text} typed={texts[a.key]} green={a.green} cursor={cursorKey === a.key && answering} />
          </p>
        ))}
        <p
          aria-hidden="true"
          className={`break-keep text-balance text-base font-bold leading-snug text-gray-300 sm:text-xl ${done ? "di-up" : "invisible"}`}
        >
          {SUB}
        </p>
        <div className={done ? "di-up" : "invisible"} style={done ? { animationDelay: ".35s" } : undefined} onClick={(e) => e.stopPropagation()}>
          <MentorScrollButton />
        </div>
      </div>
    </div>
  );
}
