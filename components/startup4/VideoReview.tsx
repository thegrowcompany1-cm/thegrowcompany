"use client";

import { useState } from "react";

// 후기 영상 — 누르기 전에는 포스터만 보여 주고(데이터 절약), 누르면 같은 자리에서 재생한다
export default function VideoReview({
  p,
  src,
  poster,
  caption,
  sub,
}: {
  p: string;
  src: string;
  poster: string;
  caption: string;
  sub: string;
}) {
  const [on, setOn] = useState(false);
  return (
    <div className={`${p}-vid`}>
      <div className={`${p}-vidbox`}>
        {on ? (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video src={src} poster={poster} controls autoPlay playsInline />
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={poster} alt={caption} width={720} height={1280} loading="lazy" decoding="async" />
            <button type="button" className={`${p}-play`} aria-label="후기 영상 재생" onClick={() => setOn(true)}>
              <span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#0a0d0b" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </button>
          </>
        )}
      </div>
      <p className={`${p}-vcap2`}>{caption}</p>
      <p className={`${p}-vsub`}>{sub}</p>
    </div>
  );
}
