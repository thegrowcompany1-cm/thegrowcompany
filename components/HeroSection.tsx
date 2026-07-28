"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

const FITNESS_LOGO_COUNT = 19;
const fitnessLogos = Array.from({ length: FITNESS_LOGO_COUNT }, (_, i) =>
  encodeURI(`/fitness logos/${i + 1}.png`)
);

const LOGO_ROW_COUNT = 4;
// Tighter spacing shrinks each row's natural width, so the min-repeat
// threshold is raised to keep the doubled marquee track wide enough
// to loop without a blank gap on wide viewports.
const MIN_LOGOS_PER_ROW = 10;
const logoRows: string[][] = Array.from({ length: LOGO_ROW_COUNT }, () => []);
fitnessLogos.forEach((logo, i) => {
  logoRows[i % LOGO_ROW_COUNT].push(logo);
});
const displayLogoRows = logoRows.map((row) => {
  if (row.length === 0 || row.length >= MIN_LOGOS_PER_ROW) return row;
  const repeated: string[] = [];
  while (repeated.length < MIN_LOGOS_PER_ROW) repeated.push(...row);
  return repeated;
});

// Durations scaled so px/s flow speed feels the same as before the
// logos/spacing shrank (each row's track is now narrower per item).
const rowConfig = [
  { direction: "left", duration: 63 },
  { direction: "right", duration: 83 },
  { direction: "left", duration: 72 },
  { direction: "right", duration: 68 },
] as const;

const slogans: { content: React.ReactNode; sizeClass: string; weight: number }[] = [
  {
    content: (
      <>
        창업 <span className="text-[#22B573]">300회</span> / 위탁운영{" "}
        <span className="text-[#22B573]">700회</span> 이상
        <br />
        피트니스 전문 컨설팅회사
      </>
    ),
    sizeClass: "text-2xl sm:text-4xl lg:text-5xl xl:text-6xl",
    weight: 900,
  },
  {
    content: (
      <>
        현장 경력 도합 100년.
        <br />
        창업부터 운영까지, 어떤 미션도 수행하는
        <br />
        피트니스 비즈니스 전문 그룹.
      </>
    ),
    sizeClass: "text-lg sm:text-2xl lg:text-4xl",
    weight: 400,
  },
];

const ENTER_DURATION = 600;
const HOLD_DURATION  = 2000;
const EXIT_DURATION  = 600;

export default function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExiting,   setIsExiting]   = useState(false);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const holdTimer = setTimeout(() => {
      setIsExiting(true);
      exitTimerRef.current = setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % slogans.length);
        setIsExiting(false);
      }, EXIT_DURATION);
    }, ENTER_DURATION + HOLD_DURATION);

    return () => {
      clearTimeout(holdTimer);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    };
  }, [activeIndex]);

  return (
    <section
      className="relative bg-[#111111] overflow-hidden"
      style={{ minHeight: "70vh" }}
    >
      {/* Background image with pan animation */}
      <div className="absolute inset-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://cdn.imweb.me/thumbnail/20250925/e6b9c1091f721.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ animation: "hero-pan 10s ease-in-out infinite alternate" }}
        />
      </div>

      {/* Logo marquee background — bottom-weighted */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-between overflow-hidden"
        style={{ height: "55%", pointerEvents: "none" }}
        aria-hidden="true"
      >
        {displayLogoRows.map((row, rowIndex) => {
          const config = rowConfig[rowIndex];
          const doubledRow = [...row, ...row];
          return (
            <div key={rowIndex} className="w-full overflow-hidden">
              <div
                className="flex items-center w-max"
                style={{
                  animation: `hero-logo-marquee-${config.direction} ${config.duration}s linear infinite`,
                }}
              >
                {doubledRow.map((logoSrc, i) => (
                  <div
                    key={`${rowIndex}-${i}`}
                    className="flex-shrink-0 flex items-center justify-center mx-[10px] sm:mx-[18px] h-[76px] sm:h-[108px]"
                  >
                    <div
                      className="relative h-[76px] w-[173px] sm:h-[108px] sm:w-[302px]"
                      style={{ opacity: 0.7, filter: "grayscale(1)" }}
                    >
                      <Image
                        src={logoSrc}
                        alt=""
                        aria-hidden="true"
                        fill
                        className="object-contain"
                        sizes="302px"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 z-10" style={{ background: "rgba(0,0,0,0.45)" }} />
      <div className="absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-[#111111] to-transparent" />

      {/* Local reinforcement gradient behind text — logos are larger/more opaque now */}
      <div
        className="absolute inset-x-0 z-10"
        style={{
          top: "37%",
          transform: "translateY(-50%)",
          height: "clamp(220px, 34vw, 320px)",
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0) 80%)",
          pointerEvents: "none",
        }}
      />

      {/* Slogan crossfade — raised above vertical center (~37% of hero height) */}
      <div
        className="absolute inset-x-0 z-20 w-full max-w-4xl mx-auto text-center px-6"
        style={{ top: "37%", transform: "translateY(-50%)", height: "clamp(160px, 25vw, 220px)" }}
      >
        {slogans.map((slogan, i) => {
          const isActive = i === activeIndex;
          let animationValue = "none";
          if (isActive) {
            animationValue = isExiting
              ? `slogan-exit ${EXIT_DURATION}ms ease-in both`
              : `slogan-enter ${ENTER_DURATION}ms ease-out both`;
          }
          // 첫 슬로건만 페이지의 실질적 헤드라인이므로 h1, 나머지는 p
          // (둘 다 항상 마운트되어 opacity로만 전환되므로, DOM에 h1이 2개
          //  동시에 존재하지 않도록 태그를 분리한다 — 시각 스타일은 동일)
          const Tag = i === 0 ? "h1" : "p";
          return (
            <div
              key={i}
              className="absolute inset-0 flex items-center justify-center"
              style={{
                opacity: isActive ? undefined : 0,
                pointerEvents: isActive ? "auto" : "none",
              }}
            >
              <Tag
                className={`w-full text-center text-white leading-relaxed ${slogan.sizeClass}`}
                style={{
                  fontWeight: slogan.weight,
                  animation: animationValue,
                  textShadow: "0 2px 20px rgba(0,0,0,0.5)",
                  overflowWrap: "break-word",
                  wordBreak: "keep-all",
                }}
              >
                {slogan.content}
              </Tag>
            </div>
          );
        })}
      </div>
    </section>
  );
}
