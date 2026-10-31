"use client";

// 오늘 한눈에 — 모든 탭 위에 보이는 요약 띠 (카드 5개 + 자동 코멘트 1줄)
//  · 지금 접속은 GA4 실시간 API(60초 갱신), 나머지는 기간 리포트에서 가져온다 (API 변경 없음).
//  · 20초 이상 머문 비율은 자체 방문 추적 기준이다 (같은 세션+경로 3초 묶음 방문 중 duration_sec >= 20).
//    자체 추적 데이터가 없는 기간은 GA 참여율로 대체하고 "(GA 기준)" 을 붙인다.

import { memo, useMemo, type CSSProperties } from "react";
import { todayKst } from "@/lib/gaRange";
import { buildChannelCompare } from "@/lib/gaInsights";
import type { ReportPayload } from "@/lib/gaTypes";
import { Delta, mmss, num, pct } from "./ga-shared";
import { CountUp, Spark } from "./ga-motion";
import { useGaData } from "./useGaData";

type Rt = { ok: true; total: number; devices?: { name: string; users: number }[] };
const DEVICE_LABEL: Record<string, string> = { mobile: "모바일", desktop: "데스크톱", tablet: "태블릿", "smart tv": "스마트 TV" };
const DEVICE_COLOR = ["#60a5fa", "#22B573", "#c084fc", "#fbbf24"];
const fmtInt = (n: number) => num(Math.round(n));
const fmtPct = (n: number) => pct(n);
const fmtWhole = (n: number) => n.toFixed(0);
type TrackStay = { ok: true; stay: { visits: number; over20: number } };

/** 가장 중요한 변화 1개 (비교 켜짐) 또는 가장 큰 유입 채널 (비교 꺼짐) */
function comment(report: ReportPayload): string | null {
  const t = report.totals;
  const p = report.prev?.totals;
  if (p) {
    const cands = [
      { name: "세션이", cur: t.sessions, prev: p.sessions },
      { name: "키 이벤트가", cur: t.keyEvents, prev: p.keyEvents },
      { name: "사용자가", cur: t.users, prev: p.users },
    ]
      .filter((c) => c.prev > 0)
      .map((c) => ({ ...c, d: (c.cur - c.prev) / c.prev }))
      .sort((a, b) => Math.abs(b.d) - Math.abs(a.d));
    const best = cands[0];
    const eng = (t.engagementRate - p.engagementRate) * 100;
    if (best && (Math.abs(best.d) >= 0.1 || Math.abs(eng) < 5)) {
      if (Math.abs(best.d) < 0.03) return "이전 기간과 비교해 큰 변화가 없습니다";
      return `${best.name} 이전 기간보다 ${(Math.abs(best.d) * 100).toFixed(1)}% ${best.d > 0 ? "늘었습니다" : "줄었습니다"} — 이 기간의 가장 큰 변화입니다`;
    }
    if (Math.abs(eng) >= 5) return `참여율이 이전 기간보다 ${Math.abs(eng).toFixed(1)}%p ${eng > 0 ? "올랐습니다" : "내려갔습니다"} — 이 기간의 가장 큰 변화입니다`;
    return null;
  }
  const rows = buildChannelCompare(report).filter((r) => r.sessions > 0 && r.key !== "ai");
  const total = t.sessions;
  if (!rows.length || !total) return "이 기간의 방문이 아직 없습니다";
  const top = [...rows].sort((a, b) => b.sessions - a.sessions)[0];
  return `${top.label.replace(/ \(.*\)$/, "")}이 세션의 ${((top.sessions / total) * 100).toFixed(0)}%로 가장 큰 유입 채널입니다`;
}

function SummaryStrip({ report, compare, loading, from, to }: { report: ReportPayload | null; compare: boolean; loading: boolean; from: string; to: string }) {
  // 지금 접속 — LiveTab 과 같은 요청·캐시를 공유한다 (60초 갱신)
  const rtData = useGaData<Rt>("/api/admin/ga/realtime", { staleMs: 20_000, pollMs: 60_000 }).data;
  const rt = rtData?.total ?? null;
  const devTotal = rtData?.devices?.reduce((a, d) => a + d.users, 0) ?? 0;

  // 20초 이상 머문 비율 — 자체 추적 (기간이 바뀔 때마다). 일별 탭이 쓰는 요청과 같은 URL 이라 한 번만 나간다.
  // 새 기간 응답이 오기 전에는 직전 값을 유지하고, 오류면 GA 참여율로 대신 보여준다.
  const stayRes = useGaData<TrackStay>(`/api/admin/track?view=daily&from=${from}&to=${to}`, { staleMs: 60_000, keepPrevious: true });
  const stay = stayRes.error ? null : stayRes.data?.stay ?? null;

  const mix = useMemo(() => {
    if (!report || !report.totals.sessions) return null;
    const rows = buildChannelCompare(report);
    const get = (k: string) => rows.find((r) => r.key === k)?.sessions ?? 0;
    const total = report.totals.sessions;
    return { meta: get("paid") / total, organic: get("organic") / total };
  }, [report]);

  const t = report?.totals;
  const p = compare ? report?.prev?.totals : undefined;
  const note = report ? comment(report) : null;
  const own = stay && stay.visits > 0 ? stay : null;
  const ownRate = own ? own.over20 / own.visits : null;
  // 미니 추이선 — 실제 일별 값 (날짜 오름차순). 오늘(집계 중)이 끝에 있으면 선에서 뺀다.
  const days = useMemo(() => (report ? [...report.daily].sort((x, y) => (x.date < y.date ? -1 : 1)) : []), [report]);
  const partial = !!report?.includesToday && days.length > 2 && days[days.length - 1].date === todayKst();
  const sparkDays = partial ? days.slice(0, -1) : days;
  const sparkCap = `${sparkDays.length}일 추이${partial ? " · 오늘 제외" : ""}`;
  const skel = (w: number) => <span className="ga-skel ga-sc-skel" style={{ width: w }} aria-hidden="true" />;

  return (
    <section aria-label="오늘 한눈에" className={loading ? "ga-strip-wrap is-stale" : "ga-strip-wrap"}>
      <div className="ga-strip">
        <div className="ga-sc is-live" style={{ "--i": 0 } as CSSProperties}>
          <p className="ga-sc-l"><span className="ga-dot-s" aria-hidden="true" />지금 접속 (실시간)</p>
          <p className="ga-sc-v is-live">{rt === null ? skel(70) : <><CountUp value={rt} format={fmtInt} /><small>명</small></>}</p>
          <p className="ga-sc-s">최근 30분 · 60초 갱신</p>
          <div className="ga-sc-viz">
            <div className="ga-sc-g">
              {devTotal > 0 ? (
                <div className="ga-sc-split" aria-hidden="true">
                  {rtData!.devices!.map((d, i) => (
                    <i key={d.name} style={{ width: `${(d.users / devTotal) * 100}%`, background: DEVICE_COLOR[i % DEVICE_COLOR.length] }} />
                  ))}
                </div>
              ) : (
                <div className="ga-sc-split" aria-hidden="true" />
              )}
            </div>
            <p className="ga-sc-cap">
              {devTotal > 0
                ? rtData!.devices!.map((d, i) => (
                    <span key={d.name}><i className="ga-sc-dot" style={{ background: DEVICE_COLOR[i % DEVICE_COLOR.length] }} />{DEVICE_LABEL[d.name.toLowerCase()] ?? d.name} {Math.round((d.users / devTotal) * 100)}%</span>
                  ))
                : rt === null ? "기기 정보 불러오는 중" : "접속 기기 정보가 없습니다"}
            </p>
          </div>
        </div>
        <div className="ga-sc" style={{ "--i": 1 } as CSSProperties}>
          <p className="ga-sc-l">방문 세션</p>
          <p className="ga-sc-v">{t ? <><CountUp value={t.sessions} format={fmtInt} /><small>세션</small></> : skel(110)}</p>
          {t && p && <Delta cur={t.sessions} prev={p.sessions} kind="rel" label="" />}
          {t && <p className="ga-sc-s">사용자 {num(t.users)}명 · 평균 {mmss(t.avgSessionDuration)}</p>}
          <div className="ga-sc-viz">
            <div className="ga-sc-g">{t && <Spark values={sparkDays.map((d) => d.sessions)} label={`일별 세션 추이, ${sparkCap}`} />}</div>
            <p className="ga-sc-cap">{t ? sparkCap : ""}</p>
          </div>
        </div>
        <div className="ga-sc" style={{ "--i": 2 } as CSSProperties} title="자체 방문 추적 기준 — 같은 세션·경로 3초 묶음 방문 중 20초 이상 머문 비율. 추적 데이터가 없는 기간은 GA 참여율로 대신 보여줍니다">
          <p className="ga-sc-l">20초 이상 머문 비율{t && ownRate === null ? " (GA 기준)" : ""}</p>
          <p className="ga-sc-v">{ownRate !== null ? <CountUp value={ownRate} format={fmtPct} /> : t ? <CountUp value={t.engagementRate} format={fmtPct} /> : skel(90)}</p>
          {ownRate !== null && t && <p className="ga-sc-s">GA 참여율 {pct(t.engagementRate)}</p>}
          {ownRate === null && t && p && <Delta cur={t.engagementRate} prev={p.engagementRate} kind="pp" label="" />}
          {ownRate === null && t && !p && <p className="ga-sc-s">GA 참여 세션 기준 (10초 이상)</p>}
          <div className="ga-sc-viz">
            <div className="ga-sc-g">
              {ownRate !== null ? (
                <div className="ga-sc-split" aria-hidden="true">
                  <i className="o" style={{ width: `${ownRate * 100}%` }} />
                </div>
              ) : (
                t && <Spark values={sparkDays.map((d) => d.engagementRate)} color="#c084fc" label={`일별 참여율 추이, ${sparkCap}`} />
              )}
            </div>
            <p className="ga-sc-cap">{ownRate !== null && own ? `20초 이상 ${num(own.over20)} / 전체 ${num(own.visits)}건` : t ? sparkCap : ""}</p>
          </div>
        </div>
        <div className="ga-sc" style={{ "--i": 3 } as CSSProperties}>
          <p className="ga-sc-l">키 이벤트 (문의·결제)</p>
          <p className="ga-sc-v">{t ? <><CountUp value={t.keyEvents} format={fmtInt} /><small>건</small></> : skel(80)}</p>
          {t && p && <Delta cur={t.keyEvents} prev={p.keyEvents} kind="rel" label="" />}
          <div className="ga-sc-viz">
            <div className="ga-sc-g">{t && <Spark values={sparkDays.map((d) => d.keyEvents)} color="#fbbf24" label={`일별 키 이벤트 추이, ${sparkCap}`} />}</div>
            <p className="ga-sc-cap">{t ? sparkCap : ""}</p>
          </div>
        </div>
        <div className="ga-sc" style={{ "--i": 4 } as CSSProperties}>
          <p className="ga-sc-l">메타광고 vs 자연검색</p>
          <p className="ga-sc-v">{mix ? <><CountUp value={mix.meta * 100} format={fmtWhole} />%<small> vs </small><CountUp value={mix.organic * 100} format={fmtWhole} />%</> : t ? "-" : skel(110)}</p>
          <p className="ga-sc-s">전체 세션 대비 비중</p>
          <div className="ga-sc-viz">
            <div className="ga-sc-g">
              {mix && (
                <div className="ga-sc-split" aria-hidden="true">
                  <i className="m" style={{ width: `${mix.meta * 100}%` }} />
                  <i className="o" style={{ width: `${mix.organic * 100}%` }} />
                </div>
              )}
            </div>
            <p className="ga-sc-cap">
              <span><i className="ga-sc-dot" style={{ background: "#60a5fa" }} />메타광고</span>
              <span><i className="ga-sc-dot" style={{ background: "#22B573" }} />자연검색</span>
            </p>
          </div>
        </div>
      </div>
      {note && (
        <p className="ga-strip-note" role="note">
          <span aria-hidden="true">💡</span> {note}
        </p>
      )}
    </section>
  );
}

// 탭을 바꿀 때 props 가 그대로면 다시 그리지 않는다
export default memo(SummaryStrip);
