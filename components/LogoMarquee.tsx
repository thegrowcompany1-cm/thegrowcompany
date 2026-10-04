"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 파트너 센터 로고 마퀴 — 자동으로 옆으로 흐른다
//
//  · 메인 히어로의 로고 마퀴(HeroSection + globals.css 의 hero-logo-marquee-*)와
//    같은 방식이다. 한 줄의 로고를 두 번 이어붙이고 트랙을 -50% 만큼 움직여
//    이음새 없이 반복시킨다.
//  · 간격을 flex gap 이 아니라 타일 margin 으로 준다. gap 을 쓰면 트랙 전체 폭이
//    "20타일 + 19간격" 이라 50% 가 한 벌과 어긋나 반 칸씩 튄다.
//  · 줄 수는 LOGOS 길이에서 자동 계산한다. 로고를 더하거나 빼도 코드를 고칠 필요가 없다.
//  · 움직임은 전부 CSS animation 이다. 기본 상태가 "흐르는 중"이고, JS 는 화면 밖으로
//    나갔을 때만 is-paused 를 붙인다. 스크립트가 실행되지 않아도 흐른다.
//  · prefers-reduced-motion 으로 멈추지 않는다. 메인 히어로 마퀴도 멈추지 않는데,
//    Windows 에서 "애니메이션 효과" 를 끈 방문자가 많아 여기서만 멈추면 이 마퀴만
//    죽어 보인다. (장식용 저속 흐름이라 의도적으로 예외로 둔다)
//
//  · LOGO_MARQUEE_STYLE 등은 export 한다. /edu/diagnostic-consultant 는
//    DETAIL_HTML 주입 구조라 이 컴포넌트를 그대로 쓸 수 없고, 같은 데이터와
//    같은 CSS 를 가져다 HTML 문자열로 만든다. 스타일이 갈라지지 않게 하려는 것.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";

/** public/fitness-logos/1.png ~ 50.png */
export const LOGOS: string[] = Array.from(
  { length: 50 },
  (_, i) => `/fitness-logos/${i + 1}.png`,
);

/** 한 줄에 들어가는 로고 수 */
export const PER_ROW = 10;

export const LOGO_ALT = "더그로우 파트너 센터 로고";

/** 로고를 10개씩 끊어 줄 배열로 */
export function chunkLogos(logos: string[] = LOGOS): string[][] {
  const out: string[][] = [];
  for (let i = 0; i < logos.length; i += PER_ROW) {
    out.push(logos.slice(i, i + PER_ROW));
  }
  return out;
}

/**
 * 줄별 흐름 방향과 속도.
 * 홀수 줄(0·2·4)은 왼쪽, 짝수 줄(1·3)은 오른쪽. 속도를 조금씩 달리해
 * 줄들이 한 덩어리처럼 같이 움직이는 느낌을 없앤다.
 */
export function rowConfig(i: number): { dir: "l" | "r"; dur: number } {
  const DURATIONS = [38, 46, 41, 50, 35];
  return { dir: i % 2 === 0 ? "l" : "r", dur: DURATIONS[i % DURATIONS.length] };
}

/** 두 페이지가 같이 쓰는 CSS. 접두사 logo- */
export const LOGO_MARQUEE_STYLE = `
.logo-marquee{width:100%;max-width:100%;overflow:hidden}
.logo-rows{display:flex;flex-direction:column;gap:10px;width:100%;max-width:100%;overflow:hidden}
/* 좌우 끝을 흐리게 — 로고가 화면 가장자리에서 잘려 보이지 않게 */
.logo-row{width:100%;max-width:100%;overflow:hidden;
  -webkit-mask-image:linear-gradient(90deg,transparent 0,#000 7%,#000 93%,transparent 100%);
  mask-image:linear-gradient(90deg,transparent 0,#000 7%,#000 93%,transparent 100%)}
.logo-track{display:flex;align-items:center;width:max-content;will-change:transform}
.logo-track--l{animation:logo-marquee-left var(--logo-dur,40s) linear infinite}
.logo-track--r{animation:logo-marquee-right var(--logo-dur,40s) linear infinite}
@keyframes logo-marquee-left{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes logo-marquee-right{from{transform:translateX(-50%)}to{transform:translateX(0)}}
/* 마우스를 올린 줄만 멈춘다. 터치 기기에서는 :hover 가 탭한 뒤에도 남아 그 줄이
   영영 멈춰 있게 되므로, 실제 마우스가 있는 기기에서만 적용한다. */
@media(hover:hover) and (pointer:fine){
  .logo-row:hover .logo-track{animation-play-state:paused}
}
/* 섹션이 화면 밖일 때만 멈춘다 (스크립트가 is-paused 를 붙이고, 돌아오면 뗀다) */
.logo-marquee.is-paused .logo-track{animation-play-state:paused}
.logo-tile{flex:0 0 auto;width:80px;height:80px;margin:0 5px;background:#fff;border-radius:12px;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:8px}
.logo-tile img{width:100%;height:100%;object-fit:contain;display:block}
@media(min-width:768px){
  .logo-rows{gap:14px}
  .logo-tile{width:120px;height:120px;margin:0 7px;border-radius:16px;padding:12px}
}
`;

export default function LogoMarquee({
  title,
  titleAccent,
  subtitle,
  logos = LOGOS,
}: {
  /** 제목 1줄 */
  title: string;
  /** 제목 2줄 (그린) */
  titleAccent?: string;
  subtitle?: string;
  logos?: string[];
}) {
  const rows = chunkLogos(logos);
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

      <div
        ref={wrapRef}
        className="logo-marquee mt-8 sm:mt-10"
      >
        <div className="logo-rows">
          {rows.map((row, ri) => {
            const { dir, dur } = rowConfig(ri);
            // 한 벌을 두 번 이어붙여야 -50% 지점에서 그림이 정확히 맞물린다
            const doubled = [...row, ...row];
            return (
              <div className="logo-row" key={ri}>
                <div
                  className={`logo-track logo-track--${dir}`}
                  style={{ ["--logo-dur" as string]: `${dur}s` }}
                >
                  {doubled.map((src, i) => (
                    <div className="logo-tile" key={`${ri}-${i}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={LOGO_ALT}
                        loading="lazy"
                        decoding="async"
                        // 두 번째 벌은 같은 그림의 복제라 보조기기에서 숨긴다
                        aria-hidden={i >= row.length ? "true" : undefined}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
