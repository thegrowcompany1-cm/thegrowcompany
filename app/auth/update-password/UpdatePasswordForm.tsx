"use client";

// 비밀번호 재설정 — 메일의 재설정 링크로 들어오면 복구 세션이 잡히고,
// 그 세션으로 updateUser({ password }) 를 호출한다.
// 로그인 상태에서 직접 들어와도 동일하게 동작한다.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  AUTH_PAGE,
  AUTH_CARD,
  AUTH_TITLE,
  AUTH_SUB,
  LABEL,
  INPUT,
  INPUT_ERR,
  FIELD_ERR,
  BTN_PRIMARY,
  ALERT_ERR,
  LINK,
  MIN_PASSWORD,
} from "@/lib/authStyles";

export default function UpdatePasswordForm() {
  const router = useRouter();

  // null = 확인 중 / true = 재설정 가능 / false = 세션 없음
  const [ready, setReady] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErr, setFieldErr] = useState<{ password?: string; confirm?: string }>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // 재설정 링크로 들어왔는지 확인 — 인증 확인은 getUser() 로만 한다
  useEffect(() => {
    let alive = true;
    const supabase = createClient();

    const check = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!alive) return;
      setReady(!error && !!data.user);
    };

    // 메일 링크의 토큰이 처리되기 전에 확인하면 세션이 없다고 나올 수 있으므로
    // onAuthStateChange 로 복구 세션이 잡히는 시점에도 다시 확인한다.
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void check();
    });
    void check();

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setFormError("");

    const e: { password?: string; confirm?: string } = {};
    if (!password) e.password = "새 비밀번호를 입력해주세요.";
    else if (password.length < MIN_PASSWORD)
      e.password = `비밀번호는 ${MIN_PASSWORD}자 이상이어야 합니다.`;
    if (!confirm) e.confirm = "비밀번호 확인을 입력해주세요.";
    else if (password !== confirm) e.confirm = "비밀번호가 일치하지 않습니다.";
    setFieldErr(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("should be different") || msg.includes("same as")) {
          setFieldErr({ password: "기존 비밀번호와 다른 비밀번호를 입력해주세요." });
        } else {
          setFormError("비밀번호 변경에 실패했습니다. 재설정 메일을 다시 요청해주세요.");
        }
        return;
      }
      setDone(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className={AUTH_PAGE}>
        <div className={AUTH_CARD}>
          <h1 className={AUTH_TITLE}>비밀번호가 변경되었습니다</h1>
          <p className={AUTH_SUB}>새 비밀번호로 이용하실 수 있습니다.</p>
          <div className="mt-6 flex gap-4 text-[13px]">
            <Link href="/mypage" className={LINK}>
              마이페이지로 이동
            </Link>
            <Link href="/" className={LINK}>
              메인으로 이동
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (ready === false) {
    return (
      <div className={AUTH_PAGE}>
        <div className={AUTH_CARD}>
          <h1 className={AUTH_TITLE}>재설정 링크를 확인해주세요</h1>
          <p className={AUTH_SUB}>
            비밀번호 재설정 링크가 만료되었거나 올바르지 않습니다. 로그인 화면에서
            재설정 메일을 다시 요청해주세요.
          </p>
          <div className="mt-6">
            <Link href="/login" className={LINK}>
              로그인 화면으로 이동
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={AUTH_PAGE}>
      <div className={AUTH_CARD}>
        <h1 className={AUTH_TITLE}>새 비밀번호 설정</h1>
        <p className={AUTH_SUB}>
          앞으로 사용하실 새 비밀번호를 입력해주세요.
        </p>

        <form onSubmit={onSubmit} noValidate className="mt-7 space-y-5">
          <div>
            <label htmlFor="up-pw" className={LABEL}>
              새 비밀번호
            </label>
            <input
              id="up-pw"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={`${MIN_PASSWORD}자 이상`}
              className={`${INPUT} ${fieldErr.password ? INPUT_ERR : ""}`}
            />
            {fieldErr.password && <p className={FIELD_ERR}>{fieldErr.password}</p>}
          </div>

          <div>
            <label htmlFor="up-pw2" className={LABEL}>
              새 비밀번호 확인
            </label>
            <input
              id="up-pw2"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="비밀번호를 한 번 더 입력해주세요"
              className={`${INPUT} ${fieldErr.confirm ? INPUT_ERR : ""}`}
            />
            {fieldErr.confirm && <p className={FIELD_ERR}>{fieldErr.confirm}</p>}
          </div>

          {formError && <p className={ALERT_ERR}>{formError}</p>}

          <button
            type="submit"
            disabled={loading || ready === null}
            className={BTN_PRIMARY}
          >
            {ready === null ? "확인 중" : loading ? "변경 중" : "비밀번호 변경"}
          </button>
        </form>
      </div>
    </div>
  );
}
