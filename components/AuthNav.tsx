"use client";

// 헤더 인증 영역 — 미로그인이면 "로그인", 로그인 상태면 "OO님 / 마이페이지 / 로그아웃".
// PC(우측)와 모바일(메뉴 하단) 두 곳에서 variant 만 바꿔 재사용한다.
//
// 인증 확인은 반드시 getUser() 로 한다. onAuthStateChange 는 "다시 확인하라"는
// 신호로만 쓰고, 콜백이 넘겨주는 session 값은 신뢰하지 않는다.

import { useEffect, useState } from "react";
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

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setName(null);
    onNavigate?.();
    router.refresh();
  };

  // 첫 확인 전에는 아무것도 그리지 않는다 (로그인 상태가 깜빡이는 것 방지)
  if (!ready) return null;

  if (variant === "desktop") {
    return (
      <div className="flex items-center gap-2.5">
        {name ? (
          <>
            <span className="max-w-[110px] truncate text-sm font-semibold text-[#EEEEEE]">
              {name}님
            </span>
            <Link
              href="/mypage"
              className="rounded-lg px-2.5 py-1.5 text-sm text-[#CCCCCC] transition-colors hover:bg-white/10 hover:text-[#009519]"
            >
              마이페이지
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg px-2.5 py-1.5 text-sm text-[#888888] transition-colors hover:bg-white/10 hover:text-white"
            >
              로그아웃
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="rounded-lg px-2.5 py-1.5 text-sm text-[#CCCCCC] transition-colors hover:bg-white/10 hover:text-[#009519]"
          >
            로그인
          </Link>
        )}
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
            className="text-sm font-semibold text-[#009519] transition-colors hover:underline"
          >
            마이페이지
          </Link>
          <button
            type="button"
            onClick={logout}
            className="text-sm font-semibold text-[#888888] transition-colors hover:text-white"
          >
            로그아웃
          </button>
        </>
      ) : (
        <Link
          href="/login"
          onClick={onNavigate}
          className="text-sm font-semibold text-[#009519] transition-colors hover:underline"
        >
          로그인
        </Link>
      )}
    </div>
  );
}
