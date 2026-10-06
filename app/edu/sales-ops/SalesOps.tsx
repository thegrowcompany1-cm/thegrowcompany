"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 피트니스 성장 마스터키 세미나 (/edu/sales-ops) — 더그로우 X 리얼세일즈
//
//  · 구조·스타일은 /edu/gx-class 를 따른다. 주입 HTML 없이 전부 React 렌더,
//    클래스 접두사 so-, 상수 접두사 SO_.
//  · 일자·장소·정원·가격은 lib/salesOps.ts 상수만 수정한다 (장소·정원·가격은 TODO).
//  · 10섹션: 히어로 → 세일즈 문제 → 황현진 소개(저서·영상) → 운영 문제 → 김재강 소개
//    → 대상 → 커리큘럼 → 변화 → 클로징 → 신청.
//  · 영상(SALES SALON)은 3번 섹션 안에 있다. 자체 호스팅이며 인스타그램 임베드·링크는
//    이 페이지 어디에도 두지 않는다 (외부 이탈 방지).
//  · 애니메이션 fail-safe: 기본은 전부 표시. 이펙트가 루트에 so-anim 을 붙인 뒤에만
//    숨김 → 등장. 스크립트가 안 돌면 모든 섹션이 보인 상태로 남는다.
//  · IntersectionObserver 는 언마운트 시 정리, 전역 함수 없음.
//  · 결제 연동은 다음 작업이다. 신청 버튼은 자리만 있고 비활성이다.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";
import Image from "next/image";
import {
  SO_CAPACITY,
  SO_DATE,
  SO_PLACE,
  SO_PRICE,
  SO_TIME,
  soFormatCapacity,
  soFormatPrice,
  soIsPending,
} from "@/lib/salesOps";

// ── 이미지 ──────────────────────────────────────────────────────────────────
// hwang: 배경이 제거된 누끼. consultants/hwang-hyunjin.png 의 투명 여백을 걷고 WebP 로 줄인 사본
// kim:   기존 진단 멘토 페이지가 쓰는 경로를 그대로 참조한다 (복사하지 않음)
const SO_IMG = {
  hwang: "/edu/sales-ops/hwang-hyunjin.webp",
  kim: "/consultants/kim-jaegang.jpg",
  books: [
    { src: "/edu/sales-ops/salesbook1.png", title: "팔리는 한 문장은 다르다" },
    { src: "/edu/sales-ops/salesbook2.png", title: "잘 파는 사람은 이렇게 팝니다" },
    { src: "/edu/sales-ops/salesbook3.png", title: "세일즈, 말부터 바꿔라" },
    { src: "/edu/sales-ops/salesbook4.png", title: "설득의 정석" },
  ],
};

// ── 영상 (SALES SALON) ─────────────────────────────────────────────────────
const SO_VIDEOS = [1, 2, 3, 4].map((n) => ({
  src: `/edu/sales-ops/videos/sales-0${n}.mp4`,
  poster: `/edu/sales-ops/videos/sales-0${n}.jpg`,
}));

// ── 1. 히어로 ───────────────────────────────────────────────────────────────
const SO_TARGET_TAGS = ["헬스 · 필라테스 · 요가 · 바레", "강사 · 실장 · 원장 · 점장"];

// ── 2. 세일즈 축 문제 제기 — 상담 대사 원문 + 회색 진단 라벨 ─────────────────
const SO_TALKS = [
  {
    line: "회원님, 가격 대비 저희 시설과 기구가 최고죠!",
    diag: "주장만 늘어놓는 설득",
  },
  {
    line: "3개월보단 12개월이 훨씬 저렴하니까 이렇게 하세요.",
    diag: "이성적 설득에만 집착",
  },
  {
    line: "주사요? 에이~ 살 빼려면 땀을 흘리셔야죠.",
    diag: "회원의 반응에 직설적으로 반박",
  },
];

// ── 3. 황현진 소개 ──────────────────────────────────────────────────────────
const SO_HWANG_HEADLINE = "대한민국 세일즈교육&컨설팅 섭외 0순위, 세일즈작가 황현진";
const SO_HWANG_BIO = [
  "현 리얼세일즈(주) 대표",
  "대한민국 1등 기업들이 찾는 세일즈대본 개발·화법컨설팅 마스터",
  "피트니스 프랜차이즈 세일즈 특강 다수",
  "전 NS홈쇼핑 (홈쇼핑 최다매출 기네스 기록)",
];

// ── 5. 김재강 소개 — 진단 멘토 페이지(/consulting/diagnosis/kim-jaegang) 문구 원문 ──
const SO_KIM_ROLE = "(주)더그로우컴퍼니 대표이사";
const SO_KIM_BIO =
  "저는 46개 필라테스와 6개 대형 피트니스를 총괄하며 매출 압박 속에 눈치로 버티던 관리자들을 현장에서 직접 마주해온 사람입니다.";
const SO_KIM_STATS = ["52개 센터 총괄", "10년 운영 데이터", "수백 명 조직 리딩"];

// ── 6. 이런 분들께 필요합니다 ───────────────────────────────────────────────
const SO_NEEDS = [
  {
    who: "강사 · 트레이너",
    body: "'영업'이라는 부담 대신, 전문가로서 당당하게 권하는 법",
  },
  {
    who: "실장 · 팀장",
    body: "상담 등록률과 재등록을 끌어올리는 실전 화법과 관리 루틴",
  },
  {
    who: "원장 · 점장",
    body: "숫자로 읽는 센터, 맡겨도 돌아가는 운영 구조",
  },
];

// ── 7. 커리큘럼 · 타임테이블 ────────────────────────────────────────────────
const SO_QUOTES = [
  "운동이 적금이라면, 주사는 대출입니다.",
  "도화지 10장에 그리는 그림 vs 100장에 그리는 그림, 어떤 완성도를 원하세요?",
  "시간이 없는 게 아니라, 회원님의 배터리가 방전된 겁니다.",
];

const SO_PARTS = [
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
        points: [
          "회원의 마음을 여는 질문 한 줄",
          "몰입시키는 한 줄 권유화법",
          "현장에서 검증된 실전 화법",
        ],
        quotes: SO_QUOTES,
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

// ── 8. 듣고 나면 달라지는 것 ────────────────────────────────────────────────
const SO_CHANGES = [
  {
    side: "운영",
    items: [
      "내 센터의 숫자를 한 장으로 읽게 됩니다",
      "관리자에게 무엇을 맡길지 기준이 생깁니다",
      "대표가 빠져도 돌아가는 루틴을 가져갑니다",
    ],
  },
  {
    side: "세일즈",
    items: [
      "상담 등록률을 끌어올리는 구조를 가져갑니다",
      "회원의 결심을 부르는 '한 끗 다른 첫마디'가 장착됩니다",
      "부담 대신 확신으로 권하게 됩니다",
    ],
  },
];

// ── 9. 클로징 ───────────────────────────────────────────────────────────────
const SO_CLOSING = [
  ["당신의 일은 단지 운동을 가르치는 것이 아닙니다.", "누군가가 자신을 더 사랑할 수 있게끔 돕는 일입니다."],
  ["최고의 전문성을 갖춘 스스로에게", "이제 날개를 달아줄 '세일즈 언어'를 선물하세요."],
];

// ── 이미지 컴포넌트 (gx-class 의 GxImg 와 같은 방식) ─────────────────────────
/** 하이드레이션 전에 이미 로드·실패가 끝난 이미지도 상태를 반영한다 */
function markImage(img: HTMLImageElement | null) {
  if (!img || !img.complete) return;
  img.parentElement?.classList.add(img.naturalWidth > 0 ? "is-loaded" : "is-broken");
}

/**
 * next/image + 파일 누락 대비. 부모(.so-media)가 크기를 고정하고 이미지는 fill 로 채운다.
 * 로드되면 플레이스홀더를 걷고, 실패하면 깨진 이미지를 숨기고 플레이스홀더를 남긴다.
 */
function SoImg({
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
      <span className="so-img-ph" aria-hidden="true">
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

const SO_STYLE = `
.so{--g:#22B573;--dark:#0A0A0A;--dark2:#0d0d0d;--cream:#FBF8EC;font-family:'Pretendard','Noto Sans KR',-apple-system,BlinkMacSystemFont,system-ui,'Apple SD Gothic Neo',sans-serif;letter-spacing:-.01em;color:#141414;background:#fff;width:100%;max-width:100%;overflow-x:hidden;word-break:keep-all;overflow-wrap:anywhere}
.so *{box-sizing:border-box}
.so-wrap{max-width:1080px;margin:0 auto;padding:0 20px}
.so-narrow{max-width:820px}
.so-sec{padding:96px 0}
.so-dark{background:var(--dark);color:#fff}
.so-dark2{background:var(--dark2);color:#fff}
.so-cream{background:var(--cream);color:#141414}
.so-white{background:#fff;color:#141414}
.so-kicker{display:table;margin:0 auto 16px;font-size:13px;font-weight:800;color:var(--g);background:rgba(34,181,115,.12);padding:7px 16px;border-radius:50px}
.so-h2{font-size:34px;font-weight:800;line-height:1.4;text-align:center;margin:0 0 16px}
.so-h2 em{font-style:normal;color:var(--g)}
.so-h2,.so-prof-h,.so-closing p{text-wrap:balance}
.so-lead{font-size:17px;line-height:1.8;text-align:center;margin:0 auto;max-width:660px;opacity:.78}
@media(max-width:640px){.so-sec{padding:68px 0}.so-h2{font-size:25px}.so-lead{font-size:15px}.so-wrap{padding:0 16px}}

/* fail-safe reveal — 기본 표시. 루트에 so-anim 이 붙은 경우에만 숨김 후 등장 */
.so.so-anim .so-reveal{opacity:0;transform:translateY(24px);transition:opacity .7s ease,transform .7s ease}
.so.so-anim .so-reveal.so-in{opacity:1;transform:none}
.so.so-anim .so-stagger>.so-reveal:nth-child(2){transition-delay:.08s}
.so.so-anim .so-stagger>.so-reveal:nth-child(3){transition-delay:.16s}
.so.so-anim .so-stagger>.so-reveal:nth-child(4){transition-delay:.24s}
@media(prefers-reduced-motion:reduce){.so.so-anim .so-reveal{opacity:1;transform:none;transition:none}}

/* 이미지 박스 — 크기는 박스가 고정, 파일 누락 시 플레이스홀더 */
.so-media{position:relative;overflow:hidden}
.so-img-ph{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:12px;text-align:center;font-size:13px;font-weight:700;color:#8a8a8a;background:repeating-linear-gradient(45deg,rgba(128,128,128,.08) 0 12px,rgba(128,128,128,.15) 12px 24px)}
.so-media.is-loaded .so-img-ph{display:none}
.so-media.is-broken img{visibility:hidden}

/* 1. 히어로 */
.so-hero{background:var(--dark);color:#fff;padding:72px 0 80px;overflow:hidden}
.so-hero-in{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:48px;align-items:center}
.so-hero-copy{min-width:0}
.so-hero .so-kicker{margin:0 0 18px}
.so-h1{font-size:46px;font-weight:900;line-height:1.28;margin:0 0 16px}
.so-hero-sub{font-size:19px;line-height:1.6;color:#C8D3CD;margin:0 0 26px}
.so-tags{list-style:none;margin:0 0 26px;padding:0;display:flex;flex-wrap:wrap;gap:8px}
.so-tags li{font-size:13.5px;font-weight:700;color:#D3DCD7;border:1px solid rgba(34,181,115,.35);background:rgba(34,181,115,.08);padding:8px 14px;border-radius:50px}
.so-hero-meta{margin:0 0 30px;font-size:16px;font-weight:700;line-height:1.7;color:#fff}
.so-hero-meta span{color:var(--g);margin-right:10px}
.so-cta{display:inline-flex;align-items:center;justify-content:center;max-width:100%;padding:17px 34px;border-radius:50px;background:var(--g);color:#fff;font-size:17px;font-weight:800;text-decoration:none;box-shadow:0 10px 26px rgba(34,181,115,.28)}
.so-people{position:relative;width:100%;max-width:440px;margin:0 auto;aspect-ratio:4/5;min-width:0}
.so-person-main{position:absolute;inset:0;border-radius:24px;background:radial-gradient(120% 90% at 50% 18%,rgba(34,181,115,.34) 0%,rgba(34,181,115,.08) 55%,rgba(255,255,255,.03) 100%);border:1px solid rgba(34,181,115,.22)}
.so-person-main .so-img-ph{background:none;color:#5E6B65}
/* 캡션이 어두운 재킷 위에 놓여 대비가 약해서, 사진 아래쪽에 어두운 그라데이션을 깐다 */
.so-person-main::after{content:"";position:absolute;left:0;right:0;bottom:0;height:36%;background:linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,.62) 100%);pointer-events:none}
.so-person-sub{position:absolute;left:-4px;bottom:-18px;width:34%;aspect-ratio:3/4;border-radius:16px;border:3px solid var(--dark);background:#161616;box-shadow:0 12px 30px rgba(0,0,0,.45)}
.so-person-cap{position:absolute;z-index:2;right:14px;bottom:12px;max-width:62%;text-align:right;font-size:13px;font-weight:700;line-height:1.5;color:#E4EBE7;text-shadow:0 1px 8px rgba(0,0,0,.6)}
.so-person-cap b{display:block;font-size:17px;font-weight:900;color:#fff}
.so-person-subcap{position:absolute;left:0;bottom:-48px;font-size:12px;font-weight:700;color:#9AA7A0;white-space:nowrap}
@media(max-width:860px){
  .so-hero{padding:52px 0 76px}
  .so-hero-in{grid-template-columns:minmax(0,1fr);gap:56px}
  .so-h1{font-size:32px}
  .so-hero-sub{font-size:16px}
  .so-people{max-width:380px}
}

/* 2. 세일즈 축 문제 제기 */
.so-talks{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin:44px 0 0}
.so-talk{min-width:0;display:flex;flex-direction:column;gap:12px}
.so-bubble{flex:1 1 auto;position:relative;background:#fff;border:1px solid rgba(20,20,20,.08);border-radius:18px;padding:22px 20px;font-size:17px;font-weight:700;line-height:1.6;box-shadow:0 8px 24px rgba(20,20,20,.06)}
.so-bubble::after{content:"";position:absolute;left:26px;bottom:-9px;width:16px;height:16px;background:#fff;border-right:1px solid rgba(20,20,20,.08);border-bottom:1px solid rgba(20,20,20,.08);transform:rotate(45deg)}
.so-diag{align-self:flex-start;margin-top:8px;font-size:13px;font-weight:700;color:#6E6E6E;background:#E6E6E6;padding:7px 14px;border-radius:50px}
.so-versus{display:grid;gap:12px;max-width:760px;margin:44px auto 0}
.so-versus-row{background:var(--dark);color:#fff;border-radius:16px;padding:22px 24px;font-size:18px;font-weight:700;line-height:1.7;text-align:center}
.so-versus-row mark{background:none;color:var(--g);font-weight:900}
@media(max-width:860px){.so-talks{grid-template-columns:minmax(0,1fr)}}
@media(max-width:640px){.so-bubble{font-size:16px}.so-versus-row{font-size:16px;padding:18px 16px}}

/* 3. 황현진 소개 */
.so-prof{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:44px;align-items:center;max-width:920px;margin:0 auto}
.so-prof-photo{width:100%;max-width:340px;margin:0 auto;aspect-ratio:4/5;border-radius:22px;background:radial-gradient(120% 90% at 50% 20%,rgba(34,181,115,.32) 0%,rgba(34,181,115,.07) 60%,rgba(255,255,255,.03) 100%);border:1px solid rgba(34,181,115,.22)}
.so-prof-photo .so-img-ph{background:none;color:#5E6B65}
.so-prof-h{font-size:26px;font-weight:900;line-height:1.5;margin:0 0 20px}
.so-prof-h em{font-style:normal;color:var(--g)}
.so-bio{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.so-bio li{position:relative;padding-left:18px;font-size:16px;line-height:1.65;color:#D3DCD7}
.so-bio li::before{content:"";position:absolute;left:0;top:.62em;width:7px;height:7px;border-radius:50%;background:var(--g)}
.so-sub-h{font-size:22px;font-weight:800;text-align:center;margin:72px 0 28px}
.so-books{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}
.so-book{min-width:0}
.so-book .so-media{aspect-ratio:374/552;border-radius:8px;background:#161616;box-shadow:0 14px 34px rgba(0,0,0,.5)}
.so-book-t{margin:14px 2px 0;text-align:center;font-size:14.5px;font-weight:700;line-height:1.5;color:#E4EBE7}
@media(max-width:860px){.so-prof{grid-template-columns:minmax(0,1fr);gap:28px}.so-prof-h{font-size:22px;text-align:center}}
@media(max-width:640px){.so-books{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 12px}.so-sub-h{margin-top:56px;font-size:19px}}

/* 3-2. 영상 (SALES SALON) */
.so-vid{margin-top:84px}
.so-vid-label{margin:0 0 14px;text-align:center;font-size:13px;font-weight:800;letter-spacing:.2em;color:var(--g)}
.so-vid-title{margin:0 0 36px;text-align:center;font-size:28px;line-height:1.45;font-weight:900;text-wrap:balance}
.so-vid-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}
.so-vid-card{position:relative;min-width:0;aspect-ratio:9/16;border-radius:16px;overflow:hidden;background:#000}
.so-vid-card video{display:block;width:100%;height:100%;object-fit:cover;background:#000}
@media(max-width:1024px){.so-vid-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:640px){.so-vid{margin-top:60px}.so-vid-title{font-size:21px;margin-bottom:26px}.so-vid-grid{gap:10px}.so-vid-card{border-radius:12px}}

/* 4. 운영 축 문제 제기 */
.so-op-body{max-width:640px;margin:22px auto 0;text-align:center;font-size:18px;line-height:1.85;color:#3F3F3F}
@media(max-width:640px){.so-op-body{font-size:15.5px}}

/* 5. 김재강 소개 */
.so-kim{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:44px;align-items:center;max-width:920px;margin:0 auto}
.so-kim-photo{width:100%;max-width:340px;margin:0 auto;aspect-ratio:3/4;border-radius:22px;background:#e9e4d3}
.so-kim-role{display:inline-block;margin:0 0 12px;font-size:14px;font-weight:800;color:#0B6B3A;background:rgba(34,181,115,.14);padding:7px 14px;border-radius:50px}
.so-kim-name{font-size:30px;font-weight:900;margin:0 0 16px}
.so-kim-bio{margin:0 0 20px;font-size:17px;line-height:1.85;color:#2E2E2E}
.so-kim-stats{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:8px}
.so-kim-stats li{font-size:14px;font-weight:800;color:#141414;background:#fff;border:1px solid rgba(20,20,20,.1);padding:9px 15px;border-radius:50px}
@media(max-width:860px){.so-kim{grid-template-columns:minmax(0,1fr);gap:28px;text-align:center}.so-kim-stats{justify-content:center}.so-kim-name{font-size:25px}}

/* 6. 이런 분들께 */
.so-needs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin:44px 0 0}
.so-need{min-width:0;background:var(--cream);border:1px solid rgba(20,20,20,.07);border-radius:20px;padding:30px 24px}
.so-need-n{display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:var(--g);color:#fff;font-weight:900;font-size:15px;margin:0 0 16px}
.so-need-who{font-size:20px;font-weight:900;margin:0 0 10px}
.so-need-body{margin:0;font-size:16px;line-height:1.75;color:#3A3A3A}
@media(max-width:860px){.so-needs{grid-template-columns:minmax(0,1fr)}}

/* 7. 커리큘럼 */
.so-parts{display:grid;gap:20px;max-width:900px;margin:44px auto 0}
.so-part{min-width:0;background:#121614;border:1px solid rgba(34,181,115,.18);border-radius:22px;padding:30px 26px}
.so-part-head{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:0 0 6px}
.so-part-time{font-size:14px;font-weight:800;color:#fff;background:var(--g);padding:7px 14px;border-radius:50px}
.so-part-speaker{font-size:15px;font-weight:700;color:#C8D3CD}
.so-part-title{font-size:28px;font-weight:900;margin:8px 0 22px}
.so-keys{display:grid;gap:14px}
.so-key{min-width:0;background:#0A0A0A;border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:22px 20px}
.so-key-head{display:flex;flex-wrap:wrap;align-items:baseline;gap:10px;margin:0 0 12px}
.so-key-tag{font-size:13px;font-weight:800;color:var(--g)}
.so-key-name{font-size:19px;font-weight:900}
.so-key ul{list-style:none;margin:0;padding:0;display:grid;gap:9px}
.so-key li{position:relative;padding-left:16px;font-size:15.5px;line-height:1.65;color:#D3DCD7}
.so-key li::before{content:"";position:absolute;left:0;top:.65em;width:6px;height:6px;border-radius:50%;background:var(--g)}
.so-qs{display:grid;gap:10px;margin:18px 0 0}
.so-q{margin:0;padding:15px 18px;border-left:4px solid var(--g);border-radius:0 12px 12px 0;background:rgba(34,181,115,.08);font-size:16px;font-weight:700;line-height:1.65;color:#fff}
@media(max-width:640px){.so-part{padding:24px 16px}.so-part-title{font-size:23px}.so-key{padding:18px 14px}}

/* 8. 듣고 나면 달라지는 것 */
.so-changes{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;max-width:900px;margin:44px auto 0}
.so-change{min-width:0;background:#fff;border:1px solid rgba(20,20,20,.08);border-radius:22px;padding:30px 26px;box-shadow:0 10px 28px rgba(20,20,20,.05)}
.so-change-side{display:inline-block;font-size:15px;font-weight:900;color:#fff;background:var(--dark);padding:8px 18px;border-radius:50px;margin:0 0 18px}
.so-change ul{list-style:none;margin:0;padding:0;display:grid;gap:14px}
.so-change li{position:relative;padding-left:26px;font-size:16.5px;font-weight:700;line-height:1.65}
.so-change li::before{content:"";position:absolute;left:0;top:.35em;width:17px;height:17px;border-radius:50%;background:var(--g)}
.so-change li::after{content:"";position:absolute;left:5.5px;top:.62em;width:5px;height:8px;border:solid #fff;border-width:0 2px 2px 0;transform:rotate(45deg)}
@media(max-width:760px){.so-changes{grid-template-columns:minmax(0,1fr)}}

/* 9. 클로징 */
.so-closing{text-align:center}
.so-closing p{margin:0;font-size:25px;font-weight:800;line-height:1.7}
.so-closing .so-gap{margin-top:34px}
.so-closing .so-hl{color:var(--g)}
@media(max-width:640px){.so-closing p{font-size:19px}.so-closing .so-gap{margin-top:26px}}

/* 10. 신청 */
.so-apply{scroll-margin-top:88px}
.so-table{width:100%;max-width:640px;margin:36px auto 0;border-collapse:collapse;background:#fff;border:1px solid rgba(20,20,20,.1);border-radius:18px;overflow:hidden}
.so-table th,.so-table td{padding:18px 20px;text-align:left;font-size:16px;line-height:1.5;border-top:1px solid rgba(20,20,20,.08)}
.so-table tr:first-child th,.so-table tr:first-child td{border-top:0}
.so-table th{width:28%;font-weight:800;background:#F4F1E6;color:#3A3A3A}
.so-table td{font-weight:700}
.so-table td.is-pending{color:#8a8a8a;font-weight:600}
.so-pay{display:block;width:100%;max-width:640px;margin:22px auto 0;padding:18px 20px;border:0;border-radius:50px;background:#CFCFCF;color:#fff;font:inherit;font-size:17px;font-weight:800;cursor:not-allowed}
.so-pay-note{max-width:640px;margin:12px auto 0;text-align:center;font-size:13.5px;line-height:1.6;color:#7a7a7a}
@media(max-width:640px){.so-table th,.so-table td{padding:15px 14px;font-size:15px}.so-table th{width:32%}}
`;

export default function SalesOps() {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // 스크롤 등장 — 이펙트가 so-anim 을 붙인 뒤에만 숨김 → 등장. 스크립트가 안 돌면 전부 보인다.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("so-in");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );
    root.classList.add("so-anim");
    root.querySelectorAll(".so-reveal").forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
      root.classList.remove("so-anim");
    };
  }, []);

  // 하나를 재생하면 나머지는 멈춘다 (동시에 소리가 겹치지 않게)
  const pauseOthers = (index: number) => {
    videoRefs.current.forEach((video, i) => {
      if (video && i !== index && !video.paused) video.pause();
    });
  };

  const scrollToApply = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById("so-apply");
    if (!el) return; // 대상이 없으면 href 기본 동작에 맡긴다
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const placeKnown = !soIsPending(SO_PLACE);

  return (
    <div ref={rootRef} className="so">
      <style dangerouslySetInnerHTML={{ __html: SO_STYLE }} />

      {/* ── 1. 히어로 ── */}
      <section className="so-hero" id="so-hero">
        <div className="so-wrap so-hero-in">
          <div className="so-hero-copy">
            <p className="so-kicker">더그로우 X 리얼세일즈</p>
            <h1 className="so-h1">피트니스 성장 마스터키 세미나</h1>
            <p className="so-hero-sub">운영과 세일즈, 센터 매출을 여는 두 개의 열쇠</p>
            <ul className="so-tags">
              {SO_TARGET_TAGS.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <p className="so-hero-meta">
              <span>{SO_DATE}</span>
              {SO_TIME}
              {placeKnown && (
                <>
                  <br />
                  <span>장소</span>
                  {SO_PLACE}
                </>
              )}
            </p>
            <a className="so-cta" href="#so-apply" onClick={scrollToApply}>
              세미나 신청하기
            </a>
          </div>

          <div className="so-people">
            <div className="so-person-main so-media">
              <SoImg
                src={SO_IMG.hwang}
                alt="황현진 대표"
                sizes="(max-width: 860px) 380px, 440px"
                fit="contain"
                position="center bottom"
                priority
              />
              <p className="so-person-cap">
                <b>황현진</b>
                리얼세일즈(주) 대표
              </p>
            </div>
            <div className="so-person-sub so-media">
              <SoImg
                src={SO_IMG.kim}
                alt="김재강 대표"
                sizes="160px"
                position="center 18%"
              />
            </div>
            <p className="so-person-subcap">김재강 · (주)더그로우컴퍼니 대표이사</p>
          </div>
        </div>
      </section>

      {/* ── 2. 세일즈 축 문제 제기 ── */}
      <section className="so-sec so-cream">
        <div className="so-wrap">
          <h2 className="so-h2 so-reveal">아직도 이런 상담을 반복하고 계신다면</h2>

          <div className="so-talks so-stagger">
            {SO_TALKS.map((t) => (
              <div className="so-talk so-reveal" key={t.line}>
                <p className="so-bubble">{t.line}</p>
                <span className="so-diag">{t.diag}</span>
              </div>
            ))}
          </div>

          <div className="so-versus so-stagger">
            <p className="so-versus-row so-reveal">
              하수는 <mark>주장</mark>만 하지만, 고수는 <mark>주목</mark>시킵니다.
            </p>
            <p className="so-versus-row so-reveal">
              하수는 <mark>이성</mark>을 향하지만, 고수는 <mark>감정</mark>을 공략합니다.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. 황현진 작가 소개 (저서 · 영상 포함) ── */}
      <section className="so-sec so-dark2">
        <div className="so-wrap">
          <div className="so-prof so-reveal">
            <div className="so-prof-photo so-media">
              <SoImg
                src={SO_IMG.hwang}
                alt="세일즈작가 황현진"
                sizes="340px"
                fit="contain"
                position="center bottom"
              />
            </div>
            <div>
              <h2 className="so-prof-h">{SO_HWANG_HEADLINE}</h2>
              <ul className="so-bio">
                {SO_HWANG_BIO.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          </div>

          <h3 className="so-sub-h so-reveal">저서</h3>
          <div className="so-books so-stagger">
            {SO_IMG.books.map((b) => (
              <div className="so-book so-reveal" key={b.src}>
                <div className="so-media">
                  <SoImg
                    src={b.src}
                    alt={`${b.title} 표지`}
                    sizes="(max-width: 640px) 45vw, 240px"
                    fit="contain"
                  />
                </div>
                <p className="so-book-t">{b.title}</p>
              </div>
            ))}
          </div>

          {/* 기존 SALES SALON 영상 섹션 — 새로 만들지 않고 이 안으로 옮겼다 */}
          <div className="so-vid">
            <p className="so-vid-label">SALES SALON</p>
            <h3 className="so-vid-title">황현진 대표의 세일즈 화법, 영상으로 먼저 만나보세요</h3>
            <div className="so-vid-grid">
              {SO_VIDEOS.map(({ src, poster }, i) => (
                <div className="so-vid-card" key={src}>
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
          </div>
        </div>
      </section>

      {/* ── 4. 운영 축 문제 제기 ── */}
      <section className="so-sec so-white">
        <div className="so-wrap so-narrow">
          <h2 className="so-h2 so-reveal">상담도, 재등록도, 직원 교육도 대표가 하고 계신다면</h2>
          <p className="so-op-body so-reveal">
            대표가 하루 빠지면 매출이 흔들리는 센터는 커질 수 없습니다. 감이 아니라 숫자로, 사람이 아니라
            구조로 돌아가는 센터를 만드는 법을 나눕니다.
          </p>
        </div>
      </section>

      {/* ── 5. 김재강 대표 소개 ── */}
      <section className="so-sec so-cream">
        <div className="so-wrap">
          <div className="so-kim so-reveal">
            <div className="so-kim-photo so-media">
              <SoImg
                src={SO_IMG.kim}
                alt="김재강 대표"
                sizes="340px"
                position="center 18%"
              />
            </div>
            <div>
              <span className="so-kim-role">{SO_KIM_ROLE}</span>
              <h2 className="so-kim-name">김재강</h2>
              <p className="so-kim-bio">{SO_KIM_BIO}</p>
              <ul className="so-kim-stats">
                {SO_KIM_STATS.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. 이런 분들께 필요합니다 ── */}
      <section className="so-sec so-white">
        <div className="so-wrap">
          <h2 className="so-h2 so-reveal">이런 분들께 필요합니다</h2>
          <div className="so-needs so-stagger">
            {SO_NEEDS.map((n, i) => (
              <div className="so-need so-reveal" key={n.who}>
                <div className="so-need-n">{i + 1}</div>
                <h3 className="so-need-who">{n.who}</h3>
                <p className="so-need-body">{n.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. 커리큘럼 · 타임테이블 ── */}
      <section className="so-sec so-dark">
        <div className="so-wrap">
          <h2 className="so-h2 so-reveal">
            커리큘럼 · <em>타임테이블</em>
          </h2>
          <div className="so-parts">
            {SO_PARTS.map((p) => (
              <div className="so-part so-reveal" key={p.time}>
                <div className="so-part-head">
                  <span className="so-part-time">{p.time}</span>
                  <span className="so-part-speaker">{p.speaker}</span>
                </div>
                <h3 className="so-part-title">{p.title}</h3>
                <div className="so-keys">
                  {p.keys.map((k) => (
                    <div className="so-key" key={k.name}>
                      <div className="so-key-head">
                        <span className="so-key-tag">{k.tag}</span>
                        <span className="so-key-name">{k.name}</span>
                      </div>
                      <ul>
                        {k.points.map((pt) => (
                          <li key={pt}>{pt}</li>
                        ))}
                      </ul>
                      {k.quotes.length > 0 && (
                        <div className="so-qs">
                          {k.quotes.map((q) => (
                            <p className="so-q" key={q}>
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

      {/* ── 8. 듣고 나면 달라지는 것 ── */}
      <section className="so-sec so-cream">
        <div className="so-wrap">
          <h2 className="so-h2 so-reveal">듣고 나면 달라지는 것</h2>
          <div className="so-changes so-stagger">
            {SO_CHANGES.map((c) => (
              <div className="so-change so-reveal" key={c.side}>
                <span className="so-change-side">{c.side}</span>
                <ul>
                  {c.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. 클로징 ── */}
      <section className="so-sec so-dark">
        <div className="so-wrap so-narrow so-closing">
          {SO_CLOSING.map((group, gi) => (
            <div className={gi > 0 ? "so-gap so-reveal" : "so-reveal"} key={gi}>
              {group.map((line, li) => (
                <p key={line} className={gi === 1 && li === 1 ? "so-hl" : undefined}>
                  {line}
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── 10. 신청 ── */}
      <section className="so-sec so-cream so-apply" id="so-apply">
        <div className="so-wrap">
          <h2 className="so-h2 so-reveal">세미나 신청 안내</h2>
          <table className="so-table so-reveal">
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
                <td className={soIsPending(SO_CAPACITY) ? "is-pending" : undefined}>
                  {soFormatCapacity(SO_CAPACITY)}
                </td>
              </tr>
              <tr>
                <th scope="row">가격</th>
                <td className={soIsPending(SO_PRICE) ? "is-pending" : undefined}>
                  {soFormatPrice(SO_PRICE)}
                </td>
              </tr>
            </tbody>
          </table>
          {/* 결제 연동은 다음 작업 — 자리만 잡아 둔 비활성 버튼 */}
          <button type="button" className="so-pay" disabled aria-disabled="true">
            세미나 신청하기
          </button>
          <p className="so-pay-note">신청 접수는 준비 중입니다.</p>
        </div>
      </section>
    </div>
  );
}
