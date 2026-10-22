"use client";

// ─────────────────────────────────────────────────────────────────────────────
// /edu/sales-ops3 — 정적·이미지형 모바일 상세페이지 구성의 전환율 비교용 테스트 랜딩 (11블록).
//
//  · 본문 기둥 480px, 바깥 #111. 블록은 블랙·화이트 교차, 핵심 구절만 형광 박스.
//  · 움직이는 요소는 마감 카운트다운 하나뿐이다 (스크롤 애니메이션·타이핑·탭·FAQ 없음).
//  · 결제: components/edu/SalesOpsPay.tsx 를 수정 없이 사용. 랜딩 구분값(landing="sales-ops3")은
//    이 파일이 결제 버튼 클릭 직후 신청 정보(sessionStorage)에 덧붙인다.
//  · 측정 이벤트: view_item / apply_section_view / apply_click (+ 기존 begin_checkout, purchase 에 landing 포함)
//  · 가격·일시·장소·정원·마감은 lib/salesOps.ts 상수에서 가져온다.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import SalesOpsPay from "@/components/edu/SalesOpsPay";
import {
  SO_CAPACITY,
  SO_DATE,
  SO_DEADLINE_MS,
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
import { clearCheckoutPrefill, readCheckoutPrefill, saveCheckoutPrefill } from "@/lib/products";
import { so3Fb, so3FbCustom, so3Ga } from "@/lib/salesOps3Track";

// ── 상수에서 파생하는 표기 ───────────────────────────────────────────────────
const PLACE_SHORT = soIsPending(SO_PLACE) ? SO_PLACE : SO_PLACE.split(" (")[0];
const START_HOUR = parseInt(SO_TIME, 10); // "13:00~17:00" → 13
const START_LABEL = START_HOUR >= 12 ? `오후 ${START_HOUR > 12 ? START_HOUR - 12 : 12}시` : `오전 ${START_HOUR}시`;
const DATE_NUM = SO_DATE.replace(/\(.\)/, ""); // "2026.11.21"
const DOW_EN = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][new Date(SO_DEADLINE_MS + 9 * 3_600_000).getUTCDay()];
const CAP_TEXT = soFormatCapacity(SO_CAPACITY);
const TOP_LINE = `${SO_DATE} ${START_LABEL} · 당산 · ${CAP_TEXT} 한정`;
const LAST_LINE = `${SO_DATE} · 당산 · ${CAP_TEXT} 한정`;
const CTA_TEXT = "내 자리 확보하기";

// ── 이미지·영상 (기존 /edu/sales-ops 와 같은 경로) ───────────────────────────
const IMG = {
  hwang: "/edu/sales-ops/hwang-hyunjin.webp",
  kim: "/edu/sales-ops/kim-jaegang.webp",
  books: [1, 2, 3, 4].map((n) => `/edu/sales-ops/salesbook${n}.png`),
};
// 캡션은 각 영상 첫 화면의 자막(제목)을 그대로 옮긴 것이다. 영상이 바뀌면 함께 바꿀 것.
const VIDEO_TITLES = [
  "고객이 안 사는 이유, 결국 5가지 중 하나",
  "'나중에 할게요.'라는 고객, 사막생수화법",
  "피트니스 업계 종사자라면 꼭 알아야 할 AI 시대 생존전략",
  "'고민해볼게요'라고 할 때, 이제는 이렇게 말하는 겁니다",
];
const VIDEOS = VIDEO_TITLES.map((title, i) => ({
  title,
  src: `/edu/sales-ops/videos/sales-0${i + 1}.mp4`,
  poster: `/edu/sales-ops/videos/sales-0${i + 1}.jpg`,
}));
const SCREENS = [
  { src: "/edu/sales-ops/ops/ops-01-promo.webp", name: "홍보일지", desc: "어디에 무엇을 뿌렸는지, 지도로 기록" },
  { src: "/edu/sales-ops/ops/ops-02-dashboard.webp", name: "대시보드", desc: "유효회원·만료·매출·이탈 위험을 한 화면에" },
  { src: "/edu/sales-ops/ops/ops-03-today.webp", name: "오늘 할 일", desc: "재등록·미가입 콜 대상을 매일 자동으로" },
  { src: "/edu/sales-ops/ops/ops-04-pt.webp", name: "PT 관리", desc: "트레이너별 매출·재등록률·잔여 세션" },
];

// ── 카피 ────────────────────────────────────────────────────────────────────
const ENEMIES = [
  { name: "문의", leak: "문의는 오는데 방문 약속으로 이어지지 않습니다" },
  { name: "상담", leak: "시설·가격 설명만 하다 결정을 미루게 만듭니다" },
  { name: "등록", leak: "\"생각해 볼게요\"에 대응할 한 마디가 없습니다" },
  { name: "재등록", leak: "첫 4주 관리가 없어 만료와 함께 떠납니다" },
];
const BEFORE_AFTER = [
  { before: "주사요? 에이~ 살 빼려면 땀을 흘리셔야죠.", after: "운동이 적금이라면, 주사는 대출입니다." },
  {
    before: "3개월보단 12개월이 훨씬 저렴하니까 이렇게 하세요.",
    after: "도화지 10장에 그리는 그림 vs 100장에 그리는 그림, 어떤 완성도를 원하세요?",
  },
  { before: "회원님, 가격 대비 저희 시설과 기구가 최고죠!", after: "" },
];
const BUBBLES = [
  "원장님 오늘 안 나오세요? 그럼 상담은 내일 다시…",
  "이번 달 매출이 왜 빠졌는지 모르겠어요",
  "PT 재등록은 담당 쌤 따라 나갔어요",
];
const HWANG_BIO = [
  "현 리얼세일즈(주) 대표 · 전 NS홈쇼핑 쇼호스트",
  "홈쇼핑 최다매출 기네스 기록",
  "대한민국 1등 기업들이 찾는 세일즈대본 개발·화법컨설팅",
  "피트니스 프랜차이즈 세일즈 특강 다수",
];
// 김재강 약력은 신청 포스터(public/edu/sales-ops/poster.jpg)의 소개 문구를 그대로 옮겼다.
const KIM_BIO = [
  "현 더그로우컴퍼니 대표",
  "창업·컨설팅·운영 560개 이상",
  "필라테스 46개 · 대형 피트니스 6개, 52개 센터 총괄 · 10년 운영",
  "IFBB PRO NPC 심사위원 · 한국대학보디빌딩협회 이사",
];
const RECOMMEND = [
  { who: "대표 · 원장", body: "원장이 빠지면 매출도 같이 빠지는 구조를 바꾸고 싶은 분" },
  { who: "실장 · 관리자", body: "상담은 많은데 등록 전환이 안 나오는 분" },
  { who: "트레이너 · 강사", body: "권유가 불편하고 \"생각해 볼게요\" 앞에서 말문이 막히는 분" },
];
const CURRICULUM = [
  { part: "1부 운영치트키", name: "숫자의 기술", desc: "유효회원·객단가·상담 성공률·유지율로 센터 보기" },
  { part: "1부 운영치트키", name: "위임의 기술", desc: "FC·매니저 역할 분담과 첫 4주 재등록 루틴" },
  { part: "2부 매출치트키", name: "권유의 기술", desc: "회원의 마음을 여는 질문 한 줄, 반대에 답하는 한 줄 화법" },
  { part: "2부 매출치트키", name: "호감의 기술", desc: "권유가 영업으로 들리지 않게 하는 호감 설계" },
];

const PRETENDARD = "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css";

const STYLE = `
.so3{--g:#22B573;--bk:#111;--ln:rgba(255,255,255,.14);font-family:'Pretendard',-apple-system,BlinkMacSystemFont,system-ui,'Apple SD Gothic Neo','Noto Sans KR',sans-serif;background:#111;color:#fff;word-break:keep-all;overflow-wrap:anywhere;letter-spacing:-.01em;overflow-x:clip}
.so3 *{box-sizing:border-box}
.so3-col{max-width:480px;margin:0 auto;background:#111}
.so3-b{position:relative;padding:56px 20px;text-align:center}
.so3-dk{background:#111;color:#fff}
.so3-wt{background:#fff;color:#111}
.so3-b+.so3-b::before{content:"";position:absolute;left:50%;top:-30px;width:1px;height:60px;background:var(--g);z-index:2}
.so3 h1,.so3 h2,.so3 h3,.so3 p,.so3 ul,.so3 ol{margin:0;padding:0}
.so3 h1,.so3 h2{font-size:30px;line-height:1.3;font-weight:900;letter-spacing:-.03em}
.so3-sub{font-size:20px;line-height:1.4;font-weight:800}
.so3-tx{font-size:17px;line-height:1.65;font-weight:500}
.so3-cap{font-size:14px;line-height:1.5;font-weight:500}
.so3-hl{display:inline;font-style:normal;background:var(--g);color:#fff;padding:2px 10px;font-weight:900;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.so3-gap{margin-top:28px}
.so3-btn{display:flex;align-items:center;justify-content:center;width:100%;height:58px;margin-top:36px;border-radius:8px;background:var(--g);color:#fff;font-size:18px;font-weight:800;text-decoration:none}
.so3-im{position:relative;overflow:hidden}
.so3-ey{font-size:14px;font-weight:700;color:#C8D3CD;margin-bottom:22px}

/* 1. 히어로 */
.so3-ppl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:32px}
.so3-ppl .so3-im{aspect-ratio:4/5}
.so3-tag{margin-top:10px;font-size:15px;font-weight:800}

/* 2. 적 설정 */
.so3-en{display:grid;gap:12px;margin-top:32px}
.so3-en li{list-style:none;display:flex;align-items:flex-start;gap:14px;padding:16px;border:1px solid #E3E3E3;border-radius:10px;text-align:left}
.so3-no{flex:0 0 auto;display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:var(--g);color:#fff;font-size:14px;font-weight:900}
.so3-en b{display:block;font-size:18px;font-weight:800;margin-bottom:2px}
.so3-en div span{display:block;font-size:16px;line-height:1.55;font-weight:500;color:#333}

/* 3. 비포·애프터 */
.so3-ba{display:grid;gap:14px;margin-top:32px}
.so3-card{padding:22px 18px;border-radius:10px;background:#1c1c1c;border:1px solid var(--ln)}
.so3-old{font-size:16px;line-height:1.55;font-weight:500;color:#B8B8B8;text-decoration:line-through;text-decoration-color:#E5484D;text-decoration-thickness:2px}
.so3-arrow{display:block;width:1px;height:20px;margin:12px auto;background:var(--g)}
.so3-new{font-size:20px;line-height:1.45;font-weight:900;color:var(--g)}
.so3-lock{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:64px;border-radius:12px;background:rgba(34,181,115,.12);border:1px dashed #22B573;color:#22B573;font-size:16px;font-weight:700}
.so3-lock svg{flex:0 0 auto;width:16px;height:16px}
.so3-end{margin-top:40px;display:grid;gap:10px;font-size:20px;line-height:1.4;font-weight:800}
.so3-end b{color:#22B573;font-weight:800}

/* 5·7. 증거 */
.so3-pf{position:relative;aspect-ratio:4/5;width:62%;margin:28px auto 0}
.so3-ck{display:grid;gap:12px;margin-top:28px;text-align:left}
.so3-ck li{list-style:none;display:flex;align-items:flex-start;gap:10px;font-size:16px;line-height:1.55;font-weight:500}
.so3-ck svg{flex:0 0 auto;width:22px;height:22px;margin-top:1px}
.so3-sec-t{font-size:20px;font-weight:800;margin-top:44px}
.so3-g2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:20px auto 0}
.so3-books{display:flex;justify-content:center;gap:2.5%;margin-top:20px}
.so3-books>div{flex:0 0 22%;aspect-ratio:374/552;background:#1c1c1c;border-radius:3px}
.so3-vg{max-width:360px}
.so3-vbtn{display:block;position:relative;width:100%;aspect-ratio:3/4;padding:0;border:0;border-radius:8px;overflow:hidden;background:#000;cursor:pointer;color:#fff}
.so3-vbtn::after{content:"";position:absolute;left:50%;top:50%;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:rgba(0,0,0,.55) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M9 6.5v11l9-5.5z' fill='%23fff'/%3E%3C/svg%3E") center/26px no-repeat}
.so3-vid{display:block;width:100%;aspect-ratio:3/4;border-radius:8px;background:#000;object-fit:cover}
.so3-vt{margin-top:8px;font-size:14px;line-height:1.45;font-weight:500;color:#D3DCD7}
.so3-sl{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;padding:0 20px;scroll-padding:0 20px;scrollbar-width:none;overscroll-behavior-x:contain}
.so3-sl::-webkit-scrollbar{display:none}
.so3-sl>div{flex:0 0 78%;scroll-snap-align:start;text-align:center}
.so3-dots{display:flex;justify-content:center;margin-top:10px}
.so3-dot{width:26px;height:26px;padding:0;border:0;background:none;cursor:pointer;display:flex;align-items:center;justify-content:center}
.so3-dot::before{content:"";width:8px;height:8px;border-radius:50%;background:#C9C9C9}
.so3-dot.is-on::before{width:20px;border-radius:4px;background:var(--g)}
.so3-pay:not(.is-open) .sop-card:not(.is-story){display:none}
.so3-more{display:inline-block;margin-top:16px;padding:8px 4px;border:0;background:none;color:#C8D3CD;font:inherit;font-size:15px;font-weight:600;text-decoration:underline;cursor:pointer}
.so3-ap .sop-box{scroll-margin-top:80px}
.so3-sbtn{display:block;position:relative;width:100%;aspect-ratio:4/3;padding:0;border:1px solid #E3E3E3;border-radius:6px;overflow:hidden;background:#0F1413;cursor:zoom-in}
.so3-sn{margin-top:8px;font-size:15px;font-weight:800;color:#111}
.so3-sd{margin-top:2px;font-size:14px;line-height:1.45;font-weight:500;color:#555}
.so3-mark{position:absolute;right:6px;bottom:4px;font-size:10px;font-weight:800;color:rgba(255,255,255,.55);pointer-events:none}

/* 4·6. 반론 */
.so3-bb{display:grid;gap:10px;margin:0 0 32px}
.so3-bb p{max-width:86%;padding:14px 16px;border-radius:12px;background:#EDEDED;color:#222;font-size:16px;line-height:1.5;font-weight:600;text-align:left}
.so3-bb p:nth-child(odd){justify-self:start}
.so3-bb p:nth-child(even){justify-self:end}
.so3-bd{margin-top:20px}

/* 8. 추천 */
.so3-rc{display:grid;gap:12px;margin-top:32px}
.so3-rc li{list-style:none;padding:20px 18px;border:1px solid #E3E3E3;border-radius:10px;background:#F6F6F4}
.so3-rc b{display:block;font-size:19px;font-weight:800;margin-bottom:6px}
.so3-rc span{display:block;font-size:16px;line-height:1.55;font-weight:500;color:#333}

/* 9. 입장권 */
.so3-tk{display:flex;margin-top:32px;border:2px solid var(--g);border-radius:12px;text-align:left}
.so3-tk-s{position:relative;flex:0 0 64px;display:flex;align-items:center;justify-content:center;border-right:2px dashed var(--g)}
.so3-tk-s span{writing-mode:vertical-rl;transform:rotate(180deg);font-size:12px;font-weight:800;letter-spacing:.2em;color:var(--g)}
.so3-tk-s::before,.so3-tk-s::after{content:"";position:absolute;right:-12px;width:22px;height:22px;border-radius:50%;background:#111;border:2px solid var(--g)}
.so3-tk-s::before{top:-13px;border-color:transparent var(--g) var(--g) transparent;transform:rotate(45deg)}
.so3-tk-s::after{bottom:-13px;border-color:var(--g) transparent transparent var(--g);transform:rotate(45deg)}
.so3-tk-m{flex:1 1 auto;min-width:0;padding:22px 18px}
.so3-tk-k{font-size:13px;font-weight:800;letter-spacing:.12em;color:var(--g)}
.so3-tk-d{margin-top:10px;font-size:22px;line-height:1.3;font-weight:900}
.so3-tk-p{margin-top:8px;font-size:15px;line-height:1.5;font-weight:500;color:#D3DCD7}
.so3-tk-n{margin-top:12px;font-size:14px;font-weight:800;color:var(--g)}

/* 10. 목차 */
.so3-cu{margin-top:32px;border:2px solid var(--g);border-radius:12px}
.so3-cu li{list-style:none;padding:20px 16px;border-top:1px solid #E3E3E3}
.so3-cu li:first-child{border-top:0}
.so3-cu small{display:block;font-size:13px;font-weight:800;color:var(--g)}
.so3-cu b{display:block;margin:2px 0 4px;font-size:20px;font-weight:800}
.so3-cu span{display:block;font-size:15px;line-height:1.5;font-weight:500;color:#333}

/* 11. 결제 */
.so3-ap{scroll-margin-top:72px;padding-bottom:calc(56px + env(safe-area-inset-bottom))}
.so3-pr{margin-top:28px}
.so3-pr s{display:block;font-size:17px;font-weight:500;color:#8A8A8A}
.so3-pr b{display:block;margin-top:6px;font-size:44px;line-height:1.1;font-weight:900;letter-spacing:-.03em;color:var(--g)}
.so3-pr small{display:block;margin-top:4px;font-size:14px;font-weight:700;color:#C8D3CD}
.so3-ap .sop{margin-top:28px}
.so3-cd{margin-top:32px}
.so3-cdn{font-size:22px;font-weight:800;color:#fff}
.so3-red{color:#FF4B3E;font-variant-numeric:tabular-nums;font-feature-settings:"tnum"}
.so3-ms{font-size:16px;font-weight:500;opacity:.7}
.so3-ok{margin-top:6px;font-size:16px;font-weight:800;color:var(--g)}
.so3-last{margin-top:36px;font-size:17px;font-weight:800}

/* 하단 고정 CTA */
.so3-bar{position:fixed;left:0;right:0;bottom:0;z-index:40;visibility:hidden}
.so3-bar.is-on{visibility:visible}
.so3-bar-in{max-width:480px;margin:0 auto;min-height:68px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px calc(10px + env(safe-area-inset-bottom));background:#fff;border-top:1px solid #E3E3E3;box-shadow:0 -4px 16px rgba(0,0,0,.08);color:#111;text-align:left}
.so3-bar-cd{font-size:16px;font-weight:700;line-height:1.35;white-space:nowrap}
.so3-bar-ok{margin-top:1px;font-size:13px;font-weight:700;color:#007A14}
.so3-bar-btn{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;height:46px;padding:0 20px;border-radius:8px;background:var(--g);color:#fff;font-size:16px;font-weight:800;text-decoration:none}
@media(max-width:380px){.so3-bar-cd{font-size:14px}.so3-bar-btn{padding:0 14px;font-size:14px}}

/* 확대 보기 */
.so3-lb{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:20px;background:rgba(0,0,0,.92)}
.so3-lb-im{position:relative;width:min(100%,960px);aspect-ratio:4/3}
.so3-lb p{font-size:15px;font-weight:700;color:#fff;text-align:center}
.so3-lb button{position:absolute;top:12px;right:12px;width:44px;height:44px;border:0;border-radius:50%;background:rgba(255,255,255,.16);color:#fff;font-size:24px;line-height:1;cursor:pointer}
.so3-sbtn img,.so3-lb-im img{-webkit-user-drag:none;user-select:none}
`;

function Check() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="12" fill="#22B573" />
      <path d="M6.5 12.5l3.7 3.7 7.3-7.6" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Hl({ children }: { children: React.ReactNode }) {
  return <em className="so3-hl">{children}</em>;
}

function Cta({ id }: { id?: string }) {
  return (
    <a className="so3-btn" href="#apply" id={id}>
      {CTA_TEXT}
    </a>
  );
}

export default function SalesOps3() {
  const applyRef = useRef<HTMLElement>(null);
  const applyHeadRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState<number | null>(null);
  const [zoom, setZoom] = useState<number | null>(null);
  const [barOn, setBarOn] = useState(true);
  const [closed, setClosed] = useState(false);
  const [normalOpen, setNormalOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const slRef = useRef<HTMLDivElement>(null);
  const onSlide = () => {
    const el = slRef.current;
    if (!el) return;
    const w = (el.children[0] as HTMLElement | undefined)?.offsetWidth ?? 1;
    setSlide(Math.min(SCREENS.length - 1, Math.max(0, Math.round(el.scrollLeft / (w + 12)))));
  };
  const goSlide = (i: number) => {
    const el = slRef.current;
    const card = el?.children[i] as HTMLElement | undefined;
    if (el && card) el.scrollTo({ left: card.offsetLeft - 20, behavior: "smooth" });
  };
  // 마지막 버튼: 신청자 정보 폼 상단으로 이동 후 이름 입력에 포커스
  const toForm = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const input = document.getElementById("sop-name") as HTMLInputElement | null;
    if (!input) return;
    e.preventDefault();
    (input.closest(".sop-box") ?? input).scrollIntoView({ block: "start" });
    input.focus({ preventScroll: true });
  };

  // ── 측정: view_item (진입 1회) ──
  const viewedRef = useRef(false);
  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    const item = { item_id: SO_LANDING_V3, item_name: "피트니스 성장 마스터키 세미나" };
    so3Ga("view_item", { currency: "KRW", value: SO_PRICE_NORMAL, items: [item], ...item });
    so3Fb("ViewContent", { content_name: item.item_name, content_ids: [SO_LANDING_V3], value: SO_PRICE_NORMAL, currency: "KRW" });
  }, []);

  // ── 측정: apply_section_view (결제 블록 머리 부분이 50% 보일 때 1회) ──
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

  // ── 하단 고정 CTA: 결제 블록 위치로 숨김 판단 (앵커 점프로 옵저버가 놓쳐도 되도록 위치를 직접 읽는다) ──
  useEffect(() => {
    const apply = applyRef.current;
    if (!apply) return;
    const sync = () => setBarOn(!(apply.getBoundingClientRect().top < window.innerHeight));
    let raf = 0;
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; sync(); });
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    sync();
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // ── 마감 카운트다운 "DD일 HH:MM:SS.cs" — 화면에서 유일하게 움직이는 요소 ──
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const pad = (v: number) => String(v).padStart(2, "0");
    const nums = root.querySelectorAll<HTMLElement>("[data-cd]");
    const mss = root.querySelectorAll<HTMLElement>("[data-cs]");
    let raf = 0;
    const tick = () => {
      const left = SO_DEADLINE_MS - Date.now();
      if (left <= 0) {
        setClosed(true);
        return;
      }
      const d = Math.floor(left / 86_400_000);
      const h = Math.floor((left % 86_400_000) / 3_600_000);
      const m = Math.floor((left % 3_600_000) / 60_000);
      const s = Math.floor((left % 60_000) / 1000);
      const cs = Math.floor((left % 1000) / 10);
      nums.forEach((el) => (el.textContent = `${pad(d)}일 ${pad(h)}:${pad(m)}:${pad(s)}`));
      mss.forEach((el) => (el.textContent = `.${pad(cs)}`));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // 확대 보기: Esc 로 닫기
  useEffect(() => {
    if (zoom === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setZoom(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom]);

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

  const countdown = closed ? (
    "신청 마감"
  ) : (
    <>
      마감까지 <span className="so3-red" data-cd>--일 --:--:--</span>
      <span className="so3-red so3-ms" data-cs>.--</span>
    </>
  );

  return (
    <div ref={rootRef} className="so3">
      {/* eslint-disable-next-line @next/next/no-css-tags */}
      <link rel="stylesheet" href={PRETENDARD} precedence="default" />
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="so3-col">
        {/* 1. 히어로 */}
        <section data-track-section="hero" className="so3-b so3-dk">
          <p className="so3-ey">{TOP_LINE}</p>
          <h1>
            운영과 세일즈,
            <br />
            <Hl>센터 매출을 여는</Hl>
            <br />
            두 개의 열쇠
          </h1>
          <p className="so3-sub so3-gap">피트니스 성장 마스터키 세미나</p>
          <div className="so3-ppl">
            <div>
              <div className="so3-im">
                <Image src={IMG.kim} alt="김재강 대표" fill priority sizes="(max-width: 480px) 45vw, 220px" style={{ objectFit: "contain", objectPosition: "center bottom" }} />
              </div>
              <p className="so3-tag">김재강 · 운영</p>
            </div>
            <div>
              <div className="so3-im">
                <Image src={IMG.hwang} alt="황현진 대표" fill priority sizes="(max-width: 480px) 45vw, 220px" style={{ objectFit: "contain", objectPosition: "center bottom" }} />
              </div>
              <p className="so3-tag">황현진 · 세일즈</p>
            </div>
          </div>
          <Cta />
        </section>

        {/* 2. 적 설정 */}
        <section data-track-section="enemy" className="so3-b so3-wt">
          <h2>
            회원이 없어서가 아닙니다.
            <br />
            <Hl>등록시키는 말이 없어서입니다.</Hl>
          </h2>
          <ol className="so3-en">
            {ENEMIES.map((e, i) => (
              <li key={e.name}>
                <span className="so3-no">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <b>{e.name}</b>
                  <span>{e.leak}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* 3. 비포·애프터 */}
        <section data-track-section="problem" className="so3-b so3-dk">
          <h2>아직도 이렇게 말하고 계신다면</h2>
          <div className="so3-ba">
            {BEFORE_AFTER.map((c) => (
              <div className="so3-card" key={c.before}>
                <p className="so3-old">{c.before}</p>
                <span className="so3-arrow" aria-hidden="true" />
                {c.after ? (
                  <p className="so3-new">{c.after}</p>
                ) : (
                  <div className="so3-lock">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <rect x="4" y="10.5" width="16" height="10.5" rx="2.5" fill="#22B573" />
                      <path d="M8 10.5V7.5a4 4 0 018 0v3" fill="none" stroke="#22B573" strokeWidth="2.4" strokeLinecap="round" />
                    </svg>
                    <span>2부 현장에서만 공개합니다</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="so3-end">
            <p>
              하수는 주장만 하지만, 고수는 <b>주목시킵니다</b>.
            </p>
            <p>
              하수는 이성을 향하지만, 고수는 <b>감정을 공략합니다</b>.
            </p>
          </div>
        </section>

        {/* 4. 반론 ① 강사 */}
        <section data-track-section="belief" className="so3-b so3-wt">
          <h2>
            트레이너가 영업까지 해야 하냐고 묻습니다.
            <br />
            <Hl>영업이 아니라, 권유의 언어입니다.</Hl>
          </h2>
          <p className="so3-tx so3-gap">세일즈가 불편한 건, 당신이 착해서가 아닙니다. 강하게 미는 방법밖에 배운 적이 없어서입니다.</p>
          <p className="so3-tx so3-bd" style={{ fontWeight: 800 }}>
            당신의 일은 단지 운동을 가르치는 것이 아닙니다. 누군가가 자신을 더 사랑할 수 있게끔 돕는 일입니다.
          </p>
        </section>

        {/* 5. 증거 ① 황현진 */}
        <section data-track-section="hwang" className="so3-b so3-dk">
          <h2>
            현장에서 검증된
            <br />
            <Hl>세일즈작가 황현진</Hl>
          </h2>
          <div className="so3-pf so3-im">
            <Image src={IMG.hwang} alt="세일즈작가 황현진" fill sizes="(max-width: 480px) 62vw, 300px" style={{ objectFit: "contain", objectPosition: "center bottom" }} />
          </div>
          <ul className="so3-ck">
            {HWANG_BIO.map((t) => (
              <li key={t}>
                <Check />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <div className="so3-books">
            {IMG.books.map((src, i) => (
              <div className="so3-im" key={src}>
                <Image src={src} alt={`황현진 저서 ${i + 1}권 표지`} fill sizes="(max-width: 480px) 22vw, 106px" style={{ objectFit: "contain" }} />
              </div>
            ))}
          </div>
          <p className="so3-sec-t">세일즈 맛보기</p>
          <div className="so3-g2 so3-vg">
            {VIDEOS.map((v, i) => (
              <div key={v.src}>
                {playing === i ? (
                  <video className="so3-vid" src={v.src} poster={v.poster} controls autoPlay playsInline aria-label={v.title} />
                ) : (
                  <button type="button" className="so3-vbtn" onClick={() => setPlaying(i)} aria-label={`${v.title} 재생`}>
                    <Image src={v.poster} alt="" fill sizes="(max-width: 480px) 40vw, 180px" style={{ objectFit: "cover" }} />
                  </button>
                )}
                <p className="so3-vt">{v.title}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 6. 반론 ② 원장 */}
        <section data-track-section="owner" className="so3-b so3-wt">
          <div className="so3-bb">
            {BUBBLES.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
          <h2>
            원장이 빠지는 날,
            <br />
            <Hl>매출도 같이 빠집니다.</Hl>
          </h2>
          <p className="so3-tx so3-gap">회원은 사람을 보고 등록하고, 시스템을 보고 재등록합니다.</p>
          <Cta />
        </section>

        {/* 7. 증거 ② 김재강 */}
        <section data-track-section="kim" className="so3-b so3-dk">
          <h2>
            52개 센터를 총괄한
            <br />
            <Hl>운영 설계자 김재강</Hl>
          </h2>
          <div className="so3-pf so3-im">
            <Image src={IMG.kim} alt="운영 설계자 김재강" fill sizes="(max-width: 480px) 62vw, 300px" style={{ objectFit: "contain", objectPosition: "center bottom" }} />
          </div>
          <ul className="so3-ck">
            {KIM_BIO.map((t) => (
              <li key={t}>
                <Check />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <p className="so3-sec-t">GROW SYSTEM</p>
          <div className="so3-wt" style={{ margin: "20px -20px 0", padding: "20px 0" }}>
            <div className="so3-sl" ref={slRef} onScroll={onSlide} role="group" aria-label="GROW SYSTEM 화면">
              {SCREENS.map((s, i) => (
                <div key={s.src}>
                  <button type="button" className="so3-sbtn" onClick={() => setZoom(i)} aria-label={`${s.name} 확대 보기`} onContextMenu={(e) => e.preventDefault()}>
                    <Image src={s.src} alt={s.name} fill sizes="(max-width: 480px) 78vw, 360px" style={{ objectFit: "contain" }} />
                    <span className="so3-mark" aria-hidden="true">© THE GROW</span>
                  </button>
                  <p className="so3-sn">{s.name}</p>
                  <p className="so3-sd">{s.desc}</p>
                </div>
              ))}
            </div>
            <div className="so3-dots">
              {SCREENS.map((s, i) => (
                <button key={s.name} type="button" className={"so3-dot" + (i === slide ? " is-on" : "")} aria-label={`${s.name} 보기`} aria-current={i === slide ? "true" : undefined} onClick={() => goSlide(i)} />
              ))}
            </div>
          </div>
          <p className="so3-sub so3-gap" style={{ marginTop: 36 }}>
            감이 아니라 숫자로, 사람이 아니라 구조로.
          </p>
        </section>

        {/* 8. 이런 분께 추천합니다 */}
        <section data-track-section="target" className="so3-b so3-wt">
          <h2>이런 분께 추천합니다</h2>
          <ul className="so3-rc">
            {RECOMMEND.map((r) => (
              <li key={r.who}>
                <b>{r.who}</b>
                <span>{r.body}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 9. 입장권 */}
        <section data-track-section="ticket" className="so3-b so3-dk">
          <h2>
            단 하루,
            <br />
            <Hl>{CAP_TEXT}만 입장합니다.</Hl>
          </h2>
          <div className="so3-tk">
            <div className="so3-tk-s">
              <span>ADMIT ONE</span>
            </div>
            <div className="so3-tk-m">
              <p className="so3-tk-k">GROWTH MASTER KEY SEMINAR</p>
              <p className="so3-tk-d">
                {DATE_NUM} {DOW_EN}
                <br />
                {SO_TIME.replace(/~/g, "–")}
              </p>
              <p className="so3-tk-p">
                {PLACE_SHORT} (당산)
              </p>
              <p className="so3-tk-n">
                정원 {CAP_TEXT} · 4시간
              </p>
            </div>
          </div>
        </section>

        {/* 10. 강의 목차 */}
        <section data-track-section="curriculum" className="so3-b so3-wt">
          <h2>강의 목차</h2>
          <ul className="so3-cu">
            {CURRICULUM.map((c) => (
              <li key={c.name}>
                <small>{c.part}</small>
                <b>{c.name}</b>
                <span>{c.desc}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 11. 가격 + 결제 */}
        <section data-track-section="form" id="apply" className="so3-b so3-dk so3-ap" ref={applyRef}>
          <div ref={applyHeadRef}>
            <h2>
              {soFormatPrice(SO_PRICE_STORY)},
              <br />
              <Hl>상담 1건이면 회수됩니다.</Hl>
            </h2>
            <p className="so3-tx so3-gap">이번 세미나에서 바꾼 한 문장으로 상담 1건만 더 등록돼도, 참가비는 이미 돌아와 있습니다.</p>
            <div className="so3-pr">
              <s>정상가 {soFormatPrice(SO_PRICE_NORMAL)}</s>
              <small>스토리 인증가</small>
              <b>{soFormatPrice(SO_PRICE_STORY)}</b>
            </div>
          </div>
          <div className={"so3-pay" + (normalOpen ? " is-open" : "")} onClickCapture={onPayCapture} onClick={onPayBubble}>
            <SalesOpsPay stack disabled={closed} disabledMessage="신청이 마감되었습니다" />
          </div>
          {!normalOpen && !closed && (
            <button type="button" className="so3-more" onClick={() => setNormalOpen(true)}>
              인증 없이 정상가 {soFormatPrice(SO_PRICE_NORMAL)}으로 결제하기 ›
            </button>
          )}
          <div className="so3-cd">
            <p className="so3-cdn" aria-live="off">
              {countdown}
            </p>
            {!closed && <p className="so3-ok">현재 신청 가능!</p>}
          </div>
          <p className="so3-last">{LAST_LINE}</p>
          {closed ? (
            <span className="so3-btn" style={{ background: "#333", color: "#999" }}>
              신청 마감
            </span>
          ) : (
            <a className="so3-btn" href="#sop-name" onClick={toForm}>
              {CTA_TEXT}
            </a>
          )}
        </section>
      </div>

      {/* 하단 고정 CTA — 결제 블록이 보이면 숨김 */}
      <div className={"so3-bar" + (barOn ? " is-on" : "")} aria-hidden={!barOn}>
        <div className="so3-bar-in">
          <div>
            <p className="so3-bar-cd" aria-live="off">
              {countdown}
            </p>
            {!closed && <p className="so3-bar-ok">현재 신청 가능!</p>}
          </div>
          {closed ? null : (
            <a className="so3-bar-btn" href="#apply" tabIndex={barOn ? 0 : -1}>
              {CTA_TEXT}
            </a>
          )}
        </div>
      </div>

      {/* 운영 시스템 화면 확대 */}
      {zoom !== null && (
        <div className="so3-lb" role="dialog" aria-modal="true" aria-label={`${SCREENS[zoom].name} 확대`} onClick={() => setZoom(null)} onContextMenu={(e) => e.preventDefault()}>
          <div className="so3-lb-im">
            <Image src={SCREENS[zoom].src} alt={SCREENS[zoom].name} fill sizes="960px" style={{ objectFit: "contain" }} />
          </div>
          <p>{SCREENS[zoom].name} · {SCREENS[zoom].desc}</p>
          <button type="button" aria-label="닫기" onClick={() => setZoom(null)}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}
