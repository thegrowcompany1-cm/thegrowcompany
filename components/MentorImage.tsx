"use client";

// 멘토 사진 — 파일이 아직 없거나 불러오지 못하면 아무것도 그리지 않아 부모의 회색 배경이 그대로 보인다.
// (새 멘토 사진을 올리기 전에도 목록 카드가 깨진 이미지 아이콘으로 보이지 않게 한다.)

import { useState } from "react";
import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  style?: React.CSSProperties;
};

export default function MentorImage({ src, alt, sizes, className, style }: Props) {
  const [err, setErr] = useState(false);
  if (err) return null;
  return <Image src={src} alt={alt} fill sizes={sizes} className={className} style={style} onError={() => setErr(true)} />;
}
