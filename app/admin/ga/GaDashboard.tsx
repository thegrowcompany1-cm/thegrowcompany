"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 마케팅 인사이트 대시보드 (클라이언트)
//
//  · 상단: 기간 토글(7/28/90일) + 핵심 지표 4개 + 일별 추이 — 모든 하위 탭이 같은 기간을 쓴다.
//  · 하위 탭: 실시간 방문자 / 랜딩 성과 / 검색·SEO / AI 유입(AEO) / 채널 비교
//  · 기간 리포트는 /api/admin/ga/report 한 번으로 받아 탭이 나눠 쓴다 (서버 10분 캐시).
//  · 차트는 recharts. CSS 클래스 접두사 ga-.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { RANGES, type Range, type ReportPayload } from "@/lib/gaTypes";
import { AiTab, ChannelTab, LandingTab, SearchTab } from "./DataTabs";
import LiveTab from "./LiveTab";
import { ErrBox, GA_STYLE, Skel, fetchJson, mmss, num, pct, type ApiError } from "./ga-shared";

const TABS = [
  { key: "live", label: "실시간 방문자" },
  { key: "landing", label: "랜딩 성과" },
  { key: "search", label: "검색·SEO" },
  { key: "ai", label: "AI 유입(AEO)" },
  { key: "channel", label: "채널 비교" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export default function GaDashboard() {
  const [range, setRange] = useState<Range>(28);
  const [tab, setTab] = useState<TabKey>("live");

  const [report, setReport] = useState<ReportPayload | null>(null);
  const [repErr, setRepErr] = useState<ApiError | null>(null);
  const [repLoading, setRepLoading] = useState(true);

  // 기간 리포트 — 기간이 바뀌면 이전 요청을 취소한다
  useEffect(() => {
    const ctrl = new AbortController();
    setRepLoading(true);
    (async () => {
      try {
        const data = await fetchJson<ReportPayload>(`/api/admin/ga/report?range=${range}`, ctrl.signal);
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
  }, [range]);

  const needsReport = tab !== "live";

  return (
    <div className="ga">
      <style dangerouslySetInnerHTML={{ __html: GA_STYLE }} />

      <div className="ga-toolbar" style={{ marginTop: 0 }}>
        <h2 className="ga-h" style={{ margin: 0 }}>마케팅 인사이트</h2>
        <div className="ga-seg" role="group" aria-label="기간 선택">
          {RANGES.map((r) => (
            <button key={r} type="button" aria-pressed={range === r} onClick={() => setRange(r)}>
              {r}일
            </button>
          ))}
        </div>
      </div>

      {repErr && (
        <div style={{ marginBottom: 14 }}>
          <ErrBox title={repErr.code === "PERMISSION_DENIED" ? "접근 권한 오류" : "리포트를 불러오지 못했습니다"} err={repErr} />
        </div>
      )}

      {repLoading && !report ? (
        <div className="ga-card" aria-busy="true">
          <Skel h={80} />
          <div style={{ height: 14 }} />
          <Skel h={240} />
        </div>
      ) : report ? (
        <div style={{ opacity: repLoading ? 0.55 : 1, transition: "opacity .2s" }} aria-busy={repLoading}>
          <section className="ga-kpis" aria-label="핵심 지표">
            {[
              { l: "사용자", v: num(report.totals.users) },
              { l: "세션", v: num(report.totals.sessions) },
              { l: "참여율", v: pct(report.totals.engagementRate) },
              { l: "평균 세션 시간", v: mmss(report.totals.avgSessionDuration) },
            ].map((k) => (
              <div className="ga-card" key={k.l} style={{ marginTop: 0 }}>
                <p className="ga-kpi-l">{k.l}</p>
                <p className="ga-kpi-v">{k.v}</p>
              </div>
            ))}
          </section>

          <section className="ga-card">
            <h3 className="ga-h">일별 사용자 · 세션</h3>
            <div className="ga-chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={report.daily} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                  <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
                  <XAxis dataKey="date" tickFormatter={(d: string) => d.slice(5)} stroke="#777" fontSize={11} minTickGap={24} />
                  <YAxis stroke="#777" fontSize={11} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#1c1c1c", border: "1px solid rgba(255,255,255,.15)", borderRadius: 10, fontSize: 12 }} labelStyle={{ color: "#fff" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="users" name="사용자" stroke="#22B573" strokeWidth={2.2} dot={false} />
                  <Line type="monotone" dataKey="sessions" name="세션" stroke="#60a5fa" strokeWidth={2.2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      ) : null}

      <div className="ga-tabs" role="tablist" aria-label="분석 항목">
        {TABS.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {tab === "live" && <LiveTab days={range} />}
        {needsReport && !report && !repErr && <Skel h={160} />}
        {needsReport && report && (
          <div style={{ opacity: repLoading ? 0.55 : 1, transition: "opacity .2s" }}>
            {tab === "landing" && <LandingTab report={report} />}
            {tab === "search" && <SearchTab report={report} />}
            {tab === "ai" && <AiTab report={report} />}
            {tab === "channel" && <ChannelTab report={report} />}
          </div>
        )}
      </div>

      <p className="ga-note">
        기간 리포트는 GA 집계 특성상 최대 24~48시간 지연될 수 있음
        {report ? ` · 서버 캐시 10분 (조회 ${new Date(report.cachedAt).toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul", hour12: false })})` : ""}
        {" · 서치콘솔은 최근 2~3일 데이터가 비어 있고 1시간 캐시"}
        {" · 자체 방문 추적은 /admin 과 봇을 제외한 익명 통계입니다"}
      </p>
    </div>
  );
}
