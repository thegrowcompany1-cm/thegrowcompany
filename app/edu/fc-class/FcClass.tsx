"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 정규 FC 클래스 랜딩 (1/3차) — 그로우 아카데미
//  · 클래스 접두사 fc1- (아임웹 원본 클래스명 리네이밍, CSS 충돌 방지)
//  · 최상단(랜덤 강의사진 + 결제 카드)은 React JSX, 히어로/문제/해결은 DETAIL_HTML 주입
//  · injectContainer 로 <script> 재생성 append (문제 섹션 IntersectionObserver)
//  · IntersectionObserver 는 __fc1Stop 으로 언마운트 시 disconnect (전역함수 no-op 교체)
//  · 다음 기수 때는 상단 SEMINAR_* / PRICE_* 상수만 수정
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";

/* ▼▼ 다음 기수 때 이 상수만 수정 ▼▼ */
const SEMINAR_DATE = "준비중";
const SEMINAR_TIME = "총 4시간";
const SEMINAR_PLACE = "준비중";
const PRICE_ORIGINAL = "290,000원";
const PRICE_SALE = "190,000원";
/* ▲▲ 여기까지 ▲▲ */

// 최상단 좌측 강의 사진 후보 — 로드 시 클라이언트에서 1장 랜덤 선택
const LECTURE_IMAGES = [
  "https://cdn.imweb.me/thumbnail/20260131/2c27053d77aa7.jpg",
  "https://cdn.imweb.me/thumbnail/20260131/585cf1ee7e5d1.jpg",
  "https://cdn.imweb.me/thumbnail/20260131/c51e290737724.jpg",
  "https://cdn.imweb.me/thumbnail/20260131/d71d22f9eea53.jpg",
  "https://cdn.imweb.me/thumbnail/20260131/2f1084024ac28.jpg",
  "https://cdn.imweb.me/thumbnail/20260131/c8b4857c6a396.jpg",
  "https://cdn.imweb.me/thumbnail/20260131/4b9ce2fb80778.jpg",
  "https://cdn.imweb.me/thumbnail/20260131/626df956ffc13.jpg",
];

const TOP_STYLE = `@keyframes fc1Pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}.fc1-pulse{animation:fc1Pulse 2.2s ease-in-out infinite}`;

const DETAIL_HTML = `<div class="fc1">
<style>
.fc1{--g:#22B573;font-family:'Pretendard',-apple-system,BlinkMacSystemFont,system-ui,'Apple SD Gothic Neo',sans-serif;letter-spacing:-0.01em;overflow:hidden}
.fc1 *{box-sizing:border-box}
.fc1-wrap{max-width:820px;margin:0 auto;padding:0 20px}
.fc1-sec{padding:64px 0}
@media(max-width:640px){.fc1-sec{padding:52px 0}}

@keyframes fc1FadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
.fc1-fu{opacity:0;animation:fc1FadeUp .8s ease forwards}
.fc1-d1{animation-delay:.15s}.fc1-d2{animation-delay:.45s}.fc1-d3{animation-delay:.75s}
.fc1-d4{animation-delay:1.05s}.fc1-d5{animation-delay:1.35s}.fc1-d6{animation-delay:1.65s}

.fc1-reveal{opacity:0;transform:translateY(28px);transition:opacity .7s ease,transform .7s ease}
.fc1-reveal.fc1-in{opacity:1;transform:none}
.fc1-pcards .fc1-pcard:nth-child(2){transition-delay:.12s}
.fc1-pcards .fc1-pcard:nth-child(3){transition-delay:.24s}
.fc1-points .fc1-point:nth-child(2){transition-delay:.12s}
.fc1-points .fc1-point:nth-child(3){transition-delay:.24s}

/* 1 히어로 */
.fc1-hero{position:relative;min-height:90vh;display:flex;align-items:center;justify-content:center;text-align:center;color:#fff;overflow:hidden;background:#000}
.fc1-hero-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;animation:fc1Pan 20s ease-in-out infinite alternate;will-change:transform}
@keyframes fc1Pan{from{transform:scale(1.1) translateX(-2.5%)}to{transform:scale(1.1) translateX(2.5%)}}
.fc1-hero-ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.45) 0%,rgba(0,0,0,.72) 60%,rgba(0,0,0,.85) 100%)}
.fc1-hero-in{position:relative;z-index:2;padding:44px 20px;max-width:820px}
.fc1-hero-sub{font-size:15px;letter-spacing:.1em;color:#bfe6d4;margin:0 0 26px;font-weight:600}
.fc1-hero-q{font-size:26px;font-weight:800;line-height:1.5;margin:0 0 14px}
.fc1-red{color:#ff5d5d}
.fc1-divider{display:block;width:60px;height:3px;background:var(--g);border-radius:2px;margin:30px auto}
.fc1-hero-big{font-size:46px;font-weight:900;color:#ffd83d;margin:0 0 16px}
.fc1-hero-close{font-size:22px;font-weight:700;line-height:1.55;margin:0;color:#f0f0f0}
.fc1-scroll{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);z-index:2;opacity:0;animation:fc1ScrollIn 1s ease 1.9s forwards}
@keyframes fc1ScrollIn{to{opacity:1}}
.fc1-mouse{display:block;width:26px;height:42px;border:2px solid rgba(255,255,255,.55);border-radius:14px;position:relative}
.fc1-mouse::before{content:'';position:absolute;left:50%;top:8px;width:4px;height:8px;margin-left:-2px;background:#fff;border-radius:2px;animation:fc1Wheel 1.6s ease infinite}
@keyframes fc1Wheel{0%{opacity:0;transform:translateY(0)}30%{opacity:1}100%{opacity:0;transform:translateY(12px)}}
@media(max-width:640px){.fc1-hero{min-height:86vh}.fc1-hero-q{font-size:20px}.fc1-hero-big{font-size:34px}.fc1-hero-close{font-size:18px}}

/* 공통 헤딩 */
.fc1-h2{font-size:28px;font-weight:800;text-align:center;line-height:1.45;margin:0 0 12px;color:inherit}
.fc1-h2 em{font-style:normal;color:var(--g)}
.fc1-sub{font-size:16px;text-align:center;margin:0 0 8px;opacity:.72}
@media(max-width:640px){.fc1-h2{font-size:23px}}

/* 2 문제 */
.fc1-problem{background:#0A0A0A;color:#fff}
.fc1-pcards{display:flex;flex-direction:column;gap:14px;max-width:640px;margin:36px auto 0}
.fc1-pcard{background:#141414;border:1px solid #232323;border-left:4px solid #e23b3b;border-radius:14px;padding:24px}
.fc1-pcard-no{color:#e23b3b;font-weight:900;font-size:14px;margin-bottom:8px;letter-spacing:.06em}
.fc1-pcard h3{font-size:18px;font-weight:800;margin:0 0 10px;line-height:1.45}
.fc1-pcard p{font-size:15px;color:#bdbdbd;line-height:1.7;margin:0}
.fc1-pbox{max-width:640px;margin:32px auto 0;background:#111;border:1px solid #222;border-radius:18px;padding:30px 26px;text-align:center}
.fc1-pbox p{margin:0;font-size:17px;line-height:1.8;color:#eee}
.fc1-pbox em{font-style:normal;color:var(--g);font-weight:700}

/* 3 해결책 */
.fc1-solution{background:#fff;color:#141414}
.fc1-solution .fc1-wrap{text-align:center}
.fc1-badge{display:inline-block;background:rgba(34,181,115,.12);color:var(--g);font-size:12px;font-weight:800;padding:7px 16px;border-radius:50px;letter-spacing:.04em;margin-bottom:14px}
.fc1-sub-dark{color:#555;opacity:1}
.fc1-points{display:flex;flex-direction:column;gap:16px;max-width:680px;margin:36px auto 0;text-align:left}
.fc1-point{background:#fafafa;border:1px solid #eee;border-radius:16px;padding:28px 26px}
.fc1-point-label{color:var(--g);font-weight:800;font-size:13px;margin-bottom:8px;letter-spacing:.02em}
.fc1-point h3{font-size:19px;font-weight:800;color:#161616;margin:0 0 10px;line-height:1.45}
.fc1-point p{font-size:15px;color:#555;line-height:1.75;margin:0}
.fc1-summary{max-width:680px;margin:34px auto 0;background:#111;color:#fff;border-radius:20px;padding:36px 30px;text-align:center}
.fc1-summary p{margin:0;font-size:19px;font-weight:800;line-height:1.7}
.fc1-summary em{font-style:normal;color:var(--g)}
.fc1-summary-500{margin-top:18px !important;font-size:14px !important;font-weight:600 !important;color:#aaa !important}

/* 4 강사 프로필 */
.fc1-inst{background:#111;color:#fff}
.fc1-inst .fc1-wrap{text-align:center}
.fc1-inst-cards{display:grid;grid-template-columns:1fr 1fr;gap:20px;max-width:900px;margin:40px auto 0;text-align:left}
.fc1-inst-card{background:#171717;border:1px solid #262626;border-radius:20px;overflow:hidden}
.fc1-inst-photo{position:relative;width:100%;aspect-ratio:4/5;background:#1c1c1c}
.fc1-inst-photo img{width:100%;height:100%;object-fit:cover;object-position:center top;display:block}
.fc1-inst-body{padding:24px 22px}
.fc1-inst-tags{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:14px}
.fc1-inst-tag{font-size:12px;font-weight:700;color:var(--g);background:rgba(34,181,115,.12);border-radius:50px;padding:5px 12px}
.fc1-inst-role{font-size:20px;font-weight:900;color:#fff;margin:0 0 6px}
.fc1-inst-tagline{font-size:14px;color:#bdbdbd;margin:0 0 18px;line-height:1.6}
.fc1-inst-career{list-style:none;padding:0;margin:0 0 18px;display:flex;flex-direction:column;gap:7px}
.fc1-inst-career li{position:relative;padding-left:14px;font-size:13.5px;color:#cfcfcf;line-height:1.5}
.fc1-inst-career li::before{content:'';position:absolute;left:0;top:8px;width:4px;height:4px;border-radius:50%;background:var(--g)}
.fc1-inst-cur{background:#0e0e0e;border:1px solid #242424;border-radius:14px;padding:18px}
.fc1-inst-cur-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
.fc1-inst-cur-title{font-size:13px;font-weight:800;color:#fff}
.fc1-inst-cur-badge{font-size:11px;font-weight:800;color:var(--g);border:1px solid var(--g);border-radius:50px;padding:3px 10px;white-space:nowrap}
.fc1-inst-cur ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px}
.fc1-inst-cur li{position:relative;padding-left:16px;font-size:13px;color:#c8c8c8;line-height:1.5}
.fc1-inst-cur li::before{content:'✓';position:absolute;left:0;top:0;color:var(--g);font-size:11px;font-weight:800}
@media(max-width:760px){.fc1-inst-cards{grid-template-columns:1fr}}

/* 5 커리큘럼 타임라인 */
.fc1-curri{background:#22c55e;color:#fff}
.fc1-curri .fc1-wrap{text-align:center}
.fc1-curri .fc1-badge{background:rgba(255,255,255,.2);color:#fff}
.fc1-curri .fc1-h2{color:#fff}
.fc1-curri .fc1-sub{color:#fff;opacity:.92}
.fc1-meta{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:16px}
.fc1-meta-chip{font-size:13px;font-weight:700;color:#fff;background:rgba(255,255,255,.18);border-radius:50px;padding:7px 16px}
.fc1-timeline{max-width:680px;margin:40px auto 0;text-align:left}
.fc1-tl-item{position:relative;padding-left:64px;padding-bottom:28px}
.fc1-tl-item:last-child{padding-bottom:0}
.fc1-tl-item::before{content:'';position:absolute;left:21px;top:46px;bottom:-2px;width:2px;background:rgba(255,255,255,.55)}
.fc1-tl-item:last-child::before{display:none}
.fc1-tl-node{position:absolute;left:0;top:0;width:44px;height:44px;border-radius:50%;background:#fff;color:#16a34a;font-weight:900;font-size:18px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.18);z-index:2}
.fc1-tl-card{background:#fff;color:#141414;border-radius:16px;padding:24px;box-shadow:0 8px 24px rgba(0,0,0,.12)}
.fc1-tl-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px}
.fc1-tl-time{font-size:12px;font-weight:800;color:#16a34a;border:1px solid #16a34a;border-radius:50px;padding:2px 10px}
.fc1-tl-who{font-size:12px;font-weight:700;color:#888}
.fc1-tl-title{font-size:18px;font-weight:900;color:#161616;margin:0 0 10px}
.fc1-tl-quote{font-size:13.5px;color:#555;line-height:1.6;margin:0 0 16px;padding-left:12px;border-left:3px solid #22c55e}
.fc1-tl-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px}
.fc1-tl-list li{position:relative;padding-left:18px;font-size:14px;color:#333;line-height:1.55}
.fc1-tl-list li::before{content:'';position:absolute;left:0;top:8px;width:6px;height:6px;border-radius:50%;background:#22c55e}
.fc1-tl-item.is-qna .fc1-tl-node{background:#141414;color:#fff;font-size:20px}
.fc1-tl-item.is-qna .fc1-tl-card{background:#141414;color:#fff}
.fc1-tl-item.is-qna .fc1-tl-title{color:#fff}
.fc1-tl-item.is-qna .fc1-tl-quote{color:#cfcfcf}
.fc1-tl-item.is-qna .fc1-tl-list li{color:#dcdcdc}
.fc1-tl-item.is-qna .fc1-tl-who{color:#aaa}

/* 6 후기 슬라이더 */
.fc1-rev{background:#f8f9fa;color:#141414}
.fc1-rev .fc1-wrap{text-align:center}
.fc1-rev-label{font-size:13px;font-weight:800;color:var(--g);letter-spacing:.04em;margin:0 0 10px}
.fc1-red2{color:#e23b3b}
.fc1-rev-track-wrap{position:relative;max-width:1000px;margin:36px auto 0}
.fc1-rev-track{display:flex;gap:16px;overflow-x:auto;scroll-snap-type:x mandatory;padding:6px 20px 20px;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.fc1-rev-track::-webkit-scrollbar{display:none}
.fc1-rev-card{flex:0 0 280px;width:280px;height:500px;scroll-snap-align:center;border-radius:16px;overflow:hidden;background:#e9ecef;box-shadow:0 8px 24px rgba(0,0,0,.1)}
.fc1-rev-card img{width:100%;height:100%;object-fit:cover;display:block}
.fc1-rev-arrow{position:absolute;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:50%;background:#fff;border:1px solid #e2e2e2;box-shadow:0 4px 14px rgba(0,0,0,.12);cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:3;color:#333;font-size:20px;line-height:1}
.fc1-rev-prev{left:-4px}
.fc1-rev-next{right:-4px}
.fc1-rev-dots{display:flex;gap:8px;justify-content:center;margin-top:18px}
.fc1-rev-dot{width:8px;height:8px;border-radius:50%;background:#ccc;border:none;padding:0;cursor:pointer;transition:.25s}
.fc1-rev-dot.is-active{background:var(--g);width:22px;border-radius:5px}
.fc1-rev-hint{font-size:12px;color:#999;margin-top:12px}
@media(max-width:640px){.fc1-rev-card{flex:0 0 240px;width:240px;height:420px}.fc1-rev-arrow{display:none}}

/* 7 성과 데이터 */
.fc1-result{background:#fff;color:#141414}
.fc1-result .fc1-wrap{text-align:center}
.fc1-hl{background:linear-gradient(transparent 60%,rgba(34,197,94,.35) 60%)}
.fc1-res-sub{font-size:16px;font-weight:800;color:#333;margin:40px 0 16px}
.fc1-res-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:760px;margin:0 auto}
.fc1-res-grid img{width:100%;height:auto;display:block;border-radius:14px;border:1px solid #eee}
.fc1-res-big{display:block;width:100%;max-width:760px;margin:0 auto;border-radius:16px;border:1px solid #eee}
@media(max-width:640px){.fc1-res-grid{grid-template-columns:1fr}}

.fc1-reveal-scale{opacity:0;transform:scale(.94);transition:opacity .7s ease,transform .7s ease}
.fc1-reveal-scale.fc1-in{opacity:1;transform:scale(1)}
</style>

<!-- 1. 히어로 -->
<section class="fc1-hero">
  <img class="fc1-hero-bg" src="https://cdn.imweb.me/thumbnail/20251024/6b0de22aa5b3b.jpg" alt="정규 FC 클래스 강의 현장 배경">
  <div class="fc1-hero-ov"></div>
  <div class="fc1-hero-in">
    <p class="fc1-hero-sub fc1-fu fc1-d1">— 정규 FC 클래스 —</p>
    <p class="fc1-hero-q fc1-fu fc1-d2">매달 신규 문의 때문에<br><span class="fc1-red">잠 못 드는 밤</span>이 있습니다.</p>
    <p class="fc1-hero-q fc1-fu fc1-d3">혹시 <span class="fc1-red">적자를 겨우 면하고</span> 있는 달도 있습니다.</p>
    <span class="fc1-divider fc1-fu fc1-d4"></span>
    <p class="fc1-hero-big fc1-fu fc1-d5">걱정마세요</p>
    <p class="fc1-hero-close fc1-fu fc1-d6">어쩌면 이 강의로<br>상황이 바뀔지도 모릅니다.</p>
  </div>
  <div class="fc1-scroll" aria-hidden="true"><span class="fc1-mouse"></span></div>
</section>

<!-- 2. 문제 -->
<section class="fc1-sec fc1-problem">
  <div class="fc1-wrap">
    <h2 class="fc1-h2 fc1-reveal">매출이 잘 오르지 않는 이유는<br>아마도 이 <em>3가지 중 1개</em>일 확률이 큽니다.</h2>
    <p class="fc1-sub fc1-reveal">해당되는 부분이 있는지 확인해보세요.</p>
    <div class="fc1-pcards">
      <div class="fc1-pcard fc1-reveal">
        <div class="fc1-pcard-no">CASE 01</div>
        <h3>매출 부진을 외부 탓으로 돌리고 있습니다.</h3>
        <p>경기, 상권, 주변 경쟁… 안 되는 이유를 밖에서 찾으며, 어쩔 수 없는 일이라고 받아들이고 계신지도 모릅니다.</p>
      </div>
      <div class="fc1-pcard fc1-reveal">
        <div class="fc1-pcard-no">CASE 02</div>
        <h3>수업 실력은 최고지만, 운영은 배운 적이 없습니다.</h3>
        <p>회원을 가르치는 전문성은 뛰어나지만, 매장을 매출이 나오는 구조로 '운영'하는 법은 아무도 알려주지 않았습니다.</p>
      </div>
      <div class="fc1-pcard fc1-reveal">
        <div class="fc1-pcard-no">CASE 03</div>
        <h3>좋은 프로그램을 알릴 방법을 모릅니다.</h3>
        <p>실력과 콘텐츠는 충분한데, 신규 고객에게 제대로 알리고 유입시키는 마케팅을 몰라 문의가 끊깁니다.</p>
      </div>
    </div>
    <div class="fc1-pbox fc1-reveal">
      <p>그래서 준비했습니다.<br><em>고객관리, 상담, 재등록, 서비스, 관리시스템, 마케팅</em> 등<br>매출에 관련된 모든 부분을 교육해드립니다.</p>
    </div>
  </div>
</section>

<!-- 3. 해결책 -->
<section class="fc1-sec fc1-solution">
  <div class="fc1-wrap">
    <span class="fc1-badge fc1-reveal">그로우 아카데미 FC 클래스</span>
    <h2 class="fc1-h2 fc1-reveal">단순히 듣기만 하는<br>교육이 아닙니다.</h2>
    <p class="fc1-sub fc1-sub-dark fc1-reveal">현장에서 바로 쓰는 실전을, 직접 겪은 사람에게 배웁니다.</p>
    <div class="fc1-points">
      <div class="fc1-point fc1-reveal">
        <div class="fc1-point-label">직접 매장을 운영하는 사람</div>
        <h3>이론이 아니라, 지금도 매장을 운영하는 사람이 가르칩니다.</h3>
        <p>책에서 배운 이론이 아닌, 지금 이 순간에도 현장에서 검증하고 있는 실전 노하우를 그대로 전달합니다.</p>
      </div>
      <div class="fc1-point fc1-reveal">
        <div class="fc1-point-label">업계 출신 강사</div>
        <h3>피트니스 현장을 직접 겪은 사람이 압니다.</h3>
        <p>업계를 겪어본 사람만이 아는 진짜 문제와 해법을, 대표님의 상황에 맞춰 짚어드립니다.</p>
      </div>
      <div class="fc1-point fc1-reveal">
        <div class="fc1-point-label">검증된 강사 2인 직강</div>
        <h3>운영과 마케팅, 각 분야 전문가가 직접 가르칩니다.</h3>
        <p>한 명이 다 하는 교육이 아닙니다. 창업 217개를 만든 김재강 대표와 검색광고 1급 허준영 본부장이 각자의 무기를 직강합니다.</p>
      </div>
    </div>
    <div class="fc1-summary fc1-reveal">
      <p><em>마케팅</em>은 고객을 끌어오고<br><em>시스템</em>은 고객을 묶어두고<br><em>자동화</em>는 시간을 벌어줍니다.</p>
      <p class="fc1-summary-500">이미 500명이 넘는 원장·대표님이 이 교육을 거쳐갔습니다.</p>
    </div>
  </div>
</section>

<!-- 4. 강사 프로필 -->
<section class="fc1-sec fc1-inst">
  <div class="fc1-wrap">
    <span class="fc1-badge fc1-reveal">강사진</span>
    <h2 class="fc1-h2 fc1-reveal">그래서, 누가 가르치는지<br>보여드립니다.</h2>
    <p class="fc1-sub fc1-reveal">지식만 있는 강사가 아닙니다. 직접 매장을 운영하고, 수백 개 센터를 성장시킨 사람들입니다.</p>
    <div class="fc1-inst-cards">
      <div class="fc1-inst-card fc1-reveal">
        <div class="fc1-inst-photo"><img src="https://cdn.imweb.me/thumbnail/20260626/f7d9b54bd7ce2.jpg" alt="김재강 대표"></div>
        <div class="fc1-inst-body">
          <div class="fc1-inst-tags"><span class="fc1-inst-tag">창업</span><span class="fc1-inst-tag">운영</span><span class="fc1-inst-tag">컨설팅</span></div>
          <p class="fc1-inst-role">(주)더그로우컴퍼니 대표</p>
          <p class="fc1-inst-tagline">창업 217개 · 위탁 560개를 직접 만들어 온 현장 그 자체</p>
          <ul class="fc1-inst-career">
            <li>(주)더그로우컴퍼니 · 그로우아카데미 · 그로우마케팅 대표</li>
            <li>(주)그로우인테리어 대표</li>
            <li>IFBB PRO NPC 스포츠모델부문 심사위원</li>
            <li>체형교정 전문강사 · METGIRLS(중국) 안면부교정 전문강사</li>
            <li>한국대학보디빌딩협회 이사</li>
            <li>현) 에이블짐 · 피스트X 등 21개 센터 자문</li>
          </ul>
          <div class="fc1-inst-cur">
            <div class="fc1-inst-cur-head"><span class="fc1-inst-cur-title">담당 커리큘럼</span><span class="fc1-inst-cur-badge">2시간</span></div>
            <ul>
              <li>FC · 매니저의 역할 정의</li>
              <li>유효회원 · 객단가 설계</li>
              <li>고객 유형별 회원전략 4분류</li>
              <li>운영관리 시스템 (콜수 · 방명록 · CEO보드)</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="fc1-inst-card fc1-reveal">
        <div class="fc1-inst-photo"><img src="https://cdn.imweb.me/thumbnail/20260626/35741b5450704.jpg" alt="허준영 본부장"></div>
        <div class="fc1-inst-body">
          <div class="fc1-inst-tags"><span class="fc1-inst-tag">마케팅</span><span class="fc1-inst-tag">광고</span><span class="fc1-inst-tag">SEO</span></div>
          <p class="fc1-inst-role">더그로우컴퍼니 CMO</p>
          <p class="fc1-inst-tagline">트레이너부터 점장까지, 현장을 직접 다 겪어 본 마케터</p>
          <ul class="fc1-inst-career">
            <li>그로우 에듀 본부장</li>
            <li>그로우 마케팅 본부장</li>
            <li>검색광고 마케터 자격증 1급 (네이버 · 구글 · 카카오 · 메타)</li>
            <li>헬스장 · 필라테스 마케팅 대행 110여 개 진행</li>
          </ul>
          <div class="fc1-inst-cur">
            <div class="fc1-inst-cur-head"><span class="fc1-inst-cur-title">담당 커리큘럼</span><span class="fc1-inst-cur-badge">1시간</span></div>
            <ul>
              <li>매출 퍼널 4단계</li>
              <li>네이버 플레이스 · 블로그 · 키워드</li>
              <li>메타 광고 세팅</li>
              <li>피트니스 AI 활용</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 5. 커리큘럼 타임라인 -->
<section class="fc1-sec fc1-curri">
  <div class="fc1-wrap">
    <span class="fc1-badge fc1-reveal">정규 FC과정 커리큘럼</span>
    <h2 class="fc1-h2 fc1-reveal">총 4시간, 이 순서로<br>쌓아 올립니다.</h2>
    <p class="fc1-sub fc1-reveal">운영으로 기반을 잡고, 마케팅으로 고객을 부릅니다.</p>
    <div class="fc1-meta fc1-reveal">
      <span class="fc1-meta-chip">총 4시간</span>
      <span class="fc1-meta-chip">세션 중 10분 휴식 포함</span>
    </div>
    <div class="fc1-timeline">
      <div class="fc1-tl-item fc1-reveal">
        <div class="fc1-tl-node">1</div>
        <div class="fc1-tl-card">
          <div class="fc1-tl-head"><span class="fc1-tl-time">2시간</span><span class="fc1-tl-who">김재강 대표</span></div>
          <p class="fc1-tl-title">운영 · 관리 시스템</p>
          <p class="fc1-tl-quote">수업을 잘하는 것과 센터를 잘 굴리는 것은 완전히 다릅니다. 매출이 돌아가는 운영의 뼈대를 세웁니다.</p>
          <ul class="fc1-tl-list">
            <li>트레이너 · 팀장 · 매니저, 역할은 완전히 다르다</li>
            <li>내 센터 유효회원 수, 숫자로 답이 나온다</li>
            <li>객단가를 올려야 하는 시점이 있다</li>
            <li>고객은 4종류, 전략도 4가지로 나뉜다</li>
            <li>감이 아닌 시스템으로 굴러가는 센터</li>
            <li>콜수 · 홍보일지가 곧 매출이 된다</li>
            <li>CEO보드로 한눈에 보는 회원 · 매출 통계</li>
          </ul>
        </div>
      </div>
      <div class="fc1-tl-item fc1-reveal">
        <div class="fc1-tl-node">2</div>
        <div class="fc1-tl-card">
          <div class="fc1-tl-head"><span class="fc1-tl-time">1시간</span><span class="fc1-tl-who">허준영 본부장</span></div>
          <p class="fc1-tl-title">매출로 이어지는 마케팅</p>
          <p class="fc1-tl-quote">대행사에 맡겨도 효과가 없었다면, 방법이 틀린 겁니다. 회사에서 실제로 돌리는 방법을 그대로 공개합니다.</p>
          <ul class="fc1-tl-list">
            <li>고객은 4단계로 움직인다 (퍼널)</li>
            <li>네이버가 진짜 원하는 것</li>
            <li>플레이스 상위노출은 운이 아니다</li>
            <li>클릭을 부르는 제목의 공식</li>
            <li>문의로 이어지는 블로그 글쓰기</li>
            <li>이제 AI가 검색을 대신한다</li>
            <li>광고비 아끼는 메타 광고 세팅</li>
          </ul>
        </div>
      </div>
      <div class="fc1-tl-item is-qna fc1-reveal">
        <div class="fc1-tl-node">💬</div>
        <div class="fc1-tl-card">
          <div class="fc1-tl-head"><span class="fc1-tl-time">1시간</span><span class="fc1-tl-who">전체 강사</span></div>
          <p class="fc1-tl-title">개별 Q&amp;A</p>
          <p class="fc1-tl-quote">당신의 센터 이야기를, 강사 2인에게 직접 풀어내는 시간입니다.</p>
          <ul class="fc1-tl-list">
            <li>우리 센터 상황에 맞춘 1:1 질의응답</li>
            <li>운영 · 마케팅, 막힌 곳을 현장에서 바로</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 6. 수강생 카톡후기 슬라이더 -->
<section class="fc1-sec fc1-rev">
  <div class="fc1-wrap">
    <p class="fc1-rev-label fc1-reveal">그로우 아카데미 수강생 후기</p>
    <h2 class="fc1-h2 fc1-reveal">불과 얼마 전까지만 해도<br><span class="fc1-red2">적자가 나셔서</span> 힘들어하셨던 분들입니다.</h2>
    <p class="fc1-sub fc1-sub-dark fc1-reveal">직접 해보셔야 매출도 확실히 오를 수 있습니다.</p>
  </div>
  <div class="fc1-rev-track-wrap fc1-reveal">
    <button class="fc1-rev-arrow fc1-rev-prev" type="button" id="fc1RevPrev" aria-label="이전 후기">‹</button>
    <div class="fc1-rev-track" id="fc1RevTrack">
      <div class="fc1-rev-card"><img src="https://cdn.imweb.me/thumbnail/20260131/7bdff84defd65.png" alt="그로우 아카데미 수강생 후기 1"></div>
      <div class="fc1-rev-card"><img src="https://cdn.imweb.me/thumbnail/20260131/7ddbfdb241ca0.png" alt="그로우 아카데미 수강생 후기 2"></div>
      <div class="fc1-rev-card"><img src="https://cdn.imweb.me/thumbnail/20260131/9faf7a0adff13.png" alt="그로우 아카데미 수강생 후기 3"></div>
      <div class="fc1-rev-card"><img src="https://cdn.imweb.me/thumbnail/20260131/773e59e57c3c0.png" alt="그로우 아카데미 수강생 후기 4"></div>
      <div class="fc1-rev-card"><img src="https://cdn.imweb.me/thumbnail/20260131/aa64c88162fac.png" alt="그로우 아카데미 수강생 후기 5"></div>
      <div class="fc1-rev-card"><img src="https://cdn.imweb.me/thumbnail/20260131/e386f601997ac.png" alt="그로우 아카데미 수강생 후기 6"></div>
      <div class="fc1-rev-card"><img src="https://cdn.imweb.me/thumbnail/20260131/2a8a2a6ccc4bb.png" alt="그로우 아카데미 수강생 후기 7"></div>
    </div>
    <button class="fc1-rev-arrow fc1-rev-next" type="button" id="fc1RevNext" aria-label="다음 후기">›</button>
  </div>
  <div class="fc1-rev-dots" id="fc1RevDots"></div>
  <p class="fc1-rev-hint">← 좌우로 넘겨보세요 →</p>
</section>

<!-- 7. 성과 데이터 -->
<section class="fc1-sec fc1-result">
  <div class="fc1-wrap">
    <p class="fc1-rev-label fc1-reveal">실제 수강생 성과</p>
    <h2 class="fc1-h2 fc1-reveal">수강 후 네이버 플레이스<br><span class="fc1-hl">유입 증가 사례</span></h2>
    <h3 class="fc1-res-sub fc1-reveal">실제 네이버 플레이스 통계 화면</h3>
    <div class="fc1-res-grid fc1-reveal">
      <img src="https://cdn.imweb.me/thumbnail/20260131/a0b0c87b1eefc.png" alt="네이버 플레이스 유입 통계 화면 1">
      <img src="https://cdn.imweb.me/thumbnail/20260131/7000a625263a4.png" alt="네이버 플레이스 유입 통계 화면 2">
    </div>
    <h3 class="fc1-res-sub fc1-reveal">플레이스 상위노출 사례</h3>
    <img class="fc1-res-big fc1-reveal-scale" src="https://cdn.imweb.me/thumbnail/20260131/7c7d9cddb406a.png" alt="네이버 플레이스 상위노출 사례">
  </div>
</section>

<script>
(function(){
  var stops = [];
  var els = document.querySelectorAll('.fc1-reveal, .fc1-reveal-scale');
  if (els.length && typeof IntersectionObserver !== 'undefined'){
    var io = new IntersectionObserver(function(entries){
      for (var k = 0; k < entries.length; k++){
        if (entries[k].isIntersecting){ entries[k].target.classList.add('fc1-in'); io.unobserve(entries[k].target); }
      }
    }, { threshold: 0.15 });
    for (var i = 0; i < els.length; i++){ io.observe(els[i]); }
    stops.push(function(){ io.disconnect(); });
  } else {
    for (var j = 0; j < els.length; j++){ els[j].classList.add('fc1-in'); }
  }

  // 후기 슬라이더 (화살표 · 도트 · 스크롤 동기 — 리스너 전부 stops 로 정리)
  var track = document.getElementById('fc1RevTrack');
  if (track){
    var cards = track.querySelectorAll('.fc1-rev-card');
    var prevBtn = document.getElementById('fc1RevPrev');
    var nextBtn = document.getElementById('fc1RevNext');
    var dotsWrap = document.getElementById('fc1RevDots');
    var dots = [];
    function stepPx(){ var c = cards[0]; return c ? c.getBoundingClientRect().width + 16 : 296; }
    function scrollToIdx(idx){ track.scrollTo({ left: idx * stepPx(), behavior: 'smooth' }); }
    var onPrev = function(){ track.scrollBy({ left: -stepPx(), behavior: 'smooth' }); };
    var onNext = function(){ track.scrollBy({ left: stepPx(), behavior: 'smooth' }); };
    if (prevBtn){ prevBtn.addEventListener('click', onPrev); stops.push(function(){ prevBtn.removeEventListener('click', onPrev); }); }
    if (nextBtn){ nextBtn.addEventListener('click', onNext); stops.push(function(){ nextBtn.removeEventListener('click', onNext); }); }
    if (dotsWrap){
      for (var d = 0; d < cards.length; d++){
        (function(idx){
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'fc1-rev-dot';
          b.setAttribute('aria-label', (idx + 1) + '번째 후기로 이동');
          var onDot = function(){ scrollToIdx(idx); };
          b.addEventListener('click', onDot);
          stops.push(function(){ b.removeEventListener('click', onDot); });
          dotsWrap.appendChild(b);
          dots.push(b);
        })(d);
      }
    }
    function updateDots(){
      var idx = Math.round(track.scrollLeft / stepPx());
      for (var u = 0; u < dots.length; u++){ dots[u].classList.toggle('is-active', u === idx); }
    }
    updateDots();
    var onScroll = function(){ updateDots(); };
    track.addEventListener('scroll', onScroll, { passive: true });
    stops.push(function(){ track.removeEventListener('scroll', onScroll); });
  }

  // 언마운트 정리용 전역 정지 훅 (React cleanup 에서 호출 후 no-op 으로 교체)
  window.__fc1Stop = function(){
    for (var s = 0; s < stops.length; s++){ stops[s](); }
  };
})();
</script>
</div>`;

export default function FcClass() {
  const [mounted, setMounted] = useState(false);
  const [heroImg, setHeroImg] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setHeroImg(LECTURE_IMAGES[Math.floor(Math.random() * LECTURE_IMAGES.length)]);
  }, []);

  // 컨테이너 내부 <script> 재생성 + 중복 id dedupe 공통 처리
  const injectContainer = (container: HTMLDivElement) => {
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

  useEffect(() => {
    if (!mounted) return;
    const container = detailRef.current;
    if (!container) return;
    const injected = injectContainer(container);
    return () => {
      injected.forEach((s) => s.remove());
      const w = window as unknown as Record<string, unknown>;
      const stop = w["__fc1Stop"];
      if (typeof stop === "function") (stop as () => void)();
      w["__fc1Stop"] = () => {};
    };
  }, [mounted]);

  const payAlert = () => {
    // TODO: 토스페이먼츠 연동
    alert("결제 준비중입니다. 오픈 예정이니 조금만 기다려주세요.");
  };

  return (
    <div
      className="overflow-x-hidden bg-white"
      data-seminar-date={SEMINAR_DATE}
      data-seminar-time={SEMINAR_TIME}
      data-seminar-place={SEMINAR_PLACE}
    >
      <style dangerouslySetInnerHTML={{ __html: TOP_STYLE }} />

      {/* ── 0. 최상단: 랜덤 강의사진 / 결제 카드 2개 ── */}
      <section className="bg-[#f6f5f2] py-12 sm:py-16">
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[1.5fr_1fr]">
            {/* 좌: 랜덤 강의 사진 */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#e6e4df]">
              {heroImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heroImg}
                  alt="그로우 아카데미 FC 클래스 교육 현장"
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>

            {/* 우: 결제 카드 2개 */}
            <div className="flex flex-col gap-4">
              {/* 카드 1 — 정상가 */}
              <div className="rounded-2xl border border-[#e6e6e6] bg-white p-6 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
                <div className="text-sm font-bold text-gray-500">그로우 아카데미 FC 클래스</div>
                <div className="mt-2 text-2xl font-black text-[#161616]">
                  {PRICE_ORIGINAL} <span className="text-sm font-semibold text-gray-500">(VAT포함)</span>
                </div>
                <button
                  type="button"
                  onClick={payAlert}
                  className="mt-5 w-full rounded-xl bg-[#161616] py-4 text-base font-extrabold text-white transition-opacity hover:opacity-90"
                >
                  정상가로 신청하기
                </button>
              </div>

              {/* 카드 2 — 얼리버드 할인가 */}
              <div className="relative rounded-2xl border-2 border-[#22B573] bg-gradient-to-b from-[#22B573]/10 to-white p-6 shadow-[0_10px_30px_rgba(34,181,115,0.15)]">
                <span className="absolute -top-3 left-6 rounded-full bg-[#e23b3b] px-3 py-1 text-[11px] font-extrabold tracking-wide text-white">
                  EARLY BIRD
                </span>
                <div className="text-sm font-bold text-[#22B573]">얼리버드 할인가</div>
                <div className="mt-2 text-2xl font-black text-[#161616]">
                  <span className="mr-2 text-lg font-bold text-gray-400 line-through">{PRICE_ORIGINAL}</span>
                  <span className="text-[#22B573]">{PRICE_SALE}</span>{" "}
                  <span className="text-sm font-semibold text-gray-500">(VAT포함)</span>
                </div>
                <button
                  type="button"
                  onClick={payAlert}
                  className="fc1-pulse mt-5 w-full rounded-xl bg-[#22B573] py-4 text-base font-extrabold text-white transition-opacity hover:opacity-90"
                >
                  얼리버드 할인가로 신청하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 1~3. 히어로 / 문제 / 해결책 (DETAIL_HTML 주입) ── */}
      {mounted ? (
        <div
          ref={detailRef}
          className="w-full"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: DETAIL_HTML }}
        />
      ) : (
        <div ref={detailRef} className="w-full" suppressHydrationWarning />
      )}
    </div>
  );
}
