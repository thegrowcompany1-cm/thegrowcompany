// ─────────────────────────────────────────────────────────────────────────────
// 페이지별 메타(페이스북) 픽셀 매핑
//
// 픽셀 추가 방법
//  1. 메타 이벤트 관리자에서 픽셀을 새로 만들고 ID(숫자 15~16자리)를 복사한다.
//  2. 아래 PIXEL_MAP 에 "경로": "픽셀ID" 한 줄을 추가한다 (주석 처리된 자리 활용).
//  3. 끝. 컴포넌트나 페이지는 손댈 필요가 없다 — MetaPixel 이 경로를 보고 자동 적용한다.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 경로(또는 경로 prefix) → 픽셀 ID.
 *
 * · 정확히 일치하는 경로가 있으면 그것을 먼저 쓴다.
 * · 없으면 prefix 로 매칭한다. 여러 개가 걸리면 가장 긴(구체적인) 경로가 이긴다.
 *   예) "/consulting/diagnosis" 한 줄로 멘토 6개 페이지를 한 픽셀에 묶을 수 있다.
 * · 여기에 없는 페이지에는 픽셀이 아예 로드되지 않는다.
 */
export const PIXEL_MAP: Record<string, string> = {
  "/consulting/startup": "1556215626187598", // 창업 솔루션
  "/consulting/outsourcing": "747849161675945", // 매장 위탁
  "/edu/gx-class": "1112480951354351", // 그룹운동 비즈니스 클래스
  // 성장 마스터키 세미나 — 정규 FC 2 픽셀 (prefix 는 경로 경계 기준이라 3개 모두 명시)
  "/edu/sales-ops": "1016101377452945",
  "/edu/sales-ops2": "1016101377452945",
  "/edu/sales-ops3": "1016101377452945",
  // 결제 흐름 — prefix 매칭이라 /checkout/success, /checkout/fail 도 이 픽셀을 탄다.
  // 기본값은 gx-class 픽셀. 상품별 분기는 아래 PRODUCT_PIXEL_MAP / resolveCheckoutPixel 이 한다.
  "/checkout": "1112480951354351",

  // 아래는 픽셀 발급 후 주석을 풀고 ID 를 채우면 바로 적용된다.
  // "/consulting/community": "",    // 시설 위탁(아파트·기업) — 픽셀 발급 후 입력
  // "/consulting/diagnosis": "",    // 진단 솔루션 (멘토 하위 페이지 전체) — 픽셀 발급 후 입력
  // "/edu": "",                     // 그로우 에듀 (세미나 전체) — 픽셀 발급 후 입력
};

/** 결제 상품 슬러그 → 픽셀 ID. /checkout 은 이 값으로 픽셀을 고르고, 없으면 PIXEL_MAP["/checkout"] 기본값 */
export const PRODUCT_PIXEL_MAP: Record<string, string> = {
  "sales-ops": "1016101377452945",
  "sales-ops-story": "1016101377452945",
  "gx-class": "1112480951354351",
  "gx-class-early": "1112480951354351",
};

/** /checkout 에서 고른 픽셀을 /checkout/success · /checkout/fail 까지 넘기는 sessionStorage 키 */
export const CHECKOUT_PIXEL_KEY = "tgc:checkoutPixel";

/**
 * /checkout 계열 경로의 픽셀 ID.
 *  · /checkout?product=<슬러그> — 슬러그 매핑이 있으면 그 픽셀을 쓰고 sessionStorage 에 저장, 없으면 저장값을 지운다
 *  · /checkout/success · /checkout/fail — 저장된 값을 쓴다
 *  · 어느 쪽도 없으면 기본값(getPixelId) 유지
 */
export function resolveCheckoutPixel(pathname: string, search: string): string | null {
  const path = normalize(pathname);
  let stored: string | null = null;
  try {
    if (path === "/checkout") {
      const slug = new URLSearchParams(search).get("product") ?? "";
      const mapped = PRODUCT_PIXEL_MAP[slug];
      if (mapped) window.sessionStorage.setItem(CHECKOUT_PIXEL_KEY, mapped);
      else window.sessionStorage.removeItem(CHECKOUT_PIXEL_KEY);
      stored = mapped ?? null;
    } else {
      stored = window.sessionStorage.getItem(CHECKOUT_PIXEL_KEY);
    }
  } catch {
    // 저장소를 쓸 수 없으면 기본값
  }
  return stored || getPixelId(pathname);
}

/**
 * 메타 전송 헬퍼(window.__tgcFbTrack)가 준비되면 cb 를 부른다 (최대 약 5초).
 * 페이지의 마운트 effect 는 레이아웃의 MetaPixel effect 보다 먼저 돌아 헬퍼가 아직 없을 수 있다 —
 * 진입 시점 이벤트(ViewContent 등)는 이 함수로 보낸다.
 */
export function whenFbReady(cb: () => void): void {
  if (typeof window === "undefined") return;
  let tries = 0;
  const poll = () => {
    if (typeof window.__tgcFbTrack === "function") cb();
    else if (++tries < 50) window.setTimeout(poll, 100);
  };
  poll();
}

/** 경로 끝의 슬래시를 떼어 "/a/b/" 와 "/a/b" 를 같게 본다 (루트는 "/" 유지) */
function normalize(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

/**
 * 현재 경로에 해당하는 픽셀 ID. 매핑이 없으면 null.
 *
 * 정확 일치를 먼저 보고, 없으면 가장 구체적인 prefix 를 고른다.
 * prefix 는 경로 경계에서만 맞춘다 ("/edu" 가 "/education" 에 걸리지 않도록).
 */
export function getPixelId(pathname: string): string | null {
  const path = normalize(pathname);

  // 1) 정확 일치
  const exact = PIXEL_MAP[path];
  if (exact) return exact;

  // 2) prefix 매칭 — 가장 긴 것이 이긴다
  let best: { key: string; id: string } | null = null;
  for (const [key, id] of Object.entries(PIXEL_MAP)) {
    if (!id) continue; // 아직 발급 전인 빈 값은 건너뛴다
    const prefix = normalize(key);
    if (path === prefix || path.startsWith(prefix + "/")) {
      if (!best || prefix.length > best.key.length) best = { key: prefix, id };
    }
  }

  return best ? best.id : null;
}
