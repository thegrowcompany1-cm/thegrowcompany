"use client";

// /admin/ga 화면 공용 — 타입 · 포맷 · 스타일(ga- 접두사) · 작은 컴포넌트

import type { ReactNode } from "react";

export type ApiError = { ok: false; code: string; message: string };

export const num = (v: number) => v.toLocaleString("ko-KR");
export const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
/** 초 → 분:초 */
export const mmss = (sec: number) => {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

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

export function Empty({ children }: { children: ReactNode }) {
  return <p className="ga-empty">{children}</p>;
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
@media(max-width:860px){.ga-live{grid-template-columns:minmax(0,1fr)}.ga-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:560px){.ga-live-num{font-size:46px}.ga-kpi-v{font-size:24px}.ga-chart{height:240px}.ga-card{padding:16px}.ga-fbar{grid-template-columns:76px minmax(0,1fr) 54px;gap:8px}.ga-sess li button{grid-template-columns:minmax(0,1fr) auto}.ga-sess li button .ga-src{display:none}}
`;
