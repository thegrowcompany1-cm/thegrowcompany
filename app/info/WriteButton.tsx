"use client";

// 자유게시판 목록 상단 글쓰기 버튼 — 현재는 자리만 잡아둔 상태.
// TODO(인증): 로그인/회원 기능을 붙인 뒤 글 작성 페이지로 이동시킬 것.
//   지금은 비로그인 사용자에게 안내만 띄운다.
export default function WriteButton() {
  return (
    <button
      type="button"
      onClick={() => alert("로그인 후 이용 가능합니다.")}
      className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-xl bg-[#22B573] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1a9c60]"
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
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
      글쓰기
    </button>
  );
}
