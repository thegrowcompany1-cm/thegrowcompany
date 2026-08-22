import type { Metadata } from "next";
import Link from "next/link";
import { BOARDS, getPosts } from "./boards";

export const metadata: Metadata = {
  // 루트 layout 의 title.template 이 접미사를 덧붙이므로 absolute 로 고정한다
  title: { absolute: "정보마당 | 더그로우컴퍼니" },
  description:
    "헬스장·필라테스 창업 칼럼과 운영 노하우, 그리고 대표님들의 자유게시판. 현장에서 쌓인 정보를 한곳에서 확인하세요.",
  alternates: { canonical: "/info" },
};

export default function InfoHubPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        {/* 헤더 */}
        <header className="mb-12 sm:mb-16">
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
            정보마당
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#9a9a9a] sm:text-base">
            창업을 준비하는 단계부터 오픈 이후 운영까지, 현장에서 쌓인 정보를
            나눕니다. 대표님들이 직접 남기는 이야기도 함께 확인하실 수 있습니다.
          </p>
        </header>

        {/* 게시판 3종 카드 + 각 게시판 최신 글 3개 미리보기 */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {BOARDS.map((board) => {
            const latest = getPosts(board.slug).slice(0, 3);
            return (
              <section
                key={board.slug}
                className="flex flex-col rounded-2xl border border-[#242424] bg-[#141414] p-6 transition-colors hover:border-[#22B573]/50"
              >
                <h2 className="text-lg font-extrabold text-white">
                  <Link
                    href={`/info/${board.slug}`}
                    className="transition-colors hover:text-[#22B573]"
                  >
                    {board.name}
                  </Link>
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-[#8a8a8a]">
                  {board.desc}
                </p>

                <ul className="mt-5 flex-1 space-y-1 border-t border-[#222] pt-4">
                  {latest.map((post) => (
                    <li key={post.id}>
                      <Link
                        href={`/info/${board.slug}/${post.id}`}
                        className="group flex items-baseline justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/[0.04]"
                      >
                        <span className="min-w-0 flex-1 truncate text-sm text-[#cfcfcf] transition-colors group-hover:text-[#22B573]">
                          {post.title}
                        </span>
                        <span className="flex-shrink-0 text-xs tabular-nums text-[#666]">
                          {post.date}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/info/${board.slug}`}
                  className="mt-5 inline-flex items-center justify-center rounded-xl border border-[#2a2a2a] bg-[#191919] px-4 py-3 text-sm font-bold text-[#ddd] transition-colors hover:border-[#22B573] hover:text-[#22B573]"
                >
                  {board.name} 전체 보기
                </Link>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
