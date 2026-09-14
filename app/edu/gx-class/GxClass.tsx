"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 그룹운동 비즈니스 클래스 랜딩 — /edu/gx-class (레이아웃 골격 · 카피 플레이스홀더)
//  · 참고 구조는 /edu/fc-class 지만 주입 HTML(DETAIL_HTML) 없이 전부 React 로 렌더한다.
//    본문이 서버 HTML 에 그대로 들어가고, <script> 재생성·전역 함수가 필요 없다.
//  · 클래스 접두사 gx1- (fc1-, sm1- 과 충돌 금지)
//  · 날짜·가격·정원·장소는 lib/gxClass.ts 상수만 수정
//  · 애니메이션 fail-safe: 기본은 전부 표시. 이펙트가 루트에 gx1-anim 을 붙인 뒤에만
//    숨김 → 등장. 스크립트가 안 돌면 모든 섹션이 보인 상태로 남는다.
//  · IntersectionObserver / rAF 는 언마운트 시 전부 정리
//  · 결제 버튼(히어로 · 결제 섹션 #contact · 하단 고정 바)은 fc-class 와 동일하게
//    router.push 로 /checkout 이동. 상품 가격의 원본은 Supabase products 테이블이다.
//  · 카피 규칙: 물음표 금지 · 영문 eyebrow 금지 · 컨설팅→솔루션 · 컨설턴트→멘토
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CAPACITY,
  CLASS_DATE,
  CLASS_PLACE,
  CLASS_TIME,
  EARLYBIRD_UNTIL,
  PRICE_EARLYBIRD,
  PRICE_NORMAL,
  formatCapacity,
  formatEarlybird,
  formatPrice,
  formatSchedule,
  isPending,
} from "@/lib/gxClass";

// 결제 상품 슬러그 — Supabase products 테이블의 slug(is_active=true)와 일치해야 결제창이 뜬다
const PRODUCT_NORMAL = "gx-class";
const PRODUCT_EARLY = "gx-class-early";

const SCHEDULE = formatSchedule(CLASS_DATE, CLASS_TIME);

// ── 1. 히어로 ────────────────────────────────────────────────────────────────
const HERO_STATS = [
  { value: "[수치1]", label: "[지표1]" },
  { value: "[수치2]", label: "[지표2]" },
  { value: "[수치3]", label: "[지표3]" },
];

// ── 2. 문제 제기 — 두 갈래 → 하나로 합류 ─────────────────────────────────────
const BRANCHES = [
  {
    tag: "[헬스장·PT샵 운영 중]",
    title: "[문제 제목 A]",
    items: ["[문제 항목 A-1]", "[문제 항목 A-2]", "[문제 항목 A-3]"],
  },
  {
    tag: "[그룹운동 운영 중]",
    title: "[문제 제목 B]",
    items: ["[문제 항목 B-1]", "[문제 항목 B-2]", "[문제 항목 B-3]"],
  },
];

// ── 3. 왜 그룹운동인가 — 같은 공간·같은 시간 기준 매출 구조 비교 ─────────────
// 행 라벨은 두 카드가 공유한다 (values 순서 = COMPARE_ROWS 순서)
const COMPARE_ROWS = [
  "[비교 기준1]",
  "[비교 기준2]",
  "[비교 기준3]",
  "[비교 기준4]",
];
const COMPARE_COLS = [
  {
    key: "pt",
    head: "[PT 기준]",
    cap: "[PT 조건 설명]",
    values: ["[값]", "[값]", "[값]", "[값]"],
    totalLabel: "[합계 라벨]",
    total: "[합계 값]",
    highlight: false,
  },
  {
    key: "gx",
    head: "[그룹운동 기준]",
    cap: "[그룹운동 조건 설명]",
    values: ["[값]", "[값]", "[값]", "[값]"],
    totalLabel: "[합계 라벨]",
    total: "[합계 값]",
    highlight: true,
  },
];

// ── 4. 이런 분께 ─────────────────────────────────────────────────────────────
const CHECKLIST = [
  "[체크 항목1]",
  "[체크 항목2]",
  "[체크 항목3]",
  "[체크 항목4]",
  "[체크 항목5]",
  "[체크 항목6]",
];

// ── 5. 숫자 증명 — 실측 확정 시 target(카운트업 목표값)과 suffix 만 교체 ────────
const PROOF_STATS = [
  { label: "[전환율]", target: 0, suffix: "%", note: "[근거 설명]" },
  { label: "[월 매출]", target: 0, suffix: "만원", note: "[근거 설명]" },
  { label: "[재등록률]", target: 0, suffix: "%", note: "[근거 설명]" },
];

// ── 6·7·8·9 는 항목 개수와 제목이 확정값 — 설명만 플레이스홀더 ─────────────────
const PART1 = [
  { title: "마인드셋", desc: "[항목 설명]", points: ["[세부 내용1]", "[세부 내용2]"] },
  { title: "자세(리관차)", desc: "[항목 설명]", points: ["[세부 내용1]", "[세부 내용2]"] },
  { title: "7단계 프로세스", desc: "[항목 설명]", points: ["[세부 내용1]", "[세부 내용2]"] },
  { title: "이탈 고객 재접근", desc: "[항목 설명]", points: ["[세부 내용1]", "[세부 내용2]"] },
];

const TRIAL_STEPS = [
  "문의 응대",
  "첫인상",
  "투어",
  "운동 체험",
  "상담·질문",
  "가치증명",
  "클로징",
];

const PART2 = [
  { title: "단계별 이유", desc: "[항목 설명]", points: ["[세부 내용1]", "[세부 내용2]"] },
  { title: "생각의 전환", desc: "[항목 설명]", points: ["[세부 내용1]", "[세부 내용2]"] },
  { title: "재등록 3단계", desc: "[항목 설명]", points: ["[세부 내용1]", "[세부 내용2]"] },
];

const REREG_LEVELS = [
  { lv: "Lv1", title: "관계 확인", desc: "[단계 설명]" },
  { lv: "Lv2", title: "의향 확인", desc: "[단계 설명]" },
  { lv: "Lv3", title: "구체 제안", desc: "[단계 설명]" },
];

// ── 10. 강사 소개 ────────────────────────────────────────────────────────────
const INSTRUCTOR = {
  name: "이창엽",
  alias: "Dan",
  role: "[직함]",
  tags: ["[분야1]", "[분야2]", "[분야3]"],
  career: ["[경력1]", "[경력2]", "[경력3]", "[경력4]", "[경력5]"],
  quote: "[강사 한마디]",
};

// ── 11. 케이스 스터디 안내 — 강의 범위 명시 ───────────────────────────────────
const SCOPE = {
  include: ["[다루는 내용1]", "[다루는 내용2]", "[다루는 내용3]"],
  exclude: ["[다루지 않는 내용1]", "[다루지 않는 내용2]"],
  note: "[케이스 스터디 진행 방식 안내]",
};

// ── 12. FAQ ──────────────────────────────────────────────────────────────────
const FAQS = [
  { q: "[질문1]", a: "[답변1]" },
  { q: "[질문2]", a: "[답변2]" },
  { q: "[질문3]", a: "[답변3]" },
  { q: "[질문4]", a: "[답변4]" },
];

const GX_STYLE = `
.gx1{--g:#22B573;--dark:#0A0A0A;--dark2:#0d0d0d;--cream:#FBF8EC;font-family:'Pretendard',-apple-system,BlinkMacSystemFont,system-ui,'Apple SD Gothic Neo',sans-serif;letter-spacing:-0.01em;color:#141414;background:#fff;overflow-x:hidden;word-break:keep-all;overflow-wrap:anywhere}
.gx1 *{box-sizing:border-box}
.gx1-wrap{max-width:1080px;margin:0 auto;padding:0 20px}
.gx1-narrow{max-width:820px}
.gx1-sec{padding:88px 0}
.gx1-dark{background:var(--dark);color:#fff}
.gx1-dark2{background:var(--dark2);color:#fff}
.gx1-cream{background:var(--cream);color:#141414}
.gx1-white{background:#fff;color:#141414}
.gx1-h2{font-size:32px;font-weight:800;line-height:1.4;text-align:center;margin:0 0 14px}
.gx1-lead{font-size:17px;line-height:1.7;text-align:center;margin:0 auto;max-width:640px;opacity:.75}
.gx1-badge{display:table;margin:0 auto 16px;font-size:13px;font-weight:800;color:var(--g);background:rgba(34,181,115,.12);padding:7px 16px;border-radius:50px}
@media(max-width:640px){.gx1-sec{padding:64px 0}.gx1-h2{font-size:24px}.gx1-lead{font-size:15px}}

/* fail-safe reveal — 기본 표시. 루트에 gx1-anim 이 붙은 경우에만 숨김 후 등장 */
.gx1.gx1-anim .gx1-reveal{opacity:0;transform:translateY(24px);transition:opacity .7s ease,transform .7s ease}
.gx1.gx1-anim .gx1-reveal.gx1-in{opacity:1;transform:none}
.gx1.gx1-anim .gx1-stagger>.gx1-reveal:nth-child(2){transition-delay:.08s}
.gx1.gx1-anim .gx1-stagger>.gx1-reveal:nth-child(3){transition-delay:.16s}
.gx1.gx1-anim .gx1-stagger>.gx1-reveal:nth-child(4){transition-delay:.24s}
.gx1.gx1-anim .gx1-stagger>.gx1-reveal:nth-child(5){transition-delay:.32s}
.gx1.gx1-anim .gx1-stagger>.gx1-reveal:nth-child(6){transition-delay:.4s}
.gx1.gx1-anim .gx1-stagger>.gx1-reveal:nth-child(7){transition-delay:.48s}
@media(prefers-reduced-motion:reduce){.gx1.gx1-anim .gx1-reveal{opacity:1;transform:none;transition:none}}

/* 1 히어로 */
.gx1-hero{position:relative;min-height:calc(100vh - 96px);display:flex;align-items:center;background:radial-gradient(120% 80% at 50% 0%,rgba(34,181,115,.18) 0%,rgba(10,10,10,0) 60%),var(--dark);color:#fff;text-align:center;padding:72px 0}
.gx1-hero-in{width:100%}
.gx1-hero-h1{font-size:48px;font-weight:900;line-height:1.3;margin:0 0 20px}
.gx1-hero-sub{font-size:19px;line-height:1.7;color:#cfcfcf;margin:0 auto 40px;max-width:640px}
.gx1-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;max-width:720px;margin:0 auto 32px}
.gx1-stat{background:#141414;border:1px solid #232323;border-radius:16px;padding:22px 12px}
.gx1-stat b{display:block;font-size:30px;font-weight:900;color:var(--g);line-height:1.2}
.gx1-stat span{display:block;margin-top:6px;font-size:14px;color:#aaa}
.gx1-when{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:0 0 32px}
.gx1-chip{font-size:14px;font-weight:700;color:#eee;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:50px;padding:8px 16px}
.gx1-chip em{font-style:normal;color:var(--g);margin-right:6px}
.gx1-hero-pay{display:flex;flex-wrap:wrap;justify-content:center;gap:12px}
@media(max-width:640px){.gx1-hero{min-height:0;padding:56px 0 64px}.gx1-hero-h1{font-size:30px}.gx1-hero-sub{font-size:16px}.gx1-stat{padding:16px 6px}.gx1-stat b{font-size:20px}.gx1-stat span{font-size:12px}.gx1-hero-pay{flex-direction:column}}

/* 결제 버튼 공통 — fc-class 결제 버튼 톤 (정상가 #161616 / 얼리버드 그린 + 펄스) */
.gx1-pay-btn{display:inline-flex;align-items:center;justify-content:center;min-width:220px;height:56px;padding:0 28px;border:none;border-radius:12px;background:#161616;color:#fff;font-size:16px;font-weight:800;font-family:inherit;cursor:pointer;transition:opacity .2s}
.gx1-pay-btn:hover{opacity:.9}
.gx1-pay-btn--sale{background:var(--g)}
.gx1-hero .gx1-pay-btn:not(.gx1-pay-btn--sale){background:#fff;color:#161616}
@keyframes gx1Pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
.gx1-pulse{animation:gx1Pulse 2.2s ease-in-out infinite}
@media(prefers-reduced-motion:reduce){.gx1-pulse{animation:none}}
@media(max-width:640px){.gx1-pay-btn{width:100%;min-width:0}}

/* 2 문제 제기 — 두 갈래 → 합류 */
.gx1-branches{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;margin-top:44px}
.gx1-branch{background:#151515;border:1px solid #262626;border-radius:18px;padding:28px 26px}
.gx1-branch-tag{display:inline-block;font-size:13px;font-weight:800;color:var(--g);border:1px solid rgba(34,181,115,.5);border-radius:50px;padding:5px 14px;margin-bottom:14px}
.gx1-branch h3{font-size:20px;font-weight:800;margin:0 0 14px;line-height:1.45}
.gx1-branch ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px}
.gx1-branch li{position:relative;padding-left:16px;font-size:15px;color:#bdbdbd;line-height:1.6}
.gx1-branch li::before{content:'';position:absolute;left:0;top:10px;width:6px;height:6px;border-radius:50%;background:#e23b3b}
.gx1-merge{position:relative;height:64px}
.gx1-merge::before{content:'';position:absolute;left:25%;right:25%;top:0;height:32px;border:2px solid var(--g);border-top:none;border-radius:0 0 16px 16px}
.gx1-merge::after{content:'';position:absolute;left:50%;top:32px;bottom:0;width:2px;margin-left:-1px;background:var(--g)}
.gx1-merged{max-width:680px;margin:0 auto;background:#111;border:2px solid var(--g);border-radius:20px;padding:32px 28px;text-align:center}
.gx1-merged p{margin:0;font-size:19px;font-weight:700;line-height:1.7}
@media(max-width:760px){.gx1-branches{grid-template-columns:minmax(0,1fr)}.gx1-merge{height:40px}.gx1-merge::before{display:none}.gx1-merge::after{top:0}}

/* 3 왜 그룹운동인가 — 비교 */
.gx1-compare{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;margin-top:44px}
.gx1-cmp{background:#fff;border:1px solid #ece6cf;border-radius:20px;padding:30px 26px}
.gx1-cmp--hl{border:2px solid var(--g);box-shadow:0 12px 32px rgba(34,181,115,.14)}
.gx1-cmp-head{font-size:18px;font-weight:900;margin:0 0 6px}
.gx1-cmp--hl .gx1-cmp-head{color:var(--g)}
.gx1-cmp-cap{font-size:14px;color:#888;margin:0 0 20px}
.gx1-cmp-rows{list-style:none;padding:0;margin:0}
.gx1-cmp-rows li{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:12px 0;border-top:1px solid #f0ebd8;font-size:15px}
.gx1-cmp-rows li span{color:#666}
.gx1-cmp-rows li b{font-weight:800;text-align:right}
.gx1-cmp-total{margin-top:16px;padding-top:16px;border-top:2px solid #141414;display:flex;justify-content:space-between;gap:12px;font-weight:900;font-size:17px}
.gx1-cmp--hl .gx1-cmp-total{border-top-color:var(--g)}
.gx1-cmp--hl .gx1-cmp-total b{color:var(--g)}
.gx1-conclusion{margin:28px auto 0;max-width:680px;text-align:center;font-size:18px;font-weight:700;line-height:1.7}
@media(max-width:760px){.gx1-compare{grid-template-columns:minmax(0,1fr)}}

/* 4 이런 분께 */
.gx1-checks{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:40px}
.gx1-check{display:flex;align-items:flex-start;gap:12px;background:var(--cream);border-radius:14px;padding:20px 18px;font-size:16px;font-weight:600;line-height:1.55}
.gx1-check-ic{flex:0 0 auto;width:24px;height:24px;border-radius:50%;background:var(--g);color:#fff;font-size:13px;font-weight:900;display:flex;align-items:center;justify-content:center;margin-top:1px}
@media(max-width:900px){.gx1-checks{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:560px){.gx1-checks{grid-template-columns:minmax(0,1fr)}}

/* 5 숫자 증명 */
.gx1-proof{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:44px}
.gx1-proof-card{background:#141414;border:1px solid #232323;border-radius:20px;padding:34px 20px;text-align:center}
.gx1-proof-label{font-size:15px;font-weight:700;color:#bbb;margin:0 0 12px}
.gx1-proof-num{font-size:48px;font-weight:900;color:var(--g);line-height:1.1;margin:0;font-variant-numeric:tabular-nums}
.gx1-proof-num small{font-size:20px;font-weight:800;margin-left:4px}
.gx1-proof-note{font-size:14px;color:#888;margin:14px 0 0;line-height:1.6}
.gx1-proof-foot{text-align:center;font-size:13px;color:#777;margin:22px 0 0}
@media(max-width:760px){.gx1-proof{grid-template-columns:minmax(0,1fr)}.gx1-proof-num{font-size:40px}}

/* 6·8 커리큘럼 카드 */
.gx1-parts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:44px}
.gx1-parts--3{grid-template-columns:repeat(3,minmax(0,1fr))}
.gx1-part{background:#fff;border:1px solid #ece6cf;border-radius:20px;padding:30px 26px}
.gx1-part-no{width:40px;height:40px;border-radius:12px;background:rgba(34,181,115,.12);color:var(--g);font-weight:900;font-size:17px;display:flex;align-items:center;justify-content:center;margin-bottom:16px}
.gx1-part h3{font-size:21px;font-weight:800;margin:0 0 10px;line-height:1.4}
.gx1-part p{font-size:15px;color:#555;line-height:1.7;margin:0 0 14px}
.gx1-part ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px}
.gx1-part li{position:relative;padding-left:16px;font-size:14px;color:#444;line-height:1.55}
.gx1-part li::before{content:'';position:absolute;left:0;top:8px;width:6px;height:6px;border-radius:50%;background:var(--g)}
@media(max-width:900px){.gx1-parts--3{grid-template-columns:minmax(0,1fr)}}
@media(max-width:640px){.gx1-parts{grid-template-columns:minmax(0,1fr)}}

/* 7 체험 7단계 — 모바일 세로 / PC(1024px~) 가로. 래퍼 overflow:hidden */
.gx1-tl-wrap{overflow:hidden;margin-top:48px}
.gx1-tl{list-style:none;margin:0;padding:0;position:relative}
.gx1-tl-item{position:relative;padding:0 0 26px 60px}
.gx1-tl-item:last-child{padding-bottom:0}
.gx1-tl-item::before{content:'';position:absolute;left:19px;top:42px;bottom:4px;width:2px;background:rgba(34,181,115,.4)}
.gx1-tl-item:last-child::before{display:none}
.gx1-tl-node{position:absolute;left:0;top:0;width:40px;height:40px;border-radius:50%;background:var(--g);color:#fff;font-weight:900;font-size:16px;display:flex;align-items:center;justify-content:center;z-index:1}
.gx1-tl-item:last-child .gx1-tl-node{background:#fff;color:var(--dark)}
.gx1-tl-title{font-size:18px;font-weight:800;margin:6px 0}
.gx1-tl-desc{font-size:14px;color:#aaa;line-height:1.6;margin:0}
@media(min-width:1024px){
.gx1-tl{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:12px}
.gx1-tl::before{content:'';position:absolute;left:calc(100% / 14);right:calc(100% / 14);top:20px;height:2px;background:rgba(34,181,115,.4)}
.gx1-tl-item{padding:0;text-align:center}
.gx1-tl-item::before{display:none}
.gx1-tl-node{position:relative;margin:0 auto 16px}
.gx1-tl-title{font-size:16px;margin:0 0 6px}
.gx1-tl-desc{font-size:13px}
}

/* 9 재등록 3단계 — 계단형 */
.gx1-emph{max-width:760px;margin:44px auto 28px;background:var(--dark);color:#fff;border-radius:20px;padding:30px 28px;text-align:center}
.gx1-emph p{margin:0;font-size:20px;font-weight:800;line-height:1.6}
.gx1-stairs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;align-items:end}
.gx1-stair{background:var(--cream);border:1px solid #ece6cf;border-radius:20px;padding:28px 24px;display:flex;flex-direction:column}
.gx1-stair:nth-child(1){min-height:240px}
.gx1-stair:nth-child(2){min-height:290px}
.gx1-stair:nth-child(3){min-height:340px;background:#fff;border:2px solid var(--g)}
.gx1-stair-lv{font-size:14px;font-weight:900;color:var(--g);margin:0 0 8px}
.gx1-stair h3{font-size:21px;font-weight:800;margin:0 0 12px}
.gx1-stair p{font-size:15px;color:#555;line-height:1.7;margin:0}
.gx1-stair-bar{margin-top:auto;padding-top:18px;display:flex;gap:4px}
.gx1-stair-bar span{flex:1;height:6px;border-radius:3px;background:#e6dfc4}
.gx1-stair-bar span.on{background:var(--g)}
@media(max-width:760px){.gx1-stairs{grid-template-columns:minmax(0,1fr);align-items:stretch}.gx1-stair:nth-child(n){min-height:0}.gx1-stair:nth-child(2){margin-left:14px}.gx1-stair:nth-child(3){margin-left:28px}}

/* 10 강사 소개 */
.gx1-inst{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:40px;align-items:center;margin-top:44px}
.gx1-inst-photo{aspect-ratio:4/5;width:100%;border-radius:20px;background:repeating-linear-gradient(45deg,#161616 0 14px,#1b1b1b 14px 28px);border:1px dashed #333;display:flex;align-items:center;justify-content:center;color:#666;font-size:14px;font-weight:700}
.gx1-inst-name{font-size:32px;font-weight:900;margin:0 0 6px}
.gx1-inst-name span{font-size:18px;font-weight:700;color:var(--g);margin-left:8px}
.gx1-inst-role{font-size:16px;color:#bbb;margin:0 0 20px}
.gx1-inst-tags{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 22px}
.gx1-inst-tag{font-size:13px;font-weight:700;color:var(--g);background:rgba(34,181,115,.12);border-radius:50px;padding:6px 14px}
.gx1-inst-career{list-style:none;padding:0;margin:0 0 22px;display:flex;flex-direction:column;gap:10px}
.gx1-inst-career li{position:relative;padding-left:16px;font-size:15px;color:#d0d0d0;line-height:1.55}
.gx1-inst-career li::before{content:'';position:absolute;left:0;top:9px;width:5px;height:5px;border-radius:50%;background:var(--g)}
.gx1-inst-quote{margin:0;padding:18px 20px;border-left:3px solid var(--g);background:#141414;border-radius:0 12px 12px 0;font-size:15px;color:#ddd;line-height:1.7}
@media(max-width:760px){.gx1-inst{grid-template-columns:minmax(0,1fr);gap:28px}.gx1-inst-photo{max-width:360px;margin:0 auto}.gx1-inst-name{font-size:26px}}

/* 11 케이스 스터디 안내 */
.gx1-scope{max-width:760px;margin:40px auto 0;background:#fff;border:2px dashed var(--g);border-radius:20px;padding:32px 28px}
.gx1-scope-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}
.gx1-scope h3{font-size:17px;font-weight:800;margin:0 0 12px}
.gx1-scope ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px}
.gx1-scope li{position:relative;padding-left:22px;font-size:15px;color:#444;line-height:1.55}
.gx1-scope li::before{position:absolute;left:0;top:0;font-weight:900}
.gx1-scope-in li::before{content:'✓';color:var(--g)}
.gx1-scope-out li::before{content:'✕';color:#e23b3b}
.gx1-scope-note{margin:22px 0 0;padding-top:18px;border-top:1px solid #eee;font-size:14px;color:#777;line-height:1.7}
@media(max-width:640px){.gx1-scope{padding:24px 20px}.gx1-scope-grid{grid-template-columns:minmax(0,1fr)}}

/* 12 강의 정보 + FAQ */
.gx1-info{width:100%;border-collapse:separate;border-spacing:0;margin-top:40px;background:#fff;border:1px solid #eee;border-radius:16px;overflow:hidden}
.gx1-info th,.gx1-info td{padding:18px 20px;text-align:left;font-size:16px;border-bottom:1px solid #f0f0f0;vertical-align:top}
.gx1-info tr:last-child th,.gx1-info tr:last-child td{border-bottom:none}
.gx1-info th{width:120px;background:var(--cream);font-weight:800;color:#333;white-space:nowrap}
.gx1-info td{font-weight:600;color:#141414;line-height:1.6}
.gx1-price-line{display:block}
.gx1-price-line em{font-style:normal;color:var(--g);font-weight:800;margin-right:8px}
.gx1-faq-t{font-size:22px;font-weight:800;margin:56px 0 18px;text-align:center}
.gx1-faq{display:flex;flex-direction:column;gap:10px}
.gx1-faq-item{border:1px solid #eee;border-radius:14px;background:#fff;overflow:hidden}
.gx1-faq-item summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:20px 22px;font-size:16px;font-weight:700}
.gx1-faq-item summary::-webkit-details-marker{display:none}
.gx1-faq-ic{flex:0 0 auto;font-size:24px;font-weight:400;color:var(--g);line-height:1;transition:transform .25s}
.gx1-faq-item[open] .gx1-faq-ic{transform:rotate(45deg)}
.gx1-faq-body{padding:0 22px 20px;font-size:15px;color:#555;line-height:1.75}
.gx1-faq-body p{margin:0}
@media(max-width:640px){.gx1-info th,.gx1-info td{padding:14px;font-size:14px}.gx1-info th{width:84px}}

/* 13 결제 (#contact) — fc-class 결제 카드와 동일 톤 */
#contact{scroll-margin-top:96px}
.gx1-enroll-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;max-width:680px;margin:40px auto 0}
.gx1-enroll-card{position:relative;background:#fff;border:1px solid #e6e6e6;border-radius:18px;padding:30px 24px 26px;text-align:center;color:#141414}
.gx1-enroll-card--sale{border:2px solid var(--g)}
.gx1-enroll-badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#e23b3b;color:#fff;font-size:11px;font-weight:800;padding:5px 14px;border-radius:50px;white-space:nowrap}
.gx1-enroll-tag{font-size:13px;font-weight:700;color:#888;margin:0 0 10px}
.gx1-enroll-card--sale .gx1-enroll-tag{color:var(--g)}
.gx1-enroll-price{font-size:22px;font-weight:900;color:#161616;margin:0 0 18px;line-height:1.3}
.gx1-enroll-price span{font-size:13px;color:#999;font-weight:600;margin-left:4px}
.gx1-enroll-card .gx1-pay-btn{width:100%;min-width:0}
.gx1-enroll-note{max-width:680px;margin:18px auto 0;font-size:12px;color:#9a9a9a;line-height:1.7;text-align:center}
@media(max-width:640px){.gx1-enroll-cards{grid-template-columns:minmax(0,1fr)}.gx1-enroll-price{font-size:20px}}

/* 14 하단 고정 CTA 바 — safe-area 대응 */
.gx1-bar{position:fixed;left:0;right:0;bottom:0;z-index:60;background:var(--dark2);border-top:1px solid #222;padding:12px 16px calc(12px + env(safe-area-inset-bottom));transition:transform .3s ease}
.gx1-bar.is-hidden{transform:translateY(140%)}
.gx1-bar-in{max-width:1080px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:14px}
.gx1-bar-when{min-width:0;margin:0;font-size:14px;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gx1-bar-cta{flex:0 0 auto;border:none;background:var(--g);color:#fff;font-size:15px;font-weight:800;font-family:inherit;padding:13px 26px;border-radius:12px;white-space:nowrap;cursor:pointer}
.gx1-barspacer{height:calc(76px + env(safe-area-inset-bottom));background:var(--dark)}
@media(max-width:480px){.gx1-bar-when{font-size:13px}.gx1-bar-cta{padding:12px 18px;font-size:14px}}
@media(prefers-reduced-motion:reduce){.gx1-bar{transition:none}}
`;

/** 가격이 확정된 경우에만 (VAT포함) 표기 */
function Vat({ price }: { price: unknown }) {
  return isPending(price) ? null : <span>(VAT포함)</span>;
}

export default function GxClass() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  // 숫자 증명 — null 이면 최종값 표시(기본). 섹션 진입 시 0 부터 카운트업
  const [proofCounts, setProofCounts] = useState<number[] | null>(null);
  // 하단 고정 바 — 히어로나 결제 섹션(#contact)이 화면에 보이면 숨김.
  // 본문이 아니라 히어로·폼 CTA 의 중복 진입점이라, 판정 전(첫 렌더)에는 숨겨서 히어로 위 깜빡임을 막는다.
  const [barShown, setBarShown] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;

    // 1) 스크롤 등장
    const revealIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("gx1-in");
          revealIo.unobserve(entry.target);
        });
      },
      { threshold: 0.15 },
    );
    root.classList.add("gx1-anim");
    root.querySelectorAll(".gx1-reveal").forEach((el) => revealIo.observe(el));

    // 2) 숫자 카운트업 (1회)
    let raf = 0;
    const proofIo = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        proofIo.disconnect();
        const DUR = 1400;
        let startTs = 0;
        const step = (ts: number) => {
          if (!startTs) startTs = ts;
          const p = Math.min((ts - startTs) / DUR, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          if (p < 1) {
            setProofCounts(PROOF_STATS.map((s) => Math.round(s.target * eased)));
            raf = requestAnimationFrame(step);
          } else {
            setProofCounts(null); // 끝나면 최종값 표기로 복귀
          }
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    const proofEl = root.querySelector("#gx1-proof");
    if (proofEl) proofIo.observe(proofEl);

    // 3) 하단 고정 바 — 히어로·폼 중 하나라도 보이면 숨김
    const onScreen = new Set<Element>();
    const barIo = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) onScreen.add(e.target);
        else onScreen.delete(e.target);
      });
      setBarShown(onScreen.size === 0);
    });
    const heroEl = root.querySelector("#gx1-hero");
    const contactEl = root.querySelector("#contact");
    if (heroEl) barIo.observe(heroEl);
    if (contactEl) barIo.observe(contactEl);

    return () => {
      revealIo.disconnect();
      proofIo.disconnect();
      barIo.disconnect();
      if (raf) cancelAnimationFrame(raf);
      root.classList.remove("gx1-anim");
    };
  }, []);

  // 결제 → 체크아웃 (fc-class 와 동일)
  const goCheckout = (product: string) => {
    router.push(`/checkout?product=${product}`);
  };

  return (
    <div ref={rootRef} className="gx1">
      <style dangerouslySetInnerHTML={{ __html: GX_STYLE }} />

      {/* ── 1. 히어로 ── */}
      <section className="gx1-hero" id="gx1-hero">
        <div className="gx1-wrap gx1-hero-in">
          <h1 className="gx1-hero-h1">[헤드라인]</h1>
          <p className="gx1-hero-sub">[서브카피]</p>
          <div className="gx1-stats">
            {HERO_STATS.map((s, i) => (
              <div key={i} className="gx1-stat">
                <b>{s.value}</b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
          <div className="gx1-when">
            <span className="gx1-chip">
              <em>일시</em>
              {SCHEDULE}
            </span>
            <span className="gx1-chip">
              <em>장소</em>
              {CLASS_PLACE}
            </span>
          </div>
          <div className="gx1-hero-pay">
            <button
              type="button"
              className="gx1-pay-btn"
              onClick={() => goCheckout(PRODUCT_NORMAL)}
            >
              [정상가 결제 버튼]
            </button>
            <button
              type="button"
              className="gx1-pay-btn gx1-pay-btn--sale gx1-pulse"
              onClick={() => goCheckout(PRODUCT_EARLY)}
            >
              [얼리버드 결제 버튼]
            </button>
          </div>
        </div>
      </section>

      {/* ── 2. 문제 제기 ── */}
      <section className="gx1-sec gx1-dark2">
        <div className="gx1-wrap">
          <h2 className="gx1-h2 gx1-reveal">[문제 제기 헤드라인]</h2>
          <p className="gx1-lead gx1-reveal">[서브카피]</p>
          <div className="gx1-branches gx1-stagger">
            {BRANCHES.map((b, i) => (
              <div key={i} className="gx1-branch gx1-reveal">
                <span className="gx1-branch-tag">{b.tag}</span>
                <h3>{b.title}</h3>
                <ul>
                  {b.items.map((it, j) => (
                    <li key={j}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="gx1-merge" aria-hidden="true" />
          <div className="gx1-merged gx1-reveal">
            <p>[합류 메시지]</p>
          </div>
        </div>
      </section>

      {/* ── 3. 왜 그룹운동인가 ── */}
      <section className="gx1-sec gx1-cream">
        <div className="gx1-wrap">
          <h2 className="gx1-h2 gx1-reveal">[왜 그룹운동인가 헤드라인]</h2>
          <p className="gx1-lead gx1-reveal">[서브카피]</p>
          <div className="gx1-compare gx1-stagger">
            {COMPARE_COLS.map((col) => (
              <div
                key={col.key}
                className={`gx1-cmp gx1-reveal${col.highlight ? " gx1-cmp--hl" : ""}`}
              >
                <p className="gx1-cmp-head">{col.head}</p>
                <p className="gx1-cmp-cap">{col.cap}</p>
                <ul className="gx1-cmp-rows">
                  {COMPARE_ROWS.map((row, j) => (
                    <li key={j}>
                      <span>{row}</span>
                      <b>{col.values[j]}</b>
                    </li>
                  ))}
                </ul>
                <div className="gx1-cmp-total">
                  <span>{col.totalLabel}</span>
                  <b>{col.total}</b>
                </div>
              </div>
            ))}
          </div>
          <p className="gx1-conclusion gx1-reveal">[비교 결론 문구]</p>
        </div>
      </section>

      {/* ── 4. 이런 분께 ── */}
      <section className="gx1-sec gx1-white">
        <div className="gx1-wrap">
          <h2 className="gx1-h2 gx1-reveal">[이런 분께 헤드라인]</h2>
          <p className="gx1-lead gx1-reveal">[서브카피]</p>
          <div className="gx1-checks gx1-stagger">
            {CHECKLIST.map((c, i) => (
              <div key={i} className="gx1-check gx1-reveal">
                <span className="gx1-check-ic" aria-hidden="true">
                  ✓
                </span>
                {c}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. 숫자 증명 ── */}
      <section className="gx1-sec gx1-dark" id="gx1-proof">
        <div className="gx1-wrap">
          <h2 className="gx1-h2 gx1-reveal">[숫자 증명 헤드라인]</h2>
          <p className="gx1-lead gx1-reveal">[서브카피]</p>
          <div className="gx1-proof gx1-stagger">
            {PROOF_STATS.map((s, i) => (
              <div key={i} className="gx1-proof-card gx1-reveal">
                <p className="gx1-proof-label">{s.label}</p>
                <p className="gx1-proof-num">
                  {(proofCounts?.[i] ?? s.target).toLocaleString("ko-KR")}
                  <small>{s.suffix}</small>
                </p>
                <p className="gx1-proof-note">{s.note}</p>
              </div>
            ))}
          </div>
          <p className="gx1-proof-foot gx1-reveal">[수치 기준·출처 표기]</p>
        </div>
      </section>

      {/* ── 6. 커리큘럼 1부 ── */}
      <section className="gx1-sec gx1-cream">
        <div className="gx1-wrap">
          <span className="gx1-badge gx1-reveal">커리큘럼 1부</span>
          <h2 className="gx1-h2 gx1-reveal">[커리큘럼 1부 헤드라인]</h2>
          <p className="gx1-lead gx1-reveal">[서브카피]</p>
          <div className="gx1-parts gx1-stagger">
            {PART1.map((p, i) => (
              <div key={p.title} className="gx1-part gx1-reveal">
                <div className="gx1-part-no">{i + 1}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <ul>
                  {p.points.map((pt, j) => (
                    <li key={j}>{pt}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. 체험 7단계 프로세스 ── */}
      <section className="gx1-sec gx1-dark2">
        <div className="gx1-wrap">
          <h2 className="gx1-h2 gx1-reveal">[체험 7단계 헤드라인]</h2>
          <p className="gx1-lead gx1-reveal">[서브카피]</p>
          <div className="gx1-tl-wrap">
            <ol className="gx1-tl gx1-stagger">
              {TRIAL_STEPS.map((step, i) => (
                <li key={step} className="gx1-tl-item gx1-reveal">
                  <span className="gx1-tl-node">{i + 1}</span>
                  <p className="gx1-tl-title">{step}</p>
                  <p className="gx1-tl-desc">[단계 설명]</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── 8. 커리큘럼 2부 ── */}
      <section className="gx1-sec gx1-cream">
        <div className="gx1-wrap">
          <span className="gx1-badge gx1-reveal">커리큘럼 2부</span>
          <h2 className="gx1-h2 gx1-reveal">[커리큘럼 2부 헤드라인]</h2>
          <p className="gx1-lead gx1-reveal">[서브카피]</p>
          <div className="gx1-parts gx1-parts--3 gx1-stagger">
            {PART2.map((p, i) => (
              <div key={p.title} className="gx1-part gx1-reveal">
                <div className="gx1-part-no">{i + 1}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <ul>
                  {p.points.map((pt, j) => (
                    <li key={j}>{pt}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. 재등록 3단계 ── */}
      <section className="gx1-sec gx1-white">
        <div className="gx1-wrap">
          <h2 className="gx1-h2 gx1-reveal">[재등록 3단계 헤드라인]</h2>
          <p className="gx1-lead gx1-reveal">[서브카피]</p>
          <div className="gx1-emph gx1-reveal">
            <p>[강조 문구]</p>
          </div>
          <div className="gx1-stairs gx1-stagger">
            {REREG_LEVELS.map((lv, i) => (
              <div key={lv.lv} className="gx1-stair gx1-reveal">
                <p className="gx1-stair-lv">{lv.lv}</p>
                <h3>{lv.title}</h3>
                <p>{lv.desc}</p>
                <div className="gx1-stair-bar" aria-hidden="true">
                  {REREG_LEVELS.map((_, k) => (
                    <span key={k} className={k <= i ? "on" : undefined} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. 강사 소개 ── */}
      <section className="gx1-sec gx1-dark">
        <div className="gx1-wrap">
          <h2 className="gx1-h2 gx1-reveal">[강사 소개 헤드라인]</h2>
          <div className="gx1-inst">
            <div className="gx1-inst-photo gx1-reveal" role="img" aria-label="이창엽 강사 사진 자리">
              [강사 사진]
            </div>
            <div className="gx1-reveal">
              <p className="gx1-inst-name">
                {INSTRUCTOR.name}
                <span>{INSTRUCTOR.alias}</span>
              </p>
              <p className="gx1-inst-role">{INSTRUCTOR.role}</p>
              <div className="gx1-inst-tags">
                {INSTRUCTOR.tags.map((t, i) => (
                  <span key={i} className="gx1-inst-tag">
                    {t}
                  </span>
                ))}
              </div>
              <ul className="gx1-inst-career">
                {INSTRUCTOR.career.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
              <p className="gx1-inst-quote">{INSTRUCTOR.quote}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 11. 케이스 스터디 안내 ── */}
      <section className="gx1-sec gx1-cream">
        <div className="gx1-wrap gx1-narrow">
          <h2 className="gx1-h2 gx1-reveal">[케이스 스터디 안내 헤드라인]</h2>
          <p className="gx1-lead gx1-reveal">[서브카피]</p>
          <div className="gx1-scope gx1-reveal">
            <div className="gx1-scope-grid">
              <div className="gx1-scope-in">
                <h3>[포함 범위 제목]</h3>
                <ul>
                  {SCOPE.include.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="gx1-scope-out">
                <h3>[제외 범위 제목]</h3>
                <ul>
                  {SCOPE.exclude.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="gx1-scope-note">{SCOPE.note}</p>
          </div>
        </div>
      </section>

      {/* ── 12. 강의 정보 + FAQ ── */}
      <section className="gx1-sec gx1-white">
        <div className="gx1-wrap gx1-narrow">
          <h2 className="gx1-h2 gx1-reveal">[강의 정보 헤드라인]</h2>
          <table className="gx1-info gx1-reveal">
            <tbody>
              <tr>
                <th scope="row">일시</th>
                <td>{SCHEDULE}</td>
              </tr>
              <tr>
                <th scope="row">장소</th>
                <td>{CLASS_PLACE}</td>
              </tr>
              <tr>
                <th scope="row">정원</th>
                <td>{formatCapacity(CAPACITY)}</td>
              </tr>
              <tr>
                <th scope="row">가격</th>
                <td>
                  <span className="gx1-price-line">
                    <em>정상가</em>
                    {formatPrice(PRICE_NORMAL)}
                  </span>
                  <span className="gx1-price-line">
                    <em>얼리버드</em>
                    {formatEarlybird(PRICE_EARLYBIRD, EARLYBIRD_UNTIL)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <h3 className="gx1-faq-t gx1-reveal">[FAQ 제목]</h3>
          {/* <details> 네이티브 아코디언 — 스크립트·리스너 없이 동작 */}
          <div className="gx1-faq">
            {FAQS.map((f, i) => (
              <details key={i} className="gx1-faq-item gx1-reveal">
                <summary>
                  <span>{f.q}</span>
                  <span className="gx1-faq-ic" aria-hidden="true">
                    +
                  </span>
                </summary>
                <div className="gx1-faq-body">
                  <p>{f.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 13. 결제 (#contact) — 강의정보 바로 아래.
          기존 CTA·외부 링크의 #contact 앵커가 이 섹션을 가리킨다. ── */}
      <section className="gx1-sec gx1-dark" id="contact">
        <div className="gx1-wrap">
          <h2 className="gx1-h2 gx1-reveal">[결제 섹션 헤드라인]</h2>
          <p className="gx1-lead gx1-reveal">[서브카피]</p>
          <div className="gx1-enroll-cards gx1-stagger">
            <div className="gx1-enroll-card gx1-reveal">
              <p className="gx1-enroll-tag">정상가</p>
              <p className="gx1-enroll-price">
                {formatPrice(PRICE_NORMAL)}
                <Vat price={PRICE_NORMAL} />
              </p>
              <button
                type="button"
                className="gx1-pay-btn"
                onClick={() => goCheckout(PRODUCT_NORMAL)}
              >
                [정상가 결제 버튼]
              </button>
            </div>
            <div className="gx1-enroll-card gx1-enroll-card--sale gx1-reveal">
              <span className="gx1-enroll-badge">[할인 배지]</span>
              <p className="gx1-enroll-tag">얼리버드</p>
              <p className="gx1-enroll-price">
                {formatEarlybird(PRICE_EARLYBIRD, EARLYBIRD_UNTIL)}
                <Vat price={PRICE_EARLYBIRD} />
              </p>
              <button
                type="button"
                className="gx1-pay-btn gx1-pay-btn--sale gx1-pulse"
                onClick={() => goCheckout(PRODUCT_EARLY)}
              >
                [얼리버드 결제 버튼]
              </button>
            </div>
          </div>
          <p className="gx1-enroll-note gx1-reveal">[환불 규정 안내]</p>
        </div>
      </section>

      {/* ── 14. 하단 고정 CTA 바 ── */}
      <div className={`gx1-bar${barShown ? "" : " is-hidden"}`} inert={!barShown}>
        <div className="gx1-bar-in">
          <p className="gx1-bar-when">{SCHEDULE}</p>
          <button
            type="button"
            className="gx1-bar-cta"
            onClick={() => goCheckout(PRODUCT_EARLY)}
          >
            [얼리버드 결제 버튼]
          </button>
        </div>
      </div>
      <div className="gx1-barspacer" aria-hidden="true" />
    </div>
  );
}
