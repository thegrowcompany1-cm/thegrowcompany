"use client";

// ─────────────────────────────────────────────────────────────────────────────
// /edu/sales-ops3 — 같은 세미나를 "후킹 → 문제 구체화 → 증거 → 수강 결과물 → 결제" 순서로
// 다시 짠 전환율 비교용 테스트 랜딩. 기존 /edu/sales-ops, /edu/sales-ops2 는 건드리지 않았다.
//
//  · 클래스 접두사 so3-, 상수 접두사 SO3_. 이미지·영상·가격은 기존 경로·lib/salesOps.ts 를 그대로 참조한다.
//  · 결제: components/edu/SalesOpsPay.tsx 를 수정 없이 사용. 랜딩 구분값(landing="sales-ops3")은
//    이 파일이 결제 버튼 클릭 직후 신청 정보(sessionStorage)에 덧붙인다.
//  · 연출은 GSAP + ScrollTrigger(기존 의존성). 640px 이하 또는 prefers-reduced-motion 이면 GSAP 을
//    불러오지도 않고 핀 고정·스크럽 없이 단순 페이드만 쓴다.
//  · fail-safe: 스크립트가 안 돌면 모든 섹션이 정적으로 전부 보인다 (so3-gsap / so3-anim 클래스가
//    붙은 경우에만 숨김·핀 연출).
//  · 측정 이벤트: view_item / apply_section_view / apply_click (+ 기존 begin_checkout, purchase 에 landing 포함)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import SalesOpsPay from "@/components/edu/SalesOpsPay";
import {
  SO_CAPACITY,
  SO_DATE,
  SO_LANDING_V3,
  SO_PLACE,
  SO_PRICE_NORMAL,
  SO_PRICE_STORY,
  SO_PRODUCT_NORMAL,
  SO_PRODUCT_STORY,
  SO_TIME,
  soFormatCapacity,
  soFormatPrice,
  soIsPending,
} from "@/lib/salesOps";
import {
  clearCheckoutPrefill,
  readCheckoutPrefill,
  saveCheckoutPrefill,
} from "@/lib/products";
import { so3Fb, so3FbCustom, so3Ga } from "@/lib/salesOps3Track";

// ── 이미지·영상 (기존 /edu/sales-ops 와 같은 경로) ───────────────────────────
const SO3_IMG = {
  hwang: "/edu/sales-ops/hwang-hyunjin.webp",
  kimHero: "/edu/sales-ops/kim-jaegang.webp",
  books: [
    { src: "/edu/sales-ops/salesbook1.png", title: "팔리는 한 문장은 다르다" },
    { src: "/edu/sales-ops/salesbook2.png", title: "잘 파는 사람은 이렇게 팝니다" },
    { src: "/edu/sales-ops/salesbook3.png", title: "세일즈, 말부터 바꿔라" },
    { src: "/edu/sales-ops/salesbook4.png", title: "설득의 정석" },
  ],
};
const SO3_VIDEOS = [1, 2, 3, 4].map((n) => ({
  src: `/edu/sales-ops/videos/sales-0${n}.mp4`,
  poster: `/edu/sales-ops/videos/sales-0${n}.jpg`,
}));

// ── 1. 히어로 ───────────────────────────────────────────────────────────────
const SO3_EYEBROW = "THE GROW × REAL SALES · 2026.11.21 SAT";
const SO3_TARGET = "피트니스 대표 · 원장 · 실장 · 트레이너를 위한 실전 교육";
const SO3_HEADLINE = "회원이 없어서가 아니라, 등록시키는 방법의 문제입니다";
const SO3_EM = "상담을 등록으로, 등록을 재등록으로.";
const SO3_SUB = "매출을 만드는 세일즈 언어와 운영 시스템, 4시간에 배웁니다.";
const SO3_CHIPS = ["김재강 · 운영", "황현진 · 세일즈", "4시간 집중 교육"];

// ── 2. 매출이 새는 곳 ───────────────────────────────────────────────────────
const SO3_FUNNEL_TITLE = "매출은 네 번의 순간에서 새어 나갑니다";
// part 는 이 강의의 어느 파트가 다루는지 (1부 운영 / 2부 세일즈)
const SO3_FUNNEL = [
  { name: "문의", leak: "문의는 오는데 방문 약속으로 이어지지 않습니다", part: "1부 운영", bar: 100 },
  { name: "상담", leak: "시설·가격 설명만 하다 결정을 미루게 만듭니다", part: "2부 세일즈", bar: 82 },
  { name: "등록", leak: "\"생각해 볼게요\"에 대응할 한 마디가 없습니다", part: "2부 세일즈", bar: 64 },
  { name: "재등록", leak: "첫 4주 관리가 없어 만료와 함께 떠납니다", part: "1부 운영 · 2부 세일즈", bar: 46 },
];

// ── 3. 상담 장면 + 하수 vs 고수 (기존 /edu/sales-ops 카피 그대로) ────────────
const SO3_TALKS = [
  { line: "회원님, 가격 대비 저희 시설과 기구가 최고죠!", diag: "주장만 늘어놓는 설득" },
  { line: "3개월보단 12개월이 훨씬 저렴하니까 이렇게 하세요.", diag: "이성적 설득에만 집착" },
  { line: "주사요? 에이~ 살 빼려면 땀을 흘리셔야죠.", diag: "회원의 반응에 직설적으로 반박" },
];

// ── 4. 증거 ① 황현진 ────────────────────────────────────────────────────────
const SO3_HWANG_HEADLINE = "대한민국 세일즈교육&컨설팅 섭외 0순위, 세일즈작가 황현진";
const SO3_HWANG_BIO = [
  "현 리얼세일즈(주) 대표",
  "대한민국 1등 기업들이 찾는 세일즈대본 개발·화법컨설팅 마스터",
  "피트니스 프랜차이즈 세일즈 특강 다수",
  "전 NS홈쇼핑 (홈쇼핑 최다매출 기네스 기록)",
];

// ── 5. 증거 ② 김재강 ────────────────────────────────────────────────────────
const SO3_KIM_HEADLINE = "회원은 사람을 보고 등록하고, 시스템을 보고 재등록합니다";
const SO3_KIM_BODY = [
  "상담도, CS도, 재등록도, 직원 교육도 원장 한 사람을 거친다면 원장이 빠지는 날 매출도 같이 빠집니다.",
  "1부에서는 500개 이상 센터 대표님들과 함께하면서 정리한 운영 · CS · 시스템 기준을 그대로 공개합니다.",
];
const SO3_KIM_EM = "감이 아니라 숫자로, 사람이 아니라 구조로.";
const SO3_KIM_ROLE = "(주)더그로우컴퍼니 대표이사 김재강";
const SO3_KIM_STATS = ["52개 센터 총괄", "10년 운영 데이터", "수백 명 조직 리딩"];
const SO3_OPS_CARDS = [
  { label: "운영", title: "숫자로 읽는 센터", body: "유효회원 · 객단가 · 상담 성공률 · 유지율, 매일 확인하는 운영판" },
  { label: "CS", title: "이탈을 막는 응대", body: "재등록이 결정되는 첫 4주 관리 루틴과 응대 기준" },
  { label: "시스템", title: "맡겨도 돌아가는 센터", body: "FC · 매니저 역할 분담과 원장 없이 돌아가는 업무 기준" },
];
const SO3_SYS_LABEL = "GROW SYSTEM";
const SO3_SYS_TITLE = "원장이 없어도 센터가 돌아가는 이유";
const SO3_SYS_SUB = "더그로우가 운영하는 센터에서 매일 쓰는 운영 시스템 화면입니다";
const SO3_SYS_SCREENS = [
  { src: "/edu/sales-ops/ops/ops-01-promo.webp", name: "홍보일지", desc: "어디에 무엇을 뿌렸는지, 지도로 기록" },
  { src: "/edu/sales-ops/ops/ops-02-dashboard.webp", name: "대시보드", desc: "유효회원·만료·매출·이탈 위험을 한 화면에" },
  { src: "/edu/sales-ops/ops/ops-03-today.webp", name: "오늘 할 일", desc: "재등록·미가입 콜 대상을 매일 자동으로" },
  { src: "/edu/sales-ops/ops/ops-04-pt.webp", name: "PT 관리", desc: "트레이너별 매출·재등록률·잔여 세션" },
];
const SO3_SYS_ROTATE_MS = 3500;

// ── 6. 수강하면 가져가는 것 ─────────────────────────────────────────────────
// 실제 제공물(대본·체크리스트·운영표 등)은 확정 후 여기에 채운다. 최대 4칸. 비어 있으면 섹션이 숨겨진다.
// 예) { title: "제목", body: "한두 줄 설명" }
export type So3Takeaway = { title: string; body: string };
const SO3_TAKEAWAYS_TITLE = "4시간 뒤, 센터에 바로 적용할 것들";
const SO3_TAKEAWAYS: So3Takeaway[] = [];

// ── 7. 커리큘럼 · 타임테이블 (기존 그대로) ──────────────────────────────────
const SO3_QUOTES = [
  "운동이 적금이라면, 주사는 대출입니다.",
  "도화지 10장에 그리는 그림 vs 100장에 그리는 그림, 어떤 완성도를 원하세요?",
  "시간이 없는 게 아니라, 회원님의 배터리가 방전된 겁니다.",
];
const SO3_PARTS = [
  {
    time: "1부 13:00~15:00",
    speaker: "김재강 대표",
    title: "운영치트키",
    keys: [
      {
        tag: "1st Key",
        name: "숫자의 기술",
        points: [
          "유효회원·객단가·상담 성공률·유지율로 센터 보기",
          "매출 정체 구간에서 먼저 볼 지표",
          "매일 확인하는 운영판",
        ],
        quotes: [] as string[],
      },
      {
        tag: "2nd Key",
        name: "위임의 기술",
        points: [
          "FC·매니저 역할 분담과 판단 기준",
          "대표가 없어도 돌아가는 업무 분장",
          "재등록은 첫 4주에 정해진다",
        ],
        quotes: [] as string[],
      },
    ],
  },
  {
    time: "2부 15:00~17:00",
    speaker: "황현진 대표",
    title: "매출치트키",
    keys: [
      {
        tag: "1st Key",
        name: "권유의 기술",
        points: ["회원의 마음을 여는 질문 한 줄", "몰입시키는 한 줄 권유화법", "현장에서 검증된 실전 화법"],
        quotes: SO3_QUOTES,
      },
      {
        tag: "2nd Key",
        name: "호감의 기술",
        points: [
          "회원은 '좋은 사람'이 권하는 '좋아 보이는 것'을 선택합니다",
          "세일즈 초고수들의 필승 전략",
          "이탈을 막고 재등록률을 끌어올리는 실천 전략",
        ],
        quotes: [] as string[],
      },
    ],
  },
];

// ── 8. 결제 ─────────────────────────────────────────────────────────────────
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const SO3_STEPS = [
  "포스터 저장",
  "@thegrow.company 태그하고 스토리 업로드",
  `인스타 아이디 입력 후 ${won(SO_PRICE_STORY)} 결제`,
];

// ── 9. 클로징 ───────────────────────────────────────────────────────────────
const SO3_CLOSING = [
  ["당신의 일은 단지 운동을 가르치는 것이 아닙니다.", "누군가가 자신을 더 사랑할 수 있게끔 돕는 일입니다."],
  ["최고의 전문성을 갖춘 스스로에게", "이제 날개를 달아줄 '세일즈 언어'를 선물하세요."],
];

/** 사이트 공통 헤더(상단 고정) 높이 — 핀 고정 구간이 헤더 밑에서 시작하도록 */
const HEADER_OFFSET = 100;

// ── 이미지 컴포넌트 (기존 SoImg 와 같은 방식: 로드 전 플레이스홀더, 실패 시 유지) ─
function markImage(img: HTMLImageElement | null) {
  if (!img || !img.complete) return;
  img.parentElement?.classList.add(img.naturalWidth > 0 ? "is-loaded" : "is-broken");
}

function So3Img({
  src,
  alt,
  sizes,
  fit = "cover",
  position = "center",
  priority = false,
}: {
  src: string;
  alt: string;
  sizes: string;
  fit?: "cover" | "contain";
  position?: string;
  priority?: boolean;
}) {
  return (
    <>
      <span className="so3-img-ph" aria-hidden="true">
        이미지 준비 중
      </span>
      <Image
        ref={markImage}
        src={src}
        alt={alt}
        fill
        priority={priority}
        draggable={false}
        sizes={sizes}
        style={{ objectFit: fit, objectPosition: position }}
        onLoad={(e) => e.currentTarget.parentElement?.classList.add("is-loaded")}
        onError={(e) => e.currentTarget.parentElement?.classList.add("is-broken")}
      />
    </>
  );
}

/** 열쇠 SVG — 오른쪽 끝에 한 단 튀어나온 이음새가 있고, 상대 열쇠(180° 회전)와 맞물린다 */
function KeyShape() {
  return (
    <svg viewBox="0 0 400 100" aria-hidden="true" focusable="false">
      <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeWidth="10" />
      <circle cx="50" cy="50" r="9" fill="currentColor" />
      <path d="M86 36 H400 V50 H372 V64 H86 Z" fill="currentColor" />
    </svg>
  );
}

const SO3_STYLE = `
.so3{--g:#22B573;--dark:#0A0A0A;--dark2:#0d0d0d;--cream:#FBF8EC;font-family:'Pretendard','Noto Sans KR',-apple-system,BlinkMacSystemFont,system-ui,'Apple SD Gothic Neo',sans-serif;letter-spacing:-.01em;color:#141414;background:#fff;width:100%;max-width:100%;overflow-x:clip;word-break:keep-all;overflow-wrap:anywhere}
.so3 *{box-sizing:border-box}
.so3-wrap{max-width:1080px;margin:0 auto;padding:0 20px}
.so3-sec{padding:96px 0}
.so3-dark{background:var(--dark);color:#fff}
.so3-dark2{background:var(--dark2);color:#fff}
.so3-cream{background:var(--cream);color:#141414}
.so3-white{background:#fff;color:#141414}
.so3-h2{font-size:34px;font-weight:800;line-height:1.4;text-align:center;margin:0 0 16px;text-wrap:balance}
.so3-h2 em{font-style:normal;color:var(--g)}
@media(max-width:640px){.so3-sec{padding:68px 0}.so3-h2{font-size:25px}.so3-wrap{padding:0 16px}}

/* fail-safe reveal — 기본 표시. 루트에 so3-anim 이 붙은 경우에만 숨김 후 등장 (모션 축소면 즉시 표시) */
.so3.so3-anim .so3-reveal{opacity:0;transform:translateY(24px);transition:opacity .7s ease,transform .7s ease}
.so3.so3-anim .so3-reveal.so3-in{opacity:1;transform:none}
.so3.so3-anim .so3-stagger>.so3-reveal:nth-child(2){transition-delay:.08s}
.so3.so3-anim .so3-stagger>.so3-reveal:nth-child(3){transition-delay:.16s}
.so3.so3-anim .so3-stagger>.so3-reveal:nth-child(4){transition-delay:.24s}
@media(prefers-reduced-motion:reduce){.so3.so3-anim .so3-reveal{opacity:1;transform:none;transition:none}}

.so3-media{position:relative;overflow:hidden}
.so3-img-ph{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:12px;text-align:center;font-size:13px;font-weight:700;color:#8a8a8a;background:repeating-linear-gradient(45deg,rgba(128,128,128,.08) 0 12px,rgba(128,128,128,.15) 12px 24px)}
.so3-media.is-loaded .so3-img-ph{display:none}
.so3-media.is-broken img{visibility:hidden}

/* 1. 히어로 */
.so3-hero{background:var(--dark);color:#fff;padding:72px 0 80px;overflow:hidden}
.so3-hero-in{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:48px;align-items:center}
.so3-hero-copy{min-width:0}
.so3-eyebrow{margin:0 0 14px;font-size:13px;font-weight:800;letter-spacing:.14em;color:var(--g)}
.so3-target{margin:0 0 18px;font-size:15px;font-weight:700;color:#C8D3CD}
.so3-h1{font-size:44px;font-weight:900;line-height:1.3;margin:0 0 14px;text-wrap:balance}
.so3-em{margin:0 0 10px;font-size:22px;font-weight:900;color:var(--g)}
.so3-sub{margin:0 0 22px;font-size:18px;line-height:1.65;color:#C8D3CD}
.so3-chips{list-style:none;margin:0 0 26px;padding:0;display:flex;flex-wrap:wrap;gap:8px}
.so3-chips li{font-size:13.5px;font-weight:800;color:#E4EBE7;background:rgba(255,255,255,.09);padding:8px 14px;border-radius:50px}
.so3-cta{display:inline-flex;align-items:center;justify-content:center;max-width:100%;padding:17px 34px;border-radius:50px;background:var(--g);color:#fff;font-size:17px;font-weight:800;text-decoration:none;box-shadow:0 10px 26px rgba(34,181,115,.28)}
.so3-price-line{margin:16px 0 0;font-size:14.5px;font-weight:700;line-height:1.6;color:#D3DCD7}
.so3-price-line b{color:#fff;font-weight:900}
.so3-people{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;width:100%;max-width:520px;margin:0 auto;min-width:0}
.so3-person{min-width:0;aspect-ratio:4/5;border-radius:20px;background:radial-gradient(120% 90% at 50% 18%,rgba(34,181,115,.34) 0%,rgba(34,181,115,.08) 55%,rgba(255,255,255,.03) 100%);border:1px solid rgba(34,181,115,.22)}
.so3-person .so3-img-ph{background:none;color:#5E6B65}
.so3-person::after{content:"";position:absolute;left:0;right:0;bottom:0;height:38%;background:linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,.66) 100%);pointer-events:none}
.so3-person-cap{position:absolute;z-index:2;left:12px;right:12px;bottom:12px;margin:0;text-align:left;font-size:12.5px;font-weight:700;line-height:1.45;color:#E4EBE7;text-shadow:0 1px 8px rgba(0,0,0,.6)}
.so3-person-cap b{display:block;font-size:17px;font-weight:900;color:#fff}
@media(max-width:860px){
  .so3-hero{padding:52px 0 76px}
  .so3-hero-in{grid-template-columns:minmax(0,1fr);gap:44px}
  .so3-h1{font-size:30px}
  .so3-em{font-size:19px}
  .so3-sub{font-size:16px}
  .so3-people{max-width:460px}
}
@media(max-width:640px){
  .so3-person{border-radius:16px}
  .so3-person-cap{left:10px;right:10px;bottom:10px;font-size:11.5px}
  .so3-person-cap b{font-size:15px}
}

/* 1-2. 열쇠 전환 — 기본(정적)은 맞물린 상태의 작은 띠, so3-gsap 이면 스크롤 연출용 핀 구간 */
.so3-keys{position:relative;background:var(--dark);color:#fff;overflow:hidden;padding:36px 0 64px}
.so3-keys-stage{position:relative;display:flex;align-items:center;justify-content:center;min-height:150px}
.so3-key-wrap{position:relative;display:flex;align-items:center;justify-content:center;width:100%}
.so3-key{position:relative;width:min(44vw,400px);flex:0 0 auto;color:#fff}
.so3-key svg{display:block;width:100%;height:auto}
.so3-key-b{margin-left:-28px}
.so3-key-b svg{transform:rotate(180deg);color:var(--g)}
.so3-key-lbl{position:absolute;top:50%;left:22%;right:22%;transform:translateY(-50%);text-align:center;font-size:clamp(11px,1.6vw,16px);font-weight:900;letter-spacing:.06em;color:var(--dark);pointer-events:none}
.so3-key-b .so3-key-lbl{color:#06331f}
.so3-key-glow{position:absolute;left:50%;top:50%;width:min(60vw,360px);aspect-ratio:1;margin:calc(min(60vw,360px)/-2) 0 0 calc(min(60vw,360px)/-2);border-radius:50%;background:radial-gradient(circle,rgba(34,181,115,.55) 0%,rgba(34,181,115,0) 68%);pointer-events:none}
.so3-key-wipe{display:none}
.so3-gsap .so3-keys{height:calc(100vh - ${HEADER_OFFSET}px);padding:0;display:flex;align-items:center}
.so3-gsap .so3-keys-stage{width:100%;min-height:0}
.so3-gsap .so3-key-wipe{display:block;position:absolute;left:50%;top:50%;width:260vmax;height:260vmax;margin:-130vmax 0 0 -130vmax;border-radius:50%;background:#fff;transform:scale(0);pointer-events:none}
@media(max-width:640px){.so3-key{width:46vw}.so3-key-b{margin-left:-16px}.so3-keys{padding:24px 0 44px}}

/* 2. 매출이 새는 곳 — 퍼널 */
.so3-funnel{padding:0}
.so3-fn-pin{padding:84px 0 88px}
.so3-gsap .so3-fn-pin{min-height:calc(100vh - ${HEADER_OFFSET}px);padding:36px 0 0;display:flex;flex-direction:column;justify-content:center}
.so3-fn-grid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:48px;align-items:center;max-width:960px;margin:40px auto 0}
.so3-fn-svg{width:100%;max-width:380px;height:auto;margin:0 auto;display:block}
.so3-fn-band polygon{fill:#E8E6DD;transition:fill .4s ease}
.so3-fn-band text{font-size:22px;font-weight:900;fill:#8a8a8a;transition:fill .4s ease}
.so3-fn-band.is-on polygon{fill:var(--g)}
.so3-fn-band.is-on text{fill:#fff}
.so3:not(.so3-gsap) .so3-fn-band polygon{fill:var(--g)}
.so3:not(.so3-gsap) .so3-fn-band text{fill:#fff}
.so3:not(.so3-gsap) .so3-stack-cap{display:none}
.so3-fn-rows{display:grid;gap:14px;min-width:0}
.so3-fn-row{min-width:0;background:var(--cream);border:1px solid rgba(20,20,20,.07);border-radius:18px;padding:20px 22px;transition:opacity .4s ease,box-shadow .4s ease,border-color .4s ease}
.so3-fn-head{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:0 0 8px}
.so3-fn-no{font-size:13px;font-weight:900;color:var(--g)}
.so3-fn-name{font-size:19px;font-weight:900}
.so3-fn-part{margin-left:auto;font-size:12.5px;font-weight:800;color:#0B6B3A;background:rgba(34,181,115,.14);padding:5px 12px;border-radius:50px}
.so3-fn-leak{margin:0;font-size:16.5px;font-weight:700;line-height:1.6}
.so3-fn-bar{display:none;height:8px;border-radius:8px;background:var(--g);margin:0 0 12px}
.so3-fn-prog{display:none}
.so3-gsap .so3-fn-row{opacity:.28}
.so3-gsap .so3-fn-row.is-on{opacity:1;border-color:var(--g);box-shadow:0 12px 30px rgba(34,181,115,.18)}
.so3-gsap .so3-fn-prog{display:block;height:3px;background:rgba(20,20,20,.08);border-radius:3px;max-width:960px;margin:28px auto 0;overflow:hidden}
.so3-fn-prog i{display:block;height:100%;width:100%;background:var(--g);transform:scaleX(0);transform-origin:0 50%}
@media(max-width:860px){.so3-fn-grid{grid-template-columns:minmax(0,1fr);gap:28px}}
@media(max-width:640px){
  .so3-fn-pin{padding:64px 0 68px}
  .so3-fn-svg{display:none}
  .so3-fn-bar{display:block}
  .so3-fn-part{margin-left:0}
}

/* 3. 상담 장면 + 하수 vs 고수 */
.so3-talks{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin:44px 0 0}
.so3-talk{min-width:0;display:flex;flex-direction:column;gap:12px}
.so3-bubble{flex:1 1 auto;position:relative;background:#fff;border:1px solid rgba(20,20,20,.08);border-radius:18px;padding:22px 20px;font-size:17px;font-weight:700;line-height:1.6;box-shadow:0 8px 24px rgba(20,20,20,.06);margin:0}
.so3-bubble::after{content:"";position:absolute;left:26px;bottom:-9px;width:16px;height:16px;background:#fff;border-right:1px solid rgba(20,20,20,.08);border-bottom:1px solid rgba(20,20,20,.08);transform:rotate(45deg)}
.so3-diag{align-self:flex-start;margin-top:8px;font-size:13px;font-weight:700;color:#6E6E6E;background:#E6E6E6;padding:7px 14px;border-radius:50px}
.so3-versus{display:grid;gap:12px;max-width:760px;margin:44px auto 0}
.so3-versus-row{background:var(--dark);color:#fff;border-radius:16px;padding:22px 24px;font-size:18px;font-weight:700;line-height:1.7;text-align:center;margin:0}
.so3-versus-row mark{background:none;color:var(--g);font-weight:900}
@media(max-width:860px){.so3-talks{grid-template-columns:minmax(0,1fr)}}
@media(max-width:640px){.so3-bubble{font-size:16px}.so3-versus-row{font-size:16px;padding:18px 16px}}

/* 4. 증거 ① 황현진 */
.so3-prof{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:44px;align-items:center;max-width:920px;margin:0 auto}
.so3-prof-photo{width:100%;max-width:340px;margin:0 auto;aspect-ratio:4/5;border-radius:22px;background:radial-gradient(120% 90% at 50% 20%,rgba(34,181,115,.32) 0%,rgba(34,181,115,.07) 60%,rgba(255,255,255,.03) 100%);border:1px solid rgba(34,181,115,.22)}
.so3-prof-photo .so3-img-ph{background:none;color:#5E6B65}
.so3-prof-h{font-size:26px;font-weight:900;line-height:1.5;margin:0 0 20px;text-wrap:balance}
.so3-bio{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.so3-bio li{position:relative;padding-left:18px;font-size:16px;line-height:1.65;color:#D3DCD7}
.so3-bio li::before{content:"";position:absolute;left:0;top:.62em;width:7px;height:7px;border-radius:50%;background:var(--g)}
.so3-sub-h{font-size:22px;font-weight:800;text-align:center;margin:72px 0 28px}
.so3-books{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}
.so3-book{min-width:0}
.so3-book .so3-media{aspect-ratio:374/552;border-radius:8px;background:#161616;box-shadow:0 14px 34px rgba(0,0,0,.5)}
.so3-book-t{margin:14px 2px 0;text-align:center;font-size:14.5px;font-weight:700;line-height:1.5;color:#E4EBE7}
@media(max-width:860px){.so3-prof{grid-template-columns:minmax(0,1fr);gap:28px}.so3-prof-h{font-size:22px;text-align:center}}
@media(max-width:640px){.so3-books{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 12px}.so3-sub-h{margin-top:56px;font-size:19px}}
.so3-vid{margin-top:84px}
.so3-vid-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}
.so3-vid-card{position:relative;min-width:0;aspect-ratio:9/16;border-radius:16px;overflow:hidden;background:#000}
.so3-vid-card video{display:block;width:100%;height:100%;object-fit:cover;background:#000}
.so3-vid-dots{display:none}
@media(max-width:640px){
  .so3-vid{margin-top:60px}
  .so3-vid-grid{position:relative;display:flex;align-items:flex-start;gap:12px;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;scrollbar-width:none;padding-inline:16px;scroll-padding-inline:16px;margin-inline:-16px}
  .so3-vid-grid::-webkit-scrollbar{display:none}
  .so3-vid-grid:focus-visible{outline:2px solid var(--g);outline-offset:-2px}
  .so3-vid-card{flex:0 0 78%;scroll-snap-align:start;border-radius:12px}
  .so3-vid-dots{display:flex;align-items:center;justify-content:center;margin-top:14px}
  .so3-vid-dot{display:flex;align-items:center;justify-content:center;width:26px;height:26px;padding:0;border:0;background:none;cursor:pointer}
  .so3-vid-dot::before{content:"";width:8px;height:8px;border-radius:999px;background:rgba(255,255,255,.28);transition:width .25s ease,background .25s ease}
  .so3-vid-dot.is-on::before{width:22px;background:var(--g)}
}

/* 5. 증거 ② 김재강 */
.so3-op-body{max-width:780px;margin:22px auto 0;text-align:center;font-size:18px;line-height:1.85;color:#3F3F3F}
.so3-op-body p{margin:0}
.so3-op-body p+p{margin-top:10px}
.so3-op-body .so3-op-em{margin-top:18px;font-weight:900;color:var(--g)}
.so3-kim-line{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;margin:26px 0 0}
.so3-kim-role{font-size:14px;font-weight:800;color:#0B6B3A;background:rgba(34,181,115,.14);padding:7px 14px;border-radius:50px}
.so3-kim-stat{font-size:14px;font-weight:800;color:#141414;background:#fff;border:1px solid rgba(20,20,20,.1);padding:7px 14px;border-radius:50px}
.so3-needs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin:44px 0 0}
.so3-need{min-width:0;background:var(--cream);border:1px solid rgba(20,20,20,.07);border-radius:20px;padding:30px 24px}
.so3-need-lbl{display:inline-block;margin:0 0 14px;font-size:13px;font-weight:800;color:#0B6B3A;background:rgba(34,181,115,.14);padding:6px 13px;border-radius:50px}
.so3-need-who{font-size:20px;font-weight:900;margin:0 0 10px}
.so3-need-body{margin:0;font-size:16px;line-height:1.75;color:#3A3A3A}
@media(max-width:860px){.so3-needs{grid-template-columns:minmax(0,1fr)}}
@media(max-width:640px){.so3-op-body{font-size:15.5px}}
.so3-sys{margin-top:84px;text-align:center}
.so3-sys-lbl{margin:0 0 12px;font-size:13px;font-weight:800;letter-spacing:.2em;color:var(--g)}
.so3-sys-title{margin:0 0 12px;font-size:30px;line-height:1.4;font-weight:900;text-wrap:balance}
.so3-sys-sub{margin:0 auto 30px;max-width:560px;font-size:16px;line-height:1.7;color:#555}
/* 운영 시스템 화면: 데스크톱은 스크롤 스택, 640px 이하·모션 축소는 원통 슬라이드 */
.so3-stack-box{display:block}
.so3-cyl-box{display:none}
@media(max-width:640px){.so3-stack-box{display:none}.so3-cyl-box{display:block}}
@media(prefers-reduced-motion:reduce){.so3-stack-box{display:none}.so3-cyl-box{display:block}}
.so3-stack-pin{padding:4px 0}
.so3-gsap .so3-stack-pin{padding-top:72px}
.so3-stack{--w:clamp(300px,calc((100vh - 400px) * 1.3333),560px);position:relative;width:var(--w);margin:0 auto;display:grid;gap:22px;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
.so3-stack-layer{position:relative;width:100%;aspect-ratio:4/3;border-radius:14px;background:#0F1413;border:1px solid rgba(20,20,20,.1);box-shadow:0 18px 44px rgba(20,20,20,.18);overflow:hidden}
.so3-stack-layer .so3-img-ph{background:none;color:#5E6B65}
.so3-stack-layer img,.so3-cyl-face img{pointer-events:none;-webkit-user-select:none;user-select:none;-webkit-user-drag:none;-webkit-touch-callout:none}
.so3-gsap .so3-stack{display:block;height:calc(var(--w) * .75)}
.so3-gsap .so3-stack-layer{position:absolute;left:0;top:0;will-change:transform}
.so3-mark{position:absolute;right:10px;bottom:8px;z-index:2;font-size:12px;font-weight:800;letter-spacing:.04em;color:rgba(255,255,255,.55);text-shadow:0 1px 4px rgba(0,0,0,.55);pointer-events:none;-webkit-user-select:none;user-select:none}
.so3-stack-cap{min-height:72px;margin-top:22px}
.so3-cap-in{display:flex;flex-direction:column;gap:6px;align-items:center;animation:so3-cap-in .6s ease both}
.so3-cap-in b{font-size:20px;font-weight:900}
.so3-cap-in span{font-size:15.5px;line-height:1.6;color:#555}
@keyframes so3-cap-in{from{opacity:0}to{opacity:1}}
@media(prefers-reduced-motion:reduce){.so3-cap-in{animation:none}}
.so3-cyl-wrap{overflow:hidden;padding:8px 0}
.so3-cyl-stage{--w:min(78vw,560px);position:relative;width:var(--w);height:calc(var(--w) * .75);margin:0 auto;perspective:1400px;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
.so3-cyl{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .9s cubic-bezier(.22,.61,.36,1)}
.so3-cyl-face{position:absolute;inset:0;border-radius:14px;background:#0F1413;border:1px solid rgba(20,20,20,.1);box-shadow:0 18px 44px rgba(20,20,20,.18);backface-visibility:hidden;-webkit-backface-visibility:hidden;opacity:.35;filter:brightness(.6);transition:opacity .9s cubic-bezier(.22,.61,.36,1),filter .9s cubic-bezier(.22,.61,.36,1)}
.so3-cyl-face.is-front{opacity:1;filter:none}
.so3-cyl-face .so3-img-ph{background:none;color:#5E6B65}
.so3-cyl-cap{min-height:72px;margin-top:26px}
.so3-sys-dots{display:flex;align-items:center;justify-content:center;margin-top:6px}
.so3-sys-dot{appearance:none;border:0;background:none;cursor:pointer;width:32px;height:32px;display:flex;align-items:center;justify-content:center;padding:0}
.so3-sys-dot::before{content:"";width:9px;height:9px;border-radius:50%;background:rgba(20,20,20,.2);transition:background-color .2s,transform .2s}
.so3-sys-dot.is-on::before{background:var(--g);transform:scale(1.25)}
.so3-sys-dot:focus-visible{outline:2px solid var(--g);outline-offset:-2px;border-radius:8px}
.so3-cyl-flat .so3-cyl{transform:none!important;transition:none}
.so3-cyl-flat .so3-cyl-face{transform:none!important;opacity:0;filter:none;transition:opacity .5s ease}
.so3-cyl-flat .so3-cyl-face.is-front{opacity:1}
@media(max-width:640px){
  .so3-sys{margin-top:64px}
  .so3-sys-title{font-size:23px}
  .so3-sys-sub{font-size:14.5px;margin-bottom:26px}
  .so3-cap-in b{font-size:18px}
  .so3-cap-in span{font-size:14.5px}
  .so3-mark{font-size:10.5px;right:8px;bottom:6px}
}

/* 6. 수강하면 가져가는 것 */
.so3-take{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;max-width:900px;margin:44px auto 0}
.so3-take-card{min-width:0;background:#fff;border:1px solid rgba(20,20,20,.08);border-radius:22px;padding:28px 26px;box-shadow:0 10px 28px rgba(20,20,20,.05)}
.so3-take-no{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:var(--g);color:#fff;font-size:14px;font-weight:900;margin:0 0 14px}
.so3-take-t{font-size:20px;font-weight:900;margin:0 0 8px}
.so3-take-b{margin:0;font-size:16px;line-height:1.7;color:#3A3A3A}
@media(max-width:760px){.so3-take{grid-template-columns:minmax(0,1fr)}}

/* 7. 커리큘럼 */
.so3-parts{display:grid;gap:20px;max-width:900px;margin:44px auto 0}
.so3-part{min-width:0;background:#121614;border:1px solid rgba(34,181,115,.18);border-radius:22px;padding:30px 26px}
.so3-part-head{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:0 0 6px}
.so3-part-time{font-size:14px;font-weight:800;color:#fff;background:var(--g);padding:7px 14px;border-radius:50px}
.so3-part-speaker{font-size:15px;font-weight:700;color:#C8D3CD}
.so3-part-title{font-size:28px;font-weight:900;margin:8px 0 22px}
.so3-keys-list{display:grid;gap:14px}
.so3-keyc{min-width:0;background:#0A0A0A;border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:22px 20px}
.so3-keyc-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:10px;margin:0 0 12px}
.so3-keyc-tag{font-size:13px;font-weight:800;color:var(--g)}
.so3-keyc-name{font-size:19px;font-weight:900}
.so3-keyc ul{list-style:none;margin:0;padding:0;display:grid;gap:9px}
.so3-keyc li{position:relative;padding-left:16px;font-size:15.5px;line-height:1.65;color:#D3DCD7}
.so3-keyc li::before{content:"";position:absolute;left:0;top:.65em;width:6px;height:6px;border-radius:50%;background:var(--g)}
.so3-qs{display:grid;gap:10px;margin:18px 0 0}
.so3-q{margin:0;padding:15px 18px;border-left:4px solid var(--g);border-radius:0 12px 12px 0;background:rgba(34,181,115,.08);font-size:16px;font-weight:700;line-height:1.65;color:#fff}
@media(max-width:640px){.so3-part{padding:24px 16px}.so3-part-title{font-size:23px}.so3-keyc{padding:18px 14px}}

/* 8. 결제 */
.so3-apply{scroll-margin-top:88px}
.so3-steps{list-style:none;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;max-width:880px;margin:30px auto 0;padding:0;counter-reset:so3s}
.so3-step{position:relative;min-width:0;display:flex;align-items:center;gap:12px;background:#fff;border:1px solid rgba(20,20,20,.1);border-radius:16px;padding:16px 16px;font-size:14.5px;font-weight:800;line-height:1.5}
.so3-step i{flex:0 0 auto;display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:var(--g);color:#fff;font-style:normal;font-size:14px;font-weight:900}
.so3-table{width:100%;max-width:640px;margin:30px auto 0;border-collapse:collapse;background:#fff;border:1px solid rgba(20,20,20,.1);border-radius:18px;overflow:hidden}
.so3-table th,.so3-table td{padding:16px 20px;text-align:left;font-size:16px;line-height:1.5;border-top:1px solid rgba(20,20,20,.08)}
.so3-table tr:first-child th,.so3-table tr:first-child td{border-top:0}
.so3-table th{width:28%;font-weight:800;background:#F4F1E6;color:#3A3A3A}
.so3-table td{font-weight:700}
.so3-table td.is-pending{color:#8a8a8a;font-weight:600}
@media(max-width:760px){.so3-steps{grid-template-columns:minmax(0,1fr)}}
@media(max-width:640px){.so3-table th,.so3-table td{padding:14px 14px;font-size:15px}.so3-table th{width:32%}}

/* 9. 클로징 + 하단 고정 CTA */
.so3-closing{text-align:center;max-width:820px}
.so3-closing p{margin:0;font-size:25px;font-weight:800;line-height:1.7;text-wrap:balance}
.so3-closing .so3-gap{margin-top:34px}
.so3-closing .so3-hl{color:var(--g)}
@media(max-width:640px){.so3-closing p{font-size:19px}.so3-closing .so3-gap{margin-top:26px}}
.so3-sticky{position:fixed;left:0;right:0;bottom:0;z-index:30;pointer-events:none;transform:translateY(110%);opacity:0;transition:transform .35s ease,opacity .35s ease}
.so3-sticky.is-on{transform:none;opacity:1}
.so3-sticky-in{pointer-events:auto;max-width:640px;margin:0 auto;display:flex;align-items:center;gap:14px;padding:12px 16px calc(12px + env(safe-area-inset-bottom));background:rgba(10,10,10,.94);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border-top:1px solid rgba(255,255,255,.08)}
.so3-sticky-meta{flex:1 1 auto;min-width:0;color:#C8D3CD;font-size:12.5px;line-height:1.4}
.so3-sticky-meta b{display:block;color:#fff;font-size:15px;font-weight:900}
.so3-sticky .so3-cta{flex:0 0 auto;padding:13px 22px;font-size:15px;box-shadow:none}
@media(prefers-reduced-motion:reduce){.so3-sticky{transition:none}}
`;

export default function SalesOps3() {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const applyRef = useRef<HTMLElement>(null);
  const applyHeadRef = useRef<HTMLDivElement>(null);

  // 영상 슬라이드 (640px 이하에서만 가로 스크롤)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const sliderRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeVid, setActiveVid] = useState(0);

  // 퍼널 · 스택 연출의 현재 단계 (GSAP 이 갱신)
  const [fnActive, setFnActive] = useState(0);
  const [stackActive, setStackActive] = useState(0);

  // 모바일·모션 축소용 3D 원통
  const sysStageRef = useRef<HTMLDivElement>(null);
  const [sysIdx, setSysIdx] = useState(0);
  const [sysVisible, setSysVisible] = useState(false);
  const [sysHover, setSysHover] = useState(false);
  const [sysReduced, setSysReduced] = useState(false);
  const sysCount = SO3_SYS_SCREENS.length;
  const sysActive = ((sysIdx % sysCount) + sysCount) % sysCount;

  const [stickyOn, setStickyOn] = useState(false);

  // ── 측정: view_item (진입 1회) ──
  const viewedRef = useRef(false);
  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    const item = { item_id: SO_LANDING_V3, item_name: "피트니스 성장 마스터키 세미나" };
    so3Ga("view_item", { currency: "KRW", value: SO_PRICE_NORMAL, items: [item], ...item });
    so3Fb("ViewContent", { content_name: item.item_name, content_ids: [SO_LANDING_V3], value: SO_PRICE_NORMAL, currency: "KRW" });
  }, []);

  // ── 측정: apply_section_view (결제 섹션 머리 부분이 50% 보일 때 1회) ──
  //    결제 섹션 전체는 한 화면보다 길어 50% 가 영영 차지 않으므로, 제목·단계 띠·정보표 묶음을 기준으로 본다.
  useEffect(() => {
    const el = applyHeadRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        so3Ga("apply_section_view", { item_id: SO_LANDING_V3 });
        so3FbCustom("ApplySectionView", { content_ids: [SO_LANDING_V3] });
        io.disconnect();
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // ── 스크롤 등장 (단순 페이드) ──
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("so3-in");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );
    root.classList.add("so3-anim");
    root.querySelectorAll(".so3-reveal").forEach((el) => io.observe(el));
    // 앵커 이동·핀 구간 점프로 화면을 건너뛴 요소는 교차 이벤트가 오지 않아 숨은 채 남을 수 있다.
    // 스크롤 위치가 이미 지나친 요소는 등장 처리한다.
    let raf = 0;
    const sweep = () => {
      raf = 0;
      root.querySelectorAll(".so3-reveal:not(.so3-in)").forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.95) {
          el.classList.add("so3-in");
          io.unobserve(el);
        }
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(sweep);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      root.classList.remove("so3-anim");
    };
  }, []);

  // ── GSAP 연출 (데스크톱 · 모션 허용일 때만 불러온다) ──
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const QUERY = "(min-width: 641px) and (prefers-reduced-motion: no-preference)";
    if (!window.matchMedia(QUERY).matches) return; // 모바일·모션 축소: GSAP 을 로드하지 않는다

    let cancelled = false;
    let mm: { revert: () => void } | undefined;
    let onLoad: (() => void) | undefined;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ ignoreMobileResize: true });
      const start = `top top+=${HEADER_OFFSET}`;
      const q = gsap.utils.selector(root);

      const media = gsap.matchMedia();
      mm = media;
      media.add(QUERY, () => {
        root.classList.add("so3-gsap");

        // 1) 열쇠 두 개가 양쪽에서 들어와 가운데에서 맞물리고, 흰 원이 퍼지며 다음 섹션으로 전환
        const keysTl = gsap.timeline({
          scrollTrigger: { trigger: q(".so3-keys")[0], start, end: "+=130%", pin: true, scrub: 0.6, anticipatePin: 1 },
        });
        keysTl
          .fromTo(q(".so3-key-a"), { xPercent: -150, rotate: -12, opacity: 0.25 }, { xPercent: 0, rotate: 0, opacity: 1, ease: "power2.out", duration: 1 }, 0)
          .fromTo(q(".so3-key-b"), { xPercent: 150, rotate: 12, opacity: 0.25 }, { xPercent: 0, rotate: 0, opacity: 1, ease: "power2.out", duration: 1 }, 0)
          .fromTo(q(".so3-key-glow"), { scale: 0.3, opacity: 0 }, { scale: 1.25, opacity: 1, ease: "power1.out", duration: 0.35 }, 0.95)
          .to(q(".so3-key-wrap"), { opacity: 0, duration: 0.3, ease: "none" }, 1.45)
          .fromTo(q(".so3-key-wipe"), { scale: 0 }, { scale: 1, ease: "power2.in", duration: 0.8 }, 1.2);

        // 2) 퍼널 — 화면을 고정하고 스크롤할 때마다 한 단계씩 강조
        const prog = q(".so3-fn-prog i")[0];
        ScrollTrigger.create({
          trigger: q(".so3-fn-pin")[0],
          start,
          end: "+=240%",
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            setFnActive(Math.min(SO3_FUNNEL.length - 1, Math.floor(self.progress * SO3_FUNNEL.length)));
            if (prog) gsap.set(prog, { scaleX: self.progress });
          },
        });

        // 3) 운영 시스템 화면 — 레이어가 한 장씩 앞으로 넘어오는 스택 (표시 크기 이상으로 확대하지 않는다)
        const layers = q(".so3-stack-layer");
        if (layers.length) {
          const stackTl = gsap.timeline({
            scrollTrigger: {
              trigger: q(".so3-stack-pin")[0],
              start,
              end: `+=${layers.length * 90}%`,
              pin: true,
              scrub: 0.6,
              anticipatePin: 1,
              onUpdate: (self) => setStackActive(Math.min(layers.length - 1, Math.round(self.progress * (layers.length - 1)))),
            },
          });
          layers.forEach((layer, i) => {
            gsap.set(layer, { zIndex: i + 1 });
            if (i === 0) return;
            stackTl.fromTo(layer, { y: 110, scale: 0.9, opacity: 0 }, { y: 0, scale: 1, opacity: 1, ease: "power2.out", duration: 1 }, i - 1);
            for (let j = 0; j < i; j++) {
              const depth = i - j;
              stackTl.to(layers[j], { scale: 1 - 0.04 * depth, y: -20 * depth, filter: `brightness(${1 - 0.14 * depth})`, ease: "none", duration: 1 }, i - 1);
            }
          });
        }

        return () => {
          root.classList.remove("so3-gsap");
        };
      });

      // 이미지·폰트가 늘린 높이를 핀 구간 계산에 반영
      const refresh = () => ScrollTrigger.refresh();
      onLoad = refresh;
      if (document.readyState === "complete") refresh();
      else window.addEventListener("load", refresh);
      document.fonts?.ready.then(() => !cancelled && refresh());
    })();

    return () => {
      cancelled = true;
      if (onLoad) window.removeEventListener("load", onLoad);
      mm?.revert();
      root.classList.remove("so3-gsap");
    };
  }, []);

  // ── 영상 슬라이드: 현재 카드(점) · 화면 밖 정지 ──
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = slider.scrollWidth - slider.clientWidth;
      if (max <= 1) {
        setActiveVid(0);
        return;
      }
      const pad = parseFloat(getComputedStyle(slider).paddingLeft) || 0;
      let best = 0;
      let bestDist = Infinity;
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const target = Math.min(Math.max(card.offsetLeft - pad, 0), max);
        const dist = Math.abs(target - slider.scrollLeft);
        if (dist <= bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      setActiveVid(best);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    slider.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio >= 0.5) return;
          const idx = cardRefs.current.indexOf(entry.target as HTMLDivElement);
          const video = idx >= 0 ? videoRefs.current[idx] : null;
          if (video && !video.paused) video.pause();
        });
      },
      { root: slider, threshold: [0, 0.5, 1] },
    );
    cardRefs.current.forEach((card) => card && io.observe(card));
    return () => {
      slider.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  const goToVideo = (i: number) => {
    const slider = sliderRef.current;
    const card = cardRefs.current[i];
    if (!slider || !card) return;
    const pad = parseFloat(getComputedStyle(slider).paddingLeft) || 0;
    slider.scrollTo({ left: card.offsetLeft - pad, behavior: "smooth" });
  };
  const pauseOthers = (index: number) => {
    videoRefs.current.forEach((video, i) => {
      if (video && i !== index && !video.paused) video.pause();
    });
  };

  // ── 원통 슬라이드 (모바일·모션 축소) ──
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSysReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const el = sysStageRef.current;
    if (!el || !("IntersectionObserver" in window)) {
      setSysVisible(true);
      return;
    }
    const io = new IntersectionObserver(([entry]) => setSysVisible(entry.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!sysVisible || sysHover) return;
    const t = window.setTimeout(() => setSysIdx((v) => v + 1), SO3_SYS_ROTATE_MS);
    return () => window.clearTimeout(t);
  }, [sysVisible, sysHover, sysIdx]);
  const goToSys = (target: number) => {
    let d = (target - sysActive + sysCount) % sysCount;
    if (d === sysCount - 1) d = -1;
    setSysIdx((v) => v + d);
  };

  // ── 하단 고정 CTA: 히어로·결제 섹션이 보이는 동안 숨김 ──
  useEffect(() => {
    const hero = heroRef.current;
    const apply = applyRef.current;
    if (!hero || !apply || typeof IntersectionObserver === "undefined") return;
    const seen: Record<string, boolean> = {};
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          seen[en.target.id] = en.isIntersecting;
        });
        setStickyOn(!(seen["so3-hero"] || seen["so3-apply"]));
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    io.observe(hero);
    io.observe(apply);
    return () => io.disconnect();
  }, []);

  const scrollToApply = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById("so3-apply");
    if (!el) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  // ── 결제 카드 클릭: 측정 + 랜딩 구분값 부여 ──
  //  SalesOpsPay 는 수정하지 않는다. 버튼 클릭 때 SalesOpsPay 가 신청 정보를 sessionStorage 에 저장하므로,
  //  캡처 단계에서 이전 값을 지우고(다른 랜딩에서 남은 값이 섞이지 않게), 버블 단계에서 방금 저장된
  //  값에 landing 을 덧붙인다. 검증에 걸려 저장이 안 된 클릭이면 아무것도 덧붙이지 않는다.
  const onPayCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest(".sop-pay")) {
      clearCheckoutPrefill(SO_PRODUCT_STORY);
      clearCheckoutPrefill(SO_PRODUCT_NORMAL);
    }
  };
  const onPayBubble = (e: React.MouseEvent<HTMLDivElement>) => {
    const btn = (e.target as HTMLElement).closest(".sop-pay") as HTMLButtonElement | null;
    if (!btn || btn.disabled) return;
    const story = !!btn.closest(".sop-card.is-story");
    const slug = story ? SO_PRODUCT_STORY : SO_PRODUCT_NORMAL;
    const price = story ? SO_PRICE_STORY : SO_PRICE_NORMAL;
    const pre = readCheckoutPrefill(slug);
    if (pre) saveCheckoutPrefill(slug, { ...pre, landing: SO_LANDING_V3 });
    const params = { price_type: story ? "story" : "normal", item_id: slug, value: price, currency: "KRW", validated: !!pre };
    so3Ga("apply_click", params);
    so3FbCustom("ApplyClick", params);
  };

  const placeKnown = !soIsPending(SO_PLACE);
  const hasTakeaways = SO3_TAKEAWAYS.length > 0;

  return (
    <div ref={rootRef} className="so3">
      <style dangerouslySetInnerHTML={{ __html: SO3_STYLE }} />

      {/* ── 1. 히어로 ── */}
      <section className="so3-hero" id="so3-hero" ref={heroRef}>
        <div className="so3-wrap so3-hero-in">
          <div className="so3-hero-copy">
            <p className="so3-eyebrow">{SO3_EYEBROW}</p>
            <p className="so3-target">{SO3_TARGET}</p>
            <h1 className="so3-h1">{SO3_HEADLINE}</h1>
            <p className="so3-em">{SO3_EM}</p>
            <p className="so3-sub">{SO3_SUB}</p>
            <ul className="so3-chips">
              {SO3_CHIPS.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <a className="so3-cta" href="#so3-apply" onClick={scrollToApply}>
              세미나 신청하기
            </a>
            <p className="so3-price-line">
              정상가 <b>{won(SO_PRICE_NORMAL)}</b> · 스토리 인증가 <b>{won(SO_PRICE_STORY)}</b> (VAT 포함)
            </p>
          </div>

          <div className="so3-people">
            <div className="so3-person so3-media">
              <So3Img src={SO3_IMG.hwang} alt="황현진 대표" sizes="(max-width: 860px) 230px, 260px" fit="contain" position="center bottom" priority />
              <p className="so3-person-cap">
                <b>황현진</b>
                리얼세일즈(주) 대표
              </p>
            </div>
            <div className="so3-person so3-media">
              <So3Img src={SO3_IMG.kimHero} alt="김재강 대표" sizes="(max-width: 860px) 230px, 260px" fit="contain" position="center bottom" priority />
              <p className="so3-person-cap">
                <b>김재강</b>
                (주)더그로우컴퍼니 대표이사
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 1-2. 열쇠 전환 (데스크톱은 스크롤 연출, 그 외 정적) ── */}
      <section className="so3-keys" aria-label="운영과 세일즈, 두 개의 열쇠">
        <div className="so3-keys-stage">
          <div className="so3-key-glow" aria-hidden="true" />
          <div className="so3-key-wrap">
            <div className="so3-key so3-key-a">
              <KeyShape />
              <span className="so3-key-lbl">운영</span>
            </div>
            <div className="so3-key so3-key-b">
              <KeyShape />
              <span className="so3-key-lbl">세일즈</span>
            </div>
          </div>
          <div className="so3-key-wipe" aria-hidden="true" />
        </div>
      </section>

      {/* ── 2. 매출이 새는 곳 (퍼널) ── */}
      <section className="so3-sec so3-white so3-funnel">
        <div className="so3-fn-pin">
          <div className="so3-wrap">
            <h2 className="so3-h2 so3-reveal">{SO3_FUNNEL_TITLE}</h2>
            <div className="so3-fn-grid">
              <svg className="so3-fn-svg" viewBox="0 0 360 396" role="img" aria-label="문의, 상담, 등록, 재등록 순서로 좁아지는 퍼널">
                {SO3_FUNNEL.map((s, i) => {
                  const widths = [340, 270, 200, 130, 80];
                  const y = i * 100;
                  const x1 = 180 - widths[i] / 2;
                  const x2 = 180 + widths[i] / 2;
                  const x3 = 180 + widths[i + 1] / 2;
                  const x4 = 180 - widths[i + 1] / 2;
                  const on = fnActive === i;
                  return (
                    <g key={s.name} className={"so3-fn-band" + (on ? " is-on" : "")} data-static-on="1">
                      <polygon points={`${x1},${y} ${x2},${y} ${x3},${y + 92} ${x4},${y + 92}`} />
                      <text x="180" y={y + 54} textAnchor="middle">
                        {s.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="so3-fn-rows">
                {SO3_FUNNEL.map((s, i) => (
                  <div className={"so3-fn-row" + (fnActive === i ? " is-on" : "")} key={s.name}>
                    <span className="so3-fn-bar" style={{ width: `${s.bar}%` }} aria-hidden="true" />
                    <div className="so3-fn-head">
                      <span className="so3-fn-no">{String(i + 1).padStart(2, "0")}</span>
                      <span className="so3-fn-name">{s.name}</span>
                      <span className="so3-fn-part">{s.part}</span>
                    </div>
                    <p className="so3-fn-leak">{s.leak}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="so3-fn-prog" aria-hidden="true">
              <i />
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. 상담 장면 + 하수 vs 고수 ── */}
      <section className="so3-sec so3-cream">
        <div className="so3-wrap">
          <h2 className="so3-h2 so3-reveal">아직도 이런 상담을 반복하고 계신다면</h2>
          <div className="so3-talks so3-stagger">
            {SO3_TALKS.map((t) => (
              <div className="so3-talk so3-reveal" key={t.line}>
                <p className="so3-bubble">{t.line}</p>
                <span className="so3-diag">{t.diag}</span>
              </div>
            ))}
          </div>
          <div className="so3-versus so3-stagger">
            <p className="so3-versus-row so3-reveal">
              하수는 <mark>주장</mark>만 하지만, 고수는 <mark>주목</mark>시킵니다.
            </p>
            <p className="so3-versus-row so3-reveal">
              하수는 <mark>이성</mark>을 향하지만, 고수는 <mark>감정</mark>을 공략합니다.
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. 증거 ① 황현진 (약력 · 저서 · 영상) ── */}
      <section className="so3-sec so3-dark2">
        <div className="so3-wrap">
          <div className="so3-prof so3-reveal">
            <div className="so3-prof-photo so3-media">
              <So3Img src={SO3_IMG.hwang} alt="세일즈작가 황현진" sizes="340px" fit="contain" position="center bottom" />
            </div>
            <div>
              <h2 className="so3-prof-h">{SO3_HWANG_HEADLINE}</h2>
              <ul className="so3-bio">
                {SO3_HWANG_BIO.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          </div>

          <h3 className="so3-sub-h so3-reveal">저서</h3>
          <div className="so3-books so3-stagger">
            {SO3_IMG.books.map((b) => (
              <div className="so3-book so3-reveal" key={b.src}>
                <div className="so3-media">
                  <So3Img src={b.src} alt={`${b.title} 표지`} sizes="(max-width: 640px) 45vw, 240px" fit="contain" />
                </div>
                <p className="so3-book-t">{b.title}</p>
              </div>
            ))}
          </div>

          <div className="so3-vid">
            <div className="so3-vid-grid" ref={sliderRef} tabIndex={0} role="group" aria-label="황현진 대표 세일즈 화법 영상">
              {SO3_VIDEOS.map(({ src, poster }, i) => (
                <div
                  className="so3-vid-card"
                  key={src}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                >
                  <video
                    ref={(el) => {
                      videoRefs.current[i] = el;
                    }}
                    src={src}
                    poster={poster}
                    controls
                    playsInline
                    preload="none"
                    onPlay={() => pauseOthers(i)}
                    aria-label={`황현진 대표 세일즈 화법 영상 ${i + 1}`}
                  />
                </div>
              ))}
            </div>
            <div className="so3-vid-dots">
              {SO3_VIDEOS.map(({ src }, i) => (
                <button
                  type="button"
                  key={src}
                  className={`so3-vid-dot${i === activeVid ? " is-on" : ""}`}
                  aria-label={`영상 ${i + 1}번으로 이동`}
                  aria-current={i === activeVid ? "true" : undefined}
                  onClick={() => goToVideo(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. 증거 ② 김재강 (헤드라인 · 3칸 · 운영 시스템 화면) ── */}
      <section className="so3-sec so3-white">
        <div className="so3-wrap">
          <h2 className="so3-h2 so3-reveal">{SO3_KIM_HEADLINE}</h2>
          <div className="so3-op-body so3-reveal">
            {SO3_KIM_BODY.map((t) => (
              <p key={t}>{t}</p>
            ))}
            <p className="so3-op-em">{SO3_KIM_EM}</p>
          </div>
          <div className="so3-kim-line so3-reveal">
            <span className="so3-kim-role">{SO3_KIM_ROLE}</span>
            {SO3_KIM_STATS.map((s) => (
              <span className="so3-kim-stat" key={s}>
                {s}
              </span>
            ))}
          </div>
          <div className="so3-needs so3-stagger">
            {SO3_OPS_CARDS.map((c) => (
              <div className="so3-need so3-reveal" key={c.label}>
                <span className="so3-need-lbl">{c.label}</span>
                <h3 className="so3-need-who">{c.title}</h3>
                <p className="so3-need-body">{c.body}</p>
              </div>
            ))}
          </div>

          <div className="so3-sys">
            <div className="so3-reveal">
              <p className="so3-sys-lbl">{SO3_SYS_LABEL}</p>
              <h3 className="so3-sys-title">{SO3_SYS_TITLE}</h3>
              <p className="so3-sys-sub">{SO3_SYS_SUB}</p>
            </div>

            {/* 데스크톱: 스크롤에 따라 한 장씩 앞으로 넘어오는 스택 (GSAP 이 없으면 세로로 나열) */}
            <div className="so3-stack-box">
              <div className="so3-stack-pin" onContextMenu={(e) => e.preventDefault()} onDragStart={(e) => e.preventDefault()}>
                <div className="so3-stack">
                  {SO3_SYS_SCREENS.map((sc) => (
                    <div className="so3-stack-layer so3-media" key={sc.src}>
                      <So3Img src={sc.src} alt={sc.name} sizes="560px" fit="contain" />
                      <span className="so3-mark" aria-hidden="true">
                        © THE GROW
                      </span>
                    </div>
                  ))}
                </div>
                <div className="so3-stack-cap" aria-live="polite">
                  <div className="so3-cap-in" key={stackActive}>
                    <b>{SO3_SYS_SCREENS[stackActive].name}</b>
                    <span>{SO3_SYS_SCREENS[stackActive].desc}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 640px 이하·모션 축소: 기존 3D 원통 슬라이드 */}
            <div className="so3-cyl-box">
              <div className="so3-cyl-wrap">
                <div
                  ref={sysStageRef}
                  className={"so3-cyl-stage" + (sysReduced ? " so3-cyl-flat" : "")}
                  role="group"
                  aria-roledescription="carousel"
                  aria-label="운영 시스템 화면"
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  onMouseEnter={() => setSysHover(true)}
                  onMouseLeave={() => setSysHover(false)}
                >
                  <div className="so3-cyl" style={{ transform: `translateZ(calc(var(--w) / -2)) rotateY(${-sysIdx * 90}deg)` }}>
                    {SO3_SYS_SCREENS.map((sc, i) => {
                      const front = i === sysActive;
                      return (
                        <div
                          key={sc.src}
                          className={"so3-cyl-face so3-media" + (front ? " is-front" : "")}
                          style={{ transform: `rotateY(${i * 90}deg) translateZ(calc(var(--w) / 2))` }}
                          aria-hidden={!front}
                        >
                          <So3Img src={sc.src} alt={sc.name} sizes="(max-width: 640px) 78vw, 560px" fit="contain" />
                          <span className="so3-mark" aria-hidden="true">
                            © THE GROW
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="so3-cyl-cap" aria-live="polite">
                <div className="so3-cap-in" key={sysActive}>
                  <b>{SO3_SYS_SCREENS[sysActive].name}</b>
                  <span>{SO3_SYS_SCREENS[sysActive].desc}</span>
                </div>
              </div>
              <div className="so3-sys-dots" role="group" aria-label="운영 시스템 화면 선택">
                {SO3_SYS_SCREENS.map((sc, i) => (
                  <button
                    key={sc.name}
                    type="button"
                    className={"so3-sys-dot" + (i === sysActive ? " is-on" : "")}
                    aria-label={`${sc.name} 보기`}
                    aria-pressed={i === sysActive}
                    onClick={() => goToSys(i)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. 수강하면 가져가는 것 (제공물이 확정돼 SO3_TAKEAWAYS 가 채워지면 나타난다) ── */}
      {hasTakeaways && (
        <section className="so3-sec so3-cream">
          <div className="so3-wrap">
            <h2 className="so3-h2 so3-reveal">{SO3_TAKEAWAYS_TITLE}</h2>
            <div className="so3-take so3-stagger">
              {SO3_TAKEAWAYS.slice(0, 4).map((t, i) => (
                <div className="so3-take-card so3-reveal" key={t.title}>
                  <span className="so3-take-no">{i + 1}</span>
                  <h3 className="so3-take-t">{t.title}</h3>
                  <p className="so3-take-b">{t.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 7. 커리큘럼 · 타임테이블 ── */}
      <section className="so3-sec so3-dark">
        <div className="so3-wrap">
          <h2 className="so3-h2 so3-reveal">
            커리큘럼 · <em>타임테이블</em>
          </h2>
          <div className="so3-parts">
            {SO3_PARTS.map((p) => (
              <div className="so3-part so3-reveal" key={p.time}>
                <div className="so3-part-head">
                  <span className="so3-part-time">{p.time}</span>
                  <span className="so3-part-speaker">{p.speaker}</span>
                </div>
                <h3 className="so3-part-title">{p.title}</h3>
                <div className="so3-keys-list">
                  {p.keys.map((k) => (
                    <div className="so3-keyc" key={k.name}>
                      <div className="so3-keyc-head">
                        <span className="so3-keyc-tag">{k.tag}</span>
                        <span className="so3-keyc-name">{k.name}</span>
                      </div>
                      <ul>
                        {k.points.map((pt) => (
                          <li key={pt}>{pt}</li>
                        ))}
                      </ul>
                      {k.quotes.length > 0 && (
                        <div className="so3-qs">
                          {k.quotes.map((q) => (
                            <p className="so3-q" key={q}>
                              {q}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. 결제 ── */}
      <section className="so3-sec so3-cream so3-apply" id="so3-apply" ref={applyRef}>
        <div className="so3-wrap">
          <div ref={applyHeadRef}>
            <h2 className="so3-h2 so3-reveal">세미나 신청 안내</h2>
            <ol className="so3-steps so3-stagger" aria-label="스토리 인증가 신청 순서">
              {SO3_STEPS.map((t, i) => (
                <li className="so3-step so3-reveal" key={t}>
                  <i>{i + 1}</i>
                  <span>{t}</span>
                </li>
              ))}
            </ol>
            <table className="so3-table so3-reveal">
              <tbody>
                <tr>
                  <th scope="row">일시</th>
                  <td>
                    {SO_DATE} {SO_TIME}
                  </td>
                </tr>
                <tr>
                  <th scope="row">장소</th>
                  <td className={soIsPending(SO_PLACE) ? "is-pending" : undefined}>{SO_PLACE}</td>
                </tr>
                <tr>
                  <th scope="row">정원</th>
                  <td className={soIsPending(SO_CAPACITY) ? "is-pending" : undefined}>{soFormatCapacity(SO_CAPACITY)}</td>
                </tr>
                <tr>
                  <th scope="row">가격</th>
                  <td>
                    스토리 인증가 {soFormatPrice(SO_PRICE_STORY)} / 정상가 {soFormatPrice(SO_PRICE_NORMAL)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div onClickCapture={onPayCapture} onClick={onPayBubble}>
            <SalesOpsPay />
          </div>
        </div>
      </section>

      {/* ── 9. 클로징 ── */}
      <section className="so3-sec so3-dark">
        <div className="so3-wrap so3-closing">
          {SO3_CLOSING.map((group, gi) => (
            <div className={gi > 0 ? "so3-gap so3-reveal" : "so3-reveal"} key={gi}>
              {group.map((line, li) => (
                <p key={line} className={gi === 1 && li === 1 ? "so3-hl" : undefined}>
                  {line}
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* 하단 고정 CTA — 히어로·결제 섹션이 보일 때는 숨김 */}
      <div className={"so3-sticky" + (stickyOn ? " is-on" : "")} aria-hidden={!stickyOn}>
        <div className="so3-sticky-in">
          <div className="so3-sticky-meta">
            <b>{SO_DATE}</b>
            스토리 인증가 {won(SO_PRICE_STORY)}
            {placeKnown ? ` · ${SO_PLACE}` : ""}
          </div>
          <a className="so3-cta" href="#so3-apply" onClick={scrollToApply} tabIndex={stickyOn ? 0 : -1}>
            세미나 신청하기
          </a>
        </div>
      </div>
    </div>
  );
}
