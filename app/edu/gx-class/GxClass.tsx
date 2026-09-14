"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 그룹운동 비즈니스 클래스 — 그룹운동 운영자 전용 상품상세 페이지 (/edu/gx-class)
//  · 타겟: 이미 그룹운동을 운영 중인 대표·관리자. 헬스장·PT샵 확장 소구는 두지 않는다.
//  · 15섹션 계단식 흐름: 각 섹션이 하나의 주장을 던지고 다음 섹션이 받아 답한다.
//    고객 대사(2) → 진짜 원인(3) → 손실 확대(4) → 왜 못 하는가(5, 승부처)
//    → 관점 전환(6) → 해답(7) → 증거(8·9) → 커리큘럼(10~13)
//    → 커뮤니티·범위(14) → 희소성·클로징·결제(15)
//  · 주입 HTML 없이 전부 React 렌더 · 클래스 접두사 gx1-
//  · 날짜·정원·장소·마감일은 lib/gxClass.ts 상수만 수정
//  · 애니메이션 fail-safe: 기본은 전부 표시. 이펙트가 루트에 gx1-anim 을 붙인 뒤에만
//    숨김 → 등장. 스크립트가 안 돌면 모든 섹션이 보인 상태로 남는다.
//  · IntersectionObserver / rAF 는 언마운트 시 전부 정리, 전역 함수 없음
//  · 결제: 15 클로징(#contact) 결제 카드 + 우하단 플로팅 버튼 → /checkout (fc-class 와 동일)
//  · 카피 규칙: 물음표 금지 · 영문 eyebrow 금지 · 컨설팅→솔루션 · 컨설턴트→멘토
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
  discountRate,
  formatCapacity,
  formatDeadline,
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
  { value: "48.4%", label: "신규 전환율" },
  { value: "3,500만 원", label: "1개 지점 월 평균 매출" },
  { value: "63%", label: "재등록률" },
];

// ── 2. 고객 대사 — 그룹운동 운영자의 언어 ────────────────────────────────────
const VOICES = [
  "체험은 오는데 등록으로 이어지지 않습니다",
  "수업은 좋다는데 3개월을 못 넘깁니다",
  "재등록이 코치에 따라 달라집니다",
  "매달 신규 모집부터 다시 시작합니다",
  "광고비는 오르는데 매출은 제자리입니다",
];

// ── 4. 악순환 — 시계방향 (위 → 오른쪽 → 아래 → 왼쪽) ─────────────────────────
// 노드 좌표는 정사각 컨테이너 기준 %, 호는 viewBox 400 · 반지름 150 · 노드 앞뒤 24° 여백
const CYCLE_NODES = [
  { label: "광고", left: "50%", top: "12.5%", loss: false },
  { label: "신규 등록", left: "87.5%", top: "50%", loss: false },
  { label: "매출 발생", left: "50%", top: "87.5%", loss: false },
  { label: "회원 이탈", left: "12.5%", top: "50%", loss: true },
];
const CYCLE_ARCS = [
  { d: "M261 63 A150 150 0 0 1 337 139", loss: false },
  { d: "M337 261 A150 150 0 0 1 261 337", loss: false },
  { d: "M139 337 A150 150 0 0 1 63 261", loss: false },
  { d: "M63 139 A150 150 0 0 1 139 63", loss: true }, // 회원 이탈 → 다시 광고
];

// ── 5. 왜 다들 못 하는가 — 대비 카드 ─────────────────────────────────────────
const COMMON_EDU = ["동작", "큐잉", "프로그래밍", "자격 과정"];
const NEED_EDU = ["체험 전환", "온보딩", "관계 설계", "재등록 루틴"];

// ── 6. 관점 전환 — 4요소 (영문 라벨 금지) ────────────────────────────────────
const ELEMENTS = [
  { title: "프로그램", desc: "좋은 수업" },
  { title: "경험", desc: "첫 방문에서 만들어지는 인상" },
  { title: "코치", desc: "회원이 계속 오는 이유" },
  { title: "커뮤니티", desc: "이 사람들과 운동하고 싶다는 이유" },
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
    target: 48.4,
    decimals: 1,
    suffix: "%",
    basis: "체험 667명 중 323명 등록 (2026년 1~7월)",
  },
  {
    label: "1개 지점 월 평균 매출",
    target: 3500,
    decimals: 0,
    suffix: "만 원",
    basis: "2026년 1~7월",
  },
  {
    label: "재등록률",
    target: 63,
    decimals: 0,
    suffix: "%",
    basis: "도입 전 28% 대비 2.3배",
  },
];
// 이미 가림 처리된 실제 CRM 캡처 — 내용이 읽히는 크기로, 원본 비율 그대로(잘림 없음) 노출
const PROOF_SHOTS = [
  {
    src: IMAGES.proofNew,
    alt: "CRM 신규 등록 기록 캡처 (회원 이름 가림)",
    caption: "신규 등록 기록",
    ratio: "579 / 550",
  },
  {
    src: IMAGES.proofRejoin,
    alt: "CRM 재등록 기록 캡처 (회원 이름 가림)",
    caption: "재등록 기록",
    ratio: "445 / 585",
  },
];

// ── 9. 강사 서사 ─────────────────────────────────────────────────────────────
const INSTRUCTOR = {
  name: "이창엽",
  alias: "댄",
  role: "주식회사 팀피에이치세븐 · FIST X 대표",
};
const BIO = [
  "유학 시절 별명이 E.T.였을 만큼 왜소했습니다. 3년을 헬스장에 다녀도 몸은 바뀌지 않았습니다.",
  "귀국 후 크로스핏으로 체력과 근육은 얻었지만, 원하던 체형과는 거리가 있었습니다. 웨이트 스승을 만나 하루 1시간으로 배운 것을 크로스핏 센터에 적용하기 시작했고, 웨이트의 체형과 기능성 운동의 체력을 합친 것이 바디 쉐이프 트레이닝입니다.",
  "FIST X는 좋은 수업보다 고객이 매주 다시 오는 구조에 더 많은 시간을 썼고, 지금의 운영 시스템이 거기서 나왔습니다.",
];
const CAREER = [
  "크로스핏 10년 · 코치 8년",
  "2019 Asia Fittest Team Challenge 2위",
  "TwoFIT 5개 지점 총괄 운영",
  "FIST X 직영 2개 지점 (서울대입구 · 구로디지털단지)",
  "세일즈 · 코칭 매뉴얼 직접 제작, 매주 코치 교육 운영",
];
const QUOTE = "고객은 팔리는 건 싫어하지만, 리드받고 관계 맺는 건 원합니다.";

// ── 10~13 커리큘럼 ───────────────────────────────────────────────────────────
const CIRCLED = ["①", "②", "③", "④"];
const PART1 = [
  { title: "마인드셋", desc: "고객이 여기까지 온 여정을 먼저 생각합니다" },
  {
    title: "자세 — 리관차",
    desc: "신규 결제는 리드 × 관계 × 차별화된 고객 경험에서 나옵니다",
  },
  { title: "7단계 프로세스", desc: "문의부터 클로징까지, 각 단계에서 만들어야 할 것" },
  { title: "이탈 고객 재접근", desc: "부담 없이 2회에 걸쳐 존재감을 남기는 루틴" },
];
const TRIAL_STEPS = [
  { title: "문의 응대", desc: "첫 연락에서 방문을 만듭니다" },
  { title: "첫인상", desc: "3분 안에 결정됩니다" },
  { title: "투어", desc: "시설 안내가 아니라 경험 설계입니다" },
  { title: "운동 체험", desc: "방치되는 순간이 없어야 합니다" },
  { title: "상담·질문", desc: "고객이 70%, 내가 30% 말합니다" },
  { title: "가치증명", desc: "목표와 프로그램을 1:1로 연결합니다" },
  { title: "클로징", desc: "더블바인딩 이후의 침묵" },
];
const PART2 = [
  {
    title: "단계별 이유",
    desc: "체험에서 등록은 만족도와 관심, 1차 재등록은 코치와의 유대, 2·3차는 회원 사이의 유대가 만듭니다",
  },
  {
    title: "생각의 전환",
    desc: "고객은 연락을 싫어하는 게 아니라 이끌어주는 코치를 기다립니다",
  },
  { title: "재등록 3단계", desc: "만료 당일이 아니라 그 전에 나눠서 접근합니다" },
];
const REREG_LEVELS = [
  { lv: "Lv1", title: "관계 확인", desc: "안부와 컨디션부터 확인합니다" },
  { lv: "Lv2", title: "의향 확인", desc: "앞으로의 목표를 함께 정리합니다" },
  { lv: "Lv3", title: "구체 제안", desc: "그때 비로소 제안합니다" },
];

// ── 15. FAQ — 카피 확정 전 플레이스홀더 ──────────────────────────────────────
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
  return isPending(price) ? null : <span className="gx1-vat">(VAT포함)</span>;
}

/**
 * 얼리버드 가격 표기 — 정가 취소선 + 얼리버드가 강조 + 할인율 (페이지 전체 공통).
 * 가격이 미정이면 취소선·할인율 없이 얼리버드가("미정")만, 마감일은 확정된 경우에만 붙인다.
 */
function EarlybirdPrice() {
  const rate = discountRate(PRICE_NORMAL, PRICE_EARLYBIRD);
  const until = isPending(EARLYBIRD_UNTIL)
    ? null
    : formatDeadline(EARLYBIRD_UNTIL);
  return (
    <span className="gx1-price">
      {rate !== null ? (
        <s className="gx1-price-was" aria-label={`정가 ${formatPrice(PRICE_NORMAL)}`}>
          {formatPrice(PRICE_NORMAL)}
        </s>
      ) : null}
      <b className="gx1-price-now">{formatPrice(PRICE_EARLYBIRD)}</b>
      {rate !== null ? (
        <span className="gx1-price-rate">{rate}% 할인</span>
      ) : null}
      <Vat price={PRICE_EARLYBIRD} />
      {until ? <span className="gx1-price-until">{until}까지</span> : null}
    </span>
  );
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
.gx1-loss{color:#ff6b6b}
.gx1-br-m{display:none}
@media(max-width:640px){.gx1-sec{padding:68px 0}.gx1-h2{font-size:25px}.gx1-h2--xl{font-size:28px}.gx1-lead{font-size:15px}.gx1-br-m{display:inline}}

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

/* 1 히어로 — 단체사진 배경 + 어두운 오버레이. 이미지가 실패해도 다크 배경이 남는다 */
.gx1-hero{position:relative;isolation:isolate;overflow:hidden;min-height:calc(100vh - 96px);display:flex;align-items:center;background:var(--dark);color:#fff;text-align:center;padding:72px 0}
.gx1-hero-bg{position:absolute;inset:0;z-index:-2}
.gx1-hero-bg.is-broken img{visibility:hidden}
.gx1-hero-ov{position:absolute;inset:0;z-index:-1;background:radial-gradient(120% 80% at 50% 0%,rgba(34,181,115,.16) 0%,rgba(10,10,10,0) 60%),linear-gradient(180deg,rgba(10,10,10,.78) 0%,rgba(10,10,10,.84) 55%,rgba(10,10,10,.96) 100%)}
.gx1-hero-in{position:relative;width:100%}
.gx1-hero-kicker{display:inline-block;margin:0 0 20px;font-size:14px;font-weight:800;color:var(--g);background:rgba(34,181,115,.12);border:1px solid rgba(34,181,115,.35);border-radius:50px;padding:7px 16px}
.gx1-hero-h1{font-size:54px;font-weight:900;line-height:1.3;margin:0 0 20px}
.gx1-hero-sub{font-size:19px;line-height:1.7;color:#d6d6d6;margin:0 auto 40px;max-width:640px}
.gx1-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;max-width:760px;margin:0 auto 32px}
.gx1-stat{background:rgba(20,20,20,.72);border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:22px 12px}
.gx1-stat b{display:block;font-size:32px;font-weight:900;color:var(--g);line-height:1.2}
.gx1-stat span{display:block;margin-top:6px;font-size:14px;color:#b5b5b5}
.gx1-when{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:0}
.gx1-chip{font-size:14px;font-weight:700;color:#eee;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:50px;padding:8px 16px}
.gx1-chip em{font-style:normal;color:var(--g);margin-right:6px}
@media(max-width:640px){.gx1-hero{min-height:0;padding:56px 0 64px}.gx1-hero-kicker{font-size:12px}.gx1-hero-h1{font-size:32px}.gx1-hero-sub{font-size:16px}.gx1-stat{padding:16px 6px}.gx1-stat b{font-size:20px}.gx1-stat span{font-size:12px}}
@media(max-width:400px){.gx1-stat b{font-size:17px}}

/* 2 고객 대사 — 말풍선 세로 스택 */
.gx1-voices{list-style:none;padding:0;margin:0 auto;max-width:660px;display:flex;flex-direction:column;gap:14px}
.gx1-voice{position:relative;max-width:88%;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:22px;padding:18px 22px;font-size:17px;font-weight:600;line-height:1.55;color:#eee}
.gx1-voice::before{content:'“';color:var(--g);font-weight:900;margin-right:6px}
.gx1-voice:nth-child(odd){align-self:flex-start;border-bottom-left-radius:6px}
.gx1-voice:nth-child(even){align-self:flex-end;border-bottom-right-radius:6px;background:#132019;border-color:#1f3a2c}
@media(max-width:640px){.gx1-voice{max-width:94%;font-size:15px;padding:15px 18px}}

/* 3 진짜 원인 */
.gx1-cause{max-width:860px;text-align:center}
.gx1-cause-line{display:block;width:64px;height:4px;border-radius:2px;background:var(--g);margin:0 auto 32px}
.gx1-cause-quote{font-size:42px;font-weight:900;line-height:1.45;margin:0 0 28px;color:#141414}
.gx1-cause-quote em{font-style:normal;color:var(--g)}
.gx1-cause-body{max-width:640px;margin:0 auto;font-size:18px;line-height:1.85;color:#555}
@media(max-width:640px){.gx1-cause-quote{font-size:26px}.gx1-cause-body{font-size:16px}}

/* 4 악순환 — 기본은 정적 도식. 화면에 들어오면 is-live → 순환 연출, 화면 밖이면 is-paused.
   입자 · 입자 색 · 노드 점등은 같은 주기(--gx1-t)로 동시에 시작·정지해 위치가 어긋나지 않는다.
   원 궤도라서 궤도 전체를 회전시키는 것이 경로를 따라 이동하는 것과 같다. */
.gx1-cycle{--gx1-t:7s;position:relative;width:100%;max-width:480px;aspect-ratio:1/1;margin:0 auto}
.gx1-cycle svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.gx1-cycle-ring{position:absolute;left:27%;top:27%;width:46%;height:46%;border-radius:50%;border:2px dashed #fff;opacity:.08;pointer-events:none}
.gx1-cycle-orbit{position:absolute;inset:0;pointer-events:none}
.gx1-cycle-dot{position:absolute;left:50%;top:12.5%;width:3.2%;aspect-ratio:1/1;margin:-1.6% 0 0 -1.6%;border-radius:50%;background:#aaffd6;box-shadow:0 0 6px 2px rgba(34,181,115,.95),0 0 18px 5px rgba(34,181,115,.45);opacity:0}
.gx1-cycle-flow{opacity:0}
.gx1-cycle-node{position:absolute;width:23%;aspect-ratio:1/1;transform:translate(-50%,-50%);border-radius:50%;background:#151515;border:2px solid var(--g);display:flex;align-items:center;justify-content:center;padding:4px;text-align:center;font-size:16px;font-weight:800;line-height:1.25;color:#fff}
.gx1-cycle-node--loss{border-color:#e23b3b;color:#ff8a8a}
.gx1-cycle-again{position:absolute;left:17%;top:17%;transform:translate(-50%,-50%);font-size:13px;font-weight:800;color:#ff8a8a;white-space:nowrap}
.gx1-cycle-center{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:44%;text-align:center;font-size:18px;font-weight:900;line-height:1.4}
.gx1-cycle-copy{margin-top:40px}
.gx1-cycle.is-live .gx1-cycle-orbit{animation:gx1Orbit var(--gx1-t) linear infinite}
.gx1-cycle.is-live .gx1-cycle-dot{opacity:1;animation:gx1Dot var(--gx1-t) linear infinite}
.gx1-cycle.is-live .gx1-cycle-node{animation:gx1Node var(--gx1-t) ease-in-out infinite;animation-delay:calc(var(--gx1-t) * var(--gx1-p, 0) / 4)}
.gx1-cycle.is-live .gx1-cycle-node--loss{animation-name:gx1NodeLoss}
.gx1-cycle.is-live .gx1-cycle-flow{opacity:.55;animation:gx1FlowFwd 1.4s linear infinite}
.gx1-cycle.is-live .gx1-cycle-arc--loss{animation:gx1FlowBack 1.6s linear infinite}
.gx1-cycle.is-live .gx1-cycle-ring{animation:gx1Ring 20s linear infinite}
.gx1-cycle.is-paused *{animation-play-state:paused!important}
@keyframes gx1Orbit{to{transform:rotate(360deg)}}
@keyframes gx1Ring{to{transform:rotate(360deg)}}
@keyframes gx1Dot{0%,52%{background:#aaffd6;box-shadow:0 0 6px 2px rgba(34,181,115,.95),0 0 18px 5px rgba(34,181,115,.45)}70%,97%{background:#ffc2c2;box-shadow:0 0 6px 2px rgba(226,59,59,.95),0 0 18px 5px rgba(226,59,59,.45)}100%{background:#aaffd6;box-shadow:0 0 6px 2px rgba(34,181,115,.95),0 0 18px 5px rgba(34,181,115,.45)}}
@keyframes gx1Node{0%,100%{scale:1.07;background:#15261d;box-shadow:0 0 18px rgba(34,181,115,.5)}9%,91%{scale:1;background:#151515;box-shadow:0 0 0 rgba(34,181,115,0)}}
@keyframes gx1NodeLoss{0%,100%{scale:1.12;background:#2b1414;box-shadow:0 0 28px rgba(226,59,59,.7)}11%,89%{scale:1;background:#151515;box-shadow:0 0 0 rgba(226,59,59,0)}}
@keyframes gx1FlowFwd{to{stroke-dashoffset:-32}}
@keyframes gx1FlowBack{to{stroke-dashoffset:38}}
@media(prefers-reduced-motion:reduce){.gx1-cycle.is-live *{animation:none!important}.gx1-cycle.is-live .gx1-cycle-dot,.gx1-cycle.is-live .gx1-cycle-flow{opacity:0}}
@media(max-width:640px){.gx1-cycle-node{font-size:12px}.gx1-cycle-center{font-size:14px}.gx1-cycle-again{font-size:11px}.gx1-cycle-copy{margin-top:28px}}

/* 5 왜 다들 못 하는가 — 대비 카드 */
.gx1-vs{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:18px;align-items:stretch;margin-top:48px}
.gx1-vs-card{display:flex;flex-direction:column;border-radius:22px;padding:32px 28px}
.gx1-vs-card--common{background:#fff;border:1px solid #e8e2cc}
.gx1-vs-card--need{background:var(--dark);color:#fff;border:2px solid var(--g);box-shadow:0 18px 40px rgba(34,181,115,.18)}
.gx1-vs-tag{align-self:flex-start;font-size:13px;font-weight:800;padding:6px 14px;border-radius:50px;margin-bottom:18px}
.gx1-vs-card--common .gx1-vs-tag{background:#f1efe6;color:#777}
.gx1-vs-card--need .gx1-vs-tag{background:rgba(34,181,115,.16);color:var(--g)}
.gx1-vs-list{list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:8px}
.gx1-vs-list li{font-size:16px;font-weight:700;border-radius:10px;padding:10px 14px}
.gx1-vs-card--common .gx1-vs-list li{color:#555;background:#f6f4ec}
.gx1-vs-card--need .gx1-vs-list li{color:#dff5ea;background:rgba(34,181,115,.14)}
.gx1-vs-result{margin:auto 0 0;padding-top:20px;font-size:18px;font-weight:800;line-height:1.55}
.gx1-vs-result span{margin-right:6px}
.gx1-vs-card--common .gx1-vs-result{color:#777}
.gx1-vs-card--need .gx1-vs-result em{font-style:normal;color:var(--g)}
.gx1-vs-card--need .gx1-vs-result span{color:var(--g)}
.gx1-vs-arrow{align-self:center;width:48px;height:48px;border-radius:50%;background:var(--g);color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900}
@media(max-width:760px){.gx1-vs{grid-template-columns:minmax(0,1fr)}.gx1-vs-arrow{justify-self:center;transform:rotate(90deg)}.gx1-vs-result{font-size:16px}}

/* 6 관점 전환 — 4요소 */
.gx1-elems{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:28px;margin-top:48px}
.gx1-elem{position:relative;background:var(--cream);border-radius:20px;padding:30px 18px;text-align:center}
.gx1-elem h3{margin:0 0 10px;font-size:22px;font-weight:900;color:#141414}
.gx1-elem p{margin:0;font-size:15px;color:#666;line-height:1.6}
.gx1-elem+.gx1-elem::before{content:'×';position:absolute;left:-14px;top:50%;transform:translate(-50%,-50%);font-size:22px;font-weight:900;color:#bdbdbd}
.gx1-after{margin:40px auto 0;max-width:680px;text-align:center;font-size:22px;font-weight:800;line-height:1.6}
.gx1-after em{font-style:normal;color:var(--g)}
@media(max-width:900px){.gx1-elems{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.gx1-elem+.gx1-elem::before{display:none}}
@media(max-width:640px){.gx1-elem h3{font-size:19px}.gx1-elem p{font-size:14px}.gx1-after{font-size:18px}}

/* 7 해답 — 3축 */
.gx1-axes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px;margin-top:48px}
.gx1-axis{position:relative;background:#151515;border:1px solid #262626;border-radius:22px;padding:32px 22px;text-align:center}
.gx1-axis-no{width:48px;height:48px;border-radius:50%;background:var(--g);color:#fff;font-weight:900;font-size:19px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
.gx1-axis h3{font-size:23px;font-weight:900;margin:0 0 12px}
.gx1-axis-part{display:inline-block;font-size:12px;font-weight:800;color:var(--g);border:1px solid rgba(34,181,115,.5);border-radius:50px;padding:4px 12px}
.gx1-axis+.gx1-axis::before{content:'×';position:absolute;left:-14px;top:50%;transform:translate(-50%,-50%);font-size:24px;font-weight:900;color:var(--g)}
@media(max-width:760px){.gx1-axes{grid-template-columns:minmax(0,1fr);gap:30px}.gx1-axis+.gx1-axis::before{left:50%;top:-15px}}

/* 8 증거 — 숫자 카드가 주인공, CRM 캡처는 "실제 데이터가 있다"는 작은 보조 신호 */
.gx1-proof{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.gx1-proof-card{background:#141414;border:1px solid #232323;border-radius:22px;padding:42px 20px 28px;text-align:center}
.gx1-proof-label{font-size:16px;font-weight:700;color:#bbb;margin:0 0 14px}
.gx1-proof-num{font-size:58px;font-weight:900;color:var(--g);line-height:1.1;margin:0;font-variant-numeric:tabular-nums;white-space:nowrap}
.gx1-proof-num small{font-size:22px;font-weight:800;margin-left:3px}
.gx1-proof-basis{font-size:13px;color:#8a8a8a;margin:18px 0 0;padding-top:14px;border-top:1px solid #232323;line-height:1.6}
/* CRM 기록 — 가림 처리된 실제 캡처를 선명하게 (PC 2열·각 최대 420px / 모바일 세로 스택 전체폭) */
.gx1-evidence{max-width:860px;margin:40px auto 0}
.gx1-evidence-shots{display:grid;grid-template-columns:repeat(2,minmax(0,420px));justify-content:center;align-items:start;gap:20px}
.gx1-evidence-fig{margin:0}
.gx1-evidence-shot{width:100%;border-radius:14px;background:#fff;border:1px solid #2a2a2a}
.gx1-evidence-fig figcaption{margin-top:10px;font-size:14px;font-weight:700;color:#d0d0d0;text-align:center}
.gx1-evidence-note{margin:18px 0 0;font-size:13px;color:#8a8a8a;line-height:1.55;text-align:center}
@media(max-width:900px){.gx1-proof{grid-template-columns:minmax(0,1fr)}}
@media(max-width:760px){.gx1-evidence-shots{grid-template-columns:minmax(0,1fr)}}
@media(max-width:640px){.gx1-proof-num{font-size:46px}.gx1-proof-num small{font-size:19px}}

/* 9 강사 서사 */
.gx1-inst{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:48px;align-items:start;margin-top:48px}
.gx1-inst-photo{aspect-ratio:4/5;border-radius:22px;background:#f1f1f1;border:1px solid #eee}
.gx1-inst-name{font-size:34px;font-weight:900;margin:0 0 6px}
.gx1-inst-name span{font-size:20px;font-weight:700;color:var(--g);margin-left:8px}
.gx1-inst-role{font-size:16px;color:#666;margin:0 0 24px}
.gx1-bio{margin:0 0 28px}
.gx1-bio p{margin:0 0 14px;font-size:16px;line-height:1.85;color:#444}
.gx1-bio p:last-child{margin-bottom:0;font-weight:800;color:#141414}
.gx1-career{list-style:none;padding:0;margin:0 0 28px;display:flex;flex-direction:column;gap:8px}
.gx1-career li{position:relative;padding:10px 14px 10px 30px;font-size:14px;font-weight:700;color:#333;background:var(--cream);border-radius:10px;line-height:1.5}
.gx1-career li::before{content:'';position:absolute;left:14px;top:50%;width:6px;height:6px;margin-top:-3px;border-radius:50%;background:var(--g)}
.gx1-quote{margin:0;position:relative;background:var(--dark);color:#fff;border-radius:18px;padding:26px 26px 26px 62px}
.gx1-quote::before{content:'“';position:absolute;left:20px;top:12px;font-size:58px;line-height:1;color:var(--g);font-weight:900}
.gx1-quote p{margin:0;font-size:18px;font-weight:700;line-height:1.65}
@media(max-width:760px){.gx1-inst{grid-template-columns:minmax(0,1fr);gap:28px}.gx1-inst-photo{width:100%;max-width:380px;margin:0 auto}.gx1-inst-name{font-size:28px}.gx1-bio p{font-size:15px}.gx1-quote{padding:22px 20px 22px 50px}.gx1-quote::before{left:14px;font-size:48px}.gx1-quote p{font-size:16px}}

/* 10·12 커리큘럼 카드 */
.gx1-parts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:44px}
.gx1-parts--3{grid-template-columns:repeat(3,minmax(0,1fr))}
.gx1-part{background:#fff;border:1px solid #ece6cf;border-radius:20px;padding:28px 24px}
.gx1-part .gx1-part-no{font-size:30px;font-weight:900;color:var(--g);line-height:1;margin:0 0 14px}
.gx1-part h3{font-size:20px;font-weight:800;margin:0 0 10px;line-height:1.45}
.gx1-part p{font-size:15px;color:#555;line-height:1.7;margin:0}
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
.gx1-tl-desc{font-size:14px;color:#b5b5b5;line-height:1.6;margin:0}
@media(min-width:1024px){
.gx1-tl{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:12px}
.gx1-tl::before{content:'';position:absolute;left:calc(100% / 14);right:calc(100% / 14);top:20px;height:2px;background:rgba(34,181,115,.4)}
.gx1-tl-item{padding:0;text-align:center}
.gx1-tl-item::before{display:none}
.gx1-tl-node{position:relative;margin:0 auto 16px}
.gx1-tl-title{font-size:16px;margin:0 0 8px}
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
.gx1-stair p{font-size:15px;color:#555;line-height:1.7;margin:0}
.gx1-stair-bar{margin-top:auto;padding-top:18px;display:flex;gap:4px}
.gx1-stair-bar span{flex:1;height:6px;border-radius:3px;background:#e6dfc4}
.gx1-stair-bar span.on{background:var(--g)}
.gx1-result{max-width:560px;margin:36px auto 0;text-align:center;background:var(--dark);color:#fff;border-radius:22px;padding:30px 24px}
.gx1-result-label{margin:0 0 10px;font-size:15px;color:#aaa;font-weight:700}
.gx1-result-num{margin:0;font-size:48px;font-weight:900;line-height:1.1;font-variant-numeric:tabular-nums;white-space:nowrap}
.gx1-result-before{font-size:32px;color:#7a7a7a}
.gx1-result-arrow{font-size:30px;color:var(--g);margin:0 12px}
.gx1-result-num em{font-style:normal;color:var(--g)}
@media(max-width:760px){.gx1-stairs{grid-template-columns:minmax(0,1fr);align-items:stretch}.gx1-stair:nth-child(n){min-height:0}.gx1-stair:nth-child(2){margin-left:14px}.gx1-stair:nth-child(3){margin-left:28px}.gx1-emph p{font-size:20px}}
@media(max-width:640px){.gx1-result-num{font-size:40px}.gx1-result-before{font-size:26px}.gx1-result-arrow{font-size:24px;margin:0 8px}}

/* 14 커뮤니티 증명 + 범위 선언 */
.gx1-gallery{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr) minmax(0,1fr);gap:14px;margin-top:44px}
.gx1-shot{border-radius:18px;background:#161616}
.gx1-shot--wide{aspect-ratio:16/9}
.gx1-declare{max-width:780px;margin:36px auto 0;border:2px dashed var(--g);border-radius:20px;padding:30px 28px;text-align:center;background:rgba(34,181,115,.06)}
.gx1-declare p{margin:0;font-size:19px;font-weight:700;line-height:1.8;color:#fff}
.gx1-declare em{font-style:normal;color:var(--g)}
.gx1-declare .gx1-declare-note{margin-top:14px;padding-top:14px;border-top:1px solid rgba(34,181,115,.25);font-size:15px;font-weight:600;color:#a9dcc3}
@media(max-width:760px){.gx1-gallery{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.gx1-shot--wide{grid-column:1/-1}.gx1-shot--tall{aspect-ratio:4/5}}
@media(max-width:640px){.gx1-declare{padding:24px 18px}.gx1-declare p{font-size:16px}.gx1-declare .gx1-declare-note{font-size:14px}}

/* 15 희소성 + 클로징 (#contact) — 정원·마감 + 강의 정보 + FAQ + 결제 */
#contact{scroll-margin-top:96px}
.gx1-scarcity{max-width:680px;margin:24px auto 0}
.gx1-scarce{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.gx1-scarce-tile{background:#fff;border:2px solid #fff;border-radius:22px;padding:28px 24px;text-align:center}
.gx1-scarce-tile--hot{border-color:#e23b3b}
.gx1-scarce-label{margin:0 0 10px;font-size:15px;font-weight:800;color:#666}
.gx1-scarce-value{margin:0;font-size:34px;font-weight:900;line-height:1.2;color:#141414}
.gx1-scarce-tile--hot .gx1-scarce-value{color:#e23b3b}
.gx1-sub-t{font-size:22px;font-weight:800;margin:56px 0 18px;text-align:center}
.gx1-h2+.gx1-sub-t{margin-top:32px}
.gx1-info{width:100%;border-collapse:separate;border-spacing:0;background:#fff;border:1px solid #eee;border-radius:16px;overflow:hidden}
.gx1-info th,.gx1-info td{padding:18px 20px;text-align:left;font-size:16px;border-bottom:1px solid #f0f0f0;vertical-align:top}
.gx1-info tr:last-child th,.gx1-info tr:last-child td{border-bottom:none}
.gx1-info th{width:120px;background:var(--cream);font-weight:800;color:#333;white-space:nowrap}
.gx1-info td{font-weight:600;color:#141414;line-height:1.6}
/* 얼리버드 가격 표기 공통 — 정가 취소선 + 얼리버드 강조 + 할인율 */
.gx1-price{display:inline-flex;flex-wrap:wrap;align-items:baseline;justify-content:center;gap:2px 8px}
.gx1-price-was{font-size:.68em;font-weight:700;color:#9a9a9a}
.gx1-price-now{font-weight:900;color:var(--g)}
.gx1-price-rate{align-self:center;font-size:12px;font-weight:800;line-height:1.4;color:#fff;background:#e23b3b;border-radius:50px;padding:3px 9px;white-space:nowrap}
.gx1-price-until{flex-basis:100%;font-size:12px;font-weight:600;color:#9a9a9a}
.gx1-vat{font-size:13px;color:#999;font-weight:600;margin-left:4px}
.gx1-price .gx1-vat{margin-left:0;align-self:center}
.gx1-info .gx1-price{justify-content:flex-start}
.gx1-info .gx1-price-was{font-size:14px}
.gx1-info .gx1-price-now{font-size:18px}
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
.gx1-enroll-card .gx1-pay-btn{width:100%;min-width:0}
.gx1-price-notice{margin:12px 0 0;padding:14px 16px;border-radius:14px;background:rgba(226,59,59,.12);border:1px solid rgba(226,59,59,.4);color:#ffb4b4;font-size:15px;font-weight:800;line-height:1.5;text-align:center}
.gx1-enroll-note{max-width:680px;margin:18px auto 0;font-size:12px;color:#9a9a9a;line-height:1.7;text-align:center}
.gx1-refund{list-style:none;max-width:680px;margin:8px auto 0;padding:0;display:flex;flex-direction:column;gap:4px}
.gx1-refund li{position:relative;padding-left:12px;font-size:12px;color:#9a9a9a;line-height:1.7}
.gx1-refund li::before{content:'·';position:absolute;left:0;top:0}
@media(max-width:640px){.gx1-scarce{grid-template-columns:minmax(0,1fr)}.gx1-scarce-value{font-size:30px}.gx1-sub-t{font-size:19px;margin-top:44px}.gx1-info th,.gx1-info td{padding:14px;font-size:14px}.gx1-info th{width:84px}.gx1-enroll-cards{grid-template-columns:minmax(0,1fr)}.gx1-enroll-price{font-size:20px}}

/* 우하단 플로팅 결제 버튼 — safe-area 대응, 그린 발광(2.5초 주기, 최대 24px) */
.gx1-fab{position:fixed;right:calc(24px + env(safe-area-inset-right));bottom:calc(24px + env(safe-area-inset-bottom));z-index:60;display:inline-flex;align-items:center;justify-content:center;max-width:calc(100vw - 48px - env(safe-area-inset-left) - env(safe-area-inset-right));padding:16px 26px;border:none;border-radius:999px;background:var(--g);color:#fff;font-size:16px;font-weight:800;font-family:inherit;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.35),0 0 10px rgba(34,181,115,.35);transition:opacity .3s ease,transform .3s ease;animation:gx1Glow 2.5s ease-in-out infinite}
.gx1-fab:hover{filter:brightness(1.05)}
.gx1-fab.is-hidden{opacity:0;transform:translateY(16px) scale(.96);pointer-events:none}
@keyframes gx1Glow{0%,100%{box-shadow:0 6px 18px rgba(0,0,0,.35),0 0 10px rgba(34,181,115,.35)}50%{box-shadow:0 6px 18px rgba(0,0,0,.35),0 0 24px rgba(34,181,115,.7)}}
@media(max-width:480px){.gx1-fab{padding:14px 20px;font-size:15px}}
@media(prefers-reduced-motion:reduce){.gx1-fab{animation:none;transition:none;box-shadow:0 6px 18px rgba(0,0,0,.35),0 0 16px rgba(34,181,115,.5)}}
`;

export default function GxClass() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  // 숫자 증명 — null 이면 최종값 표시(기본). 섹션 진입 시 0 부터 카운트업
  const [proofCounts, setProofCounts] = useState<number[] | null>(null);
  // 우하단 플로팅 결제 버튼 — 히어로가 보이면 숨김, 스크롤하면 등장, 결제 섹션(#contact)에 닿으면 다시 숨김.
  // 본문이 아니라 결제 CTA 의 중복 진입점이라, 판정 전(첫 렌더)에는 숨겨서 히어로 위 깜빡임을 막는다.
  const [fabShown, setFabShown] = useState(false);

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

    // 3) 플로팅 버튼 노출 — 히어로가 보이는 동안 숨김, 결제 섹션에 "도달"하면 숨김.
    //    결제 섹션을 지나 푸터로 내려가도(섹션이 화면 위로 사라져도) 계속 숨긴다.
    const heroEl = root.querySelector("#gx1-hero");
    const contactEl = root.querySelector("#contact");
    let heroVisible = !!heroEl;
    let contactReached = false;
    const syncFab = () => setFabShown(!heroVisible && !contactReached);
    const heroIo = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        heroVisible = e.isIntersecting;
      });
      syncFab();
    });
    // 판정 영역을 화면 위쪽으로 크게 늘려 "결제 섹션 상단이 화면 하단을 넘었는가" 하나의 경계만 본다.
    // 섹션을 지나 푸터에 있다가 한 번에 위로 점프해도(섹션이 화면에 한 번도 안 걸려도)
    // 이 경계는 반드시 넘으므로 콜백이 온다 — 가시성만 보면 점프 시 상태가 갱신되지 않는다.
    const reachIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          contactReached = e.isIntersecting;
        });
        syncFab();
      },
      { rootMargin: "100000px 0px 0px 0px" },
    );
    if (heroEl) heroIo.observe(heroEl);
    if (contactEl) reachIo.observe(contactEl);

    // 4) 악순환 도식 — 처음 보일 때 순환 시작, 화면 밖이면 일시정지(배터리).
    //    클래스만 토글하므로 스크립트가 없으면 정적 도식 그대로 보인다.
    const cycleEl = root.querySelector("#gx1-cycle");
    const cycleIo = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-live");
          e.target.classList.remove("is-paused");
        } else {
          e.target.classList.add("is-paused");
        }
      });
    });
    if (cycleEl) cycleIo.observe(cycleEl);

    return () => {
      revealIo.disconnect();
      proofIo.disconnect();
      heroIo.disconnect();
      reachIo.disconnect();
      cycleIo.disconnect();
      cycleEl?.classList.remove("is-live", "is-paused");
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
        {/* 배경 단체사진 — 로드 실패 시 이미지만 숨기고 다크 배경 유지 */}
        <div className="gx1-hero-bg">
          <Image
            ref={markImage}
            src={IMAGES.community}
            alt=""
            fill
            preload
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "center 60%" }}
            onError={(e) =>
              e.currentTarget.parentElement?.classList.add("is-broken")
            }
          />
        </div>
        <div className="gx1-hero-ov" aria-hidden="true" />
        <div className="gx1-wrap gx1-hero-in">
          <p className="gx1-hero-kicker">{CLASS_NAME}</p>
          <h1 className="gx1-hero-h1">
            체험은 오는데,
            <br />
            등록이 안 됩니다.
          </h1>
          <p className="gx1-hero-sub">
            그룹운동에서 신규 전환과 재등록을
            <br className="gx1-br-m" /> 시스템으로 만드는 100분
          </p>
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
        </div>
      </section>

      {/* ── 2. 고객 대사 ── */}
      <section className="gx1-sec gx1-dark2">
        <div className="gx1-wrap">
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
          <p className="gx1-cause-body gx1-reveal">
            회원이 나가는 이유는 만료 시점에 만들어지지 않습니다.
            <br />
            등록 직후 적응하지 못하고, 관계가 생기지 않고, 변화를 느끼지 못한
            채 시간이 지나면 만료일은 결과일 뿐입니다.
          </p>
        </div>
      </section>

      {/* ── 4. 손실 확대 — 악순환 ── */}
      <section className="gx1-sec gx1-dark">
        <div className="gx1-wrap">
          <div
            id="gx1-cycle"
            className="gx1-cycle gx1-reveal"
            role="img"
            aria-label="광고, 신규 등록, 매출 발생, 회원 이탈을 거쳐 다시 광고로 돌아오는 악순환"
          >
            {/* 중앙 뒤 옅은 회전 링 (장식) */}
            <span className="gx1-cycle-ring" aria-hidden="true" />
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
                <g key={a.d}>
                  <path
                    className={a.loss ? "gx1-cycle-arc--loss" : undefined}
                    d={a.d}
                    fill="none"
                    stroke={a.loss ? "#e23b3b" : "#22B573"}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={a.loss ? "10 9" : undefined}
                    markerEnd={`url(#${a.loss ? "gx1-arr-loss" : "gx1-arr"})`}
                  />
                  {/* 초록 구간 위를 흐르는 빛 (다시 광고 점선은 선 자체가 역방향으로 흐른다) */}
                  {a.loss ? null : (
                    <path
                      className="gx1-cycle-flow"
                      d={a.d}
                      fill="none"
                      stroke="#e9fff4"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="3 13"
                    />
                  )}
                </g>
              ))}
            </svg>
            {/* 궤도를 도는 빛 입자 — 노드보다 아래에 깔려 글자를 가리지 않는다 */}
            <span className="gx1-cycle-orbit" aria-hidden="true">
              <span className="gx1-cycle-dot" />
            </span>
            {CYCLE_NODES.map((n, i) => (
              <div
                key={n.label}
                aria-hidden="true"
                className={`gx1-cycle-node${n.loss ? " gx1-cycle-node--loss" : ""}`}
                // --gx1-p: 순환 순서(0~3) — 입자가 도착하는 시점에 맞춰 점등을 지연
                style={{ left: n.left, top: n.top, "--gx1-p": i } as React.CSSProperties}
              >
                {n.label}
              </div>
            ))}
            <span className="gx1-cycle-again" aria-hidden="true">
              다시 광고
            </span>
            <div className="gx1-cycle-center" aria-hidden="true">
              신규 의존 악순환
            </div>
          </div>
          <h2 className="gx1-h2 gx1-cycle-copy gx1-reveal">
            이 고리가 반복되면
            <br />
            매출은 <span className="gx1-loss">매달 0에서</span> 다시
            시작합니다.
          </h2>
        </div>
      </section>

      {/* ── 5. 왜 다들 못 하는가 (승부처) ── */}
      <section className="gx1-sec gx1-cream">
        <div className="gx1-wrap">
          <h2 className="gx1-h2 gx1-h2--xl gx1-reveal">
            그룹운동 교육은 프로그램을 가르칩니다.
            <br />
            <em>운영</em>을 가르치는 곳이 없습니다.
          </h2>
          <div className="gx1-vs">
            <div className="gx1-vs-card gx1-vs-card--common gx1-reveal">
              <span className="gx1-vs-tag">흔한 교육</span>
              <ul className="gx1-vs-list">
                {COMMON_EDU.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <p className="gx1-vs-result">
                <span aria-hidden="true">→</span>
                수업은 좋아지지만 매출은 그대로입니다
              </p>
            </div>
            <div className="gx1-vs-arrow" aria-hidden="true">
              →
            </div>
            <div className="gx1-vs-card gx1-vs-card--need gx1-reveal">
              <span className="gx1-vs-tag">필요한 것</span>
              <ul className="gx1-vs-list">
                {NEED_EDU.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <p className="gx1-vs-result">
                <span aria-hidden="true">→</span>
                같은 수업으로 <em>매출이 달라집니다</em>
              </p>
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
          <div className="gx1-elems gx1-stagger">
            {ELEMENTS.map((e) => (
              <div key={e.title} className="gx1-elem gx1-reveal">
                <h3>{e.title}</h3>
                <p>{e.desc}</p>
              </div>
            ))}
          </div>
          <p className="gx1-after gx1-reveal">
            네 가지가 <em>매주 반복될 때</em> 매출이 반복됩니다.
          </p>
        </div>
      </section>

      {/* ── 7. 해답 선언 — 3축 ── */}
      <section className="gx1-sec gx1-dark2">
        <div className="gx1-wrap">
          <h2 className="gx1-h2 gx1-reveal">
            <em>신규 전환</em> × <em>재등록</em> × <em>운영 루틴</em>
          </h2>
          <p className="gx1-lead gx1-reveal">
            들어온 고객을 등록시키고, 등록한 회원이 계속 다니게 만드는 구조를
            다룹니다.
          </p>
          <div className="gx1-axes gx1-stagger">
            {AXES.map((a, i) => (
              <div key={a.title} className="gx1-axis gx1-reveal">
                <div className="gx1-axis-no">{i + 1}</div>
                <h3>{a.title}</h3>
                <span className="gx1-axis-part">{a.part}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. 증거 ── */}
      <section className="gx1-sec gx1-dark" id="gx1-proof">
        <div className="gx1-wrap">
          <div className="gx1-proof gx1-stagger">
            {PROOF_STATS.map((s, i) => (
              <div key={s.label} className="gx1-proof-card gx1-reveal">
                <p className="gx1-proof-label">{s.label}</p>
                <p className="gx1-proof-num">
                  {fmtNum(proofCounts?.[i] ?? s.target, s.decimals)}
                  <small>{s.suffix}</small>
                </p>
                <p className="gx1-proof-basis">{s.basis}</p>
              </div>
            ))}
          </div>
          <div className="gx1-evidence">
            <div className="gx1-evidence-shots gx1-stagger">
              {PROOF_SHOTS.map((t) => (
                <figure key={t.src} className="gx1-evidence-fig gx1-reveal">
                  <div
                    className="gx1-evidence-shot gx1-media"
                    style={{ aspectRatio: t.ratio }}
                  >
                    <GxImg
                      src={t.src}
                      alt={t.alt}
                      sizes="(max-width: 760px) 100vw, 420px"
                      position="center top"
                    />
                  </div>
                  <figcaption>{t.caption}</figcaption>
                </figure>
              ))}
            </div>
            <p className="gx1-evidence-note gx1-reveal">
              2026년 1~7월 실제 등록 기록 · 회원 정보는 가림 처리
            </p>
          </div>
        </div>
      </section>

      {/* ── 9. 강사 서사 ── */}
      <section className="gx1-sec gx1-white">
        <div className="gx1-wrap">
          <h2 className="gx1-h2 gx1-reveal">
            4년간의 시행착오에서 나온 방법입니다.
          </h2>
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
              <div className="gx1-bio">
                {BIO.map((b) => (
                  <p key={b}>{b}</p>
                ))}
              </div>
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
          <span className="gx1-kicker gx1-reveal">커리큘럼 1부</span>
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
                <p>{p.desc}</p>
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
                <li key={step.title} className="gx1-tl-item gx1-reveal">
                  <span className="gx1-tl-node">{i + 1}</span>
                  <p className="gx1-tl-title">{step.title}</p>
                  <p className="gx1-tl-desc">{step.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── 12. 커리큘럼 2부 ── */}
      <section className="gx1-sec gx1-cream">
        <div className="gx1-wrap">
          <span className="gx1-kicker gx1-reveal">커리큘럼 2부</span>
          <h2 className="gx1-h2 gx1-reveal">
            1개 지점에서 월 평균 매출 <em>3,500만 원</em>을 만드는
            <br />
            재등록 방법 &amp; 운영 루틴
          </h2>
          <div className="gx1-parts gx1-parts--3 gx1-stagger">
            {PART2.map((p, i) => (
              <div key={p.title} className="gx1-part gx1-reveal">
                <p className="gx1-part-no">{CIRCLED[i]}</p>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
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
                <p>{lv.desc}</p>
                <div className="gx1-stair-bar" aria-hidden="true">
                  {REREG_LEVELS.map((_, k) => (
                    <span key={k} className={k <= i ? "on" : undefined} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="gx1-result gx1-reveal">
            <p className="gx1-result-label">재등록률</p>
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

      {/* ── 14. 커뮤니티 증명 + 범위 선언 ── */}
      <section className="gx1-sec gx1-dark">
        <div className="gx1-wrap">
          <h2 className="gx1-h2 gx1-reveal">
            회원이 <em>회원 때문에</em> 남습니다.
          </h2>
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
              이미 운영 중인 수업과 회원으로 <em>매출을 만드는 구조</em>를
              다룹니다.
            </p>
            <p className="gx1-declare-note">
              FIST X 사례는 정답이 아니라 참고할 실제 기록입니다.
            </p>
          </div>
        </div>
      </section>

      {/* ── 15. 희소성 + 클로징 (#contact) — 정원·마감 + 강의 정보 + FAQ + 결제.
          기존 CTA·외부 링크의 #contact 앵커가 이 섹션을 가리킨다. ── */}
      <section className="gx1-sec gx1-dark" id="contact">
        <div className="gx1-wrap gx1-narrow">
          <h2 className="gx1-h2 gx1-reveal">강의 정보 및 신청</h2>
          <h3 className="gx1-sub-t gx1-reveal">강의 정보</h3>
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
                  <EarlybirdPrice />
                </td>
              </tr>
            </tbody>
          </table>

          <h3 className="gx1-sub-t gx1-reveal">자주 묻는 질문</h3>
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
                정상가로 신청하기
              </button>
            </div>
            <div className="gx1-enroll-card gx1-enroll-card--sale gx1-reveal">
              <span className="gx1-enroll-badge">선착순 마감</span>
              <p className="gx1-enroll-tag">얼리버드</p>
              <p className="gx1-enroll-price">
                <EarlybirdPrice />
              </p>
              <button
                type="button"
                className="gx1-pay-btn gx1-pay-btn--sale gx1-pulse"
                onClick={() => goCheckout(PRODUCT_EARLY)}
              >
                얼리버드 할인가로 신청하기
              </button>
            </div>
          </div>
          {/* 희소성 블록 — 정원 · 얼리버드 마감(EARLYBIRD_UNTIL 에서 자동 계산) · 가격 인상 예고 */}
          <div className="gx1-scarcity gx1-reveal">
            <div className="gx1-scarce">
              <div className="gx1-scarce-tile">
                <p className="gx1-scarce-label">정원</p>
                <p className="gx1-scarce-value">{formatCapacity(CAPACITY)}</p>
              </div>
              <div className="gx1-scarce-tile gx1-scarce-tile--hot">
                <p className="gx1-scarce-label">얼리버드 마감</p>
                <p className="gx1-scarce-value">
                  {formatDeadline(EARLYBIRD_UNTIL)}
                </p>
              </div>
            </div>
            <p className="gx1-price-notice">
              다음 차수부터 수강료가 인상될 예정입니다.
            </p>
          </div>

          <p className="gx1-enroll-note gx1-reveal">[환불 규정 안내]</p>
          <ul className="gx1-refund gx1-reveal">
            <li>
              현재 신청문의가 많아 정원이 마감될 경우 100%환불조치 해드리고
              있습니다.
            </li>
            <li>
              강의 신청후 개인적 사유 환불의 경우 강의날 기준 5일전까지 100%
              환불을 진행해드리고 있습니다.
            </li>
          </ul>
        </div>
      </section>

      {/* ── 우하단 플로팅 결제 버튼 ── */}
      <button
        type="button"
        className={`gx1-fab${fabShown ? "" : " is-hidden"}`}
        inert={!fabShown}
        onClick={() => goCheckout(PRODUCT_EARLY)}
      >
        얼리버드 할인가로 신청하기
      </button>
    </div>
  );
}
