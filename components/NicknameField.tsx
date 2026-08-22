"use client";

// 닉네임 입력 + 중복확인 — 회원가입과 마이페이지가 함께 쓴다.
//
// 중복확인을 통과한 뒤 값이 바뀌면 확인 상태를 자동으로 풀어 재확인을 요구한다.

import { useEffect, useRef, useState } from "react";
import {
  LABEL,
  INPUT,
  INPUT_ERR,
  FIELD_ERR,
  validateNickname,
  NICKNAME_MAX,
} from "@/lib/authStyles";

type Props = {
  id: string;
  value: string;
  onChange: (v: string) => void;
  /** 중복확인 통과 여부 — 부모가 제출 조건으로 쓴다 */
  confirmed: boolean;
  onConfirmedChange: (v: boolean) => void;
  /** 부모가 제출 시 넣어주는 오류 문구 */
  error?: string;
  label?: string;
  hint?: string;
};

export default function NicknameField({
  id,
  value,
  onChange,
  confirmed,
  onConfirmedChange,
  error,
  label = "닉네임",
  hint = "게시판과 댓글에 공개되는 이름입니다. 한글, 영문, 숫자 2자에서 12자까지 사용하실 수 있습니다.",
}: Props) {
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);

  // 확인 통과 후 값이 바뀌면 재확인을 요구한다.
  // 마이페이지처럼 이미 확정된 닉네임을 들고 시작하는 경우(confirmed=true)에는
  // 그 값을 "확인된 값" 으로 잡아둬야, 값을 바꿨을 때 재확인이 걸린다.
  const lastCheckedRef = useRef<string | null>(confirmed ? value.trim() : null);
  useEffect(() => {
    if (lastCheckedRef.current !== null && value.trim() !== lastCheckedRef.current) {
      lastCheckedRef.current = null;
      setMessage("");
      setOk(false);
      onConfirmedChange(false);
    }
  }, [value, onConfirmedChange]);

  const check = async () => {
    const v = value.trim();
    const formatErr = validateNickname(v);
    if (formatErr) {
      setOk(false);
      setMessage(formatErr);
      onConfirmedChange(false);
      return;
    }

    setChecking(true);
    setMessage("");
    try {
      const res = await fetch(
        `/api/check-nickname?nickname=${encodeURIComponent(v)}`,
      );
      const body = (await res.json()) as { available: boolean; message: string };

      setOk(body.available);
      setMessage(body.message);
      onConfirmedChange(body.available);
      lastCheckedRef.current = body.available ? v : null;
    } catch {
      setOk(false);
      setMessage("확인 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      onConfirmedChange(false);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          type="text"
          autoComplete="off"
          maxLength={NICKNAME_MAX}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="공개될 닉네임"
          className={`${INPUT} ${error && !confirmed ? INPUT_ERR : ""}`}
        />
        <button
          type="button"
          onClick={check}
          disabled={checking || !value.trim()}
          className="flex-shrink-0 whitespace-nowrap rounded-xl border border-[#2a2a2a] bg-[#191919] px-4 text-sm font-bold text-[#ddd] transition-colors hover:border-[#22B573] hover:text-[#22B573] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {checking ? "확인 중" : "중복확인"}
        </button>
      </div>

      {message && (
        <p
          className={`mt-1.5 text-xs ${ok ? "text-[#7fe0b0]" : "text-[#ff8080]"}`}
        >
          {message}
        </p>
      )}
      {!message && error && <p className={FIELD_ERR}>{error}</p>}
      {!message && !error && (
        <p className="mt-1.5 text-xs leading-relaxed text-[#666]">{hint}</p>
      )}
    </div>
  );
}
