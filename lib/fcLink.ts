// 정규 FC 세미나 링크 — 부산 기수 동안만 아임웹 페이지로 연결한다.
//
// 부산 기수 종료(2026-09-12) 후 자동으로 /edu/fc-class 복귀
//
// 만료 시각은 반드시 오프셋(+09:00)이 붙은 ISO 문자열로 둔다.
// 배포 서버가 UTC로 동작해도 Date 가 절대 시각으로 파싱되므로
// 한국시간 기준 9월 13일 0시에 정확히 전환된다.

export const FC_EXTERNAL_URL = "https://thegrowcompany.imweb.me/busan";

/** 이 시각 이전까지만 외부 링크 (한국시간 2026-09-13 00:00 = 9/12까지 노출) */
export const FC_EXTERNAL_UNTIL = "2026-09-13T00:00:00+09:00";

/** 만료 후 돌아갈 내부 경로 — 페이지는 삭제하지 않고 그대로 유지 중이다 */
export const FC_INTERNAL_PATH = "/edu/fc-class";

export type FcLinkTarget = { href: string; external: boolean };

/** 만료 전이면 아임웹 외부 링크, 만료 후면 내부 경로를 돌려준다 */
export function getFcLink(now: Date = new Date()): FcLinkTarget {
  const until = new Date(FC_EXTERNAL_UNTIL).getTime();

  if (now.getTime() < until) {
    return { href: FC_EXTERNAL_URL, external: true };
  }
  return { href: FC_INTERNAL_PATH, external: false };
}

/**
 * 서버 렌더 시 항상 쓰이는 값.
 * 정적 HTML 에 만료된 외부 링크가 굳어버리지 않도록, 서버에서는 언제나
 * 내부 경로를 그리고 브라우저에서 마운트된 뒤 실제 시각으로 판정한다.
 * (하이드레이션 불일치가 원천적으로 생기지 않는다)
 */
export const FC_SSR_LINK: FcLinkTarget = {
  href: FC_INTERNAL_PATH,
  external: false,
};
