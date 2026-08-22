import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BOARDS,
  getBoard,
  getPosts,
  fmtViews,
  type BoardSlug,
} from "../boards";
import WriteButton from "../WriteButton";

type Props = { params: Promise<{ board: string }> };

// 게시판 3종만 정적 생성 — 그 외 슬러그는 notFound
export function generateStaticParams() {
  return BOARDS.map((b) => ({ board: b.slug }));
}

// 게시판별 SEO 타이틀
const SEO: Record<BoardSlug, { title: string; desc: string }> = {
  column: {
    title: "헬스장·필라테스 창업 칼럼 | 더그로우컴퍼니",
    desc: "입지 선정부터 인테리어, 프리세일까지. 헬스장·필라테스 창업을 준비하며 반드시 짚어야 할 기준을 정리한 창업 칼럼입니다.",
  },
  knowhow: {
    title: "헬스장·필라테스 운영 노하우 | 더그로우컴퍼니",
    desc: "재등록률과 회원 관리, 상담 전환율까지. 오픈 이후의 매출을 지탱하는 피트니스 센터 운영 노하우를 나눕니다.",
  },
  free: {
    title: "피트니스 창업·운영 자유게시판 | 더그로우컴퍼니",
    desc: "헬스장·필라테스 대표님들이 창업과 운영 경험을 자유롭게 나누는 게시판입니다.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { board } = await params;
  const found = getBoard(board);
  if (!found) return {};
  const seo = SEO[found.slug];
  return {
    // 루트 layout 의 title.template 중복 부착을 막기 위해 absolute 사용
    title: { absolute: seo.title },
    description: seo.desc,
    alternates: { canonical: `/info/${found.slug}` },
  };
}

export default async function BoardListPage({ params }: Props) {
  const { board } = await params;
  const found = getBoard(board);
  if (!found) notFound();

  const posts = getPosts(found.slug);

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        {/* 상단 경로 */}
        <nav className="mb-6 text-xs text-[#777]">
          <Link href="/info" className="transition-colors hover:text-[#22B573]">
            정보마당
          </Link>
          <span className="mx-2 text-[#444]">/</span>
          <span className="text-[#aaa]">{found.name}</span>
        </nav>

        <header className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-[#222] pb-7">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold sm:text-3xl">{found.name}</h1>
            <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-[#8a8a8a]">
              {found.desc}
            </p>
          </div>
          {found.writable && <WriteButton />}
        </header>

        {/* 목록 헤더 (PC 전용) */}
        <div className="hidden border-b border-[#222] px-3 pb-3 text-xs font-bold text-[#777] sm:flex sm:items-center sm:gap-4">
          <span className="w-12 flex-shrink-0 text-center">번호</span>
          <span className="flex-1">제목</span>
          <span className="w-24 flex-shrink-0 text-center">작성자</span>
          <span className="w-24 flex-shrink-0 text-center">작성일</span>
          <span className="w-16 flex-shrink-0 text-center">조회수</span>
        </div>

        {/* 글 목록 */}
        <ul className="divide-y divide-[#1c1c1c]">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/info/${found.slug}/${post.id}`}
                className="group block px-3 py-4 transition-colors hover:bg-white/[0.03] sm:flex sm:items-center sm:gap-4"
              >
                <span className="hidden w-12 flex-shrink-0 text-center text-sm tabular-nums text-[#666] sm:block">
                  {post.id}
                </span>
                <span className="block flex-1 truncate text-[15px] font-medium text-[#e5e5e5] transition-colors group-hover:text-[#22B573]">
                  {post.title}
                </span>
                {/* 모바일: 메타 정보 한 줄로 */}
                <span className="mt-2 flex items-center gap-3 text-xs text-[#777] sm:hidden">
                  <span>{post.author}</span>
                  <span className="text-[#3a3a3a]">|</span>
                  <span className="tabular-nums">{post.date}</span>
                  <span className="text-[#3a3a3a]">|</span>
                  <span className="tabular-nums">
                    조회 {fmtViews(post.views)}
                  </span>
                </span>
                {/* PC: 컬럼 정렬 */}
                <span className="hidden w-24 flex-shrink-0 text-center text-sm text-[#999] sm:block">
                  {post.author}
                </span>
                <span className="hidden w-24 flex-shrink-0 text-center text-sm tabular-nums text-[#777] sm:block">
                  {post.date}
                </span>
                <span className="hidden w-16 flex-shrink-0 text-center text-sm tabular-nums text-[#777] sm:block">
                  {fmtViews(post.views)}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* 페이지네이션 — UI 뼈대만 (동작 없음)
            TODO(Supabase): 실제 페이지 수·현재 페이지 연동 시 Link 로 교체 */}
        <div className="mt-10 flex items-center justify-center gap-1.5">
          <span
            aria-disabled="true"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#242424] text-sm text-[#4a4a4a]"
          >
            &lt;
          </span>
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              aria-current={n === 1 ? "page" : undefined}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm tabular-nums ${
                n === 1
                  ? "border-[#22B573] bg-[#22B573]/10 font-bold text-[#22B573]"
                  : "border-[#242424] text-[#888]"
              }`}
            >
              {n}
            </span>
          ))}
          <span
            aria-disabled="true"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#242424] text-sm text-[#4a4a4a]"
          >
            &gt;
          </span>
        </div>
      </div>
    </div>
  );
}
