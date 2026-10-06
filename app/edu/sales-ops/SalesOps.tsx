"use client";

// ─────────────────────────────────────────────────────────────────────────────
// /edu/sales-ops — 황현진 대표 세일즈 영상 섹션 (SALES SALON)
//
//  · 영상은 자체 호스팅이다. 인스타그램 임베드(embed.js)는 쓰지 않는다.
//  · 원본(바탕화면 edusales1~4)을 720p·CRF26 으로 압축한 파일이 public/edu/sales-ops/videos/
//    에 있다. 원본을 그대로 커밋하지 않는다.
//  · 자동재생 없음. 눌러서 소리와 함께 재생하고, 하나를 재생하면 나머지는 멈춘다.
//  · CSS 접두사 so-
// ─────────────────────────────────────────────────────────────────────────────

import { useRef } from "react";

const SO_VIDEOS = [1, 2, 3, 4].map((n) => ({
  src: `/edu/sales-ops/videos/sales-0${n}.mp4`,
  poster: `/edu/sales-ops/videos/sales-0${n}.jpg`,
}));

const SO_INSTAGRAM_URL = "https://www.instagram.com/hyunjin_salessalon/";

const SO_STYLE = `
.so-page{background:#0A0A0A;color:#fff;font-family:'Pretendard','Noto Sans KR',-apple-system,BlinkMacSystemFont,system-ui,'Apple SD Gothic Neo',sans-serif;letter-spacing:-.01em;width:100%;max-width:100%;overflow-x:hidden}
.so-page *{box-sizing:border-box}
.so-sec{padding:84px 0}
.so-wrap{max-width:1100px;margin:0 auto;padding:0 20px}
.so-label{margin:0 0 14px;text-align:center;font-size:13px;font-weight:800;letter-spacing:.2em;color:#22B573}
.so-title{margin:0 0 14px;text-align:center;font-size:30px;line-height:1.45;font-weight:900;word-break:keep-all;text-wrap:balance}
.so-sub{margin:0 0 40px;text-align:center;font-size:15px;line-height:1.6;color:#9AA7A0}
.so-sub a{color:#22B573;font-weight:700;text-decoration:underline;text-underline-offset:3px}
.so-sub a:hover{color:#4FD99B}
.so-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}
/* 카드 — 9:16, 모서리 둥글게, 배경 검정. min-width:0 이 없으면 그리드가 영상 고유 폭에 밀려 넘친다 */
.so-card{position:relative;min-width:0;aspect-ratio:9/16;border-radius:16px;overflow:hidden;background:#000}
.so-card video{display:block;width:100%;height:100%;object-fit:cover;background:#000}
@media(max-width:1024px){
  .so-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media(max-width:640px){
  .so-sec{padding:56px 0}
  .so-wrap{padding:0 16px}
  .so-title{font-size:22px}
  .so-sub{margin-bottom:28px;font-size:14px}
  .so-grid{gap:10px}
  .so-card{border-radius:12px}
}
`;

export default function SalesOps() {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // 하나를 재생하면 나머지는 멈춘다 (동시에 소리가 겹치지 않게)
  const pauseOthers = (index: number) => {
    videoRefs.current.forEach((video, i) => {
      if (video && i !== index && !video.paused) video.pause();
    });
  };

  return (
    <div className="so-page">
      <style dangerouslySetInnerHTML={{ __html: SO_STYLE }} />

      <section className="so-sec">
        <div className="so-wrap">
          <p className="so-label">SALES SALON</p>
          <h1 className="so-title">황현진 대표의 세일즈 화법, 영상으로 먼저 만나보세요</h1>
          <p className="so-sub">
            인스타그램{" "}
            <a href={SO_INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
              @hyunjin_salessalon
            </a>
          </p>

          <div className="so-grid">
            {SO_VIDEOS.map(({ src, poster }, i) => (
              <div className="so-card" key={src}>
                <video
                  ref={(el) => {
                    videoRefs.current[i] = el;
                  }}
                  src={src}
                  poster={poster}
                  controls
                  playsInline
                  preload="none"
                  onPlay={() => pauseOthers(i)}
                  aria-label={`황현진 대표 세일즈 화법 영상 ${i + 1}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
