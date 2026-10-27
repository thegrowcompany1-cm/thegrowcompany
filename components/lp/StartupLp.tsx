"use client";

// ─────────────────────────────────────────────────────────────────────────────
// /lp/startup — 메타 광고 전용 창업솔루션 랜딩 (CSS 접두사 lps-)
//  · 카피·섹션 순서: startup-renewal-copy.md. 기존 /consulting/startup 은 손대지 않는다.
//  · 신청 폼은 /consulting/startup 의 창업 폼과 action·token·source·name·필드 구성이 같다.
//    iframe 이름만 lps_hidden_iframe 으로 분리했고, 성공 판정은 iframe load
//    (done 가드 + 15초 타임아웃 + try/catch — 진단 컨설턴트 양성과정 폼과 같은 구조).
//  · 하단 고정 바(버튼 2개)가 계산기 하단 바를 대신한다. 계산기 패널은 CostCalculator 를
//    hideBar 로 쓰고, 패널이 열리면 이 바를 숨긴다.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from "react";
import CostCalculator from "@/components/CostCalculator";
import LogoMarquee from "@/components/LogoMarquee";

const FORM_ACTION =
  "https://script.google.com/macros/s/AKfycbyTIVLMDS-DQjOZ1fIP9DbzJ2NONxyn6mdjEik1_ZG31XB9TVO0Y5_odvFwO1M0AcJ21Q/exec";
const FORM_SOURCE = "창업지원상담_아임웹";
const FORM_TOKEN = "grow2026secure";
const FORM_TARGET = "lps_hidden_iframe";
const CTA_LABEL = "창업 정보 받아보기";
const CALC_LABEL = "내 창업비용 계산해보기";

// 후기 영상 — 8,300만원 영상을 첫 번째로
const VIDEOS = [
  { src: "/reviews/review-3.mp4", poster: "/reviews/review-3.jpg", caption: "일주일 만에 매출 8,300만원, 두번째 창업" },
  { src: "/reviews/review-1.mp4", poster: "/reviews/review-1.jpg", caption: "수치와 데이터로 증명한 첫 창업 이야기" },
  { src: "/reviews/review-2.mp4", poster: "/reviews/review-2.jpg", caption: "의심을 확인으로 바꾼 PT 스튜디오 창업" },
];

const EMPATHY = [
  "보증금에 인테리어까지, 총 얼마가 드는지 감이 안 잡힙니다.",
  "인테리어 견적 세 곳을 받았는데, 왜 이렇게 다른지 모르겠습니다.",
  "오픈하면 회원은 어떻게 모아야 하는지 막막합니다.",
  "업체마다 하는 말이 달라서, 누구 말을 믿어야 할지 모르겠습니다.",
];

const COMPARE_COLS = ["혼자 준비", "단계마다 다른 업체", "더그로우"];
const COMPARE_ROWS: { item: string; cells: [string, string, string] }[] = [
  { item: "입지·상권", cells: ["감과 중개사 말에 의존", "상권 분석만 하고 끝", "데이터 분석 + 계약 동행"] },
  { item: "인테리어", cells: ["견적 비교가 어려움", "업체 마진이 그대로 붙음", "전속 인테리어팀 직접 시공"] },
  { item: "기구", cells: ["소매가로 구매", "연결 수수료 발생", "B2B 계약으로 구매"] },
  { item: "회원 모집", cells: ["오픈 후 광고부터", "홍보 대행만", "오픈 전 프리세일 설계"] },
  { item: "오픈 이후", cells: ["혼자 해결", "계약 종료", "오픈세일 직원 상주 2달 + 운영 교육"] },
  { item: "문제 생기면", cells: ["내 책임", "업체끼리 책임 미루기", "한 팀이 끝까지 책임"] },
];

const STEPS = [
  { badge: "입지·상권", title: "입지·상권", desc: "감이 아니라 데이터로 \"사람이 오는 자리\"를 찾습니다.", points: ["유동인구 분석", "경쟁 센터 조사", "부동산 계약 동행"] },
  { badge: "인테리어·동선", title: "인테리어·동선", desc: "예쁜 공간이 아니라 매출이 나오는 구조로 만듭니다.", points: ["기구 배치", "동선", "상담 흐름까지 설계"] },
  { badge: "프리세일", title: "프리세일", desc: "가격·패키지·상담 구조까지 설계해 오픈 전 매출을 만듭니다.", points: [] },
  { badge: "운영 세팅", title: "운영 세팅", desc: "회원 관리·상담·매출·직원 관리까지, 대표가 없어도 돌아가는 구조를 만듭니다.", points: [] },
];

const DIFFS = [
  { title: "오픈세일, 직원이 2달간 직접 상주합니다", desc: "가장 중요한 오픈 첫 두 달. 더그로우 직원이 현장에서 상담과 등록을 함께 만듭니다." },
  { title: "전속 인테리어팀이 직접 시공합니다", desc: "중간 업체 없이 직접 시공해, 견적에 붙는 마진을 줄입니다." },
  { title: "기구는 B2B 계약으로 연결합니다", desc: "소매가가 아닌 B2B 조건으로 기구를 구매할 수 있도록 연결합니다." },
];

const REVIEWS = [
  { name: "김○○ 대표님", meta: "필라테스 · 경기 성남", text: "혼자 준비했으면 분명 실패했을 거예요. 입지 선정부터 인테리어, 프리세일까지 전부 함께 해주셔서 오픈 첫 달부터 안정적으로 시작했습니다." },
  { name: "이○○ 대표님", meta: "헬스장 · 서울 강서", text: "프리세일 때 목표의 150%를 달성했어요. 가격 설계와 상담 구조를 미리 잡아주셔서 가능했던 것 같습니다. 정말 감사합니다." },
  { name: "박○○ 대표님", meta: "필라테스 · 인천 송도", text: "운영 시스템을 만들어주셔서 지금은 제가 매장에 없어도 잘 돌아갑니다. 진짜 사업하는 느낌이에요." },
  { name: "최○○ 대표님", meta: "헬스장 · 경기 수원", text: "인테리어 비용이 합리적인데 퀄리티는 최고였어요. 동선까지 고려한 설계 덕분에 상담 전환율이 정말 높습니다." },
];

const KAKAO = [
  "/after/after%201%20.jpg",
  "/legacy/startup/15074ccf15f4f.png",
  "/legacy/startup/6c472bc288fca.png",
  "/legacy/startup/c9a26f224753e.jpg",
  "/legacy/startup/5f9b6a71b84af.jpg",
  "/legacy/startup/a0aa9f04ac114.png",
];

const PLAN_COMMON = [
  "입지선정 + 부동산계약",
  "사업자등록 절차 및 세무교육",
  "노무계약서 제공",
  "인테리어 비용 절감 (전속 인테리어팀)",
  "기구 B to B 계약 (저렴하게 구매 가능)",
  "오프라인 홍보 (전단지) 시안 폼 제공",
  "회원 계약서 폼 제공",
  "네이버·인스타그램·당근 온라인 세팅",
];
const PLAN_TAIL = ["정부지원사업 연결", "렌탈 및 리스 연결"];

const RECEIVES = [
  { title: "업종·평수별 예상 창업비용", desc: "내 조건 기준으로 정리해드립니다" },
  { title: "희망 지역 1차 상권 검토", desc: "적어주신 지역을 먼저 살펴봅니다" },
  { title: "창업 계획 위험요소 체크", desc: "계약 전에 짚어야 할 부분을 알려드립니다" },
];

const FAQS = [
  { q: "솔루션 비용", a: "센터 규모, 지역, 필요한 서비스 범위에 따라 달라집니다. 정보를 남겨주시면 대표님 상황에 맞춰 안내드립니다." },
  { q: "지방 진행 여부", a: "전국 어디든 가능합니다. 제주, 부산, 대구, 광주 등 전국에서 진행해왔고, 입지 선정은 직접 방문해 함께합니다." },
  { q: "창업 경험이 없는 경우", a: "처음이신 분들이 오히려 잘 맞습니다. 잘못된 습관 없이 처음부터 올바른 구조로 시작할 수 있기 때문입니다." },
  { q: "인테리어만 진행하는 경우", a: "인테리어만 진행하는 것도 가능합니다. 다만 운영까지 고려한 설계를 함께 권장드립니다." },
  { q: "오픈 이후 지원", a: "오픈 후 안정화 기간 동안 운영 점검, 매출 분석, 마케팅 조정을 이어서 지원합니다." },
];

const STYLE = `
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
.lps{--g:#009519;--g2:#22B573;--gl:#4CAF50;font-family:'Pretendard',var(--font-noto-sans-kr),-apple-system,BlinkMacSystemFont,system-ui,'Apple SD Gothic Neo',sans-serif;letter-spacing:-0.01em;color:#1a1a1a;background:#fff;overflow-x:hidden;word-break:keep-all;overflow-wrap:break-word}
.lps *,.lps *::before,.lps *::after{box-sizing:border-box}
.lps h1,.lps h2,.lps h3,.lps h4,.lps p,.lps ul{margin:0;padding:0}
.lps ul{list-style:none}
.lps img{max-width:100%}
.lps-sec{padding:88px 20px}
.lps-in{max-width:960px;margin:0 auto}
.lps-in--narrow{max-width:720px}
.lps-dk{background:#0d0d0d;color:#fff}
.lps-dk2{background:#1a1a1a;color:#fff}
.lps-gray{background:#f8f9fa}
.lps-h2{font-size:34px;font-weight:800;line-height:1.4;text-align:center;margin-bottom:14px}
.lps-h2 em{font-style:normal;color:var(--gl)}
.lps-sub{font-size:16px;line-height:1.75;text-align:center;color:#777;margin:0 auto 40px;max-width:640px}
.lps-dk .lps-sub,.lps-dk2 .lps-sub{color:#a9a9a9}
.lps-btn{display:inline-flex;align-items:center;justify-content:center;min-height:56px;padding:0 36px;border:none;border-radius:50px;background:linear-gradient(135deg,#4CAF50 0%,#2e7d32 100%);color:#fff;font-family:inherit;font-size:18px;font-weight:800;cursor:pointer;text-decoration:none;box-shadow:0 8px 25px rgba(76,175,80,.35);transition:transform .2s,box-shadow .2s}
.lps-btn:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(76,175,80,.45)}
.lps-btn--line{background:transparent;border:2px solid var(--gl);color:var(--gl);box-shadow:none}
.lps-btn--line:hover{background:rgba(76,175,80,.1);box-shadow:none}
.lps-center{text-align:center}

/* 1 히어로 */
.lps-hero{position:relative;overflow:hidden;background:linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%);color:#fff;padding:88px 20px 80px;text-align:center}
.lps-hero::before{content:'';position:absolute;inset:0;background:url('/legacy/startup/954205d44af9d.png') center/cover;opacity:.15}
.lps-hero .lps-in{position:relative;z-index:1;max-width:800px}
.lps-hero h1{font-size:38px;font-weight:800;line-height:1.4;margin-bottom:22px}
.lps-hero h1 em{font-style:normal;color:var(--gl)}
.lps-hero p.lps-hero-sub{font-size:18px;line-height:1.8;color:#c4c4c4;margin-bottom:36px}
.lps-hero-note{margin-top:14px;font-size:14px;color:#9a9a9a}

/* 2 영상 */
.lps-vids{display:flex;justify-content:center;gap:18px}
.lps-vid{flex:0 0 auto;width:300px}
.lps-vid-media{position:relative;width:100%;aspect-ratio:9/16;border-radius:16px;overflow:hidden;background:#1a1a1a}
.lps-vid-media video{width:100%;height:100%;object-fit:cover;display:block}
.lps-vid-play{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;border:none;background:rgba(0,0,0,.18);cursor:pointer}
.lps-vid-play span{display:flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:50%;background:rgba(0,149,25,.92);box-shadow:0 8px 24px rgba(0,0,0,.4)}
.lps-vid-cap{margin:12px 4px 0;font-size:14px;font-weight:600;line-height:1.5;color:#d6d6d6}

/* 3 공감 */
.lps-quotes{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:34px}
.lps-quote{background:#fff;border:1px solid #e9ecef;border-left:4px solid var(--gl);border-radius:14px;padding:22px 22px;font-size:16px;font-weight:600;line-height:1.65;color:#222}
.lps-close{text-align:center;font-size:18px;font-weight:700;line-height:1.7;color:#1a1a1a}

/* 4 반박 */
.lps-xlist{display:flex;flex-direction:column;gap:12px;max-width:520px;margin:28px auto 34px;text-align:left}
.lps-xlist li{display:flex;align-items:center;gap:12px;padding:13px 16px;background:rgba(255,107,107,.08);border-left:3px solid #ff6b6b;border-radius:10px;color:#ff8b8b;font-size:17px}
.lps-xlist i{flex:0 0 22px;width:22px;height:22px;border-radius:50%;background:#ff6b6b;color:#fff;font-style:normal;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center}
.lps-lead{text-align:center;font-size:17px;line-height:1.8;color:#b5b5b5}
.lps-strong{text-align:center;font-size:22px;font-weight:700;line-height:1.7;color:#fff}
.lps-strong b{color:var(--gl)}

/* 5 계산기 */
.lps-calc{background:linear-gradient(180deg,#f8f9fa 0%,#e8f5e9 100%)}

/* 6 비교표 */
.lps-table-wrap{border-radius:18px;overflow:hidden;border:1px solid #e5e7eb}
.lps-table{width:100%;border-collapse:collapse;font-size:15px;table-layout:fixed}
.lps-table th,.lps-table td{padding:16px 14px;text-align:left;line-height:1.55;border-bottom:1px solid #eee;vertical-align:top}
.lps-table thead th{background:#f3f4f6;font-weight:700;color:#444}
.lps-table tbody th{width:16%;font-weight:700;color:#111;background:#fafafa}
.lps-table .lps-us{background:#eaf7ec;color:#0a6b1b;font-weight:700}
.lps-table thead .lps-us{background:var(--g);color:#fff}
.lps-table tbody tr:last-child th,.lps-table tbody tr:last-child td{border-bottom:none}
.lps-cmp-cards{display:none}

/* 7 4단계 */
.lps-steps{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
.lps-step{background:#fff;border:1px solid #e9ecef;border-radius:18px;padding:26px 22px}
.lps-step-no{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:var(--g);color:#fff;font-weight:800;font-size:15px;margin-bottom:12px}
.lps-step h3{font-size:20px;font-weight:800;margin-bottom:8px}
.lps-step p{font-size:15px;line-height:1.7;color:#555}
.lps-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.lps-tags span{background:#e8f5e9;color:#0a6b1b;font-size:13px;font-weight:600;padding:6px 12px;border-radius:50px}

/* 8 차별점 */
.lps-diffs{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.lps-diff{background:#161616;border:1px solid #2a2a2a;border-radius:18px;padding:28px 22px}
.lps-diff-no{font-size:14px;font-weight:800;color:var(--g2);margin-bottom:12px}
.lps-diff h3{font-size:19px;font-weight:800;line-height:1.5;margin-bottom:10px;color:#fff}
.lps-diff p{font-size:15px;line-height:1.7;color:#b0b0b0}

/* 9 후기 */
.lps-reviews{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:56px}
.lps-review{background:#f8f9fa;border-radius:16px;padding:24px 22px}
.lps-review-h{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.lps-avatar{flex:0 0 42px;width:42px;height:42px;border-radius:50%;background:var(--g);color:#fff;font-weight:800;display:flex;align-items:center;justify-content:center}
.lps-review h4{font-size:15px;font-weight:700}
.lps-review small{font-size:13px;color:#888}
.lps-review p{font-size:15px;line-height:1.75;color:#444}
.lps-h3{font-size:20px;font-weight:800;text-align:center;margin-bottom:18px}
.lps-kakao{display:flex;gap:12px;overflow-x:auto;padding:4px 2px 14px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;margin-bottom:56px}
.lps-kakao img{flex:0 0 auto;height:320px;width:auto;border-radius:12px;border:1px solid #eee;scroll-snap-align:start}
.lps-logos{background:#0A0A0A;border-radius:20px;padding:36px 12px;color:#fff;overflow:hidden}

/* 10 대표 */
.lps-ceo{display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:center}
.lps-ceo-imgs{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.lps-ceo-imgs img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:12px;display:block}
.lps-ceo h2{font-size:30px;font-weight:800;line-height:1.45;margin-bottom:18px}
.lps-ceo h2 em{font-style:normal;color:var(--gl)}
.lps-ceo p{font-size:16px;line-height:1.85;color:#c4c4c4;margin-bottom:20px}
.lps-badges{display:flex;flex-wrap:wrap;gap:8px}
.lps-badges span{border:1px solid rgba(76,175,80,.5);color:#9be0a0;font-size:13px;font-weight:600;padding:7px 14px;border-radius:50px}

/* 11 플랜 */
.lps-plans{display:grid;grid-template-columns:repeat(2,1fr);gap:18px}
.lps-plan{background:#fff;border:2px solid #eee;border-radius:20px;padding:28px 24px}
.lps-plan-name{font-size:20px;font-weight:800;margin-bottom:8px}
.lps-plan-size{display:inline-block;font-size:13px;font-weight:600;color:var(--g);background:rgba(0,149,25,.08);padding:4px 12px;border-radius:50px;margin-bottom:22px}
.lps-plan ul{display:flex;flex-direction:column;gap:12px}
.lps-plan li{position:relative;padding-left:30px;font-size:15px;line-height:1.6;color:#333}
.lps-plan li::before{content:'\\2713';position:absolute;left:0;top:1px;width:20px;height:20px;line-height:20px;text-align:center;background:var(--g);color:#fff;border-radius:50%;font-size:12px;font-weight:700}
.lps-plan li.lps-strongli{font-weight:700;color:var(--g)}
.lps-plan li small{display:block;font-size:13px;color:#777;font-weight:400;margin-top:3px}
.lps-plan li.lps-bonus{background:rgba(0,149,25,.08);border-radius:12px;padding:12px 14px 12px 40px;font-weight:700;color:var(--g)}
.lps-plan li.lps-bonus::before{left:11px;top:12px}

/* 12 선별 */
.lps-pick{background:linear-gradient(135deg,#4CAF50 0%,#2e7d32 100%);color:#fff;text-align:center}
.lps-pick h2{font-size:32px;font-weight:800;line-height:1.5;margin-bottom:18px}
.lps-pick p{font-size:17px;line-height:1.85;opacity:.95;margin-bottom:28px}
.lps-pick ul{display:flex;flex-wrap:wrap;justify-content:center;gap:12px}
.lps-pick li{background:rgba(255,255,255,.2);border-radius:50px;padding:12px 22px;font-size:15px;font-weight:700}

/* 13 신청 */
.lps-apply{background:linear-gradient(180deg,#f8f9fa 0%,#e8f5e9 100%)}
.lps-recv{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:40px}
.lps-recv-card{background:#fff;border-radius:16px;padding:22px 20px;box-shadow:0 4px 18px rgba(0,0,0,.06)}
.lps-recv-no{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:#e8f5e9;color:var(--g);font-weight:800;font-size:14px;margin-bottom:10px}
.lps-recv-card h3{font-size:17px;font-weight:800;line-height:1.5;margin-bottom:6px}
.lps-recv-card p{font-size:14px;line-height:1.65;color:#666}
.lps-form-wrap{max-width:720px;margin:0 auto;background:#fff;border-radius:24px;box-shadow:0 20px 60px rgba(0,0,0,.1);overflow:hidden;scroll-margin-top:90px}
.lps-form-head{background:linear-gradient(135deg,#4CAF50 0%,#2e7d32 100%);color:#fff;padding:20px 28px;font-size:22px;font-weight:700}
.lps-form{padding:32px 30px}
.lps-grp{margin-bottom:22px}
.lps-label{display:block;margin-bottom:8px;font-size:15px;font-weight:600;color:#111}
.lps-label small{font-size:13px;font-weight:400;color:#888}
.lps-req{color:#ff6b6b}
.lps-input{width:100%;padding:14px 16px;border:2px solid #e9ecef;border-radius:12px;font-family:inherit;font-size:16px;color:#111;background:#fff;transition:border-color .2s,box-shadow .2s}
.lps-input::placeholder{color:#999}
.lps-input:focus{outline:none;border-color:var(--gl);box-shadow:0 0 0 4px rgba(76,175,80,.1)}
.lps-phone{display:flex;align-items:center;gap:8px}
.lps-phone .lps-input{text-align:center;padding-left:6px;padding-right:6px;min-width:0}
.lps-phone span{color:#aaa}
.lps-radio{display:flex;align-items:center;gap:10px;margin-bottom:10px;padding:11px 14px;background:#f8f9fa;border:2px solid transparent;border-radius:10px;font-size:15px;color:#111;cursor:pointer}
.lps-radio:hover{background:#e8f5e9;border-color:var(--gl)}
.lps-radio input{width:18px;height:18px;margin:0;accent-color:var(--gl);flex:0 0 auto}
.lps-submit{display:block;width:100%;min-height:58px;margin-top:8px;border:none;border-radius:50px;background:linear-gradient(135deg,#4CAF50 0%,#2e7d32 100%);color:#fff;font-family:inherit;font-size:18px;font-weight:800;cursor:pointer;box-shadow:0 8px 25px rgba(76,175,80,.3)}
.lps-submit:disabled{opacity:.55;cursor:not-allowed}
.lps-notice{margin:0 30px 30px;padding:16px 18px;background:#f8f9fa;border-radius:12px;text-align:center;font-size:14px;line-height:1.7;color:#666}
.lps-notice b{color:var(--gl)}
.lps-done{padding:56px 24px;text-align:center;font-size:16px;line-height:1.8;color:#555}
.lps-done b{display:block;font-size:22px;font-weight:800;color:var(--g);margin-bottom:10px}

/* 14 FAQ */
.lps-faq{display:flex;flex-direction:column;gap:10px}
.lps-faq details{background:#f8f9fa;border-radius:14px;overflow:hidden}
.lps-faq summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 20px;font-size:16px;font-weight:700}
.lps-faq summary::-webkit-details-marker{display:none}
.lps-faq summary::after{content:'+';flex:0 0 auto;font-size:22px;font-weight:400;color:var(--g)}
.lps-faq details[open] summary::after{content:'\\2212'}
.lps-faq p{padding:0 20px 20px;font-size:15px;line-height:1.8;color:#555}

/* 하단 고정 바 */
.lps-bar{position:fixed;left:0;right:0;bottom:0;z-index:60;display:flex;gap:8px;padding:8px 12px calc(8px + env(safe-area-inset-bottom));background:rgba(13,13,13,.96);border-top:1px solid rgba(255,255,255,.12);box-shadow:0 -4px 20px rgba(0,0,0,.25);transition:transform .3s ease}
.lps-bar.is-hidden{transform:translateY(110%);pointer-events:none}
.lps-bar button{min-width:0;height:48px;border-radius:12px;font-family:inherit;font-size:15px;font-weight:800;cursor:pointer;letter-spacing:-0.02em}
.lps-bar-calc{flex:1 1 0;background:transparent;border:1.5px solid rgba(255,255,255,.45);color:#fff}
.lps-bar-cta{flex:1.25 1 0;background:var(--g);border:none;color:#fff}
.lps-bar-space{height:calc(64px + env(safe-area-inset-bottom))}
@media(min-width:768px){.lps-bar{padding-left:max(12px,calc((100vw - 720px)/2));padding-right:max(12px,calc((100vw - 720px)/2))}}

@media(max-width:768px){
  .lps-sec{padding:60px 20px}
  .lps-h2{font-size:24px}
  .lps-sub{font-size:15px;margin-bottom:30px}
  .lps-hero{padding:56px 20px 52px}
  .lps-hero h1{font-size:25px}
  .lps-hero p.lps-hero-sub{font-size:15px;margin-bottom:28px}
  .lps-btn{width:100%;font-size:17px;padding:0 20px}
  .lps-vids{justify-content:flex-start;overflow-x:auto;scroll-snap-type:x mandatory;margin:0 -20px;padding:0 20px 8px;gap:14px;-webkit-overflow-scrolling:touch}
  .lps-vid{width:240px;scroll-snap-align:start}
  .lps-quotes{grid-template-columns:1fr}
  .lps-quote{font-size:15px;padding:18px}
  .lps-close{font-size:16px}
  .lps-xlist li{font-size:15px}
  .lps-strong{font-size:18px}
  .lps-table-wrap{display:none}
  .lps-cmp-cards{display:flex;flex-direction:column;gap:12px}
  .lps-cmp{background:#fff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden}
  .lps-cmp h3{padding:12px 16px;background:#f3f4f6;font-size:15px;font-weight:800}
  .lps-cmp dl{margin:0}
  .lps-cmp dl>div{display:flex;gap:12px;padding:11px 16px;border-top:1px solid #f0f0f0;font-size:14px;line-height:1.55}
  .lps-cmp dt{flex:0 0 76px;color:#888;font-weight:600}
  .lps-cmp dd{margin:0;flex:1 1 auto;min-width:0;color:#444}
  .lps-cmp dl>div.lps-us{background:#eaf7ec}
  .lps-cmp dl>div.lps-us dt{color:var(--g);font-weight:800}
  .lps-cmp dl>div.lps-us dd{color:#0a6b1b;font-weight:800}
  .lps-steps,.lps-diffs,.lps-plans,.lps-reviews,.lps-recv{grid-template-columns:1fr}
  .lps-kakao img{height:260px}
  .lps-reviews{margin-bottom:40px}
  .lps-ceo{grid-template-columns:1fr;gap:24px}
  .lps-ceo h2{font-size:24px}
  .lps-pick h2{font-size:24px}
  .lps-form{padding:24px 18px}
  .lps-form-head{font-size:19px;padding:16px 20px}
  .lps-notice{margin:0 18px 22px}
}
`;

const GTAG_EVENT = "form_submit";

type Win = Window & {
  gtag?: (...a: unknown[]) => void;
  __tgcFbTrack?: (e: string, p?: Record<string, unknown>) => void;
};

function VideoCard({
  v,
  active,
  onPlay,
}: {
  v: (typeof VIDEOS)[number];
  active: boolean;
  onPlay: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  // 다른 카드가 재생되면 이 카드는 멈추고 포스터로 돌아간다
  useEffect(() => {
    if (!active && started) {
      ref.current?.pause();
      setStarted(false);
    }
  }, [active, started]);

  return (
    <div className="lps-vid">
      <div className="lps-vid-media">
        <video
          ref={ref}
          src={v.src}
          poster={v.poster}
          preload="none"
          playsInline
          controls={started}
          onEnded={() => setStarted(false)}
        />
        {!started && (
          <button
            type="button"
            className="lps-vid-play"
            aria-label="후기 영상 재생"
            onClick={() => {
              onPlay();
              setStarted(true);
              void ref.current?.play();
            }}
          >
            <span>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}
      </div>
      <p className="lps-vid-cap">{v.caption}</p>
    </div>
  );
}

export default function StartupLp() {
  const [activeVid, setActiveVid] = useState<number | null>(null);
  const [calcToken, setCalcToken] = useState(0);
  const [calcOpen, setCalcOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const phoneRefs = useRef<(HTMLInputElement | null)[]>([]);
  const stopRef = useRef<(() => void) | null>(null);

  // 언마운트 시 진행 중인 전송의 리스너·타이머 정리
  useEffect(() => () => stopRef.current?.(), []);

  const scrollToForm = useCallback(() => {
    document.getElementById("consulting-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  const openCalc = useCallback(() => setCalcToken((n) => n + 1), []);

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
          if (typeof w.gtag === "function") w.gtag("event", GTAG_EVENT, { form_source: FORM_SOURCE });
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

  return (
    <div className="lps">
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />

      {/* 1 히어로 */}
      <section data-track-section="hero" className="lps-hero">
        <div className="lps-in">
          <h1>
            창업 컨설팅 회사를 고르고 계신다면,
            <br />
            <em>오픈 다음 날까지 책임지는 곳인지</em> 먼저 확인하세요.
          </h1>
          <p className="lps-hero-sub">
            헬스장·필라테스 창업 300회.
            <br />
            입지 선정부터 오픈세일 현장 상주까지, 한 팀이 끝까지 갑니다.
          </p>
          <button type="button" className="lps-btn" onClick={scrollToForm}>
            {CTA_LABEL}
          </button>
          <p className="lps-hero-note">업종·평수별 예상 창업비용부터 받아보세요</p>
        </div>
      </section>

      {/* 2 후기 영상 */}
      <section data-track-section="review" className="lps-sec lps-dk">
        <div className="lps-in">
          <h2 className="lps-h2">
            먼저 창업한 <em>대표님들의 이야기</em>
          </h2>
          <p className="lps-sub">영상을 누르면 대표님들의 실제 목소리를 들을 수 있습니다.</p>
          <div className="lps-vids">
            {VIDEOS.map((v, i) => (
              <VideoCard key={v.src} v={v} active={activeVid === i} onPlay={() => setActiveVid(i)} />
            ))}
          </div>
        </div>
      </section>

      {/* 3 공감 */}
      <section data-track-section="empathy" className="lps-sec lps-gray">
        <div className="lps-in lps-in--narrow">
          <h2 className="lps-h2">
            창업을 결심하고 나면
            <br />
            이런 말들이 머릿속을 맴돕니다.
          </h2>
          <div className="lps-quotes" style={{ marginTop: 34 }}>
            {EMPATHY.map((t) => (
              <p key={t} className="lps-quote">
                &ldquo;{t}&rdquo;
              </p>
            ))}
          </div>
          <p className="lps-close">이 고민을 그대로 안고 계약서에 도장을 찍으면, 그때부터는 되돌리기 어렵습니다.</p>
        </div>
      </section>

      {/* 4 반박 */}
      <section data-track-section="problem" className="lps-sec lps-dk2">
        <div className="lps-in lps-in--narrow">
          <h2 className="lps-h2">
            센터는 자본만 있다고
            <br />
            <em>잘되지 않습니다.</em>
          </h2>
          <p className="lps-lead" style={{ marginTop: 18 }}>
            많은 대표님들이 처음엔 그렇게 시작하십니다.
            <br />
            하지만 막상 문을 열고 나면,
          </p>
          <ul className="lps-xlist">
            {["회원은 있는데 수익이 남지 않고", "광고는 하는데 등록은 없고", "직원은 있는데 방향이 없습니다."].map((t) => (
              <li key={t}>
                <i>✕</i>
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <p className="lps-strong">
            이건 대표님의 능력 문제가 아닙니다.
            <br />
            <b>창업 구조가 처음부터 잘못 설계된 경우가 대부분입니다.</b>
          </p>
        </div>
      </section>

      {/* 5 손실 시각화 — 창업비용 계산기 */}
      <section data-track-section="cost" className="lps-sec lps-calc">
        <div className="lps-in lps-center">
          <h2 className="lps-h2">
            혼자 견적을 받으면
            <br />
            보이지 않는 비용이 있습니다.
          </h2>
          <p className="lps-sub">
            시공 중간마진, 기구 유통마진, 필요 이상의 설계.
            <br />
            업종과 평수만 넣으면 줄일 수 있는 범위를 바로 보여드립니다.
          </p>
          <button type="button" className="lps-btn" onClick={openCalc}>
            {CALC_LABEL}
          </button>
        </div>
      </section>

      {/* 6 비교표 */}
      <section data-track-section="compare" className="lps-sec">
        <div className="lps-in">
          <h2 className="lps-h2">
            같은 창업이라도,
            <br />
            누구와 하느냐에 따라 <em>새는 돈이 달라집니다.</em>
          </h2>
          <div style={{ height: 30 }} />
          <div className="lps-table-wrap">
            <table className="lps-table">
              <thead>
                <tr>
                  <th scope="col">항목</th>
                  <th scope="col">{COMPARE_COLS[0]}</th>
                  <th scope="col">{COMPARE_COLS[1]}</th>
                  <th scope="col" className="lps-us">
                    {COMPARE_COLS[2]}
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((r) => (
                  <tr key={r.item}>
                    <th scope="row">{r.item}</th>
                    <td>{r.cells[0]}</td>
                    <td>{r.cells[1]}</td>
                    <td className="lps-us">{r.cells[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="lps-cmp-cards">
            {COMPARE_ROWS.map((r) => (
              <div key={r.item} className="lps-cmp">
                <h3>{r.item}</h3>
                <dl>
                  {COMPARE_COLS.map((c, i) => (
                    <div key={c} className={i === 2 ? "lps-us" : undefined}>
                      <dt>{c}</dt>
                      <dd>{r.cells[i]}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7 4단계 한 팀 구조 */}
      <section data-track-section="process" className="lps-sec lps-gray">
        <div className="lps-in">
          <h2 className="lps-h2">
            입지부터 운영까지,
            <br />
            4단계를 <em>한 팀이 끝까지</em> 갑니다.
          </h2>
          <p className="lps-sub">단계마다 업체를 바꿔가며 소모되지 않도록, 처음부터 끝까지 같은 팀이 책임집니다.</p>
          <div className="lps-steps">
            {STEPS.map((s, i) => (
              <div key={s.title} className="lps-step">
                <span className="lps-step-no">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {s.points.length > 0 && (
                  <div className="lps-tags">
                    {s.points.map((p) => (
                      <span key={p}>{p}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8 결정적 차별점 3가지 */}
      <section data-track-section="difference" className="lps-sec lps-dk">
        <div className="lps-in">
          <h2 className="lps-h2">
            오픈해드리고 끝나는 곳과
            <br />
            <em>여기서부터 다릅니다.</em>
          </h2>
          <div style={{ height: 30 }} />
          <div className="lps-diffs">
            {DIFFS.map((d, i) => (
              <div key={d.title} className="lps-diff">
                <p className="lps-diff-no">0{i + 1}</p>
                <h3>{d.title}</h3>
                <p>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9 증거 — 텍스트 후기 + 카톡 후기 + 로고 */}
      <section data-track-section="proof" className="lps-sec">
        <div className="lps-in">
          <h2 className="lps-h2" style={{ marginBottom: 34 }}>
            직접 경험하신 <em style={{ color: "var(--g)" }}>대표님들의 이야기</em>
          </h2>
          <div className="lps-reviews">
            {REVIEWS.map((r) => (
              <div key={r.name} className="lps-review">
                <div className="lps-review-h">
                  <span className="lps-avatar">{r.name.slice(0, 1)}</span>
                  <div>
                    <h4>{r.name}</h4>
                    <small>{r.meta}</small>
                  </div>
                </div>
                <p>{r.text}</p>
              </div>
            ))}
          </div>
          <h3 className="lps-h3">실시간 카톡 후기</h3>
          <div className="lps-kakao">
            {KAKAO.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="카톡 후기" loading="lazy" />
            ))}
          </div>
          <div className="lps-logos">
            <LogoMarquee title="더그로우와 함께" titleAccent="성장 중인 센터들" />
          </div>
        </div>
      </section>

      {/* 10 대표 소개 */}
      <section data-track-section="ceo" className="lps-sec lps-dk2">
        <div className="lps-in lps-ceo">
          <div className="lps-ceo-imgs">
            {["842da7b3d40fb.jpg", "57d1714abddb9.jpg", "f37752fb9163d.jpg", "3909d6c9fed57.jpg"].map((f) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={f} src={`/legacy/startup/${f}`} alt="더그로우컴퍼니 현장" loading="lazy" />
            ))}
          </div>
          <div>
            <h2>
              창업 300회,
              <br />
              <em>오픈하는 법보다 망하지 않는 법</em>을 먼저 압니다.
            </h2>
            <p>
              직접 센터를 운영해본 경험,
              <br />
              수백 번의 창업을 곁에서 함께한 경험,
              <br />
              실패와 성공을 모두 지켜본 현장의 기준으로
              <br />
              대표님의 첫 창업이 &lsquo;첫 성공&rsquo;이 되도록 함께하겠습니다.
            </p>
            <div className="lps-badges">
              <span>창업 300회</span>
              <span>전속 인테리어팀 운영</span>
              <span>오픈 후 운영 교육</span>
            </div>
          </div>
        </div>
      </section>

      {/* 11 플랜 2종 */}
      <section data-track-section="plan" className="lps-sec lps-gray">
        <div className="lps-in">
          <h2 className="lps-h2" style={{ marginBottom: 34 }}>
            규모에 맞춘 <em style={{ color: "var(--g)" }}>창업 플랜</em>
          </h2>
          <div className="lps-plans">
            {[
              { name: "더그로우 창업솔루션", size: "헬스장, 6:1 이상 필라테스 등", bonus: true },
              { name: "소자본 창업솔루션", size: "1:1 피티샵, 개인·소그룹 필라테스 샵 등", bonus: false },
            ].map((p) => (
              <div key={p.name} className="lps-plan">
                <p className="lps-plan-name">{p.name}</p>
                <span className="lps-plan-size">{p.size}</span>
                <ul>
                  {PLAN_COMMON.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                  <li className="lps-strongli">
                    그로우 운영시스템 교육 및 파일제공
                    <small>총 4회, 섹터맵 / 홍보일지 / 회원관리 / 상담방법 등</small>
                  </li>
                  {PLAN_TAIL.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                  {p.bonus && <li className="lps-bonus">오픈세일 / 직원 직접상주 2달</li>}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12 선별 메시지 */}
      <section data-track-section="selection" className="lps-sec lps-pick">
        <div className="lps-in lps-in--narrow">
          <h2>
            더그로우는 모든 분과
            <br />
            함께하지 않습니다.
          </h2>
          <p>
            저희는 &lsquo;빨리 오픈&rsquo;이 아니라 &lsquo;제대로 성공&rsquo;을 목표로 합니다.
            <br />
            그래서 함께 성장할 수 있는 대표님만 선별하여 진행합니다.
          </p>
          <ul>
            <li>진정성 있는 분</li>
            <li>함께 노력할 준비가 된 분</li>
            <li>장기적인 성공을 원하시는 분</li>
          </ul>
        </div>
      </section>

      {/* 13 신청 시 받는 것 + 폼 */}
      <section data-track-section="form" className="lps-sec lps-apply" id="consulting-form">
        <div className="lps-in">
          <h2 className="lps-h2">
            연락처를 남기시면,
            <br />
            내 계획에 맞는 <em style={{ color: "var(--g)" }}>창업 정보</em>를 보내드립니다.
          </h2>
          <div style={{ height: 30 }} />
          <div className="lps-recv">
            {RECEIVES.map((r, i) => (
              <div key={r.title} className="lps-recv-card">
                <span className="lps-recv-no">{i + 1}</span>
                <h3>{r.title}</h3>
                <p>{r.desc}</p>
              </div>
            ))}
          </div>

          <div className="lps-form-wrap">
            <div className="lps-form-head">{CTA_LABEL}</div>

            {sent ? (
              <div className="lps-done" role="status">
                <b>정상적으로 접수되었습니다.</b>
                신청 후 24시간 이내 담당자가 연락드립니다.
              </div>
            ) : (
              <>
                <form
                  ref={formRef}
                  id="lpsStartupForm"
                  className="lps-form"
                  action={FORM_ACTION}
                  method="POST"
                  target={FORM_TARGET}
                  onSubmit={onSubmit}
                >
                  <div className="lps-grp">
                    <label className="lps-label">
                      희망 업종을 선택해주세요. <span className="lps-req">*</span>
                    </label>
                    <select name="industry" className="lps-input" required defaultValue="">
                      <option value="">(선택)</option>
                      <option value="헬스장">헬스장</option>
                      <option value="필라테스">필라테스</option>
                      <option value="PT 스튜디오">PT 스튜디오</option>
                      <option value="요가">요가</option>
                      <option value="기타">기타</option>
                    </select>
                  </div>

                  <div className="lps-grp">
                    <label className="lps-label">
                      선호 희망 지역을 알려주세요.
                      <br />
                      <small>(입지 상권을 함께 봐드립니다.)</small>
                    </label>
                    <input
                      type="text"
                      name="area"
                      className="lps-input"
                      placeholder="예) 서울 마포구, 경기 남부, 부산 서면 인근 등"
                    />
                  </div>

                  <div className="lps-grp">
                    <label className="lps-label">
                      이름을 입력해주세요. <span className="lps-req">*</span>
                    </label>
                    <input type="text" name="name" className="lps-input" required />
                  </div>

                  <div className="lps-grp">
                    <label className="lps-label">
                      연락처를 입력해주세요. <span className="lps-req">*</span>
                    </label>
                    <div className="lps-phone">
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
                            className="lps-input"
                            maxLength={i === 0 ? 3 : 4}
                            required
                            onChange={onPhoneInput(i)}
                          />
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="lps-grp">
                    <label className="lps-label">
                      연락처를 입력해주세요(중복확인). <span className="lps-req">*</span>
                    </label>
                    <div className="lps-phone">
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
                            className="lps-input"
                            maxLength={i === 0 ? 3 : 4}
                            required
                            onChange={onPhoneInput(3 + i)}
                          />
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="lps-grp">
                    <label className="lps-label">
                      신청 경로를 알려주세요. <span className="lps-req">*</span>
                    </label>
                    {[
                      ["네이버 검색(창업, 창업솔루션 등)", "네이버 검색 (창업, 창업솔루션 등)"],
                      ["인스타/페이스북 광고", "인스타/페이스북 광고"],
                      ["네이버 블로그", "네이버 블로그"],
                      ["지인 소개/아카데미 수강생", "지인 소개 / 아카데미 수강생"],
                      ["기타", "기타"],
                    ].map(([value, text], i) => (
                      <label key={value} className="lps-radio">
                        <input type="radio" name="route" value={value} required={i === 0} />
                        <span>{text}</span>
                      </label>
                    ))}
                  </div>

                  {/* 페이지 구분 */}
                  <input type="hidden" name="source" value={FORM_SOURCE} />
                  {/* 보안 토큰 */}
                  <input type="hidden" name="token" value={FORM_TOKEN} />

                  <button type="submit" className="lps-submit" disabled={submitting}>
                    {submitting ? "전송중..." : CTA_LABEL}
                  </button>
                </form>

                <div className="lps-notice">
                  신청 후 <b>24시간 이내</b> 담당자가 연락드립니다.
                </div>
              </>
            )}
            <iframe ref={iframeRef} name={FORM_TARGET} title="신청 전송" style={{ display: "none" }} />
          </div>
        </div>
      </section>

      {/* 14 FAQ */}
      <section data-track-section="faq" className="lps-sec">
        <div className="lps-in lps-in--narrow">
          <h2 className="lps-h2" style={{ marginBottom: 30 }}>
            궁금하신 점을 모았습니다
          </h2>
          <div className="lps-faq">
            {FAQS.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 하단 고정 바 스페이서 — 바가 푸터를 가리지 않게 한다 */}
      <div className="lps-bar-space" aria-hidden="true" />

      {/* 하단 고정 바 — 계산기 패널이 열리면 숨김 */}
      <div className={`lps-bar${calcOpen ? " is-hidden" : ""}`} aria-hidden={calcOpen}>
        <button type="button" className="lps-bar-calc" onClick={openCalc} tabIndex={calcOpen ? -1 : 0}>
          {CALC_LABEL}
        </button>
        <button type="button" className="lps-bar-cta" onClick={scrollToForm} tabIndex={calcOpen ? -1 : 0}>
          {CTA_LABEL}
        </button>
      </div>

      <CostCalculator hideBar openToken={calcToken} onOpenChange={setCalcOpen} />
    </div>
  );
}
