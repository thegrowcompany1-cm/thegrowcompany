"use client";

// 대시보드 모션·미니 차트 — 외부 라이브러리 없이 rAF 와 SVG 만 쓴다.
//  · CountUp: 값이 실제로 바뀔 때만 움직인다. 같은 값으로 다시 그려지거나 폴링 결과가 같으면 아무 일도 없다.
//    프레임마다 React 를 다시 그리지 않고 텍스트 노드만 갱신하며, 끝에는 항상 정확한 최종 값(format(value))을 쓴다.
//    prefers-reduced-motion · 숨은 탭(비활성 패널)·백그라운드 탭에서는 바로 최종 값을 보여준다.
//  · Spark: KPI 카드용 미니 추이선. 실제 일별 값만 그린다 (오늘 집계 중인 날은 제외).

import { useId, useLayoutEffect, useRef } from "react";
import { monotonePath, type Pt } from "./ga-chart-math";
import { useTabActive } from "./ga-shared";

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t));

/** format 은 렌더마다 새로 만들지 않는 함수(모듈 상수)를 넘긴다 */
export function CountUp({ value, format, ms = 520 }: { value: number; format: (n: number) => string; ms?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef<number | null>(null); // 화면에 최종 반영된 값
  const raf = useRef(0);
  const active = useTabActive();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prev = shown.current;
    cancelAnimationFrame(raf.current);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prev === value) {
      el.textContent = format(value);
      return;
    }
    shown.current = value;
    if (reduce || !active || document.visibilityState !== "visible" || !Number.isFinite(value)) {
      el.textContent = format(value);
      return;
    }
    const from = prev ?? 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
      el.textContent = p >= 1 ? format(value) : format(from + (value - from) * easeOutExpo(p));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [value, ms, active, format]);

  // 서버 렌더·첫 페인트에는 최종 값을 넣어 둔다 (애니메이션이 못 돌아도 값은 맞다)
  return <span ref={ref}>{format(value)}</span>;
}

/**
 * KPI 카드용 미니 추이선. values 는 날짜 오름차순 실제 값이다 (오늘 집계 중인 날은 호출하는 쪽에서 빼고 넘긴다).
 * 선·면 그라데이션은 늘어나는 SVG 로, 끝점은 비율 좌표의 작은 점(HTML)으로 그려 어떤 폭에서도 찌그러지지 않는다.
 */
export function Spark({ values, color = "#22B573", label }: { values: number[]; color?: string; label: string }) {
  const uid = useId().replace(/:/g, "");
  const n = values.length;
  if (n < 2) return <div className="ga-spark ga-spark-empty" aria-hidden="true" />;
  const W = 120, H = 34, PT = 5, PB = 4;
  const max = Math.max(...values), min = Math.min(...values);
  const span = max - min;
  const x = (i: number) => (i / (n - 1)) * W;
  const y = (v: number) => (span === 0 ? H / 2 : PT + (1 - (v - min) / span) * (H - PT - PB));
  const pts: Pt[] = values.map((v, i) => [x(i), y(v)]);
  const d = monotonePath(pts);
  const area = `${d}L${W},${H}L0,${H}Z`;
  const last = pts[n - 1];
  return (
    <div className="ga-spark" role="img" aria-label={label}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="85%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${uid}-g)`} />
        <path d={d} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <i className="ga-spark-dot" style={{ left: `${(last[0] / W) * 100}%`, top: `${(last[1] / H) * 100}%`, background: color }} />
    </div>
  );
}
