"use client";

// 일별 추이 차트 (SVG 직접 구현) — Recharts 를 대체한다. 번들 약 15KB, 라이브러리 없음.
//  · 지표 선택 5종, y 축 0 시작, 가로 격자, x 축 날짜(MM-DD), 범례, 툴팁(원본 값), 오늘 "집계 중" 표시는 기존 차트와 같다.
//  · 확정된 날은 실선(단조 곡선), 어제→오늘 구간은 점선, 오늘 값은 속 빈 점. 오늘 값이 y 축 범위에는 들어가지만 실선에는 섞이지 않는다.
//  · 호버·터치·키보드(←/→)로 값을 본다. 선 그리기 애니메이션은 지표를 바꿀 때만 돌고 transform/opacity·dash 만 쓴다.
//  · 정적 레이어(선·축)는 메모해 두고 호버 때는 가이드선·점·툴팁만 다시 그린다.
//  · 기간·데이터가 바뀌면 이전 곡선이 새 곡선으로 보간 이동한다 (경로 속성만 프레임마다 갱신 — React 렌더 없음).
//  · 클릭/탭(Enter)으로 날짜를 고정하고 일별 표와 연동한다 (표 행 호버 → 차트 점 강조, 차트 고정 → 표 행 강조).

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { ReportPayload } from "@/lib/gaTypes";
import { todayKst } from "@/lib/gaRange";
import { linearPath, monotonePath, nearestIndex, niceTicks, segments, xTickIndexes, type Pt } from "./ga-chart-math";
import { num, pct } from "./ga-shared";

type ChartMetric = "both" | "users" | "sessions" | "engagementRate" | "keyEvents";
const CHART_OPTIONS: { key: ChartMetric; label: string }[] = [
  { key: "both", label: "사용자 · 세션" },
  { key: "users", label: "사용자" },
  { key: "sessions", label: "세션" },
  { key: "engagementRate", label: "참여율" },
  { key: "keyEvents", label: "키 이벤트" },
];
type Raw = { users: number; sessions: number; engagementRate: number; keyEvents: number };
type Line = { key: keyof Raw; name: string; color: string };

const PAD_T = 12, PAD_R = 22, PAD_B = 26;
const fin = (v: number | undefined) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
/** 이전 곡선(점 목록)을 비율 위치 u(0~1)에서 읽은 y 값 — 점 개수가 달라도 보간할 수 있다 */
function yAt(prev: Pt[], u: number) {
  if (prev.length === 1) return prev[0][1];
  const f = u * (prev.length - 1);
  const i0 = Math.floor(f), i1 = Math.min(prev.length - 1, i0 + 1);
  return lerp(prev[i0][1], prev[i1][1], f - i0);
}

/**
 * 차트 ↔ 표의 호버 날짜를 주고받는 가벼운 저장소. 호버가 바뀔 때 React 상태를 바꾸지 않으므로
 * 부모(일별 탭, 표 28행)가 다시 그려지지 않고, 구독한 쪽(차트)만 갱신된다.
 */
export type HoverLink = { get: () => string | null; set: (d: string | null) => void; subscribe: (fn: () => void) => () => void };
export function createHoverLink(): HoverLink {
  let v: string | null = null;
  const subs = new Set<() => void>();
  return {
    get: () => v,
    set: (d) => {
      if (d === v) return;
      v = d;
      subs.forEach((f) => f());
    },
    subscribe: (fn) => {
      subs.add(fn);
      return () => subs.delete(fn);
    },
  };
}
const noopSub = () => () => {};
const nullGet = () => null;

export type TrendChartProps = {
  report: ReportPayload;
  /** 고정된 날짜 (표와 공유) */
  selectedDate?: string | null;
  onSelectDate?: (d: string | null) => void;
  /** 표 행 호버 날짜 ↔ 차트 호버 날짜 */
  link?: HoverLink;
  /** 고정 툴팁의 "이 날 하루만 보기" */
  onPickDay?: (d: string) => void;
};

export default function TrendChart({ report, selectedDate, onSelectDate, link, onPickDay }: TrendChartProps) {
  const hoverDate = useSyncExternalStore(link?.subscribe ?? noopSub, link?.get ?? nullGet, nullGet);
  const [metric, setMetric] = useState<ChartMetric>("both");
  const [hi, setHi] = useState<number | null>(null);
  const [pinLocal, setPinLocal] = useState<string | null>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const shownRef = useRef<Map<string, Pt[]> | null>(null);
  const sigRef = useRef<string | null>(null);
  const rafRef = useRef(0);
  const uid = useId().replace(/:/g, "");
  const today = todayKst();
  const hasToday = report.daily.some((d) => d.date === today);

  // 컨테이너 크기 (모바일·창 크기 변경 대응)
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSize((s) => (s && Math.abs(s.w - r.width) < 0.5 && Math.abs(s.h - r.height) < 0.5 ? s : { w: r.width, h: r.height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const lines: Line[] = useMemo(() => {
    if (metric === "both")
      return [
        { key: "users", name: "사용자", color: "#22B573" },
        { key: "sessions", name: "세션", color: "#60a5fa" },
      ];
    const o = CHART_OPTIONS.find((c) => c.key === metric)!;
    return [{ key: metric as keyof Raw, name: o.label, color: metric === "keyEvents" ? "#fbbf24" : metric === "engagementRate" ? "#c084fc" : "#22B573" }];
  }, [metric]);
  const lineSig = lines.map((l) => l.key).join();

  const days = useMemo(() => [...report.daily].sort((a, b) => (a.date < b.date ? -1 : 1)), [report.daily]);
  const n = days.length;
  const todayIdx = days.findIndex((d) => d.date === today);
  const isRate = metric === "engagementRate";
  const fmt = (k: keyof Raw, v: number) => (k === "engagementRate" ? pct(v) : num(v));

  // 값이 하나도 없으면 빈 상태
  const hasData = days.some((d) => lines.some((l) => fin(d[l.key]) !== null));

  // y 축: 0 부터, 오늘 값 포함 최댓값 기준
  const ticks = useMemo(() => {
    let max = 0;
    for (const d of days) for (const l of lines) max = Math.max(max, fin(d[l.key]) ?? 0);
    return niceTicks(max, !isRate);
  }, [days, lines, isRate]);
  const yTop = ticks[ticks.length - 1];
  const yLabel = (v: number) => (isRate ? `${Math.round(v * 100)}%` : num(v));
  const left = Math.max(...ticks.map((t) => yLabel(t).length)) * 7 + 14;

  const W = size?.w ?? 0, H = size?.h ?? 0;
  const plotW = Math.max(1, W - left - PAD_R), plotH = Math.max(1, H - PAD_T - PAD_B);
  const px = (i: number) => left + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const py = (v: number) => PAD_T + plotH * (1 - v / yTop);

  // 데이터가 바뀌었는지 판별하는 서명 (크기 변경은 포함하지 않는다)
  const sig = useMemo(() => lineSig + "|" + days.map((d) => lines.map((l) => d[l.key]).join(",")).join(";"), [lineSig, days, lines]);

  // 기하(선 구간별 점·경로) — 정적 레이어와 보간 전환이 같이 쓴다
  const geom = useMemo(() => {
    if (!size) return null;
    const base = PAD_T + plotH;
    const solid = lines.map((l) => {
      const vals = days.map((d, i) => (i === todayIdx ? null : fin(d[l.key])));
      const segs = segments(vals).map(({ start, end }, k) => {
        const pts: Pt[] = [];
        for (let i = start; i <= end; i++) pts.push([px(i), py(vals[i] as number)]);
        const d = monotonePath(pts);
        const area = pts.length > 1 ? `${d}L${+pts[pts.length - 1][0].toFixed(2)},${base}L${+pts[0][0].toFixed(2)},${base}Z` : "";
        return { id: `${l.key}-${k}`, d, area, pts };
      });
      return { l, segs };
    });
    return { base, solid, units: solid.flatMap((s) => s.segs.filter((g) => g.pts.length > 1).map((g) => ({ id: g.id, pts: g.pts }))) };
    // px/py 는 아래 값들의 함수이므로 값 자체를 의존성으로 둔다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, days, lines, ticks, todayIdx, left]);

  // 보간 전환: 데이터(기간·비교)가 바뀌면 이전 곡선에서 새 곡선으로 이동. 첫 그림·크기 변경·모션 줄이기에서는 바로 그린다.
  useLayoutEffect(() => {
    if (!geom) return;
    const next = new Map(geom.units.map((u) => [u.id, u.pts] as const));
    const prev = shownRef.current;
    const first = sigRef.current === null;
    const changed = sigRef.current !== sig;
    sigRef.current = sig;
    cancelAnimationFrame(rafRef.current);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const svg = svgRef.current;
    if (first || !changed || reduce || !prev || !svg || document.visibilityState !== "visible" || !geom.units.some((u) => prev.has(u.id))) {
      shownRef.current = next;
      return;
    }
    const t0 = performance.now();
    const DUR = 480;
    const frame = (now: number) => {
      const p = Math.min(1, (now - t0) / DUR);
      const e = 1 - Math.pow(1 - p, 3);
      const cur = new Map(next);
      for (const u of geom.units) {
        const pv = prev.get(u.id);
        if (!pv) continue;
        const pts: Pt[] = u.pts.map(([x, y], j) => [x, lerp(yAt(pv, u.pts.length > 1 ? j / (u.pts.length - 1) : 0), y, e)]);
        const d = monotonePath(pts);
        svg.querySelector(`[data-mid="${u.id}"][data-r="l"]`)?.setAttribute("d", d);
        const ar = svg.querySelector(`[data-mid="${u.id}"][data-r="a"]`);
        if (ar && pts.length > 1) ar.setAttribute("d", `${d}L${+pts[pts.length - 1][0].toFixed(2)},${geom.base}L${+pts[0][0].toFixed(2)},${geom.base}Z`);
        cur.set(u.id, pts);
      }
      shownRef.current = cur;
      if (p < 1) rafRef.current = requestAnimationFrame(frame);
    };
    frame(t0); // 첫 프레임은 페인트 전에 적용해 새 데이터가 번쩍 보이지 않게 한다
    rafRef.current = requestAnimationFrame(frame);
  }, [geom, sig]);

  // 정적 레이어 — 호버로는 다시 만들지 않는다
  const stat = useMemo(() => {
    if (!size || !geom) return null;
    const xs = xTickIndexes(n, plotW, 52);
    const partial = hasToday && todayIdx >= 0
      ? lines.map((l) => {
          const idx = [todayIdx - 1, todayIdx].filter((i) => i >= 0 && fin(days[i][l.key]) !== null);
          const pts: Pt[] = idx.map((i) => [px(i), py(days[i][l.key] as number)]);
          return { l, d: pts.length > 1 ? linearPath(pts) : "", dot: fin(days[todayIdx][l.key]) === null ? null : ([px(todayIdx), py(days[todayIdx][l.key] as number)] as Pt) };
        })
      : [];
    return (
      <>
        <defs>
          {lines.map((l) => (
            <linearGradient key={l.key} id={`${uid}-${l.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={l.color} stopOpacity={0.14} />
              <stop offset="100%" stopColor={l.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <g key={ticks.join()} className="ga-tc-fade">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={left} x2={W - PAD_R} y1={py(t)} y2={py(t)} stroke="rgba(255,255,255,.08)" />
              <text className="ga-tc-t" x={left - 8} y={py(t) + 4} textAnchor="end">{yLabel(t)}</text>
            </g>
          ))}
        </g>
        {xs.map((i) => (
          <text className="ga-tc-t" key={days[i].date} x={px(i)} y={H - 6} textAnchor="middle">{days[i].date.slice(5)}</text>
        ))}
        {hasToday && todayIdx >= 0 && (
          <g>
            <line x1={px(todayIdx)} x2={px(todayIdx)} y1={PAD_T} y2={PAD_T + plotH} stroke="rgba(255,255,255,.25)" strokeDasharray="3 3" />
            <text x={px(todayIdx) - 4} y={PAD_T + 11} textAnchor="end" fill="#fde68a" fontSize="11">집계 중</text>
          </g>
        )}
        <g key={lineSig}>
          {geom.solid.map(({ l, segs }) =>
            segs.map((s) => (
              <g key={s.id}>
                {s.area && <path className="ga-tc-area" data-mid={s.id} data-r="a" d={s.area} fill={`url(#${uid}-${l.key})`} />}
                <path className="ga-tc-line" data-mid={s.id} data-r="l" d={s.d} fill="none" stroke={l.color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
                {n <= 2 && s.pts.map(([x, y], j) => <circle key={j} cx={x} cy={y} r={3} fill={l.color} />)}
              </g>
            )),
          )}
          {partial.map(({ l, d, dot }) => (
            <g key={l.key} className="ga-tc-part">
              {d && <path d={d} fill="none" stroke={l.color} strokeWidth={2.2} strokeDasharray="5 4" />}
              {dot && <circle cx={dot[0]} cy={dot[1]} r={4} fill="#141414" stroke={l.color} strokeWidth={2} />}
            </g>
          ))}
        </g>
      </>
    );
    // px/py 는 아래 값들의 함수이므로 값 자체를 의존성으로 둔다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, geom, days, lines, ticks, lineSig, hasToday, todayIdx, left, uid]);

  // 고정(핀) 날짜 — 표와 공유하면 표에서 온 값, 아니면 이 차트 안에서만
  const pinned = onSelectDate ? selectedDate ?? null : pinLocal;
  const setPinned = (d: string | null) => {
    setPinLocal(d);
    onSelectDate?.(d);
  };
  const pinIdx = pinned ? days.findIndex((d) => d.date === pinned) : -1;
  const extIdx = hoverDate ? days.findIndex((d) => d.date === hoverDate) : -1;
  const setHover = (i: number | null) => {
    if (i === hi) return;
    setHi(i);
    link?.set(i === null ? null : days[i]?.date ?? null);
  };

  // 터치에서는 손가락을 떼도 값을 계속 보여 주고, 차트 밖을 누르면 닫는다 (고정은 유지)
  useEffect(() => {
    if (hi === null) return;
    const close = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) {
        setHi(null);
        link?.set(null);
        if (e.pointerType === "touch") setPinned(null); // 터치에서는 바깥을 누르면 고정도 해제 (마우스는 표와 비교하며 고정을 유지)
      }
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [hi !== null]); // eslint-disable-line react-hooks/exhaustive-deps

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!n) return;
    const r = e.currentTarget.getBoundingClientRect();
    setHover(nearestIndex(e.clientX - r.left, left, plotW, n));
  };
  const onKey = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (!n) return;
    if (e.key === "ArrowLeft") setHover(Math.max(0, (hi ?? n) - 1));
    else if (e.key === "ArrowRight") setHover(Math.min(n - 1, (hi ?? -1) + 1));
    else if (e.key === "Enter" || e.key === " ") {
      if (hi !== null) setPinned(days[hi].date === pinned ? null : days[hi].date);
    } else if (e.key === "Escape") {
      if (pinned) setPinned(null);
      else setHover(null);
    } else return;
    e.preventDefault();
  };

  // 지금 보여 줄 날짜: 차트 호버 > 표 행 호버 > 고정
  const activeIdx = hi !== null && hi < n ? hi : extIdx >= 0 ? extIdx : pinIdx >= 0 ? pinIdx : null;
  const act = activeIdx !== null ? days[activeIdx] : null;
  const isPinnedShown = activeIdx !== null && activeIdx === pinIdx;
  const tipRight = activeIdx !== null && px(activeIdx) > W * 0.6;
  const range = report.from === report.to ? report.from : `${report.from} ~ ${report.to}`;
  const last = n ? days[n - 1] : null;
  const delta = (l: Line, i: number) => {
    if (i <= 0) return null;
    const c = fin(days[i][l.key]), p = fin(days[i - 1][l.key]);
    if (c === null || p === null) return null;
    const d = c - p;
    const cls = Math.abs(d) < 1e-9 ? "flat" : d > 0 ? "up" : "down";
    const txt = l.key === "engagementRate" ? `${Math.abs(d * 100).toFixed(1)}%p` : `${num(Math.abs(d))}${p > 0 ? ` (${Math.abs((d / p) * 100).toFixed(0)}%)` : ""}`;
    return <em className={"ga-tc-d " + cls}>{cls === "flat" ? "–" : d > 0 ? "▲" : "▼"} {txt}</em>;
  };

  return (
    <section className="ga-card">
      <div className="ga-row">
        <h3 className="ga-h" style={{ margin: 0 }}>일별 추이 <span className="ga-sub">· {range}</span></h3>
        <select className="ga-select" aria-label="차트 지표" value={metric} onChange={(e) => { setMetric(e.target.value as ChartMetric); setHover(null); }}>
          {CHART_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="ga-chart ga-tc" ref={boxRef}>
        {size && (
          <svg
            ref={svgRef}
            width={W}
            height={H}
            role="group"
            aria-roledescription="추이 차트"
            aria-label={`일별 추이 ${lines.map((l) => l.name).join("·")}, ${range}${last ? `, 마지막 ${last.date} ${lines.map((l) => `${l.name} ${fmt(l.key, last[l.key] ?? 0)}`).join(" ")}` : ""}. 좌우 화살표로 날짜별 값을 보고 Enter 로 날짜를 고정합니다`}
            tabIndex={0}
            onPointerMove={onMove}
            onPointerDown={onMove}
            onPointerLeave={(e) => { if (e.pointerType !== "touch") setHover(null); }}
            onClick={() => { if (hi !== null) setPinned(days[hi].date === pinned ? null : days[hi].date); }}
            onBlur={() => setHover(null)}
            onKeyDown={onKey}
          >
            {stat}
            {!hasData && <text x={left + plotW / 2} y={PAD_T + plotH / 2} textAnchor="middle" fill="#8b8b8b" fontSize="13">표시할 데이터가 없습니다</text>}
            <rect data-ga-plot x={left} y={PAD_T} width={plotW} height={plotH} fill="transparent" />
          </svg>
        )}
        {size && act && activeIdx !== null && (
          // 가이드선·점은 HTML 요소로 그려 컴포지터에서 이동한다 (큰 차트 SVG 를 다시 그리지 않는다)
          <div className="ga-tc-ov" aria-hidden="true">
            <i
              className={"ga-tc-guide ga-tc-glide" + (isPinnedShown ? " is-pin" : "") + (isPinnedShown && hi === null ? " is-dash" : "")}
              style={{ top: PAD_T, height: plotH, transform: `translateX(${px(activeIdx)}px)` }}
            />
            {lines.map((l) => {
              const v = fin(act[l.key]);
              return v === null ? null : (
                <i
                  key={l.key}
                  className="ga-tc-dot ga-tc-glide"
                  style={{ transform: `translate(${px(activeIdx)}px, ${py(v)}px)`, background: l.color, ["--c" as string]: rgba(l.color, 0.22) }}
                />
              );
            })}
          </div>
        )}
        {act && activeIdx !== null && size && (
          <div
            className={"ga-tc-tip" + (isPinnedShown ? " is-pin" : "")}
            role="status"
            style={{ transform: `translate(${px(activeIdx)}px, ${PAD_T}px) translateX(${tipRight ? "calc(-100% - 12px)" : "12px"})` }}
          >
            <p className="ga-tc-tip-h">{act.date}{act.date === today ? " · 집계 중" : ""}{isPinnedShown && <span className="ga-tc-pin" aria-label="고정됨">📌</span>}</p>
            {lines.map((l) => (
              <p key={l.key} className="ga-tc-tip-r" style={{ color: l.color }}>
                <span>{l.name} :</span>
                <b>{fmt(l.key, act[l.key] ?? 0)}</b>
                {delta(l, activeIdx)}
              </p>
            ))}
            {activeIdx > 0 && <p className="ga-tc-tip-f">전일({days[activeIdx - 1].date.slice(5)}) 대비</p>}
            {isPinnedShown && onPickDay && (
              <button type="button" className="ga-tc-go" onClick={(e) => { e.stopPropagation(); onPickDay(act.date); }}>이 날 하루만 보기</button>
            )}
          </div>
        )}
      </div>
      <div className="ga-tc-legend" aria-hidden="true">
        {lines.map((l) => (
          <span key={l.key}><i style={{ background: l.color }} />{l.name}</span>
        ))}
      </div>
    </section>
  );
}
