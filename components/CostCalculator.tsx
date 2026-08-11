"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 창업비용 계산기 팝업 패널
//  · 하단 전체 폭 고정 바(트리거) → PC: 우측 슬라이드 패널(420px) / 모바일: 바텀시트(88vh)
//  · 하단 바는 페이지의 StickyCtaBar(z-50)보다 위(z-60)에 놓여 같은 자리를 대체하며,
//    StickyCtaBar 가 깔아둔 60px 스페이서가 푸터 가림을 동일하게 보정한다
//  · 패널이 열려 있는 동안 하단 바는 숨김(닫으면 다시 표시)
//  · 5단계 플로우: 업종 → 전용면적 → 인테리어 등급 → 기구 구성 → 결과
//  · 단가는 아래 PRICING 객체에서만 수정 (단위: 만원)
//  · CSS 클래스 접두사 calc- / 패널 대기 위치는 transform + 루트 overflow 클리핑
//  · 열림 시 body 스크롤 잠금, 닫힘/언마운트 시 해제
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// 단가 상수 — 모든 금액 단위는 "만원". 아래 숫자만 바꾸면 계산에 반영됩니다.
// ═══════════════════════════════════════════════════════════════════════════
const PRICING = {
  // 인테리어 평당 단가 [실속형, 스탠다드, 프리미엄]
  interiorPerPyeong: {
    yoga: [120, 160, 220],
    pilates: [130, 180, 250],
    gym: [140, 190, 260],
    ptshop: [130, 180, 240],
    barre: [120, 170, 230],
    crossfit: [100, 140, 190],
  } as Record<string, number[]>,

  equipment: {
    // 필라테스 리포머 1대 [국산/수입]
    pilatesReformer: { domestic: 350, imported: 750 },
    // 리포머가 이 대수 이상이면 캐딜락+체어+바렐 세트 자동 추가
    pilatesSetThreshold: 5,
    pilatesSet: { domestic: 800, imported: 1600 },
    // 헬스장 평당 (유산소+머신+프리웨이트 포함 개산)
    gymPerPyeong: { domestic: 55, imported: 90 },
    // PT샵 랙 1세트당 (랙+덤벨+벤치+케이블 포함)
    ptRack: { domestic: 450, imported: 800 },
    // 크로스핏 리그 규모별 (국산 기준, 수입은 배수 적용)
    crossfitRig: { small: 2000, mid: 3500, large: 5500 },
    crossfitImportedMultiplier: 1.4,
    // 요가/바레 소도구 구성 (바레는 바 설치+거울 포함)
    yogaTools: { basic: 300, full: 600 },
    barreTools: { basic: 500, full: 900 },
  },

  extras: {
    hvacPerPyeong: 18, // 냉난방(시스템에어컨) 평당
    electricHeavy: 400, // 전기 증설 — 헬스장·크로스핏
    electricNormal: 150, // 전기 증설 — 그 외
    showerPerPyeong: 8, // 샤워실·락커룸 — 헬스장·크로스핏만 평당 추가
    signage: 350, // 간판·사인물 고정
    firePermit: 250, // 소방·인허가 고정
    system: 400, // 음향·CCTV·출입시스템 고정
    marketingRate: 0.08, // 오픈 마케팅(프리세일) — 총 공사비 대비 비율
    reservePerPyeong: 12, // 예비 운영자금 평당 (손익분기 도달 전 2~3개월 고정비)
  },

  // 더그로우 진행 시 절감률
  grow: {
    interiorMarginRate: 0.12, // 시공 중간마진 제거 (인테리어비 대비)
    equipmentMarginRate: 0.1, // 기구 유통마진 절감 (기구비 대비)
    overDesignRate: 0.05, // 과잉 설계 제거 (인테리어비 대비)
  },

  rangeRate: 0.1, // 결과 표시 범위 ±10%
};

// 업종 목록 + 업종 선택 시 자동 세팅되는 기본 전용면적(평)
const INDUSTRY_LIST = [
  { key: "yoga", label: "요가", defaultArea: 40 },
  { key: "pilates", label: "필라테스", defaultArea: 30 },
  { key: "gym", label: "헬스장", defaultArea: 150 },
  { key: "ptshop", label: "PT샵", defaultArea: 25 },
  { key: "barre", label: "바레", defaultArea: 35 },
  { key: "crossfit", label: "크로스핏", defaultArea: 80 },
] as const;
type IndustryKey = (typeof INDUSTRY_LIST)[number]["key"];

const GRADE_LIST = [
  { label: "실속형", desc: "꼭 필요한 마감 위주의 합리적인 구성" },
  { label: "스탠다드", desc: "내구성과 디자인의 균형을 잡은 구성" },
  { label: "프리미엄", desc: "공간 브랜딩까지 고려한 고급 마감 구성" },
];

const RIG_LIST = [
  { key: "small", label: "소" },
  { key: "mid", label: "중" },
  { key: "large", label: "대" },
] as const;
type RigKey = (typeof RIG_LIST)[number]["key"];

const AREA_MIN = 10;
const AREA_MAX = 300;

// 만원 단위 숫자 포맷 — 10,000만원 이상이면 "N억 M,MMM만원"
function fmtMan(n: number, withUnit = true): string {
  const v = Math.round(n);
  if (v >= 10000) {
    const eok = Math.floor(v / 10000);
    const man = v % 10000;
    const body = man > 0 ? `${eok}억 ${man.toLocaleString("ko-KR")}` : `${eok}억`;
    return withUnit ? (man > 0 ? `${body}만원` : `${body}원`) : body;
  }
  return withUnit ? `${v.toLocaleString("ko-KR")}만원` : v.toLocaleString("ko-KR");
}

// 100만원 단위 반올림 (결과 범위 표시용)
const round100 = (n: number) => Math.round(n / 100) * 100;

const CALC_STYLE = `
.calc-bar{position:fixed;left:0;right:0;bottom:0;z-index:60;display:flex;align-items:center;justify-content:center;gap:8px;height:calc(56px + env(safe-area-inset-bottom));padding:0 16px env(safe-area-inset-bottom);background:#009519;color:#fff;border:none;border-top:1px solid rgba(255,255,255,.25);box-shadow:0 -4px 20px rgba(0,0,0,.18);font-size:15px;font-weight:800;cursor:pointer;font-family:'Pretendard',-apple-system,BlinkMacSystemFont,system-ui,'Apple SD Gothic Neo',sans-serif;letter-spacing:-0.01em;transition:transform .3s ease,background .2s}
.calc-bar:hover{background:#007a14}
.calc-bar.is-hidden{transform:translateY(110%);pointer-events:none}
.calc-bar svg{flex:0 0 auto}
@media(min-width:768px){.calc-bar{height:calc(60px + env(safe-area-inset-bottom));font-size:16px}}

.calc-root{position:fixed;inset:0;z-index:90;overflow:hidden;pointer-events:none;visibility:hidden;transition:visibility 0s .4s;font-family:'Pretendard',-apple-system,BlinkMacSystemFont,system-ui,'Apple SD Gothic Neo',sans-serif;letter-spacing:-0.01em}
.calc-root.is-open{pointer-events:auto;visibility:visible;transition:visibility 0s}
.calc-overlay{position:absolute;inset:0;background:rgba(0,0,0,.55);opacity:0;transition:opacity .35s}
.calc-root.is-open .calc-overlay{opacity:1}
.calc-panel{position:absolute;top:0;right:0;bottom:0;width:420px;max-width:100%;background:#0d0d0d;color:#fff;display:flex;flex-direction:column;transform:translateX(100%);transition:transform .4s cubic-bezier(.22,1,.36,1);box-shadow:-12px 0 40px rgba(0,0,0,.4)}
.calc-root.is-open .calc-panel{transform:translateX(0)}
@media(max-width:767px){
  .calc-panel{top:auto;left:0;right:0;bottom:0;width:100%;height:88vh;border-radius:20px 20px 0 0;transform:translateY(100%);box-shadow:0 -12px 40px rgba(0,0,0,.4)}
  .calc-root.is-open .calc-panel{transform:translateY(0)}
}

.calc-head{flex:0 0 auto;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 20px 14px;border-bottom:1px solid #222}
.calc-head-t{font-size:16px;font-weight:800;margin:0}
.calc-step-no{font-size:12px;font-weight:700;color:#22B573;margin-right:8px}
.calc-close{flex:0 0 auto;width:34px;height:34px;border:none;border-radius:10px;background:#1a1a1a;color:#aaa;font-size:16px;line-height:1;cursor:pointer;transition:background .2s,color .2s}
.calc-close:hover{background:#262626;color:#fff}

.calc-body{flex:1 1 auto;overflow-y:auto;overflow-x:hidden;padding:22px 20px;min-height:0}
@keyframes calcFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.calc-stepview{animation:calcFade .25s ease}
.calc-q{font-size:19px;font-weight:800;line-height:1.45;margin:0 0 18px}
.calc-q em{font-style:normal;color:#22B573}
.calc-hint{font-size:13px;color:#9a9a9a;line-height:1.6;margin:10px 0 0}

.calc-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.calc-card{border:1px solid #2a2a2a;border-radius:14px;background:#161616;color:#eee;padding:18px 12px;font-size:15px;font-weight:700;text-align:center;cursor:pointer;transition:border-color .2s,background .2s,color .2s}
.calc-card:hover{border-color:#22B573}
.calc-card.is-sel{border-color:#22B573;background:rgba(34,181,115,.12);color:#fff}

.calc-gradecard{display:block;width:100%;border:1px solid #2a2a2a;border-radius:14px;background:#161616;color:#eee;padding:16px;text-align:left;cursor:pointer;margin-bottom:10px;transition:border-color .2s,background .2s}
.calc-gradecard:hover{border-color:#22B573}
.calc-gradecard.is-sel{border-color:#22B573;background:rgba(34,181,115,.12)}
.calc-gradecard b{display:block;font-size:15px;font-weight:800;color:#fff;margin-bottom:4px}
.calc-gradecard span{font-size:13px;color:#9a9a9a;line-height:1.5}

.calc-area-val{display:flex;align-items:baseline;gap:8px;margin-bottom:14px}
.calc-area-input{width:90px;background:#161616;border:1px solid #2a2a2a;border-radius:10px;color:#fff;font-size:22px;font-weight:900;text-align:center;padding:8px 6px;outline:none}
.calc-area-input:focus{border-color:#22B573}
.calc-area-unit{font-size:15px;font-weight:700;color:#9a9a9a}
.calc-slider{width:100%;accent-color:#22B573;cursor:pointer}
.calc-slider-scale{display:flex;justify-content:space-between;font-size:12px;color:#777;margin-top:6px}

.calc-sub{font-size:13px;font-weight:800;color:#9a9a9a;margin:20px 0 10px}
.calc-sub:first-child{margin-top:0}
.calc-stepper{display:flex;align-items:center;gap:14px}
.calc-stepper-btn{width:40px;height:40px;border:1px solid #2a2a2a;border-radius:12px;background:#161616;color:#fff;font-size:20px;line-height:1;cursor:pointer;transition:border-color .2s}
.calc-stepper-btn:hover{border-color:#22B573}
.calc-stepper-val{min-width:64px;text-align:center;font-size:20px;font-weight:900}
.calc-stepper-val small{display:block;font-size:12px;font-weight:600;color:#9a9a9a;margin-top:2px}
.calc-choice2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.calc-choice3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px}

.calc-foot{flex:0 0 auto;display:flex;gap:10px;padding:14px 20px calc(14px + env(safe-area-inset-bottom));border-top:1px solid #222}
.calc-prev{flex:0 0 auto;padding:0 18px;height:50px;border:1px solid #2a2a2a;border-radius:12px;background:#161616;color:#ccc;font-size:14px;font-weight:700;cursor:pointer;transition:border-color .2s}
.calc-prev:hover{border-color:#555}
.calc-next{flex:1 1 auto;height:50px;border:none;border-radius:12px;background:#22B573;color:#fff;font-size:15px;font-weight:800;cursor:pointer;transition:opacity .2s}
.calc-next:hover{opacity:.9}
.calc-next:disabled{opacity:.35;cursor:not-allowed}

.calc-table{width:100%;border-collapse:collapse;margin-bottom:6px}
.calc-table td{padding:8px 0;font-size:13.5px;border-bottom:1px solid #1d1d1d}
.calc-table td:first-child{color:#bbb}
.calc-table td:last-child{text-align:right;font-weight:700;color:#eee;white-space:nowrap}
.calc-total{display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding:14px 0 4px;flex-wrap:wrap}
.calc-total b{font-size:14px;font-weight:800;color:#fff}
.calc-total strong{font-size:17px;font-weight:900;color:#22B573;white-space:nowrap}

.calc-grow{margin-top:22px;border:1px solid rgba(34,181,115,.35);border-radius:14px;background:rgba(34,181,115,.06);padding:16px}
.calc-grow-t{font-size:14px;font-weight:800;color:#22B573;margin:0 0 12px}
@keyframes calcCutIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes calcStrike{from{width:0}to{width:100%}}
.calc-cut{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 0;opacity:0;animation:calcCutIn .45s ease forwards;animation-delay:var(--calc-delay)}
.calc-cut-label{position:relative;font-size:13px;color:#ccc;line-height:1.5}
.calc-cut-label::after{content:'';position:absolute;left:0;top:52%;height:2px;width:0;background:#22B573;animation:calcStrike .4s ease forwards;animation-delay:calc(var(--calc-delay) + .25s)}
.calc-cut-amt{flex:0 0 auto;font-size:13.5px;font-weight:800;color:#22B573;white-space:nowrap}
.calc-save{margin-top:12px;padding-top:12px;border-top:1px dashed rgba(34,181,115,.35);text-align:center;opacity:0;animation:calcCutIn .5s ease forwards;animation-delay:1.5s}
.calc-save p{margin:0 0 4px;font-size:13px;color:#bbb}
.calc-save strong{font-size:19px;font-weight:900;color:#22B573;line-height:1.4}

.calc-cta{display:block;width:100%;margin-top:18px;height:54px;border:none;border-radius:12px;background:#009519;color:#fff;font-size:15px;font-weight:800;cursor:pointer;transition:background .2s}
.calc-cta:hover{background:#007a14}
.calc-note{font-size:11.5px;color:#777;line-height:1.7;margin:12px 0 0;text-align:center}
`;

export default function CostCalculator() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);

  // ── 입력 상태 ──
  const [industry, setIndustry] = useState<IndustryKey | null>(null);
  const [area, setArea] = useState(50);
  const [areaText, setAreaText] = useState("50");
  const [grade, setGrade] = useState<number | null>(null); // 0 실속형 / 1 스탠다드 / 2 프리미엄
  const [eqGrade, setEqGrade] = useState<"domestic" | "imported">("domestic");
  const [reformers, setReformers] = useState<number | null>(null); // null = 평수 기반 자동
  const [racks, setRacks] = useState(2);
  const [rig, setRig] = useState<RigKey>("mid");
  const [tools, setTools] = useState<"basic" | "full">("basic");

  useEffect(() => {
    setMounted(true);
  }, []);

  // 패널 열림 시 body 스크롤 잠금 + ESC 닫기 (닫힘/언마운트 시 반드시 해제)
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const clampArea = (n: number) => Math.min(AREA_MAX, Math.max(AREA_MIN, n));
  const applyArea = (n: number) => {
    const c = clampArea(n);
    setArea(c);
    setAreaText(String(c));
  };

  // 업종 선택 — 이후 단계(면적/등급/기구) 전부 초기화
  const selectIndustry = (key: IndustryKey) => {
    setIndustry(key);
    const def = INDUSTRY_LIST.find((i) => i.key === key)!.defaultArea;
    setArea(def);
    setAreaText(String(def));
    setGrade(null);
    setEqGrade("domestic");
    setReformers(null);
    setRacks(2);
    setRig("mid");
    setTools("basic");
  };

  // 리포머 기본값: 평수/6 반올림, 최소 3 (직접 조절 전까지 자동)
  const autoReformers = Math.max(3, Math.round(area / 6));
  const reformerCount = reformers ?? autoReformers;

  // ── 비용 계산 (단위: 만원) ──
  const calc = useMemo(() => {
    if (!industry || grade === null) return null;
    const E = PRICING.equipment;
    const X = PRICING.extras;
    const heavy = industry === "gym" || industry === "crossfit";

    const interior = area * PRICING.interiorPerPyeong[industry][grade];

    let equipment = 0;
    if (industry === "pilates") {
      equipment = reformerCount * E.pilatesReformer[eqGrade];
      if (reformerCount >= E.pilatesSetThreshold) equipment += E.pilatesSet[eqGrade];
    } else if (industry === "gym") {
      equipment = area * E.gymPerPyeong[eqGrade];
    } else if (industry === "ptshop") {
      equipment = racks * E.ptRack[eqGrade];
    } else if (industry === "crossfit") {
      equipment = E.crossfitRig[rig];
      if (eqGrade === "imported") equipment *= E.crossfitImportedMultiplier;
    } else if (industry === "yoga") {
      equipment = E.yogaTools[tools];
    } else {
      equipment = E.barreTools[tools];
    }

    const hvac = area * X.hvacPerPyeong;
    const electric = heavy ? X.electricHeavy : X.electricNormal;
    const shower = heavy ? area * X.showerPerPyeong : 0;
    const signage = X.signage;
    const fire = X.firePermit;
    const system = X.system;

    // 총 공사비(마케팅 산정 기준) = 인테리어+기구+설비/고정 항목 합
    const construction = interior + equipment + hvac + electric + shower + signage + fire + system;
    const marketing = construction * X.marketingRate;
    const reserve = area * X.reservePerPyeong;
    const total = construction + marketing + reserve;

    // 더그로우 절감액
    const cutInterior = interior * PRICING.grow.interiorMarginRate;
    const cutEquipment = equipment * PRICING.grow.equipmentMarginRate;
    const cutDesign = interior * PRICING.grow.overDesignRate;
    const saving = cutInterior + cutEquipment + cutDesign;

    return {
      interior,
      equipment,
      hvac,
      electric,
      shower,
      signage,
      fire,
      system,
      marketing,
      reserve,
      total,
      cutInterior,
      cutEquipment,
      cutDesign,
      saving,
    };
  }, [industry, grade, area, eqGrade, reformerCount, racks, rig, tools]);

  // 결과 닫고 상단 창업 상담 폼으로 스크롤 (폼 자체는 건드리지 않음)
  const goConsultForm = () => {
    setOpen(false);
    const target =
      document.querySelector("#consulting-form-top") ??
      document.querySelector("#consulting-form");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const industryLabel = industry
    ? INDUSTRY_LIST.find((i) => i.key === industry)!.label
    : "";

  const nextDisabled =
    (step === 1 && !industry) || (step === 3 && grade === null);

  if (!mounted) return null;

  const r = PRICING.rangeRate;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CALC_STYLE }} />

      {/* 하단 전체 폭 고정 바 (트리거) — 패널 열림 동안 숨김 */}
      <button
        type="button"
        className={`calc-bar${open ? " is-hidden" : ""}`}
        onClick={() => {
          setOpen(true);
          if (!industry) setStep(1);
        }}
        aria-label="창업비용 계산기 열기"
        aria-hidden={open}
        tabIndex={open ? -1 : 0}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="4" y="2" width="16" height="20" rx="2.5" stroke="#fff" strokeWidth="2" />
          <rect x="7.5" y="5.5" width="9" height="3.5" rx="1" fill="#fff" />
          <circle cx="8.6" cy="13" r="1.3" fill="#fff" />
          <circle cx="12" cy="13" r="1.3" fill="#fff" />
          <circle cx="15.4" cy="13" r="1.3" fill="#fff" />
          <circle cx="8.6" cy="17" r="1.3" fill="#fff" />
          <circle cx="12" cy="17" r="1.3" fill="#fff" />
          <circle cx="15.4" cy="17" r="1.3" fill="#fff" />
        </svg>
        내 창업비용 계산해보기
      </button>

      {/* 패널 (대기 시 transform 으로 화면 밖, 루트가 overflow 클리핑) */}
      <div className={`calc-root${open ? " is-open" : ""}`} aria-hidden={!open}>
        <div className="calc-overlay" onClick={() => setOpen(false)} />
        <div className="calc-panel" role="dialog" aria-modal="true" aria-label="창업비용 계산기">
          {/* 헤더 */}
          <div className="calc-head">
            <p className="calc-head-t">
              <span className="calc-step-no">{step}/5</span>창업비용 계산기
            </p>
            <button
              type="button"
              className="calc-close"
              onClick={() => setOpen(false)}
              aria-label="닫기"
            >
              ✕
            </button>
          </div>

          {/* 본문 */}
          <div className="calc-body">
            {step === 1 && (
              <div className="calc-stepview" key="s1">
                <h3 className="calc-q">
                  준비 중인 <em>업종</em>을 선택해주세요.
                </h3>
                <div className="calc-grid">
                  {INDUSTRY_LIST.map((it) => (
                    <button
                      key={it.key}
                      type="button"
                      className={`calc-card${industry === it.key ? " is-sel" : ""}`}
                      onClick={() => selectIndustry(it.key)}
                    >
                      {it.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="calc-stepview" key="s2">
                <h3 className="calc-q">
                  <em>전용면적</em>을 알려주세요.
                </h3>
                <div className="calc-area-val">
                  <input
                    className="calc-area-input"
                    type="text"
                    inputMode="numeric"
                    value={areaText}
                    onChange={(e) => setAreaText(e.target.value.replace(/\D/g, "").slice(0, 3))}
                    onBlur={() => {
                      const n = parseInt(areaText, 10);
                      applyArea(Number.isNaN(n) ? area : n);
                    }}
                    aria-label="전용면적 직접 입력"
                  />
                  <span className="calc-area-unit">평</span>
                </div>
                <input
                  className="calc-slider"
                  type="range"
                  min={AREA_MIN}
                  max={AREA_MAX}
                  value={area}
                  onChange={(e) => applyArea(Number(e.target.value))}
                  aria-label="전용면적 슬라이더"
                />
                <div className="calc-slider-scale">
                  <span>{AREA_MIN}평</span>
                  <span>{AREA_MAX}평</span>
                </div>
                <p className="calc-hint">
                  {industryLabel} 기준 평균 면적으로 시작합니다. 실제 면적에 맞게 조절해주세요.
                </p>
              </div>
            )}

            {step === 3 && (
              <div className="calc-stepview" key="s3">
                <h3 className="calc-q">
                  <em>인테리어 등급</em>을 선택해주세요.
                </h3>
                {GRADE_LIST.map((g, i) => (
                  <button
                    key={g.label}
                    type="button"
                    className={`calc-gradecard${grade === i ? " is-sel" : ""}`}
                    onClick={() => setGrade(i)}
                  >
                    <b>{g.label}</b>
                    <span>{g.desc}</span>
                  </button>
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="calc-stepview" key="s4">
                <h3 className="calc-q">
                  <em>기구 구성</em>을 선택해주세요.
                </h3>

                {industry === "pilates" && (
                  <>
                    <p className="calc-sub">리포머 대수</p>
                    <div className="calc-stepper">
                      <button
                        type="button"
                        className="calc-stepper-btn"
                        onClick={() => setReformers(Math.max(1, reformerCount - 1))}
                        aria-label="리포머 1대 줄이기"
                      >
                        −
                      </button>
                      <div className="calc-stepper-val">
                        {reformerCount}대
                        <small>{area}평 권장 {autoReformers}대</small>
                      </div>
                      <button
                        type="button"
                        className="calc-stepper-btn"
                        onClick={() => setReformers(reformerCount + 1)}
                        aria-label="리포머 1대 늘리기"
                      >
                        +
                      </button>
                    </div>
                    {reformerCount >= PRICING.equipment.pilatesSetThreshold && (
                      <p className="calc-hint">
                        리포머 {PRICING.equipment.pilatesSetThreshold}대 이상은 캐딜락·체어·바렐
                        세트가 함께 산정됩니다.
                      </p>
                    )}
                  </>
                )}

                {industry === "gym" && (
                  <p className="calc-hint" style={{ marginTop: 0, marginBottom: 16 }}>
                    {area}평 기준 유산소·머신·프리웨이트 구성이 자동 산출됩니다. 등급만
                    선택해주세요.
                  </p>
                )}

                {industry === "ptshop" && (
                  <>
                    <p className="calc-sub">랙 개수 (랙+덤벨+벤치+케이블 세트)</p>
                    <div className="calc-stepper">
                      <button
                        type="button"
                        className="calc-stepper-btn"
                        onClick={() => setRacks(Math.max(1, racks - 1))}
                        aria-label="랙 1세트 줄이기"
                      >
                        −
                      </button>
                      <div className="calc-stepper-val">{racks}세트</div>
                      <button
                        type="button"
                        className="calc-stepper-btn"
                        onClick={() => setRacks(racks + 1)}
                        aria-label="랙 1세트 늘리기"
                      >
                        +
                      </button>
                    </div>
                  </>
                )}

                {industry === "crossfit" && (
                  <>
                    <p className="calc-sub">리그 규모</p>
                    <div className="calc-choice3">
                      {RIG_LIST.map((it) => (
                        <button
                          key={it.key}
                          type="button"
                          className={`calc-card${rig === it.key ? " is-sel" : ""}`}
                          onClick={() => setRig(it.key)}
                        >
                          {it.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {(industry === "yoga" || industry === "barre") && (
                  <>
                    <p className="calc-sub">
                      소도구 구성{industry === "barre" ? " (바 설치·거울 포함)" : ""}
                    </p>
                    <div className="calc-choice2">
                      <button
                        type="button"
                        className={`calc-card${tools === "basic" ? " is-sel" : ""}`}
                        onClick={() => setTools("basic")}
                      >
                        기본
                      </button>
                      <button
                        type="button"
                        className={`calc-card${tools === "full" ? " is-sel" : ""}`}
                        onClick={() => setTools("full")}
                      >
                        충실
                      </button>
                    </div>
                    <p className="calc-hint">소도구는 전체 창업비용에서 차지하는 비중이 작습니다.</p>
                  </>
                )}

                {industry !== "yoga" && industry !== "barre" && (
                  <>
                    <p className="calc-sub">기구 등급</p>
                    <div className="calc-choice2">
                      <button
                        type="button"
                        className={`calc-card${eqGrade === "domestic" ? " is-sel" : ""}`}
                        onClick={() => setEqGrade("domestic")}
                      >
                        국산 브랜드
                      </button>
                      <button
                        type="button"
                        className={`calc-card${eqGrade === "imported" ? " is-sel" : ""}`}
                        onClick={() => setEqGrade("imported")}
                      >
                        수입 브랜드
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 5 && calc && (
              <div className="calc-stepview" key="s5">
                <h3 className="calc-q">
                  {industryLabel} {area}평, <em>예상 창업비용</em>입니다.
                </h3>

                {/* 일반 업계 견적 */}
                <p className="calc-sub">일반 업계 견적</p>
                <table className="calc-table">
                  <tbody>
                    <tr>
                      <td>인테리어 ({GRADE_LIST[grade!].label})</td>
                      <td>{fmtMan(calc.interior)}</td>
                    </tr>
                    <tr>
                      <td>기구</td>
                      <td>{fmtMan(calc.equipment)}</td>
                    </tr>
                    <tr>
                      <td>냉난방(시스템에어컨)</td>
                      <td>{fmtMan(calc.hvac)}</td>
                    </tr>
                    <tr>
                      <td>전기 증설</td>
                      <td>{fmtMan(calc.electric)}</td>
                    </tr>
                    {calc.shower > 0 && (
                      <tr>
                        <td>샤워실·락커룸</td>
                        <td>{fmtMan(calc.shower)}</td>
                      </tr>
                    )}
                    <tr>
                      <td>간판·사인물</td>
                      <td>{fmtMan(calc.signage)}</td>
                    </tr>
                    <tr>
                      <td>소방·인허가</td>
                      <td>{fmtMan(calc.fire)}</td>
                    </tr>
                    <tr>
                      <td>음향·CCTV·출입시스템</td>
                      <td>{fmtMan(calc.system)}</td>
                    </tr>
                    <tr>
                      <td>오픈 마케팅(프리세일)</td>
                      <td>{fmtMan(calc.marketing)}</td>
                    </tr>
                    <tr>
                      <td>예비 운영자금</td>
                      <td>{fmtMan(calc.reserve)}</td>
                    </tr>
                  </tbody>
                </table>
                <div className="calc-total">
                  <b>합계 (±10%)</b>
                  <strong>
                    {fmtMan(round100(calc.total * (1 - r)), false)} ~{" "}
                    {fmtMan(round100(calc.total * (1 + r)))}
                  </strong>
                </div>
                <p className="calc-hint">
                  예비 운영자금은 손익분기 도달 전 2~3개월 고정비 기준입니다.
                </p>

                {/* 더그로우 절감 */}
                <div className="calc-grow">
                  <p className="calc-grow-t">더그로우로 진행하면</p>
                  {[
                    {
                      label: "시공 중간마진 제거 (그로우인테리어 직영)",
                      amt: calc.cutInterior,
                    },
                    {
                      label: "기구 유통마진 절감 (직거래)",
                      amt: calc.cutEquipment,
                    },
                    {
                      label: "과잉 설계 제거 (운영 700회 데이터 기반)",
                      amt: calc.cutDesign,
                    },
                  ].map((it, i) => (
                    <div
                      key={it.label}
                      className="calc-cut"
                      style={{ "--calc-delay": `${0.2 + i * 0.4}s` } as React.CSSProperties}
                    >
                      <span className="calc-cut-label">{it.label}</span>
                      <span className="calc-cut-amt">−{fmtMan(it.amt)}</span>
                    </div>
                  ))}
                  <div className="calc-save">
                    <p>더그로우 진행 시</p>
                    <strong>
                      약 {fmtMan(round100(calc.saving * (1 - r)), false)} ~{" "}
                      {fmtMan(round100(calc.saving * (1 + r)))} 절감 가능
                    </strong>
                  </div>
                </div>

                <button type="button" className="calc-cta" onClick={goConsultForm}>
                  내 상권 기준 정확한 견적 받기
                </button>

                <p className="calc-note">
                  보증금·권리금은 지역·건물별 편차가 커 별도 상담으로 안내드립니다.
                  <br />본 계산은 업계 평균 단가 기반 추정치로 실제 견적과 다를 수 있습니다.
                </p>
              </div>
            )}
          </div>

          {/* 하단 내비게이션 */}
          {step < 5 && (
            <div className="calc-foot">
              {step > 1 && (
                <button type="button" className="calc-prev" onClick={() => setStep(step - 1)}>
                  이전
                </button>
              )}
              <button
                type="button"
                className="calc-next"
                disabled={nextDisabled}
                onClick={() => setStep(step + 1)}
              >
                {step === 4 ? "결과 보기" : "다음"}
              </button>
            </div>
          )}
          {step === 5 && (
            <div className="calc-foot">
              <button type="button" className="calc-prev" onClick={() => setStep(4)}>
                이전
              </button>
              <button type="button" className="calc-next" onClick={() => setStep(1)}>
                처음부터 다시 계산
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
