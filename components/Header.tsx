"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const navItems = [
  {
    label: "창업컨설팅",
    href: "/consulting/startup",
    desc: "헬스장, 필라테스 등 창업을 준비 중이신 분들을 위한 맞춤 컨설팅",
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
    label: "진단컨설팅",
    href: "/consulting/diagnosis",
    desc: "전문가의 1:1 현장 진단 및 맞춤 솔루션 제공",
    external: false,
  },
  {
    label: "그로우 에듀",
    href: "/edu/fc-class",
    desc: "피트니스 실무 중심 맞춤별 교육 프로그램",
    external: false,
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hoveredItem = navItems.find((n) => n.label === hoveredLabel) ?? null;

  return (
    <header
      className={`sticky top-0 z-50 bg-[#111111] transition-shadow duration-200 ${
        scrolled ? "shadow-[0_4px_24px_rgba(0,0,0,0.6)]" : "border-b border-white/10"
      }`}
      onMouseLeave={() => setHoveredLabel(null)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center">
            <Image
              src="/logos/thegrow-logo.png"
              alt="더그로우컴퍼니"
              width={140}
              height={40}
              className="h-9 sm:h-10 w-auto object-contain"
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

              return item.external ? (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkCls}
                  onMouseEnter={() => setHoveredLabel(item.label)}
                >
                  {item.label}
                  <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className={linkCls}
                  onMouseEnter={() => setHoveredLabel(item.label)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: SNS + CTA */}
          <div className="hidden lg:flex items-center gap-2">
            <a
              href="https://www.instagram.com/thegrow.company/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[#999999] hover:text-[#E1306C] transition-colors rounded-lg hover:bg-white/10"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="https://www.youtube.com/@fitnessgrowlab"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[#999999] hover:text-[#FF0000] transition-colors rounded-lg hover:bg-white/10"
              aria-label="YouTube"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            <a
              href="tel:15514476"
              className="ml-2 px-5 py-2 bg-[#009519] hover:bg-[#007a14] text-white text-sm font-bold rounded-full transition-colors"
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

      {/* ── Description bar (desktop hover) ── */}
      <div
        className="hidden lg:block overflow-hidden transition-all duration-200"
        style={{ maxHeight: hoveredItem ? "44px" : "0px", borderTop: hoveredItem ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <p className="text-sm text-[#888888] transition-opacity duration-150">
            {hoveredItem?.desc ?? ""}
          </p>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? "max-h-[500px]" : "max-h-0"
        }`}
      >
        <div className="border-t border-white/10 bg-[#111111] pb-4">
          {navItems.map((item) => (
            <div key={item.label} className="border-b border-white/[0.06] last:border-0">
              {item.external ? (
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
            </div>
          ))}
          <div className="flex items-center gap-4 px-4 pt-4">
            <a href="https://www.instagram.com/thegrow.company/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-[#999999]">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              Instagram
            </a>
            <a href="https://www.youtube.com/@fitnessgrowlab" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-[#999999]">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
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
