"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ScrollJourneyScene = dynamic(
  () => import("./ScrollJourneyScene"),
  { ssr: false, loading: () => null },
);

const TEXTS = [
  "100년의 노하우가",
  "하나의 시스템으로",
  "당신의 성공을 설계합니다",
];

export default function ScrollJourney() {
  const sectionRef  = useRef<HTMLElement>(null);
  const textRefs    = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef(0);

  const [isMobile,       setIsMobile]       = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);

  // ── Detect env ──────────────────────────────────────────────────────────
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    setPrefersReduced(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  // ── Main GSAP setup ─────────────────────────────────────────────────────
  useEffect(() => {
    const section = sectionRef.current;
    const wraps   = textRefs.current;
    if (!section || wraps.some((w) => !w)) return;

    // Set initial text states before creating timeline
    gsap.set(wraps[0], { opacity: 1, y: 0 });
    gsap.set(wraps.slice(1), { opacity: 0, y: 50 });

    if (prefersReduced) return;

    // Use explicit px so GSAP never misparses the unit
    const scrollPx = isMobile
      ? Math.round(window.innerHeight * 1.8)
      : Math.round(window.innerHeight * 3);

    // gsap.context keeps every created tween/trigger in a sandbox
    // → ctx.revert() cleans up everything on unmount / dep change
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger:            section,
          start:              "top top",
          end:                `+=${scrollPx}`,
          pin:                true,
          anticipatePin:      1,       // pre-pins 1 frame early to avoid jump
          scrub:              1.2,
          invalidateOnRefresh: true,   // recalc on refresh()
          markers:            true,    // ← visible debug markers
          onUpdate(self) {
            progressRef.current = self.progress;
          },
        },
      });

      // Text transitions spread evenly across 0→1 progress
      // 0.00–0.27  hold text 0
      // 0.27–0.37  exit 0 / enter 1
      // 0.37–0.63  hold text 1
      // 0.63–0.73  exit 1 / enter 2
      // 0.73–1.00  hold text 2
      tl
        .to({}, { duration: 0.27 })
        .to(wraps[0]!, { opacity: 0, y: -50, duration: 0.07 })
        .to(wraps[1]!, { opacity: 1, y: 0,   duration: 0.07 }, "<0.035")
        .to({}, { duration: 0.26 })
        .to(wraps[1]!, { opacity: 0, y: -50, duration: 0.07 })
        .to(wraps[2]!, { opacity: 1, y: 0,   duration: 0.07 }, "<0.035")
        .to({}, { duration: 0.27 });
    }, section);

    // ── Force-refresh after dynamic canvas is likely loaded ──────────────
    const t1 = setTimeout(() => ScrollTrigger.refresh(), 300);
    const t2 = setTimeout(() => ScrollTrigger.refresh(), 800); // second pass

    const onResize = () => ScrollTrigger.refresh();
    const onLoad   = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);
    window.addEventListener("load",   onLoad);

    return () => {
      ctx.revert();              // kills timeline + ScrollTrigger cleanly
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load",   onLoad);
    };
  }, [prefersReduced, isMobile]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-black"
      style={{ height: "100vh" }}
    >
      {/* Three.js canvas */}
      <div className="absolute inset-0 z-0">
        <ScrollJourneyScene progressRef={progressRef} isMobile={isMobile} />
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* Text stages */}
      <div className="absolute inset-0 z-10 flex items-center justify-center px-6">
        <div
          className="relative w-full max-w-4xl"
          style={{ height: "clamp(120px, 25vh, 300px)" }}
        >
          {TEXTS.map((text, i) => (
            <div
              key={i}
              ref={(el) => { textRefs.current[i] = el; }}
              className="absolute inset-0 flex items-center justify-center"
              style={{ willChange: "transform, opacity" }}
            >
              <p
                className="font-black text-white text-center leading-tight w-full"
                style={{
                  fontSize: "clamp(2.2rem, 6.5vw, 5.5rem)",
                  textShadow:
                    "0 0 80px rgba(0,200,255,0.5), 0 0 30px rgba(60,100,255,0.4), 0 2px 30px rgba(0,0,0,0.95)",
                  wordBreak: "keep-all",
                }}
              >
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Progress dots */}
      <ProgressDots progressRef={progressRef} />
    </section>
  );
}

// ── Progress dot indicators ─────────────────────────────────────────────────

function ProgressDots({
  progressRef,
}: {
  progressRef: React.MutableRefObject<number>;
}) {
  const dotRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  useEffect(() => {
    let rafId: number;
    const tick = () => {
      const p     = progressRef.current;
      const stage = p < 0.34 ? 0 : p < 0.68 ? 1 : 2;
      dotRefs.forEach((ref, i) => {
        if (!ref.current) return;
        ref.current.style.background =
          i === stage ? "#009519" : "rgba(255,255,255,0.25)";
        ref.current.style.transform =
          i === stage ? "scale(1.4)" : "scale(1)";
      });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2.5 pointer-events-none">
      {dotRefs.map((ref, i) => (
        <div
          key={i}
          ref={ref}
          className="rounded-full transition-transform duration-300"
          style={{ width: "8px", height: "8px", background: "rgba(255,255,255,0.25)" }}
        />
      ))}
    </div>
  );
}
