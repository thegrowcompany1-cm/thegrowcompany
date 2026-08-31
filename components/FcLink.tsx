"use client";

// 정규 FC 세미나 링크 — 기간 한정 외부 연결을 한곳에서 처리한다.
//
// 부산 기수 종료(2026-09-12) 후 자동으로 /edu/fc-class 복귀
//
// 판정을 클라이언트에서 하는 이유:
//  · 이 링크가 헤더·푸터를 통해 사실상 모든 페이지에 들어가는데, 서버에서
//    시각을 판정하면 정적 생성된 HTML 에 만료된 외부 링크가 굳어버린다.
//  · 서버 렌더는 항상 내부 경로(FC_SSR_LINK)로 고정하고 마운트 후 실제 시각으로
//    바꾸므로 하이드레이션 불일치가 생기지 않고, 재검증 설정도 필요 없다.
//  · 크롤러와 JS 미실행 환경에는 정식 경로인 /edu/fc-class 가 노출된다.

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFcLink, FC_SSR_LINK, type FcLinkTarget } from "@/lib/fcLink";

type Props = {
  className?: string;
  children: React.ReactNode;
  /** 모바일 메뉴처럼 클릭 후 닫아야 하는 경우 */
  onClick?: () => void;
};

/** 현재 시각 기준 FC 세미나 링크 — 서버에서는 내부 경로, 마운트 후 실제 판정 */
export function useFcLink(): FcLinkTarget {
  const [link, setLink] = useState<FcLinkTarget>(FC_SSR_LINK);

  useEffect(() => {
    setLink(getFcLink());
  }, []);

  return link;
}

export default function FcLink({ className, children, onClick }: Props) {
  const { href, external } = useFcLink();

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
