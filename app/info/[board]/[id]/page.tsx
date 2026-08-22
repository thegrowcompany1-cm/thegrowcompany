import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BOARDS, getBoard, getPosts, getPost, fmtViews } from "../../boards";

type Props = { params: Promise<{ board: string; id: string }> };

// 더미 글 전체를 정적 생성
export function generateStaticParams() {
  return BOARDS.flatMap((b) =>
    getPosts(b.slug).map((p) => ({ board: b.slug, id: String(p.id) })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { board, id } = await params;
  const found = getBoard(board);
  if (!found) return {};
  const post = getPost(found.slug, Number(id));
  if (!post) return {};
  return {
    // 루트 layout 의 title.template 중복 부착을 막기 위해 absolute 사용
    title: { absolute: `${post.title} | ${found.name} | 더그로우컴퍼니` },
    description: post.body[0].slice(0, 120),
    alternates: { canonical: `/info/${found.slug}/${post.id}` },
  };
}

export default async function PostDetailPage({ params }: Props) {
  const { board, id } = await params;
  const found = getBoard(board);
  if (!found) notFound();

  const postId = Number(id);
  const post = Number.isFinite(postId) ? getPost(found.slug, postId) : undefined;
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white">
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        {/* 상단 경로 */}
        <nav className="mb-6 text-xs text-[#777]">
          <Link href="/info" className="transition-colors hover:text-[#22B573]">
            정보마당
          </Link>
          <span className="mx-2 text-[#444]">/</span>
          <Link
            href={`/info/${found.slug}`}
            className="transition-colors hover:text-[#22B573]"
          >
            {found.name}
          </Link>
        </nav>

        <article>
          {/* 제목 + 작성자 + 날짜 */}
          <header className="border-b border-[#222] pb-6">
            <h1 className="text-xl font-extrabold leading-snug sm:text-2xl">
              {post.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#777]">
              <span className="font-semibold text-[#aaa]">{post.author}</span>
              <span className="text-[#3a3a3a]">|</span>
              <span className="tabular-nums">{post.date}</span>
              <span className="text-[#3a3a3a]">|</span>
              <span className="tabular-nums">조회 {fmtViews(post.views)}</span>
            </div>
          </header>

          {/* 본문 */}
          <div className="space-y-5 py-8 text-[15px] leading-[1.85] text-[#cfcfcf]">
            {post.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </article>

        {/* 댓글 자리 — 기능 준비 중
            TODO(Supabase + 인증): comments 테이블 연동 후 실제 댓글 영역으로 교체 */}
        <section className="rounded-2xl border border-[#242424] bg-[#141414] px-6 py-10 text-center">
          <p className="text-sm font-bold text-[#9a9a9a]">댓글 기능 준비 중</p>
          <p className="mt-2 text-xs leading-relaxed text-[#666]">
            대표님들이 서로 의견을 나누실 수 있도록 준비하고 있습니다.
          </p>
        </section>

        {/* 하단 목록으로 */}
        <div className="mt-10 flex justify-center">
          <Link
            href={`/info/${found.slug}`}
            className="inline-flex items-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#191919] px-6 py-3 text-sm font-bold text-[#ddd] transition-colors hover:border-[#22B573] hover:text-[#22B573]"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            목록으로
          </Link>
        </div>
      </div>
    </div>
  );
}
