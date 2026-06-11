"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

const consultants = [
  { name: "김재강", role: "대표 컨설턴트", image: "/consultants/kim-jaegang.jpg" },
  { name: "박정민", role: "컨설턴트", image: "/consultants/park-jungmin.png" },
  { name: "김승호", role: "컨설턴트", image: "/consultants/kim-seungho.jpg" },
  { name: "구진완", role: "컨설턴트", image: "/consultants/gu-jinwan.png" },
  { name: "황봉남", role: "컨설턴트", image: "/consultants/hwang-bongnam.jpg" },
  { name: "이석훈", role: "컨설턴트", image: "/consultants/lee-seokhun.png" },
  { name: "허준영", role: "컨설턴트", image: "/consultants/heo-junyoung.jpg" },
];

const slogans: { content: React.ReactNode; sizeClass: string; weight: number }[] = [
  {
    content: "대표님들의 성장을 돕습니다.",
    sizeClass: "text-3xl sm:text-4xl lg:text-5xl xl:text-6xl",
    weight: 900,
  },
  {
    content: (
      <>
        현장 경력 도합 100년.
        <br />
        창업부터 운영까지, 어떤 미션도
        <br />
        수행하는 피트니스 비즈니스 전문 그룹
      </>
    ),
    sizeClass: "text-3xl sm:text-4xl lg:text-5xl",
    weight: 400,
  },
];

const ENTER_DURATION = 600;
const HOLD_DURATION  = 2000;
const EXIT_DURATION  = 600;

function ConsultantCard({ consultant }: { consultant: (typeof consultants)[0] }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group flex-shrink-0 flex flex-col items-center cursor-default select-none"
      style={{ width: "clamp(128px, 16vw, 210px)" }}
    >
      {/* Photo — bottom-aligned: fixed-height container, image sits at bottom */}
      <div
        className="relative w-full overflow-hidden rounded-t-xl transition-transform duration-300 ease-out group-hover:-translate-y-2"
        style={{ height: "clamp(176px, 22vw, 304px)" }}
      >
        {!imgError ? (
          <Image
            src={consultant.image}
            alt={consultant.name}
            fill
            className="object-cover object-top"
            sizes="130px"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] flex items-end justify-center pb-3">
            <svg className="w-10 h-10 text-[#444]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}
        {/* Bottom gradient for name area */}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Name + role */}
      <div className="w-full bg-black/40 backdrop-blur-sm px-1 py-1.5 text-center transition-transform duration-300 ease-out group-hover:-translate-y-2">
        <p className="text-white font-bold leading-tight truncate"
          style={{ fontSize: "clamp(10px, 1.1vw, 13px)" }}>
          {consultant.name}
        </p>
        <p className="text-[#009519] leading-tight truncate mt-0.5"
          style={{ fontSize: "clamp(8px, 0.9vw, 11px)" }}>
          {consultant.role}
        </p>
      </div>
    </div>
  );
}

export default function ConsultantHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
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
    <section className="relative bg-[#111111] overflow-hidden flex flex-col" style={{ minHeight: "100vh" }}>

      {/* ── Background image with slow pan ── */}
      <div className="absolute inset-0 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://cdn.imweb.me/thumbnail/20250925/e6b9c1091f721.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ animation: "hero-pan 10s ease-in-out infinite alternate" }}
        />
        <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)" }} />
        {/* Bottom fade into consultant strip */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#111111] to-transparent" />
      </div>

      {/* ── Slogan area ── */}
      <div className="relative z-20 flex-1 flex items-center justify-center py-16 sm:py-24 px-4"
        style={{ minHeight: "clamp(220px, 40vh, 420px)" }}>
        <div className="relative w-full max-w-4xl mx-auto text-center"
          style={{ height: "clamp(120px, 16vw, 200px)" }}>
          {slogans.map((slogan, i) => {
            const isActive = i === activeIndex;
            let animationValue = "none";
            if (isActive) {
              animationValue = isExiting
                ? `slogan-exit ${EXIT_DURATION}ms ease-in both`
                : `slogan-enter ${ENTER_DURATION}ms ease-out both`;
            }
            return (
              <div
                key={i}
                className="absolute inset-0 flex items-center justify-center"
                style={{ opacity: isActive ? undefined : 0, pointerEvents: isActive ? "auto" : "none" }}
              >
                <p
                  className={`w-full text-center text-white leading-relaxed ${slogan.sizeClass}`}
                  style={{
                    fontWeight: slogan.weight,
                    animation: animationValue,
                    textShadow: "0 2px 20px rgba(0,0,0,0.5)",
                  }}
                >
                  {slogan.content}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Consultant strip ── */}
      <div className="relative z-10 w-full">
        {/* Desktop: flex row filling width */}
        <div className="hidden sm:flex items-end justify-center gap-0">
          {consultants.map((c) => (
            <ConsultantCard key={c.name} consultant={c} />
          ))}
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="sm:hidden flex items-end overflow-x-auto scrollbar-none gap-0 px-4 pb-0"
          style={{ scrollSnapType: "x mandatory" }}>
          {consultants.map((c) => (
            <div key={c.name} style={{ scrollSnapAlign: "start", flexShrink: 0 }}>
              <ConsultantCard consultant={c} />
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
