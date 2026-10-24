"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 익명 방문 추적 — /admin/ga 의 "실시간 방문자 · 여정 · 섹션 이탈" 데이터를 만든다
//
//  · 루트 레이아웃에 한 번만 둔다. 화면에 아무것도 그리지 않는다.
//  · /admin, /api 경로와 봇 UA 는 추적하지 않는다.
//  · 수집하는 것: 익명 방문자 UUID(localStorage), 세션 ID(30분 무활동 시 갱신), 경로(쿼리 제외),
//    유입(referrer·utm), 기기 종류, 체류 시간, 최대 스크롤, 마지막으로 본 섹션.
//    이름·전화·이메일 등 개인정보는 읽지도 보내지도 않는다. IP 는 서버도 저장하지 않는다.
//  · 전송: 진입 시 start, 15초마다 ping, 이탈(pagehide·경로 이동) 시 end — 이탈은
//    navigator.sendBeacon(text/plain JSON). 모두 POST /api/track.
//  · 섹션: [data-track-section="이름"] 요소의 "보이는 높이"가 min(섹션 높이의 50%, 화면 높이의 50%) 이상이면
//    섹션당 한 번만 기록한다. (화면 높이의 2배가 넘는 긴 섹션은 비율 50% 가 영영 차지 않아 예전에는 기록되지 않았다 — 2026-10-25 수정)
//  · 체류 시간은 탭이 보이는 동안만 센다 (백그라운드 탭은 세지 않는다).
//  · 쿠키를 쓰지 않는다. localStorage 를 쓸 수 없는 환경이면 조용히 아무것도 하지 않는다.
//  · 중복 방지 가드: 인앱 브라우저(인스타그램 등)에서 진입 때 이 코드가 두 번 실행돼 같은 페이지의
//    visits 가 수십 ms 간격으로 2행 생기던 문제를 막는다. 같은 세션 + 같은 경로로 2초 안에 다시
//    실행되면 두 번째 인스턴스는 start·핑·섹션·이탈을 아무것도 보내지 않고 첫 인스턴스의 visit id 만
//    쓴다 (sessionStorage 가드 + 모듈 변수 가드). 첫 인스턴스가 정리된 직후라면(React 개발 모드의
//    이펙트 재실행·새로고침) 이어받아 start 없이 핑만 이어 간다.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const ENDPOINT = "/api/track";
const PING_MS = 15_000;
const SESSION_IDLE_MS = 30 * 60 * 1000;
const EXCLUDED = ["/admin", "/api"];

const LS_VISITOR = "tgc:vt:visitor";
const LS_SESSION = "tgc:vt:session"; // { id, last, src }

const BOT_RE = /bot|crawl|spider|slurp|facebookexternalhit|bingpreview|headless|lighthouse|pagespeed|monitor|uptime/i;
const AI_RE = /chatgpt\.com|chat\.openai\.com|openai\.com|perplexity\.ai|gemini\.google\.com|copilot\.microsoft\.com|claude\.ai|wrtn/i;
const META_SRC_RE = /facebook|^fb$|instagram|^ig$|meta/i;

type SourceType = "paid_meta" | "organic_google" | "organic_naver" | "organic_other" | "ai" | "direct" | "referral";
type Session = { id: string; last: number; src: SourceType; utm: { s: string; m: string; c: string }; ref: string };

const uuid = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      });

function isExcluded(path: string) {
  return EXCLUDED.some((p) => path === p || path.startsWith(p + "/"));
}

function deviceOf(): "mobile" | "tablet" | "desktop" {
  const ua = navigator.userAgent;
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return "tablet";
  if (/Mobi|iPhone|Android/i.test(ua)) return "mobile";
  return "desktop";
}

/** utm · referrer 로 유입 유형을 정한다 (세션의 첫 페이지에서 한 번만) */
function classify(search: URLSearchParams, referrer: string): { type: SourceType; utm: { s: string; m: string; c: string } } {
  const s = (search.get("utm_source") ?? "").toLowerCase();
  const m = (search.get("utm_medium") ?? "").toLowerCase();
  const c = search.get("utm_campaign") ?? "";
  const utm = { s: s.slice(0, 100), m: m.slice(0, 100), c: c.slice(0, 150) };

  let host = "";
  try {
    host = referrer ? new URL(referrer).hostname.toLowerCase() : "";
  } catch {
    host = "";
  }
  if (host === location.hostname) host = ""; // 사이트 내부 이동은 유입이 아니다

  if (AI_RE.test(s) || AI_RE.test(host)) return { type: "ai", utm };
  const paidMedium = /paid|cpc|ppc|ads?|social_paid|paid_social/.test(m);
  if (search.get("fbclid") || (META_SRC_RE.test(s) && (paidMedium || !host)) || (META_SRC_RE.test(s) && paidMedium)) {
    return { type: "paid_meta", utm };
  }
  if (/(^|\.)google\.[a-z.]+$/.test(host) && !/mail|docs|drive/.test(host)) return { type: "organic_google", utm };
  if (/(^|\.)naver\.com$/.test(host)) return { type: "organic_naver", utm };
  if (/(^|\.)(daum\.net|bing\.com|duckduckgo\.com|yahoo\.com|zum\.com)$/.test(host)) return { type: "organic_other", utm };
  if (s || host) return { type: "referral", utm };
  return { type: "direct", utm };
}

/** referrer 는 출처 사이트와 경로까지만 남긴다 (쿼리스트링에 검색어 등이 들어 있을 수 있다) */
function stripReferrer(referrer: string): string {
  try {
    const u = new URL(referrer);
    return `${u.origin}${u.pathname}`.slice(0, 300);
  } catch {
    return "";
  }
}

function readSession(search: URLSearchParams, referrer: string): Session {
  const now = Date.now();
  try {
    const raw = localStorage.getItem(LS_SESSION);
    if (raw) {
      const s = JSON.parse(raw) as Session;
      if (s && s.id && now - s.last < SESSION_IDLE_MS) return { ...s, last: now };
    }
  } catch {
    /* 새 세션으로 */
  }
  const { type, utm } = classify(search, referrer);
  return { id: uuid().replace(/-/g, "").slice(0, 24), last: now, src: type, utm, ref: stripReferrer(referrer) };
}

function saveSession(s: Session) {
  try {
    localStorage.setItem(LS_SESSION, JSON.stringify(s));
  } catch {
    /* 무시 */
  }
}

function visitorId(): string | null {
  try {
    let v = localStorage.getItem(LS_VISITOR);
    if (!v) {
      v = uuid();
      localStorage.setItem(LS_VISITOR, v);
    }
    return v;
  } catch {
    return null;
  }
}

// ── 진입 중복 가드 ──────────────────────────────────────────────────────────
const GUARD_KEY = "tgc:vt:guard";
const GUARD_MS = 2000;
/** 정리(React cleanup) 뒤 이탈 전송을 잠깐 미뤄 두는 시간 — 바로 이어받는 인스턴스가 취소할 수 있게 */
const END_DEFER_MS = 400;
type Guard = { key: string; at: number; id: string; alive: boolean };
let memGuard: Guard | null = null; // sessionStorage 를 못 쓰는 환경 대비
const pendingEnds = new Map<string, number>();

function readGuard(): Guard | null {
  let stored: Guard | null = null;
  try {
    const raw = sessionStorage.getItem(GUARD_KEY);
    if (raw) {
      const g = JSON.parse(raw) as Guard;
      if (g && g.key && g.id) stored = g;
    }
  } catch {
    /* 모듈 변수로 대신한다 */
  }
  if (stored && memGuard) return stored.at >= memGuard.at ? stored : memGuard;
  return stored ?? memGuard;
}

function writeGuard(g: Guard) {
  memGuard = g;
  try {
    sessionStorage.setItem(GUARD_KEY, JSON.stringify(g));
  } catch {
    /* 무시 */
  }
}

function send(payload: Record<string, unknown>, beacon = false) {
  const body = JSON.stringify(payload);
  try {
    if (beacon && typeof navigator.sendBeacon === "function") {
      if (navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "text/plain" }))) return;
    }
    void fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "text/plain" }, body, keepalive: true }).catch(() => {});
  } catch {
    /* 추적 실패는 사이트에 영향을 주지 않는다 */
  }
}

export default function VisitTracker() {
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isExcluded(pathname) || BOT_RE.test(navigator.userAgent)) return;
    const vid = visitorId();
    if (!vid) return;

    const search = new URLSearchParams(window.location.search);
    const session = readSession(search, document.referrer);
    saveSession(session);

    // 같은 세션 + 같은 경로로 2초 안에 다시 실행된 인스턴스는 방문을 새로 만들지 않는다
    const key = `${session.id}|${pathname}`;
    const guard = readGuard();
    let visitId: string;
    let sendStart = true;
    if (guard && guard.key === key && Date.now() - guard.at < GUARD_MS) {
      visitId = guard.id;
      sendStart = false;
      if (guard.alive) return; // 이미 다른 인스턴스가 이 방문을 맡고 있다 — 아무것도 보내지 않는다
      // 맡던 인스턴스가 방금 정리됐다 (개발 모드 이펙트 재실행 · 새로고침) — 이어받는다
      const timer = pendingEnds.get(guard.id);
      if (timer) {
        window.clearTimeout(timer);
        pendingEnds.delete(guard.id);
      }
      writeGuard({ ...guard, alive: true });
    } else {
      visitId = uuid();
      writeGuard({ key, at: Date.now(), id: visitId, alive: true });
    }
    const markDead = () => {
      const g = readGuard();
      if (g && g.id === visitId) writeGuard({ ...g, alive: false });
    };
    const base = { visitorId: vid, sessionId: session.id };
    let maxScroll = 0;
    let lastSection = "";
    let activeMs = 0;
    let visibleSince: number | null = document.visibilityState === "visible" ? Date.now() : null;
    let ended = false;
    const seen = new Set<string>();

    const durationSec = () => Math.round((activeMs + (visibleSince ? Date.now() - visibleSince : 0)) / 1000);
    const touchSession = () => {
      session.last = Date.now();
      saveSession(session);
    };

    if (sendStart) {
      send({
        type: "start",
        id: visitId,
        ...base,
        path: pathname,
        referrer: session.ref,
        utmSource: session.utm.s,
        utmMedium: session.utm.m,
        utmCampaign: session.utm.c,
        sourceType: session.src,
        device: deviceOf(),
      });
    }

    const report = (type: "ping" | "end", beacon = false) => {
      if (ended) return;
      if (type === "end") ended = true;
      send({ type, id: visitId, ...base, durationSec: durationSec(), maxScrollPct: Math.round(maxScroll), lastSection }, beacon);
    };

    // 스크롤 깊이 (passive + rAF)
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const doc = document.documentElement;
        const total = doc.scrollHeight;
        if (total > 0) maxScroll = Math.max(maxScroll, Math.min(100, ((window.scrollY + window.innerHeight) / total) * 100));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // 섹션 노출 — 같은 섹션은 한 번만. 보이는 높이가 min(섹션 50%, 화면 50%) 이상일 때 기록한다.
    const io =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            (entries) => {
              for (const en of entries) {
                if (!en.isIntersecting) continue;
                const name = en.target.getAttribute("data-track-section");
                if (!name) continue;
                const viewH = en.rootBounds?.height ?? window.innerHeight;
                const need = Math.min(en.boundingClientRect.height * 0.5, viewH * 0.5);
                if (en.intersectionRect.height < need) continue;
                lastSection = name;
                if (seen.has(name)) continue;
                seen.add(name);
                io?.unobserve(en.target);
                send({ type: "section", ...base, path: pathname, section: name });
              }
            },
            { threshold: [0, 0.25, 0.5, 0.75, 1] },
          );
    const watched = new WeakSet<Element>();
    const scan = () => {
      if (!io) return;
      document.querySelectorAll("[data-track-section]").forEach((el) => {
        if (watched.has(el)) return;
        watched.add(el);
        io.observe(el);
      });
    };
    scan();
    // 클라이언트에서 늦게 그려지는 섹션 · HTML 주입 페이지 대응 (디바운스)
    let scanTimer = 0;
    const mo = new MutationObserver(() => {
      window.clearTimeout(scanTimer);
      scanTimer = window.setTimeout(scan, 300);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // 탭 가시성 — 숨겨진 동안은 체류 시간을 세지 않는다
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (visibleSince) activeMs += Date.now() - visibleSince;
        visibleSince = null;
        report("ping", true);
      } else {
        visibleSince = Date.now();
        touchSession();
      }
    };
    const onPageHide = () => {
      if (visibleSince) {
        activeMs += Date.now() - visibleSince;
        visibleSince = null;
      }
      markDead();
      report("end", true);
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);

    const pingTimer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      touchSession();
      report("ping");
    }, PING_MS);

    return () => {
      // 경로 이동(SPA)·언마운트 — 이 페이지 방문을 마무리한다
      window.clearInterval(pingTimer);
      window.clearTimeout(scanTimer);
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      io?.disconnect();
      mo.disconnect();
      if (visibleSince) {
        activeMs += Date.now() - visibleSince;
        visibleSince = null;
      }
      markDead();
      // 바로 보내지 않고 잠깐 미룬다 — 곧바로 이어받는 인스턴스(개발 모드 재실행 등)가 취소할 수 있다.
      // 실제 경로 이동이면 0.4초 뒤 그대로 전송된다.
      const timer = window.setTimeout(() => {
        pendingEnds.delete(visitId);
        report("end", true);
      }, END_DEFER_MS);
      pendingEnds.set(visitId, timer);
    };
  }, [pathname]);

  return null;
}
