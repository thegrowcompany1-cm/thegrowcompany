"use client";

// 회원 표 — 검색 + 50명 단위 더보기.
//
// 서버에서 이미 가공된 표시용 문자열만 받는다. Supabase 클라이언트나 키는
// 이 파일 근처에 오지 않는다.
//
// 주의: 연락처·이메일 전체 값이 DOM 에 들어간다. 이 페이지는 서버에서 관리자만
// 통과시키므로 허용되는 범위지만, 화면 공유 때는 그대로 노출된다.

import { useMemo, useState } from "react";
import PhoneCell from "./PhoneCell";

const PAGE_SIZE = 50;

export type MemberRow = {
  id: string;
  joinedAt: string;
  username: string;
  nickname: string;
  email: string;
  phoneMasked: string;
  phoneFull: string;
  provider: string;
  lastSignInAt: string;
  role: string;
};

const GREEN = "#22B573";

export default function MembersTable({ rows }: { rows: MemberRow[] }) {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  // 이름·닉네임·이메일만 대상. 연락처는 검색 대상에서 뺐다 —
  // 마스킹해서 보여주는 값을 검색으로 역추적할 수 있으면 마스킹이 의미가 없다.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.username.toLowerCase().includes(q) ||
        r.nickname.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q),
    );
  }, [rows, query]);

  const shown = filtered.slice(0, visible);
  const hasMore = filtered.length > shown.length;

  const th = "whitespace-nowrap px-3 py-2.5 text-left text-[12px] font-bold text-gray-400";
  const td = "whitespace-nowrap px-3 py-2.5 text-[13px] text-gray-200";

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisible(PAGE_SIZE); // 검색을 바꾸면 더보기 상태를 되돌린다
          }}
          placeholder="이름 · 닉네임 · 이메일 검색"
          className="w-full rounded-xl border border-white/10 bg-[#0A0A0A] px-4 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#22B573] sm:max-w-xs"
        />
        <p className="text-[12px] text-gray-500">
          {query.trim()
            ? `검색 ${filtered.length.toLocaleString("ko-KR")}명 / 전체 ${rows.length.toLocaleString("ko-KR")}명`
            : `${rows.length.toLocaleString("ko-KR")}명`}
        </p>
      </div>

      {shown.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-500">
          {query.trim() ? "검색 결과가 없습니다." : "표시할 회원이 없습니다."}
        </p>
      ) : (
        <>
          <div className="-mx-2 overflow-x-auto px-2">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className={th}>가입일시</th>
                  <th className={th}>이름</th>
                  <th className={th}>닉네임</th>
                  <th className={th}>이메일</th>
                  <th className={th}>연락처</th>
                  <th className={th}>가입 방식</th>
                  <th className={th}>마지막 로그인</th>
                  <th className={th}>role</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.id} className="border-b border-white/5">
                    <td className={`${td} font-mono text-gray-400`}>{r.joinedAt}</td>
                    <td className={td}>{r.username || "-"}</td>
                    <td className={td}>{r.nickname || "-"}</td>
                    <td className={`${td} text-gray-300`}>{r.email || "-"}</td>
                    <td className={td}>
                      <PhoneCell masked={r.phoneMasked} full={r.phoneFull} />
                    </td>
                    <td className={td}>
                      {r.provider ? (
                        <span className="rounded-full bg-white/8 px-2 py-0.5 text-[11px] font-bold text-gray-300">
                          {r.provider}
                        </span>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                    <td className={`${td} font-mono text-gray-400`}>{r.lastSignInAt}</td>
                    <td className={td}>
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                        style={
                          r.role === "admin"
                            ? { backgroundColor: GREEN, color: "#fff" }
                            : { backgroundColor: "rgba(255,255,255,.08)", color: "#9CA3AF" }
                        }
                      >
                        {r.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-center gap-3">
            {hasMore ? (
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-bold text-gray-200 transition-colors hover:border-[#22B573] hover:text-white"
              >
                더보기 ({shown.length.toLocaleString("ko-KR")} /{" "}
                {filtered.length.toLocaleString("ko-KR")})
              </button>
            ) : (
              <p className="text-[12px] text-gray-600">
                {filtered.length.toLocaleString("ko-KR")}명을 모두 표시했습니다.
              </p>
            )}
          </div>
        </>
      )}
    </>
  );
}
