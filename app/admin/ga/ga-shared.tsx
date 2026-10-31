"use client";

// /admin/ga 화면 공용 — 타입 · 포맷 · 스타일(ga- 접두사) · 작은 컴포넌트

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/** 탭 패널이 지금 보이는 탭인지 — 비활성 탭은 폴링·타이머를 멈춘다 */
const TabActiveContext = createContext(true);
export const useTabActive = () => useContext(TabActiveContext);

/**
 * 방문한 탭을 언마운트하지 않고 유지한다. 비활성 동안에는 마지막 요소를 그대로 돌려줘서
 * (같은 element 참조 → React 가 재렌더를 건너뜀) 부모가 바뀌어도 숨은 탭은 다시 그리지 않는다.
 */
export function KeepAlive({ active, children }: { active: boolean; children: ReactNode }) {
  // 활성일 때만 새 요소를 따라가고, 비활성이 되는 순간의 요소를 그대로 유지한다
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const shown = useMemo(() => children, [active ? children : null]);
  // 카드·막대 등장 애니메이션은 이 탭을 처음 연 직후 1초 동안만 (다시 열 때마다 반복하면 전환이 무거워진다)
  const [fresh, setFresh] = useState(true);
  useEffect(() => {
    if (!active || !fresh) return;
    const t = window.setTimeout(() => setFresh(false), 1000);
    return () => window.clearTimeout(t);
  }, [active, fresh]);
  return (
    <TabActiveContext.Provider value={active}>
      <div role="tabpanel" className={"ga-panel" + (fresh ? " is-fresh" : "")} hidden={!active}>
        {shown}
      </div>
    </TabActiveContext.Provider>
  );
}

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

export function Skel({ h = 18, w }: { h?: number; w?: number | string }) {
  return <div className="ga-skel" style={{ height: h, width: w }} aria-hidden="true" />;
}

/** 리포트가 처음 오기 전 자리표시 — 실제 카드·표와 비슷한 모양과 높이라 데이터가 와도 화면이 튀지 않는다 */
export function ReportSkeleton() {
  return (
    <div aria-busy="true" aria-label="불러오는 중" role="status">
      {[0, 1].map((k) => (
        <section className="ga-card" key={k}>
          <Skel h={18} w={k ? 140 : 190} />
          <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
            {Array.from({ length: k ? 3 : 6 }, (_, i) => (
              <Skel key={i} h={36} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/** 표의 핵심 수치 칸 — 같은 표 안의 최댓값 대비 길이를 배경 막대로 보여 준다 (값은 그대로, 막대는 보조 표현) */
export function BarNum({ value, max, sum, text }: { value: number; max: number; sum?: number; text?: string }) {
  const w = max > 0 && value > 0 ? Math.max(4, (value / max) * 100) : 0;
  // sum 을 주면 행에 마우스를 올리거나 행을 고를 때 "이 표 합계 대비 비중" 칩이 나타난다
  const share = sum && sum > 0 ? value / sum : null;
  return (
    <span className="ga-cb">
      <i style={{ width: `${w}%` }} aria-hidden="true" />
      {share !== null && (
        <em className="ga-cb-share" title="이 표 합계 대비 비중">
          {share > 0 && share < 0.01 ? "<1" : Math.round(share * 100)}%
        </em>
      )}
      <b>{text ?? num(value)}</b>
    </span>
  );
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
.ga-dot{position:relative;width:12px;height:12px;border-radius:50%;background:#22B573;flex:0 0 auto}
.ga-dot::after{content:"";position:absolute;inset:0;border-radius:50%;background:#22B573;opacity:.55;transform:scale(1);animation:ga-pulse 1.6s ease-out infinite;will-change:transform,opacity}
@keyframes ga-pulse{0%{transform:scale(1);opacity:.55}70%,100%{transform:scale(2.6);opacity:0}}
@media(prefers-reduced-motion:reduce){.ga-dot::after{animation:none;opacity:0}}
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
/* 탭 유지·이전 데이터 표시 */
.ga-panel{animation:ga-fade .18s ease-out}
/* 숨긴 탭은 display:none 대신 렌더 상태를 보존한 채 건너뛴다 (content-visibility:hidden) — 다시 열 때 레이아웃·스타일을 처음부터 계산하지 않는다.
   높이 0 으로 공간은 차지하지 않고, 안의 애니메이션은 멈춘다. */
.ga-panel[hidden]{display:block;height:0;margin:0;padding:0;overflow:hidden;content-visibility:hidden;contain-intrinsic-size:0 0}
.ga-panel[hidden] *,.ga-panel[hidden] *::before,.ga-panel[hidden] *::after{animation-play-state:paused!important}
@keyframes ga-fade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.ga-tabs{position:relative}
.ga-tabs button[aria-selected="true"]{border-bottom-color:transparent}
.ga-tab-ind{position:absolute;left:0;bottom:-1px;height:2px;width:0;background:#22B573;opacity:0;pointer-events:none;transition:transform .28s cubic-bezier(.22,1,.36,1),width .28s cubic-bezier(.22,1,.36,1)}
.ga-progress{position:absolute;left:0;right:0;bottom:-1px;height:2px;overflow:hidden;opacity:0;transition:opacity .15s;pointer-events:none}
.ga-progress.is-on{opacity:1}
.ga-progress::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,#22B573,transparent);transform:translateX(-100%)}
.ga-progress.is-on::after{animation:ga-prog 1.1s ease-in-out infinite}
@keyframes ga-prog{to{transform:translateX(100%)}}
.ga-stale{margin:0 0 14px;padding:9px 14px;border-radius:10px;background:rgba(34,181,115,.08);border:1px solid rgba(34,181,115,.25);font-size:13px;line-height:1.6;color:#bfeed6}
.ga-data{transition:opacity .2s}
.ga-data.is-stale{opacity:.55}
@media(prefers-reduced-motion:reduce){.ga-panel{animation:none}.ga-tab-ind{transition:none}.ga-progress::after{animation:none;transform:none;opacity:.6}}
/* SVG 추이 차트 */
.ga-tc{position:relative;touch-action:pan-y}
.ga-tc svg{display:block;overflow:visible;outline:none}
.ga-tc svg:focus-visible{outline:2px solid #22B573;outline-offset:2px;border-radius:6px}
.ga-tc-t{fill:#777;font-size:11px}
.ga-tc-line{stroke-dasharray:1;stroke-dashoffset:0;animation:ga-draw .8s cubic-bezier(.22,1,.36,1) both}
.ga-tc-area,.ga-tc-part{animation:ga-fade-in .6s ease-out both}
@keyframes ga-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes ga-fade-in{from{opacity:0}to{opacity:1}}
.ga-tc-tip{position:absolute;z-index:2;min-width:120px;padding:8px 12px;border-radius:10px;background:#1c1c1c;border:1px solid rgba(255,255,255,.15);font-size:12px;pointer-events:none;white-space:nowrap}
.ga-tc-legend{display:flex;justify-content:center;gap:16px;margin-top:8px;font-size:12px;color:#b8b8b8}
.ga-tc-legend span{display:inline-flex;align-items:center;gap:6px}
.ga-tc-legend i{width:10px;height:10px;border-radius:3px;display:inline-block}
@media(prefers-reduced-motion:reduce){.ga-tc-line,.ga-tc-area,.ga-tc-part{animation:none}}
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
/* ═══ 프리미엄 디자인 (Kerfa 참고 · 더그로우 블랙/그린) — 애니메이션은 transform·opacity 만 ═══ */
.ga{--ga-ease:cubic-bezier(.22,1,.36,1);--ga-line:rgba(255,255,255,.08)}
@keyframes ga-rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes ga-grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes ga-shim{to{transform:translateX(100%)}}
@keyframes ga-panel-in{from{opacity:0}to{opacity:1}}
/* 카드 */
.ga-card{position:relative;padding:22px;border-radius:18px;border:1px solid var(--ga-line);background:linear-gradient(180deg,#181818,#131313);transition:border-color .2s}
.ga-panel.is-fresh .ga-card{animation:ga-rise .38s var(--ga-ease) both}
.ga-panel.is-fresh .ga-card:nth-child(2){animation-delay:.04s}.ga-panel.is-fresh .ga-card:nth-child(3){animation-delay:.08s}.ga-panel.is-fresh .ga-card:nth-child(n+4){animation-delay:.12s}
.ga-h{font-size:17px;letter-spacing:-.01em}
.ga-panel{animation-name:ga-panel-in;animation-duration:.16s}
/* KPI 카드 */
.ga-strip{gap:14px}
.ga-sc{position:relative;overflow:hidden;padding:18px 18px 16px;border-radius:18px;border:1px solid var(--ga-line);background:linear-gradient(180deg,#191919,#121212);transition:transform .25s var(--ga-ease),border-color .25s;animation:ga-rise .45s var(--ga-ease) both;animation-delay:calc(var(--i,0)*55ms)}
.ga-sc::before{content:"";position:absolute;inset:0;border-radius:inherit;background:radial-gradient(120% 90% at 50% 0%,rgba(34,181,115,.16),transparent 62%);opacity:0;transition:opacity .25s;pointer-events:none}
.ga-sc>*{position:relative}
.ga-sc.is-live{border-color:rgba(34,181,115,.3);background:linear-gradient(160deg,rgba(34,181,115,.18),#121212 64%)}
@media(hover:hover){.ga-sc:hover{transform:translateY(-3px);border-color:rgba(34,181,115,.45)}.ga-sc:hover::before{opacity:1}.ga-card:hover{border-color:rgba(255,255,255,.16)}}
.ga-sc-l{display:flex;align-items:center;gap:8px;font-size:12.5px;font-weight:700;color:#a3a3a3}
.ga-sc-v{margin-top:10px;font-size:30px;font-weight:900;letter-spacing:-.025em;line-height:1.1}
.ga-sc:nth-child(5) .ga-sc-v{font-size:26px}
.ga-sc-v small{font-size:13px;letter-spacing:0}
.ga-sc-s{margin-top:8px;font-size:12px}
.ga-dot-s{flex:0 0 auto;width:8px;height:8px;border-radius:50%;background:#22B573;box-shadow:0 0 0 3px rgba(34,181,115,.22)}
.ga-spark{display:block;width:100%;height:34px;margin-top:14px;overflow:visible}
.ga-spark-empty{margin-top:14px}
.ga-sc-split{display:flex;gap:2px;height:8px;margin-top:16px;border-radius:6px;overflow:hidden;background:rgba(255,255,255,.07)}
.ga-sc-split i{display:block;height:100%;transform-origin:left;animation:ga-grow .8s var(--ga-ease) both}
.ga-sc-split .m{background:#60a5fa}.ga-sc-split .o{background:#22B573}
.ga-sc-skel{display:inline-block;height:30px;vertical-align:middle;border-radius:8px}
.ga-strip-wrap{transition:opacity .2s}
.ga-strip-wrap.is-stale{opacity:.6}
.ga-strip-note{padding:10px 14px;border-radius:12px;background:rgba(34,181,115,.08);border:1px solid rgba(34,181,115,.18)}
/* 증감 배지 */
.ga-delta{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:999px;font-size:12px;font-weight:800}
.ga-delta.up{background:rgba(74,222,128,.13)}.ga-delta.down{background:rgba(248,113,113,.13)}.ga-delta.flat{background:rgba(255,255,255,.07)}
.ga-sc .ga-delta{margin-top:10px}
/* 세그먼트 탭 */
.ga-tabbar .ga-tabs{flex:0 1 auto;min-width:0;padding:4px;gap:2px;border-radius:999px;background:rgba(255,255,255,.05);box-shadow:inset 0 0 0 1px rgba(255,255,255,.06)}
.ga-tabs button{position:relative;z-index:1;margin:0;padding:9px 16px;border:0;border-radius:999px;font-size:13.5px;color:#9a9a9a;transition:color .2s}
.ga-tabs button:hover{color:#e5e5e5}
.ga-tabs button[aria-selected="true"]{color:#fff;border:0}
.ga-tab-ind{top:4px;bottom:4px;height:auto;border-radius:999px;background:rgba(34,181,115,.2);box-shadow:inset 0 0 0 1px rgba(34,181,115,.5)}
.ga-tabbar .ga-period{margin-left:auto}
.ga-presets button{background:rgba(255,255,255,.03);border-color:rgba(255,255,255,.1);transition:background-color .15s,border-color .15s,color .15s}
.ga-presets button:hover{border-color:rgba(34,181,115,.5);color:#fff}
.ga-presets button[aria-pressed="true"]{background:#22B573;border-color:#22B573;color:#fff}
/* 스켈레톤 (shimmer 는 transform 으로 — 리페인트 없음) */
.ga-sr{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.ga-skel{position:relative;overflow:hidden;background:rgba(255,255,255,.06);animation:none}
.ga-skel::after{content:"";position:absolute;inset:0;transform:translateX(-100%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent);animation:ga-shim 1.4s ease-in-out infinite}
/* 막대 */
.ga-bar{height:8px}
.ga-bar i{background:linear-gradient(90deg,#1b9a62,#34d696)}
.ga-bar i,.ga-fbar-track i{transform-origin:left;transition:width .45s var(--ga-ease)}
.ga-panel.is-fresh .ga-bar i,.ga-panel.is-fresh .ga-fbar-track i{animation:ga-grow .8s var(--ga-ease) both}
.ga-live-num{font-size:64px;letter-spacing:-.03em;text-shadow:0 0 40px rgba(34,181,115,.28)}
.ga-table tbody tr{transition:background-color .15s}
.ga-sess li button{transition:border-color .2s,background-color .2s,transform .2s var(--ga-ease)}
@media(hover:hover){.ga-sess li button:hover{border-color:rgba(34,181,115,.5);transform:translateX(2px)}}
@media(max-width:860px){.ga-sc:nth-child(5) .ga-sc-v{font-size:26px}}
@media(max-width:767px){.ga-tabbar .ga-tabs{flex:1}.ga-tabs button{padding:9px 12px;font-size:13px}}
@media(max-width:560px){.ga-sc{padding:14px}.ga-sc-v,.ga-sc:nth-child(5) .ga-sc-v{font-size:24px}.ga-live-num{font-size:48px}.ga-card{padding:16px}}
@media(prefers-reduced-motion:reduce){.ga-panel.is-fresh .ga-card,.ga-sc,.ga-panel,.ga-sc-split i,.ga-panel.is-fresh .ga-bar i,.ga-panel.is-fresh .ga-fbar-track i{animation:none}.ga-sc,.ga-sc::before,.ga-strip-wrap{transition:none}.ga-skel::after{animation:none}}
/* ═══ 디자인 보정 v2 — KPI 카드 통일 · 스파크라인 · 모바일 세션 · 탭 내비 · 테이블 (색 전환만, 무한 애니메이션 없음) ═══ */
/* KPI 카드: 값 → 보조 정보 → 하단 시각 요소(그래프 + 캡션)를 카드 맨 아래에 맞춘다 */
.ga-sc{display:flex;flex-direction:column}
.ga-sc-viz{margin-top:auto;padding-top:14px}
.ga-sc-g{height:34px;display:flex;align-items:center}
.ga-sc-g>*{width:100%}
.ga-sc-cap{display:flex;flex-wrap:wrap;gap:2px 12px;min-height:16px;margin:6px 0 0;font-size:11.5px;line-height:1.4;color:#8b8b8b}
.ga-sc-cap span{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
.ga-sc-dot{display:inline-block;width:7px;height:7px;border-radius:50%}
.ga-sc-split{height:10px;margin-top:0;border-radius:6px}
.ga-sc .ga-delta{align-self:flex-start}
/* 스파크라인: 선·면은 늘어나는 SVG, 끝점은 비율 좌표의 점 */
.ga-spark{position:relative;display:block;width:100%;height:34px;margin:0}
.ga-spark svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.ga-spark svg{animation:ga-reveal .7s cubic-bezier(.22,1,.36,1) both}
@keyframes ga-reveal{from{clip-path:inset(-6px 100% -6px -6px)}to{clip-path:inset(-6px -6px -6px -6px)}}
.ga-spark-empty{height:34px}
.ga-spark-dot{position:absolute;width:7px;height:7px;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 0 0 2.5px #151515;animation:ga-fade-in .25s ease-out .6s both}
/* 모바일 포함 실시간 세션: 한 줄(유입·경로·체류 시간) + 보조 정보 칩 */
.ga-sess li button{display:grid;grid-template-columns:minmax(0,1fr);gap:8px;padding:12px 14px;border-radius:14px}
.ga-sess-top{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:10px;min-width:0}
.ga-sess-path{min-width:0;font-size:14px;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ga-sess-t{font-size:15px;font-weight:900;color:#22B573;font-variant-numeric:tabular-nums;white-space:nowrap}
.ga-sess-chips{display:flex;flex-wrap:wrap;gap:6px}
.ga-chip{display:inline-flex;align-items:center;gap:5px;max-width:100%;padding:3px 9px;border-radius:999px;background:rgba(255,255,255,.06);font-size:11.5px;font-weight:600;color:#b4b4b4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ga-chip.is-sec{background:rgba(34,181,115,.1);color:#9be3c0}
.ga-chip .ga-dev-ic{margin:0;vertical-align:0;color:inherit}
/* 셀렉트 */
.ga-select{appearance:none;-webkit-appearance:none;padding:9px 34px 9px 14px;border:1px solid rgba(255,255,255,.14);border-radius:999px;background:#171717 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M2.5 4.5L6 8l3.5-3.5' fill='none' stroke='%23a3a3a3' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat right 12px center/12px;font-weight:700;cursor:pointer;transition:border-color .15s}
.ga-select:hover{border-color:rgba(34,181,115,.5)}
.ga-select:focus-visible{outline:2px solid #22B573;outline-offset:2px}
.ga-select option{background:#1a1a1a;color:#fff}
/* 표 */
.ga-table-wrap{border:1px solid var(--ga-line);border-radius:14px;background:#131313;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.18) transparent}
.ga-table{border-collapse:separate;border-spacing:0;font-size:13.5px}
.ga-table thead th{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.1);background:#161616;box-shadow:none;font-size:11.5px;font-weight:700;letter-spacing:.03em;color:#8a8a8a}
.ga-table tbody td{padding:13px 14px;border-top:0;border-bottom:1px solid rgba(255,255,255,.055);color:#cdcdcd;font-variant-numeric:tabular-nums}
.ga-table tbody tr:last-child td{border-bottom:0}
.ga-table tbody td:first-child{color:#fff;font-weight:700}
.ga-table tbody td.is-key{color:#fff;font-weight:800;font-size:14.5px}
.ga-table tbody tr:hover td{background:rgba(34,181,115,.06)}
.ga-table tbody tr:hover td:first-child{box-shadow:inset 3px 0 0 #22B573}
.ga-table tbody tr.is-opp td{background:rgba(250,204,21,.07)}
.ga-table tbody tr.is-opp td:first-child,.ga-table tbody tr.is-opp:hover td:first-child{box-shadow:inset 3px 0 0 #FACC15}
.ga-table tbody tr.is-opp:hover td{background:rgba(250,204,21,.12)}
.ga-table tbody tr.is-weekend td{background:rgba(255,255,255,.025)}
.ga-table tbody tr.is-click:hover td{background:rgba(34,181,115,.08)}
.ga-table .ga-delta{padding:1px 7px;font-size:11.5px}
.ga-cb{position:relative;display:inline-flex;align-items:center;justify-content:flex-end;min-width:104px;height:26px;padding:0 8px}
.ga-cb i{position:absolute;right:0;top:3px;bottom:3px;border-radius:5px;background:linear-gradient(90deg,rgba(34,181,115,.05),rgba(34,181,115,.26))}
.ga-cb b{position:relative;font-weight:inherit}
.ga-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 11px}
.ga-badge::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor}
.ga-rank{display:inline-block;min-width:52px;padding:3px 10px;border-radius:999px;font-size:12.5px;font-weight:800;text-align:center}
.ga-rank.top{background:rgba(34,181,115,.18);color:#4ade80}
.ga-rank.mid{background:rgba(96,165,250,.14);color:#93c5fd}
.ga-rank.low{background:rgba(255,255,255,.06);color:#a3a3a3}
@media(max-width:767px){
.ga-tabbar .ga-tabs{overflow-x:auto;scrollbar-width:none;overscroll-behavior-x:contain;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 var(--fl,0px),#000 calc(100% - var(--fr,0px)),transparent 100%);mask-image:linear-gradient(90deg,transparent 0,#000 var(--fl,0px),#000 calc(100% - var(--fr,0px)),transparent 100%)}
.ga-tabs button{min-height:40px;padding:10px 14px;-webkit-tap-highlight-color:transparent}
}
@media(max-width:560px){
.ga-sess li button{gap:7px;padding:11px 12px}
.ga-sess-top{gap:8px}
.ga-sess-path{font-size:13.5px}
.ga-chip{padding:3px 8px;font-size:11px}
.ga-table-wrap{border:0;border-radius:0;background:none}
.ga-table tbody{gap:10px}
.ga-table tbody tr{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2px 12px;padding:14px;border-radius:14px;background:linear-gradient(180deg,#181818,#131313)}
.ga-table tbody td,.ga-table tbody tr:hover td{flex-direction:column;align-items:flex-start;justify-content:flex-start;gap:2px;padding:8px 0 0;border:0;background:none;text-align:left;white-space:normal;font-size:13.5px}
.ga-table tbody td::before{font-size:11px;font-weight:600;color:#7c7c7c}
.ga-table tbody td:first-child{grid-column:1/-1;display:block;max-width:none;padding:0 0 4px;font-size:14.5px;box-shadow:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ga-table tbody tr:hover td:first-child{box-shadow:none}
.ga-table tbody td.is-key{font-size:15px}
.ga-cb{justify-content:flex-start;min-width:0;height:auto;padding:0}
.ga-cb i{display:none}
.ga-table tr:not(.is-click):has(td:nth-child(5))::after{grid-column:1/-1}
}
@media(prefers-reduced-motion:reduce){.ga-spark-dot,.ga-spark svg{animation:none}.ga-select,.ga-table tbody td{transition:none}}
/* ═══ 인터랙션 v3 — 사용자 행동(호버·탭·선택)과 데이터 변화에 반응하는 움직임. 무한 애니메이션 없음, transform/opacity 위주 ═══ */
/* KPI 카드: 호버 상승 + 깊이 그림자 + 커서를 따라가는 스포트라이트, 누르면 눌림 */
.ga-sc{overflow:visible;transition:transform .28s var(--ga-ease),border-color .25s}
/* 등장 애니메이션이 끝난 뒤에는 호버·눌림 변환이 적용되도록 끝 상태를 붙잡지 않는다 (fill-mode: both 는 transform:none 을 고정해 호버를 덮어씀) */
.ga-sc{animation-fill-mode:backwards}
.ga-sc::before{background:radial-gradient(240px circle at var(--mx,50%) var(--my,0%),rgba(34,181,115,.2),transparent 70%)}
.ga-sc::after{content:"";position:absolute;inset:0;border-radius:inherit;box-shadow:0 24px 44px -18px rgba(0,0,0,.8),0 0 0 1px rgba(34,181,115,.3);opacity:0;transition:opacity .28s;pointer-events:none}
@media(hover:hover){.ga-sc:hover{z-index:2;transform:translateY(-4px)}.ga-sc:hover::after{opacity:1}}
.ga-sc:active{transform:translateY(-1px) scale(.992);transition-duration:.12s}
/* 스파크라인 인터랙션 (호버·탭) */
.ga-spark{touch-action:pan-y;cursor:crosshair}
.ga-spark.is-hi .ga-spark-dot{opacity:.3}
.ga-spark-guide{position:absolute;top:-3px;bottom:-3px;width:1px;background:rgba(255,255,255,.3);pointer-events:none}
.ga-spark-pt{position:absolute;width:9px;height:9px;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 0 0 3px #151515;pointer-events:none;transition:left .08s linear,top .08s linear}
.ga-spark-tip{position:absolute;bottom:calc(100% + 10px);z-index:3;display:flex;flex-direction:column;align-items:center;gap:1px;padding:5px 10px;border-radius:9px;border:1px solid rgba(255,255,255,.14);background:#1f1f1f;font-size:12px;white-space:nowrap;pointer-events:none;transform:translateX(-50%);animation:ga-fade-in .12s ease-out both}
.ga-spark-tip.is-l{transform:translateX(-12%)}
.ga-spark-tip.is-r{transform:translateX(-88%)}
.ga-spark-tip small{font-size:10.5px;color:#9a9a9a}
.ga-spark-tip b{font-weight:800}
/* 진입: KPI → 카드 → 차트 선·면이 시차를 두고 */
.ga-panel.is-fresh .ga-card:nth-child(2){animation-delay:.1s}
.ga-panel.is-fresh .ga-card:nth-child(3){animation-delay:.2s}
.ga-panel.is-fresh .ga-card:nth-child(n+4){animation-delay:.3s}
.ga-tc-line{animation:ga-draw .9s cubic-bezier(.22,1,.36,1) .3s both}
.ga-tc-area,.ga-tc-part{animation:ga-fade-in .7s ease-out .55s both}
.ga-spark svg{animation:ga-reveal .7s cubic-bezier(.22,1,.36,1) .2s both}
/* 탭 전환: 새 본문이 이동 방향에서 밀려 들어온다 (방향은 --ga-dx 로 전달) */
@keyframes ga-panel-in{from{opacity:0;transform:translateX(var(--ga-dx,0px))}to{opacity:1;transform:none}}
.ga-panel{animation-duration:.28s;animation-timing-function:var(--ga-ease)}
/* 차트: 가이드선·점·툴팁이 부드럽게 따라 움직이고, 고정(핀) 툴팁에는 하루만 보기 버튼 */
.ga-tc svg{cursor:crosshair}
.ga-tc-ov{position:absolute;inset:0;pointer-events:none}
.ga-tc-guide{position:absolute;left:0;width:0;border-left:1px solid rgba(255,255,255,.3);will-change:transform}
.ga-tc-guide.is-pin{border-left-color:rgba(34,181,115,.8)}
.ga-tc-guide.is-dash{border-left-style:dashed}
.ga-tc-dot{position:absolute;left:0;top:0;width:9px;height:9px;margin:-4.5px 0 0 -4.5px;border-radius:50%;box-shadow:0 0 0 2px #141414,0 0 0 7px var(--c);will-change:transform}
.ga-tc-glide{transition:transform .14s cubic-bezier(.22,1,.36,1)}
.ga-tc-fade{animation:ga-fade-in .3s ease-out both}
.ga-tc-tip{left:0;top:0;transition:transform .14s cubic-bezier(.22,1,.36,1)}
.ga-tc-tip.is-pin{pointer-events:auto;border-color:rgba(34,181,115,.55)}
.ga-tc-tip-h{display:flex;align-items:center;gap:6px;margin:0 0 4px;color:#fff;font-weight:800}
.ga-tc-pin{font-size:11px}
.ga-tc-tip-r{display:flex;align-items:baseline;gap:6px;margin:3px 0 0}
.ga-tc-tip-r b{font-weight:800}
.ga-tc-d{padding:1px 6px;border-radius:999px;font-size:11px;font-style:normal;font-weight:800}
.ga-tc-d.up{background:rgba(74,222,128,.13);color:#4ade80}
.ga-tc-d.down{background:rgba(248,113,113,.13);color:#f87171}
.ga-tc-d.flat{background:rgba(255,255,255,.07);color:#9a9a9a}
.ga-tc-tip-f{margin:6px 0 0;font-size:10.5px;color:#8b8b8b}
.ga-tc-go{width:100%;margin-top:8px;padding:6px 10px;border:1px solid rgba(34,181,115,.5);border-radius:8px;background:rgba(34,181,115,.14);color:#bff1d8;font:inherit;font-size:12px;font-weight:800;cursor:pointer;transition:background-color .15s}
.ga-tc-go:hover{background:rgba(34,181,115,.26)}
/* 표: 행 호버·선택·연동 상태 */
.ga-table tbody tr.is-selected td,.ga-table tbody tr[data-sel="1"] td{background:rgba(34,181,115,.1)}
.ga-table tbody tr.is-selected td:first-child,.ga-table tbody tr[data-sel="1"] td:first-child{box-shadow:inset 3px 0 0 #22B573}
.ga-table tbody tr.is-linked td{background:rgba(34,181,115,.075)}
.ga-table tbody tr.is-link,.ga-table tbody tr.is-click{cursor:pointer}
.ga-table tbody tr.is-link:focus-visible,.ga-table tbody tr.is-click:focus-visible{outline:2px solid #22B573;outline-offset:-2px}
.ga-rowhint{display:inline-block;margin-left:10px;padding:2px 8px;border-radius:999px;background:rgba(34,181,115,.14);color:#9be3c0;font-size:11px;font-weight:700;white-space:nowrap;opacity:0;transform:translateX(-4px);transition:opacity .15s,transform .15s}
.ga-table tbody tr:hover .ga-rowhint,.ga-table tbody tr:focus-visible .ga-rowhint,.ga-table tbody tr.is-selected .ga-rowhint{opacity:1;transform:none}
@media(hover:none){.ga-rowhint{opacity:.85;transform:none}}
.ga-cb-share{position:relative;margin-right:8px;font-size:11px;font-style:normal;font-weight:700;color:#7be0b0;opacity:0;transform:translateX(6px);transition:opacity .15s,transform .15s}
.ga-table tbody tr:hover .ga-cb-share,.ga-table tbody tr.is-selected .ga-cb-share,.ga-table tbody tr[data-sel="1"] .ga-cb-share{opacity:1;transform:none}
/* 랜딩 섹션 퍼널: 구간 선택 → 강조·흐림, 상세 줄 */
.ga-fbar{padding:6px 8px;margin:0 -8px;border-radius:10px;cursor:pointer;outline:none;transition:opacity .2s,background-color .2s,box-shadow .2s}
@media(hover:hover){.ga-fbar:hover{background:rgba(255,255,255,.045)}}
.ga-fbar:focus-visible{outline:2px solid #22B573;outline-offset:1px}
.ga-fbars.has-sel .ga-fbar:not(.is-sel){opacity:.4}
.ga-fbar.is-sel{background:rgba(34,181,115,.09);box-shadow:inset 0 0 0 1px rgba(34,181,115,.45)}
.ga-fbar.is-sel.is-drop{background:rgba(239,68,68,.08);box-shadow:inset 0 0 0 1px rgba(239,68,68,.5)}
.ga-fdetail{margin:14px 0 6px;padding:14px 16px;border:1px solid rgba(34,181,115,.3);border-radius:14px;background:linear-gradient(180deg,rgba(34,181,115,.1),rgba(34,181,115,.03));animation:ga-rise .28s var(--ga-ease) both}
.ga-fd-t{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.ga-fd-t b{font-size:15px}
.ga-fd-t span{font-size:12px;color:#8b8b8b}
.ga-fd-x{width:28px;height:28px;margin-left:auto;border:0;border-radius:50%;background:rgba(255,255,255,.08);color:#fff;font-size:16px;line-height:1;cursor:pointer}
.ga-fd-g{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.ga-fd-g>div{display:flex;flex-direction:column;gap:2px;min-width:0}
.ga-fd-g small{font-size:11px;color:#8b8b8b}
.ga-fd-g b{font-size:18px;font-weight:900;font-variant-numeric:tabular-nums}
.ga-fd-g i{font-size:12px;font-style:normal;font-weight:700;color:#9be3c0}
@media(max-width:560px){.ga-fd-g{grid-template-columns:repeat(2,minmax(0,1fr))}.ga-rowhint{margin-left:6px}}
@media(prefers-reduced-motion:reduce){.ga-sc,.ga-tc-glide,.ga-tc-tip,.ga-fbar,.ga-rowhint,.ga-cb-share{transition:none}.ga-sc:hover,.ga-sc:active{transform:none}.ga-fdetail,.ga-tc-fade,.ga-spark-tip,.ga-tc-line,.ga-tc-area,.ga-tc-part,.ga-spark svg{animation:none}.ga-panel{animation:none}}
`;
