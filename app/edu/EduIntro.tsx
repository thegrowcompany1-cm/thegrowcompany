"use client";

// 그로우 에듀 허브 인트로 — 질문 클릭 시 답변이 한 줄씩 순차 페이드업으로 등장.
// React state + CSS keyframes 만 사용(외부 라이브러리 없음). 한 번 열면 유지.

import { useState } from "react";

const INTRO_STYLE = `
@keyframes eduUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.edu-line{opacity:0;animation:eduUp .55s ease forwards}
`;

export default function EduIntro() {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="relative flex min-h-[320px] items-center justify-center sm:min-h-[380px]">
      <style dangerouslySetInnerHTML={{ __html: INTRO_STYLE }} />

      {/* 질문 상태 */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center px-4 text-center transition-all duration-500 ${
          revealed ? "pointer-events-none -translate-y-2 opacity-0" : "opacity-100"
        }`}
      >
        <h1 className="text-4xl font-black leading-tight text-white sm:text-6xl">
          그로우 에듀는 뭐예요..?
        </h1>
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="mt-8 inline-flex items-center justify-center rounded-full bg-[#22B573] px-8 py-4 text-base font-extrabold text-white transition-colors hover:bg-[#1c9e63]"
        >
          궁금하다면 클릭
        </button>
      </div>

      {/* 답변 상태 */}
      {revealed && (
        <div className="space-y-2 px-4 text-center sm:space-y-3">
          <p
            className="edu-line text-xl font-black leading-snug text-white sm:text-3xl"
            style={{ animationDelay: "0.05s" }}
          >
            체육시설업에 종사하는 분들을 위한
          </p>
          <p
            className="edu-line text-xl font-black leading-snug text-white sm:text-3xl"
            style={{ animationDelay: "0.5s" }}
          >
            <span className="text-[#22B573]">성장 교육</span>입니다.
          </p>
          <p
            className="edu-line pt-3 text-xl font-black leading-snug text-white sm:pt-4 sm:text-3xl"
            style={{ animationDelay: "0.95s" }}
          >
            필라테스, 헬스, PT, 바레 —
          </p>
          <p
            className="edu-line text-xl font-black leading-snug text-white sm:text-3xl"
            style={{ animationDelay: "1.4s" }}
          >
            현장을 아는 사람이 <span className="text-[#22B573]">현장에서 통하는 것만</span> 가르칩니다.
          </p>
        </div>
      )}
    </div>
  );
}
