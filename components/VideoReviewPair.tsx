"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 자체 호스팅 영상 후기 2개 — PC 2열 / 모바일 1열
//
//  · /consulting/startup 의 tgc-vid 슬라이더와 같은 동작을 그대로 옮겼다.
//    영상이 2개뿐이라 마퀴·드래그 없이 격자로만 놓는다.
//  · 포스터만 먼저 보여주고 영상은 preload="none" — 모바일 데이터를 아끼려는 것.
//  · 한 번에 하나만 재생한다. 다른 카드를 누르면 먼저 것이 멈춘다.
//  · 카드가 화면에서 벗어나면 자동으로 멈춘다 (소리만 들리는 상황 방지).
//  · 리스너·옵저버는 언마운트 시 전부 정리한다.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";

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
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 화면에서 벗어난 카드의 영상을 멈춘다
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) continue;
          const idx = cardRefs.current.indexOf(entry.target as HTMLDivElement);
          if (idx < 0) continue;
          const video = videoRefs.current[idx];
          if (video && !video.paused) {
            video.pause();
            setPlaying((cur) => (cur === idx ? null : cur));
          }
        }
      },
      { threshold: 0.35 },
    );

    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    cards.forEach((c) => io.observe(c));

    return () => {
      io.disconnect();
      // 언마운트 중에도 소리가 남지 않게 전부 멈춘다
      videoRefs.current.forEach((v) => v?.pause());
    };
  }, [items.length]);

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

      <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2">
        {items.map((v, i) => {
          const isPlaying = playing === i;
          return (
            <div
              key={v.src}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="mx-auto w-full min-w-0 max-w-[340px]"
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
              <p className="mt-3 px-0.5 text-[14px] font-semibold leading-relaxed text-gray-300">
                {v.caption}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
