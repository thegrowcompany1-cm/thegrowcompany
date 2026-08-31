"use client";

// 페이지별 메타(페이스북) 픽셀.
//
// app/layout.tsx 에 한 번만 배치하고, 어떤 픽셀을 쓸지는 경로를 보고 스스로 판단한다.
// 픽셀을 추가하려면 lib/metaPixel.ts 의 PIXEL_MAP 만 고치면 된다.
//
// 다중 픽셀 주의:
//  fbq('track', ...) 은 그때까지 init 된 "모든" 픽셀로 전송된다. SPA 라우팅으로
//  A 페이지(픽셀 A) → B 페이지(픽셀 B) 로 이동하면 A 도 계속 살아 있어 중복 전송이 된다.
//  그래서 전송은 전부 trackSingle / trackSingleCustom 으로 현재 픽셀만 지정한다.
//  init 은 픽셀당 한 번만 수행한다(이미 init 한 픽셀은 건너뛴다).
//
// 실행 순서 주의:
//  부트스트랩은 afterInteractive 라 useEffect 보다 늦게 실행될 수 있다. 그래서
//  Script 의 onReady 와 경로 변경 effect 양쪽에서 같은 함수를 부르고,
//  PageView 는 (픽셀 + 경로) 조합당 한 번만 나가도록 막아 중복을 없앤다.
//
// GA4(@next/third-parties GoogleAnalytics)와는 서로 독립적으로 동작한다.

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { getPixelId } from "@/lib/metaPixel";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
    /** 현재 페이지에 매핑된 픽셀 ID (없으면 undefined) */
    __tgcPixelId?: string;
    /** 표준 이벤트 전송 — 현재 페이지 픽셀로만 보낸다 */
    __tgcFbTrack?: (event: string, params?: Record<string, unknown>) => void;
    /** 커스텀 이벤트 전송 — 현재 페이지 픽셀로만 보낸다 */
    __tgcFbTrackCustom?: (event: string, params?: Record<string, unknown>) => void;
  }
}

/** 픽셀 부트스트랩 (fbq 스텁 정의). init/track 은 하지 않는다 */
const FBQ_BOOTSTRAP = `
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
`;

export default function MetaPixel() {
  const pathname = usePathname() ?? "/";
  const pixelId = getPixelId(pathname);

  // 이미 init 한 픽셀 / 이미 PageView 를 보낸 (픽셀+경로)
  const initedRef = useRef<Set<string>>(new Set());
  const lastViewRef = useRef<string | null>(null);

  const applyPixel = useCallback(() => {
    if (!pixelId) return;
    if (typeof window.fbq !== "function") return;

    if (!initedRef.current.has(pixelId)) {
      window.fbq("init", pixelId);
      initedRef.current.add(pixelId);
    }

    const viewKey = `${pixelId}|${pathname}`;
    if (lastViewRef.current === viewKey) return;
    lastViewRef.current = viewKey;

    // 현재 픽셀로만 전송 (이전 페이지 픽셀로 중복 전송되지 않게)
    window.fbq("trackSingle", pixelId, "PageView");
  }, [pixelId, pathname]);

  // 다른 곳(폼 스크립트, 계산기)에서 쓸 전송 헬퍼를 현재 픽셀 기준으로 갱신.
  // 픽셀이 없는 페이지에서는 호출해도 조용히 무시된다.
  useEffect(() => {
    window.__tgcPixelId = pixelId ?? undefined;

    const send =
      (method: "trackSingle" | "trackSingleCustom") =>
      (event: string, params?: Record<string, unknown>) => {
        if (!pixelId) return;
        if (typeof window.fbq !== "function") return;
        window.fbq(method, pixelId, event, params ?? {});
      };

    window.__tgcFbTrack = send("trackSingle");
    window.__tgcFbTrackCustom = send("trackSingleCustom");
  }, [pixelId]);

  // 경로가 바뀌면 새 픽셀로 init + PageView (부트스트랩이 이미 끝난 경우)
  useEffect(() => {
    applyPixel();
  }, [applyPixel]);

  // 매핑된 픽셀이 없는 페이지에는 아무것도 넣지 않는다
  if (!pixelId) return null;

  return (
    <>
      <Script
        id="meta-pixel-base"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: FBQ_BOOTSTRAP }}
        // 부트스트랩이 useEffect 보다 늦게 실행된 경우를 위한 진입점
        onReady={applyPixel}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
