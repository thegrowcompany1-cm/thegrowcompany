"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 마케팅 인사이트 대시보드 (클라이언트)
//
//  · 상단: 기간 선택(프리셋 + 달력) · 직전 기간 비교 · 요약 띠. 일별 추이 차트는 "일별" 탭에서만 보인다.
//    선택한 기간은 URL 쿼리(?from=YYYY-MM-DD&to=YYYY-MM-DD&compare=1)에 저장돼 새로고침·링크 공유에도 유지된다.
//    기간을 바꿀 때마다 history 에 쌓으므로 브라우저 뒤로가기로 이전 기간으로 돌아온다.
//  · 하위 탭: 실시간 방문자 / 일별 / 랜딩 성과 / 검색·SEO / AI 유입(AEO) / 채널 비교 — 모두 같은 기간을 쓴다.
//  · 모든 날짜 경계는 KST. 기간 리포트는 /api/admin/ga/report 한 번으로 받아 탭이 나눠 쓴다.
//  · 방문한 탭은 언마운트하지 않고 유지한다(KeepAlive) — 비활성 탭은 폴링·타이머를 멈추고, 다시 열면 캐시로 즉시 보인다.
//  · 기간을 바꾸면 새 데이터가 올 때까지 이전 데이터를 그대로 두고 "이전 기간 데이터"임을 표시한다 (화면이 비지 않는다).
//  · 서버 데이터는 useGaData(요청 합치기·짧은 캐시)로 받는다. 캐시는 관리자 계정(scope)별로 분리된다. CSS 클래스 접두사 ga-.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { parseRange, presetRange, rangeLength, todayKst, weekdayKo } from "@/lib/gaRange";
import type { ReportPayload } from "@/lib/gaTypes";
import { AiTab, ChannelTab, DailyTab, LandingTab, SearchTab } from "./DataTabs";
import LiveTab from "./LiveTab";
import WeeklyTab from "./WeeklyTab";
import RangePicker from "./RangePicker";
import SummaryStrip from "./SummaryStrip";
import { ErrBox, GA_STYLE, KeepAlive, ReportSkeleton } from "./ga-shared";
import { setGaScope, useGaData } from "./useGaData";

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

const fmtDay = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}(${weekdayKo(d)})`;
function periodText(from: string, to: string) {
  const n = rangeLength(from, to);
  return from === to ? `${fmtDay(from)} · ${n}일` : `${fmtDay(from)} ~ ${fmtDay(to)} · ${n}일`;
}

export default function GaDashboard({ scope }: { scope: string }) {
  setGaScope(scope); // 관리자 계정이 바뀌면 이전 계정의 캐시를 비운다
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
  // 한 번이라도 열어 본 탭 — 이 탭들만 마운트해 두고 숨긴다
  const [visited, setVisited] = useState<ReadonlySet<TabKey>>(() => new Set([tab]));
  const pickTab = useCallback((k: TabKey) => {
    setTab(k);
    setVisited((v) => (v.has(k) ? v : new Set(v).add(k)));
  }, []);

  // 기간 리포트 — 같은 기간·비교는 캐시를 재사용하고, 기간이 바뀌면 새 응답이 올 때까지 이전 응답을 유지한다
  const reportUrl = `/api/admin/ga/report?from=${from}&to=${to}${compare ? "&compare=1" : ""}`;
  const rep = useGaData<ReportPayload>(reportUrl, { staleMs: 2 * 60_000, keepPrevious: true, netMsg: "네트워크 오류로 리포트를 불러오지 못했습니다." });
  const repErr = rep.error;
  // 새 기간 요청이 실패했는데 보여줄 것이 이전 기간 데이터뿐이면 오해를 막기 위해 숨긴다
  const report = repErr && rep.placeholder ? null : rep.data;
  const switching = rep.placeholder && !repErr; // 이전 데이터를 보여 주며 새 데이터를 기다리는 중
  const rangeMismatch = !!report && (report.from !== from || report.to !== to);

  const rootRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const indRef = useRef<HTMLSpanElement>(null);
  const [stuck, setStuck] = useState(false);

  // 고정 헤더가 위에 붙은 상태에서만 아래 그림자를 준다
  useEffect(() => {
    const el = stickyRef.current;
    if (!el) return;
    let raf = 0;
    const sync = () => {
      raf = 0;
      const top = parseFloat(getComputedStyle(el).top) || 0;
      setStuck(el.getBoundingClientRect().top <= top + 0.5 && window.scrollY > 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(sync);
    };
    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // 탭을 바꾸면 새 탭 내용의 시작 위치로 — 이전 탭을 깊이 내려 보던 중이었을 때만 (맨 위에서는 움직이지 않는다)
  const firstTab = useRef(true);
  useEffect(() => {
    if (firstTab.current) {
      firstTab.current = false;
      return;
    }
    const panel = rootRef.current?.querySelector<HTMLElement>('[role="tabpanel"]:not([hidden])');
    const sticky = stickyRef.current;
    if (!panel || !sticky) return;
    const edge = sticky.getBoundingClientRect().bottom + 8;
    if (panel.getBoundingClientRect().top < edge) window.scrollTo({ top: window.scrollY + panel.getBoundingClientRect().top - edge, behavior: "auto" });
  }, [tab]);

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
  // (카드형 표는 560px 이하에서만 쓰이므로 그때만 라벨을 붙이고, 변경은 프레임당 한 번으로 모은다)
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mq = window.matchMedia("(max-width: 560px)");
    let raf = 0;
    const label = () => {
      raf = 0;
      if (!mq.matches) return;
      root.querySelectorAll("table.ga-table").forEach((t) => {
        const heads = [...t.querySelectorAll("thead th")].map((th) => th.textContent?.trim() ?? "");
        t.querySelectorAll("tbody tr").forEach((tr) => {
          [...tr.children].forEach((td, i) => {
            if (heads[i] && td.getAttribute("data-label") !== heads[i]) td.setAttribute("data-label", heads[i]);
          });
        });
      });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(label);
    };
    schedule();
    const mo = new MutationObserver(schedule);
    mo.observe(root, { childList: true, subtree: true });
    mq.addEventListener("change", schedule);
    const onClick = (e: MouseEvent) => {
      const tr = (e.target as HTMLElement).closest("table.ga-table tbody tr");
      if (!tr || tr.classList.contains("is-click") || !mq.matches) return;
      if (tr.getAttribute("data-open") === "1") tr.removeAttribute("data-open");
      else tr.setAttribute("data-open", "1");
    };
    root.addEventListener("click", onClick);
    return () => {
      mo.disconnect();
      mq.removeEventListener("change", schedule);
      if (raf) cancelAnimationFrame(raf);
      root.removeEventListener("click", onClick);
    };
  }, []);

  // 활성 탭 표시(슬라이딩 인디케이터) — 위치·폭만 갱신하고 CSS 가 transform 으로 움직인다
  useLayoutEffect(() => {
    const box = tabsRef.current;
    const ind = indRef.current;
    if (!box || !ind) return;
    const place = () => {
      const btn = box.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
      if (!btn) return;
      ind.style.width = `${btn.offsetWidth}px`;
      ind.style.transform = `translateX(${btn.offsetLeft}px)`;
      ind.style.opacity = "1";
    };
    place();
    const ro = new ResizeObserver(place);
    box.querySelectorAll('[role="tab"]').forEach((b) => ro.observe(b));
    return () => ro.disconnect();
  }, [tab]);

  // 모바일에서 가로 스크롤되는 탭 줄: 선택한 탭을 가운데로 맞춘다 (모션 줄이기 설정이면 바로 이동)
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    tabsRef.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.scrollIntoView({ block: "nearest", inline: "center", behavior: reduce ? "auto" : "smooth" });
  }, [tab]);

  // 탭 줄이 좌우로 더 있으면 해당 쪽 끝을 페이드로 흐리게 보여 스크롤 가능함을 알린다 (스크롤 때 프레임당 한 번만 갱신)
  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = el.scrollWidth - el.clientWidth;
      el.style.setProperty("--fl", el.scrollLeft > 2 ? "28px" : "0px");
      el.style.setProperty("--fr", el.scrollLeft < max - 2 ? "28px" : "0px");
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    el.addEventListener("scroll", schedule, { passive: true });
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", schedule);
      ro.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const pickDay = useCallback((day: string) => go(day, day, compare), [go, compare]);

  // 탭별 본문. 리포트가 필요한 탭은 리포트가 아직 한 번도 오지 않았을 때만 자리표시를 보여 준다.
  const content = (k: TabKey): ReactNode => {
    if (k === "live") return <LiveTab />;
    if (k === "weekly") return <WeeklyTab />;
    if (!report) return repErr ? null : <ReportSkeleton />;
    return (
      <div className={"ga-data" + (switching ? " is-stale" : "")} aria-busy={switching}>
        {k === "daily" && <DailyTab report={report} onPickDay={pickDay} />}
        {k === "landing" && <LandingTab report={report} from={report.from} to={report.to} />}
        {k === "search" && <SearchTab report={report} from={report.from} to={report.to} />}
        {k === "ai" && <AiTab report={report} />}
        {k === "channel" && <ChannelTab report={report} />}
      </div>
    );
  };

  return (
    <div className="ga" ref={rootRef}>
      <style dangerouslySetInnerHTML={{ __html: GA_STYLE }} />

      <div className={"ga-sticky" + (stuck ? " is-stuck" : "")} ref={stickyRef}>
        <RangePicker from={from} to={to} onChange={(f, t) => go(f, t, compare)} />
        <div className="ga-tabbar">
          <div className="ga-tabs" role="tablist" aria-label="분석 항목" ref={tabsRef}>
            <span className="ga-tab-ind" ref={indRef} aria-hidden="true" />
            {TABS.map((t) => (
              <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => pickTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
          <span className="ga-period" title="선택한 기간 (KST)">{periodText(from, to)}</span>
        </div>
        <div className={"ga-progress" + (switching ? " is-on" : "")} aria-hidden="true" />
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
      {switching && (
        <p className="ga-stale" role="status">
          {rangeMismatch && report
            ? `이전 기간(${periodText(report.from, report.to)}) 데이터를 표시 중입니다 · ${periodText(from, to)} 불러오는 중`
            : "새 설정으로 불러오는 중입니다 · 완료되면 바로 바뀝니다"}
        </p>
      )}

      {repErr && (
        <div style={{ marginBottom: 14 }}>
          <ErrBox title={repErr.code === "PERMISSION_DENIED" ? "접근 권한 오류" : "리포트를 불러오지 못했습니다"} err={repErr} />
        </div>
      )}

      <SummaryStrip report={report} compare={compare} loading={switching} from={from} to={to} />

      {TABS.map((t) =>
        visited.has(t.key) ? (
          <KeepAlive key={t.key} active={tab === t.key}>
            {content(t.key)}
          </KeepAlive>
        ) : null,
      )}

      <p className="ga-note">
        기간 리포트는 GA 집계 특성상 최대 24~48시간 지연될 수 있음
        {rep.at ? ` · 서버 캐시 ${report?.includesToday ? 5 : 10}분 (조회 ${new Date(report?.cachedAt ?? rep.at).toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul", hour12: false })})` : ""}
        {" · 서치콘솔은 약 2~3일 지연, 1시간 캐시"}
        {" · 자체 방문 추적은 /admin 과 봇을 제외한 익명 통계입니다"}
        {" · 모든 날짜는 KST 기준"}
      </p>
    </div>
  );
}
