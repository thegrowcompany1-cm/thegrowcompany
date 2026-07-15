import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "진단컨설팅 | 더그로우컴퍼니",
  description:
    "각 분야 전문가가 매장에 직접 방문해 1:1로 매출·운영·조직·마케팅을 진단하고 개선까지 함께합니다. 대표님의 문제에 맞는 진단 컨설턴트를 선택하세요.",
};

const CONSULTANTS = [
  { slug: "kim-jaegang", name: "김재강", field: "FC운영 · 리더십", img: "/consultants/kim-jaegang.jpg" },
  { slug: "kim-seungho", name: "김승호", field: "FC운영 · PT", img: "/consultants/kim-seungho.jpg" },
  { slug: "hwang-bongnam", name: "황봉남", field: "인적자원 · PT", img: "/consultants/hwang-bongnam.jpg" },
  { slug: "park-jungmin", name: "박정민", field: "FC운영 · PT", img: "/consultants/park-jungmin.png" },
  { slug: "gu-jinwan", name: "구진완", field: "FC운영 · 리더십", img: "/consultants/gu-jinwan.png" },
  { slug: "heo-junyoung", name: "허준영", field: "FC운영 · 마케팅", img: "/consultants/heo-junyoung.jpg" },
];

const STEPS = [
  {
    no: "1",
    title: "신청",
    desc: "상담 신청서를 남기면 상황에 맞는 방향을 안내해 드립니다.",
  },
  {
    no: "2",
    title: "방문 진단",
    desc: "컨설턴트가 매장에 직접 방문해 매출·운영·조직·마케팅 등 문제 지점을 데이터로 특정합니다.",
  },
  {
    no: "3",
    title: "개선 실행",
    desc: "주 1회 한달 코스로, 진단에서 끝나지 않고 실행과 정착까지 함께합니다.",
  },
];

const FADE_STYLE = `
@keyframes dgFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.dg-fade{opacity:0;animation:dgFadeUp .6s ease forwards}
.dg-fade-1{animation-delay:.1s}
.dg-fade-2{animation-delay:.7s}
`;

export default function DiagnosisPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <style dangerouslySetInnerHTML={{ __html: FADE_STYLE }} />

      {/* ── 1. 인트로 ── */}
      <section className="mx-auto max-w-6xl px-4 pt-14 pb-12 sm:px-6 sm:pt-20 sm:pb-16 lg:px-8">
        <div className="flex items-center gap-2 mb-8">
          <Link href="/" className="text-sm text-gray-400 transition-colors hover:text-white">홈</Link>
          <span className="text-gray-600">/</span>
          <span className="text-sm font-semibold text-[#22B573]">진단컨설팅</span>
        </div>

        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#22B573]">DIAGNOSIS CONSULTING</p>
        <h1 className="text-4xl font-black leading-tight sm:text-6xl">진단컨설팅</h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-300 sm:text-xl">
          <span className="dg-fade dg-fade-1 block">
            각 분야의 전문가가 대표님의 매장에 <span className="font-semibold text-[#22B573]">직접 방문</span>하여
          </span>
          <span className="dg-fade dg-fade-2 block">
            <span className="font-semibold text-[#22B573]">1:1</span>로 문제를 진단하고 개선까지 함께하는 서비스입니다.
          </span>
        </p>
      </section>

      {/* ── 2. 작동 방식 3스텝 ── */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 sm:gap-5">
          {STEPS.map((s) => (
            <div
              key={s.no}
              className="rounded-2xl border border-white/10 bg-[#141414] p-7 sm:p-8"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#22B573]/10 text-2xl font-black text-[#22B573]">
                {s.no}
              </div>
              <h3 className="mb-3 text-xl font-extrabold text-white">{s.title}</h3>
              <p className="text-[15px] leading-relaxed text-gray-400">{s.desc}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-relaxed text-gray-500">
          52개 센터 총괄, 110개 마케팅 운영, 600억 매출 경험 — 각 분야를 실제로 겪어낸 전문가들입니다.
        </p>
      </section>

      {/* ── 3. 컨설턴트 선택 그리드 ── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
        <h2 className="mb-8 text-center text-2xl font-black leading-snug sm:mb-12 sm:text-3xl">
          대표님의 문제에 맞는<br className="sm:hidden" /> 전문가를 선택하세요.
        </h2>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
          {CONSULTANTS.map((c) => (
            <Link
              key={c.slug}
              href={`/consulting/diagnosis/${c.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141414] transition-all duration-200 hover:-translate-y-1 hover:border-[#22B573] hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)]"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#1c1c1c]">
                <Image
                  src={c.img}
                  alt={`${c.name} 헬스장·필라테스 운영 진단 컨설턴트`}
                  fill
                  className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  sizes="(min-width: 1024px) 33vw, 50vw"
                />
              </div>
              <div className="flex flex-col gap-1 p-3 sm:p-4">
                <h3 className="text-sm font-bold text-white group-hover:text-[#22B573] sm:text-base">
                  {c.name} 컨설턴트
                </h3>
                <p className="text-xs font-medium text-[#22B573]">{c.field}</p>
              </div>
            </Link>
          ))}

          {/* 이석훈 — 준비중 (링크 없음, 흐리게, 클릭 불가) */}
          <div className="flex cursor-default flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141414] opacity-50 grayscale lg:col-start-2">
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#1c1c1c]">
              <Image
                src="/consultants/lee-seokhun.png"
                alt="이석훈 헬스장·필라테스 운영 진단 컨설턴트 (준비중)"
                fill
                className="object-cover object-top"
                sizes="(min-width: 1024px) 33vw, 50vw"
              />
              <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[11px] font-bold text-white">
                준비중
              </span>
            </div>
            <div className="flex flex-col gap-1 p-3 sm:p-4">
              <h3 className="text-sm font-bold text-white sm:text-base">이석훈 컨설턴트</h3>
              <p className="text-xs font-medium text-gray-400">준비중</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. 클로징 CTA ── */}
      <section className="border-t border-white/10 bg-[#0d0d0d] px-4 py-16 text-center sm:py-20">
        <div className="mx-auto max-w-2xl">
          <p className="text-lg font-bold leading-relaxed text-white sm:text-xl">
            어떤 컨설턴트가 맞을지 고민된다면,<br />
            편하게 남겨주세요. 상황에 맞는 전문가를 연결해 드립니다.
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
