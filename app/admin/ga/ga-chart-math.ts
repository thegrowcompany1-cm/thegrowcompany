// GA 대시보드 SVG 차트용 순수 계산 함수 — React·DOM 에 의존하지 않는다 (검증하기 쉽게 따로 둔다).

export type Pt = readonly [number, number];

/** 0 부터 시작하는 y 축 눈금. 구간 4개를 목표로 1·2·5 × 10^n 단위를 고른다 (정수 지표는 최소 1 단위). */
export function niceTicks(max: number, integer: boolean): number[] {
  const m = Number.isFinite(max) && max > 0 ? max : 1;
  const raw = m / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step =
    [1, 2, 2.5, 5, 10, 20, 25, 50].map((c) => c * mag).find((s) => s >= raw - 1e-12 && (!integer || Number.isInteger(+s.toFixed(9)))) ?? Math.ceil(raw);
  const count = Math.max(1, Math.ceil(m / step - 1e-9));
  return Array.from({ length: count + 1 }, (_, i) => +(i * step).toFixed(10));
}

/** 값이 null 인 곳에서 끊기는 구간들로 나눈다 (Recharts 의 connectNulls=false 와 같은 동작) */
export function segments(values: (number | null)[]): { start: number; end: number }[] {
  const out: { start: number; end: number }[] = [];
  let s = -1;
  values.forEach((v, i) => {
    if (v === null) {
      if (s >= 0) out.push({ start: s, end: i - 1 });
      s = -1;
    } else if (s < 0) s = i;
  });
  if (s >= 0) out.push({ start: s, end: values.length - 1 });
  return out;
}

const sign = (x: number) => (x < 0 ? -1 : 1);

/** d3 의 curveMonotoneX 와 같은 단조 3차 보간 경로 (Recharts type="monotone") */
export function monotonePath(pts: readonly Pt[]): string {
  const n = pts.length;
  if (n === 0) return "";
  const f = (v: number) => +v.toFixed(2);
  if (n === 1) return `M${f(pts[0][0])},${f(pts[0][1])}`;
  if (n === 2) return `M${f(pts[0][0])},${f(pts[0][1])}L${f(pts[1][0])},${f(pts[1][1])}`;
  const t = new Array<number>(n).fill(0);
  const slope3 = (i: number) => {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
    const h0 = x1 - x0, h1 = x2 - x1;
    const s0 = h0 ? (y1 - y0) / h0 : 0;
    const s1 = h1 ? (y2 - y1) / h1 : 0;
    const p = h0 + h1 ? (s0 * h1 + s1 * h0) / (h0 + h1) : 0;
    return (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
  };
  const slope2 = (i: number, ti: number) => {
    const h = pts[i][0] - pts[i - 1][0];
    return h ? (3 * (pts[i][1] - pts[i - 1][1]) / h - ti) / 2 : ti;
  };
  for (let i = 1; i < n - 1; i++) t[i] = slope3(i);
  t[0] = slope2(1, t[1]);
  t[n - 1] = slope2(n - 1, t[n - 2]);
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const dx = (x1 - x0) / 3;
    d += `C${f(x0 + dx)},${f(y0 + dx * t[i])},${f(x1 - dx)},${f(y1 - dx * t[i + 1])},${f(x1)},${f(y1)}`;
  }
  return d;
}

/** 직선 경로 */
export function linearPath(pts: readonly Pt[]): string {
  return pts.map(([x, y], i) => `${i ? "L" : "M"}${+x.toFixed(2)},${+y.toFixed(2)}`).join("");
}

/** x 축 눈금 인덱스 — 마지막 날짜는 항상 보이게 하고, 라벨 사이 최소 간격(px)을 지킨다 */
export function xTickIndexes(n: number, plotW: number, minGapPx: number): number[] {
  if (n <= 0) return [];
  if (n === 1) return [0];
  const per = plotW / (n - 1);
  const step = Math.max(1, Math.ceil(minGapPx / per));
  const out: number[] = [];
  for (let i = n - 1; i >= 0; i -= step) out.unshift(i);
  return out;
}

/** 가장 가까운 데이터 인덱스 */
export function nearestIndex(px: number, left: number, plotW: number, n: number): number {
  if (n <= 1) return 0;
  return Math.max(0, Math.min(n - 1, Math.round(((px - left) / plotW) * (n - 1))));
}
