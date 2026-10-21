"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 타이핑 효과 공용 훅 — 그로우 에듀 허브(app/edu/EduHub.tsx)와 진단 허브 인트로(DiagnosisIntro)가 같이 쓴다.
//
//  · 단계(steps)를 순서대로 실행한다: type(한 글자씩 쓰기) / erase(뒤에서부터 지우기) / wait(멈춤).
//  · 각 줄은 key 로 구분하고, texts[key] 가 지금 화면에 보이는 글자다. cursorKey 는 커서가 있어야 할 줄.
//    (wait 단계에서는 직전 줄에 커서가 그대로 남는다.)
//  · steps 는 컴포넌트 밖 상수로 둔다 (참조가 바뀌면 처음부터 다시 시작한다).
//  · skip() 은 진행 중인 타이머를 모두 끊고 최종 상태를 바로 보여준다. 언마운트 시에도 전부 정리한다.
//  · respectReducedMotion 이 true 면 prefers-reduced-motion 일 때 타이핑 없이 최종 상태로 시작한다.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from "react";

/** 한 글자 타이핑 간격 (ms) — 그로우 에듀 허브 기준값 */
export const TYPE_SPEED = 70;

/** 깜박이는 초록 커서 (그로우 에듀 허브와 같은 모양·색) — <span className="edu-cursor">|</span> */
export const TYPE_CURSOR_CSS = `
@keyframes eduBlink{0%,49%{opacity:1}50%,100%{opacity:0}}
.edu-cursor{display:inline-block;color:#22B573;font-weight:400;animation:eduBlink 1s steps(1) infinite}
`;

export type TypeStep =
  | { type: "type"; key: string; text: string; speed?: number }
  | { type: "erase"; key: string; speed?: number }
  | { type: "wait"; ms: number };

type Options = {
  /** 첫 단계 시작 전 지연 (ms) */
  startDelay?: number;
  /** true 면 모션 줄이기 설정에서 타이핑 없이 최종 상태로 시작 */
  respectReducedMotion?: boolean;
};

/** 모든 단계를 끝낸 뒤의 화면 글자 */
function finalState(steps: readonly TypeStep[]) {
  const texts: Record<string, string> = {};
  let lastKey: string | null = null;
  for (const s of steps) {
    if (s.type === "wait") continue;
    texts[s.key] = s.type === "type" ? s.text : "";
    lastKey = s.key;
  }
  return { texts, lastKey };
}

function firstKey(steps: readonly TypeStep[]): string | null {
  for (const s of steps) if (s.type !== "wait") return s.key;
  return null;
}

function emptyTexts(steps: readonly TypeStep[]) {
  const texts: Record<string, string> = {};
  for (const s of steps) if (s.type !== "wait") texts[s.key] = "";
  return texts;
}

export function useTypewriter(steps: readonly TypeStep[], { startDelay = 0, respectReducedMotion = false }: Options = {}) {
  const [texts, setTexts] = useState<Record<string, string>>(() => emptyTexts(steps));
  const [cursorKey, setCursorKey] = useState<string | null>(() => firstKey(steps));
  const [done, setDone] = useState(false);
  const stopRef = useRef<() => void>(() => {});

  useEffect(() => {
    const fin = finalState(steps);
    const showFinal = () => {
      setTexts(fin.texts);
      setCursorKey(fin.lastKey);
      setDone(true);
    };

    if (respectReducedMotion && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      showFinal();
      stopRef.current = () => {};
      return;
    }

    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const local = emptyTexts(steps); // 지금 화면의 글자 (지우기 길이 계산용)

    const clearAll = () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      interval = null;
      timers.forEach((t) => clearTimeout(t));
    };
    stopRef.current = () => {
      clearAll();
      showFinal();
    };

    const run = (i: number) => {
      if (cancelled) return;
      if (i >= steps.length) {
        setDone(true);
        return;
      }
      const st = steps[i];
      if (st.type === "wait") {
        timers.push(setTimeout(() => run(i + 1), st.ms));
        return;
      }
      setCursorKey(st.key);
      if (st.type === "type") {
        let n = 0;
        interval = setInterval(() => {
          n += 1;
          local[st.key] = st.text.slice(0, n);
          setTexts((t) => ({ ...t, [st.key]: local[st.key] }));
          if (n >= st.text.length) {
            if (interval) clearInterval(interval);
            interval = null;
            run(i + 1);
          }
        }, st.speed ?? TYPE_SPEED);
      } else {
        let n = local[st.key].length;
        if (n === 0) {
          run(i + 1);
          return;
        }
        interval = setInterval(() => {
          n -= 1;
          local[st.key] = local[st.key].slice(0, Math.max(n, 0));
          setTexts((t) => ({ ...t, [st.key]: local[st.key] }));
          if (n <= 0) {
            if (interval) clearInterval(interval);
            interval = null;
            run(i + 1);
          }
        }, st.speed ?? TYPE_SPEED);
      }
    };

    timers.push(setTimeout(() => run(0), startDelay));
    return clearAll;
  }, [steps, startDelay, respectReducedMotion]);

  /** 진행 중인 타이핑을 건너뛰고 최종 상태를 바로 보여준다 */
  const skip = useCallback(() => stopRef.current(), []);

  return { texts, cursorKey, done, skip };
}
