// ─────────────────────────────────────────────────────────────────────────────
// 서비스 카테고리 섹션 (정관장 쇼핑몰 스타일 그리드)
//
// 각 카드의 상단 이미지 영역은 회색 placeholder 박스입니다.
// 나중에 이미지를 넣을 때는 각 항목의 `img` 경로(public/ 기준)에 파일을 넣고,
// 아래 ServiceCard의 placeholder 블록을 <Image .../> 로 교체하시면 됩니다.
// 가격이 "0원"인 항목은 그대로 "0원"으로 표시됩니다 (price 값만 수정하면 됨).
// ─────────────────────────────────────────────────────────────────────────────

import Image from "next/image";
import Link from "next/link";

type Card = {
  title: string;
  desc?: string;
  price?: string;
  img: string; // public 기준 경로 (예정 파일명)
  accent?: boolean; // 카드 안에 초록(#009519) 악센트 바 표시 여부
  photo?: boolean; // img 파일이 실제로 존재하여 placeholder 대신 사진을 표시할지 여부
  objectPosition?: string; // 사진 노출 위치 (기본: top). 천장이 많은 사진은 아래쪽으로 내림
  href?: string; // 설정 시 카드 클릭하면 해당 상세페이지로 이동
};

type Group = {
  category: string;
  desc?: string; // 카테고리 헤더 아래 표시되는 설명 문구
  cards: Card[];
};

const groups: Group[] = [
  {
    category: "창업 컨설팅",
    cards: [
      {
        title: "창업 컨설팅",
        desc: "헬스장, 필라테스 등 창업을 준비 중인 대표님",
        price: "0원",
        img: "/startup/startup50.png", // 창업 컨설팅 카드 이미지
        photo: true,
        href: "/consulting/startup", // 클릭 시 창업 컨설팅 상세페이지로 이동
      },
    ],
  },
  {
    category: "위탁 컨설팅",
    cards: [
      {
        title: "매장 위탁운영",
        desc: "헬스장, 필라테스 샵 등 매장 운영이 어려우신 대표님을 위한 컨설팅",
        price: "0원",
        img: "/wt/wt.png", // 매장 위탁운영 카드 이미지
        href: "/consulting/outsourcing", // 클릭 시 매장 위탁운영 상세페이지로 이동
        photo: true,
        accent: true,
      },
      {
        title: "시설 위탁운영",
        desc: "아파트, 기업, 공공기관, 대학교 등 커뮤니티 시설 장기 위탁 컨설팅",
        price: "0원",
        img: "/wt/community.png", // 시설 위탁운영 카드 이미지
        href: "/consulting/community", // 클릭 시 시설 위탁운영 상세페이지로 이동
        photo: true,
        accent: true,
      },
    ],
  },
  {
    category: "진단 컨설팅",
    desc: "우리 매장에 직접 방문하여 1:1로 매장 운영을 개선해드립니다.",
    cards: [
      { title: "김재강 컨설턴트", desc: "FC운영 · 리더십", img: "/consultants/kim-jaegang.jpg", href: "/consulting/diagnosis/kim-jaegang", photo: true },
      { title: "김승호 컨설턴트", desc: "FC운영 · PT", img: "/consultants/kim-seungho.jpg", href: "/consulting/diagnosis/kim-seungho", photo: true },
      { title: "황봉남 컨설턴트", desc: "인적자원 · PT", img: "/consultants/hwang-bongnam.jpg", href: "/consulting/diagnosis/hwang-bongnam", photo: true },
      { title: "박정민 컨설턴트", desc: "FC운영 · PT", img: "/consultants/park-jungmin.png", href: "/consulting/diagnosis/park-jungmin", photo: true },
      { title: "구진완 컨설턴트", desc: "FC운영 · 리더십", img: "/consultants/gu-jinwan.png", href: "/consulting/diagnosis/gu-jinwan", photo: true },
      { title: "이석훈 컨설턴트", desc: "FC운영 · 시스템", img: "/consultants/lee-seokhun.png", href: "/consulting/diagnosis/lee-seokhun", photo: true },
      { title: "허준영 컨설턴트", desc: "FC운영 · 마케팅", img: "/consultants/heo-junyoung.jpg", href: "/consulting/diagnosis/heo-junyoung", photo: true },
    ],
  },
  {
    category: "그로우 에듀",
    desc: "피트니스 업계에 도움이 필요한 세미나를 진행합니다.",
    cards: [
      { title: "창업 세미나", img: "/edu/edustartup.jpg", href: "/edu/startup-class", photo: true, objectPosition: "center 78%" }, // 창업 세미나 카드 이미지
      { title: "정규 FC 세미나", img: "/edu/edufc.jpg", href: "/edu/fc-class", photo: true, objectPosition: "center 78%" }, // 정규 FC 세미나 카드 이미지
    ],
  },
];

function ServiceCard({ card }: { card: Card }) {
  const cardClass =
    "group flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#161616] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-[#009519] hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)]";

  const inner = (
    <>
      {/*
        이미지 placeholder — 정사각형 회색 박스.
        실제 이미지 적용 시 이 블록을 next/image <Image src={card.img} ... /> 로 교체하세요.
        파일 위치(public 기준): {card.img}
      */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#2a2a2a]">
        {card.photo ? (
          <Image
            src={card.img}
            alt={`${card.title} - 더그로우컴퍼니 헬스장·필라테스 피트니스 컨설팅`}
            fill
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            style={{ objectPosition: card.objectPosition ?? "center top", filter: "brightness(0.9)" }}
            sizes="(min-width: 1024px) 25vw, 50vw"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#555555]">
            <svg className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M2.25 6.75h19.5M3.75 4.5h16.5a1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V6a1.5 1.5 0 011.5-1.5z"
              />
            </svg>
            <span className="px-2 text-center text-[10px] leading-tight break-all opacity-70">
              {card.img}
            </span>
          </div>
        )}
      </div>

      {/* 텍스트 영역: 제목 / 부제 / 가격 */}
      <div className="flex flex-1 flex-col p-4">
        {/* 제목 — accent 카드는 제목 옆에 초록(#009519) 세로 바 */}
        <div className="flex items-start gap-2">
          {card.accent && (
            <span className="mt-0.5 h-4 w-1 flex-shrink-0 rounded-full bg-[#009519]" />
          )}
          <h4 className="text-sm font-bold leading-snug text-[#EEEEEE] sm:text-base">
            {card.title}
          </h4>
        </div>
        {card.desc && (
          <p className="mt-1.5 text-xs leading-relaxed text-[#999999] sm:text-[13px]">
            {card.desc}
          </p>
        )}
        {card.price && (
          <p className="mt-3 text-base font-black text-[#009519] sm:text-lg">
            {card.price}
          </p>
        )}
      </div>
    </>
  );

  // href가 있으면 카드를 상세페이지 링크로 렌더링
  if (card.href) {
    return (
      <Link href={card.href} className={cardClass}>
        {inner}
      </Link>
    );
  }

  return <div className={cardClass}>{inner}</div>;
}

export default function ServiceCategoryGrid() {
  return (
    <section className="bg-[#0A0A0A] py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <div className="mb-10 text-center sm:mb-14">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#009519] sm:text-sm">
            SERVICES
          </p>
          <h2 className="text-2xl font-black leading-tight text-[#EEEEEE] sm:text-3xl lg:text-4xl">
            나에게 필요한 서비스를 골라보세요
          </h2>
        </div>

        {/* 카테고리 그룹 */}
        <div className="space-y-12 sm:space-y-16">
          {groups.map((group) => (
            <div key={group.category}>
              {/* 카테고리 구분 헤더 */}
              <div className="mb-5 sm:mb-6">
                <div className="flex items-center gap-3">
                  <span className="h-5 w-1 rounded-full bg-[#009519]" />
                  <h3 className="text-lg font-bold text-[#EEEEEE] sm:text-xl">
                    {group.category}
                  </h3>
                  <span className="h-px flex-1 bg-white/10" />
                </div>
                {group.desc && (
                  <p className="desc-shimmer mt-2 pl-4 text-xs font-medium leading-relaxed sm:text-sm">
                    {group.desc}
                  </p>
                )}
              </div>

              {/* 카드 그리드: 모바일 2열 / 태블릿 2열 / PC 4열 */}
              <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
                {group.cards.map((card) => (
                  <ServiceCard key={card.title} card={card} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
