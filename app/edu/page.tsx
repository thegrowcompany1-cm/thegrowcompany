import type { Metadata } from "next";
import Link from "next/link";
import EduIntro from "./EduIntro";

export const metadata: Metadata = {
  title: "그로우 에듀 | 더그로우컴퍼니",
  description:
    "체육시설업 종사자를 위한 성장 교육. 필라테스·헬스·PT·바레 현장에서 통하는 창업 세미나와 정규 FC 클래스를 제공합니다.",
};

const STATS = [
  { num: "800명+", label: "누적 수강생" },
  { num: "500명+", label: "함께한 대표님" },
  { num: "200회+", label: "창업 경험사례" },
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
    href: "/edu/fc-class",
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

export default function EduPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* ── 1. 인트로 (질문 → 답변 인터랙션) ── */}
      <section className="mx-auto max-w-6xl px-4 pt-8 pb-10 sm:px-6 sm:pt-12 sm:pb-14 lg:px-8">
        <EduIntro />
      </section>

      {/* ── 2. 신뢰 숫자 바 ── */}
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-5">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/10 bg-[#141414] py-7 text-center"
            >
              <div className="text-3xl font-black text-[#22B573] sm:text-4xl">{s.num}</div>
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
          {COURSES.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141414] transition-all duration-200 hover:-translate-y-1 hover:border-[#22B573] hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#1c1c1c]">
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
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#22B573]" />
                      {p}
                    </li>
                  ))}
                </ul>
                <span className="mt-6 inline-flex items-center gap-1 self-start rounded-full border border-white/15 px-5 py-2.5 text-sm font-bold text-white transition-colors group-hover:border-[#22B573] group-hover:text-[#22B573]">
                  자세히 보기 <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          ))}
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
