"use client";

// /admin/ga 화면 공용 — 타입 · 포맷 · 스타일(ga- 접두사) · 작은 컴포넌트

import type { ReactNode } from "react";

export type ApiError = { ok: false; code: string; message: string };

export const num = (v: number) => v.toLocaleString("ko-KR");
export const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
/** 초 → "1분 12초" (1분 미만은 "31초") */
export const mmss = (sec: number) => {
  const s = Math.max(0, Math.round(sec));
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}분 ${s % 60}초` : `${s}초`;
};

/** 직전 기간 대비 증감 배지 — 비율 지표는 %p, 나머지는 상대 % (좋으면 초록, 나쁘면 빨강, 0이면 회색) */
export function Delta({ cur, prev, kind, label = "이전 기간 대비" }: { cur: number; prev: number | undefined; kind: "rel" | "pp"; label?: string }) {
  if (prev === undefined) return null;
  if (kind === "pp") {
    const d = (cur - prev) * 100;
    const cls = Math.abs(d) < 0.05 ? "flat" : d > 0 ? "up" : "down";
    return (
      <span className={`ga-delta ${cls}`}>
        {cls === "flat" ? "– " : d > 0 ? "▲ " : "▼ "}
        {Math.abs(d).toFixed(1)}%p <small>{label}</small>
      </span>
    );
  }
  if (prev === 0) return <span className="ga-delta flat">– <small>이전 기간 0 (비교 불가)</small></span>;
  const d = ((cur - prev) / prev) * 100;
  const cls = Math.abs(d) < 0.05 ? "flat" : d > 0 ? "up" : "down";
  return (
    <span className={`ga-delta ${cls}`}>
      {cls === "flat" ? "– " : d > 0 ? "▲ " : "▼ "}
      {Math.abs(d).toFixed(1)}% <small>{label}</small>
    </span>
  );
}

export async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T | ApiError> {
  const res = await fetch(url, { cache: "no-store", signal });
  const data = (await res.json().catch(() => null)) as T | ApiError | null;
  if (data) return data;
  return { ok: false, code: "BAD_RESPONSE", message: `응답을 읽을 수 없습니다 (HTTP ${res.status})` };
}

export function ErrBox({ title, err }: { title: string; err: ApiError }) {
  return (
    <div className="ga-err" role="alert">
      <b>{title}</b>
      {err.message}
    </div>
  );
}

export function Skel({ h = 18 }: { h?: number }) {
  return <div className="ga-skel" style={{ height: h }} aria-hidden="true" />;
}

/** 표 상단 한 줄 자동 코멘트 */
export function Insight({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <p className="ga-insight" role="note">
      <span aria-hidden="true">💡</span> {text}
    </p>
  );
}

/** 빈 상태 — 아이콘 + 한 줄 안내 + 보조 설명 1줄 */
export function Empty({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <div className="ga-empty">
      <svg className="ga-empty-ic" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 12h4l2-6 4 12 2-6h6" />
      </svg>
      <p className="ga-empty-t">{children}</p>
      {hint && <p className="ga-empty-h">{hint}</p>}
    </div>
  );
}

export const GA_STYLE = `
.ga{color:#fff;font-family:inherit}
.ga *{box-sizing:border-box}
.ga-card{background:#141414;border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:20px}
.ga-card+.ga-card{margin-top:14px}
.ga-h{margin:0 0 14px;font-size:16px;font-weight:900}
.ga-sub{font-size:12px;color:#8b8b8b}
.ga-live{display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.4fr) minmax(0,1fr);gap:20px;align-items:start}
.ga-live>div{min-width:0}
.ga-live-num{display:flex;align-items:center;gap:12px;font-size:56px;font-weight:900;line-height:1;color:#22B573}
.ga-live-num small{font-size:14px;font-weight:700;color:#9a9a9a}
.ga-dot{width:12px;height:12px;border-radius:50%;background:#22B573;box-shadow:0 0 0 0 rgba(34,181,115,.6);animation:ga-pulse 1.6s ease-out infinite;flex:0 0 auto}
@keyframes ga-pulse{0%{box-shadow:0 0 0 0 rgba(34,181,115,.55)}70%{box-shadow:0 0 0 12px rgba(34,181,115,0)}100%{box-shadow:0 0 0 0 rgba(34,181,115,0)}}
@media(prefers-reduced-motion:reduce){.ga-dot{animation:none}}
.ga-list{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:minmax(0,1fr);gap:8px}
.ga-list li{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:13px;line-height:1.4}
.ga-list li span:first-child{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#d6d6d6}
.ga-list li b{flex:0 0 auto;font-weight:800;color:#22B573}
.ga-bar{height:8px;border-radius:8px;background:rgba(255,255,255,.08);overflow:hidden;margin-top:4px}
.ga-bar i{display:block;height:100%;background:#22B573;border-radius:8px}
.ga-dev{display:grid;grid-template-columns:minmax(0,1fr);gap:12px}
.ga-dev-row{font-size:13px}
.ga-dev-row div:first-child{display:flex;justify-content:space-between;color:#d6d6d6}
.ga-toolbar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;margin:28px 0 14px}
.ga-seg{display:inline-flex;border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:3px;gap:2px;max-width:100%;overflow-x:auto}
.ga-seg button{appearance:none;border:0;background:none;color:#a8a8a8;font:inherit;font-size:13px;font-weight:800;padding:8px 16px;border-radius:999px;cursor:pointer;min-height:36px;white-space:nowrap}
.ga-seg button[aria-pressed="true"]{background:#22B573;color:#fff}
.ga-tabs{display:flex;gap:4px;margin:26px 0 16px;border-bottom:1px solid rgba(255,255,255,.1);overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.ga-tabs::-webkit-scrollbar{display:none}
.ga-tabs button{appearance:none;border:0;background:none;color:#9a9a9a;font:inherit;font-size:14px;font-weight:800;padding:12px 16px;cursor:pointer;white-space:nowrap;border-bottom:2px solid transparent;margin-bottom:-1px}
.ga-tabs button[aria-selected="true"]{color:#fff;border-bottom-color:#22B573}
.ga-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.ga-kpi-l{font-size:12px;font-weight:700;color:#9a9a9a}
.ga-kpi-v{margin-top:8px;font-size:30px;font-weight:900;color:#22B573}
.ga-chart{height:300px}
.ga-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
.ga-table{width:100%;border-collapse:collapse;font-size:13px;min-width:560px}
.ga-table th,.ga-table td{padding:10px 12px;text-align:right;border-top:1px solid rgba(255,255,255,.08);white-space:nowrap}
.ga-table th:first-child,.ga-table td:first-child{text-align:left}
.ga-table thead th{border-top:0;color:#9a9a9a;font-weight:700;font-size:12px}
.ga-table td:first-child{max-width:320px;overflow:hidden;text-overflow:ellipsis}
.ga-table tr.is-opp td{background:rgba(250,204,21,.09)}
.ga-table tr.is-opp td:first-child{box-shadow:inset 3px 0 0 #FACC15}
.ga-sort{appearance:none;border:0;background:none;color:inherit;font:inherit;cursor:pointer;padding:0;display:inline-flex;align-items:center;gap:4px}
.ga-sort[aria-sort],.ga-sort.is-on{color:#fff}
.ga-note{margin:24px 0 8px;font-size:12px;line-height:1.7;color:#8b8b8b}
.ga-err{border:1px solid rgba(239,68,68,.4);background:rgba(239,68,68,.1);color:#fecaca;border-radius:12px;padding:14px 16px;font-size:13px;line-height:1.6}
.ga-err b{display:block;margin-bottom:2px;color:#fff}
.ga-skel{border-radius:8px;background:linear-gradient(90deg,rgba(255,255,255,.06),rgba(255,255,255,.14),rgba(255,255,255,.06));background-size:200% 100%;animation:ga-sk 1.2s linear infinite}
@keyframes ga-sk{to{background-position:-200% 0}}
@media(prefers-reduced-motion:reduce){.ga-skel{animation:none}}
.ga-empty{padding:28px 0;text-align:center;font-size:13px;color:#8b8b8b;margin:0}
.ga-insight{margin:0 0 14px;padding:10px 14px;border-radius:10px;background:rgba(34,181,115,.1);border:1px solid rgba(34,181,115,.25);font-size:13px;line-height:1.6;color:#d6f5e6}
.ga-badge{display:inline-block;padding:3px 10px;border-radius:999px;font-size:11.5px;font-weight:800;line-height:1.4}
.ga-badge.good{background:rgba(34,181,115,.2);color:#4ade80}
.ga-badge.mid{background:rgba(250,204,21,.18);color:#FACC15}
.ga-badge.bad{background:rgba(239,68,68,.22);color:#f87171}
.ga-badge.low{background:rgba(255,255,255,.08);color:#9a9a9a}
.ga-src{display:inline-block;padding:3px 10px;border-radius:999px;font-size:11.5px;font-weight:800;background:rgba(255,255,255,.1);color:#e5e5e5}
.ga-src.paid_meta{background:rgba(59,130,246,.22);color:#93c5fd}
.ga-src.organic_google,.ga-src.organic_naver,.ga-src.organic_other{background:rgba(34,181,115,.2);color:#4ade80}
.ga-src.ai{background:rgba(168,85,247,.22);color:#d8b4fe}
.ga-sess{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.ga-sess li button{appearance:none;width:100%;text-align:left;font:inherit;color:inherit;display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:center;padding:12px 14px;border:1px solid rgba(255,255,255,.1);border-radius:12px;background:rgba(255,255,255,.03);cursor:pointer}
.ga-sess li button[aria-pressed="true"]{border-color:#22B573;background:rgba(34,181,115,.08)}
.ga-sess-main{min-width:0}
.ga-sess-path{font-size:14px;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ga-sess-meta{margin-top:2px;font-size:12px;color:#9a9a9a}
.ga-sess-t{font-size:15px;font-weight:900;color:#22B573;font-variant-numeric:tabular-nums}
.ga-journey{margin:16px 0 0;padding:16px;border-radius:12px;background:rgba(255,255,255,.04)}
.ga-tl{list-style:none;margin:0;padding:0 0 0 18px;border-left:2px solid rgba(255,255,255,.15);display:grid;gap:14px}
.ga-tl li{position:relative;font-size:13px;line-height:1.6;color:#d6d6d6}
.ga-tl li::before{content:"";position:absolute;left:-25px;top:6px;width:10px;height:10px;border-radius:50%;background:#22B573}
.ga-tl li.is-end::before{background:#f87171}
.ga-tl li b{color:#fff}
.ga-fbars{display:grid;gap:10px}
.ga-fbar{display:grid;grid-template-columns:110px minmax(0,1fr) 64px;gap:12px;align-items:center;font-size:13px}
.ga-fbar-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#d6d6d6;font-weight:700}
.ga-fbar-track{height:22px;border-radius:8px;background:rgba(255,255,255,.07);overflow:hidden}
.ga-fbar-track i{display:block;height:100%;background:#22B573;border-radius:8px}
.ga-fbar.is-drop .ga-fbar-track i{background:#ef4444}
.ga-fbar.is-drop .ga-fbar-name,.ga-fbar.is-drop .ga-fbar-v{color:#f87171}
.ga-fbar-v{text-align:right;font-weight:800;font-variant-numeric:tabular-nums}
.ga-select{appearance:none;background:#0A0A0A;color:#fff;border:1px solid rgba(255,255,255,.2);border-radius:10px;padding:9px 12px;font:inherit;font-size:13px;max-width:100%}
.ga-row{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin:0 0 14px}
/* 기간 선택 */
.ga-range{position:relative;margin:0 0 6px}
.ga-presets{display:flex;flex-wrap:wrap;gap:6px}
.ga-presets button{appearance:none;border:1px solid rgba(255,255,255,.16);background:none;color:#b8b8b8;font:inherit;font-size:13px;font-weight:800;padding:8px 14px;border-radius:999px;cursor:pointer;min-height:36px;white-space:nowrap}
.ga-presets button[aria-pressed="true"]{background:#22B573;border-color:#22B573;color:#fff}
.ga-range-now{margin:10px 0 0;font-size:13px;font-weight:800;color:#e5e5e5}
.ga-range-now span{font-weight:600;color:#8b8b8b}
.ga-cal{position:absolute;z-index:40;left:0;top:calc(100% - 4px);margin-top:8px;padding:16px;border-radius:16px;background:#1a1a1a;border:1px solid rgba(255,255,255,.18);box-shadow:0 20px 50px rgba(0,0,0,.6);max-width:calc(100vw - 32px)}
.ga-cal .rdp-root{--rdp-accent-color:#22B573;--rdp-accent-background-color:rgba(34,181,115,.2);--rdp-day-height:40px;--rdp-day-width:40px;--rdp-day_button-height:38px;--rdp-day_button-width:38px;--rdp-range_middle-background-color:rgba(34,181,115,.2);--rdp-range_middle-color:#fff;--rdp-today-color:#4ade80;color:#fff;font-size:14px}
.ga-cal .rdp-chevron{fill:#fff}
.ga-cal .rdp-month_caption{color:#fff;font-weight:800}
.ga-cal .rdp-weekday{color:#8b8b8b;font-weight:700;font-size:12px}
.ga-cal .rdp-day_button:hover{background:rgba(255,255,255,.1)}
.ga-cal .rdp-disabled{opacity:.28}
.ga-cal-foot{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,.1)}
.ga-cal-info{font-size:13px;font-weight:700;color:#d6d6d6}
.ga-cal-info.is-bad{color:#f87171}
.ga-cal-btns{display:inline-flex;gap:8px}
.ga-cal-btns button{appearance:none;font:inherit;font-size:13px;font-weight:800;padding:9px 18px;border-radius:999px;border:1px solid rgba(255,255,255,.2);background:none;color:#fff;cursor:pointer;min-height:38px}
.ga-cal-btns button.is-primary{background:#22B573;border-color:#22B573}
.ga-cal-btns button:disabled{opacity:.4;cursor:not-allowed}
.ga-opts{display:flex;flex-wrap:wrap;align-items:center;gap:14px;margin:14px 0 4px}
.ga-check{display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:700;color:#d6d6d6;cursor:pointer}
.ga-check input{width:18px;height:18px;accent-color:#22B573;cursor:pointer}
.ga-delta{display:block;margin-top:4px;font-size:12px;font-weight:800}
.ga-delta.up{color:#4ade80}
.ga-delta.down{color:#f87171}
.ga-delta.flat{color:#9a9a9a}
.ga-delta small{font-weight:600;color:#8b8b8b}
/* 일별 보기 */
.ga-table tr.is-weekend td{background:rgba(255,255,255,.04)}
.ga-table tr.is-click{cursor:pointer}
.ga-table tr.is-click:hover td{background:rgba(34,181,115,.1)}
.ga-table tr.is-click:focus-visible{outline:2px solid #22B573;outline-offset:-2px}
.ga-dayname{font-weight:800;color:#fff}
.ga-dayname small{margin-left:4px;font-weight:600;color:#8b8b8b}
.ga-mix{display:flex;width:120px;height:10px;border-radius:6px;overflow:hidden;background:rgba(255,255,255,.08);margin-left:auto}
.ga-mix i{display:block;height:100%}
.ga-mix .m{background:#60a5fa}.ga-mix .o{background:#22B573}.ga-mix .a{background:#c084fc}.ga-mix .d{background:#fbbf24}.ga-mix .x{background:#9ca3af}
.ga-legend{display:flex;flex-wrap:wrap;gap:12px;margin:0 0 10px;font-size:12px;color:#b8b8b8}
.ga-legend span::before{content:"";display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:6px;vertical-align:-1px}
.ga-legend .m::before{background:#60a5fa}.ga-legend .o::before{background:#22B573}.ga-legend .a::before{background:#c084fc}.ga-legend .d::before{background:#fbbf24}.ga-legend .x::before{background:#9ca3af}
.ga-btn{appearance:none;font:inherit;font-size:13px;font-weight:800;padding:9px 16px;border-radius:999px;border:1px solid rgba(255,255,255,.2);background:none;color:#fff;cursor:pointer;min-height:38px}
.ga-btn:hover{border-color:#22B573;color:#4ade80}
.ga-notice{margin:0 0 14px;padding:10px 14px;border-radius:10px;background:rgba(250,204,21,.1);border:1px solid rgba(250,204,21,.3);font-size:13px;line-height:1.6;color:#fde68a}
@media(max-width:560px){.ga-presets button{padding:7px 12px;font-size:12.5px}.ga-cal{left:0;right:0;padding:12px}.ga-mix{width:84px}}
/* ── UI 개선: 타이포·카드 ── */
.ga{font-variant-numeric:tabular-nums}
.ga-card+.ga-card{margin-top:16px}
.ga-kpis+.ga-card,.ga-kpis{margin-bottom:16px}
.ga-h{display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 10px}
.ga-h .ga-sub{font-weight:500}
.ga-empty{display:flex;flex-direction:column;align-items:center;gap:6px;padding:30px 12px;text-align:center}
.ga-empty-ic{color:#4b4b4b;margin-bottom:2px}
.ga-empty-t{margin:0;font-size:14px;font-weight:700;color:#d0d0d0}
.ga-empty-h{margin:0;font-size:12px;color:#8b8b8b}
/* 고정 헤더 */
.ga-sticky{position:sticky;top:var(--ga-top,0px);z-index:30;margin:0 0 16px;padding:12px 0 0;background:#0a0a0a;border-bottom:1px solid rgba(255,255,255,.08);box-shadow:0 -2px 0 #0a0a0a;transition:box-shadow .15s}
.ga-sticky.is-stuck{box-shadow:0 -2px 0 #0a0a0a,0 8px 16px -6px rgba(0,0,0,.7)}
@media(prefers-reduced-motion:reduce){.ga-sticky{transition:none}}
.ga-sticky .ga-range{margin:0 0 4px}
.ga-tabbar{display:flex;align-items:center;gap:12px}
.ga-tabbar .ga-tabs{flex:1;min-width:0;margin:0;border-bottom:0}
.ga-period{flex:0 0 auto;font-size:12.5px;font-weight:700;color:#cfcfcf;white-space:nowrap}
.ga-period-m{display:none;margin:0;font-size:12.5px;font-weight:700;color:#cfcfcf}
.ga-tabs button{color:#8b8b8b}
/* 주간 리포트 본문 (마크다운) */
.ga-md{font-size:14px;line-height:1.75;color:#d6d6d6}
.ga-md-h{margin:26px 0 10px;padding-top:18px;border-top:1px solid rgba(255,255,255,.08);font-size:16px;font-weight:900;color:#fff}
.ga-md>.ga-md-h:first-child{margin-top:12px;padding-top:0;border-top:0}
.ga-md-h2{margin:16px 0 6px;font-size:14px;font-weight:800;color:#fff}
.ga-md-p{margin:0 0 10px}
.ga-md-list{margin:0 0 10px;padding-left:20px;display:grid;gap:6px}
.ga-md-quote{margin:0 0 10px;padding:8px 12px;border-left:3px solid #FACC15;background:rgba(250,204,21,.08);color:#fde68a;font-size:13px}
.ga-md b{color:#fff}
.ga-md code{padding:1px 6px;border-radius:6px;background:rgba(255,255,255,.1);font-size:12.5px}
.ga-md .ga-table-wrap{margin:0 0 12px}
/* 오늘 한눈에 */
.ga-strip{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}
.ga-sc{background:#141414;border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:14px;min-width:0}
.ga-sc-l{margin:0;font-size:12px;font-weight:700;color:#9a9a9a}
.ga-sc-v{margin:4px 0 0;font-size:24px;font-weight:900;line-height:1.15;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ga-sc-v small{margin-left:3px;font-size:13px;font-weight:700;color:#9a9a9a}
.ga-sc-v.is-live{color:#22B573}
.ga-sc .ga-delta{margin-top:4px}
.ga-sc-s{margin:4px 0 0;font-size:12px;color:#8b8b8b}
.ga-strip-note{margin:12px 0 16px;font-size:13px;line-height:1.6;color:#d6f5e6}
/* 표 공통 */
.ga-table-wrap{max-height:560px;overflow:auto}
.ga-table thead th{position:sticky;top:0;z-index:1;background:#141414;box-shadow:0 1px 0 rgba(255,255,255,.1)}
.ga-table tbody tr:hover td{background:rgba(255,255,255,.05)}
.ga-table tbody tr.is-opp:hover td{background:rgba(250,204,21,.14)}
/* 퍼널 */
.ga-fbar{grid-template-columns:110px minmax(0,1fr) 168px 64px}
.ga-fbar-track i{background:linear-gradient(90deg,#3f5a4d,#22B573)}
.ga-fbar.is-warn .ga-fbar-track i{background:#f59e0b}
.ga-fbar.is-drop .ga-fbar-track i{background:#ef4444}
.ga-fbar.is-warn .ga-fbar-d{color:#fbbf24}
.ga-fbar.is-drop .ga-fbar-d{color:#f87171}
.ga-fbar.is-warn .ga-fbar-name,.ga-fbar.is-warn .ga-fbar-v{color:#d6d6d6}
.ga-fbar.is-drop .ga-fbar-name,.ga-fbar.is-drop .ga-fbar-v{color:#f87171}
.ga-fbars.is-low .ga-fbar-track i{opacity:.4}
.ga-fbar-v{text-align:right;font-weight:700;color:#d6d6d6;white-space:nowrap}
.ga-fbar-d{text-align:right;font-weight:800;font-size:12.5px;color:#8b8b8b;white-space:nowrap}
.ga-fbar-r{display:contents}
.ga-warnbadge{display:inline-block;margin:0 0 12px;padding:5px 12px;border-radius:999px;background:rgba(250,204,21,.16);border:1px solid rgba(250,204,21,.35);color:#fde68a;font-size:12.5px;font-weight:800}
.ga-fsel{display:inline-flex;align-items:center;gap:10px;flex-wrap:wrap}
/* 실시간 세션 */
.ga-sess li button{grid-template-columns:auto minmax(0,1fr) auto}
.ga-sess li button.is-new{animation:ga-new 3s ease-out}
@keyframes ga-new{0%,70%{background:rgba(34,181,115,.22);border-color:#22B573}100%{background:rgba(255,255,255,.03)}}
@media(prefers-reduced-motion:reduce){.ga-sess li button.is-new{animation:none;border-color:#22B573}}
.ga-src.organic_google,.ga-src.organic_naver,.ga-src.organic_other{background:rgba(34,181,115,.2);color:#4ade80}
.ga-src.direct{background:rgba(156,163,175,.2);color:#d1d5db}
.ga-dev-ic{display:inline-flex;vertical-align:-3px;margin-right:4px;color:#9a9a9a}
@media(max-width:860px){.ga-live{grid-template-columns:minmax(0,1fr)}.ga-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.ga-strip{grid-template-columns:repeat(2,minmax(0,1fr))}.ga-strip .ga-sc:last-child{grid-column:1/-1}}
@media(max-width:560px){.ga-live-num{font-size:46px}.ga-kpi-v{font-size:24px}.ga-chart{height:240px}.ga-card{padding:16px}.ga-fbar{grid-template-columns:76px minmax(0,1fr) 54px;gap:8px}.ga-sess li button{grid-template-columns:minmax(0,1fr) auto}}
@media(max-width:560px){
.ga-presets{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}
.ga-presets::-webkit-scrollbar{display:none}
.ga-period{display:none}.ga-period-m{display:block}
.ga-sc-v{font-size:22px}
.ga-fbar{grid-template-columns:76px minmax(0,1fr);row-gap:2px}
.ga-fbar-r{display:flex;grid-column:1/-1;justify-content:space-between;gap:8px;padding-left:2px}
.ga-fbar-v,.ga-fbar-d{text-align:left}
.ga-sess li button{grid-template-columns:auto minmax(0,1fr) auto;gap:8px;padding:10px 12px}
.ga-table-wrap{max-height:none;overflow:visible}
.ga-table{min-width:0;display:block}
.ga-table thead{display:none}
.ga-table tbody{display:grid;gap:10px}
.ga-table tbody tr{display:block;padding:10px 12px;border:1px solid rgba(255,255,255,.1);border-radius:12px;background:rgba(255,255,255,.03)}
.ga-table td{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:5px 0;border:0;white-space:normal;text-align:right}
.ga-table td::before{content:attr(data-label);flex:0 0 auto;font-size:12px;font-weight:600;color:#8b8b8b}
.ga-table td:first-child{display:block;max-width:none;padding:0 0 6px;font-weight:800;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ga-table td:first-child::before{content:none}
.ga-table tbody tr:hover td{background:none}
.ga-table tr:not(.is-click):not([data-open="1"]) td:nth-child(n+5){display:none}
.ga-table tr:not(.is-click):has(td:nth-child(5))::after{content:"탭하여 자세히 보기";display:block;padding-top:6px;font-size:11.5px;font-weight:700;color:#22B573}
.ga-table tr[data-open="1"]:not(.is-click):has(td:nth-child(5))::after{content:"접기"}
.ga-table tr.is-weekend,.ga-table tr.is-weekend td{background:rgba(255,255,255,.06)}
.ga-mix{margin-left:0}
}
/* 기간 바 — 768px 미만: 한 줄 버튼 + 탭 가로 스크롤, 고정 영역 56px 이하 */
.ga-rbtn{display:none}
.ga-sheet-bg,.ga-sheet{display:none}
@media(max-width:767px){
.ga-sticky{display:flex;align-items:center;gap:8px;padding:6px 0}
.ga-sticky .ga-range{flex:0 0 auto;margin:0}
.ga-presets{display:none}
.ga-rbtn{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 12px;border:1px solid rgba(255,255,255,.2);border-radius:999px;background:none;color:#fff;font:inherit;font-size:13px;font-weight:800;white-space:nowrap;cursor:pointer}
.ga-tabbar{flex:1;min-width:0}
.ga-tabs button{padding:10px 12px;font-size:13.5px}
.ga-sheet-bg{display:flex;position:fixed;inset:0;z-index:70;align-items:flex-end;background:rgba(0,0,0,.6)}
.ga-sheet{display:block;width:100%;max-height:88vh;overflow-y:auto;padding:16px 16px calc(16px + env(safe-area-inset-bottom));border-radius:18px 18px 0 0;background:#1a1a1a;border-top:1px solid rgba(255,255,255,.18)}
.ga-sheet-head{display:flex;align-items:center;justify-content:space-between;margin:0 0 12px;font-size:15px}
.ga-sheet-head button{width:36px;height:36px;border:0;border-radius:50%;background:rgba(255,255,255,.1);color:#fff;font-size:20px;line-height:1;cursor:pointer}
.ga-sheet-presets{display:flex;flex-wrap:wrap;gap:8px}
.ga-sheet-presets button{appearance:none;border:1px solid rgba(255,255,255,.16);background:none;color:#b8b8b8;font:inherit;font-size:13px;font-weight:800;padding:8px 14px;border-radius:999px;cursor:pointer;min-height:38px}
.ga-sheet-presets button[aria-pressed="true"]{background:#22B573;border-color:#22B573;color:#fff}
.ga-sheet .ga-cal{position:static;margin:14px 0 0;padding:0;border:0;box-shadow:none;background:none;max-width:none}
}
`;
