"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 진단 컨설턴트 양성과정 1기 랜딩 (비노출 · 독립 페이지)
//  · 클래스 접두사 dcc- (다른 페이지 클래스와 충돌 없음)
//  · 본문 전체를 DETAIL_HTML 로 주입
//    (dangerouslySetInnerHTML + mounted 게이트 + suppressHydrationWarning)
//  · injectContainer 로 <script> 재생성 append → 전역 스코프 실행
//    주입 스크립트는 반드시 IIFE 로 감싼다. 최상위 const/let 을 쓰면 재주입 시
//    "Identifier has already been declared" 로 블록 전체가 파싱 단계에서 죽는다.
//  · 리스너·옵저버·타이머는 stops 배열에 모아 __dccStop 으로 일괄 정리
//    (React cleanup 에서 호출 후 no-op 으로 교체 — delete 하지 않는다)
//  · 애니메이션은 "기본 표시 → 스크립트가 .is-anim 을 붙인 뒤에만 숨김+애니메이션"
//    스크립트가 실패해도 본문이 빈 화면으로 남지 않는다.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";

/* ▼▼ 이미지 슬롯 ▼▼
   · 강사진 사진은 기존 진단 멘토 페이지가 쓰는 public/consultants 파일을 경로로만
     참조한다 (복사하지 않음). 그쪽 사진을 교체하면 이 페이지도 같이 바뀐다.
   · 나머지는 public/edu/dcc/ 하위. 빈 문자열이면 플레이스홀더가 렌더된다.
   · 확장자는 실제 파일과 정확히 일치시켜야 한다 (후기는 .jpg, 산출물은 .png). */
const DCC_IMG = {
  hero: "", // 히어로 배경 (현장/강의 사진)
  field: "/edu/dcc/field.jpg", // 현장실습 사진
  faculty: {
    kimSeungho: "/consultants/kim-seungho.jpg",
    kimJaegang: "/consultants/kim-jaegang.jpg",
    heoJunyoung: "/consultants/heo-junyoung.jpg",
    parkJungmin: "/consultants/park-jungmin.png",
  },
  // 실제 산출물 캡처 — 아래 OUTPUT_CAPTIONS 와 순서를 맞춘다
  output: [
    "/edu/dcc/output-01.png",
    "/edu/dcc/output-02.png",
    "/edu/dcc/output-03.png",
  ],
  // 고객사 대표·관리자가 보내온 메시지 캡처.
  // ?v=N 은 캐시 무효화용이다. 파일명을 그대로 두고 내용만 덮어쓰면 브라우저가
  // 구버전을 캐시에서 꺼내 쓴다. 이미지를 다시 교체할 때는 이 숫자를 올린다.
  reviews: [
    "/edu/dcc/review-01.jpg?v=2",
    "/edu/dcc/review-02.jpg?v=2",
    "/edu/dcc/review-03.jpg?v=2",
  ],
};

// 04 약속 섹션 산출물 캡션 — DCC_IMG.output 과 같은 순서
const OUTPUT_CAPTIONS = [
  "매일 운영 체크리스트",
  "요일별 주간업무",
  "월간 핵심행동 캘린더",
];

// 라이트박스 확대에서 제외할 이미지. 매출추이 그래프는 썸네일로만 보여준다.
const DCC_NO_ZOOM = ["/edu/dcc/case02-03.png", "/edu/dcc/field.jpg"];

/* ▼▼ 기수 변경 시 이 상수만 수정 ▼▼ */
const DCC = {
  openDate: "2026.11.15",
  schedule: "매주 일요일 10:00-14:00",
  capacity: 10,
  sessions: 9,
  venue: "GROW EDU 전용 교육장",
  venueNote: "KTX 광명역 기준 5분 거리",
};
/* ▲▲ 여기까지 ▲▲ */

const won = (n: number) => n.toLocaleString("ko-KR") + "원";

// 비용은 지원서 접수 후 개별 안내한다. 금액을 화면에 노출하지 않는다.
const COST_NOTICE = "교육 비용은 지원서 작성 후 개별 안내드립니다";

// ── 04-2 진행 사례 ───────────────────────────────────────────────────────────
// 업체 실명 공개 동의를 받으면 true 로 바꾼다. false 면 익명 표기만 화면에 나간다.
//
// 주의: 이 플래그는 "무엇을 렌더할지"만 정한다. 아래 name 값은 플래그와 무관하게
// 클라이언트 번들에 그대로 포함되므로, 소스를 열어보면 실명을 확인할 수 있다.
// 실명이 외부에 드러나서는 안 되는 단계라면 동의 전까지 name 을 빈 문자열로 두어야 한다.
const DCC_CASE_SHOW_NAME = false;

type DccCase = {
  anon: string;
  name: string;
  start: string;
  headline: string;
  before: { label: string; value: number };
  after: { label: string; value: number };
  extra: string;
  actions: string[];
  images: string[];
};

const DCC_CASES: DccCase[] = [
  {
    anon: "의정부 필라테스 A센터",
    name: "필라테스 림 탑석역점",
    start: "2026.08.12",
    headline: "동일기간 매출 약 +34.7%",
    before: { label: "8/1~8/11 매출", value: 10669700 },
    after: { label: "9/1~9/11 매출", value: 14373780 },
    extra: "9/23 기준 8월 전체 매출의 약 78.4% 도달",
    actions: [
      "가격·상품 구조 재설계",
      "문의→예약→방문→상담→등록 흐름 점검",
      "신규·재등록·휴면 DB 관리",
      "상담 프로세스",
      "네이버 플레이스·예약",
      "블로그·체험단·Meta",
      "대표·실장 주간 업무 설계",
      "주간 실행계획 O/X 관리",
    ],
    images: [
      "/edu/dcc/case01-01.png",
      "/edu/dcc/case01-02.png",
      "/edu/dcc/case01-03.png",
    ],
  },
  {
    anon: "평택 필라테스 B센터",
    name: "유얼스 필라테스&발레핏",
    start: "2026.08.13",
    headline: "9/23 기준 8월 전체 매출의 약 92.3% 도달",
    before: { label: "8월 마감 매출", value: 24221600 },
    after: { label: "9/23 누적 매출", value: 22348300 },
    extra: "",
    actions: [
      "매출 데이터 분석",
      "문의→등록 흐름 점검",
      "휴면·만기회원 DB 관리",
      "상담 프로세스 개선",
      "상품·프로모션 기획",
      "플레이스·온라인 유입 개선",
      "관리자 주간 업무 설계",
      "주간 실행계획 O/X 관리",
    ],
    images: [
      "/edu/dcc/case02-01.png",
      "/edu/dcc/case02-02.png",
      "/edu/dcc/case02-03.png",
    ],
  },
];

const caseLabel = (c: DccCase) => (DCC_CASE_SHOW_NAME ? c.name : c.anon);

// 진단 흐름 칩
const DCC_CASE_FLOW = [
  "현황 데이터 확보",
  "진단 가설",
  "병목 확인",
  "실행계획",
  "실행",
  "지표 추적",
  "동일조건 비교",
  "운영 구조화",
  "재진단",
];

// 같은 틀, 다른 처방 — 두 고객사의 처방 차이
const DCC_FRAME_ROWS = [
  {
    k: "인력 구조",
    a: "오전 부원장·오후 실장 2인 교대, 인수인계 1시간",
    b: "매니저 1인 운영, 12시 오픈 기준",
  },
  {
    k: "가격 처방",
    a: "3·6·9 차등할인 + 당일 결정 추가 혜택",
    b: "24·48·70회 구조, 48회 중심 추천",
  },
  {
    k: "추가 관리",
    a: "가격 재설계 · 재등록 관리",
    b: "월간 핵심행동 캘린더 · 블로그 키워드 순위 추적",
  },
];

// ── 03-3 영상 후기 ──────────────────────────────────────────────────────────
// 자체 호스팅(유튜브 미사용). video-raw 원본을 720p CRF28 로 인코딩한 것.
// /consulting/diagnosis 도 같은 파일을 쓴다 (components/VideoReviewPair.tsx).
const DCC_VIDEOS = [
  {
    src: "/reviews/diag-halfminute.mp4",
    poster: "/reviews/diag-halfminute.jpg",
    caption: "하프미닛 대표님 진단 솔루션 후기",
  },
  {
    src: "/reviews/diag-westzin.mp4",
    poster: "/reviews/diag-westzin.jpg",
    caption: "웨스트진 대표님 진단 솔루션 후기",
  },
];

// 면책문구 — 생략·접기 금지
const DCC_CASE_DISCLAIMER =
  "진단컨설팅 시작 이후 운영지표와 실행구조를 변경했고, 그 이후 관찰된 매출 변화입니다. " +
  "매출에는 시즌·프로모션 등 외부 요인이 함께 작용할 수 있으며, 컨설팅 단독 효과나 동일한 결과를 보장하지 않습니다. " +
  "두 사례 모두 컨설팅 진행 중입니다.";

// ── 07 커리큘럼 ──────────────────────────────────────────────────────────────
// tone: present(과제·최종발표) / field(현장실습) → 그린 배지
// 5회차는 배정 매장과 조율하는 평일 1일이라 일요일 정기 일정과 구분한다.
type CurTone = "edu" | "present" | "field" | "rest";
const CURRICULUM: {
  no: string;
  date: string;
  kind: string;
  tone: CurTone;
  instructor: string;
  title: string;
  detail: string;
}[] = [
  {
    no: "1회차",
    date: "11/15",
    kind: "교육",
    tone: "edu",
    instructor: "김승호 센터장",
    title: "진단 컨설팅 개론 &amp; 고객사 인터뷰",
    detail: "역할·책임, 현장 사례, 대표 인터뷰, 진단가설",
  },
  {
    no: "2회차",
    date: "11/22",
    kind: "교육",
    tone: "edu",
    instructor: "김재강 대표",
    title: "매장을 숫자로 읽는 법",
    detail: "매출·손익·BEP, 상품·가격, 회원, 객단가, 재등록, KPI",
  },
  {
    no: "3회차",
    date: "11/29",
    kind: "과제발표 ①",
    tone: "present",
    instructor: "김승호 센터장 총괄",
    title: "진단 리포트 01",
    detail: "1-2회차 기반, 이 매장의 진짜 문제 찾기",
  },
  {
    no: "휴식",
    date: "12/06",
    kind: "보완",
    tone: "rest",
    instructor: "",
    title: "1차 발표 수정 및 추가 데이터 확보",
    detail: "",
  },
  {
    no: "4회차",
    date: "12/13",
    kind: "교육",
    tone: "edu",
    instructor: "허준영 본부장",
    title: "피트니스 마케팅 진단 &amp; 고객획득",
    detail: "네이버·Meta·당근, AI 활용, 코딩부터 랜딩까지, CPL/CAC/ROAS",
  },
  {
    no: "5회차",
    date: "평일 1일",
    kind: "현장실습",
    tone: "field",
    instructor: "현장 담당 프로 / 김승호 센터장 총괄",
    title: "THE GROW 필드 이머전",
    detail: "1인 1매장, 고객·상담·수업·운영·CRM 관찰, 필드 리포트",
  },
  {
    no: "6회차",
    date: "12/27",
    kind: "과제발표 ②",
    tone: "present",
    instructor: "김승호 센터장 총괄",
    title: "진단 리포트 02",
    detail: "4-5회차 기반, 실제 현장의 병목 찾기",
  },
  {
    no: "휴식",
    date: "01/03",
    kind: "보완",
    tone: "rest",
    instructor: "",
    title: "현장 피드백 및 진단보고서 보완",
    detail: "",
  },
  {
    no: "7회차",
    date: "01/10",
    kind: "교육",
    tone: "edu",
    instructor: "김재강 대표",
    title: "경쟁센터 분석 &amp; THE GROW 운영매뉴얼",
    detail: "경쟁 포지셔닝·가격·상품·타깃·콘텐츠, R&amp;R, SOP, 주간회의",
  },
  {
    no: "8회차",
    date: "01/17",
    kind: "교육",
    tone: "edu",
    instructor: "박정민 대표",
    title: "매장 상품 &amp; 콘텐츠·릴스·숏폼",
    detail: "상품기획, 오퍼, 네이밍, 후킹, 스크립트, CTA",
  },
  {
    no: "9회차",
    date: "01/24",
    kind: "최종발표 ③",
    tone: "present",
    instructor: "김승호 센터장 총괄",
    title: "최종 진단 &amp; 컨설턴트 비전",
    detail: "7·30·90일 개선안, KPI, 비전 발표, 수료식",
  },
];

// ── 08 강사진 ────────────────────────────────────────────────────────────────
const FACULTY: { key: string; name: string; role: string; desc: string }[] = [
  {
    key: "kimSeungho",
    name: "김승호",
    role: "센터장",
    desc: "진단 철학 · 고객사 인터뷰 · 평가 · 최종 진단",
  },
  {
    key: "kimJaegang",
    name: "김재강",
    role: "대표",
    desc: "숫자 · 경쟁센터 분석 · 운영매뉴얼 · SOP",
  },
  {
    key: "heoJunyoung",
    name: "허준영",
    role: "본부장",
    desc: "마케팅 · AI 활용법 · 코딩부터 랜딩까지",
  },
  {
    key: "parkJungmin",
    name: "박정민",
    role: "대표",
    desc: "상품 · 콘텐츠 · 릴스 · 숏폼 · CTA",
  },
  { key: "", name: "현장 담당 프로", role: "", desc: "현장 관찰 실습 지원" },
];

// ── 09 현장 관찰 포인트 ──────────────────────────────────────────────────────
const OBSERVE: { t: string; d: string }[] = [
  { t: "고객", d: "응대·상담·등록·재등록" },
  { t: "사람", d: "대표·관리자·강사의 실제 역할" },
  { t: "운영", d: "오픈·마감·시설·보고" },
  { t: "영업", d: "문의·예약·방문·상담·결제" },
  { t: "CRM", d: "미등록·미출석·만료·휴면" },
  { t: "마케팅", d: "플레이스·SNS·콘텐츠·프로모션" },
];

// ── 10 평가 배점 ─────────────────────────────────────────────────────────────
const SCORES: { n: number; label: string }[] = [
  { n: 20, label: "문제진단" },
  { n: 15, label: "데이터 분석" },
  { n: 15, label: "개선안 설계" },
  { n: 15, label: "실행계획" },
  { n: 10, label: "KPI 설계" },
  { n: 10, label: "커뮤니케이션" },
  { n: 10, label: "철학·비전" },
  { n: 5, label: "윤리·태도" },
];

// ── 12 예상 수익 ─────────────────────────────────────────────────────────────
const REVENUE: { year: string; base: string; m: string; y: string }[] = [
  {
    year: "1년차",
    base: "고객사 약 10개 안정적 관리",
    m: "약 800만원",
    y: "약 9,600만원",
  },
  {
    year: "2년차",
    base: "고객사 약 10개 안정적 관리",
    m: "약 1,000만원",
    y: "약 1억 2,000만원",
  },
  {
    year: "3년차 이상",
    base: "고객사 약 10개 안정적 관리",
    m: "약 1,200만원",
    y: "약 1억 4,400만원",
  },
];

const REVENUE_DISCLAIMER =
  "위 금액은 관리 고객사 약 10개 기준 예상 수익 예시이며 보장 금액이 아닙니다. 실제 수익은 배정 고객사 수, 계약조건, 활동기간, 고객사 유지·재계약, 성과 및 내부 평가기준에 따라 달라질 수 있습니다.";

// ── 13 선발 절차 / 1기 특전 ──────────────────────────────────────────────────
const SELECTION: { t: string; d: string }[] = [
  { t: "지원서", d: "경력·동기·운영 경험" },
  { t: "사전 인터뷰", d: "현장 경험·문제 구조화" },
  { t: "적합성 평가", d: "태도·윤리·수행 가능성" },
  { t: "최종 선발", d: "최대 10명" },
  { t: "등록 확정", d: "교육비 결제·일정 확인" },
];

const BENEFITS: { t: string; d: string }[] = [
  { t: "진단 컨설턴트 활동 기회", d: "우수자는 실제 고객사 프로젝트 배정 후보" },
  { t: "진단 도구 세트", d: "진단표·체크리스트·회의록·분석표·템플릿" },
  { t: "사례 학습·현장 참관", d: "익명화 실제 사례 + 우수자 참관·보조" },
  { t: "초기 활동 감수", d: "고객사 대응·보고서·이슈 판단 리뷰" },
  { t: "공식 인증·프로필", d: "평가 통과자에 한함" },
];

// ── 14 자주 묻는 내용 (제목은 명사형) ────────────────────────────────────────
const FAQ: { q: string; a: string }[] = [
  {
    q: "수료 후 바로 컨설턴트 활동",
    a: "아닙니다. 인증 및 본사 적합성 평가를 거쳐 활동 후보가 됩니다.",
  },
  {
    q: "현장실습 일정",
    a: "5회차이며, 배정 매장과 조율한 평일 1일에 진행합니다.",
  },
  {
    q: "수익 보장 여부",
    a: "보장하지 않습니다. 제시 금액은 관리 고객사 수와 성과에 따른 예시입니다.",
  },
  {
    q: "지원 자격",
    a: "피트니스 현장 운영 경험이 있는 대표·관리자·FC·트레이너라면 지원할 수 있으며, 사전 인터뷰로 최종 선발합니다.",
  },
];

// ── 15 지원폼 select 선택지 ──────────────────────────────────────────────────
const JOB_OPTIONS = ["센터 대표", "관리자·실장", "FC", "트레이너·강사", "기타"];
const CAREER_OPTIONS = ["3년 미만", "3~5년", "5~10년", "10년 이상"];

/* 그로우 에듀DB(Apps Script 웹앱). 문의 CRM 과는 다른 엔드포인트다.
   주의: 이 URL 은 lib/paymentSheet.ts 의 PAYMENT_SHEET_URL 과 동일한 웹앱이다.
   결제내역은 token=grow2026pay, 이 지원폼은 token=grow2026secure 로 보낸다.
   웹앱 쪽에서 두 토큰을 모두 받아들이는지 확인이 필요하다. 결제 코드는 건드리지 않았다. */
const FORM_ACTION =
  "https://script.google.com/macros/s/AKfycbxmo4P7VOk4fGsLY6ZOHQL819Eoe7un_KboLj6BHY6JUuxM0dsFWC2UyMdc0YP0EAk/exec";
const FORM_TOKEN = "grow2026secure";
const FORM_SOURCE = "진단컨설턴트양성과정_지원";
// 이 페이지 전용 iframe 이름 — 다른 페이지의 hidden_iframe / hidden_iframe2 와 분리
const FORM_TARGET = "dcc_hidden_iframe";

// ── HTML 조각 헬퍼 ───────────────────────────────────────────────────────────
// 라이트박스로 확대할 수 있는 이미지인지. 빈 슬롯과 제외 목록은 확대하지 않는다.
const canZoom = (src: string) => !!src && DCC_NO_ZOOM.indexOf(src) < 0;

// 확대 가능한 박스에 붙는 속성. data-zoom 이 있는 요소만 스크립트가 라이트박스로 연다.
const zoomAttrs = (src: string, alt: string) =>
  ` data-zoom="${src}" tabindex="0" role="button" aria-label="${alt} 크게 보기"`;

// 비율 고정 박스. 경로가 비어 있으면 비율을 유지한 회색 플레이스홀더를 렌더한다.
const imgBox = (src: string, alt: string, ratio: string, cls = "", zoom = false) => {
  const z = zoom && canZoom(src);
  const klass = ["dcc-imgbox", cls, z ? "dcc-zoom" : ""].filter(Boolean).join(" ");
  if (!src) {
    return `<div class="dcc-imgbox${cls ? ` ${cls}` : ""} dcc-ph" style="aspect-ratio:${ratio}"><span>이미지 준비 중</span></div>`;
  }
  return `<div class="${klass}" style="aspect-ratio:${ratio}"${z ? zoomAttrs(src, alt) : ""}><img src="${src}" alt="${alt}" loading="lazy" decoding="async" /></div>`;
};

// 높이를 이미지 비율에 맡기는 박스 (세로로 긴 메시지 캡처용)
const imgAuto = (src: string, alt: string, cls = "", zoom = false) => {
  const z = zoom && canZoom(src);
  if (!src) {
    return `<div class="dcc-imgbox${cls ? ` ${cls}` : ""} dcc-ph" style="aspect-ratio:3/4"><span>이미지 준비 중</span></div>`;
  }
  const klass = ["dcc-imgauto", cls, z ? "dcc-zoom" : ""].filter(Boolean).join(" ");
  return `<div class="${klass}"${z ? zoomAttrs(src, alt) : ""}><img src="${src}" alt="${alt}" loading="lazy" decoding="async" /></div>`;
};

const facultyPhoto = (key: string) =>
  (DCC_IMG.faculty as Record<string, string>)[key] || "";

// 산출물 슬롯은 비어 있어도 자리를 보여준다 (3칸 플레이스홀더)
const OUTPUT_SLOTS = DCC_IMG.output.length > 0 ? DCC_IMG.output : ["", "", ""];

const CUR_BADGE: Record<CurTone, string> = {
  edu: "교육",
  present: "발표",
  field: "현장실습",
  rest: "보완",
};

const curCards = CURRICULUM.map((c) => {
  const hi = c.tone === "present" || c.tone === "field";
  return `<div class="dcc-cur-card${hi ? " is-hi" : ""}">
  <div class="dcc-cur-top">
    <span class="dcc-cur-no">${c.no}</span>
    <span class="dcc-cur-date">${c.date}</span>
    <span class="dcc-badge${hi ? " is-g" : ""}">${c.kind}</span>
  </div>
  <p class="dcc-cur-title">${c.title}</p>
  ${c.instructor ? `<p class="dcc-cur-ins">${c.instructor}</p>` : ""}
  ${c.detail ? `<p class="dcc-cur-detail">${c.detail}</p>` : ""}
</div>`;
}).join("");

const curRows = CURRICULUM.map((c) => {
  const hi = c.tone === "present" || c.tone === "field";
  return `<tr class="${hi ? "is-hi" : ""}">
  <td class="dcc-td-no">${c.no}</td>
  <td>${c.date}</td>
  <td><span class="dcc-badge${hi ? " is-g" : ""}">${c.kind}</span></td>
  <td>${c.instructor || "-"}</td>
  <td><b>${c.title}</b>${c.detail ? `<br /><span class="dcc-td-detail">${c.detail}</span>` : ""}</td>
</tr>`;
}).join("");

const facultyCards = FACULTY.map((f) => {
  const photo = facultyPhoto(f.key);
  const media = f.key
    ? imgBox(photo, `${f.name} ${f.role}`, "4/3", "dcc-fac-img")
    : `<div class="dcc-fac-icon" aria-hidden="true">현장</div>`;
  return `<div class="dcc-fac-card">
  ${media}
  <div class="dcc-fac-body">
    <p class="dcc-fac-name">${f.name}</p>
    ${f.role ? `<p class="dcc-fac-role">${f.role}</p>` : `<p class="dcc-fac-role">현장 담당</p>`}
    <p class="dcc-fac-desc">${f.desc}</p>
  </div>
</div>`;
}).join("");

const DETAIL_HTML = `<div class="dcc">
<style>
.dcc{--g:#22B573;--gd:#0B6B3A;--bd:rgba(34,181,115,.18);font-family:'Pretendard','Noto Sans KR',-apple-system,BlinkMacSystemFont,system-ui,'Apple SD Gothic Neo',sans-serif;letter-spacing:-.01em;width:100%;max-width:100%;overflow-x:hidden}
.dcc *{box-sizing:border-box;min-width:0}
.dcc img{max-width:100%;display:block}
.dcc-wrap{max-width:960px;margin:0 auto;padding:0 20px}
.dcc-sec{padding:56px 0}
.dcc-dark{background:#0A0A0A;color:#F2F5F3}
.dcc-beige{background:#F6F0E4;color:#14231C}
@media(min-width:768px){.dcc-sec{padding:84px 0}}

/* 기본 표시 원칙 — 주입 스크립트가 루트에 is-anim 을 붙였을 때만 숨김+애니메이션 */
.dcc.is-anim .dcc-rv{opacity:0;transform:translateY(22px);transition:opacity .7s ease,transform .7s ease}
.dcc.is-anim .dcc-rv.is-in{opacity:1;transform:none}

/* 공통 타이포 */
.dcc-h2{font-size:24px;line-height:1.42;font-weight:800;text-align:center;margin:0 0 16px}
.dcc-h2 em{font-style:normal;display:block;color:var(--g)}
.dcc-lead{font-size:15px;line-height:1.78;text-align:center;margin:0 auto 26px;max-width:660px;opacity:.82}
.dcc-foot{font-size:13px;line-height:1.7;text-align:center;margin:22px 0 0;opacity:.62}
@media(min-width:768px){.dcc-h2{font-size:32px}.dcc-lead{font-size:16px}}

/* 01 히어로 */
.dcc-hero{position:relative;overflow:hidden;background:#0A0A0A;color:#fff;padding:76px 0 60px}
.dcc-hero-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.3}
.dcc-hero-ov{position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 0%,rgba(34,181,115,.20) 0%,rgba(10,10,10,0) 62%),linear-gradient(180deg,rgba(10,10,10,.55) 0%,rgba(10,10,10,.94) 100%)}
.dcc-hero-in{position:relative;z-index:2;text-align:center}
.dcc-h1{font-size:28px;line-height:1.38;font-weight:900;margin:0 0 16px}
.dcc-h1 em{font-style:normal;display:block;color:var(--g)}
.dcc-hero-sub{font-size:15px;line-height:1.72;color:#C8D3CD;margin:0 auto 28px;max-width:540px}
@media(min-width:768px){.dcc-hero{padding:100px 0 88px}.dcc-h1{font-size:44px}.dcc-hero-sub{font-size:17px}}
.dcc-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:0 0 28px}
.dcc-stat{background:#121614;border:1px solid var(--bd);border-radius:14px;padding:16px 6px}
.dcc-stat b{display:block;font-size:23px;font-weight:900;color:var(--g);line-height:1.15}
.dcc-stat span{display:block;font-size:12px;margin-top:6px;color:#9FB0A8}
@media(min-width:768px){.dcc-stat{padding:22px 10px}.dcc-stat b{font-size:34px}.dcc-stat span{font-size:13px}}
.dcc-cta{display:inline-flex;align-items:center;justify-content:center;width:100%;max-width:340px;padding:17px 22px;border-radius:999px;background:var(--g);color:#fff;font-size:17px;font-weight:800;text-decoration:none;box-shadow:0 10px 26px rgba(34,181,115,.26)}

/* 02 공감 */
.dcc-bubbles{display:flex;flex-direction:column;gap:12px;margin:0 0 24px}
.dcc-bubble{background:#121614;border:1px solid var(--bd);border-radius:16px;padding:15px 17px;font-size:14.5px;line-height:1.65;max-width:88%}
.dcc-bubble span{display:block;color:#98A8A0}
.dcc-bubble b{display:block;margin-top:3px;color:var(--g);font-weight:700}
.dcc-bubble.is-l{align-self:flex-start;border-top-left-radius:4px}
.dcc-bubble.is-r{align-self:flex-end;border-top-right-radius:4px;text-align:right}
@media(min-width:768px){.dcc-bubble{max-width:64%;font-size:16px}}

/* 03 포지션 */
.dcc-cmp{display:grid;gap:12px;margin:0 0 20px}
@media(min-width:768px){.dcc-cmp{grid-template-columns:1fr 1fr}}
.dcc-cmp-card{border-radius:18px;padding:22px 20px}
.dcc-cmp-card.is-light{background:#fff;border:1px solid rgba(20,35,28,.10)}
.dcc-cmp-card.is-dark{background:#0A0A0A;border:1px solid var(--bd);color:#F2F5F3}
.dcc-cmp-role{font-size:17px;font-weight:800;margin:0 0 10px}
.dcc-cmp-card.is-dark .dcc-cmp-role{color:var(--g)}
.dcc-cmp-desc{font-size:14px;line-height:1.72;margin:0;opacity:.86}
.dcc-quote{border-left:4px solid var(--g);background:#fff;border-radius:0 14px 14px 0;padding:18px 18px;font-size:15px;line-height:1.75;font-weight:600;margin:0}

/* 04 약속 */
.dcc-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:0 0 22px}
.dcc-chip{background:#fff;border:1px solid rgba(11,107,58,.18);color:var(--gd);font-size:13px;font-weight:700;padding:9px 14px;border-radius:999px}
.dcc-pill-black{display:block;width:fit-content;max-width:100%;margin:24px auto 0;background:#14231C;color:#fff;font-size:14px;font-weight:700;padding:12px 20px;border-radius:999px;text-align:center}
.dcc-outputs{display:grid;grid-template-columns:1fr;gap:10px;margin:24px 0 0}
@media(min-width:640px){.dcc-outputs{grid-template-columns:repeat(3,1fr)}}

/* 05 대상 */
.dcc-targets{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.dcc-target{background:#121614;border:1px solid var(--bd);border-radius:16px;padding:18px 12px;text-align:center;font-size:14px;font-weight:700;line-height:1.55;display:flex;align-items:center;justify-content:center;min-height:94px}
@media(min-width:768px){.dcc-targets{grid-template-columns:repeat(4,1fr)}.dcc-target{font-size:15px}}

/* 06 구조 */
.dcc-parts{display:grid;gap:12px}
@media(min-width:768px){.dcc-parts{grid-template-columns:repeat(3,1fr)}}
.dcc-part{background:#121614;border:1px solid var(--bd);border-radius:18px;padding:22px 20px}
.dcc-num{width:38px;height:38px;border-radius:50%;background:var(--g);color:#fff;font-weight:900;font-size:15px;display:flex;align-items:center;justify-content:center;margin:0 0 12px}
.dcc-part-t{font-size:17px;font-weight:800;margin:0 0 8px}
.dcc-part-d{font-size:14px;line-height:1.7;margin:0;color:#B7C4BD}
.dcc-loop{font-size:14.5px;font-weight:700;text-align:center;color:#8FD9B6;margin:22px 0 0}
.dcc-info{display:grid;gap:10px;margin:22px 0 0}
@media(min-width:560px){.dcc-info{grid-template-columns:1fr 1fr}}
.dcc-info-card{background:#121614;border:1px solid var(--bd);border-radius:14px;padding:16px}
.dcc-info-k{font-size:12px;font-weight:800;color:var(--g);margin:0 0 6px}
.dcc-info-v{font-size:14px;line-height:1.62;margin:0;color:#E4EBE7}

/* 07 커리큘럼 */
.dcc-cur-cards{display:grid;gap:10px}
.dcc-cur-table{display:none}
@media(min-width:900px){.dcc-cur-cards{display:none}.dcc-cur-table{display:block}}
.dcc-cur-card{background:#fff;border:1px solid rgba(20,35,28,.09);border-left:3px solid rgba(20,35,28,.14);border-radius:14px;padding:16px}
.dcc-cur-card.is-hi{border-left-color:var(--g)}
.dcc-cur-top{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0 0 9px}
.dcc-cur-no{font-size:14px;font-weight:900}
.dcc-cur-date{font-size:13px;font-weight:700;color:#6B7A72}
.dcc-badge{display:inline-block;font-size:11px;font-weight:800;padding:4px 9px;border-radius:999px;background:rgba(20,35,28,.08);color:#4A5A52;white-space:nowrap}
.dcc-badge.is-g{background:var(--g);color:#fff}
.dcc-cur-title{font-size:15px;font-weight:800;line-height:1.5;margin:0 0 6px}
.dcc-cur-ins{font-size:13px;font-weight:700;color:var(--gd);margin:0 0 6px}
.dcc-cur-detail{font-size:13px;line-height:1.65;color:#5A6B63;margin:0}
.dcc-table{width:100%;border-collapse:collapse;table-layout:fixed;background:#fff;border-radius:14px;overflow:hidden}
.dcc-table th{background:#14231C;color:#fff;font-size:13px;font-weight:700;text-align:left;padding:13px 12px}
.dcc-table td{border-top:1px solid rgba(20,35,28,.08);padding:14px 12px;font-size:13.5px;line-height:1.6;vertical-align:top;word-break:keep-all}
.dcc-table tr.is-hi td{background:rgba(34,181,115,.06)}
.dcc-td-no{font-weight:800}
.dcc-td-detail{color:#5A6B63;font-size:12.5px}

/* 08 강사진 */
.dcc-fac{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media(min-width:860px){.dcc-fac{grid-template-columns:repeat(3,1fr)}}
.dcc-fac-card{background:#fff;border:1px solid rgba(20,35,28,.09);border-radius:18px;overflow:hidden}
.dcc-fac-body{padding:14px 14px 18px}
.dcc-fac-name{font-size:16px;font-weight:800;margin:0 0 2px}
.dcc-fac-role{font-size:12px;font-weight:700;color:var(--gd);margin:0 0 8px}
.dcc-fac-desc{font-size:13px;line-height:1.62;color:#5A6B63;margin:0;word-break:keep-all}
.dcc-fac-icon{aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0B6B3A,#22B573);color:#fff;font-size:22px;font-weight:900;letter-spacing:.04em}

/* 이미지 / 플레이스홀더 */
.dcc-imgbox{width:100%;overflow:hidden;background:#EDEFEE;border-radius:14px}
.dcc-imgbox img{width:100%;height:100%;object-fit:cover}
.dcc-fac-img{border-radius:0}
.dcc-ph{display:flex;align-items:center;justify-content:center;background:repeating-linear-gradient(45deg,#E4E7E5,#E4E7E5 10px,#DADEDB 10px,#DADEDB 20px);color:#7C8880;font-size:13px;font-weight:700}
.dcc-dark .dcc-ph{background:repeating-linear-gradient(45deg,#171C19,#171C19 10px,#1E2421 10px,#1E2421 20px);color:#6E7C74}

/* 09 현장실습 */
.dcc-flow{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;margin:0 0 22px}
.dcc-flow-step{background:#121614;border:1px solid var(--bd);color:#E4EBE7;font-size:14px;font-weight:800;padding:11px 16px;border-radius:12px}
.dcc-flow-ar{color:var(--g);font-size:15px;font-weight:900}
.dcc-obs{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:22px 0 0}
@media(min-width:768px){.dcc-obs{grid-template-columns:repeat(3,1fr)}}
.dcc-obs-card{background:#121614;border:1px solid var(--bd);border-radius:14px;padding:15px 14px}
.dcc-obs-t{font-size:14px;font-weight:800;color:var(--g);margin:0 0 5px}
.dcc-obs-d{font-size:12.5px;line-height:1.58;color:#A9B8B1;margin:0;word-break:keep-all}

/* 10 평가 */
.dcc-scores{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
@media(min-width:560px){.dcc-scores{grid-template-columns:repeat(4,1fr)}}
.dcc-score{background:#fff;border:1px solid rgba(20,35,28,.09);border-radius:14px;padding:16px 8px;text-align:center}
.dcc-score b{display:block;font-size:26px;font-weight:900;color:var(--g);line-height:1.1}
.dcc-score span{display:block;font-size:12.5px;font-weight:700;margin-top:6px;color:#3F4F47}
.dcc-steps{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;margin:24px 0 0}
.dcc-step-pill{background:#14231C;color:#fff;font-size:13px;font-weight:700;padding:10px 16px;border-radius:999px}
.dcc-step-ar{color:var(--gd);font-weight:900}
.dcc-guard{margin:22px 0 0;background:#fff;border:1px solid rgba(34,181,115,.28);border-radius:14px;padding:16px;font-size:14px;line-height:1.72;color:#2A3A32}

/* 11 커리어 */
.dcc-chain{display:grid;gap:8px}
.dcc-chain-card{background:#121614;border:1px solid var(--bd);border-radius:16px;padding:18px}
.dcc-chain-t{font-size:16px;font-weight:800;color:var(--g);margin:0 0 8px}
.dcc-chain-l{font-size:13.5px;line-height:1.7;color:#B7C4BD;margin:0;word-break:keep-all}
.dcc-chain-ar{text-align:center;color:var(--g);font-size:17px;font-weight:900;line-height:1}

/* 12 예상 수익 */
/* 모바일은 카드, 760px 이상은 표. 둘 중 하나만 그려서 가로 스크롤이 생길 여지를 없앤다 */
.dcc-rev-cards{display:grid;gap:10px}
.dcc-rev-table{display:none}
@media(min-width:760px){.dcc-rev-cards{display:none}.dcc-rev-table{display:block}}
.dcc-rev-card{background:#121614;border:1px solid var(--bd);border-radius:16px;padding:18px;min-width:0}
.dcc-rev-y{font-size:17px;font-weight:900;margin:0 0 4px;color:#F2F5F3}
.dcc-rev-b{font-size:13px;color:#8A968F;margin:0 0 12px;word-break:keep-all}
.dcc-rev-m,.dcc-rev-a{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin:0;padding:10px 0;border-top:1px solid var(--bd)}
.dcc-rev-k{font-size:13px;color:#8A968F;flex:0 0 auto}
/* 월 수익을 크게, 연 수익을 작게 — 금액은 둘 다 그린 */
.dcc-rev-m b{font-size:24px;font-weight:900;line-height:1.2;color:var(--g);text-align:right;word-break:break-all}
.dcc-rev-a b{font-size:15px;font-weight:800;color:var(--g);text-align:right;word-break:break-all}
/* 커리큘럼 표(베이지)와 같은 .dcc-table 을 쓰므로, 다크용은 수정자 클래스로 덮는다 */
.dcc-table--dark{background:#121614}
.dcc-table--dark th{background:#0A0A0A;color:#8FD9B6}
.dcc-table--dark td{border-top:1px solid var(--bd);color:#D3DCD7}
.dcc-table--dark .dcc-td-no{color:#F2F5F3}
.dcc-rev-money{color:var(--g);font-weight:800}
/* 고지문구는 읽히는 크기를 유지한다 (13px 미만으로 줄이지 말 것) */
.dcc-disc{margin:16px 0 0;background:rgba(20,35,28,.05);border-radius:12px;padding:14px;font-size:13.5px;line-height:1.75;color:#4E5F57}

/* 13 선발·가격 */
.dcc-sel{display:grid;gap:10px;margin:0 0 26px}
.dcc-sel-item{display:flex;align-items:flex-start;gap:12px;background:#121614;border:1px solid var(--bd);border-radius:14px;padding:15px 16px}
.dcc-sel-n{flex:0 0 auto;width:26px;height:26px;border-radius:50%;background:var(--g);color:#fff;font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center;margin-top:1px}
.dcc-sel-t{font-size:15px;font-weight:800;margin:0 0 3px}
.dcc-sel-d{font-size:13px;line-height:1.6;color:#A9B8B1;margin:0}
.dcc-price{background:#fff;color:#14231C;border-radius:20px;padding:26px 20px;text-align:center}
.dcc-price-note{font-size:16px;font-weight:800;line-height:1.6;margin:0;word-break:keep-all}
.dcc-bnf{display:grid;gap:8px;margin:22px 0 0}
.dcc-bnf-item{background:#121614;border:1px solid var(--bd);border-radius:14px;padding:14px 16px}
.dcc-bnf-t{font-size:14px;font-weight:800;color:var(--g);margin:0 0 4px}
.dcc-bnf-d{font-size:13px;line-height:1.6;color:#A9B8B1;margin:0}

/* 14 자주 묻는 내용 — details 기반이라 스크립트 없이도 열린다 */
.dcc-acc{display:grid;gap:8px}
.dcc-acc-item{background:#fff;border:1px solid rgba(20,35,28,.09);border-radius:14px;overflow:hidden}
.dcc-acc-item summary{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 18px;font-size:15px;font-weight:700;cursor:pointer;list-style:none}
.dcc-acc-item summary::-webkit-details-marker{display:none}
.dcc-acc-ic{flex:0 0 auto;color:var(--g);font-size:18px;font-weight:900;transition:transform .25s ease}
.dcc-acc-item[open] .dcc-acc-ic{transform:rotate(45deg)}
.dcc-acc-body{margin:0;padding:0 18px 18px;font-size:14px;line-height:1.78;color:#5A6B63}

/* 15 지원폼 */
.dcc-apply{scroll-margin-top:88px}
.dcc-sum{font-size:14px;font-weight:700;text-align:center;color:#8FD9B6;margin:0 0 24px}
.dcc-form-box{background:#121614;border:1px solid var(--bd);border-radius:20px;padding:22px 18px}
@media(min-width:768px){.dcc-form-box{padding:30px 28px}}
.dcc-fg{margin:0 0 16px}
.dcc-label{display:block;font-size:13.5px;font-weight:700;margin:0 0 7px;color:#E4EBE7}
.dcc-req{color:var(--g)}
.dcc-input,.dcc-select,.dcc-textarea{display:block;width:100%;max-width:100%;background:#0A0A0A;border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:13px 14px;font:inherit;font-size:15px;line-height:1.5;color:#fff;-webkit-appearance:none;appearance:none}
.dcc-textarea{min-height:92px;resize:vertical}
.dcc-select{padding-right:40px;background-image:linear-gradient(45deg,transparent 50%,#22B573 50%),linear-gradient(135deg,#22B573 50%,transparent 50%);background-position:calc(100% - 21px) 22px,calc(100% - 15px) 22px;background-size:6px 6px,6px 6px;background-repeat:no-repeat}
.dcc-select option{background:#0A0A0A;color:#fff}
.dcc-input:focus,.dcc-select:focus,.dcc-textarea:focus{outline:none;border-color:var(--g)}
.dcc-input::placeholder,.dcc-textarea::placeholder{color:#5E6B65}
.dcc-agree{display:flex;align-items:flex-start;gap:10px;font-size:13.5px;line-height:1.6;color:#C8D3CD;margin:4px 0 0}
.dcc-agree input{flex:0 0 auto;width:18px;height:18px;margin:1px 0 0;accent-color:#22B573}
.dcc-agree a{color:var(--g)}
.dcc-submit{display:block;width:100%;margin:20px 0 0;padding:17px;border:0;border-radius:14px;background:var(--g);color:#fff;font:inherit;font-size:17px;font-weight:800;cursor:pointer}
.dcc-form-note{font-size:12.5px;line-height:1.7;color:#8A968F;margin:14px 0 0;text-align:center}
.dcc-done{text-align:center;padding:44px 16px;font-size:15px;line-height:1.78;color:#C8D3CD}
.dcc-done b{display:block;font-size:19px;font-weight:800;color:var(--g);margin:0 0 10px}

/* 04 약속 — 산출물 3칸 (캡션 + 위쪽 왼쪽 기준 크롭) */
.dcc-fig{margin:0;min-width:0}
.dcc-fig-cap{margin:8px 0 0;font-size:12.5px;line-height:1.5;font-weight:700;text-align:center;color:#3F4F47;word-break:keep-all}
.dcc-dark .dcc-fig-cap{color:#A9B8B1}
.dcc-out-img img{object-position:top left}

/* 09 현장실습 사진 — 인물이 가운데 위쪽에 오도록 */
.dcc-field-img img{object-position:center 30%}

/* 08 강사진 사진 — 얼굴이 잘리지 않게 위쪽 기준 */
.dcc-fac-img img{object-position:center top}

/* 확대 가능 표시 (확대 제외 이미지는 이 클래스가 붙지 않아 기본 커서) */
.dcc-zoom{cursor:zoom-in}
.dcc-zoom:focus-visible{outline:2px solid var(--g);outline-offset:3px}
.dcc-imgauto{width:100%;max-width:100%}
.dcc-imgauto img{display:block;width:100%;height:auto}

/* 다크 섹션용 변형 */
.dcc-chips--dark .dcc-chip{background:#121614;border-color:var(--bd);color:#8FD9B6}
.dcc-disc--dark{background:rgba(255,255,255,.04);color:#96A49D}
.dcc-h3{font-size:20px;font-weight:800;text-align:center;line-height:1.45;margin:40px 0 16px}
.dcc-h3 em{font-style:normal;display:block;color:var(--g)}
@media(min-width:768px){.dcc-h3{font-size:24px}}

/* 04-2 진행 사례 */
.dcc-cases{display:grid;gap:14px;margin:0 0 4px}
@media(min-width:820px){.dcc-cases{grid-template-columns:1fr 1fr}}
.dcc-case{background:#121614;border:1px solid var(--bd);border-radius:18px;padding:20px 18px;min-width:0}
.dcc-case-top{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:0 0 4px}
.dcc-case-name{font-size:16px;font-weight:800;margin:0;word-break:keep-all}
.dcc-case-live{font-size:11px;font-weight:800;padding:4px 9px;border-radius:999px;background:var(--g);color:#fff;white-space:nowrap}
.dcc-case-start{font-size:12.5px;color:#8A968F;margin:0 0 14px}
.dcc-case-head{font-size:19px;font-weight:900;color:var(--g);line-height:1.4;margin:0 0 14px;word-break:keep-all}
.dcc-ba{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:8px;margin:0 0 12px}
.dcc-ba-cell{background:#0A0A0A;border:1px solid var(--bd);border-radius:12px;padding:12px 8px;text-align:center;min-width:0}
.dcc-ba-k{font-size:11.5px;color:#8A968F;margin:0 0 5px;word-break:keep-all}
.dcc-ba-v{font-size:14.5px;font-weight:800;color:#E4EBE7;margin:0;word-break:break-all}
.dcc-ba-ar{color:var(--g);font-size:16px;font-weight:900}
.dcc-case-extra{font-size:12.5px;line-height:1.65;color:#A9B8B1;margin:0 0 14px;word-break:keep-all}
.dcc-case-sub{font-size:12px;font-weight:800;color:var(--g);margin:0 0 8px}
.dcc-tags{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 14px}
.dcc-tag{background:rgba(34,181,115,.10);border:1px solid var(--bd);color:#C8D3CD;font-size:11.5px;font-weight:700;padding:5px 10px;border-radius:999px;word-break:keep-all}
.dcc-case-imgs{display:grid;grid-template-columns:1fr;gap:8px}
@media(min-width:480px){.dcc-case-imgs.is-multi{grid-template-columns:1fr 1fr}}
/* 케이스 자료는 가로로 넓은 캡처라 잘라내지 않고 전체를 보여준다 */
.dcc-case-thumb{background:#0A0A0A;border:1px solid var(--bd)}
.dcc-case-thumb img{object-fit:contain}
/* 홀수 장일 때 마지막 칸 — 두 열을 다 쓴다. 비율(2/1)은 마크업에서 인라인으로 준다 */
.dcc-case-thumb--wide{grid-column:1 / -1}

/* 04-2 같은 틀, 다른 처방 */
.dcc-frame{background:#121614;border:1px solid var(--bd);border-radius:18px;padding:20px 18px;margin:0 0 14px}
.dcc-frame-t{font-size:15px;font-weight:800;color:var(--g);margin:0 0 6px}
.dcc-frame-d{font-size:13.5px;line-height:1.7;color:#B7C4BD;margin:0 0 14px;word-break:keep-all}
.dcc-cmp-rows{display:grid;gap:12px}
.dcc-cmp-row{background:#121614;border:1px solid var(--bd);border-radius:16px;padding:16px 18px;min-width:0}
.dcc-cmp-k{font-size:12px;font-weight:800;color:var(--g);margin:0 0 10px}
.dcc-cmp-ab{display:grid;gap:10px}
@media(min-width:720px){.dcc-cmp-ab{grid-template-columns:1fr 1fr}}
.dcc-cmp-cell{background:#0A0A0A;border:1px solid var(--bd);border-radius:12px;padding:12px 14px;min-width:0}
.dcc-cmp-who{font-size:11.5px;font-weight:800;color:#8FD9B6;margin:0 0 5px;word-break:keep-all}
.dcc-cmp-v{font-size:13px;line-height:1.65;color:#D3DCD7;margin:0;word-break:keep-all}

/* 11-2 고객사 메시지 — 모바일은 이 컨테이너만 가로 스와이프. 페이지는 넘치지 않는다 */
.dcc-rev{display:flex;gap:12px;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-bottom:4px;max-width:100%}
.dcc-rev::-webkit-scrollbar{display:none}
.dcc-rev-item{flex:0 0 80%;scroll-snap-align:center;background:#121614;border:1px solid rgba(34,181,115,.18);border-radius:16px;overflow:hidden;min-width:0}
/* 메시지 캡처가 세로로 길어(비율 약 0.42) 카드가 화면을 다 먹는다. 위쪽만 잘라 보여주고
   나머지는 라이트박스에서 원본으로 본다. 이미지 높이가 auto 라 실제 클립은 이 박스의
   max-height + overflow 가 맡는다 (object-position 은 높이가 고정될 때를 대비한 보험). */
.dcc-rev-clip{position:relative;max-height:440px;overflow:hidden}
@media(min-width:820px){.dcc-rev-clip{max-height:520px}}
.dcc-rev-clip img{object-position:top}
.dcc-rev-fade{position:absolute;left:0;right:0;bottom:0;height:80px;background:linear-gradient(180deg,rgba(18,22,20,0) 0%,#121614 100%);pointer-events:none}
.dcc-rev-more{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);z-index:2;background:rgba(34,181,115,.16);border:1px solid rgba(34,181,115,.34);color:#8FD9B6;font-size:12.5px;font-weight:800;padding:7px 14px;border-radius:999px;white-space:nowrap;pointer-events:none}
@media(min-width:820px){
  .dcc-rev{display:grid;grid-template-columns:repeat(3,1fr);overflow:visible;scroll-snap-type:none;padding-bottom:0}
  .dcc-rev-item{flex:none}
}

/* 03-3 영상 후기 — PC 2열 / 모바일 1열. 포스터만 먼저 보여주고 누르면 재생한다 */
.dcc-vid-grid{display:grid;grid-template-columns:1fr;gap:16px;max-width:100%;margin:0 auto}
@media(min-width:720px){.dcc-vid-grid{grid-template-columns:1fr 1fr;max-width:760px}}
/* 9:16 세로 영상이라 폭을 묶지 않으면 PC 에서 카드가 지나치게 길어진다 */
.dcc-vid-card{min-width:0;width:100%;max-width:340px;margin:0 auto}
.dcc-vid-media{position:relative;width:100%;aspect-ratio:9/16;border-radius:16px;overflow:hidden;background:#121614;border:1px solid var(--bd)}
.dcc-vid-media video{display:block;width:100%;height:100%;object-fit:cover}
.dcc-vid-play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:0;border:0;background:rgba(0,0,0,.20);cursor:pointer;transition:background .2s}
.dcc-vid-play:hover{background:rgba(0,0,0,.35)}
.dcc-vid-play span{display:flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:50%;background:rgba(34,181,115,.92);box-shadow:0 8px 24px rgba(0,0,0,.45)}
.dcc-vid-close{position:absolute;top:10px;right:10px;z-index:3;display:none;align-items:center;justify-content:center;width:34px;height:34px;padding:0;border:0;border-radius:50%;background:rgba(0,0,0,.6);color:#fff;font:inherit;font-size:15px;line-height:1;cursor:pointer}
.dcc-vid-card.is-playing .dcc-vid-play{display:none}
.dcc-vid-card.is-playing .dcc-vid-close{display:flex}
.dcc-vid-cap{margin:12px 2px 0;font-size:14px;font-weight:700;line-height:1.55;color:#C8D3CD;word-break:keep-all}

/* 공용 라이트박스 */
/* 세로로 긴 캡처를 원본 크기로 보려면 높이를 제한하지 않고 컨테이너가 스크롤돼야 한다.
   높이에 맞춰 축소하면 카톡 메시지 글자가 읽히지 않는다. */
.dcc-lb{position:fixed;inset:0;z-index:70;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;background:rgba(0,0,0,.88);padding:28px 16px}
.dcc-lb[hidden]{display:none}
/* 짧은 이미지는 가운데, 긴 이미지는 위에서부터 — min-height 100% + flex 로 둘 다 만족한다 */
.dcc-lb-inner{min-height:100%;display:flex;align-items:center;justify-content:center}
.dcc-lb-img{max-width:100%;width:auto;height:auto;border-radius:8px}
/* 스크롤해도 닫기 버튼은 제자리 — .dcc-lb 에 transform 이 없어 fixed 가 뷰포트 기준으로 잡힌다 */
.dcc-lb-close{position:fixed;top:calc(14px + env(safe-area-inset-top));right:14px;z-index:2;width:42px;height:42px;padding:0;border:0;border-radius:50%;background:rgba(255,255,255,.16);color:#fff;font:inherit;font-size:18px;line-height:1;cursor:pointer}

/* 하단 고정 바 */
.dcc-bar{position:fixed;left:0;right:0;bottom:0;z-index:40;display:flex;align-items:center;justify-content:center;background:var(--g);color:#fff;font-size:16px;font-weight:800;text-decoration:none;padding:16px 16px calc(16px + env(safe-area-inset-bottom));box-shadow:0 -6px 20px rgba(0,0,0,.18);transition:transform .3s ease}
.dcc-bar.is-hidden{transform:translateY(120%)}
.dcc-barspacer{height:calc(58px + env(safe-area-inset-bottom));background:#0A0A0A}
</style>

<!-- ── 01 히어로 ─────────────────────────────────────────────────────────── -->
<section class="dcc-hero">
  ${DCC_IMG.hero ? `<img class="dcc-hero-bg" src="${DCC_IMG.hero}" alt="" aria-hidden="true" />` : ""}
  <div class="dcc-hero-ov"></div>
  <div class="dcc-wrap dcc-hero-in">
    <h1 class="dcc-h1 dcc-rv">관리자의 관리자,<em>THE GROW 진단 컨설턴트로.</em></h1>
    <p class="dcc-hero-sub dcc-rv">배우고, 진단하고, 현장에서 검증하는 현장형 컨설턴트 양성과정 1기</p>
    <div class="dcc-stats dcc-rv">
      <div class="dcc-stat"><b>${DCC.sessions}회</b><span>총 과정</span></div>
      <div class="dcc-stat"><b>${DCC.capacity}명</b><span>최대 선발</span></div>
      <div class="dcc-stat"><b>11.15</b><span>개강</span></div>
    </div>
    <a class="dcc-cta dcc-jump dcc-rv" href="#apply">지원서 작성하기</a>
  </div>
</section>

<!-- ── 02 공감 ───────────────────────────────────────────────────────────── -->
<section class="dcc-sec dcc-dark">
  <div class="dcc-wrap">
    <h2 class="dcc-h2 dcc-rv">경력은 쌓였는데,<em>다음 커리어가 보이지 않는 분께</em></h2>
    <div class="dcc-bubbles">
      <div class="dcc-bubble is-l dcc-rv"><span>매출은 보는데</span><b>왜 남는 돈이 없는지 설명하기 어렵습니다</b></div>
      <div class="dcc-bubble is-r dcc-rv"><span>광고는 하는데</span><b>등록으로 이어지지 않습니다</b></div>
      <div class="dcc-bubble is-l dcc-rv"><span>회원은 있는데</span><b>재등록·휴면 관리가 감에 의존합니다</b></div>
      <div class="dcc-bubble is-r dcc-rv"><span>직원은 있는데</span><b>대표가 모든 운영을 직접 챙겨야 합니다</b></div>
    </div>
    <p class="dcc-lead dcc-rv" style="margin-bottom:0">이 과정은 그 문제를 진단의 언어로 바꾸는 과정입니다.</p>
  </div>
</section>

<!-- ── 03 포지션 ─────────────────────────────────────────────────────────── -->
<section class="dcc-sec dcc-beige">
  <div class="dcc-wrap">
    <h2 class="dcc-h2 dcc-rv">현장을 운영하는 사람에서,<em>현장을 진단하는 사람으로.</em></h2>
    <div class="dcc-cmp">
      <div class="dcc-cmp-card is-light dcc-rv">
        <p class="dcc-cmp-role">운영자</p>
        <p class="dcc-cmp-desc">감과 경험으로 문제를 해결하고 광고·이벤트·할인 같은 단편 처방에 흔들리는 단계</p>
      </div>
      <div class="dcc-cmp-card is-dark dcc-rv">
        <p class="dcc-cmp-role">진단 컨설턴트</p>
        <p class="dcc-cmp-desc">데이터와 현장 증거로 문제를 정의하고 우선순위·실행·KPI·시스템까지 설계하는 단계</p>
      </div>
    </div>
    <p class="dcc-quote dcc-rv">대표가 말하는 문제를 그대로 해결하는 사람이 아니라, 대표도 아직 발견하지 못한 진짜 문제를 찾아내는 사람.</p>
  </div>
</section>

<!-- ── 03-2 예상 수익 ─────────────────────────────────────────────────────── -->
<section class="dcc-sec dcc-dark">
  <div class="dcc-wrap">
    <h2 class="dcc-h2 dcc-rv">배운 만큼, 관리한 만큼,<em>커리어가 수익이 됩니다.</em></h2>
    <p class="dcc-lead dcc-rv">관리 고객사 약 10개 기준</p>

    <!-- 모바일: 연차별 카드 3개 세로 스택 (월 수익을 크게, 연 수익을 작게) -->
    <div class="dcc-rev-cards dcc-rv">
      ${REVENUE.map(
        (r) => `<div class="dcc-rev-card">
        <p class="dcc-rev-y">${r.year}</p>
        <p class="dcc-rev-b">${r.base}</p>
        <p class="dcc-rev-m"><span class="dcc-rev-k">예상 월 수익</span><b>${r.m}</b></p>
        <p class="dcc-rev-a"><span class="dcc-rev-k">예상 연 수익</span><b>${r.y}</b></p>
      </div>`,
      ).join("")}
    </div>

    <!-- PC: 4열 표 -->
    <div class="dcc-rev-table dcc-rv">
      <table class="dcc-table dcc-table--dark">
        <colgroup><col style="width:16%" /><col style="width:34%" /><col style="width:25%" /><col style="width:25%" /></colgroup>
        <thead>
          <tr><th>구분</th><th>관리 기준</th><th>예상 월 수익</th><th>예상 연 수익</th></tr>
        </thead>
        <tbody>
          ${REVENUE.map(
            (r) =>
              `<tr><td class="dcc-td-no">${r.year}</td><td>${r.base}</td><td><span class="dcc-rev-money">${r.m}</span></td><td><span class="dcc-rev-money">${r.y}</span></td></tr>`,
          ).join("")}
        </tbody>
      </table>
    </div>

    <p class="dcc-disc dcc-disc--dark dcc-rv">${REVENUE_DISCLAIMER}</p>
  </div>
</section>

<!-- ── 03-3 영상 후기 ─────────────────────────────────────────────────────── -->
<!-- 앞이 같은 다크 섹션(03-2 예상 수익)이라 padding-top 을 없애 한 덩어리로 읽히게 한다 -->
<section class="dcc-sec dcc-dark" style="padding-top:0">
  <div class="dcc-wrap">
    <h2 class="dcc-h2 dcc-rv">진단 멘토가 만든 변화,<em>대표님들이 직접 말합니다</em></h2>
    <p class="dcc-lead dcc-rv">영상을 누르면 대표님들의 실제 목소리를 들을 수 있습니다.</p>
    <div class="dcc-vid-grid dcc-rv">
      ${DCC_VIDEOS.map(
        (v) => `<div class="dcc-vid-card">
        <div class="dcc-vid-media">
          <video src="${v.src}" poster="${v.poster}" preload="none" playsinline></video>
          <button type="button" class="dcc-vid-play" aria-label="${v.caption} 재생">
            <span><svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span>
          </button>
          <button type="button" class="dcc-vid-close" aria-label="영상 닫기">✕</button>
        </div>
        <p class="dcc-vid-cap">${v.caption}</p>
      </div>`,
      ).join("")}
    </div>
  </div>
</section>

<!-- ── 04 약속 ───────────────────────────────────────────────────────────── -->
<!-- 앞이 다크 섹션(03-3)이라 padding-top 을 유지한다 -->
<section class="dcc-sec dcc-beige">
  <div class="dcc-wrap">
    <h2 class="dcc-h2 dcc-rv">수료증보다 중요한 것은<em>한 매장을 제대로 진단할 판단력입니다.</em></h2>
    <div class="dcc-chips dcc-rv">
      <span class="dcc-chip">대표 인터뷰</span>
      <span class="dcc-chip">숫자</span>
      <span class="dcc-chip">마케팅</span>
      <span class="dcc-chip">현장관찰</span>
      <span class="dcc-chip">경쟁·운영</span>
      <span class="dcc-chip">상품·콘텐츠</span>
      <span class="dcc-chip">최종 진단</span>
    </div>
    <p class="dcc-lead dcc-rv" style="margin-bottom:0">9회가 끝나면 이 매장이 지금 어떤 상태이고 무엇부터 바꿔야 하는지, 데이터와 현장 근거로 설명할 수 있게 됩니다.</p>
    <div class="dcc-outputs dcc-rv">
      ${OUTPUT_SLOTS.map(
        (src, i) => `<figure class="dcc-fig">
        ${imgBox(src, OUTPUT_CAPTIONS[i] || `진단 과정 산출물 ${i + 1}`, "4/3", "dcc-out-img", true)}
        <figcaption class="dcc-fig-cap">${OUTPUT_CAPTIONS[i] || ""}</figcaption>
      </figure>`,
      ).join("")}
    </div>
    <span class="dcc-pill-black dcc-rv">포트폴리오로 남는 실전형 과정</span>
  </div>
</section>

<!-- ── 04-2 진행 사례 ─────────────────────────────────────────────────────── -->
<section class="dcc-sec dcc-dark">
  <div class="dcc-wrap">
    <h2 class="dcc-h2 dcc-rv">배운 방법은,<em>지금 실제 고객사에서 돌아가고 있습니다.</em></h2>
    <p class="dcc-lead dcc-rv">THE GROW 진단 컨설턴트가 현재 관리 중인 고객사의 진행 사례입니다.</p>

    <div class="dcc-chips dcc-chips--dark dcc-rv">
      ${DCC_CASE_FLOW.map((f) => `<span class="dcc-chip">${f}</span>`).join("")}
    </div>

    <div class="dcc-cases">
      ${DCC_CASES.map(
        (c) => `<div class="dcc-case dcc-rv">
        <div class="dcc-case-top">
          <p class="dcc-case-name">${caseLabel(c)}</p>
          <span class="dcc-case-live">진행 중</span>
        </div>
        <p class="dcc-case-start">진단컨설팅 시작 ${c.start}</p>
        <p class="dcc-case-head">${c.headline}</p>
        <div class="dcc-ba">
          <div class="dcc-ba-cell">
            <p class="dcc-ba-k">${c.before.label}</p>
            <p class="dcc-ba-v">${won(c.before.value)}</p>
          </div>
          <span class="dcc-ba-ar" aria-hidden="true">→</span>
          <div class="dcc-ba-cell">
            <p class="dcc-ba-k">${c.after.label}</p>
            <p class="dcc-ba-v">${won(c.after.value)}</p>
          </div>
        </div>
        ${c.extra ? `<p class="dcc-case-extra">${c.extra}</p>` : ""}
        <p class="dcc-case-sub">실제로 바꾼 것</p>
        <div class="dcc-tags">${c.actions.map((a) => `<span class="dcc-tag">${a}</span>`).join("")}</div>
        <div class="dcc-case-imgs${c.images.length > 1 ? " is-multi" : ""}">
          ${c.images
            .map((src, i) => {
              // 자료가 홀수 장이면 2열 그리드에서 마지막 칸이 혼자 남는다. 전체 폭으로 펴고
              // 비율도 넓게 준다 (두 사례 모두 마지막 자료가 가로로 넓은 캡처라 잘 맞는다).
              // 1장짜리는 이미 전체 폭이라 그대로 둔다.
              const wide =
                c.images.length > 1 &&
                c.images.length % 2 === 1 &&
                i === c.images.length - 1;
              return imgBox(
                src,
                `${caseLabel(c)} 진행 자료 ${i + 1}`,
                wide ? "2/1" : "4/3",
                wide ? "dcc-case-thumb dcc-case-thumb--wide" : "dcc-case-thumb",
                true,
              );
            })
            .join("")}
        </div>
      </div>`,
      ).join("")}
    </div>

    <h3 class="dcc-h3 dcc-rv">표준 운영 프레임은 같고,<em>처방은 매장마다 다릅니다.</em></h3>

    <div class="dcc-frame dcc-rv">
      <p class="dcc-frame-t">THE GROW 표준 운영 프레임</p>
      <p class="dcc-frame-d">매일 상시업무 · 요일별 집중업무 · 주간 실행계획 O/X</p>
      ${imgBox(DCC_IMG.output[1] || "", "THE GROW 표준 운영 프레임 — 요일별 주간업무", "4/3", "dcc-out-img", true)}
    </div>

    <div class="dcc-cmp-rows">
      ${DCC_FRAME_ROWS.map(
        (r) => `<div class="dcc-cmp-row dcc-rv">
        <p class="dcc-cmp-k">${r.k}</p>
        <div class="dcc-cmp-ab">
          <div class="dcc-cmp-cell">
            <p class="dcc-cmp-who">${caseLabel(DCC_CASES[0])}</p>
            <p class="dcc-cmp-v">${r.a}</p>
          </div>
          <div class="dcc-cmp-cell">
            <p class="dcc-cmp-who">${caseLabel(DCC_CASES[1])}</p>
            <p class="dcc-cmp-v">${r.b}</p>
          </div>
        </div>
      </div>`,
      ).join("")}
    </div>

    <p class="dcc-foot dcc-rv">7회차에서 이 표준 프레임과 매장별 적용 방법을 직접 배웁니다.</p>

    <p class="dcc-disc dcc-disc--dark dcc-rv">${DCC_CASE_DISCLAIMER}</p>
  </div>
</section>

<!-- ── 05 대상 ───────────────────────────────────────────────────────────── -->
<section class="dcc-sec dcc-dark">
  <div class="dcc-wrap">
    <h2 class="dcc-h2 dcc-rv">이런 분께 맞습니다</h2>
    <div class="dcc-targets dcc-rv">
      <div class="dcc-target">피트니스 센터 대표</div>
      <div class="dcc-target">관리자·FC</div>
      <div class="dcc-target">현장 경력 5년 이상<br />트레이너·실장</div>
      <div class="dcc-target">컨설팅 커리어<br />전환 희망자</div>
    </div>
    <p class="dcc-foot dcc-rv">1~2개 매장 또는 300평 이하 사업장의 필라테스·요가·바레·PT·크로스핏·헬스 현장을 다룹니다.</p>
  </div>
</section>

<!-- ── 06 구조 ───────────────────────────────────────────────────────────── -->
<section class="dcc-sec dcc-dark" style="padding-top:0">
  <div class="dcc-wrap">
    <h2 class="dcc-h2 dcc-rv">전문교육 5회 + 과제발표 3회 + 현장실습 1회</h2>
    <p class="dcc-lead dcc-rv">총 ${DCC.sessions}회 · 약 3개월 과정</p>
    <div class="dcc-parts">
      <div class="dcc-part dcc-rv">
        <div class="dcc-num">1</div>
        <p class="dcc-part-t">1부 배움</p>
        <p class="dcc-part-d">질문하고 숫자로 확인한 뒤, 진짜 문제를 정의합니다.</p>
      </div>
      <div class="dcc-part dcc-rv">
        <div class="dcc-num">2</div>
        <p class="dcc-part-t">2부 방향</p>
        <p class="dcc-part-d">마케팅을 배우고 현장을 관찰한 뒤, 실제 병목을 진단합니다.</p>
      </div>
      <div class="dcc-part dcc-rv">
        <div class="dcc-num">3</div>
        <p class="dcc-part-t">3부 성장</p>
        <p class="dcc-part-d">경쟁·운영·상품·콘텐츠를 연결해 90일 개선안을 완성합니다.</p>
      </div>
    </div>
    <p class="dcc-loop dcc-rv">2주 학습 → 사전과제 → 발표·피드백, 3번 반복</p>
    <div class="dcc-info">
      <div class="dcc-info-card dcc-rv">
        <p class="dcc-info-k">개강</p>
        <p class="dcc-info-v">${DCC.openDate}<br />${DCC.schedule}</p>
      </div>
      <div class="dcc-info-card dcc-rv">
        <p class="dcc-info-k">장소</p>
        <p class="dcc-info-v">${DCC.venue}<br />${DCC.venueNote}</p>
      </div>
      <div class="dcc-info-card dcc-rv">
        <p class="dcc-info-k">현장실습</p>
        <p class="dcc-info-v">5회차 평일 1일<br />배정 매장과 일정 조율</p>
      </div>
      <div class="dcc-info-card dcc-rv">
        <p class="dcc-info-k">정원</p>
        <p class="dcc-info-v">최대 ${DCC.capacity}명 선발</p>
      </div>
    </div>
  </div>
</section>

<!-- ── 07 커리큘럼 ───────────────────────────────────────────────────────── -->
<section class="dcc-sec dcc-beige">
  <div class="dcc-wrap">
    <h2 class="dcc-h2 dcc-rv">${DCC.sessions}회 전체 커리큘럼</h2>
    <div class="dcc-cur-cards dcc-rv">${curCards}</div>
    <div class="dcc-cur-table dcc-rv">
      <table class="dcc-table">
        <colgroup><col style="width:11%" /><col style="width:11%" /><col style="width:13%" /><col style="width:24%" /><col style="width:41%" /></colgroup>
        <thead>
          <tr><th>회차</th><th>일자</th><th>구분</th><th>담당</th><th>내용</th></tr>
        </thead>
        <tbody>${curRows}</tbody>
      </table>
    </div>
    <p class="dcc-foot dcc-rv">일정은 운영 상황에 따라 변경될 수 있으며, 변경 시 사전 안내드립니다.</p>
  </div>
</section>

<!-- ── 08 강사진 ─────────────────────────────────────────────────────────── -->
<section class="dcc-sec dcc-beige" style="padding-top:0">
  <div class="dcc-wrap">
    <h2 class="dcc-h2 dcc-rv">김승호 센터장 총괄<em>분야별 현장 전문 강사진</em></h2>
    <div class="dcc-fac dcc-rv">${facultyCards}</div>
  </div>
</section>

<!-- ── 09 현장실습 ───────────────────────────────────────────────────────── -->
<section class="dcc-sec dcc-dark">
  <div class="dcc-wrap">
    <h2 class="dcc-h2 dcc-rv">교실에서 배운 기준을<em>실제 현장에서 검증합니다.</em></h2>
    <div class="dcc-flow dcc-rv">
      <span class="dcc-flow-step">관찰</span><span class="dcc-flow-ar">→</span>
      <span class="dcc-flow-step">질문</span><span class="dcc-flow-ar">→</span>
      <span class="dcc-flow-step">기록</span><span class="dcc-flow-ar">→</span>
      <span class="dcc-flow-step">진단</span>
    </div>
    <p class="dcc-lead dcc-rv">최대 ${DCC.capacity}명의 교육생을 가능한 한 1인 1매장으로 배치합니다. 직원처럼 일하는 것이 아니라 고객·영업·수업·CRM·운영 흐름을 관찰하고 질문하는 실습입니다.</p>
    <div class="dcc-rv">${imgBox(DCC_IMG.field, "현장실습 진행 모습", "16/9", "dcc-field-img")}</div>
    <div class="dcc-obs">
      ${OBSERVE.map(
        (o) =>
          `<div class="dcc-obs-card dcc-rv"><p class="dcc-obs-t">${o.t}</p><p class="dcc-obs-d">${o.d}</p></div>`,
      ).join("")}
    </div>
  </div>
</section>

<!-- ── 10 평가 ───────────────────────────────────────────────────────────── -->
<section class="dcc-sec dcc-beige">
  <div class="dcc-wrap">
    <h2 class="dcc-h2 dcc-rv">수료 · 인증 · 현장배정은<em>분리됩니다.</em></h2>
    <div class="dcc-scores dcc-rv">
      ${SCORES.map(
        (s) =>
          `<div class="dcc-score"><b>${s.n}</b><span>${s.label}</span></div>`,
      ).join("")}
    </div>
    <div class="dcc-steps dcc-rv">
      <span class="dcc-step-pill">이수</span><span class="dcc-step-ar">→</span>
      <span class="dcc-step-pill">수료</span><span class="dcc-step-ar">→</span>
      <span class="dcc-step-pill">인증</span><span class="dcc-step-ar">→</span>
      <span class="dcc-step-pill">활동 후보</span>
    </div>
    <p class="dcc-guard dcc-rv">과정을 마쳤다고 자동으로 컨설턴트가 되는 구조가 아닙니다. 인증 및 본사 적합성 평가를 거쳐 활동 후보가 됩니다.</p>
  </div>
</section>

<!-- ── 11 커리어 ─────────────────────────────────────────────────────────── -->
<section class="dcc-sec dcc-dark">
  <div class="dcc-wrap">
    <h2 class="dcc-h2 dcc-rv">본사가 계약하고,<em>컨설턴트는 성과에 집중합니다.</em></h2>
    <div class="dcc-chain">
      <div class="dcc-chain-card dcc-rv">
        <p class="dcc-chain-t">THE GROW 본사</p>
        <p class="dcc-chain-l">신규고객 확보 · 상담·계약·품질관리</p>
      </div>
      <div class="dcc-chain-ar dcc-rv">↓</div>
      <div class="dcc-chain-card dcc-rv">
        <p class="dcc-chain-t">진단 컨설턴트</p>
        <p class="dcc-chain-l">진단·정기미팅 · 실행관리·KPI</p>
      </div>
      <div class="dcc-chain-ar dcc-rv">↓</div>
      <div class="dcc-chain-card dcc-rv">
        <p class="dcc-chain-t">고객사</p>
        <p class="dcc-chain-l">매출·회원·상품 · 마케팅·운영 개선</p>
      </div>
    </div>
    <p class="dcc-foot dcc-rv">고객사를 많이 맡는 것보다, 성과와 유지·재계약률을 높이는 전문직 커리어입니다.</p>
  </div>
</section>

<!-- ── 11-2 고객사 메시지 ─────────────────────────────────────────────────── -->
<section class="dcc-sec dcc-dark" style="padding-top:0">
  <div class="dcc-wrap">
    <h2 class="dcc-h2 dcc-rv">THE GROW 컨설턴트가 관리 중인<em>고객사 대표·관리자의 실제 메시지</em></h2>
    <p class="dcc-lead dcc-rv">현재 THE GROW 진단 컨설턴트가 관리하고 있는 고객사에서 보내온 메시지입니다. 개인정보 보호를 위해 일부 정보는 가렸습니다.</p>
    <div class="dcc-rev dcc-rv">
      ${DCC_IMG.reviews
        .map((src, i) => {
          const alt = `고객사에서 보내온 메시지 ${i + 1}`;
          const z = canZoom(src);
          return `<div class="dcc-rev-item${z ? " dcc-zoom" : ""}"${z ? zoomAttrs(src, alt) : ""}>
        <div class="dcc-rev-clip">
          ${imgAuto(src, alt)}
          ${
            z
              ? `<span class="dcc-rev-fade" aria-hidden="true"></span><span class="dcc-rev-more">전체 메시지 보기</span>`
              : ""
          }
        </div>
      </div>`;
        })
        .join("")}
    </div>
  </div>
</section>

<!-- ── 13 선발 ───────────────────────────────────────────────────────────── -->
<!-- 앞이 같은 다크 섹션(11-2)이라 padding-top 을 없애 이음새를 줄인다 -->
<section class="dcc-sec dcc-dark" style="padding-top:0">
  <div class="dcc-wrap">
    <h2 class="dcc-h2 dcc-rv">누구나 등록할 수 있는<em>과정이 아닙니다.</em></h2>
    <div class="dcc-sel">
      ${SELECTION.map(
        (s, i) => `<div class="dcc-sel-item dcc-rv">
        <span class="dcc-sel-n">${i + 1}</span>
        <div><p class="dcc-sel-t">${s.t}</p><p class="dcc-sel-d">${s.d}</p></div>
      </div>`,
      ).join("")}
    </div>
    <div class="dcc-price dcc-rv">
      <p class="dcc-price-note">${COST_NOTICE}</p>
    </div>
    <div class="dcc-bnf">
      ${BENEFITS.map(
        (b) =>
          `<div class="dcc-bnf-item dcc-rv"><p class="dcc-bnf-t">${b.t}</p><p class="dcc-bnf-d">${b.d}</p></div>`,
      ).join("")}
    </div>
    <p class="dcc-foot dcc-rv">과정 수료만으로 컨설턴트 활동·고객사 배정을 보장하지 않습니다.</p>
  </div>
</section>

<!-- ── 14 자주 묻는 내용 ─────────────────────────────────────────────────── -->
<section class="dcc-sec dcc-beige">
  <div class="dcc-wrap">
    <h2 class="dcc-h2 dcc-rv">자주 묻는 내용</h2>
    <div class="dcc-acc dcc-rv">
      ${FAQ.map(
        (f) => `<details class="dcc-acc-item">
        <summary>${f.q}<span class="dcc-acc-ic" aria-hidden="true">+</span></summary>
        <p class="dcc-acc-body">${f.a}</p>
      </details>`,
      ).join("")}
    </div>
  </div>
</section>

<!-- ── 15 지원폼 ─────────────────────────────────────────────────────────── -->
<section class="dcc-sec dcc-dark dcc-apply" id="apply">
  <div class="dcc-wrap">
    <h2 class="dcc-h2 dcc-rv">한 매장을 제대로 진단할 수 있다면,<em>다음 매장도 진단할 수 있습니다.</em></h2>
    <p class="dcc-sum dcc-rv">최대 ${DCC.capacity}명 · 11/15 개강 · ${COST_NOTICE}</p>

    <div class="dcc-form-box dcc-rv" id="dccFormBox">
      <form id="dccForm" action="${FORM_ACTION}" method="POST" target="${FORM_TARGET}">
        <div class="dcc-fg">
          <label class="dcc-label" for="dcc-name">이름 <span class="dcc-req">*</span></label>
          <input class="dcc-input" id="dcc-name" type="text" name="name" autocomplete="name" required />
        </div>

        <div class="dcc-fg">
          <label class="dcc-label" for="dcc-phone">연락처 <span class="dcc-req">*</span></label>
          <input class="dcc-input" id="dcc-phone" type="tel" name="phone" inputmode="numeric" maxlength="13" placeholder="010-0000-0000" autocomplete="tel" required />
          <!-- 하이픈 포함 단일 phone 과 3분할 phone1~3 을 함께 보낸다.
               시트 열 구성이 어느 쪽이든 번호가 남도록 한 것이다. -->
          <input type="hidden" name="phone1" value="" />
          <input type="hidden" name="phone2" value="" />
          <input type="hidden" name="phone3" value="" />
        </div>

        <div class="dcc-fg">
          <label class="dcc-label" for="dcc-email">이메일 <span class="dcc-req">*</span></label>
          <input class="dcc-input" id="dcc-email" type="email" name="email" placeholder="example@naver.com" autocomplete="email" required />
        </div>

        <div class="dcc-fg">
          <label class="dcc-label" for="dcc-job">현재 직무 <span class="dcc-req">*</span></label>
          <select class="dcc-select" id="dcc-job" name="job" required>
            <option value="">선택해주세요</option>
            ${JOB_OPTIONS.map((o) => `<option value="${o}">${o}</option>`).join("")}
          </select>
        </div>

        <div class="dcc-fg">
          <label class="dcc-label" for="dcc-career">현장 경력 <span class="dcc-req">*</span></label>
          <select class="dcc-select" id="dcc-career" name="career" required>
            <option value="">선택해주세요</option>
            ${CAREER_OPTIONS.map((o) => `<option value="${o}">${o}</option>`).join("")}
          </select>
        </div>

        <div class="dcc-fg">
          <label class="dcc-label" for="dcc-exp">운영 경험 <span class="dcc-req">*</span></label>
          <textarea class="dcc-textarea" id="dcc-exp" name="experience" placeholder="맡았던 매장 규모·종목·역할을 적어주세요." required></textarea>
        </div>

        <div class="dcc-fg">
          <label class="dcc-label" for="dcc-motive">지원 동기 <span class="dcc-req">*</span></label>
          <textarea class="dcc-textarea" id="dcc-motive" name="motivation" placeholder="이 과정을 지원하게 된 이유를 적어주세요." required></textarea>
        </div>

        <div class="dcc-fg">
          <label class="dcc-label" for="dcc-goal">희망 커리어 <span class="dcc-req">*</span></label>
          <textarea class="dcc-textarea" id="dcc-goal" name="goal" placeholder="수료 후 어떤 일을 하고 싶은지 적어주세요." required></textarea>
        </div>

        <label class="dcc-agree">
          <input type="checkbox" name="privacyAgree" value="동의" required />
          <span><a href="/legal/privacy" target="_blank" rel="noopener noreferrer">개인정보 수집·이용</a>에 동의합니다. <span class="dcc-req">*</span></span>
        </label>

        <!-- 페이지 구분 -->
        <input type="hidden" name="source" value="${FORM_SOURCE}" />
        <!-- 보안 토큰 -->
        <input type="hidden" name="token" value="${FORM_TOKEN}" />

        <button class="dcc-submit" type="submit">지원서 제출하기</button>
        <p class="dcc-form-note">제출 후 검토를 거쳐 사전 인터뷰 일정을 개별 연락드립니다.</p>
      </form>

      <iframe name="${FORM_TARGET}" title="지원서 전송" style="display:none;"></iframe>
    </div>
  </div>
</section>

<a class="dcc-bar dcc-jump" id="dccBar" href="#apply">지원서 작성하기 · 최대 ${DCC.capacity}명</a>
<div class="dcc-barspacer"></div>

<!-- 공용 이미지 라이트박스 — 04 산출물 / 04-2 진행 사례 / 11-2 메시지가 함께 쓴다.
     .dcc-rv 밖에 둔다. 리빌 애니메이션의 transform 이 position:fixed 의 기준을
     바꿔버리면 화면 전체를 덮지 못한다. -->
<div class="dcc-lb" id="dccLightbox" hidden>
  <button type="button" class="dcc-lb-close" aria-label="닫기">✕</button>
  <div class="dcc-lb-inner">
    <img class="dcc-lb-img" alt="" />
  </div>
</div>

<script>
/* 이 블록은 반드시 IIFE 로 감싼다. 주입 스크립트는 document.body 에 붙어
   전역 스코프에서 실행되므로, 최상위 const/let 을 쓰면 재주입(언마운트 후
   재마운트, 개발 모드 이중 실행) 때 "Identifier has already been declared"
   SyntaxError 가 나고 블록 전체가 파싱 단계에서 죽는다. */
(function () {
  // 이전 인스턴스가 살아 있으면 먼저 정리 (중복 옵저버·리스너 방지)
  if (typeof window.__dccStop === 'function') window.__dccStop();

  var root = document.querySelector('.dcc');
  if (!root) return;

  var stops = [];

  /* 1) 스크롤 리빌
        기본 CSS 는 전부 표시 상태다. 여기서 is-anim 을 붙였을 때만 숨겨지므로
        이 스크립트가 실행되지 않으면 본문이 그대로 보인다. */
  if (typeof IntersectionObserver !== 'undefined') {
    root.classList.add('is-anim');
    var rvs = root.querySelectorAll('.dcc-rv');
    var ioRv = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add('is-in');
          ioRv.unobserve(entries[i].target);
        }
      }
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    for (var r = 0; r < rvs.length; r++) ioRv.observe(rvs[r]);
    stops.push(function () {
      ioRv.disconnect();
      // 정리 시 숨김 상태로 남지 않도록 게이트 클래스를 되돌린다
      root.classList.remove('is-anim');
    });
  }

  /* 2) CTA → 지원폼 스크롤 (href="#apply" 는 스크립트 실패 시의 기본 동작) */
  var jumps = root.querySelectorAll('.dcc-jump');
  for (var j = 0; j < jumps.length; j++) {
    (function (el) {
      var onJump = function (e) {
        var target = document.getElementById('apply');
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
      el.addEventListener('click', onJump);
      stops.push(function () { el.removeEventListener('click', onJump); });
    })(jumps[j]);
  }

  /* 3) 하단 고정 바 — 지원폼이 화면에 보이면 숨김 */
  var bar = document.getElementById('dccBar');
  var applyEl = document.getElementById('apply');
  if (bar && applyEl && typeof IntersectionObserver !== 'undefined') {
    var ioBar = new IntersectionObserver(function (entries) {
      bar.classList.toggle('is-hidden', entries[0].isIntersecting);
    }, { threshold: 0.06 });
    ioBar.observe(applyEl);
    stops.push(function () { ioBar.disconnect(); });
  }

  /* 4) 지원폼 */
  var form = document.getElementById('dccForm');
  if (form && form.dataset.dccBound !== '1') {
    form.dataset.dccBound = '1';

    // 연락처 자동 하이픈 (숫자만 허용)
    var phone = form.querySelector('[name="phone"]');
    if (phone) {
      var onPhone = function () {
        var d = this.value.replace(/[^0-9]/g, '').slice(0, 11);
        var out = d;
        if (d.length > 7) out = d.slice(0, 3) + '-' + d.slice(3, 7) + '-' + d.slice(7);
        else if (d.length > 3) out = d.slice(0, 3) + '-' + d.slice(3);
        this.value = out;
      };
      phone.addEventListener('input', onPhone);
      stops.push(function () { phone.removeEventListener('input', onPhone); });
    }

    var onSubmit = function () {
      // 위탁/창업 폼이 쓰는 3분할 칸도 함께 채운다 (시트 열 구성이 어느 쪽이든 대응)
      var digits = (phone ? phone.value : '').replace(/[^0-9]/g, '');
      var parts = ['', '', ''];
      if (digits.length > 7) {
        parts = [digits.slice(0, 3), digits.slice(3, digits.length - 4), digits.slice(digits.length - 4)];
      }
      var keys = ['phone1', 'phone2', 'phone3'];
      for (var p = 0; p < keys.length; p++) {
        var hid = form.querySelector('[name="' + keys[p] + '"]');
        if (hid) hid.value = parts[p];
      }

      // GA4 전환 이벤트 (gtag 미로드 시 조용히 무시)
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'form_submit', { form_source: '${FORM_SOURCE}' });
      }
      // 메타 픽셀 — 이 페이지에 픽셀이 매핑된 경우에만 전송된다
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Lead', { content_name: '${FORM_SOURCE}' });
      }

      // 제출은 hidden iframe 으로 나가므로 페이지 이동이 없다. 폼 영역만 교체.
      var box = document.getElementById('dccFormBox');
      var tid = setTimeout(function () {
        if (box) {
          box.innerHTML = '<div class="dcc-done"><b>지원서가 접수되었습니다.</b>검토 후 사전 인터뷰 일정을 개별 연락드립니다.</div>';
        }
      }, 600);
      stops.push(function () { clearTimeout(tid); });
    };

    form.addEventListener('submit', onSubmit);
    stops.push(function () { form.removeEventListener('submit', onSubmit); });
  }

  /* 5) 공용 이미지 라이트박스
        여러 섹션에 이미지가 흩어져 있어 루트에서 클릭을 위임 처리한다.
        data-zoom 이 있는 요소만 열리고, 확대 제외 이미지에는 그 속성이 없다. */
  var lb = document.getElementById('dccLightbox');
  var lbImg = lb ? lb.querySelector('.dcc-lb-img') : null;
  if (lb && lbImg) {
    var lbPrevOverflow = '';
    var lbIsOpen = false;

    var closeLb = function () {
      if (!lbIsOpen) return;
      lbIsOpen = false;
      lb.setAttribute('hidden', '');
      lbImg.removeAttribute('src');
      // 열 때 저장해 둔 값으로 되돌린다 (다른 곳에서 잠갔을 수도 있으므로 빈 값 고정 금지)
      document.body.style.overflow = lbPrevOverflow;
    };
    var openLb = function (src, alt) {
      if (lbIsOpen) return;
      lbIsOpen = true;
      lbImg.setAttribute('src', src);
      lbImg.setAttribute('alt', alt || '');
      lb.removeAttribute('hidden');
      lb.scrollTop = 0; // 직전에 스크롤해 둔 위치가 남아 잘린 채로 열리는 것을 막는다
      lbPrevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    };

    var onZoom = function (e) {
      var t = e.target;
      while (t && t !== root && !(t.classList && t.classList.contains('dcc-zoom'))) {
        t = t.parentNode;
      }
      if (!t || t === root) return;
      var src = t.getAttribute && t.getAttribute('data-zoom');
      if (!src) return;
      var im = t.querySelector ? t.querySelector('img') : null;
      openLb(src, im ? im.getAttribute('alt') : '');
    };
    var onZoomKey = function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var t = e.target;
      if (!t || !t.classList || !t.classList.contains('dcc-zoom')) return;
      e.preventDefault();
      onZoom({ target: t });
    };
    // 배경·닫기 버튼으로 닫고, 이미지 자체를 누르면 유지한다
    var onLbClick = function (e) {
      if (e.target === lbImg) return;
      closeLb();
    };
    var onEsc = function (e) {
      if (e.key === 'Escape') closeLb();
    };

    root.addEventListener('click', onZoom);
    root.addEventListener('keydown', onZoomKey);
    lb.addEventListener('click', onLbClick);
    document.addEventListener('keydown', onEsc);

    stops.push(function () {
      // 언마운트 중이어도 body 스크롤 잠금은 반드시 풀린다
      closeLb();
      root.removeEventListener('click', onZoom);
      root.removeEventListener('keydown', onZoomKey);
      lb.removeEventListener('click', onLbClick);
      document.removeEventListener('keydown', onEsc);
    });
  }

  /* 6) 영상 후기
        포스터 → 클릭 재생. 한 번에 하나만 재생하고, 카드가 화면에서 벗어나면 멈춘다
        (스크롤로 지나갔는데 소리만 계속 들리는 상황을 막는다). */
  var vidCards = root.querySelectorAll('.dcc-vid-card');
  if (vidCards.length) {
    var vids = [];

    var stopCard = function (card) {
      var vd = card.querySelector('video');
      if (!vd) return;
      vd.pause();
      vd.currentTime = 0;
      vd.controls = false;
      card.classList.remove('is-playing');
    };

    for (var v = 0; v < vidCards.length; v++) {
      (function (card) {
        var video = card.querySelector('video');
        var playBtn = card.querySelector('.dcc-vid-play');
        var closeBtn = card.querySelector('.dcc-vid-close');
        if (!video) return;
        vids.push(video);

        var onPlay = function () {
          // 동시 재생 금지 — 나머지 카드를 먼저 되돌린다
          for (var k = 0; k < vids.length; k++) {
            if (vids[k] === video) continue;
            var other = vids[k].closest ? vids[k].closest('.dcc-vid-card') : null;
            if (other) stopCard(other);
          }
          card.classList.add('is-playing');
          video.controls = true;
          var p = video.play();
          // 자동재생 차단 등으로 실패하면 포스터 상태로 되돌린다
          if (p && typeof p.catch === 'function') p.catch(function () { stopCard(card); });
        };
        var onClose = function () { stopCard(card); };

        if (playBtn) playBtn.addEventListener('click', onPlay);
        if (closeBtn) closeBtn.addEventListener('click', onClose);
        video.addEventListener('ended', onClose);

        stops.push(function () {
          if (playBtn) playBtn.removeEventListener('click', onPlay);
          if (closeBtn) closeBtn.removeEventListener('click', onClose);
          video.removeEventListener('ended', onClose);
          video.pause();
        });
      })(vidCards[v]);
    }

    if (typeof IntersectionObserver !== 'undefined') {
      var ioVid = new IntersectionObserver(function (entries) {
        for (var e = 0; e < entries.length; e++) {
          if (entries[e].isIntersecting) continue;
          stopCard(entries[e].target);
        }
      }, { threshold: 0.35 });
      for (var o = 0; o < vidCards.length; o++) ioVid.observe(vidCards[o]);
      stops.push(function () { ioVid.disconnect(); });
    }
  }

  // 언마운트 정리용 전역 정지 훅 (React cleanup 에서 호출 후 no-op 으로 교체)
  window.__dccStop = function () {
    for (var s = 0; s < stops.length; s++) stops[s]();
    stops = [];
  };
})();
</script>
</div>`;

export default function DiagnosticConsultant() {
  // 주입 HTML 은 클라이언트에서만 렌더해 서버/클라이언트 마크업 불일치를 원천 차단한다.
  const [mounted, setMounted] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);

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

    return () => {
      injected.forEach((s) => s.remove());
      const w = window as unknown as Record<string, unknown>;
      const stop = w["__dccStop"];
      if (typeof stop === "function") (stop as () => void)();
      // delete 하지 않고 no-op 으로 교체한다 (남아 있는 참조가 호출해도 안전)
      w["__dccStop"] = () => {};
    };
  }, [mounted]);

  return (
    <div className="w-full overflow-x-hidden bg-[#0A0A0A]">
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
    </div>
  );
}
