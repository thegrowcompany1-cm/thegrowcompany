"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 운영 × 세일즈 서울세미나 — 사이트 전체 중앙 포스터 모달 (app/layout.tsx 에서 한 번만 마운트)
//
//  · 제외 경로: /edu/sales-ops* (본 페이지) · /checkout* · /admin* · /legal* · /login · /signup · /mypage · /auth*
//    + 광고 랜딩(/consulting/{startup,outsourcing,community,diagnosis}* · /edu/{diagnostic-consultant,gx-class,fc-class,startup-class}*)
//  · 노출 기간: POPUP_UNTIL 이후에는 아무것도 그리지 않는다.
//  · 진입 1초 뒤 표시. 경로가 바뀔 때마다 다시 센다.
//  · 닫기: X · 닫기 · ESC · 배경 클릭 → 이 브라우저 세션 동안 닫음(sessionStorage)
//          "오늘 하루 보지 않기" → 오늘 날짜(KST)를 localStorage 에 저장 = 오늘 KST 자정까지 숨김.
//    저장소 접근은 전부 try/catch — 막혀 있어도 모달은 닫기만 동작한다(그 경우 새로고침하면 다시 뜬다).
//  · 열려 있는 동안 body 스크롤을 잠그고, 닫으면 원래 값으로 되돌린다.
//  · 측정: popup_view / popup_click / popup_dismiss_today (GA4), 클릭 시 메타 커스텀 이벤트 PopupClick.
//    포스터·"자세히 보기"는 /edu/sales-ops?from=popup 으로 가고, 신청 페이지가 결제 신청 정보의 landing 에 같은 값을 남긴다.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SO_LANDING_POPUP } from "@/lib/salesOps";
import { so3FbCustom, so3Ga } from "@/lib/salesOps3Track";

/** 이 시각(KST) 이후에는 자동으로 노출하지 않는다 */
const POPUP_UNTIL = "2026-11-21T23:59:00+09:00";
const POPUP_UNTIL_MS = Date.parse(POPUP_UNTIL);

const DELAY_MS = 1000;
const TARGET = "/edu/sales-ops?from=popup";
const K_SESSION = "tgc:popup:so:closed";
const K_HIDE_DAY = "tgc:popup:so:hide";

/** 경계까지 맞는 경로 (정확히 같거나 하위 경로) */
const EXCLUDE_EXACT = ["/login", "/signup", "/mypage"];
/** 접두사로 거르는 경로 — /edu/sales-ops 는 sales-ops2·3 까지 함께 걸린다 */
const EXCLUDE_PREFIX = [
  "/edu/sales-ops",
  "/checkout",
  "/admin",
  "/legal",
  "/auth",
  // 광고 랜딩 — 일반 탐색 페이지(메인·/edu 허브·정보마당 등)에서만 노출한다
  "/consulting/startup",
  "/consulting/outsourcing",
  "/consulting/community",
  "/consulting/diagnosis",
  "/edu/diagnostic-consultant",
  "/edu/gx-class",
  "/edu/fc-class",
  "/edu/startup-class",
  "/lp/", // 메타 광고 전용 랜딩 전체
];

const isExcluded = (path: string) =>
  EXCLUDE_PREFIX.some((p) => path.startsWith(p)) || EXCLUDE_EXACT.some((p) => path === p || path.startsWith(p + "/"));

/** 오늘 날짜(KST) — "2026-10-27" */
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
    /* 저장소가 막혀 있어도 닫기는 동작한다 */
  }
}

const CSS = `
.spm{position:fixed;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.7);overflow:hidden;font-family:inherit;word-break:keep-all}
.spm *{box-sizing:border-box}
.spm-card{position:relative;width:min(480px,90vw);max-width:100%;border-radius:14px;background:#111;box-shadow:0 20px 60px rgba(0,0,0,.5);overflow:hidden}
.spm-img{display:block;position:relative;width:100%;background:#000;line-height:0}
.spm-img img{display:block;width:100%;height:auto;max-height:calc(80vh - 112px);object-fit:contain;margin:0 auto}
.spm-go{display:flex;align-items:center;justify-content:center;width:calc(100% - 24px);height:46px;margin:12px 12px 0;border-radius:10px;background:#22B573;color:#fff;font-size:16px;font-weight:800;text-decoration:none}
.spm-bar{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:4px 12px 8px;min-height:44px}
.spm-bar button{height:40px;padding:0 6px;border:0;background:none;color:#C8D3CD;font:inherit;font-size:13px;cursor:pointer}
.spm-bar button:hover{color:#fff}
.spm-skip{text-decoration:underline;text-underline-offset:3px}
.spm-x{position:absolute;top:8px;right:8px;z-index:2;width:40px;height:40px;border:0;border-radius:50%;background:rgba(0,0,0,.55);color:#fff;cursor:pointer;display:grid;place-items:center}
.spm-x svg{width:16px;height:16px}
.spm a:focus-visible,.spm button:focus-visible{outline:2px solid #22B573;outline-offset:2px}
`;

export default function SeminarPosterModal() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const viewed = useRef(false);
  const excluded = isExcluded(pathname ?? "");

  // 진입 1초 뒤 표시 — 경로가 바뀔 때마다 다시 센다. 기간 종료·닫음·오늘 숨김이면 시작하지 않는다.
  useEffect(() => {
    setShow(false);
    if (excluded) return;
    if (Date.now() >= POPUP_UNTIL_MS) return;
    if (readStore("session", K_SESSION) === "1") return;
    if (readStore("local", K_HIDE_DAY) === todayKst()) return;
    const t = window.setTimeout(() => setShow(true), DELAY_MS);
    return () => window.clearTimeout(t);
  }, [pathname, excluded]);

  // 노출 측정 — 표시될 때 1회
  useEffect(() => {
    if (!show) {
      viewed.current = false;
      return;
    }
    if (viewed.current) return;
    viewed.current = true;
    so3Ga("popup_view", { landing: SO_LANDING_POPUP, page_path: pathname });
  }, [show, pathname]);

  // 열려 있는 동안 body 스크롤 잠금 + ESC 로 닫기
  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        writeStore("session", K_SESSION, "1");
        setShow(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [show]);

  const close = () => {
    writeStore("session", K_SESSION, "1");
    setShow(false);
  };
  const hideToday = () => {
    writeStore("local", K_HIDE_DAY, todayKst());
    so3Ga("popup_dismiss_today", { landing: SO_LANDING_POPUP, page_path: window.location.pathname });
    setShow(false);
  };
  const onGo = () => {
    so3Ga("popup_click", { landing: SO_LANDING_POPUP, page_path: window.location.pathname });
    // 현재 페이지 픽셀로 커스텀 이벤트 전송 (픽셀이 없는 페이지에서는 조용히 무시된다)
    so3FbCustom("PopupClick", { landing: SO_LANDING_POPUP, content_name: "sales-ops" });
  };

  if (excluded || !show) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="spm" role="presentation" onClick={close}>
        <div className="spm-card" role="dialog" aria-modal="true" aria-label="운영 세일즈 서울세미나 안내" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="spm-x" aria-label="팝업 닫기" onClick={close}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <Link href={TARGET} className="spm-img" onClick={onGo} aria-label="운영 세일즈 서울세미나 자세히 보기">
            <picture>
              <source srcSet="/edu/sales-ops/popup-poster.webp" type="image/webp" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/edu/sales-ops/popup-poster.png" alt="피트니스 성장 마스터키 세미나 포스터" width={1080} height={1080} draggable={false} />
            </picture>
          </Link>
          <Link href={TARGET} className="spm-go" onClick={onGo}>
            자세히 보기
          </Link>
          <div className="spm-bar">
            <button type="button" className="spm-skip" onClick={hideToday}>
              오늘 하루 보지 않기
            </button>
            <button type="button" onClick={close}>
              닫기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
