"use client";

// 연락처 셀 — 기본은 가운데 4자리 마스킹, 클릭하면 전체를 보여준다.
//
// 주의: 전체 번호가 DOM 에 들어간다. 이 페이지는 서버에서 관리자만 통과시키므로
// 허용되는 범위지만, 화면 공유·스크린샷 때는 눌러둔 셀이 그대로 노출된다.

import { useState } from "react";

export default function PhoneCell({
  masked,
  full,
}: {
  masked: string;
  full: string;
}) {
  const [shown, setShown] = useState(false);

  if (full === "-" || !full) {
    return <span className="text-gray-500">-</span>;
  }

  return (
    <button
      type="button"
      onClick={() => setShown((v) => !v)}
      title={shown ? "가리기" : "전체 보기"}
      className="rounded px-1.5 py-0.5 font-mono text-[13px] text-gray-200 transition-colors hover:bg-white/10 hover:text-white"
    >
      {shown ? full : masked}
    </button>
  );
}
