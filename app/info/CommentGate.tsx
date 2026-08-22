// 게시글 하단 댓글 영역 — 댓글 기능 자체는 다음 작업.
//
// 정보마당 상세는 로그인한 회원만 열람할 수 있으므로, 이 컴포넌트가 그려지는
// 시점에는 항상 로그인 상태다. (미로그인 회원은 LockedNotice 를 보게 된다)
//
// TODO(댓글): comments 테이블 연동 후 이 자리를 실제 댓글 목록/작성 폼으로 교체.

export default function CommentGate() {
  return (
    <section className="rounded-2xl border border-[#242424] bg-[#141414] px-6 py-10 text-center">
      <p className="text-sm font-bold text-[#9a9a9a]">댓글 기능 준비 중</p>
      <p className="mt-2 text-xs leading-relaxed text-[#666]">
        대표님들이 서로 의견을 나누실 수 있도록 준비하고 있습니다.
      </p>
    </section>
  );
}
