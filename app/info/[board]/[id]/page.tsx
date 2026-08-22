import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBoard, getPost, fmtViews } from "../../boards";
import { createClient } from "@/lib/supabase/server";
import CommentGate from "../../CommentGate";

type Props = { params: Promise<{ board: string; id: string }> };

// 로그인 여부에 따라 본문 노출이 달라지므로 정적 생성하지 않는다.
// (generateStaticParams 를 두면 미로그인 기준 HTML 이 캐시되어 회원 전용 게시판이
//  잘못 노출되거나 반대로 회원에게 안내문이 보일 수 있다)
export const dynamic = "force-dynamic";

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

  // 로그인 여부 확인 — 반드시 getUser() (getSession() 금지)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const loggedIn = !!user;

  const returnTo = `/info/${found.slug}/${post.id}`;
  // 자유게시판은 회원 전용 — 목록은 공개하되 본문은 로그인해야 열람 가능
  const locked = found.slug === "free" && !loggedIn;

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

          {/* 본문 — 자유게시판은 회원만 열람 */}
          {locked ? (
            <div className="my-8 rounded-2xl border border-[#242424] bg-[#141414] px-6 py-12 text-center">
              <svg
                className="mx-auto h-8 w-8 text-[#22B573]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.6}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <p className="mt-4 text-[15px] font-bold text-[#e5e5e5]">
                회원 전용 게시판입니다
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-[#8a8a8a]">
                로그인 후 열람하실 수 있습니다.
              </p>
              <Link
                href={`/login?redirect=${encodeURIComponent(returnTo)}`}
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#22B573] px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1a9c60]"
              >
                로그인
              </Link>
            </div>
          ) : (
            <div className="space-y-5 py-8 text-[15px] leading-[1.85] text-[#cfcfcf]">
              {post.body.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}
        </article>

        {/* 댓글 영역 — 본문이 잠긴 경우에는 노출하지 않는다 */}
        {!locked && <CommentGate loggedIn={loggedIn} returnTo={returnTo} />}

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
