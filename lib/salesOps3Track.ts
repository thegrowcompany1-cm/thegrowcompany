// ─────────────────────────────────────────────────────────────────────────────
// /edu/sales-ops3 측정 이벤트 — GA4(gtag) + 메타 픽셀(__tgcFbTrack) 공용 헬퍼
//
//  · 기존 사이트 설정을 그대로 쓴다: gtag 는 layout.tsx 의 GoogleAnalytics 가, 메타 픽셀은
//    MetaPixel 이 경로별로 주입한다. 둘 다 없으면 (측정 ID 미설정·차단·픽셀 미매핑) 조용히 넘어간다.
//  · 모든 이벤트에 landing 값을 싣는다.
// ─────────────────────────────────────────────────────────────────────────────

import { SO_LANDING_V3 } from "@/lib/salesOps";
import { whenFbReady } from "@/lib/metaPixel";

type Gtag = (...args: unknown[]) => void;

export function so3Ga(event: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: Gtag }).gtag;
  if (typeof gtag === "function") gtag("event", event, { landing: SO_LANDING_V3, ...params });
}

/** 메타 표준 이벤트 (예: ViewContent) */
export function so3Fb(event: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  whenFbReady(() => window.__tgcFbTrack?.(event, { landing: SO_LANDING_V3, ...params }));
}

/** 메타 커스텀 이벤트 (예: ApplySectionView) */
export function so3FbCustom(event: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  whenFbReady(() => window.__tgcFbTrackCustom?.(event, { landing: SO_LANDING_V3, ...params }));
}
