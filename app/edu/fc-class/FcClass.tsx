"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 정규 FC 클래스 랜딩 (1/3차) — 그로우 아카데미
//  · 클래스 접두사 fc1- (아임웹 원본 클래스명 리네이밍, CSS 충돌 방지)
//  · 최상단(고정 강의사진 + 결제 카드)은 React JSX, 히어로/문제/해결은 DETAIL_HTML 주입
//  · injectContainer 로 <script> 재생성 append (문제 섹션 IntersectionObserver)
//  · IntersectionObserver 는 __fc1Stop 으로 언마운트 시 disconnect (전역함수 no-op 교체)
//  · 다음 기수 때는 상단 SEMINAR_* / PRICE_* 상수만 수정
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { SITE_URL } from "@/lib/site";

/* ▼▼ 다음 기수 때 이 상수만 수정 ▼▼ */
const SEMINAR_DATE = "준비중";
const SEMINAR_TIME = "총 4시간";
const SEMINAR_PLACE = "준비중";
const PRICE_ORIGINAL = "290,000원";
const PRICE_SALE = "190,000원";
/* ▲▲ 여기까지 ▲▲ */

// 정규 FC 클래스 Course 구조화 데이터 — 일정 미정이므로 startDate/hasCourseInstance 는 넣지 않는다.
const COURSE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "정규 FC 클래스",
  description:
    "매출에 관련된 모든 것 — 고객관리·상담·재등록·서비스·관리시스템·마케팅을 현장 전문가 2인이 직강하는 그로우 아카데미 정규 FC 클래스.",
  provider: {
    "@type": "Organization",
    name: "더그로우컴퍼니",
    url: SITE_URL,
  },
  offers: [
    {
      "@type": "Offer",
      name: "정상가",
      price: PRICE_ORIGINAL.replace(/[^0-9]/g, ""),
      priceCurrency: "KRW",
    },
    {
      "@type": "Offer",
      name: "얼리버드 할인가",
      price: PRICE_SALE.replace(/[^0-9]/g, ""),
      priceCurrency: "KRW",
    },
  ],
};

// 아코디언(마케팅 직접 하기 / 가격 올리기) 내용을 그대로 FAQ 구조화 데이터로 변환
const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "더 이상 마케팅 맡기지마세요.",
      acceptedAnswer: {
        "@type": "Answer",
        text: "실제 마케팅 회사에서 적용하는 방법을 모두 공개합니다. 직접 마케팅을 하고 싶으신 분, 직원이 있으시다면 몇백만원은 아끼실 수 있습니다.",
      },
    },
    {
      "@type": "Question",
      name: "가격을 높이고 싶은 분들을 위한 강의",
      acceptedAnswer: {
        "@type": "Answer",
        text: "가격경쟁은 결국 망할 수밖에 없습니다. 상담방법, 재등록방법, 우리 매장의 차별화를 두기 위한 방법 등 500개 매장의 대표님들과 함께해오며 쌓아온 핵심 운영 노하우를 알려드립니다.",
      },
    },
  ],
};

// 최상단 좌측 고정 강의 사진
const HERO_IMAGE = "/edu/edu.main.jpg";

// 탭 내비게이션 (히어로 바로 아래) — 주입 HTML 내 섹션 id 로 스크롤
const TABS = [
  { id: "fc1-curriculum", label: "커리큘럼" },
  { id: "fc1-reviews", label: "수강생 후기" },
  { id: "fc1-instructors", label: "강사 소개" },
] as const;

// 수강생 텍스트 후기 (문구 원문 그대로 — 오타 포함 수정 금지)
const TEXT_REVIEWS = [
  {
    name: "김준****",
    date: "2026-06-03",
    text: "음..단순히 가격만 낮추는 방법 말고 단가,적절한 이벤트 ,운영적인 부분에 대한 정보를 얻을 수 있었서 좋았고 온라인 마케팅 어려웠는데 교육때 외에도 교육이후 피드백 받으면서 바로 적용해볼 수 있었던 점이 좋았습니다.",
  },
  {
    name: "나현****",
    date: "2026-03-31",
    text: "내년에 또 바뀐 커리큘럼 나오면 또 신청해서 들어보고싶습니다!",
  },
  {
    name: "이진****",
    date: "2026-03-31",
    text: "필라테스 강사 10년 하다가 처음 독립했는데 수업 말고는 아는 게 하나도 없었어요. 플레이스 사진 바꾸는 것부터 블로그 제목 쓰는 법까지 하나하나 알려주시고 강의 끝나고도 카톡으로 계속 잡아주시니까 혼자 하는 느낌이 아니어서 좋았어여",
  },
  {
    name: "강진****",
    date: "2026-03-31",
    text: "창업하고 대행사 두 군데 맡겨봤는데 돈만 나가서 지쳐있었어요. 인스타에서 그로우 아카데미 보고 반신반의로 신청했는데 솔직히 4시간 금방 갔습니다. 제가 뭘 모르는지조차 몰랐던 거더라고요. 키워드 잡는 법이랑 플레이스 최적화 배우고 바로 적용했더니 한 달 만에 우리 동네 상위에 뜨기 시작했어요. 강의 끝나고 나서도 1:1 피드백으로 저희 매장 직접 분석해주시면서 방향 잡아주신 게 제일 좋았습니다.",
  },
  {
    name: "김진****",
    date: "2026-03-31",
    text: "필라테스샵 오픈을 준비중인데 운영적인 부분에 대한 지식이없어서 한번 배워봐야겠다라는 생각으로 들었어요. 고객응대부터 마케팅까지 한번에 배울수있어서 좋았어요",
  },
  {
    name: "이재****",
    date: "2026-03-30",
    text: "6기 수강생이에요! 하루 교육이라 교육 듣고 난후에도 바로 할 수 있을지 걱정했엇는데 교육후 한달 동안 1:1 피드백도 직접 해주셔서 정말 좋았어요",
  },
  {
    name: "매니저강****",
    date: "2026-03-30",
    text: "6개월 동안 매출이 거의 제자리였습니다. 콜수 관리랑 미가입 리스트 추적 시트 받아서 세팅하니까 놓치고 있던 회원이 이렇게 많았나 싶더라고요. 재등록 DM 스크립트도 바로 써봤는데 반응이 와서 놀랐습니다. 실전에 바로 적용할수 있는 내용있어서 좋았습니다.",
  },
  {
    name: "오종****",
    date: "2026-03-30",
    text: "대행사 두 군데 맡겨봤는데 돈만 나가서 지쳐있었어요. 키워드 잡는 법이랑 플레이스 최적화 배우고 바로 적용했더니 한 달 만에 동네 상위노출 되기 시작했습니다. 대행사 한 달 비용도 안 되는 돈으로 직접 할 수 있게 된 게 제일 큽니다.",
  },
];

const TOP_STYLE = `@keyframes fc1Pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}.fc1-pulse{animation:fc1Pulse 2.2s ease-in-out infinite}
.fc1-tab-bar{background:#fff;border-bottom:1px solid #ececec}
.fc1-tab-in{max-width:820px;margin:0 auto;display:flex}
.fc1-tab-btn{flex:1 1 0;min-width:0;padding:16px 4px;background:none;border:none;border-bottom:2px solid transparent;font-size:15px;font-weight:700;color:#666;cursor:pointer;white-space:nowrap;transition:color .2s,border-color .2s;font-family:inherit;letter-spacing:-0.01em}
.fc1-tab-btn:hover,.fc1-tab-btn.fc1-tab-active{color:#22B573;border-bottom-color:#22B573}
@media(max-width:640px){.fc1-tab-btn{font-size:14px;padding:14px 2px}}
#fc1-reviews{scroll-margin-top:80px}
.fc1-rev-sec{background:#f8f9fa;color:#141414;padding:64px 0;font-family:'Pretendard',-apple-system,BlinkMacSystemFont,system-ui,'Apple SD Gothic Neo',sans-serif;letter-spacing:-0.01em}
.fc1-rev-sec *{box-sizing:border-box}
.fc1-rev-wrap{max-width:820px;margin:0 auto;padding:0 20px}
.fc1-rev-head{text-align:center}
.fc1-rev-title{font-size:28px;font-weight:800;line-height:1.45;margin:0 0 12px;color:#141414}
.fc1-rev-score{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:6px}
.fc1-rev-score-star{color:#ffb400;font-size:22px;line-height:1}
.fc1-rev-score b{font-size:22px;font-weight:900;color:#161616;line-height:1}
.fc1-rev-count{font-size:14px;color:#888;font-weight:600}
.fc1-rev-list{margin-top:30px;display:flex;flex-direction:column;gap:16px}
.fc1-rev-item{background:#fff;border:1px solid #ececec;border-radius:16px;padding:24px 26px;text-align:left;box-shadow:0 4px 16px rgba(0,0,0,.04)}
.fc1-rev-stars{color:#ffb400;font-size:15px;letter-spacing:3px;margin-bottom:12px;line-height:1}
.fc1-rev-body{font-size:15px;color:#333;line-height:1.8;margin:0 0 16px}
.fc1-rev-meta{display:flex;align-items:center;gap:10px;font-size:13px}
.fc1-rev-name{font-weight:700;color:#555}
.fc1-rev-date{color:#999}
.fc1-barspacer{height:92px}
@media(max-width:640px){.fc1-rev-sec{padding:52px 0}.fc1-rev-title{font-size:23px}.fc1-rev-item{padding:20px}}`;

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

/* fail-safe reveal — 기본은 완전 표시. 주입 스크립트가 루트에 fc1-anim 을 붙인 경우에만 숨김+애니메이션 */
.fc1.fc1-anim .fc1-reveal{opacity:0;transform:translateY(28px);transition:opacity .7s ease,transform .7s ease}
.fc1.fc1-anim .fc1-reveal.fc1-in{opacity:1;transform:none}
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

.fc1.fc1-anim .fc1-reveal-scale{opacity:0;transform:scale(.94);transition:opacity .7s ease,transform .7s ease}
.fc1.fc1-anim .fc1-reveal-scale.fc1-in{opacity:1;transform:scale(1)}

/* 8 교육 현장 갤러리 */
.fc1-gal{background:#111;color:#fff}
.fc1-gal .fc1-wrap{text-align:center}
.fc1-gal-mq{position:relative;overflow:hidden;width:100%;margin:36px 0}
.fc1-gal-mq::before,.fc1-gal-mq::after{content:'';position:absolute;top:0;bottom:0;width:80px;z-index:2;pointer-events:none}
.fc1-gal-mq::before{left:0;background:linear-gradient(90deg,#111,rgba(17,17,17,0))}
.fc1-gal-mq::after{right:0;background:linear-gradient(270deg,#111,rgba(17,17,17,0))}
.fc1-gal-track{display:flex;gap:16px;width:max-content;animation:fc1AutoSlide 30s linear infinite}
.fc1-gal-mq:hover .fc1-gal-track{animation-play-state:paused}
.fc1-gal-track img{height:240px;width:auto;border-radius:14px;display:block;flex:0 0 auto;background:#1a1a1a}
@keyframes fc1AutoSlide{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.fc1-gal-gifs{display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:680px;margin:8px auto 0}
.fc1-gal-gifs img{width:100%;height:auto;border-radius:14px;display:block;border:1px solid #262626}
.fc1-gal-msg{max-width:640px;margin:34px auto 0;font-size:17px;line-height:1.8;color:#e6e6e6}
.fc1-gal-count{display:inline-block;margin-top:22px;background:rgba(34,181,115,.14);color:var(--g);font-weight:800;font-size:15px;padding:12px 24px;border-radius:50px}
.fc1-gal-count b{color:#fff;font-size:17px}
@media(max-width:640px){.fc1-gal-track img{height:180px}.fc1-gal-gifs{grid-template-columns:1fr}}

/* 9 3D 캐러셀 */
.fc1-3dsec{background:#111;color:#fff}
.fc1-3dsec .fc1-wrap{text-align:center}
.fc1-3d-label{color:var(--g);font-weight:800;font-size:13px;letter-spacing:.1em;margin:0 0 10px}
.fc1-3d{perspective:1200px;padding:40px 0;margin-top:20px;overflow:hidden;cursor:grab;user-select:none;-webkit-user-select:none}
.fc1-3d:active{cursor:grabbing}
.fc1-3d-stage{width:260px;height:460px;position:relative;margin:0 auto;transform-style:preserve-3d}
.fc1-3d-card{position:absolute;width:260px;height:460px;border-radius:18px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,0.4);backface-visibility:hidden;background:#222}
.fc1-3d-card img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}
@media(max-width:768px){.fc1-3d-stage{width:200px;height:354px}.fc1-3d-card{width:200px;height:354px}}

/* 10 대상자 추천 */
.fc1-target{background:#f8f9fa;color:#141414}
.fc1-target .fc1-wrap{text-align:center}
.fc1-tgt-list{max-width:620px;margin:28px auto 0;display:flex;flex-direction:column;gap:10px}
.fc1-tgt{display:flex;align-items:flex-start;gap:12px;background:#fff;border:1px solid #eaeaea;border-radius:12px;padding:16px 18px;font-size:15px;font-weight:600;color:#2a2a2a;line-height:1.5;text-align:left}
.fc1-tgt-ic{flex:0 0 auto;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff;margin-top:1px}
.fc1-ok{background:var(--g)}
.fc1-x{background:#e23b3b}
.fc1-tgt.fc1-no{color:#8a8a8a;background:#f3f3f3}
.fc1-tgt-div{display:flex;align-items:center;justify-content:center;margin:26px 0}
.fc1-tgt-div span{background:#e9ecef;color:#666;font-size:13px;font-weight:800;padding:8px 20px;border-radius:50px}
.fc1-tgt-box{max-width:620px;margin:30px auto 0;border:2px dashed var(--g);border-radius:16px;padding:24px 22px;font-size:16px;line-height:1.75;color:#333;font-weight:600}

/* 11 혜택 */
.fc1-benefit{background:#fff;color:#141414}
.fc1-benefit .fc1-wrap{text-align:center}
.fc1-bf-badge{display:inline-block;background:#161616;color:#fff;font-size:12px;font-weight:800;padding:7px 16px;border-radius:50px;letter-spacing:.08em;margin-bottom:14px}
.fc1-bf-list{max-width:680px;margin:32px auto 0;display:flex;flex-direction:column;gap:14px}
.fc1-bf{display:flex;gap:18px;align-items:flex-start;background:#fafafa;border:1px solid #eee;border-radius:16px;padding:24px;text-align:left}
.fc1-bf-no{flex:0 0 auto;width:44px;height:44px;border-radius:12px;background:rgba(34,181,115,.12);color:var(--g);font-weight:900;font-size:16px;display:flex;align-items:center;justify-content:center}
.fc1-bf h3{font-size:17px;font-weight:800;color:#161616;margin:0 0 6px}
.fc1-bf p{font-size:14px;color:#666;line-height:1.65;margin:0}

/* 12 아코디언 */
.fc1-acc-sec{background:#0d0d0d;color:#fff}
.fc1-acc-sub{text-align:center;font-size:14px;font-weight:700;margin:0 0 24px;background:linear-gradient(90deg,#22B573,#8fe6bd,#22B573);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:fc1Shimmer 3s linear infinite}
@keyframes fc1Shimmer{to{background-position:200% center}}
.fc1-acc{max-width:680px;margin:0 auto}
.fc1-acc-item{border:1px solid #262626;border-radius:14px;margin-bottom:12px;overflow:hidden;background:#151515}
.fc1-acc-head{width:100%;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:22px 24px;background:none;border:none;cursor:pointer;text-align:left}
.fc1-acc-t{font-size:17px;font-weight:800;color:#fff}
.fc1-acc-ic{flex:0 0 auto;font-size:26px;font-weight:400;color:var(--g);transition:transform .3s;line-height:1}
.fc1-acc-item.is-open .fc1-acc-ic{transform:rotate(45deg)}
.fc1-acc-body{max-height:0;overflow:hidden;transition:max-height .35s ease}
.fc1-acc-body p{margin:0;padding:0 24px 24px;font-size:15px;color:#bdbdbd;line-height:1.75}

/* 하단 고정 바 */
.fc1-barspacer{height:92px}
.fc1-bar{position:fixed;left:0;right:0;bottom:0;z-index:60;background:#0d0d0d;border-top:1px solid #222;padding:12px 16px calc(12px + env(safe-area-inset-bottom));transform:translateY(0);transition:transform .3s ease}
.fc1-bar.is-hidden{transform:translateY(140%)}
.fc1-bar-in{max-width:820px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:14px}
.fc1-bar-when{font-size:14px;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fc1-bar-cta{flex:0 0 auto;background:var(--g);color:#fff;font-size:15px;font-weight:800;padding:13px 26px;border-radius:12px;text-decoration:none;white-space:nowrap}
@media(max-width:480px){.fc1-bar-cta{padding:12px 20px;font-size:14px}.fc1-bar-when{font-size:13px}}

/* 13 마지막 수강신청 */
.fc1-enroll{background:#0A0A0A;color:#fff}
.fc1-enroll .fc1-wrap{text-align:center}
.fc1-enroll-cards{display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:680px;margin:32px auto 0}
.fc1-enroll-card{position:relative;background:#fff;border:1px solid #e6e6e6;border-radius:18px;padding:30px 24px 26px;text-align:center;color:#141414}
.fc1-enroll-card--sale{border:2px solid var(--g)}
.fc1-enroll-badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#e23b3b;color:#fff;font-size:11px;font-weight:800;padding:5px 14px;border-radius:50px;letter-spacing:.05em;white-space:nowrap}
.fc1-enroll-tag{font-size:13px;font-weight:700;color:#888;margin-bottom:10px}
.fc1-enroll-card--sale .fc1-enroll-tag{color:var(--g)}
.fc1-enroll-price{font-size:22px;font-weight:900;color:#161616;margin-bottom:18px;line-height:1.3}
.fc1-enroll-price s{color:#aaa;font-weight:700;font-size:15px;margin-right:6px}
.fc1-enroll-price b{color:var(--g)}
.fc1-enroll-price span{font-size:13px;color:#999;font-weight:600}
.fc1-enroll-btn{width:100%;height:52px;border:none;border-radius:12px;background:#161616;color:#fff;font-size:15px;font-weight:800;cursor:pointer;transition:opacity .2s}
.fc1-enroll-btn--sale{background:var(--g)}
.fc1-enroll-btn:hover{opacity:.9}
@media(max-width:640px){.fc1-enroll-cards{grid-template-columns:1fr}.fc1-enroll-price{font-size:20px}}

/* 탭 내비 스크롤 오프셋 */
#fc1-curriculum,#fc1-instructors{scroll-margin-top:80px}
</style>

<!-- 1. 히어로 -->
<section class="fc1-hero">
  <img class="fc1-hero-bg" src="https://cdn.imweb.me/thumbnail/20251024/6b0de22aa5b3b.jpg" alt="정규 FC 클래스 강의 현장 배경">
  <div class="fc1-hero-ov"></div>
  <div class="fc1-hero-in">
    <p class="fc1-hero-sub fc1-fu fc1-d1">— 정규 FC 클래스 —</p>
    <h1 class="fc1-hero-q fc1-fu fc1-d2">매달 신규 문의 때문에<br><span class="fc1-red">잠 못 드는 밤</span>이 있습니다.</h1>
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
<section class="fc1-sec fc1-inst" id="fc1-instructors">
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
<section class="fc1-sec fc1-curri" id="fc1-curriculum">
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

<!-- 8. 교육 현장 갤러리 -->
<section class="fc1-sec fc1-gal">
  <div class="fc1-wrap">
    <h2 class="fc1-h2 fc1-reveal">실전 경험을 나누는<br>교육 현장</h2>
    <p class="fc1-sub fc1-reveal">단순 이론이 아닌, 현장에서 바로 적용 가능한 실무 교육</p>
  </div>
  <div class="fc1-gal-mq">
    <div class="fc1-gal-track">
      <img src="https://cdn.imweb.me/thumbnail/20260131/2c27053d77aa7.jpg" alt="그로우 아카데미 FC 클래스 교육 현장 1">
      <img src="https://cdn.imweb.me/thumbnail/20260131/585cf1ee7e5d1.jpg" alt="그로우 아카데미 FC 클래스 교육 현장 2">
      <img src="https://cdn.imweb.me/thumbnail/20260131/c51e290737724.jpg" alt="그로우 아카데미 FC 클래스 교육 현장 3">
      <img src="https://cdn.imweb.me/thumbnail/20260131/d71d22f9eea53.jpg" alt="그로우 아카데미 FC 클래스 교육 현장 4">
      <img src="https://cdn.imweb.me/thumbnail/20260131/2f1084024ac28.jpg" alt="그로우 아카데미 FC 클래스 교육 현장 5">
      <img src="https://cdn.imweb.me/thumbnail/20260131/c8b4857c6a396.jpg" alt="그로우 아카데미 FC 클래스 교육 현장 6">
      <img src="https://cdn.imweb.me/thumbnail/20260131/4b9ce2fb80778.jpg" alt="그로우 아카데미 FC 클래스 교육 현장 7">
      <img src="https://cdn.imweb.me/thumbnail/20260131/626df956ffc13.jpg" alt="그로우 아카데미 FC 클래스 교육 현장 8">
      <img src="https://cdn.imweb.me/thumbnail/20260131/2c27053d77aa7.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260131/585cf1ee7e5d1.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260131/c51e290737724.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260131/d71d22f9eea53.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260131/2f1084024ac28.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260131/c8b4857c6a396.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260131/4b9ce2fb80778.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260131/626df956ffc13.jpg" alt="" aria-hidden="true">
    </div>
  </div>
  <div class="fc1-wrap">
    <div class="fc1-gal-gifs">
      <img class="fc1-reveal" src="https://cdn.imweb.me/thumbnail/20260131/333c1f7a7b929.gif" alt="그로우 아카데미 FC 클래스 교육 현장 움짤 1">
      <img class="fc1-reveal" src="https://cdn.imweb.me/thumbnail/20260131/55301cde907fd.gif" alt="그로우 아카데미 FC 클래스 교육 현장 움짤 2">
    </div>
    <p class="fc1-gal-msg fc1-reveal">트레이너와 필라테스 강사를 위한 교육은 많습니다.<br>하지만 센터를 잘 운영하는 방법을 알려주는 교육은 그동안 없었습니다.</p>
    <div class="fc1-gal-count fc1-reveal">지금까지 함께한 대표님 <b>500명+</b></div>
  </div>
</section>

<!-- 9. 1:1 피드백 3D 캐러셀 -->
<section class="fc1-sec fc1-3dsec">
  <div class="fc1-wrap">
    <p class="fc1-3d-label fc1-reveal">REAL REVIEWS</p>
    <h2 class="fc1-h2 fc1-reveal">수강생들의 1:1 피드백<br>생생 후기</h2>
    <p class="fc1-sub fc1-reveal">드래그하여 후기를 둘러보세요</p>
  </div>
  <div class="fc1-3d" id="fc13d">
    <div class="fc1-3d-stage" id="fc13dStage">
      <div class="fc1-3d-card"><img src="https://cdn.imweb.me/thumbnail/20260331/325e18f723c82.png" alt="1:1 피드백 후기 1"></div>
      <div class="fc1-3d-card"><img src="https://cdn.imweb.me/thumbnail/20260331/ed309d98793f3.png" alt="1:1 피드백 후기 2"></div>
      <div class="fc1-3d-card"><img src="https://cdn.imweb.me/thumbnail/20260331/3b97350afcf9e.png" alt="1:1 피드백 후기 3"></div>
      <div class="fc1-3d-card"><img src="https://cdn.imweb.me/thumbnail/20260331/37e5750039353.png" alt="1:1 피드백 후기 4"></div>
      <div class="fc1-3d-card"><img src="https://cdn.imweb.me/thumbnail/20260331/5af1f4acdd9c9.png" alt="1:1 피드백 후기 5"></div>
      <div class="fc1-3d-card"><img src="https://cdn.imweb.me/thumbnail/20260331/7c6032aac5f02.png" alt="1:1 피드백 후기 6"></div>
      <div class="fc1-3d-card"><img src="https://cdn.imweb.me/thumbnail/20260331/69b9f91524388.png" alt="1:1 피드백 후기 7"></div>
      <div class="fc1-3d-card"><img src="https://cdn.imweb.me/thumbnail/20260331/3c46f72203a26.png" alt="1:1 피드백 후기 8"></div>
    </div>
  </div>
</section>

<!-- 10. 대상자 추천/비추천 -->
<section class="fc1-sec fc1-target">
  <div class="fc1-wrap">
    <h2 class="fc1-h2 fc1-reveal"><span class="fc1-red2">50% 이상 해당</span>하신다면<br>망설이지 마세요.</h2>
    <p class="fc1-sub fc1-sub-dark fc1-reveal">이런 분들을 위해 준비한 교육입니다</p>
    <div class="fc1-tgt-list">
      <div class="fc1-tgt fc1-reveal"><span class="fc1-tgt-ic fc1-ok">✓</span>2026년 피트니스·필라테스 마케팅 트렌드를 배우고 싶으신 분</div>
      <div class="fc1-tgt fc1-reveal"><span class="fc1-tgt-ic fc1-ok">✓</span>신규, 재등록 등 클로징률을 상승시키고 싶으신 분</div>
      <div class="fc1-tgt fc1-reveal"><span class="fc1-tgt-ic fc1-ok">✓</span>여러 지점 확장을 계획 중이신 분</div>
      <div class="fc1-tgt fc1-reveal"><span class="fc1-tgt-ic fc1-ok">✓</span>내 매장을 차리고 싶으신 분</div>
      <div class="fc1-tgt fc1-reveal"><span class="fc1-tgt-ic fc1-ok">✓</span>마케팅·운영 노하우를 전수받아 직접 적용해보고 싶으신 분</div>
    </div>
    <div class="fc1-tgt-div fc1-reveal"><span>반대로</span></div>
    <div class="fc1-tgt-list">
      <div class="fc1-tgt fc1-no fc1-reveal"><span class="fc1-tgt-ic fc1-x">✕</span>실행 시간이 0인 분</div>
      <div class="fc1-tgt fc1-no fc1-reveal"><span class="fc1-tgt-ic fc1-x">✕</span>운영 데이터 없이 감으로만 하려는 분</div>
    </div>
    <div class="fc1-tgt-box fc1-reveal">이 교육은 '배우고 직접 실행하실 분'을 위한 교육입니다.<br>실행 의지가 있으시다면, 분명 결과가 달라질 겁니다.</div>
  </div>
</section>

<!-- 11. 혜택 -->
<section class="fc1-sec fc1-benefit">
  <div class="fc1-wrap">
    <span class="fc1-bf-badge fc1-reveal">ALL INCLUDED</span>
    <h2 class="fc1-h2 fc1-reveal">이 강의로 얻어가는<br>것들입니다.</h2>
    <div class="fc1-bf-list">
      <div class="fc1-bf fc1-reveal">
        <div class="fc1-bf-no">01</div>
        <div><h3>4시간 오프라인 밀착 교육</h3><p>이론만이 아닌, 실습과 함께 바로 적용 가능한 실전 교육</p></div>
      </div>
      <div class="fc1-bf fc1-reveal">
        <div class="fc1-bf-no">02</div>
        <div><h3>템플릿 &amp; 스크립트 풀패키지</h3><p>상담 스크립트, 재등록 DM, 운영 시트, 마케팅 체크리스트 등</p></div>
      </div>
      <div class="fc1-bf fc1-reveal">
        <div class="fc1-bf-no">03</div>
        <div><h3>오픈채팅방 커뮤니티</h3><p>업계 정보를 무료로 제공해드리는 수강생 전용 커뮤니티</p></div>
      </div>
      <div class="fc1-bf fc1-reveal">
        <div class="fc1-bf-no">04</div>
        <div><h3>창업·운영·마케팅 전자책</h3><p>수강 후 복습용 전자책 무료 제공</p></div>
      </div>
    </div>
  </div>
</section>

<!-- 12. 아코디언 -->
<section class="fc1-sec fc1-acc-sec">
  <div class="fc1-wrap">
    <p class="fc1-acc-sub fc1-reveal">FC 클래스가 특별한 이유</p>
    <div class="fc1-acc" id="fc1Acc">
      <div class="fc1-acc-item fc1-reveal">
        <button class="fc1-acc-head" type="button">
          <span class="fc1-acc-t">더 이상 마케팅 맡기지마세요.</span>
          <span class="fc1-acc-ic">+</span>
        </button>
        <div class="fc1-acc-body"><p>실제 마케팅 회사에서 적용하는 방법을 모두 공개합니다. 직접 마케팅을 하고 싶으신 분, 직원이 있으시다면 몇백만원은 아끼실 수 있습니다.</p></div>
      </div>
      <div class="fc1-acc-item fc1-reveal">
        <button class="fc1-acc-head" type="button">
          <span class="fc1-acc-t">가격을 높이고 싶은 분들을 위한 강의</span>
          <span class="fc1-acc-ic">+</span>
        </button>
        <div class="fc1-acc-body"><p>가격경쟁은 결국 망할 수밖에 없습니다. 상담방법, 재등록방법, 우리 매장의 차별화를 두기 위한 방법 등 500개 매장의 대표님들과 함께해오며 쌓아온 핵심 운영 노하우를 알려드립니다.</p></div>
      </div>
    </div>
  </div>
</section>

<!-- 13. 마지막 수강신청 -->
<section class="fc1-sec fc1-enroll" id="fc1-enroll">
  <div class="fc1-wrap">
    <h2 class="fc1-h2 fc1-reveal">지금, 정규 FC 클래스에<br><em>합류하세요.</em></h2>
    <p class="fc1-sub fc1-reveal">다음 기수 준비중 · 총 4시간</p>
    <div class="fc1-enroll-cards">
      <div class="fc1-enroll-card fc1-reveal">
        <div class="fc1-enroll-tag">정상가</div>
        <div class="fc1-enroll-price">${PRICE_ORIGINAL} <span>(VAT포함)</span></div>
        <button type="button" class="fc1-enroll-btn">정상가로 신청하기</button>
      </div>
      <div class="fc1-enroll-card fc1-enroll-card--sale fc1-reveal">
        <span class="fc1-enroll-badge">EARLY BIRD</span>
        <div class="fc1-enroll-tag">얼리버드 할인가</div>
        <div class="fc1-enroll-price"><s>${PRICE_ORIGINAL}</s> <b>${PRICE_SALE}</b> <span>(VAT포함)</span></div>
        <button type="button" class="fc1-enroll-btn fc1-enroll-btn--sale">얼리버드 할인가로 신청하기</button>
      </div>
    </div>
  </div>
</section>

<div class="fc1-bar" id="fc1Bar">
  <div class="fc1-bar-in">
    <div class="fc1-bar-when">다음 기수 준비중 · 총 4시간</div>
    <a href="#fc1-top" class="fc1-bar-cta" id="fc1BarCta">신청하기</a>
  </div>
</div>

<script>
(function(){
  var stops = [];
  /* fail-safe reveal — 스크립트가 실행됐을 때만 루트에 fc1-anim 을 붙여 숨김+애니메이션 활성화.
     스크립트가 실행되지 않으면 fc1-anim 이 없으므로 전 섹션이 기본 표시 상태로 남는다. */
  var animRoot = document.querySelector('.fc1');
  var els = document.querySelectorAll('.fc1-reveal, .fc1-reveal-scale');
  if (animRoot && els.length && typeof IntersectionObserver !== 'undefined'){
    var io = new IntersectionObserver(function(entries){
      for (var k = 0; k < entries.length; k++){
        if (entries[k].isIntersecting){ entries[k].target.classList.add('fc1-in'); io.unobserve(entries[k].target); }
      }
    }, { threshold: 0.15 });
    animRoot.classList.add('fc1-anim');
    for (var i = 0; i < els.length; i++){ io.observe(els[i]); }
    stops.push(function(){ io.disconnect(); animRoot.classList.remove('fc1-anim'); });
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

  // 1:1 피드백 3D 캐러셀 (원본 coverflow 로직 이식 — rAF/리스너 전부 stops 로 정리)
  var stage3d = document.getElementById('fc13dStage');
  var wrap3d = stage3d ? stage3d.parentElement : null;
  if (stage3d && wrap3d){
    var items3d = stage3d.querySelectorAll('.fc1-3d-card');
    var n3d = items3d.length;
    var theta3d = 360 / n3d;
    var isMob3d = window.innerWidth <= 768;
    var radius3d = isMob3d ? 260 : 360;
    var curAngle = 0;
    var autoSpeed = 0.15;
    var isDragging = false;
    var startX = 0, dragAngle = 0, momentum = 0, raf3d = 0;
    function render3d(){
      for (var i = 0; i < n3d; i++){
        var angle = curAngle + i * theta3d;
        var rad = angle * Math.PI / 180;
        var z = radius3d * Math.cos(rad);
        var x = radius3d * Math.sin(rad);
        var scale = (z + radius3d) / (2 * radius3d);
        scale = 0.6 + scale * 0.4;
        var opacity = (z + radius3d) / (2 * radius3d);
        opacity = 0.4 + opacity * 0.6;
        items3d[i].style.transform = 'translateX(' + x + 'px) translateZ(' + z + 'px) scale(' + scale + ')';
        items3d[i].style.opacity = opacity;
        items3d[i].style.zIndex = String(Math.round(z + radius3d));
        items3d[i].style.filter = z < -100 ? 'blur(2px)' : 'none';
      }
    }
    function autoRotate3d(){
      if (!isDragging){ curAngle += autoSpeed + momentum; momentum *= 0.97; if (Math.abs(momentum) < 0.01) momentum = 0; }
      render3d();
      raf3d = requestAnimationFrame(autoRotate3d);
    }
    var onDown = function(e){ isDragging = true; momentum = 0; startX = e.clientX; dragAngle = curAngle; };
    var onMove = function(e){ if (!isDragging) return; var dx = e.clientX - startX; momentum = dx * 0.002; curAngle = dragAngle + dx * 0.3; render3d(); };
    var onUp = function(){ isDragging = false; };
    var onLeave = function(){ isDragging = false; };
    var onTStart = function(e){ isDragging = true; momentum = 0; startX = e.touches[0].clientX; dragAngle = curAngle; };
    var onTMove = function(e){ if (!isDragging) return; var dx = e.touches[0].clientX - startX; momentum = dx * 0.002; curAngle = dragAngle + dx * 0.3; render3d(); };
    var onTEnd = function(){ isDragging = false; };
    wrap3d.addEventListener('mousedown', onDown);
    wrap3d.addEventListener('mousemove', onMove);
    wrap3d.addEventListener('mouseup', onUp);
    wrap3d.addEventListener('mouseleave', onLeave);
    wrap3d.addEventListener('touchstart', onTStart, { passive: true });
    wrap3d.addEventListener('touchmove', onTMove, { passive: true });
    wrap3d.addEventListener('touchend', onTEnd);
    render3d();
    raf3d = requestAnimationFrame(autoRotate3d);
    stops.push(function(){
      cancelAnimationFrame(raf3d);
      wrap3d.removeEventListener('mousedown', onDown);
      wrap3d.removeEventListener('mousemove', onMove);
      wrap3d.removeEventListener('mouseup', onUp);
      wrap3d.removeEventListener('mouseleave', onLeave);
      wrap3d.removeEventListener('touchstart', onTStart);
      wrap3d.removeEventListener('touchmove', onTMove);
      wrap3d.removeEventListener('touchend', onTEnd);
    });
  }

  // 아코디언 (클릭 토글 — 리스너 정리)
  var acc = document.getElementById('fc1Acc');
  if (acc){
    var heads = acc.querySelectorAll('.fc1-acc-head');
    for (var h = 0; h < heads.length; h++){
      (function(head){
        var item = head.parentNode;
        var body = item.querySelector('.fc1-acc-body');
        var onAcc = function(){
          var open = item.classList.toggle('is-open');
          body.style.maxHeight = open ? (body.scrollHeight + 'px') : '0px';
        };
        head.addEventListener('click', onAcc);
        stops.push(function(){ head.removeEventListener('click', onAcc); });
      })(heads[h]);
    }
  }

  // 마지막 수강신청 버튼·하단 고정 바 CTA 는 React(useEffect)에서 router.push 로 체크아웃 연결

  // 하단 고정 바 (최상단 결제영역/하단 신청영역이 보이면 숨김)
  var bar = document.getElementById('fc1Bar');
  var topEl = document.getElementById('fc1-top');
  var enrollEl = document.getElementById('fc1-enroll');
  if (bar && typeof IntersectionObserver !== 'undefined'){
    var barVisible = {};
    var ioBar = new IntersectionObserver(function(entries){
      for (var b = 0; b < entries.length; b++){
        var vid = entries[b].target.id || ('el' + b);
        if (entries[b].isIntersecting) barVisible[vid] = 1; else delete barVisible[vid];
      }
      bar.classList.toggle('is-hidden', Object.keys(barVisible).length > 0);
    }, { threshold: 0.12 });
    if (topEl) ioBar.observe(topEl);
    if (enrollEl) ioBar.observe(enrollEl);
    stops.push(function(){ ioBar.disconnect(); });
  }
  // 언마운트 정리용 전역 정지 훅 (React cleanup 에서 호출 후 no-op 으로 교체)
  window.__fc1Stop = function(){
    for (var s = 0; s < stops.length; s++){ stops[s](); }
  };
})();
</script>
</div>`;

export default function FcClass() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  // 탭 클릭 → 클릭 시점에 대상 조회, 없으면 무동작 (scroll-margin-top 80px 로 헤더 오프셋 처리)
  // 점프 시 IntersectionObserver 가 reveal 을 못 잡아 섹션이 투명으로 남으므로,
  // 스크롤 직전에 전체 reveal 요소를 동기로 강제 표시 (첫 진입 자연 스크롤 애니메이션은 그대로)
  const onTabClick = (id: string) => {
    setActiveTab(id);
    document
      .querySelectorAll(".fc1-reveal, .fc1-reveal-scale")
      .forEach((el) => el.classList.add("fc1-in"));
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    setMounted(true);
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

    // 마지막 수강신청 버튼 + 하단 고정 바 CTA → 체크아웃 연결
    const cleanups: Array<() => void> = [];
    const goCheckout = (product: string) => (e: Event) => {
      e.preventDefault();
      router.push(`/checkout?product=${product}`);
    };
    container.querySelectorAll<HTMLButtonElement>(".fc1-enroll-btn").forEach((btn) => {
      const onEnroll = goCheckout(
        btn.classList.contains("fc1-enroll-btn--sale") ? "fc-class-early" : "fc-class"
      );
      btn.addEventListener("click", onEnroll);
      cleanups.push(() => btn.removeEventListener("click", onEnroll));
    });
    const barCta = container.querySelector<HTMLAnchorElement>(".fc1-bar-cta");
    if (barCta) {
      const onBar = goCheckout("fc-class-early");
      barCta.addEventListener("click", onBar);
      cleanups.push(() => barCta.removeEventListener("click", onBar));
    }

    return () => {
      cleanups.forEach((fn) => fn());
      injected.forEach((s) => s.remove());
      const w = window as unknown as Record<string, unknown>;
      const stop = w["__fc1Stop"];
      if (typeof stop === "function") (stop as () => void)();
      w["__fc1Stop"] = () => {};
    };
  }, [mounted, router]);

  return (
    <div
      className="overflow-x-hidden bg-white"
      data-seminar-date={SEMINAR_DATE}
      data-seminar-time={SEMINAR_TIME}
      data-seminar-place={SEMINAR_PLACE}
    >
      <style dangerouslySetInnerHTML={{ __html: TOP_STYLE }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(COURSE_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />

      {/* ── 0. 최상단: 고정 강의사진 / 결제 카드 2개 ── */}
      <section id="fc1-top" className="bg-[#f6f5f2] py-12 sm:py-16">
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[1.5fr_1fr]">
            {/* 좌: 강의 사진 */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#e6e4df]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HERO_IMAGE}
                alt="그로우 아카데미 FC 클래스 강의 현장"
                className="h-full w-full object-cover"
              />
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
                  onClick={() => router.push("/checkout?product=fc-class")}
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
                  onClick={() => router.push("/checkout?product=fc-class-early")}
                  className="fc1-pulse mt-5 w-full rounded-xl bg-[#22B573] py-4 text-base font-extrabold text-white transition-opacity hover:opacity-90"
                >
                  얼리버드 할인가로 신청하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 탭 내비게이션 ── */}
      <nav className="fc1-tab-bar" aria-label="페이지 섹션 이동">
        <div className="fc1-tab-in">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`fc1-tab-btn${activeTab === t.id ? " fc1-tab-active" : ""}`}
              onClick={() => onTabClick(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

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

      {/* ── 14. 수강생 텍스트 후기 — 주입 스크립트 비의존, 순수 React 렌더 ── */}
      <section className="fc1-rev-sec" id="fc1-reviews">
        <div className="fc1-rev-wrap">
          <div className="fc1-rev-head">
            <h2 className="fc1-rev-title">수강생 후기</h2>
            <div className="fc1-rev-score">
              <span className="fc1-rev-score-star">★</span>
              <b>5.0</b>
              <span className="fc1-rev-count">후기 {TEXT_REVIEWS.length}개</span>
            </div>
          </div>
          <div className="fc1-rev-list">
            {TEXT_REVIEWS.map((r) => (
              <div key={`${r.name}-${r.date}`} className="fc1-rev-item">
                <div className="fc1-rev-stars" aria-label="별점 5점 만점에 5점">
                  ★★★★★
                </div>
                <p className="fc1-rev-body">{r.text}</p>
                <div className="fc1-rev-meta">
                  <span className="fc1-rev-name">{r.name}</span>
                  <span className="fc1-rev-date">{r.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="fc1-barspacer" />
    </div>
  );
}
