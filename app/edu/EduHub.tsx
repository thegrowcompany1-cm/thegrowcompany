"use client";

// 그로우 에듀 허브 — 타이핑 인트로 + 스크롤 카운터 + 교육 선택.
// 외부 라이브러리 없음. setInterval/rAF/IntersectionObserver 는 언마운트 시 전부 정리.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import FcLink from "@/components/FcLink";

const LINE1 = "그로우 에듀.";
const LINE2 = "체육시설업 종사자를 위한 성장 교육입니다.";
const TYPE_SPEED = 70; // ms/글자
const LINE_PAUSE = 500; // 줄 사이 멈춤

const STATS = [
  { target: 800, suffix: "명+", label: "누적 수강생" },
  { target: 500, suffix: "명+", label: "함께한 대표님" },
  { target: 200, suffix: "회+", label: "창업 경험사례" },
];

const COURSES = [
  {
    href: "/edu/startup-class",
    img: "/startup/startupjk.png",
    alt: "그로우 에듀 창업 세미나 강의",
    title: "창업 세미나",
    target: "창업을 앞둔 예비 대표님",
    points: [
      "부동산 입지선정 100가지 노하우",
      "인테리어 사기 안 당하는 법",
      "억대 매출 프리세일 설계",
    ],
    badge: "원데이 클래스",
  },
  {
    // 부산 기수 종료(2026-09-12) 후 자동으로 /edu/fc-class 복귀
    href: "/edu/fc-class",
    fc: true,
    img: "https://cdn.imweb.me/thumbnail/20260131/2c27053d77aa7.jpg",
    alt: "그로우 에듀 정규 FC 클래스 교육 현장",
    title: "정규 FC 클래스",
    target: "운영 중인 센터의 대표님과 실무자",
    points: [
      "매출이 돌아가는 운영·관리 시스템",
      "매출로 이어지는 마케팅 실전",
      "강사진 1:1 Q&A",
    ],
    badge: "총 4시간 오프라인",
  },
];

const CURSOR_STYLE = `
@keyframes eduBlink{0%,49%{opacity:1}50%,100%{opacity:0}}
.edu-cursor{display:inline-block;color:#22B573;font-weight:400;animation:eduBlink 1s steps(1) infinite}
`;

export default function EduHub() {
  const [t1, setT1] = useState("");
  const [t2, setT2] = useState("");
  const [done, setDone] = useState(false);
  const [counts, setCounts] = useState<number[]>([0, 0, 0]);
  const statsRef = useRef<HTMLDivElement>(null);

  // 타이핑 인트로 (setInterval + 지연, 언마운트 시 정리)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    const timers: ReturnType<typeof setTimeout>[] = [];
    let i1 = 0;
    let i2 = 0;

    const typeLine2 = () => {
      interval = setInterval(() => {
        i2 += 1;
        setT2(LINE2.slice(0, i2));
        if (i2 >= LINE2.length) {
          if (interval) clearInterval(interval);
          interval = null;
          setDone(true);
        }
      }, TYPE_SPEED);
    };

    const typeLine1 = () => {
      interval = setInterval(() => {
        i1 += 1;
        setT1(LINE1.slice(0, i1));
        if (i1 >= LINE1.length) {
          if (interval) clearInterval(interval);
          interval = null;
          timers.push(setTimeout(typeLine2, LINE_PAUSE));
        }
      }, TYPE_SPEED);
    };

    timers.push(setTimeout(typeLine1, 300));

    return () => {
      if (interval) clearInterval(interval);
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  // 숫자 카운터 (뷰포트 진입 시 1회, rAF 카운트업 — observer/raf 정리)
  useEffect(() => {
    const node = statsRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    let raf = 0;
    let started = false;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting || started) return;
          started = true;
          io.disconnect();
          const DUR = 1500;
          let startTs = 0;
          const step = (ts: number) => {
            if (!startTs) startTs = ts;
            const p = Math.min((ts - startTs) / DUR, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setCounts(STATS.map((s) => Math.round(s.target * eased)));
            if (p < 1) raf = requestAnimationFrame(step);
          };
          raf = requestAnimationFrame(step);
        });
      },
      { threshold: 0.4 }
    );
    io.observe(node);

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const showCursor1 = !done && t2 === "";
  const showCursor2 = !done && t2 !== "";

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <style dangerouslySetInnerHTML={{ __html: CURSOR_STYLE }} />

      {/* ── 1. 타이핑 인트로 ── */}
      <section className="mx-auto max-w-6xl px-4 pt-14 pb-12 sm:px-6 sm:pt-24 sm:pb-16 lg:px-8">
        <div className="flex min-h-[280px] flex-col justify-center sm:min-h-[340px]">
          <h1 className="text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
            <span className="block">
              {t1}
              {showCursor1 && <span className="edu-cursor">|</span>}
            </span>
            <span className="mt-2 block text-2xl sm:mt-3 sm:text-4xl lg:text-5xl">
              {done ? (
                <>
                  체육시설업 종사자를 위한{" "}
                  <span className="text-[#22B573]">성장 교육</span>입니다.
                </>
              ) : (
                <>
                  {t2}
                  {showCursor2 && <span className="edu-cursor">|</span>}
                </>
              )}
            </span>
          </h1>
          <p
            className={`mt-8 max-w-2xl text-base leading-relaxed text-gray-300 transition-opacity duration-700 sm:text-lg ${
              done ? "opacity-100" : "opacity-0"
            }`}
          >
            필라테스, 헬스, PT, 바레 —<br />
            현장을 아는 사람이,{" "}
            <span className="font-semibold text-[#22B573]">현장에서 통하는 것만</span> 가르칩니다.
          </p>
        </div>
      </section>

      {/* ── 2. 숫자 카운터 바 ── */}
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
        <div ref={statsRef} className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/10 bg-[#141414] py-7 text-center"
            >
              <div className="text-3xl font-black text-[#22B573] sm:text-4xl">
                {counts[i]}
                {s.suffix}
              </div>
              <div className="mt-2 text-sm text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. 교육 선택 ── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-black leading-snug sm:mb-12 sm:text-3xl">
          지금 상황에 맞는<br className="sm:hidden" /> 교육을 선택하세요.
        </h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {COURSES.map((c) => {
            const courseCls =
              "group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141414] transition-all duration-200 hover:-translate-y-1 hover:border-[#22B573] hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)]";
            const CourseWrap = ({ children }: { children: React.ReactNode }) =>
              "fc" in c && c.fc ? (
                <FcLink className={courseCls}>{children}</FcLink>
              ) : (
                <Link href={c.href} className={courseCls}>
                  {children}
                </Link>
              );
            return (
            <CourseWrap key={c.href}>
              <div className="relative aspect-video w-full overflow-hidden bg-[#1c1c1c]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.img}
                  alt={c.alt}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-[11px] font-bold text-white">
                  {c.badge}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl font-black text-white group-hover:text-[#22B573]">
                  {c.title}
                </h3>
                <p className="mt-1.5 text-sm font-medium text-[#22B573]">{c.target}</p>
                <ul className="mt-4 flex flex-col gap-2">
                  {c.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-gray-300">
                      <svg
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#22B573]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {p}
                    </li>
                  ))}
                </ul>
                <span className="mt-6 inline-flex items-center gap-1 self-start rounded-full border border-white/15 px-5 py-2.5 text-sm font-bold text-white transition-colors group-hover:border-[#22B573] group-hover:text-[#22B573]">
                  자세히 보기 <span aria-hidden="true">→</span>
                </span>
              </div>
            </CourseWrap>
            );
          })}
        </div>
      </section>

      {/* ── 4. 클로징 CTA ── */}
      <section className="border-t border-white/10 bg-[#0d0d0d] px-4 py-16 text-center sm:py-20">
        <div className="mx-auto max-w-2xl">
          <p className="text-lg font-bold leading-relaxed text-white sm:text-xl">
            어떤 교육이 맞을지 고민된다면,<br />
            편하게 남겨주세요.
          </p>
          <Link
            href="/consulting/diagnosis/kim-jaegang"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-[#22B573] px-8 py-4 text-base font-extrabold text-white transition-colors hover:bg-[#1c9e63]"
          >
            무료 상담 신청하기
          </Link>
        </div>
      </section>
    </div>
  );
}
