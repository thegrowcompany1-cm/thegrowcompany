"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { partners } from "@/components/PartnerSlider";

const uniqueLogos = Array.from(
  new Map(partners.map((p) => [p.logo, p])).values()
);

const LOGO_ROW_COUNT = 5;
const logoRows: (typeof partners)[] = Array.from({ length: LOGO_ROW_COUNT }, () => []);
uniqueLogos.forEach((logo, i) => {
  logoRows[i % LOGO_ROW_COUNT].push(logo);
});

const rowConfig = [
  { direction: "left", duration: 42 },
  { direction: "right", duration: 55 },
  { direction: "left", duration: 48 },
  { direction: "right", duration: 60 },
  { direction: "left", duration: 50 },
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
      className="relative bg-[#111111] overflow-hidden flex flex-col items-center justify-center"
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

      {/* Logo marquee background */}
      <div
        className="absolute inset-0 z-10 flex flex-col justify-between overflow-hidden"
        style={{ pointerEvents: "none" }}
        aria-hidden="true"
      >
        {logoRows.map((row, rowIndex) => {
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
                {doubledRow.map((partner, i) => (
                  <div
                    key={`${rowIndex}-${i}`}
                    className="flex-shrink-0 flex items-center justify-center mx-3 sm:mx-6 h-10 sm:h-14"
                  >
                    <div
                      className="relative h-7 sm:h-10 w-16 sm:w-28"
                      style={{ opacity: 0.3, filter: "grayscale(1)" }}
                    >
                      <Image
                        src={partner.logo}
                        alt=""
                        fill
                        className="object-contain"
                        sizes="128px"
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
      <div className="absolute inset-0 z-10" style={{ background: "rgba(0,0,0,0.55)" }} />
      <div className="absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-[#111111] to-transparent" />

      {/* Slogan crossfade */}
      <div
        className="relative z-20 w-full max-w-4xl mx-auto text-center px-6"
        style={{ height: "clamp(160px, 25vw, 220px)" }}
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
