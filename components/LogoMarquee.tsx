"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 파트너 센터 로고 마퀴 — 검은 바탕 위에 흰색 단색 로고만 옆으로 흐른다
//
//  · 메인 히어로의 로고 마퀴(HeroSection + globals.css 의 hero-logo-marquee-*)와
//    같은 방식이다. 한 벌을 두 번 이어붙이고 트랙을 -50% 만큼 움직여 이음새 없이
//    반복시킨다.
//  · 로고마다 가로 폭이 제각각이다. 이미지가 로드된 뒤에 폭이 정해지면 트랙 길이가
//    바뀌어 이음새가 어긋나므로, 각 로고를 "높이 × 가로세로 비율" 로 계산한 고정 폭
//    래퍼에 넣는다 (lib/partnerLogos.ts 의 ratio). 래퍼 폭이 로드와 무관하게 확정된다.
//  · 간격은 flex gap 이 아니라 아이템 margin 이다. gap 을 쓰면 트랙 폭이
//    "2N개 + (2N-1)개 간격" 이라 50% 가 한 벌과 어긋난다.
//  · 줄 수는 5줄 고정, 줄당 개수는 로고 수에서 자동 계산한다. 로고를 제외하거나
//    더해도 코드를 고칠 필요가 없다.
//  · 움직임은 전부 CSS animation 이다. 기본 상태가 "흐르는 중"이고, JS 는 화면 밖으로
//    나갔을 때만 is-paused 를 붙인다. 스크립트가 실행되지 않아도 흐른다.
//  · prefers-reduced-motion 으로 멈추지 않는다. 메인 히어로 마퀴도 멈추지 않는데,
//    Windows 에서 "애니메이션 효과" 를 끈 방문자가 많아 여기서만 멈추면 이 마퀴만
//    죽어 보인다. (장식용 저속 흐름이라 의도적으로 예외로 둔다)
//
//  · LOGO_MARQUEE_STYLE, buildMarqueeRows 등은 export 한다. /edu/diagnostic-consultant
//    는 DETAIL_HTML 주입 구조라 이 컴포넌트를 그대로 쓸 수 없고, 같은 데이터와 같은
//    CSS 를 가져다 HTML 문자열로 만든다. 스타일이 갈라지지 않게 하려는 것.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";
import { PARTNER_LOGOS } from "@/lib/partnerLogos";

export const LOGO_ALT = "더그로우 파트너 센터 로고";

/** 줄 수 (고정). 줄당 개수는 로고 수에서 자동 계산된다 */
export const ROW_COUNT = 5;

/** 가로로 아주 긴 로고가 줄을 혼자 차지하지 않도록 래퍼 폭의 상한(높이 대비 비율) */
const MAX_RATIO = 4.2;

/** 화면 크기별 로고 높이·좌우 여백(px) — CSS 변수와 반드시 같아야 폭 추정이 맞는다 */
const PC = { h: 44, m: 40 };

/** 한 벌(그룹)이 최소한 이만큼은 길어야 넓은 화면에서도 오른쪽이 비지 않는다 */
const MIN_GROUP_PX = 2600;

/** 줄별 흐름 속도(px/초, PC 기준). 줄마다 조금씩 달라야 한 덩어리처럼 안 보인다 */
const ROW_SPEEDS = [34, 41, 37, 45, 31];

export type MarqueeItem = {
  src: string;
  /** 래퍼 폭 계산용 가로세로 비율 (상한 적용 후) */
  ratio: number;
  /** 첫 번째 사본이 아니면 보조기기에서 숨긴다 */
  dupe: boolean;
};

export type MarqueeRow = {
  dir: "l" | "r";
  /** 한 바퀴(-50%) 도는 시간(초) — PC 기준 */
  dur: number;
  items: MarqueeItem[];
};

const itemWidthPc = (ratio: number) => Math.round(PC.h * ratio) + PC.m * 2;

/**
 * 로고를 ROW_COUNT 줄로 나누고, 줄마다 "한 벌" 을 충분히 길게 반복한 뒤 두 번 이어붙인다.
 *
 *  · 분배는 번호 순 라운드로빈이다. 1~32번이 필라테스·요가, 33~50번이 헬스라 순서대로
 *    자르면 줄마다 업종이 갈린다. 섞어 놓으면 어느 줄을 봐도 업종이 고르게 보인다.
 *  · 한 벌이 화면 폭보다 짧으면 이어붙인 틈이 보이므로 MIN_GROUP_PX 가 넘을 때까지
 *    한 벌 안에서 반복한다. 속도(px/초)가 일정하도록 반복한 만큼 시간도 늘린다.
 */
export function buildMarqueeRows(): MarqueeRow[] {
  const buckets: { src: string; ratio: number }[][] = Array.from(
    { length: ROW_COUNT },
    () => [],
  );
  PARTNER_LOGOS.forEach((l, i) => {
    buckets[i % ROW_COUNT].push({
      src: `/fitness-logos/white/${l.n}.png`,
      ratio: Math.round(Math.min(l.ratio, MAX_RATIO) * 100) / 100,
    });
  });

  return buckets
    .filter((b) => b.length > 0)
    .map((base, ri) => {
      const baseWidth = base.reduce((sum, l) => sum + itemWidthPc(l.ratio), 0);
      const repeat = Math.max(1, Math.ceil(MIN_GROUP_PX / baseWidth));
      const group: MarqueeItem[] = [];
      for (let r = 0; r < repeat; r++) {
        base.forEach((l) => group.push({ ...l, dupe: r > 0 }));
      }
      const groupWidth = baseWidth * repeat;
      const speed = ROW_SPEEDS[ri % ROW_SPEEDS.length];
      return {
        dir: ri % 2 === 0 ? "l" : "r",
        dur: Math.round(groupWidth / speed),
        // 두 번째 벌은 전부 복제
        items: [...group, ...group.map((l) => ({ ...l, dupe: true }))],
      };
    });
}

/** 두 페이지가 같이 쓰는 CSS. 접두사 logo- */
export const LOGO_MARQUEE_STYLE = `
.logo-marquee{--lh:32px;--lm:22px;width:100%;max-width:100%;overflow:hidden}
.logo-rows{display:flex;flex-direction:column;gap:20px;width:100%;max-width:100%;overflow:hidden}
/* 좌우 끝을 흐리게 — 로고가 화면 가장자리에서 잘려 보이지 않게 */
.logo-row{width:100%;max-width:100%;overflow:hidden;
  -webkit-mask-image:linear-gradient(90deg,transparent 0,#000 7%,#000 93%,transparent 100%);
  mask-image:linear-gradient(90deg,transparent 0,#000 7%,#000 93%,transparent 100%)}
.logo-track{display:flex;align-items:center;width:max-content;will-change:transform}
.logo-track--l{animation:logo-marquee-left var(--logo-dur,40s) linear infinite}
.logo-track--r{animation:logo-marquee-right var(--logo-dur,40s) linear infinite}
@keyframes logo-marquee-left{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes logo-marquee-right{from{transform:translateX(-50%)}to{transform:translateX(0)}}
/* 섹션이 화면 밖일 때만 멈춘다 (스크립트가 is-paused 를 붙이고, 돌아오면 뗀다) */
.logo-marquee.is-paused .logo-track{animation-play-state:paused}
/* 로고 하나 = 고정 폭 래퍼. 폭은 높이 × 비율이라 이미지 로드와 무관하게 확정된다.
   배경·테두리·그림자 없음 — 검은 바탕 위에 흰 로고만 보인다. */
.logo-item{flex:0 0 auto;height:var(--lh);width:calc(var(--lh) * var(--r));margin:0 var(--lm);
  display:flex;align-items:center;justify-content:center;opacity:.75;transition:opacity .25s ease}
.logo-item img{display:block;width:100%;height:100%;object-fit:contain}
/* 마우스를 올린 줄만 멈추고, 올린 로고는 또렷해진다. 터치 기기에서는 :hover 가 탭한 뒤에도
   남아 그 줄이 영영 멈춰 있게 되므로, 실제 마우스가 있는 기기에서만 적용한다. */
@media(hover:hover) and (pointer:fine){
  .logo-row:hover .logo-track{animation-play-state:paused}
  .logo-item:hover{opacity:1}
}
@media(min-width:768px){
  .logo-marquee{--lh:44px;--lm:40px}
  .logo-rows{gap:28px}
}
/* 모바일은 로고가 작아져 같은 시간에 훨씬 짧은 거리를 움직인다. 체감 속도를 맞춘다 */
@media(max-width:767px){
  .logo-track--l,.logo-track--r{animation-duration:calc(var(--logo-dur,40s) * .66)}
}
`;

export default function LogoMarquee({
  title,
  titleAccent,
  subtitle,
}: {
  /** 제목 1줄 */
  title: string;
  /** 제목 2줄 (그린) */
  titleAccent?: string;
  subtitle?: string;
}) {
  const rows = buildMarqueeRows();
  const wrapRef = useRef<HTMLDivElement>(null);

  // 기본은 흐르는 상태다. 화면 밖으로 나갔을 때만 is-paused 를 붙이고, 다시 들어오면 뗀다.
  // 클래스는 state 가 아니라 DOM 에서 직접 토글한다 — 서버 렌더 마크업에 is-paused 가
  // 섞일 여지가 없고, 토글 때마다 재렌더도 일어나지 않는다.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          el.classList.toggle("is-paused", !entry.isIntersecting);
        }
      },
      // 화면 가장자리에 걸쳐 있을 때 멈췄다 흘렀다 하지 않도록 여유를 둔다
      { threshold: 0, rootMargin: "120px 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      el.classList.remove("is-paused");
    };
  }, []);

  return (
    <div>
      <style dangerouslySetInnerHTML={{ __html: LOGO_MARQUEE_STYLE }} />

      <h2 className="text-center text-2xl font-black leading-snug sm:text-3xl">
        {title}
        {titleAccent && (
          <>
            <br />
            <span style={{ color: "#22B573" }}>{titleAccent}</span>
          </>
        )}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-gray-400 sm:text-[15px]">
          {subtitle}
        </p>
      )}

      <div ref={wrapRef} className="logo-marquee mt-10 sm:mt-12">
        <div className="logo-rows">
          {rows.map((row, ri) => (
            <div className="logo-row" key={ri}>
              <div
                className={`logo-track logo-track--${row.dir}`}
                style={{ ["--logo-dur" as string]: `${row.dur}s` }}
              >
                {row.items.map((it, i) => (
                  <div
                    className="logo-item"
                    key={`${ri}-${i}`}
                    style={{ ["--r" as string]: it.ratio }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={it.src}
                      alt={LOGO_ALT}
                      loading="lazy"
                      decoding="async"
                      aria-hidden={it.dupe ? "true" : undefined}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
