"use client";

// 주간 AI 리포트 탭 — 최신 리포트 열람 · 지난 리포트 선택 · "지금 생성"
//  · 기간 선택(상단 달력)과 무관하다. 리포트는 매주 금요일 아침 크론이 만들고(KST 08:00), 여기서는 읽기만 한다.
//  · "지금 생성" 은 직전 7일 기준이며 최대 1분쯤 걸린다. 같은 기간이 이미 있으면 덮어쓸지 먼저 묻는다.

import { memo, useCallback, useEffect, useState } from "react";
import MarkdownLite from "./MarkdownLite";
import { Empty, ErrBox, Skel, fetchJson, type ApiError } from "./ga-shared";

type Item = { id: string; period_from: string; period_to: string; created_at: string; status: "ok" | "error" };
type ListRes = { ok: true; reports: Item[]; next: { from: string; to: string } };
type Detail = Item & { summary_md: string | null; error: string | null; model: string | null };
type DetailRes = { ok: true; report: Detail };
type GenRes = { ok: true; status: "ok" | "error"; error: string | null; period: { from: string; to: string } };

const md = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;
const label = (r: Item) => `${md(r.period_from)}~${md(r.period_to)}${r.status === "error" ? " (실패)" : ""}`;
const when = (iso: string) => new Date(iso).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", hour12: false });

function WeeklyTabImpl() {
  const [list, setList] = useState<ListRes | null>(null);
  const [listErr, setListErr] = useState<ApiError | null>(null);
  const [selId, setSelId] = useState<string>("");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailErr, setDetailErr] = useState<ApiError | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const loadList = useCallback(async (pick?: string) => {
    try {
      const d = await fetchJson<ListRes>("/api/admin/ga/weekly-report");
      if (d.ok) {
        setList(d);
        setListErr(null);
        setSelId((cur) => pick ?? (cur && d.reports.some((r) => r.id === cur) ? cur : d.reports[0]?.id ?? ""));
      } else setListErr(d);
    } catch {
      setListErr({ ok: false, code: "NETWORK", message: "네트워크 오류로 리포트 목록을 불러오지 못했습니다." });
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    if (!selId) {
      setDetail(null);
      return;
    }
    const ctrl = new AbortController();
    setDetail(null);
    setDetailErr(null);
    (async () => {
      try {
        const d = await fetchJson<DetailRes>(`/api/admin/ga/weekly-report?id=${selId}`, ctrl.signal);
        if (d.ok) setDetail(d.report);
        else setDetailErr(d);
      } catch (e) {
        if ((e as Error).name !== "AbortError") setDetailErr({ ok: false, code: "NETWORK", message: "리포트를 불러오지 못했습니다." });
      }
    })();
    return () => ctrl.abort();
  }, [selId]);

  const generate = async () => {
    if (!list || busy) return;
    const dup = list.reports.find((r) => r.period_from === list.next.from && r.period_to === list.next.to);
    if (dup && dup.status === "ok" && !window.confirm(`${md(list.next.from)}~${md(list.next.to)} 리포트가 이미 있습니다. 새로 만들어 덮어쓸까요`)) return;
    setBusy(true);
    setMsg("리포트를 만드는 중입니다 — 최대 1분쯤 걸립니다.");
    try {
      const res = await fetch("/api/admin/ga/weekly-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ overwrite: !!dup }),
      });
      const d = (await res.json().catch(() => null)) as GenRes | ApiError | null;
      if (!d) setMsg("응답을 읽지 못했습니다. 잠시 뒤 목록을 새로 확인해주세요.");
      else if (!d.ok) setMsg(d.message);
      else setMsg(d.status === "ok" ? "리포트를 만들었습니다." : `리포트 생성에 실패했습니다 — ${d.error ?? "원인 미상"}`);
      await loadList();
      // 방금 만든 기간을 선택 상태로 (목록 갱신 뒤 같은 기간 행을 찾는다)
      const fresh = await fetchJson<ListRes>("/api/admin/ga/weekly-report");
      if (fresh.ok) {
        const row = fresh.reports.find((r) => r.period_from === fresh.next.from && r.period_to === fresh.next.to);
        if (row) setSelId(row.id);
      }
    } catch {
      setMsg("요청이 중간에 끊겼습니다. 1분쯤 뒤 목록을 새로 확인해주세요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <section className="ga-card">
        <div className="ga-row">
          <h2 className="ga-h" style={{ margin: 0 }}>
            주간 AI 리포트 <span className="ga-sub">· 매주 금요일 08:00 자동 생성 · 직전 7일 vs 그 전 7일 (KST)</span>
          </h2>
          <span className="ga-fsel">
            {list && list.reports.length > 0 && (
              <select className="ga-select" aria-label="리포트 선택" value={selId} onChange={(e) => setSelId(e.target.value)}>
                {list.reports.map((r) => (
                  <option key={r.id} value={r.id}>{label(r)}</option>
                ))}
              </select>
            )}
            <button type="button" className="ga-btn" onClick={generate} disabled={busy || !list}>
              {busy ? "생성 중…" : "지금 생성"}
            </button>
          </span>
        </div>
        {list && <p className="ga-sub" style={{ margin: "0 0 12px" }}>지금 생성하면 {md(list.next.from)}~{md(list.next.to)} 기간으로 만들어집니다 (메일은 자동 생성 때만 발송).</p>}
        {msg && <p className="ga-notice" role="status">{msg}</p>}

        {listErr ? (
          <ErrBox title={listErr.code === "NOT_READY" ? "주간 리포트 준비 중" : "리포트를 불러오지 못했습니다"} err={listErr} />
        ) : !list ? (
          <Skel h={160} />
        ) : list.reports.length === 0 ? (
          <Empty hint="금요일 아침에 자동으로 만들어지고, 위 버튼으로 지금 만들 수도 있습니다">아직 만들어진 주간 리포트가 없습니다</Empty>
        ) : detailErr ? (
          <ErrBox title="리포트를 불러오지 못했습니다" err={detailErr} />
        ) : !detail ? (
          <Skel h={160} />
        ) : detail.status === "error" ? (
          <ErrBox title={`${md(detail.period_from)}~${md(detail.period_to)} 리포트 생성에 실패했습니다`} err={{ ok: false, code: "FAILED", message: detail.error ?? "원인 미상" }} />
        ) : (
          <>
            <p className="ga-sub" style={{ margin: "0 0 4px" }}>
              {detail.period_from} ~ {detail.period_to} · 생성 {when(detail.created_at)}
              {detail.model ? ` · ${detail.model}` : ""}
            </p>
            <MarkdownLite source={detail.summary_md ?? ""} />
          </>
        )}
      </section>
    </div>
  );
}

const WeeklyTab = memo(WeeklyTabImpl);
export default WeeklyTab;
