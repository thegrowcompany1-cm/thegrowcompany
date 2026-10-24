"use client";

// 오늘 한눈에 — 모든 탭 위에 보이는 요약 띠 (카드 5개 + 자동 코멘트 1줄)
//  · 지금 접속은 GA4 실시간 API(60초 갱신), 나머지는 기간 리포트에서 가져온다 (API 변경 없음).
//  · 20초 이상 머문 비율은 자체 방문 추적 기준이다 (같은 세션+경로 3초 묶음 방문 중 duration_sec >= 20).
//    자체 추적 데이터가 없는 기간은 GA 참여율로 대체하고 "(GA 기준)" 을 붙인다.

import { useEffect, useMemo, useState } from "react";
import { buildChannelCompare } from "@/lib/gaInsights";
import type { ReportPayload } from "@/lib/gaTypes";
import { Delta, fetchJson, mmss, num, pct } from "./ga-shared";

type Rt = { ok: true; total: number };
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

export default function SummaryStrip({ report, compare, loading, from, to }: { report: ReportPayload | null; compare: boolean; loading: boolean; from: string; to: string }) {
  const [rt, setRt] = useState<number | null>(null);
  const [stay, setStay] = useState<{ key: string; visits: number; over20: number } | null>(null);

  // 20초 이상 머문 비율 — 자체 추적 (기간이 바뀔 때마다)
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const d = await fetchJson<TrackStay>(`/api/admin/track?view=daily&from=${from}&to=${to}`, ctrl.signal);
        if (d.ok && d.stay) setStay({ key: `${from}|${to}`, ...d.stay });
        else setStay(null);
      } catch {
        if (!ctrl.signal.aborted) setStay(null);
      }
    })();
    return () => ctrl.abort();
  }, [from, to]);

  useEffect(() => {
    const ctrl = new AbortController();
    const load = async () => {
      try {
        const d = await fetchJson<Rt>("/api/admin/ga/realtime", ctrl.signal);
        if (d.ok) setRt(d.total);
      } catch {
        /* 실시간 카드만 "-" 로 남긴다 */
      }
    };
    load();
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 60_000);
    return () => {
      window.clearInterval(id);
      ctrl.abort();
    };
  }, []);

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
  const dash = <>-</>;
  const own = stay && stay.key === `${from}|${to}` && stay.visits > 0 ? stay : null;
  const ownRate = own ? own.over20 / own.visits : null;

  return (
    <section aria-label="오늘 한눈에" style={{ opacity: loading ? 0.6 : 1, transition: "opacity .2s" }}>
      <div className="ga-strip">
        <div className="ga-sc">
          <p className="ga-sc-l">지금 접속 (실시간)</p>
          <p className="ga-sc-v is-live">{rt === null ? dash : <>{num(rt)}<small>명</small></>}</p>
          <p className="ga-sc-s">최근 30분 · 60초 갱신</p>
        </div>
        <div className="ga-sc">
          <p className="ga-sc-l">방문 세션</p>
          <p className="ga-sc-v">{t ? <>{num(t.sessions)}<small>세션</small></> : dash}</p>
          {t && p && <Delta cur={t.sessions} prev={p.sessions} kind="rel" label="" />}
          {t && <p className="ga-sc-s">사용자 {num(t.users)}명 · 평균 {mmss(t.avgSessionDuration)}</p>}
        </div>
        <div className="ga-sc" title="자체 방문 추적 기준 — 같은 세션·경로 3초 묶음 방문 중 20초 이상 머문 비율. 추적 데이터가 없는 기간은 GA 참여율로 대신 보여줍니다">
          <p className="ga-sc-l">20초 이상 머문 비율{t && ownRate === null ? " (GA 기준)" : ""}</p>
          <p className="ga-sc-v">{ownRate !== null ? pct(ownRate) : t ? pct(t.engagementRate) : dash}</p>
          {ownRate !== null && t && <p className="ga-sc-s">GA 참여율 {pct(t.engagementRate)}</p>}
          {ownRate === null && t && p && <Delta cur={t.engagementRate} prev={p.engagementRate} kind="pp" label="" />}
          {ownRate === null && t && !p && <p className="ga-sc-s">GA 참여 세션 기준 (10초 이상)</p>}
        </div>
        <div className="ga-sc">
          <p className="ga-sc-l">키 이벤트 (문의·결제)</p>
          <p className="ga-sc-v">{t ? <>{num(t.keyEvents)}<small>건</small></> : dash}</p>
          {t && p && <Delta cur={t.keyEvents} prev={p.keyEvents} kind="rel" label="" />}
        </div>
        <div className="ga-sc">
          <p className="ga-sc-l">메타광고 vs 자연검색</p>
          <p className="ga-sc-v">{mix ? <>{(mix.meta * 100).toFixed(0)}%<small> vs </small>{(mix.organic * 100).toFixed(0)}%</> : dash}</p>
          <p className="ga-sc-s">전체 세션 대비 비중</p>
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
