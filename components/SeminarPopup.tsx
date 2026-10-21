"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 피트니스 성장 마스터키 세미나 — 사이트 전체 우하단 팝업 (app/layout.tsx 에서 한 번만 마운트)
//
//  · 제외 경로: /edu/sales-ops · /edu/sales-ops2 · /edu/sales-ops3 · /checkout… · /admin…
//  · 노출 기간: lib/salesOps.ts 의 SO_POPUP_END 이후에는 아무것도 그리지 않는다.
//  · 진입 3초 뒤 아래에서 올라오며 나타난다 (모션 줄이기면 바로 표시).
//  · 닫기: X → 이 브라우저 세션 동안 닫음(sessionStorage) / "오늘 하루 보지 않기" → 오늘 날짜(KST)를 localStorage 에 저장.
//    저장소 접근은 전부 try/catch — 막혀 있어도 팝업은 동작한다(그 경우 새로고침하면 다시 뜬다).
//  · 하단 고정 CTA(data-sticky-cta 가 붙은 요소)가 화면 아래에 떠 있으면 그 높이만큼 팝업을 위로 띄운다.
//  · 측정: popup_view / popup_click / popup_close (GA4) + 메타 커스텀 이벤트, landing="popup-sales-ops".
//    클릭하면 /edu/sales-ops?from=popup 으로 가고, 신청 페이지가 결제 신청 정보의 landing 에 같은 값을 남긴다.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SO_LANDING_POPUP,
  SO_POPUP_END,
  SO_PRICE_STORY,
  soFormatPrice,
} from "@/lib/salesOps";
import { so3FbCustom, so3Ga } from "@/lib/salesOps3Track";

const EXCLUDE = ["/edu/sales-ops", "/edu/sales-ops2", "/edu/sales-ops3", "/checkout", "/admin"];
const DELAY_MS = 3000;
const K_SESSION = "tgc:popup:so:closed";
const K_HIDE_DAY = "tgc:popup:so:hide";

const isExcluded = (path: string) => EXCLUDE.some((p) => path === p || path.startsWith(p + "/"));

/** 오늘 날짜(KST) — "2026-10-21" */
const todayKst = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });

function readStore(kind: "session" | "local", key: string): string | null {
  try {
    return (kind === "session" ? window.sessionStorage : window.localStorage).getItem(key);
  } catch {
    return null;
  }
}
function writeStore(kind: "session" | "local", key: string, value: string) {
  try {
    (kind === "session" ? window.sessionStorage : window.localStorage).setItem(key, value);
  } catch {
    /* 저장소가 막혀 있어도 팝업 동작에는 영향 없음 */
  }
}

const CSS = `
.smp{position:fixed;right:24px;bottom:calc(24px + var(--smp-lift,0px));z-index:45;width:320px;max-width:calc(100vw - 32px);padding:12px;border:1px solid #E5E5E5;border-radius:16px;background:#FFFFFF;box-shadow:0 8px 24px rgba(0,0,0,.18);color:#333333;font-family:inherit;word-break:keep-all;opacity:0;transform:translateY(24px);visibility:hidden;transition:opacity .4s ease,transform .4s ease,bottom .25s ease,visibility 0s linear .4s}
.smp.is-on{opacity:1;transform:none;visibility:visible;transition-delay:0s}
.smp *{box-sizing:border-box}
.smp-row{display:flex;align-items:center;gap:8px}
.smp-av{flex:0 0 auto;display:flex;padding-left:0}
.smp-av img{width:40px;height:40px;border-radius:50%;object-fit:cover;object-position:center top;border:2px solid #FFFFFF;background:#EEEEEE;display:block}
.smp-av img+img{margin-left:-16px}
.smp-tx{min-width:0;flex:1}
.smp-eb{margin:0;padding-right:30px;font-size:12px;font-weight:700;line-height:1.35;color:#007A14}
.smp-ti{margin:1px 0 0;font-size:17px;font-weight:900;line-height:1.3;color:#111111}
.smp-su{margin:1px 0 0;font-size:12px;line-height:1.4;color:#555555;letter-spacing:-.04em;white-space:nowrap}
.smp-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px}
.smp-go{display:inline-flex;align-items:center;height:28px;padding:0 12px;border-radius:8px;background:#009519;color:#fff;font-size:13px;font-weight:800;text-decoration:none}
.smp-go::after{content:"";position:absolute;inset:0;border-radius:16px}
.smp-go:focus-visible{outline:2px solid #111111;outline-offset:3px}
.smp-skip{position:relative;z-index:2;height:28px;padding:0 4px;border:0;background:none;color:#777777;font:inherit;font-size:12px;text-decoration:underline;text-underline-offset:3px;cursor:pointer}
.smp-skip:hover{color:#111111}
.smp-x{position:absolute;top:0;right:0;z-index:3;width:44px;height:44px;border:0;background:none;color:#666666;cursor:pointer;display:grid;place-items:center}
.smp-x:hover{color:#111111}
.smp-x svg{width:14px;height:14px}
.smp button:focus-visible{outline:2px solid #111111;outline-offset:-2px;border-radius:8px}
@media(max-width:639px){.smp{right:16px;left:16px;width:auto;max-width:340px;margin-left:auto;margin-right:auto;bottom:calc(28px + var(--smp-lift,0px) + env(safe-area-inset-bottom))}}
@media(max-width:359px){.smp-su{white-space:normal}}
@media(prefers-reduced-motion:reduce){.smp,.smp.is-on{transition:none;transform:none}}
`;

export default function SeminarPopup() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const viewed = useRef(false);

  const excluded = isExcluded(pathname ?? "");

  // 진입 3초 뒤 표시 — 경로가 바뀔 때마다 다시 센다. 기간 종료·닫음·오늘 숨김이면 시작하지 않는다.
  useEffect(() => {
    setShow(false);
    if (excluded) return;
    if (Date.now() >= Date.parse(SO_POPUP_END)) return;
    if (readStore("session", K_SESSION) === "1") return;
    if (readStore("local", K_HIDE_DAY) === todayKst()) return;
    const t = window.setTimeout(() => setShow(true), DELAY_MS);
    return () => window.clearTimeout(t);
  }, [pathname, excluded]);

  // 노출 측정 — 표시될 때 1회 (같은 페이지에서 다시 그려져도 중복 전송하지 않는다)
  useEffect(() => {
    if (!show) {
      viewed.current = false;
      return;
    }
    if (viewed.current) return;
    viewed.current = true;
    const params = { landing: SO_LANDING_POPUP, page_path: pathname };
    so3Ga("popup_view", params);
    so3FbCustom("PopupView", params);
  }, [show, pathname]);

  // 하단 고정 CTA 가 떠 있으면 그 높이만큼 위로 — [data-sticky-cta] 요소의 화면 아래쪽 점유 높이를 읽는다
  useEffect(() => {
    if (!show) return;
    const root = rootRef.current;
    if (!root) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      let lift = 0;
      document.querySelectorAll<HTMLElement>("[data-sticky-cta]").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.height <= 0 || getComputedStyle(el).visibility === "hidden") return;
        if (r.top < window.innerHeight - 1) lift = Math.max(lift, window.innerHeight - r.top);
      });
      root.style.setProperty("--smp-lift", `${Math.round(lift)}px`);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("transitionend", schedule, true);
    const iv = window.setInterval(schedule, 800); // 마운트·숨김 전환이 스크롤 없이 일어나는 경우 대비
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("transitionend", schedule, true);
      window.clearInterval(iv);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [show]);

  const track = useCallback((event: string, extra: Record<string, unknown> = {}) => {
    const params = { landing: SO_LANDING_POPUP, page_path: window.location.pathname, ...extra };
    so3Ga(event, params);
    so3FbCustom(event === "popup_click" ? "PopupClick" : "PopupClose", params);
  }, []);

  const closeSession = () => {
    writeStore("session", K_SESSION, "1");
    track("popup_close", { close_type: "x" });
    setShow(false);
  };
  const hideToday = () => {
    writeStore("local", K_HIDE_DAY, todayKst());
    track("popup_close", { close_type: "today" });
    setShow(false);
  };

  // 노출 제외 경로이거나 기간이 끝났으면 DOM 에 아무것도 그리지 않는다 (SSR 에서도 렌더하지 않아 하이드레이션 차이 없음)
  if (excluded) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div
        ref={rootRef}
        className={`smp${show ? " is-on" : ""}`}
        role="complementary"
        aria-label="세미나 안내"
        aria-hidden={!show}
      >
        <button type="button" className="smp-x" aria-label="팝업 닫기" onClick={closeSession} tabIndex={show ? 0 : -1}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div className="smp-row">
          <div className="smp-av" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/edu/sales-ops/kim-jaegang.webp" alt="" width={40} height={40} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/edu/sales-ops/hwang-hyunjin.webp" alt="" width={40} height={40} />
          </div>
          <div className="smp-tx">
            <p className="smp-eb">11.21 SAT · 운영 × 세일즈 특강</p>
            <p className="smp-ti">피트니스 성장 마스터키</p>
            <p className="smp-su">김재강 × 황현진 · 스토리 인증 시 {soFormatPrice(SO_PRICE_STORY)}</p>
          </div>
        </div>
        <div className="smp-foot">
          <Link
            href="/edu/sales-ops?from=popup"
            className="smp-go"
            tabIndex={show ? 0 : -1}
            onClick={() => track("popup_click")}
          >
            자세히 보기 →
          </Link>
          <button type="button" className="smp-skip" onClick={hideToday} tabIndex={show ? 0 : -1}>
            오늘 하루 보지 않기
          </button>
        </div>
      </div>
    </>
  );
}
