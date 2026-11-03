"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 매장 위탁운영 상세페이지 B안(v2) — 광고 A/B 실험용 신규 랜딩. 원본은 /consulting/outsourcing(A안)이며 이 파일과 독립이다.
//
// 구성
//  1) 탭 네비게이션 바 (페이지 최상단)
//  2) 상세정보 영역: 외부 HTML(아임웹) 문자열을 dangerouslySetInnerHTML로 렌더링.
//     삽입된 <script>는 useEffect에서 재생성하여 실행시킨다.
//     상담 폼(consultingForm)은 이 영역 하단에 한 벌만 있다.
//  3) 맨 아래 "다른 서비스 둘러보기" 추천 카드.
//
// 상단 히어로(좌 이미지 + 우 상담 폼)는 첫 화면 이탈률 개선을 위해 제거했다.
//
// 헤더/푸터는 app/layout.tsx 를 그대로 사용한다.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import StickyCtaBar from "@/components/StickyCtaBar";

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

  const cardCls =
    "group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-[#009519] hover:shadow-lg";

  return (
    <Link href={service.href} className={cardCls}>
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

// ─── 위탁 후기 영상 · CTA 블록 (DETAIL_HTML 에 문자열로 들어간다) ─────────────
//  · 원본 video-raw/reviewwt.mp4 → ffmpeg 720p(세로 720x1280) CRF28 + AAC 96k
//    (3번째 review-wt3 는 video-raw/필라여대(위탁,숏폼)최종.mp4 를 같은 설정으로 변환)
//  · 클릭 전에는 poster 만 보여주고 preload="none" (모바일 데이터 절약)
//
//  · 예전에는 DETAIL_HTML 안에 마운트용 div 를 두고 React 포털로 꽂았는데 실제
//    브라우저에서 영상이 뜨지 않았다. innerHTML 로 주입된 DOM 위에 React 트리를
//    얹는 구조라 주입·정리 타이밍에 취약하다. 그래서 startup 페이지에서 이미
//    검증된 방식(HTML 문자열 주입 + <script> 재실행)으로 통일했다.
//
//  · 세로 9:16 영상이라 PC 에서 폭을 720px 주면 높이가 1280px 이 되어 화면을
//    넘긴다. 바깥 단은 다른 섹션과 같은 800px 로 두고 영상 프레임만
//    360px(높이 640px)로 제한한다. 모바일은 좌우 여백 없이 전체폭.
//
//  · 기본 표시 원칙: 스크립트가 실행되지 않아도 poster·카피·버튼은 그대로
//    보인다. 스크립트는 재생 / 화면 이탈 시 일시정지 / 스크롤만 얹는다.
const WT_VIDEO_HTML = `<style>
  .wt-vid-sec{max-width:800px;margin:0 auto;padding:56px 20px 70px;background:#fff;text-align:center;overflow-x:hidden}
  .wt-vid-lead{font-size:21px;font-weight:800;color:#222;line-height:1.5;margin:0 0 20px;word-break:keep-all}
  /* PC: 두 영상 가로 나란히 중앙 정렬. max-width 로 좁은 화면에서 자동 축소되어
     640px 대 뷰포트에서도 가로로 넘치지 않는다. */
  .wt-vid-row{display:flex;gap:16px;justify-content:center;align-items:flex-start;max-width:100%}
  /* 영상 3개 — PC 에서 세 개가 한 줄에 들어가도록 폭을 줄였다 (모바일은 아래 미디어쿼리의 78% 스와이프) */
  .wt-vid-item{flex:0 1 250px;width:250px;max-width:calc(33.333% - 11px)}
  .wt-vid-frame{position:relative;width:100%;aspect-ratio:9/16;border-radius:16px;overflow:hidden;background:#1a1a1a}
  .wt-vid-player{width:100%;height:100%;object-fit:cover;display:block}
  .wt-vid-cover{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.18);border:none;padding:0;cursor:pointer;transition:background .2s}
  .wt-vid-cover:hover{background:rgba(0,0,0,.32)}
  .wt-vid-play{display:flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:50%;background:rgba(34,181,115,.92);box-shadow:0 8px 24px rgba(0,0,0,.4)}
  .wt-vid-desc{font-size:16px;font-weight:600;color:#555;line-height:1.65;margin:0 0 22px;word-break:keep-all}
  .wt-vid-cta{max-width:calc(100% - 32px);line-height:1.4;margin-top:26px}
  .wt-vid-sub{font-size:16px;font-weight:700;color:#444;line-height:1.6;margin:22px 0 24px;word-break:keep-all}
  .wt-vid-cta{display:inline-block;background:#22B573;color:#fff;padding:16px 44px;border-radius:8px;font-size:17px;font-weight:700;border:none;cursor:pointer;transition:background .3s}
  .wt-vid-cta:hover{background:#1a9c5e}

  .wt-cta-mid{max-width:800px;margin:0 auto;padding:0 20px 60px;background:#fff;text-align:center}
  .wt-cta-mid--gray{background:#f8f9fa}

  .wt-teaser-wrap{max-width:800px;margin:0 auto;padding:28px 20px 0;background:#f9f9f9}
  .wt-teaser{display:flex;align-items:center;gap:14px;width:100%;max-width:420px;margin:0 auto;padding:12px 16px;border:1px solid #e5e5e5;border-radius:12px;background:#fff;cursor:pointer;text-align:left;transition:border-color .2s,box-shadow .2s}
  .wt-teaser:hover{border-color:#22B573;box-shadow:0 4px 16px rgba(0,0,0,.06)}
  .wt-teaser-thumb{width:54px;height:96px;object-fit:cover;border-radius:8px;flex-shrink:0;display:block}
  .wt-teaser-text{display:flex;flex-direction:column;gap:6px;min-width:0}
  .wt-teaser-quote{font-size:15px;font-weight:700;color:#222;line-height:1.5;word-break:keep-all}
  .wt-teaser-hint{font-size:13px;color:#22B573;font-weight:600}

  @media (max-width: 600px) {
    .wt-vid-sec{padding:40px 0 50px}
    .wt-vid-lead{font-size:18px;padding:0 16px}
    /* 모바일: 한 번에 1개 + 다음 영상이 살짝 보이게 가로 스와이프.
       스크롤은 이 줄(.wt-vid-row) 안에서만 일어나므로 페이지 가로 스크롤로
       번지지 않는다. 바깥 .wt-vid-sec 의 overflow-x:hidden 이 이중 안전장치. */
    .wt-vid-row{justify-content:flex-start;gap:12px;padding:0 16px 4px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none}
    .wt-vid-row::-webkit-scrollbar{display:none}
    .wt-vid-item{flex:0 0 78%;width:78%;max-width:none;scroll-snap-align:center}
    .wt-vid-frame{border-radius:14px}
    .wt-vid-sub{font-size:15px;padding:0 16px}
    .wt-cta-mid{padding:0 16px 44px}
    .wt-teaser-wrap{padding:24px 16px 0}
  }
</style>

<div class="wt-vid-sec" id="wt-vid-sec" data-track-section="video">
  <p class="wt-vid-lead">실제로 매장을 맡겨본 대표님들의 이야기</p>
  <p class="wt-vid-desc">처음에는 맡기는 것이 불안했지만,<br>직접 경험한 변화는 달랐습니다.</p>

  <div class="wt-vid-row">
    <div class="wt-vid-item">
      <div class="wt-vid-frame">
        <video class="wt-vid-player" src="/reviews/review-wt.mp4" data-poster="/reviews/review-wt.jpg" preload="none" playsinline></video>
        <button type="button" class="wt-vid-cover" aria-label="위탁 후기 영상 1 재생">
          <span class="wt-vid-play"><svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span>
        </button>
      </div>
    </div>
    <div class="wt-vid-item">
      <div class="wt-vid-frame">
        <video class="wt-vid-player" src="/reviews/review-wt2.mp4" data-poster="/reviews/review-wt2.jpg" preload="none" playsinline></video>
        <button type="button" class="wt-vid-cover" aria-label="위탁 후기 영상 2 재생">
          <span class="wt-vid-play"><svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span>
        </button>
      </div>
    </div>
    <div class="wt-vid-item">
      <div class="wt-vid-frame">
        <video class="wt-vid-player" src="/reviews/review-wt3.mp4" data-poster="/reviews/review-wt3.jpg" preload="none" playsinline></video>
        <button type="button" class="wt-vid-cover" aria-label="위탁 후기 영상 3 재생">
          <span class="wt-vid-play"><svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span>
        </button>
      </div>
    </div>
  </div>

  <button type="button" class="wt-vid-cta" data-cta="mid_video" onclick="wtCta(this)">우리 매장 무료 진단 신청하기</button>
</div>

<script>
(function () {
  /* 인라인 onclick 에서 부르는 스크롤 (상단 고정 헤더 80px 보정) */
  function wtScrollTo(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
  window.wtScrollToForm = function () { wtScrollTo('consulting-form-wt'); };
  window.wtScrollToVideo = function () { wtScrollTo('wt-vid-sec'); };
  var WT_VARIANT = 'v2';
  function wtGa(name, params) {
    try {
      if (typeof window.gtag === 'function') {
        var pp = params || {};
        pp.landing_variant = WT_VARIANT;
        window.gtag('event', name, pp);
      }
    } catch (e) {}
  }
  /* 이후 자동 수집 이벤트(form_start·form_submit·scroll_depth 등)에도 landing_variant 를 싣는다 */
  try { if (typeof window.gtag === 'function') window.gtag('set', { landing_variant: WT_VARIANT }); } catch (e) {}
  window.__wtVid = window.__wtVid || { started: false, maxPct: 0 };
  /* 모든 CTA 는 기존 신청 폼으로 이동한다. 클릭 위치를 GA4 로 남긴다(cta_click). */
  window.wtCta = function (el) {
    var loc = (el && el.getAttribute && el.getAttribute('data-cta')) || 'unknown';
    wtGa('cta_click', { cta_location: loc, cta_text: ((el && el.textContent) || '').trim(), form_source: '위탁상담2' });
    wtScrollTo('consulting-form-wt');
  };
  window.wtScrollToProof = function () {
    wtGa('cta_click', { cta_location: 'hero_proof_link', cta_text: '실제 매출 개선 사례 보기', form_source: '위탁상담2' });
    wtScrollTo('wt-proof-sec');
  };
  /* 사례 섹션 도달 — 한 번만 */
  var proofEl = document.getElementById('wt-proof-sec');
  if (proofEl && typeof IntersectionObserver === 'function') {
    var proofIo = new IntersectionObserver(function (entries) {
      if (entries[0] && entries[0].isIntersecting) { wtGa('view_proof_section', { form_source: '위탁상담2' }); proofIo.disconnect(); }
    }, { threshold: 0.3 });
    proofIo.observe(proofEl);
  }
  /* 후기 영상 포스터는 화면 근처에 왔을 때 불러온다 (첫 화면 로딩 부담 감소) */
  var vidSecEl = document.getElementById('wt-vid-sec');
  function loadPosters() {
    if (!vidSecEl) return;
    Array.prototype.forEach.call(vidSecEl.querySelectorAll('video[data-poster]'), function (v) {
      if (!v.getAttribute('poster')) v.setAttribute('poster', v.getAttribute('data-poster'));
    });
  }
  if (vidSecEl && typeof IntersectionObserver === 'function') {
    var posterIo = new IntersectionObserver(function (entries) {
      if (entries[0] && entries[0].isIntersecting) { loadPosters(); posterIo.disconnect(); }
    }, { rootMargin: '600px 0px' });
    posterIo.observe(vidSecEl);
  } else { loadPosters(); }

  var sec = document.getElementById('wt-vid-sec');
  if (!sec) return;
  var frames = sec.querySelectorAll('.wt-vid-frame');
  if (!frames.length) return;

  var videos = [];

  /* 동시 재생 금지 — 하나가 재생되면 나머지는 멈춘다 */
  function pauseOthers(current) {
    videos.forEach(function (v) {
      if (v !== current && !v.paused) v.pause();
    });
  }

  Array.prototype.forEach.call(frames, function (frame) {
    var video = frame.querySelector('.wt-vid-player');
    var cover = frame.querySelector('.wt-vid-cover');
    if (!video || !cover) return;
    videos.push(video);

    cover.addEventListener('click', function () {
      pauseOthers(video);
      cover.style.display = 'none';
      video.controls = true;
      var p = video.play();
      if (p && typeof p.catch === 'function') { p.catch(function () {}); }
    });

    /* 네이티브 컨트롤로 재생을 시작한 경우도 잡는다 */
    video.addEventListener('play', function () { pauseOthers(video); });
  });

  /* ── 후기 영상 구간 계측 ──
     GA4 향상된 측정의 영상 이벤트(video_start·video_progress·video_complete)는 YouTube 임베드 전용이라
     이 <video> 태그에는 자동 이벤트가 없다. 이름이 겹치지 않게 wt_video_* 로 직접 보낸다. */
  var vid = window.__wtVid;
  if (vid) { vid.started = false; vid.maxPct = 0; }
  if (typeof IntersectionObserver === 'function') {
    var viewIo = new IntersectionObserver(function (entries) {
      if (entries[0] && entries[0].isIntersecting) { wtGa('wt_video_view', {}); viewIo.disconnect(); }
    }, { threshold: 0.3 });
    viewIo.observe(sec);
    /* 영상 구간 다음 섹션(후기 슬라이더) 도달 — 영상을 시작했는지 함께 기록해 시청자/비시청자를 나눠 본다 */
    var nextEl = document.querySelector('.review-section');
    if (nextEl) {
      var nextIo = new IntersectionObserver(function (entries) {
        if (entries[0] && entries[0].isIntersecting) {
          wtGa('wt_video_next_section', { video_started: vid && vid.started ? 1 : 0, video_max_pct: vid ? vid.maxPct : 0 });
          nextIo.disconnect();
        }
      }, { threshold: 0.2 });
      nextIo.observe(nextEl);
    }
  }
  Array.prototype.forEach.call(videos, function (video, idx) {
    var no = idx + 1;
    var sentStart = false, sentComplete = false, sent = { 25: false, 50: false, 75: false };
    video.addEventListener('play', function () {
      if (sentStart) return;
      sentStart = true;
      if (vid) vid.started = true;
      wtGa('wt_video_start', { video_index: no });
    });
    video.addEventListener('timeupdate', function () {
      var d = video.duration;
      if (!d || !isFinite(d)) return;
      var pct = Math.floor((video.currentTime / d) * 100);
      if (vid && pct > vid.maxPct) vid.maxPct = pct;
      [25, 50, 75].forEach(function (m) {
        if (!sent[m] && pct >= m) { sent[m] = true; wtGa('wt_video_progress', { video_index: no, video_percent: m }); }
      });
    });
    video.addEventListener('ended', function () {
      if (sentComplete) return;
      sentComplete = true;
      if (vid) vid.maxPct = 100;
      wtGa('wt_video_complete', { video_index: no });
    });
  });

  /* 화면 밖으로 벗어나면 자동 일시정지.
     모바일에서 옆으로 스와이프해 넘어간 영상도 여기서 멈춘다. */
  var io = null;
  if (typeof IntersectionObserver === 'function') {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting && !entry.target.paused) entry.target.pause();
      });
    }, { threshold: 0 });
    videos.forEach(function (v) { io.observe(v); });
  }

  /* 언마운트 정리용 전역 훅 (React cleanup 에서 호출 후 no-op 교체 — delete 금지) */
  window.__wtVidStop = function () {
    if (io) { io.disconnect(); io = null; }
    videos.forEach(function (v) { if (!v.paused) v.pause(); });
  };
})();
</script>`;

// 중간 CTA — 뒤따르는 섹션 배경색에 맞춰 밝은 톤 / 회색 톤 두 벌
const WT_MID_CTA_HTML = `<div class="wt-cta-mid">
  <button type="button" class="wt-vid-cta" data-cta="mid_proof" onclick="wtCta(this)">우리 매장도 개선할 수 있을까? 무료로 확인하기</button>
</div>`;

const WT_MID_CTA_GRAY_HTML = `<div class="wt-cta-mid wt-cta-mid--gray">
  <button type="button" class="wt-vid-cta" data-cta="mid_aftercare" onclick="wtCta(this)">무료 방문 진단 신청하기</button>
</div>`;

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
    padding: 30px 20px 52px;
    background: #ffffff;
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
    overflow: hidden;
  }

  /* 페이드 + 슬라이드업 기본 세팅
     기본 표시 원칙: 아무것도 안 하면 그냥 보인다. 숨김은 스크립트가
     .hero-section 에 .is-anim 을 붙였을 때만 걸린다. 예전에는 여기서 바로
     opacity:0 을 줘서, 스크립트가 한 번이라도 어긋나면(주입 실패, 노드 교체로
     옵저버 미발화 등) 히어로 전체가 빈 흰 화면으로 남았다. */
  .hero-animate {
    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .hero-section.is-anim .hero-animate {
    opacity: 0;
    transform: translateY(40px);
  }
  .hero-section.is-anim .hero-animate.visible {
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
    width: 100%;
    height: 6px;
    background: rgba(34, 181, 115, 0.2);
    border-radius: 3px;
    transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s;
  }
  .hero-section.is-anim .hero-title .highlight::after {
    width: 0;
  }
  .hero-section.is-anim .hero-animate.visible .highlight::after {
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
    width: 120px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #22B573, transparent);
    margin: 0 auto 48px;
    transition: width 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s;
  }
  .hero-section.is-anim .hero-divider {
    width: 0;
  }
  .hero-section.is-anim .hero-divider.visible {
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
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .hero-section.is-anim .stat-item {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  .hero-section.is-anim .stat-item.visible {
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
    width: 40px;
    height: 3px;
    background: #22B573;
    border-radius: 2px;
    margin: 10px auto 0;
    transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .hero-section.is-anim .stat-bar {
    width: 0;
  }
  .hero-section.is-anim .stat-item.visible .stat-bar {
    width: 40px;
  }

  @media (max-width: 600px) {
    .hero-section { padding: 22px 18px 38px; }
    .hero-title { font-size: 29px; }
    .hero-subtitle { font-size: 15px; margin-bottom: 40px; }
    .hero-stats { gap: 32px; }
    .stat-number { font-size: 28px; }
  }
  /* ── 전환 개선: 첫 화면 압축 + 메인 CTA ── */
  .hero-title { margin-bottom: 18px; }
  .hero-sub { font-size: 16px; color: #555; line-height: 1.75; margin: 0 auto 16px; max-width: 560px; word-break: keep-all; }
  .hero-sol { background: #f1faf5; border: 1px solid #cfeedd; border-radius: 12px; padding: 16px 18px; max-width: 560px; margin: 0 auto 22px; font-size: 16px; font-weight: 700; color: #1d3b2d; line-height: 1.65; word-break: keep-all; }
  .hero-sol strong { color: #0f9d58; }
  .wt-btn { display: inline-block; width: 100%; max-width: 420px; background: #22B573; color: #fff; padding: 18px 24px; border-radius: 10px; font-size: 18px; font-weight: 800; border: none; cursor: pointer; transition: background .25s; box-shadow: 0 8px 20px rgba(34,181,115,.28); word-break: keep-all; line-height: 1.35; }
  .wt-btn:hover { background: #1a9c5e; }
  .hero-note { font-size: 14px; color: #777; margin: 12px 0 0; word-break: keep-all; }
  .hero-link { display: inline-block; margin-top: 14px; padding: 8px 6px; background: none; border: none; font-size: 15px; font-weight: 700; color: #1a9c5e; text-decoration: underline; text-underline-offset: 4px; cursor: pointer; }
  @media (max-width: 600px) {
    .hero-eyebrow { font-size: 13px; margin-bottom: 10px; }
    .hero-title { font-size: 26px; line-height: 1.42; margin-bottom: 14px; }
    .hero-sub { font-size: 15px; line-height: 1.7; margin-bottom: 12px; }
    .hero-sol { font-size: 15px; padding: 14px 14px; margin-bottom: 18px; }
    .wt-btn { font-size: 17px; padding: 17px 16px; }
  }
</style>

<div class="hero-section" data-track-section="hero">
  <div class="hero-animate" id="heroTitle">
    <p class="hero-eyebrow">헬스장 · 필라테스 1개월 현장 상주 위탁운영</p>
    <h1 class="hero-title">
      매출은 떨어지는데,<br>
      결국 모든 걸<br>
      <span class="highlight">대표님 혼자 해결하고 계신가요?</span>
    </h1>
  </div>

  <div class="hero-animate" id="heroSubtitle" style="transition-delay: 0.15s;">
    <p class="hero-sub">
      회원 모집도, 직원 관리도, 매출 걱정도.<br>
      누군가에게 맡기자니 불안하고, 직접 하자니 어디서부터 바꿔야 할지 막막할 수 있습니다.
    </p>
    <p class="hero-sol">
      더그로우는 1개월 동안 현장에 직접 상주하며<br>
      <strong>회원 모집부터 상담·등록, 운영까지</strong> 함께 실행합니다.
    </p>
    <button type="button" class="wt-btn" data-cta="hero" onclick="wtCta(this)">우리 매장 무료 진단 신청하기</button>
    <p class="hero-note">무료 방문 진단 후 위탁운영 진행 여부를 결정하세요.</p>
    <button type="button" class="hero-link" onclick="wtScrollToProof()">실제 매출 개선 사례 보기 ↓</button>
  </div>
</div>

<script>
(function() {
  // 히어로가 없으면 조용히 끝낸다. (기본 표시 상태 그대로 둔다)
  var hero = document.querySelector('.hero-section');
  if (!hero) return;

  // 카운트업 — 마크업에는 최종 숫자가 들어있고, 애니메이션을 시작할 때만 0부터 센다.
  var countElements = hero.querySelectorAll('.count-up');
  var hasAnimated = false;

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-target'), 10);
    if (!target) return;
    var duration = 2000;
    var step = target / (duration / 16);
    var current = 0;
    el.textContent = '0';
    var timer = setInterval(function() {
      current += step;
      if (current >= target) { el.textContent = target; clearInterval(timer); }
      else { el.textContent = Math.floor(current); }
    }, 16);
  }

  // 요소가 사라졌어도 터지지 않게 전부 널 가드
  function show(id, delay) {
    setTimeout(function() {
      var el = document.getElementById(id);
      if (el) el.classList.add('visible');
    }, delay);
  }

  // 등장 애니메이션 (시간차)
  function triggerAnimations() {
    if (hasAnimated) return;
    hasAnimated = true;

    show('heroTitle', 0);
    show('heroDivider', 300);
    show('heroSubtitle', 400);
    show('stat1', 700);
    show('stat2', 900);

    setTimeout(function() {
      var el = document.getElementById('stat3');
      if (el) el.classList.add('visible');
      countElements.forEach(function(el) { animateCount(el); });
    }, 1100);
  }

  // 여기서부터 애니메이션 모드. 이 줄 위에서 무슨 일이 생겨도 히어로는 그냥 보인다.
  hero.classList.add('is-anim');

  // 안전장치를 옵저버보다 먼저 건다. 옵저버가 안 울리거나 생성에 실패해도
  // 1.5초 뒤에는 무조건 보이게 된다.
  setTimeout(triggerAnimations, 1500);

  // IntersectionObserver로 화면에 보이면 시작
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        triggerAnimations();
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(hero);
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
  /* ── 전환 개선: 공감 섹션 압축 (2x2) ── */
  .empathy-section { padding: 56px 20px 50px; max-width: 800px; }
  .empathy-title { font-size: 26px; margin-bottom: 26px; }
  .empathy-list { max-width: 720px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 0 auto 26px; }
  .empathy-item { display: block; border-left: 4px solid #22B573; border-radius: 10px; padding: 18px 18px; font-size: 16px; font-weight: 600; color: #333; line-height: 1.55; word-break: keep-all; }
  .empathy-item:hover { transform: none; box-shadow: none; }
  .empathy-bridge2 { max-width: 560px; margin: 0 auto; font-size: 17px; color: #444; line-height: 1.75; word-break: keep-all; }
  .empathy-bridge2 strong { display: block; margin-top: 10px; color: #0f9d58; font-size: 18px; }
  @media (max-width: 600px) {
    .empathy-section { padding: 42px 16px 40px; }
    .empathy-title { font-size: 22px; }
    .empathy-list { grid-template-columns: 1fr; gap: 10px; }
    .empathy-item { padding: 14px 16px; font-size: 15px; }
    .empathy-bridge2 { font-size: 15.5px; }
  }
</style>

<div class="empathy-section" data-track-section="empathy">
  <h2 class="empathy-title">
    대표님도 이런 고민을<br>
    <span class="highlight">하고 계신가요?</span>
  </h2>

  <div class="empathy-list">
    <div class="empathy-item">광고비는 계속 쓰는데 신규 회원은 늘지 않는다.</div>
    <div class="empathy-item">상담 문의는 오지만 실제 등록으로 이어지지 않는다.</div>
    <div class="empathy-item">직원이 있어도 결국 매출과 운영은 내가 직접 챙긴다.</div>
    <div class="empathy-item">매출을 올려도 할인과 운영비 때문에 남는 게 없다.</div>
  </div>

  <p class="empathy-bridge2">
    대표님이 더 오래, 더 많이 일한다고<br>
    이 문제가 저절로 해결되지는 않습니다.
    <strong>이제는 현장에서 실행하는 운영 방식이 필요합니다.</strong>
  </p>
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
    max-width: 420px;
    margin: 0 auto;
    /* 세로 스크롤은 브라우저에 맡기고 가로 제스처만 스크립트가 가져간다 */
    touch-action: pan-y;
    cursor: grab;
    -webkit-user-select: none;
    user-select: none;
  }
  .slide-container:active { cursor: grabbing; }
  .slide-track {
    display: flex;
    align-items: flex-start;
    transition: transform 0.5s ease;
  }
  .slide-item {
    min-width: 100%;
    display: flex;
    justify-content: center;
  }
  /* 카톡 캡처는 세로로 길고 비율이 제각각이다. 폭을 100% 로 고정하면
     원본보다 확대되거나 잘리므로, 비율 그대로 자연 크기까지만 보여준다. */
  .slide-item img {
    width: auto;
    max-width: 100%;
    height: auto;
    border-radius: 12px;
    display: block;
    /* 드래그할 때 브라우저 기본 이미지 끌기가 끼어들지 않게 */
    -webkit-user-drag: none;
    user-select: none;
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
    cursor: pointer;
  }
  .slide-dot.active { background: #22B573; }
  @media (max-width: 600px) {
    .evidence-section { padding: 50px 16px; }
    .evidence-title { font-size: 24px; }
    .ev-stat-num { font-size: 26px; }
    .evidence-stats { gap: 20px; }
  }
  /* ── 전환 개선: 성과 수치 5개 ── */
  .evidence-stats-5 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px 12px; }
  .evidence-stats-5 .ev-stat-num { font-size: 28px; }
  .evidence-foot { font-size: 12.5px; color: #999; margin: 18px 0 0; line-height: 1.6; word-break: keep-all; }
  @media (max-width: 600px) {
    .evidence-stats-5 { grid-template-columns: repeat(2, 1fr); }
    .evidence-stats-5 .ev-stat-num { font-size: 24px; }
    .evidence-stats-5 .ev-stat:last-child { grid-column: 1 / -1; }
  }
</style>

<div class="evidence-section" id="wt-proof-sec" data-track-section="proof">
  <h2 class="evidence-title">
    말보다, 실제 매장에서 만들어낸<br>
    <span class="highlight">결과를 보여드립니다.</span>
  </h2>
  <p class="evidence-desc">
    현장 상주로 만들어낸 결과입니다.
  </p>

  <div class="evidence-stats-box">
    <p class="evidence-stats-label">더그로우 현장 실적</p>
    <div class="evidence-stats evidence-stats-5">
      <div class="ev-stat">
        <div class="ev-stat-num">750+</div>
        <div class="ev-stat-label">매장 운영 경험</div>
      </div>
      <div class="ev-stat">
        <div class="ev-stat-num">540+</div>
        <div class="ev-stat-label">현장 상주 실적</div>
      </div>
      <div class="ev-stat">
        <div class="ev-stat-num red">130%</div>
        <div class="ev-stat-label">평균 매출 상승률</div>
      </div>
      <div class="ev-stat">
        <div class="ev-stat-num">3,870만</div>
        <div class="ev-stat-label">평균 매출 상승</div>
      </div>
      <div class="ev-stat">
        <div class="ev-stat-num">1억 800만</div>
        <div class="ev-stat-label">최대 매출 상승</div>
      </div>
    </div>
    <p class="evidence-foot">※ 더그로우 내부 집계 기준이며, 매장별 결과는 상황에 따라 다를 수 있습니다.</p>
  </div>

  <div class="evidence-slide-area">
    <p class="evidence-slide-title">대표님들이 직접 보내주신 카톡 후기</p>
    <div class="slide-container" id="evidenceSlider">
      <div class="slide-track" id="evidenceTrack">
        <div class="slide-item">
          <img src="/wt/wtkakaoreview1.png" loading="lazy" alt="더그로우 위탁운영 카카오톡 후기 1">
        </div>
        <div class="slide-item">
          <img src="/wt/wtkakaoreview2.png" loading="lazy" alt="더그로우 위탁운영 카카오톡 후기 2">
        </div>
        <div class="slide-item">
          <img src="/wt/wtkakaoreview3.png" loading="lazy" alt="더그로우 위탁운영 카카오톡 후기 3">
        </div>
        <div class="slide-item">
          <img src="/wt/wtkakaoreview4.png" loading="lazy" alt="더그로우 위탁운영 카카오톡 후기 4">
        </div>
        <div class="slide-item">
          <img src="/wt/wtkakaoreview5.png" loading="lazy" alt="더그로우 위탁운영 카카오톡 후기 5">
        </div>
        <div class="slide-item">
          <img src="/wt/wtkakaoreview6.png" loading="lazy" alt="더그로우 위탁운영 카카오톡 후기 6">
        </div>
        <div class="slide-item">
          <img src="/wt/wtkakaoreview7.png" loading="lazy" alt="더그로우 위탁운영 카카오톡 후기 7">
        </div>
        <div class="slide-item">
          <img src="/wt/wtkakaoreview8.png" loading="lazy" alt="더그로우 위탁운영 카카오톡 후기 8">
        </div>
        <div class="slide-item">
          <img src="/wt/wtkakaoreview9.png" loading="lazy" alt="더그로우 위탁운영 카카오톡 후기 9">
        </div>
        <div class="slide-item">
          <img src="/wt/wtkakaoreview10.png" loading="lazy" alt="더그로우 위탁운영 카카오톡 후기 10">
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

${WT_MID_CTA_HTML}

<script>
/* 카톡 후기 슬라이더 — 자동 재생 + 터치/마우스 스와이프.
   버튼(moveEvSlide)과 dots 동작은 그대로 두고 조작 수단만 늘렸다.
   정리는 __evSliderStop 전역 훅을 React cleanup 에서 호출한다. 자동 재생
   타이머는 스크립트 실행이 끝난 뒤에도 다시 생기므로(hover 해제, 화면 진입),
   injectContainer 의 interval 추적만으로는 부족해 이 훅이 반드시 필요하다. */
(function () {
  /* 재주입 대비 — 이전 인스턴스를 먼저 완전히 정리한다.
     이 줄이 없으면 이전 IIFE 의 setInterval 이 살아남는다. 그 타이머는 자기
     클로저의 idx 로 transform 을 계속 덮어쓰는데, __evSliderStop 은 새
     인스턴스 것으로 교체돼 버려 영영 멈출 수 없다. 두 주체가 같은 트랙을
     놓고 싸우면서 화살표 한 번에 엉뚱한 칸(-800% 등)으로 튀게 된다. */
  if (typeof window.__evSliderStop === 'function') window.__evSliderStop();

  var slider = document.getElementById('evidenceSlider');
  var track = document.getElementById('evidenceTrack');
  var dotsC = document.getElementById('evidenceDots');
  if (!slider || !track || !dotsC) return;

  var items = track.querySelectorAll('.slide-item');
  var total = items.length;
  if (!total) return;

  var EASE = 'transform 0.5s ease';
  var AUTO_MS = 4000;
  var THRESHOLD = 0.2;  /* 카드 폭의 20% 이상 끌면 다음/이전으로 확정 */

  var idx = 0;
  var timer = null;
  var onScreen = false;
  var hovered = false;
  var dragging = false;
  var startX = 0, startY = 0, moveX = 0, axis = null;

  var reduce = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  dotsC.innerHTML = '';  /* 재주입 시 dots 가 겹쳐 쌓이지 않게 비우고 새로 만든다 */
  for (var i = 0; i < total; i++) {
    var d = document.createElement('div');
    d.className = 'slide-dot' + (i === 0 ? ' active' : '');
    d.setAttribute('role', 'button');
    d.setAttribute('tabindex', '0');
    d.setAttribute('aria-label', (i + 1) + '번째 후기로 이동');
    dotsC.appendChild(d);
  }
  var dots = dotsC.querySelectorAll('.slide-dot');

  function render(animate) {
    track.style.transition = animate ? EASE : 'none';
    track.style.transform = 'translateX(' + (-idx * 100) + '%)';
    for (var j = 0; j < dots.length; j++) {
      dots[j].className = 'slide-dot' + (j === idx ? ' active' : '');
    }
  }

  function go(dir) {
    idx = (idx + dir + total) % total;
    render(true);
  }

  /* dots 클릭용 — 해당 인덱스로 바로 이동 */
  function goTo(n) {
    idx = ((n % total) + total) % total;
    render(true);
  }

  /* 자동 재생 — 화면에 보이고, hover 아니고, 드래그 중 아니고,
     동작 줄이기 설정이 아닐 때만 돈다 */
  function stopTimer() {
    if (timer) { clearInterval(timer); timer = null; }
  }
  function startTimer() {
    stopTimer();
    if (reduce || !onScreen || hovered || dragging) return;
    timer = setInterval(function () { go(1); }, AUTO_MS);
  }

  /* 버튼이 부르는 전역 — 시그니처 유지, 누르면 타이머 리셋 후 재개 */
  window.moveEvSlide = function (dir) {
    go(dir);
    startTimer();
  };

  function dragStart(x, y) {
    dragging = true;
    axis = null;
    moveX = 0;
    startX = x;
    startY = y;
    stopTimer();
    track.style.transition = 'none';
  }

  /* 가로로 판정됐을 때만 true 를 돌려준다 (그때만 preventDefault) */
  function dragMove(x, y) {
    if (!dragging) return false;
    var mx = x - startX;
    var my = y - startY;
    if (axis === null) {
      if (Math.abs(mx) < 6 && Math.abs(my) < 6) return false;
      axis = Math.abs(mx) > Math.abs(my) ? 'x' : 'y';
    }
    if (axis !== 'x') return false;
    moveX = mx;
    var pct = (moveX / (slider.clientWidth || 1)) * 100;
    track.style.transform = 'translateX(' + (-idx * 100 + pct) + '%)';
    return true;
  }

  function dragEnd() {
    if (!dragging) return;
    dragging = false;
    var moved = Math.abs(moveX);
    var w = slider.clientWidth || 1;
    if (axis === 'x' && moved > w * THRESHOLD) {
      go(moveX < 0 ? 1 : -1);
    } else {
      render(true);  /* 기준 미만이면 원위치 */
    }
    moveX = 0;
    axis = null;
    startTimer();
  }

  /* 모바일 — 터치 */
  function onTouchStart(e) {
    if (e.touches.length !== 1) return;
    dragStart(e.touches[0].clientX, e.touches[0].clientY);
  }
  function onTouchMove(e) {
    if (!dragging || e.touches.length !== 1) return;
    var t = e.touches[0];
    if (dragMove(t.clientX, t.clientY) && e.cancelable) e.preventDefault();
  }
  function onTouchEnd() { dragEnd(); }

  /* PC — 마우스만 (터치는 위에서 처리하므로 중복 방지) */
  function onPointerDown(e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    dragStart(e.clientX, e.clientY);
    e.preventDefault();
  }
  function onPointerMove(e) {
    if (e.pointerType !== 'mouse') return;
    dragMove(e.clientX, e.clientY);
  }
  function onPointerUp(e) {
    if (e.pointerType !== 'mouse') return;
    dragEnd();
  }

  function onEnter() { hovered = true; stopTimer(); }
  function onLeave() { hovered = false; startTimer(); }

  function onDotClick(e) {
    var n = Array.prototype.indexOf.call(dots, e.currentTarget);
    if (n < 0) return;
    goTo(n);
    startTimer();
  }
  function onDotKey(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    onDotClick(e);
  }

  slider.addEventListener('touchstart', onTouchStart, { passive: true });
  slider.addEventListener('touchmove', onTouchMove, { passive: false });
  slider.addEventListener('touchend', onTouchEnd);
  slider.addEventListener('touchcancel', onTouchEnd);
  slider.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);
  slider.addEventListener('mouseenter', onEnter);
  slider.addEventListener('mouseleave', onLeave);
  for (var k = 0; k < dots.length; k++) {
    dots[k].addEventListener('click', onDotClick);
    dots[k].addEventListener('keydown', onDotKey);
  }

  /* 화면 밖이면 자동 재생 정지 */
  var io = null;
  if (typeof IntersectionObserver === 'function') {
    io = new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      startTimer();
    }, { threshold: 0 });
    io.observe(slider);
  } else {
    onScreen = true;
    startTimer();
  }

  render(false);

  /* 언마운트 정리 (React cleanup 에서 호출 후 no-op 교체 — delete 금지) */
  window.__evSliderStop = function () {
    stopTimer();
    if (io) { io.disconnect(); io = null; }
    slider.removeEventListener('touchstart', onTouchStart);
    slider.removeEventListener('touchmove', onTouchMove);
    slider.removeEventListener('touchend', onTouchEnd);
    slider.removeEventListener('touchcancel', onTouchEnd);
    slider.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);
    slider.removeEventListener('mouseenter', onEnter);
    slider.removeEventListener('mouseleave', onLeave);
    for (var q = 0; q < dots.length; q++) {
      dots[q].removeEventListener('click', onDotClick);
      dots[q].removeEventListener('keydown', onDotKey);
    }
  };
})();
</script>

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
  .process-grid-4 { grid-template-columns: repeat(2, 1fr); max-width: 640px; }
  .process-grid-4 .process-card-title { font-size: 17px; }
  .process-grid-4 .process-card-desc { font-size: 14px; color: #666; }
</style>

<div class="process-section" data-track-section="process">
  <h2 class="process-title">
    방법만 알려드리지 않습니다.<br>
    <span class="highlight">저희가 직접 매장에 들어갑니다.</span>
  </h2>
  <p class="process-desc">
    1개월을 기준으로 진행하며, 일정과 범위는 계약 내용에 따라 달라질 수 있습니다.
  </p>

  <div class="process-grid process-grid-4">
    <div class="process-card">
      <div class="process-num">1</div>
      <div class="process-card-title">현장 파악 및<br>매출 전략 수립</div>
      <div class="process-card-desc">매장을 직접 방문해 현재 상황을 파악하고, 매출 전략을 세웁니다.</div>
    </div>
    <div class="process-card">
      <div class="process-num">2</div>
      <div class="process-card-title">온·오프라인<br>회원 모집 실행</div>
      <div class="process-card-desc">신규 회원이 들어오도록 모집 채널을 직접 세팅하고 실행합니다.</div>
    </div>
    <div class="process-card">
      <div class="process-num">3</div>
      <div class="process-card-title">상담·등록·재등록<br>집중 운영</div>
      <div class="process-card-desc">상담이 등록으로 이어지도록 현장에서 함께 상담하고 관리합니다.</div>
    </div>
    <div class="process-card">
      <div class="process-num">4</div>
      <div class="process-card-title">운영 시스템 교육<br>및 인수인계</div>
      <div class="process-card-desc">종료 후에도 활용할 운영 기준과 직원 교육을 인수인계합니다.</div>
    </div>
  </div>

  <button type="button" class="process-cta" data-cta="process" onclick="wtCta(this)">무료 방문 진단 신청하기</button>
</div>

<script>
  function scrollToForm() {
    window.scrollTo({
      top: document.body.scrollHeight - window.innerHeight * 2,
      behavior: 'smooth'
    });
  }
</script>

${WT_VIDEO_HTML}

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

<div class="review-section" data-track-section="review">
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
        <img src="/legacy/outsourcing/da76e27aabd5f.png" alt="운영 후기 1">
      </div>
      <div class="review-slide">
        <img src="/legacy/outsourcing/98f696e86a7a4.png" alt="운영 후기 2">
      </div>
      <div class="review-slide">
        <img src="/legacy/outsourcing/5529d2d36575b.png" alt="운영 후기 3">
      </div>
      <div class="review-slide">
        <img src="/legacy/outsourcing/eb6f67a7b56f0.jpg" alt="운영 후기 4">
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
  /* ── 전환 개선: 일반 업체 비교 제거, 더그로우 특징 중심 ── */
  .diff-list { max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; gap: 10px; text-align: left; }
  .diff-item { display: flex; align-items: flex-start; gap: 12px; background: #fff; border-radius: 12px; padding: 16px 18px; font-size: 16px; line-height: 1.55; color: #333; word-break: keep-all; }
  .diff-item b { color: #0f9d58; font-weight: 800; }
  .diff-check { flex: 0 0 24px; width: 24px; height: 24px; border-radius: 50%; background: #22B573; color: #fff; font-size: 14px; font-weight: 800; display: flex; align-items: center; justify-content: center; margin-top: 1px; }
  .diff-more { margin: 18px auto 0; max-width: 640px; font-size: 14px; color: #888; line-height: 1.6; word-break: keep-all; }
  @media (max-width: 600px) { .diff-item { font-size: 15px; padding: 14px 14px; } }
</style>

<div class="compare-section" data-track-section="compare">
  <h2 class="compare-title">
    더그로우가 직접<br>
    <span class="highlight">운영하는 방식은 다릅니다.</span>
  </h2>
  <p class="compare-desc">
    조언에서 끝나지 않고, 현장에서 함께 실행합니다.
  </p>

  <div class="diff-list">
    <div class="diff-item"><span class="diff-check">✓</span><span><b>전문 인력의 실제 현장 상주</b> - 전문가가 매장에 직접 출근해 함께 근무합니다.</span></div>
    <div class="diff-item"><span class="diff-check">✓</span><span><b>신규 회원 모집부터 상담·등록까지</b> 직접 실행합니다.</span></div>
    <div class="diff-item"><span class="diff-check">✓</span><span><b>그로우업 운영 시스템</b>을 매장에 적용하고 정착시킵니다.</span></div>
    <div class="diff-item"><span class="diff-check">✓</span><span><b>위탁 종료 이후에도 활용할 운영 기준</b>과 직원 교육을 남깁니다.</span></div>
    <div class="diff-item"><span class="diff-check">✓</span><span><b>종료 후 사후관리</b>는 계약 조건에 맞춰 제공합니다.</span></div>
  </div>
  <p class="diff-more">수수료와 사후관리의 구체적인 조건은 무료 방문 진단 후 매장 상황에 맞춰 안내드립니다.</p>
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

<div class="system-section" data-track-section="solution">
  <div class="system-badge">더그로우 운영시스템</div>

  <h2 class="system-title">
    매장에 <span class="highlight">"그로우업"</span><br>
    운영 시스템을 적용합니다.
  </h2>
  <p class="system-desc">
    센터 운영에 필요한 것을 기록하고 한눈에 파악할 수 있도록<br>
    체계적으로 설계된 운영 시스템입니다.
  </p>

  <div class="system-tags">
    <span class="system-tag">콜수 관리</span>
    <span class="system-tag">회원관리</span>
    <span class="system-tag">상담 기록</span>
    <span class="system-tag">매출표</span>
  </div>

  <details class="system-more">
    <summary>운영 시스템 자세히 보기</summary>
    <div class="system-tags system-tags-rest">
      <span class="system-tag">홍보일지</span>
      <span class="system-tag">방명록</span>
      <span class="system-tag">미등록회원</span>
      <span class="system-tag">지출표</span>
      <span class="system-tag">체크리스트</span>
    </div>
    <div class="system-images">
      <img src="/legacy/outsourcing/ec22279ad0f18.png" loading="lazy" alt="그로우업 시스템 1">
      <img src="/legacy/outsourcing/ac7e57d4e6ed1.png" loading="lazy" alt="그로우업 시스템 2">
      <img src="/legacy/outsourcing/8b7863bb913a8.png" loading="lazy" alt="그로우업 시스템 3">
    </div>
  </details>

  <div class="system-bottom">
    단순히 시스템만 드리는 게 아닙니다.<br>
    더그로우 전문가가 <span class="green">직접 매장에 상주</span>하며<br>
    이 시스템을 기반으로 <span class="green">함께 운영</span>합니다.
  </div>
</div>

<style>
  .system-more { max-width: 640px; margin: 4px auto 28px; text-align: center; }
  .system-more summary { display: inline-block; cursor: pointer; padding: 10px 20px; border: 2px solid #22B573; border-radius: 999px; color: #0f9d58; font-size: 15px; font-weight: 700; list-style: none; }
  .system-more summary::-webkit-details-marker { display: none; }
  .system-more[open] summary { background: #f1faf5; }
  .system-tags-rest { margin-top: 18px; }
</style>

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

<div class="aftercare-section" data-track-section="aftercare">
  <h2 class="aftercare-title">
    종료 후에도 이어지는<br>
    <span class="highlight">운영 점검과 피드백</span>
  </h2>
  <p class="aftercare-desc">
    운영관리본부와 마케팅본부가 종료 이후의 운영을 돕습니다.<br>
    제공 범위와 기간은 계약 조건에 따라 달라집니다.
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

${WT_MID_CTA_GRAY_HTML}

<script>
(function() {
  var opsImages = [
    '/legacy/outsourcing/3f0ff1ac29f5b.png',
    '/legacy/outsourcing/b6463a6460eaa.png',
    '/legacy/outsourcing/fdb0e426a5697.png',
    '/legacy/outsourcing/202a5a4a1b15f.png',
    '/legacy/outsourcing/fdecb5489a623.png',
    '/legacy/outsourcing/49fbd159eb995.png'
  ];

  var mktImages = [
    '/legacy/outsourcing/0bf50ac06ca1e.png',
    '/legacy/outsourcing/83c118c7daad9.png',
    '/legacy/outsourcing/8cc4e3fa743bf.png',
    '/legacy/outsourcing/36ad0318d45b1.png',
    '/legacy/outsourcing/3ffcbe2ed4627.png',
    '/legacy/outsourcing/01666bae2fbc7.png',
    '/legacy/outsourcing/c1976a1fc2340.png',
    '/legacy/outsourcing/f9f82be36cf48.png',
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

<div class="faq-section" data-track-section="faq">
  <h2 class="faq-title">
    <span class="highlight">자주 묻는 질문</span>
  </h2>
  <p class="faq-desc">대표님들이 가장 궁금해하시는 질문들을 정리했습니다.</p>

  <div class="faq-list">
    <div class="faq-item" onclick="toggleFaq(this)">
      <div class="faq-question">
        Q1. 무료 방문 진단을 받으면 위탁운영 계약을 해야 하나요?
        <div class="faq-toggle">+</div>
      </div>
      <div class="faq-answer">
        <div class="faq-answer-text">아니요. 무료 방문 진단은 매장의 현재 상황을 확인하는 단계이며, 진단을 받으셨다고 위탁운영 계약을 하셔야 하는 것은 아닙니다. 진단 내용을 확인하신 뒤 진행 여부를 결정하시면 됩니다. 무료 방문 진단의 제공 범위와 방문 가능 지역은 신청 후 담당자가 안내드립니다.</div>
      </div>
    </div>

    <div class="faq-item" onclick="toggleFaq(this)">
      <div class="faq-question">
        Q2. 실제로 전문가가 매장에 상주하나요?
        <div class="faq-toggle">+</div>
      </div>
      <div class="faq-answer">
        <div class="faq-answer-text">네. 더그로우 전문가가 대표님의 매장에 직접 출근해 함께 근무하며, 회원 모집, 상담·등록, 운영 시스템 세팅을 현장에서 함께 실행합니다.</div>
      </div>
    </div>

    <div class="faq-item" onclick="toggleFaq(this)">
      <div class="faq-question">
        Q3. 위탁운영은 정확히 얼마나 진행되나요?
        <div class="faq-toggle">+</div>
      </div>
      <div class="faq-answer">
        <div class="faq-answer-text">1개월을 기준으로 진행하며, 보통 1개월에서 45일 정도입니다. 매장 상황과 계약 범위에 따라 달라질 수 있고, 정확한 기간은 진단 후 계약 내용에 명시해 안내드립니다. 매출이 오를 때까지 기간 없이 상주하는 방식은 아닙니다.</div>
      </div>
    </div>

    <div class="faq-item" onclick="toggleFaq(this)">
      <div class="faq-question">
        Q4. 어떤 매장도 진행할 수 있나요?
        <div class="faq-toggle">+</div>
      </div>
      <div class="faq-answer">
        <div class="faq-answer-text">헬스장, 필라테스, PT샵을 중심으로 진행합니다. 매장의 상황과 지역, 운영 형태에 따라 진행이 어려운 경우도 있어서, 무료 방문 진단에서 먼저 확인한 뒤 말씀드립니다.</div>
      </div>
    </div>

    <div class="faq-item" onclick="toggleFaq(this)">
      <div class="faq-question">
        Q5. 위탁운영 비용과 수수료는 어떻게 결정되나요?
        <div class="faq-toggle">+</div>
      </div>
      <div class="faq-answer">
        <div class="faq-answer-text">수수료는 후불 방식으로 운영합니다. 구체적인 산정 기준과 금액은 진단 후 매장 상황에 맞춰 안내드리고, 계약서에 명시합니다. 무료 방문 진단을 먼저 받아보시고 판단하세요.</div>
      </div>
    </div>

    <div class="faq-item" onclick="toggleFaq(this)">
      <div class="faq-question">
        Q6. 위탁 종료 후에는 어떻게 운영하나요?
        <div class="faq-toggle">+</div>
      </div>
      <div class="faq-answer">
        <div class="faq-answer-text">종료 후에도 대표님이 직접 운영하실 수 있도록 운영 시스템과 직원 교육을 인수인계합니다. 종료 이후 운영관리본부의 점검과 피드백은 계약 조건에 따라 제공되며, 범위와 기간은 진단 시 안내드립니다.</div>
      </div>
    </div>

    <div class="faq-item" onclick="toggleFaq(this)">
      <div class="faq-question">
        Q7. 매출 상승을 보장하나요?
        <div class="faq-toggle">+</div>
      </div>
      <div class="faq-answer">
        <div class="faq-answer-text">매출 상승을 보장해 드리지는 않습니다. 현장 상주 실적과 운영 시스템을 바탕으로 최선을 다해 진행하며, 결과는 매장의 상황에 따라 다를 수 있습니다.</div>
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
  /* ── 전환 개선: 간소화 폼 ── */
  .tg-help { font-size: 13px; color: #888; margin: 6px 0 0; line-height: 1.5; }
  .tg-opt { color: #999; font-weight: 500; font-size: 13px; }
  .tg-chip-row { display: flex; flex-wrap: wrap; gap: 8px; }
  .tg-chip { display: inline-flex; align-items: center; cursor: pointer; }
  .tg-chip input { position: absolute; opacity: 0; pointer-events: none; }
  .tg-chip span { padding: 10px 16px; border: 2px solid #ddd; border-radius: 999px; font-size: 15px; font-weight: 600; color: #555; background: #fff; transition: all .15s; }
  .tg-chip input:checked + span { border-color: #22B573; background: #f1faf5; color: #0f9d58; }
  .tg-chip input:focus-visible + span { outline: 2px solid #22B573; outline-offset: 2px; }
  .tg-select { width: 100%; padding: 14px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; background: #fff; }
  .tg-consent { margin-top: 18px; padding: 14px 14px; background: #f6f6f6; border-radius: 10px; text-align: left; }
  .tg-consent label { display: flex; gap: 10px; align-items: flex-start; font-size: 14.5px; color: #333; line-height: 1.5; cursor: pointer; }
  .tg-consent input { margin-top: 3px; width: 18px; height: 18px; flex: 0 0 18px; accent-color: #22B573; }
  .tg-consent details { margin: 8px 0 0 28px; font-size: 13px; color: #666; line-height: 1.6; }
  .tg-consent summary { cursor: pointer; color: #888; }
  .tg-consent a { color: #1a9c5e; text-decoration: underline; }
  .tg-err { margin: 10px 0 0; font-size: 14px; color: #d93025; text-align: left; min-height: 0; }
  .tg-submit-btn[disabled] { opacity: .6; cursor: default; }
  .tg-done { padding: 34px 20px; text-align: center; }
  .tg-done b { display: block; font-size: 22px; color: #0f9d58; margin-bottom: 10px; }
  .tg-done span { font-size: 16px; color: #555; line-height: 1.7; word-break: keep-all; }
</style>

<div class="cta-section" id="consulting-form-wt" data-track-section="form">
  <div class="cta-inner">
    <h2 class="cta-title">
      우리 매장 <span class="highlight">무료 진단</span>,<br>
      이름과 연락처만 남겨주세요
    </h2>

    <p class="cta-subtitle">
      무료 방문 진단 후 위탁운영 진행 여부를 결정하시면 됩니다.<br>
    </p>

    <div class="tg-form-wrap" id="wtFormWrap">
      <div class="tg-form-header">
        <span class="tg-form-title">무료 방문 진단 신청</span>
      </div>

      <form id="consultingForm" action="https://script.google.com/macros/s/AKfycbyTIVLMDS-DQjOZ1fIP9DbzJ2NONxyn6mdjEik1_ZG31XB9TVO0Y5_odvFwO1M0AcJ21Q/exec" method="POST" target="hidden_iframe2" novalidate>
        <div class="tg-form-group">
          <label class="tg-label" for="wtName">이름 <span class="tg-required">*</span></label>
          <input type="text" id="wtName" name="name" class="tg-input" autocomplete="name" required />
        </div>

        <div class="tg-form-group">
          <label class="tg-label" for="wtPhone">연락처 <span class="tg-required">*</span></label>
          <input type="tel" id="wtPhone" name="phone" class="tg-input" inputmode="numeric" autocomplete="tel" placeholder="010-0000-0000" maxlength="13" required />
        </div>

        <div class="tg-form-group">
          <label class="tg-label">운영 종목 <span class="tg-required">*</span></label>
          <div class="tg-chip-row" role="radiogroup" aria-label="운영 종목">
            <label class="tg-chip"><input type="radio" name="type" value="헬스장" /><span>헬스장</span></label>
            <label class="tg-chip"><input type="radio" name="type" value="필라테스" /><span>필라테스</span></label>
            <label class="tg-chip"><input type="radio" name="type" value="PT샵" /><span>PT샵</span></label>
            <label class="tg-chip"><input type="radio" name="type" value="기타" /><span>기타</span></label>
          </div>
          <input type="text" name="typeEtc" id="wtTypeEtc" class="tg-input" placeholder="기타 종목을 직접 입력해주세요" style="display:none;margin-top:10px;" />
        </div>

        <div class="tg-form-group">
          <label class="tg-label" for="wtArea">매장 지역 <span class="tg-opt">(선택)</span></label>
          <input type="text" id="wtArea" name="area" class="tg-input" placeholder="예) 서울 마포구, 경기 수원" />
        </div>

        <div class="tg-form-group">
          <label class="tg-label">현재 가장 큰 고민 <span class="tg-opt">(선택)</span></label>
          <div class="tg-chip-row" role="radiogroup" aria-label="현재 가장 큰 고민">
            <label class="tg-chip"><input type="radio" name="concern" value="신규 회원 부족" /><span>신규 회원 부족</span></label>
            <label class="tg-chip"><input type="radio" name="concern" value="상담 후 등록 저조" /><span>상담 후 등록 저조</span></label>
            <label class="tg-chip"><input type="radio" name="concern" value="직원·운영 관리" /><span>직원·운영 관리</span></label>
            <label class="tg-chip"><input type="radio" name="concern" value="남는 매출 부족" /><span>남는 매출 부족</span></label>
            <label class="tg-chip"><input type="radio" name="concern" value="기타" /><span>기타</span></label>
          </div>
        </div>

        <div class="tg-form-group" id="wtRouteWrap" style="display:none;">
          <label class="tg-label" for="wtRouteSel">알게 된 경로 <span class="tg-opt">(선택)</span></label>
          <select id="wtRouteSel" class="tg-select">
            <option value="">선택해주세요</option>
            <option value="네이버 검색">네이버 검색</option>
            <option value="인스타·페이스북 광고">인스타·페이스북 광고</option>
            <option value="네이버 블로그">네이버 블로그</option>
            <option value="지인 소개·아카데미 수강생">지인 소개·아카데미 수강생</option>
            <option value="기타">기타</option>
          </select>
        </div>

        <!-- 기존 시트 연동 호환용 숨김 필드 (이메일·연락처 확인란은 입력받지 않는다) -->
        <input type="hidden" name="email" value="">
        <input type="hidden" name="phone1" value=""><input type="hidden" name="phone2" value=""><input type="hidden" name="phone3" value="">
        <input type="hidden" name="phoneCheck1" value=""><input type="hidden" name="phoneCheck2" value=""><input type="hidden" name="phoneCheck3" value="">
        <input type="hidden" name="route" id="wtRoute" value="">

        <!-- 페이지 구분 -->
        <input type="hidden" name="source" value="위탁상담2">

        <!-- 🔒 보안 토큰 -->
        <input type="hidden" name="token" value="grow2026secure">

        <div class="tg-consent">
          <label>
            <input type="checkbox" id="wtConsent" name="privacyConsent" value="Y" />
            <span>[필수] 개인정보 수집·이용에 동의합니다.</span>
          </label>
          <details>
            <summary>자세히 보기</summary>
            수집 항목: 이름, 연락처, 운영 종목, 매장 지역·고민(선택)<br>
            이용 목적: 무료 방문 진단 신청 접수 및 상담 연락<br>
            보관 기간: 상담 목적 달성 후 지체 없이 파기하며, 관계 법령상 보관이 필요한 경우 그 기간 동안 보관합니다.<br>
            동의를 거부할 수 있으나, 거부 시 무료 진단 신청이 제한됩니다.<br>
            <a href="/legal/privacy" target="_blank" rel="noopener">개인정보처리방침 보기</a>
          </details>
        </div>

        <p class="tg-err" id="wtErr" role="alert"></p>

        <div class="tg-form-actions">
          <button type="submit" class="tg-submit-btn" id="wtSubmit">무료 진단 신청 완료하기</button>
        </div>

        <p class="form-notice">* 신청 후 1-2일 내 연락드립니다.</p>
      </form>

      <iframe name="hidden_iframe2" id="wtHiddenFrame" title="신청 전송" style="display:none;"></iframe>
    </div>
  </div>
</div>

<script>
/* IIFE 로 감싼다 — 주입 스크립트는 전역 스코프에서 실행되므로 최상위 const 금지(재주입 시 SyntaxError). */
(function () {
  var form = document.getElementById('consultingForm');
  if (!form) return;
  if (form.dataset.wtBound === '1') return;
  form.dataset.wtBound = '1';

  var FORM_SOURCE = '위탁상담2';
  var frame = document.getElementById('wtHiddenFrame');
  var btn = document.getElementById('wtSubmit');
  var errEl = document.getElementById('wtErr');
  var routeEl = document.getElementById('wtRoute');
  var routeWrap = document.getElementById('wtRouteWrap');
  var routeSel = document.getElementById('wtRouteSel');
  var typeEtc = document.getElementById('wtTypeEtc');
  var phoneEl = document.getElementById('wtPhone');
  var wrap = document.getElementById('wtFormWrap');

  var VARIANT = 'v2';
  function ga(name, params) {
    try {
      if (typeof window.gtag === 'function') {
        var pp = params || {};
        pp.landing_variant = VARIANT;
        window.gtag('event', name, pp);
      }
    } catch (e) {}
  }

  /* ── 유입 경로 자동 판별: 방문 추적(VisitTracker)이 저장한 세션 → URL 파라미터 → referrer 순 ── */
  function detectRoute() {
    var base = '';
    var utm = '';
    try {
      var sp = new URLSearchParams(window.location.search);
      var us = sp.get('utm_source') || '';
      var uc = sp.get('utm_campaign') || '';
      var um = sp.get('utm_medium') || '';
      if (us || uc || um) utm = [us, um, uc].join('/');
      var meta = /facebook|^fb$|instagram|^ig$|meta/i.test(us) || !!sp.get('fbclid');
      if (meta) base = '인스타·페이스북 광고';
    } catch (e) {}
    var sess = null;
    try { sess = JSON.parse(window.localStorage.getItem('tgc:vt:session') || 'null'); } catch (e) {}
    if (!base && sess && sess.src) {
      if (sess.src === 'paid_meta') base = '인스타·페이스북 광고';
      else if (sess.src === 'organic_naver') base = '네이버 검색';
      else if (sess.src === 'organic_google') base = '기타 (구글 검색)';
      else if (sess.src === 'ai') base = '기타 (AI 검색)';
      else if (sess.src === 'referral' && sess.ref && /blog[.]naver/i.test(sess.ref)) base = '네이버 블로그';
    }
    if (!base) {
      var ref = '';
      try { ref = document.referrer || ''; } catch (e) {}
      if (/blog[.]naver/i.test(ref)) base = '네이버 블로그';
      else if (/search[.]naver|naver[.]com/i.test(ref)) base = '네이버 검색';
      else if (/instagram|facebook|l[.]facebook/i.test(ref)) base = '인스타·페이스북 광고';
    }
    if (!utm && sess && sess.utm && (sess.utm.s || sess.utm.m || sess.utm.c)) {
      utm = [sess.utm.s || '', sess.utm.m || '', sess.utm.c || ''].join('/');
    }
    return { base: base, utm: utm };
  }
  var detected = detectRoute();
  if (!detected.base && routeWrap) routeWrap.style.display = '';

  /* ── 연락처: 숫자만, 010-0000-0000 형태로 자동 정리 ── */
  function fmtPhone(v) {
    var d = String(v || '').replace(/[^0-9]/g, '').slice(0, 11);
    if (d.length < 4) return d;
    if (d.length < 8) return d.slice(0, 3) + '-' + d.slice(3);
    if (d.length < 11) return d.slice(0, 3) + '-' + d.slice(3, 6) + '-' + d.slice(6);
    return d.slice(0, 3) + '-' + d.slice(3, 7) + '-' + d.slice(7);
  }
  phoneEl.addEventListener('input', function () { this.value = fmtPhone(this.value); });

  /* ── 기타 종목 입력칸 ── */
  Array.prototype.forEach.call(form.querySelectorAll('input[name="type"]'), function (r) {
    r.addEventListener('change', function () {
      var on = form.querySelector('input[name="type"]:checked');
      var isEtc = !!on && on.value === '기타';
      typeEtc.style.display = isEtc ? '' : 'none';
      if (isEtc) typeEtc.focus();
    });
  });

  /* form_start·form_submit 은 GA4 향상된 측정(양식 상호작용)이 자동으로 보낸다.
     같은 이름의 커스텀 이벤트를 또 보내면 1건이 2건으로 집계되므로 보내지 않는다. */

  function showErr(msg) { errEl.textContent = msg || ''; }

  var sending = false;
  var done = false;
  var timer = null;

  function finishSuccess(routeValue) {
    if (done) return;
    done = true;
    if (timer) { clearTimeout(timer); timer = null; }
    var vv = window.__wtVid || { started: false, maxPct: 0 };
    var p = { form_source: FORM_SOURCE, lead_source: routeValue, video_started: vv.started ? 1 : 0, video_max_pct: vv.maxPct || 0 };
    /* 실제 전송 성공 시점에 한 번씩만. (form_submit 은 향상된 측정이 제출 클릭 때 이미 자동 전송한다) */
    ga('form_submit_success', p);
    ga('generate_lead', p);
    try {
      if (typeof window.__tgcFbTrack === 'function') window.__tgcFbTrack('Lead', { content_name: FORM_SOURCE, landing_variant: VARIANT });
    } catch (e) {}
    wrap.innerHTML = '<div class="tg-done" role="status"><b>무료 진단 신청이 접수되었습니다.</b><span>신청 후 1-2일 내 담당자가 연락드립니다.<br>감사합니다.</span></div>';
  }

  function finishFail() {
    if (done) return;
    sending = false;
    if (timer) { clearTimeout(timer); timer = null; }
    btn.disabled = false;
    btn.textContent = '무료 진단 신청 완료하기';
    showErr('접수 응답을 확인하지 못했습니다. 잠시 후 다시 시도해주세요.');
  }

  /* 숨김 iframe 의 load = 서버(시트) 응답이 돌아온 것. 제출 전의 초기 load 는 무시한다. */
  var routeAtSubmit = '';
  frame.addEventListener('load', function () {
    if (!sending || done) return;
    var ok = true;
    try {
      var d = frame.contentDocument;
      if (d && d.body && /error|오류|실패/i.test(d.body.innerText || '') && !/ok|success|성공/i.test(d.body.innerText || '')) ok = false;
    } catch (e) { /* 교차 출처 — 응답이 돌아온 것으로 본다 */ }
    if (ok) finishSuccess(routeAtSubmit); else finishFail();
  });

  form.addEventListener('submit', function (e) {
    if (sending || done) { e.preventDefault(); return; }
    showErr('');

    var name = form.querySelector('[name="name"]').value.trim();
    var digits = phoneEl.value.replace(/[^0-9]/g, '');
    var typeRadio = form.querySelector('input[name="type"]:checked');
    var etc = typeEtc.value.trim();

    if (!name) { e.preventDefault(); showErr('이름을 입력해주세요.'); form.querySelector('[name="name"]').focus(); return; }
    if (!/^01[016789][0-9]{7,8}$/.test(digits)) { e.preventDefault(); showErr('연락처를 올바르게 입력해주세요. (예: 010-0000-0000)'); phoneEl.focus(); return; }
    if (!typeRadio) { e.preventDefault(); showErr('운영 종목을 선택해주세요.'); return; }
    if (typeRadio.value === '기타' && !etc) { e.preventDefault(); showErr('기타 종목을 입력해주세요.'); typeEtc.focus(); return; }
    if (!document.getElementById('wtConsent').checked) { e.preventDefault(); showErr('개인정보 수집·이용에 동의해주세요.'); return; }

    /* 기존 시트 열 호환: 번호 3칸 + 확인 3칸(같은 값), 기타 종목 최종값 */
    var p1 = digits.slice(0, 3);
    var p2 = digits.length === 11 ? digits.slice(3, 7) : digits.slice(3, 6);
    var p3 = digits.length === 11 ? digits.slice(7) : digits.slice(6);
    var set = function (n, v) { form.querySelector('[name="' + n + '"]').value = v; };
    set('phone1', p1); set('phone2', p2); set('phone3', p3);
    set('phoneCheck1', p1); set('phoneCheck2', p2); set('phoneCheck3', p3);
    var old = form.querySelector('[name="typeFinal"]');
    if (old) old.remove();
    if (typeRadio.value === '기타' && etc) {
      var hidden = document.createElement('input');
      hidden.type = 'hidden'; hidden.name = 'typeFinal'; hidden.value = '기타 - ' + etc;
      form.appendChild(hidden);
    }

    /* 유입 경로(자동) + 선택 입력(지역·고민)을 시트의 기존 route 열에 이어 붙인다 */
    var base = detected.base || (routeSel && routeSel.value) || '직접 방문·미확인';
    var r = base;
    if (detected.utm) r += ' / UTM: ' + detected.utm;
    var area = form.querySelector('[name="area"]').value.trim();
    var concern = form.querySelector('input[name="concern"]:checked');
    if (area) r += ' / 지역: ' + area;
    if (concern) r += ' / 고민: ' + concern.value;
    /* 시트에서 A/B 를 구분할 수 있게 route 열 끝에 버전을 붙인다(source·열 구조는 그대로) */
    r += ' / 랜딩: ' + VARIANT;
    routeEl.value = r;
    routeAtSubmit = base;

    sending = true;
    btn.disabled = true;
    btn.textContent = '전송 중...';
    timer = setTimeout(finishFail, 15000);
    /* 기본 제출(숨김 iframe 대상)을 그대로 진행한다 */
  });
})();
</script>`;

export default function OutsourcingConsultingPage() {
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
        // moveEvSlide 는 delete 하지 않는다 — 아래에서 no-op 으로 교체한다
        "moveRevSlide",
        "acSlide",
        "scrollToForm",
        "wtScrollToForm",
        "wtScrollToVideo",
        "wtCta",
        "wtScrollToProof",
      ];
      const w = window as unknown as Record<string, unknown>;

      // 후기 영상 정리 — IntersectionObserver 해제 + 재생 중지.
      // 호출한 뒤 no-op 으로 바꾼다 (delete 금지: 남아 있는 핸들러가 터진다)
      const stopVid = w["__wtVidStop"];
      if (typeof stopVid === "function") (stopVid as () => void)();
      w["__wtVidStop"] = () => {};

      // 카톡 후기 슬라이더 정리 — 자동재생 타이머 + 스와이프 리스너 + 옵저버.
      // 이 타이머는 스크립트 실행이 끝난 뒤에도 다시 생기므로(hover 해제, 화면
      // 진입) 아래 interval 추적만으로는 잡히지 않아 이 훅이 꼭 필요하다.
      const stopSlider = w["__evSliderStop"];
      if (typeof stopSlider === "function") (stopSlider as () => void)();
      w["__evSliderStop"] = () => {};
      // 인라인 onclick="moveEvSlide(...)" 이 남아 있을 수 있어 no-op 으로 둔다
      w["moveEvSlide"] = () => {};

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
    <div className="bg-white">
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

      {/* 모바일 하단 고정 CTA 바 (768px 미만에서만 노출).
          mounted 로 감싸는 이유: StickyCtaBar 는 마운트 시점에 한 번만
          targetSelector 를 찾는다. DETAIL_HTML 이 붙기 전에 마운트되면 폼을
          못 찾아 옵저버가 아예 안 걸린다. */}
      {mounted ? (
        <div className="md:hidden">
          <div
            onClickCapture={() => {
              const w = window as unknown as { gtag?: (...a: unknown[]) => void };
              if (typeof w.gtag === "function") {
                w.gtag("event", "cta_click", {
                  cta_location: "sticky",
                  cta_text: "우리 매장 무료 진단 신청하기",
                  form_source: "위탁상담2",
                });
              }
            }}
          >
            <StickyCtaBar
              label="우리 매장 무료 진단 신청하기"
              targetSelector="#consulting-form-wt"
            />
          </div>
        </div>
      ) : null}

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
