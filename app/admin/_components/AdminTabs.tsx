// /admin 상단 탭 — 회원 현황 / GA 분석
// 서버 컴포넌트(링크만). 각 탭 페이지가 렌더 첫 줄에서 requireAdmin() 을 호출하므로
// 이 링크가 보인다고 접근 권한이 생기는 것은 아니다.

import Link from "next/link";

const TABS = [
  { key: "members", label: "회원 현황", href: "/admin" },
  { key: "ga", label: "GA 분석", href: "/admin/ga" },
] as const;

export default function AdminTabs({ active }: { active: (typeof TABS)[number]["key"] }) {
  return (
    <nav aria-label="관리자 메뉴" className="mb-6 flex gap-1 border-b border-white/10">
      {TABS.map((t) => {
        const on = t.key === active;
        return (
          <Link
            key={t.key}
            href={t.href}
            aria-current={on ? "page" : undefined}
            className={
              "-mb-px border-b-2 px-4 py-3 text-sm font-bold transition-colors " +
              (on ? "border-[#22B573] text-white" : "border-transparent text-gray-400 hover:text-white")
            }
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
