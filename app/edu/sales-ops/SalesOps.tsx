"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 피트니스 성장 마스터키 세미나 (/edu/sales-ops) — 더그로우 X 리얼세일즈
//
//  · 구조·스타일은 /edu/gx-class 를 따른다. 주입 HTML 없이 전부 React 렌더,
//    클래스 접두사 so-, 상수 접두사 SO_.
//  · 일자·장소·정원·가격은 lib/salesOps.ts 상수만 수정한다 (장소·정원·가격은 TODO).
//  · 섹션: 히어로(직책 아코디언 → 신청 폼 역할 연동) → 세일즈 문제(하수↔고수 대조) → 황현진 소개(저서 3D 슬라이드·영상)
//    → 운영(김재강 소개 → 고통 말풍선 → 원칙 → GROW SYSTEM) → 커리큘럼 → 변화 → 클로징 → 신청(FAQ 포함).
//  · 하단 고정 바: 마감 카운트다운 + 잔여석(실제 결제 완료 건수) + 좌석 신청하기. 마감·매진이면 신청 폼·결제도 막는다
//    (서버의 결제 승인도 같은 조건으로 거부 — lib/seminarSeats.ts).
//  · 영상(SALES SALON)은 3번 섹션 안에 있다. 자체 호스팅이며 인스타그램 임베드·링크는
//    이 페이지 어디에도 두지 않는다 (외부 이탈 방지).
//  · 애니메이션 fail-safe: 기본은 전부 표시. 이펙트가 루트에 so-anim 을 붙인 뒤에만
//    숨김 → 등장. 스크립트가 안 돌면 모든 섹션이 보인 상태로 남는다.
//  · IntersectionObserver 는 언마운트 시 정리, 전역 함수 없음.
//  · 신청·결제: 신청 섹션의 결제 카드 2종(components/edu/SalesOpsPay.tsx) → /checkout → 토스 → 시트 기록.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import SalesOpsPay from "@/components/edu/SalesOpsPay";
import {
  SO_CAPACITY,
  SO_DEADLINE_MS,
  SO_DATE,
  SO_PLACE,
  SO_PRICE_NORMAL,
  SO_PRICE_STORY,
  SO_TIME,
  soFormatCapacity,
  soFormatPrice,
  soIsPending,
} from "@/lib/salesOps";

// ── 이미지 ──────────────────────────────────────────────────────────────────
// hwang: 배경이 제거된 누끼. consultants/hwang-hyunjin.png 의 투명 여백을 걷고 WebP 로 줄인 사본
//        (원본 PNG 는 저장소에 올리지 않았다. 이 페이지는 아래 webp 만 불러온다)
// kim:   기존 진단 멘토 페이지가 쓰는 경로를 그대로 참조한다 (복사하지 않음)
// kimHero: kim 원본(흰 배경)에서 배경을 걷어 내고, 황현진 누끼와 얼굴 크기·머리 위 여백이
//        비슷해지도록 잘라 낸 히어로 전용 WebP. 원본 JPG 는 건드리지 않았다.
const SO_IMG = {
  hwang: "/edu/sales-ops/hwang-hyunjin.webp",
  kim: "/consultants/kim-jaegang.jpg",
  kimHero: "/edu/sales-ops/kim-jaegang.webp",
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
// 히어로 대상 안내 2줄. 첫 줄은 좁은 화면에서 "등 피트니스 종사자분들" 앞에서 끊기도록 둘로 나눈다.
const SO_TARGET_LINES: [string, string][] = [
  ["헬스 · 필라테스 · 요가 · 바레", "등 피트니스 종사자분들"],
  ["강사 · 실장 · 원장 · 점장을 위한", "세일즈 · 운영 교육"],
];

// ── 2. 세일즈 축 문제 제기 — 상담 대사 원문(하수) ↔ 바꾼 말(고수). 좌: 이렇게 말하면 / 우: 이렇게 바뀝니다
// pro 가 없는 항목은 우측에 "2부에서 공개"만 보인다 (SO_QUOTES 는 커리큘럼에서 그대로 노출한다).
const SO_TALKS: { line: string; diag: string; pro: string | null }[] = [
  {
    line: "3개월보단 12개월이 훨씬 저렴하니까 이렇게 하세요.",
    diag: "이성적 설득에만 집착",
    pro: "도화지 10장에 그리는 그림 vs 100장에 그리는 그림, 어떤 완성도를 원하세요?",
  },
  {
    line: "주사요? 에이~ 살 빼려면 땀을 흘리셔야죠.",
    diag: "회원의 반응에 직설적으로 반박",
    pro: "운동이 적금이라면, 주사는 대출입니다.",
  },
  {
    line: "회원님, 가격 대비 저희 시설과 기구가 최고죠!",
    diag: "주장만 늘어놓는 설득",
    pro: null,
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
// 진단 멘토 페이지의 1인칭 문단("저는 …마주해온 사람입니다")을 이 페이지에서만 3인칭으로 바꿨다.
// 진단 멘토 페이지 원문은 그대로 둔다.
const SO_KIM_BIO =
  "46개 필라테스와 6개 대형 피트니스를 총괄하며 10년간 쌓은 운영 데이터로 센터의 구조를 설계합니다.";
const SO_KIM_STATS = ["52개 센터 총괄", "10년 운영 데이터", "수백 명 조직 리딩"];

// ── 6. 이런 분들께 필요합니다 ───────────────────────────────────────────────
// 4. 운영 축 — 맨 앞의 고통 장면 (원칙 문장 앞). problem 섹션과 같은 말풍선 스타일.
// TODO 대표님 확인: 실제 위탁센터에서 들은 말로 교체
const SO_OPS_PAINS = [
  "원장님 오늘 안 나오세요? 그럼 상담은 내일 다시…",
  "이번 달 매출이 왜 빠졌는지 모르겠어요",
  "PT 재등록은 담당 쌤 따라 나갔어요",
];

// 4. 운영 축 — 본문 아래 3칸 카드
const SO_OPS_CARDS = [
  {
    label: "운영",
    title: "숫자로 읽는 센터",
    body: "유효회원 · 객단가 · 상담 성공률 · 유지율, 매일 확인하는 운영판",
  },
  {
    label: "CS",
    title: "이탈을 막는 응대",
    body: "재등록이 결정되는 첫 4주 관리 루틴과 응대 기준",
  },
  {
    label: "시스템",
    title: "맡겨도 흔들리지 않는 센터",
    body: "FC·매니저에게 맡길 일과 원장이 볼 숫자를 나누는 기준",
  },
];

// 4. 운영 축 — 운영 시스템 화면 3D 원통 슬라이드 (public/edu/sales-ops/ops/)
const SO_SYS_LABEL = "GROW SYSTEM";
const SO_SYS_TITLE = "원장이 자리를 비워도, 숫자가 지켜지는 이유";
const SO_SYS_SUB = "더그로우가 운영하는 센터에서 매일 쓰는 운영 시스템 화면입니다";
const SO_SYS_SCREENS = [
  { src: "/edu/sales-ops/ops/ops-01-promo.webp", name: "홍보일지", desc: "어디에 무엇을 뿌렸는지, 지도로 기록" },
  { src: "/edu/sales-ops/ops/ops-02-dashboard.webp", name: "대시보드", desc: "유효회원·만료·매출·이탈 위험을 한 화면에" },
  { src: "/edu/sales-ops/ops/ops-03-today.webp", name: "오늘 할 일", desc: "재등록·미가입 콜 대상을 매일 자동으로" },
  { src: "/edu/sales-ops/ops/ops-04-pt.webp", name: "PT 관리", desc: "트레이너별 매출·재등록률·잔여 세션" },
];
const SO_SYS_ROTATE_MS = 3500;

// 히어로 직책 탭 — 한 줄 탭 3개 + 아래 패널 1개(속마음 → 가져갈 것 3개 → CTA). 기본은 첫 탭이 선택된 상태.
// role: 신청 폼의 역할 선택값 (components/edu/SalesOpsPay.tsx 의 ROLES 와 같은 문자열)
const SO_ROLES = [
  {
    id: "trainer",
    tab: "강사·트레이너",
    role: "트레이너 · 강사",
    quote: "권하는 게 영업처럼 느껴져, 자꾸 말을 아끼고 있다면",
    take: [
      "'영업'이라는 부담 대신, 전문가로서 당당하게 권하는 법",
      "회원의 마음을 여는 질문 한 줄",
      "몰입시키는 한 줄 권유화법",
    ],
  },
  {
    id: "manager",
    tab: "실장·팀장",
    role: "관리자 · 팀장 · 실장",
    quote: "상담은 매번 열심인데, 등록률은 매번 들쭉날쭉하다면",
    take: ["상담 등록률을 끌어올리는 실전 화법", "재등록이 결정되는 첫 4주 관리 루틴", "이탈을 막는 응대 기준"],
  },
  {
    id: "owner",
    tab: "원장·점장",
    role: "대표 · 원장",
    quote: "하루만 자리를 비워도 센터가 흔들린다면",
    take: [
      "유효회원·객단가·상담 성공률·유지율을 한 장으로 읽는 운영판",
      "FC·매니저에게 맡길 일과 원장이 볼 숫자를 나누는 기준",
      "대표가 자리를 비워도 유지되는 루틴",
    ],
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
          "대표가 매일 붙잡고 있지 않아도 되는 업무 분장",
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
          "회원의 반대(가격·시간·효과)에 답하는 한 줄 화법",
        ],
        quotes: SO_QUOTES,
      },
      {
        tag: "2nd Key",
        name: "호감의 기술",
        points: [
          "회원은 '좋은 사람'이 권하는 '좋아 보이는 것'을 선택합니다",
          "권유가 '영업'으로 들리지 않게 하는 호감 설계",
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
      "대표가 자리를 비워도 유지되는 루틴을 가져갑니다",
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
  ["원장님께는,", "자리를 비워도 숫자가 지켜지는 센터를."],
];

// ── 신청 안내 아래 FAQ ──────────────────────────────────────────────────────
// a 가 null 이면 렌더링하지 않는다 (확정 전 문구를 화면에 내지 않기 위해). 질문형 후킹을 피하려고 항목명만 쓴다.
const SO_FAQ: { q: string; a: string | null }[] = [
  {
    q: "환불 규정",
    a: "강의 5일 전까지는 100% 환불이 가능합니다. 정원이 한정된 강의라 그 이후에는 환불이 불가합니다.",
  },
  {
    q: "단체 신청",
    a: "단체 예약이 가능합니다.",
  },
  {
    q: "장소 · 시간",
    a: soIsPending(SO_PLACE) ? null : `${SO_DATE} ${SO_TIME} · ${SO_PLACE}`,
  },
  {
    q: "주차",
    a: "가능합니다. 최초 30분은 무료이며, 이후에는 시간당 3,000원입니다. 인근 공영주차장이나 대중교통 이용을 권장드립니다.",
  },
  // 강의자료·녹화본, 1부·2부 부분 수강 문항은 두지 않는다 (오너 지시 2026-10-20)
  {
    q: "증빙 (세금계산서 · 현금영수증)",
    // TODO 대표님 확인: 발행 가능 여부와 신청 방법
    a: null,
  },
];
const SO_FAQ_SHOWN = SO_FAQ.filter((f): f is { q: string; a: string } => f.a !== null);

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
.so-hero-copy{min-width:0;text-align:center}
.so-h1{font-size:46px;font-weight:900;line-height:1.28;margin:0 0 16px}
.so-hero-sub{font-size:19px;line-height:1.6;color:#C8D3CD;margin:0 0 26px}
/* 대상 안내 — 가운데가 은은하게 밝고 양쪽으로 사라지는 띠(위아래 1px 선). 좁은 화면(단일 컬럼)에서는 화면 가로 꽉 차게 */
.so-tags{position:relative;margin:0 0 26px;padding:14px 0;display:grid;gap:5px;word-break:keep-all;background:linear-gradient(90deg,transparent 0%,rgba(34,181,115,.18) 50%,transparent 100%)}
.so-tags::before,.so-tags::after{content:"";position:absolute;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent 0%,rgba(34,181,115,.4) 50%,transparent 100%)}
.so-tags::before{top:0}
.so-tags::after{bottom:0}
.so-tags p{margin:0;font-size:13.5px;font-weight:600;line-height:1.55;color:#fff}
.so-tags span{display:inline-block}
/* 대상 칩 — 탭. 아래 패널은 선택한 대상의 '가져갈 것' */
/* 직책 탭 — 가로 한 줄 pill 3개 + 아래 패널 1개 */
.so-tabs{margin:0 0 30px;text-align:left}
.so-tabs-hint{margin:0 0 10px;text-align:center;font-size:13px;line-height:1.4;color:#8F9A94}
.so-tabs-row{display:flex;gap:8px;margin:0 0 12px}
.so-tab{appearance:none;flex:1 1 0;min-width:0;min-height:44px;padding:0 4px;border:1px solid rgba(255,255,255,.3);border-radius:999px;background:transparent;color:#D3DCD7;font:inherit;font-size:14px;font-weight:800;letter-spacing:-.02em;white-space:nowrap;text-align:center;cursor:pointer;transition:background-color .2s,border-color .2s,color .2s}
.so-tab.is-on{background:var(--g);border-color:var(--g);color:#fff}
.so-tab:focus-visible{outline:2px solid var(--g);outline-offset:2px}
.so-tp-stack{display:grid;border:1px solid rgba(34,181,115,.45);border-radius:14px;background:rgba(34,181,115,.08)}
.so-tp{grid-area:1/1;padding:18px 18px 20px;opacity:0;visibility:hidden;transition:opacity .2s ease,visibility 0s linear .2s}
.so-tp.is-on{opacity:1;visibility:visible;transition-delay:0s}
.so-tp-quote{margin:0 0 16px;font-size:15.5px;font-weight:700;line-height:1.7;color:#fff}
.so-tp-take{list-style:none;margin:0 0 18px;padding:0;display:grid;gap:10px;text-align:left}
.so-tp-take li{display:flex;align-items:flex-start;gap:10px;font-size:15px;line-height:1.6;color:#E4EBE7}
.so-tp-n{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;margin-top:1px;border-radius:50%;background:var(--g);color:#fff;font-size:12.5px;font-weight:900}
.so-tp-cta{appearance:none;display:flex;align-items:center;justify-content:center;width:100%;min-height:52px;padding:12px 16px;border:0;border-radius:50px;background:var(--g);color:#fff;font:inherit;font-size:16px;font-weight:800;cursor:pointer}
.so-tp-cta:focus-visible{outline:2px solid #fff;outline-offset:2px}
@media(prefers-reduced-motion:reduce){.so-tp,.so-tab{transition:none}}
/* 강사 카드 2장 — 같은 크기·같은 배경·같은 캡션. 두 사진 모두 배경 제거본(contain, 아래 정렬) */
.so-people{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;width:100%;max-width:520px;margin:0 auto;min-width:0}
.so-person{min-width:0;aspect-ratio:4/5;border-radius:20px;background:radial-gradient(120% 90% at 50% 18%,rgba(34,181,115,.34) 0%,rgba(34,181,115,.08) 55%,rgba(255,255,255,.03) 100%);border:1px solid rgba(34,181,115,.22)}
.so-person .so-img-ph{background:none;color:#5E6B65}
/* 캡션이 어두운 재킷 위에 놓여 대비가 약해서, 사진 아래쪽에 어두운 그라데이션을 깐다 */
.so-person::after{content:"";position:absolute;left:0;right:0;bottom:0;height:38%;background:linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,.66) 100%);pointer-events:none}
.so-person-cap{position:absolute;z-index:2;left:12px;right:12px;bottom:12px;margin:0;text-align:left;font-size:12.5px;font-weight:700;line-height:1.45;color:#E4EBE7;text-shadow:0 1px 8px rgba(0,0,0,.6)}
.so-person-cap b{display:block;font-size:17px;font-weight:900;color:#fff}
@media(max-width:860px){
  .so-hero{padding:52px 0 76px}
  .so-hero-in{grid-template-columns:minmax(0,1fr);gap:48px}
  .so-h1{font-size:32px}
  .so-hero-sub{font-size:16px}
  .so-tags{width:100vw;margin-left:calc(50% - 50vw)}
  .so-people{max-width:460px}
}
@media(max-width:640px){
  .so-person{border-radius:16px}
  .so-person-cap{left:10px;right:10px;bottom:10px;font-size:11.5px}
  .so-person-cap b{font-size:15px}
}

/* 2. 세일즈 축 문제 제기 */
/* 하수↔고수 대조 — 한 줄이 좌(이렇게 말하면)·우(이렇게 바뀝니다) 두 칸. 모바일은 위아래로 쌓는다 */
.so-vs{display:grid;gap:22px;margin:44px 0 0}
.so-vs-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;align-items:stretch}
.so-vs-cell{min-width:0;display:flex;flex-direction:column;gap:10px}
.so-vs-tag{align-self:flex-start;font-size:12.5px;font-weight:800;letter-spacing:.02em;color:#7A7A7A}
.so-vs-r .so-vs-tag{color:#0B6B3A}
.so-vs-pro{flex:1 1 auto;border-radius:18px;padding:22px 20px;font-size:17px;font-weight:800;line-height:1.6;background:var(--dark);color:#fff;box-shadow:0 8px 24px rgba(20,20,20,.12)}
.so-vs-tease{flex:1 1 auto;display:flex;align-items:center;border-radius:18px;padding:22px 20px;font-size:16px;font-weight:800;line-height:1.6;color:#0B6B3A;background:rgba(34,181,115,.1);border:1px dashed rgba(34,181,115,.55)}
/* 4. 운영 고통 장면 — problem 의 말풍선과 같은 스타일 */
.so-pains{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin:0 0 56px}
.so-pains .so-bubble{margin:0}
.so-bubble{flex:1 1 auto;position:relative;background:#fff;border:1px solid rgba(20,20,20,.08);border-radius:18px;padding:22px 20px;font-size:17px;font-weight:700;line-height:1.6;box-shadow:0 8px 24px rgba(20,20,20,.06)}
.so-bubble::after{content:"";position:absolute;left:26px;bottom:-9px;width:16px;height:16px;background:#fff;border-right:1px solid rgba(20,20,20,.08);border-bottom:1px solid rgba(20,20,20,.08);transform:rotate(45deg)}
.so-diag{align-self:flex-start;margin-top:8px;font-size:13px;font-weight:700;color:#6E6E6E;background:#E6E6E6;padding:7px 14px;border-radius:50px}
.so-versus{display:grid;gap:12px;max-width:760px;margin:44px auto 0}
.so-versus-row{background:var(--dark);color:#fff;border-radius:16px;padding:22px 24px;font-size:18px;font-weight:700;line-height:1.7;text-align:center}
.so-versus-row mark{background:none;color:var(--g);font-weight:900}
@media(max-width:860px){.so-pains{grid-template-columns:minmax(0,1fr)}}
@media(max-width:760px){.so-vs{gap:26px}.so-vs-row{grid-template-columns:minmax(0,1fr);gap:14px}}
@media(max-width:640px){.so-bubble{font-size:16px}.so-vs-pro{font-size:16px}.so-versus-row{font-size:16px;padding:18px 16px}}

/* 3. 황현진 소개 */
.so-prof{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr);gap:44px;align-items:center;max-width:920px;margin:0 auto}
.so-prof-photo{width:100%;max-width:340px;margin:0 auto;aspect-ratio:4/5;border-radius:22px;background:radial-gradient(120% 90% at 50% 20%,rgba(34,181,115,.32) 0%,rgba(34,181,115,.07) 60%,rgba(255,255,255,.03) 100%);border:1px solid rgba(34,181,115,.22)}
.so-prof-photo .so-img-ph{background:none;color:#5E6B65}
.so-prof-h{font-size:26px;font-weight:900;line-height:1.5;margin:0 0 20px}
.so-prof-h em{font-style:normal;color:var(--g)}
.so-bio{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.so-bio li{position:relative;padding-left:18px;font-size:16px;line-height:1.65;color:#D3DCD7}
.so-bio li::before{content:"";position:absolute;left:0;top:.62em;width:7px;height:7px;border-radius:50%;background:var(--g)}
/* 저서 — 1열 무한 자동 슬라이드(왼쪽으로 천천히), 가운데는 크고 선명하게·양옆은 안쪽으로 기울여 작게(3D) */
.so-bs{margin-top:72px}
.so-bs-label{margin:0 0 6px;text-align:center;font-size:13px;font-weight:800;letter-spacing:.04em;color:var(--g)}
.so-bs-stage{position:relative;perspective:900px;overflow:hidden;padding:20px 0 30px;-webkit-user-select:none;user-select:none}
.so-bs-track{position:relative;display:flex;gap:18px;width:max-content;will-change:transform}
.so-bs-item{flex:0 0 auto;height:140px;border-radius:5px;background:#161616;transform-style:preserve-3d;will-change:transform,opacity;pointer-events:none}
.so-bs-item img{display:block;height:100%;width:auto;max-width:none;border-radius:5px;-webkit-user-drag:none}
@media(max-width:860px){.so-prof{grid-template-columns:minmax(0,1fr);gap:28px}.so-prof-h{font-size:22px;text-align:center}}
@media(max-width:640px){.so-bs{margin-top:56px}}

/* 3-2. 영상 (SALES SALON) */
.so-vid{margin-top:84px}
.so-vid-head{margin:0 0 26px;text-align:center}
.so-vid-lbl{margin:0 0 8px;font-size:13px;font-weight:800;letter-spacing:.04em;color:var(--g)}
.so-vid-title{margin:0 0 8px;font-size:24px;font-weight:800;line-height:1.4;color:#fff;text-wrap:balance}
.so-vid-sub{margin:0;font-size:14.5px;line-height:1.6;color:#98A39D}
@media(max-width:640px){.so-vid-title{font-size:20px}}
.so-vid-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}
.so-vid-card{position:relative;min-width:0;aspect-ratio:9/16;border-radius:16px;overflow:hidden;background:#000}
.so-vid-card video{display:block;width:100%;height:100%;object-fit:cover;background:#000}
.so-vid-dots{display:none}
/* 640px 이하 — 1줄 가로 슬라이드 (라이브러리 없이 CSS scroll-snap).
   641px 이상(태블릿 포함)은 위의 4열 그리드를 그대로 쓰고 점도 숨긴다.
   컨테이너만 가로로 스크롤되고 페이지(body)에는 가로 스크롤이 생기지 않는다.
   컨테이너를 래퍼 좌우 패딩(16px)만큼 음수 마진으로 화면 끝까지 늘리고, 안쪽 padding-inline 16px 로
   첫·마지막 카드가 화면 끝에 붙지 않게 한다. 카드를 78% 로 잡아 다음 카드가 오른쪽에 보인다. */
@media(max-width:640px){
  .so-vid{margin-top:60px}
  .so-vid-grid{position:relative;display:flex;align-items:flex-start;gap:12px;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;scrollbar-width:none;padding-inline:16px;scroll-padding-inline:16px;margin-inline:-16px}
  .so-vid-grid::-webkit-scrollbar{display:none}
  .so-vid-grid:focus-visible{outline:2px solid var(--g);outline-offset:-2px}
  .so-vid-card{flex:0 0 78%;scroll-snap-align:start;border-radius:12px}
  .so-vid-dots{display:flex;align-items:center;justify-content:center;margin-top:14px}
  .so-vid-dot{display:flex;align-items:center;justify-content:center;width:26px;height:26px;padding:0;border:0;background:none;cursor:pointer}
  .so-vid-dot::before{content:"";width:8px;height:8px;border-radius:999px;background:rgba(255,255,255,.28);transition:width .25s ease,background .25s ease}
  .so-vid-dot.is-on::before{width:22px;background:var(--g)}
}

/* 4. 운영 축 문제 제기 */
.so-op-body{max-width:780px;margin:22px auto 0;text-align:center;font-size:18px;line-height:1.85;color:#3F3F3F}
.so-op-body p{margin:0}
.so-op-body p+p{margin-top:10px}
.so-op-body .so-op-em{margin-top:18px;font-weight:900;color:var(--g)}
.so-need-lbl{display:inline-block;margin:0 0 14px;font-size:13px;font-weight:800;color:#0B6B3A;background:rgba(34,181,115,.14);padding:6px 13px;border-radius:50px}
@media(max-width:640px){.so-op-body{font-size:15.5px}}

/* 4-2. 운영 시스템 3D 원통 슬라이드 — 라이브러리 없이 CSS 3D transform.
   카드 폭 --w = 데스크톱 560px / 모바일 화면폭의 78%, 높이는 4:3. 반지름 = --w / 2 (4면 원통).
   원통을 translateZ(-반지름) 만큼 뒤로 밀어 정면 카드가 무대 평면에 오게 한다. */
.so-sys{margin-top:84px;text-align:center}
.so-sys-lbl{margin:0 0 12px;font-size:13px;font-weight:800;letter-spacing:.2em;color:var(--g)}
.so-sys-title{margin:0 0 12px;font-size:30px;line-height:1.4;font-weight:900;text-wrap:balance}
.so-sys-sub{margin:0 auto 34px;max-width:560px;font-size:16px;line-height:1.7;color:#555}
.so-cyl-wrap{overflow:hidden;padding:8px 0}
.so-cyl-stage{--w:min(78vw,560px);position:relative;width:var(--w);height:calc(var(--w) * .75);margin:0 auto;perspective:1400px;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
.so-cyl{position:absolute;inset:0;transform-style:preserve-3d;transition:transform .9s cubic-bezier(.22,.61,.36,1)}
.so-cyl-face{position:absolute;inset:0;border-radius:14px;background:#0F1413;border:1px solid rgba(20,20,20,.1);box-shadow:0 18px 44px rgba(20,20,20,.18);backface-visibility:hidden;-webkit-backface-visibility:hidden;opacity:.35;filter:brightness(.6);transition:opacity .9s cubic-bezier(.22,.61,.36,1),filter .9s cubic-bezier(.22,.61,.36,1)}
.so-cyl-face.is-front{opacity:1;filter:none}
.so-cyl-face .so-img-ph{background:none;color:#5E6B65}
.so-cyl-face img{pointer-events:none;-webkit-user-select:none;user-select:none;-webkit-user-drag:none;-webkit-touch-callout:none}
.so-cyl-mark{position:absolute;right:10px;bottom:8px;z-index:2;font-size:12px;font-weight:800;letter-spacing:.04em;color:rgba(255,255,255,.55);text-shadow:0 1px 4px rgba(0,0,0,.55);pointer-events:none;-webkit-user-select:none;user-select:none}
.so-cyl-cap{min-height:72px;margin-top:26px}
.so-cyl-cap-in{display:flex;flex-direction:column;gap:6px;align-items:center;animation:so-cap-in .6s ease both}
.so-cyl-cap-in b{font-size:20px;font-weight:900}
.so-cyl-cap-in span{font-size:15.5px;line-height:1.6;color:#555}
@keyframes so-cap-in{from{opacity:0}to{opacity:1}}
.so-sys-dots{display:flex;align-items:center;justify-content:center;margin-top:6px}
.so-sys-dot{appearance:none;border:0;background:none;cursor:pointer;width:32px;height:32px;display:flex;align-items:center;justify-content:center;padding:0}
.so-sys-dot::before{content:"";width:9px;height:9px;border-radius:50%;background:rgba(20,20,20,.2);transition:background-color .2s,transform .2s}
.so-sys-dot.is-on::before{background:var(--g);transform:scale(1.25)}
.so-sys-dot:focus-visible{outline:2px solid var(--g);outline-offset:-2px;border-radius:8px}
/* 모션 축소: 회전 없이 정면 카드만 겹쳐 두고 페이드로만 전환 */
.so-cyl-flat .so-cyl{transform:none!important;transition:none}
.so-cyl-flat .so-cyl-face{transform:none!important;opacity:0;filter:none;transition:opacity .5s ease}
.so-cyl-flat .so-cyl-face.is-front{opacity:1}
@media(max-width:640px){
  .so-sys{margin-top:64px}
  .so-sys-title{font-size:23px}
  .so-sys-sub{font-size:14.5px;margin-bottom:26px}
  .so-cyl-cap-in b{font-size:18px}
  .so-cyl-cap-in span{font-size:14.5px}
  .so-cyl-mark{font-size:10.5px;right:8px;bottom:6px}
}
@media(prefers-reduced-motion:reduce){.so-cyl-cap-in{animation:none}}

/* 5. 김재강 소개 */
.so-kim-wrap{margin:0 0 72px}
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
@media(max-width:640px){.so-table th,.so-table td{padding:15px 14px;font-size:15px}.so-table th{width:32%}}
/* FAQ — 아코디언(details) */
.so-faq{max-width:640px;margin:40px auto 0}
.so-faq-h{margin:0 0 12px;font-size:18px;font-weight:800;text-align:center}
.so-faq-item{background:#fff;border:1px solid rgba(20,20,20,.1);border-radius:14px;margin:0 0 10px;overflow:hidden}
.so-faq-item summary{cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:16px 18px;font-size:16px;font-weight:800}
.so-faq-item summary::-webkit-details-marker{display:none}
.so-faq-item summary::after{content:"+";font-size:20px;font-weight:900;color:var(--g)}
.so-faq-item[open] summary::after{content:"−"}
.so-faq-item summary:focus-visible{outline:2px solid var(--g);outline-offset:-2px}
.so-faq-item p{margin:0;padding:0 18px 16px;font-size:15.5px;line-height:1.7;color:#3A3A3A}
/* 하단 고정 바 — 모든 폭. 숨김일 때는 포커스도 못 받게 visibility 로 접는다 */
.so{--so-bar-h:68px}
.so-bar{position:fixed;left:0;right:0;bottom:0;z-index:40;background:rgba(10,10,10,.94);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);transform:translateY(100%);visibility:hidden;transition:transform .25s ease,visibility 0s linear .25s}
.so-bar.is-on{transform:none;visibility:visible;transition-delay:0s}
.so-bar-in{max-width:880px;margin:0 auto;min-height:var(--so-bar-h);display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px calc(10px + env(safe-area-inset-bottom))}
.so-bar-txt{min-width:0;color:#fff}
.so-bar-cd{margin:0;font-size:15px;font-weight:800;line-height:1.35;white-space:nowrap;font-variant-numeric:tabular-nums;font-feature-settings:"tnum"}
.so-bar-cd .so-bar-num{display:inline-block;color:var(--g);font-variant-numeric:tabular-nums;font-feature-settings:"tnum"}
.so-bar-seats{margin:1px 0 0;font-size:12px;font-weight:600;line-height:1.4;color:#B8C4BE;font-variant-numeric:tabular-nums}
.so-bar-btn{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;height:46px;padding:0 22px;border:0;border-radius:50px;background:var(--g);color:#fff;font:inherit;font-size:15px;font-weight:800;text-decoration:none;cursor:pointer}
.so-bar-btn:disabled{background:#4a4a4a;color:#9a9a9a;cursor:not-allowed}
@media(max-width:380px){.so-bar-cd{font-size:13.5px}.so-bar-btn{padding:0 16px;font-size:14px}}
/* 하단 바 높이만큼 페이지 끝 여백 */
.so-apply{padding-bottom:calc(var(--so-bar-h) + 40px + env(safe-area-inset-bottom))}
@media(prefers-reduced-motion:reduce){.so-bar,.so-bar.is-on{transition:none}}
`;

/**
 * 저서 표지 1열 무한 자동 슬라이드 (3D).
 *  · 표지 목록을 3번 복제해 이어 붙이고, 한 벌 길이만큼 흐르면 처음으로 되돌려 끊김이 없다. 왼쪽으로 천천히.
 *  · 가운데 표지는 scale 1 + 짙은 그림자, 양옆으로 갈수록 rotateY ±25deg · scale .85 · opacity .7 (연속 보간).
 *  · 변형은 requestAnimationFrame 에서 DOM 에 직접 쓴다 (React 재렌더 없음). 화면 밖에서는 멈춘다.
 *  · 마우스를 올리거나 터치하는 동안 일시정지, prefers-reduced-motion 이면 흐르지 않고 정지.
 */
function BookSlider({ books }: { books: { src: string; title: string }[] }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!stage || !track) return;
    const items = Array.from(track.children) as HTMLElement[];
    const n = books.length;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const SPEED = 26; // px/초 — 천천히
    let offset = 0;
    let last = 0;
    let raf = 0;
    let paused = false;
    let visible = true;

    const apply = () => {
      const first = items[0];
      if (!first) return;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 18;
      const period = (first.offsetWidth + gap) * n; // 한 벌의 길이
      const shift = reduced ? 0 : offset % period;
      track.style.transform = `translate3d(${-shift}px,0,0)`;
      const cx = stage.clientWidth / 2;
      items.forEach((el) => {
        const x = el.offsetLeft - shift + el.offsetWidth / 2; // 이 표지의 가운데가 무대 안 어디인지
        const t = Math.min(1, Math.abs(x - cx) / cx); // 0(가운데) ~ 1(가장자리)
        const dir = x < cx ? 1 : -1; // 왼쪽 표지는 오른쪽을, 오른쪽 표지는 왼쪽을 향해 기운다
        el.style.transform = `rotateY(${dir * 25 * t}deg) scale(${1 - 0.15 * t})`;
        el.style.opacity = String(1 - 0.3 * t);
        el.style.boxShadow = `0 ${8 + 14 * (1 - t)}px ${16 + 22 * (1 - t)}px rgba(0,0,0,${0.28 + 0.32 * (1 - t)})`;
      });
    };

    const tick = (now: number) => {
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      if (visible && !paused) offset += SPEED * dt;
      if (visible) apply();
      raf = requestAnimationFrame(tick);
    };

    apply();
    if (!reduced) raf = requestAnimationFrame(tick);

    const pause = () => {
      paused = true;
    };
    const resume = () => {
      paused = false;
    };
    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === "mouse") pause();
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "mouse") resume();
    };
    stage.addEventListener("pointerenter", onEnter);
    stage.addEventListener("pointerleave", onLeave);
    stage.addEventListener("touchstart", pause, { passive: true });
    stage.addEventListener("touchend", resume, { passive: true });
    stage.addEventListener("touchcancel", resume, { passive: true });
    window.addEventListener("resize", apply);
    const io = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io?.observe(stage);
    return () => {
      cancelAnimationFrame(raf);
      stage.removeEventListener("pointerenter", onEnter);
      stage.removeEventListener("pointerleave", onLeave);
      stage.removeEventListener("touchstart", pause);
      stage.removeEventListener("touchend", resume);
      stage.removeEventListener("touchcancel", resume);
      window.removeEventListener("resize", apply);
      io?.disconnect();
    };
  }, [books.length]);

  return (
    <div className="so-bs so-reveal">
      <p className="so-bs-label">황현진 대표 저서</p>
      <div className="so-bs-stage" ref={stageRef} role="group" aria-label="황현진 대표 저서 표지">
        <div className="so-bs-track" ref={trackRef}>
          {[0, 1, 2].flatMap((copy) =>
            books.map((b) => (
              <div className="so-bs-item" key={`${copy}-${b.src}`} aria-hidden={copy > 0 ? true : undefined}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.src} alt={copy === 0 ? `${b.title} 표지` : ""} draggable={false} loading="lazy" />
              </div>
            )),
          )}
        </div>
      </div>
    </div>
  );
}

export default function SalesOps() {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  // 영상 슬라이드 (1024px 이하에서만 가로 스크롤) — 현재 카드 점 표시용
  const sliderRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeVid, setActiveVid] = useState(0);

  // 히어로 직책 탭 — 선택된 탭(기본 0 = 강사·트레이너)과, CTA 가 신청 폼 역할을 맞추는 신호(n 이 매번 바뀐다).
  // 신청 폼 역할은 탭을 고르는 것만으로는 바뀌지 않고 CTA 를 눌렀을 때만 맞춰진다.
  const [activeRole, setActiveRole] = useState(0);
  const [preset, setPreset] = useState<{ value: string; n: number } | undefined>(undefined);

  // 하단 고정 바 — 페이지에 들어오면 계속 보이고, 신청 섹션에 닿으면(들어왔거나 이미 지나친 뒤) 숨긴다
  const [barOn, setBarOn] = useState(true);
  // 마감 카운트다운 — 숫자는 requestAnimationFrame 으로 DOM 에 직접 쓴다(재렌더 없이). 마감이 지나면 closed
  const cdRef = useRef<HTMLSpanElement>(null);
  const [closed, setClosed] = useState(false);
  // 잔여석 — 서버(/api/seminar-seats)가 토스 결제 완료 건수로 센 값. 못 가져오면 null 이고 줄을 숨긴다
  const [seats, setSeats] = useState<number | null>(null);

  // 운영 시스템 3D 원통 — idx 는 계속 늘어나는 회전 카운터(역회전 방지), active 는 idx % 4
  const sysStageRef = useRef<HTMLDivElement>(null);
  const [sysIdx, setSysIdx] = useState(0);
  const [sysVisible, setSysVisible] = useState(false);
  const [sysHover, setSysHover] = useState(false);
  const [sysReduced, setSysReduced] = useState(false);
  const sysCount = SO_SYS_SCREENS.length;
  const sysActive = ((sysIdx % sysCount) + sysCount) % sysCount;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSysReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // 화면에 보일 때만 돈다
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

  // 3.5초마다 한 칸 — 점을 누르거나 호버가 풀리면 타이머가 새로 시작된다
  useEffect(() => {
    if (!sysVisible || sysHover) return;
    const t = window.setTimeout(() => setSysIdx((v) => v + 1), SO_SYS_ROTATE_MS);
    return () => window.clearTimeout(t);
  }, [sysVisible, sysHover, sysIdx]);

  const goToSys = (target: number) => {
    // 가까운 방향으로 돈다 (앞으로 0~2칸, 바로 이전 화면이면 뒤로 1칸)
    let d = (target - sysActive + sysCount) % sysCount;
    if (d === sysCount - 1) d = -1;
    setSysIdx((v) => v + d);
  };

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

  // 영상 슬라이드 — 현재 카드 계산(점), 재생 중인 카드가 화면 밖으로 나가면 정지
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    // 현재 인덱스: 각 카드의 "스크롤 목표 위치"(clamp 적용)와 지금 위치가 가장 가까운 카드.
    // 끝에 가까운 카드들은 목표가 스크롤 끝으로 clamp 되어 같아질 수 있는데(태블릿 40%),
    // 그때는 뒤쪽 카드를 현재로 본다.
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = slider.scrollWidth - slider.clientWidth;
      if (max <= 1) {
        setActiveVid(0); // 데스크톱 그리드 — 스크롤이 없다 (점도 숨겨져 있다)
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

    // 재생 중인 영상이 슬라이드 밖으로 50% 이상 나가면 일시정지 (root = 슬라이드 컨테이너)
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

  // 점을 누르면 해당 카드로 이동 (맨 끝 근처 카드는 스크롤 끝에서 멈춘다)
  const goToVideo = (i: number) => {
    const slider = sliderRef.current;
    const card = cardRefs.current[i];
    if (!slider || !card) return;
    const pad = parseFloat(getComputedStyle(slider).paddingLeft) || 0;
    slider.scrollTo({ left: card.offsetLeft - pad, behavior: "smooth" });
  };

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

  // 아코디언 CTA — 신청 폼의 역할을 그 직책으로 맞추고 신청 섹션으로 스크롤
  const pickRole = (role: string) => {
    setPreset((p) => ({ value: role, n: (p?.n ?? 0) + 1 }));
    document.getElementById("so-apply")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const apply = document.getElementById("so-apply");
    if (!apply) return;
    // 신청 섹션 위치로 다시 읽는다. IntersectionObserver 는 경계를 '넘는 순간'만 알려 주어서 앵커 이동처럼
    // 한 번에 크게 점프하면 놓칠 수 있다 — 옵저버가 깨우면 위치를 다시 읽고, 스크롤·크기 변화에서도 같은 계산을 한다.
    const sync = () => setBarOn(!(apply.getBoundingClientRect().top < window.innerHeight));
    let raf = 0;
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; sync(); });
    };
    const io = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(schedule, { threshold: 0 });
    io?.observe(apply);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    sync();
    return () => {
      io?.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // "마감까지 DD일 HH:MM:SS.ms" — 밀리초는 2자리(1/100초)
  useEffect(() => {
    const pad = (v: number) => String(v).padStart(2, "0");
    let raf = 0;
    const tick = () => {
      const left = SO_DEADLINE_MS - Date.now();
      if (left <= 0) {
        setClosed(true);
        return;
      }
      const el = cdRef.current;
      if (el) {
        const d = Math.floor(left / 86_400_000);
        const h = Math.floor((left % 86_400_000) / 3_600_000);
        const m = Math.floor((left % 3_600_000) / 60_000);
        const s = Math.floor((left % 60_000) / 1000);
        const cs = Math.floor((left % 1000) / 10);
        el.textContent = `${pad(d)}일 ${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    let alive = true;
    fetch("/api/seminar-seats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { ok?: boolean; remaining?: unknown } | null) => {
        if (alive && d?.ok && typeof d.remaining === "number") setSeats(d.remaining);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // 마감 시각이 지났거나 잔여석이 0 이면 신청 폼·결제를 막는다. 잔여석을 못 가져온 경우(seats=null)는 막지 않는다.
  const soldOut = seats !== null && seats <= 0;
  const formOff = closed || soldOut;

  return (
    <div ref={rootRef} className="so">
      <style dangerouslySetInnerHTML={{ __html: SO_STYLE }} />

      {/* ── 1. 히어로 ── */}
      <section data-track-section="hero" className="so-hero" id="so-hero">
        <div className="so-wrap so-hero-in">
          <div className="so-hero-copy">
            <h1 className="so-h1">
              피트니스 성장
              <br />
              마스터키 세미나
            </h1>
            <p className="so-hero-sub">운영과 세일즈, 센터 매출을 여는 두 개의 열쇠</p>
            <div className="so-tags">
              {SO_TARGET_LINES.map(([a, b]) => (
                <p key={a}>
                  {a} <span>{b}</span>
                </p>
              ))}
            </div>
            <div className="so-tabs" data-track-section="target">
              <p className="so-tabs-hint">내 직책을 눌러보세요</p>
              <div className="so-tabs-row" role="tablist" aria-label="직책 선택">
                {SO_ROLES.map((r, i) => (
                  <button
                    type="button"
                    key={r.id}
                    role="tab"
                    id={`so-tab-${i}`}
                    aria-selected={i === activeRole}
                    aria-controls={`so-tp-${i}`}
                    className={`so-tab${i === activeRole ? " is-on" : ""}`}
                    onClick={() => setActiveRole(i)}
                  >
                    {r.tab}
                  </button>
                ))}
              </div>
              {/* 패널 3개를 같은 칸에 겹쳐 두고 선택된 것만 보인다 — 칸 높이가 가장 긴 내용에 맞춰 고정되어
                  탭을 바꿔도 아래 콘텐츠가 위아래로 흔들리지 않는다 (글자 크기·화면 폭이 바뀌어도 자동으로 맞는다) */}
              <div className="so-tp-stack">
                {SO_ROLES.map((r, i) => {
                  const on = i === activeRole;
                  return (
                    <div
                      className={`so-tp${on ? " is-on" : ""}`}
                      key={r.id}
                      id={`so-tp-${i}`}
                      role="tabpanel"
                      aria-labelledby={`so-tab-${i}`}
                      aria-hidden={!on}
                    >
                      <p className="so-tp-quote">“{r.quote}”</p>
                      <ol className="so-tp-take">
                        {r.take.map((t, k) => (
                          <li key={t}>
                            <span className="so-tp-n">{k + 1}</span>
                            {t}
                          </li>
                        ))}
                      </ol>
                      <button type="button" className="so-tp-cta" onClick={() => pickRole(r.role)} tabIndex={on ? 0 : -1}>
                        이 3가지 가져가기 · 좌석 신청 →
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="so-people">
            <div className="so-person so-media">
              <SoImg
                src={SO_IMG.hwang}
                alt="황현진 대표"
                sizes="(max-width: 860px) 230px, 260px"
                fit="contain"
                position="center bottom"
                priority
              />
              <p className="so-person-cap">
                <b>황현진</b>
                리얼세일즈(주) 대표
              </p>
            </div>
            <div className="so-person so-media">
              <SoImg
                src={SO_IMG.kimHero}
                alt="김재강 대표"
                sizes="(max-width: 860px) 230px, 260px"
                fit="contain"
                position="center bottom"
                priority
              />
              <p className="so-person-cap">
                <b>김재강</b>
                (주)더그로우컴퍼니 대표이사
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. 세일즈 축 문제 제기 ── */}
      <section data-track-section="problem" className="so-sec so-cream">
        <div className="so-wrap">
          <h2 className="so-h2 so-reveal">아직도 이런 상담을 반복하고 계신다면</h2>

          <div className="so-vs so-stagger">
            {SO_TALKS.map((t) => (
              <div className="so-vs-row so-reveal" key={t.line}>
                <div className="so-vs-cell so-vs-l">
                  <span className="so-vs-tag">이렇게 말하면</span>
                  <p className="so-bubble">{t.line}</p>
                  <span className="so-diag">{t.diag}</span>
                </div>
                <div className="so-vs-cell so-vs-r">
                  <span className="so-vs-tag">이렇게 바뀝니다</span>
                  {t.pro ? <p className="so-vs-pro">{t.pro}</p> : <p className="so-vs-tease">→ 2부에서 공개</p>}
                </div>
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
      <section data-track-section="hwang" className="so-sec so-dark2">
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

          <BookSlider books={SO_IMG.books} />

          {/* 기존 SALES SALON 영상 섹션 — 새로 만들지 않고 이 안으로 옮겼다 */}
          <div className="so-vid">
            <div className="so-vid-head so-reveal">
              <p className="so-vid-lbl">세일즈 맛보기</p>
              <h3 className="so-vid-title">현장에서 바로 쓰는 한 문장, 먼저 들어보세요</h3>
              <p className="so-vid-sub">황현진 대표의 실제 강의 중 일부입니다.</p>
            </div>
            <div
              className="so-vid-grid"
              ref={sliderRef}
              tabIndex={0}
              role="group"
              aria-label="황현진 대표 세일즈 화법 영상"
            >
              {SO_VIDEOS.map(({ src, poster }, i) => (
                <div
                  className="so-vid-card"
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
            {/* 1024px 이하에서만 보이는 현재 카드 점 (데스크톱은 4열 그리드라 숨김) */}
            <div className="so-vid-dots">
              {SO_VIDEOS.map(({ src }, i) => (
                <button
                  type="button"
                  key={src}
                  className={`so-vid-dot${i === activeVid ? " is-on" : ""}`}
                  aria-label={`영상 ${i + 1}번으로 이동`}
                  aria-current={i === activeVid ? "true" : undefined}
                  onClick={() => goToVideo(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. 운영 축 — 김재강 소개 → 고통 말풍선 → 원칙 → 카드 → GROW SYSTEM ── */}
      <section data-track-section="ops" className="so-sec so-white">
        <div className="so-wrap">
          {/* 김재강 대표 소개 (예전에는 별도 섹션이었다 — 고통 말풍선 바로 위로 옮겼다) */}
          <div className="so-kim-wrap" data-track-section="kim">
            <div className="so-kim so-reveal">
              <div className="so-kim-photo so-media">
                <SoImg src={SO_IMG.kim} alt="김재강 대표" sizes="340px" position="center 18%" />
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
          <div className="so-pains so-stagger">
            {SO_OPS_PAINS.map((line) => (
              <p className="so-bubble so-reveal" key={line}>
                {line}
              </p>
            ))}
          </div>
          <h2 className="so-h2 so-reveal">회원은 사람을 보고 등록하고, 시스템을 보고 재등록합니다</h2>
          <div className="so-op-body so-reveal">
            <p>상담도, CS도, 재등록도, 직원 교육도 원장 한 사람을 거친다면 원장이 자리를 비우는 날 매출도 같이 흔들립니다.</p>
            <p>1부에서는 500개 이상 센터 대표님들과 함께하면서 정리한 운영 · CS · 시스템 기준을 그대로 공개합니다.</p>
            <p className="so-op-em">감이 아니라 숫자로, 사람이 아니라 구조로.</p>
          </div>
          <div className="so-needs so-stagger">
            {SO_OPS_CARDS.map((c) => (
              <div className="so-need so-reveal" key={c.label}>
                <span className="so-need-lbl">{c.label}</span>
                <h3 className="so-need-who">{c.title}</h3>
                <p className="so-need-body">{c.body}</p>
              </div>
            ))}
          </div>

          <div className="so-sys so-reveal">
            <p className="so-sys-lbl">{SO_SYS_LABEL}</p>
            <h3 className="so-sys-title">{SO_SYS_TITLE}</h3>
            <p className="so-sys-sub">{SO_SYS_SUB}</p>
            <div className="so-cyl-wrap">
              <div
                ref={sysStageRef}
                className={"so-cyl-stage" + (sysReduced ? " so-cyl-flat" : "")}
                role="group"
                aria-roledescription="carousel"
                aria-label="운영 시스템 화면"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                onMouseEnter={() => setSysHover(true)}
                onMouseLeave={() => setSysHover(false)}
              >
                <div
                  className="so-cyl"
                  style={{ transform: `translateZ(calc(var(--w) / -2)) rotateY(${-sysIdx * 90}deg)` }}
                >
                  {SO_SYS_SCREENS.map((sc, i) => {
                    const front = i === sysActive;
                    return (
                      <div
                        key={sc.src}
                        className={"so-cyl-face so-media" + (front ? " is-front" : "")}
                        style={{ transform: `rotateY(${i * 90}deg) translateZ(calc(var(--w) / 2))` }}
                        aria-hidden={!front}
                      >
                        <SoImg
                          src={sc.src}
                          alt={sc.name}
                          sizes="(max-width: 640px) 78vw, 560px"
                          fit="contain"
                        />
                        <span className="so-cyl-mark" aria-hidden="true">
                          © THE GROW
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="so-cyl-cap" aria-live="polite">
              <div className="so-cyl-cap-in" key={sysActive}>
                <b>{SO_SYS_SCREENS[sysActive].name}</b>
                <span>{SO_SYS_SCREENS[sysActive].desc}</span>
              </div>
            </div>
            <div className="so-sys-dots" role="group" aria-label="운영 시스템 화면 선택">
              {SO_SYS_SCREENS.map((sc, i) => (
                <button
                  key={sc.name}
                  type="button"
                  className={"so-sys-dot" + (i === sysActive ? " is-on" : "")}
                  aria-label={`${sc.name} 보기`}
                  aria-pressed={i === sysActive}
                  onClick={() => goToSys(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. 커리큘럼 · 타임테이블 ── */}
      <section data-track-section="curriculum" className="so-sec so-dark">
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
      <section data-track-section="change" className="so-sec so-cream">
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
      <section data-track-section="closing" className="so-sec so-dark">
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
      <section data-track-section="form" className="so-sec so-cream so-apply" id="so-apply">
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
                <td>
                  스토리 인증가 {soFormatPrice(SO_PRICE_STORY)} / 정상가 {soFormatPrice(SO_PRICE_NORMAL)}
                </td>
              </tr>
            </tbody>
          </table>
          {SO_FAQ_SHOWN.length > 0 && (
            <div className="so-faq so-reveal">
              <h3 className="so-faq-h">자주 확인하시는 내용</h3>
              {SO_FAQ_SHOWN.map((f) => (
                <details className="so-faq-item" key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          )}
          {/* 결제 카드 2종 — 스토리 인증가 / 정상가 */}
          <SalesOpsPay
            presetRole={preset}
            disabled={formOff}
            disabledMessage={closed ? "신청이 마감되었습니다" : "정원이 마감되었습니다"}
          />
        </div>
      </section>

      {/* 하단 고정 바 — 마감 카운트다운 + 잔여석(실데이터일 때만) + 좌석 신청하기 */}
      <div className={`so-bar${barOn ? " is-on" : ""}`} aria-hidden={!barOn}>
        <div className="so-bar-in">
          <div className="so-bar-txt">
            <p className="so-bar-cd" aria-live="off">
              {closed ? (
                "신청 마감"
              ) : (
                <>
                  마감까지 <span className="so-bar-num" ref={cdRef}>--일 --:--:--.--</span>
                </>
              )}
            </p>
            {seats !== null && <p className="so-bar-seats">잔여 {seats}석</p>}
          </div>
          {formOff ? (
            <button type="button" className="so-bar-btn" disabled>
              {closed ? "좌석 신청하기" : "정원 마감"}
            </button>
          ) : (
            <a className="so-bar-btn" href="#so-apply" onClick={scrollToApply} tabIndex={barOn ? 0 : -1}>
              좌석 신청하기
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
