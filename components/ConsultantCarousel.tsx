"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 진단 컨설턴트 상세페이지 하단 "다른 컨설턴트들을 확인해보세요" 캐러셀
//  - 7명 전체 목록을 이 파일에서 관리하고, currentSlug 로 현재 페이지 본인만 제외한다.
//  - PC: 6개가 한 줄 그리드 / 모바일: 가로 스크롤(스와이프) 슬라이드.
//  - 컨설턴트 페이지 추가 시 아래 CONSULTANTS 배열만 갱신하면 된다.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const CONSULTANTS = [
  { slug: "kim-jaegang", name: "김재강", field: "FC운영 · 리더십", img: "/consultants/kim-jaegang.jpg" },
  { slug: "kim-seungho", name: "김승호", field: "FC운영 · PT", img: "/consultants/kim-seungho.jpg" },
  { slug: "hwang-bongnam", name: "황봉남", field: "인적자원 · PT", img: "/consultants/hwang-bongnam.jpg" },
  { slug: "park-jungmin", name: "박정민", field: "FC운영 · PT", img: "/consultants/park-jungmin.png" },
  { slug: "gu-jinwan", name: "구진완", field: "FC운영 · 리더십", img: "/consultants/gu-jinwan.png" },
  { slug: "lee-seokhun", name: "이석훈", field: "FC운영 · 시스템", img: "/consultants/lee-seokhun.png" },
  { slug: "heo-junyoung", name: "허준영", field: "FC운영 · 마케팅", img: "/consultants/heo-junyoung.jpg" },
];

type Consultant = (typeof CONSULTANTS)[number];

function ConsultantCard({ c }: { c: Consultant }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={`/consulting/diagnosis/${c.slug}`}
      className="group flex shrink-0 basis-[46%] snap-start flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-[#009519] hover:shadow-lg sm:basis-[31%] lg:basis-auto"
    >
      {/* 세로형 인물 사진 (안 잘리게 4/5 + 상단 정렬) */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#ececec]">
        {!imgError ? (
          <Image
            src={c.img}
            alt={`${c.name} 헬스장·필라테스 운영 진단 컨설턴트`}
            fill
            className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 16vw, 46vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">
            {c.img}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-0.5 p-3">
        <h3 className="text-sm font-bold text-[#1a1a1a] group-hover:text-[#009519] sm:text-base">
          {c.name} 컨설턴트
        </h3>
        <p className="text-xs leading-snug text-[#777]">{c.field}</p>
      </div>
    </Link>
  );
}

export default function ConsultantCarousel({
  currentSlug,
}: {
  currentSlug: string;
}) {
  const others = CONSULTANTS.filter((c) => c.slug !== currentSlug);

  return (
    <section className="w-full bg-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <h2 className="mb-8 text-center text-xl font-extrabold text-[#1a1a1a] sm:mb-12 sm:text-2xl">
          다른 컨설턴트들을 확인해보세요
        </h2>

        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-6 lg:gap-4 lg:overflow-visible lg:pb-0">
          {others.map((c) => (
            <ConsultantCard key={c.slug} c={c} />
          ))}
        </div>
      </div>
    </section>
  );
}
