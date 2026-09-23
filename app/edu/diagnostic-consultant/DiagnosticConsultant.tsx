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

/* ▼▼ 이미지 슬롯 — 준비되는 대로 public/edu/dcc/ 하위 경로를 채우면 된다 ▼▼ */
const DCC_IMG = {
  hero: "", // 히어로 배경 (현장/강의 사진)
  field: "", // 현장실습 사진
  faculty: {
    kimSeungho: "",
    kimJaegang: "",
    heoJunyoung: "",
    parkJungmin: "",
  },
  output: [] as string[], // 실제 산출물 캡처 (진단표, 대시보드, 필드 리포트 등)
};

/* ▼▼ 기수 변경 시 이 상수만 수정 ▼▼ */
const DCC = {
  openDate: "2026.11.01",
  schedule: "매주 일요일 10:00-14:00",
  capacity: 10,
  sessions: 9,
  priceRegular: 10000000,
  priceCohort: 6000000,
  vatNote: "VAT 별도",
  venue: "GROW EDU 전용 교육장",
  venueNote: "KTX 광명역 기준 5분 거리",
};
/* ▲▲ 여기까지 ▲▲ */

const won = (n: number) => n.toLocaleString("ko-KR") + "원";

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
    date: "11/01",
    kind: "교육",
    tone: "edu",
    instructor: "김승호 센터장",
    title: "진단 컨설팅 개론 &amp; 고객사 인터뷰",
    detail: "역할·책임, 현장 사례, 대표 인터뷰, 진단가설",
  },
  {
    no: "2회차",
    date: "11/08",
    kind: "교육",
    tone: "edu",
    instructor: "김재강 대표",
    title: "매장을 숫자로 읽는 법",
    detail: "매출·손익·BEP, 상품·가격, 회원, 객단가, 재등록, KPI",
  },
  {
    no: "3회차",
    date: "11/15",
    kind: "과제발표 ①",
    tone: "present",
    instructor: "김승호 센터장 총괄",
    title: "진단 리포트 01",
    detail: "1-2회차 기반, 이 매장의 진짜 문제 찾기",
  },
  {
    no: "휴식",
    date: "11/22",
    kind: "보완",
    tone: "rest",
    instructor: "",
    title: "1차 발표 수정 및 추가 데이터 확보",
    detail: "",
  },
  {
    no: "4회차",
    date: "11/29",
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
    date: "12/13",
    kind: "과제발표 ②",
    tone: "present",
    instructor: "김승호 센터장 총괄",
    title: "진단 리포트 02",
    detail: "4-5회차 기반, 실제 현장의 병목 찾기",
  },
  {
    no: "휴식",
    date: "12/20",
    kind: "보완",
    tone: "rest",
    instructor: "",
    title: "현장 피드백 및 진단보고서 보완",
    detail: "",
  },
  {
    no: "7회차",
    date: "12/27",
    kind: "교육",
    tone: "edu",
    instructor: "김재강 대표",
    title: "경쟁센터 분석 &amp; THE GROW 운영매뉴얼",
    detail: "경쟁 포지셔닝·가격·상품·타깃·콘텐츠, R&amp;R, SOP, 주간회의",
  },
  {
    no: "8회차",
    date: "01/03",
    kind: "교육",
    tone: "edu",
    instructor: "박정민 대표",
    title: "매장 상품 &amp; 콘텐츠·릴스·숏폼",
    detail: "상품기획, 오퍼, 네이밍, 후킹, 스크립트, CTA",
  },
  {
    no: "9회차",
    date: "01/10",
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
  {
    q: "환불·일정 문의",
    a: "교육비 환불 기준은 등록 확정 시 별도 안내드리며, 기타 문의는 1551-4476으로 연락 주세요.",
  },
];

// ── 15 지원폼 select 선택지 ──────────────────────────────────────────────────
const JOB_OPTIONS = ["센터 대표", "관리자·실장", "FC", "트레이너·강사", "기타"];
const CAREER_OPTIONS = ["3년 미만", "3~5년", "5~10년", "10년 이상"];

/* 기존 상담 폼(위탁/창업)과 동일한 Apps Script 엔드포인트를 그대로 재사용한다.
   두 기존 폼 파일은 수정하지 않고 값만 참조했다. */
const FORM_ACTION =
  "https://script.google.com/macros/s/AKfycbyTIVLMDS-DQjOZ1fIP9DbzJ2NONxyn6mdjEik1_ZG31XB9TVO0Y5_odvFwO1M0AcJ21Q/exec";
const FORM_TOKEN = "grow2026secure";
const FORM_SOURCE = "진단컨설턴트양성과정_지원";
// 이 페이지 전용 iframe 이름 — 다른 페이지의 hidden_iframe / hidden_iframe2 와 분리
const FORM_TARGET = "dcc_hidden_iframe";

// ── HTML 조각 헬퍼 ───────────────────────────────────────────────────────────
// 이미지 경로가 비어 있으면 비율을 유지한 회색 플레이스홀더를 렌더한다.
const imgBox = (src: string, alt: string, ratio: string, cls = "") => {
  const klass = ["dcc-imgbox", cls].filter(Boolean).join(" ");
  if (!src) {
    return `<div class="${klass} dcc-ph" style="aspect-ratio:${ratio}"><span>이미지 준비 중</span></div>`;
  }
  return `<div class="${klass}" style="aspect-ratio:${ratio}"><img src="${src}" alt="${alt}" loading="lazy" decoding="async" /></div>`;
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
.dcc-hero{position:relative;overflow:hidden;background:#0A0A0A;color:#fff;padding:64px 0 60px}
.dcc-hero-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.3}
.dcc-hero-ov{position:absolute;inset:0;background:radial-gradient(120% 90% at 50% 0%,rgba(34,181,115,.20) 0%,rgba(10,10,10,0) 62%),linear-gradient(180deg,rgba(10,10,10,.55) 0%,rgba(10,10,10,.94) 100%)}
.dcc-hero-in{position:relative;z-index:2;text-align:center}
.dcc-hero-tag{font-size:13px;font-weight:700;color:#8FD9B6;margin:0 0 16px}
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
.dcc-rev-cards{display:grid;gap:10px}
.dcc-rev-table{display:none}
@media(min-width:760px){.dcc-rev-cards{display:none}.dcc-rev-table{display:block}}
.dcc-rev-card{background:#fff;border:1px solid rgba(20,35,28,.09);border-radius:16px;padding:18px}
.dcc-rev-y{font-size:17px;font-weight:900;margin:0 0 4px}
.dcc-rev-b{font-size:13px;color:#6B7A72;margin:0 0 10px}
.dcc-rev-row{display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding:9px 0;border-top:1px solid rgba(20,35,28,.07)}
.dcc-rev-k{font-size:13px;color:#5A6B63}
.dcc-rev-v{font-size:16px;font-weight:800;color:var(--gd)}
.dcc-disc{margin:16px 0 0;background:rgba(20,35,28,.05);border-radius:12px;padding:14px;font-size:12.5px;line-height:1.75;color:#4E5F57}

/* 13 선발·가격 */
.dcc-sel{display:grid;gap:10px;margin:0 0 26px}
.dcc-sel-item{display:flex;align-items:flex-start;gap:12px;background:#121614;border:1px solid var(--bd);border-radius:14px;padding:15px 16px}
.dcc-sel-n{flex:0 0 auto;width:26px;height:26px;border-radius:50%;background:var(--g);color:#fff;font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center;margin-top:1px}
.dcc-sel-t{font-size:15px;font-weight:800;margin:0 0 3px}
.dcc-sel-d{font-size:13px;line-height:1.6;color:#A9B8B1;margin:0}
.dcc-price{background:#fff;color:#14231C;border-radius:20px;padding:28px 20px;text-align:center}
.dcc-price-old{font-size:15px;color:#8A968F;text-decoration:line-through;margin:0 0 10px}
.dcc-price-lbl{display:block;font-size:14px;font-weight:700;color:#14231C;margin:0 0 4px}
.dcc-price-new{font-size:32px;font-weight:900;color:var(--g);line-height:1.2;margin:0 0 8px}
.dcc-price-vat{font-size:13px;color:#6B7A72;margin:0}
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
    <p class="dcc-hero-tag dcc-rv">GROW EDU × 더그로우</p>
    <h1 class="dcc-h1 dcc-rv">관리자의 관리자,<em>THE GROW 진단 컨설턴트로.</em></h1>
    <p class="dcc-hero-sub dcc-rv">배우고, 진단하고, 현장에서 검증하는 현장형 컨설턴트 양성과정 1기</p>
    <div class="dcc-stats dcc-rv">
      <div class="dcc-stat"><b>${DCC.sessions}회</b><span>총 과정</span></div>
      <div class="dcc-stat"><b>${DCC.capacity}명</b><span>최대 선발</span></div>
      <div class="dcc-stat"><b>11.01</b><span>개강</span></div>
    </div>
    <a class="dcc-cta dcc-jump dcc-rv" href="#apply">1기 지원하기</a>
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

<!-- ── 04 약속 ───────────────────────────────────────────────────────────── -->
<section class="dcc-sec dcc-beige" style="padding-top:0">
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
      ${OUTPUT_SLOTS.map((src, i) => imgBox(src, `진단 과정 산출물 예시 ${i + 1}`, "4/3")).join("")}
    </div>
    <span class="dcc-pill-black dcc-rv">포트폴리오로 남는 실전형 과정</span>
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
    <div class="dcc-rv">${imgBox(DCC_IMG.field, "현장실습 진행 모습", "16/9")}</div>
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

<!-- ── 12 예상 수익 ──────────────────────────────────────────────────────── -->
<section class="dcc-sec dcc-beige">
  <div class="dcc-wrap">
    <h2 class="dcc-h2 dcc-rv">배운 만큼, 관리한 만큼,<em>커리어가 수익이 됩니다.</em></h2>
    <div class="dcc-rev-cards dcc-rv">
      ${REVENUE.map(
        (r) => `<div class="dcc-rev-card">
        <p class="dcc-rev-y">${r.year}</p>
        <p class="dcc-rev-b">${r.base}</p>
        <div class="dcc-rev-row"><span class="dcc-rev-k">예상 월 수익</span><span class="dcc-rev-v">${r.m}</span></div>
        <div class="dcc-rev-row"><span class="dcc-rev-k">예상 연 수익</span><span class="dcc-rev-v">${r.y}</span></div>
      </div>`,
      ).join("")}
    </div>
    <div class="dcc-rev-table dcc-rv">
      <table class="dcc-table">
        <colgroup><col style="width:16%" /><col style="width:34%" /><col style="width:25%" /><col style="width:25%" /></colgroup>
        <thead>
          <tr><th>구분</th><th>관리 기준</th><th>예상 월 수익</th><th>예상 연 수익</th></tr>
        </thead>
        <tbody>
          ${REVENUE.map(
            (r) =>
              `<tr><td class="dcc-td-no">${r.year}</td><td>${r.base}</td><td>${r.m}</td><td>${r.y}</td></tr>`,
          ).join("")}
        </tbody>
      </table>
    </div>
    <p class="dcc-disc dcc-rv">${REVENUE_DISCLAIMER}</p>
  </div>
</section>

<!-- ── 13 선발·가격 ──────────────────────────────────────────────────────── -->
<section class="dcc-sec dcc-dark">
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
      <p class="dcc-price-old">정상 교육비 ${won(DCC.priceRegular)}</p>
      <span class="dcc-price-lbl">1기 특별가</span>
      <p class="dcc-price-new">${won(DCC.priceCohort)}</p>
      <p class="dcc-price-vat">${DCC.vatNote}</p>
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
    <p class="dcc-sum dcc-rv">최대 ${DCC.capacity}명 · 11/01 개강 · 1기 600만원(${DCC.vatNote})</p>

    <div class="dcc-form-box dcc-rv" id="dccFormBox">
      <form id="dccForm" action="${FORM_ACTION}" method="POST" target="${FORM_TARGET}">
        <div class="dcc-fg">
          <label class="dcc-label" for="dcc-name">이름 <span class="dcc-req">*</span></label>
          <input class="dcc-input" id="dcc-name" type="text" name="name" autocomplete="name" required />
        </div>

        <div class="dcc-fg">
          <label class="dcc-label" for="dcc-phone">연락처 <span class="dcc-req">*</span></label>
          <input class="dcc-input" id="dcc-phone" type="tel" name="phone" inputmode="numeric" maxlength="13" placeholder="010-0000-0000" autocomplete="tel" required />
          <!-- 기존 시트의 3분할 연락처 칸도 함께 채워 보낸다.
               (진단상담 폼은 하이픈 포함 단일 phone, 위탁/창업 폼은 phone1~3 을 보낸다.
                어느 쪽 열이 있든 번호가 남도록 양쪽을 모두 채운다.) -->
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

        <button class="dcc-submit" type="submit">1기 지원서 제출하기</button>
        <p class="dcc-form-note">제출 후 검토를 거쳐 사전 인터뷰 일정을 개별 연락드립니다.</p>
      </form>

      <iframe name="${FORM_TARGET}" title="지원서 전송" style="display:none;"></iframe>
    </div>
  </div>
</section>

<a class="dcc-bar dcc-jump" id="dccBar" href="#apply">1기 지원하기 · 최대 ${DCC.capacity}명</a>
<div class="dcc-barspacer"></div>

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
