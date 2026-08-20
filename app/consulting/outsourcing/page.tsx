"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 매장 위탁운영 상세페이지 (창업 솔루션 페이지와 동일 구조)
//
// 구성
//  1) 상단 메인 영역: 좌측 정사각형 이미지 / 우측 상담 신청 폼 카드 (모바일 세로 스택)
//  2) 하단 상세정보 영역: 외부 HTML(아임웹) 문자열을 dangerouslySetInnerHTML로 렌더링.
//     삽입된 <script>는 useEffect에서 재생성하여 실행시킨다.
//  3) 맨 아래 "다른 서비스 둘러보기" 추천 카드.
//
// 헤더/푸터는 app/layout.tsx 를 그대로 사용한다.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";

// 매장 위탁운영 Service 구조화 데이터
const SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "헬스장 위탁·필라테스 위탁",
  name: "헬스장·필라테스 매장 위탁운영",
  url: `${SITE_URL}/consulting/outsourcing`,
  areaServed: "KR",
  description:
    "헬스장 위탁·필라테스 위탁 전문가가 매장에 직접 상주하며 헬스장 위탁운영으로 매출이 오를 때까지 함께합니다.",
  provider: {
    "@type": "Organization",
    name: "더그로우컴퍼니",
    url: SITE_URL,
  },
};

// 하단 "다른 서비스 둘러보기" 추천 카드 (현재 페이지인 매장 위탁운영은 제외)
const RELATED_SERVICES = [
  {
    title: "창업 솔루션",
    desc: "헬스장·필라테스 등 창업 준비를 위한 솔루션",
    href: "/consulting/startup",
    img: "/startup/startup50.png", // 창업 솔루션 카드 이미지
  },
  {
    title: "시설 위탁운영",
    desc: "아파트·기업·공공기관 장기 위탁",
    href: "/consulting/community",
    img: "/wt/community.png", // 시설 위탁운영 카드 이미지
  },
  {
    title: "진단 솔루션",
    desc: "전문가의 1:1 현장 진단",
    href: "/consulting/diagnosis",
    img: "/consultants/kim-jaegang.jpg", // 김재강 멘토
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

// 좌측 메인 이미지 (public 기준). 없으면 회색 placeholder 로 대체.
const MAIN_IMAGE = "/wt/wt.png";

// ─── 상세정보 HTML ───────────────────────────────────────────────────────────
// 아임웹용 위탁 HTML(+<style>+<script>) 전체를 이 백틱 문자열 안에 그대로 붙여넣으세요.
//
// 붙여넣기 주의:
//  - 백틱( ` ) 과 ${ 두 가지만 \` , \${ 로 이스케이프하면 됩니다. (그 외엔 손댈 필요 없음)
//  - <style>, <script>, 인라인 onclick="toggleFaq(this)" 등은 그대로 둬도
//    아래 useEffect 가 동작하게 처리합니다.
//  - 중복 id(예: consulting-form 2개)는 런타임에 자동으로 -2, -3 … 접미사를 붙여
//    충돌을 방지하므로 직접 고칠 필요 없습니다.
const DETAIL_HTML = `<style>
  .hero-section {
    padding: 100px 20px 70px;
    background: #ffffff;
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
    overflow: hidden;
  }

  /* 페이드 + 슬라이드업 기본 세팅 */
  .hero-animate {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .hero-animate.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .hero-eyebrow {
    font-size: 14px;
    font-weight: 700;
    color: #22B573;
    margin-bottom: 12px;
    letter-spacing: -0.2px;
  }
  .hero-title {
    font-size: 38px;
    font-weight: 800;
    color: #222;
    line-height: 1.45;
    margin-bottom: 28px;
    word-break: keep-all;
    letter-spacing: -0.5px;
  }
  .hero-title .highlight {
    color: #22B573;
    position: relative;
    display: inline-block;
  }
  /* 하이라이트 밑줄 애니메이션 */
  .hero-title .highlight::after {
    content: '';
    position: absolute;
    bottom: 2px;
    left: 0;
    width: 0;
    height: 6px;
    background: rgba(34, 181, 115, 0.2);
    border-radius: 3px;
    transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s;
  }
  .hero-animate.visible .highlight::after {
    width: 100%;
  }

  .hero-subtitle {
    font-size: 17px;
    color: #666;
    line-height: 1.9;
    margin-bottom: 48px;
    word-break: keep-all;
  }

  /* 구분선 애니메이션 */
  .hero-divider {
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #22B573, transparent);
    margin: 0 auto 48px;
    transition: width 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s;
  }
  .hero-divider.visible {
    width: 120px;
  }

  .hero-stats {
    display: flex;
    justify-content: center;
    gap: 48px;
    flex-wrap: wrap;
  }
  .stat-item {
    text-align: center;
    opacity: 0;
    transform: translateY(30px) scale(0.95);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .stat-item.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  .stat-number {
    font-size: 34px;
    font-weight: 800;
    color: #22B573;
    line-height: 1.2;
  }
  .stat-label {
    font-size: 14px;
    color: #888;
    margin-top: 8px;
    font-weight: 500;
  }
  /* 숫자 아래 작은 악센트 바 */
  .stat-bar {
    width: 0;
    height: 3px;
    background: #22B573;
    border-radius: 2px;
    margin: 10px auto 0;
    transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .stat-item.visible .stat-bar {
    width: 40px;
  }

  @media (max-width: 600px) {
    .hero-section { padding: 80px 20px 50px; }
    .hero-title { font-size: 29px; }
    .hero-subtitle { font-size: 15px; margin-bottom: 40px; }
    .hero-stats { gap: 32px; }
    .stat-number { font-size: 28px; }
  }
</style>

<div class="hero-section">
  <div class="hero-animate" id="heroTitle">
    <p class="hero-eyebrow">헬스장 위탁 · 필라테스 위탁</p>
    <h1 class="hero-title">
      매장에 <span class="highlight">직접 가서</span><br>
      매출을 올려드립니다.
    </h1>
  </div>

  <div class="hero-divider" id="heroDivider"></div>

  <div class="hero-animate" id="heroSubtitle" style="transition-delay: 0.2s;">
    <p class="hero-subtitle">
      더그로우 전문가가 헬스장·필라테스 센터에 직접 상주하며<br>
      헬스장 위탁운영으로 매출이 오를 때까지 함께합니다.
    </p>
  </div>

  <div class="hero-stats">
    <div class="stat-item" id="stat1">
      <div class="stat-number"><span class="count-up" data-target="750">0</span>+</div>
      <div class="stat-label">매장 운영 경험</div>
      <div class="stat-bar"></div>
    </div>
    <div class="stat-item" id="stat2">
      <div class="stat-number"><span class="count-up" data-target="540">0</span>+</div>
      <div class="stat-label">현장 상주 실적</div>
      <div class="stat-bar"></div>
    </div>
    <div class="stat-item" id="stat3">
      <div class="stat-number"><span class="count-up" data-target="130">0</span>%</div>
      <div class="stat-label">평균 매출 상승률</div>
      <div class="stat-bar"></div>
    </div>
  </div>
</div>

<script>
(function() {
  // 카운트업
  var countElements = document.querySelectorAll('.count-up');
  var hasAnimated = false;
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-target'));
    var duration = 2000;
    var step = target / (duration / 16);
    var current = 0;
    var timer = setInterval(function() {
      current += step;
      if (current >= target) { el.textContent = target; clearInterval(timer); }
      else { el.textContent = Math.floor(current); }
    }, 16);
  }

  // 등장 애니메이션 (시간차)
  function triggerAnimations() {
    if (hasAnimated) return;
    hasAnimated = true;

    // 타이틀
    document.getElementById('heroTitle').classList.add('visible');

    // 구분선
    setTimeout(function() {
      document.getElementById('heroDivider').classList.add('visible');
    }, 300);

    // 서브타이틀
    setTimeout(function() {
      document.getElementById('heroSubtitle').classList.add('visible');
    }, 400);

    // 숫자들 시간차
    setTimeout(function() {
      document.getElementById('stat1').classList.add('visible');
    }, 700);
    setTimeout(function() {
      document.getElementById('stat2').classList.add('visible');
    }, 900);
    setTimeout(function() {
      document.getElementById('stat3').classList.add('visible');
      // 숫자 카운트업 시작
      countElements.forEach(function(el) { animateCount(el); });
    }, 1100);
  }

  // IntersectionObserver로 화면에 보이면 시작
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        triggerAnimations();
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(document.querySelector('.hero-section'));
})();
</script>

<style>
  .empathy-section {
    padding: 70px 20px;
    background: #ffffff;
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }
  .empathy-title {
    font-size: 28px;
    font-weight: 800;
    color: #222;
    line-height: 1.45;
    margin-bottom: 32px;
    word-break: keep-all;
  }
  .empathy-title .highlight { color: #22B573; }
  .empathy-list {
    max-width: 550px;
    margin: 0 auto 32px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .empathy-item {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 18px 24px;
    text-align: left;
    font-size: 16px;
    color: #444;
    line-height: 1.5;
    display: flex;
    align-items: center;
    gap: 14px;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .empathy-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  }
  .empathy-emoji {
    font-size: 24px;
    flex-shrink: 0;
  }
  .empathy-item .emph {
    color: #22B573;
    font-weight: 700;
  }
  .empathy-bridge {
    background: #22B573;
    color: #fff;
    border-radius: 12px;
    padding: 24px 20px;
    max-width: 550px;
    margin: 0 auto;
    font-size: 17px;
    font-weight: 700;
    line-height: 1.7;
  }
  @media (max-width: 600px) {
    .empathy-section { padding: 50px 16px; }
    .empathy-title { font-size: 23px; }
    .empathy-item { font-size: 15px; padding: 16px 18px; }
  }
</style>

<div class="empathy-section">
  <h2 class="empathy-title">
    혹시 지금<br>
    <span class="highlight">이런 상황</span> 아니세요?
  </h2>

  <div class="empathy-list">
    <div class="empathy-item">
      <span class="empathy-emoji">😰</span>
      <span>주변에 <span class="emph">센터가 너무 많아져서</span> 회원이 점점 빠지고 있다</span>
    </div>
    <div class="empathy-item">
      <span class="empathy-emoji">📉</span>
      <span>예전엔 잘 됐는데, <span class="emph">요즘 매출이 계속 떨어진다</span></span>
    </div>
    <div class="empathy-item">
      <span class="empathy-emoji">😮‍💨</span>
      <span>마케팅, 상담, 운영 <span class="emph">혼자 다 하려니 지친다</span></span>
    </div>
    <div class="empathy-item">
      <span class="empathy-emoji">❓</span>
      <span>뭐가 문제인지, <span class="emph">뭘 바꿔야 할지 모르겠다</span></span>
    </div>
  </div>

  <div class="empathy-bridge">
    하나라도 해당된다면,<br>
    혼자 고민하지 마세요.<br>
    더그로우가 <strong>직접 매장에 가서</strong> 해결해드립니다.
  </div>
</div>

<style>
  .evidence-section {
    padding: 70px 20px;
    background: #ffffff;
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }
  .evidence-title {
    font-size: 30px;
    font-weight: 800;
    color: #222;
    line-height: 1.45;
    margin-bottom: 16px;
    word-break: keep-all;
  }
  .evidence-title .highlight { color: #22B573; }
  .evidence-desc {
    font-size: 16px;
    color: #888;
    margin-bottom: 36px;
    line-height: 1.7;
  }
  .evidence-stats-box {
    background: #f8f9fa;
    border-radius: 16px;
    padding: 32px 24px;
    margin-bottom: 36px;
  }
  .evidence-stats-label {
    font-size: 14px;
    color: #888;
    margin-bottom: 20px;
    font-weight: 500;
  }
  .evidence-stats {
    display: flex;
    justify-content: center;
    gap: 36px;
    flex-wrap: wrap;
  }
  .ev-stat { text-align: center; }
  .ev-stat-num {
    font-size: 32px;
    font-weight: 800;
    color: #22B573;
  }
  .ev-stat-num.red { color: #e74c3c; }
  .ev-stat-label {
    font-size: 13px;
    color: #888;
    margin-top: 6px;
  }
  /* 슬라이드 */
  .evidence-slide-area {
    background: #f8f9fa;
    border-radius: 16px;
    padding: 36px 20px;
  }
  .evidence-slide-title {
    font-size: 18px;
    font-weight: 700;
    color: #222;
    margin-bottom: 24px;
  }
  .slide-container {
    position: relative;
    overflow: hidden;
    border-radius: 12px;
    max-width: 500px;
    margin: 0 auto;
  }
  .slide-track {
    display: flex;
    transition: transform 0.4s ease;
  }
  .slide-item {
    min-width: 100%;
  }
  .slide-item img {
    width: 100%;
    border-radius: 12px;
    display: block;
  }
  .slide-nav {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    margin-top: 20px;
  }
  .slide-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #22B573;
    color: #fff;
    border: none;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }
  .slide-btn:hover { background: #1a9c5e; }
  .slide-dots {
    display: flex;
    gap: 8px;
  }
  .slide-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ddd;
    transition: background 0.3s;
  }
  .slide-dot.active { background: #22B573; }
  @media (max-width: 600px) {
    .evidence-section { padding: 50px 16px; }
    .evidence-title { font-size: 24px; }
    .ev-stat-num { font-size: 26px; }
    .evidence-stats { gap: 20px; }
  }
</style>

<div class="evidence-section">
  <h2 class="evidence-title">
    결과로 증명합니다.<br>
    <span class="highlight">평균 매출 상승률 130%</span>
  </h2>
  <p class="evidence-desc">
    540개 매장에 직접 상주하며 만들어낸 결과입니다.
  </p>

  <div class="evidence-stats-box">
    <p class="evidence-stats-label">현장 상주 매출 상승 실적</p>
    <div class="evidence-stats">
      <div class="ev-stat">
        <div class="ev-stat-num">3,870만</div>
        <div class="ev-stat-label">평균 매출 상승</div>
      </div>
      <div class="ev-stat">
        <div class="ev-stat-num">1억 800만</div>
        <div class="ev-stat-label">최대 매출 상승</div>
      </div>
      <div class="ev-stat">
        <div class="ev-stat-num red">130%</div>
        <div class="ev-stat-label">평균 상승률</div>
      </div>
    </div>
  </div>

  <div class="evidence-slide-area">
    <p class="evidence-slide-title">📊 실제 매출 인증 후기</p>
    <div class="slide-container" id="evidenceSlider">
      <div class="slide-track" id="evidenceTrack">
        <div class="slide-item">
          <img src="https://cdn.imweb.me/thumbnail/20241211/c12f8d2b7c711.jpg" alt="매출 인증 후기 1">
        </div>
        <div class="slide-item">
          <img src="https://cdn.imweb.me/thumbnail/20241211/da658e75f3899.jpg" alt="매출 인증 후기 2">
        </div>
        <div class="slide-item">
          <img src="https://cdn.imweb.me/thumbnail/20241211/5b0f94542ab80.jpg" alt="매출 인증 후기 3">
        </div>
      </div>
    </div>
    <div class="slide-nav">
      <button class="slide-btn" onclick="moveEvSlide(-1)">‹</button>
      <div class="slide-dots" id="evidenceDots"></div>
      <button class="slide-btn" onclick="moveEvSlide(1)">›</button>
    </div>
  </div>
</div>

<script>
(function() {
  let evIdx = 0;
  const track = document.getElementById('evidenceTrack');
  const items = track.querySelectorAll('.slide-item');
  const dotsC = document.getElementById('evidenceDots');
  items.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'slide-dot' + (i === 0 ? ' active' : '');
    dotsC.appendChild(d);
  });
  function updateEv() {
    track.style.transform = 'translateX(-' + (evIdx * 100) + '%)';
    dotsC.querySelectorAll('.slide-dot').forEach((d, i) => {
      d.className = 'slide-dot' + (i === evIdx ? ' active' : '');
    });
  }
  window.moveEvSlide = function(dir) {
    evIdx = (evIdx + dir + items.length) % items.length;
    updateEv();
  }
  setInterval(() => { window.moveEvSlide(1); }, 4000);
})();
</script>

<style>
  .compare-section {
    padding: 70px 20px;
    background: #f8f9fa;
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }
  .compare-title {
    font-size: 28px;
    font-weight: 800;
    color: #222;
    line-height: 1.45;
    margin-bottom: 12px;
    word-break: keep-all;
  }
  .compare-title .highlight { color: #22B573; }
  .compare-desc {
    font-size: 15px;
    color: #888;
    margin-bottom: 40px;
    line-height: 1.7;
  }
  .compare-table {
    display: flex;
    gap: 16px;
    max-width: 700px;
    margin: 0 auto 32px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .compare-col {
    flex: 1;
    min-width: 280px;
    border-radius: 16px;
    padding: 28px 24px;
    text-align: left;
  }
  .compare-col.bad {
    background: #fff;
    border: 1px solid #eee;
  }
  .compare-col.good {
    background: #fff;
    border: 2px solid #22B573;
  }
  .compare-col-label {
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .compare-col.bad .compare-col-label { color: #999; }
  .compare-col.good .compare-col-label { color: #22B573; }
  .compare-item {
    font-size: 15px;
    color: #555;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    line-height: 1.5;
  }
  .compare-item:last-child { border-bottom: none; }
  .compare-icon {
    flex-shrink: 0;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    margin-top: 2px;
  }
  .compare-col.bad .compare-icon {
    background: #fee;
    color: #e74c3c;
  }
  .compare-col.good .compare-icon {
    background: #e8f8f0;
    color: #22B573;
  }
  .compare-bottom {
    background: #22B573;
    color: #fff;
    border-radius: 12px;
    padding: 20px;
    max-width: 700px;
    margin: 0 auto;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.6;
  }
  @media (max-width: 600px) {
    .compare-section { padding: 50px 16px; }
    .compare-title { font-size: 23px; }
    .compare-col { min-width: 100%; padding: 24px 20px; }
  }
</style>

<div class="compare-section">
  <h2 class="compare-title">
    더그로우가<br>
    <span class="highlight">타 업체와 다른 결정적 이유</span>
  </h2>
  <p class="compare-desc">
    단기적으로 매출만 올리고 철수하는 곳이 아닙니다.<br>
    매출이 지속되도록, 스스로 운영하실 수 있도록 교육합니다.
  </p>

  <div class="compare-table">
    <div class="compare-col bad">
      <div class="compare-col-label">✕ 일반 업체</div>
      <div class="compare-item">
        <div class="compare-icon">✕</div>
        <span>단기 매출 상승에만 집중</span>
      </div>
      <div class="compare-item">
        <div class="compare-icon">✕</div>
        <span>철수 후 매출 다시 하락</span>
      </div>
      <div class="compare-item">
        <div class="compare-icon">✕</div>
        <span>운영 시스템 없이 감으로 진행</span>
      </div>
      <div class="compare-item">
        <div class="compare-icon">✕</div>
        <span>사후관리 없음</span>
      </div>
      <div class="compare-item">
        <div class="compare-icon">✕</div>
        <span>선불 수수료 요구</span>
      </div>
    </div>

    <div class="compare-col good">
      <div class="compare-col-label">✓ 더그로우</div>
      <div class="compare-item">
        <div class="compare-icon">✓</div>
        <span><strong>지속 가능한 성장</strong>을 목표로</span>
      </div>
      <div class="compare-item">
        <div class="compare-icon">✓</div>
        <span>종료 후에도 <strong>스스로 운영 가능</strong>하도록 교육</span>
      </div>
      <div class="compare-item">
        <div class="compare-icon">✓</div>
        <span><strong>그로우업 시스템</strong> 제공 및 정착</span>
      </div>
      <div class="compare-item">
        <div class="compare-icon">✓</div>
        <span>운영관리본부 통한 <strong>지속적 A/S</strong></span>
      </div>
      <div class="compare-item">
        <div class="compare-icon">✓</div>
        <span>매출 상승 후 <strong>후불 수수료</strong></span>
      </div>
    </div>
  </div>

  <div class="compare-bottom">
    결과에 자신 없으면 후불제를 할 수 없습니다.<br>
    540개 매장 실적이 그 증거입니다.
  </div>
</div>

<style>
  .system-section {
    padding: 70px 20px;
    background: #ffffff;
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }
  .system-badge {
    display: inline-block;
    background: #22B573;
    color: #fff;
    padding: 8px 20px;
    border-radius: 50px;
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 20px;
  }
  .system-title {
    font-size: 28px;
    font-weight: 800;
    color: #222;
    line-height: 1.45;
    margin-bottom: 16px;
    word-break: keep-all;
  }
  .system-title .highlight { color: #22B573; }
  .system-desc {
    font-size: 15px;
    color: #888;
    line-height: 1.7;
    margin-bottom: 32px;
  }
  .system-tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
    margin-bottom: 32px;
  }
  .system-tag {
    background: #f8f9fa;
    border: 1px solid #e0e0e0;
    border-radius: 50px;
    padding: 10px 20px;
    font-size: 14px;
    color: #444;
    font-weight: 600;
    transition: all 0.2s;
  }
  .system-tag:hover {
    background: #22B573;
    color: #fff;
    border-color: #22B573;
  }
  .system-images {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 28px;
  }
  .system-images img {
    width: 100%;
    border-radius: 12px;
    display: block;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  }
  .system-bottom {
    background: #f0faf5;
    border: 2px solid #22B573;
    border-radius: 12px;
    padding: 22px 24px;
    font-size: 16px;
    color: #222;
    line-height: 1.7;
    font-weight: 600;
  }
  .system-bottom .green { color: #22B573; }
  @media (max-width: 600px) {
    .system-section { padding: 50px 16px; }
    .system-title { font-size: 23px; }
    .system-tag { font-size: 13px; padding: 8px 16px; }
    .system-images { grid-template-columns: 1fr; gap: 10px; }
  }
</style>

<div class="system-section">
  <div class="system-badge">더그로우 운영시스템</div>

  <h2 class="system-title">
    750개 매장에서 검증된<br>
    <span class="highlight">"그로우업"</span> 시스템을 적용합니다.
  </h2>
  <p class="system-desc">
    센터 운영에 필요한 모든 것을<br>
    기록하고 파악할 수 있도록<br>
    체계적으로 설계된 운영 시스템입니다.
  </p>

  <div class="system-tags">
    <span class="system-tag">콜수 관리</span>
    <span class="system-tag">홍보일지</span>
    <span class="system-tag">회원관리</span>
    <span class="system-tag">방명록</span>
    <span class="system-tag">상담 기록</span>
    <span class="system-tag">미등록회원</span>
    <span class="system-tag">지출표</span>
    <span class="system-tag">매출표</span>
    <span class="system-tag">체크리스트</span>
  </div>

  <div class="system-images">
    <img src="https://cdn.imweb.me/thumbnail/20250521/ec22279ad0f18.png" alt="그로우업 시스템 1">
    <img src="https://cdn.imweb.me/thumbnail/20250521/ac7e57d4e6ed1.png" alt="그로우업 시스템 2">
    <img src="https://cdn.imweb.me/thumbnail/20250521/8b7863bb913a8.png" alt="그로우업 시스템 3">
  </div>

  <div class="system-bottom">
    단순히 시스템만 드리는 게 아닙니다.<br>
    더그로우 전문가가 <span class="green">직접 매장에 상주</span>하며<br>
    이 시스템을 기반으로 <span class="green">함께 운영</span>합니다.
  </div>
</div>

<style>
  .process-section {
    padding: 70px 20px;
    background: #f8f9fa;
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }
  .process-title {
    font-size: 28px;
    font-weight: 800;
    color: #222;
    line-height: 1.45;
    margin-bottom: 12px;
    word-break: keep-all;
  }
  .process-title .highlight { color: #22B573; }
  .process-desc {
    font-size: 15px;
    color: #888;
    margin-bottom: 40px;
    line-height: 1.7;
  }
  .process-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    max-width: 700px;
    margin: 0 auto 36px;
  }
  .process-card {
    background: #fff;
    border-radius: 14px;
    padding: 28px 18px;
    text-align: left;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .process-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  }
  .process-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #22B573;
    color: #fff;
    font-size: 14px;
    font-weight: 800;
    margin-bottom: 14px;
  }
  .process-card-title {
    font-size: 16px;
    font-weight: 700;
    color: #222;
    margin-bottom: 8px;
    line-height: 1.4;
  }
  .process-card-desc {
    font-size: 13px;
    color: #888;
    line-height: 1.6;
  }
  .process-note {
    background: #fff;
    border: 2px solid #22B573;
    border-radius: 12px;
    padding: 20px 24px;
    max-width: 700px;
    margin: 0 auto 32px;
    font-size: 16px;
    color: #222;
    line-height: 1.6;
    font-weight: 600;
  }
  .process-note .green { color: #22B573; }
  .process-cta {
    display: inline-block;
    background: #22B573;
    color: #fff;
    padding: 16px 44px;
    border-radius: 8px;
    font-size: 17px;
    font-weight: 700;
    text-decoration: none;
    cursor: pointer;
    border: none;
    transition: background 0.3s;
  }
  .process-cta:hover { background: #1a9c5e; }
  @media (max-width: 600px) {
    .process-section { padding: 50px 16px; }
    .process-title { font-size: 23px; }
    .process-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
    .process-card { padding: 22px 16px; }
  }
</style>

<div class="process-section">
  <h2 class="process-title">
    매장 상주 솔루션<br>
    <span class="highlight">진행 과정</span>
  </h2>
  <p class="process-desc">
    더그로우 간부급 전문가가 헬스장·필라테스 위탁 매장에 직접 상주하며<br>
    매출이 오를 때까지 함께 운영합니다.
  </p>

  <div class="process-grid">
    <div class="process-card">
      <div class="process-num">1</div>
      <div class="process-card-title">매장 방문 후<br>문제점 파악</div>
      <div class="process-card-desc">더그로우 간부급 책임자가 직접 방문하여 현재 상황을 진단합니다.</div>
    </div>
    <div class="process-card">
      <div class="process-num">2</div>
      <div class="process-card-title">문제점 분석 및<br>해결 방안 수립</div>
      <div class="process-card-desc">홍보팀, 상담팀, 운영팀이 함께 맞춤 전략을 설계합니다.</div>
    </div>
    <div class="process-card">
      <div class="process-num">3</div>
      <div class="process-card-title">더그로우 팀장<br>매장 상주</div>
      <div class="process-card-desc">계약기간 동안 전문가가 직접 매장에서 함께 근무합니다.</div>
    </div>
    <div class="process-card">
      <div class="process-num">4</div>
      <div class="process-card-title">1:1 집중<br>케어 진행</div>
      <div class="process-card-desc">상담, 홍보, 운영을 집중 관리하여 매출 상승과 회원 유치를 이끕니다.</div>
    </div>
    <div class="process-card">
      <div class="process-num">5</div>
      <div class="process-card-title">운영 시스템<br>제공 및 교육</div>
      <div class="process-card-desc">계약 종료 후에도 스스로 운영하실 수 있도록 시스템과 교육을 제공합니다.</div>
    </div>
    <div class="process-card">
      <div class="process-num">6</div>
      <div class="process-card-title">주간 피드백<br>지속 제공</div>
      <div class="process-card-desc">운영관리본부에서 매주 데이터 기반 피드백을 드립니다.</div>
    </div>
  </div>

  <div class="process-note">
    단순히 시스템만 드리는 게 아닙니다.<br>
    더그로우 전문가가 <span class="green">직접 매장에 상주</span>하며<br>
    이 시스템을 기반으로 <span class="green">함께 운영</span>합니다.
  </div>

  <button class="process-cta" onclick="scrollToForm()">무료 진단 신청하기</button>
</div>

<script>
  function scrollToForm() {
    window.scrollTo({
      top: document.body.scrollHeight - window.innerHeight * 2,
      behavior: 'smooth'
    });
  }
</script>

<style>
  .aftercare-section {
    padding: 70px 20px;
    background: #f8f9fa;
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }
  .aftercare-title {
    font-size: 28px;
    font-weight: 800;
    color: #222;
    line-height: 1.45;
    margin-bottom: 12px;
    word-break: keep-all;
  }
  .aftercare-title .highlight { color: #22B573; }
  .aftercare-desc {
    font-size: 15px;
    color: #888;
    margin-bottom: 40px;
    line-height: 1.7;
  }
  .aftercare-blocks {
    display: flex;
    flex-direction: column;
    gap: 28px;
    max-width: 650px;
    margin: 0 auto 32px;
  }
  .aftercare-block {
    background: #fff;
    border-radius: 16px;
    padding: 28px 24px;
    text-align: left;
  }
  .aftercare-block-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
  }
  .aftercare-block-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: #e8f8f0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
  }
  .aftercare-block-label {
    font-size: 18px;
    font-weight: 800;
    color: #222;
  }
  .aftercare-block-label .green { color: #22B573; }
  .aftercare-block-items {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
  }
  .aftercare-block-item {
    font-size: 15px;
    color: #555;
    line-height: 1.6;
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
  .aftercare-check {
    color: #22B573;
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 2px;
  }

  /* 슬라이더 - 한 장씩 전체 표시 */
  .ac-slider-wrap {
    position: relative;
    border-radius: 12px;
    background: #f8f9fa;
    overflow: hidden;
  }
  .ac-slider-viewport {
    position: relative;
    width: 100%;
    overflow: hidden;
    touch-action: pan-y;
    -webkit-user-select: none;
    user-select: none;
  }
  .ac-slide-img {
    width: 100%;
    display: block;
    border-radius: 10px;
    transition: opacity 0.4s ease;
  }
  /* 자세히 알아보기 */
  .ac-slide-cta-box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    aspect-ratio: 16 / 9;
    background: linear-gradient(135deg, #e8f8f0 0%, #d0f0e2 100%);
    border-radius: 10px;
  }
  .ac-slide-cta-inner {
    text-align: center;
    padding: 30px;
  }
  .ac-slide-cta-inner p {
    font-size: 18px;
    font-weight: 700;
    color: #333;
    margin: 0 0 20px 0;
    line-height: 1.6;
  }
  .ac-slide-cta-btn {
    display: inline-block;
    background: #22B573;
    color: #fff;
    padding: 14px 36px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 700;
    text-decoration: none;
    transition: background 0.3s, transform 0.2s;
  }
  .ac-slide-cta-btn:hover {
    background: #1a9c5e;
    transform: translateY(-2px);
  }

  /* 네비게이션 */
  .ac-slider-nav {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    margin-top: 16px;
  }
  .ac-slider-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #22B573;
    color: #fff;
    border: none;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s, transform 0.15s;
  }
  .ac-slider-btn:hover { background: #1a9c5e; }
  .ac-slider-btn:active { transform: scale(0.92); }
  .ac-slider-dots {
    display: flex;
    gap: 6px;
  }
  .ac-slider-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ddd;
    transition: background 0.3s, transform 0.3s;
  }
  .ac-slider-dot.active {
    background: #22B573;
    transform: scale(1.25);
  }
  .ac-slider-counter {
    font-size: 13px;
    color: #999;
    margin-top: 8px;
  }

  .aftercare-bottom {
    background: #22B573;
    color: #fff;
    border-radius: 12px;
    padding: 22px 24px;
    max-width: 650px;
    margin: 0 auto;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.7;
  }

  @media (max-width: 600px) {
    .aftercare-section { padding: 50px 16px; }
    .aftercare-title { font-size: 23px; }
    .aftercare-block { padding: 22px 16px; }
    .ac-slide-cta-inner p { font-size: 16px; }
  }
</style>

<div class="aftercare-section">
  <h2 class="aftercare-title">
    업계 유일,<br>
    <span class="highlight">지속적인 사후관리</span>
  </h2>
  <p class="aftercare-desc">
    계약이 끝나면 연락 두절? 더그로우는 다릅니다.<br>
    종료 후에도 두 개의 전담 본부에서 지속적으로 관리해드립니다.
  </p>

  <div class="aftercare-blocks">

    <!-- 운영관리본부 -->
    <div class="aftercare-block">
      <div class="aftercare-block-header">
        <div class="aftercare-block-icon">📊</div>
        <div class="aftercare-block-label"><span class="green">운영관리본부</span></div>
      </div>
      <div class="aftercare-block-items">
        <div class="aftercare-block-item">
          <span class="aftercare-check">✓</span>
          <span>각 센터를 <strong>1:1로 체크</strong>하며 데이터 기반 피드백 제공</span>
        </div>
        <div class="aftercare-block-item">
          <span class="aftercare-check">✓</span>
          <span>주간별 방문하여 <strong>업데이트된 시스템</strong> 제공 및 교육</span>
        </div>
        <div class="aftercare-block-item">
          <span class="aftercare-check">✓</span>
          <span>운영 문제 발생 시 <strong>즉시 솔루션</strong> 진행</span>
        </div>
      </div>

      <div class="ac-slider-wrap">
        <div class="ac-slider-viewport" id="opsViewport">
          <img class="ac-slide-img" id="opsImg" src="" alt="운영관리본부 메뉴얼">
        </div>
      </div>
      <div class="ac-slider-nav">
        <button class="ac-slider-btn" onclick="acSlide('ops',-1)">‹</button>
        <div class="ac-slider-dots" id="opsDots"></div>
        <button class="ac-slider-btn" onclick="acSlide('ops',1)">›</button>
      </div>
      <div class="ac-slider-counter" id="opsCounter">1 / 6</div>
    </div>

    <!-- 마케팅본부 -->
    <div class="aftercare-block">
      <div class="aftercare-block-header">
        <div class="aftercare-block-icon">📣</div>
        <div class="aftercare-block-label"><span class="green">마케팅본부</span></div>
      </div>
      <div class="aftercare-block-items">
        <div class="aftercare-block-item">
          <span class="aftercare-check">✓</span>
          <span>신규 고객 유치를 위한 <strong>온라인 마케팅 세팅 및 실행</strong>을 직접 도와드림</span>
        </div>
        <div class="aftercare-block-item">
          <span class="aftercare-check">✓</span>
          <span>단순 마케팅이 아닌 <strong>내부 운영적인 부분까지 직접 컨트롤</strong></span>
        </div>
        <div class="aftercare-block-item">
          <span class="aftercare-check">✓</span>
          <span>홍보 전략 수립부터 <strong>광고 운영까지 일괄 지원</strong></span>
        </div>
      </div>

      <div class="ac-slider-wrap">
        <div class="ac-slider-viewport" id="mktViewport">
          <!-- 이미지 또는 CTA 박스가 여기에 동적으로 표시 -->
          <img class="ac-slide-img" id="mktImg" src="" alt="마케팅본부 메뉴얼">
          <div class="ac-slide-cta-box" id="mktCta" style="display:none;">
            <div class="ac-slide-cta-inner">
              <p>더그로우 마케팅본부의<br>더 자세한 서비스가 궁금하다면?</p>
              <a class="ac-slide-cta-btn" href="https://thegrowcompany.co.kr/growmarketing" target="_blank">자세히 알아보기 →</a>
            </div>
          </div>
        </div>
      </div>
      <div class="ac-slider-nav">
        <button class="ac-slider-btn" onclick="acSlide('mkt',-1)">‹</button>
        <div class="ac-slider-dots" id="mktDots"></div>
        <button class="ac-slider-btn" onclick="acSlide('mkt',1)">›</button>
      </div>
      <div class="ac-slider-counter" id="mktCounter">1 / 9</div>
    </div>

  </div>

  <div class="aftercare-bottom">
    종료 후에도 대표님의 성장을 위해<br>
    지속적으로 함께합니다.
  </div>
</div>

<script>
(function() {
  var opsImages = [
    'https://cdn.imweb.me/thumbnail/20260301/3f0ff1ac29f5b.png',
    'https://cdn.imweb.me/thumbnail/20260301/b6463a6460eaa.png',
    'https://cdn.imweb.me/thumbnail/20260301/fdb0e426a5697.png',
    'https://cdn.imweb.me/thumbnail/20260301/202a5a4a1b15f.png',
    'https://cdn.imweb.me/thumbnail/20260301/fdecb5489a623.png',
    'https://cdn.imweb.me/thumbnail/20260301/49fbd159eb995.png'
  ];

  var mktImages = [
    'https://cdn.imweb.me/thumbnail/20260301/0bf50ac06ca1e.png',
    'https://cdn.imweb.me/thumbnail/20260301/83c118c7daad9.png',
    'https://cdn.imweb.me/thumbnail/20260301/8cc4e3fa743bf.png',
    'https://cdn.imweb.me/thumbnail/20260301/36ad0318d45b1.png',
    'https://cdn.imweb.me/thumbnail/20260301/3ffcbe2ed4627.png',
    'https://cdn.imweb.me/thumbnail/20260301/01666bae2fbc7.png',
    'https://cdn.imweb.me/thumbnail/20260301/c1976a1fc2340.png',
    'https://cdn.imweb.me/thumbnail/20260301/f9f82be36cf48.png',
    'CTA'
  ];

  var sliders = {
    ops: { idx: 0, images: opsImages },
    mkt: { idx: 0, images: mktImages }
  };

  // dots 생성
  ['ops','mkt'].forEach(function(key) {
    var dotsEl = document.getElementById(key + 'Dots');
    var total = sliders[key].images.length;
    for (var i = 0; i < total; i++) {
      var d = document.createElement('div');
      d.className = 'ac-slider-dot' + (i === 0 ? ' active' : '');
      dotsEl.appendChild(d);
    }
  });

  function render(key) {
    var s = sliders[key];
    var total = s.images.length;
    var dots = document.getElementById(key + 'Dots').querySelectorAll('.ac-slider-dot');
    var counter = document.getElementById(key + 'Counter');

    dots.forEach(function(d, i) {
      d.className = 'ac-slider-dot' + (i === s.idx ? ' active' : '');
    });
    counter.textContent = (s.idx + 1) + ' / ' + total;

    if (key === 'ops') {
      var img = document.getElementById('opsImg');
      img.style.opacity = '0';
      setTimeout(function() {
        img.src = s.images[s.idx];
        img.style.opacity = '1';
      }, 150);
    }

    if (key === 'mkt') {
      var img = document.getElementById('mktImg');
      var cta = document.getElementById('mktCta');
      if (s.images[s.idx] === 'CTA') {
        img.style.display = 'none';
        cta.style.display = 'flex';
      } else {
        cta.style.display = 'none';
        img.style.display = 'block';
        img.style.opacity = '0';
        setTimeout(function() {
          img.src = s.images[s.idx];
          img.style.opacity = '1';
        }, 150);
      }
    }
  }

  // 버튼 클릭
  window.acSlide = function(key, dir) {
    var s = sliders[key];
    var total = s.images.length;
    s.idx = (s.idx + dir + total) % total;
    render(key);
  };

  // 터치 스와이프
  ['ops','mkt'].forEach(function(key) {
    var viewport = document.getElementById(key + 'Viewport');
    var startX = 0;
    var endX = 0;

    viewport.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
    }, { passive: true });

    viewport.addEventListener('touchend', function(e) {
      endX = e.changedTouches[0].clientX;
      var diff = startX - endX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) { window.acSlide(key, 1); }
        else { window.acSlide(key, -1); }
      }
    });
  });

  // 초기 렌더
  render('ops');
  render('mkt');
})();
</script>

<style>
  .review-section {
    padding: 70px 20px;
    background: #ffffff;
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }
  .review-title {
    font-size: 28px;
    font-weight: 800;
    color: #222;
    line-height: 1.45;
    margin-bottom: 12px;
    word-break: keep-all;
  }
  .review-title .highlight { color: #22B573; }
  .review-desc {
    font-size: 15px;
    color: #888;
    margin-bottom: 36px;
    line-height: 1.7;
  }
  .review-slider {
    position: relative;
    overflow: hidden;
    border-radius: 16px;
    max-width: 550px;
    margin: 0 auto;
    background: #f8f9fa;
  }
  .review-track {
    display: flex;
    transition: transform 0.4s ease;
  }
  .review-slide {
    min-width: 100%;
    padding: 20px;
  }
  .review-slide img {
    width: 100%;
    border-radius: 12px;
    display: block;
  }
  .review-nav {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    margin-top: 24px;
  }
  .review-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #22B573;
    color: #fff;
    border: none;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }
  .review-btn:hover { background: #1a9c5e; }
  .review-dots {
    display: flex;
    gap: 8px;
  }
  .review-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #ddd;
    transition: background 0.3s;
  }
  .review-dot.active { background: #22B573; }
  @media (max-width: 600px) {
    .review-section { padding: 50px 16px; }
    .review-title { font-size: 23px; }
    .review-slide { padding: 14px; }
  }
</style>

<div class="review-section">
  <h2 class="review-title">
    함께한 대표님들의<br>
    <span class="highlight">생생한 후기</span>
  </h2>
  <p class="review-desc">
    저희와 함께한 모든 대표님들의<br>
    센터가 계속 성장하길 바라는 마음으로 운영하고 있습니다.
  </p>

  <div class="review-slider" id="reviewSlider">
    <div class="review-track" id="reviewTrack">
      <div class="review-slide">
        <img src="https://cdn.imweb.me/thumbnail/20241211/da76e27aabd5f.png" alt="운영 후기 1">
      </div>
      <div class="review-slide">
        <img src="https://cdn.imweb.me/thumbnail/20241211/98f696e86a7a4.png" alt="운영 후기 2">
      </div>
      <div class="review-slide">
        <img src="https://cdn.imweb.me/thumbnail/20241211/5529d2d36575b.png" alt="운영 후기 3">
      </div>
      <div class="review-slide">
        <img src="https://cdn.imweb.me/thumbnail/20241211/eb6f67a7b56f0.jpg" alt="운영 후기 4">
      </div>
    </div>
  </div>

  <div class="review-nav">
    <button class="review-btn" onclick="moveRevSlide(-1)">‹</button>
    <div class="review-dots" id="reviewDots"></div>
    <button class="review-btn" onclick="moveRevSlide(1)">›</button>
  </div>
</div>

<script>
(function() {
  var revIdx = 0;
  var track = document.getElementById('reviewTrack');
  var items = track.querySelectorAll('.review-slide');
  var dotsC = document.getElementById('reviewDots');
  items.forEach(function(_, i) {
    var d = document.createElement('div');
    d.className = 'review-dot' + (i === 0 ? ' active' : '');
    dotsC.appendChild(d);
  });
  function updateRev() {
    track.style.transform = 'translateX(-' + (revIdx * 100) + '%)';
    dotsC.querySelectorAll('.review-dot').forEach(function(d, i) {
      d.className = 'review-dot' + (i === revIdx ? ' active' : '');
    });
  }
  window.moveRevSlide = function(dir) {
    revIdx = (revIdx + dir + items.length) % items.length;
    updateRev();
  }
  setInterval(function() { window.moveRevSlide(1); }, 5000);
})();
</script>

<style>
  .faq-section {
    padding: 70px 20px;
    background: #f8f9fa;
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }
  .faq-title {
    font-size: 28px;
    font-weight: 800;
    color: #222;
    margin-bottom: 12px;
    word-break: keep-all;
  }
  .faq-title .highlight { color: #22B573; }
  .faq-desc {
    font-size: 15px;
    color: #888;
    margin-bottom: 36px;
  }
  .faq-list {
    max-width: 620px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .faq-item {
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
    transition: box-shadow 0.2s;
  }
  .faq-item:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
  .faq-question {
    padding: 20px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    font-size: 16px;
    font-weight: 700;
    color: #222;
    text-align: left;
    line-height: 1.5;
    user-select: none;
  }
  .faq-toggle {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #22B573;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 700;
    flex-shrink: 0;
    transition: transform 0.3s;
  }
  .faq-item.open .faq-toggle { transform: rotate(45deg); }
  .faq-answer {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s ease, padding 0.3s ease;
  }
  .faq-item.open .faq-answer {
    max-height: 300px;
    padding: 0 24px 20px;
  }
  .faq-answer-text {
    font-size: 15px;
    color: #666;
    line-height: 1.7;
    text-align: left;
    border-top: 1px solid #f0f0f0;
    padding-top: 16px;
  }
  @media (max-width: 600px) {
    .faq-section { padding: 50px 16px; }
    .faq-title { font-size: 23px; }
    .faq-question { font-size: 15px; padding: 18px 18px; }
  }
</style>

<div class="faq-section">
  <h2 class="faq-title">
    <span class="highlight">자주 묻는 질문</span>
  </h2>
  <p class="faq-desc">대표님들이 가장 궁금해하시는 질문들을 정리했습니다.</p>

  <div class="faq-list">
    <div class="faq-item" onclick="toggleFaq(this)">
      <div class="faq-question">
        Q1. 현장 상주 운영이 정확히 뭔가요?
        <div class="faq-toggle">+</div>
      </div>
      <div class="faq-answer">
        <div class="faq-answer-text">더그로우의 팀장급 전문가가 대표님의 매장에 직접 출근하여 함께 근무합니다. 상담, 마케팅, 운영 시스템 세팅까지 매출이 오를 때까지 현장에서 직접 도와드립니다. 기간은 보통 1개월~45일 정도 진행됩니다.</div>
      </div>
    </div>

    <div class="faq-item" onclick="toggleFaq(this)">
      <div class="faq-question">
        Q2. 수수료는 어떻게 되나요?
        <div class="faq-toggle">+</div>
      </div>
      <div class="faq-answer">
        <div class="faq-answer-text">수수료는 100% 후불제입니다. 매출이 실제로 상승한 후에만 수수료를 받습니다. 매출이 오르지 않으면 수수료를 받지 않습니다. 그만큼 저희 결과에 자신이 있습니다.</div>
      </div>
    </div>

    <div class="faq-item" onclick="toggleFaq(this)">
      <div class="faq-question">
        Q3. 타 솔루션 업체와 다른점이 뭔가요?
        <div class="faq-toggle">+</div>
      </div>
      <div class="faq-answer">
        <div class="faq-answer-text">일반 업체는 단기 매출만 올리고 철수합니다. 더그로우는 종료 후에도 스스로 운영하실 수 있도록 시스템과 교육을 제공하고, 운영관리본부를 통해 지속적으로 사후관리합니다. 750개 매장에서 검증된 그로우업 시스템을 직접 정착시켜 드립니다.</div>
      </div>
    </div>

    <div class="faq-item" onclick="toggleFaq(this)">
      <div class="faq-question">
        Q4. 확실한 매출 상승이 보장되나요?
        <div class="faq-toggle">+</div>
      </div>
      <div class="faq-answer">
        <div class="faq-answer-text">100% 보장은 어렵지만, 540개 이상의 현장 상주 실적과 평균 매출 상승률 130%가 저희의 결과를 말해줍니다. 그리고 매출이 안 오르면 수수료를 받지 않는 후불제를 운영하고 있어, 대표님께서 손해 보실 리스크가 없습니다.</div>
      </div>
    </div>

    <div class="faq-item" onclick="toggleFaq(this)">
      <div class="faq-question">
        Q5. 종료 후 매출이 떨어지면 어쩌죠?
        <div class="faq-toggle">+</div>
      </div>
      <div class="faq-answer">
        <div class="faq-answer-text">이 질문을 가장 많이 받습니다. 더그로우는 단순히 매출만 올리고 떠나지 않습니다. 운영 시스템을 정착시키고 대표님이 직접 운영하실 수 있도록 교육까지 해드립니다. 종료 후에도 운영관리본부에서 주간 피드백과 데이터 점검을 지속 제공합니다.</div>
      </div>
    </div>

    <div class="faq-item" onclick="toggleFaq(this)">
      <div class="faq-question">
        Q6. 진짜 매출이 안 나오면 수수료도 안 받으시나요?
        <div class="faq-toggle">+</div>
      </div>
      <div class="faq-answer">
        <div class="faq-answer-text">네, 맞습니다. 매출 상승이 없으면 수수료를 받지 않습니다. 저희가 후불제를 할 수 있는 이유는 그만큼 결과에 대한 자신감이 있기 때문입니다. 무료 방문 진단을 먼저 받아보시고 판단하세요.</div>
      </div>
    </div>
  </div>
</div>

<script>
function toggleFaq(el) {
  const isOpen = el.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) el.classList.add('open');
}
</script>

<style>
  .cta-section {
    padding: 80px 20px;
    background: #f9f9f9;
  }

  .cta-inner {
    max-width: 900px;
    margin: 0 auto;
    text-align: center;
  }

  .cta-title {
    font-size: 26px;
    font-weight: 800;
    color: #222;
    margin-bottom: 15px;
    line-height: 1.4;
  }

  .cta-title .highlight {
    color: #22B573;
  }

  .cta-subtitle {
    font-size: 17px;
    color: #666;
    line-height: 1.7;
    margin-bottom: 50px;
    word-break: keep-all;
  }

  .tg-form-wrap {
    max-width: 600px;
    margin: 0 auto;
    background: #ffffff;
  }
  .tg-form-header {
    background: #22B573;
    color: #ffffff;
    padding: 20px 24px;
    border-radius: 16px 16px 0 0;
    text-align: center;
  }
  .tg-form-title {
    font-size: 20px;
    font-weight: 700;
  }
  #consultingForm {
    padding: 30px;
    border: 1px solid #e5e5e5;
    border-top: none;
    border-radius: 0 0 16px 16px;
    background: #ffffff;
  }
  .tg-form-group {
    margin-bottom: 20px;
    text-align: left;
  }
  .tg-label {
    display: block;
    margin-bottom: 8px;
    font-size: 15px;
    font-weight: 600;
    color: #333;
  }
  .tg-required {
    color: #ff5757;
    font-size: 14px;
  }
  .tg-input {
    width: 100%;
    box-sizing: border-box;
    padding: 12px 14px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 15px;
    transition: border-color 0.3s;
  }
  .tg-input:focus {
    outline: none;
    border-color: #22B573;
  }
  .tg-phone-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .tg-phone {
    max-width: 100px;
    text-align: center;
  }
  .tg-phone-dash {
    font-size: 16px;
    color: #555;
  }
  .tg-radio {
    display: block;
    font-size: 15px;
    margin-bottom: 8px;
    cursor: pointer;
  }
  .tg-radio input {
    margin-right: 8px;
    accent-color: #22B573;
  }
  .tg-radio-inline {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .tg-input-inline {
    max-width: 180px;
  }
  .tg-form-actions {
    text-align: center;
    margin-top: 30px;
  }
  .tg-submit-btn {
    width: 100%;
    padding: 16px 30px;
    background: #22B573;
    color: #ffffff;
    border: none;
    border-radius: 10px;
    font-size: 18px;
    cursor: pointer;
    font-weight: 700;
    transition: background 0.3s;
  }
  .tg-submit-btn:hover {
    background: #1a9c5e;
  }
  .tg-submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .form-notice {
    margin-top: 20px;
    font-size: 14px;
    color: #888;
  }

  /* 폼 텍스트 가시성 — 밝은 카드 배경과 대비 명시 */
  #consultingForm .tg-label,
  #consultingForm .tg-radio,
  #consultingForm .tg-radio span {
    color: #111;
  }
  #consultingForm .tg-input {
    color: #111 !important;
    background: #fff !important;
  }
  #consultingForm .tg-input::placeholder {
    color: #999 !important;
  }

  @media (max-width: 768px) {
    .cta-section {
      padding: 60px 20px;
    }

    .cta-title {
      font-size: 22px;
    }

    .tg-form-wrap {
      margin: 0;
    }

    #consultingForm {
      padding: 20px;
    }

    .tg-phone {
      max-width: 80px;
    }
  }
</style>

<div class="cta-section" id="consulting-form-wt">
  <div class="cta-inner">
    <h2 class="cta-title">
      지금 바로<br>
      <span class="highlight">무료 진단</span> 받아보세요
    </h2>

    <p class="cta-subtitle">
      1회 무료 방문 진단 후 결정하시면 됩니다.<br>
    </p>

    <div class="tg-form-wrap">
      <div class="tg-form-header">
        <span class="tg-form-title">1회 무료 방문 진단 솔루션 신청하기</span>
      </div>

      <form id="consultingForm" action="https://script.google.com/macros/s/AKfycbyelFqoWSqeRWmjVGARFePbNqTtkTtkG9MtXZpfusvTSUxnE42SrjJgmKM4dQDVcI-QAg/exec" method="POST" target="hidden_iframe2">
        <div class="tg-form-group">
          <label class="tg-label">이름을 입력해주세요. <span class="tg-required">*</span></label>
          <input type="text" name="name" class="tg-input" required />
        </div>

        <div class="tg-form-group">
          <label class="tg-label">이메일을 입력해주세요. <span class="tg-required">*</span></label>
          <input type="email" name="email" class="tg-input" placeholder="example@naver.com" required />
        </div>

        <div class="tg-form-group">
          <label class="tg-label">연락처를 입력해주세요. <span class="tg-required">*</span></label>
          <div class="tg-phone-row">
            <input type="text" name="phone1" class="tg-input tg-phone" maxlength="3" required />
            <span class="tg-phone-dash">-</span>
            <input type="text" name="phone2" class="tg-input tg-phone" maxlength="4" required />
            <span class="tg-phone-dash">-</span>
            <input type="text" name="phone3" class="tg-input tg-phone" maxlength="4" required />
          </div>
        </div>

        <div class="tg-form-group">
          <label class="tg-label">연락처를 입력해주세요(중복확인). <span class="tg-required">*</span></label>
          <div class="tg-phone-row">
            <input type="text" name="phoneCheck1" class="tg-input tg-phone" maxlength="3" required />
            <span class="tg-phone-dash">-</span>
            <input type="text" name="phoneCheck2" class="tg-input tg-phone" maxlength="4" required />
            <span class="tg-phone-dash">-</span>
            <input type="text" name="phoneCheck3" class="tg-input tg-phone" maxlength="4" required />
          </div>
        </div>

        <div class="tg-form-group">
          <label class="tg-label">신청 경로를 알려주세요. <span class="tg-required">*</span></label>

          <label class="tg-radio">
            <input type="radio" name="route" value="네이버 검색" required />
            <span>네이버 검색</span>
          </label>

          <label class="tg-radio">
            <input type="radio" name="route" value="인스타·페이스북 광고" />
            <span>인스타·페이스북 광고</span>
          </label>

          <label class="tg-radio">
            <input type="radio" name="route" value="네이버 블로그" />
            <span>네이버 블로그</span>
          </label>

          <label class="tg-radio">
            <input type="radio" name="route" value="지인 소개·아카데미 수강생" />
            <span>지인 소개·아카데미 수강생</span>
          </label>

          <label class="tg-radio">
            <input type="radio" name="route" value="기타" />
            <span>기타</span>
          </label>
        </div>

        <div class="tg-form-group">
          <label class="tg-label">종목을 알려주세요. <span class="tg-required">*</span></label>

          <label class="tg-radio">
            <input type="radio" name="type" value="헬스장" required />
            <span>헬스장</span>
          </label>

          <label class="tg-radio">
            <input type="radio" name="type" value="필라테스" />
            <span>필라테스</span>
          </label>

          <label class="tg-radio">
            <input type="radio" name="type" value="PT샵" />
            <span>PT샵</span>
          </label>

          <div class="tg-radio tg-radio-inline">
            <label>
              <input type="radio" name="type" value="기타" />
              <span>기타</span>
            </label>
            <input type="text" name="typeEtc" class="tg-input tg-input-inline" placeholder="직접입력" />
          </div>
        </div>

        <!-- 페이지 구분 -->
        <input type="hidden" name="source" value="위탁상담2">

        <!-- 🔒 보안 토큰 -->
        <input type="hidden" name="token" value="grow2026secure">

        <div class="tg-form-actions">
          <button type="submit" class="tg-submit-btn">무료 진단 신청하기</button>
        </div>

        <p class="form-notice">* 신청 후 1-2일 내 연락드립니다.</p>
      </form>

      <iframe name="hidden_iframe2" style="display:none;"></iframe>
    </div>
  </div>
</div>

<script>
  document.getElementById('consultingForm').addEventListener('submit', function (e) {
    const phone1 = this.querySelector('[name="phone1"]').value.trim();
    const phone2 = this.querySelector('[name="phone2"]').value.trim();
    const phone3 = this.querySelector('[name="phone3"]').value.trim();
    const phoneCheck1 = this.querySelector('[name="phoneCheck1"]').value.trim();
    const phoneCheck2 = this.querySelector('[name="phoneCheck2"]').value.trim();
    const phoneCheck3 = this.querySelector('[name="phoneCheck3"]').value.trim();

    if (phone1 !== phoneCheck1 || phone2 !== phoneCheck2 || phone3 !== phoneCheck3) {
      e.preventDefault();
      alert('연락처가 일치하지 않습니다. 다시 확인해주세요.');
      return false;
    }

    const typeRadio = this.querySelector('input[name="type"]:checked');
    const typeEtc = this.querySelector('[name="typeEtc"]').value.trim();
    if (typeRadio && typeRadio.value === '기타' && typeEtc) {
      const hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = 'typeFinal';
      hidden.value = '기타 - ' + typeEtc;
      this.appendChild(hidden);
    }

    // GA4 전환 이벤트 (gtag 미로드 시 조용히 무시)
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'form_submit', { form_source: '위탁상담2' });
    }

    setTimeout(function () {
      alert('정상적으로 접수되었습니다. 감사합니다 :)');
      document.getElementById('consultingForm').reset();
    }, 500);
  });

  // 전화 3칸 자동이동 + 숫자만 입력 (상단에도 동일 구조 폼(-top)이 있으므로 이 폼 안에서만 조회)
  const wtPhoneInputs = document.getElementById('consultingForm').querySelectorAll('.tg-phone');
  wtPhoneInputs.forEach((input, index) => {
    input.addEventListener('input', function () {
      if (this.value.length >= this.maxLength && index < wtPhoneInputs.length - 1) {
        wtPhoneInputs[index + 1].focus();
      }
    });

    input.addEventListener('keypress', function (e) {
      if (!/[0-9]/.test(e.key)) {
        e.preventDefault();
      }
    });
  });
</script>`;

// ─── 상단 상담 폼 (하단 consultingForm 과 동일 필드 구성, id/iframe 만 -top 접미사) ──
//  - action / token(grow2026secure) / source(위탁상담2) / name 속성은
//    구글시트 Apps Script 연동에 물려 있으므로 절대 변경하지 않는다.
//  - 우측 흰 카드(JSX) 안에 주입되므로 카드 톤에 맞는 스코프 스타일만 포함.
const TOP_FORM_HTML = `<style>
#wtTopForm .tg-form-group { margin-bottom: 18px; text-align: left; }
#wtTopForm .tg-label { display: block; margin-bottom: 8px; font-size: 14px; font-weight: 700; color: #111; }
#wtTopForm .tg-required { color: #ff5757; font-size: 13px; }
#wtTopForm .tg-input { width: 100%; box-sizing: border-box; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; color: #111; background: #fff; transition: border-color 0.3s; }
#wtTopForm .tg-input:focus { outline: none; border-color: #009519; }
#wtTopForm .tg-input::placeholder { color: #999; }
#wtTopForm .tg-phone-row { display: flex; align-items: center; gap: 8px; }
#wtTopForm .tg-phone { max-width: 100px; text-align: center; }
#wtTopForm .tg-phone-dash { font-size: 15px; color: #9ca3af; }
#wtTopForm .tg-radio { display: flex; align-items: center; font-size: 14px; color: #111; margin-bottom: 8px; cursor: pointer; }
#wtTopForm .tg-radio input { margin-right: 10px; accent-color: #009519; width: 16px; height: 16px; }
#wtTopForm .tg-radio-inline { display: flex; align-items: center; gap: 10px; margin-bottom: 0; }
#wtTopForm .tg-radio-inline label { display: flex; align-items: center; font-size: 14px; color: #111; cursor: pointer; }
#wtTopForm .tg-input-inline { max-width: 160px; }
#wtTopForm .tg-form-actions { margin-top: 24px; }
#wtTopForm .tg-submit-btn { width: 100%; padding: 14px 30px; background: #009519; color: #fff; border: none; border-radius: 999px; font-size: 16px; font-weight: 700; cursor: pointer; transition: background 0.3s; }
#wtTopForm .tg-submit-btn:hover { background: #007a14; }
#wtTopForm .form-notice { margin-top: 14px; font-size: 13px; color: #888; text-align: center; }
@media (max-width: 768px) {
  #wtTopForm .tg-phone { max-width: 80px; }
}
</style>

<div id="wtTopForm">
  <form id="consultingForm-top" action="https://script.google.com/macros/s/AKfycbyelFqoWSqeRWmjVGARFePbNqTtkTtkG9MtXZpfusvTSUxnE42SrjJgmKM4dQDVcI-QAg/exec" method="POST" target="hidden_iframe2_top">
    <div class="tg-form-group">
      <label class="tg-label">이름을 입력해주세요. <span class="tg-required">*</span></label>
      <input type="text" name="name" class="tg-input" required />
    </div>

    <div class="tg-form-group">
      <label class="tg-label">이메일을 입력해주세요. <span class="tg-required">*</span></label>
      <input type="email" name="email" class="tg-input" placeholder="example@naver.com" required />
    </div>

    <div class="tg-form-group">
      <label class="tg-label">연락처를 입력해주세요. <span class="tg-required">*</span></label>
      <div class="tg-phone-row">
        <input type="text" name="phone1" class="tg-input tg-phone" maxlength="3" required />
        <span class="tg-phone-dash">-</span>
        <input type="text" name="phone2" class="tg-input tg-phone" maxlength="4" required />
        <span class="tg-phone-dash">-</span>
        <input type="text" name="phone3" class="tg-input tg-phone" maxlength="4" required />
      </div>
    </div>

    <div class="tg-form-group">
      <label class="tg-label">연락처를 입력해주세요(중복확인). <span class="tg-required">*</span></label>
      <div class="tg-phone-row">
        <input type="text" name="phoneCheck1" class="tg-input tg-phone" maxlength="3" required />
        <span class="tg-phone-dash">-</span>
        <input type="text" name="phoneCheck2" class="tg-input tg-phone" maxlength="4" required />
        <span class="tg-phone-dash">-</span>
        <input type="text" name="phoneCheck3" class="tg-input tg-phone" maxlength="4" required />
      </div>
    </div>

    <div class="tg-form-group">
      <label class="tg-label">신청 경로를 알려주세요. <span class="tg-required">*</span></label>

      <label class="tg-radio">
        <input type="radio" name="route" value="네이버 검색" required />
        <span>네이버 검색</span>
      </label>

      <label class="tg-radio">
        <input type="radio" name="route" value="인스타·페이스북 광고" />
        <span>인스타·페이스북 광고</span>
      </label>

      <label class="tg-radio">
        <input type="radio" name="route" value="네이버 블로그" />
        <span>네이버 블로그</span>
      </label>

      <label class="tg-radio">
        <input type="radio" name="route" value="지인 소개·아카데미 수강생" />
        <span>지인 소개·아카데미 수강생</span>
      </label>

      <label class="tg-radio">
        <input type="radio" name="route" value="기타" />
        <span>기타</span>
      </label>
    </div>

    <div class="tg-form-group">
      <label class="tg-label">종목을 알려주세요. <span class="tg-required">*</span></label>

      <label class="tg-radio">
        <input type="radio" name="type" value="헬스장" required />
        <span>헬스장</span>
      </label>

      <label class="tg-radio">
        <input type="radio" name="type" value="필라테스" />
        <span>필라테스</span>
      </label>

      <label class="tg-radio">
        <input type="radio" name="type" value="PT샵" />
        <span>PT샵</span>
      </label>

      <div class="tg-radio tg-radio-inline">
        <label>
          <input type="radio" name="type" value="기타" />
          <span>기타</span>
        </label>
        <input type="text" name="typeEtc" class="tg-input tg-input-inline" placeholder="직접입력" />
      </div>
    </div>

    <!-- 페이지 구분 -->
    <input type="hidden" name="source" value="위탁상담2">

    <!-- 🔒 보안 토큰 -->
    <input type="hidden" name="token" value="grow2026secure">

    <div class="tg-form-actions">
      <button type="submit" class="tg-submit-btn">무료 상담 신청하기</button>
    </div>

    <p class="form-notice">* 신청 후 1-2일 내 연락드립니다.</p>
  </form>

  <iframe name="hidden_iframe2_top" style="display:none;"></iframe>
</div>

<script>
(function () {
  const form = document.getElementById('consultingForm-top');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    const phone1 = this.querySelector('[name="phone1"]').value.trim();
    const phone2 = this.querySelector('[name="phone2"]').value.trim();
    const phone3 = this.querySelector('[name="phone3"]').value.trim();
    const phoneCheck1 = this.querySelector('[name="phoneCheck1"]').value.trim();
    const phoneCheck2 = this.querySelector('[name="phoneCheck2"]').value.trim();
    const phoneCheck3 = this.querySelector('[name="phoneCheck3"]').value.trim();

    if (phone1 !== phoneCheck1 || phone2 !== phoneCheck2 || phone3 !== phoneCheck3) {
      e.preventDefault();
      alert('연락처가 일치하지 않습니다. 다시 확인해주세요.');
      return false;
    }

    const typeRadio = this.querySelector('input[name="type"]:checked');
    const typeEtc = this.querySelector('[name="typeEtc"]').value.trim();
    if (typeRadio && typeRadio.value === '기타' && typeEtc) {
      const hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = 'typeFinal';
      hidden.value = '기타 - ' + typeEtc;
      this.appendChild(hidden);
    }

    // GA4 전환 이벤트 (gtag 미로드 시 조용히 무시)
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'form_submit', { form_source: '위탁상담2' });
    }

    setTimeout(function () {
      alert('정상적으로 접수되었습니다. 감사합니다 :)');
      form.reset();
    }, 500);
  });

  // 전화 3칸 자동이동 + 숫자만 입력 (하단에도 동일 구조 폼이 있으므로 이 폼 안에서만 조회)
  const phoneInputs = form.querySelectorAll('.tg-phone');
  phoneInputs.forEach((input, index) => {
    input.addEventListener('input', function () {
      if (this.value.length >= this.maxLength && index < phoneInputs.length - 1) {
        phoneInputs[index + 1].focus();
      }
    });

    input.addEventListener('keypress', function (e) {
      if (!/[0-9]/.test(e.key)) {
        e.preventDefault();
      }
    });
  });
})();
</script>`;

export default function OutsourcingConsultingPage() {
  const [imgError, setImgError] = useState(false);

  // 하단 상세정보 영역은 클라이언트에서만 렌더링하여 서버/클라이언트 HTML 불일치를
  // 원천 차단한다. (DETAIL_HTML 은 아임웹 원본 + script 가 섞인 외부 HTML)
  const [mounted, setMounted] = useState(false);

  // 상세정보 HTML 컨테이너 ref
  const detailRef = useRef<HTMLDivElement>(null);

  // 상단 상담 폼(TOP_FORM_HTML) 컨테이너 ref
  const topFormRef = useRef<HTMLDivElement>(null);

  // 마운트 후에만 상세정보 HTML 을 삽입한다.
  useEffect(() => {
    setMounted(true);
  }, []);

  // 아임웹 원본 HTML(+CSS+JS)을 React 환경에서 제대로 동작시키기 위한 처리.
  //  1) dangerouslySetInnerHTML 로 들어온 DOM이 커밋된 뒤(useEffect 시점) 실행.
  //  2) 중복 id 충돌 방지: 두 번째부터 -2, -3 … 접미사를 붙임 (script 실행 전에 수행).
  //  3) innerHTML 로 삽입된 <script> 는 실행되지 않으므로, 같은 내용의 새 <script>를
  //     만들어 document.body 에 append → 실행시킴 (DOM 삽입 → 스크립트 실행 순서 보장).
  //     스크립트가 전역 스코프에서 실행되므로 그 안의 함수 선언
  //     (function toggleFaq(){…}, function moveEvSlide(){…} 등)이 자동으로
  //     window 전역에 등록되어, 인라인 onclick="toggleFaq(this)" 가 동작함.
  //  4) 언마운트 시 추가한 <script> 와 인라인 핸들러용 전역 함수를 정리.
  useEffect(() => {
    // 마운트되어 DETAIL_HTML 이 실제 DOM 에 삽입된 뒤에만 실행한다.
    if (!mounted) return;
    const container = detailRef.current;
    if (!container) return;

    // 2) 중복 id 충돌 방지
    const seen = new Set<string>();
    container.querySelectorAll<HTMLElement>("[id]").forEach((el) => {
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
    //     이미 삭제된 window.moveRevSlide/moveEvSlide 를 호출 → TypeError)
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

  // 상단 상담 폼(TOP_FORM_HTML) 주입 — innerHTML 로 들어온 <script> 는 실행되지
  // 않으므로 같은 내용의 새 <script> 를 만들어 실행시키고, 언마운트 시 제거한다.
  useEffect(() => {
    if (!mounted) return;
    const container = topFormRef.current;
    if (!container) return;

    const injected: HTMLScriptElement[] = [];
    container.querySelectorAll("script").forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      document.body.appendChild(newScript);
      injected.push(newScript);
    });
    return () => {
      injected.forEach((s) => s.remove());
    };
  }, [mounted]);

  // 탭 클릭 시 DETAIL_HTML 내부 섹션으로 부드럽게 스크롤 (상단 고정 헤더 높이만큼 offset)
  const scrollToSection = (selector: string) => {
    const el = document.querySelector(selector);
    if (!el) return; // DETAIL_HTML 이 아직 안 붙었거나 섹션이 없으면 무시
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_SCHEMA) }}
      />
      {/* ───────────────── 상단 메인 영역 (2단) ───────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
          {/* 좌: 정사각형 이미지 */}
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#f1f1f1]">
            {!imgError ? (
              <Image
                src={MAIN_IMAGE}
                alt="헬스장·필라테스 매장 위탁운영 솔루션"
                fill
                priority
                className="object-cover object-center"
                sizes="(min-width: 1024px) 50vw, 100vw"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
                <svg
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M2.25 6.75h19.5M3.75 4.5h16.5a1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V6a1.5 1.5 0 011.5-1.5z"
                  />
                </svg>
                <span className="text-xs">{MAIN_IMAGE}</span>
              </div>
            )}
          </div>

          {/* 우: 상담 신청 폼 카드 (TOP_FORM_HTML 주입 — 하단 consultingForm 과 동일 구성) */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="mb-6 text-xl font-black leading-snug text-[#1a1a1a] sm:text-2xl">
              매장 위탁운영 상담 신청 (무료)
            </h2>

            {mounted ? (
              <div
                ref={topFormRef}
                suppressHydrationWarning
                dangerouslySetInnerHTML={{ __html: TOP_FORM_HTML }}
              />
            ) : (
              <div ref={topFormRef} suppressHydrationWarning />
            )}
          </div>
        </div>
      </section>

      {/* ───────────────── 탭 네비게이션 바 ───────────────── */}
      <nav className="w-full border-y border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-stretch">
          <button
            type="button"
            onClick={() => scrollToSection(".review-section")}
            className="flex-1 py-4 text-center text-sm font-semibold text-[#333] transition-colors hover:text-[#009519] sm:text-base"
          >
            이용후기
          </button>
          <div className="my-3 w-px bg-gray-200" />
          <button
            type="button"
            onClick={() => scrollToSection(".faq-section")}
            className="flex-1 py-4 text-center text-sm font-semibold text-[#333] transition-colors hover:text-[#009519] sm:text-base"
          >
            궁금한사항
          </button>
        </div>
      </nav>

      {/* ───────────────── 하단 상세정보 영역 ───────────────── */}
      <section className="w-full">
        {/* 여기에 상세정보 HTML 삽입 — 위 DETAIL_HTML 문자열에 아임웹 위탁 HTML 붙여넣기 */}
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
