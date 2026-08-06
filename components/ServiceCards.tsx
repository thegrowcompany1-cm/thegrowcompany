"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const services = [
  {
    num: "01",
    title: "창업솔루션",
    desc: "헬스장, 필라테스 등 창업을 준비 중이신 분들",
    href: "/consulting/startup",
    external: false,
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a14.953 14.953 0 00-5.84-2.56m0 0a14.947 14.947 0 01-5.84 2.56M9.75 19.75v-4.82m0-7.56a6 6 0 015.84 7.38m-5.84-7.38V3.13m0 4.44a14.952 14.952 0 015.84 2.56M9.75 7.57a14.952 14.952 0 00-5.84 2.56m0 0a6 6 0 005.84 7.38" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "매장 위탁운영",
    desc: "헬스·PT·바레·필라테스·골프 등 운영 중이신데 어려우신 분",
    href: "/consulting/outsourcing",
    external: false,
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "시설 위탁운영",
    desc: "아파트/기업/대학/공공기관 장기 위탁 도움이 필요하신 분",
    href: "/consulting/community",
    external: false,
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
      </svg>
    ),
  },
  {
    num: "04",
    title: "진단솔루션",
    desc: "전문가의 1:1 솔루션이 필요하신 분",
    href: "/consulting/diagnosis",
    external: false,
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125V18.75m-7.5 0h6.375" />
      </svg>
    ),
  },
  {
    num: "05",
    title: "그로우 에듀",
    desc: "피트니스 1등 솔루션 기업의 맞춤별 교육이 필요하신 분",
    href: "/edu/fc-class",
    external: false,
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
  },
  {
    num: "06",
    title: "그로우 인테리어",
    desc: "리모델링, 신규 입점 등 인테리어 도움이 필요하신 분",
    href: "https://www.growinterior.co.kr",
    external: true,
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
  },
];

// ── Mobile 3D Cylinder Carousel ──────────────────────────────────────────────
function MobileCarousel({ services: items, visible }: { services: typeof services; visible: boolean }) {
  const TOTAL  = items.length; // 6
  const STEP   = 360 / TOTAL;     // 60°
  const RADIUS = 180;
  const CARD_W = 220;
  const CARD_H = 260;

  const [current,    setCurrent]    = useState(0);
  const [rotation,   setRotation]   = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const resumeRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-rotation — restarts whenever autoRotate flips to true
  useEffect(() => {
    if (!autoRotate) return;
    const id = setInterval(() => {
      setRotation(r => r - STEP);
      setCurrent(p => (p + 1) % TOTAL);
    }, 3000);
    return () => clearInterval(id);
  }, [autoRotate, STEP, TOTAL]);

  // Touch swipe via non-passive listener so we can call preventDefault
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let startX = 0, startY = 0;

    const onStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      setAutoRotate(false);
      if (resumeRef.current) clearTimeout(resumeRef.current);
    };
    const onMove = (e: TouchEvent) => {
      const dx = Math.abs(e.touches[0].clientX - startX);
      const dy = Math.abs(e.touches[0].clientY - startY);
      if (dx > dy && dx > 8) e.preventDefault(); // horizontal swipe → block scroll
    };
    const onEnd = (e: TouchEvent) => {
      const delta = startX - e.changedTouches[0].clientX;
      if (Math.abs(delta) > 40) {
        if (delta > 0) {
          setRotation(r => r - STEP);
          setCurrent(p => (p + 1) % TOTAL);
        } else {
          setRotation(r => r + STEP);
          setCurrent(p => (p - 1 + TOTAL) % TOTAL);
        }
      }
      resumeRef.current = setTimeout(() => setAutoRotate(true), 4000);
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove",  onMove,  { passive: false });
    el.addEventListener("touchend",   onEnd,   { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove",  onMove);
      el.removeEventListener("touchend",   onEnd);
    };
  }, [STEP, TOTAL]);

  const goTo = (targetIndex: number) => {
    const diff  = targetIndex - current;
    const short = diff > TOTAL / 2 ? diff - TOTAL : diff < -TOTAL / 2 ? diff + TOTAL : diff;
    setRotation(r => r - short * STEP);
    setCurrent(targetIndex);
    setAutoRotate(false);
    if (resumeRef.current) clearTimeout(resumeRef.current);
    resumeRef.current = setTimeout(() => setAutoRotate(true), 4000);
  };

  return (
    <div style={{ animation: visible ? "service-enter 0.7s ease-out both" : "none" }}>
      {/* 3D carousel viewport */}
      <div
        ref={containerRef}
        className="relative overflow-hidden"
        style={{ height: "360px", perspective: "800px" }}
      >
        {/* Zero-size stage centered in viewport — 3D origin */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 0,
            height: 0,
            transformStyle: "preserve-3d",
            transform: `rotateY(${rotation}deg)`,
            transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {items.map((s, i) => {
            const cardAngle = i * STEP;
            const distRaw   = (i - current + TOTAL) % TOTAL;
            const dist      = Math.min(distRaw, TOTAL - distRaw);
            const opacity   = dist === 0 ? 1 : dist === 1 ? 0.6 : 0.18;
            const isActive  = i === current;

            const cardBg: React.CSSProperties = {
              background: isActive
                ? "linear-gradient(160deg, #0c1f0c 0%, #071207 100%)"
                : "linear-gradient(160deg, #1c1c1c 0%, #111111 100%)",
              boxShadow: isActive
                ? "inset 0 0 0 1.5px #009519, 0 12px 40px rgba(0,0,0,0.7)"
                : "0 4px 20px rgba(0,0,0,0.4)",
              transition: "background 0.4s, box-shadow 0.4s",
            };

            const interior = (
              <div className="absolute inset-0 flex flex-col justify-end p-5" style={cardBg}>
                {/* watermark number */}
                <div
                  className="absolute font-black pointer-events-none select-none"
                  style={{ fontSize: "96px", opacity: 0.05, right: "-4px", bottom: "-10px", color: "white", lineHeight: 1 }}
                >
                  {s.num}
                </div>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "#00951922", color: "#009519" }}
                >
                  {s.icon}
                </div>
                <p className="text-[#009519] text-[10px] font-black tracking-[0.2em] uppercase mb-1">{s.num}</p>
                <h3 className="text-base font-black text-white leading-snug mb-1.5">{s.title}</h3>
                <p className="text-[11px] text-[#888888] leading-relaxed">{s.desc}</p>
                {isActive && (
                  <div className="mt-3 flex items-center gap-1.5 text-[#009519] font-bold text-xs">
                    자세히 보기
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                )}
              </div>
            );

            const posStyle: React.CSSProperties = {
              position: "absolute",
              width: `${CARD_W}px`,
              height: `${CARD_H}px`,
              left: `-${CARD_W / 2}px`,
              top:  `-${CARD_H / 2}px`,
              transform: `rotateY(${cardAngle}deg) translateZ(${RADIUS}px)`,
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              opacity,
              transition: "opacity 0.4s ease",
              borderRadius: "16px",
              overflow: "hidden",
            };

            if (isActive) {
              return s.external ? (
                <a
                  key={s.num}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...posStyle, display: "block" }}
                >
                  {interior}
                </a>
              ) : (
                <Link
                  key={s.num}
                  href={s.href}
                  style={{ ...posStyle, display: "block" }}
                >
                  {interior}
                </Link>
              );
            }
            return (
              <div
                key={s.num}
                style={{ ...posStyle, cursor: "pointer" }}
                onClick={() => goTo(i)}
              >
                {interior}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dot navigation */}
      <div className="flex justify-center gap-2 mt-5">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`서비스 ${i + 1}`}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? "20px" : "6px",
              height: "6px",
              background: i === current ? "#009519" : "rgba(255,255,255,0.25)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ServiceCards() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-14 sm:py-20 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div
          className="text-center mb-10 sm:mb-16"
          style={{
            animation: visible ? "service-enter 0.7s ease-out both" : "none",
          }}
        >
          <p className="text-[#009519] text-xs sm:text-sm font-bold tracking-widest uppercase mb-3">
            SERVICES
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#EEEEEE] leading-tight">
            현재 상황에 맞는 서비스를 선택하세요.
          </h2>
        </div>

        {/* ── Desktop: expanding panel strip ── */}
        <div
          className="hidden md:flex rounded-2xl overflow-hidden"
          style={{ height: "520px" }}
          onMouseLeave={() => setHovered(null)}
        >
          {services.map((s, i) => {
            const isHovered = hovered === i;
            const anyHovered = hovered !== null;

            const inner = (
              <>
                {/* Background */}
                <div
                  className="absolute inset-0 transition-all duration-500"
                  style={{
                    background: isHovered
                      ? "linear-gradient(160deg, #0c1f0c 0%, #071207 100%)"
                      : i % 2 === 0
                        ? "linear-gradient(160deg, #1c1c1c 0%, #111111 100%)"
                        : "linear-gradient(160deg, #171717 0%, #0e0e0e 100%)",
                  }}
                />

                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 transition-all duration-500"
                  style={{ width: isHovered ? "3px" : "1px", background: isHovered ? "#009519" : "#2a2a2a" }}
                />

                {/* Watermark number */}
                <div
                  className="absolute font-black text-white pointer-events-none select-none leading-none transition-all duration-500"
                  style={{
                    fontSize: isHovered ? "200px" : "90px",
                    opacity: isHovered ? 0.05 : 0.06,
                    right: "-8px",
                    bottom: "-16px",
                  }}
                >
                  {s.num}
                </div>

                {/* Collapsed state */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-3 transition-opacity duration-300"
                  style={{ opacity: isHovered ? 0 : 1 }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300"
                    style={{ background: "#009519" + "22", color: "#009519" }}
                  >
                    {s.icon}
                  </div>
                  <p
                    className="text-white font-bold text-sm tracking-widest"
                    style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                  >
                    {s.title}
                  </p>
                </div>

                {/* Expanded state */}
                <div
                  className="absolute inset-0 flex flex-col justify-end p-8 transition-opacity duration-300"
                  style={{ opacity: isHovered ? 1 : 0, pointerEvents: isHovered ? "auto" : "none" }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: "#009519" + "25", color: "#009519" }}
                  >
                    {s.icon}
                  </div>
                  <p className="text-[#009519] text-[10px] font-black tracking-[0.2em] uppercase mb-2">
                    {s.num}
                  </p>
                  <h3 className="text-2xl font-black text-white mb-3 leading-snug">
                    {s.title}
                  </h3>
                  <p className="text-[#888888] text-sm leading-relaxed mb-7">
                    {s.desc}
                  </p>
                  <div className="flex items-center gap-2 text-[#009519] font-bold text-sm">
                    자세히 보기
                    <svg
                      className="w-4 h-4 transition-transform duration-200 translate-x-0 group-hover/panel:translate-x-1"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </>
            );

            const sharedStyle: React.CSSProperties = {
              flex: isHovered ? 3.8 : anyHovered ? 0.55 : 1,
              boxShadow: isHovered ? "inset 0 0 0 1.5px #009519" : "inset 0 0 0 0px transparent",
              transitionProperty: "flex, opacity, transform, box-shadow",
              transitionDuration: "0.45s, 0.6s, 0.6s, 0.3s",
              transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1), ease-out, ease-out, ease",
              transitionDelay: `0s, ${i * 0.07}s, ${i * 0.07}s, 0s`,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(40px)",
            };

            if (s.external) {
              return (
                <a
                  key={s.num}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/panel relative overflow-hidden cursor-pointer block"
                  style={sharedStyle}
                  onMouseEnter={() => setHovered(i)}
                >
                  {inner}
                </a>
              );
            }
            return (
              <Link
                key={s.num}
                href={s.href}
                className="group/panel relative overflow-hidden cursor-pointer block"
                style={sharedStyle}
                onMouseEnter={() => setHovered(i)}
              >
                {inner}
              </Link>
            );
          })}
        </div>

        {/* ── Mobile: 3D cylinder carousel ── */}
        <div className="md:hidden">
          <MobileCarousel services={services} visible={visible} />
        </div>

      </div>
    </section>
  );
}
