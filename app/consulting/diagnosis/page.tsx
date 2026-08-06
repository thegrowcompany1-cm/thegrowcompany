import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import DiagnosisIntro from "./DiagnosisIntro";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "헬스장·필라테스 솔루션 | 더그로우컴퍼니 진단솔루션",
  description:
    "헬스장 솔루션·필라테스 솔루션 전문가가 매장에 직접 방문해 1:1로 진단하고 개선까지 함께합니다. 대표님의 문제에 맞는 진단 멘토를 선택하세요.",
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
    desc: "멘토가 매장에 직접 방문해 매출·운영·조직·마케팅 등 문제 지점을 데이터로 특정합니다.",
  },
  {
    no: "3",
    title: "개선 실행",
    desc: "주 1회 한달 코스로, 진단에서 끝나지 않고 실행과 정착까지 함께합니다.",
  },
];

// 멘토 6명 목록 구조화 데이터
const ITEM_LIST_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: CONSULTANTS.map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    url: `${SITE_URL}/consulting/diagnosis/${c.slug}`,
    name: `${c.name} 멘토`,
  })),
};

// AEO 대응 FAQ 구조화 데이터
const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "진단솔루션은 어떤 서비스인가요",
      acceptedAnswer: {
        "@type": "Answer",
        text: "각 분야의 전문가가 대표님의 매장에 직접 방문하여 1:1로 문제를 진단하고 개선까지 함께하는 서비스입니다. 주 1회, 한달 코스로 진행됩니다.",
      },
    },
  ],
};

export default function DiagnosisPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ITEM_LIST_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
      {/* ── 1. 인트로 (질문 → 답변 인터랙션) ── */}
      <section className="mx-auto max-w-6xl px-4 pt-8 pb-10 sm:px-6 sm:pt-12 sm:pb-14 lg:px-8">
        <DiagnosisIntro />
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
          52개 센터 총괄, 110개 마케팅 운영, 600억 매출 경험 — 헬스장 솔루션·필라테스 솔루션 각 분야를 실제로 겪어낸 전문가들입니다.
        </p>
      </section>

      {/* ── 3. 멘토 선택 그리드 ── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
        <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-[#22B573]">
          헬스장 솔루션 · 필라테스 솔루션
        </p>
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
                  alt={`${c.name} 헬스장·필라테스 운영 진단 멘토`}
                  fill
                  className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  sizes="(min-width: 1024px) 33vw, 50vw"
                />
              </div>
              <div className="flex flex-col gap-1 p-3 sm:p-4">
                <h3 className="text-sm font-bold text-white group-hover:text-[#22B573] sm:text-base">
                  {c.name} 멘토
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
                alt="이석훈 헬스장·필라테스 운영 진단 멘토 (준비중)"
                fill
                className="object-cover object-top"
                sizes="(min-width: 1024px) 33vw, 50vw"
              />
              <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-[11px] font-bold text-white">
                준비중
              </span>
            </div>
            <div className="flex flex-col gap-1 p-3 sm:p-4">
              <h3 className="text-sm font-bold text-white sm:text-base">이석훈 멘토</h3>
              <p className="text-xs font-medium text-gray-400">준비중</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. 클로징 CTA ── */}
      <section className="border-t border-white/10 bg-[#0d0d0d] px-4 py-16 text-center sm:py-20">
        <div className="mx-auto max-w-2xl">
          <p className="text-lg font-bold leading-relaxed text-white sm:text-xl">
            어떤 멘토가 맞을지 고민된다면,<br />
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
