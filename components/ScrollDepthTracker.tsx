"use client";

// ─────────────────────────────────────────────────────────────────────────────
// GA4 스크롤 깊이 · 체류 시간 이벤트
//
//  · 루트 레이아웃에 한 번만 둔다. 화면에 아무것도 그리지 않는다.
//  · 경로(pathname)마다 25/50/75/100% 도달 1회, 10/30/60초 도달 1회씩 보낸다.
//    경로가 바뀌면 전부 초기화한다 (SPA 이동이라 새로고침이 일어나지 않는다).
//  · window.gtag 가 있을 때만 보낸다. GA_ID 가 없으면 gtag.js 자체가 로드되지
//    않으므로 이 컴포넌트는 조용히 아무것도 하지 않는다.
//  · scroll 리스너는 passive + requestAnimationFrame 쓰로틀. 언마운트·경로 변경
//    시 리스너와 타이머를 전부 정리한다.
//  · 기존 GA4(GoogleAnalytics)·Meta Pixel 코드는 건드리지 않는다. 여기서는
//    이미 로드된 gtag 를 호출만 한다.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const DEPTHS = [25, 50, 75, 100] as const;
const DWELL_SECONDS = [10, 30, 60] as const;

/** 이벤트를 보내지 않을 경로 (접두사 일치) */
const EXCLUDED_PREFIXES = ["/admin"];

type Gtag = (command: string, event: string, params: Record<string, unknown>) => void;

/** 전역 타입을 건드리지 않고 지역에서만 읽는다 (Checkout.tsx 와 같은 방식) */
function getGtag(): Gtag | null {
  const g = (window as unknown as { gtag?: Gtag }).gtag;
  return typeof g === "function" ? g : null;
}

function isExcluded(path: string): boolean {
  return EXCLUDED_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
}

export default function ScrollDepthTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || isExcluded(pathname)) return;

    // 경로마다 새로 시작한다 — 이 스코프의 상태는 이 경로 전용이다.
    const sentDepths = new Set<number>();
    const sentDwell = new Set<number>();
    let raf = 0;
    let disposed = false;

    const send = (event: string, params: Record<string, unknown>) => {
      if (disposed) return;
      const gtag = getGtag();
      if (!gtag) return; // gtag.js 미로드 — 조용히 무시
      gtag("event", event, { ...params, page_path: pathname });
    };

    const measure = () => {
      raf = 0;
      if (disposed) return;

      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;

      // 스크롤이 없는 짧은 페이지는 100% 도달로 본다
      const percent =
        scrollable <= 0
          ? 100
          : Math.min(100, Math.round(((window.scrollY || doc.scrollTop) / scrollable) * 100));

      for (const d of DEPTHS) {
        if (percent >= d && !sentDepths.has(d)) {
          sentDepths.add(d);
          send("scroll_depth", { percent: d });
        }
      }
    };

    const onScroll = () => {
      if (raf) return; // 한 프레임에 한 번만 계산
      raf = window.requestAnimationFrame(measure);
    };

    // 진입 시점에 이미 도달해 있는 깊이(짧은 페이지 등)를 한 번 확인한다
    measure();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    const timers = DWELL_SECONDS.map((sec) =>
      window.setTimeout(() => {
        if (sentDwell.has(sec)) return;
        sentDwell.add(sec);
        send("time_on_page", { seconds: sec });
      }, sec * 1000),
    );

    return () => {
      disposed = true;
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [pathname]);

  return null;
}
