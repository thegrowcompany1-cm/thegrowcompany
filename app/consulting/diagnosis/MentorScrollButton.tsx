"use client";

// 허브 인트로 아래 "컨설턴트 구경하러 가기 ↓" — 멘토 선택 그리드(#mentors)로 부드럽게 스크롤한다.
// 모션 줄이기 설정이면 즉시 이동. 대상이 없으면 href 기본 동작(앵커 이동)에 맡긴다.

export default function MentorScrollButton() {
  return (
    <div className="mt-8 flex justify-center">
      <a
        href="#mentors"
        onClick={(e) => {
          const el = document.getElementById("mentors");
          if (!el) return;
          e.preventDefault();
          const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        }}
        className="inline-flex items-center justify-center rounded-full bg-[#22B573] px-8 py-4 text-base font-extrabold text-white transition-colors hover:bg-[#1c9e63]"
      >
        컨설턴트 구경하러 가기 ↓
      </a>
    </div>
  );
}
