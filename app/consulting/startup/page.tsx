"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 창업 솔루션 상세페이지 (정관장 상품 상세 스타일)
//
// 구성
//  1) 상단 메인 영역: 좌측 정사각형 이미지 / 우측 상담 신청 폼 카드 (모바일 세로 스택)
//  2) 하단 상세정보 영역: 외부 HTML(아임웹) 문자열을 dangerouslySetInnerHTML로 렌더링.
//     삽입된 <script>는 useEffect에서 재생성하여 실행시킨다.
//
// 헤더/푸터는 app/layout.tsx 를 그대로 사용한다.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import FcLink from "@/components/FcLink";
import StickyCtaBar from "@/components/StickyCtaBar";
import CostCalculator from "@/components/CostCalculator";
import { SITE_URL } from "@/lib/site";

// 창업 솔루션 Service 구조화 데이터
const SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "피트니스 창업 솔루션",
  name: "헬스장·필라테스 창업 솔루션",
  url: `${SITE_URL}/consulting/startup`,
  areaServed: "KR",
  description:
    "헬스장창업·필라테스창업부터 피트니스 인테리어까지. 오픈 이후에도 살아남는 운영 구조를 설계하는 더그로우컴퍼니 창업 솔루션.",
  provider: {
    "@type": "Organization",
    name: "더그로우컴퍼니",
    url: SITE_URL,
  },
};

// 하단 "다른 서비스 둘러보기" 추천 카드
const RELATED_SERVICES = [
  {
    title: "매장 위탁운영",
    desc: "운영이 어려운 매장을 위한 단기 위탁",
    href: "/consulting/outsourcing",
    img: "/wt/wt.png", // 매장 위탁운영 카드 이미지
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
    // 부산 기수 종료(2026-09-12) 후 자동으로 /edu/fc-class 복귀
    href: "/edu/fc-class",
    fc: true,
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

  const cardCls =
    "group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-[#009519] hover:shadow-lg";

  const CardWrap = ({ children }: { children: React.ReactNode }) =>
    "fc" in service && service.fc ? (
      <FcLink className={cardCls}>{children}</FcLink>
    ) : (
      <Link href={service.href} className={cardCls}>
        {children}
      </Link>
    );

  return (
    <CardWrap>
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
    </CardWrap>
  );
}

// ─── 자체 영상 후기 슬라이더 (유튜브 미사용, public/reviews/ 정적 파일) ────────
//  - 원본: video-raw/ → ffmpeg 720p(세로 720x1280) CRF28 + AAC 96k 인코딩본
//  - 카드 클릭 전에는 poster 만 보여주고 영상은 preload="none" (모바일 데이터 절약)
const VIDEO_REVIEWS = [
  {
    src: "/reviews/review-1.mp4",
    poster: "/reviews/review-1.jpg",
    caption: "수치와 데이터로 증명한 첫 창업 이야기",
  },
  {
    src: "/reviews/review-2.mp4",
    poster: "/reviews/review-2.jpg",
    caption: "의심을 확인으로 바꾼 PT 스튜디오 창업",
  },
  {
    src: "/reviews/review-3.mp4",
    poster: "/reviews/review-3.jpg",
    caption: "일주일 만에 매출 8,300만원, 두번째 창업",
  },
];

const vidCardHtml = (v: (typeof VIDEO_REVIEWS)[number], hidden: boolean) => `
      <div class="tgc-vid-card"${hidden ? ' aria-hidden="true"' : ""}>
        <div class="tgc-vid-media">
          <video src="${v.src}" poster="${v.poster}" preload="none" playsinline></video>
          <button type="button" class="tgc-vid-play" aria-label="후기 영상 재생"${hidden ? ' tabindex="-1"' : ""}>
            <span><svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span>
          </button>
          <button type="button" class="tgc-vid-close" aria-label="영상 닫기"${hidden ? ' tabindex="-1"' : ""}>✕</button>
        </div>
        <p class="tgc-vid-cap">${v.caption}</p>
      </div>`;

// 마퀴 절반 루프용 — 2세트가 절반, 총 4세트 (첫 세트 외에는 보조기기에서 숨김)
const VIDEO_CARDS_HTML =
  VIDEO_REVIEWS.map((v) => vidCardHtml(v, false)).join("") +
  VIDEO_REVIEWS.map((v) => vidCardHtml(v, true)).join("").repeat(3);

// ─── 영상 후기 슬라이더 섹션 (히어로 바로 아래 별도 컨테이너로 주입) ──────────
//  · 기본: rAF 자동 마퀴. 영상 재생 시 자동 흐름만 정지, 드래그/화살표 수동 이동 허용
//  · 드래그 10px 이상은 클릭으로 간주하지 않음. 재생 카드가 밖으로 나가면 자동 pause(IO)
//  · 정리는 __tgcVidStop (React cleanup 에서 호출 후 no-op 교체)
const VIDEO_SECTION_HTML = `<style>
.tgc-vid{font-family:'Pretendard',-apple-system,BlinkMacSystemFont,system-ui,'Apple SD Gothic Neo',sans-serif;background:#0d0d0d;color:#fff;padding:90px 0;overflow:hidden;letter-spacing:-0.01em}
.tgc-vid-inner{max-width:1000px;margin:0 auto;padding:0 20px;text-align:center}
.tgc-vid h2{font-size:32px;font-weight:800;line-height:1.4;margin:0 0 12px;color:#fff}
.tgc-vid h2 .green{color:#22B573}
.tgc-vid-sub{font-size:15px;color:#9a9a9a;margin:0 0 40px}
.tgc-vid-stage{position:relative}
.tgc-vid-mq{overflow:hidden;width:100%;max-width:100%;-webkit-user-select:none;user-select:none;touch-action:pan-y;cursor:grab}
.tgc-vid-mq:active{cursor:grabbing}
.tgc-vid-track{display:flex;gap:18px;width:max-content;will-change:transform}
.tgc-vid-card{flex:0 0 auto;width:320px}
.tgc-vid-media{position:relative;width:100%;aspect-ratio:9/16;border-radius:16px;overflow:hidden;background:#1a1a1a}
.tgc-vid-media video{width:100%;height:100%;object-fit:cover;display:block}
.tgc-vid-play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.18);border:none;cursor:pointer;transition:background .2s}
.tgc-vid-play:hover{background:rgba(0,0,0,.32)}
.tgc-vid-play span{display:flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:50%;background:rgba(0,149,25,.92);box-shadow:0 8px 24px rgba(0,0,0,.4)}
.tgc-vid-close{position:absolute;top:10px;right:10px;z-index:3;width:34px;height:34px;border:none;border-radius:50%;background:rgba(0,0,0,.6);color:#fff;font-size:15px;line-height:1;cursor:pointer;display:none}
.tgc-vid-card.is-playing .tgc-vid-play{display:none}
.tgc-vid-card.is-playing .tgc-vid-close{display:block}
.tgc-vid-cap{margin:12px 4px 0;font-size:14px;font-weight:600;color:#cfcfcf;line-height:1.5;text-align:left}
.tgc-vid-arrow{display:none;position:absolute;top:50%;transform:translateY(-50%);z-index:4;width:46px;height:46px;border:none;border-radius:50%;background:rgba(0,0,0,.6);color:#fff;font-size:24px;line-height:1;cursor:pointer;align-items:center;justify-content:center;transition:background .2s}
.tgc-vid-arrow:hover{background:rgba(0,149,25,.85)}
.tgc-vid-arrow--l{left:14px}
.tgc-vid-arrow--r{right:14px}
@media(min-width:768px){.tgc-vid.is-manual .tgc-vid-arrow{display:flex}}
@media(max-width:640px){.tgc-vid{padding:64px 0}.tgc-vid h2{font-size:24px}.tgc-vid-card{width:260px}.tgc-vid-track{gap:14px}}
</style>

<section class="tgc-vid" id="tgc-vid-sec">
  <div class="tgc-vid-inner">
    <h2>먼저 창업한 <span class="green">대표님들의 이야기</span></h2>
    <p class="tgc-vid-sub">영상을 누르면 대표님들의 실제 목소리를 들을 수 있습니다.</p>
  </div>
  <div class="tgc-vid-stage">
    <button type="button" class="tgc-vid-arrow tgc-vid-arrow--l" id="tgcVidPrev" aria-label="이전 영상으로 이동">‹</button>
    <div class="tgc-vid-mq" id="tgcVidMq">
      <div class="tgc-vid-track" id="tgcVidTrack">${VIDEO_CARDS_HTML}
      </div>
    </div>
    <button type="button" class="tgc-vid-arrow tgc-vid-arrow--r" id="tgcVidNext" aria-label="다음 영상으로 이동">›</button>
  </div>
</section>

<script>
(function () {
  var section = document.getElementById('tgc-vid-sec');
  var mq = document.getElementById('tgcVidMq');
  var track = document.getElementById('tgcVidTrack');
  if (!section || !mq || !track) return;

  var offset = 0, last = 0, rafId = 0;
  var current = null;   /* 재생 중 video (동시 재생 금지) */
  var io = null;        /* 재생 카드 화면 이탈 감지용 IntersectionObserver */
  var dragging = false, dragStartX = 0, dragStartOffset = 0, dragDist = 0;

  function normalize() {
    var half = track.scrollWidth / 2;
    if (half <= 0) return;
    while (offset <= -half) offset += half;
    while (offset > 0) offset -= half;
  }
  function apply() { track.style.transform = 'translateX(' + offset + 'px)'; }

  /* 자동 가로 흐름 — 영상 재생 중이거나 드래그 중에는 멈춤 */
  function frame(ts) {
    if (!last) last = ts;
    var dt = ts - last; last = ts;
    if (!current && !dragging) {
      offset -= 26 * dt / 1000;
      normalize();
      apply();
    }
    rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);

  function stopVideo(video) {
    video.pause();
    video.controls = false;
    var card = video.closest('.tgc-vid-card');
    if (card) card.classList.remove('is-playing');
  }
  function closeCurrent() {
    if (io) { io.disconnect(); io = null; }
    if (current) { stopVideo(current); current = null; }
    section.classList.remove('is-manual');
  }
  function playVideo(card, video) {
    if (current && current !== video) stopVideo(current);
    if (io) { io.disconnect(); io = null; }
    current = video;
    card.classList.add('is-playing');
    section.classList.add('is-manual');
    video.controls = true;
    video.play();
    /* 재생 카드가 스와이프로 마퀴 영역 밖으로 완전히 나가면 자동 pause */
    io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (!entries[i].isIntersecting) closeCurrent();
      }
    }, { root: mq, threshold: 0 });
    io.observe(card);
  }

  track.addEventListener('click', function (e) {
    if (dragDist > 10) { dragDist = 0; return; } /* 드래그였으면 클릭 무시 */
    if (e.target.closest('.tgc-vid-close')) { closeCurrent(); return; }
    var card = e.target.closest('.tgc-vid-card');
    if (!card) return;
    if (card.classList.contains('is-playing')) return; /* 재생 중 카드는 video controls 에 맡김 */
    var video = card.querySelector('video');
    if (video) playVideo(card, video);
  });

  /* ended 는 버블링되지 않으므로 캡처 단계에서 위임 — 종료 시 자동 흐름 재개 */
  track.addEventListener('ended', function (e) {
    if (e.target === current) closeCurrent();
  }, true);

  /* 수동 이동 — 드래그 (터치/마우스 공통, Pointer Events) */
  function onDown(e) {
    /* 재생 중 카드의 video(기본 controls) 위에서 시작한 제스처는 통과 — 시크바 조작 보호 */
    if (e.target.closest && e.target.closest('.tgc-vid-card.is-playing video')) return;
    dragging = true;
    dragDist = 0;
    dragStartX = e.clientX;
    dragStartOffset = offset;
  }
  function onMove(e) {
    if (!dragging) return;
    var dx = e.clientX - dragStartX;
    if (Math.abs(dx) > dragDist) dragDist = Math.abs(dx);
    offset = dragStartOffset + dx;
    normalize();
    apply();
  }
  function onUp() { dragging = false; }
  mq.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);

  /* PC 좌우 화살표 (재생 중 표시) — 카드 1장 폭만큼 이동 */
  function nudge(dir) { offset += dir * 338; normalize(); apply(); }
  var prevBtn = document.getElementById('tgcVidPrev');
  var nextBtn = document.getElementById('tgcVidNext');
  if (prevBtn) prevBtn.addEventListener('click', function () { nudge(1); });
  if (nextBtn) nextBtn.addEventListener('click', function () { nudge(-1); });

  /* 언마운트 정리용 전역 훅 (React cleanup 에서 호출 후 no-op 교체 — delete 금지) */
  window.__tgcVidStop = function () {
    cancelAnimationFrame(rafId);
    if (io) { io.disconnect(); io = null; }
    if (current) { current.pause(); current = null; }
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
  };
})();
</script>`;

// ─── 히어로 섹션 (페이지 최상단 별도 컨테이너로 주입) ────────────────────────
//  · 원래 DETAIL_HTML 맨 앞에 있던 .tgc-hero 를 분리한 것. 카피만 교체하고
//    배지 / 메인·서브카피 / 숫자 3종 구조는 그대로 유지한다.
//  · 등장 효과는 이 블록이 자체 IntersectionObserver 로 처리한다.
//    (DETAIL_HTML 의 전역 .tgc-fade-up 옵저버에 의존하지 않도록 독립시킴)
//  · fail-safe: 스크립트가 실행되지 않으면 .is-anim 이 안 붙어 카피가 그냥 보인다.
const HERO_SECTION_HTML = `<style>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

.tgc-hero {
  font-family: 'Pretendard', sans-serif;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  padding: 80px 20px 64px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.tgc-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('https://cdn.imweb.me/thumbnail/20250526/954205d44af9d.png') center/cover;
  opacity: 0.15;
}

.tgc-hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
}

/* 애니메이션 기본 설정 */
.tgc-fade-up {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.tgc-fade-up.visible {
  opacity: 1;
  transform: translateY(0);
}

/* fail-safe: JS 가 .is-anim 을 붙였을 때만 숨김 시작점을 켠다 */
.tgc-hero .tgc-fade-up { opacity: 1; transform: none; }
.tgc-hero.is-anim .tgc-fade-up { opacity: 0; transform: translateY(30px); }
.tgc-hero.is-anim .tgc-fade-up.visible { opacity: 1; transform: translateY(0); }

/* 순차 딜레이 */
.tgc-delay-1 { transition-delay: 0.1s; }
.tgc-delay-2 { transition-delay: 0.3s; }
.tgc-delay-3 { transition-delay: 0.5s; }
.tgc-delay-4 { transition-delay: 0.7s; }
.tgc-delay-5 { transition-delay: 0.9s; }

.tgc-hero-badge {
  display: inline-block;
  background: #4CAF50;
  color: white;
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 30px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
  50% { transform: scale(1.05); box-shadow: 0 0 20px 5px rgba(76, 175, 80, 0.2); }
}

.tgc-hero h1 {
  color: #ffffff;
  font-size: 42px;
  font-weight: 800;
  line-height: 1.35;
  margin-bottom: 20px;
  word-break: keep-all;
}

/* 4단계 흐름 줄 — 본문보다 한 단계 작게 잡아 800px 안에서 한 줄로 떨어지게 */
.tgc-hero-steps {
  display: block;
  font-size: 28px;
  line-height: 1.45;
  margin-bottom: 6px;
}

/* 단계와 화살표를 한 덩어리로 묶어 "→" 가 줄 첫머리에 홀로 떨어지지 않게 한다 */
.tgc-hero-step { white-space: nowrap; }

.tgc-hero-step em {
  font-style: normal;
  color: #4CAF50;
  margin: 0 2px;
}

/* 좁은 화면에서만 4단계를 2줄로 끊는 줄바꿈.
   한 줄로 들어가지 않는 폭(≈900px 이하)부터 켜서 어중간한 자동 줄바꿈을 막는다. */
.tgc-hero-br-m { display: none; }

@media (max-width: 900px) {
  .tgc-hero-br-m { display: inline; }
}

/* 모바일에서 둘째 줄이 "갑니다." 만 남지 않게 끊는 줄바꿈 */
.tgc-hero-br-m2 { display: none; }

.tgc-hero-accent { color: #4CAF50; }

.tgc-hero-sub {
  color: #b0b0b0;
  font-size: 18px;
  line-height: 1.8;
  margin-bottom: 0;
}

.tgc-hero-trust {
  margin-top: 44px;
  display: flex;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.tgc-hero-trust-item {
  color: #888;
  font-size: 14px;
}

.tgc-hero-trust-item strong {
  color: #4CAF50;
  font-size: 28px;
  display: block;
  margin-bottom: 5px;
  font-weight: 800;
}

.tgc-hero-trust-item .count-num {
  display: inline-block;
}

/* 아래 영상 후기로 시선을 넘기는 연결 문장 */
.tgc-hero-next {
  margin-top: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.tgc-hero-next-text {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: #cfcfcf;
  letter-spacing: -0.01em;
}

/* fail-safe: 화살표는 기본 상태에서 이미 보인다. 애니메이션은 위치만 흔든다 */
.tgc-hero-next-arrow {
  width: 22px;
  height: 22px;
  color: #4CAF50;
  opacity: 0.9;
  animation: tgcHeroNudge 1.8s ease-in-out infinite;
}

@keyframes tgcHeroNudge {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}

@media (prefers-reduced-motion: reduce) {
  .tgc-hero-next-arrow { animation: none; }
  .tgc-hero-badge { animation: none; }
}

@media (max-width: 768px) {
  .tgc-hero { padding: 56px 20px 48px; }
  .tgc-hero h1 { font-size: 24px; margin-bottom: 16px; }
  .tgc-hero-steps { font-size: 20px; margin-bottom: 4px; }
  .tgc-hero-br-m2 { display: inline; }
  .tgc-hero-sub { font-size: 15px; }
  .tgc-hero-trust { margin-top: 36px; gap: 20px; }
  .tgc-hero-trust-item strong { font-size: 24px; }
  .tgc-hero-next { margin-top: 36px; }
  .tgc-hero-next-text { font-size: 14px; }
}
</style>

<section class="tgc-hero">
  <div class="tgc-hero-content">
    <div class="tgc-hero-badge tgc-fade-up tgc-delay-1">헬스장 · 필라테스 창업 전문</div>

    <h1 class="tgc-fade-up tgc-delay-2">
      <span class="tgc-hero-steps"><span class="tgc-hero-step">입지 분석 <em>→</em></span> <span class="tgc-hero-step">인테리어 <em>→</em></span> <br class="tgc-hero-br-m"><span class="tgc-hero-step">프리세일 <em>→</em></span> <span class="tgc-hero-step">운영 세팅.</span></span>
      창업의 4단계를<br class="tgc-hero-br-m2"> <span class="tgc-hero-accent">한 팀</span>이 끝까지 갑니다.
    </h1>

    <p class="tgc-hero-sub tgc-fade-up tgc-delay-3">
      단계마다 업체를 바꿔가며 소모되지 않도록,<br>
      처음부터 끝까지 같은 팀이 책임집니다.
    </p>

    <div class="tgc-hero-trust tgc-fade-up tgc-delay-4">
      <div class="tgc-hero-trust-item">
        <strong><span class="count-num" data-target="200">0</span>+</strong>
        오픈 센터
      </div>
      <div class="tgc-hero-trust-item">
        <strong><span class="count-num" data-target="12">0</span>년</strong>
        업력
      </div>
      <div class="tgc-hero-trust-item">
        <strong><span class="count-num" data-target="250">0</span>건+</strong>
        인테리어 시공
      </div>
    </div>

    <div class="tgc-hero-next tgc-fade-up tgc-delay-5">
      <p class="tgc-hero-next-text">저희와 함께한 대표님들을 확인해보세요</p>
      <svg class="tgc-hero-next-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 5v13"></path>
        <path d="M6 13l6 6 6-6"></path>
      </svg>
    </div>
  </div>
</section>

<script>
(function () {
  var hero = document.querySelector('.tgc-hero');
  if (!hero) return;

  /* IntersectionObserver 가 없으면 등장 효과 없이 그대로 보여준다 (fail-safe) */
  if (typeof IntersectionObserver === 'undefined') return;

  /* JS 가 여기까지 온 경우에만 숨김 시작점을 켠다 */
  hero.classList.add('is-anim');

  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) entries[i].target.classList.add('visible');
    }
  }, { threshold: 0.1 });

  var els = hero.querySelectorAll('.tgc-fade-up');
  for (var j = 0; j < els.length; j++) io.observe(els[j]);

  /* 언마운트 정리용 전역 훅 (React cleanup 에서 호출 후 no-op 교체 — delete 금지) */
  window.__tgcHeroStop = function () { io.disconnect(); };
})();
</script>`;

// ─── 상세정보 HTML ───────────────────────────────────────────────────────────
// 아임웹용 7개 섹션 HTML(+<style>+<script>) 전체를 이 백틱 문자열 안에 그대로 붙여넣으세요.
//
// 붙여넣기 주의:
//  - 백틱( ` ) 과 ${ 두 가지만 \` , \${ 로 이스케이프하면 됩니다. (그 외엔 손댈 필요 없음)
//  - <style>, <script>, 인라인 onclick="toggleFaq(this)" 등은 그대로 둬도
//    아래 useEffect 가 동작하게 처리합니다.
//  - 중복 id(예: consulting-form 2개)는 런타임에 자동으로 -2, -3 … 접미사를 붙여
//    충돌을 방지하므로 직접 고칠 필요 없습니다.
const DETAIL_HTML = `
<script>
(function() {
  // 페이드업 애니메이션
  const fadeElements = document.querySelectorAll('.tgc-fade-up');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });
  
  fadeElements.forEach(el => observer.observe(el));
  
  // 숫자 카운트업 애니메이션
  const countElements = document.querySelectorAll('.count-num');
  let counted = false;
  
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !counted) {
        counted = true;
        countElements.forEach(el => {
          const target = parseInt(el.getAttribute('data-target'));
          const duration = 2000;
          const step = target / (duration / 16);
          let current = 0;
          
          const updateCount = () => {
            current += step;
            if (current < target) {
              el.textContent = Math.floor(current);
              requestAnimationFrame(updateCount);
            } else {
              el.textContent = target;
            }
          };
          
          setTimeout(updateCount, 900); // 다른 애니메이션 후 시작
        });
      }
    });
  }, { threshold: 0.5 });
  
  if (countElements.length > 0) {
    countObserver.observe(countElements[0].closest('.tgc-hero-trust'));
  }
})();
</script><style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Playfair+Display:wght@600;700&display=swap');

.gw-reveal{opacity:0;transform:translateY(40px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)}
.gw-reveal.is-visible{opacity:1;transform:translateY(0)}
.gw-reveal-d1{transition-delay:.12s}.gw-reveal-d2{transition-delay:.24s}.gw-reveal-d3{transition-delay:.36s}

.gw-hero{width:100%;background:#fff;overflow:hidden;font-family:'Noto Sans KR',sans-serif}
.gw-hero-top{max-width:900px;margin:0 auto;padding:64px 20px 44px;text-align:center}

.gw-badge{display:inline-flex;align-items:center;gap:8px;background:#111;color:#fff;font-size:11px;font-weight:500;letter-spacing:2.5px;text-transform:uppercase;padding:9px 22px;border-radius:100px;margin-bottom:28px}
.gw-badge::before{content:'';width:6px;height:6px;background:#3B82F6;border-radius:50%;animation:gwPulse 2s ease-in-out infinite}
@keyframes gwPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(1.6)}}

.gw-hero-title{font-size:42px;font-weight:900;color:#0F172A;line-height:1.35;margin:0 0 14px;letter-spacing:-1.5px}
.gw-hero-title em{font-style:normal;background:linear-gradient(135deg,#2563EB,#3B82F6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.gw-hero-sub{font-size:16px;color:#94A3B8;font-weight:300;line-height:1.6;margin:0 0 48px}

.gw-counters{display:flex;justify-content:center;gap:20px}
.gw-ccard{flex:0 1 200px;background:#FAFBFC;border:1px solid #F1F5F9;border-radius:16px;padding:28px 16px 24px;text-align:center;position:relative;overflow:hidden;transition:transform .4s cubic-bezier(.16,1,.3,1),box-shadow .4s cubic-bezier(.16,1,.3,1)}
.gw-ccard::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;border-radius:16px 16px 0 0;opacity:0;transition:opacity .4s ease}
.gw-ccard:nth-child(1)::before{background:linear-gradient(90deg,#2563EB,#60A5FA)}
.gw-ccard:nth-child(2)::before{background:linear-gradient(90deg,#F59E0B,#FBBF24)}
.gw-ccard:nth-child(3)::before{background:linear-gradient(90deg,#10B981,#34D399)}
.gw-ccard:hover{transform:translateY(-6px);box-shadow:0 16px 40px rgba(0,0,0,.06)}
.gw-ccard:hover::before{opacity:1}
.gw-ccard-icon{font-size:20px;margin-bottom:12px}
.gw-ccard-num{font-family:'Playfair Display',serif;font-size:44px;font-weight:700;color:#0F172A;line-height:1;margin-bottom:2px}
.gw-ccard-unit{font-family:'Noto Sans KR',sans-serif;font-size:16px;font-weight:500;color:#94A3B8;margin-left:2px}
.gw-ccard-label{font-size:13px;color:#94A3B8;font-weight:400;margin-top:6px}

.gw-gallery{position:relative;padding:28px 0 0;-webkit-user-select:none;user-select:none;overflow:hidden;max-width:100%}
.gw-gallery::before,.gw-gallery::after{content:'';position:absolute;left:0;right:0;height:70px;z-index:2;pointer-events:none}
.gw-gallery::before{top:0;background:linear-gradient(to bottom,#fff,transparent)}
.gw-gallery::after{bottom:0;background:linear-gradient(to top,#fff,transparent)}
.gw-gfl,.gw-gfr{position:absolute;top:0;bottom:0;width:100px;z-index:3;pointer-events:none}
.gw-gfl{left:0;background:linear-gradient(to right,#fff,transparent)}
.gw-gfr{right:0;background:linear-gradient(to left,#fff,transparent)}

.gw-row{display:flex;width:max-content;gap:10px;margin-bottom:10px;cursor:grab}
.gw-row:active{cursor:grabbing}
.gw-row:last-child{margin-bottom:0}

.gw-row img{width:165px;height:165px;object-fit:cover;border-radius:12px;flex-shrink:0;transition:transform .5s cubic-bezier(.16,1,.3,1),filter .5s ease,box-shadow .5s ease;filter:brightness(.92) saturate(.95);pointer-events:none}
.gw-row img:hover{transform:scale(1.06);filter:brightness(1.05) saturate(1.1);box-shadow:0 8px 24px rgba(0,0,0,.12);z-index:1;position:relative}

@keyframes gwSL{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes gwSR{0%{transform:translateX(-50%)}100%{transform:translateX(0)}}
.gw-row.gw-l{animation:gwSL 38s linear infinite}
.gw-row.gw-r{animation:gwSR 38s linear infinite}
.gw-row.gw-dragging{animation-play-state:paused!important}
.gw-row:nth-child(3){animation-duration:44s}
.gw-row:nth-child(4){animation-duration:36s}
.gw-row:nth-child(5){animation-duration:48s}
.gw-row:nth-child(6){animation-duration:42s}
.gw-row:nth-child(7){animation-duration:34s}
.gw-row:nth-child(8){animation-duration:46s}
.gw-row:nth-child(9){animation-duration:40s}

@media(max-width:768px){
  .gw-hero-top{padding:44px 16px 32px}
  .gw-hero-title{font-size:26px;letter-spacing:-1px}
  .gw-hero-sub{font-size:14px;margin-bottom:32px}
  .gw-counters{gap:8px}
  .gw-ccard{flex:1 1 0;padding:20px 8px 18px;border-radius:12px}
  .gw-ccard-num{font-size:30px}.gw-ccard-unit{font-size:13px}.gw-ccard-label{font-size:11px}
  .gw-ccard-icon{font-size:16px;margin-bottom:8px}
  .gw-row img{width:130px;height:130px;border-radius:10px}
  .gw-row{gap:8px;margin-bottom:8px}
  .gw-gfl,.gw-gfr{width:40px}
}
</style>
  <div class="gw-gallery">
    <div class="gw-gfl"></div><div class="gw-gfr"></div>
    <div class="gw-row gw-l"><img src="https://cdn.imweb.me/thumbnail/20260224/7febfcc8985e2.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/147fe84156057.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/0c832ab248ce4.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/971ea42cfd8a8.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/16d3196b68f2e.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/e8eb94b6d52ff.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/050b276ee45d7.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/7febfcc8985e2.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/147fe84156057.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/0c832ab248ce4.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/971ea42cfd8a8.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/16d3196b68f2e.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/e8eb94b6d52ff.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/050b276ee45d7.png" alt="시공사례"></div>
    <div class="gw-row gw-r"><img src="https://cdn.imweb.me/thumbnail/20260224/7fddde5b80282.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/bdffa96015f92.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/429d83e687190.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/994f3e4444876.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/4a9b8cbefcace.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/d62ab4ed1c51e.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/bcb8f87ab7f88.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/7fddde5b80282.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/bdffa96015f92.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/429d83e687190.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/994f3e4444876.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/4a9b8cbefcace.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/d62ab4ed1c51e.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/bcb8f87ab7f88.png" alt="시공사례"></div>
    <div class="gw-row gw-l"><img src="https://cdn.imweb.me/thumbnail/20260224/dded8e6197f60.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/24150a19c2437.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/05fdbed8a415e.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/5a7016f66c8e7.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/5b6b3c8c692a6.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/c0ad9289bb4b3.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/a5225411385cf.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/dded8e6197f60.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/24150a19c2437.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/05fdbed8a415e.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/5a7016f66c8e7.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/5b6b3c8c692a6.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/c0ad9289bb4b3.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/a5225411385cf.png" alt="시공사례"></div>
    <div class="gw-row gw-r"><img src="https://cdn.imweb.me/thumbnail/20260224/e7ec9b6e8f936.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/d918cd70d9c08.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/48a5270a28abe.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/7855e31a685e9.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/e75529ae4fab7.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/425d8005700dd.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/bf3bf2aea61a1.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/e7ec9b6e8f936.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/d918cd70d9c08.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/48a5270a28abe.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/7855e31a685e9.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/e75529ae4fab7.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/425d8005700dd.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/bf3bf2aea61a1.png" alt="시공사례"></div>
    <div class="gw-row gw-l"><img src="https://cdn.imweb.me/thumbnail/20260224/b02205ae2e7da.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/543e8bd02106a.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/35a5086c05f11.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/e49fbb8f83360.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/ee0af39a17497.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/31d7a26b1bcf3.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/4e18b37fda8fc.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/b02205ae2e7da.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/543e8bd02106a.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/35a5086c05f11.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/e49fbb8f83360.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/ee0af39a17497.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/31d7a26b1bcf3.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/4e18b37fda8fc.png" alt="시공사례"></div>
    <div class="gw-row gw-r"><img src="https://cdn.imweb.me/thumbnail/20260224/8ff784baa524b.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/ce858defec5b3.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/13ef060b46ff4.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/ed2606eb9f936.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/6542da8356ba3.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/88d10aeb9e1fd.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/500c88fe40f06.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/8ff784baa524b.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/ce858defec5b3.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/13ef060b46ff4.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/ed2606eb9f936.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/6542da8356ba3.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/88d10aeb9e1fd.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/500c88fe40f06.png" alt="시공사례"></div>
    <div class="gw-row gw-l"><img src="https://cdn.imweb.me/thumbnail/20260224/fe2ba70d48273.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/ba9e88035d811.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/5985b8b2d6a41.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/31adc48935f10.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/7febfcc8985e2.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/147fe84156057.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/0c832ab248ce4.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/fe2ba70d48273.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/ba9e88035d811.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/5985b8b2d6a41.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/31adc48935f10.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/7febfcc8985e2.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/147fe84156057.png" alt="시공사례"><img src="https://cdn.imweb.me/thumbnail/20260224/0c832ab248ce4.png" alt="시공사례"></div>
  </div>
</div>

<script>
(function(){
  var obs=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting)e.target.classList.add('is-visible')})},{threshold:.15,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.gw-hero .gw-reveal').forEach(function(el){obs.observe(el)});

  function anim(el,t,d){var s=performance.now();(function f(n){var p=Math.min((n-s)/d,1);var e=p===1?1:1-Math.pow(2,-10*p);el.textContent=Math.round(e*t).toLocaleString();if(p<1)requestAnimationFrame(f)})(s)}
  var done=false;
  var co=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting&&!done){done=true;document.querySelectorAll('.gw-cnt').forEach(function(el){anim(el,parseInt(el.dataset.target,10),2200)})}})},{threshold:.3});
  var ca=document.querySelector('.gw-counters');if(ca)co.observe(ca);

  /* 터치/드래그 슬라이드 */
  document.querySelectorAll('.gw-row').forEach(function(row){
    var dragging=false,startX=0,base=0,offset=0;
    function getTX(){var m=(getComputedStyle(row).transform||'').match(/matrix.*\((.+)\)/);return m?parseFloat(m[1].split(',')[4])||0:0}
    function onS(e){dragging=true;row.classList.add('gw-dragging');startX=e.touches?e.touches[0].clientX:e.clientX;base=getTX();offset=0}
    function onM(e){if(!dragging)return;var x=e.touches?e.touches[0].clientX:e.clientX;offset=x-startX;row.style.transform='translateX('+(base+offset)+'px)'}
    function onE(){if(!dragging)return;dragging=false;row.style.transform='';row.classList.remove('gw-dragging')}
    row.addEventListener('mousedown',onS);
    window.addEventListener('mousemove',onM);
    window.addEventListener('mouseup',onE);
    row.addEventListener('touchstart',onS,{passive:true});
    row.addEventListener('touchmove',onM,{passive:true});
    row.addEventListener('touchend',onE);
  });
})();
</script><style>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

.tgc-empathy {
  font-family: 'Pretendard', sans-serif;
  background: #1a1a1a;
  padding: 96px 20px 80px;
  position: relative;
  overflow: hidden;
}

.tgc-empathy::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('https://cdn.imweb.me/thumbnail/20250324/842da7b3d40fb.jpg') center/cover;
  opacity: 0.2;
  transition: opacity 0.5s ease;
}

.tgc-empathy:hover::before {
  opacity: 0.25;
}

.tgc-empathy-inner {
  position: relative;
  z-index: 1;
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
}

/* 애니메이션 기본 */
.tgc-fade-up {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.tgc-fade-up.visible {
  opacity: 1;
  transform: translateY(0);
}

.tgc-delay-1 { transition-delay: 0.1s; }
.tgc-delay-2 { transition-delay: 0.3s; }
.tgc-delay-3 { transition-delay: 0.5s; }
.tgc-delay-4 { transition-delay: 0.7s; }

/* fail-safe: JS 가 동작하지 않으면 카피는 그냥 보인다.
   스크립트가 섹션에 .is-anim 을 붙였을 때만 숨김 → 등장(reveal) 효과가 걸린다. */
.tgc-empathy .tgc-fade-up { opacity: 1; transform: none; }
.tgc-empathy.is-anim .tgc-fade-up { opacity: 0; transform: translateY(30px); }
.tgc-empathy.is-anim .tgc-fade-up.visible { opacity: 1; transform: translateY(0); }
.tgc-empathy:not(.is-anim) .tgc-empathy-quote .typing-text { border-right: none; animation: none; }

/* 인용문 */
.tgc-empathy-quote {
  font-size: 24px;
  color: #4CAF50;
  font-weight: 600;
  margin-bottom: 20px;
  line-height: 1.5;
  position: relative;
  display: inline-block;
}

.tgc-empathy-quote::before,
.tgc-empathy-quote::after {
  content: '"';
  font-size: 40px;
  color: #4CAF50;
  opacity: 0.5;
  position: absolute;
  top: -10px;
}

.tgc-empathy-quote::before {
  left: -25px;
}

.tgc-empathy-quote::after {
  right: -25px;
}

/* 타이핑 효과용 */
.tgc-empathy-quote .typing-text {
  display: inline;
  border-right: 2px solid #4CAF50;
  animation: blink 0.8s infinite;
}

.tgc-empathy-quote.typed .typing-text {
  border-right: none;
}

@keyframes blink {
  0%, 50% { border-color: #4CAF50; }
  51%, 100% { border-color: transparent; }
}

.tgc-empathy-sub {
  font-size: 17px;
  color: #aaa;
  margin-bottom: 50px;
}

/* 문제점 박스 */
.tgc-empathy-problems {
  background: rgba(255,255,255,0.05);
  border-radius: 20px;
  padding: 40px 35px;
  margin-bottom: 50px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.1);
}

.tgc-empathy-problems p {
  color: #ccc;
  font-size: 18px;
  line-height: 1.8;
  margin-bottom: 30px;
}

.tgc-empathy-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
}

.tgc-empathy-list-item {
  display: flex;
  align-items: center;
  gap: 14px;
  color: #ff6b6b;
  font-size: 17px;
  padding: 12px 16px;
  background: rgba(255, 107, 107, 0.08);
  border-radius: 10px;
  border-left: 3px solid #ff6b6b;
  transition: all 0.5s ease;
}

/* fail-safe — 위와 동일: .is-anim 이 붙은 경우에만 숨겼다가 순차 등장 */
.tgc-empathy.is-anim .tgc-empathy-list-item {
  opacity: 0;
  transform: translateX(-30px);
}

.tgc-empathy.is-anim .tgc-empathy-list-item.visible {
  opacity: 1;
  transform: translateX(0);
}

.tgc-empathy-list-item:nth-child(1) { transition-delay: 0.2s; }
.tgc-empathy-list-item:nth-child(2) { transition-delay: 0.4s; }
.tgc-empathy-list-item:nth-child(3) { transition-delay: 0.6s; }

.tgc-empathy-list-item .x-icon {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  background: #ff6b6b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
  font-weight: 700;
}

.tgc-empathy-list-item.visible .x-icon {
  animation: shake 0.5s ease forwards;
  animation-delay: inherit;
}

@keyframes shake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-10deg); }
  75% { transform: rotate(10deg); }
}

/* 강조 블록 */
.tgc-empathy-conclusion {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  line-height: 1.7;
  margin-bottom: 44px;
}

.tgc-empathy-conclusion strong {
  color: #4CAF50;
  position: relative;
}

.tgc-empathy-conclusion strong::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: #4CAF50;
  transition: width 0.8s ease;
}

.tgc-empathy-conclusion.visible strong::after {
  width: 100%;
}

/* 전환부 */
.tgc-empathy-bridge {
  font-size: 17px;
  color: #aaa;
  line-height: 1.8;
  margin-bottom: 22px;
}

/* 하이라이트 박스 */
.tgc-empathy-highlight {
  background: linear-gradient(135deg, rgba(76,175,80,0.15) 0%, rgba(76,175,80,0.05) 100%);
  border: 2px solid #4CAF50;
  border-radius: 20px;
  padding: 40px 35px;
  position: relative;
  overflow: hidden;
}

.tgc-empathy-highlight::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(76,175,80,0.1) 0%, transparent 70%);
  animation: rotateBg 10s linear infinite;
}

@keyframes rotateBg {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.tgc-empathy-highlight h3 {
  position: relative;
  font-size: 28px;
  color: #fff;
  font-weight: 800;
  line-height: 1.5;
}

.tgc-empathy-highlight h3 .brand {
  color: #fff;
}

/* 강조는 '첫 성공' 한 곳에만 준다 */
.tgc-empathy-highlight h3 .success {
  position: relative;
  display: inline-block;
  color: #4CAF50;
}

.tgc-empathy-highlight h3 .success::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 0;
  width: 100%;
  height: 12px;
  background: rgba(76, 175, 80, 0.4);
  z-index: -1;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.6s ease;
}

.tgc-empathy-highlight.visible h3 .success::after {
  transform: scaleX(1);
}

@media (max-width: 768px) {
  .tgc-empathy { padding: 64px 20px 60px; }
  .tgc-empathy-quote { font-size: 18px; }
  .tgc-empathy-quote::before,
  .tgc-empathy-quote::after { font-size: 30px; top: -5px; }
  .tgc-empathy-quote::before { left: -18px; }
  .tgc-empathy-quote::after { right: -18px; }
  .tgc-empathy-problems { padding: 30px 20px; }
  .tgc-empathy-list-item { font-size: 15px; padding: 10px 14px; }
  .tgc-empathy-conclusion { font-size: 20px; margin-bottom: 36px; }
  .tgc-empathy-bridge { font-size: 15px; }
  .tgc-empathy-highlight { padding: 30px 25px; }
  .tgc-empathy-highlight h3 { font-size: 22px; }
}
</style>

<section class="tgc-empathy">
  <div class="tgc-empathy-inner">
    <p class="tgc-empathy-quote tgc-fade-up tgc-delay-1">
      <span class="typing-text">센터 차릴 때 자본만 있으면 <br>되는 거 아닌가요..</span>
    </p>

    <p class="tgc-empathy-sub tgc-fade-up tgc-delay-2">많은 대표님들이 처음엔 이렇게 말씀하십니다.</p>

    <div class="tgc-empathy-problems tgc-fade-up tgc-delay-3">
      <p>하지만 막상 문을 열고 나면,</p>

      <div class="tgc-empathy-list">
        <div class="tgc-empathy-list-item">
          <span class="x-icon">✕</span>
          <span>회원은 있는데 수익이 남지 않고</span>
        </div>
        <div class="tgc-empathy-list-item">
          <span class="x-icon">✕</span>
          <span>광고는 하는데 등록은 없고</span>
        </div>
        <div class="tgc-empathy-list-item">
          <span class="x-icon">✕</span>
          <span>직원은 있는데 방향이 없다는 걸 <br>느끼시죠.</span>
        </div>
      </div>
    </div>

    <p class="tgc-empathy-conclusion tgc-fade-up tgc-delay-4">
      이건 대표님의 능력 문제가 아닙니다.<br>
      <strong>창업 구조 자체가 잘못 설계된 경우</strong>가 대부분입니다.
    </p>

    <p class="tgc-empathy-bridge tgc-fade-up tgc-delay-4">
      저희는 그런 현실을 바꿔온 사람들입니다.
    </p>

    <div class="tgc-empathy-highlight tgc-fade-up">
      <h3>
        <span class="brand">더그로우컴퍼니</span>는 대표님의<br>
        첫 창업이 아니라 <br>'<span class="success">첫 성공</span>'을 만듭니다.
      </h3>
    </div>
  </div>
</section>

<script>
(function() {
  const section = document.querySelector('.tgc-empathy');
  if (!section) return;

  // JS 가 여기까지 왔을 때만 숨김 상태를 켠다 (fail-safe — 스크립트 미실행 시 기본 표시)
  section.classList.add('is-anim');

  const fadeElements = document.querySelectorAll('.tgc-empathy .tgc-fade-up');
  const listItems = document.querySelectorAll('.tgc-empathy-list-item');
  const conclusion = document.querySelector('.tgc-empathy-conclusion');
  const highlight = document.querySelector('.tgc-empathy-highlight');

  // IntersectionObserver 미지원 환경이면 등장 효과 없이 그대로 표시
  if (typeof IntersectionObserver === 'undefined') {
    section.classList.remove('is-anim');
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        // 문제점 리스트 아이템 순차 등장
        if (entry.target.classList.contains('tgc-empathy-problems')) {
          listItems.forEach((item, index) => {
            setTimeout(() => {
              item.classList.add('visible');
            }, 300 + (index * 250));
          });
        }
        
        // 인용문 타이핑 완료 효과
        if (entry.target.classList.contains('tgc-empathy-quote')) {
          setTimeout(() => {
            entry.target.classList.add('typed');
          }, 2000);
        }
      }
    });
  }, { threshold: 0.3 });
  
  fadeElements.forEach(el => observer.observe(el));
  
  // 결론 및 하이라이트 별도 관찰
  if (conclusion) observer.observe(conclusion);
  if (highlight) observer.observe(highlight);
})();
</script><style>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

.tgc-problem {
  font-family: 'Pretendard', sans-serif;
  background: #f8f9fa;
  /* 문제 카드 제거 후 솔루션 박스만 남아 상단 여백을 줄였다 */
  padding: 70px 20px 100px;
}

.tgc-problem-inner {
  max-width: 900px;
  margin: 0 auto;
}

/* 애니메이션 */
.tgc-fade-up {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.tgc-fade-up.visible {
  opacity: 1;
  transform: translateY(0);
}

.tgc-delay-1 { transition-delay: 0.1s; }
.tgc-delay-2 { transition-delay: 0.3s; }
.tgc-delay-3 { transition-delay: 0.5s; }

.tgc-solution {
  background: linear-gradient(135deg, #4CAF50 0%, #2e7d32 100%);
  border-radius: 28px;
  padding: 55px 45px;
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: scale(0.95);
  transition: all 0.8s ease;
}

.tgc-solution.visible {
  opacity: 1;
  transform: scale(1);
}

.tgc-solution::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%);
  animation: solutionGlow 8s linear infinite;
}

@keyframes solutionGlow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.tgc-solution-badge {
  display: inline-block;
  background: rgba(255,255,255,0.2);
  padding: 8px 20px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 20px;
  position: relative;
}

.tgc-solution h3 {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 18px;
  position: relative;
}

.tgc-solution-sub {
  font-size: 18px;
  opacity: 0.95;
  margin-bottom: 35px;
  line-height: 1.7;
  position: relative;
}

.tgc-solution-features {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  position: relative;
}

.tgc-solution-feature {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,0.2);
  padding: 14px 26px;
  border-radius: 50px;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: default;
  opacity: 0;
  transform: translateY(20px);
}

.tgc-solution-feature.visible {
  opacity: 1;
  transform: translateY(0);
}

.tgc-solution-feature:nth-child(1) { transition-delay: 0.3s; }
.tgc-solution-feature:nth-child(2) { transition-delay: 0.45s; }
.tgc-solution-feature:nth-child(3) { transition-delay: 0.6s; }

.tgc-solution-feature:hover {
  background: rgba(255,255,255,0.35);
  transform: translateY(-3px);
}

.tgc-solution-feature svg {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.tgc-solution-feature .check-circle {
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tgc-solution-feature .check-circle svg {
  width: 14px;
  height: 14px;
  fill: #4CAF50;
}

@media (max-width: 768px) {
  .tgc-problem { padding: 50px 20px 70px; }
  .tgc-solution { padding: 40px 25px; border-radius: 20px; }
  .tgc-solution h3 { font-size: 24px; }
  .tgc-solution-sub { font-size: 16px; }
  .tgc-solution-features { gap: 12px; }
  .tgc-solution-feature { padding: 12px 20px; font-size: 14px; }
}
</style>

<section class="tgc-problem">
  <div class="tgc-problem-inner">
    <div class="tgc-solution" id="solutionBox">
      <span class="tgc-solution-badge">💡 더그로우는 어떤 곳이길래?</span>
      <h3>저희는 이렇게 창업을 도와드립니다.</h3>
      <p class="tgc-solution-sub">
        '예쁜 센터'를 만드는 회사가 아닙니다.<br>
        오픈 전부터 오픈 이후까지 대표님의 안정적인 <br><strong>운영 구조</strong>를 설계합니다.
      </p>
      
      <div class="tgc-solution-features" id="solutionFeatures">
        <div class="tgc-solution-feature">
          <span class="check-circle">
            <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          </span>
          입지 선정부터
        </div>
        <div class="tgc-solution-feature">
          <span class="check-circle">
            <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          </span>
          프리세일(회원모집) 설계
        </div>
        <div class="tgc-solution-feature">
          <span class="check-circle">
            <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          </span>
          오픈 이후 운영까지
        </div>
      </div>
    </div>
  </div>
</section>

<script>
(function() {
  const fadeElements = document.querySelectorAll('.tgc-problem .tgc-fade-up');
  const solutionBox = document.getElementById('solutionBox');
  const solutionFeatures = document.querySelectorAll('.tgc-solution-feature');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.2 });
  
  fadeElements.forEach(el => observer.observe(el));
  
  // 솔루션 박스 관찰
  const solutionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        // 피처 순차 등장
        solutionFeatures.forEach((feature, index) => {
          setTimeout(() => {
            feature.classList.add('visible');
          }, 400 + (index * 150));
        });
      }
    });
  }, { threshold: 0.4 });
  
  if (solutionBox) {
    solutionObserver.observe(solutionBox);
  }
})();
</script><style>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

.tgc-process {
  font-family: 'Pretendard', sans-serif;
  background: #fff;
  padding: 100px 20px;
}

.tgc-process-inner {
  max-width: 1000px;
  margin: 0 auto;
}

/* 애니메이션 */
.tgc-fade-up {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.tgc-fade-up.visible {
  opacity: 1;
  transform: translateY(0);
}

.tgc-process-header {
  text-align: center;
  margin-bottom: 70px;
}

.tgc-process-badge {
  display: inline-block;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  color: #2e7d32;
  padding: 10px 24px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 20px;
}

.tgc-process h2 {
  font-size: 34px;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 15px;
}

.tgc-process h2 .green {
  color: #4CAF50;
  position: relative;
}

.tgc-process-subtitle {
  font-size: 17px;
  color: #666;
}

/* 타임라인 */
.tgc-process-timeline {
  position: relative;
}

/* 연결선 */
.tgc-process-timeline::before {
  content: '';
  position: absolute;
  left: 40px;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, #4CAF50 0%, #81c784 50%, #c8e6c9 100%);
  border-radius: 3px;
}

.tgc-process-step {
  display: flex;
  gap: 35px;
  position: relative;
  padding-bottom: 60px;
  opacity: 0;
  transform: translateX(-30px);
  transition: all 0.8s ease;
}

.tgc-process-step.visible {
  opacity: 1;
  transform: translateX(0);
}

.tgc-process-step:last-child {
  padding-bottom: 0;
}

/* 스텝 넘버 */
.tgc-process-number {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #4CAF50 0%, #2e7d32 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
  font-weight: 800;
  box-shadow: 0 8px 25px rgba(76,175,80,0.35);
  position: relative;
  z-index: 2;
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}

.tgc-process-step:hover .tgc-process-number {
  transform: scale(1.1);
  box-shadow: 0 12px 35px rgba(76,175,80,0.45);
}

.tgc-process-step.visible .tgc-process-number {
  animation: numberPop 0.6s ease forwards;
}

@keyframes numberPop {
  0% { transform: scale(0); }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); }
}

/* 콘텐츠 */
.tgc-process-content {
  flex: 1;
  background: #f8f9fa;
  border-radius: 20px;
  padding: 35px;
  border: 2px solid #e9ecef;
  transition: all 0.4s ease;
}

.tgc-process-step:hover .tgc-process-content {
  border-color: #4CAF50;
  box-shadow: 0 8px 30px rgba(76,175,80,0.1);
}

.tgc-process-step-badge {
  display: inline-block;
  background: #4CAF50;
  color: white;
  padding: 6px 16px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 15px;
}

.tgc-process-content h4 {
  font-size: 24px;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 12px;
}

.tgc-process-content > p {
  font-size: 16px;
  color: #666;
  line-height: 1.8;
  margin-bottom: 25px;
}

.tgc-process-content > p strong {
  color: #2e7d32;
}

/* 이미지 슬라이더 */
.tgc-process-images {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 5px 0 15px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.tgc-process-images::-webkit-scrollbar {
  height: 6px;
}

.tgc-process-images::-webkit-scrollbar-track {
  background: #e9ecef;
  border-radius: 3px;
}

.tgc-process-images::-webkit-scrollbar-thumb {
  background: #4CAF50;
  border-radius: 3px;
}

.tgc-process-img {
  flex-shrink: 0;
  width: 180px;
  height: 135px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  scroll-snap-align: start;
  position: relative;
}

.tgc-process-img::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.3) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.tgc-process-img:hover::after {
  opacity: 1;
}

.tgc-process-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.tgc-process-img:hover img {
  transform: scale(1.1);
}

/* 키포인트 */
.tgc-process-keypoints {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.tgc-process-keypoint {
  display: flex;
  align-items: center;
  gap: 6px;
  background: white;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  color: #333;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.tgc-process-keypoint:hover {
  border-color: #4CAF50;
  background: #f1f8e9;
}

.tgc-process-keypoint svg {
  width: 16px;
  height: 16px;
  fill: #4CAF50;
}

@media (max-width: 768px) {
  .tgc-process { padding: 70px 20px; }
  .tgc-process h2 { font-size: 26px; }
  .tgc-process-timeline::before { left: 25px; }
  .tgc-process-step { gap: 20px; flex-direction: column; }
  .tgc-process-number { width: 50px; height: 50px; font-size: 20px; }
  .tgc-process-content { padding: 25px 20px; }
  .tgc-process-content h4 { font-size: 20px; }
  .tgc-process-img { width: 150px; height: 110px; }
}
</style>

<section class="tgc-process">
  <div class="tgc-process-inner">
    <div class="tgc-process-header tgc-fade-up">
      <span class="tgc-process-badge">🚀 A to Z 창업 솔루션</span>
      <h2>더그로우 <span class="green">창업 진행 구조</span></h2>
      <p class="tgc-process-subtitle">단계별로 함께 설계하고, 함께 실행합니다.</p>
    </div>
    
    <div class="tgc-process-timeline" id="processTimeline">
      <!-- STEP 1 -->
      <div class="tgc-process-step">
        <div class="tgc-process-number">1</div>
        <div class="tgc-process-content">
          <span class="tgc-process-step-badge">입지 · 상권</span>
          <h4>입지 선정 & 상권 분석</h4>
          <p>
            감이 아니라 <strong>실제 데이터로 판단</strong>합니다.<br>
            유동인구, 경쟁 센터 분석, 상권 수요까지<br>
            대표님과 함께 직접 발로 뛰며<br> "사람이 오는 자리"를 찾습니다.
          </p>
          <div class="tgc-process-images">
            <div class="tgc-process-img"><img src="https://cdn.imweb.me/thumbnail/20241213/3fe6ca005fb28.jpg" alt="입지선정"></div>
            <div class="tgc-process-img"><img src="https://cdn.imweb.me/thumbnail/20241213/6aeda0e2f50ad.jpg" alt="입지선정"></div>
            <div class="tgc-process-img"><img src="https://cdn.imweb.me/thumbnail/20241213/badee82e80f1a.jpg" alt="입지선정"></div>
            <div class="tgc-process-img"><img src="https://cdn.imweb.me/thumbnail/20241210/a6e88ac28e29b.png" alt="상권분석"></div>
          </div>
          <div class="tgc-process-keypoints">
            <span class="tgc-process-keypoint">
              <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              유동인구 분석
            </span>
            <span class="tgc-process-keypoint">
              <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              경쟁 센터 조사
            </span>
            <span class="tgc-process-keypoint">
              <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              부동산 계약 동행
            </span>
          </div>
        </div>
      </div>
      
      <!-- STEP 2 -->
      <div class="tgc-process-step">
        <div class="tgc-process-number">2</div>
        <div class="tgc-process-content">
          <span class="tgc-process-step-badge">인테리어 · 동선</span>
          <h4>인테리어 & 동선 설계</h4>
          <p>
            예쁜 공간이 아니라 <br><strong>매출이 나오는 구조</strong>로 설계합니다.<br>
            기구 배치, 동선, 상담 흐름까지 고려한<br>
            전속 인테리어 팀이 250건 이상의 <br>시공 경험으로 진행합니다.
          </p>
          <div class="tgc-process-images">
            <div class="tgc-process-img"><img src="https://cdn.imweb.me/thumbnail/20250324/640d2ed2ca7b9.jpg" alt="공실체크"></div>
            <div class="tgc-process-img"><img src="https://cdn.imweb.me/thumbnail/20250324/cea8d7cee6be9.jpg" alt="공실체크"></div>
            <div class="tgc-process-img"><img src="https://cdn.imweb.me/thumbnail/20250324/3a1f8666a4fb7.png" alt="인테리어"></div>
            <div class="tgc-process-img"><img src="https://cdn.imweb.me/thumbnail/20250324/74d515a717030.png" alt="인테리어"></div>
            <div class="tgc-process-img"><img src="https://cdn.imweb.me/thumbnail/20250324/0b1ee7ed0fd10.png" alt="인테리어"></div>
          </div>
          <div class="tgc-process-keypoints">
            <span class="tgc-process-keypoint">
              <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              250건+ 시공 경험
            </span>
            <span class="tgc-process-keypoint">
              <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              매출 동선 설계
            </span>
            <span class="tgc-process-keypoint">
              <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              전속 인테리어 팀
            </span>
          </div>
        </div>
      </div>
      
      <!-- STEP 3 -->
      <div class="tgc-process-step">
        <div class="tgc-process-number">3</div>
        <div class="tgc-process-content">
          <span class="tgc-process-step-badge">프리세일 · 마케팅</span>
          <h4>프리세일 구조 설계</h4>
          <p>
            "홍보만 한다"가 아닙니다.<br>
            가격, 패키지, 상담 구조까지 <br><strong>프리세일이 되도록 설계</strong>합니다.<br>
            오픈 전 매출을 만들어 안정적인 <br>시작을 돕습니다.
          </p>
          <div class="tgc-process-images">
            <div class="tgc-process-img"><img src="https://cdn.imweb.me/thumbnail/20241213/482325a2e8663.jpg" alt="프리세일"></div>
            <div class="tgc-process-img"><img src="https://cdn.imweb.me/thumbnail/20241213/843a99b2d1a79.jpg" alt="프리세일"></div>
            <div class="tgc-process-img"><img src="https://cdn.imweb.me/thumbnail/20241213/f959517e5bef7.jpg" alt="프리세일"></div>
            <div class="tgc-process-img"><img src="https://cdn.imweb.me/thumbnail/20241213/b1a51a9fa48e8.jpg" alt="프리세일"></div>
          </div>
          <div class="tgc-process-keypoints">
            <span class="tgc-process-keypoint">
              <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              가격 전략 설계
            </span>
            <span class="tgc-process-keypoint">
              <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              오픈 전 매출 확보
            </span>
            <span class="tgc-process-keypoint">
              <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              온/오프라인 홍보
            </span>
          </div>
        </div>
      </div>
      
      <!-- STEP 4 -->
      <div class="tgc-process-step">
        <div class="tgc-process-number">4</div>
        <div class="tgc-process-content">
          <span class="tgc-process-step-badge">운영 · 교육</span>
          <h4>오픈 후 운영 시스템 구축</h4>
          <p>
            회원 관리, 상담, 매출, 직원 관리까지<br>
            <strong>대표가 없어도 돌아가는 구조</strong>를 만듭니다.<br>
            12년간 누적된 운영 노하우와 시스템을 <br>그대로 전수합니다.
          </p>
          <div class="tgc-process-images">
            <div class="tgc-process-img"><img src="https://cdn.imweb.me/thumbnail/20250324/57d1714abddb9.jpg" alt="교육"></div>
            <div class="tgc-process-img"><img src="https://cdn.imweb.me/thumbnail/20250324/f37752fb9163d.jpg" alt="교육"></div>
            <div class="tgc-process-img"><img src="https://cdn.imweb.me/thumbnail/20250521/500f95efeaef2.png" alt="운영시스템"></div>
            <div class="tgc-process-img"><img src="https://cdn.imweb.me/thumbnail/20250521/8ae1bcb22d1ee.png" alt="운영시스템"></div>
            <div class="tgc-process-img"><img src="https://cdn.imweb.me/thumbnail/20250324/3909d6c9fed57.jpg" alt="교육"></div>
          </div>
          <div class="tgc-process-keypoints">
            <span class="tgc-process-keypoint">
              <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              12년 운영 노하우
            </span>
            <span class="tgc-process-keypoint">
              <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              직원 교육 포함
            </span>
            <span class="tgc-process-keypoint">
              <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              회원관리 시스템
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<script>
(function() {
  const header = document.querySelector('.tgc-process-header');
  const steps = document.querySelectorAll('.tgc-process-step');
  
  // 헤더 관찰
  const headerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.3 });
  
  if (header) headerObserver.observe(header);
  
  // 스텝 순차 등장
  const stepObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 각 스텝에 순차 딜레이 적용
        const index = Array.from(steps).indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 200);
      }
    });
  }, { threshold: 0.2 });
  
  steps.forEach(step => stepObserver.observe(step));
})();
</script><!-- 섹션 7: 신뢰 증명 - 후기 및 대표 소개 -->
<style>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

.tgc-trust {
  font-family: 'Pretendard', sans-serif;
  background: linear-gradient(180deg, #f8f9fa 0%, #fff 100%);
  padding: 100px 20px;
}

.tgc-trust-inner {
  max-width: 1000px;
  margin: 0 auto;
}

/* 애니메이션 */
.tgc-fade-up {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.tgc-fade-up.visible {
  opacity: 1;
  transform: translateY(0);
}

/* 헤더 */
.tgc-trust-header {
  text-align: center;
  margin-bottom: 60px;
}

.tgc-trust-badge {
  display: inline-block;
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  color: #e65100;
  padding: 10px 24px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 20px;
}

.tgc-trust h2 {
  font-size: 34px;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 15px;
}

.tgc-trust h2 .highlight {
  color: #4CAF50;
  position: relative;
}

.tgc-trust-subtitle {
  font-size: 17px;
  color: #666;
  line-height: 1.7;
}

/* 통계 */
.tgc-trust-stats {
  display: flex;
  justify-content: center;
  gap: 50px;
  margin-bottom: 70px;
  flex-wrap: wrap;
}

.tgc-trust-stat {
  text-align: center;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease;
}

.tgc-trust-stat.visible {
  opacity: 1;
  transform: translateY(0);
}

.tgc-trust-stat:nth-child(1) { transition-delay: 0.1s; }
.tgc-trust-stat:nth-child(2) { transition-delay: 0.2s; }
.tgc-trust-stat:nth-child(3) { transition-delay: 0.3s; }

.tgc-trust-stat-num {
  font-size: 48px;
  font-weight: 800;
  color: #4CAF50;
  display: block;
  line-height: 1;
  margin-bottom: 8px;
}

.tgc-trust-stat-label {
  font-size: 15px;
  color: #666;
}

/* 텍스트 후기 카드 */
.tgc-trust-reviews {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 60px;
}

.tgc-review-card {
  background: #fff;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  border: 1px solid #e9ecef;
  position: relative;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.6s ease;
}

.tgc-review-card.visible {
  opacity: 1;
  transform: translateY(0);
}

.tgc-review-card:nth-child(1) { transition-delay: 0.1s; }
.tgc-review-card:nth-child(2) { transition-delay: 0.2s; }
.tgc-review-card:nth-child(3) { transition-delay: 0.3s; }
.tgc-review-card:nth-child(4) { transition-delay: 0.4s; }

.tgc-review-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 35px rgba(76,175,80,0.12);
  border-color: #4CAF50;
}

.tgc-review-card::before {
  content: '"';
  position: absolute;
  top: 20px;
  left: 25px;
  font-size: 60px;
  color: #4CAF50;
  opacity: 0.15;
  font-family: Georgia, serif;
  line-height: 1;
}

.tgc-review-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.tgc-review-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #4CAF50 0%, #81c784 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: 700;
}

.tgc-review-info h5 {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 3px;
}

.tgc-review-info span {
  font-size: 13px;
  color: #888;
}

.tgc-review-stars {
  display: flex;
  gap: 3px;
  margin-bottom: 12px;
}

.tgc-review-stars svg {
  width: 18px;
  height: 18px;
  fill: #ffc107;
}

.tgc-review-card p {
  font-size: 15px;
  color: #555;
  line-height: 1.8;
  position: relative;
  z-index: 1;
}

/* 카톡 후기 슬라이드 */
.tgc-kakao-section {
  margin-bottom: 60px;
}

.tgc-kakao-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.tgc-kakao-title::before {
  content: '💬';
  font-size: 24px;
}

.tgc-kakao-slider {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 10px 5px 20px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.tgc-kakao-slider::-webkit-scrollbar {
  height: 6px;
}

.tgc-kakao-slider::-webkit-scrollbar-track {
  background: #e9ecef;
  border-radius: 3px;
}

.tgc-kakao-slider::-webkit-scrollbar-thumb {
  background: #4CAF50;
  border-radius: 3px;
}

.tgc-kakao-item {
  flex-shrink: 0;
  width: 280px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  scroll-snap-align: start;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.tgc-kakao-item:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 12px 35px rgba(0,0,0,0.15);
}

.tgc-kakao-item img {
  width: 100%;
  height: auto;
  display: block;
}

/* 대표 소개 */
.tgc-ceo-section {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 28px;
  padding: 50px;
  display: flex;
  gap: 50px;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.tgc-ceo-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(76,175,80,0.15) 0%, transparent 70%);
  animation: ceoGlow 6s ease-in-out infinite;
}

@keyframes ceoGlow {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

.tgc-ceo-images {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  position: relative;
  z-index: 1;
}

.tgc-ceo-img {
  width: 140px;
  height: 140px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.5s ease;
}

.tgc-ceo-img.visible {
  opacity: 1;
  transform: scale(1);
}

.tgc-ceo-img:nth-child(1) { transition-delay: 0.1s; }
.tgc-ceo-img:nth-child(2) { transition-delay: 0.2s; }
.tgc-ceo-img:nth-child(3) { transition-delay: 0.3s; }
.tgc-ceo-img:nth-child(4) { transition-delay: 0.4s; }

.tgc-ceo-img:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 30px rgba(76,175,80,0.3);
}

.tgc-ceo-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.tgc-ceo-img:hover img {
  transform: scale(1.1);
}

.tgc-ceo-content {
  flex: 1;
  position: relative;
  z-index: 1;
}

.tgc-ceo-badge {
  display: inline-block;
  background: #4CAF50;
  color: white;
  padding: 8px 18px;
  border-radius: 50px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 20px;
}

.tgc-ceo-content h3 {
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 20px;
  line-height: 1.4;
}

.tgc-ceo-content h3 .green {
  color: #4CAF50;
}

.tgc-ceo-content p {
  font-size: 16px;
  color: #bbb;
  line-height: 1.9;
  margin-bottom: 25px;
}

.tgc-ceo-highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tgc-ceo-highlight {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(76,175,80,0.15);
  border: 1px solid rgba(76,175,80,0.3);
  padding: 10px 18px;
  border-radius: 50px;
  font-size: 14px;
  color: #81c784;
  transition: all 0.3s ease;
}

.tgc-ceo-highlight:hover {
  background: rgba(76,175,80,0.25);
  transform: translateY(-2px);
}

.tgc-ceo-highlight svg {
  width: 16px;
  height: 16px;
  fill: #4CAF50;
}

@media (max-width: 768px) {
  .tgc-trust { padding: 70px 20px; }
  .tgc-trust h2 { font-size: 26px; }
  .tgc-trust-stats { gap: 30px; }
  .tgc-trust-stat-num { font-size: 36px; }
  .tgc-trust-reviews { grid-template-columns: 1fr; }
  .tgc-review-card { padding: 25px; }
  .tgc-kakao-item { width: 240px; }
  .tgc-ceo-section { flex-direction: column; padding: 35px 25px; gap: 30px; }
  .tgc-ceo-images { grid-template-columns: repeat(4, 1fr); width: 100%; }
  .tgc-ceo-img { width: 100%; height: 80px; }
  .tgc-ceo-content h3 { font-size: 22px; }
  .tgc-ceo-content p { font-size: 15px; }
}
</style>

<section class="tgc-trust">
  <div class="tgc-trust-inner">
    <!-- 헤더 -->
    <div class="tgc-trust-header tgc-fade-up">
      <span class="tgc-trust-badge">⭐ 실제 대표님들의 이야기</span>
      <h2>더그로우와 함께한 <span class="highlight">성공 사례</span></h2>
      <p class="tgc-trust-subtitle">직접 경험하신 대표님들의 생생한 후기입니다.</p>
    </div>
    
    <!-- 통계 -->
    <div class="tgc-trust-stats" id="trustStats">
      <div class="tgc-trust-stat">
        <span class="tgc-trust-stat-num"><span class="count-num" data-target="200">0</span>+</span>
        <span class="tgc-trust-stat-label">오픈 센터</span>
      </div>
      <div class="tgc-trust-stat">
        <span class="tgc-trust-stat-num"><span class="count-num" data-target="98">0</span>%</span>
        <span class="tgc-trust-stat-label">고객 만족도</span>
      </div>
      <div class="tgc-trust-stat">
        <span class="tgc-trust-stat-num"><span class="count-num" data-target="12">0</span>년</span>
        <span class="tgc-trust-stat-label">업계 경력</span>
      </div>
    </div>
    
    <!-- 텍스트 후기 -->
    <div class="tgc-trust-reviews" id="reviewsGrid">
      <div class="tgc-review-card">
        <div class="tgc-review-header">
          <div class="tgc-review-avatar">김</div>
          <div class="tgc-review-info">
            <h5>김○○ 대표님</h5>
            <span>필라테스 · 경기 성남</span>
          </div>
        </div>
        <div class="tgc-review-stars">
          <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
        </div>
        <p>혼자 준비했으면 분명 실패했을 거예요. 입지 선정부터 인테리어, 프리세일까지 전부 함께 해주셔서 오픈 첫 달부터 안정적으로 시작했습니다.</p>
      </div>
      
      <div class="tgc-review-card">
        <div class="tgc-review-header">
          <div class="tgc-review-avatar">이</div>
          <div class="tgc-review-info">
            <h5>이○○ 대표님</h5>
            <span>헬스장 · 서울 강서</span>
          </div>
        </div>
        <div class="tgc-review-stars">
          <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
        </div>
        <p>프리세일 때 목표의 150%를 달성했어요. 가격 설계와 상담 구조를 미리 잡아주셔서 가능했던 것 같습니다. 정말 감사합니다.</p>
      </div>
      
      <div class="tgc-review-card">
        <div class="tgc-review-header">
          <div class="tgc-review-avatar">박</div>
          <div class="tgc-review-info">
            <h5>박○○ 대표님</h5>
            <span>필라테스 · 인천 송도</span>
          </div>
        </div>
        <div class="tgc-review-stars">
          <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
        </div>
        <p>운영 시스템을 만들어주셔서 지금은 제가 매장에 없어도 잘 돌아갑니다. 진짜 사업하는 느낌이에요.</p>
      </div>
      
      <div class="tgc-review-card">
        <div class="tgc-review-header">
          <div class="tgc-review-avatar">최</div>
          <div class="tgc-review-info">
            <h5>최○○ 대표님</h5>
            <span>헬스장 · 경기 수원</span>
          </div>
        </div>
        <div class="tgc-review-stars">
          <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
        </div>
        <p>인테리어 비용이 합리적인데 퀄리티는 최고였어요. 동선까지 고려한 설계 덕분에 상담 전환율이 정말 높습니다.</p>
      </div>
    </div>
    
    <!-- 카톡 후기 슬라이드 -->
    <div class="tgc-kakao-section tgc-fade-up">
      <h4 class="tgc-kakao-title">실시간 카톡 후기</h4>
      <div class="tgc-kakao-slider">
        <div class="tgc-kakao-item"><img src="/after/after%201%20.jpg" alt="카톡후기"></div>
        <div class="tgc-kakao-item"><img src="https://cdn.imweb.me/thumbnail/20250410/15074ccf15f4f.png" alt="카톡후기"></div>
        <div class="tgc-kakao-item"><img src="https://cdn.imweb.me/thumbnail/20250410/6c472bc288fca.png" alt="카톡후기"></div>
        <div class="tgc-kakao-item"><img src="https://cdn.imweb.me/thumbnail/20250410/c9a26f224753e.jpg" alt="카톡후기"></div>
        <div class="tgc-kakao-item"><img src="https://cdn.imweb.me/thumbnail/20250410/5f9b6a71b84af.jpg" alt="카톡후기"></div>
        <div class="tgc-kakao-item"><img src="https://cdn.imweb.me/thumbnail/20250410/a0aa9f04ac114.png" alt="카톡후기"></div>
      </div>
    </div>
    
    <!-- 대표 소개 -->
    <div class="tgc-ceo-section tgc-fade-up" id="ceoSection">
      <div class="tgc-ceo-images" id="ceoImages">
        <div class="tgc-ceo-img"><img src="https://cdn.imweb.me/thumbnail/20250324/842da7b3d40fb.jpg" alt="대표"></div>
        <div class="tgc-ceo-img"><img src="https://cdn.imweb.me/thumbnail/20250324/57d1714abddb9.jpg" alt="대표"></div>
        <div class="tgc-ceo-img"><img src="https://cdn.imweb.me/thumbnail/20250324/f37752fb9163d.jpg" alt="대표"></div>
        <div class="tgc-ceo-img"><img src="https://cdn.imweb.me/thumbnail/20250324/3909d6c9fed57.jpg" alt="대표"></div>
      </div>
      <div class="tgc-ceo-content">
        <span class="tgc-ceo-badge">더그로우컴퍼니 대표</span>
        <h3>12년간 <span class="green">200개 이상</span>의<br>센터를 함께 만들었습니다.</h3>
        <p>
          직접 센터를 운영해본 경험, <br>수백 개의 창업을 도운 경험,<br>
          그리고 실패와 성공을 모두 겪은 <br>현장의 노하우를 담아
          대표님의 첫 창업이 <br>'첫 성공'이 되도록 돕겠습니다.
        </p>
        <div class="tgc-ceo-highlights">
          <span class="tgc-ceo-highlight">
            <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            현장 경험 12년
          </span>
          <span class="tgc-ceo-highlight">
            <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            200+ 센터 오픈
          </span>
          <span class="tgc-ceo-highlight">
            <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            전속 인테리어팀 운영
          </span>
        </div>
      </div>
    </div>
  </div>
</section>

<script>
(function() {
  // 페이드업 관찰
  const fadeElements = document.querySelectorAll('.tgc-trust .tgc-fade-up');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.2 });
  
  fadeElements.forEach(el => observer.observe(el));
  
  // 통계 카운트업
  const stats = document.querySelectorAll('.tgc-trust-stat');
  const countElements = document.querySelectorAll('.tgc-trust-stats .count-num');
  let counted = false;
  
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !counted) {
        counted = true;
        
        // 통계 아이템 순차 등장
        stats.forEach((stat, index) => {
          setTimeout(() => {
            stat.classList.add('visible');
          }, index * 150);
        });
        
        // 숫자 카운트업
        setTimeout(() => {
          countElements.forEach(el => {
            const target = parseInt(el.getAttribute('data-target'));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            
            const updateCount = () => {
              current += step;
              if (current < target) {
                el.textContent = Math.floor(current);
                requestAnimationFrame(updateCount);
              } else {
                el.textContent = target;
              }
            };
            updateCount();
          });
        }, 300);
      }
    });
  }, { threshold: 0.5 });
  
  if (document.getElementById('trustStats')) {
    statsObserver.observe(document.getElementById('trustStats'));
  }
  
  // 후기 카드 순차 등장
  const reviewCards = document.querySelectorAll('.tgc-review-card');
  const reviewObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        reviewCards.forEach((card, index) => {
          setTimeout(() => {
            card.classList.add('visible');
          }, index * 150);
        });
      }
    });
  }, { threshold: 0.2 });
  
  if (document.getElementById('reviewsGrid')) {
    reviewObserver.observe(document.getElementById('reviewsGrid'));
  }
  
  // 대표 이미지 순차 등장
  const ceoImages = document.querySelectorAll('.tgc-ceo-img');
  const ceoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        ceoImages.forEach((img, index) => {
          setTimeout(() => {
            img.classList.add('visible');
          }, index * 120);
        });
      }
    });
  }, { threshold: 0.3 });
  
  if (document.getElementById('ceoSection')) {
    ceoObserver.observe(document.getElementById('ceoSection'));
  }
})();
</script><style>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

.tgc-faq {
  font-family: 'Pretendard', sans-serif;
  background: #fff;
  padding: 100px 20px;
}

.tgc-faq-inner {
  max-width: 800px;
  margin: 0 auto;
}

/* 애니메이션 */
.tgc-fade-up {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.tgc-fade-up.visible {
  opacity: 1;
  transform: translateY(0);
}

/* 헤더 */
.tgc-faq-header {
  text-align: center;
  margin-bottom: 50px;
}

.tgc-faq-badge {
  display: inline-block;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  color: #1565c0;
  padding: 10px 24px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 20px;
}

.tgc-faq h2 {
  font-size: 34px;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 15px;
}

.tgc-faq-subtitle {
  font-size: 17px;
  color: #666;
}

/* FAQ 아이템 */
.tgc-faq-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 70px;
}

.tgc-faq-item {
  background: #f8f9fa;
  border-radius: 16px;
  border: 2px solid #e9ecef;
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.tgc-faq-item.visible {
  opacity: 1;
  transform: translateY(0);
}

.tgc-faq-item:nth-child(1) { transition-delay: 0.1s; }
.tgc-faq-item:nth-child(2) { transition-delay: 0.2s; }
.tgc-faq-item:nth-child(3) { transition-delay: 0.3s; }
.tgc-faq-item:nth-child(4) { transition-delay: 0.4s; }
.tgc-faq-item:nth-child(5) { transition-delay: 0.5s; }

.tgc-faq-item:hover {
  border-color: #4CAF50;
}

.tgc-faq-item.active {
  border-color: #4CAF50;
  box-shadow: 0 8px 30px rgba(76,175,80,0.1);
}

.tgc-faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 25px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.tgc-faq-question:hover {
  background: rgba(76,175,80,0.03);
}

.tgc-faq-q-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.tgc-faq-q-badge {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #4CAF50 0%, #2e7d32 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 800;
}

.tgc-faq-q-text {
  font-size: 17px;
  font-weight: 600;
  color: #1a1a1a;
}

.tgc-faq-toggle {
  width: 36px;
  height: 36px;
  background: #e9ecef;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.tgc-faq-item.active .tgc-faq-toggle {
  background: #4CAF50;
  transform: rotate(180deg);
}

.tgc-faq-toggle svg {
  width: 20px;
  height: 20px;
  fill: #666;
  transition: fill 0.3s ease;
}

.tgc-faq-item.active .tgc-faq-toggle svg {
  fill: white;
}

.tgc-faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.4s ease, padding 0.4s ease;
}

.tgc-faq-item.active .tgc-faq-answer {
  max-height: 300px;
}

.tgc-faq-answer-inner {
  padding: 0 25px 25px 72px;
}

.tgc-faq-answer-inner p {
  font-size: 15px;
  color: #555;
  line-height: 1.8;
  background: white;
  padding: 20px;
  border-radius: 12px;
  border-left: 3px solid #4CAF50;
}

/* 선별 선언 */
.tgc-select {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 28px;
  padding: 60px 50px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.tgc-select::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234CAF50' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.tgc-select-content {
  position: relative;
  z-index: 1;
}

.tgc-select-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #4CAF50 0%, #2e7d32 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 30px;
  font-size: 36px;
  animation: iconFloat 3s ease-in-out infinite;
}

@keyframes iconFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.tgc-select h3 {
  font-size: 30px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 25px;
  line-height: 1.5;
}

.tgc-select h3 .green {
  color: #4CAF50;
}

.tgc-select-desc {
  font-size: 17px;
  color: #aaa;
  line-height: 1.9;
  margin-bottom: 40px;
}

.tgc-select-points {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.tgc-select-point {
  display: flex;
  align-items: center;
  gap: 10px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease;
}

.tgc-select-point.visible {
  opacity: 1;
  transform: translateY(0);
}

.tgc-select-point:nth-child(1) { transition-delay: 0.2s; }
.tgc-select-point:nth-child(2) { transition-delay: 0.4s; }
.tgc-select-point:nth-child(3) { transition-delay: 0.6s; }

.tgc-select-point-icon {
  width: 28px;
  height: 28px;
  background: rgba(76,175,80,0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tgc-select-point-icon svg {
  width: 16px;
  height: 16px;
  fill: #4CAF50;
}

.tgc-select-point span {
  font-size: 15px;
  color: #ccc;
  font-weight: 500;
}

.tgc-select-quote {
  background: rgba(76,175,80,0.1);
  border: 1px solid rgba(76,175,80,0.3);
  border-radius: 16px;
  padding: 25px 30px;
  max-width: 600px;
  margin: 0 auto;
}

.tgc-select-quote p {
  font-size: 18px;
  color: #81c784;
  font-weight: 600;
  line-height: 1.7;
  font-style: italic;
}

.tgc-select-quote p::before,
.tgc-select-quote p::after {
  content: '"';
  color: #4CAF50;
}

@media (max-width: 768px) {
  .tgc-faq { padding: 70px 20px; }
  .tgc-faq h2 { font-size: 26px; }
  .tgc-faq-question { padding: 18px 20px; }
  .tgc-faq-q-text { font-size: 15px; }
  .tgc-faq-answer-inner { padding: 0 20px 20px 20px; }
  .tgc-select { padding: 45px 25px; border-radius: 20px; }
  .tgc-select h3 { font-size: 22px; }
  .tgc-select-desc { font-size: 15px; }
  .tgc-select-points { gap: 15px; flex-direction: column; align-items: center; }
  .tgc-select-quote { padding: 20px; }
  .tgc-select-quote p { font-size: 16px; }
}
</style>

<section class="tgc-faq">
  <div class="tgc-faq-inner">
    <!-- 헤더 -->
    <div class="tgc-faq-header tgc-fade-up">
      <span class="tgc-faq-badge">❓ 자주 묻는 질문</span>
      <h2>궁금하신 점을 모았습니다</h2>
      <p class="tgc-faq-subtitle">상담 전 가장 많이 물어보시는 질문들입니다.</p>
    </div>
    
    <!-- FAQ 리스트 -->
    <div class="tgc-faq-list" id="faqList">
      <div class="tgc-faq-item">
        <div class="tgc-faq-question" onclick="toggleFaq(this)">
          <div class="tgc-faq-q-content">
            <span class="tgc-faq-q-badge">Q</span>
            <span class="tgc-faq-q-text">솔루션 비용은 어느 정도인가요?</span>
          </div>
          <div class="tgc-faq-toggle">
            <svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
          </div>
        </div>
        <div class="tgc-faq-answer">
          <div class="tgc-faq-answer-inner">
            <p>솔루션 비용은 센터 규모, 지역, 필요한 서비스 범위에 따라 달라집니다. 무료 상담을 통해 대표님의 상황을 파악한 뒤 정확한 견적을 안내드립니다. 투자 대비 확실한 결과를 약속드립니다.</p>
          </div>
        </div>
      </div>
      
      <div class="tgc-faq-item">
        <div class="tgc-faq-question" onclick="toggleFaq(this)">
          <div class="tgc-faq-q-content">
            <span class="tgc-faq-q-badge">Q</span>
            <span class="tgc-faq-q-text">지방에서도 솔루션 가능한가요?</span>
          </div>
          <div class="tgc-faq-toggle">
            <svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
          </div>
        </div>
        <div class="tgc-faq-answer">
          <div class="tgc-faq-answer-inner">
            <p>네, 전국 어디든 가능합니다. 이미 제주도, 부산, 대구, 광주 등 전국 각지에서 성공 사례를 만들어왔습니다. 입지 선정 시에는 직접 방문하여 함께 진행합니다.</p>
          </div>
        </div>
      </div>
      
      <div class="tgc-faq-item">
        <div class="tgc-faq-question" onclick="toggleFaq(this)">
          <div class="tgc-faq-q-content">
            <span class="tgc-faq-q-badge">Q</span>
            <span class="tgc-faq-q-text">창업 경험이 전혀 없는데 괜찮을까요?</span>
          </div>
          <div class="tgc-faq-toggle">
            <svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
          </div>
        </div>
        <div class="tgc-faq-answer">
          <div class="tgc-faq-answer-inner">
            <p>오히려 처음이신 분들이 더 좋습니다. 잘못된 습관 없이 처음부터 올바른 방향으로 시작할 수 있기 때문입니다. 저희가 A부터 Z까지 모든 과정을 함께합니다.</p>
          </div>
        </div>
      </div>
      
      <div class="tgc-faq-item">
        <div class="tgc-faq-question" onclick="toggleFaq(this)">
          <div class="tgc-faq-q-content">
            <span class="tgc-faq-q-badge">Q</span>
            <span class="tgc-faq-q-text">인테리어만 따로 맡길 수도 있나요?</span>
          </div>
          <div class="tgc-faq-toggle">
            <svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
          </div>
        </div>
        <div class="tgc-faq-answer">
          <div class="tgc-faq-answer-inner">
            <p>네, 인테리어만 진행하는 것도 가능합니다. 다만 저희는 '예쁜 인테리어'가 아닌 '매출이 나오는 인테리어'를 지향합니다. 단순 시공보다 운영까지 고려한 설계를 권장드립니다.</p>
          </div>
        </div>
      </div>
      
      <div class="tgc-faq-item">
        <div class="tgc-faq-question" onclick="toggleFaq(this)">
          <div class="tgc-faq-q-content">
            <span class="tgc-faq-q-badge">Q</span>
            <span class="tgc-faq-q-text">오픈 후에도 지원받을 수 있나요?</span>
          </div>
          <div class="tgc-faq-toggle">
            <svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
          </div>
        </div>
        <div class="tgc-faq-answer">
          <div class="tgc-faq-answer-inner">
            <p>물론입니다. 오픈 후 안정화 기간 동안 운영 점검, 매출 분석, 마케팅 조정 등을 지속적으로 지원합니다. 문제가 생기면 언제든 연락 주세요. 함께 해결합니다.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 창업 플랜 비교표 -->
    <style>
    .tgc-plan-wrap { font-family:'Pretendard',sans-serif; margin:64px 0 0; }
    .tgc-plan-head { text-align:center; margin-bottom:36px; }
    .tgc-plan-badge { display:inline-block; background:#009519; color:#fff; font-size:13px; font-weight:600; padding:7px 18px; border-radius:50px; margin-bottom:16px; }
    .tgc-plan-title { font-size:30px; font-weight:800; color:#1a1a1a; line-height:1.4; margin:0; }
    .tgc-plan-title .green { color:#009519; }
    .tgc-plan-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:20px; }
    .tgc-plan-card { background:#fff; border:2px solid #eee; border-radius:20px; padding:30px 26px; box-shadow:0 6px 30px rgba(0,0,0,0.05); transition:transform .3s ease, border-color .3s ease, box-shadow .3s ease; }
    .tgc-plan-card:hover { border-color:#009519; transform:translateY(-6px); box-shadow:0 14px 40px rgba(0,149,25,0.12); }
    .tgc-plan-card-head { display:flex; align-items:center; gap:12px; margin-bottom:24px; }
    .tgc-plan-accent { width:6px; height:38px; background:#009519; border-radius:3px; flex-shrink:0; }
    .tgc-plan-name { font-size:20px; font-weight:800; color:#1a1a1a; line-height:1.3; }
    .tgc-plan-size { display:inline-block; font-size:13px; font-weight:600; color:#009519; background:rgba(0,149,25,0.08); padding:3px 12px; border-radius:50px; margin-top:7px; }
    .tgc-plan-list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:13px; }
    .tgc-plan-list li { position:relative; padding-left:30px; font-size:15px; color:#333; line-height:1.6; }
    .tgc-plan-list li::before { content:'\\2713'; position:absolute; left:0; top:1px; width:20px; height:20px; line-height:20px; text-align:center; background:#009519; color:#fff; border-radius:50%; font-size:12px; font-weight:700; }
    .tgc-plan-list li.tgc-plan-strong { font-weight:700; color:#009519; }
    .tgc-plan-sub { display:block; font-size:13px; color:#777; font-weight:400; margin-top:4px; }
    .tgc-plan-list li.tgc-plan-bonus { background:rgba(0,149,25,0.08); border-radius:12px; padding:13px 14px 13px 38px; font-weight:700; color:#009519; }
    .tgc-plan-list li.tgc-plan-bonus::before { left:11px; top:13px; }
    @media (max-width:768px) {
      .tgc-plan-wrap { margin-top:48px; }
      .tgc-plan-grid { grid-template-columns:1fr; }
      .tgc-plan-title { font-size:22px; }
      .tgc-plan-card { padding:26px 20px; }
    }
    </style>

    <div class="tgc-plan-wrap">
      <div class="tgc-plan-head">
        <span class="tgc-plan-badge">PLAN</span>
        <h2 class="tgc-plan-title">규모에 맞춘 <span class="green">창업 플랜 비교</span></h2>
      </div>

      <div class="tgc-plan-grid">
        <!-- 왼쪽: 더그로우 창업솔루션 -->
        <div class="tgc-plan-card">
          <div class="tgc-plan-card-head">
            <span class="tgc-plan-accent"></span>
            <div>
              <div class="tgc-plan-name">더그로우 창업솔루션</div>
              <span class="tgc-plan-size">헬스장, 6:1 이상 필라테스 등</span>
            </div>
          </div>
          <ul class="tgc-plan-list">
            <li>입지선정 + 부동산계약</li>
            <li>사업자등록 절차 및 세무교육</li>
            <li>노무계약서 제공</li>
            <li>인테리어 비용 절감 (전속 인테리어팀)</li>
            <li>기구 B to B 계약 (저렴하게 구매 가능)</li>
            <li>오프라인 홍보 (전단지) 시안 폼 제공</li>
            <li>회원 계약서 폼 제공</li>
            <li>네이버·인스타그램·당근 온라인 세팅</li>
            <li class="tgc-plan-strong">그로우 운영시스템 교육 및 파일제공
              <span class="tgc-plan-sub">총 4회, 섹터맵 / 홍보일지 / 회원관리 / 상담방법 등</span>
            </li>
            <li>정부지원사업 연결</li>
            <li>렌탈 및 리스 연결</li>
            <li class="tgc-plan-bonus">오픈세일 / 직원 직접상주 2달</li>
          </ul>
        </div>

        <!-- 오른쪽: 소자본 창업솔루션 -->
        <div class="tgc-plan-card">
          <div class="tgc-plan-card-head">
            <span class="tgc-plan-accent"></span>
            <div>
              <div class="tgc-plan-name">소자본 창업솔루션</div>
              <span class="tgc-plan-size">1:1 피티샵, 개인·소그룹 필라테스 샵 등</span>
            </div>
          </div>
          <ul class="tgc-plan-list">
            <li>입지선정 + 부동산계약</li>
            <li>사업자등록 절차 및 세무교육</li>
            <li>노무계약서 제공</li>
            <li>인테리어 비용 절감 (전속 인테리어팀)</li>
            <li>기구 B to B 계약 (저렴하게 구매 가능)</li>
            <li>오프라인 홍보 (전단지) 시안 폼 제공</li>
            <li>회원 계약서 폼 제공</li>
            <li>네이버·인스타그램·당근 온라인 세팅</li>
            <li class="tgc-plan-strong">그로우 운영시스템 교육 및 파일제공
              <span class="tgc-plan-sub">총 4회, 섹터맵 / 홍보일지 / 회원관리 / 상담방법 등</span>
            </li>
            <li>정부지원사업 연결</li>
            <li>렌탈 및 리스 연결</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 선별 선언 -->
    <div class="tgc-select tgc-fade-up" id="selectSection">
      <div class="tgc-select-content">
        <div class="tgc-select-icon">🤝</div>
        
        <h3>더그로우는 모든 분과<br><span class="green">함께하지 않습니다.</span></h3>
        
        <p class="tgc-select-desc">
          저희는 '빨리 오픈'이 아니라 <br>'제대로 성공'을 목표로 합니다.<br>
          그래서 함께 성장할 수 있는 대표님만 <br>선별하여 진행합니다.
        </p>
        
        <div class="tgc-select-points" id="selectPoints">
          <div class="tgc-select-point">
            <div class="tgc-select-point-icon">
              <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </div>
            <span>진정성 있는 분</span>
          </div>
          <div class="tgc-select-point">
            <div class="tgc-select-point-icon">
              <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </div>
            <span>함께 노력할 준비가 된 분</span>
          </div>
          <div class="tgc-select-point">
            <div class="tgc-select-point-icon">
              <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </div>
            <span>장기적인 성공을 원하시는 분</span>
          </div>
        </div>
        
        <div class="tgc-select-quote">
          <p>단순히 센터를 <br>오픈해드리는 것이 아니라,<br>성공하는 사업가로 함께 성장합니다.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<script>
(function() {
  // 페이드업 관찰
  const fadeElements = document.querySelectorAll('.tgc-faq .tgc-fade-up');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.2 });
  
  fadeElements.forEach(el => observer.observe(el));
  
  // FAQ 아이템 순차 등장
  const faqItems = document.querySelectorAll('.tgc-faq-item');
  const faqObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        faqItems.forEach((item, index) => {
          setTimeout(() => {
            item.classList.add('visible');
          }, index * 100);
        });
      }
    });
  }, { threshold: 0.2 });
  
  if (document.getElementById('faqList')) {
    faqObserver.observe(document.getElementById('faqList'));
  }
  
  // 선별 포인트 순차 등장
  const selectPoints = document.querySelectorAll('.tgc-select-point');
  const selectObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        selectPoints.forEach((point, index) => {
          setTimeout(() => {
            point.classList.add('visible');
          }, 300 + (index * 200));
        });
      }
    });
  }, { threshold: 0.3 });
  
  if (document.getElementById('selectSection')) {
    selectObserver.observe(document.getElementById('selectSection'));
  }
})();

function toggleFaq(element) {
  const item = element.parentElement;
  const wasActive = item.classList.contains('active');
  
  // 다른 모든 FAQ 닫기
  document.querySelectorAll('.tgc-faq-item').forEach(faq => {
    faq.classList.remove('active');
  });
  
  // 클릭한 것만 토글
  if (!wasActive) {
    item.classList.add('active');
  }
}
</script><!-- 섹션 9: 최종 CTA + 상담 신청 폼 -->
<style>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

.tgc-cta-section {
  font-family: 'Pretendard', sans-serif;
  background: linear-gradient(180deg, #f8f9fa 0%, #e8f5e9 100%);
  padding: 100px 20px;
  position: relative;
  overflow: hidden;
}

.tgc-cta-section::before {
  content: '';
  position: absolute;
  top: -100px;
  left: -100px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(76,175,80,0.1) 0%, transparent 70%);
  animation: floatBubble 8s ease-in-out infinite;
}

.tgc-cta-section::after {
  content: '';
  position: absolute;
  bottom: -50px;
  right: -50px;
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(76,175,80,0.08) 0%, transparent 70%);
  animation: floatBubble 10s ease-in-out infinite reverse;
}

@keyframes floatBubble {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, -30px); }
}

.tgc-cta-inner {
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.tgc-fade-up {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.tgc-fade-up.visible {
  opacity: 1;
  transform: translateY(0);
}

.tgc-cta-header {
  text-align: center;
  margin-bottom: 50px;
}

.tgc-cta-badge {
  display: inline-block;
  background: linear-gradient(135deg, #4CAF50 0%, #2e7d32 100%);
  color: white;
  padding: 12px 28px;
  border-radius: 50px;
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 25px;
  animation: badgePulse 2s ease infinite;
}

@keyframes badgePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(76,175,80,0.4); }
  50% { box-shadow: 0 0 20px 5px rgba(76,175,80,0.2); }
}

.tgc-cta-header h2 {
  font-size: 38px;
  font-weight: 800;
  color: #1a1a1a;
  margin-bottom: 20px;
  line-height: 1.4;
}

.tgc-cta-header h2 .green {
  color: #4CAF50;
  position: relative;
}

.tgc-cta-header h2 .green::after {
  content: '';
  position: absolute;
  bottom: 2px;
  left: 0;
  width: 100%;
  height: 12px;
  background: rgba(76, 175, 80, 0.2);
  z-index: -1;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.8s ease 0.5s;
}

.tgc-cta-header.visible h2 .green::after {
  transform: scaleX(1);
}

.tgc-cta-desc {
  font-size: 18px;
  color: #666;
  line-height: 1.8;
  margin-bottom: 30px;
}

.tgc-cta-benefits {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.tgc-cta-benefit {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  padding: 12px 20px;
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  font-size: 14px;
  color: #333;
  font-weight: 500;
  opacity: 0;
  transform: translateY(15px);
  transition: all 0.5s ease;
}

.tgc-cta-benefit.visible {
  opacity: 1;
  transform: translateY(0);
}

.tgc-cta-benefit:nth-child(1) { transition-delay: 0.2s; }
.tgc-cta-benefit:nth-child(2) { transition-delay: 0.35s; }
.tgc-cta-benefit:nth-child(3) { transition-delay: 0.5s; }

.tgc-cta-benefit:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(76,175,80,0.15);
}

.tgc-cta-benefit-icon {
  width: 24px;
  height: 24px;
  background: #e8f5e9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tgc-cta-benefit-icon svg {
  width: 14px;
  height: 14px;
  fill: #4CAF50;
}

.tgc-form-wrapper {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease 0.3s;
}

.tgc-form-wrapper.visible {
  opacity: 1;
  transform: translateY(0);
}

.tg-form-wrap {
  max-width: 900px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.1);
  overflow: hidden;
}

.tg-form-header {
  background: linear-gradient(135deg, #4CAF50 0%, #2e7d32 100%);
  color: #ffffff;
  padding: 20px 28px;
  display: flex;
  align-items: center;
  border-radius: 0;
}

.tg-form-icon {
  margin-right: 10px;
  font-size: 22px;
}

.tg-form-title {
  font-size: 22px;
  font-weight: 700;
}

#startupForm {
  padding: 35px;
  border: none;
  border-radius: 0;
  background: #ffffff;
}

.tg-form-group {
  margin-bottom: 22px;
}

.tg-label {
  display: block;
  margin-bottom: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #111;
}

.tg-desc {
  font-size: 13px;
  color: #888;
}

.tg-required {
  color: #ff6b6b;
  font-size: 14px;
}

.tg-input {
  width: 100%;
  box-sizing: border-box;
  padding: 14px 16px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 15px;
  color: #111;
  transition: all 0.3s ease;
}

.tg-input::placeholder {
  color: #999;
}

.tg-input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 4px rgba(76,175,80,0.1);
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
  color: #aaa;
}

.tg-radio {
  display: flex;
  align-items: center;
  font-size: 15px;
  margin-bottom: 10px;
  padding: 10px 14px;
  background: #f8f9fa;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  color: #111;
}

.tg-radio:hover {
  background: #e8f5e9;
  border-color: #4CAF50;
}

.tg-radio input {
  margin-right: 10px;
  accent-color: #4CAF50;
  width: 18px;
  height: 18px;
}

.tg-form-actions {
  text-align: center;
  margin-top: 30px;
}

.tg-submit-btn {
  min-width: 200px;
  padding: 16px 50px;
  background: linear-gradient(135deg, #4CAF50 0%, #2e7d32 100%);
  color: #ffffff;
  border: none;
  border-radius: 50px;
  font-size: 17px;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(76,175,80,0.3);
  position: relative;
  overflow: hidden;
}

.tg-submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s ease;
}

.tg-submit-btn:hover::before {
  left: 100%;
}

.tg-submit-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(76,175,80,0.4);
}

.tg-submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.tgc-form-notice {
  text-align: center;
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
}

.tgc-form-notice p {
  font-size: 14px;
  color: #888;
  line-height: 1.7;
}

.tgc-form-notice strong {
  color: #4CAF50;
}

@media (max-width: 768px) {
  .tgc-cta-section { padding: 70px 20px; }
  .tgc-cta-header h2 { font-size: 26px; }
  .tgc-cta-desc { font-size: 16px; }
  .tgc-cta-benefits { gap: 12px; }
  .tgc-cta-benefit { padding: 10px 16px; font-size: 13px; }
  .tg-form-wrap { margin: 0; border-radius: 20px; }
  #startupForm { padding: 25px 20px; }
  .tg-phone { max-width: 80px; }
}

/* 폼 텍스트 가시성 — 페이지 다크 테마(body 기본 텍스트 #EEEEEE)가 상속되어
   라디오/라벨/입력창 글자가 흰 배경 카드 위에서 안 보이는 문제 방지 */
#formWrapper .tg-label,
#formWrapper .tg-radio,
#formWrapper .tg-radio span,
#formWrapper .tgc-form-notice p {
  color: #111;
}
#formWrapper .tg-input,
#formWrapper select.tg-input,
#formWrapper textarea.tg-input {
  color: #111 !important;
  background: #fff !important;
}
#formWrapper .tg-input::placeholder {
  color: #999 !important;
}
</style>

<section class="tgc-cta-section" id="consulting-form">
  <div class="tgc-cta-inner">
    <div class="tgc-cta-header tgc-fade-up" id="ctaHeader">
      <span class="tgc-cta-badge"> 지금 바로 시작하세요</span>
      <h2>첫 창업, <span class="green">첫 성공</span>으로<br>만들어 드립니다.</h2>
      <p class="tgc-cta-desc">
        무료 상담을 통해 대표님의 상황을 먼저 파악하고,<br>
        맞춤형 창업 전략을 제안해 드립니다.
      </p>
      </div>
    </div>
    
    <div class="tgc-form-wrapper" id="formWrapper">
      <div class="tg-form-wrap">
        <div class="tg-form-header">
          <span class="tg-form-icon">💬</span>
          <span class="tg-form-title">창업 지원 상담 신청(무료)</span>
        </div>

        <form id="startupForm" action="https://script.google.com/macros/s/AKfycbyelFqoWSqeRWmjVGARFePbNqTtkTtkG9MtXZpfusvTSUxnE42SrjJgmKM4dQDVcI-QAg/exec" method="POST" target="hidden_iframe">
          <div class="tg-form-group">
            <label class="tg-label">희망 업종을 선택해주세요. <span class="tg-required">*</span></label>
            <select name="industry" class="tg-input" required>
              <option value="">(선택)</option>
              <option value="헬스장">헬스장</option>
              <option value="필라테스">필라테스</option>
              <option value="PT 스튜디오">PT 스튜디오</option>
              <option value="요가">요가</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div class="tg-form-group">
            <label class="tg-label">
              선호 희망 지역을 알려주세요.<br>
              <small class="tg-desc">(입지 상권을 함께 봐드립니다.)</small>
            </label>
            <input type="text" name="area" class="tg-input" placeholder="예) 서울 마포구, 경기 남부, 부산 서면 인근 등" />
          </div>

          <div class="tg-form-group">
            <label class="tg-label">이름을 입력해주세요. <span class="tg-required">*</span></label>
            <input type="text" name="name" class="tg-input" required />
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
              <input type="radio" name="route" value="네이버 검색(창업, 창업솔루션 등)" required />
              <span>네이버 검색 (창업, 창업솔루션 등)</span>
            </label>

            <label class="tg-radio">
              <input type="radio" name="route" value="인스타/페이스북 광고" />
              <span>인스타/페이스북 광고</span>
            </label>

            <label class="tg-radio">
              <input type="radio" name="route" value="네이버 블로그" />
              <span>네이버 블로그</span>
            </label>

            <label class="tg-radio">
              <input type="radio" name="route" value="지인 소개/아카데미 수강생" />
              <span>지인 소개 / 아카데미 수강생</span>
            </label>

            <label class="tg-radio">
              <input type="radio" name="route" value="기타" />
              <span>기타</span>
            </label>
          </div>

          <!-- 페이지 구분 -->
          <input type="hidden" name="source" value="창업지원상담_아임웹">
          
          <!-- 🔒 보안 토큰 -->
          <input type="hidden" name="token" value="grow2026secure">

          <div class="tg-form-actions">
            <button type="submit" class="tg-submit-btn">무료 상담 신청하기</button>
          </div>
        </form>

        <iframe name="hidden_iframe" style="display:none;"></iframe>
        
        <div class="tgc-form-notice">
          <p>
            📞 상담 신청 후 <strong>24시간 이내</strong> 담당자가 연락드립니다.<br>
            궁금한 점은 편하게 문의해 주세요.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<script>
(function() {
  const ctaHeader = document.getElementById('ctaHeader');
  const formWrapper = document.getElementById('formWrapper');
  const benefits = document.querySelectorAll('.tgc-cta-benefit');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        
        if (entry.target.id === 'ctaHeader') {
          benefits.forEach((benefit, index) => {
            setTimeout(() => {
              benefit.classList.add('visible');
            }, 400 + (index * 150));
          });
        }
      }
    });
  }, { threshold: 0.2 });
  
  if (ctaHeader) observer.observe(ctaHeader);
  if (formWrapper) observer.observe(formWrapper);

  // 언마운트 정리용 전역 훅 (React cleanup 에서 호출 후 no-op 으로 교체)
  window.__tgcCtaObserverStop = function () { observer.disconnect(); };
  
  document.getElementById('startupForm').addEventListener('submit', function (e) {
    const phone1 = this.querySelector('[name="phone1"]').value;
    const phone2 = this.querySelector('[name="phone2"]').value;
    const phone3 = this.querySelector('[name="phone3"]').value;
    const phoneCheck1 = this.querySelector('[name="phoneCheck1"]').value;
    const phoneCheck2 = this.querySelector('[name="phoneCheck2"]').value;
    const phoneCheck3 = this.querySelector('[name="phoneCheck3"]').value;
    
    if (phone1 !== phoneCheck1 || phone2 !== phoneCheck2 || phone3 !== phoneCheck3) {
      e.preventDefault();
      alert('연락처가 일치하지 않습니다. 다시 확인해주세요.');
      return false;
    }
    
    // GA4 전환 이벤트 (gtag 미로드 시 조용히 무시)
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'form_submit', { form_source: '창업지원상담_아임웹' });
    }
    /* 메타 픽셀 Lead — 이 페이지에 픽셀이 매핑된 경우에만 전송된다 */
    if (typeof window.__tgcFbTrack === 'function') {
      window.__tgcFbTrack('Lead', { content_name: '창업지원상담_아임웹' });
    }

    setTimeout(function() {
      alert('정상적으로 접수되었습니다. 감사합니다 :)');
      document.getElementById('startupForm').reset();
    }, 500);
  });
  
  // 상단에도 동일 구조 폼(-top)이 있을 수 있으므로 전역이 아닌 이 폼 안에서만 조회
  const phoneInputs = document.getElementById('startupForm').querySelectorAll('.tg-phone');
  phoneInputs.forEach((input, index) => {
    input.addEventListener('input', function() {
      if (this.value.length >= this.maxLength && index < phoneInputs.length - 1) {
        phoneInputs[index + 1].focus();
      }
    });
    
    input.addEventListener('keypress', function(e) {
      if (!/[0-9]/.test(e.key)) {
        e.preventDefault();
      }
    });
  });
})();
</script>`;

export default function StartupConsultingPage() {
  // 하단 상세정보 영역은 클라이언트에서만 렌더링하여 서버/클라이언트 HTML 불일치를
  // 원천 차단한다. (DETAIL_HTML 은 아임웹 원본 + script 가 섞인 외부 HTML)
  const [mounted, setMounted] = useState(false);

  // 히어로 / 영상 후기 슬라이더 / 하단 상세정보(+CTA 폼) 컨테이너 ref
  const heroRef = useRef<HTMLDivElement>(null);
  const vidRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  // 마운트 후에만 각 HTML 을 삽입한다.
  useEffect(() => {
    setMounted(true);
  }, []);

  // 아임웹 원본 HTML(+CSS+JS)을 React 환경에서 제대로 동작시키기 위한 공통 처리.
  //  1) dangerouslySetInnerHTML 로 들어온 DOM이 커밋된 뒤(useEffect 시점) 실행.
  //  2) 중복 id 충돌 방지: 두 번째부터 -2, -3 … 접미사를 붙임 (script 실행 전에 수행).
  //  3) innerHTML 로 삽입된 <script> 는 실행되지 않으므로, 같은 내용의 새 <script>를
  //     만들어 document.body 에 append → 실행시킴 (DOM 삽입 → 스크립트 실행 순서 보장).
  //     스크립트가 전역 스코프에서 실행되므로 그 안의 함수 선언
  //     (function toggleFaq(){…} 등)이 자동으로
  //     window 전역에 등록되어, 인라인 onclick="toggleFaq(this)" 가 동작함.
  const injectContainer = (container: HTMLDivElement) => {
    // 중복 id 충돌 방지
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

    // <script> 재생성 → body 에 append 하여 실행
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
    return injected;
  };

  // 히어로(HERO_SECTION_HTML) 주입 — 언마운트 시 script 제거 +
  // 등장 효과 IntersectionObserver 정리(__tgcHeroStop, 호출 후 no-op 교체).
  useEffect(() => {
    if (!mounted) return;
    const container = heroRef.current;
    if (!container) return;
    const injected = injectContainer(container);
    return () => {
      injected.forEach((s) => s.remove());
      const w = window as unknown as Record<string, unknown>;
      const stopHero = w["__tgcHeroStop"];
      if (typeof stopHero === "function") (stopHero as () => void)();
      w["__tgcHeroStop"] = () => {};
    };
  }, [mounted]);

  // 영상 후기 슬라이더(VIDEO_SECTION_HTML) 주입 — 언마운트 시 script 제거 +
  // rAF/IO/포인터 리스너 정리(__tgcVidStop, 호출 후 no-op 교체).
  useEffect(() => {
    if (!mounted) return;
    const container = vidRef.current;
    if (!container) return;
    const injected = injectContainer(container);
    return () => {
      injected.forEach((s) => s.remove());
      const w = window as unknown as Record<string, unknown>;
      const stopVid = w["__tgcVidStop"];
      if (typeof stopVid === "function") (stopVid as () => void)();
      w["__tgcVidStop"] = () => {};
    };
  }, [mounted]);

  // 하단 상세정보 + CTA 폼(DETAIL_HTML) 주입 — 언마운트 시 script 제거 +
  // 그 폼 전용 IntersectionObserver 정리 + 인라인 onclick 이 참조하던 전역 함수 정리.
  useEffect(() => {
    if (!mounted) return;
    const container = detailRef.current;
    if (!container) return;
    const injected = injectContainer(container);
    return () => {
      injected.forEach((s) => s.remove());

      const w = window as unknown as Record<string, unknown>;

      // CTA 폼 IntersectionObserver 정리 (호출 후 no-op 으로 교체 — 삭제 금지)
      const stopObs = w["__tgcCtaObserverStop"];
      if (typeof stopObs === "function") (stopObs as () => void)();
      w["__tgcCtaObserverStop"] = () => {};

      // 인라인 onclick 이 참조하던 전역 함수 정리 (best-effort)
      // 체크리스트 삭제 후 남은 인라인 onclick 전역은 toggleFaq 뿐이다
      const globals = ["toggleFaq"];
      globals.forEach((fn) => {
        try {
          delete w[fn];
        } catch {
          // 전역 함수 선언은 삭제 불가일 수 있음 — 무시
        }
      });
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
    <div className="bg-white overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_SCHEMA) }}
      />
      {/* ───────────────── 히어로 (최상단) ───────────────── */}
      {mounted ? (
        <div
          ref={heroRef}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: HERO_SECTION_HTML }}
        />
      ) : (
        <div ref={heroRef} suppressHydrationWarning />
      )}

      {/* ───────────────── 영상 후기 슬라이더 (히어로 바로 아래) ───────────────── */}
      {mounted ? (
        <div
          ref={vidRef}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: VIDEO_SECTION_HTML }}
        />
      ) : (
        <div ref={vidRef} suppressHydrationWarning />
      )}

      {/* ───────────────── 탭 네비게이션 바 ───────────────── */}
      <nav className="w-full border-y border-gray-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-stretch">
          <button
            type="button"
            onClick={() => scrollToSection(".tgc-trust")}
            className="flex-1 py-4 text-center text-sm font-semibold text-[#333] transition-colors hover:text-[#009519] sm:text-base"
          >
            이용후기
          </button>
          <div className="my-3 w-px bg-gray-200" />
          <button
            type="button"
            onClick={() => scrollToSection(".tgc-faq")}
            className="flex-1 py-4 text-center text-sm font-semibold text-[#333] transition-colors hover:text-[#009519] sm:text-base"
          >
            궁금한사항
          </button>
        </div>
      </nav>

      {/* ───────────────── 하단 상세정보 영역 ───────────────── */}
      <section className="w-full">
        {/* 여기에 상세정보 HTML 삽입 — 위 DETAIL_HTML 문자열에 아임웹 HTML 붙여넣기 */}
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

      {/* 하단 고정 CTA 바 — 하단 CTA 상담폼(#consulting-form)으로 스크롤 */}
      <StickyCtaBar targetSelector="#consulting-form" />

      {/* 창업비용 계산기 팝업 (플로팅 버튼 + 패널) */}
      <CostCalculator />
    </div>
  );
}
