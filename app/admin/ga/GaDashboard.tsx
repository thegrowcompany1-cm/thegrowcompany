"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 마케팅 인사이트 대시보드 (클라이언트)
//
//  · 상단: 기간 선택(프리셋 + 달력) · 직전 기간 비교. KPI 카드 5개(요약)는 "대시보드" 탭에서만, 일별 추이 차트는 "일별" 탭에서만 보인다.
//    선택한 기간은 URL 쿼리(?from=YYYY-MM-DD&to=YYYY-MM-DD&compare=1)에 저장돼 새로고침·링크 공유에도 유지된다.
//    기간을 바꿀 때마다 history 에 쌓으므로 브라우저 뒤로가기로 이전 기간으로 돌아온다.
//  · 탭: 대시보드 / 실시간 방문자 / 일별 / 랜딩 성과 / 검색·SEO / AI 유입(AEO) / 채널 비교 / 주간 리포트 — 모두 같은 기간을 쓴다.
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
  { key: "dashboard", label: "대시보드" },
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

  const [tab, setTab] = useState<TabKey>(() => (TABS.some((t) => t.key === sp.get("tab")) ? (sp.get("tab") as TabKey) : "dashboard"));
  // 한 번이라도 열어 본 탭 — 이 탭들만 마운트해 두고 숨긴다
  const [visited, setVisited] = useState<ReadonlySet<TabKey>>(() => new Set([tab]));
  const tabRef = useRef<TabKey>(tab);
  // 탭 버튼에 마우스를 잠깐 올려 두거나 키보드로 포커스하면, 아직 열어 보지 않은 탭을 숨긴 채 미리 만들어 둔다 (클릭 직전의 신호).
  // 그러면 클릭할 때는 이미 만들어진 화면을 보이기만 해서 첫 진입도 재진입처럼 빠르고, 그 탭의 데이터 요청도 그만큼 일찍 시작된다.
  // 지나가기만 하는 탭은 대기 중에 취소되어 아무것도 만들지 않는다.
  const warmTimer = useRef(0);
  const warm = useCallback((k: TabKey, delay: number) => {
    window.clearTimeout(warmTimer.current);
    const go = () => setVisited((v) => (v.has(k) ? v : new Set(v).add(k)));
    if (delay > 0) warmTimer.current = window.setTimeout(go, delay);
    else go();
  }, []);
  useEffect(() => () => window.clearTimeout(warmTimer.current), []);
  const pickTab = useCallback((k: TabKey) => {
    // 탭 줄(표시기·선택 상태)과 본문 전환은 한 번에(동기) 렌더한다.
    // (표시기를 먼저 그리고 본문을 다음 작업에서 렌더하는 두 단계 방식은 본문이 더 늦게 나와 오히려 끊겨 보여 쓰지 않는다 — 측정 결과 참고)
    // 액체 알약·화면 등장 모션은 상태가 바뀐 직후의 레이아웃 효과(아래 [tab] 효과)에서 시작한다.
    tabRef.current = k;
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
  const pill = useRef({ x1: 0, x2: 0, W: 0, raf: 0, first: true });
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
    if (window.scrollY < 48) return; // 맨 위에서는 보정할 것이 없다 — 레이아웃을 읽지 않는다 (클릭 경로의 강제 레이아웃 방지)
    const panel = rootRef.current?.querySelector<HTMLElement>('[role="tabpanel"]:not([hidden])');
    const sticky = stickyRef.current;
    if (!panel || !sticky) return;
    const edge = sticky.getBoundingClientRect().bottom + 8;
    if (panel.getBoundingClientRect().top < edge) window.scrollTo({ top: window.scrollY + panel.getBoundingClientRect().top - edge, behavior: "auto" });
  }, [tab]);

  // 인터랙티브 글래스: 루트 한 곳에서 포인터를 받아 KPI 카드(.ga-sc)의 빛 위치(--mx/--my)만 프레임당 한 번 갱신한다 (React 상태 없음).
  //  · 마우스: 커서를 따라 반사광·테두리 하이라이트가 움직인다. 나가면 CSS 전환으로 부드럽게 꺼진다.
  //  · 터치: 호버가 없으므로 누른 지점에서 빛이 켜지고 손을 떼면 꺼진다 (data-press).
  //  · 차트: 누르면 점에서 파동이 퍼진다.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let card: HTMLElement | null = null;
    let px = 0;
    let py = 0;
    let pressed: HTMLElement | null = null;
    const place = () => {
      raf = 0;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${px - r.left}px`);
      card.style.setProperty("--my", `${py - r.top}px`);
    };
    const track = (c: HTMLElement, x: number, y: number) => {
      card = c;
      px = x;
      py = y;
      if (!raf) raf = requestAnimationFrame(place);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || reduce.matches) return;
      const c = (e.target as Element).closest<HTMLElement>(".ga-sc");
      if (c) track(c, e.clientX, e.clientY);
    };
    const release = () => {
      pressed?.removeAttribute("data-press");
      pressed = null;
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element;
      const c = t.closest<HTMLElement>(".ga-sc");
      if (c) {
        if (!reduce.matches) track(c, e.clientX, e.clientY);
        c.setAttribute("data-press", "");
        pressed = c;
      }
      if (!reduce.matches && t.closest(".ga-tc [data-ga-plot]")) {
        t.closest(".ga-tc")?.querySelectorAll<HTMLElement>(".ga-tc-dot").forEach((d) => {
          d.animate([{ transform: "scale(1)", opacity: 0.8 }, { transform: "scale(3.2)", opacity: 0 }], { duration: 520, easing: "cubic-bezier(.16,1,.3,1)", pseudoElement: "::after" });
        });
      }
    };
    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

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
  // 이미 처리한 행은 WeakSet 으로 건너뛴다 — 예전에는 DOM 이 바뀔 때마다 모든 탭의 모든 칸을 다시 훑어 첫 진입이 느렸다.
  // 5칸 이상인 행에는 data-more 를 붙여 "탭하여 자세히 보기" 표시를 CSS 속성 선택자로 처리한다 (:has() 는 행마다 하위 구조를 다시 평가해 비싸다).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mq = window.matchMedia("(max-width: 560px)");
    let raf = 0;
    const done = new WeakSet<Element>();
    const label = () => {
      raf = 0;
      if (!mq.matches) return;
      root.querySelectorAll("table.ga-table").forEach((t) => {
        let heads: string[] | null = null;
        t.querySelectorAll("tbody tr").forEach((tr) => {
          if (done.has(tr)) return;
          done.add(tr);
          heads ??= [...t.querySelectorAll("thead th")].map((th) => th.textContent?.trim() ?? "");
          if (tr.children.length >= 5) tr.setAttribute("data-more", "");
          [...tr.children].forEach((td, i) => {
            if (heads![i] && td.getAttribute("data-label") !== heads![i]) td.setAttribute("data-label", heads![i]);
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
      if (!tr) return;
      // 행 선택(고정): 고른 행을 강조하고 다시 누르면 해제한다. 연동 행(is-link)·일별 행(is-click)은 자체 동작이 있다.
      if (!tr.classList.contains("is-click") && !tr.classList.contains("is-link")) {
        const on = tr.getAttribute("data-sel") === "1";
        tr.closest("tbody")?.querySelectorAll("tr[data-sel]").forEach((r) => r.removeAttribute("data-sel"));
        if (!on) tr.setAttribute("data-sel", "1");
      }
      if (tr.classList.contains("is-click") || !mq.matches) return;
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

  // 액체 알약(Liquid Pill) — 알약은 탭 줄 전체 폭의 한 장 레이어이고, 보이는 모양은 clip-path: inset(위 R 아래 L round) 로 오려 낸다.
  //  · 다음 탭으로 갈 때 앞쪽 끝(이동 방향의 끝)은 먼저·빠르게, 뒤쪽 끝은 조금 늦게·느리게 움직인다 → 알약이 늘어났다가 도착하면서 줄어든다.
  //  · 두 끝을 따로 움직이는 JS 트윈(rAF)이라 연속 클릭에도 "지금 모양"에서 이어서 새 목표로 간다 (처음 위치로 튀지 않는다).
  //  · 탭 좌표는 처음·크기 변경 때만 측정해 캐시한다. 알약 레이어(작은 한 요소)의 clip-path 만 쓰므로 표·차트에는 영향이 없다.
  const geoRef = useRef<Record<string, { x: number; w: number }>>({});
  const paintPill = useCallback(() => {
    const ind = indRef.current;
    if (!ind) return;
    const s = pill.current;
    const ring = ind.firstElementChild as HTMLElement | null;
    const fill = ind.lastElementChild as HTMLElement | null;
    if (!ring || !fill) return;
    const l = Math.max(0, s.x1);
    const r = Math.max(0, s.W - s.x2);
    ring.style.clipPath = `inset(0 ${r}px 0 ${l}px round 999px)`;
    fill.style.clipPath = `inset(1px ${r + 1}px 1px ${l + 1}px round 999px)`;
  }, []);
  const snapPill = useCallback(() => {
    const g = geoRef.current[tabRef.current];
    const ind = indRef.current;
    if (!g || !ind) return;
    const s = pill.current;
    s.x1 = g.x;
    s.x2 = g.x + g.w;
    paintPill();
    ind.style.opacity = "1";
  }, [paintPill]);
  useLayoutEffect(() => {
    const box = tabsRef.current;
    const ind = indRef.current;
    if (!box || !ind) return;
    const measure = () => {
      box.querySelectorAll<HTMLElement>('[role="tab"]').forEach((b) => {
        geoRef.current[b.dataset.k as string] = { x: b.offsetLeft, w: b.offsetWidth };
      });
      pill.current.W = box.scrollWidth;
      ind.style.width = `${box.scrollWidth}px`;
      if (!pill.current.raf) snapPill(); // 움직이는 중이면 트윈이 매 프레임 최신 좌표를 목표로 삼는다
    };
    measure();
    const ro = new ResizeObserver(measure);
    box.querySelectorAll('[role="tab"]').forEach((b) => ro.observe(b));
    ro.observe(box);
    return () => ro.disconnect();
  }, [snapPill]);
  // 탭이 바뀌면(상태 반영 직후, 첫 그림 전): 막(커튼)을 덮고, 다음 프레임부터 알약을 늘렸다 줄인다
  useLayoutEffect(() => {
    const s = pill.current;
    const g = geoRef.current[tab];
    if (s.first) {
      s.first = false;
      snapPill();
      return;
    }
    if (!g) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cancelAnimationFrame(s.raf);
      s.raf = 0;
      snapPill();
      return;
    }
    cancelAnimationFrame(s.raf);
    const from1 = s.x1;
    const from2 = s.x2;
    const dist = Math.abs(g.x + g.w / 2 - (from1 + from2) / 2);
    const right = g.x + g.w / 2 > (from1 + from2) / 2;
    const extra = Math.min(140, dist * 0.1);
    const LEAD = { delay: 0, dur: 330 + extra, ease: (t: number) => 1 - Math.pow(1 - t, 3) }; // 앞쪽 끝: 먼저, 빠르게 (ease-out)
    const TRAIL = { delay: 100, dur: 450 + extra, ease: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) }; // 뒤쪽 끝: 늦게 출발해 천천히 (ease-in-out)
    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
    let t0 = 0;
    const step = (now: number) => {
      if (!t0) t0 = now;
      const T = geoRef.current[tabRef.current] ?? g; // 목표는 매 프레임 최신 캐시 좌표 (크기가 바뀌어도 어긋나지 않는다)
      const e = now - t0;
      const p1 = (right ? TRAIL : LEAD);
      const p2 = (right ? LEAD : TRAIL);
      s.x1 = from1 + (T.x - from1) * p1.ease(clamp01((e - p1.delay) / p1.dur));
      s.x2 = from2 + (T.x + T.w - from2) * p2.ease(clamp01((e - p2.delay) / p2.dur));
      // 멀리 있는 탭이어도 알약이 탭 줄을 덮지 않도록 늘어나는 길이에 상한을 둔다 (큰 쪽 폭 + 260px)
      const cap = Math.max(from2 - from1, T.w) + 260;
      if (s.x2 - s.x1 > cap) { if (right) s.x1 = s.x2 - cap; else s.x2 = s.x1 + cap; }
      if (e < Math.max(LEAD.delay + LEAD.dur, TRAIL.delay + TRAIL.dur)) {
        paintPill();
        s.raf = requestAnimationFrame(step);
      } else {
        s.raf = 0;
        snapPill();
      }
    };
    s.raf = requestAnimationFrame(step);
  }, [tab, snapPill, paintPill]);
  useEffect(() => () => cancelAnimationFrame(pill.current.raf), []);

  // 모바일에서 가로 스크롤되는 탭 줄: 선택한 탭을 가운데로 맞춘다 (모션 줄이기 설정이면 바로 이동)
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // 새 탭 본문이 먼저 그려진 뒤에 (클릭 직후 첫 프레임을 늦추지 않도록) 실행한다
    const id = window.setTimeout(() => {
      tabsRef.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.scrollIntoView({ block: "nearest", inline: "center", behavior: reduce ? "auto" : "smooth" });
    }, 120);
    return () => window.clearTimeout(id);
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

  // 기간 리포트를 쓰는 화면(대시보드·분석 탭)에서만 기간 안내를 보인다 — 실시간·주간 리포트는 기간과 무관
  const periodTab = tab !== "live" && tab !== "weekly";

  const pickDay = useCallback((day: string) => go(day, day, compare), [go, compare]);

  // 탭별 본문. 리포트가 필요한 탭은 리포트가 아직 한 번도 오지 않았을 때만 자리표시를 보여 준다.
  const content = (k: TabKey): ReactNode => {
    if (k === "live") return <LiveTab />;
    if (k === "weekly") return <WeeklyTab />;
    if (k === "dashboard") return <SummaryStrip report={report} compare={compare} loading={switching} from={from} to={to} />;
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
            <span className="ga-tab-ind" ref={indRef} aria-hidden="true">
              <i />
              <i />
            </span>
            {TABS.map((t) => (
              <button key={t.key} type="button" role="tab" data-k={t.key} aria-selected={tab === t.key} onClick={() => pickTab(t.key)} onPointerEnter={(e) => e.pointerType === "mouse" && warm(t.key, 160)} onPointerLeave={() => window.clearTimeout(warmTimer.current)} onFocus={() => warm(t.key, 0)}>
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
      {periodTab && to >= today && (
        <p className="ga-notice" role="note">
          오늘이 포함된 기간입니다 — 집계 지연으로 오늘 숫자가 작게 보일 수 있습니다 (실시간 탭은 즉시 반영)
        </p>
      )}
      {periodTab && switching && (
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

      <div className="ga-stage">
        {TABS.map((t) =>
          visited.has(t.key) ? (
            <KeepAlive key={t.key} active={tab === t.key}>
              {content(t.key)}
            </KeepAlive>
          ) : null,
        )}
      </div>

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
