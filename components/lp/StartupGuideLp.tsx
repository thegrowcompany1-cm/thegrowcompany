"use client";

// ─────────────────────────────────────────────────────────────────────────────
// /lp/startup-guide — 메타 광고 전용 창업 불안 해소형 랜딩 (CSS 접두사 lpg-)
//  · 기획: startup-guide-copy.md. 창업을 고민하는 사람의 걱정 5가지에 하나씩 답하고 "내 창업 계획 검토받기"로 잇는다.
//  · 최우선은 첫 화면이다 — 히어로에는 사진·영상 없이 글자만 즉시 그리고(약 85vh), 걱정 선택 칩 5개를 첫 화면 안에 둔다.
//    칩을 누르면 해당 섹션으로 스크롤하고, 고른 값은 폼 제출 때 route 값 뒤에 " / 걱정: [값]" 으로 붙는다.
//  · 디자인 시스템·가로 마퀴·라이트박스·단계 선택·FAQ 는 /lp/startup(StartupLpV3)과 같은 방식이다.
//    /lp/startup 은 건드리지 않으려고 같은 코드를 이 파일에 따로 둔다.
//  · 신청 폼은 /consulting/startup 의 창업 폼과 action·token·source·name·필드 구성이 같다 (새 필드 없음).
//    iframe 이름은 lpg_hidden_iframe, 성공 판정은 iframe load (done 가드 + 15초 타임아웃 + try/catch).
//    route 뒤에 붙는 순서: route / 준비단계: [단계] / 걱정: [걱정]. 전송 뒤 원래 값으로 되돌린다.
//  · 하단 고정 바는 첫 화면부터 보이고, 신청 폼 섹션이 화면에 보이면 숨긴다.
//  · 섹션 도달 측정은 data-track-section (lib/trackSections.ts 순서와 같아야 한다), 스크롤 25/50/75/100% 는 루트의 ScrollDepthTracker 가 보낸다.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const FORM_ACTION =
  "https://script.google.com/macros/s/AKfycbyTIVLMDS-DQjOZ1fIP9DbzJ2NONxyn6mdjEik1_ZG31XB9TVO0Y5_odvFwO1M0AcJ21Q/exec";
const FORM_SOURCE = "창업지원상담_아임웹";
const FORM_TOKEN = "grow2026secure";
const FORM_TARGET = "lpg_hidden_iframe";
const CTA_LABEL = "내 창업 계획 검토받기";
const PHOTO_CAP = "더그로우 창업 현장 실제 사진";

const CEO_CUTOUT = "/consultants/kim-jaegang-cutout.png";
const LEGACY = "/legacy/startup/";

const VIDEO_MAIN = { src: "/reviews/review-3.mp4", poster: "/reviews/review-3.jpg", caption: "일주일 만에 매출 8,300만원, 두번째 창업" };

// 걱정 선택 칩 — id 는 스크롤 목적지 섹션
const CONCERNS = [
  { label: "모은 돈을 잃을까 봐", to: "lpg-capital" },
  { label: "자리를 잘못 고를까 봐", to: "lpg-site" },
  { label: "견적에 속을까 봐", to: "lpg-interior" },
  { label: "회원이 안 올까 봐", to: "lpg-members" },
  { label: "운영을 못 할까 봐", to: "lpg-ops" },
];

const PHOTOS_SPACE = [
  { src: "640d2ed2ca7b9.jpg", alt: "공실 현장 실측", cap: "공실 현장 실측" },
  { src: "3a1f8666a4fb7.png", alt: "설계안 검토", cap: "설계안 검토" },
  { src: "74d515a717030.png", alt: "전속 인테리어팀 시공", cap: "전속 인테리어팀 시공" },
  { src: "994f3e4444876.png", alt: "완성된 센터", cap: "완성된 센터" },
];

// 시공사례 갤러리 — /consulting/startup 의 시공사례 46장 전체, 3줄로 나눈다
const GALLERY_ROWS: string[][] = [
  ["7febfcc8985e2.png", "147fe84156057.png", "0c832ab248ce4.png", "971ea42cfd8a8.png", "16d3196b68f2e.png", "e8eb94b6d52ff.png", "050b276ee45d7.png", "7fddde5b80282.png", "bdffa96015f92.png", "429d83e687190.png", "994f3e4444876.png", "4a9b8cbefcace.png", "d62ab4ed1c51e.png", "bcb8f87ab7f88.png", "dded8e6197f60.png", "24150a19c2437.png"],
  ["05fdbed8a415e.png", "5a7016f66c8e7.png", "5b6b3c8c692a6.png", "c0ad9289bb4b3.png", "a5225411385cf.png", "e7ec9b6e8f936.png", "d918cd70d9c08.png", "48a5270a28abe.png", "7855e31a685e9.png", "e75529ae4fab7.png", "425d8005700dd.png", "bf3bf2aea61a1.png", "b02205ae2e7da.png", "543e8bd02106a.png", "35a5086c05f11.png"],
  ["e49fbb8f83360.png", "ee0af39a17497.png", "31d7a26b1bcf3.png", "4e18b37fda8fc.png", "8ff784baa524b.png", "ce858defec5b3.png", "13ef060b46ff4.png", "ed2606eb9f936.png", "6542da8356ba3.png", "88d10aeb9e1fd.png", "500c88fe40f06.png", "fe2ba70d48273.png", "ba9e88035d811.png", "5985b8b2d6a41.png", "31adc48935f10.png"],
];
const GALLERY_ALL = GALLERY_ROWS.flat();

const STEPS_SITE = ["유동인구·경쟁 센터 조사", "후보지 비교", "현장 동행", "부동산 계약 동행"];
const STEPS_INTERIOR = ["실측", "매출 동선 설계안", "전속 인테리어팀 직접 시공", "기구 B2B 조건 연결"];
const STEPS_MEMBERS = ["가격·패키지 설계", "오픈 전 상담 구조", "프리세일 진행", "오픈세일 2달 직원 현장 상주"];
const OPS_FILES = ["섹터맵", "홍보일지", "회원관리", "상담 방법"];

const QUOTE_PRESALE = { text: "프리세일 때 목표의 150%를 달성했어요.", who: "이○○ 대표님 · 헬스장 · 서울 강서" };
const QUOTE_OPS = { text: "운영 시스템을 만들어주셔서 지금은 제가 매장에 없어도 잘 돌아갑니다.", who: "박○○ 대표님 · 필라테스 · 인천 송도" };
const REVIEWS = [
  { name: "김○○ 대표님", meta: "필라테스 · 경기 성남", text: "혼자 준비했으면 분명 실패했을 거예요." },
  { name: "최○○ 대표님", meta: "헬스장 · 경기 수원", text: "인테리어 비용이 합리적인데 퀄리티는 최고였어요. 동선까지 고려한 설계 덕분에 상담 전환율이 정말 높습니다." },
];

// 준비 단계 선택지와 맞춤 문구. label 이 route 뒤에 붙는 텍스트다.
const STAGES = [
  { label: "아직 구체적인 계획 전", msg: "업종·평수별 예상 창업비용부터 정리해 보내드립니다" },
  { label: "입지·상권 알아보는 중", msg: "희망 지역 1차 상권 검토 결과를 보내드립니다" },
  { label: "예산·인테리어 견적 검토 중", msg: "받으신 견적이 적정한지 함께 검토해드립니다" },
  { label: "계약 후 오픈 준비 중", msg: "오픈 전 회원 모집(프리세일) 설계 방향을 안내드립니다" },
];

const FAQS = [
  { q: "솔루션 비용", a: "센터 규모, 지역, 필요한 서비스 범위에 따라 달라집니다. 정보를 남겨주시면 대표님 상황에 맞춰 안내드립니다." },
  { q: "지방 진행 여부", a: "전국 어디든 가능합니다. 제주, 부산, 대구, 광주 등 전국에서 진행해왔고, 입지 선정은 직접 방문해 함께합니다." },
  { q: "창업 경험이 없는 경우", a: "처음이신 분들이 오히려 잘 맞습니다. 잘못된 습관 없이 처음부터 올바른 구조로 시작할 수 있기 때문입니다." },
  { q: "오픈 이후 지원", a: "오픈 후 안정화 기간 동안 운영 점검, 매출 분석, 마케팅 조정을 이어서 지원합니다." },
];

const STYLE = `
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
.lpg{--bk:#0A0A0A;--gr:#009519;--gl:#22B573;font-family:'Pretendard',var(--font-noto-sans-kr),-apple-system,BlinkMacSystemFont,system-ui,'Apple SD Gothic Neo',sans-serif;font-size:17px;font-weight:500;line-height:1.6;letter-spacing:-0.02em;color:#111;background:#fff;overflow-x:hidden;word-break:keep-all;overflow-wrap:break-word}
.lpg *,.lpg *::before,.lpg *::after{box-sizing:border-box}
:where(.lpg) :is(h1,h2,h3,h4,p,ul,ol,figure,blockquote){margin:0;padding:0}
:where(.lpg) :is(ul,ol){list-style:none}
.lpg img{max-width:100%}
.lpg section[id]{scroll-margin-top:80px}

.lpg-blk{padding:72px 20px;--hlc:#22B573;--pre:#fff}
.lpg-c{max-width:480px;margin:0 auto}
.lpg-bk{background:var(--bk);color:#fff}
.lpg-wh{background:#fff;color:#111;--hlc:#009519;--pre:#111}
.lpg-gr{background:var(--gr);color:#fff;--hlc:#0A0A0A;--pre:#fff}

.lpg-mega{font-size:clamp(29px,9.3vw,36px);font-weight:900;line-height:1.25;letter-spacing:-0.03em;text-align:center}
.lpg-p{font-size:17px;font-weight:500;line-height:1.6;text-align:center}
.lpg-sm{font-size:15px;font-weight:600;text-align:center;letter-spacing:-0.01em}
.lpg-bk .lpg-p,.lpg-bk .lpg-sm{color:rgba(255,255,255,.78)}
.lpg-wh .lpg-p{color:#444}
.lpg-wh .lpg-sm{color:#666}
.lpg-mt{margin-top:28px}
.lpg-mt-s{margin-top:16px}

.lpg-hl{display:inline;padding:2px 8px;margin:0 -2px;color:#fff;background-color:transparent;background-image:linear-gradient(var(--hlc),var(--hlc));background-repeat:no-repeat;background-size:100% 100%;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.lpg-js .lpg-hl{background-size:0% 100%;color:var(--pre);transition:background-size .7s cubic-bezier(.2,.7,.2,1) .25s,color .2s ease .55s}
.lpg-js .lpg-in .lpg-hl,.lpg-js .lpg-hl.lpg-in{background-size:100% 100%;color:#fff}
.lpg-js .lpg-rv{opacity:0;transform:translateY(26px);transition:opacity .7s ease,transform .7s ease}
.lpg-js .lpg-rv.lpg-in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){.lpg-js .lpg-rv,.lpg-js .lpg-hl{transition:none}}

.lpg-btn{display:flex;align-items:center;justify-content:center;width:100%;min-height:64px;border:none;border-radius:16px;background:var(--gr);color:#fff;font-family:inherit;font-size:20px;font-weight:900;letter-spacing:-0.02em;cursor:pointer;box-shadow:0 10px 30px rgba(0,149,25,.45)}
.lpg-btn:active{transform:scale(.99)}

/* 히어로 — 글자만, 사진·영상 없음. 높이는 첫 화면의 약 85%(헤더 80px 포함)라 다음 섹션 제목이 아래에 살짝 보인다 */
.lpg-hero{display:flex;align-items:center;min-height:calc(85vh - 80px);min-height:calc(85svh - 80px);padding:100px 20px 30px;background:var(--bk);color:#fff;--hlc:#22B573;--pre:#fff}
@media(min-width:1024px){.lpg-hero{padding-top:116px}}
.lpg-hero .lpg-c{width:100%}
.lpg-badge{display:table;margin:0 auto 16px;padding:6px 14px;border-radius:50px;background:rgba(34,181,115,.16);border:1px solid rgba(34,181,115,.55);color:var(--gl);font-size:14px;font-weight:800;letter-spacing:-0.01em}
.lpg-hero .lpg-mega{font-size:clamp(26px,8.2vw,34px);line-height:1.34;word-break:keep-all}
.lpg-br4{display:none}
@media(max-width:379px){.lpg-br4{display:inline}}
@media(max-width:480px){.lpg-hero .lpg-mega{font-size:clamp(23px,7.2vw,30px);line-height:1.3}}
@media(max-height:700px){.lpg-hero{padding-top:44px}.lpg-hero .lpg-mega{line-height:1.22}.lpg-hero .lpg-badge{margin-bottom:10px}.lpg-hero .lpg-hero-sub{margin-top:8px;font-size:14.5px;line-height:1.5}.lpg-hero .lpg-ask0{margin-top:14px}.lpg-hero .lpg-chips{margin-top:8px}}
.lpg-gtx{color:var(--gl);font-weight:800}
.lpg-lead{margin:0 0 18px;font-size:17px;font-weight:800;line-height:1.45;text-align:center;color:#111;letter-spacing:-0.02em}
.lpg-hero-sub{margin-top:14px;font-size:15.5px;font-weight:600;line-height:1.55;text-align:center;color:rgba(255,255,255,.8)}
.lpg-ask0{margin-top:22px;font-size:17px;font-weight:800;text-align:center;letter-spacing:-0.02em}
.lpg-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:12px}
.lpg-chip{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 15px;border:2px solid rgba(255,255,255,.5);border-radius:50px;background:transparent;color:#fff;font-family:inherit;font-size:15px;font-weight:800;letter-spacing:-0.02em;cursor:pointer;transition:background .15s,border-color .15s,color .15s}
.lpg-chip:active{transform:scale(.97)}
.lpg-chip.is-on{background:var(--gl);border-color:var(--gl);color:#0A0A0A}

/* 걱정 문장 — 큰 인용 스타일 */
.lpg-worry{margin:0 0 18px;font-size:21px;font-weight:800;line-height:1.45;letter-spacing:-0.03em;text-align:center;color:#8d8d8d}
.lpg-worry::before{content:'\\201C'}
.lpg-worry::after{content:'\\201D'}
.lpg-bk .lpg-worry{color:#9a9a9a}
.lpg-gr .lpg-worry{color:#fff}
.lpg-eyebrow{display:table;margin:0 auto 14px;padding:6px 14px;border-radius:50px;font-size:14px;font-weight:800;background:var(--gr);color:#fff}

/* 진행 단계 — 세로 번호 라인 */
.lpg-steps{position:relative;margin:30px 0 0;padding-left:0}
.lpg-steps::before{content:'';position:absolute;left:17px;top:22px;bottom:22px;width:2px;background:currentColor;opacity:.22}
.lpg-steps li{position:relative;display:flex;align-items:center;gap:16px;padding:9px 0;font-size:19px;font-weight:800;letter-spacing:-0.03em;line-height:1.35}
.lpg-steps li i{position:relative;flex:0 0 36px;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--gr);color:#fff;font-style:normal;font-size:16px;font-weight:900}
.lpg-bk .lpg-steps li i{background:var(--gl);color:#0A0A0A}
.lpg-gr .lpg-steps li i{background:#fff;color:var(--gr)}

/* 받는 것 칩 */
.lpg-get{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;margin-top:22px}
.lpg-get small{font-size:14px;font-weight:700;opacity:.7;margin-right:2px}
.lpg-get span{padding:8px 14px;border-radius:50px;border:2px solid currentColor;font-size:15px;font-weight:800;letter-spacing:-0.02em}
.lpg-bk .lpg-get span{border-color:var(--gl);color:var(--gl)}
.lpg-wh .lpg-get span{border-color:var(--gr);color:var(--gr)}

/* 본문 블록 — 큰 제목 + 설명, 좌측 그린 세로선 */
.lpg-bl{margin-top:26px;padding:4px 0 4px 18px;border-left:5px solid var(--gr)}
.lpg-bl + .lpg-bl{margin-top:22px}
.lpg-bl h3{font-size:22px;font-weight:900;letter-spacing:-0.03em;line-height:1.3}
.lpg-bl p{margin-top:8px;font-size:17px;font-weight:500;line-height:1.6;color:#444}

/* 사진 */
.lpg-ph{position:relative;margin:30px -20px 0}
.lpg-ph img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;background:#1a1a1a}
.lpg-ph-sm{width:52%;margin:-34px 0 0 auto;position:relative}
.lpg-ph-sm img{display:block;width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:14px;border:4px solid var(--bk);background:#1a1a1a}
.lpg-pair{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:30px}
.lpg-pair img{display:block;width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:14px;background:#1a1a1a}
.lpg-cap{margin-top:10px;font-size:13px;font-weight:600;text-align:center;color:#8a8a8a;letter-spacing:0}
@media(min-width:481px){.lpg-ph{margin-left:0;margin-right:0}.lpg-ph img{border-radius:16px}}

.lpg-q{margin-top:30px;padding-top:24px;border-top:2px solid currentColor;text-align:center}
.lpg-q b{display:block;font-size:22px;font-weight:800;line-height:1.4;letter-spacing:-0.03em}
.lpg-q b::before{content:'\\201C';color:var(--gr);margin-right:2px}
.lpg-q b::after{content:'\\201D';color:var(--gr);margin-left:2px}
.lpg-bk .lpg-q b::before,.lpg-bk .lpg-q b::after{color:var(--gl)}
.lpg-gr .lpg-q b::before,.lpg-gr .lpg-q b::after{color:#0A0A0A}
.lpg-q small{display:block;margin-top:10px;font-size:14px;font-weight:600;color:#777;letter-spacing:0}
.lpg-bk .lpg-q small{color:#9a9a9a}
.lpg-gr .lpg-q small{color:rgba(255,255,255,.85)}
.lpg-wh .lpg-q{border-top-color:#e4e4e4}
.lpg-bk .lpg-q{border-top-color:rgba(255,255,255,.14)}
.lpg-gr .lpg-q{border-top-color:rgba(255,255,255,.5)}

/* 가로 스와이프 (인테리어 사진) */
.lpg-sw{display:flex;gap:12px;margin:30px -20px 0;padding:0 20px 6px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.lpg-sw::-webkit-scrollbar{display:none}
.lpg-sw > *{flex:0 0 78%;scroll-snap-align:start}
.lpg-sw figure img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:16px;background:#1a1a1a}
.lpg-sw figcaption{margin-top:8px;font-size:14px;font-weight:700;text-align:center;color:#444}
@media(min-width:481px){.lpg-sw{margin-left:0;margin-right:0;padding-left:0;padding-right:0}}

/* 운영 파일 */
.lpg-files{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:18px}
.lpg-files li{padding:9px 16px;border-radius:12px;background:#f0faf1;border:2px solid var(--gr);color:var(--gr);font-size:16px;font-weight:800}

/* 마케팅 채널 배지 2x2 */
.lpg-ch{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:30px}
.lpg-ch li{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;min-height:104px;padding:14px 8px;border-radius:16px;border:2px solid rgba(255,255,255,.22);font-size:16px;font-weight:800;letter-spacing:-0.02em;text-align:center}
.lpg-ch svg{width:32px;height:32px;color:var(--gl)}

/* 영상 */
.lpg-vid{position:relative;border-radius:18px;overflow:hidden;background:#1a1a1a;aspect-ratio:9/16;max-width:300px;margin:30px auto 0}
.lpg-vid video{width:100%;height:100%;object-fit:cover;display:block}
.lpg-vid-play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;border:none;background:rgba(0,0,0,.2);cursor:pointer}
.lpg-vid-play span{display:flex;align-items:center;justify-content:center;width:68px;height:68px;border-radius:50%;background:var(--gr);box-shadow:0 8px 24px rgba(0,0,0,.45)}
.lpg-vcap{margin-top:12px;font-size:14px;font-weight:600;line-height:1.5;color:#bdbdbd;text-align:center}

/* 시공사례 갤러리 — 3줄 마퀴 + 라이트박스 */
.lpg-gal{display:flex;flex-direction:column;gap:10px;margin-top:30px;overflow:hidden}
.lpg-gal .lpg-mq{margin-top:0}
.lpg-tile{display:block;width:140px;height:140px;padding:0;border:none;border-radius:8px;overflow:hidden;background:#1a1a1a;cursor:pointer}
.lpg-tile img{display:block;width:100%;height:100%;object-fit:cover;object-position:bottom}
@media(min-width:481px){.lpg-tile{width:180px;height:180px}}
.lpg-lb{position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.92);padding:64px 12px}
@media(min-width:481px){.lpg-lb{padding:64px 64px}}
.lpg-lb img{display:block;max-width:100%;max-height:100%;width:auto;height:auto;border-radius:8px}
.lpg-lb-x,.lpg-lb-p,.lpg-lb-n{position:absolute;display:flex;align-items:center;justify-content:center;width:44px;height:44px;border:none;border-radius:50%;background:rgba(255,255,255,.14);color:#fff;font-size:22px;line-height:1;cursor:pointer}
.lpg-lb-x{top:14px;right:14px}
.lpg-lb-p{left:8px;top:50%;margin-top:-22px}
.lpg-lb-n{right:8px;top:50%;margin-top:-22px}
.lpg-lb-c{position:absolute;bottom:18px;left:0;right:0;text-align:center;font-size:14px;font-weight:600;color:rgba(255,255,255,.7);letter-spacing:0}

.lpg-mq{position:relative;overflow:hidden;margin:30px -20px 0;width:calc(100% + 40px);touch-action:pan-y;cursor:grab;-webkit-user-select:none;user-select:none}
.lpg-mq.is-dragging{cursor:grabbing}
.lpg-mq img{-webkit-user-drag:none}
.lpg-mq-track{display:flex;align-items:stretch;width:max-content;will-change:transform}
.lpg-mq-i{flex:0 0 auto;display:flex;margin-right:12px}
.lpg-mq-i:first-child{margin-left:20px}
.lpg-rvc{width:300px;display:flex;flex-direction:column;justify-content:center;padding:28px 24px;border-radius:16px;background:#161616;border:1px solid #2a2a2a;color:#fff}
.lpg-rvc p{font-size:19px;font-weight:700;line-height:1.5;letter-spacing:-0.03em}
.lpg-rvc small{display:block;margin-top:14px;font-size:14px;font-weight:600;color:#9a9a9a;letter-spacing:0}
@media(min-width:481px){.lpg-mq{margin-left:0;margin-right:0;width:100%}.lpg-mq-i:first-child{margin-left:0}}

/* 사람 — 화이트 → 블랙 */
.lpg-person{background:linear-gradient(to bottom,#fff 0%,#fff 18%,#0A0A0A 58%,#0A0A0A 100%);color:#fff;padding:0 20px 72px}
.lpg-person-ph{position:relative;margin:0 -20px}
.lpg-person-ph img{display:block;width:100%;height:auto}
.lpg-person-ph::after{content:'';position:absolute;left:0;right:0;bottom:0;height:34%;background:linear-gradient(to bottom,rgba(10,10,10,0),#0A0A0A 94%);pointer-events:none}
.lpg-person-name{position:relative;margin-top:-4px;text-align:center;font-size:19px;font-weight:800}
.lpg-num{margin-top:26px;text-align:center;line-height:1}
.lpg-num b{font-size:84px;font-weight:900;letter-spacing:-0.04em;color:var(--gl)}
.lpg-num span{font-size:32px;font-weight:900;color:var(--gl);margin-left:4px}
.lpg-num-d{margin-top:8px;text-align:center;font-size:17px;font-weight:600;color:rgba(255,255,255,.8)}
.lpg-person-line{margin-top:30px;font-size:22px;font-weight:800;line-height:1.4;text-align:center;letter-spacing:-0.03em}
@media(min-width:481px){.lpg-person-ph{margin-left:0;margin-right:0}}
@media(max-width:480px){.lpg-num b{font-size:76px}}

/* 단계 선택 + 폼 */
.lpg-ask{margin-top:34px;font-size:22px;font-weight:800;text-align:center;letter-spacing:-0.03em}
.lpg-stages{display:flex;flex-direction:column;gap:10px;margin-top:18px}
.lpg-stage{display:flex;align-items:center;gap:12px;width:100%;min-height:56px;padding:0 18px;border:2px solid rgba(255,255,255,.75);border-radius:14px;background:transparent;color:#fff;font-family:inherit;font-size:17px;font-weight:800;text-align:left;cursor:pointer;letter-spacing:-0.02em;transition:background .2s,border-color .2s,color .2s}
.lpg-stage i{flex:0 0 26px;width:26px;height:26px;border-radius:50%;border:2px solid rgba(255,255,255,.75);display:flex;align-items:center;justify-content:center;font-style:normal;font-size:13px;font-weight:900}
.lpg-stage.is-on{background:#fff;border-color:#fff;color:var(--gr)}
.lpg-stage.is-on i{background:var(--gr);border-color:var(--gr);color:#fff}
.lpg-stage-msg{margin-top:22px;padding:18px 20px;border-radius:14px;background:#0A0A0A;color:#fff;font-size:18px;font-weight:800;line-height:1.5;text-align:center;letter-spacing:-0.02em}
.lpg-stage-msg small{display:block;margin-top:6px;font-size:14px;font-weight:600;color:var(--gl);letter-spacing:0}

.lpg-form-blk{padding:56px 20px 70px;scroll-margin-top:80px}
.lpg-form-t{font-size:22px;font-weight:900;text-align:center;letter-spacing:-0.03em;margin-bottom:26px}
.lpg-grp{margin-bottom:22px}
.lpg-label{display:block;margin-bottom:9px;font-size:16px;font-weight:700;color:#111}
.lpg-label small{font-size:14px;font-weight:500;color:#777}
.lpg-req{color:#e03131}
.lpg-in-f{display:block;width:100%;height:56px;padding:0 16px;border:2px solid #e3e3e3;border-radius:12px;background:#fff;font-family:inherit;font-size:17px;font-weight:500;color:#111}
.lpg-in-f::placeholder{color:#a3a3a3}
.lpg-in-f:focus{outline:none;border-color:var(--gr);box-shadow:0 0 0 4px rgba(0,149,25,.12)}
.lpg-phone{display:flex;align-items:center;gap:8px}
.lpg-phone .lpg-in-f{min-width:0;padding:0 4px;text-align:center}
.lpg-phone > span{color:#aaa}
.lpg-radio{display:flex;align-items:center;gap:12px;min-height:54px;margin-bottom:10px;padding:0 16px;border:2px solid #e3e3e3;border-radius:12px;font-size:16px;font-weight:600;color:#111;cursor:pointer}
.lpg-radio input{width:20px;height:20px;margin:0;accent-color:var(--gr);flex:0 0 auto}
.lpg-radio:has(input:checked){border-color:var(--gr);background:#f0faf1}
.lpg-submit{display:block;width:100%;min-height:64px;margin-top:6px;border:none;border-radius:16px;background:var(--gr);color:#fff;font-family:inherit;font-size:20px;font-weight:900;cursor:pointer;box-shadow:0 10px 30px rgba(0,149,25,.4)}
.lpg-submit:disabled{opacity:.55;cursor:not-allowed}
.lpg-notice{margin-top:18px;text-align:center;font-size:15px;font-weight:600;line-height:1.7;color:#555}
.lpg-done{padding:56px 10px;text-align:center;font-size:17px;line-height:1.7;color:#444}
.lpg-done b{display:block;margin-bottom:10px;font-size:26px;font-weight:900;color:var(--gr);letter-spacing:-0.03em}

/* FAQ */
.lpg-faq{margin-top:30px}
.lpg-faq details{border-bottom:1px solid #e4e4e4}
.lpg-faq details:first-child{border-top:1px solid #e4e4e4}
.lpg-faq summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:22px 2px;font-size:19px;font-weight:800;letter-spacing:-0.03em}
.lpg-faq summary::-webkit-details-marker{display:none}
.lpg-faq summary::after{content:'+';flex:0 0 auto;font-size:28px;font-weight:400;color:var(--gr)}
.lpg-faq details[open] summary::after{content:'\\2212'}
.lpg-faq p{padding:0 2px 24px;font-size:17px;font-weight:500;line-height:1.65;color:#444}

/* 하단 고정 바 */
.lpg-bar{position:fixed;left:50%;bottom:0;z-index:60;width:min(100%,480px);padding:10px 12px calc(10px + env(safe-area-inset-bottom));transform:translateX(-50%);transition:transform .3s ease,opacity .3s ease}
.lpg-bar.is-hidden{transform:translate(-50%,120%);opacity:0;pointer-events:none}
.lpg-bar .lpg-btn{min-height:58px}
.lpg-bar-space{height:calc(78px + env(safe-area-inset-bottom));background:#fff}
`;

type Win = Window & {
  gtag?: (...a: unknown[]) => void;
  __tgcFbTrack?: (e: string, p?: Record<string, unknown>) => void;
};

const Hl = ({ children }: { children: ReactNode }) => <mark className="lpg-hl">{children}</mark>;

const Worry = ({ children }: { children: ReactNode }) => <p className="lpg-worry lpg-rv">{children}</p>;

const Steps = ({ items }: { items: string[] }) => (
  <ol className="lpg-steps">
    {items.map((t, i) => (
      <li key={t}>
        <i>{i + 1}</i>
        <span>{t}</span>
      </li>
    ))}
  </ol>
);

const Get = ({ items }: { items: string[] }) => (
  <p className="lpg-get">
    <small>받는 것</small>
    {items.map((t) => (
      <span key={t}>{t}</span>
    ))}
  </p>
);

// 채널 아이콘 — 단순한 선 아이콘
const IC = {
  place: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  ),
  insta: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r=".6" />
    </svg>
  ),
  carrot: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 20c1-6 5-11 11-12-1 6-5 10-11 12z" />
      <path d="M15 8c0-2 1-3.5 3-4M15 8c2 0 3.5-1 4-3" />
    </svg>
  ),
  flyer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M14 3v5h5M9 13h7M9 17h5" />
    </svg>
  ),
};
const CHANNELS = [
  { label: "네이버 플레이스", ic: IC.place },
  { label: "인스타그램", ic: IC.insta },
  { label: "당근", ic: IC.carrot },
  { label: "전단지 시안", ic: IC.flyer },
];

// 가로 마퀴 — 한 벌을 두 번 이어 붙이고(한 벌 폭 = track.scrollWidth / 2) rAF 로 offset 을 움직인다.
//  · 드래그: 가로 이동이 세로보다 클 때만 잡는다(touch-action: pan-y). 놓으면 가벼운 관성 뒤 자동 이동 재개. 6px 이상 끌었으면 click 은 삼킨다.
//  · paused(라이트박스 등) 이거나 화면 밖이면 자동 이동을 멈춘다. 언마운트 시 rAF·옵저버·리스너 정리.
function Marquee({ items, dur, reverse = false, paused = false }: { items: ReactNode[]; dur: number; reverse?: boolean; paused?: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const st = useRef({
    offset: 0,
    raf: 0,
    last: 0,
    hover: false,
    pointerId: -1,
    phase: "idle" as "idle" | "pending" | "drag",
    startX: 0,
    startY: 0,
    startOffset: 0,
    dist: 0,
    prevX: 0,
    prevT: 0,
    vel: 0,
  });

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;
    const S = st.current;
    const dir = reverse ? 1 : -1;

    const half = () => track.scrollWidth / 2;
    const normalize = () => {
      const h = half();
      if (h <= 0) return;
      while (S.offset <= -h) S.offset += h;
      while (S.offset > 0) S.offset -= h;
    };
    const apply = () => {
      track.style.transform = `translateX(${S.offset}px)`;
    };

    const frame = (ts: number) => {
      if (!S.last) S.last = ts;
      const dt = Math.min(ts - S.last, 64);
      S.last = ts;
      if (S.phase !== "drag") {
        if (S.vel !== 0) {
          S.offset += S.vel * dt;
          S.vel *= Math.exp(-dt / 150);
          if (Math.abs(S.vel) < 0.02) S.vel = 0;
        } else if (!pausedRef.current && !S.hover) {
          S.offset += (dir * half() * dt) / (dur * 1000);
        }
        normalize();
        apply();
      }
      S.raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (S.raf) return;
      S.last = 0;
      S.raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (S.raf) cancelAnimationFrame(S.raf);
      S.raf = 0;
    };

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          if (entries[entries.length - 1].isIntersecting) start();
          else stop();
        },
        { threshold: 0, rootMargin: "120px 0px" },
      );
      io.observe(wrap);
    } else {
      start();
    }

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      S.phase = "pending";
      S.pointerId = e.pointerId;
      S.startX = e.clientX;
      S.startY = e.clientY;
      S.startOffset = S.offset;
      S.dist = 0;
      S.prevX = e.clientX;
      S.prevT = e.timeStamp;
      S.vel = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (S.phase === "idle" || e.pointerId !== S.pointerId) return;
      const dx = e.clientX - S.startX;
      const dy = e.clientY - S.startY;
      if (S.phase === "pending") {
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        if (Math.abs(dy) > Math.abs(dx)) {
          S.phase = "idle";
          return;
        }
        S.phase = "drag";
        wrap.classList.add("is-dragging");
        try {
          wrap.setPointerCapture(e.pointerId);
        } catch {
          // 캡처 불가 환경이면 그냥 진행
        }
      }
      S.dist = Math.max(S.dist, Math.abs(dx));
      S.offset = S.startOffset + dx;
      normalize();
      apply();
      const dt = e.timeStamp - S.prevT;
      if (dt > 0) S.vel = (e.clientX - S.prevX) / dt;
      S.prevX = e.clientX;
      S.prevT = e.timeStamp;
      e.preventDefault();
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== S.pointerId) return;
      if (S.phase === "drag") {
        wrap.classList.remove("is-dragging");
        try {
          wrap.releasePointerCapture(e.pointerId);
        } catch {
          // 이미 해제됐으면 무시
        }
        if (e.timeStamp - S.prevT > 80) S.vel = 0;
        S.vel = Math.max(-1.5, Math.min(1.5, S.vel));
      }
      S.phase = "idle";
      S.pointerId = -1;
    };
    const onClick = (e: MouseEvent) => {
      if (S.dist >= 6) {
        e.stopPropagation();
        e.preventDefault();
        S.dist = 0;
      }
    };
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse") S.hover = true;
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "mouse") S.hover = false;
    };
    const onDragStart = (e: Event) => e.preventDefault();

    wrap.addEventListener("pointerdown", onDown);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerup", onUp);
    wrap.addEventListener("pointercancel", onUp);
    wrap.addEventListener("click", onClick, true);
    wrap.addEventListener("pointerenter", onEnter);
    wrap.addEventListener("pointerleave", onLeave);
    wrap.addEventListener("dragstart", onDragStart);

    return () => {
      stop();
      io?.disconnect();
      wrap.removeEventListener("pointerdown", onDown);
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerup", onUp);
      wrap.removeEventListener("pointercancel", onUp);
      wrap.removeEventListener("click", onClick, true);
      wrap.removeEventListener("pointerenter", onEnter);
      wrap.removeEventListener("pointerleave", onLeave);
      wrap.removeEventListener("dragstart", onDragStart);
      wrap.classList.remove("is-dragging");
    };
  }, [dur, reverse]);

  return (
    <div ref={wrapRef} className="lpg-mq">
      <div ref={trackRef} className="lpg-mq-track">
        {items.map((n, i) => (
          <div className="lpg-mq-i" key={`a${i}`}>
            {n}
          </div>
        ))}
        {items.map((n, i) => (
          <div className="lpg-mq-i" key={`b${i}`} aria-hidden="true">
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoCard({ src, poster, caption }: { src: string; poster: string; caption?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  return (
    <figure>
      <div className="lpg-vid">
        <video ref={ref} src={src} poster={poster} preload="none" playsInline controls={started} onEnded={() => setStarted(false)} />
        {!started && (
          <button
            type="button"
            className="lpg-vid-play"
            aria-label="후기 영상 재생"
            onClick={() => {
              setStarted(true);
              void ref.current?.play();
            }}
          >
            <span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}
      </div>
      {caption && <figcaption className="lpg-vcap">{caption}</figcaption>}
    </figure>
  );
}

export default function StartupGuideLp() {
  const [concern, setConcern] = useState<string | null>(null);
  const [stage, setStage] = useState<number | null>(null);
  const [lb, setLb] = useState<number | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [chipsVisible, setChipsVisible] = useState(true);
  const barHidden = formVisible || chipsVisible;

  const rootRef = useRef<HTMLDivElement>(null);
  const formSecRef = useRef<HTMLElement>(null);
  const stageMsgRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const phoneRefs = useRef<(HTMLInputElement | null)[]>([]);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => () => stopRef.current?.(), []);

  // 진입 애니메이션 — 스크립트가 켜진 경우에만 숨겼다가 보여 준다 (기본은 표시). 히어로에는 걸지 않는다.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.classList.add("lpg-js");
    if (typeof IntersectionObserver === "undefined") {
      root.classList.remove("lpg-js");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("lpg-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.2 },
    );
    root.querySelectorAll(".lpg-rv, .lpg-hl").forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      root.classList.remove("lpg-js");
    };
  }, []);

  // 하단 고정 바 — 신청 폼 섹션이 화면에 보이면 숨김
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || !formSecRef.current) return;
    const io = new IntersectionObserver((entries) => setFormVisible(entries[entries.length - 1].isIntersecting), { threshold: 0.02 });
    io.observe(formSecRef.current);
    return () => io.disconnect();
  }, []);

  // 하단 고정 바 — 히어로 걱정 칩이 화면에 보이는 동안은 숨김(칩이 지나가면 표시)
  useEffect(() => {
    const el = document.getElementById("lpg-chips");
    if (typeof IntersectionObserver === "undefined" || !el) return;
    const io = new IntersectionObserver((entries) => setChipsVisible(entries[entries.length - 1].isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 라이트박스 — body 스크롤 잠금, Esc 닫기, 좌우 화살표 넘김
  useEffect(() => {
    if (lb === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLb(null);
      else if (e.key === "ArrowLeft") setLb((i) => (i === null ? null : (i - 1 + GALLERY_ALL.length) % GALLERY_ALL.length));
      else if (e.key === "ArrowRight") setLb((i) => (i === null ? null : (i + 1) % GALLERY_ALL.length));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [lb]);
  const lbMove = (d: number) => setLb((i) => (i === null ? null : (i + d + GALLERY_ALL.length) % GALLERY_ALL.length));

  const scrollToForm = useCallback(() => {
    document.getElementById("lpg-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // 걱정 칩 — 해당 섹션으로 스크롤 + 선택 표시(다시 고르면 바뀜). GA4 hero_concern
  const pickConcern = (c: (typeof CONCERNS)[number]) => {
    setConcern(c.label);
    const w = window as Win;
    if (typeof w.gtag === "function") w.gtag("event", "hero_concern", { concern: c.label });
    document.getElementById(c.to)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // 단계 선택 — 맞춤 문구만 바뀐다(폼은 항상 보임), 재선택 가능. GA4 stage_select
  const pickStage = (i: number) => {
    setStage(i);
    const w = window as Win;
    if (typeof w.gtag === "function") w.gtag("event", "stage_select", { stage: STAGES[i].label });
    window.setTimeout(() => stageMsgRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
  };

  const onPhoneInput = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    const digits = el.value.replace(/[^0-9]/g, "");
    if (digits !== el.value) el.value = digits;
    if (digits.length >= el.maxLength && index < 5) phoneRefs.current[index + 1]?.focus();
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (submitting) return;

    const val = (n: string) => (form.elements.namedItem(n) as HTMLInputElement | null)?.value ?? "";
    if (
      val("phone1") !== val("phoneCheck1") ||
      val("phone2") !== val("phoneCheck2") ||
      val("phone3") !== val("phoneCheck3")
    ) {
      alert("연락처가 일치하지 않습니다. 다시 확인해주세요.");
      return;
    }

    // 전송은 hidden iframe 으로 직접 한다. 응답 본문은 교차 출처라 읽을 수 없으므로
    // "요청이 끝나 응답 문서가 로드됨(iframe load)" 까지만 성공으로 본다.
    const iframe = iframeRef.current;
    let done = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let onLoad: (() => void) | null = null;
    const cleanup = () => {
      if (timer) clearTimeout(timer);
      if (iframe && onLoad) iframe.removeEventListener("load", onLoad);
      stopRef.current = null;
    };
    stopRef.current = cleanup;

    try {
      if (!iframe) throw new Error("lpg iframe not found");
      setSubmitting(true);

      onLoad = () => {
        if (done) return; // 15초 뒤에 늦게 온 load 는 무시
        done = true;
        cleanup();
        try {
          const w = window as Win;
          if (typeof w.gtag === "function") w.gtag("event", "form_submit", { form_source: FORM_SOURCE });
          if (typeof w.__tgcFbTrack === "function") w.__tgcFbTrack("Lead", { content_name: FORM_SOURCE });
          setSent(true);
        } finally {
          setSubmitting(false);
        }
      };
      iframe.addEventListener("load", onLoad);

      timer = setTimeout(() => {
        if (done) return;
        done = true;
        cleanup();
        alert("전송 중 오류가 발생했습니다. 다시 시도해주세요.");
        setSubmitting(false);
      }, 15000);

      // 고른 준비 단계·걱정은 별도 필드 없이 route 값 뒤에 붙인다 (순서: route / 준비단계 / 걱정).
      // submit() 이 값을 읽는 건 동기라 바로 되돌려도 전송에는 붙은 값이 실리고, 재제출 때 두 번 붙지 않는다.
      const routeEl = form.querySelector<HTMLInputElement>('input[name="route"]:checked');
      const routeOrig = routeEl?.value ?? "";
      if (routeEl) {
        let v = routeOrig;
        if (stage !== null) v += ` / 준비단계: ${STAGES[stage].label}`;
        if (concern !== null) v += ` / 걱정: ${concern}`;
        routeEl.value = v;
      }
      try {
        form.submit();
      } finally {
        if (routeEl) routeEl.value = routeOrig;
      }
    } catch {
      done = true;
      cleanup();
      alert("전송 중 오류가 발생했습니다. 다시 시도해주세요.");
      setSubmitting(false);
    }
  };

  const reviewItems: ReactNode[] = REVIEWS.map((r) => (
    <div className="lpg-rvc" key={r.name}>
      <p>{r.text}</p>
      <small>
        {r.name} · {r.meta}
      </small>
    </div>
  ));

  return (
    <div className="lpg" ref={rootRef}>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />

      {/* 1 히어로 [블랙, 약 85vh] — 글자만, 사진·영상 없음 */}
      <section data-track-section="hero" className="lpg-hero">
        <div className="lpg-c">
          <p className="lpg-badge">헬스장·필라테스 창업 250회</p>
          <h1 className="lpg-mega">
            언젠가 내 센터를{" "}
            <br className="lpg-br4" />
            차리고 싶었는데
            <br />
            막상 시작하려니
            <br />
            <Hl>확신이 서지 않습니다</Hl>
          </h1>
          <p className="lpg-hero-sub">
            열심히 모은 돈, 오래 준비한 꿈이라 더 쉽게 결정할 수 없습니다.
            <br />
            용기가 부족한 게 아니라, <span className="lpg-gtx">확신할 근거</span>가 부족한 겁니다.
          </p>
          <p className="lpg-ask0" id="lpg-ask0">지금 가장 걸리는 마음을 눌러보세요</p>
          <div className="lpg-chips" id="lpg-chips" role="group" aria-labelledby="lpg-ask0">
            {CONCERNS.map((c) => (
              <button key={c.label} type="button" className={`lpg-chip${concern === c.label ? " is-on" : ""}`} aria-pressed={concern === c.label} onClick={() => pickConcern(c)}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2 자본 [화이트] */}
      <section data-track-section="capital" id="lpg-capital">
        <div className="lpg-blk lpg-wh">
          <div className="lpg-c">
            <p className="lpg-lead">확신할 근거, 이 5가지로 하나씩 만들어 드립니다</p>
            <p className="lpg-eyebrow">비용과 지역, 솔직하게 말씀드립니다</p>
            <h2 className="lpg-mega lpg-rv">
              자본에 맞춰 <Hl>업종과 평수부터</Hl> 다시 봅니다
            </h2>
            <div className="lpg-bl">
              <h3>컨설팅 비용</h3>
              <p>
                업종과 규모에 따라 범위가 크게 달라집니다.
                <br />
                첫 미팅에서 대표님 계획을 듣고, 그에 맞춰 제안드립니다.
              </p>
            </div>
            <div className="lpg-bl">
              <h3>원하시는 지역</h3>
              <p>
                원하시는 지역이 상권상 맞지 않으면 다른 자리를 제안드릴 수 있습니다.
                <br />
                쉬운 길보다 망하지 않는 길을 먼저 말씀드리기 때문입니다.
              </p>
            </div>
            <div className="lpg-mt">
              <button type="button" className="lpg-btn" onClick={scrollToForm}>
                내 자본으로 가능한지 검토받기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3 자리·상권 [블랙] */}
      <section data-track-section="site" id="lpg-site">
        <div className="lpg-blk lpg-bk">
          <div className="lpg-c">
            <Worry>중개사 말만 믿고 계약해도 될까</Worry>
            <h2 className="lpg-mega lpg-rv">
              감이 아니라 <Hl>데이터로</Hl> 자리를 고릅니다
            </h2>
            <Steps items={STEPS_SITE} />
            <figure className="lpg-ph">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LEGACY + "badee82e80f1a.jpg"} alt="입지 현장 동행" loading="lazy" />
            </figure>
            <div className="lpg-ph-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LEGACY + "a6e88ac28e29b.png"} alt="현장 상담 장면" loading="lazy" />
            </div>
            <Get items={["후보지 비교 자료", "계약 전 체크리스트"]} />
            <p className="lpg-cap">{PHOTO_CAP}</p>
          </div>
        </div>
      </section>

      {/* 4 인테리어 비용 [화이트] */}
      <section data-track-section="interior" id="lpg-interior">
        <div className="lpg-blk lpg-wh">
          <div className="lpg-c">
            <Worry>견적이 왜 업체마다 다를까, 추가금은 없을까</Worry>
            <h2 className="lpg-mega lpg-rv">
              예쁜 공간이 아니라 <Hl>매출이 나오는 동선</Hl>
            </h2>
            <Steps items={STEPS_INTERIOR} />
            <div className="lpg-sw">
              {PHOTOS_SPACE.map((p) => (
                <figure key={p.src}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={LEGACY + p.src} alt={p.alt} loading="lazy" />
                  <figcaption>{p.cap}</figcaption>
                </figure>
              ))}
            </div>
            <Get items={["설계안", "항목별 견적"]} />
            <p className="lpg-cap">{PHOTO_CAP}</p>
          </div>
        </div>
      </section>

      {/* 5 오픈 회원 모집 [그린 띠] */}
      <section data-track-section="members" id="lpg-members">
        <div className="lpg-blk lpg-gr">
          <div className="lpg-c">
            <Worry>문을 열었는데 회원이 안 오면 어떡하지</Worry>
            <h2 className="lpg-mega lpg-rv">
              회원은 <Hl>문을 열기 전에</Hl> 모읍니다
            </h2>
            <Steps items={STEPS_MEMBERS} />
            <blockquote className="lpg-q">
              <b>{QUOTE_PRESALE.text}</b>
              <small>{QUOTE_PRESALE.who}</small>
            </blockquote>
            <div className="lpg-pair">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LEGACY + "f959517e5bef7.jpg"} alt="오픈 전 회원 모집 부스" loading="lazy" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LEGACY + "b1a51a9fa48e8.jpg"} alt="오픈 전 상담 접수" loading="lazy" />
            </div>
            <div className="lpg-mt">
              <button type="button" className="lpg-btn" style={{ background: "#0A0A0A", boxShadow: "none" }} onClick={scrollToForm}>
                오픈 전 회원 모집 계획 받아보기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6 오픈 후 운영 [화이트] */}
      <section data-track-section="ops" id="lpg-ops">
        <div className="lpg-blk lpg-wh">
          <div className="lpg-c">
            <Worry>오픈하면 컨설팅도 끝나는 거 아닐까</Worry>
            <h2 className="lpg-mega lpg-rv">
              대표가 없어도 <Hl>돌아가는 구조</Hl>까지
            </h2>
            <div className="lpg-bl">
              <h3>운영 교육 4회</h3>
              <p>오픈 후에도 운영 교육을 이어갑니다.</p>
            </div>
            <div className="lpg-bl">
              <h3>운영 파일 제공</h3>
              <ul className="lpg-files">
                {OPS_FILES.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
            <figure className="lpg-ph">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LEGACY + "57d1714abddb9.jpg"} alt="운영 교육 장면" loading="lazy" />
              <figcaption className="lpg-cap">{PHOTO_CAP}</figcaption>
            </figure>
            <blockquote className="lpg-q">
              <b>{QUOTE_OPS.text}</b>
              <small>{QUOTE_OPS.who}</small>
            </blockquote>
          </div>
        </div>
      </section>

      {/* 7 마케팅 [블랙] */}
      <section data-track-section="marketing" id="lpg-marketing">
        <div className="lpg-blk lpg-bk">
          <div className="lpg-c">
            <Worry>광고는 어디서부터 해야 할지 모르겠다</Worry>
            <h2 className="lpg-mega lpg-rv">
              채널 세팅을 <Hl>끝낸 상태로</Hl> 오픈합니다
            </h2>
            <ul className="lpg-ch">
              {CHANNELS.map((c) => (
                <li key={c.label}>
                  {c.ic}
                  <span>{c.label}</span>
                </li>
              ))}
            </ul>
            <p className="lpg-p lpg-mt">오픈 전 홍보 일정까지 함께 짜드립니다.</p>
          </div>
        </div>
      </section>

      {/* 8 증거 [블랙] */}
      <section data-track-section="proof" id="lpg-proof">
        <div className="lpg-blk lpg-bk" style={{ paddingTop: 0 }}>
          <div className="lpg-c">
            <h2 className="lpg-mega lpg-rv">
              같은 과정으로 문을 연 <Hl>센터들</Hl>
            </h2>
            <VideoCard {...VIDEO_MAIN} />
            <div className="lpg-gal">
              {GALLERY_ROWS.map((row, r) => (
                <Marquee
                  key={r}
                  dur={[64, 72, 58][r]}
                  reverse={r === 1}
                  paused={lb !== null}
                  items={row.map((f) => {
                    const idx = GALLERY_ALL.indexOf(f);
                    return (
                      <button key={f} type="button" className="lpg-tile" onClick={() => setLb(idx)} aria-label="시공사례 사진 크게 보기">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={LEGACY + f} alt="더그로우 창업 현장 실제 사진" loading="lazy" draggable={false} />
                      </button>
                    );
                  })}
                />
              ))}
            </div>
            <Marquee items={reviewItems} dur={50} />
          </div>
        </div>
      </section>

      {/* 9 사람 [화이트 → 블랙] */}
      <section data-track-section="person">
        <div className="lpg-person">
          <div className="lpg-c">
            <div className="lpg-person-ph">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={CEO_CUTOUT} alt="김재강 대표" width={1000} height={1333} loading="lazy" />
            </div>
            <p className="lpg-person-name">김재강 대표</p>
            <p className="lpg-num">
              <b>250</b>
              <span>회</span>
            </p>
            <p className="lpg-num-d">헬스장·필라테스 창업</p>
            <p className="lpg-person-line lpg-rv">오픈하는 법보다 망하지 않는 법을 먼저 압니다.</p>
          </div>
        </div>
      </section>

      {/* 10 단계 선택 + 폼 [그린 띠 → 화이트] */}
      <section data-track-section="form" id="lpg-form" ref={formSecRef}>
        <div className="lpg-blk lpg-gr" style={{ paddingBottom: 56 }}>
          <div className="lpg-c">
            <h2 className="lpg-mega lpg-rv">
              이제 <Hl>대표님 계획</Hl>을
              <br />
              같이 볼 차례입니다
            </h2>
            <p className="lpg-ask">지금 어느 단계까지 준비하셨는지 골라주세요</p>
            <div className="lpg-stages" role="group" aria-label="준비 단계 선택">
              {STAGES.map((s, i) => (
                <button key={s.label} type="button" className={`lpg-stage${stage === i ? " is-on" : ""}`} aria-pressed={stage === i} onClick={() => pickStage(i)}>
                  <i>{i + 1}</i>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
            {stage !== null && (
              <div className="lpg-stage-msg" ref={stageMsgRef} role="status">
                {STAGES[stage].msg}
                <small>아래 연락처를 남겨주시면 이 단계에 맞춰 보내드립니다</small>
              </div>
            )}
          </div>
        </div>

        <div className="lpg-form-blk lpg-wh">
          <div className="lpg-c">
            {sent ? (
              <div className="lpg-done" role="status">
                <b>정상적으로 접수되었습니다.</b>
                신청 후 24시간 이내 담당자가 연락드립니다.
              </div>
            ) : (
              <>
                <p className="lpg-form-t">{stage !== null ? STAGES[stage].label : CTA_LABEL}</p>
                <form id="lpgStartupForm" action={FORM_ACTION} method="POST" target={FORM_TARGET} onSubmit={onSubmit}>
                  <div className="lpg-grp">
                    <label className="lpg-label">
                      희망 업종을 선택해주세요. <span className="lpg-req">*</span>
                    </label>
                    <select name="industry" className="lpg-in-f" required defaultValue="">
                      <option value="">(선택)</option>
                      <option value="헬스장">헬스장</option>
                      <option value="필라테스">필라테스</option>
                      <option value="PT 스튜디오">PT 스튜디오</option>
                      <option value="요가">요가</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>

                  <div className="lpg-grp">
                    <label className="lpg-label">
                      선호 희망 지역을 알려주세요.
                      <br />
                      <small>(입지 상권을 함께 봐드립니다.)</small>
                    </label>
                    <input type="text" name="area" className="lpg-in-f" placeholder="예) 서울 마포구, 경기 남부, 부산 서면 인근 등" />
                  </div>

                  <div className="lpg-grp">
                    <label className="lpg-label">
                      이름을 입력해주세요. <span className="lpg-req">*</span>
                    </label>
                    <input type="text" name="name" className="lpg-in-f" required />
                  </div>

                  <div className="lpg-grp">
                    <label className="lpg-label">
                      연락처를 입력해주세요. <span className="lpg-req">*</span>
                    </label>
                    <div className="lpg-phone">
                      {(["phone1", "phone2", "phone3"] as const).map((n, i) => (
                        <span key={n} style={{ display: "contents" }}>
                          {i > 0 && <span>-</span>}
                          <input
                            ref={(el) => {
                              phoneRefs.current[i] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            name={n}
                            className="lpg-in-f"
                            maxLength={i === 0 ? 3 : 4}
                            required
                            onChange={onPhoneInput(i)}
                          />
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="lpg-grp">
                    <label className="lpg-label">
                      연락처를 입력해주세요(중복확인). <span className="lpg-req">*</span>
                    </label>
                    <div className="lpg-phone">
                      {(["phoneCheck1", "phoneCheck2", "phoneCheck3"] as const).map((n, i) => (
                        <span key={n} style={{ display: "contents" }}>
                          {i > 0 && <span>-</span>}
                          <input
                            ref={(el) => {
                              phoneRefs.current[3 + i] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            name={n}
                            className="lpg-in-f"
                            maxLength={i === 0 ? 3 : 4}
                            required
                            onChange={onPhoneInput(3 + i)}
                          />
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="lpg-grp">
                    <label className="lpg-label">
                      신청 경로를 알려주세요. <span className="lpg-req">*</span>
                    </label>
                    {[
                      ["네이버 검색(창업, 창업솔루션 등)", "네이버 검색 (창업, 창업솔루션 등)"],
                      ["인스타/페이스북 광고", "인스타/페이스북 광고"],
                      ["네이버 블로그", "네이버 블로그"],
                      ["지인 소개/아카데미 수강생", "지인 소개 / 아카데미 수강생"],
                      ["기타", "기타"],
                    ].map(([value, text], i) => (
                      <label key={value} className="lpg-radio">
                        <input type="radio" name="route" value={value} required={i === 0} />
                        <span>{text}</span>
                      </label>
                    ))}
                  </div>

                  {/* 페이지 구분 */}
                  <input type="hidden" name="source" value={FORM_SOURCE} />
                  {/* 보안 토큰 */}
                  <input type="hidden" name="token" value={FORM_TOKEN} />

                  <button type="submit" className="lpg-submit" disabled={submitting}>
                    {submitting ? "전송중..." : CTA_LABEL}
                  </button>
                </form>
                <p className="lpg-notice">
                  신청 후 24시간 이내 담당자가 연락드립니다.
                  <br />
                  더그로우는 함께 성장할 대표님만 선별해 진행합니다.
                </p>
              </>
            )}
          </div>
        </div>
        <iframe ref={iframeRef} name={FORM_TARGET} title="신청 전송" style={{ display: "none" }} />
      </section>

      {/* 11 FAQ [화이트] */}
      <section data-track-section="faq">
        <div className="lpg-blk lpg-wh" style={{ paddingTop: 64, borderTop: "1px solid #eee" }}>
          <div className="lpg-c">
            <h2 className="lpg-mega lpg-rv">궁금하신 점을 모았습니다</h2>
            <div className="lpg-faq">
              {FAQS.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 시공사례 라이트박스 */}
      {lb !== null && (
        <div className="lpg-lb" role="dialog" aria-modal="true" aria-label="시공사례 사진" onClick={() => setLb(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LEGACY + GALLERY_ALL[lb]} alt="더그로우 창업 현장 실제 사진" onClick={(e) => e.stopPropagation()} />
          <button type="button" className="lpg-lb-x" aria-label="닫기" onClick={() => setLb(null)}>
            ✕
          </button>
          <button type="button" className="lpg-lb-p" aria-label="이전 사진" onClick={(e) => { e.stopPropagation(); lbMove(-1); }}>
            ‹
          </button>
          <button type="button" className="lpg-lb-n" aria-label="다음 사진" onClick={(e) => { e.stopPropagation(); lbMove(1); }}>
            ›
          </button>
          <p className="lpg-lb-c">
            {lb + 1} / {GALLERY_ALL.length}
          </p>
        </div>
      )}

      {/* 하단 고정 바 스페이서 — 바가 푸터를 가리지 않게 한다 */}
      <div className="lpg-bar-space" aria-hidden="true" />

      {/* 하단 고정 바 — 첫 화면부터 보이고, 신청 폼이 화면에 보이면 숨김 */}
      <div className={`lpg-bar${barHidden ? " is-hidden" : ""}`} aria-hidden={barHidden}>
        <button type="button" className="lpg-btn" onClick={scrollToForm} tabIndex={barHidden ? -1 : 0}>
          {CTA_LABEL}
        </button>
      </div>
    </div>
  );
}
