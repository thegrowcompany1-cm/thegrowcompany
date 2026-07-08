"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 하단 고정 CTA 바 (재사용 컴포넌트)
//  - targetSelector 로 지정한 상담폼으로 부드럽게 스크롤(고정 헤더 높이만큼 오프셋)
//  - 같은 targetSelector 를 IntersectionObserver 로 관찰:
//    폼이 화면에 보이는 동안은 숨김, 지나쳐 안 보이면 slide-up 으로 표시
//  - 언마운트 시 observer.disconnect() 로 정리
//  - iOS 하단 안전영역(env(safe-area-inset-bottom)) 대응 + 콘텐츠 가림 방지용 스페이서
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";

type StickyCtaBarProps = {
  /** 버튼 문구 */
  label?: string;
  /** 스크롤 + 노출 판단 대상(상담폼) CSS 셀렉터 (예: "#startup-consult-form") */
  targetSelector: string;
  /** 고정 헤더 높이만큼 스크롤 보정값(px) */
  scrollOffset?: number;
};

export default function StickyCtaBar({
  label = "무료 상담 신청하기",
  targetSelector,
  scrollOffset = 96,
}: StickyCtaBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.querySelector(targetSelector);
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 타겟(상담폼)이 화면에 보이면 숨기고, 지나쳐서 안 보이면 표시
        setVisible(!entries[0].isIntersecting);
      },
      { threshold: 0 },
    );
    observer.observe(target);

    return () => observer.disconnect();
  }, [targetSelector]);

  const scrollToTarget = () => {
    const target = document.querySelector(targetSelector);
    if (!target) return;
    const y =
      target.getBoundingClientRect().top + window.scrollY - scrollOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <>
      {/* 콘텐츠가 바에 가려지지 않도록 바 높이만큼 하단 여백 확보 */}
      <div
        aria-hidden="true"
        style={{ height: "calc(60px + env(safe-area-inset-bottom))" }}
      />
      <button
        type="button"
        onClick={scrollToTarget}
        aria-label={label}
        aria-hidden={!visible}
        tabIndex={visible ? 0 : -1}
        className={`fixed inset-x-0 bottom-0 z-50 bg-[#009519] text-white shadow-[0_-4px_20px_rgba(0,0,0,0.18)] transition-all duration-300 ease-out hover:bg-[#007a14] ${
          visible ? "translate-y-0" : "pointer-events-none translate-y-full"
        }`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <span className="flex min-h-[60px] items-center justify-center text-base font-bold sm:text-lg">
          {label}
        </span>
      </button>
    </>
  );
}
