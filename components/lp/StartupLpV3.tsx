"use client";

// ─────────────────────────────────────────────────────────────────────────────
// /lp/startup — 메타 광고 전용 창업솔루션 랜딩 v3 "창업 다큐멘터리형" (CSS 접두사 lp3-)
//  · 기획: startup-lp-v3.md (11장면). 결과(오픈 후 매출)부터 보여주고 시간을 거꾸로 돌려
//    "그 결과가 오픈 전에 어떻게 준비됐는지"를 따라가게 한 뒤, 내 창업 단계를 골라 신청한다.
//  · 디자인 시스템은 v2 를 그대로 쓴다 — 콘텐츠 최대폭 480px 중앙, 메가 헤드라인, 하이라이트
//    박스, 블랙/화이트/그린 띠 배경 교차, LogoMarquee 방식의 가로 마퀴. 말풍선·회색 비교 카드·
//    작은 카드 그리드는 쓰지 않는다. 한 장면 = 큰 문장 1개 + 실제 사진 1장 + 근거 1개.
//  · 사진은 /consulting/startup 의 단계별 현장 사진(public/legacy/startup)을 그대로 쓴다.
//  · 신청 폼은 /consulting/startup 의 창업 폼과 action·token·source·name·필드 구성이 같다
//    (새 필드 없음). iframe 이름은 lps_hidden_iframe, 성공 판정은 iframe load (done 가드 +
//    15초 타임아웃 + try/catch). 고른 준비 단계는 제출 직전에 route 값 뒤에
//    " / 준비단계: [선택 텍스트]" 로 붙여 보내고, 전송 뒤 원래 값으로 되돌린다.
//  · 하단 고정 바는 장면 1 버튼 또는 장면 10(단계 선택+폼)이 화면에 보이면 숨긴다.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

const FORM_ACTION =
  "https://script.google.com/macros/s/AKfycbyTIVLMDS-DQjOZ1fIP9DbzJ2NONxyn6mdjEik1_ZG31XB9TVO0Y5_odvFwO1M0AcJ21Q/exec";
const FORM_SOURCE = "창업지원상담_아임웹";
const FORM_TOKEN = "grow2026secure";
const FORM_TARGET = "lps_hidden_iframe";
const CTA_LABEL = "내 창업 단계 진단하기";
const SUBMIT_LABEL = "이 단계에 맞는 정보 받아보기";
const PHOTO_CAP = "더그로우 창업 현장 실제 사진";

const CEO_CUTOUT = "/consultants/kim-jaegang-cutout.png";
const LEGACY = "/legacy/startup/";

const VIDEO_MAIN = { src: "/reviews/review-3.mp4", poster: "/reviews/review-3.jpg", caption: "일주일 만에 매출 8,300만원, 두번째 창업" };
const VIDEO_PAIR = [
  { src: "/reviews/review-1.mp4", poster: "/reviews/review-1.jpg", caption: "수치와 데이터로 증명한 첫 창업 이야기" },
  { src: "/reviews/review-2.mp4", poster: "/reviews/review-2.jpg", caption: "의심을 확인으로 바꾼 PT 스튜디오 창업" },
];

// 장면 3·4·5 사진 — /consulting/startup 단계별 현장 사진
const PHOTO_PRESALE = { src: "f959517e5bef7.jpg", alt: "오픈 전 회원 모집 현장" };
const PHOTOS_SPACE = [
  { src: "640d2ed2ca7b9.jpg", alt: "공실 현장 실측", cap: "공실 현장 실측" },
  { src: "3a1f8666a4fb7.png", alt: "설계안 검토", cap: "설계안 검토" },
  { src: "74d515a717030.png", alt: "전속 인테리어팀 시공", cap: "전속 인테리어팀 시공" },
  { src: "994f3e4444876.png", alt: "완성된 센터", cap: "완성된 센터" },
];
const PHOTO_SITE = { src: "badee82e80f1a.jpg", alt: "입지 현장 동행" };

const REWIND = ["오픈 당일", "오픈 전 회원 모집", "공간 설계", "자리 선택"];
const TIMELINE = ["자리 선택", "공간 설계", "오픈 전 회원 모집", "오픈", "운영"];

const KAKAO = [
  "/after/after%201%20.jpg",
  "/legacy/startup/15074ccf15f4f.png",
  "/legacy/startup/6c472bc288fca.png",
  "/legacy/startup/c9a26f224753e.jpg",
  "/legacy/startup/5f9b6a71b84af.jpg",
  "/legacy/startup/a0aa9f04ac114.png",
];

const QUOTE_PRESALE = { text: "프리세일 때 목표의 150%를 달성했어요.", who: "이○○ 대표님 · 헬스장 · 서울 강서" };
const QUOTE_SITE = { text: "혼자 준비했으면 분명 실패했을 거예요.", who: "김○○ 대표님 · 필라테스 · 경기 성남" };
const REVIEWS = [
  { name: "박○○ 대표님", meta: "필라테스 · 인천 송도", text: "운영 시스템을 만들어주셔서 지금은 제가 매장에 없어도 잘 돌아갑니다. 진짜 사업하는 느낌이에요." },
  { name: "최○○ 대표님", meta: "헬스장 · 경기 수원", text: "인테리어 비용이 합리적인데 퀄리티는 최고였어요. 동선까지 고려한 설계 덕분에 상담 전환율이 정말 높습니다." },
];

// 장면 10 — 준비 단계 선택지와 맞춤 문구. label 이 route 뒤에 붙는 텍스트다.
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
.lp3{--bk:#0A0A0A;--gr:#009519;--gl:#22B573;font-family:'Pretendard',var(--font-noto-sans-kr),-apple-system,BlinkMacSystemFont,system-ui,'Apple SD Gothic Neo',sans-serif;font-size:17px;font-weight:500;line-height:1.6;letter-spacing:-0.02em;color:#111;background:#fff;overflow-x:hidden;word-break:keep-all;overflow-wrap:break-word}
.lp3 *,.lp3 *::before,.lp3 *::after{box-sizing:border-box}
:where(.lp3) :is(h1,h2,h3,h4,p,ul,ol,figure){margin:0;padding:0}
:where(.lp3) :is(ul,ol){list-style:none}
.lp3 img{max-width:100%}

/* 색 블록 — 화면폭 꽉 찬 배경, 안쪽 콘텐츠는 480px 중앙 */
.lp3-blk{padding:80px 20px;--hlc:#22B573;--pre:#fff}
.lp3-c{max-width:480px;margin:0 auto}
.lp3-bk{background:var(--bk);color:#fff}
.lp3-wh{background:#fff;color:#111;--hlc:#009519;--pre:#111}
.lp3-gr{background:var(--gr);color:#fff;--hlc:#0A0A0A;--pre:#fff}

.lp3-mega{font-size:clamp(29px,9.3vw,36px);font-weight:900;line-height:1.25;letter-spacing:-0.03em;text-align:center}
.lp3-p{font-size:17px;font-weight:500;line-height:1.6;text-align:center}
.lp3-sm{font-size:15px;font-weight:600;text-align:center;letter-spacing:-0.01em}
.lp3-bk .lp3-p,.lp3-bk .lp3-sm{color:rgba(255,255,255,.78)}
.lp3-wh .lp3-p{color:#444}
.lp3-wh .lp3-sm{color:#666}
.lp3-mt{margin-top:28px}
.lp3-mt-s{margin-top:16px}

/* 장면 번호 "거꾸로 N" */
.lp3-no{display:table;margin:0 auto 18px;padding:6px 14px;border-radius:50px;font-size:14px;font-weight:800;letter-spacing:0;background:var(--gr);color:#fff}
.lp3-bk .lp3-no{background:var(--gl);color:#0A0A0A}

/* 하이라이트 박스 — 기본 표시, 스크립트가 켜지면 좌→우로 칠해진다 */
.lp3-hl{display:inline;padding:2px 8px;margin:0 -2px;color:#fff;background-color:transparent;background-image:linear-gradient(var(--hlc),var(--hlc));background-repeat:no-repeat;background-size:100% 100%;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.lp3-js .lp3-hl{background-size:0% 100%;color:var(--pre);transition:background-size .7s cubic-bezier(.2,.7,.2,1) .25s,color .2s ease .55s}
.lp3-js .lp3-in .lp3-hl,.lp3-js .lp3-hl.lp3-in{background-size:100% 100%;color:#fff}

/* 스크롤 진입 fade-up — 기본 표시 */
.lp3-js .lp3-rv{opacity:0;transform:translateY(26px);transition:opacity .7s ease,transform .7s ease}
.lp3-js .lp3-rv.lp3-in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){.lp3-js .lp3-rv,.lp3-js .lp3-hl,.lp3-js .lp3-rew li{transition:none}}

.lp3-btn{display:flex;align-items:center;justify-content:center;width:100%;min-height:64px;border:none;border-radius:16px;background:var(--gr);color:#fff;font-family:inherit;font-size:20px;font-weight:900;letter-spacing:-0.02em;cursor:pointer;box-shadow:0 10px 30px rgba(0,149,25,.45)}
.lp3-btn:active{transform:scale(.99)}
.lp3-btn--line{background:transparent;border:2px solid rgba(255,255,255,.7);color:#fff;box-shadow:none}

/* 전폭 사진 + 캡션 */
.lp3-ph{position:relative;margin:30px -20px 0}
.lp3-ph img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;background:#1a1a1a}
.lp3-ph--sq img{aspect-ratio:1/1}
.lp3-cap{margin-top:10px;font-size:13px;font-weight:600;text-align:center;color:#8a8a8a;letter-spacing:0}
@media(min-width:481px){.lp3-ph{margin-left:0;margin-right:0}.lp3-ph img{border-radius:16px}}

/* 큰 인용 */
.lp3-q{margin-top:34px;padding-top:26px;border-top:2px solid currentColor;text-align:center}
.lp3-q b{display:block;font-size:22px;font-weight:800;line-height:1.4;letter-spacing:-0.03em}
.lp3-q b::before{content:'\\201C';color:var(--gr);margin-right:2px}
.lp3-q b::after{content:'\\201D';color:var(--gr);margin-left:2px}
.lp3-bk .lp3-q b::before,.lp3-bk .lp3-q b::after{color:var(--gl)}
.lp3-q small{display:block;margin-top:10px;font-size:14px;font-weight:600;color:#777;letter-spacing:0}
.lp3-bk .lp3-q small{color:#9a9a9a}
.lp3-wh .lp3-q{border-top-color:#e4e4e4}
.lp3-bk .lp3-q{border-top-color:rgba(255,255,255,.14)}

/* 장면 1 결과 — 첫 화면 꽉 채움, 포스터 배경 + 60% 오버레이 */
.lp3-hero{position:relative;overflow:hidden;min-height:calc(100vh - 80px);min-height:calc(100svh - 80px);display:flex;align-items:center;padding:56px 20px 48px;background:var(--bk);color:#fff;--hlc:#22B573;--pre:#fff}
.lp3-hero-bg{position:absolute;inset:0;overflow:hidden;pointer-events:none}
/* 포스터에 박힌 자막(상단 제목·하단 인터뷰 자막)이 보이지 않도록 인물 가슴 부근만 크게 확대해 깐다 */
.lp3-hero-bg img{width:100%;height:100%;object-fit:cover;object-position:50% 45%;transform:scale(2.8);transform-origin:50% 45%;filter:blur(2px)}
.lp3-hero-bg::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,rgba(10,10,10,.6) 0%,rgba(10,10,10,.6) 60%,#0A0A0A 100%)}
.lp3-hero .lp3-c{position:relative;z-index:1;width:100%}
.lp3-hero-sub{margin-top:18px;font-size:19px;font-weight:700;text-align:center;color:rgba(255,255,255,.85)}
.lp3-hero-btns{display:flex;flex-direction:column;gap:12px;margin-top:34px}
.lp3-hero-vid{max-width:330px;margin:30px auto 0}

/* 공용 영상 */
.lp3-vid{position:relative;border-radius:18px;overflow:hidden;background:#1a1a1a;aspect-ratio:9/16}
.lp3-vid video{width:100%;height:100%;object-fit:cover;display:block}
.lp3-vid-play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;border:none;background:rgba(0,0,0,.2);cursor:pointer}
.lp3-vid-play span{display:flex;align-items:center;justify-content:center;width:68px;height:68px;border-radius:50%;background:var(--gr);box-shadow:0 8px 24px rgba(0,0,0,.45)}
.lp3-vcap{margin-top:12px;font-size:14px;font-weight:600;line-height:1.5;color:#bdbdbd;text-align:center}

/* 장면 2 시간 되돌리기 — 위에서 아래로 하나씩, 각각 아래→위로 떠오름 (기본 표시) */
.lp3-rew{display:flex;flex-direction:column;align-items:center;gap:6px;margin:0 auto 44px}
.lp3-rew li{font-size:clamp(26px,8vw,32px);font-weight:900;letter-spacing:-0.03em;line-height:1.3;text-align:center}
.lp3-rew li:first-child{color:var(--gl)}
.lp3-rew li.lp3-up{height:40px;color:var(--gl)}
.lp3-rew li.lp3-up svg{width:30px;height:40px}
.lp3-js .lp3-rew li{opacity:0;transform:translateY(22px);transition:opacity .6s ease,transform .6s ease}
.lp3-js .lp3-rew.lp3-in li{opacity:1;transform:none}
.lp3-js .lp3-rew.lp3-in li:nth-child(2){transition-delay:.45s}
.lp3-js .lp3-rew.lp3-in li:nth-child(3){transition-delay:.9s}
.lp3-js .lp3-rew.lp3-in li:nth-child(4){transition-delay:1.35s}
.lp3-js .lp3-rew.lp3-in li:nth-child(5){transition-delay:1.8s}
.lp3-js .lp3-rew.lp3-in li:nth-child(6){transition-delay:2.25s}
.lp3-js .lp3-rew.lp3-in li:nth-child(7){transition-delay:2.7s}

/* 가로 스와이프 (장면 4 사진, 장면 7 영상) — 한 화면에 1.2장 */
.lp3-sw{display:flex;gap:12px;margin:30px -20px 0;padding:0 20px 6px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.lp3-sw::-webkit-scrollbar{display:none}
.lp3-sw > *{flex:0 0 78%;scroll-snap-align:start}
.lp3-sw figure img{display:block;width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:16px;background:#1a1a1a}
.lp3-sw figcaption{margin-top:8px;font-size:14px;font-weight:700;text-align:center}
.lp3-bk .lp3-sw figcaption{color:#d6d6d6}
@media(min-width:481px){.lp3-sw{margin-left:0;margin-right:0;padding-left:0;padding-right:0}}

/* 장면 6 연결 — 타임라인 */
.lp3-tl{position:relative;margin:34px 0 0;padding-left:36px}
.lp3-tl::before{content:'';position:absolute;left:11px;top:10px;bottom:10px;width:2px;background:rgba(255,255,255,.55)}
.lp3-tl li{position:relative;padding:11px 0;font-size:22px;font-weight:800;letter-spacing:-0.03em;line-height:1.3}
.lp3-tl li::before{content:'';position:absolute;left:-36px;top:50%;width:24px;height:24px;margin-top:-12px;border-radius:50%;background:#fff;border:6px solid var(--gr);box-shadow:0 0 0 2px #fff}
.lp3-tl-last{margin-top:30px;padding:18px 20px;border:2px solid rgba(255,255,255,.85);border-radius:16px;font-size:18px;font-weight:800;line-height:1.5;text-align:center}
@media(min-width:481px){
  .lp3-tl{display:flex;justify-content:space-between;padding:34px 0 0}
  .lp3-tl::before{left:8%;right:8%;top:45px;bottom:auto;width:auto;height:2px}
  .lp3-tl li{flex:1 1 0;padding:0;text-align:center;font-size:16px}
  .lp3-tl li::before{left:50%;top:0;margin:0 0 0 -12px}
  .lp3-tl li span{display:block;padding-top:36px}
}

/* 장면 8 후기 마퀴 (LogoMarquee 방식) */
.lp3-mq{position:relative;overflow:hidden;width:100%;margin:30px -20px 0;width:calc(100% + 40px)}
.lp3-mq-track{display:flex;align-items:stretch;width:max-content;will-change:transform;animation:lp3-left var(--dur,60s) linear infinite}
@keyframes lp3-left{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.lp3-mq.is-paused .lp3-mq-track,.lp3-mq.is-hold .lp3-mq-track{animation-play-state:paused}
@media(hover:hover) and (pointer:fine){.lp3-mq:hover .lp3-mq-track{animation-play-state:paused}}
.lp3-mq-i{flex:0 0 auto;display:flex;margin-right:12px}
.lp3-mq-i:first-child{margin-left:20px}
.lp3-kk{display:block;height:360px;width:auto;border-radius:16px}
.lp3-rvc{width:300px;display:flex;flex-direction:column;justify-content:center;padding:28px 24px;border-radius:16px;background:#161616;border:1px solid #2a2a2a;color:#fff}
.lp3-rvc p{font-size:19px;font-weight:700;line-height:1.5;letter-spacing:-0.03em}
.lp3-rvc small{display:block;margin-top:14px;font-size:14px;font-weight:600;color:#9a9a9a;letter-spacing:0}
@media(min-width:481px){.lp3-mq{margin-left:0;margin-right:0;width:100%}.lp3-mq-i:first-child{margin-left:0}}

/* 장면 9 사람 — 화이트 → 블랙 */
.lp3-person{background:linear-gradient(to bottom,#fff 0%,#fff 18%,#0A0A0A 58%,#0A0A0A 100%);color:#fff;padding:0 20px 80px}
.lp3-person-ph{position:relative;margin:0 -20px}
.lp3-person-ph img{display:block;width:100%;height:auto}
.lp3-person-ph::after{content:'';position:absolute;left:0;right:0;bottom:0;height:34%;background:linear-gradient(to bottom,rgba(10,10,10,0),#0A0A0A 94%);pointer-events:none}
.lp3-person-name{position:relative;margin-top:-4px;text-align:center;font-size:19px;font-weight:800}
.lp3-num{margin-top:26px;text-align:center;line-height:1}
.lp3-num b{font-size:84px;font-weight:900;letter-spacing:-0.04em;color:var(--gl)}
.lp3-num span{font-size:32px;font-weight:900;color:var(--gl);margin-left:4px}
.lp3-num-d{margin-top:8px;text-align:center;font-size:17px;font-weight:600;color:rgba(255,255,255,.8)}
.lp3-person-line{margin-top:30px;font-size:22px;font-weight:800;line-height:1.4;text-align:center;letter-spacing:-0.03em}
@media(min-width:481px){.lp3-person-ph{margin-left:0;margin-right:0}}

/* 장면 10 단계 선택 + 폼 */
.lp3-ask{margin-top:34px;font-size:22px;font-weight:800;text-align:center;letter-spacing:-0.03em}
.lp3-stages{display:flex;flex-direction:column;gap:10px;margin-top:18px}
.lp3-stage{display:flex;align-items:center;gap:12px;width:100%;min-height:56px;padding:0 18px;border:2px solid rgba(255,255,255,.75);border-radius:14px;background:transparent;color:#fff;font-family:inherit;font-size:17px;font-weight:800;text-align:left;cursor:pointer;letter-spacing:-0.02em;transition:background .2s,border-color .2s,color .2s}
.lp3-stage i{flex:0 0 26px;width:26px;height:26px;border-radius:50%;border:2px solid rgba(255,255,255,.75);display:flex;align-items:center;justify-content:center;font-style:normal;font-size:13px;font-weight:900}
.lp3-stage.is-on{background:#fff;border-color:#fff;color:var(--gr)}
.lp3-stage.is-on i{background:var(--gr);border-color:var(--gr);color:#fff}
.lp3-stage-msg{margin-top:22px;padding:18px 20px;border-radius:14px;background:#0A0A0A;color:#fff;font-size:18px;font-weight:800;line-height:1.5;text-align:center;letter-spacing:-0.02em}
.lp3-stage-msg small{display:block;margin-top:6px;font-size:14px;font-weight:600;color:var(--gl);letter-spacing:0}

.lp3-form-blk{padding:56px 20px 70px;scroll-margin-top:80px}
.lp3-form-t{font-size:22px;font-weight:900;text-align:center;letter-spacing:-0.03em;margin-bottom:26px}
.lp3-grp{margin-bottom:22px}
.lp3-label{display:block;margin-bottom:9px;font-size:16px;font-weight:700;color:#111}
.lp3-label small{font-size:14px;font-weight:500;color:#777}
.lp3-req{color:#e03131}
.lp3-in-f{display:block;width:100%;height:56px;padding:0 16px;border:2px solid #e3e3e3;border-radius:12px;background:#fff;font-family:inherit;font-size:17px;font-weight:500;color:#111}
.lp3-in-f::placeholder{color:#a3a3a3}
.lp3-in-f:focus{outline:none;border-color:var(--gr);box-shadow:0 0 0 4px rgba(0,149,25,.12)}
.lp3-phone{display:flex;align-items:center;gap:8px}
.lp3-phone .lp3-in-f{min-width:0;padding:0 4px;text-align:center}
.lp3-phone > span{color:#aaa}
.lp3-radio{display:flex;align-items:center;gap:12px;min-height:54px;margin-bottom:10px;padding:0 16px;border:2px solid #e3e3e3;border-radius:12px;font-size:16px;font-weight:600;color:#111;cursor:pointer}
.lp3-radio input{width:20px;height:20px;margin:0;accent-color:var(--gr);flex:0 0 auto}
.lp3-radio:has(input:checked){border-color:var(--gr);background:#f0faf1}
.lp3-submit{display:block;width:100%;min-height:64px;margin-top:6px;border:none;border-radius:16px;background:var(--gr);color:#fff;font-family:inherit;font-size:20px;font-weight:900;cursor:pointer;box-shadow:0 10px 30px rgba(0,149,25,.4)}
.lp3-submit:disabled{opacity:.55;cursor:not-allowed}
.lp3-notice{margin-top:18px;text-align:center;font-size:15px;font-weight:600;line-height:1.7;color:#555}
.lp3-done{padding:56px 10px;text-align:center;font-size:17px;line-height:1.7;color:#444}
.lp3-done b{display:block;margin-bottom:10px;font-size:26px;font-weight:900;color:var(--gr);letter-spacing:-0.03em}

/* 장면 11 FAQ */
.lp3-faq{margin-top:30px}
.lp3-faq details{border-bottom:1px solid #e4e4e4}
.lp3-faq details:first-child{border-top:1px solid #e4e4e4}
.lp3-faq summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:22px 2px;font-size:19px;font-weight:800;letter-spacing:-0.03em}
.lp3-faq summary::-webkit-details-marker{display:none}
.lp3-faq summary::after{content:'+';flex:0 0 auto;font-size:28px;font-weight:400;color:var(--gr)}
.lp3-faq details[open] summary::after{content:'\\2212'}
.lp3-faq p{padding:0 2px 24px;font-size:17px;font-weight:500;line-height:1.65;color:#444}

/* 하단 고정 바 */
.lp3-bar{position:fixed;left:50%;bottom:0;z-index:60;width:min(100%,480px);padding:10px 12px calc(10px + env(safe-area-inset-bottom));transform:translateX(-50%);transition:transform .3s ease,opacity .3s ease}
.lp3-bar.is-hidden{transform:translate(-50%,120%);opacity:0;pointer-events:none}
.lp3-bar .lp3-btn{min-height:58px}
.lp3-bar-space{height:calc(78px + env(safe-area-inset-bottom));background:#fff}

@media(max-width:480px){
  .lp3-kk{height:320px}
  .lp3-num b{font-size:76px}
}
`;

type Win = Window & {
  gtag?: (...a: unknown[]) => void;
  __tgcFbTrack?: (e: string, p?: Record<string, unknown>) => void;
};

const Hl = ({ children }: { children: ReactNode }) => <mark className="lp3-hl">{children}</mark>;

const IcUp = () => (
  <svg viewBox="0 0 24 32" aria-hidden="true">
    <path d="M12 29V5M4 13l8-8 8 8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// LogoMarquee 와 같은 방식: 두 벌 이어 붙임 + margin 간격 + 화면 밖 정지 + 터치 중 정지
function Marquee({ items, dur }: { items: ReactNode[]; dur: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) el.classList.toggle("is-paused", !e.isIntersecting);
      },
      { threshold: 0, rootMargin: "120px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const hold = () => ref.current?.classList.add("is-hold");
  const release = () => ref.current?.classList.remove("is-hold");
  return (
    <div ref={ref} className="lp3-mq" style={{ "--dur": `${dur}s` } as CSSProperties} onTouchStart={hold} onTouchEnd={release} onTouchCancel={release}>
      <div className="lp3-mq-track">
        {items.map((n, i) => (
          <div className="lp3-mq-i" key={`a${i}`}>
            {n}
          </div>
        ))}
        {items.map((n, i) => (
          <div className="lp3-mq-i" key={`b${i}`} aria-hidden="true">
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoCard({
  src,
  poster,
  caption,
  active,
  onPlay,
  autoStart = false,
}: {
  src: string;
  poster: string;
  caption?: string;
  active: boolean;
  onPlay: () => void;
  autoStart?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(autoStart);

  // 다른 영상이 재생되면 멈추고 포스터로 돌아간다
  useEffect(() => {
    if (!active && started) {
      ref.current?.pause();
      setStarted(false);
    }
  }, [active, started]);

  // 장면 1 "영상으로 보기" — 마운트 직후 바로 재생
  useEffect(() => {
    if (autoStart) void ref.current?.play().catch(() => {});
  }, [autoStart]);

  return (
    <figure>
      <div className="lp3-vid">
        <video ref={ref} src={src} poster={poster} preload="none" playsInline controls={started} onEnded={() => setStarted(false)} />
        {!started && (
          <button
            type="button"
            className="lp3-vid-play"
            aria-label="후기 영상 재생"
            onClick={() => {
              onPlay();
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
      {caption && <figcaption className="lp3-vcap">{caption}</figcaption>}
    </figure>
  );
}

export default function StartupLpV3() {
  const [activeVid, setActiveVid] = useState<string | null>(null);
  const [heroPlaying, setHeroPlaying] = useState(false);
  const [stage, setStage] = useState<number | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [heroBtnVisible, setHeroBtnVisible] = useState(true);
  const [stageVisible, setStageVisible] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const heroBtnRef = useRef<HTMLButtonElement>(null);
  const stageSecRef = useRef<HTMLElement>(null);
  const stageMsgRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const phoneRefs = useRef<(HTMLInputElement | null)[]>([]);
  const stopRef = useRef<(() => void) | null>(null);

  // 언마운트 시 진행 중인 전송의 리스너·타이머 정리
  useEffect(() => () => stopRef.current?.(), []);

  // 진입 애니메이션 — 스크립트가 켜진 경우에만 숨겼다가 보여 준다 (기본은 표시)
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.classList.add("lp3-js");
    if (typeof IntersectionObserver === "undefined") {
      root.classList.remove("lp3-js");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("lp3-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.2 },
    );
    root.querySelectorAll(".lp3-rv, .lp3-rew, .lp3-hl").forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      root.classList.remove("lp3-js");
    };
  }, []);

  // 하단 고정 바 — 장면 1 버튼 또는 장면 10 이 화면에 보이면 숨김 (둘 다 안 보일 때만 표시)
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const watch = (el: Element | null, set: (v: boolean) => void) => {
      if (!el) return null;
      const io = new IntersectionObserver((entries) => set(entries[entries.length - 1].isIntersecting), { threshold: 0.02 });
      io.observe(el);
      return io;
    };
    const a = watch(heroBtnRef.current, setHeroBtnVisible);
    const b = watch(stageSecRef.current, setStageVisible);
    return () => {
      a?.disconnect();
      b?.disconnect();
    };
  }, []);
  const barHidden = heroBtnVisible || stageVisible;

  const scrollToStage = useCallback(() => {
    document.getElementById("consulting-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // 단계 선택 — 맞춤 문구만 바뀐다(폼은 항상 보임), 재선택 가능. GA4 stage_select
  const pickStage = (i: number) => {
    setStage(i);
    const w = window as Win;
    if (typeof w.gtag === "function") w.gtag("event", "stage_select", { stage: STAGES[i].label });
    window.setTimeout(() => stageMsgRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 50);
  };

  // 연락처 6칸: 숫자만 허용, 칸이 차면 다음 칸으로
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
      if (!iframe) throw new Error("lps iframe not found");
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

      // 15초 안에 load 가 오지 않으면 실패로 보고 버튼을 돌려준다
      timer = setTimeout(() => {
        if (done) return;
        done = true;
        cleanup();
        alert("전송 중 오류가 발생했습니다. 다시 시도해주세요.");
        setSubmitting(false);
      }, 15000);

      // 고른 준비 단계는 별도 필드 없이 route 값 뒤에 붙인다. submit() 이 값을 읽는 건 동기라
      // 바로 되돌려도 전송에는 붙은 값이 실리고, 재제출 때 두 번 붙지 않는다.
      const routeEl = form.querySelector<HTMLInputElement>('input[name="route"]:checked');
      const routeOrig = routeEl?.value ?? "";
      if (routeEl && stage !== null) routeEl.value = `${routeOrig} / 준비단계: ${STAGES[stage].label}`;
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

  const reviewItems: ReactNode[] = [
    // eslint-disable-next-line @next/next/no-img-element
    <img className="lp3-kk" key={KAKAO[0]} src={KAKAO[0]} alt="카톡 후기" draggable={false} />,
    <div className="lp3-rvc" key={REVIEWS[0].name}>
      <p>{REVIEWS[0].text}</p>
      <small>
        {REVIEWS[0].name} · {REVIEWS[0].meta}
      </small>
    </div>,
    // eslint-disable-next-line @next/next/no-img-element
    <img className="lp3-kk" key={KAKAO[1]} src={KAKAO[1]} alt="카톡 후기" draggable={false} />,
    // eslint-disable-next-line @next/next/no-img-element
    <img className="lp3-kk" key={KAKAO[2]} src={KAKAO[2]} alt="카톡 후기" draggable={false} />,
    <div className="lp3-rvc" key={REVIEWS[1].name}>
      <p>{REVIEWS[1].text}</p>
      <small>
        {REVIEWS[1].name} · {REVIEWS[1].meta}
      </small>
    </div>,
    // eslint-disable-next-line @next/next/no-img-element
    <img className="lp3-kk" key={KAKAO[3]} src={KAKAO[3]} alt="카톡 후기" draggable={false} />,
    // eslint-disable-next-line @next/next/no-img-element
    <img className="lp3-kk" key={KAKAO[4]} src={KAKAO[4]} alt="카톡 후기" draggable={false} />,
    // eslint-disable-next-line @next/next/no-img-element
    <img className="lp3-kk" key={KAKAO[5]} src={KAKAO[5]} alt="카톡 후기" draggable={false} />,
  ];

  return (
    <div className="lp3" ref={rootRef}>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />

      {/* 장면 1 결과 [블랙, 첫 화면 꽉 채움] */}
      <section data-track-section="hero" className="lp3-hero">
        <div className="lp3-hero-bg" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={VIDEO_MAIN.poster} alt="" />
        </div>
        <div className="lp3-c">
          <p className="lp3-sm" style={{ color: "rgba(255,255,255,.75)" }}>
            더그로우와 함께한 실제 창업 이야기
          </p>
          <h1 className="lp3-mega lp3-mt-s">
            두 번째 창업,
            <br />
            <Hl>일주일 만에 매출 8,300만원</Hl>
          </h1>
          <p className="lp3-hero-sub">이 결과는 오픈한 날 만들어진 게 아닙니다.</p>
          {heroPlaying ? (
            <div className="lp3-hero-vid">
              <VideoCard {...VIDEO_MAIN} active={activeVid === VIDEO_MAIN.src} onPlay={() => setActiveVid(VIDEO_MAIN.src)} autoStart />
            </div>
          ) : null}
          <div className="lp3-hero-btns">
            {!heroPlaying && (
              <button
                type="button"
                className="lp3-btn"
                onClick={() => {
                  setActiveVid(VIDEO_MAIN.src);
                  setHeroPlaying(true);
                }}
              >
                대표님 영상으로 보기
              </button>
            )}
            <button ref={heroBtnRef} type="button" className="lp3-btn lp3-btn--line" onClick={scrollToStage}>
              {CTA_LABEL}
            </button>
          </div>
        </div>
      </section>

      {/* 장면 2 시간 되돌리기 [블랙] */}
      <section data-track-section="rewind">
        <div className="lp3-blk lp3-bk">
          <div className="lp3-c">
            <ol className="lp3-rew" aria-label="오픈 당일에서 거꾸로 거슬러 올라가는 순서">
              {REWIND.map((t) => <li key={t}>{t}</li>).flatMap((li, i) =>
                i < REWIND.length - 1
                  ? [
                      li,
                      <li key={`up${i}`} className="lp3-up" aria-hidden="true">
                        <IcUp />
                      </li>,
                    ]
                  : [li],
              )}
            </ol>
            <h2 className="lp3-mega lp3-rv">
              결과는 문을 열기 <Hl>전에</Hl>
              <br />
              이미 준비되어 있었습니다
            </h2>
            <p className="lp3-sm lp3-mt">지금부터 시간을 거꾸로 돌려보겠습니다</p>
          </div>
        </div>
      </section>

      {/* 장면 3 오픈 전 회원 모집 [화이트] */}
      <section data-track-section="presale">
        <div className="lp3-blk lp3-wh">
          <div className="lp3-c">
            <p className="lp3-no">거꾸로 1</p>
            <h2 className="lp3-mega lp3-rv">
              문을 열기 전에
              <br />
              <Hl>회원부터</Hl> 만들었습니다
            </h2>
            <figure className="lp3-ph">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LEGACY + PHOTO_PRESALE.src} alt={PHOTO_PRESALE.alt} loading="lazy" />
              <figcaption className="lp3-cap">{PHOTO_CAP}</figcaption>
            </figure>
            <p className="lp3-p lp3-mt">
              광고는 오픈하고 나서 하는 게 아닙니다.
              <br />
              가격·패키지·상담 구조를 먼저 설계해 오픈 전에 첫 매출을 만듭니다.
            </p>
            <blockquote className="lp3-q">
              <b>{QUOTE_PRESALE.text}</b>
              <small>{QUOTE_PRESALE.who}</small>
            </blockquote>
          </div>
        </div>
      </section>

      {/* 장면 4 공간 설계 [블랙] */}
      <section data-track-section="space">
        <div className="lp3-blk lp3-bk">
          <div className="lp3-c">
            <p className="lp3-no">거꾸로 2</p>
            <h2 className="lp3-mega lp3-rv">
              예쁜 공간이 아니라
              <br />
              <Hl>매출이 나오는 동선</Hl>
            </h2>
            <div className="lp3-sw">
              {PHOTOS_SPACE.map((p) => (
                <figure key={p.src}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={LEGACY + p.src} alt={p.alt} loading="lazy" />
                  <figcaption>{p.cap}</figcaption>
                </figure>
              ))}
            </div>
            <p className="lp3-cap">{PHOTO_CAP}</p>
            <p className="lp3-p lp3-mt">
              기구 배치, 상담 공간, 회원 동선까지 운영을 기준으로 설계합니다.
              <br />
              전속 인테리어팀이 직접 시공하고, 기구는 B2B 조건으로 연결합니다.
            </p>
          </div>
        </div>
      </section>

      {/* 장면 5 자리 선택 [화이트] */}
      <section data-track-section="site">
        <div className="lp3-blk lp3-wh">
          <div className="lp3-c">
            <p className="lp3-no">거꾸로 3</p>
            <h2 className="lp3-mega lp3-rv">
              모든 건 <Hl>자리</Hl> 하나에서
              <br />
              시작됐습니다
            </h2>
            <figure className="lp3-ph lp3-ph--sq">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LEGACY + PHOTO_SITE.src} alt={PHOTO_SITE.alt} loading="lazy" />
              <figcaption className="lp3-cap">{PHOTO_CAP}</figcaption>
            </figure>
            <p className="lp3-p lp3-mt">
              감이 아니라 유동인구와 경쟁 센터 데이터로 고릅니다.
              <br />
              부동산 계약까지 직접 동행합니다.
            </p>
            <blockquote className="lp3-q">
              <b>{QUOTE_SITE.text}</b>
              <small>{QUOTE_SITE.who}</small>
            </blockquote>
          </div>
        </div>
      </section>

      {/* 장면 6 연결 [그린 띠] */}
      <section data-track-section="team">
        <div className="lp3-blk lp3-gr">
          <div className="lp3-c">
            <h2 className="lp3-mega lp3-rv">
              이 모든 과정을
              <br />
              <Hl>한 팀이</Hl> 끝까지 했습니다
            </h2>
            <ol className="lp3-tl">
              {TIMELINE.map((t) => (
                <li key={t}>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
            <p className="lp3-tl-last">오픈 후에도 2달 동안 더그로우 직원이 현장에 상주합니다</p>
            <div className="lp3-mt">
              <button type="button" className="lp3-btn" style={{ background: "#0A0A0A", boxShadow: "none" }} onClick={scrollToStage}>
                {CTA_LABEL}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 장면 7 다른 창업 이야기 [블랙] */}
      <section data-track-section="stories">
        <div className="lp3-blk lp3-bk">
          <div className="lp3-c">
            <h2 className="lp3-mega lp3-rv">
              다른 대표님들의 창업도
              <br />
              같은 과정을 거쳤습니다
            </h2>
            <div className="lp3-sw">
              {VIDEO_PAIR.map((v) => (
                <div key={v.src}>
                  <VideoCard {...v} active={activeVid === v.src} onPlay={() => setActiveVid(v.src)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 장면 8 후기 [블랙] */}
      <section data-track-section="reviews">
        <div className="lp3-blk lp3-bk" style={{ paddingTop: 0 }}>
          <div className="lp3-c">
            <h2 className="lp3-mega lp3-rv">대표님들이 직접 남긴 이야기</h2>
            <Marquee items={reviewItems} dur={70} />
          </div>
        </div>
      </section>

      {/* 장면 9 사람 [화이트 → 블랙] */}
      <section data-track-section="person">
        <div className="lp3-person">
          <div className="lp3-c">
            <div className="lp3-person-ph">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={CEO_CUTOUT} alt="김재강 대표" width={1000} height={1333} loading="lazy" />
            </div>
            <p className="lp3-person-name">김재강 대표</p>
            <p className="lp3-num">
              <b>300</b>
              <span>회</span>
            </p>
            <p className="lp3-num-d">헬스장·필라테스 창업</p>
            <p className="lp3-person-line lp3-rv">오픈하는 법보다 망하지 않는 법을 먼저 압니다.</p>
          </div>
        </div>
      </section>

      {/* 장면 10 대표님 차례 = 단계 선택 + 폼 [그린 띠 → 화이트] */}
      <section data-track-section="form" id="consulting-form" ref={stageSecRef}>
        <div className="lp3-blk lp3-gr" style={{ paddingBottom: 56 }}>
          <div className="lp3-c">
            <h2 className="lp3-mega lp3-rv">
              이제 <Hl>대표님의 창업</Hl>
              <br />
              차례입니다
            </h2>
            <p className="lp3-ask">지금 어느 단계까지 준비하셨나요?</p>
            <div className="lp3-stages" role="group" aria-label="준비 단계 선택">
              {STAGES.map((s, i) => (
                <button
                  key={s.label}
                  type="button"
                  className={`lp3-stage${stage === i ? " is-on" : ""}`}
                  aria-pressed={stage === i}
                  onClick={() => pickStage(i)}
                >
                  <i>{i + 1}</i>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
            {stage !== null && (
              <div className="lp3-stage-msg" ref={stageMsgRef} role="status">
                {STAGES[stage].msg}
                <small>아래 연락처를 남겨주시면 이 단계에 맞춰 보내드립니다</small>
              </div>
            )}
          </div>
        </div>

        <div className="lp3-form-blk lp3-wh">
          <div className="lp3-c">
            {sent ? (
              <div className="lp3-done" role="status">
                <b>정상적으로 접수되었습니다.</b>
                신청 후 24시간 이내 담당자가 연락드립니다.
              </div>
            ) : (
              <>
                <p className="lp3-form-t">{stage !== null ? STAGES[stage].label : "창업 정보 받아보기"}</p>
                <form id="lpsStartupForm" action={FORM_ACTION} method="POST" target={FORM_TARGET} onSubmit={onSubmit}>
                  <div className="lp3-grp">
                    <label className="lp3-label">
                      희망 업종을 선택해주세요. <span className="lp3-req">*</span>
                    </label>
                    <select name="industry" className="lp3-in-f" required defaultValue="">
                      <option value="">(선택)</option>
                      <option value="헬스장">헬스장</option>
                      <option value="필라테스">필라테스</option>
                      <option value="PT 스튜디오">PT 스튜디오</option>
                      <option value="요가">요가</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>

                  <div className="lp3-grp">
                    <label className="lp3-label">
                      선호 희망 지역을 알려주세요.
                      <br />
                      <small>(입지 상권을 함께 봐드립니다.)</small>
                    </label>
                    <input type="text" name="area" className="lp3-in-f" placeholder="예) 서울 마포구, 경기 남부, 부산 서면 인근 등" />
                  </div>

                  <div className="lp3-grp">
                    <label className="lp3-label">
                      이름을 입력해주세요. <span className="lp3-req">*</span>
                    </label>
                    <input type="text" name="name" className="lp3-in-f" required />
                  </div>

                  <div className="lp3-grp">
                    <label className="lp3-label">
                      연락처를 입력해주세요. <span className="lp3-req">*</span>
                    </label>
                    <div className="lp3-phone">
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
                            className="lp3-in-f"
                            maxLength={i === 0 ? 3 : 4}
                            required
                            onChange={onPhoneInput(i)}
                          />
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="lp3-grp">
                    <label className="lp3-label">
                      연락처를 입력해주세요(중복확인). <span className="lp3-req">*</span>
                    </label>
                    <div className="lp3-phone">
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
                            className="lp3-in-f"
                            maxLength={i === 0 ? 3 : 4}
                            required
                            onChange={onPhoneInput(3 + i)}
                          />
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="lp3-grp">
                    <label className="lp3-label">
                      신청 경로를 알려주세요. <span className="lp3-req">*</span>
                    </label>
                    {[
                      ["네이버 검색(창업, 창업솔루션 등)", "네이버 검색 (창업, 창업솔루션 등)"],
                      ["인스타/페이스북 광고", "인스타/페이스북 광고"],
                      ["네이버 블로그", "네이버 블로그"],
                      ["지인 소개/아카데미 수강생", "지인 소개 / 아카데미 수강생"],
                      ["기타", "기타"],
                    ].map(([value, text], i) => (
                      <label key={value} className="lp3-radio">
                        <input type="radio" name="route" value={value} required={i === 0} />
                        <span>{text}</span>
                      </label>
                    ))}
                  </div>

                  {/* 페이지 구분 */}
                  <input type="hidden" name="source" value={FORM_SOURCE} />
                  {/* 보안 토큰 */}
                  <input type="hidden" name="token" value={FORM_TOKEN} />

                  <button type="submit" className="lp3-submit" disabled={submitting}>
                    {submitting ? "전송중..." : SUBMIT_LABEL}
                  </button>
                </form>
                <p className="lp3-notice">
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

      {/* 장면 11 FAQ [화이트] */}
      <section data-track-section="faq">
        <div className="lp3-blk lp3-wh" style={{ paddingTop: 64, borderTop: "1px solid #eee" }}>
          <div className="lp3-c">
            <h2 className="lp3-mega lp3-rv">궁금하신 점을 모았습니다</h2>
            <div className="lp3-faq">
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

      {/* 하단 고정 바 스페이서 — 바가 푸터를 가리지 않게 한다 */}
      <div className="lp3-bar-space" aria-hidden="true" />

      {/* 하단 고정 바 — 장면 1 버튼 또는 장면 10 이 보이면 숨김 */}
      <div className={`lp3-bar${barHidden ? " is-hidden" : ""}`} aria-hidden={barHidden}>
        <button type="button" className="lp3-btn" onClick={scrollToStage} tabIndex={barHidden ? -1 : 0}>
          {CTA_LABEL}
        </button>
      </div>
    </div>
  );
}
