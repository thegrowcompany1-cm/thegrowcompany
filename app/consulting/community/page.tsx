"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 시설 위탁운영 상세페이지
//
// 구성
//  1) 상세정보 영역: 외부 HTML(아임웹 등) 문자열을 dangerouslySetInnerHTML로 렌더링.
//     이 페이지의 상세 HTML 안에 자체 히어로 + 문의 폼(id="contact")이 포함되어 있어
//     상단 React 상담 폼은 두지 않는다.
//  2) 맨 아래 "다른 서비스 둘러보기" 추천 카드.
//
// 헤더/푸터는 app/layout.tsx 를 그대로 사용한다.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// 하단 "다른 서비스 둘러보기" 추천 카드 (현재 페이지인 시설 위탁운영은 제외)
const RELATED_SERVICES = [
  {
    title: "창업 컨설팅",
    desc: "헬스장·필라테스 등 창업 준비를 위한 컨설팅",
    href: "/consulting/startup",
    img: "/startup/startup50.png", // 창업 컨설팅 카드 이미지
  },
  {
    title: "매장 위탁운영",
    desc: "운영이 어려운 매장을 위한 단기 위탁",
    href: "/consulting/outsourcing",
    img: "/wt/wt.png", // 매장 위탁운영 카드 이미지
  },
  {
    title: "진단 컨설팅",
    desc: "전문가의 1:1 현장 진단",
    href: "/consulting/diagnosis",
    img: "/consultants/kim-jaegang.jpg", // 김재강 컨설턴트
  },
  {
    title: "그로우 에듀",
    desc: "피트니스 실무 교육 프로그램",
    href: "/edu/fc-class",
    img: "/edu/edufc.jpg", // 정규 FC 세미나 (피트니스 실무 교육)
  },
];

// 추천 카드 1개 (이미지 로드 실패 시 회색 placeholder fallback)
function RelatedServiceCard({
  service,
}: {
  service: (typeof RELATED_SERVICES)[number];
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={service.href}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-[#009519] hover:shadow-lg"
    >
      {/* 상단 정사각형 이미지 영역 */}
      <div className="relative aspect-square w-full overflow-hidden bg-[#ececec]">
        {!imgError ? (
          <Image
            src={service.img}
            alt={service.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, 50vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">
            {service.img}
          </div>
        )}
      </div>
      {/* 하단 텍스트 */}
      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <h3 className="text-sm font-bold text-[#1a1a1a] group-hover:text-[#009519] sm:text-base">
          {service.title}
        </h3>
        <p className="text-xs leading-snug text-[#777] sm:text-sm">
          {service.desc}
        </p>
      </div>
    </Link>
  );
}

// ─── 상세정보 HTML ───────────────────────────────────────────────────────────
// 아임웹용 시설 위탁 11개 섹션 HTML(+<style>+<script>) 전체를 이 백틱 문자열 안에 붙여넣으세요.
//
// 붙여넣기 주의:
//  - 백틱( ` ) 과 ${ 두 가지만 \` , \${ 로 이스케이프하면 됩니다. (그 외엔 손댈 필요 없음)
//  - <style>, <script> 등은 그대로 둬도 아래 useEffect 가 동작하게 처리합니다.
//  - 앵커(#contact)가 가리키는 폼 섹션 id="contact" 는 dedupe 시 보존됩니다.
const DETAIL_HTML = `<!-- ============================================ -->
<!-- 더그로우컴퍼니 - 위탁운영 서비스             -->
<!-- 아파트 · 공공기관 · 기업 · 호텔             -->
<!-- Section 1: Hero                            -->
<!-- 아임웹 위젯용 (HTML + CSS 통합)            -->
<!-- ============================================ -->

<style>
  /* 폰트 - 아임웹에 Pretendard 없으면 CDN으로 로드 */
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

  .wo-hero-wrap {
    /* 색상/사이즈 변수 - 여기서 조정 */
    --wo-hero-bg-image: url('https://cdn.imweb.me/thumbnail/20260513/4c3820f8a0b35.png'); /* ← 아임웹 업로드 후 URL 교체 */
    --wo-hero-dark: #0A1220;
    --wo-hero-accent: #D4A574; /* 차분한 골드 - 품격 강조 */
    --wo-hero-text: #FFFFFF;
    --wo-hero-text-mute: rgba(255, 255, 255, 0.72);
    --wo-hero-divider: rgba(255, 255, 255, 0.14);

    position: relative;
    width: 100%;
    min-height: 760px;
    height: 92vh;
    max-height: 920px;
    overflow: hidden;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', sans-serif;
    color: var(--wo-hero-text);
    background: var(--wo-hero-dark);
  }

  .wo-hero-bg {
    position: absolute;
    inset: 0;
    background-image: var(--wo-hero-bg-image);
    background-size: cover;
    background-position: center;
    z-index: 1;
    transform: scale(1.02);
    animation: woHeroZoom 12s ease-out forwards;
  }

  @keyframes woHeroZoom {
    from { transform: scale(1.08); }
    to { transform: scale(1.02); }
  }

  .wo-hero-overlay {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(
        100deg,
        rgba(10, 18, 32, 0.92) 0%,
        rgba(10, 18, 32, 0.78) 35%,
        rgba(10, 18, 32, 0.52) 65%,
        rgba(10, 18, 32, 0.35) 100%
      );
    z-index: 2;
  }

  .wo-hero-overlay::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      transparent 60%,
      rgba(10, 18, 32, 0.5) 100%
    );
  }

  .wo-hero-inner {
    position: relative;
    z-index: 3;
    max-width: 1280px;
    margin: 0 auto;
    padding: 80px 60px;
    height: 100%;
    min-height: inherit;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
  }

  /* 상단 아이브로우 - 4개 버티컬 표시 */
  .wo-hero-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 9px 20px 9px 16px;
    border: 1px solid rgba(212, 165, 116, 0.4);
    border-radius: 100px;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.02em;
    margin-bottom: 36px;
    width: fit-content;
    max-width: 100%;
    background: rgba(212, 165, 116, 0.08);
    color: #EFD5B0;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    opacity: 0;
    animation: woHeroFadeUp 0.8s ease-out 0.1s forwards;
  }

  .wo-hero-eyebrow-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--wo-hero-accent);
    box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.25);
    flex-shrink: 0;
  }

  .wo-hero-eyebrow-text {
    white-space: nowrap;
  }

  .wo-hero-eyebrow-text strong {
    color: #fff;
    font-weight: 600;
    margin-left: 4px;
  }

  .wo-hero-title {
    font-size: clamp(38px, 5vw, 68px);
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.035em;
    margin: 0 0 28px;
    max-width: 820px;
    text-shadow: 0 2px 24px rgba(0, 0, 0, 0.35);
    opacity: 0;
    animation: woHeroFadeUp 0.9s ease-out 0.25s forwards;
  }

  .wo-hero-title-line {
    display: block;
  }

  .wo-hero-title-accent {
    background: linear-gradient(135deg, #F4DDB8 0%, #FFFFFF 60%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    color: transparent;
  }

  .wo-hero-sub {
    font-size: clamp(16px, 1.4vw, 20px);
    font-weight: 400;
    line-height: 1.65;
    color: var(--wo-hero-text-mute);
    margin: 0 0 52px;
    max-width: 600px;
    letter-spacing: -0.005em;
    opacity: 0;
    animation: woHeroFadeUp 0.9s ease-out 0.4s forwards;
  }

  .wo-hero-sub strong {
    color: #fff;
    font-weight: 600;
  }

  /* CTA 버튼 (단일) */
  .wo-hero-cta {
    display: flex;
    margin-bottom: 72px;
    opacity: 0;
    animation: woHeroFadeUp 0.9s ease-out 0.55s forwards;
  }

  .wo-hero-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 19px 36px;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: -0.01em;
    text-decoration: none;
    transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
    cursor: pointer;
    box-sizing: border-box;
    background: #fff;
    color: #0A1220;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    border: 1.5px solid transparent;
  }

  .wo-hero-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 32px rgba(0, 0, 0, 0.35);
    color: #0A1220;
  }

  .wo-hero-btn-arrow {
    transition: transform 0.25s ease;
    display: inline-block;
  }

  .wo-hero-btn:hover .wo-hero-btn-arrow {
    transform: translateX(4px);
  }

  /* 하단 신뢰지표 */
  .wo-hero-trust {
    display: flex;
    gap: 56px;
    padding-top: 36px;
    border-top: 1px solid var(--wo-hero-divider);
    max-width: 820px;
    opacity: 0;
    animation: woHeroFadeUp 0.9s ease-out 0.7s forwards;
  }

  .wo-hero-trust-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .wo-hero-trust-num {
    font-size: 30px;
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1;
    color: #fff;
    font-feature-settings: 'tnum';
  }

  .wo-hero-trust-num span {
    color: var(--wo-hero-accent);
    margin-left: 2px;
    font-weight: 600;
  }

  .wo-hero-trust-label {
    font-size: 13px;
    font-weight: 400;
    color: var(--wo-hero-text-mute);
    letter-spacing: 0;
  }

  .wo-hero-scroll-hint {
    position: absolute;
    right: 60px;
    bottom: 44px;
    z-index: 4;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.1em;
    color: rgba(255, 255, 255, 0.55);
    text-transform: uppercase;
    opacity: 0;
    animation: woHeroFadeUp 0.9s ease-out 0.9s forwards;
  }

  .wo-hero-scroll-hint::after {
    content: '';
    display: block;
    width: 40px;
    height: 1px;
    background: rgba(255, 255, 255, 0.4);
    animation: woHeroScrollLine 2s ease-in-out infinite;
  }

  @keyframes woHeroScrollLine {
    0%, 100% { transform: scaleX(0.4); transform-origin: left; opacity: 0.4; }
    50% { transform: scaleX(1); transform-origin: left; opacity: 1; }
  }

  @keyframes woHeroFadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* === 태블릿 === */
  @media (max-width: 1024px) {
    .wo-hero-inner {
      padding: 80px 40px;
    }
    .wo-hero-scroll-hint {
      right: 40px;
    }
  }

  /* === 모바일 === */
  @media (max-width: 768px) {
    .wo-hero-wrap {
      min-height: 660px;
      height: auto;
    }

    .wo-hero-overlay {
      background:
        linear-gradient(
          to bottom,
          rgba(10, 18, 32, 0.55) 0%,
          rgba(10, 18, 32, 0.82) 60%,
          rgba(10, 18, 32, 0.92) 100%
        );
    }

    .wo-hero-inner {
      padding: 100px 24px 80px;
    }

    .wo-hero-eyebrow {
      font-size: 12px;
      padding: 8px 16px 8px 13px;
      margin-bottom: 24px;
    }

    .wo-hero-eyebrow-text {
      white-space: normal;
    }

    .wo-hero-title {
      margin-bottom: 20px;
      line-height: 1.2;
    }

    .wo-hero-sub {
      margin-bottom: 36px;
    }

    .wo-hero-cta {
      width: 100%;
      margin-bottom: 48px;
    }

    .wo-hero-btn {
      width: 100%;
      padding: 17px 24px;
    }

    .wo-hero-trust {
      gap: 24px 36px;
      flex-wrap: wrap;
      padding-top: 28px;
    }

    .wo-hero-trust-num {
      font-size: 22px;
    }

    .wo-hero-trust-label {
      font-size: 12px;
    }

    .wo-hero-scroll-hint {
      display: none;
    }
  }

  @media (max-width: 380px) {
    .wo-hero-inner {
      padding: 80px 20px 60px;
    }
    .wo-hero-trust {
      gap: 18px 28px;
    }
  }
</style>

<section class="wo-hero-wrap">
  <div class="wo-hero-bg"></div>
  <div class="wo-hero-overlay"></div>

  <div class="wo-hero-inner">

    <div class="wo-hero-eyebrow">
      <span class="wo-hero-eyebrow-dot"></span>
      <span class="wo-hero-eyebrow-text">아파트 · 공공기관 · 기업 · 호텔 <strong>위탁운영</strong></span>
    </div>

    <h1 class="wo-hero-title">
      <span class="wo-hero-title-line">프리미엄 시설의 가치를</span>
      <span class="wo-hero-title-line wo-hero-title-accent">운영으로 완성합니다</span>
    </h1>

    <p class="wo-hero-sub">
      <strong>진단 · 기획 · 운영 · 교육</strong>을 한 회사 안에서.<br>
      컨설팅 기반의 체계적 위탁운영으로 시설의 가치를 끌어올립니다.
    </p>

    <div class="wo-hero-cta">
      <a href="#contact" class="wo-hero-btn">
        위탁 제안서 받기
        <span class="wo-hero-btn-arrow">→</span>
      </a>
    </div>

    <div class="wo-hero-trust">
      <div class="wo-hero-trust-item">
        <div class="wo-hero-trust-num">10<span>년+</span></div>
        <div class="wo-hero-trust-label">피트니스 업계 운영 노하우</div>
      </div>
      <div class="wo-hero-trust-item">
        <div class="wo-hero-trust-num">4<span>대 통합</span></div>
        <div class="wo-hero-trust-label">진단 · 기획 · 운영 · 교육</div>
      </div>
      <div class="wo-hero-trust-item">
        <div class="wo-hero-trust-num">전문<span>인력</span></div>
        <div class="wo-hero-trust-label">자격검증 강사 풀 운영</div>
      </div>
    </div>

  </div>

  <div class="wo-hero-scroll-hint">
    SCROLL
  </div>
</section>

<!-- ============================================ -->
<!-- Section 2: 운영 가능 시설 유형 (이미지 배경)  -->
<!-- ============================================ -->

<style>
  .wo-types {
    /* === 이미지 URL 여기서 교체 === */
    --wo-types-img-apt:    url('https://cdn.imweb.me/thumbnail/20260513/837b72cda206d.png'); /* 아파트 */
    --wo-types-img-pub:    url('https://cdn.imweb.me/thumbnail/20260513/4091425bf2bf7.png'); /* 공공기관 */
    --wo-types-img-corp:   url('https://cdn.imweb.me/thumbnail/20260513/0ff52097117d9.png'); /* 기업 */
    --wo-types-img-hotel:  url('https://cdn.imweb.me/thumbnail/20260513/425b5e9b225b2.png'); /* 호텔 */

    /* === 색상 토큰 === */
    --wo-types-bg: #FAFAF7;
    --wo-types-dark: #0A1220;
    --wo-types-muted: #6B7280;
    --wo-types-accent: #B8895D;

    position: relative;
    width: 100%;
    padding: 120px 0;
    background: var(--wo-types-bg);
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', sans-serif;
    color: var(--wo-types-dark);
    box-sizing: border-box;
  }

  .wo-types-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 60px;
    box-sizing: border-box;
  }

  .wo-types-head {
    margin-bottom: 72px;
    max-width: 820px;
  }

  .wo-types-eyebrow {
    display: inline-block;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.18em;
    color: var(--wo-types-accent);
    margin-bottom: 20px;
    text-transform: uppercase;
  }

  .wo-types-title {
    font-size: clamp(28px, 3.4vw, 46px);
    font-weight: 800;
    line-height: 1.25;
    letter-spacing: -0.03em;
    margin: 0 0 20px;
    color: var(--wo-types-dark);
  }

  .wo-types-title-accent {
    color: var(--wo-types-muted);
    font-weight: 600;
  }

  .wo-types-lead {
    font-size: 17px;
    line-height: 1.7;
    color: var(--wo-types-muted);
    margin: 0;
    max-width: 640px;
  }

  /* 4-column grid */
  .wo-types-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }

  .wo-types-card {
    position: relative;
    border-radius: 14px;
    padding: 36px 32px 32px;
    min-height: 420px;
    overflow: hidden;
    background-color: var(--wo-types-dark);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    color: #fff;
    transition: transform 0.4s ease, box-shadow 0.4s ease;
    cursor: default;
    display: flex;
    flex-direction: column;
    isolation: isolate;
  }

  /* 어두운 오버레이 (50% 기본 + 하단 가독성 그라데이션) */
  .wo-types-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg,
        rgba(10, 18, 32, 0.35) 0%,
        rgba(10, 18, 32, 0.55) 55%,
        rgba(10, 18, 32, 0.78) 100%
      );
    z-index: 1;
    transition: opacity 0.4s ease;
  }

  /* 카드별 배경 이미지 */
  .wo-types-card.is-apt    { background-image: var(--wo-types-img-apt); }
  .wo-types-card.is-pub    { background-image: var(--wo-types-img-pub); }
  .wo-types-card.is-corp   { background-image: var(--wo-types-img-corp); }
  .wo-types-card.is-hotel  { background-image: var(--wo-types-img-hotel); }

  .wo-types-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 24px 50px rgba(10, 18, 32, 0.25);
  }

  .wo-types-card:hover::before {
    background:
      linear-gradient(180deg,
        rgba(10, 18, 32, 0.28) 0%,
        rgba(10, 18, 32, 0.48) 55%,
        rgba(10, 18, 32, 0.72) 100%
      );
  }

  /* 카드 내부 콘텐츠는 오버레이 위로 */
  .wo-types-card > * {
    position: relative;
    z-index: 2;
  }

  .wo-types-num {
    font-size: 13px;
    font-weight: 600;
    color: #E8C9A0;
    letter-spacing: 0.1em;
    font-feature-settings: 'tnum';
  }

  .wo-types-body {
    margin-top: auto;
  }

  .wo-types-name {
    font-size: 30px;
    font-weight: 800;
    letter-spacing: -0.025em;
    margin: 0 0 14px;
    color: #fff;
    line-height: 1.2;
  }

  .wo-types-desc {
    font-size: 15px;
    line-height: 1.65;
    color: rgba(255, 255, 255, 0.85);
    margin: 0 0 22px;
  }

  .wo-types-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding-top: 22px;
    border-top: 1px solid rgba(255, 255, 255, 0.18);
  }

  .wo-types-tag {
    display: inline-block;
    font-size: 12px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.92);
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 5px 11px;
    border-radius: 4px;
    letter-spacing: -0.01em;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  /* === 태블릿 === */
  @media (max-width: 1024px) {
    .wo-types {
      padding: 100px 0;
    }
    .wo-types-inner {
      padding: 0 40px;
    }
    .wo-types-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 18px;
    }
    .wo-types-card {
      min-height: 380px;
    }
  }

  /* === 모바일 === */
  @media (max-width: 640px) {
    .wo-types {
      padding: 80px 0;
    }
    .wo-types-inner {
      padding: 0 24px;
    }
    .wo-types-head {
      margin-bottom: 48px;
    }
    .wo-types-grid {
      grid-template-columns: 1fr;
      gap: 14px;
    }
    .wo-types-card {
      min-height: 340px;
      padding: 28px 24px 24px;
    }
    .wo-types-name {
      font-size: 26px;
    }
  }
</style>

<section class="wo-types">
  <div class="wo-types-inner">

    <div class="wo-types-head">
      <div class="wo-types-eyebrow">SERVICE SCOPE</div>
      <h2 class="wo-types-title">
        4가지 시설 유형,<br>
        <span class="wo-types-title-accent">각 시설의 운영 문법을 압니다.</span>
      </h2>
      <p class="wo-types-lead">
        시설마다 이용자, 의사결정자, 운영 목표가 다릅니다. 더그로우컴퍼니는 시설 유형별로 특화된 위탁운영을 제공합니다.
      </p>
    </div>

    <div class="wo-types-grid">

      <div class="wo-types-card is-apt">
        <div class="wo-types-num">01</div>
        <div class="wo-types-body">
          <h3 class="wo-types-name">아파트</h3>
          <p class="wo-types-desc">
            입주민 전용 커뮤니티 피트니스. 입대의·관리주체 대상 위탁운영.
          </p>
          <div class="wo-types-tags">
            <span class="wo-types-tag">입주민 케어</span>
            <span class="wo-types-tag">단지 가치</span>
          </div>
        </div>
      </div>

      <div class="wo-types-card is-pub">
        <div class="wo-types-num">02</div>
        <div class="wo-types-body">
          <h3 class="wo-types-name">공공기관</h3>
          <p class="wo-types-desc">
            주민센터·공공체육시설·복지관. 입찰 기반 위탁 운영 노하우.
          </p>
          <div class="wo-types-tags">
            <span class="wo-types-tag">주민 강좌</span>
            <span class="wo-types-tag">공공입찰</span>
          </div>
        </div>
      </div>

      <div class="wo-types-card is-corp">
        <div class="wo-types-num">03</div>
        <div class="wo-types-body">
          <h3 class="wo-types-name">기업</h3>
          <p class="wo-types-desc">
            임직원 복지시설·사내 피트니스센터. 출퇴근·점심시간 패턴 최적화.
          </p>
          <div class="wo-types-tags">
            <span class="wo-types-tag">임직원 복지</span>
            <span class="wo-types-tag">생산성</span>
          </div>
        </div>
      </div>

      <div class="wo-types-card is-hotel">
        <div class="wo-types-num">04</div>
        <div class="wo-types-body">
          <h3 class="wo-types-name">호텔</h3>
          <p class="wo-types-desc">
            호텔 게스트 피트니스·스파. 프리미엄 서비스 수준 운영.
          </p>
          <div class="wo-types-tags">
            <span class="wo-types-tag">게스트 케어</span>
            <span class="wo-types-tag">프리미엄</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- ============================================ -->
<!-- Section 2b: 시설별 의사결정자가 얻는 것 (v2) -->
<!-- 고객 경험 가치 + 다양한 프로그램 라인업 축    -->
<!-- ============================================ -->

<style>
  .wo-gain {
    --wo-gain-bg: #FAFAF7;
    --wo-gain-card-bg: #FFFFFF;
    --wo-gain-want-bg: #F4F1EA;
    --wo-gain-deliver-bg: #0A1220;
    --wo-gain-border: #E8E5DD;
    --wo-gain-dark: #0A1220;
    --wo-gain-muted: #6B7280;
    --wo-gain-accent: #B8895D;
    --wo-gain-accent-light: #E8C9A0;

    position: relative;
    width: 100%;
    padding: 120px 0;
    background: var(--wo-gain-bg);
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', sans-serif;
    color: var(--wo-gain-dark);
    box-sizing: border-box;
  }

  .wo-gain-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 60px;
    box-sizing: border-box;
  }

  .wo-gain-head {
    text-align: center;
    margin-bottom: 72px;
    max-width: 820px;
    margin-left: auto;
    margin-right: auto;
  }

  .wo-gain-eyebrow {
    display: inline-block;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.18em;
    color: var(--wo-gain-accent);
    margin-bottom: 20px;
    text-transform: uppercase;
  }

  .wo-gain-title {
    font-size: clamp(28px, 3.4vw, 46px);
    font-weight: 800;
    line-height: 1.25;
    letter-spacing: -0.03em;
    margin: 0 0 20px;
  }

  .wo-gain-title-accent {
    color: var(--wo-gain-accent);
  }

  .wo-gain-lead {
    font-size: 17px;
    line-height: 1.7;
    color: var(--wo-gain-muted);
    margin: 0;
  }

  /* 2x2 grid */
  .wo-gain-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  .wo-gain-card {
    position: relative;
    background: var(--wo-gain-card-bg);
    border: 1px solid var(--wo-gain-border);
    border-radius: 18px;
    padding: 40px 40px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    display: flex;
    flex-direction: column;
  }

  .wo-gain-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 50px rgba(10, 18, 32, 0.08);
  }

  /* Card header: facility + decision maker */
  .wo-gain-card-head {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 28px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--wo-gain-border);
  }

  .wo-gain-num {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: var(--wo-gain-want-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 800;
    color: var(--wo-gain-accent);
    font-feature-settings: 'tnum';
  }

  .wo-gain-facility {
    font-size: 21px;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.2;
    margin: 0;
  }

  .wo-gain-decider {
    font-size: 13px;
    font-weight: 500;
    color: var(--wo-gain-muted);
    margin-top: 3px;
  }

  /* WANT block */
  .wo-gain-want {
    background: var(--wo-gain-want-bg);
    border-radius: 12px;
    padding: 22px 24px;
    margin-bottom: 18px;
  }

  .wo-gain-block-label {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--wo-gain-muted);
    margin-bottom: 12px;
  }

  .wo-gain-want-text {
    font-size: 17px;
    font-weight: 700;
    line-height: 1.45;
    letter-spacing: -0.02em;
    color: var(--wo-gain-dark);
    margin: 0;
  }

  /* Arrow */
  .wo-gain-arrow {
    text-align: center;
    margin: 0 0 18px;
    color: var(--wo-gain-accent);
    font-size: 18px;
    line-height: 1;
  }

  /* DELIVER block */
  .wo-gain-deliver {
    background: var(--wo-gain-deliver-bg);
    border-radius: 12px;
    padding: 24px 24px;
    flex: 1;
  }

  .wo-gain-deliver .wo-gain-block-label {
    color: var(--wo-gain-accent-light);
  }

  .wo-gain-deliver-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 11px;
  }

  .wo-gain-deliver-list li {
    position: relative;
    padding-left: 22px;
    font-size: 14.5px;
    line-height: 1.55;
    color: rgba(255, 255, 255, 0.9);
  }

  .wo-gain-deliver-list li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 8px;
    width: 13px;
    height: 1.5px;
    background: var(--wo-gain-accent-light);
  }

  .wo-gain-deliver-list strong {
    color: #fff;
    font-weight: 700;
  }

  /* === 태블릿 === */
  @media (max-width: 1024px) {
    .wo-gain {
      padding: 100px 0;
    }
    .wo-gain-inner {
      padding: 0 40px;
    }
  }

  /* === 모바일 === */
  @media (max-width: 640px) {
    .wo-gain {
      padding: 80px 0;
    }
    .wo-gain-inner {
      padding: 0 24px;
    }
    .wo-gain-head {
      margin-bottom: 48px;
    }
    .wo-gain-grid {
      grid-template-columns: 1fr;
      gap: 16px;
    }
    .wo-gain-card {
      padding: 32px 28px;
    }
    .wo-gain-facility {
      font-size: 19px;
    }
    .wo-gain-want-text {
      font-size: 16px;
    }
  }
</style>

<section class="wo-gain">
  <div class="wo-gain-inner">

    <div class="wo-gain-head">
      <div class="wo-gain-eyebrow">WHAT YOU GAIN</div>
      <h2 class="wo-gain-title">
        커뮤니티 멤버의 경험이<br>
        <span class="wo-gain-title-accent">곧 시설의 가치입니다.</span>
      </h2>
      <p class="wo-gain-lead">
        의사결정자는 매출이 아니라, 커뮤니티 멤버가 받는 경험으로 평가받습니다. 더그로우컴퍼니는 타겟 연령에 맞춘 다양한 프로그램으로 그 경험을 만듭니다.
      </p>
    </div>

    <div class="wo-gain-grid">

      <!-- 아파트 -->
      <div class="wo-gain-card">
        <div class="wo-gain-card-head">
          <div class="wo-gain-num">01</div>
          <div>
            <h3 class="wo-gain-facility">아파트</h3>
            <div class="wo-gain-decider">입주자대표회의 · 관리주체</div>
          </div>
        </div>

        <div class="wo-gain-want">
          <div class="wo-gain-block-label">원하는 것</div>
          <p class="wo-gain-want-text">
            "입주민이 단지 안에서 받는<br>경험으로 단지가 평가됩니다."
          </p>
        </div>

        <div class="wo-gain-arrow">↓</div>

        <div class="wo-gain-deliver">
          <div class="wo-gain-block-label">더그로우가 만드는 경험</div>
          <ul class="wo-gain-deliver-list">
            <li><strong>시니어 바레·근력</strong>, <strong>주부 GX·필라테스</strong>, <strong>키즈 체조</strong>, <strong>청장년 복싱·PT</strong> 등 전 연령 라인업</li>
            <li>단지 타겟 분포에 맞춰 프로그램 비중을 설계</li>
            <li>"단지 안에 이런 시설이 있어서 좋다"는 입주민 인식 → <strong>단지 가치 상승</strong></li>
          </ul>
        </div>
      </div>

      <!-- 공공기관 -->
      <div class="wo-gain-card">
        <div class="wo-gain-card-head">
          <div class="wo-gain-num">02</div>
          <div>
            <h3 class="wo-gain-facility">공공기관</h3>
            <div class="wo-gain-decider">기관장 · 담당 부서</div>
          </div>
        </div>

        <div class="wo-gain-want">
          <div class="wo-gain-block-label">원하는 것</div>
          <p class="wo-gain-want-text">
            "시민이 체감하는 웰니스 경험이<br>곧 정책 성과입니다."
          </p>
        </div>

        <div class="wo-gain-arrow">↓</div>

        <div class="wo-gain-deliver">
          <div class="wo-gain-block-label">더그로우가 만드는 경험</div>
          <ul class="wo-gain-deliver-list">
            <li><strong>시니어 낙상예방·근력</strong>, <strong>청소년 복싱·체력</strong>, <strong>임산부 바레</strong>, <strong>여성 GX</strong> 등 시민 계층별 콘텐츠</li>
            <li>민간이 다루지 못하는 <strong>장애인 체육·취약계층 케어</strong>까지</li>
            <li>운영 효율이 아닌 <strong>시민 삶의 질 향상</strong>에 초점</li>
          </ul>
        </div>
      </div>

      <!-- 기업 -->
      <div class="wo-gain-card">
        <div class="wo-gain-card-head">
          <div class="wo-gain-num">03</div>
          <div>
            <h3 class="wo-gain-facility">기업</h3>
            <div class="wo-gain-decider">대표 · HR · 총무</div>
          </div>
        </div>

        <div class="wo-gain-want">
          <div class="wo-gain-block-label">원하는 것</div>
          <p class="wo-gain-want-text">
            "임직원의 일상 속 웰니스 경험이<br>회사 복지의 핵심입니다."
          </p>
        </div>

        <div class="wo-gain-arrow">↓</div>

        <div class="wo-gain-deliver">
          <div class="wo-gain-block-label">더그로우가 만드는 경험</div>
          <ul class="wo-gain-deliver-list">
            <li><strong>출근 전 그룹GX</strong>, <strong>점심 바레·스트레칭</strong>, <strong>퇴근 후 복싱·PT</strong>, <strong>임원 골프 케어</strong> 라이프 맞춤</li>
            <li>단순 시설 제공이 아닌 <strong>매일 쌓이는 웰니스 경험</strong></li>
            <li>"회사가 내 건강과 일상을 챙긴다" → <strong>장기 근속·만족도 상승</strong></li>
          </ul>
        </div>
      </div>

      <!-- 호텔 -->
      <div class="wo-gain-card">
        <div class="wo-gain-card-head">
          <div class="wo-gain-num">04</div>
          <div>
            <h3 class="wo-gain-facility">호텔</h3>
            <div class="wo-gain-decider">총지배인 · 오너</div>
          </div>
        </div>

        <div class="wo-gain-want">
          <div class="wo-gain-block-label">원하는 것</div>
          <p class="wo-gain-want-text">
            "투숙객·회원의 차별화된 경험이<br>호텔 가치를 만듭니다."
          </p>
        </div>

        <div class="wo-gain-arrow">↓</div>

        <div class="wo-gain-deliver">
          <div class="wo-gain-block-label">더그로우가 만드는 경험</div>
          <ul class="wo-gain-deliver-list">
            <li><strong>요가·바레·필라테스</strong> 데일리, <strong>골프 레슨</strong>, <strong>복싱·기능성 GX</strong>, <strong>1:1 PT</strong>까지 풀 라인업</li>
            <li>일반 헬스장과 다른 <strong>컨시어지급 웰니스 케어</strong></li>
            <li>회원권 만족도·투숙객 만족도 → <strong>호텔 브랜드 가치 기여</strong></li>
          </ul>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- ============================================ -->
<!-- Section 3: 시설 관리자의 고민                -->
<!-- ============================================ -->

<style>
  .wo-pain {
    --wo-pain-bg: #FFFFFF;
    --wo-pain-card-bg: #F8F7F2;
    --wo-pain-border: #E8E5DD;
    --wo-pain-dark: #0A1220;
    --wo-pain-muted: #6B7280;
    --wo-pain-accent: #B8895D;
    --wo-pain-warn: #B85C44;

    position: relative;
    width: 100%;
    padding: 120px 0;
    background: var(--wo-pain-bg);
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', sans-serif;
    color: var(--wo-pain-dark);
    box-sizing: border-box;
  }

  .wo-pain-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 60px;
    box-sizing: border-box;
  }

  .wo-pain-head {
    text-align: center;
    margin-bottom: 72px;
    max-width: 760px;
    margin-left: auto;
    margin-right: auto;
  }

  .wo-pain-eyebrow {
    display: inline-block;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.18em;
    color: var(--wo-pain-warn);
    margin-bottom: 20px;
    text-transform: uppercase;
  }

  .wo-pain-title {
    font-size: clamp(28px, 3.4vw, 46px);
    font-weight: 800;
    line-height: 1.25;
    letter-spacing: -0.03em;
    margin: 0 0 20px;
  }

  .wo-pain-title-accent {
    color: var(--wo-pain-warn);
  }

  .wo-pain-lead {
    font-size: 17px;
    line-height: 1.7;
    color: var(--wo-pain-muted);
    margin: 0;
  }

  /* 2x2 grid */
  .wo-pain-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .wo-pain-card {
    position: relative;
    background: var(--wo-pain-card-bg);
    border-radius: 16px;
    padding: 40px 40px 36px;
    transition: transform 0.3s ease;
    overflow: hidden;
    border: 1px solid var(--wo-pain-border);
  }

  .wo-pain-card::before {
    content: '';
    position: absolute;
    top: 32px;
    right: 32px;
    width: 80px;
    height: 80px;
    background: radial-gradient(circle, rgba(184, 92, 68, 0.06) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }

  .wo-pain-card:hover {
    transform: translateY(-4px);
  }

  .wo-pain-quote {
    position: relative;
    font-size: 22px;
    font-weight: 700;
    line-height: 1.45;
    letter-spacing: -0.025em;
    margin: 0 0 20px;
    color: var(--wo-pain-dark);
    padding-left: 24px;
  }

  .wo-pain-quote::before {
    content: '"';
    position: absolute;
    left: 0;
    top: -8px;
    font-size: 48px;
    font-weight: 700;
    color: var(--wo-pain-warn);
    line-height: 1;
    font-family: Georgia, serif;
  }

  .wo-pain-desc {
    font-size: 15px;
    line-height: 1.7;
    color: var(--wo-pain-muted);
    margin: 0 0 24px;
  }

  .wo-pain-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 600;
    color: var(--wo-pain-warn);
    background: rgba(184, 92, 68, 0.08);
    padding: 6px 12px 6px 10px;
    border-radius: 100px;
    letter-spacing: 0.02em;
  }

  .wo-pain-tag::before {
    content: '';
    width: 5px;
    height: 5px;
    background: var(--wo-pain-warn);
    border-radius: 50%;
  }

  /* Bottom transition message */
  .wo-pain-foot {
    margin-top: 64px;
    padding: 36px 48px;
    background: var(--wo-pain-dark);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    flex-wrap: wrap;
  }

  .wo-pain-foot-text {
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    line-height: 1.5;
    letter-spacing: -0.02em;
    margin: 0;
    flex: 1;
    min-width: 280px;
  }

  .wo-pain-foot-text strong {
    color: #E8C9A0;
  }

  .wo-pain-foot-arrow {
    color: #E8C9A0;
    font-size: 32px;
    line-height: 1;
    transition: transform 0.3s ease;
  }

  .wo-pain-foot:hover .wo-pain-foot-arrow {
    transform: translateX(6px);
  }

  /* === 태블릿 === */
  @media (max-width: 1024px) {
    .wo-pain {
      padding: 100px 0;
    }
    .wo-pain-inner {
      padding: 0 40px;
    }
  }

  /* === 모바일 === */
  @media (max-width: 640px) {
    .wo-pain {
      padding: 80px 0;
    }
    .wo-pain-inner {
      padding: 0 24px;
    }
    .wo-pain-head {
      margin-bottom: 48px;
    }
    .wo-pain-grid {
      grid-template-columns: 1fr;
      gap: 14px;
    }
    .wo-pain-card {
      padding: 32px 28px 28px;
    }
    .wo-pain-quote {
      font-size: 19px;
      padding-left: 20px;
    }
    .wo-pain-quote::before {
      font-size: 40px;
    }
    .wo-pain-foot {
      padding: 28px 28px;
      margin-top: 48px;
    }
    .wo-pain-foot-text {
      font-size: 16px;
      min-width: 0;
    }
  }
</style>

<section class="wo-pain">
  <div class="wo-pain-inner">

    <div class="wo-pain-head">
      <div class="wo-pain-eyebrow">PAIN POINTS</div>
      <h2 class="wo-pain-title">
        시설 담당자라면, <span class="wo-pain-title-accent">한 번쯤 겪어본 고민</span>
      </h2>
      <p class="wo-pain-lead">
        입대의·관리사무소·공공기관 담당자·기업 총무팀·호텔 시설관리팀 모두가 공통으로 마주하는 위탁운영의 현실적 문제들.
      </p>
    </div>

    <div class="wo-pain-grid">

      <div class="wo-pain-card">
        <h3 class="wo-pain-quote">
          민원이 들어와도<br>즉각 대응이 안 됩니다.
        </h3>
        <p class="wo-pain-desc">
          이용자 불만이 발생하면 운영사·관리주체·시설 사이를 왔다 갔다 하며 처리 지연. 책임 소재가 불분명한 채로 시간만 흘러갑니다.
        </p>
        <span class="wo-pain-tag">민원·CS 대응</span>
      </div>

      <div class="wo-pain-card">
        <h3 class="wo-pain-quote">
          강사 한 명 그만두면<br>운영 공백이 큽니다.
        </h3>
        <p class="wo-pain-desc">
          핵심 인력 이탈 시 즉시 대체가 어렵고, 수업 폐강·환불 요구로 이어집니다. 강사 검증과 교체 시스템이 부재한 경우가 많습니다.
        </p>
        <span class="wo-pain-tag">인력 관리</span>
      </div>

      <div class="wo-pain-card">
        <h3 class="wo-pain-quote">
          안전사고 시 책임 소재가<br>불분명합니다.
        </h3>
        <p class="wo-pain-desc">
          시설 사고가 났을 때 운영사·관리주체·이용자 간 책임 분담이 모호. 사전 매뉴얼과 보험·대응 프로세스가 없으면 분쟁으로 직결됩니다.
        </p>
        <span class="wo-pain-tag">안전·법적 리스크</span>
      </div>

      <div class="wo-pain-card">
        <h3 class="wo-pain-quote">
          운영비는 나가는데<br>이용률은 낮습니다.
        </h3>
        <p class="wo-pain-desc">
          시설은 있는데 이용자가 모이지 않는 상황. 프로그램 기획·홍보·이용자 케어 노하우가 부족하면 시설은 점차 방치 자산이 됩니다.
        </p>
        <span class="wo-pain-tag">활성화·이용률</span>
      </div>

    </div>

    <div class="wo-pain-foot">
      <p class="wo-pain-foot-text">
        이 모든 문제는 <strong>운영의 깊이</strong>에서 해결됩니다.<br>
        더그로우컴퍼니가 왜 다른지, 다음에서 확인하세요.
      </p>
      <span class="wo-pain-foot-arrow">↓</span>
    </div>

  </div>
</section>

<!-- ============================================ -->
<!-- Section 4: 더그로우컴퍼니가 다른 이유         -->
<!-- ============================================ -->

<style>
  .wo-why {
    --wo-why-bg: #F4F1EA;
    --wo-why-card-bg: #FFFFFF;
    --wo-why-border: #E8E5DD;
    --wo-why-dark: #0A1220;
    --wo-why-muted: #6B7280;
    --wo-why-accent: #B8895D;

    position: relative;
    width: 100%;
    padding: 120px 0;
    background: var(--wo-why-bg);
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', sans-serif;
    color: var(--wo-why-dark);
    box-sizing: border-box;
    overflow: hidden;
  }

  .wo-why-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 60px;
    box-sizing: border-box;
  }

  .wo-why-head {
    margin-bottom: 80px;
    max-width: 820px;
  }

  .wo-why-eyebrow {
    display: inline-block;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.18em;
    color: var(--wo-why-accent);
    margin-bottom: 20px;
    text-transform: uppercase;
  }

  .wo-why-title {
    font-size: clamp(28px, 3.4vw, 48px);
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: -0.03em;
    margin: 0 0 20px;
  }

  .wo-why-title-accent {
    color: var(--wo-why-accent);
  }

  .wo-why-lead {
    font-size: 17px;
    line-height: 1.7;
    color: var(--wo-why-muted);
    margin: 0;
    max-width: 660px;
  }

  /* Differentiator cards - alternating layout */
  .wo-why-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .wo-why-item {
    position: relative;
    background: var(--wo-why-card-bg);
    border-radius: 18px;
    padding: 56px 64px;
    display: grid;
    grid-template-columns: 120px 1fr auto;
    gap: 48px;
    align-items: center;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border: 1px solid var(--wo-why-border);
  }

  .wo-why-item:hover {
    transform: translateX(6px);
    box-shadow: 0 16px 40px rgba(10, 18, 32, 0.06);
  }

  .wo-why-num {
    font-size: 80px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.05em;
    color: transparent;
    -webkit-text-stroke: 1.5px var(--wo-why-accent);
    font-feature-settings: 'tnum';
  }

  .wo-why-content {
    min-width: 0;
  }

  .wo-why-name {
    font-size: clamp(22px, 2.2vw, 30px);
    font-weight: 800;
    letter-spacing: -0.025em;
    margin: 0 0 14px;
    line-height: 1.25;
  }

  .wo-why-desc {
    font-size: 16px;
    line-height: 1.7;
    color: var(--wo-why-muted);
    margin: 0 0 18px;
    max-width: 580px;
  }

  .wo-why-bullets {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .wo-why-bullets li {
    font-size: 13px;
    font-weight: 500;
    color: var(--wo-why-dark);
    background: #F4F1EA;
    padding: 6px 12px;
    border-radius: 5px;
    letter-spacing: -0.01em;
  }

  .wo-why-visual {
    width: 88px;
    height: 88px;
    background: var(--wo-why-dark);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #E8C9A0;
    flex-shrink: 0;
  }

  .wo-why-visual svg {
    width: 44px;
    height: 44px;
    stroke-width: 1.6;
  }

  /* === 태블릿 === */
  @media (max-width: 1024px) {
    .wo-why {
      padding: 100px 0;
    }
    .wo-why-inner {
      padding: 0 40px;
    }
    .wo-why-item {
      padding: 44px 44px;
      gap: 32px;
    }
    .wo-why-num {
      font-size: 64px;
    }
    .wo-why-visual {
      width: 72px;
      height: 72px;
    }
    .wo-why-visual svg {
      width: 36px;
      height: 36px;
    }
  }

  /* === 모바일 === */
  @media (max-width: 768px) {
    .wo-why {
      padding: 80px 0;
    }
    .wo-why-inner {
      padding: 0 24px;
    }
    .wo-why-head {
      margin-bottom: 48px;
    }
    .wo-why-list {
      gap: 16px;
    }
    .wo-why-item {
      padding: 32px 28px;
      grid-template-columns: auto 1fr;
      grid-template-rows: auto auto;
      gap: 16px 20px;
    }
    .wo-why-num {
      font-size: 48px;
      grid-row: 1;
      grid-column: 1;
    }
    .wo-why-visual {
      width: 56px;
      height: 56px;
      grid-row: 1;
      grid-column: 2;
      justify-self: end;
    }
    .wo-why-visual svg {
      width: 28px;
      height: 28px;
    }
    .wo-why-content {
      grid-row: 2;
      grid-column: 1 / -1;
    }
    .wo-why-item:hover {
      transform: translateY(-4px);
    }
  }
</style>

<section class="wo-why">
  <div class="wo-why-inner">

    <div class="wo-why-head">
      <div class="wo-why-eyebrow">WHY THE GROW COMPANY</div>
      <h2 class="wo-why-title">
        다른 운영사와의 차이는<br>
        <span class="wo-why-title-accent">"운영의 깊이"</span>에서 시작됩니다.
      </h2>
      <p class="wo-why-lead">
        단순 인력파견·시설 임대업체가 아닙니다. 컨설팅 회사의 분석력, 운영사의 실행력, 교육사의 인력양성 시스템을 한 회사에서 제공합니다.
      </p>
    </div>

    <div class="wo-why-list">

      <div class="wo-why-item">
        <div class="wo-why-num">01</div>
        <div class="wo-why-content">
          <h3 class="wo-why-name">컨설팅 회사가 직접 운영합니다</h3>
          <p class="wo-why-desc">
            현장 진단·운영 기획부터 위탁운영까지 한 회사에서 책임집니다. 데이터 기반 분석으로 시설의 강점과 약점을 먼저 파악한 뒤 운영 전략을 설계합니다.
          </p>
          <ul class="wo-why-bullets">
            <li>현장 진단 리포트</li>
            <li>이용자 분석</li>
            <li>운영 전략 설계</li>
          </ul>
        </div>
        <div class="wo-why-visual">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3v18h18M7 16l4-4 4 3 5-6"/>
          </svg>
        </div>
      </div>

      <div class="wo-why-item">
        <div class="wo-why-num">02</div>
        <div class="wo-why-content">
          <h3 class="wo-why-name">진단·기획·운영·교육 4대 통합</h3>
          <p class="wo-why-desc">
            네 가지가 분리된 외주가 아닌, 하나의 회사 안에서 일관성 있게 흐릅니다. 시설 분석 → 프로그램 기획 → 인력 운영 → 강사 교육이 끊김 없이 연결됩니다.
          </p>
          <ul class="wo-why-bullets">
            <li>진단컨설팅</li>
            <li>운영기획</li>
            <li>위탁운영</li>
            <li>그로우 에듀</li>
          </ul>
        </div>
        <div class="wo-why-visual">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>
          </svg>
        </div>
      </div>

      <div class="wo-why-item">
        <div class="wo-why-num">03</div>
        <div class="wo-why-content">
          <h3 class="wo-why-name">자체 교육 시스템 보유</h3>
          <p class="wo-why-desc">
            그로우 에듀를 통해 강사 양성·재교육을 직접 진행합니다. 외부 강사 풀에 의존하지 않고, 검증된 자체 인력으로 운영 품질을 일정하게 유지합니다.
          </p>
          <ul class="wo-why-bullets">
            <li>강사 양성 프로그램</li>
            <li>현장 재교육</li>
            <li>품질 표준화</li>
          </ul>
        </div>
        <div class="wo-why-visual">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
            <path d="M6 12v5c0 1 2 3 6 3s6-2 6-3v-5"/>
          </svg>
        </div>
      </div>

      <div class="wo-why-item">
        <div class="wo-why-num">04</div>
        <div class="wo-why-content">
          <h3 class="wo-why-name">타겟 맞춤 다양한 프로그램 라인업</h3>
          <p class="wo-why-desc">
            바레·복싱·그룹GX·골프·필라테스·요가·PT까지. 시설의 타겟 고객 연령과 라이프스타일에 맞춰 프로그램을 골라 설계합니다. 다양성이 곧 경험의 깊이입니다.
          </p>
          <ul class="wo-why-bullets">
            <li>바레·복싱·그룹GX·골프</li>
            <li>시니어·키즈·직장인</li>
            <li>타겟별 맞춤 설계</li>
          </ul>
        </div>
        <div class="wo-why-visual">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
      </div>

    </div>
  </div>
</section>


<!-- ============================================ -->
<!-- Section 5: 3가지 운영 방식                  -->
<!-- ============================================ -->

<style>
  .wo-model {
    --wo-model-bg: #FFFFFF;
    --wo-model-card-bg: #FAFAF7;
    --wo-model-card-dark: #0A1220;
    --wo-model-border: #E8E5DD;
    --wo-model-dark: #0A1220;
    --wo-model-muted: #6B7280;
    --wo-model-accent: #B8895D;

    position: relative;
    width: 100%;
    padding: 120px 0;
    background: var(--wo-model-bg);
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', sans-serif;
    color: var(--wo-model-dark);
    box-sizing: border-box;
  }

  .wo-model-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 60px;
    box-sizing: border-box;
  }

  .wo-model-head {
    text-align: center;
    margin-bottom: 72px;
    max-width: 760px;
    margin-left: auto;
    margin-right: auto;
  }

  .wo-model-eyebrow {
    display: inline-block;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.18em;
    color: var(--wo-model-accent);
    margin-bottom: 20px;
    text-transform: uppercase;
  }

  .wo-model-title {
    font-size: clamp(28px, 3.4vw, 46px);
    font-weight: 800;
    line-height: 1.25;
    letter-spacing: -0.03em;
    margin: 0 0 20px;
  }

  .wo-model-lead {
    font-size: 17px;
    line-height: 1.7;
    color: var(--wo-model-muted);
    margin: 0;
  }

  /* 3-column comparison */
  .wo-model-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  .wo-model-card {
    position: relative;
    background: var(--wo-model-card-bg);
    border: 1px solid var(--wo-model-border);
    border-radius: 16px;
    padding: 40px 36px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    display: flex;
    flex-direction: column;
  }

  /* 중앙 카드 강조 (가장 일반적인 모델) */
  .wo-model-card.is-featured {
    background: var(--wo-model-card-dark);
    border-color: var(--wo-model-card-dark);
    color: #fff;
    transform: translateY(-12px);
  }

  .wo-model-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 20px 50px rgba(10, 18, 32, 0.08);
  }

  .wo-model-card.is-featured:hover {
    transform: translateY(-16px);
    box-shadow: 0 28px 60px rgba(10, 18, 32, 0.25);
  }

  .wo-model-badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--wo-model-accent);
    margin-bottom: 16px;
  }

  .wo-model-card.is-featured .wo-model-badge {
    color: #E8C9A0;
  }

  .wo-model-num {
    display: inline-block;
    font-size: 13px;
    font-weight: 600;
    color: var(--wo-model-muted);
    margin-bottom: 14px;
    letter-spacing: 0.1em;
  }

  .wo-model-card.is-featured .wo-model-num {
    color: rgba(255, 255, 255, 0.5);
  }

  .wo-model-name {
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.025em;
    margin: 0 0 12px;
    line-height: 1.3;
  }

  .wo-model-tag {
    font-size: 13px;
    font-weight: 500;
    color: var(--wo-model-muted);
    margin-bottom: 28px;
    letter-spacing: -0.01em;
  }

  .wo-model-card.is-featured .wo-model-tag {
    color: rgba(255, 255, 255, 0.6);
  }

  .wo-model-divider {
    height: 1px;
    background: var(--wo-model-border);
    margin: 0 0 24px;
  }

  .wo-model-card.is-featured .wo-model-divider {
    background: rgba(255, 255, 255, 0.15);
  }

  .wo-model-section {
    margin-bottom: 22px;
  }

  .wo-model-section:last-child {
    margin-bottom: 0;
  }

  .wo-model-section-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--wo-model-muted);
    margin-bottom: 8px;
  }

  .wo-model-card.is-featured .wo-model-section-label {
    color: rgba(232, 201, 160, 0.7);
  }

  .wo-model-section-text {
    font-size: 14.5px;
    line-height: 1.65;
    color: var(--wo-model-dark);
    margin: 0;
  }

  .wo-model-card.is-featured .wo-model-section-text {
    color: rgba(255, 255, 255, 0.85);
  }

  .wo-model-section-text strong {
    font-weight: 700;
  }

  .wo-model-features {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .wo-model-features li {
    position: relative;
    padding-left: 22px;
    font-size: 14px;
    line-height: 1.55;
    color: var(--wo-model-dark);
  }

  .wo-model-card.is-featured .wo-model-features li {
    color: rgba(255, 255, 255, 0.85);
  }

  .wo-model-features li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 8px;
    width: 12px;
    height: 2px;
    background: var(--wo-model-accent);
  }

  .wo-model-card.is-featured .wo-model-features li::before {
    background: #E8C9A0;
  }

  /* === 태블릿 === */
  @media (max-width: 1024px) {
    .wo-model {
      padding: 100px 0;
    }
    .wo-model-inner {
      padding: 0 40px;
    }
    .wo-model-grid {
      grid-template-columns: 1fr;
      gap: 16px;
      max-width: 600px;
      margin: 0 auto;
    }
    .wo-model-card.is-featured {
      transform: none;
    }
    .wo-model-card.is-featured:hover {
      transform: translateY(-6px);
    }
  }

  /* === 모바일 === */
  @media (max-width: 640px) {
    .wo-model {
      padding: 80px 0;
    }
    .wo-model-inner {
      padding: 0 24px;
    }
    .wo-model-head {
      margin-bottom: 48px;
    }
    .wo-model-card {
      padding: 32px 28px;
    }
    .wo-model-name {
      font-size: 22px;
    }
  }
</style>

<section class="wo-model">
  <div class="wo-model-inner">

    <div class="wo-model-head">
      <div class="wo-model-eyebrow">OPERATING MODELS</div>
      <h2 class="wo-model-title">
        시설 상황에 맞는 3가지 운영 방식
      </h2>
      <p class="wo-model-lead">
        시설 유형·예산·운영 목표에 따라 적합한 위탁 방식이 다릅니다. 단지·기관·기업과 상의 후 최적의 모델을 함께 설계합니다.
      </p>
    </div>

    <div class="wo-model-grid">

      <!-- Model 1 -->
      <div class="wo-model-card">
        <div class="wo-model-num">MODEL 01</div>
        <h3 class="wo-model-name">위탁수수료형</h3>
        <p class="wo-model-tag">관리주체 책임 · 운영사 대행</p>
        <div class="wo-model-divider"></div>

        <div class="wo-model-section">
          <div class="wo-model-section-label">정산 구조</div>
          <p class="wo-model-section-text">
            관리주체가 이용료를 수금·관리하고, 운영사는 <strong>고정 위탁수수료</strong>와 운영 실비를 받습니다.
          </p>
        </div>

        <div class="wo-model-section">
          <div class="wo-model-section-label">적합한 시설</div>
          <ul class="wo-model-features">
            <li>아파트 입주민 시설</li>
            <li>공공기관 체육시설</li>
            <li>비수익 운영 목적 시설</li>
          </ul>
        </div>

        <div class="wo-model-section">
          <div class="wo-model-section-label">장점</div>
          <p class="wo-model-section-text">
            안정적·예측 가능한 운영. 관리주체의 통제권 유지.
          </p>
        </div>
      </div>

      <!-- Model 2 - Featured -->
      <div class="wo-model-card is-featured">
        <div class="wo-model-badge">★ 가장 일반적</div>
        <div class="wo-model-num">MODEL 02</div>
        <h3 class="wo-model-name">프로그램 분리형</h3>
        <p class="wo-model-tag">기본 운영 + 유료 강좌 분리 정산</p>
        <div class="wo-model-divider"></div>

        <div class="wo-model-section">
          <div class="wo-model-section-label">정산 구조</div>
          <p class="wo-model-section-text">
            기본 시설 이용은 관리주체가, <strong>PT·필라테스 등 유료 강좌</strong>는 운영사가 직접 정산. 일정 비율로 분배.
          </p>
        </div>

        <div class="wo-model-section">
          <div class="wo-model-section-label">적합한 시설</div>
          <ul class="wo-model-features">
            <li>이용률 활성화 필요한 시설</li>
            <li>유료 프로그램 수요 있는 단지</li>
            <li>아파트·기업·호텔 공통</li>
          </ul>
        </div>

        <div class="wo-model-section">
          <div class="wo-model-section-label">장점</div>
          <p class="wo-model-section-text">
            이용자 만족도와 운영사 동기부여 모두 높음. 수익 분배로 win-win 구조.
          </p>
        </div>
      </div>

      <!-- Model 3 -->
      <div class="wo-model-card">
        <div class="wo-model-num">MODEL 03</div>
        <h3 class="wo-model-name">임대형(독립채산)</h3>
        <p class="wo-model-tag">운영사 책임 · 임대료 지불</p>
        <div class="wo-model-divider"></div>

        <div class="wo-model-section">
          <div class="wo-model-section-label">정산 구조</div>
          <p class="wo-model-section-text">
            운영사가 <strong>임대료를 지불</strong>하고 시설 운영 전체를 책임. 이용료·프로그램 수익 모두 운영사 매출.
          </p>
        </div>

        <div class="wo-model-section">
          <div class="wo-model-section-label">적합한 시설</div>
          <ul class="wo-model-features">
            <li>외부 이용 가능 시설</li>
            <li>수익 지향 시설</li>
            <li>호텔 부속 피트니스 일부</li>
          </ul>
        </div>

        <div class="wo-model-section">
          <div class="wo-model-section-label">장점</div>
          <p class="wo-model-section-text">
            관리주체 부담 최소. 운영사가 적극적으로 활성화에 투자.
          </p>
        </div>
      </div>

    </div>

  </div>
</section>

<!-- ============================================ -->
<!-- Section 6: 체계적 운영 시스템                -->
<!-- ============================================ -->

<style>
  .wo-system {
    --wo-system-bg: #0A1220;
    --wo-system-card-bg: rgba(255, 255, 255, 0.04);
    --wo-system-border: rgba(255, 255, 255, 0.1);
    --wo-system-text: #FFFFFF;
    --wo-system-muted: rgba(255, 255, 255, 0.65);
    --wo-system-accent: #E8C9A0;
    --wo-system-accent-strong: #D4A574;

    position: relative;
    width: 100%;
    padding: 120px 0;
    background: var(--wo-system-bg);
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', sans-serif;
    color: var(--wo-system-text);
    box-sizing: border-box;
    overflow: hidden;
  }

  /* Decorative grid background */
  .wo-system::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
  }

  .wo-system::after {
    content: '';
    position: absolute;
    top: -200px;
    right: -200px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(212, 165, 116, 0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  .wo-system-inner {
    position: relative;
    z-index: 2;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 60px;
    box-sizing: border-box;
  }

  .wo-system-head {
    margin-bottom: 80px;
    max-width: 820px;
  }

  .wo-system-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.18em;
    color: var(--wo-system-accent);
    margin-bottom: 20px;
    text-transform: uppercase;
  }

  .wo-system-eyebrow::before {
    content: '';
    width: 24px;
    height: 1px;
    background: var(--wo-system-accent);
  }

  .wo-system-title {
    font-size: clamp(28px, 3.4vw, 48px);
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: -0.03em;
    margin: 0 0 20px;
  }

  .wo-system-title-accent {
    color: var(--wo-system-accent);
  }

  .wo-system-lead {
    font-size: 17px;
    line-height: 1.7;
    color: var(--wo-system-muted);
    margin: 0;
    max-width: 660px;
  }

  /* 2x2 grid */
  .wo-system-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .wo-system-card {
    position: relative;
    background: var(--wo-system-card-bg);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid var(--wo-system-border);
    border-radius: 16px;
    padding: 44px 40px;
    transition: transform 0.3s ease, background 0.3s ease, border-color 0.3s ease;
  }

  .wo-system-card:hover {
    transform: translateY(-6px);
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(232, 201, 160, 0.3);
  }

  .wo-system-card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 24px;
    gap: 16px;
  }

  .wo-system-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    background: rgba(232, 201, 160, 0.1);
    border: 1px solid rgba(232, 201, 160, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--wo-system-accent);
    flex-shrink: 0;
  }

  .wo-system-icon svg {
    width: 28px;
    height: 28px;
    stroke-width: 1.6;
  }

  .wo-system-num {
    font-size: 36px;
    font-weight: 800;
    color: transparent;
    -webkit-text-stroke: 1.5px rgba(232, 201, 160, 0.3);
    line-height: 1;
    letter-spacing: -0.05em;
    font-feature-settings: 'tnum';
  }

  .wo-system-name {
    font-size: 24px;
    font-weight: 800;
    letter-spacing: -0.025em;
    margin: 0 0 14px;
    line-height: 1.3;
  }

  .wo-system-desc {
    font-size: 15px;
    line-height: 1.7;
    color: var(--wo-system-muted);
    margin: 0 0 28px;
  }

  .wo-system-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .wo-system-list li {
    position: relative;
    padding-left: 24px;
    font-size: 14px;
    line-height: 1.55;
    color: rgba(255, 255, 255, 0.85);
  }

  .wo-system-list li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 8px;
    width: 14px;
    height: 1.5px;
    background: var(--wo-system-accent);
  }

  /* === 태블릿 === */
  @media (max-width: 1024px) {
    .wo-system {
      padding: 100px 0;
    }
    .wo-system-inner {
      padding: 0 40px;
    }
  }

  /* === 모바일 === */
  @media (max-width: 768px) {
    .wo-system {
      padding: 80px 0;
    }
    .wo-system-inner {
      padding: 0 24px;
    }
    .wo-system-head {
      margin-bottom: 48px;
    }
    .wo-system-grid {
      grid-template-columns: 1fr;
      gap: 14px;
    }
    .wo-system-card {
      padding: 32px 28px;
    }
    .wo-system-icon {
      width: 48px;
      height: 48px;
    }
    .wo-system-icon svg {
      width: 24px;
      height: 24px;
    }
    .wo-system-num {
      font-size: 28px;
    }
    .wo-system-name {
      font-size: 22px;
    }
  }
</style>

<section class="wo-system">
  <div class="wo-system-inner">

    <div class="wo-system-head">
      <div class="wo-system-eyebrow">OPERATING SYSTEM</div>
      <h2 class="wo-system-title">
        운영의 차이는 <span class="wo-system-title-accent">시스템에서</span><br>
        만들어집니다.
      </h2>
      <p class="wo-system-lead">
        개인의 노력이 아니라 시스템으로 운영합니다. 안전·민원·정산·인력 4개 영역에 표준 매뉴얼과 책임 체계를 갖추고 있습니다.
      </p>
    </div>

    <div class="wo-system-grid">

      <div class="wo-system-card">
        <div class="wo-system-card-head">
          <div class="wo-system-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
          </div>
          <div class="wo-system-num">01</div>
        </div>
        <h3 class="wo-system-name">안전 매뉴얼</h3>
        <p class="wo-system-desc">
          사고 예방과 즉각 대응을 위한 체계적 안전 관리. 모든 시설은 가입 즉시 표준 안전 프로토콜이 적용됩니다.
        </p>
        <ul class="wo-system-list">
          <li>일일·주간·월간 점검 체크리스트</li>
          <li>응급상황 대응 매뉴얼·교육</li>
          <li>배상책임보험·시설보험 의무 가입</li>
          <li>사고 발생 시 24시간 대응 체계</li>
        </ul>
      </div>

      <div class="wo-system-card">
        <div class="wo-system-card-head">
          <div class="wo-system-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <path d="M8 10h.01M12 10h.01M16 10h.01"/>
            </svg>
          </div>
          <div class="wo-system-num">02</div>
        </div>
        <h3 class="wo-system-name">민원 처리 시스템</h3>
        <p class="wo-system-desc">
          이용자 불만이 발생하면 누구에게 어떻게 접수되고, 며칠 안에 어떻게 해결되는지 명문화되어 있습니다.
        </p>
        <ul class="wo-system-list">
          <li>접수 → 분류 → 처리 → 회신 표준 프로세스</li>
          <li>관리주체와 공유되는 민원 대시보드</li>
          <li>24시간 내 1차 회신 원칙</li>
          <li>월 단위 민원 통계·개선안 리포트</li>
        </ul>
      </div>

      <div class="wo-system-card">
        <div class="wo-system-card-head">
          <div class="wo-system-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3v18h18M7 16l4-4 4 3 5-6"/>
              <circle cx="7" cy="16" r="1.5" fill="currentColor"/>
              <circle cx="20" cy="9" r="1.5" fill="currentColor"/>
            </svg>
          </div>
          <div class="wo-system-num">03</div>
        </div>
        <h3 class="wo-system-name">투명한 정산</h3>
        <p class="wo-system-desc">
          운영비·이용료·프로그램 수익이 어디서 들어와 어떻게 쓰이는지 매월 명확하게 공유합니다. 감사 대응 가능 수준.
        </p>
        <ul class="wo-system-list">
          <li>월간 운영보고서·정산 리포트 자동 발송</li>
          <li>이용료 수입·운영 지출 항목별 공개</li>
          <li>관리주체 요청 시 실시간 데이터 열람</li>
          <li>분기별 운영 성과 미팅</li>
        </ul>
      </div>

      <div class="wo-system-card">
        <div class="wo-system-card-head">
          <div class="wo-system-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="wo-system-num">04</div>
        </div>
        <h3 class="wo-system-name">인력 관리</h3>
        <p class="wo-system-desc">
          강사 한 명에 운영이 흔들리지 않도록, 인력 풀과 교체·교육 체계를 시스템화했습니다.
        </p>
        <ul class="wo-system-list">
          <li>자격증·경력 검증된 강사 풀 보유</li>
          <li>핵심 강사 부재 시 48시간 내 대체</li>
          <li>그로우 에듀 기반 정기 재교육</li>
          <li>강사 평가·고객 만족도 분기 점검</li>
        </ul>
      </div>

    </div>

  </div>
</section>

<!-- ============================================ -->
<!-- Section 7: 검증된 전문 인력                 -->
<!-- ============================================ -->

<style>
  .wo-staff {
    --wo-staff-bg: #FFFFFF;
    --wo-staff-panel-bg: #FAFAF7;
    --wo-staff-border: #E8E5DD;
    --wo-staff-dark: #0A1220;
    --wo-staff-muted: #6B7280;
    --wo-staff-accent: #B8895D;

    position: relative;
    width: 100%;
    padding: 120px 0;
    background: var(--wo-staff-bg);
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', sans-serif;
    color: var(--wo-staff-dark);
    box-sizing: border-box;
  }

  .wo-staff-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 60px;
    box-sizing: border-box;
  }

  .wo-staff-head {
    margin-bottom: 72px;
    max-width: 820px;
  }

  .wo-staff-eyebrow {
    display: inline-block;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.18em;
    color: var(--wo-staff-accent);
    margin-bottom: 20px;
    text-transform: uppercase;
  }

  .wo-staff-title {
    font-size: clamp(28px, 3.4vw, 46px);
    font-weight: 800;
    line-height: 1.25;
    letter-spacing: -0.03em;
    margin: 0 0 20px;
  }

  .wo-staff-title-accent {
    color: var(--wo-staff-accent);
  }

  .wo-staff-lead {
    font-size: 17px;
    line-height: 1.7;
    color: var(--wo-staff-muted);
    margin: 0;
    max-width: 660px;
  }

  /* Process steps - horizontal flow */
  .wo-staff-process {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0;
    margin-bottom: 64px;
    position: relative;
  }

  .wo-staff-step {
    position: relative;
    padding: 40px 36px;
    background: var(--wo-staff-panel-bg);
    border-right: 1px solid var(--wo-staff-border);
    border-top: 1px solid var(--wo-staff-border);
    border-bottom: 1px solid var(--wo-staff-border);
    transition: background 0.3s ease;
  }

  .wo-staff-step:first-child {
    border-left: 1px solid var(--wo-staff-border);
    border-radius: 14px 0 0 14px;
  }

  .wo-staff-step:last-child {
    border-radius: 0 14px 14px 0;
  }

  .wo-staff-step:hover {
    background: #FFFFFF;
  }

  .wo-staff-step-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--wo-staff-dark);
    color: #E8C9A0;
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 24px;
    font-feature-settings: 'tnum';
  }

  .wo-staff-step-name {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin: 0 0 10px;
    line-height: 1.3;
  }

  .wo-staff-step-desc {
    font-size: 14px;
    line-height: 1.65;
    color: var(--wo-staff-muted);
    margin: 0 0 20px;
  }

  .wo-staff-step-points {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .wo-staff-step-points li {
    position: relative;
    padding-left: 18px;
    font-size: 13px;
    line-height: 1.5;
    color: var(--wo-staff-dark);
  }

  .wo-staff-step-points li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 8px;
    width: 10px;
    height: 1.5px;
    background: var(--wo-staff-accent);
  }

  /* Bottom credentials grid */
  .wo-staff-credentials {
    background: var(--wo-staff-dark);
    border-radius: 18px;
    padding: 48px 56px;
    color: #fff;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 48px;
    align-items: center;
  }

  .wo-staff-cred-left {
    min-width: 0;
  }

  .wo-staff-cred-label {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.18em;
    color: #E8C9A0;
    margin-bottom: 14px;
    text-transform: uppercase;
  }

  .wo-staff-cred-title {
    font-size: clamp(22px, 2.2vw, 30px);
    font-weight: 800;
    letter-spacing: -0.025em;
    line-height: 1.3;
    margin: 0 0 16px;
    color: #fff;
  }

  .wo-staff-cred-desc {
    font-size: 15px;
    line-height: 1.65;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
    max-width: 500px;
  }

  .wo-staff-cred-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    max-width: 380px;
  }

  .wo-staff-cred-tag {
    font-size: 13px;
    font-weight: 600;
    color: #E8C9A0;
    background: rgba(232, 201, 160, 0.08);
    border: 1px solid rgba(232, 201, 160, 0.25);
    padding: 8px 14px;
    border-radius: 6px;
    letter-spacing: -0.005em;
  }

  /* === 태블릿 === */
  @media (max-width: 1024px) {
    .wo-staff {
      padding: 100px 0;
    }
    .wo-staff-inner {
      padding: 0 40px;
    }
    .wo-staff-process {
      grid-template-columns: 1fr;
      gap: 0;
    }
    .wo-staff-step {
      border: 1px solid var(--wo-staff-border);
      border-radius: 14px !important;
      border-bottom-width: 0;
    }
    .wo-staff-step:last-child {
      border-bottom-width: 1px;
    }
    .wo-staff-step:not(:last-child) {
      margin-bottom: -1px;
    }
    .wo-staff-credentials {
      grid-template-columns: 1fr;
      gap: 28px;
      padding: 40px 40px;
    }
    .wo-staff-cred-tags {
      max-width: 100%;
    }
  }

  /* === 모바일 === */
  @media (max-width: 640px) {
    .wo-staff {
      padding: 80px 0;
    }
    .wo-staff-inner {
      padding: 0 24px;
    }
    .wo-staff-head {
      margin-bottom: 48px;
    }
    .wo-staff-step {
      padding: 32px 28px;
    }
    .wo-staff-credentials {
      padding: 32px 28px;
      margin-top: 14px;
    }
  }
</style>

<section class="wo-staff">
  <div class="wo-staff-inner">

    <div class="wo-staff-head">
      <div class="wo-staff-eyebrow">VERIFIED STAFF</div>
      <h2 class="wo-staff-title">
        검증된 강사만 현장에 배치합니다.<br>
        <span class="wo-staff-title-accent">3단계 인력 검증 시스템</span>
      </h2>
      <p class="wo-staff-lead">
        시설의 품질은 결국 사람이 결정합니다. 자격 검증부터 현장 배치까지 표준화된 프로세스로 일정한 운영 수준을 보장합니다.
      </p>
    </div>

    <div class="wo-staff-process">

      <div class="wo-staff-step">
        <div class="wo-staff-step-num">1</div>
        <h3 class="wo-staff-step-name">자격 검증</h3>
        <p class="wo-staff-step-desc">
          입사 단계부터 자격증·경력·범죄경력조회까지 모든 서류를 확인합니다.
        </p>
        <ul class="wo-staff-step-points">
          <li>국가공인 자격증 확인</li>
          <li>최소 경력 기준 충족</li>
          <li>범죄경력조회 회보서 제출</li>
          <li>건강진단서 의무 제출</li>
        </ul>
      </div>

      <div class="wo-staff-step">
        <div class="wo-staff-step-num">2</div>
        <h3 class="wo-staff-step-name">실무 교육</h3>
        <p class="wo-staff-step-desc">
          자체 교육 시스템 '그로우 에듀'를 통한 시설별 맞춤 사전교육을 진행합니다.
        </p>
        <ul class="wo-staff-step-points">
          <li>시설 유형별 응대 매뉴얼</li>
          <li>안전·응급대응 실습</li>
          <li>이용자 커뮤니케이션 교육</li>
          <li>운영 시스템 사용법</li>
        </ul>
      </div>

      <div class="wo-staff-step">
        <div class="wo-staff-step-num">3</div>
        <h3 class="wo-staff-step-name">정기 평가</h3>
        <p class="wo-staff-step-desc">
          현장 배치 후에도 분기별 평가와 재교육으로 운영 품질을 유지합니다.
        </p>
        <ul class="wo-staff-step-points">
          <li>이용자 만족도 조사</li>
          <li>분기별 강사 평가</li>
          <li>연 2회 재교육 의무</li>
          <li>저평가 시 즉시 교체</li>
        </ul>
      </div>

    </div>

    <div class="wo-staff-credentials">
      <div class="wo-staff-cred-left">
        <div class="wo-staff-cred-label">REQUIRED CREDENTIALS</div>
        <h3 class="wo-staff-cred-title">
          현장 배치 전 확인하는 필수 자격
        </h3>
        <p class="wo-staff-cred-desc">
          시설 유형과 프로그램에 따라 요구되는 자격증과 경력 기준이 다릅니다. 모든 강사는 해당 기준을 충족한 후에만 현장에 배치됩니다.
        </p>
      </div>
      <div class="wo-staff-cred-tags">
        <span class="wo-staff-cred-tag">생활스포츠지도사</span>
        <span class="wo-staff-cred-tag">건강운동관리사</span>
        <span class="wo-staff-cred-tag">필라테스 자격증</span>
        <span class="wo-staff-cred-tag">요가 자격증</span>
        <span class="wo-staff-cred-tag">CPR/응급처치</span>
        <span class="wo-staff-cred-tag">노인체육 자격</span>
      </div>
    </div>

  </div>
</section>

<!-- ============================================ -->
<!-- Section 8: 시설별 맞춤 프로그램 (v2)          -->
<!-- 바레·복싱·GX·골프 + 타겟 연령 맞춤            -->
<!-- ============================================ -->

<style>
  .wo-program {
    --wo-program-bg: #FAFAF7;
    --wo-program-card-bg: #FFFFFF;
    --wo-program-border: #E8E5DD;
    --wo-program-dark: #0A1220;
    --wo-program-muted: #6B7280;
    --wo-program-accent: #B8895D;

    position: relative;
    width: 100%;
    padding: 120px 0;
    background: var(--wo-program-bg);
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', sans-serif;
    color: var(--wo-program-dark);
    box-sizing: border-box;
  }

  .wo-program-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 60px;
    box-sizing: border-box;
  }

  .wo-program-head {
    text-align: center;
    margin-bottom: 56px;
    max-width: 820px;
    margin-left: auto;
    margin-right: auto;
  }

  .wo-program-eyebrow {
    display: inline-block;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.18em;
    color: var(--wo-program-accent);
    margin-bottom: 20px;
    text-transform: uppercase;
  }

  .wo-program-title {
    font-size: clamp(28px, 3.4vw, 46px);
    font-weight: 800;
    line-height: 1.25;
    letter-spacing: -0.03em;
    margin: 0 0 20px;
  }

  .wo-program-title-accent {
    color: var(--wo-program-accent);
  }

  .wo-program-lead {
    font-size: 17px;
    line-height: 1.7;
    color: var(--wo-program-muted);
    margin: 0;
  }

  /* Program arsenal showcase */
  .wo-program-arsenal {
    margin-bottom: 56px;
    padding: 32px 40px;
    background: var(--wo-program-dark);
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 32px;
    flex-wrap: wrap;
  }

  .wo-program-arsenal-label {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.12em;
    color: #E8C9A0;
    text-transform: uppercase;
    flex-shrink: 0;
  }

  .wo-program-arsenal-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    flex: 1;
  }

  .wo-program-arsenal-item {
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 8px 16px;
    border-radius: 100px;
    letter-spacing: -0.005em;
  }

  /* 4-column grid (2x2 on tablet) */
  .wo-program-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }

  .wo-program-card {
    position: relative;
    background: var(--wo-program-card-bg);
    border: 1px solid var(--wo-program-border);
    border-radius: 16px;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    display: flex;
    flex-direction: column;
  }

  .wo-program-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 16px 40px rgba(10, 18, 32, 0.08);
  }

  .wo-program-card-head {
    padding: 32px 28px 24px;
    background: var(--wo-program-dark);
    color: #fff;
    position: relative;
    overflow: hidden;
  }

  .wo-program-card-head::after {
    content: '';
    position: absolute;
    top: -40px;
    right: -40px;
    width: 140px;
    height: 140px;
    background: radial-gradient(circle, rgba(232, 201, 160, 0.15) 0%, transparent 70%);
    pointer-events: none;
  }

  .wo-program-type {
    font-size: 11px;
    font-weight: 600;
    color: #E8C9A0;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .wo-program-name {
    font-size: 22px;
    font-weight: 800;
    margin: 0 0 8px;
    letter-spacing: -0.025em;
    line-height: 1.2;
  }

  .wo-program-target {
    font-size: 13px;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.65);
    margin: 0;
    letter-spacing: -0.005em;
  }

  .wo-program-card-body {
    padding: 24px 28px 32px;
    flex: 1;
  }

  .wo-program-body-label {
    font-size: 11px;
    font-weight: 600;
    color: var(--wo-program-muted);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 14px;
  }

  .wo-program-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .wo-program-list li {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 14px;
    line-height: 1.55;
    color: var(--wo-program-dark);
  }

  .wo-program-list li::before {
    content: '';
    flex-shrink: 0;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--wo-program-accent);
    margin-top: 7px;
  }

  .wo-program-list strong {
    font-weight: 700;
  }

  .wo-program-list-target {
    font-size: 11px;
    font-weight: 700;
    color: var(--wo-program-accent);
    background: #F4F1EA;
    padding: 2px 8px;
    border-radius: 4px;
    margin-right: 6px;
    letter-spacing: -0.005em;
  }

  /* Bottom note */
  .wo-program-note {
    margin-top: 32px;
    padding: 24px 32px;
    background: #F4F1EA;
    border-radius: 12px;
    text-align: center;
    font-size: 14px;
    color: var(--wo-program-muted);
    line-height: 1.6;
  }

  .wo-program-note strong {
    color: var(--wo-program-dark);
    font-weight: 600;
  }

  /* === 태블릿 === */
  @media (max-width: 1024px) {
    .wo-program {
      padding: 100px 0;
    }
    .wo-program-inner {
      padding: 0 40px;
    }
    .wo-program-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    .wo-program-arsenal {
      padding: 28px 32px;
    }
  }

  /* === 모바일 === */
  @media (max-width: 640px) {
    .wo-program {
      padding: 80px 0;
    }
    .wo-program-inner {
      padding: 0 24px;
    }
    .wo-program-head {
      margin-bottom: 40px;
    }
    .wo-program-arsenal {
      padding: 24px;
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 40px;
    }
    .wo-program-grid {
      grid-template-columns: 1fr;
      gap: 14px;
    }
    .wo-program-card-head {
      padding: 28px 24px 20px;
    }
    .wo-program-card-body {
      padding: 22px 24px 28px;
    }
    .wo-program-name {
      font-size: 20px;
    }
    .wo-program-note {
      padding: 20px 24px;
      font-size: 13px;
    }
  }
</style>

<section class="wo-program">
  <div class="wo-program-inner">

    <div class="wo-program-head">
      <div class="wo-program-eyebrow">PROGRAM ARSENAL</div>
      <h2 class="wo-program-title">
        시설마다 다른 이용자,<br>
        <span class="wo-program-title-accent">그에 맞는 다양한 프로그램</span>
      </h2>
      <p class="wo-program-lead">
        같은 운영사가 같은 프로그램으로 모든 시설에 들어가지 않습니다. 시설의 타겟 연령과 라이프스타일에 맞춰 프로그램을 골라 설계합니다.
      </p>
    </div>

    <!-- Program Arsenal Showcase -->
    <div class="wo-program-arsenal">
      <div class="wo-program-arsenal-label">PROGRAM LINE-UP</div>
      <div class="wo-program-arsenal-list">
        <span class="wo-program-arsenal-item">바레</span>
        <span class="wo-program-arsenal-item">복싱</span>
        <span class="wo-program-arsenal-item">그룹GX</span>
        <span class="wo-program-arsenal-item">골프</span>
        <span class="wo-program-arsenal-item">필라테스</span>
        <span class="wo-program-arsenal-item">요가</span>
        <span class="wo-program-arsenal-item">PT</span>
        <span class="wo-program-arsenal-item">시니어 운동</span>
        <span class="wo-program-arsenal-item">키즈 스포츠</span>
        <span class="wo-program-arsenal-item">재활·근골격계</span>
        <span class="wo-program-arsenal-item">웰니스 케어</span>
      </div>
    </div>

    <div class="wo-program-grid">

      <!-- 아파트 -->
      <div class="wo-program-card">
        <div class="wo-program-card-head">
          <div class="wo-program-type">01 · APARTMENT</div>
          <h3 class="wo-program-name">아파트 입주민</h3>
          <p class="wo-program-target">전 연령 단지 거주자</p>
        </div>
        <div class="wo-program-card-body">
          <div class="wo-program-body-label">타겟별 프로그램 예시</div>
          <ul class="wo-program-list">
            <li><span class="wo-program-list-target">시니어</span>건강체조·낙상예방·근력</li>
            <li><span class="wo-program-list-target">주부</span><strong>바레·필라테스·요가</strong> 그룹</li>
            <li><span class="wo-program-list-target">키즈</span>체조·스포츠 활동</li>
            <li><span class="wo-program-list-target">청장년</span><strong>복싱·그룹GX·PT</strong></li>
            <li><span class="wo-program-list-target">가족</span>골프 클래스·단지 이벤트</li>
          </ul>
        </div>
      </div>

      <!-- 공공기관 -->
      <div class="wo-program-card">
        <div class="wo-program-card-head">
          <div class="wo-program-type">02 · PUBLIC</div>
          <h3 class="wo-program-name">공공기관 이용자</h3>
          <p class="wo-program-target">지역 주민 · 시민 강좌 수강생</p>
        </div>
        <div class="wo-program-card-body">
          <div class="wo-program-body-label">시민 계층별 콘텐츠</div>
          <ul class="wo-program-list">
            <li><span class="wo-program-list-target">시민 웰니스</span><strong>그룹GX·필라테스·요가</strong></li>
            <li><span class="wo-program-list-target">시니어</span>낙상예방·근력·인지 운동</li>
            <li><span class="wo-program-list-target">청소년</span><strong>복싱</strong>·체력증진</li>
            <li><span class="wo-program-list-target">여성·임산부</span><strong>바레</strong>·산전후 회복</li>
            <li><span class="wo-program-list-target">취약계층</span>장애인 체육·맞춤 케어</li>
          </ul>
        </div>
      </div>

      <!-- 기업 -->
      <div class="wo-program-card">
        <div class="wo-program-card-head">
          <div class="wo-program-type">03 · CORPORATE</div>
          <h3 class="wo-program-name">기업 임직원</h3>
          <p class="wo-program-target">사내 복지시설 이용자</p>
        </div>
        <div class="wo-program-card-body">
          <div class="wo-program-body-label">일상 패턴 맞춤</div>
          <ul class="wo-program-list">
            <li><span class="wo-program-list-target">출근 전</span><strong>그룹GX·바레</strong></li>
            <li><span class="wo-program-list-target">점심</span>스트레칭·요가·근골격계</li>
            <li><span class="wo-program-list-target">퇴근 후</span><strong>복싱·PT·골프</strong></li>
            <li><span class="wo-program-list-target">임원</span>1:1 PT·골프 케어</li>
            <li><span class="wo-program-list-target">부서</span>그룹 클래스·웰니스 워크숍</li>
          </ul>
        </div>
      </div>

      <!-- 호텔 -->
      <div class="wo-program-card">
        <div class="wo-program-card-head">
          <div class="wo-program-type">04 · HOTEL</div>
          <h3 class="wo-program-name">호텔 게스트·회원</h3>
          <p class="wo-program-target">투숙객 · 회원권 보유자</p>
        </div>
        <div class="wo-program-card-body">
          <div class="wo-program-body-label">프리미엄 웰니스 케어</div>
          <ul class="wo-program-list">
            <li><span class="wo-program-list-target">데일리</span><strong>요가·바레·필라테스</strong></li>
            <li><span class="wo-program-list-target">PT</span>1:1 트레이닝 (영문 가능)</li>
            <li><span class="wo-program-list-target">액티브</span><strong>복싱·기능성 GX</strong></li>
            <li><span class="wo-program-list-target">프리미엄</span><strong>골프</strong> 레슨·스파 연계</li>
            <li><span class="wo-program-list-target">VIP</span>전용 컨시어지 케어</li>
          </ul>
        </div>
      </div>

    </div>

    <div class="wo-program-note">
      모든 프로그램은 <strong>현장 진단 후 시설의 타겟 연령·라이프스타일에 맞춰 커스터마이징</strong>됩니다. 위 라인업은 표준 예시이며, 시설별로 비중과 조합이 달라집니다.
    </div>

  </div>
</section>

<!-- ============================================ -->
<!-- Section 10: 6단계 협력 프로세스              -->
<!-- ============================================ -->

<style>
  .wo-process {
    --wo-process-bg: #F4F1EA;
    --wo-process-line: #E0D5C0;
    --wo-process-dark: #0A1220;
    --wo-process-muted: #6B7280;
    --wo-process-accent: #B8895D;

    position: relative;
    width: 100%;
    padding: 120px 0;
    background: var(--wo-process-bg);
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', sans-serif;
    color: var(--wo-process-dark);
    box-sizing: border-box;
    overflow: hidden;
  }

  .wo-process-inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 60px;
    box-sizing: border-box;
  }

  .wo-process-head {
    text-align: center;
    margin-bottom: 80px;
    max-width: 760px;
    margin-left: auto;
    margin-right: auto;
  }

  .wo-process-eyebrow {
    display: inline-block;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.18em;
    color: var(--wo-process-accent);
    margin-bottom: 20px;
    text-transform: uppercase;
  }

  .wo-process-title {
    font-size: clamp(28px, 3.4vw, 46px);
    font-weight: 800;
    line-height: 1.25;
    letter-spacing: -0.03em;
    margin: 0 0 20px;
  }

  .wo-process-title-accent {
    color: var(--wo-process-accent);
  }

  .wo-process-lead {
    font-size: 17px;
    line-height: 1.7;
    color: var(--wo-process-muted);
    margin: 0;
  }

  /* Timeline */
  .wo-process-timeline {
    position: relative;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 0;
  }

  /* Connecting line */
  .wo-process-timeline::before {
    content: '';
    position: absolute;
    top: 24px;
    left: 0;
    right: 0;
    height: 1.5px;
    background: var(--wo-process-line);
    z-index: 1;
  }

  /* Active line (gold) - decorative */
  .wo-process-timeline::after {
    content: '';
    position: absolute;
    top: 24px;
    left: 0;
    width: 100%;
    height: 1.5px;
    background: linear-gradient(to right, var(--wo-process-accent), transparent);
    z-index: 1;
    opacity: 0.6;
  }

  .wo-process-step {
    position: relative;
    padding: 0 16px;
    z-index: 2;
    text-align: center;
  }

  .wo-process-dot {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #FFFFFF;
    border: 2px solid var(--wo-process-line);
    margin: 0 auto 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    font-weight: 800;
    color: var(--wo-process-dark);
    transition: transform 0.3s ease, border-color 0.3s ease, background 0.3s ease;
    font-feature-settings: 'tnum';
  }

  .wo-process-step:hover .wo-process-dot {
    transform: scale(1.1);
    border-color: var(--wo-process-accent);
    background: var(--wo-process-dark);
    color: #E8C9A0;
  }

  .wo-process-icon {
    width: 32px;
    height: 32px;
    margin: 0 auto 16px;
    background: rgba(184, 137, 93, 0.15);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--wo-process-accent);
  }

  .wo-process-icon svg {
    width: 18px;
    height: 18px;
    stroke-width: 1.8;
  }

  .wo-process-stage {
    font-size: 11px;
    font-weight: 600;
    color: var(--wo-process-accent);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .wo-process-name {
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -0.02em;
    margin: 0 0 10px;
    line-height: 1.3;
  }

  .wo-process-desc {
    font-size: 13px;
    line-height: 1.55;
    color: var(--wo-process-muted);
    margin: 0;
    letter-spacing: -0.005em;
  }

  /* Bottom info bar */
  .wo-process-foot {
    margin-top: 72px;
    padding: 28px 40px;
    background: #FFFFFF;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 32px;
    flex-wrap: wrap;
    text-align: center;
  }

  .wo-process-foot-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: var(--wo-process-dark);
    font-weight: 500;
  }

  .wo-process-foot-icon {
    color: var(--wo-process-accent);
    flex-shrink: 0;
  }

  .wo-process-foot-icon svg {
    width: 18px;
    height: 18px;
    stroke-width: 1.8;
  }

  .wo-process-foot-divider {
    width: 1px;
    height: 16px;
    background: var(--wo-process-line);
  }

  /* === 태블릿 === */
  @media (max-width: 1024px) {
    .wo-process {
      padding: 100px 0;
    }
    .wo-process-inner {
      padding: 0 40px;
    }
    .wo-process-timeline {
      grid-template-columns: repeat(2, 1fr);
      gap: 32px 16px;
    }
    .wo-process-timeline::before,
    .wo-process-timeline::after {
      display: none;
    }
    .wo-process-step {
      text-align: left;
      display: grid;
      grid-template-columns: 48px 1fr;
      gap: 16px;
      align-items: start;
    }
    .wo-process-dot {
      margin: 0;
    }
    .wo-process-icon {
      display: none;
    }
    .wo-process-step-body {
      min-width: 0;
    }
  }

  /* === 모바일 === */
  @media (max-width: 640px) {
    .wo-process {
      padding: 80px 0;
    }
    .wo-process-inner {
      padding: 0 24px;
    }
    .wo-process-head {
      margin-bottom: 48px;
    }
    .wo-process-timeline {
      grid-template-columns: 1fr;
      gap: 20px;
    }
    .wo-process-foot {
      padding: 24px 24px;
      gap: 16px;
      margin-top: 48px;
    }
    .wo-process-foot-divider {
      display: none;
    }
  }
</style>

<section class="wo-process">
  <div class="wo-process-inner">

    <div class="wo-process-head">
      <div class="wo-process-eyebrow">COLLABORATION PROCESS</div>
      <h2 class="wo-process-title">
        문의부터 운영까지, <span class="wo-process-title-accent">6단계</span>로
      </h2>
      <p class="wo-process-lead">
        막연한 위탁이 아닌, 시설 진단부터 운영까지 명확한 단계로 진행합니다. 평균 30~60일 내 정식 운영 개시가 가능합니다.
      </p>
    </div>

    <div class="wo-process-timeline">

      <div class="wo-process-step">
        <div class="wo-process-dot">01</div>
        <div class="wo-process-step-body">
          <div class="wo-process-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div class="wo-process-stage">STAGE 01</div>
          <h3 class="wo-process-name">문의 접수</h3>
          <p class="wo-process-desc">
            시설 유형·규모·요구사항 1차 확인
          </p>
        </div>
      </div>

      <div class="wo-process-step">
        <div class="wo-process-dot">02</div>
        <div class="wo-process-step-body">
          <div class="wo-process-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div class="wo-process-stage">STAGE 02</div>
          <h3 class="wo-process-name">현장 실사</h3>
          <p class="wo-process-desc">
            시설 진단·이용자 분석 방문 실사
          </p>
        </div>
      </div>

      <div class="wo-process-step">
        <div class="wo-process-dot">03</div>
        <div class="wo-process-step-body">
          <div class="wo-process-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="9" y1="13" x2="15" y2="13"/>
              <line x1="9" y1="17" x2="15" y2="17"/>
            </svg>
          </div>
          <div class="wo-process-stage">STAGE 03</div>
          <h3 class="wo-process-name">운영 제안서</h3>
          <p class="wo-process-desc">
            운영 모델·인력·정산·일정 제안
          </p>
        </div>
      </div>

      <div class="wo-process-step">
        <div class="wo-process-dot">04</div>
        <div class="wo-process-step-body">
          <div class="wo-process-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div class="wo-process-stage">STAGE 04</div>
          <h3 class="wo-process-name">계약 체결</h3>
          <p class="wo-process-desc">
            적격 심사 통과 후 위탁운영 계약
          </p>
        </div>
      </div>

      <div class="wo-process-step">
        <div class="wo-process-dot">05</div>
        <div class="wo-process-step-body">
          <div class="wo-process-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <div class="wo-process-stage">STAGE 05</div>
          <h3 class="wo-process-name">운영 개시</h3>
          <p class="wo-process-desc">
            강사 배치·프로그램 시작·홍보 지원
          </p>
        </div>
      </div>

      <div class="wo-process-step">
        <div class="wo-process-dot">06</div>
        <div class="wo-process-step-body">
          <div class="wo-process-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3v18h18M7 16l4-4 4 3 5-6"/>
            </svg>
          </div>
          <div class="wo-process-stage">STAGE 06</div>
          <h3 class="wo-process-name">정기 보고</h3>
          <p class="wo-process-desc">
            월간 운영보고·분기 성과 미팅
          </p>
        </div>
      </div>

    </div>

    <div class="wo-process-foot">
      <div class="wo-process-foot-item">
        <span class="wo-process-foot-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </span>
        평균 <strong>30~60일</strong> 내 운영 개시
      </div>
      <div class="wo-process-foot-divider"></div>
      <div class="wo-process-foot-item">
        <span class="wo-process-foot-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </span>
        현장 실사·제안서 <strong>무상 제공</strong>
      </div>
      <div class="wo-process-foot-divider"></div>
      <div class="wo-process-foot-item">
        <span class="wo-process-foot-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
          </svg>
        </span>
        대표·핵심 인력 <strong>직접 참여</strong>
      </div>
    </div>

  </div>
</section>

<!-- ============================================ -->
<!-- Section 11: 자주 묻는 질문 (FAQ)            -->
<!-- ============================================ -->

<style>
  .wo-faq {
    --wo-faq-bg: #FFFFFF;
    --wo-faq-item-bg: #FAFAF7;
    --wo-faq-border: #E8E5DD;
    --wo-faq-dark: #0A1220;
    --wo-faq-muted: #6B7280;
    --wo-faq-accent: #B8895D;

    position: relative;
    width: 100%;
    padding: 120px 0;
    background: var(--wo-faq-bg);
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', sans-serif;
    color: var(--wo-faq-dark);
    box-sizing: border-box;
  }

  .wo-faq-inner {
    max-width: 1080px;
    margin: 0 auto;
    padding: 0 60px;
    box-sizing: border-box;
  }

  .wo-faq-head {
    margin-bottom: 56px;
    text-align: center;
    max-width: 760px;
    margin-left: auto;
    margin-right: auto;
  }

  .wo-faq-eyebrow {
    display: inline-block;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.18em;
    color: var(--wo-faq-accent);
    margin-bottom: 20px;
    text-transform: uppercase;
  }

  .wo-faq-title {
    font-size: clamp(28px, 3.4vw, 46px);
    font-weight: 800;
    line-height: 1.25;
    letter-spacing: -0.03em;
    margin: 0 0 20px;
  }

  .wo-faq-lead {
    font-size: 17px;
    line-height: 1.7;
    color: var(--wo-faq-muted);
    margin: 0;
  }

  .wo-faq-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .wo-faq-item {
    background: var(--wo-faq-item-bg);
    border: 1px solid var(--wo-faq-border);
    border-radius: 12px;
    overflow: hidden;
    transition: border-color 0.3s ease, background 0.3s ease;
  }

  .wo-faq-item[open] {
    background: #FFFFFF;
    border-color: rgba(184, 137, 93, 0.4);
    box-shadow: 0 8px 24px rgba(10, 18, 32, 0.04);
  }

  .wo-faq-q {
    list-style: none;
    cursor: pointer;
    padding: 26px 32px;
    display: flex;
    align-items: center;
    gap: 20px;
    font-size: 17px;
    font-weight: 700;
    color: var(--wo-faq-dark);
    letter-spacing: -0.015em;
    line-height: 1.4;
    user-select: none;
  }

  .wo-faq-q::-webkit-details-marker {
    display: none;
  }

  .wo-faq-q-label {
    flex-shrink: 0;
    font-size: 13px;
    font-weight: 800;
    color: var(--wo-faq-accent);
    letter-spacing: 0.05em;
    font-feature-settings: 'tnum';
  }

  .wo-faq-q-text {
    flex: 1;
  }

  .wo-faq-q-icon {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #fff;
    border: 1px solid var(--wo-faq-border);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--wo-faq-dark);
    transition: transform 0.3s ease, background 0.3s ease, border-color 0.3s ease;
  }

  .wo-faq-q-icon::before,
  .wo-faq-q-icon::after {
    content: '';
    position: absolute;
    background: currentColor;
    border-radius: 1px;
    transition: transform 0.3s ease;
  }

  .wo-faq-q-icon::before {
    width: 12px;
    height: 1.5px;
  }

  .wo-faq-q-icon::after {
    width: 1.5px;
    height: 12px;
  }

  .wo-faq-item[open] .wo-faq-q-icon {
    background: var(--wo-faq-dark);
    color: #E8C9A0;
    border-color: var(--wo-faq-dark);
  }

  .wo-faq-item[open] .wo-faq-q-icon::after {
    transform: scaleY(0);
  }

  .wo-faq-a {
    padding: 0 32px 28px;
    display: flex;
    gap: 20px;
  }

  .wo-faq-a-label {
    flex-shrink: 0;
    font-size: 13px;
    font-weight: 800;
    color: var(--wo-faq-muted);
    letter-spacing: 0.05em;
    padding-top: 2px;
  }

  .wo-faq-a-text {
    flex: 1;
    font-size: 15.5px;
    line-height: 1.75;
    color: var(--wo-faq-dark);
    margin: 0;
  }

  .wo-faq-a-text strong {
    font-weight: 700;
    color: var(--wo-faq-dark);
  }

  .wo-faq-a-text + .wo-faq-a-text {
    margin-top: 12px;
  }

  .wo-faq-foot {
    margin-top: 56px;
    padding: 36px 40px;
    background: var(--wo-faq-item-bg);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    flex-wrap: wrap;
  }

  .wo-faq-foot-text {
    font-size: 16px;
    font-weight: 600;
    color: var(--wo-faq-dark);
    margin: 0;
    letter-spacing: -0.015em;
  }

  .wo-faq-foot-text-sub {
    font-size: 14px;
    font-weight: 400;
    color: var(--wo-faq-muted);
    margin-top: 4px;
  }

  /* ★ 문의하기 버튼 흰색 강제 */
  .wo-faq-foot-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 14px 26px;
    background: var(--wo-faq-dark);
    color: #FFFFFF !important;
    text-decoration: none;
    border-radius: 6px;
    font-size: 14.5px;
    font-weight: 600;
    transition: transform 0.25s ease, background 0.25s ease;
  }

  .wo-faq-foot-btn:hover {
    transform: translateY(-2px);
    color: #FFFFFF !important;
  }

  .wo-faq-foot-btn:visited,
  .wo-faq-foot-btn:active,
  .wo-faq-foot-btn:link {
    color: #FFFFFF !important;
  }

  .wo-faq-foot-btn span {
    color: #FFFFFF !important;
  }

  @media (max-width: 1024px) {
    .wo-faq {
      padding: 100px 0;
    }
    .wo-faq-inner {
      padding: 0 40px;
    }
  }

  @media (max-width: 640px) {
    .wo-faq {
      padding: 80px 0;
    }
    .wo-faq-inner {
      padding: 0 24px;
    }
    .wo-faq-head {
      margin-bottom: 40px;
    }
    .wo-faq-q {
      padding: 22px 24px;
      font-size: 15.5px;
      gap: 14px;
    }
    .wo-faq-q-icon {
      width: 28px;
      height: 28px;
    }
    .wo-faq-a {
      padding: 0 24px 24px;
      gap: 14px;
    }
    .wo-faq-a-text {
      font-size: 14.5px;
    }
    .wo-faq-foot {
      padding: 28px;
      flex-direction: column;
      align-items: flex-start;
    }
    .wo-faq-foot-btn {
      width: 100%;
      justify-content: center;
    }
  }
</style>

<section class="wo-faq">
  <div class="wo-faq-inner">

    <div class="wo-faq-head">
      <div class="wo-faq-eyebrow">FREQUENTLY ASKED</div>
      <h2 class="wo-faq-title">
        자주 묻는 질문
      </h2>
      <p class="wo-faq-lead">
        위탁운영 검토 시 가장 많이 받는 질문을 정리했습니다.
      </p>
    </div>

    <div class="wo-faq-list">

      <details class="wo-faq-item" open>
        <summary class="wo-faq-q">
          <span class="wo-faq-q-label">Q1</span>
          <span class="wo-faq-q-text">이용료는 누가 수금하고, 수익은 어떻게 정산하나요?</span>
          <span class="wo-faq-q-icon"></span>
        </summary>
        <div class="wo-faq-a">
          <span class="wo-faq-a-label">A</span>
          <div>
            <p class="wo-faq-a-text">
              선택한 <strong>운영 모델에 따라 다릅니다.</strong> 위탁수수료형은 관리주체가 이용료를 수금·관리하고 운영사는 위탁수수료를 받습니다. 프로그램 분리형은 기본 시설 이용은 관리주체가, 유료 강좌는 운영사가 직접 수금 후 분배합니다. 임대형은 운영사가 임대료를 내고 수익 전체를 가져가는 구조입니다.
            </p>
            <p class="wo-faq-a-text">
              현장 진단 후 시설 상황·법적 요건·예산에 맞는 모델을 함께 결정합니다.
            </p>
          </div>
        </div>
      </details>

      <details class="wo-faq-item">
        <summary class="wo-faq-q">
          <span class="wo-faq-q-label">Q2</span>
          <span class="wo-faq-q-text">계약 기간은 보통 어떻게 되나요?</span>
          <span class="wo-faq-q-icon"></span>
        </summary>
        <div class="wo-faq-a">
          <span class="wo-faq-a-label">A</span>
          <div>
            <p class="wo-faq-a-text">
              일반적으로 <strong>3년 단위 계약</strong>이 표준입니다. 단지·기관에 따라 1년·2년·5년 등 유연하게 조정 가능합니다. 공공기관 입찰의 경우 공고 조건에 따릅니다.
            </p>
            <p class="wo-faq-a-text">
              계약 종료 1~3개월 전 운영 성과 평가 후 재계약·종료를 결정합니다.
            </p>
          </div>
        </div>
      </details>

      <details class="wo-faq-item">
        <summary class="wo-faq-q">
          <span class="wo-faq-q-label">Q3</span>
          <span class="wo-faq-q-text">강사가 갑자기 그만두면 어떻게 되나요?</span>
          <span class="wo-faq-q-icon"></span>
        </summary>
        <div class="wo-faq-a">
          <span class="wo-faq-a-label">A</span>
          <div>
            <p class="wo-faq-a-text">
              자체 인력 풀과 그로우 에듀 교육 시스템을 통해 <strong>48시간 내 대체 인력 배치</strong>를 원칙으로 합니다. 정기 강좌의 경우 폐강 없이 동일 자격 기준의 강사로 즉시 교체됩니다.
            </p>
            <p class="wo-faq-a-text">
              대체 기간 동안 수업 폐강·환불 발생 시 운영사 책임으로 처리합니다.
            </p>
          </div>
        </div>
      </details>

      <details class="wo-faq-item">
        <summary class="wo-faq-q">
          <span class="wo-faq-q-label">Q4</span>
          <span class="wo-faq-q-text">안전사고가 발생하면 책임은 누가 지나요?</span>
          <span class="wo-faq-q-icon"></span>
        </summary>
        <div class="wo-faq-a">
          <span class="wo-faq-a-label">A</span>
          <div>
            <p class="wo-faq-a-text">
              모든 위탁운영 계약 시 <strong>운영사가 시설배상책임보험·강사상해보험에 의무 가입</strong>합니다. 운영사 과실로 발생한 사고는 운영사가 책임지며 보험으로 처리합니다.
            </p>
            <p class="wo-faq-a-text">
              계약서에 책임 분담 조항을 명문화하므로 분쟁 가능성을 사전에 차단합니다.
            </p>
          </div>
        </div>
      </details>

      <details class="wo-faq-item">
        <summary class="wo-faq-q">
          <span class="wo-faq-q-label">Q5</span>
          <span class="wo-faq-q-text">운영 성과 보고는 어떻게 받나요?</span>
          <span class="wo-faq-q-icon"></span>
        </summary>
        <div class="wo-faq-a">
          <span class="wo-faq-a-label">A</span>
          <div>
            <p class="wo-faq-a-text">
              <strong>매월 운영보고서·정산 리포트가 자동 발송</strong>됩니다. 이용자 수·시간대별 방문·프로그램별 인기·민원 통계·운영비 사용 내역 등이 포함됩니다.
            </p>
            <p class="wo-faq-a-text">
              분기 단위로 관리주체와 대면 미팅을 진행하며, 요청 시 실시간 데이터 열람도 가능합니다.
            </p>
          </div>
        </div>
      </details>

      <details class="wo-faq-item">
        <summary class="wo-faq-q">
          <span class="wo-faq-q-label">Q6</span>
          <span class="wo-faq-q-text">시설이 작거나 예산이 한정적인데 가능한가요?</span>
          <span class="wo-faq-q-icon"></span>
        </summary>
        <div class="wo-faq-a">
          <span class="wo-faq-a-label">A</span>
          <div>
            <p class="wo-faq-a-text">
              <strong>시설 규모·예산에 맞는 운영 모델을 함께 설계</strong>합니다. 인력 풀타임 배치 대신 시간제·요일제 강사 운영, 프로그램 수 조정 등 유연한 방식이 가능합니다.
            </p>
            <p class="wo-faq-a-text">
              현장 실사 후 가장 효율적인 운영 방식을 제안드립니다. 제안서는 무상으로 제공됩니다.
            </p>
          </div>
        </div>
      </details>

      <details class="wo-faq-item">
        <summary class="wo-faq-q">
          <span class="wo-faq-q-label">Q7</span>
          <span class="wo-faq-q-text">공공기관 입찰 자격은 갖추고 있나요?</span>
          <span class="wo-faq-q-icon"></span>
        </summary>
        <div class="wo-faq-a">
          <span class="wo-faq-a-label">A</span>
          <div>
            <p class="wo-faq-a-text">
              더그로우컴퍼니는 법인 사업자로 공동주택관리 정보시스템(K-apt) 및 각 지자체 <strong>공공 입찰 참여 자격</strong>을 보유하고 있습니다. 자본금·인력 요건·운영 실적 기준에 부합합니다.
            </p>
            <p class="wo-faq-a-text">
              구체적인 입찰 공고 자격 요건은 사전 검토 후 안내드립니다.
            </p>
          </div>
        </div>
      </details>

    </div>

    <div class="wo-faq-foot">
      <div>
        <p class="wo-faq-foot-text">
          더 궁금한 점이 있으신가요?
        </p>
        <p class="wo-faq-foot-text-sub">
          위에 없는 질문은 직접 문의해주시면 빠르게 회신드립니다.
        </p>
      </div>
      <a href="#contact" class="wo-faq-foot-btn">
        문의하기
        <span>→</span>
      </a>
    </div>

  </div>
</section>

<style>
  .wo-contact {
    --wo-contact-bg: #0A1220;
    --wo-contact-panel: rgba(255, 255, 255, 0.04);
    --wo-contact-border: rgba(255, 255, 255, 0.12);
    --wo-contact-input-bg: rgba(255, 255, 255, 0.06);
    --wo-contact-text: #FFFFFF;
    --wo-contact-muted: rgba(255, 255, 255, 0.65);
    --wo-contact-accent: #E8C9A0;
    --wo-contact-accent-strong: #D4A574;

    position: relative;
    width: 100%;
    padding: 120px 0;
    background: var(--wo-contact-bg) !important;
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo', sans-serif;
    color: var(--wo-contact-text) !important;
    box-sizing: border-box;
    overflow: hidden;
  }

  .wo-contact::before {
    content: '';
    position: absolute;
    top: -300px;
    left: -200px;
    width: 700px;
    height: 700px;
    background: radial-gradient(circle, rgba(212, 165, 116, 0.1) 0%, transparent 70%);
    pointer-events: none;
  }

  .wo-contact::after {
    content: '';
    position: absolute;
    bottom: -200px;
    right: -200px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(212, 165, 116, 0.06) 0%, transparent 70%);
    pointer-events: none;
  }

  .wo-contact-inner {
    position: relative;
    z-index: 2;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 60px;
    box-sizing: border-box;
  }

  .wo-contact-grid {
    display: grid;
    grid-template-columns: 1fr 1.1fr;
    gap: 80px;
    align-items: center;
  }

  .wo-contact-info {
    padding-top: 12px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .wo-contact-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.18em;
    color: var(--wo-contact-accent) !important;
    margin-bottom: 24px;
    text-transform: uppercase;
  }

  .wo-contact-eyebrow::before,
  .wo-contact-eyebrow::after {
    content: '';
    width: 24px;
    height: 1px;
    background: var(--wo-contact-accent);
  }

  .wo-contact-title {
    font-size: clamp(30px, 3.6vw, 50px);
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: -0.03em;
    margin: 0 0 24px;
    color: #FFFFFF !important;
  }

  .wo-contact-title-accent {
    color: var(--wo-contact-accent) !important;
  }

  .wo-contact-lead {
    font-size: 17px;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.85) !important;
    margin: 0 0 48px;
    max-width: 480px;
  }

  .wo-contact-direct {
    border-top: 1px solid var(--wo-contact-border);
    padding-top: 36px;
    display: flex;
    flex-direction: column;
    gap: 28px;
    align-items: center;
    width: 100%;
  }

  .wo-contact-direct-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    text-align: center;
  }

  .wo-contact-direct-icon {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: rgba(232, 201, 160, 0.1);
    border: 1px solid rgba(232, 201, 160, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--wo-contact-accent) !important;
  }

  .wo-contact-direct-icon svg {
    width: 22px;
    height: 22px;
    stroke-width: 1.6;
  }

  /* ★ EMAIL / WEBSITE 라벨 */
  .wo-contact-direct-label {
    font-size: 12px;
    font-weight: 600;
    color: #FFFFFF !important;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  /* ★ 이메일/웹사이트 주소 링크 */
  .wo-contact-direct-value,
  .wo-contact-direct-value:link,
  .wo-contact-direct-value:visited,
  .wo-contact-direct-value:active {
    font-size: 17px;
    font-weight: 700;
    color: #FFFFFF !important;
    text-decoration: none;
    letter-spacing: -0.015em;
    transition: color 0.25s ease;
  }

  .wo-contact-direct-value:hover {
    color: var(--wo-contact-accent) !important;
  }

  .wo-contact-direct-sub {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.85) !important;
    margin-top: 6px;
  }

  .wo-contact-form-wrap {
    background: var(--wo-contact-panel);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--wo-contact-border);
    border-radius: 20px;
    padding: 48px 48px;
  }

  /* ★ 폼 제목 */
  .wo-contact-form-title {
    font-size: 22px;
    font-weight: 800;
    color: #FFFFFF !important;
    margin: 0 0 8px;
    letter-spacing: -0.02em;
  }

  /* ★ 폼 설명 */
  .wo-contact-form-sub {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9) !important;
    margin: 0 0 36px;
    line-height: 1.55;
  }

  .wo-contact-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .wo-contact-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .wo-contact-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* ★★★ 라벨 (담당자명, 연락처, 이메일 등) — !important 강제 */
  .wo-contact-label {
    font-size: 12px;
    font-weight: 600;
    color: #FFFFFF !important;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .wo-contact-label-req {
    color: var(--wo-contact-accent) !important;
    margin-left: 2px;
  }

  /* ★ 인풋 텍스트 */
  .wo-contact-input,
  .wo-contact-select,
  .wo-contact-textarea {
    width: 100%;
    background: var(--wo-contact-input-bg) !important;
    border: 1px solid var(--wo-contact-border) !important;
    border-radius: 8px;
    padding: 14px 16px;
    font-size: 15px;
    font-weight: 500;
    color: #FFFFFF !important;
    font-family: inherit;
    transition: border-color 0.25s ease, background 0.25s ease;
    box-sizing: border-box;
    letter-spacing: -0.005em;
  }

  .wo-contact-input::placeholder,
  .wo-contact-textarea::placeholder {
    color: rgba(255, 255, 255, 0.45) !important;
  }

  .wo-contact-input:focus,
  .wo-contact-select:focus,
  .wo-contact-textarea:focus {
    outline: none;
    border-color: var(--wo-contact-accent) !important;
    background: rgba(255, 255, 255, 0.08) !important;
  }

  .wo-contact-select {
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23E8C9A0' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") !important;
    background-repeat: no-repeat !important;
    background-position: right 16px center !important;
    padding-right: 40px;
    color: rgba(255, 255, 255, 0.8) !important;
  }

  .wo-contact-select option {
    background: #0A1220 !important;
    color: #fff !important;
  }

  .wo-contact-textarea {
    min-height: 110px;
    resize: vertical;
    line-height: 1.55;
  }

  .wo-contact-agree {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-top: 4px;
  }

  .wo-contact-checkbox {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    margin: 2px 0 0;
    accent-color: var(--wo-contact-accent);
  }

  /* ★ 동의 텍스트 */
  .wo-contact-agree-text {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.9) !important;
    line-height: 1.55;
  }

  .wo-contact-agree-text a {
    color: var(--wo-contact-accent) !important;
    text-decoration: underline;
  }

  .wo-contact-submit {
    margin-top: 8px;
    width: 100%;
    padding: 18px 28px;
    background: #fff !important;
    color: #0A1220 !important;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -0.01em;
    cursor: pointer;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-family: inherit;
  }

  .wo-contact-submit:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 36px rgba(232, 201, 160, 0.25);
  }

  .wo-contact-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .wo-contact-submit-arrow {
    transition: transform 0.25s ease;
  }

  .wo-contact-submit:hover .wo-contact-submit-arrow {
    transform: translateX(4px);
  }

  .wo-contact-phone-mismatch {
    font-size: 12px;
    color: #FF6B6B !important;
    margin-top: 4px;
    display: none;
  }

  .wo-contact-phone-mismatch.visible {
    display: block;
  }

  @media (max-width: 1024px) {
    .wo-contact { padding: 100px 0; }
    .wo-contact-inner { padding: 0 40px; }
    .wo-contact-grid { grid-template-columns: 1fr; gap: 56px; }
    .wo-contact-info { max-width: 100%; }
    .wo-contact-form-wrap { padding: 40px; }
  }

  @media (max-width: 640px) {
    .wo-contact { padding: 80px 0; }
    .wo-contact-inner { padding: 0 24px; }
    .wo-contact-grid { gap: 48px; }
    .wo-contact-row { grid-template-columns: 1fr; gap: 20px; }
    .wo-contact-form-wrap { padding: 32px 28px; }
    .wo-contact-lead { margin-bottom: 36px; }
    .wo-contact-direct { gap: 24px; }
  }
</style>

<section class="wo-contact" id="contact">
  <div class="wo-contact-inner">
    <div class="wo-contact-grid">

      <!-- LEFT: Info -->
      <div class="wo-contact-info">
        <div class="wo-contact-eyebrow">GET PROPOSAL</div>
        <h2 class="wo-contact-title">
          시설 정보를 알려주세요.<br>
          <span class="wo-contact-title-accent">제안서로 답변드립니다.</span>
        </h2>
        <p class="wo-contact-lead">
          시설 유형·규모·요구사항을 알려주시면 영업일 기준 <strong style="color:#fff;font-weight:600">2~3일 내</strong> 맞춤 위탁운영 제안서를 보내드립니다. 현장 실사·제안서는 무상으로 제공됩니다.
        </p>

        <div class="wo-contact-direct">

          <div class="wo-contact-direct-item">
            <div class="wo-contact-direct-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div>
              <div class="wo-contact-direct-label">EMAIL</div>
              <a href="mailto:thegrow_company@naver.com" class="wo-contact-direct-value">thegrow_company@naver.com</a>
              <div class="wo-contact-direct-sub">24시간 접수 · 영업일 회신</div>
            </div>
          </div>

          <div class="wo-contact-direct-item">
            <div class="wo-contact-direct-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 3v18h18M7 16l4-4 4 3 5-6"/>
              </svg>
            </div>
            <div>
              <div class="wo-contact-direct-label">WEBSITE</div>
              <a href="https://www.thegrowcompany.co.kr" class="wo-contact-direct-value" target="_blank">www.thegrowcompany.co.kr</a>
              <div class="wo-contact-direct-sub">컨설팅·진단·교육 서비스</div>
            </div>
          </div>

        </div>
      </div>

   <!-- RIGHT: Form (★ fetch 방식 구글시트 연동) -->
      <div class="wo-contact-form-wrap">
        <h3 class="wo-contact-form-title">위탁운영 문의</h3>
        <p class="wo-contact-form-sub">시설 정보를 입력해주시면 빠르게 회신드립니다.</p>

        <div id="woCommunityForm" class="wo-contact-form">

          <div class="wo-contact-row">
            <div class="wo-contact-field">
              <label class="wo-contact-label">담당자명<span class="wo-contact-label-req">*</span></label>
              <input type="text" id="wo-name" class="wo-contact-input" placeholder="홍길동" />
            </div>
            <div class="wo-contact-field">
              <label class="wo-contact-label">연락처<span class="wo-contact-label-req">*</span></label>
              <input type="tel" id="wo-phone" class="wo-contact-input wo-phone-auto" placeholder="010-0000-0000" maxlength="13" />
            </div>
          </div>

          <div class="wo-contact-field">
            <label class="wo-contact-label">연락처 확인<span class="wo-contact-label-req">*</span></label>
            <input type="tel" id="wo-phone-confirm" class="wo-contact-input wo-phone-auto" placeholder="연락처를 한 번 더 입력해주세요" maxlength="13" />
            <div class="wo-contact-phone-mismatch" id="wo-phone-mismatch">연락처가 일치하지 않습니다.</div>
          </div>

          <div class="wo-contact-field">
            <label class="wo-contact-label">이메일</label>
            <input type="email" id="wo-email" class="wo-contact-input" placeholder="example@email.com" />
          </div>

          <div class="wo-contact-row">
            <div class="wo-contact-field">
              <label class="wo-contact-label">시설 유형<span class="wo-contact-label-req">*</span></label>
              <select id="wo-facilityType" class="wo-contact-select">
                <option value="">선택해주세요</option>
                <option value="아파트 커뮤니티">아파트 커뮤니티</option>
                <option value="공공기관 (주민센터·복지관·체육시설)">공공기관 (주민센터·복지관·체육시설)</option>
                <option value="기업 사내 시설">기업 사내 시설</option>
                <option value="호텔 부속 시설">호텔 부속 시설</option>
                <option value="기타">기타</option>
              </select>
            </div>
            <div class="wo-contact-field">
              <label class="wo-contact-label">시설명·소속</label>
              <input type="text" id="wo-facilityName" class="wo-contact-input" placeholder="○○아파트 / ○○기업" />
            </div>
          </div>

          <div class="wo-contact-field">
            <label class="wo-contact-label">문의 내용</label>
            <textarea id="wo-message" class="wo-contact-textarea" placeholder="시설 규모·운영 상황·관심 있는 운영 모델 등을 자유롭게 작성해주세요."></textarea>
          </div>

          <div class="wo-contact-agree">
            <input type="checkbox" class="wo-contact-checkbox" id="wo-contact-privacy" />
            <label for="wo-contact-privacy" class="wo-contact-agree-text">
              <a href="#">개인정보 수집·이용</a>에 동의합니다. (위탁운영 상담 목적, 1년간 보관)
            </label>
          </div>

          <button type="button" class="wo-contact-submit" id="wo-submit-btn">
            위탁 제안서 받기
            <span class="wo-contact-submit-arrow">→</span>
          </button>

        </div>
      </div>

    </div>
  </div>
</section>

<!-- ★ fetch 방식 전송 스크립트 -->
<script>
(function(){

  var GAS_URL = 'https://script.google.com/macros/s/AKfycbyelFqoWSqeRWmjVGARFePbNqTtkTtkG9MtXZpfusvTSUxnE42SrjJgmKM4dQDVcI-QAg/exec';

  /* 하이픈 자동 포맷 */
  function formatPhone(value) {
    var nums = value.replace(/[^0-9]/g, '');
    if (nums.length <= 3) return nums;
    if (nums.length <= 7) return nums.slice(0,3) + '-' + nums.slice(3);
    return nums.slice(0,3) + '-' + nums.slice(3,7) + '-' + nums.slice(7,11);
  }

  function handlePhoneInput(e) {
    var input = e.target;
    var cursor = input.selectionStart;
    var before = input.value;
    var formatted = formatPhone(before);
    input.value = formatted;
    var diff = formatted.length - before.length;
    input.setSelectionRange(cursor + diff, cursor + diff);
    checkMatch();
  }

  function checkMatch() {
    var phone = document.getElementById('wo-phone');
    var confirm = document.getElementById('wo-phone-confirm');
    var msg = document.getElementById('wo-phone-mismatch');
    if (!phone || !confirm || !msg) return;
    if (confirm.value.length === 0) { msg.classList.remove('visible'); return; }
    if (phone.value !== confirm.value) { msg.classList.add('visible'); }
    else { msg.classList.remove('visible'); }
  }

  var phoneInputs = document.querySelectorAll('.wo-phone-auto');
  phoneInputs.forEach(function(input) {
    input.addEventListener('input', handlePhoneInput);
    input.addEventListener('keypress', function(e) {
      if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete') {
        e.preventDefault();
      }
    });
  });

  /* ★ 제출 버튼 클릭 */
  var submitBtn = document.getElementById('wo-submit-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', function() {

      var name          = document.getElementById('wo-name').value.trim();
      var phone         = document.getElementById('wo-phone').value.trim();
      var phoneConfirm  = document.getElementById('wo-phone-confirm').value.trim();
      var email         = document.getElementById('wo-email').value.trim();
      var facilityType  = document.getElementById('wo-facilityType').value;
      var facilityName  = document.getElementById('wo-facilityName').value.trim();
      var message       = document.getElementById('wo-message').value.trim();
      var privacy       = document.getElementById('wo-contact-privacy').checked;

      /* 필수값 검증 */
      if (!name) { alert('담당자명을 입력해주세요.'); return; }
      if (!phone) { alert('연락처를 입력해주세요.'); return; }
      if (!phoneConfirm) { alert('연락처 확인을 입력해주세요.'); return; }
      if (phone !== phoneConfirm) { alert('연락처가 일치하지 않습니다. 다시 확인해주세요.'); return; }
      if (!facilityType) { alert('시설 유형을 선택해주세요.'); return; }
      if (!privacy) { alert('개인정보 수집·이용에 동의해주세요.'); return; }

      /* 버튼 비활성화 (중복 제출 방지) */
      submitBtn.disabled = true;
      submitBtn.innerHTML = '전송 중...';

      /* 전송 데이터 구성 */
      var formData = new URLSearchParams();
      formData.append('source', '커뮤니티문의');
      formData.append('token', 'grow2026secure');
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('phoneConfirm', phoneConfirm);
      formData.append('email', email);
      formData.append('facilityType', facilityType);
      formData.append('facilityName', facilityName);
      formData.append('message', message);

      /* ★ fetch로 전송 (no-cors: 아임웹 환경 호환) */
      fetch(GAS_URL, {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
      })
      .then(function() {
        alert('제출이 완료되었습니다.\\n24시간 이내로 연락드릴 예정입니다.\\n잠시만 기다려주세요.');
        /* 폼 초기화 */
        document.getElementById('wo-name').value = '';
        document.getElementById('wo-phone').value = '';
        document.getElementById('wo-phone-confirm').value = '';
        document.getElementById('wo-email').value = '';
        document.getElementById('wo-facilityType').value = '';
        document.getElementById('wo-facilityName').value = '';
        document.getElementById('wo-message').value = '';
        document.getElementById('wo-contact-privacy').checked = false;
        var mismatch = document.getElementById('wo-phone-mismatch');
        if (mismatch) mismatch.classList.remove('visible');
      })
      .catch(function(err) {
        alert('전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        console.log('전송 오류:', err);
      })
      .finally(function() {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '위탁 제안서 받기 <span class="wo-contact-submit-arrow">→</span>';
      });

    });
  }

})();
</script>`;

export default function CommunityConsultingPage() {
  // 하단 상세정보 영역은 클라이언트에서만 렌더링하여 서버/클라이언트 HTML 불일치를
  // 원천 차단한다. (DETAIL_HTML 은 아임웹 원본 + script 가 섞인 외부 HTML)
  const [mounted, setMounted] = useState(false);

  // 상세정보 HTML 컨테이너 ref
  const detailRef = useRef<HTMLDivElement>(null);

  // 마운트 후에만 상세정보 HTML 을 삽입한다.
  useEffect(() => {
    setMounted(true);
  }, []);

  // 아임웹 원본 HTML(+CSS+JS)을 React 환경에서 제대로 동작시키기 위한 처리.
  //  1) dangerouslySetInnerHTML 로 들어온 DOM이 커밋된 뒤(useEffect 시점) 실행.
  //  2) 중복 id 충돌 방지: 두 번째부터 -2, -3 … 접미사를 붙임 (단, 앵커 대상 "contact" 는 보존).
  //  3) innerHTML 로 삽입된 <script> 는 실행되지 않으므로, 같은 내용의 새 <script>를
  //     만들어 document.body 에 append → 실행시킴 (DOM 삽입 → 스크립트 실행 순서 보장).
  //  4) 언마운트 시 추가한 <script>, 슬라이더 interval, 인라인 핸들러용 전역 함수를 정리.
  useEffect(() => {
    // 마운트되어 DETAIL_HTML 이 실제 DOM 에 삽입된 뒤에만 실행한다.
    if (!mounted) return;
    const container = detailRef.current;
    if (!container) return;

    // 2) 중복 id 충돌 방지 (단, #contact 앵커 대상은 변경하지 않고 보존)
    const seen = new Set<string>();
    container.querySelectorAll<HTMLElement>("[id]").forEach((el) => {
      if (el.id === "contact") return; // 앵커 스크롤 보존
      if (!seen.has(el.id)) {
        seen.add(el.id);
        return;
      }
      let n = 2;
      while (document.getElementById(`${el.id}-${n}`)) n++;
      el.id = `${el.id}-${n}`;
    });

    // 3) <script> 재생성 → body 에 append 하여 실행
    //    슬라이더 자동재생 등에서 만든 setInterval 을 cleanup 에서 끄기 위해,
    //    스크립트 실행 동안 생성되는 interval id 를 가로채 기록한다.
    //    (이렇게 하지 않으면 언마운트 후에도 setInterval 이 살아남아
    //     이미 삭제된 전역 함수를 호출 → TypeError)
    const intervalIds: number[] = [];
    const origSetInterval = window.setInterval;
    window.setInterval = function (
      this: unknown,
      ...a: Parameters<typeof window.setInterval>
    ) {
      const id = origSetInterval.apply(window, a);
      intervalIds.push(id as unknown as number);
      return id;
    } as typeof window.setInterval;

    const injected: HTMLScriptElement[] = [];
    container.querySelectorAll("script").forEach((oldScript) => {
      const newScript = document.createElement("script");
      // 속성 복사 (src, type 등)
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      document.body.appendChild(newScript);
      injected.push(newScript);
    });

    // 스크립트 실행이 끝났으니 원래 setInterval 복구
    window.setInterval = origSetInterval;

    // 4) cleanup
    return () => {
      // 먼저 슬라이더 자동재생 interval 정리 (전역 함수 삭제 전에)
      intervalIds.forEach((id) => clearInterval(id));
      injected.forEach((s) => s.remove());
      // 인라인 onclick 이 참조하던 전역 함수 정리 (best-effort)
      const globals = [
        "toggleFaq",
        "toggleCheck",
        "updateCheckResult",
        "animateCount",
        "moveEvSlide",
        "moveRevSlide",
        "acSlide",
        "scrollToForm",
      ];
      const w = window as unknown as Record<string, unknown>;
      globals.forEach((fn) => {
        try {
          delete w[fn];
        } catch {
          // 전역 함수 선언은 삭제 불가일 수 있음 — 무시
        }
      });
    };
  }, [mounted]);

  return (
    <div className="bg-white">
      {/* ───────────────── 상세정보 영역 ───────────────── */}
      <section className="w-full">
        {/* 여기에 상세정보 HTML 삽입 — 위 DETAIL_HTML 문자열에 아임웹 시설 위탁 HTML 붙여넣기 */}
        {mounted ? (
          <div
            ref={detailRef}
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: DETAIL_HTML }}
          />
        ) : (
          <div ref={detailRef} suppressHydrationWarning />
        )}
      </section>

      {/* ───────────────── 다른 서비스 둘러보기 (추천 상품) ───────────────── */}
      <section className="w-full bg-[#f8f9fa]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <h2 className="mb-8 text-center text-xl font-extrabold text-[#1a1a1a] sm:mb-12 sm:text-2xl">
            이런 서비스도 있어요
          </h2>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {RELATED_SERVICES.map((s) => (
              <RelatedServiceCard key={s.href} service={s} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
