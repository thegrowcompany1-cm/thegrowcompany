"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 마케팅 인사이트 대시보드 (클라이언트)
//
//  · 상단: 기간 선택(프리셋 + 달력) · 직전 기간 비교 · 핵심 지표 · 일별 추이(지표 선택).
//    선택한 기간은 URL 쿼리(?from=YYYY-MM-DD&to=YYYY-MM-DD&compare=1)에 저장돼 새로고침·링크 공유에도 유지된다.
//    기간을 바꿀 때마다 history 에 쌓으므로 브라우저 뒤로가기로 이전 기간으로 돌아온다.
//  · 하위 탭: 실시간 방문자 / 일별 / 랜딩 성과 / 검색·SEO / AI 유입(AEO) / 채널 비교 — 모두 같은 기간을 쓴다.
//  · 모든 날짜 경계는 KST. 기간 리포트는 /api/admin/ga/report 한 번으로 받아 탭이 나눠 쓴다.
//  · 차트는 recharts. CSS 클래스 접두사 ga-.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { parseRange, presetRange, rangeLength, todayKst, weekdayKo } from "@/lib/gaRange";
import type { ReportPayload, Totals } from "@/lib/gaTypes";
import { AiTab, ChannelTab, DailyTab, LandingTab, SearchTab } from "./DataTabs";
import LiveTab from "./LiveTab";
import WeeklyTab from "./WeeklyTab";
import RangePicker from "./RangePicker";
import SummaryStrip from "./SummaryStrip";
import { Delta, ErrBox, GA_STYLE, Skel, fetchJson, mmss, num, pct, type ApiError } from "./ga-shared";

const TABS = [
  { key: "live", label: "실시간 방문자" },
  { key: "daily", label: "일별" },
  { key: "landing", label: "랜딩 성과" },
  { key: "search", label: "검색·SEO" },
  { key: "ai", label: "AI 유입(AEO)" },
  { key: "channel", label: "채널 비교" },
  { key: "weekly", label: "주간 리포트" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

type ChartMetric = "both" | "users" | "sessions" | "engagementRate" | "keyEvents";
const CHART_OPTIONS: { key: ChartMetric; label: string }[] = [
  { key: "both", label: "사용자 · 세션" },
  { key: "users", label: "사용자" },
  { key: "sessions", label: "세션" },
  { key: "engagementRate", label: "참여율" },
  { key: "keyEvents", label: "키 이벤트" },
];

const fmtDay = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}(${weekdayKo(d)})`;
function periodText(from: string, to: string) {
  const n = rangeLength(from, to);
  return from === to ? `${fmtDay(from)} · ${n}일` : `${fmtDay(from)} ~ ${fmtDay(to)} · ${n}일`;
}

export default function GaDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // ── 기간 (URL 이 원본) ──
  const today = todayKst();
  const parsed = parseRange({ from: sp.get("from"), to: sp.get("to") }, today);
  const urlInvalid = !parsed.ok;
  const { from, to } = parsed.ok ? parsed : presetRange("last28", today);
  const compare = sp.get("compare") === "1";

  const go = useCallback(
    (f: string, t: string, cmp: boolean) => {
      const q = new URLSearchParams({ from: f, to: t });
      if (cmp) q.set("compare", "1");
      router.push(`${pathname}?${q.toString()}`, { scroll: false });
    },
    [router, pathname],
  );

  const [tab, setTab] = useState<TabKey>(() => (TABS.some((t) => t.key === sp.get("tab")) ? (sp.get("tab") as TabKey) : "live"));
  const [metric, setMetric] = useState<ChartMetric>("both");

  const [report, setReport] = useState<ReportPayload | null>(null);
  const [repErr, setRepErr] = useState<ApiError | null>(null);
  const [repLoading, setRepLoading] = useState(true);

  // 기간 리포트 — 기간·비교가 바뀌면 이전 요청을 취소한다
  useEffect(() => {
    const ctrl = new AbortController();
    setRepLoading(true);
    (async () => {
      try {
        const data = await fetchJson<ReportPayload>(`/api/admin/ga/report?from=${from}&to=${to}${compare ? "&compare=1" : ""}`, ctrl.signal);
        if (data.ok) {
          setReport(data);
          setRepErr(null);
        } else setRepErr(data);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setRepErr({ ok: false, code: "NETWORK", message: "네트워크 오류로 리포트를 불러오지 못했습니다." });
      } finally {
        if (!ctrl.signal.aborted) setRepLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [from, to, compare]);

  const rootRef = useRef<HTMLDivElement>(null);

  // 사이트 상단 헤더(sticky) 높이만큼 비워서 고정 헤더가 그 밑에 붙게 한다
  useEffect(() => {
    const h = document.querySelector("header");
    const root = rootRef.current;
    if (!h || !root) return;
    const set = () => root.style.setProperty("--ga-top", `${Math.round(h.getBoundingClientRect().height)}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(h);
    return () => ro.disconnect();
  }, []);

  // 모바일 카드형 표: 각 칸에 열 제목(data-label)을 붙이고, 카드를 누르면 나머지 지표를 펼친다
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const label = () => {
      root.querySelectorAll("table.ga-table").forEach((t) => {
        const heads = [...t.querySelectorAll("thead th")].map((th) => th.textContent?.trim() ?? "");
        t.querySelectorAll("tbody tr").forEach((tr) => {
          [...tr.children].forEach((td, i) => {
            if (heads[i] && td.getAttribute("data-label") !== heads[i]) td.setAttribute("data-label", heads[i]);
          });
        });
      });
    };
    label();
    const mo = new MutationObserver(label);
    mo.observe(root, { childList: true, subtree: true });
    const onClick = (e: MouseEvent) => {
      const tr = (e.target as HTMLElement).closest("table.ga-table tbody tr");
      if (!tr || tr.classList.contains("is-click") || !window.matchMedia("(max-width: 560px)").matches) return;
      if (tr.getAttribute("data-open") === "1") tr.removeAttribute("data-open");
      else tr.setAttribute("data-open", "1");
    };
    root.addEventListener("click", onClick);
    return () => {
      mo.disconnect();
      root.removeEventListener("click", onClick);
    };
  }, []);

  const chartLines = useMemo(() => {
    if (metric === "both")
      return [
        { key: "users", name: "사용자", color: "#22B573" },
        { key: "sessions", name: "세션", color: "#60a5fa" },
      ];
    const o = CHART_OPTIONS.find((c) => c.key === metric)!;
    return [{ key: metric, name: o.label, color: metric === "keyEvents" ? "#fbbf24" : metric === "engagementRate" ? "#c084fc" : "#22B573" }];
  }, [metric]);

  const needsReport = tab !== "live" && tab !== "weekly";
  const showReport = report && report.from === from && report.to === to;

  const kpis: { l: string; v: string; cur: number; prev?: number; kind: "rel" | "pp" }[] = report
    ? (() => {
        const t: Totals = report.totals;
        const p = report.prev?.totals;
        return [
          { l: "사용자", v: num(t.users), cur: t.users, prev: p?.users, kind: "rel" as const },
          { l: "세션", v: num(t.sessions), cur: t.sessions, prev: p?.sessions, kind: "rel" as const },
          { l: "참여율", v: pct(t.engagementRate), cur: t.engagementRate, prev: p?.engagementRate, kind: "pp" as const },
          { l: "평균 세션 시간", v: mmss(t.avgSessionDuration), cur: t.avgSessionDuration, prev: p?.avgSessionDuration, kind: "rel" as const },
        ];
      })()
    : [];

  return (
    <div className="ga" ref={rootRef}>
      <style dangerouslySetInnerHTML={{ __html: GA_STYLE }} />

      <div className="ga-sticky">
        <RangePicker from={from} to={to} onChange={(f, t) => go(f, t, compare)} />
        <div className="ga-tabbar">
          <div className="ga-tabs" role="tablist" aria-label="분석 항목">
            {TABS.map((t) => (
              <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
          <span className="ga-period" title="선택한 기간 (KST)">{periodText(from, to)}</span>
        </div>
      </div>

      <div className="ga-opts">
        <label className="ga-check">
          <input type="checkbox" checked={compare} onChange={(e) => go(from, to, e.target.checked)} />
          이전 기간과 비교
        </label>
        <span className="ga-period-m">{periodText(from, to)}</span>
        {compare && report?.prev && (
          <span className="ga-sub">
            비교 기간 {report.prev.from === report.prev.to ? report.prev.from : `${report.prev.from} ~ ${report.prev.to}`}
          </span>
        )}
      </div>

      {urlInvalid && (
        <p className="ga-notice" role="status">주소의 기간 값이 올바르지 않아 최근 28일로 표시합니다.</p>
      )}
      {to >= today && (
        <p className="ga-notice" role="note">
          오늘이 포함된 기간입니다 — GA 기간 리포트는 집계 지연으로 오늘 숫자가 작게 보일 수 있습니다 (실시간 탭 숫자는 즉시 반영).
        </p>
      )}

      {repErr && (
        <div style={{ marginBottom: 14 }}>
          <ErrBox title={repErr.code === "PERMISSION_DENIED" ? "접근 권한 오류" : "리포트를 불러오지 못했습니다"} err={repErr} />
        </div>
      )}

      <SummaryStrip report={report} compare={compare} loading={repLoading} />

      {repLoading && !report ? (
        <div className="ga-card" aria-busy="true">
          <Skel h={80} />
          <div style={{ height: 14 }} />
          <Skel h={240} />
        </div>
      ) : report ? (
        <div style={{ opacity: repLoading ? 0.55 : 1, transition: "opacity .2s" }} aria-busy={repLoading}>
          <section className="ga-kpis" aria-label="핵심 지표">
            {kpis.map((k) => (
              <div className="ga-card" key={k.l} style={{ marginTop: 0 }}>
                <p className="ga-kpi-l">{k.l}</p>
                <p className="ga-kpi-v">{k.v}</p>
                {compare && <Delta cur={k.cur} prev={k.prev} kind={k.kind} />}
              </div>
            ))}
          </section>

          <section className="ga-card">
            <div className="ga-row">
              <h3 className="ga-h" style={{ margin: 0 }}>일별 추이 <span className="ga-sub">· {periodText(from, to)}</span></h3>
              <select className="ga-select" aria-label="차트 지표" value={metric} onChange={(e) => setMetric(e.target.value as ChartMetric)}>
                {CHART_OPTIONS.map((o) => (
                  <option key={o.key} value={o.key}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="ga-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={report.daily} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                  <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(d: string) => d.slice(5)} stroke="#777" fontSize={11} minTickGap={24} />
                  <YAxis
                    stroke="#777"
                    fontSize={11}
                    allowDecimals={metric === "engagementRate"}
                    tickFormatter={metric === "engagementRate" ? (v: number) => `${Math.round(v * 100)}%` : undefined}
                  />
                  <Tooltip
                    contentStyle={{ background: "#1c1c1c", border: "1px solid rgba(255,255,255,.15)", borderRadius: 10, fontSize: 12 }}
                    labelStyle={{ color: "#fff" }}
                    formatter={(v) => (metric === "engagementRate" ? pct(Number(v)) : num(Number(v)))}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {chartLines.map((l) => (
                    <Line key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={l.color} strokeWidth={2.2} dot={report.daily.length <= 2} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      ) : null}

      <div role="tabpanel">
        {tab === "live" && <LiveTab from={from} to={to} />}
        {tab === "weekly" && <WeeklyTab />}
        {needsReport && !showReport && !repErr && <Skel h={160} />}
        {needsReport && showReport && report && (
          <div style={{ opacity: repLoading ? 0.55 : 1, transition: "opacity .2s" }}>
            {tab === "daily" && <DailyTab report={report} onPickDay={(d) => go(d, d, compare)} />}
            {tab === "landing" && <LandingTab report={report} />}
            {tab === "search" && <SearchTab report={report} from={from} to={to} />}
            {tab === "ai" && <AiTab report={report} />}
            {tab === "channel" && <ChannelTab report={report} />}
          </div>
        )}
      </div>

      <p className="ga-note">
        기간 리포트는 GA 집계 특성상 최대 24~48시간 지연될 수 있음
        {report ? ` · 서버 캐시 ${report.includesToday ? 5 : 10}분 (조회 ${new Date(report.cachedAt).toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul", hour12: false })})` : ""}
        {" · 서치콘솔은 약 2~3일 지연, 1시간 캐시"}
        {" · 자체 방문 추적은 /admin 과 봇을 제외한 익명 통계입니다"}
        {" · 모든 날짜는 KST 기준"}
      </p>
    </div>
  );
}
