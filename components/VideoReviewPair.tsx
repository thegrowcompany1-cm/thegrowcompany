"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 자체 호스팅 영상 후기 — 가로 슬라이드 (CSS scroll-snap, 라이브러리 없음)
//
//  · 모바일: 카드 1장 + 다음 카드가 오른쪽에 15% 정도 보인다. PC(640px 이상): 2장씩.
//  · 아래 점(현재 카드) + PC 좌우 화살표. 카드가 한 화면에 다 들어가면(스크롤할 게 없으면) 점·화살표는 숨긴다.
//  · 영상이 늘어도 슬라이드의 높이는 그대로다 (가로로만 늘어난다).
//  · 포스터만 먼저 보여주고 영상은 preload="none", 클릭해서 재생. 한 번에 하나만 재생하고,
//    다른 카드로 넘기거나 카드가 화면(슬라이드 영역·페이지)에서 벗어나면 멈춘다.
//  · 리스너·옵저버는 언마운트 시 전부 정리한다.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from "react";

export type VideoReview = {
  src: string;
  poster: string;
  caption: string;
};

const GREEN = "#22B573";

export default function VideoReviewPair({
  title,
  titleAccent,
  subtitle,
  items,
}: {
  /** 제목 1줄 (흰색) */
  title: string;
  /** 제목 2줄 (그린) — 없으면 1줄만 */
  titleAccent?: string;
  subtitle?: string;
  items: VideoReview[];
}) {
  const [playing, setPlaying] = useState<number | null>(null);
  const [active, setActive] = useState(0);
  const [canScroll, setCanScroll] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const stop = useCallback((idx: number) => {
    const video = videoRefs.current[idx];
    if (video && !video.paused) video.pause();
    setPlaying((cur) => (cur === idx ? null : cur));
  }, []);

  // 슬라이드 상태(현재 카드·양끝·스크롤 가능 여부)를 읽는다
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = el.scrollWidth - el.clientWidth;
      setCanScroll(max > 2);
      setAtStart(el.scrollLeft <= 2);
      setAtEnd(el.scrollLeft >= max - 2);
      let best = 0;
      let bestDist = Infinity;
      cardRefs.current.forEach((c, i) => {
        if (!c) return;
        const d = Math.abs(c.offsetLeft - el.scrollLeft);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      // 끝까지 밀었는데 마지막 카드가 왼쪽 끝에 못 닿는 경우(2장씩 보기)는 마지막 카드로 본다
      setActive(max > 2 && el.scrollLeft >= max - 2 ? cardRefs.current.length - 1 : best);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    el.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      el.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items.length]);

  // 슬라이드 영역 밖으로 넘어간 카드, 화면(페이지)에서 벗어난 카드의 영상을 멈춘다
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    const onOut = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) continue;
        const idx = cardRefs.current.indexOf(entry.target as HTMLDivElement);
        if (idx >= 0) stop(idx);
      }
    };
    const ioSlider = new IntersectionObserver(onOut, { root: scrollerRef.current, threshold: 0.5 });
    const ioPage = new IntersectionObserver(onOut, { threshold: 0.35 });
    cards.forEach((c) => {
      ioSlider.observe(c);
      ioPage.observe(c);
    });
    return () => {
      ioSlider.disconnect();
      ioPage.disconnect();
      // 언마운트 중에도 소리가 남지 않게 전부 멈춘다
      videoRefs.current.forEach((v) => v?.pause());
    };
  }, [items.length, stop]);

  const play = (idx: number) => {
    // 동시 재생 금지 — 나머지는 멈추고 처음으로 되돌린다
    videoRefs.current.forEach((v, i) => {
      if (i !== idx && v) {
        v.pause();
        v.currentTime = 0;
      }
    });
    setPlaying(idx);
    const video = videoRefs.current[idx];
    if (!video) return;
    void video.play().catch(() => {
      // 자동재생 차단 등으로 실패하면 포스터 상태로 되돌린다
      setPlaying((cur) => (cur === idx ? null : cur));
    });
  };

  const close = (idx: number) => {
    const video = videoRefs.current[idx];
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    setPlaying((cur) => (cur === idx ? null : cur));
  };

  const smooth = () => (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");

  const goTo = (i: number) => {
    const el = scrollerRef.current;
    const card = cardRefs.current[i];
    if (!el || !card) return;
    el.scrollTo({ left: card.offsetLeft, behavior: smooth() });
  };

  const step = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    const card = cardRefs.current[0];
    if (!el || !card) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: smooth() });
  };

  return (
    <div className="w-full">
      <h2 className="text-center text-2xl font-black leading-snug sm:text-3xl">
        {title}
        {titleAccent && (
          <>
            <br />
            <span style={{ color: GREEN }}>{titleAccent}</span>
          </>
        )}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-gray-400 sm:text-[15px]">
          {subtitle}
        </p>
      )}

      <div className="relative mx-auto mt-8 max-w-[760px] sm:mt-10">
        <div
          ref={scrollerRef}
          role="group"
          aria-roledescription="carousel"
          aria-label="진단 솔루션 영상 후기"
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5"
        >
          {items.map((v, i) => {
            const isPlaying = playing === i;
            return (
              <div
                key={v.src}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
                className="min-w-0 shrink-0 basis-[85%] snap-start sm:basis-[calc((100%-20px)/2)]"
              >
                <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-[#141414] [aspect-ratio:9/16]">
                  <video
                    ref={(el) => {
                      videoRefs.current[i] = el;
                    }}
                    src={v.src}
                    poster={v.poster}
                    preload="none"
                    playsInline
                    controls={isPlaying}
                    onEnded={() => close(i)}
                    className="block h-full w-full object-cover"
                  />

                  {!isPlaying && (
                    <button
                      type="button"
                      onClick={() => play(i)}
                      aria-label={`${v.caption} 재생`}
                      className="absolute inset-0 flex items-center justify-center border-0 bg-black/20 transition-colors hover:bg-black/35"
                    >
                      <span
                        className="flex h-16 w-16 items-center justify-center rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
                        style={{ backgroundColor: "rgba(34,181,115,.92)" }}
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    </button>
                  )}

                  {isPlaying && (
                    <button
                      type="button"
                      onClick={() => close(i)}
                      aria-label="영상 닫기"
                      className="absolute right-2.5 top-2.5 z-[3] flex h-[34px] w-[34px] items-center justify-center rounded-full border-0 bg-black/60 text-[15px] leading-none text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <p className="mt-3 px-0.5 text-[14px] font-semibold leading-relaxed text-gray-300">{v.caption}</p>
              </div>
            );
          })}
        </div>

        {canScroll && (
          <>
            <button
              type="button"
              aria-label="이전 영상"
              disabled={atStart}
              onClick={() => step(-1)}
              className="absolute left-2 top-[38%] z-10 hidden h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#161616] text-white transition-colors hover:border-[#22B573] disabled:opacity-30 disabled:hover:border-white/20 sm:flex"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="다음 영상"
              disabled={atEnd}
              onClick={() => step(1)}
              className="absolute right-2 top-[38%] z-10 hidden h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#161616] text-white transition-colors hover:border-[#22B573] disabled:opacity-30 disabled:hover:border-white/20 sm:flex"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
            <div className="mt-4 flex items-center justify-center">
              {items.map((v, i) => (
                <button
                  key={v.src}
                  type="button"
                  aria-label={`영상 ${i + 1}번으로 이동`}
                  aria-current={i === active ? "true" : undefined}
                  onClick={() => goTo(i)}
                  className="flex h-[26px] w-[26px] items-center justify-center border-0 bg-transparent p-0"
                >
                  <span
                    className="block h-2 rounded-full transition-all"
                    style={{ width: i === active ? 22 : 8, backgroundColor: i === active ? GREEN : "rgba(255,255,255,.28)" }}
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
