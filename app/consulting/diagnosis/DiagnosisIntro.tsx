"use client";

// 진단솔루션 허브 인트로 — 질문 클릭 시 답변이 한 줄씩 순차 페이드업으로 등장.
// React state + CSS keyframes 만 사용(외부 라이브러리 없음). 한 번 열면 유지.

import { useState } from "react";

const INTRO_STYLE = `
@keyframes diUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
.di-line{opacity:0;animation:diUp .55s ease forwards}
`;

export default function DiagnosisIntro() {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="relative flex min-h-[340px] items-center justify-center sm:min-h-[400px]">
      <style dangerouslySetInnerHTML={{ __html: INTRO_STYLE }} />

      {/* 질문 상태 */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center px-4 text-center transition-all duration-500 ${
          revealed ? "pointer-events-none -translate-y-2 opacity-0" : "opacity-100"
        }`}
      >
        <h1 className="text-4xl font-black leading-tight text-white sm:text-6xl">
          진단솔루션이 뭐예요..?
        </h1>
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="mt-8 inline-flex items-center justify-center rounded-full bg-[#22B573] px-8 py-4 text-base font-extrabold text-white transition-colors hover:bg-[#1c9e63]"
        >
          클릭 {">"}
        </button>
      </div>

      {/* 답변 상태 */}
      {revealed && (
        <div className="space-y-2 px-4 text-center sm:space-y-3">
          <p
            className="di-line text-xl font-black leading-snug text-white sm:text-3xl"
            style={{ animationDelay: "0.05s" }}
          >
            각 분야의 전문가가
          </p>
          <p
            className="di-line text-xl font-black leading-snug text-white sm:text-3xl"
            style={{ animationDelay: "0.5s" }}
          >
            대표님의 매장에 <span className="text-[#22B573]">직접 방문</span>하여
          </p>
          <p
            className="di-line text-xl font-black leading-snug text-white sm:text-3xl"
            style={{ animationDelay: "0.95s" }}
          >
            <span className="text-[#22B573]">1:1</span>로 문제를 진단하고
          </p>
          <p
            className="di-line text-xl font-black leading-snug text-white sm:text-3xl"
            style={{ animationDelay: "1.4s" }}
          >
            개선까지 함께하는 서비스입니다.
          </p>
          <p
            className="di-line text-base font-bold leading-snug text-gray-300 sm:text-xl"
            style={{ animationDelay: "1.85s" }}
          >
            헬스장 솔루션, 필라테스 솔루션 모두 가능합니다.
          </p>
        </div>
      )}
    </div>
  );
}
