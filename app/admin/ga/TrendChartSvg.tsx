"use client";

// 일별 추이 차트 (SVG 직접 구현) — Recharts 를 대체한다. 번들 약 15KB, 라이브러리 없음.
//  · 지표 선택 5종, y 축 0 시작, 가로 격자, x 축 날짜(MM-DD), 범례, 툴팁(원본 값), 오늘 "집계 중" 표시는 기존 차트와 같다.
//  · 확정된 날은 실선(단조 곡선), 어제→오늘 구간은 점선, 오늘 값은 속 빈 점. 오늘 값이 y 축 범위에는 들어가지만 실선에는 섞이지 않는다.
//  · 호버·터치·키보드(←/→)로 값을 본다. 선 그리기 애니메이션은 지표를 바꿀 때만 돌고 transform/opacity·dash 만 쓴다.
//  · 정적 레이어(선·축)는 메모해 두고 호버 때는 가이드선·점·툴팁만 다시 그린다.

import { useEffect, useId, useMemo, useRef, useState } from "react";
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

export default function TrendChart({ report }: { report: ReportPayload }) {
  const [metric, setMetric] = useState<ChartMetric>("both");
  const [hi, setHi] = useState<number | null>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
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

  const lines: Line[] = useMemo(() => {
    if (metric === "both")
      return [
        { key: "users", name: "사용자", color: "#22B573" },
        { key: "sessions", name: "세션", color: "#60a5fa" },
      ];
    const o = CHART_OPTIONS.find((c) => c.key === metric)!;
    return [{ key: metric as keyof Raw, name: o.label, color: metric === "keyEvents" ? "#fbbf24" : metric === "engagementRate" ? "#c084fc" : "#22B573" }];
  }, [metric]);

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

  // 정적 레이어 — 호버로는 다시 만들지 않는다
  const stat = useMemo(() => {
    if (!size) return null;
    const xs = xTickIndexes(n, plotW, 52);
    const solidLines = lines.map((l) => {
      const vals = days.map((d, i) => (i === todayIdx ? null : fin(d[l.key])));
      const segs = segments(vals).map(({ start, end }) => {
        const pts: Pt[] = [];
        for (let i = start; i <= end; i++) pts.push([px(i), py(vals[i] as number)]);
        const d = monotonePath(pts);
        const base = PAD_T + plotH;
        const area = pts.length > 1 ? `${d}L${+pts[pts.length - 1][0].toFixed(2)},${base}L${+pts[0][0].toFixed(2)},${base}Z` : "";
        return { d, area, pts };
      });
      return { l, segs };
    });
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
        {ticks.map((t) => (
          <g key={t}>
            <line x1={left} x2={W - PAD_R} y1={py(t)} y2={py(t)} stroke="rgba(255,255,255,.08)" />
            <text className="ga-tc-t" x={left - 8} y={py(t) + 4} textAnchor="end">{yLabel(t)}</text>
          </g>
        ))}
        {xs.map((i) => (
          <text className="ga-tc-t" key={days[i].date} x={px(i)} y={H - 6} textAnchor="middle">{days[i].date.slice(5)}</text>
        ))}
        {hasToday && todayIdx >= 0 && (
          <g>
            <line x1={px(todayIdx)} x2={px(todayIdx)} y1={PAD_T} y2={PAD_T + plotH} stroke="rgba(255,255,255,.25)" strokeDasharray="3 3" />
            <text x={px(todayIdx) - 4} y={PAD_T + 11} textAnchor="end" fill="#fde68a" fontSize="11">집계 중</text>
          </g>
        )}
        <g key={metric}>
          {solidLines.map(({ l, segs }) =>
            segs.map((s, k) => (
              <g key={`${l.key}-${k}`}>
                {s.area && <path className="ga-tc-area" d={s.area} fill={`url(#${uid}-${l.key})`} />}
                <path className="ga-tc-line" d={s.d} fill="none" stroke={l.color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
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
  }, [size, days, lines, ticks, metric, hasToday, todayIdx, left, uid]);

  // 터치에서는 손가락을 떼도 값을 계속 보여 주고, 차트 밖을 누르면 닫는다
  useEffect(() => {
    if (hi === null) return;
    const close = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setHi(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [hi !== null]); // eslint-disable-line react-hooks/exhaustive-deps

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!n) return;
    const r = e.currentTarget.getBoundingClientRect();
    const i = nearestIndex(e.clientX - r.left, left, plotW, n);
    setHi((cur) => (cur === i ? cur : i));
  };
  const onKey = (e: React.KeyboardEvent<SVGSVGElement>) => {
    if (!n) return;
    if (e.key === "ArrowLeft") setHi((c) => Math.max(0, (c ?? n) - 1));
    else if (e.key === "ArrowRight") setHi((c) => Math.min(n - 1, (c ?? -1) + 1));
    else if (e.key === "Escape") setHi(null);
    else return;
    e.preventDefault();
  };

  const act = hi !== null && hi < n ? days[hi] : null;
  const tipRight = act !== null && hi !== null && px(hi) > W * 0.6;
  const range = report.from === report.to ? report.from : `${report.from} ~ ${report.to}`;
  const last = n ? days[n - 1] : null;

  return (
    <section className="ga-card">
      <div className="ga-row">
        <h3 className="ga-h" style={{ margin: 0 }}>일별 추이 <span className="ga-sub">· {range}</span></h3>
        <select className="ga-select" aria-label="차트 지표" value={metric} onChange={(e) => { setMetric(e.target.value as ChartMetric); setHi(null); }}>
          {CHART_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="ga-chart ga-tc" ref={boxRef}>
        {size && (
          <svg
            width={W}
            height={H}
            role="group"
            aria-roledescription="추이 차트"
            aria-label={`일별 추이 ${lines.map((l) => l.name).join("·")}, ${range}${last ? `, 마지막 ${last.date} ${lines.map((l) => `${l.name} ${fmt(l.key, last[l.key] ?? 0)}`).join(" ")}` : ""}. 좌우 화살표로 날짜별 값을 봅니다`}
            tabIndex={0}
            onPointerMove={onMove}
            onPointerDown={onMove}
            onPointerLeave={(e) => { if (e.pointerType !== "touch") setHi(null); }}
            onBlur={() => setHi(null)}
            onKeyDown={onKey}
          >
            {stat}
            {!hasData && <text x={left + plotW / 2} y={PAD_T + plotH / 2} textAnchor="middle" fill="#8b8b8b" fontSize="13">표시할 데이터가 없습니다</text>}
            <rect data-ga-plot x={left} y={PAD_T} width={plotW} height={plotH} fill="transparent" />
            {act && hi !== null && (
              <g pointerEvents="none">
                <line x1={px(hi)} x2={px(hi)} y1={PAD_T} y2={PAD_T + plotH} stroke="rgba(255,255,255,.3)" />
                {lines.map((l) => {
                  const v = fin(act[l.key]);
                  return v === null ? null : <circle key={l.key} cx={px(hi)} cy={py(v)} r={4.5} fill={l.color} stroke="#141414" strokeWidth={2} />;
                })}
              </g>
            )}
          </svg>
        )}
        {act && hi !== null && size && (
          <div
            className="ga-tc-tip"
            role="status"
            style={{ left: px(hi), top: PAD_T, transform: tipRight ? "translateX(calc(-100% - 12px))" : "translateX(12px)" }}
          >
            <p style={{ margin: 0, color: "#fff", fontWeight: 800 }}>{act.date}{act.date === today ? " · 집계 중" : ""}</p>
            {lines.map((l) => (
              <p key={l.key} style={{ margin: "4px 0 0", color: l.color }}>{l.name} : {fmt(l.key, act[l.key] ?? 0)}</p>
            ))}
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
