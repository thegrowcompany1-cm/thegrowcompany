import Link from "next/link";

// 정보마당 상세 — 미로그인 회원에게 보여주는 잠금 안내.
// 3개 게시판(창업 칼럼 / 운영 노하우 / 자유게시판) 모두 같은 화면을 쓴다.
//
// 본문은 이 컴포넌트가 렌더될 때 서버에서 아예 만들지 않으므로 HTML 에 실리지 않는다.

type Props = {
  /** 로그인·가입 완료 후 돌아올 경로 */
  returnTo: string;
};

export default function LockedNotice({ returnTo }: Props) {
  const q = `redirect=${encodeURIComponent(returnTo)}`;

  return (
    <div className="my-8 rounded-2xl border border-[#242424] bg-[#141414] px-6 py-12 text-center">
      <svg
        className="mx-auto h-9 w-9 text-[#22B573]"
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

      <p className="mt-5 text-[15px] font-bold leading-relaxed text-[#e5e5e5] sm:text-base">
        이 글은 회원 전용입니다.
        <br />
        로그인 후 이어서 읽어보세요.
      </p>

      <div className="mx-auto mt-7 flex w-full max-w-xs flex-col gap-2.5 sm:max-w-sm sm:flex-row">
        <Link
          href={`/login?${q}`}
          className="flex-1 rounded-xl bg-[#22B573] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1a9c60]"
        >
          로그인
        </Link>
        <Link
          href={`/signup?${q}`}
          className="flex-1 rounded-xl border border-[#2a2a2a] bg-[#191919] px-6 py-3 text-sm font-bold text-[#ddd] transition-colors hover:border-[#22B573] hover:text-[#22B573]"
        >
          회원가입
        </Link>
      </div>
    </div>
  );
}
