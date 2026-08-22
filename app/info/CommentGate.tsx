import Link from "next/link";

// 게시글 하단 댓글 영역 — 댓글 기능 자체는 다음 작업.
// 지금은 로그인 여부에 따른 안내만 보여준다.
//
// TODO(댓글): comments 테이블 연동 후 이 자리를 실제 댓글 목록/작성 폼으로 교체.

type Props = {
  /** 서버에서 getUser() 로 확인한 로그인 여부 */
  loggedIn: boolean;
  /** 로그인 후 돌아올 경로 */
  returnTo: string;
};

export default function CommentGate({ loggedIn, returnTo }: Props) {
  return (
    <section className="rounded-2xl border border-[#242424] bg-[#141414] px-6 py-10 text-center">
      {loggedIn ? (
        <>
          <p className="text-sm font-bold text-[#9a9a9a]">댓글 기능 준비 중</p>
          <p className="mt-2 text-xs leading-relaxed text-[#666]">
            대표님들이 서로 의견을 나누실 수 있도록 준비하고 있습니다.
          </p>
        </>
      ) : (
        <>
          <p className="text-sm font-bold text-[#9a9a9a]">
            댓글은 로그인 후 작성하실 수 있습니다
          </p>
          <p className="mt-2 text-xs leading-relaxed text-[#666]">
            로그인하시면 이 글에 의견을 남기실 수 있습니다.
          </p>
          <Link
            href={`/login?redirect=${encodeURIComponent(returnTo)}`}
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#22B573] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1a9c60]"
          >
            로그인
          </Link>
        </>
      )}
    </section>
  );
}
