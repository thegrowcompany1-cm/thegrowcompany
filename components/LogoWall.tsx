"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 파트너 센터 로고월 — 1슬라이드 = 5열 × 2행 = 10개
//
//  · 슬라이드 수는 LOGOS 길이에서 자동 계산한다. 로고를 더하거나 빼도 코드를
//    고칠 필요가 없다.
//  · PC·모바일 모두 5열 2행을 유지하고, 모바일은 타일과 간격만 줄인다.
//  · 4초 자동 넘김. 마우스가 올라가 있거나 손가락이 닿아 있으면 멈추고,
//    섹션이 화면 밖으로 나가도 멈춘다. prefers-reduced-motion 이면 아예 돌지 않는다.
//  · 첫 슬라이드만 즉시 로드하고 나머지는 lazy — 50장을 한 번에 받지 않는다.
//
//  · LOGOS 와 LOGO_STYLE 은 export 한다. /edu/diagnostic-consultant 는
//    DETAIL_HTML 주입 구조라 이 컴포넌트를 그대로 쓸 수 없고, 같은 데이터와
//    같은 CSS 를 가져다 HTML 문자열로 만든다. 스타일이 갈라지지 않게 하려는 것.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from "react";

/** public/fitness-logos/1.png ~ 50.png */
export const LOGOS: string[] = Array.from(
  { length: 50 },
  (_, i) => `/fitness-logos/${i + 1}.png`,
);

/** 한 슬라이드에 들어가는 로고 수 (5열 × 2행) */
export const PER_SLIDE = 10;

export const LOGO_ALT = "더그로우 파트너 센터 로고";

/** 로고를 10개씩 끊어 슬라이드 배열로 */
export function chunkLogos(logos: string[] = LOGOS): string[][] {
  const out: string[][] = [];
  for (let i = 0; i < logos.length; i += PER_SLIDE) {
    out.push(logos.slice(i, i + PER_SLIDE));
  }
  return out;
}

/** 두 페이지가 같이 쓰는 CSS. 접두사 logo- */
export const LOGO_STYLE = `
.logo-wall{width:100%;max-width:100%;overflow:hidden}
.logo-viewport{overflow:hidden;width:100%;max-width:100%;touch-action:pan-y}
.logo-track{display:flex;width:100%;transition:transform .5s cubic-bezier(.22,.61,.36,1);will-change:transform}
.logo-slide{flex:0 0 100%;width:100%;min-width:0;display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
.logo-tile{position:relative;aspect-ratio:1/1;background:#fff;border-radius:10px;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:8px;min-width:0}
.logo-tile img{width:100%;height:100%;object-fit:contain;display:block}
.logo-dots{display:flex;align-items:center;justify-content:center;gap:8px;margin:18px 0 0}
.logo-dot{width:8px;height:8px;padding:0;border:0;border-radius:50%;background:rgba(255,255,255,.26);cursor:pointer;transition:width .25s ease,background .25s ease}
.logo-dot.is-on{width:22px;border-radius:999px;background:#22B573}
@media(min-width:768px){
  .logo-slide{gap:14px}
  .logo-tile{border-radius:14px;padding:14px}
}
@media(prefers-reduced-motion:reduce){
  .logo-track{transition:none}
}
`;

export default function LogoWall({
  title,
  titleAccent,
  subtitle,
  logos = LOGOS,
}: {
  /** 제목 1줄 */
  title: string;
  /** 제목 2줄 (그린) */
  titleAccent?: string;
  subtitle?: string;
  logos?: string[];
}) {
  const slides = chunkLogos(logos);
  const total = slides.length;

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; active: boolean } | null>(null);

  const go = useCallback(
    (n: number) => setIndex(((n % total) + total) % total),
    [total],
  );

  // 섹션이 화면 밖이면 자동 넘김을 멈춘다
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => setVisible(entries[0]?.isIntersecting ?? true),
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 자동 넘김 — 멈춤 조건이 하나라도 걸리면 타이머를 만들지 않는다
  useEffect(() => {
    if (total <= 1 || paused || !visible) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const id = window.setInterval(() => setIndex((i) => (i + 1) % total), 4000);
    return () => window.clearInterval(id);
  }, [total, paused, visible]);

  // 터치 스와이프 — 가로로 움직인 경우에만 슬라이드를 넘긴다
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return;
    dragRef.current = { x: e.clientX, y: e.clientY, active: true };
    setPaused(true);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = dragRef.current;
    dragRef.current = null;
    setPaused(false);
    if (!d?.active) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    go(index + (dx < 0 ? 1 : -1));
  };

  return (
    <div
      ref={wrapRef}
      className="logo-wall"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <style dangerouslySetInnerHTML={{ __html: LOGO_STYLE }} />

      <h2 className="text-center text-2xl font-black leading-snug sm:text-3xl">
        {title}
        {titleAccent && (
          <>
            <br />
            <span style={{ color: "#22B573" }}>{titleAccent}</span>
          </>
        )}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-gray-400 sm:text-[15px]">
          {subtitle}
        </p>
      )}

      <div
        className="logo-viewport mt-8 sm:mt-10"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="logo-track"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((group, si) => (
            <div className="logo-slide" key={si}>
              {group.map((src) => (
                <div className="logo-tile" key={src}>
                  {/* 첫 슬라이드만 즉시, 나머지는 lazy */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={LOGO_ALT}
                    loading={si === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {total > 1 && (
        <div className="logo-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`logo-dot${i === index ? " is-on" : ""}`}
              aria-label={`${i + 1}번째 로고 묶음 보기`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => go(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
