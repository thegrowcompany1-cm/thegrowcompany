"use client";

// 헤더 인증 영역 — 미로그인이면 "로그인", 로그인 상태면 "OO님" 드롭다운(마이페이지/로그아웃).
//
// 데스크톱에서 이름·마이페이지·로그아웃을 나란히 놓으면 네비가 두 줄로 감기기 때문에
// "OO님 ⌄" 하나로 압축하고 나머지는 드롭다운에 넣는다.
//
// 인증 확인은 반드시 getUser() 로 한다. onAuthStateChange 는 "다시 확인하라"는
// 신호로만 쓰고, 콜백이 넘겨주는 session 값은 신뢰하지 않는다.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  variant: "desktop" | "mobile";
  /** 모바일 메뉴에서 링크를 누르면 메뉴를 닫기 위한 콜백 */
  onNavigate?: () => void;
};

export default function AuthNav({ variant, onNavigate }: Props) {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    const supabase = createClient();

    const load = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!alive) return;
      if (error || !data.user) {
        setName(null);
      } else {
        const meta = data.user.user_metadata as { username?: string };
        setName(meta?.username?.trim() || data.user.email?.split("@")[0] || "회원");
      }
      setReady(true);
    };

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void load();
    });
    void load();

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // 드롭다운 — 바깥 클릭 / ESC 로 닫기
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setName(null);
    setOpen(false);
    onNavigate?.();
    router.refresh();
  };

  // 첫 확인 전에는 아무것도 그리지 않는다 (로그인 상태가 깜빡이는 것 방지)
  if (!ready) return null;

  if (variant === "desktop") {
    if (!name) {
      return (
        <Link
          href="/login"
          className="whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm text-[#CCCCCC] transition-colors hover:bg-white/10 hover:text-[#009519]"
        >
          로그인
        </Link>
      );
    }

    return (
      <div className="relative" ref={wrapRef}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="menu"
          className="flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-semibold text-[#EEEEEE] transition-colors hover:bg-white/10"
        >
          <span className="max-w-[88px] truncate">{name}</span>
          <span>님</span>
          <svg
            className={`h-3.5 w-3.5 opacity-70 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div
          role="menu"
          className={`absolute right-0 top-full z-50 pt-2 transition-all duration-200 ${
            open
              ? "visible translate-y-0 opacity-100"
              : "pointer-events-none invisible -translate-y-1 opacity-0"
          }`}
        >
          <div className="min-w-[150px] rounded-xl border border-white/10 bg-[#1b1b1b] py-2 shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
            <Link
              href="/mypage"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block whitespace-nowrap px-4 py-2.5 text-sm font-medium text-[#CCCCCC] transition-colors hover:bg-white/5 hover:text-[#009519]"
            >
              마이페이지
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={logout}
              className="block w-full whitespace-nowrap px-4 py-2.5 text-left text-sm font-medium text-[#888888] transition-colors hover:bg-white/5 hover:text-white"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 모바일 — 메뉴 하단
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 pt-4">
      {name ? (
        <>
          <span className="min-w-0 max-w-full truncate text-sm font-semibold text-[#EEEEEE]">
            {name}님
          </span>
          <Link
            href="/mypage"
            onClick={onNavigate}
            className="whitespace-nowrap text-sm font-semibold text-[#009519] transition-colors hover:underline"
          >
            마이페이지
          </Link>
          <button
            type="button"
            onClick={logout}
            className="whitespace-nowrap text-sm font-semibold text-[#888888] transition-colors hover:text-white"
          >
            로그아웃
          </button>
        </>
      ) : (
        <Link
          href="/login"
          onClick={onNavigate}
          className="whitespace-nowrap text-sm font-semibold text-[#009519] transition-colors hover:underline"
        >
          로그인
        </Link>
      )}
    </div>
  );
}
