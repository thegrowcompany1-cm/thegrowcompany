"use client";

// ─────────────────────────────────────────────────────────────────────────────
// /lp/startup — 메타 광고 전용 창업솔루션 랜딩 v2 (CSS 접두사 lp2-)
//  · 카피·구조: startup-lp-v2.md (15블록). 모바일 상세페이지형 — 콘텐츠 최대폭 480px 중앙,
//    섹션은 화면폭 꽉 찬 색 블록(블랙 / 화이트 / 그린 띠 / 다크레드)으로 교차한다.
//  · 기존 /consulting/startup 의 레이아웃·디자인은 쓰지 않는다. 데이터(영상·후기 문구·카톡
//    이미지·대표 사진·단계 사진)만 가져왔다.
//  · 가로 마퀴(카톡 후기·텍스트 후기)는 components/LogoMarquee.tsx 와 같은 방식이다 —
//    내용을 두 벌 이어 붙이고 간격은 margin 으로 줘서 translateX(-50%) 가 끊김 없이 이어지고,
//    화면 밖이면 멈추며, 터치하는 동안 멈춘다.
//  · 신청 폼은 /consulting/startup 의 창업 폼과 action·token·source·name·필드 구성이 같다.
//    iframe 이름은 lps_hidden_iframe, 성공 판정은 iframe load (done 가드 + 15초 타임아웃 +
//    try/catch — 진단 컨설턴트 양성과정 폼과 같은 구조).
//  · 하단 고정 바는 폼이 화면에 보이면 숨긴다.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

const FORM_ACTION =
  "https://script.google.com/macros/s/AKfycbyTIVLMDS-DQjOZ1fIP9DbzJ2NONxyn6mdjEik1_ZG31XB9TVO0Y5_odvFwO1M0AcJ21Q/exec";
const FORM_SOURCE = "창업지원상담_아임웹";
const FORM_TOKEN = "grow2026secure";
const FORM_TARGET = "lps_hidden_iframe";
const CTA_LABEL = "창업 정보 받아보기";

const CEO_PHOTO = "/consultants/kim-jaegang.jpg";
// 히어로용 누끼(투명 PNG) — 블랙 배경에 그대로 올린다
const CEO_CUTOUT = "/consultants/kim-jaegang-cutout.png";

const VIDEO_MAIN = { src: "/reviews/review-3.mp4", poster: "/reviews/review-3.jpg", caption: "일주일 만에 매출 8,300만원, 두번째 창업" };
const VIDEO_PAIR = [
  { src: "/reviews/review-1.mp4", poster: "/reviews/review-1.jpg", caption: "수치와 데이터로 증명한 첫 창업 이야기" },
  { src: "/reviews/review-2.mp4", poster: "/reviews/review-2.jpg", caption: "의심을 확인으로 바꾼 PT 스튜디오 창업" },
];

const EMPATHY = [
  "총 얼마가 드는지 감이 안 잡힌다",
  "견적 세 곳이 다 다르다",
  "회원 모집이 막막하다",
  "누구 말을 믿어야 할지 모르겠다",
];

const KAKAO = [
  "/after/after%201%20.jpg",
  "/legacy/startup/15074ccf15f4f.png",
  "/legacy/startup/6c472bc288fca.png",
  "/legacy/startup/c9a26f224753e.jpg",
  "/legacy/startup/5f9b6a71b84af.jpg",
  "/legacy/startup/a0aa9f04ac114.png",
];

const TARGETS = [
  "처음 창업이라 무엇부터 해야 할지 모르는 분",
  "견적은 받았는데 적정한지 판단이 안 서는 분",
  "오픈 후 회원 모집까지 책임질 곳을 찾는 분",
  "두 번째 센터를 더 크게 준비하는 분",
  "업체를 여러 곳 거치며 시간을 버리고 싶지 않은 분",
];

const AUTH_CHECKS = ["직접 센터를 운영해본 현장 경험", "수백 번의 창업을 곁에서 함께한 경험", "전속 인테리어팀 운영"];

const OLD_WAY = ["상권 분석만 하고 끝", "인테리어 업체 마진 그대로", "오픈하면 계약 종료"];
const NEW_WAY = ["입지부터 운영까지 한 팀", "전속 인테리어팀 직접 시공", "오픈세일 직원 2달 상주"];

const STEPS = [
  { img: "3fe6ca005fb28.jpg", title: "입지·상권", desc: "데이터로 사람이 오는 자리를 찾습니다" },
  { img: "3a1f8666a4fb7.png", title: "인테리어·동선", desc: "매출이 나오는 구조로 설계합니다" },
  { img: "482325a2e8663.jpg", title: "프리세일", desc: "오픈 전에 매출을 만듭니다" },
  { img: "57d1714abddb9.jpg", title: "운영 세팅", desc: "대표가 없어도 돌아가는 구조를 만듭니다" },
];

const WEAPONS = [
  { big: "2달", line: "오픈세일, 직원이 현장에 직접 상주합니다" },
  { big: "직접 시공", line: "전속 인테리어팀이 중간 마진 없이 시공합니다" },
  { big: "B2B", line: "기구를 B2B 조건으로 구매하도록 연결합니다" },
];

const REVIEWS = [
  { name: "김○○ 대표님", meta: "필라테스 · 경기 성남", text: "혼자 준비했으면 분명 실패했을 거예요. 입지 선정부터 인테리어, 프리세일까지 전부 함께 해주셔서 오픈 첫 달부터 안정적으로 시작했습니다." },
  { name: "이○○ 대표님", meta: "헬스장 · 서울 강서", text: "프리세일 때 목표의 150%를 달성했어요. 가격 설계와 상담 구조를 미리 잡아주셔서 가능했던 것 같습니다. 정말 감사합니다." },
  { name: "박○○ 대표님", meta: "필라테스 · 인천 송도", text: "운영 시스템을 만들어주셔서 지금은 제가 매장에 없어도 잘 돌아갑니다. 진짜 사업하는 느낌이에요." },
  { name: "최○○ 대표님", meta: "헬스장 · 경기 수원", text: "인테리어 비용이 합리적인데 퀄리티는 최고였어요. 동선까지 고려한 설계 덕분에 상담 전환율이 정말 높습니다." },
];

const PACKAGE = ["업종·평수별 예상 창업비용", "희망 지역 1차 상권 검토", "창업 계획 위험요소 체크"];

const FAQS = [
  { q: "솔루션 비용", a: "센터 규모, 지역, 필요한 서비스 범위에 따라 달라집니다. 정보를 남겨주시면 대표님 상황에 맞춰 안내드립니다." },
  { q: "지방 진행 여부", a: "전국 어디든 가능합니다. 제주, 부산, 대구, 광주 등 전국에서 진행해왔고, 입지 선정은 직접 방문해 함께합니다." },
  { q: "창업 경험이 없는 경우", a: "처음이신 분들이 오히려 잘 맞습니다. 잘못된 습관 없이 처음부터 올바른 구조로 시작할 수 있기 때문입니다." },
  { q: "오픈 이후 지원", a: "오픈 후 안정화 기간 동안 운영 점검, 매출 분석, 마케팅 조정을 이어서 지원합니다." },
];

const STYLE = `
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
.lp2{--bk:#0A0A0A;--gr:#009519;--gl:#22B573;--rd:#7A1414;font-family:'Pretendard',var(--font-noto-sans-kr),-apple-system,BlinkMacSystemFont,system-ui,'Apple SD Gothic Neo',sans-serif;font-size:17px;font-weight:500;line-height:1.6;letter-spacing:-0.02em;color:#111;background:#fff;overflow-x:hidden;word-break:keep-all;overflow-wrap:break-word}
.lp2 *,.lp2 *::before,.lp2 *::after{box-sizing:border-box}
:where(.lp2) :is(h1,h2,h3,h4,p,ul,figure){margin:0;padding:0}
:where(.lp2) ul{list-style:none}
.lp2 img{max-width:100%}

/* 색 블록 — 화면폭 꽉 찬 배경, 안쪽 콘텐츠는 480px 중앙 */
.lp2-blk{padding:80px 20px;--hlc:#22B573;--pre:#fff}
.lp2-c{max-width:480px;margin:0 auto}
.lp2-bk{background:var(--bk);color:#fff}
.lp2-wh{background:#fff;color:#111;--hlc:#009519;--pre:#111}
.lp2-gr{background:var(--gr);color:#fff;--hlc:#0A0A0A;--pre:#fff}
.lp2-rd{background:var(--rd);color:#fff}

.lp2-mega{font-size:clamp(29px,9.3vw,36px);font-weight:900;line-height:1.25;letter-spacing:-0.03em;text-align:center}
.lp2-sub{font-size:22px;font-weight:800;line-height:1.4;text-align:center}
.lp2-p{font-size:17px;font-weight:500;line-height:1.6;text-align:center}
.lp2-dim{color:rgba(255,255,255,.72)}
.lp2-wh .lp2-dim{color:#555}
.lp2-mt{margin-top:28px}
.lp2-mt-s{margin-top:16px}

/* 하이라이트 박스 — 기본 표시, 스크립트가 켜지면 좌→우로 칠해진다 */
.lp2-hl{display:inline;padding:2px 8px;margin:0 -2px;color:#fff;background-color:transparent;background-image:linear-gradient(var(--hlc),var(--hlc));background-repeat:no-repeat;background-size:100% 100%;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.lp2-hl svg{display:inline-block;width:.78em;height:.78em;vertical-align:-0.05em;margin:0 .12em}
.lp2-js .lp2-hl{background-size:0% 100%;color:var(--pre);transition:background-size .7s cubic-bezier(.2,.7,.2,1) .25s,color .2s ease .55s}
.lp2-js .lp2-in .lp2-hl,.lp2-js .lp2-hl.lp2-in{background-size:100% 100%;color:#fff}

/* 스크롤 진입 fade-up — 기본 표시 */
.lp2-js .lp2-rv{opacity:0;transform:translateY(26px);transition:opacity .7s ease,transform .7s ease}
.lp2-js .lp2-rv.lp2-in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){.lp2-js .lp2-rv,.lp2-js .lp2-hl{transition:none}}

.lp2-btn{display:flex;align-items:center;justify-content:center;width:100%;min-height:64px;border:none;border-radius:16px;background:var(--gr);color:#fff;font-family:inherit;font-size:20px;font-weight:900;letter-spacing:-0.02em;cursor:pointer;box-shadow:0 10px 30px rgba(0,149,25,.45)}
.lp2-btn:active{transform:scale(.99)}

/* 1 히어로 */
.lp2-badge{display:table;margin:0 auto 22px;padding:7px 16px;border:1px solid rgba(255,255,255,.35);border-radius:50px;font-size:14px;font-weight:700;color:#e8e8e8}
.lp2-hero-ph{position:relative;margin:34px -20px 0;overflow:hidden;background:#0A0A0A}
.lp2-hero-ph img{display:block;width:100%;height:auto}
.lp2-hero-ph::after{content:'';position:absolute;left:0;right:0;bottom:0;height:45%;background:linear-gradient(to bottom,rgba(10,10,10,0),#0A0A0A 92%);pointer-events:none}
@media(min-width:481px){.lp2-hero-ph{margin-left:0;margin-right:0;-webkit-mask-image:linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent);mask-image:linear-gradient(90deg,transparent,#000 10%,#000 90%,transparent)}}
.lp2-hero-cta{position:relative;z-index:2;margin-top:-92px;padding:0}

/* 2 경고 */
.lp2-alert{background:#fff;color:#111;border-radius:14px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,.45)}
.lp2-alert-bar{display:flex;align-items:center;gap:7px;padding:10px 14px;background:#ececec;border-bottom:1px solid #d9d9d9}
.lp2-alert-bar i{width:10px;height:10px;border-radius:50%;background:#bdbdbd}
.lp2-alert-body{padding:34px 22px 36px;text-align:center}
.lp2-alert-ic{display:block;width:64px;height:64px;margin:0 auto 18px}
.lp2-alert-big{font-size:26px;font-weight:900;line-height:1.35;letter-spacing:-0.03em}
.lp2-alert-sm{margin-top:14px;font-size:15px;font-weight:500;color:#666}

/* 3·6 영상 */
.lp2-vid{position:relative;border-radius:18px;overflow:hidden;background:#1a1a1a;aspect-ratio:9/16}
.lp2-vid video{width:100%;height:100%;object-fit:cover;display:block}
.lp2-vid-play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;border:none;background:rgba(0,0,0,.2);cursor:pointer}
.lp2-vid-play span{display:flex;align-items:center;justify-content:center;width:68px;height:68px;border-radius:50%;background:var(--gr);box-shadow:0 8px 24px rgba(0,0,0,.45)}
.lp2-vid-main{max-width:330px;margin:34px auto 0}
.lp2-cap{margin-top:12px;font-size:14px;font-weight:600;line-height:1.5;color:#bdbdbd;text-align:center}
.lp2-vid-pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}

/* 4 공감 */
.lp2-emp{position:relative;margin-top:36px;padding:34px 8px;border-radius:18px;overflow:hidden;background:#f4f4f4}
.lp2-doc{position:absolute;inset:-6px;padding:20px 18px;filter:blur(3.5px);opacity:.75;pointer-events:none}
.lp2-doc i{display:block;height:14px;border-radius:4px;background:#dcdcdc;margin-bottom:12px}
.lp2-doc i.h{height:26px;width:46%;background:#c9c9c9;margin-bottom:22px}
.lp2-doc i.s{width:62%}
.lp2-doc i.m{width:84%}
.lp2-doc i.t{height:2px;background:#bfbfbf;margin:18px 0}
.lp2-emp ul{position:relative;display:flex;flex-direction:column;gap:22px;padding:0 10px}
.lp2-emp li{display:flex;align-items:flex-start;gap:12px;font-size:22px;font-weight:800;line-height:1.4;letter-spacing:-0.03em;color:#111}
.lp2-emp li svg{flex:0 0 30px;width:30px;height:30px;margin-top:1px}
.lp2-js .lp2-emp li{opacity:0;transform:translateY(18px);transition:opacity .6s ease,transform .6s ease}
.lp2-js .lp2-emp.lp2-in li{opacity:1;transform:none}
.lp2-js .lp2-emp.lp2-in li:nth-child(2){transition-delay:.5s}
.lp2-js .lp2-emp.lp2-in li:nth-child(3){transition-delay:1s}
.lp2-js .lp2-emp.lp2-in li:nth-child(4){transition-delay:1.5s}

/* 5 반박 */
.lp2-no{display:inline-block;margin-top:14px}

/* 6 증거 */
.lp2-band{padding:60px 20px}
.lp2-mq{position:relative;overflow:hidden;width:100%;margin-top:28px;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 6%,#000 94%,transparent 100%);mask-image:linear-gradient(90deg,transparent 0,#000 6%,#000 94%,transparent 100%)}
.lp2-mq-track{display:flex;align-items:stretch;width:max-content;will-change:transform}
.lp2-mq-l{animation:lp2-left var(--dur,50s) linear infinite}
.lp2-mq-r{animation:lp2-right var(--dur,50s) linear infinite}
@keyframes lp2-left{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes lp2-right{from{transform:translateX(-50%)}to{transform:translateX(0)}}
.lp2-mq.is-paused .lp2-mq-track,.lp2-mq.is-hold .lp2-mq-track{animation-play-state:paused}
@media(hover:hover) and (pointer:fine){.lp2-mq:hover .lp2-mq-track{animation-play-state:paused}}
.lp2-mq-i{flex:0 0 auto;display:flex;margin-right:12px}
.lp2-kk{display:block;height:230px;width:auto;border-radius:12px}

/* 7 추천 대상 */
.lp2-chk{margin-top:30px}
.lp2-chk li{display:flex;align-items:flex-start;gap:14px;padding:20px 2px;border-bottom:1px solid #e4e4e4;font-size:20px;font-weight:700;line-height:1.45;letter-spacing:-0.03em}
.lp2-chk li:first-child{border-top:1px solid #e4e4e4}
.lp2-chk svg{flex:0 0 30px;width:30px;height:30px;margin-top:1px}

/* 8 권위 */
.lp2-auth-ph{display:block;width:100%;aspect-ratio:1/1;object-fit:cover;object-position:50% 14%;border-radius:22px;margin-top:34px}
.lp2-auth-name{margin-top:14px;text-align:center;font-size:20px;font-weight:800}
.lp2-num{margin-top:30px;text-align:center;line-height:1}
.lp2-num b{font-size:76px;font-weight:900;letter-spacing:-0.04em;color:var(--gl)}
.lp2-num span{font-size:30px;font-weight:900;color:var(--gl);margin-left:4px}
.lp2-num-d{margin-top:8px;text-align:center;font-size:17px;font-weight:600;color:rgba(255,255,255,.8)}
.lp2-auth-chk{margin-top:30px}
.lp2-auth-chk li{display:flex;align-items:flex-start;gap:12px;padding:14px 0;font-size:18px;font-weight:700;line-height:1.45;border-top:1px solid rgba(255,255,255,.14)}
.lp2-auth-chk svg{flex:0 0 26px;width:26px;height:26px;margin-top:1px}

/* 10 비교 */
.lp2-old{margin-top:34px;padding:26px 22px;border-radius:20px;background:#2a2a2a}
.lp2-old li{padding:8px 0;font-size:19px;font-weight:600;color:#8c8c8c;text-decoration:line-through;text-decoration-thickness:2px}
.lp2-arrow{display:block;width:56px;height:56px;margin:18px auto}
.lp2-new{padding:26px 22px;border-radius:20px;background:var(--gr)}
.lp2-new li{display:flex;align-items:flex-start;gap:10px;padding:8px 0;font-size:21px;font-weight:900;line-height:1.4;letter-spacing:-0.03em;color:#fff}
.lp2-new svg{flex:0 0 26px;width:26px;height:26px;margin-top:3px}

/* 11 4단계 */
.lp2-steps{margin-top:40px}
.lp2-step{text-align:center}
.lp2-step-no{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;width:58px;height:58px;margin:0 auto -29px;border-radius:50%;background:var(--gr);border:4px solid #fff;color:#fff;font-size:28px;font-weight:900}
.lp2-step img{display:block;width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:16px;background:#e5e5e5}
.lp2-step h3{margin-top:16px;font-size:22px;font-weight:800;line-height:1.35}
.lp2-step p{margin-top:4px;font-size:17px;font-weight:500;color:#555}
.lp2-down{display:block;width:34px;height:34px;margin:22px auto}

/* 12 무기 */
.lp2-weap{display:flex;flex-direction:column;gap:14px;margin-top:34px}
.lp2-weap-c{background:#fff;color:#111;border-radius:22px;padding:30px 20px;text-align:center}
.lp2-weap-c b{display:block;font-size:64px;font-weight:900;line-height:1.1;letter-spacing:-0.04em;color:var(--gr)}
.lp2-weap-c p{margin-top:12px;font-size:17px;font-weight:700;line-height:1.5}

/* 13 텍스트 후기 */
.lp2-rv-card{width:300px;flex:1 1 auto;padding:24px 22px;border-radius:18px;background:#161616;border:1px solid #2a2a2a;color:#fff}
.lp2-rv-card h4{margin:0;font-size:16px;font-weight:800}
.lp2-rv-card small{display:block;margin-top:2px;font-size:14px;font-weight:500;color:#9a9a9a}
.lp2-rv-card p{margin-top:14px;font-size:16px;font-weight:500;line-height:1.65;color:#e2e2e2}

/* 14 오퍼 */
.lp2-ticket{position:relative;display:flex;margin-top:34px;border-radius:18px;background:#fff;color:#111;box-shadow:0 18px 40px rgba(0,0,0,.25)}
.lp2-ticket::before,.lp2-ticket::after{content:'';position:absolute;left:41px;width:22px;height:22px;border-radius:50%;background:var(--gr)}
.lp2-ticket::before{top:-11px}
.lp2-ticket::after{bottom:-11px}
.lp2-stub{flex:0 0 52px;display:flex;align-items:center;justify-content:center;border-right:2px dashed #c9c9c9;color:var(--gr);font-size:14px;font-weight:800;letter-spacing:.15em;writing-mode:vertical-rl}
.lp2-tk-main{flex:1 1 auto;min-width:0;padding:24px 20px}
.lp2-tk-main h3{font-size:21px;font-weight:900;letter-spacing:-0.03em;margin-bottom:14px}
.lp2-tk-main li{display:flex;align-items:flex-start;gap:12px;padding:11px 0;border-top:1px solid #ececec;font-size:17px;font-weight:700;line-height:1.45}
.lp2-tk-main li i{flex:0 0 28px;width:28px;height:28px;border-radius:50%;background:var(--gr);color:#fff;font-style:normal;font-size:15px;font-weight:900;display:flex;align-items:center;justify-content:center}
.lp2-pick{margin-top:38px;text-align:center;font-size:16px;font-weight:600;line-height:1.65;color:rgba(255,255,255,.92)}

.lp2-form-blk{padding:56px 20px 70px;scroll-margin-top:80px}
.lp2-form-t{font-size:22px;font-weight:900;text-align:center;letter-spacing:-0.03em;margin-bottom:26px}
.lp2-grp{margin-bottom:22px}
.lp2-label{display:block;margin-bottom:9px;font-size:16px;font-weight:700;color:#111}
.lp2-label small{font-size:14px;font-weight:500;color:#777}
.lp2-req{color:#e03131}
.lp2-in-f{display:block;width:100%;height:56px;padding:0 16px;border:2px solid #e3e3e3;border-radius:12px;background:#fff;font-family:inherit;font-size:17px;font-weight:500;color:#111}
.lp2-in-f::placeholder{color:#a3a3a3}
.lp2-in-f:focus{outline:none;border-color:var(--gr);box-shadow:0 0 0 4px rgba(0,149,25,.12)}
.lp2-phone{display:flex;align-items:center;gap:8px}
.lp2-phone .lp2-in-f{min-width:0;padding:0 4px;text-align:center}
.lp2-phone > span{color:#aaa}
.lp2-radio{display:flex;align-items:center;gap:12px;min-height:54px;margin-bottom:10px;padding:0 16px;border:2px solid #e3e3e3;border-radius:12px;font-size:16px;font-weight:600;color:#111;cursor:pointer}
.lp2-radio input{width:20px;height:20px;margin:0;accent-color:var(--gr);flex:0 0 auto}
.lp2-radio:has(input:checked){border-color:var(--gr);background:#f0faf1}
.lp2-submit{display:block;width:100%;min-height:64px;margin-top:6px;border:none;border-radius:16px;background:var(--gr);color:#fff;font-family:inherit;font-size:20px;font-weight:900;cursor:pointer;box-shadow:0 10px 30px rgba(0,149,25,.4)}
.lp2-submit:disabled{opacity:.55;cursor:not-allowed}
.lp2-notice{margin-top:18px;text-align:center;font-size:15px;font-weight:600;color:#555}
.lp2-done{padding:56px 10px;text-align:center;font-size:17px;line-height:1.7;color:#444}
.lp2-done b{display:block;margin-bottom:10px;font-size:26px;font-weight:900;color:var(--gr);letter-spacing:-0.03em}

/* 15 FAQ */
.lp2-faq{margin-top:30px}
.lp2-faq details{border-bottom:1px solid #e4e4e4}
.lp2-faq details:first-child{border-top:1px solid #e4e4e4}
.lp2-faq summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:22px 2px;font-size:19px;font-weight:800;letter-spacing:-0.03em}
.lp2-faq summary::-webkit-details-marker{display:none}
.lp2-faq summary::after{content:'+';flex:0 0 auto;font-size:28px;font-weight:400;color:var(--gr)}
.lp2-faq details[open] summary::after{content:'\\2212'}
.lp2-faq p{padding:0 2px 24px;font-size:17px;font-weight:500;line-height:1.65;color:#444}

/* 하단 고정 바 */
.lp2-bar{position:fixed;left:50%;bottom:0;z-index:60;width:min(100%,480px);padding:10px 12px calc(10px + env(safe-area-inset-bottom));transform:translateX(-50%);transition:transform .3s ease,opacity .3s ease}
.lp2-bar.is-hidden{transform:translate(-50%,120%);opacity:0;pointer-events:none}
.lp2-bar .lp2-btn{min-height:58px}
.lp2-bar-space{height:calc(78px + env(safe-area-inset-bottom));background:#fff}

@media(max-width:480px){
  .lp2-blk{padding:80px 20px}
  .lp2-kk{height:200px}
  .lp2-weap-c b{font-size:58px}
  .lp2-alert-big{font-size:24px}
}
`;

type Win = Window & {
  gtag?: (...a: unknown[]) => void;
  __tgcFbTrack?: (e: string, p?: Record<string, unknown>) => void;
};

const Hl = ({ children }: { children: ReactNode }) => <mark className="lp2-hl">{children}</mark>;

const IcX = ({ size }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="11" fill="#E03131" />
    <path d="M7.6 7.6l8.8 8.8M16.4 7.6l-8.8 8.8" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" />
  </svg>
);
const IcCheck = ({ color = "#009519", tick = "#fff" }: { color?: string; tick?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="11" fill={color} />
    <path d="M6.8 12.4l3.6 3.6 6.8-7.2" fill="none" stroke={tick} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IcArrow = ({ className, color }: { className: string; color: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3v15M5 12l7 7 7-7" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// LogoMarquee 와 같은 방식: 두 벌 이어 붙임 + margin 간격 + 화면 밖 정지 + 터치 중 정지
function Marquee({ items, dur, reverse = false }: { items: ReactNode[]; dur: number; reverse?: boolean }) {
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
    <div
      ref={ref}
      className="lp2-mq"
      style={{ "--dur": `${dur}s` } as CSSProperties}
      onTouchStart={hold}
      onTouchEnd={release}
      onTouchCancel={release}
    >
      <div className={`lp2-mq-track ${reverse ? "lp2-mq-r" : "lp2-mq-l"}`}>
        {items.map((n, i) => (
          <div className="lp2-mq-i" key={`a${i}`}>
            {n}
          </div>
        ))}
        {items.map((n, i) => (
          <div className="lp2-mq-i" key={`b${i}`} aria-hidden="true">
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
  className,
}: {
  src: string;
  poster: string;
  caption: string;
  active: boolean;
  onPlay: () => void;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  // 다른 영상이 재생되면 멈추고 포스터로 돌아간다
  useEffect(() => {
    if (!active && started) {
      ref.current?.pause();
      setStarted(false);
    }
  }, [active, started]);

  return (
    <figure className={className}>
      <div className="lp2-vid">
        <video ref={ref} src={src} poster={poster} preload="none" playsInline controls={started} onEnded={() => setStarted(false)} />
        {!started && (
          <button
            type="button"
            className="lp2-vid-play"
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
      <figcaption className="lp2-cap">{caption}</figcaption>
    </figure>
  );
}

export default function StartupLpV2() {
  const [activeVid, setActiveVid] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [heroCtaVisible, setHeroCtaVisible] = useState(true);
  const heroCtaRef = useRef<HTMLButtonElement>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const formBoxRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const phoneRefs = useRef<(HTMLInputElement | null)[]>([]);
  const stopRef = useRef<(() => void) | null>(null);

  // 언마운트 시 진행 중인 전송의 리스너·타이머 정리
  useEffect(() => () => stopRef.current?.(), []);

  // 진입 애니메이션 — 스크립트가 켜진 경우에만 숨겼다가 보여 준다 (기본은 표시)
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.classList.add("lp2-js");
    if (typeof IntersectionObserver === "undefined") {
      root.classList.remove("lp2-js");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("lp2-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.2 },
    );
    root.querySelectorAll(".lp2-rv, .lp2-emp, .lp2-hl").forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      root.classList.remove("lp2-js");
    };
  }, []);

  // 하단 고정 바 — 히어로 CTA 또는 폼이 화면에 보이면 숨김 (둘 다 안 보일 때만 표시)
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const watch = (el: Element | null, set: (v: boolean) => void) => {
      if (!el) return null;
      const io = new IntersectionObserver((entries) => set(entries[entries.length - 1].isIntersecting), { threshold: 0.05 });
      io.observe(el);
      return io;
    };
    const a = watch(heroCtaRef.current, setHeroCtaVisible);
    const b = watch(formBoxRef.current, setFormVisible);
    return () => {
      a?.disconnect();
      b?.disconnect();
    };
  }, []);
  const barHidden = heroCtaVisible || formVisible;

  const scrollToForm = useCallback(() => {
    document.getElementById("consulting-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

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

      form.submit();
    } catch {
      done = true;
      cleanup();
      alert("전송 중 오류가 발생했습니다. 다시 시도해주세요.");
      setSubmitting(false);
    }
  };

  const kakaoItems = (list: string[]) =>
    list.map((src) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img className="lp2-kk" key={src} src={src} alt="카톡 후기" draggable={false} />
    ));

  return (
    <div className="lp2" ref={rootRef}>
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />

      {/* 1 히어로 [블랙] */}
      <section data-track-section="hero">
        <div className="lp2-blk lp2-bk" style={{ paddingTop: 56, paddingBottom: 40 }}>
          <div className="lp2-c">
            <p className="lp2-badge">헬스장·필라테스 창업 300회</p>
            <h1 className="lp2-mega lp2-rv">
              창업 컨설팅 회사를 고르고 계신다면
              <br />
              <Hl>오픈 다음 날까지</Hl>
              <br />
              책임지는 곳인지
              <br />
              먼저 확인하세요
            </h1>
            <div className="lp2-hero-ph">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={CEO_CUTOUT} alt="김재강 대표" width={1000} height={1333} />
            </div>
            <div className="lp2-hero-cta">
              <button ref={heroCtaRef} type="button" className="lp2-btn" onClick={scrollToForm}>
                {CTA_LABEL}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2 경고 [다크레드] */}
      <section data-track-section="warning">
        <div className="lp2-blk lp2-rd">
          <div className="lp2-c lp2-rv">
            <div className="lp2-alert" role="note">
              <div className="lp2-alert-bar" aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
              <div className="lp2-alert-body">
                <svg className="lp2-alert-ic" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.6L1.8 20.4h20.4L12 2.6z" fill="#F5B301" stroke="#F5B301" strokeWidth="1.6" strokeLinejoin="round" />
                  <path d="M12 9.4v5.4" stroke="#111" strokeWidth="2.2" strokeLinecap="round" />
                  <circle cx="12" cy="17.6" r="1.25" fill="#111" />
                </svg>
                <p className="lp2-alert-big">
                  계약서에 도장 찍기 전,
                  <br />이 페이지를 끝까지 보세요
                </p>
                <p className="lp2-alert-sm">창업 비용의 대부분은 계약하는 순간 결정됩니다.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 결과 먼저 [블랙] */}
      <section data-track-section="result">
        <div className="lp2-blk lp2-bk">
          <div className="lp2-c">
            <h2 className="lp2-mega lp2-rv">
              두 번째 창업,
              <br />
              <Hl>일주일 만에 매출 8,300만원</Hl>
            </h2>
            <VideoCard
              className="lp2-vid-main"
              {...VIDEO_MAIN}
              active={activeVid === VIDEO_MAIN.src}
              onPlay={() => setActiveVid(VIDEO_MAIN.src)}
            />
            <p className="lp2-cap" style={{ marginTop: -2 }}>
              실제 더그로우와 함께한 대표님 영상입니다.
            </p>
          </div>
        </div>
      </section>

      {/* 4 공감 [화이트] */}
      <section data-track-section="empathy">
        <div className="lp2-blk lp2-wh">
          <div className="lp2-c">
            <h2 className="lp2-mega lp2-rv">
              업체마다 다른 말에
              <br />
              시간과 돈을 쓰고 계신다면
            </h2>
            <div className="lp2-emp">
              <div className="lp2-doc" aria-hidden="true">
                <i className="h" />
                <i className="m" />
                <i className="s" />
                <i className="t" />
                <i className="m" />
                <i />
                <i className="s" />
                <i className="t" />
                <i />
                <i className="m" />
                <i className="s" />
                <i className="t" />
                <i className="m" />
                <i />
                <i className="s" />
              </div>
              <ul>
                {EMPATHY.map((t) => (
                  <li key={t}>
                    <IcX />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5 반박 [블랙] */}
      <section data-track-section="rebuttal">
        <div className="lp2-blk lp2-bk">
          <div className="lp2-c">
            <p className="lp2-sub lp2-rv" style={{ fontWeight: 600, color: "rgba(255,255,255,.8)", fontSize: 19 }}>
              상권이 안 좋아서, 자금이 부족해서
            </p>
            <h2 className="lp2-mega lp2-mt-s" style={{ fontSize: "clamp(34px,10.5vw,42px)" }}>
              <span className="lp2-no">
                <Hl>
                  <IcX />
                  아닙니다
                  <IcX />
                </Hl>
              </span>
            </h2>
            <p className="lp2-sub lp2-mt lp2-rv" style={{ lineHeight: 1.55 }}>
              창업이 흔들리는 이유는
              <br />
              처음부터 <Hl>구조</Hl>가 잘못
              <br />
              설계됐기 때문입니다
            </p>
          </div>
        </div>
      </section>

      {/* 6 증거 폭격 [그린 띠 → 블랙] */}
      <section data-track-section="proof">
        <div className="lp2-band lp2-gr">
          <div className="lp2-c">
            <h2 className="lp2-mega lp2-rv">먼저 시작한 대표님들이 증명합니다</h2>
          </div>
        </div>
        <div className="lp2-blk lp2-bk" style={{ paddingTop: 56 }}>
          <div className="lp2-c">
            <div className="lp2-vid-pair">
              {VIDEO_PAIR.map((v) => (
                <VideoCard key={v.src} {...v} active={activeVid === v.src} onPlay={() => setActiveVid(v.src)} />
              ))}
            </div>
            <Marquee items={kakaoItems(KAKAO)} dur={70} />
            <Marquee items={kakaoItems([...KAKAO].reverse())} dur={78} reverse />
          </div>
        </div>
      </section>

      {/* 7 추천 대상 [화이트] */}
      <section data-track-section="target">
        <div className="lp2-blk lp2-wh">
          <div className="lp2-c">
            <h2 className="lp2-mega lp2-rv">이런 분들께 필요합니다</h2>
            <ul className="lp2-chk">
              {TARGETS.map((t) => (
                <li key={t}>
                  <IcCheck />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 8 권위 [블랙] */}
      <section data-track-section="authority">
        <div className="lp2-blk lp2-bk">
          <div className="lp2-c">
            <h2 className="lp2-mega lp2-rv">
              말이 아니라
              <br />
              <Hl>결과</Hl>로 증명합니다
            </h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="lp2-auth-ph" src={CEO_PHOTO} alt="김재강 대표" loading="lazy" />
            <p className="lp2-auth-name">김재강 대표</p>
            <p className="lp2-num">
              <b>300</b>
              <span>회</span>
            </p>
            <p className="lp2-num-d">헬스장·필라테스 창업</p>
            <ul className="lp2-auth-chk">
              {AUTH_CHECKS.map((t) => (
                <li key={t}>
                  <IcCheck color="#22B573" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 9 문제 재정의 [화이트] */}
      <section data-track-section="reframe">
        <div className="lp2-blk lp2-wh">
          <div className="lp2-c">
            <h2 className="lp2-mega lp2-rv">
              오픈 첫 달 매출은
              <br />
              <Hl>오픈 전에</Hl> 이미
              <br />
              결정됩니다
            </h2>
            <p className="lp2-p lp2-mt lp2-rv" style={{ color: "#444" }}>
              문을 열고 광고를 시작하면 늦습니다. 가격·패키지·상담 구조를 오픈 전에 설계해 프리세일로 매출을 먼저 만듭니다.
            </p>
          </div>
        </div>
      </section>

      {/* 10 업계 비교 [블랙] */}
      <section data-track-section="compare">
        <div className="lp2-blk lp2-bk">
          <div className="lp2-c">
            <h2 className="lp2-mega lp2-rv">오픈시켜주고 끝나는 컨설팅과는 다릅니다</h2>
            <ul className="lp2-old">
              {OLD_WAY.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <IcArrow className="lp2-arrow" color="#22B573" />
            <ul className="lp2-new">
              {NEW_WAY.map((t) => (
                <li key={t}>
                  <IcCheck color="#fff" tick="#009519" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 11 두려움 해소 + 4단계 [화이트] */}
      <section data-track-section="process">
        <div className="lp2-blk lp2-wh">
          <div className="lp2-c">
            <h2 className="lp2-mega lp2-rv">
              창업이 처음이라 두려우셔도
              <br />
              <Hl>한 팀이 끝까지</Hl> 갑니다
            </h2>
            <div className="lp2-steps">
              {STEPS.map((s, i) => (
                <div key={s.title}>
                  {i > 0 && <IcArrow className="lp2-down" color="#009519" />}
                  <div className="lp2-step">
                    <span className="lp2-step-no">{i + 1}</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/legacy/startup/${s.img}`} alt={`${s.title} 현장`} loading="lazy" />
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 12 무기 3가지 [그린 띠] */}
      <section data-track-section="weapon">
        <div className="lp2-blk lp2-gr">
          <div className="lp2-c">
            <h2 className="lp2-mega lp2-rv">더그로우만의 무기 3가지</h2>
            <div className="lp2-weap">
              {WEAPONS.map((w) => (
                <div key={w.big} className="lp2-weap-c lp2-rv">
                  <b>{w.big}</b>
                  <p>{w.line}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 13 텍스트 후기 [블랙] */}
      <section data-track-section="feedback">
        <div className="lp2-blk lp2-bk">
          <div className="lp2-c">
            <h2 className="lp2-mega lp2-rv">직접 경험한 대표님들의 이야기</h2>
            <Marquee
              dur={60}
              items={REVIEWS.map((r) => (
                <div className="lp2-rv-card" key={r.name}>
                  <h4>{r.name}</h4>
                  <small>{r.meta}</small>
                  <p>{r.text}</p>
                </div>
              ))}
            />
          </div>
        </div>
      </section>

      {/* 14 오퍼 = 입장권 [그린 띠 → 화이트] */}
      <section data-track-section="form" id="consulting-form">
        <div className="lp2-blk lp2-gr" style={{ paddingBottom: 64 }}>
          <div className="lp2-c">
            <h2 className="lp2-mega lp2-rv">
              연락처만 남기시면
              <br />
              <Hl>창업 정보 패키지</Hl>를
              <br />
              보내드립니다
            </h2>
            <div className="lp2-ticket lp2-rv">
              <div className="lp2-stub" aria-hidden="true">
                더그로우
              </div>
              <div className="lp2-tk-main">
                <h3>더그로우 창업 정보 패키지</h3>
                <ul>
                  {PACKAGE.map((t, i) => (
                    <li key={t}>
                      <i>{i + 1}</i>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="lp2-pick">
              더그로우는 모든 분과 함께하지 않습니다.
              <br />
              함께 성장할 대표님만 선별해 진행합니다.
            </p>
          </div>
        </div>

        <div className="lp2-form-blk lp2-wh">
          <div className="lp2-c" ref={formBoxRef}>
            {sent ? (
              <div className="lp2-done" role="status">
                <b>정상적으로 접수되었습니다.</b>
                신청 후 24시간 이내 담당자가 연락드립니다.
              </div>
            ) : (
              <>
                <p className="lp2-form-t">{CTA_LABEL}</p>
                <form id="lpsStartupForm" action={FORM_ACTION} method="POST" target={FORM_TARGET} onSubmit={onSubmit}>
                  <div className="lp2-grp">
                    <label className="lp2-label">
                      희망 업종을 선택해주세요. <span className="lp2-req">*</span>
                    </label>
                    <select name="industry" className="lp2-in-f" required defaultValue="">
                      <option value="">(선택)</option>
                      <option value="헬스장">헬스장</option>
                      <option value="필라테스">필라테스</option>
                      <option value="PT 스튜디오">PT 스튜디오</option>
                      <option value="요가">요가</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>

                  <div className="lp2-grp">
                    <label className="lp2-label">
                      선호 희망 지역을 알려주세요.
                      <br />
                      <small>(입지 상권을 함께 봐드립니다.)</small>
                    </label>
                    <input
                      type="text"
                      name="area"
                      className="lp2-in-f"
                      placeholder="예) 서울 마포구, 경기 남부, 부산 서면 인근 등"
                    />
                  </div>

                  <div className="lp2-grp">
                    <label className="lp2-label">
                      이름을 입력해주세요. <span className="lp2-req">*</span>
                    </label>
                    <input type="text" name="name" className="lp2-in-f" required />
                  </div>

                  <div className="lp2-grp">
                    <label className="lp2-label">
                      연락처를 입력해주세요. <span className="lp2-req">*</span>
                    </label>
                    <div className="lp2-phone">
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
                            className="lp2-in-f"
                            maxLength={i === 0 ? 3 : 4}
                            required
                            onChange={onPhoneInput(i)}
                          />
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="lp2-grp">
                    <label className="lp2-label">
                      연락처를 입력해주세요(중복확인). <span className="lp2-req">*</span>
                    </label>
                    <div className="lp2-phone">
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
                            className="lp2-in-f"
                            maxLength={i === 0 ? 3 : 4}
                            required
                            onChange={onPhoneInput(3 + i)}
                          />
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="lp2-grp">
                    <label className="lp2-label">
                      신청 경로를 알려주세요. <span className="lp2-req">*</span>
                    </label>
                    {[
                      ["네이버 검색(창업, 창업솔루션 등)", "네이버 검색 (창업, 창업솔루션 등)"],
                      ["인스타/페이스북 광고", "인스타/페이스북 광고"],
                      ["네이버 블로그", "네이버 블로그"],
                      ["지인 소개/아카데미 수강생", "지인 소개 / 아카데미 수강생"],
                      ["기타", "기타"],
                    ].map(([value, text], i) => (
                      <label key={value} className="lp2-radio">
                        <input type="radio" name="route" value={value} required={i === 0} />
                        <span>{text}</span>
                      </label>
                    ))}
                  </div>

                  {/* 페이지 구분 */}
                  <input type="hidden" name="source" value={FORM_SOURCE} />
                  {/* 보안 토큰 */}
                  <input type="hidden" name="token" value={FORM_TOKEN} />

                  <button type="submit" className="lp2-submit" disabled={submitting}>
                    {submitting ? "전송중..." : CTA_LABEL}
                  </button>
                </form>
                <p className="lp2-notice">신청 후 24시간 이내 담당자가 연락드립니다.</p>
              </>
            )}
            <iframe ref={iframeRef} name={FORM_TARGET} title="신청 전송" style={{ display: "none" }} />
          </div>
        </div>
      </section>

      {/* 15 FAQ [화이트] */}
      <section data-track-section="faq">
        <div className="lp2-blk lp2-wh" style={{ paddingTop: 64, borderTop: "1px solid #eee" }}>
          <div className="lp2-c">
            <h2 className="lp2-mega lp2-rv">궁금하신 점을 모았습니다</h2>
            <div className="lp2-faq">
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
      <div className="lp2-bar-space" aria-hidden="true" />

      {/* 하단 고정 바 — 폼이 화면에 보이면 숨김 */}
      <div className={`lp2-bar${barHidden ? " is-hidden" : ""}`} aria-hidden={barHidden}>
        <button type="button" className="lp2-btn" onClick={scrollToForm} tabIndex={barHidden ? -1 : 0}>
          {CTA_LABEL}
        </button>
      </div>
    </div>
  );
}
