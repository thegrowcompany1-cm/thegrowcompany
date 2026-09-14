"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 그룹운동 비즈니스 클래스 — 상품상세형 설득 페이지 (/edu/gx-class)
//  · 16섹션 계단식 흐름: 각 섹션이 하나의 주장을 던지고 다음 섹션이 받아 답한다.
//    고객 대사(2) → 진짜 원인(3) → 손실 확대(4) → 왜 못 하는가(5, 승부처)
//    → 관점 전환(6) → 해답(7) → 증거(8·9) → 커리큘럼(10~13)
//    → 커뮤니티(14) → 희소성(15) → 클로징·결제(16)
//  · 주입 HTML 없이 전부 React 렌더 · 클래스 접두사 gx1-
//  · 날짜·가격·정원·장소는 lib/gxClass.ts 상수만 수정 (현재 "미정")
//  · 애니메이션 fail-safe: 기본은 전부 표시. 이펙트가 루트에 gx1-anim 을 붙인 뒤에만
//    숨김 → 등장. 스크립트가 안 돌면 모든 섹션이 보인 상태로 남는다.
//  · IntersectionObserver / rAF 는 언마운트 시 전부 정리, 전역 함수 없음
//  · 결제 버튼(히어로 · 16 클로징 #contact · 하단 고정 바) → /checkout (fc-class 와 동일)
//  · 카피 규칙: 물음표 금지(의문형 훅은 단정형) · 컨설팅→솔루션 · 컨설턴트→멘토
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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
  formatDeadline,
  formatEarlybird,
  formatPrice,
  formatSchedule,
  isPending,
} from "@/lib/gxClass";

const CLASS_NAME = "그룹운동 비즈니스 클래스";

// 결제 상품 슬러그 — Supabase products 테이블의 slug(is_active=true)와 일치해야 결제창이 뜬다
const PRODUCT_NORMAL = "gx-class";
const PRODUCT_EARLY = "gx-class-early";

const SCHEDULE = formatSchedule(CLASS_DATE, CLASS_TIME);

const IMG_DIR = "/edu/gx-class";
const IMAGES = {
  instructor: `${IMG_DIR}/gx-instructor-profile.png`,
  lecture1: `${IMG_DIR}/gx-lecture-01.jpg`,
  lecture2: `${IMG_DIR}/gx-lecture-02.jpg`,
  community: `${IMG_DIR}/gx-community-group.jpg`,
  proofNew: `${IMG_DIR}/gx-proof-new.png`,
  proofRejoin: `${IMG_DIR}/gx-proof-rejoin.png`,
};

// ── 1. 히어로 ────────────────────────────────────────────────────────────────
const HERO_STATS = [
  { value: "48.4%", label: "전환율" },
  { value: "3,500만 원", label: "1개 지점 월 평균" },
  { value: "63%", label: "재등록률" },
];

// ── 2. 고객 대사 ─────────────────────────────────────────────────────────────
const VOICES = [
  "체험은 오는데 등록으로 이어지지 않습니다",
  "회원은 들어오는데 3개월을 못 넘깁니다",
  "재등록이 직원에 따라 달라집니다",
  "매달 신규 모집부터 다시 시작합니다",
  "광고비는 오르는데 매출은 제자리입니다",
];

// ── 4. 신규 의존 악순환 — 시계방향 (위 → 오른쪽 → 아래 → 왼쪽) ──────────────
// 노드 좌표는 정사각 컨테이너 기준 %, 호는 viewBox 400 · 반지름 150 · 노드 앞뒤 24° 여백
const CYCLE_NODES = [
  { label: "광고", left: "50%", top: "12.5%", loss: false },
  { label: "신규", left: "87.5%", top: "50%", loss: false },
  { label: "매출", left: "50%", top: "87.5%", loss: false },
  { label: "이탈", left: "12.5%", top: "50%", loss: true },
];
const CYCLE_ARCS = [
  { d: "M261 63 A150 150 0 0 1 337 139", loss: false },
  { d: "M337 261 A150 150 0 0 1 261 337", loss: false },
  { d: "M139 337 A150 150 0 0 1 63 261", loss: false },
  { d: "M63 139 A150 150 0 0 1 139 63", loss: true }, // 이탈 → 다시 광고
];

// ── 5. 왜 다들 못 하는가 ─────────────────────────────────────────────────────
const COMMON_EDU = ["수업", "프로그램", "세일즈 스킬"];

// ── 6. 관점 전환 — 4요소 ─────────────────────────────────────────────────────
const ELEMENTS = [
  { en: "PROGRAM", ko: "프로그램" },
  { en: "EXPERIENCE", ko: "고객 경험" },
  { en: "COACH", ko: "코치" },
  { en: "COMMUNITY", ko: "커뮤니티" },
];

// ── 7. 해답 — 3축 (각 축을 다루는 커리큘럼 파트로 연결) ──────────────────────
const AXES = [
  { title: "신규 전환", part: "커리큘럼 1부" },
  { title: "재등록", part: "커리큘럼 2부" },
  { title: "운영 루틴", part: "커리큘럼 2부" },
];

// ── 8. 증거 — 카운트업 target 은 실측값 ──────────────────────────────────────
const PROOF_STATS = [
  {
    label: "신규 전환율",
    prefix: "",
    target: 48.4,
    decimals: 1,
    suffix: "%",
    basis: "체험 667명 중 323명 등록 · 2026년 1~7월",
  },
  {
    label: "1개 지점 월 평균 매출",
    prefix: "",
    target: 3500,
    decimals: 0,
    suffix: "만 원",
    basis: "1개 지점 기준 · 2026년 1~7월",
  },
  {
    label: "재등록률",
    prefix: "28% →",
    target: 63,
    decimals: 0,
    suffix: "%",
    basis: "재등록 3단계 도입 전후",
  },
];
const PROOF_SHOTS = [
  {
    src: IMAGES.proofNew,
    alt: "CRM 신규 등록 기록 캡처 (회원 이름 가림)",
    caption: "CRM 등록 기록 · 신규",
  },
  {
    src: IMAGES.proofRejoin,
    alt: "CRM 재등록 기록 캡처 (회원 이름 가림)",
    caption: "CRM 등록 기록 · 재등록",
  },
];

// ── 9. 강사 서사 ─────────────────────────────────────────────────────────────
const INSTRUCTOR = {
  name: "이창엽",
  alias: "댄",
  role: "주식회사 팀피에이치세븐 · FIST X 대표",
};
const STORY = [
  "왜소했던 과거에서 시작했습니다.",
  "크로스핏으로 체력은 얻었지만, 체형은 바뀌지 않았습니다.",
  "웨이트와 결합해 BST를 개발했습니다.",
  "FIST X 직영 2개 지점을 운영합니다.",
];
const CAREER = [
  "크로스핏 10년",
  "코치 8년",
  "2019 Asia Fittest Team Challenge 2위",
  "TwoFIT 5개 지점 총괄",
  "세일즈·코칭 매뉴얼 직접 제작",
];
const QUOTE = "고객은 팔리는 건 싫어하지만, 리드받고 관계 맺는 건 원합니다.";

// ── 10·11·12·13 커리큘럼 — 항목 제목은 확정값, 설명만 플레이스홀더 ─────────────
const CIRCLED = ["①", "②", "③", "④"];
const PART1 = [
  { title: "마인드셋", sub: "" },
  { title: "자세 — 리관차", sub: "리드 × 관계 × 차별화된 고객 경험" },
  { title: "고객이 들어온 순간부터 클로징까지 7단계", sub: "" },
  { title: "이탈 고객 재접근 루틴", sub: "" },
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
  { title: "단계마다 다른 잔류 이유", sub: "" },
  { title: "생각의 전환", sub: "" },
  { title: "재등록 3단계", sub: "" },
];
const REREG_LEVELS = [
  { lv: "Lv1", title: "관계 확인" },
  { lv: "Lv2", title: "의향 확인" },
  { lv: "Lv3", title: "구체 제안" },
];

// ── 16. FAQ ──────────────────────────────────────────────────────────────────
const FAQS = [
  { q: "[질문1]", a: "[답변1]" },
  { q: "[질문2]", a: "[답변2]" },
  { q: "[질문3]", a: "[답변3]" },
  { q: "[질문4]", a: "[답변4]" },
];

/** 카운트업 숫자 표기 — 소수 자릿수 고정 + 천 단위 콤마 */
const fmtNum = (n: number, decimals: number) =>
  n.toLocaleString("ko-KR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

/** 가격이 확정된 경우에만 (VAT포함) 표기 */
function Vat({ price }: { price: unknown }) {
  return isPending(price) ? null : <span>(VAT포함)</span>;
}

/**
 * 하이드레이션 전에 이미 로드·실패가 끝난 이미지도 상태를 반영한다.
 * (ref 콜백은 커밋 시점에 실행 — 렌더 중 ref 접근·이펙트 setState 없이 DOM 클래스만 토글)
 */
function markImage(img: HTMLImageElement | null) {
  if (!img || !img.complete) return;
  img.parentElement?.classList.add(
    img.naturalWidth > 0 ? "is-loaded" : "is-broken",
  );
}

/**
 * next/image + 파일 누락 대비.
 * 부모(.gx1-media)가 크기를 고정하고 이미지는 fill 로 채운다 → 파일이 없어도 박스 크기는 그대로.
 * 로드되면 플레이스홀더를 걷고, 실패하면 깨진 이미지를 숨기고 플레이스홀더를 남긴다.
 */
function GxImg({
  src,
  alt,
  sizes,
  position = "center",
}: {
  src: string;
  alt: string;
  sizes: string;
  position?: string;
}) {
  return (
    <>
      <span className="gx1-img-ph" aria-hidden="true">
        이미지 준비 중
      </span>
      <Image
        ref={markImage}
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        style={{ objectFit: "cover", objectPosition: position }}
        onLoad={(e) =>
          e.currentTarget.parentElement?.classList.add("is-loaded")
        }
        onError={(e) =>
          e.currentTarget.parentElement?.classList.add("is-broken")
        }
      />
    </>
  );
}

const GX_STYLE = `
.gx1{--g:#22B573;--dark:#0A0A0A;--dark2:#0d0d0d;--cream:#FBF8EC;font-family:'Pretendard',-apple-system,BlinkMacSystemFont,system-ui,'Apple SD Gothic Neo',sans-serif;letter-spacing:-0.01em;color:#141414;background:#fff;overflow-x:hidden;word-break:keep-all;overflow-wrap:anywhere}
.gx1 *{box-sizing:border-box}
.gx1-wrap{max-width:1080px;margin:0 auto;padding:0 20px}
.gx1-narrow{max-width:820px}
.gx1-sec{padding:96px 0}
.gx1-dark{background:var(--dark);color:#fff}
.gx1-dark2{background:var(--dark2);color:#fff}
.gx1-cream{background:var(--cream);color:#141414}
.gx1-white{background:#fff;color:#141414}
.gx1-kicker{display:table;margin:0 auto 16px;font-size:13px;font-weight:800;color:var(--g);background:rgba(34,181,115,.12);padding:7px 16px;border-radius:50px}
.gx1-h2{font-size:34px;font-weight:800;line-height:1.4;text-align:center;margin:0 0 16px}
.gx1-h2 em{font-style:normal;color:var(--g)}
.gx1-h2--xl{font-size:42px;font-weight:900}
.gx1-lead{font-size:17px;line-height:1.75;text-align:center;margin:0 auto;max-width:640px;opacity:.72}
@media(max-width:640px){.gx1-sec{padding:68px 0}.gx1-h2{font-size:25px}.gx1-h2--xl{font-size:28px}.gx1-lead{font-size:15px}}

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

/* 이미지 박스 — 크기는 박스가 고정, 파일 누락 시 플레이스홀더 */
.gx1-media{position:relative;overflow:hidden}
.gx1-img-ph{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:12px;text-align:center;font-size:13px;font-weight:700;color:#8a8a8a;background:repeating-linear-gradient(45deg,rgba(128,128,128,.08) 0 12px,rgba(128,128,128,.15) 12px 24px)}
.gx1-media.is-loaded .gx1-img-ph{display:none}
.gx1-media.is-broken img{visibility:hidden}

/* 결제 버튼 공통 — fc-class 결제 버튼 톤 (정상가 #161616 / 얼리버드 그린 + 펄스) */
.gx1-pay-btn{display:inline-flex;align-items:center;justify-content:center;min-width:220px;height:56px;padding:0 28px;border:none;border-radius:12px;background:#161616;color:#fff;font-size:16px;font-weight:800;font-family:inherit;cursor:pointer;transition:opacity .2s}
.gx1-pay-btn:hover{opacity:.9}
.gx1-pay-btn--sale{background:var(--g)}
@keyframes gx1Pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
.gx1-pulse{animation:gx1Pulse 2.2s ease-in-out infinite}
@media(prefers-reduced-motion:reduce){.gx1-pulse{animation:none}}
@media(max-width:640px){.gx1-pay-btn{width:100%;min-width:0}}

/* 1 히어로 */
.gx1-hero{position:relative;min-height:calc(100vh - 96px);display:flex;align-items:center;background:radial-gradient(120% 80% at 50% 0%,rgba(34,181,115,.2) 0%,rgba(10,10,10,0) 60%),var(--dark);color:#fff;text-align:center;padding:72px 0}
.gx1-hero-in{width:100%}
.gx1-hero-h1{font-size:52px;font-weight:900;line-height:1.3;margin:0 0 18px}
.gx1-hero-sub{font-size:19px;line-height:1.7;color:#cfcfcf;margin:0 auto 40px;max-width:640px}
.gx1-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;max-width:760px;margin:0 auto 32px}
.gx1-stat{background:#141414;border:1px solid #232323;border-radius:16px;padding:22px 12px}
.gx1-stat b{display:block;font-size:32px;font-weight:900;color:var(--g);line-height:1.2}
.gx1-stat span{display:block;margin-top:6px;font-size:14px;color:#aaa}
.gx1-when{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:0 0 32px}
.gx1-chip{font-size:14px;font-weight:700;color:#eee;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:50px;padding:8px 16px}
.gx1-chip em{font-style:normal;color:var(--g);margin-right:6px}
.gx1-hero-pay{display:flex;flex-wrap:wrap;justify-content:center;gap:12px}
.gx1-hero .gx1-pay-btn:not(.gx1-pay-btn--sale){background:#fff;color:#161616}
@media(max-width:640px){.gx1-hero{min-height:0;padding:56px 0 64px}.gx1-hero-h1{font-size:31px}.gx1-hero-sub{font-size:16px}.gx1-stat{padding:16px 6px}.gx1-stat b{font-size:20px}.gx1-stat span{font-size:12px}.gx1-hero-pay{flex-direction:column}}
@media(max-width:400px){.gx1-stat b{font-size:17px}}

/* 2 고객 대사 — 말풍선 세로 스택 */
.gx1-voices{list-style:none;padding:0;margin:44px auto 0;max-width:660px;display:flex;flex-direction:column;gap:14px}
.gx1-voice{position:relative;max-width:88%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:22px;padding:18px 22px;font-size:17px;font-weight:600;line-height:1.55;color:#eee}
.gx1-voice::before{content:'“';color:var(--g);font-weight:900;margin-right:6px}
.gx1-voice:nth-child(odd){align-self:flex-start;border-bottom-left-radius:6px}
.gx1-voice:nth-child(even){align-self:flex-end;border-bottom-right-radius:6px;background:#132019;border-color:#1f3a2c}
@media(max-width:640px){.gx1-voice{max-width:94%;font-size:15px;padding:15px 18px}}

/* 3 진짜 원인 */
.gx1-cause{max-width:860px;text-align:center}
.gx1-cause-line{display:block;width:64px;height:4px;border-radius:2px;background:var(--g);margin:0 auto 32px}
.gx1-cause-quote{font-size:42px;font-weight:900;line-height:1.45;margin:0 0 24px;color:#141414}
.gx1-cause-quote em{font-style:normal;color:var(--g)}
@media(max-width:640px){.gx1-cause-quote{font-size:26px}}

/* 4 신규 의존 악순환 */
.gx1-cycle{position:relative;width:100%;max-width:440px;aspect-ratio:1/1;margin:48px auto 0}
.gx1-cycle svg{position:absolute;inset:0;width:100%;height:100%}
.gx1-cycle-node{position:absolute;width:23%;aspect-ratio:1/1;transform:translate(-50%,-50%);border-radius:50%;background:#151515;border:2px solid var(--g);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:#fff}
.gx1-cycle-node--loss{border-color:#e23b3b;color:#ff8a8a}
.gx1-cycle-again{position:absolute;left:17%;top:17%;transform:translate(-50%,-50%);font-size:13px;font-weight:800;color:#ff8a8a;white-space:nowrap}
.gx1-cycle-center{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:44%;text-align:center}
.gx1-cycle-center b{display:block;font-size:19px;font-weight:900;line-height:1.4}
.gx1-cycle-center span{display:block;margin-top:6px;font-size:13px;color:#999}
@media(max-width:640px){.gx1-cycle-node{font-size:14px}.gx1-cycle-center b{font-size:15px}.gx1-cycle-center span{font-size:12px}.gx1-cycle-again{font-size:11px}}

/* 5 왜 다들 못 하는가 — 대비 카드 */
.gx1-vs{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:18px;align-items:stretch;margin-top:48px}
.gx1-vs-card{border-radius:22px;padding:32px 28px}
.gx1-vs-card--common{background:#fff;border:1px solid #e8e2cc}
.gx1-vs-card--need{background:var(--dark);color:#fff;border:2px solid var(--g);box-shadow:0 18px 40px rgba(34,181,115,.18)}
.gx1-vs-tag{display:inline-block;font-size:13px;font-weight:800;padding:6px 14px;border-radius:50px;margin-bottom:18px}
.gx1-vs-card--common .gx1-vs-tag{background:#f1efe6;color:#777}
.gx1-vs-card--need .gx1-vs-tag{background:rgba(34,181,115,.16);color:var(--g)}
.gx1-vs-list{list-style:none;padding:0;margin:0 0 18px;display:flex;flex-wrap:wrap;gap:8px}
.gx1-vs-list li{font-size:16px;font-weight:700;color:#555;background:#f6f4ec;border-radius:10px;padding:10px 14px}
.gx1-vs-main{font-size:28px;font-weight:900;line-height:1.35;margin:0 0 14px}
.gx1-vs-main em{font-style:normal;color:var(--g)}
.gx1-vs-note{font-size:15px;line-height:1.7;margin:0;opacity:.7}
.gx1-vs-arrow{align-self:center;width:48px;height:48px;border-radius:50%;background:var(--g);color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900}
@media(max-width:760px){.gx1-vs{grid-template-columns:minmax(0,1fr)}.gx1-vs-arrow{justify-self:center;transform:rotate(90deg)}.gx1-vs-main{font-size:24px}}

/* 6 관점 전환 — 4요소 */
.gx1-elems{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:28px;margin-top:48px}
.gx1-elem{position:relative;background:var(--cream);border-radius:20px;padding:28px 16px;text-align:center}
.gx1-elem-en{display:block;font-size:14px;font-weight:900;letter-spacing:.05em;color:var(--g);margin-bottom:6px}
.gx1-elem-ko{display:block;font-size:20px;font-weight:800;margin-bottom:10px}
.gx1-elem p{margin:0;font-size:14px;color:#666;line-height:1.65}
.gx1-elem+.gx1-elem::before{content:'×';position:absolute;left:-14px;top:50%;transform:translate(-50%,-50%);font-size:22px;font-weight:900;color:#bdbdbd}
@media(max-width:900px){.gx1-elems{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.gx1-elem+.gx1-elem::before{display:none}}

/* 7 해답 — 3축 */
.gx1-axes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px;margin-top:48px}
.gx1-axis{position:relative;background:#151515;border:1px solid #262626;border-radius:22px;padding:32px 22px;text-align:center}
.gx1-axis-no{width:48px;height:48px;border-radius:50%;background:var(--g);color:#fff;font-weight:900;font-size:19px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
.gx1-axis h3{font-size:23px;font-weight:900;margin:0 0 10px}
.gx1-axis-part{display:inline-block;font-size:12px;font-weight:800;color:var(--g);border:1px solid rgba(34,181,115,.5);border-radius:50px;padding:4px 12px;margin-bottom:14px}
.gx1-axis p{margin:0;font-size:15px;color:#aaa;line-height:1.7}
.gx1-axis+.gx1-axis::before{content:'×';position:absolute;left:-14px;top:50%;transform:translate(-50%,-50%);font-size:24px;font-weight:900;color:var(--g)}
@media(max-width:760px){.gx1-axes{grid-template-columns:minmax(0,1fr);gap:30px}.gx1-axis+.gx1-axis::before{left:50%;top:-15px}}

/* 8 증거 */
.gx1-proof{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:48px}
.gx1-proof-card{background:#141414;border:1px solid #232323;border-radius:20px;padding:34px 20px 26px;text-align:center}
.gx1-proof-label{font-size:15px;font-weight:700;color:#bbb;margin:0 0 12px}
.gx1-proof-num{font-size:46px;font-weight:900;color:var(--g);line-height:1.15;margin:0;font-variant-numeric:tabular-nums;white-space:nowrap}
.gx1-proof-num small{font-size:19px;font-weight:800;margin-left:3px}
.gx1-proof-pre{font-size:22px;font-weight:800;color:#7a7a7a;margin-right:8px}
.gx1-proof-basis{font-size:13px;color:#8a8a8a;margin:16px 0 0;padding-top:14px;border-top:1px solid #232323;line-height:1.6}
.gx1-thumbs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;max-width:560px;margin:28px auto 0}
.gx1-thumb{margin:0}
.gx1-thumb-box{aspect-ratio:4/3;border-radius:14px;background:#fff;border:1px solid #2a2a2a}
.gx1-thumb figcaption{margin-top:8px;font-size:13px;color:#999;text-align:center}
@media(max-width:900px){.gx1-proof{grid-template-columns:minmax(0,1fr)}}
@media(max-width:640px){.gx1-proof-num{font-size:40px}}

/* 9 강사 서사 */
.gx1-inst{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:48px;align-items:start;margin-top:48px}
.gx1-inst-photo{aspect-ratio:4/5;border-radius:22px;background:#f1f1f1;border:1px solid #eee}
.gx1-inst-name{font-size:34px;font-weight:900;margin:0 0 6px}
.gx1-inst-name span{font-size:20px;font-weight:700;color:var(--g);margin-left:8px}
.gx1-inst-role{font-size:16px;color:#666;margin:0 0 28px}
.gx1-story{list-style:none;padding:0;margin:0 0 28px}
.gx1-story li{position:relative;padding:0 0 18px 30px;font-size:16px;line-height:1.6;color:#444}
.gx1-story li::before{content:'';position:absolute;left:5px;top:8px;width:10px;height:10px;border-radius:50%;background:#d6d6d6}
.gx1-story li::after{content:'';position:absolute;left:9px;top:22px;bottom:-4px;width:2px;background:#ececec}
.gx1-story li:last-child{padding-bottom:0;font-weight:800;color:#141414}
.gx1-story li:last-child::before{background:var(--g)}
.gx1-story li:last-child::after{display:none}
.gx1-career{display:flex;flex-wrap:wrap;gap:8px;list-style:none;padding:0;margin:0 0 28px}
.gx1-career li{font-size:14px;font-weight:700;color:#333;background:var(--cream);border-radius:10px;padding:9px 13px}
.gx1-quote{margin:0;position:relative;background:var(--dark);color:#fff;border-radius:18px;padding:26px 26px 26px 62px}
.gx1-quote::before{content:'“';position:absolute;left:20px;top:12px;font-size:58px;line-height:1;color:var(--g);font-weight:900}
.gx1-quote p{margin:0;font-size:18px;font-weight:700;line-height:1.65}
@media(max-width:760px){.gx1-inst{grid-template-columns:minmax(0,1fr);gap:28px}.gx1-inst-photo{width:100%;max-width:380px;margin:0 auto}.gx1-inst-name{font-size:28px}.gx1-quote{padding:22px 20px 22px 50px}.gx1-quote::before{left:14px;font-size:48px}.gx1-quote p{font-size:16px}}

/* 10·12 커리큘럼 카드 */
.gx1-parts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:44px}
.gx1-parts--3{grid-template-columns:repeat(3,minmax(0,1fr))}
.gx1-part{background:#fff;border:1px solid #ece6cf;border-radius:20px;padding:28px 24px}
.gx1-part .gx1-part-no{font-size:30px;font-weight:900;color:var(--g);line-height:1;margin:0 0 14px}
.gx1-part h3{font-size:20px;font-weight:800;margin:0 0 8px;line-height:1.45}
.gx1-part .gx1-part-sub{font-size:14px;font-weight:700;color:var(--g);margin:0 0 10px;line-height:1.5}
.gx1-part p{font-size:15px;color:#666;line-height:1.7;margin:0}
@media(max-width:900px){.gx1-parts--3{grid-template-columns:minmax(0,1fr)}}
@media(max-width:640px){.gx1-parts{grid-template-columns:minmax(0,1fr)}}

/* 11 체험 7단계 — 모바일 세로 / PC(1024px~) 가로. 래퍼 overflow:hidden */
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

/* 13 재등록 3단계 — 계단형 */
.gx1-emph{max-width:760px;margin:36px auto 28px;background:var(--dark);color:#fff;border-radius:20px;padding:30px 28px;text-align:center}
.gx1-emph p{margin:0;font-size:24px;font-weight:900;line-height:1.5}
.gx1-emph em{font-style:normal;color:#ff6b6b}
.gx1-stairs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;align-items:end}
.gx1-stair{background:var(--cream);border:1px solid #ece6cf;border-radius:20px;padding:28px 24px;display:flex;flex-direction:column}
.gx1-stair:nth-child(1){min-height:220px}
.gx1-stair:nth-child(2){min-height:270px}
.gx1-stair:nth-child(3){min-height:320px;background:#fff;border:2px solid var(--g)}
.gx1-stair-lv{font-size:14px;font-weight:900;color:var(--g);margin:0 0 8px}
.gx1-stair h3{font-size:22px;font-weight:800;margin:0 0 12px}
.gx1-stair p{font-size:15px;color:#666;line-height:1.7;margin:0}
.gx1-stair-bar{margin-top:auto;padding-top:18px;display:flex;gap:4px}
.gx1-stair-bar span{flex:1;height:6px;border-radius:3px;background:#e6dfc4}
.gx1-stair-bar span.on{background:var(--g)}
.gx1-result{max-width:560px;margin:36px auto 0;text-align:center;background:var(--dark);color:#fff;border-radius:22px;padding:30px 24px}
.gx1-result-label{margin:0 0 10px;font-size:14px;color:#aaa;font-weight:700}
.gx1-result-num{margin:0;font-size:48px;font-weight:900;line-height:1.1;font-variant-numeric:tabular-nums;white-space:nowrap}
.gx1-result-before{font-size:32px;color:#7a7a7a}
.gx1-result-arrow{font-size:30px;color:var(--g);margin:0 12px}
.gx1-result-num em{font-style:normal;color:var(--g)}
@media(max-width:760px){.gx1-stairs{grid-template-columns:minmax(0,1fr);align-items:stretch}.gx1-stair:nth-child(n){min-height:0}.gx1-stair:nth-child(2){margin-left:14px}.gx1-stair:nth-child(3){margin-left:28px}.gx1-emph p{font-size:20px}}
@media(max-width:640px){.gx1-result-num{font-size:40px}.gx1-result-before{font-size:26px}.gx1-result-arrow{font-size:24px;margin:0 8px}}

/* 14 커뮤니티 증명 + 선언 */
.gx1-gallery{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr) minmax(0,1fr);gap:14px;margin-top:44px}
.gx1-shot{border-radius:18px;background:#161616}
.gx1-shot--wide{aspect-ratio:16/9}
.gx1-declare{max-width:780px;margin:36px auto 0;border:2px dashed var(--g);border-radius:20px;padding:30px 28px;text-align:center;background:rgba(34,181,115,.06)}
.gx1-declare p{margin:0;font-size:19px;font-weight:700;line-height:1.8;color:#fff}
.gx1-declare em{font-style:normal;color:var(--g)}
@media(max-width:760px){.gx1-gallery{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.gx1-shot--wide{grid-column:1/-1}.gx1-shot--tall{aspect-ratio:4/5}}
@media(max-width:640px){.gx1-declare{padding:24px 18px}.gx1-declare p{font-size:16px}}

/* 15 희소성 */
.gx1-scarce{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;max-width:760px;margin:40px auto 0}
.gx1-scarce-tile{background:#fff;border:2px solid #141414;border-radius:22px;padding:30px 24px;text-align:center}
.gx1-scarce-tile--hot{border-color:#e23b3b}
.gx1-scarce-label{margin:0 0 10px;font-size:15px;font-weight:800;color:#666}
.gx1-scarce-value{margin:0;font-size:40px;font-weight:900;line-height:1.2;color:#141414}
.gx1-scarce-tile--hot .gx1-scarce-value{color:#e23b3b}
@media(max-width:640px){.gx1-scarce{grid-template-columns:minmax(0,1fr)}.gx1-scarce-value{font-size:30px}}

/* 16 클로징 (#contact) — 강의 정보 + FAQ + 결제 */
#contact{scroll-margin-top:96px}
.gx1-info{width:100%;border-collapse:separate;border-spacing:0;margin-top:40px;background:#fff;border:1px solid #eee;border-radius:16px;overflow:hidden}
.gx1-info th,.gx1-info td{padding:18px 20px;text-align:left;font-size:16px;border-bottom:1px solid #f0f0f0;vertical-align:top}
.gx1-info tr:last-child th,.gx1-info tr:last-child td{border-bottom:none}
.gx1-info th{width:120px;background:var(--cream);font-weight:800;color:#333;white-space:nowrap}
.gx1-info td{font-weight:600;color:#141414;line-height:1.6}
.gx1-price-line{display:block}
.gx1-price-line em{font-style:normal;color:var(--g);font-weight:800;margin-right:8px}
.gx1-faq-t{font-size:22px;font-weight:800;margin:56px 0 18px;text-align:center}
.gx1-faq{display:flex;flex-direction:column;gap:10px}
.gx1-faq-item{border:1px solid #262626;border-radius:14px;background:#141414;overflow:hidden}
.gx1-faq-item summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:20px 22px;font-size:16px;font-weight:700;color:#fff}
.gx1-faq-item summary::-webkit-details-marker{display:none}
.gx1-faq-ic{flex:0 0 auto;font-size:24px;font-weight:400;color:var(--g);line-height:1;transition:transform .25s}
.gx1-faq-item[open] .gx1-faq-ic{transform:rotate(45deg)}
.gx1-faq-body{padding:0 22px 20px;font-size:15px;color:#bbb;line-height:1.75}
.gx1-faq-body p{margin:0}
.gx1-enroll-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;max-width:680px;margin:56px auto 0}
.gx1-enroll-card{position:relative;background:#fff;border:1px solid #e6e6e6;border-radius:18px;padding:30px 24px 26px;text-align:center;color:#141414}
.gx1-enroll-card--sale{border:2px solid var(--g)}
.gx1-enroll-badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#e23b3b;color:#fff;font-size:11px;font-weight:800;padding:5px 14px;border-radius:50px;white-space:nowrap}
.gx1-enroll-tag{font-size:13px;font-weight:700;color:#888;margin:0 0 10px}
.gx1-enroll-card--sale .gx1-enroll-tag{color:var(--g)}
.gx1-enroll-price{font-size:22px;font-weight:900;color:#161616;margin:0 0 18px;line-height:1.3}
.gx1-enroll-price span{font-size:13px;color:#999;font-weight:600;margin-left:4px}
.gx1-enroll-card .gx1-pay-btn{width:100%;min-width:0}
.gx1-enroll-note{max-width:680px;margin:18px auto 0;font-size:12px;color:#9a9a9a;line-height:1.7;text-align:center}
@media(max-width:640px){.gx1-info th,.gx1-info td{padding:14px;font-size:14px}.gx1-info th{width:84px}.gx1-enroll-cards{grid-template-columns:minmax(0,1fr)}.gx1-enroll-price{font-size:20px}}

/* 하단 고정 CTA 바 — safe-area 대응 */
.gx1-bar{position:fixed;left:0;right:0;bottom:0;z-index:60;background:var(--dark2);border-top:1px solid #222;padding:12px 16px calc(12px + env(safe-area-inset-bottom));transition:transform .3s ease}
.gx1-bar.is-hidden{transform:translateY(140%)}
.gx1-bar-in{max-width:1080px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:14px}
.gx1-bar-when{min-width:0;margin:0;font-size:14px;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gx1-bar-cta{flex:0 0 auto;border:none;background:var(--g);color:#fff;font-size:15px;font-weight:800;font-family:inherit;padding:13px 26px;border-radius:12px;white-space:nowrap;cursor:pointer}
.gx1-barspacer{height:calc(76px + env(safe-area-inset-bottom));background:var(--dark)}
@media(max-width:480px){.gx1-bar-when{font-size:13px}.gx1-bar-cta{padding:12px 18px;font-size:14px}}
@media(prefers-reduced-motion:reduce){.gx1-bar{transition:none}}
`;

export default function GxClass() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  // 숫자 증명 — null 이면 최종값 표시(기본). 섹션 진입 시 0 부터 카운트업
  const [proofCounts, setProofCounts] = useState<number[] | null>(null);
  // 하단 고정 바 — 히어로나 클로징(#contact)이 화면에 보이면 숨김.
  // 본문이 아니라 결제 CTA 의 중복 진입점이라, 판정 전(첫 렌더)에는 숨겨서 히어로 위 깜빡임을 막는다.
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
            setProofCounts(PROOF_STATS.map((s) => s.target * eased));
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

    // 3) 하단 고정 바 — 히어로·클로징 중 하나라도 보이면 숨김
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
          <h1 className="gx1-hero-h1">{CLASS_NAME}</h1>
          <p className="gx1-hero-sub">[1 히어로 서브카피]</p>
          <div className="gx1-stats">
            {HERO_STATS.map((s) => (
              <div key={s.label} className="gx1-stat">
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

      {/* ── 2. 고객 대사 ── */}
      <section className="gx1-sec gx1-dark2">
        <div className="gx1-wrap">
          <h2 className="gx1-h2 gx1-reveal">[2 고객 대사 헤드라인]</h2>
          <p className="gx1-lead gx1-reveal">[서브카피]</p>
          <ul className="gx1-voices gx1-stagger">
            {VOICES.map((v) => (
              <li key={v} className="gx1-voice gx1-reveal">
                {v}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 3. 문제의 진짜 원인 ── */}
      <section className="gx1-sec gx1-white">
        <div className="gx1-wrap gx1-cause">
          <span className="gx1-cause-line gx1-reveal" aria-hidden="true" />
          <h2 className="gx1-cause-quote gx1-reveal">
            이탈은 만료일에 생기지 않습니다.
            <br />
            <em>등록 첫날부터</em> 시작됩니다.
          </h2>
          <p className="gx1-lead gx1-reveal">[서브카피]</p>
        </div>
      </section>

      {/* ── 4. 손실 확대 — 신규 의존 악순환 ── */}
      <section className="gx1-sec gx1-dark">
        <div className="gx1-wrap">
          <h2 className="gx1-h2 gx1-reveal">[4 손실 확대 헤드라인]</h2>
          <p className="gx1-lead gx1-reveal">[서브카피]</p>
          <div
            className="gx1-cycle gx1-reveal"
            role="img"
            aria-label="광고, 신규, 매출, 이탈을 거쳐 다시 광고로 돌아오는 신규 의존 악순환"
          >
            <svg viewBox="0 0 400 400" aria-hidden="true" focusable="false">
              <defs>
                <marker
                  id="gx1-arr"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M0 0L10 5L0 10z" fill="#22B573" />
                </marker>
                <marker
                  id="gx1-arr-loss"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M0 0L10 5L0 10z" fill="#e23b3b" />
                </marker>
              </defs>
              <circle
                cx="200"
                cy="200"
                r="150"
                fill="none"
                stroke="rgba(255,255,255,.06)"
                strokeWidth="2"
              />
              {CYCLE_ARCS.map((a) => (
                <path
                  key={a.d}
                  d={a.d}
                  fill="none"
                  stroke={a.loss ? "#e23b3b" : "#22B573"}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={a.loss ? "10 9" : undefined}
                  markerEnd={`url(#${a.loss ? "gx1-arr-loss" : "gx1-arr"})`}
                />
              ))}
            </svg>
            {CYCLE_NODES.map((n) => (
              <div
                key={n.label}
                aria-hidden="true"
                className={`gx1-cycle-node${n.loss ? " gx1-cycle-node--loss" : ""}`}
                style={{ left: n.left, top: n.top }}
              >
                {n.label}
              </div>
            ))}
            <span className="gx1-cycle-again" aria-hidden="true">
              다시 광고
            </span>
            <div className="gx1-cycle-center" aria-hidden="true">
              <b>신규 의존 악순환</b>
              <span>[서브카피]</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. 왜 다들 못 하는가 (승부처) ── */}
      <section className="gx1-sec gx1-cream">
        <div className="gx1-wrap">
          <h2 className="gx1-h2 gx1-h2--xl gx1-reveal">
            세일즈 교육은 많습니다.
            <br />
            <em>등록 이후</em>를 다루는 교육이 없을 뿐입니다.
          </h2>
          <p className="gx1-lead gx1-reveal">[서브카피]</p>
          <div className="gx1-vs">
            <div className="gx1-vs-card gx1-vs-card--common gx1-reveal">
              <span className="gx1-vs-tag">흔한 교육</span>
              <ul className="gx1-vs-list">
                {COMMON_EDU.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <p className="gx1-vs-note">[서브카피]</p>
            </div>
            <div className="gx1-vs-arrow" aria-hidden="true">
              →
            </div>
            <div className="gx1-vs-card gx1-vs-card--need gx1-reveal">
              <span className="gx1-vs-tag">필요한 것</span>
              <p className="gx1-vs-main">
                <em>등록 이후</em>
                <br />
                운영 시스템
              </p>
              <p className="gx1-vs-note">[서브카피]</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. 관점 전환 — 4요소 ── */}
      <section className="gx1-sec gx1-white">
        <div className="gx1-wrap">
          <h2 className="gx1-h2 gx1-reveal">
            그룹운동은 수업이 아니라
            <br />
            <em>매출 구조</em>입니다.
          </h2>
          <p className="gx1-lead gx1-reveal">[서브카피]</p>
          <div className="gx1-elems gx1-stagger">
            {ELEMENTS.map((e) => (
              <div key={e.en} className="gx1-elem gx1-reveal">
                <span className="gx1-elem-en">{e.en}</span>
                <span className="gx1-elem-ko">{e.ko}</span>
                <p>[서브카피]</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. 해답 선언 — 3축 ── */}
      <section className="gx1-sec gx1-dark2">
        <div className="gx1-wrap">
          <h2 className="gx1-h2 gx1-reveal">
            <em>신규 전환</em> × <em>재등록</em> × <em>운영 루틴</em>
          </h2>
          <p className="gx1-lead gx1-reveal">[서브카피]</p>
          <div className="gx1-axes gx1-stagger">
            {AXES.map((a, i) => (
              <div key={a.title} className="gx1-axis gx1-reveal">
                <div className="gx1-axis-no">{i + 1}</div>
                <h3>{a.title}</h3>
                <span className="gx1-axis-part">{a.part}</span>
                <p>[서브카피]</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. 증거 ── */}
      <section className="gx1-sec gx1-dark" id="gx1-proof">
        <div className="gx1-wrap">
          <h2 className="gx1-h2 gx1-reveal">[8 증거 헤드라인]</h2>
          <div className="gx1-proof gx1-stagger">
            {PROOF_STATS.map((s, i) => (
              <div key={s.label} className="gx1-proof-card gx1-reveal">
                <p className="gx1-proof-label">{s.label}</p>
                <p className="gx1-proof-num">
                  {s.prefix ? (
                    <span className="gx1-proof-pre">{s.prefix}</span>
                  ) : null}
                  {fmtNum(proofCounts?.[i] ?? s.target, s.decimals)}
                  <small>{s.suffix}</small>
                </p>
                <p className="gx1-proof-basis">{s.basis}</p>
              </div>
            ))}
          </div>
          <div className="gx1-thumbs gx1-stagger">
            {PROOF_SHOTS.map((t) => (
              <figure key={t.src} className="gx1-thumb gx1-reveal">
                <div className="gx1-thumb-box gx1-media">
                  <GxImg
                    src={t.src}
                    alt={t.alt}
                    sizes="(max-width: 640px) 45vw, 272px"
                    position="left top"
                  />
                </div>
                <figcaption>{t.caption}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. 강사 서사 ── */}
      <section className="gx1-sec gx1-white">
        <div className="gx1-wrap">
          <h2 className="gx1-h2 gx1-reveal">[9 강사 헤드라인]</h2>
          <div className="gx1-inst">
            <div className="gx1-inst-photo gx1-media gx1-reveal">
              <GxImg
                src={IMAGES.instructor}
                alt="이창엽(댄) 강사 프로필 사진"
                sizes="(max-width: 760px) 380px, 420px"
                position="center 30%"
              />
            </div>
            <div className="gx1-reveal">
              <p className="gx1-inst-name">
                {INSTRUCTOR.name}
                <span>{INSTRUCTOR.alias}</span>
              </p>
              <p className="gx1-inst-role">{INSTRUCTOR.role}</p>
              <ol className="gx1-story">
                {STORY.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
              <ul className="gx1-career">
                {CAREER.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <blockquote className="gx1-quote">
                <p>{QUOTE}</p>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ── 10. 커리큘럼 1부 ── */}
      <section className="gx1-sec gx1-cream">
        <div className="gx1-wrap">
          <span className="gx1-kicker gx1-reveal">커리큘럼 1부 · 50분</span>
          <h2 className="gx1-h2 gx1-reveal">
            신규 전환율,
            <br />
            업계 대비 <em>2배 이상</em> 만드는 방법
          </h2>
          <div className="gx1-parts gx1-stagger">
            {PART1.map((p, i) => (
              <div key={p.title} className="gx1-part gx1-reveal">
                <p className="gx1-part-no">{CIRCLED[i]}</p>
                <h3>{p.title}</h3>
                {p.sub ? <p className="gx1-part-sub">{p.sub}</p> : null}
                <p>[항목 설명]</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 11. 체험 7단계 타임라인 ── */}
      <section className="gx1-sec gx1-dark2">
        <div className="gx1-wrap">
          <h2 className="gx1-h2 gx1-reveal">
            고객이 들어온 순간부터
            <br />
            클로징까지 <em>7단계</em>
          </h2>
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

      {/* ── 12. 커리큘럼 2부 ── */}
      <section className="gx1-sec gx1-cream">
        <div className="gx1-wrap">
          <span className="gx1-kicker gx1-reveal">커리큘럼 2부 · 50분</span>
          <h2 className="gx1-h2 gx1-reveal">
            1개 지점 월 평균 <em>3,500만 원</em>을 만드는
            <br />
            재등록 방법 &amp; 운영 루틴
          </h2>
          <div className="gx1-parts gx1-parts--3 gx1-stagger">
            {PART2.map((p, i) => (
              <div key={p.title} className="gx1-part gx1-reveal">
                <p className="gx1-part-no">{CIRCLED[i]}</p>
                <h3>{p.title}</h3>
                <p>[항목 설명]</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 13. 재등록 3단계 ── */}
      <section className="gx1-sec gx1-white">
        <div className="gx1-wrap">
          <h2 className="gx1-h2 gx1-reveal">재등록 3단계</h2>
          <div className="gx1-emph gx1-reveal">
            <p>
              만료 당일에 물어보면 <em>늦습니다.</em>
            </p>
          </div>
          <div className="gx1-stairs gx1-stagger">
            {REREG_LEVELS.map((lv, i) => (
              <div key={lv.lv} className="gx1-stair gx1-reveal">
                <p className="gx1-stair-lv">{lv.lv}</p>
                <h3>{lv.title}</h3>
                <p>[단계 설명]</p>
                <div className="gx1-stair-bar" aria-hidden="true">
                  {REREG_LEVELS.map((_, k) => (
                    <span key={k} className={k <= i ? "on" : undefined} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="gx1-result gx1-reveal">
            <p className="gx1-result-label">재등록 3단계 도입 전후 재등록률</p>
            <p className="gx1-result-num">
              <span className="gx1-result-before">28%</span>
              <span className="gx1-result-arrow" aria-hidden="true">
                →
              </span>
              <em>63%</em>
            </p>
          </div>
        </div>
      </section>

      {/* ── 14. 커뮤니티 증명 + 케이스 스터디 선언 ── */}
      <section className="gx1-sec gx1-dark">
        <div className="gx1-wrap">
          <h2 className="gx1-h2 gx1-reveal">[14 커뮤니티 헤드라인]</h2>
          <p className="gx1-lead gx1-reveal">[서브카피]</p>
          <div className="gx1-gallery gx1-stagger">
            <div className="gx1-shot gx1-shot--wide gx1-media gx1-reveal">
              <GxImg
                src={IMAGES.community}
                alt="그룹운동 커뮤니티 회원 단체 사진"
                sizes="(max-width: 760px) 100vw, 520px"
                position="center 65%"
              />
            </div>
            <div className="gx1-shot gx1-shot--tall gx1-media gx1-reveal">
              <GxImg
                src={IMAGES.lecture1}
                alt="이창엽 강사 강의 현장 1"
                sizes="(max-width: 760px) 50vw, 260px"
                position="center 62%"
              />
            </div>
            <div className="gx1-shot gx1-shot--tall gx1-media gx1-reveal">
              <GxImg
                src={IMAGES.lecture2}
                alt="이창엽 강사 강의 현장 2"
                sizes="(max-width: 760px) 50vw, 260px"
                position="center 55%"
              />
            </div>
          </div>
          <div className="gx1-declare gx1-reveal">
            <p>
              이 강의는 그룹운동 프로그램을 가르치지 않습니다.
              <br />
              이미 있는 공간과 회원으로 <em>매출을 만드는 운영 구조</em>를
              다룹니다.
            </p>
          </div>
        </div>
      </section>

      {/* ── 15. 희소성 ── */}
      <section className="gx1-sec gx1-cream">
        <div className="gx1-wrap">
          <h2 className="gx1-h2 gx1-reveal">[15 희소성 헤드라인]</h2>
          <p className="gx1-lead gx1-reveal">[서브카피]</p>
          <div className="gx1-scarce gx1-stagger">
            <div className="gx1-scarce-tile gx1-reveal">
              <p className="gx1-scarce-label">정원</p>
              <p className="gx1-scarce-value">{formatCapacity(CAPACITY)}</p>
            </div>
            <div className="gx1-scarce-tile gx1-scarce-tile--hot gx1-reveal">
              <p className="gx1-scarce-label">얼리버드 마감</p>
              <p className="gx1-scarce-value">
                {formatDeadline(EARLYBIRD_UNTIL)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 16. 클로징 (#contact) — 강의 정보 + FAQ + 결제.
          기존 CTA·외부 링크의 #contact 앵커가 이 섹션을 가리킨다. ── */}
      <section className="gx1-sec gx1-dark" id="contact">
        <div className="gx1-wrap gx1-narrow">
          <h2 className="gx1-h2 gx1-reveal">[16 클로징 헤드라인]</h2>
          <p className="gx1-lead gx1-reveal">[서브카피]</p>

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
            {FAQS.map((f) => (
              <details key={f.q} className="gx1-faq-item gx1-reveal">
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

      {/* ── 하단 고정 CTA 바 ── */}
      <div className={`gx1-bar${barShown ? "" : " is-hidden"}`} inert={!barShown}>
        <div className="gx1-bar-in">
          <p className="gx1-bar-when">
            {CLASS_NAME} · {SCHEDULE}
          </p>
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
