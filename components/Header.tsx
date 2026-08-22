"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// SNS 링크
const INSTAGRAM_URL =
  "https://www.instagram.com/thegrow.company?igsh=MWZrdGQ1ZmUydnlwdw==";
const YOUTUBE_URL = "https://youtube.com/@thegrow_tv?si=4eppQE7HZjAPcwpz";

// 외부 라이브러리 없이 인라인 SVG (currentColor 상속 → 텍스트 색/hover 색 그대로 따라감)
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" stroke="none" />
    </svg>
  );
}

type NavChild = { label: string; href: string; sub?: string };
type NavItem = {
  label: string;
  href: string;
  desc: string;
  external: boolean;
  children?: NavChild[];
};

const navItems: NavItem[] = [
  {
    label: "창업솔루션",
    href: "/consulting/startup",
    desc: "헬스장, 필라테스 등 창업을 준비 중이신 분들을 위한 맞춤 솔루션",
    external: false,
  },
  {
    label: "매장 위탁운영",
    href: "/consulting/outsourcing",
    desc: "헬스·PT·바레·필라테스·골프 등 운영이 어려우신 매장을 위한 단기 위탁운영",
    external: false,
  },
  {
    label: "시설 위탁운영",
    href: "/consulting/community",
    desc: "아파트/기업/대학/공공기관 커뮤니티 시설 장기 위탁운영",
    external: false,
  },
  {
    label: "진단솔루션",
    href: "/consulting/diagnosis",
    desc: "전문가의 1:1 현장 진단 및 맞춤 솔루션 제공",
    external: false,
    children: [
      { label: "김재강 멘토", href: "/consulting/diagnosis/kim-jaegang" },
      { label: "김승호 멘토", href: "/consulting/diagnosis/kim-seungho" },
      { label: "황봉남 멘토", href: "/consulting/diagnosis/hwang-bongnam" },
      { label: "박정민 멘토", href: "/consulting/diagnosis/park-jungmin" },
      { label: "구진완 멘토", href: "/consulting/diagnosis/gu-jinwan" },
      { label: "허준영 멘토", href: "/consulting/diagnosis/heo-junyoung" },
    ],
  },
  {
    label: "그로우 에듀",
    href: "/edu",
    desc: "피트니스 실무 중심 맞춤별 교육 프로그램",
    external: false,
    children: [
      { label: "창업 세미나", href: "/edu/startup-class" },
      { label: "정규 FC 세미나", href: "/edu/fc-class" },
    ],
  },
  {
    label: "정보마당",
    href: "/info",
    desc: "창업 칼럼과 운영 노하우, 대표님들의 자유게시판",
    external: false,
    children: [
      { label: "창업 칼럼", href: "/info/column" },
      { label: "운영 노하우", href: "/info/knowhow" },
      { label: "자유게시판", href: "/info/free" },
    ],
  },
  {
    label: "(주)그로우인테리어",
    href: "https://www.growinterior.co.kr",
    desc: "리모델링, 신규 입점 등 피트니스 전문 인테리어",
    external: true,
  },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  // 모바일 아코디언 — 동시에 하나만 펼침 (라벨 저장, null = 전부 접힘)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 모바일 메뉴가 닫히면 펼침 상태 전부 초기화
  useEffect(() => {
    if (!mobileOpen) setMobileExpanded(null);
  }, [mobileOpen]);

  const hoveredItem = navItems.find((n) => n.label === hoveredLabel) ?? null;

  return (
    <header
      className={`sticky top-0 z-50 bg-[#111111] transition-shadow duration-200 ${
        scrolled ? "shadow-[0_4px_24px_rgba(0,0,0,0.6)]" : "border-b border-white/10"
      }`}
      onMouseLeave={() => setHoveredLabel(null)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 lg:h-24">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center">
            <Image
              src="/logos/thegrow-logo.png"
              alt="더그로우컴퍼니 - 헬스장·필라테스 창업·운영·마케팅 솔루션 로고"
              width={210}
              height={60}
              className="h-[72px] lg:h-20 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0">
            {navItems.map((item) => {
              const isHov = hoveredLabel === item.label;
              const linkCls = `px-3 py-2.5 text-sm font-medium transition-colors duration-150 flex items-center gap-1 rounded-lg hover:bg-white/8 ${
                isHov ? "text-[#009519]" : "text-[#CCCCCC] hover:text-white"
              }`;

              return (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setHoveredLabel(item.label)}
                >
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkCls}
                    >
                      {item.label}
                      <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : (
                    <Link href={item.href} className={linkCls}>
                      {item.label}
                      {item.children && (
                        <svg
                          className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 ${isHov ? "rotate-180" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </Link>
                  )}

                  {/* Dropdown (hover) */}
                  {item.children && (
                    <div
                      className={`absolute left-0 top-full pt-2 transition-all duration-200 ${
                        isHov
                          ? "visible translate-y-0 opacity-100"
                          : "pointer-events-none invisible -translate-y-1 opacity-0"
                      }`}
                    >
                      <div className="min-w-[220px] rounded-xl border border-white/10 bg-[#1b1b1b] py-2 shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2.5 text-[#CCCCCC] transition-colors hover:bg-white/5 hover:text-[#009519]"
                          >
                            <span className="text-sm font-medium">{child.label}</span>
                            {child.sub && (
                              <span className="mt-0.5 block text-xs text-[#777777]">{child.sub}</span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right: SNS + CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="더그로우컴퍼니 인스타그램"
              className="p-1.5 text-[#CCCCCC] hover:text-[#009519] transition-colors rounded-lg hover:bg-white/10"
            >
              <InstagramIcon className="w-6 h-6" />
            </a>
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="더그로우컴퍼니 유튜브"
              className="p-1.5 text-[#CCCCCC] hover:text-[#009519] transition-colors rounded-lg hover:bg-white/10"
            >
              <YoutubeIcon className="w-6 h-6" />
            </a>
            <a
              href="tel:15514476"
              className="ml-1 px-5 py-2 bg-[#009519] hover:bg-[#007a14] text-white text-sm font-bold rounded-full transition-colors"
            >
              무료 상담
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 text-[#CCCCCC] rounded-lg hover:bg-white/10"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="메뉴 열기"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`block h-0.5 bg-current rounded transition-all duration-300 origin-center ${mobileOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
              <span className={`block h-0.5 bg-current rounded transition-all duration-300 ${mobileOpen ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`block h-0.5 bg-current rounded transition-all duration-300 origin-center ${mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* ── Description bar (desktop hover) — 드롭다운 있는 메뉴는 드롭다운으로 대체 ── */}
      {(() => {
        const showDesc = !!hoveredItem && !hoveredItem.children;
        return (
          <div
            className="hidden lg:block overflow-hidden transition-all duration-200"
            style={{ maxHeight: showDesc ? "44px" : "0px", borderTop: showDesc ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent" }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
              <p className="text-sm text-[#888888] transition-opacity duration-150">
                {showDesc ? hoveredItem?.desc : ""}
              </p>
            </div>
          </div>
        );
      })()}

      {/* ── Mobile menu ── */}
      <div
        className={`lg:hidden overflow-y-auto overflow-x-hidden transition-all duration-300 ${
          mobileOpen ? "max-h-[80vh]" : "max-h-0"
        }`}
      >
        <div className="border-t border-white/10 bg-[#111111] pb-4">
          {navItems.map((item) => {
            const isExpanded = mobileExpanded === item.label;
            return (
              <div key={item.label} className="border-b border-white/[0.06] last:border-0">
                {item.children ? (
                  // 하위 메뉴가 있는 카테고리 — 행 전체가 펼침 토글 (아코디언)
                  <button
                    type="button"
                    className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
                    onClick={() =>
                      setMobileExpanded(isExpanded ? null : item.label)
                    }
                    aria-expanded={isExpanded}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#EEEEEE]">{item.label}</p>
                      <p className="text-xs text-[#666666] mt-0.5 leading-snug">{item.desc}</p>
                    </div>
                    <svg
                      className={`mt-1 h-4 w-4 flex-shrink-0 text-[#888888] transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                ) : item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 px-4 py-3.5"
                    onClick={() => setMobileOpen(false)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#EEEEEE] flex items-center gap-1.5">
                        {item.label}
                        <svg className="w-3 h-3 opacity-50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </p>
                      <p className="text-xs text-[#666666] mt-0.5 leading-snug">{item.desc}</p>
                    </div>
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className="flex items-start gap-3 px-4 py-3.5"
                    onClick={() => setMobileOpen(false)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#EEEEEE]">{item.label}</p>
                      <p className="text-xs text-[#666666] mt-0.5 leading-snug">{item.desc}</p>
                    </div>
                  </Link>
                )}

                {/* 하위 메뉴 — 기본 접힘, 터치 시 슬라이드 다운 (CSS transition) */}
                {item.children && (
                  <div
                    className="overflow-hidden"
                    style={{
                      maxHeight: isExpanded
                        ? `${(item.children.length + 1) * 48 + 16}px`
                        : "0px",
                      transition: "max-height 0.25s ease",
                    }}
                  >
                    <div className="pb-2 pl-4">
                      {/* 허브 페이지 링크 — 카테고리 라벨 대신 하위 맨 위에 배치 */}
                      <Link
                        href={item.href}
                        className="flex items-baseline gap-2 rounded-lg px-4 py-2 font-semibold text-[#009519] transition-colors hover:bg-white/5"
                        onClick={() => setMobileOpen(false)}
                      >
                        <span className="text-sm">{item.label} 전체 보기</span>
                      </Link>
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="flex items-baseline gap-2 rounded-lg px-4 py-2 text-[#BBBBBB] transition-colors hover:bg-white/5 hover:text-[#009519]"
                          onClick={() => setMobileOpen(false)}
                        >
                          <span className="text-sm">{child.label}</span>
                          {child.sub && (
                            <span className="text-xs text-[#666666]">{child.sub}</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <div className="flex items-center gap-4 px-4 pt-4">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="더그로우컴퍼니 인스타그램"
              className="flex items-center gap-1.5 text-sm text-[#CCCCCC] hover:text-[#009519] transition-colors"
            >
              <InstagramIcon className="w-5 h-5" />
              Instagram
            </a>
            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="더그로우컴퍼니 유튜브"
              className="flex items-center gap-1.5 text-sm text-[#CCCCCC] hover:text-[#009519] transition-colors"
            >
              <YoutubeIcon className="w-5 h-5" />
              YouTube
            </a>
            <a href="tel:15514476" className="ml-auto px-4 py-2 bg-[#009519] text-white text-sm font-bold rounded-full">
              무료 상담
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
