"use client";

// 로그인 폼 + 비밀번호 찾기(같은 화면의 접힘 영역)
//
// 로그인 실패 사유는 구체적으로 노출하지 않는다. "이메일이 없음" 과
// "비밀번호가 틀림" 을 구분해 알려주면 계정 존재 여부가 새어나가기 때문이다.

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  BTN_GHOST,
  ALERT_ERR,
  ALERT_OK,
  LINK,
  EMAIL_RE,
} from "@/lib/authStyles";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErr, setFieldErr] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  // 비밀번호 찾기 접힘 영역
  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetErr, setResetErr] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // 탈퇴 유예 중인 계정 — 복구 안내
  const [withdrawn, setWithdrawn] = useState<{ deletedAt: string; scheduledAt: string | null } | null>(null);
  const [recovering, setRecovering] = useState(false);
  const [recoverErr, setRecoverErr] = useState("");

  const searchParams = useSearchParams();
  // 로그인 후 돌아갈 경로 — 외부 URL 로 튕기지 않도록 내부 경로만 허용
  const rawRedirect = searchParams.get("redirect");
  const redirectTo =
    rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : "/";

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setFormError("");

    const e: { email?: string; password?: string } = {};
    if (!email.trim()) e.email = "이메일을 입력해주세요.";
    else if (!EMAIL_RE.test(email.trim()))
      e.email = "이메일 형식이 올바르지 않습니다.";
    if (!password) e.password = "비밀번호를 입력해주세요.";
    setFieldErr(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // 개발자가 원인을 바로 볼 수 있도록 원본 에러는 콘솔에만 남긴다
        console.error("signIn 실패:", error.code, error.message);
        const msg = error.message.toLowerCase();
        if (error.code === "email_provider_disabled") {
          // Supabase 대시보드에서 이메일 로그인이 꺼져 있는 상태
          setFormError(
            "현재 이메일 로그인이 중단되어 있습니다. 잠시 후 다시 시도해주세요.",
          );
        } else if (msg.includes("email not confirmed")) {
          setFormError(
            "이메일 인증이 완료되지 않았습니다. 가입하신 메일함에서 인증 링크를 확인해주세요.",
          );
        } else {
          // 사유를 구분하지 않고 동일하게 안내
          setFormError("이메일 또는 비밀번호가 일치하지 않습니다.");
        }
        return;
      }

      // 탈퇴 유예 중인 계정인지 확인
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("deleted_at, scheduled_deletion_at")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.deleted_at) {
          const due = profile.scheduled_deletion_at
            ? new Date(profile.scheduled_deletion_at).getTime()
            : 0;
          if (due && due <= Date.now()) {
            // 유예 기간이 지난 계정 — 삭제 대기 상태이므로 진입시키지 않는다
            await supabase.auth.signOut();
            setFormError(
              "탈퇴 유예 기간이 지난 계정입니다. 새로 가입해주세요.",
            );
            return;
          }
          setWithdrawn({
            deletedAt: profile.deleted_at,
            scheduledAt: profile.scheduled_deletion_at ?? null,
          });
          return;
        }
      }

      router.refresh();
      router.push(redirectTo);
    } finally {
      setLoading(false);
    }
  };

  // 탈퇴 유예 중인 계정 복구 — deleted_at / scheduled_deletion_at 을 비운다
  const recover = async () => {
    setRecoverErr("");
    setRecovering(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setRecoverErr("세션이 만료되었습니다. 다시 로그인해주세요.");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          deleted_at: null,
          scheduled_deletion_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        console.error("계정 복구 실패:", error.message);
        setRecoverErr("복구 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      setWithdrawn(null);
      router.refresh();
      router.push(redirectTo);
    } finally {
      setRecovering(false);
    }
  };

  // 복구를 원하지 않는 경우 — 로그아웃하고 초기 화면으로
  const cancelRecover = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setWithdrawn(null);
    setPassword("");
    router.refresh();
  };

  const onReset = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setResetErr("");
    if (!resetEmail.trim() || !EMAIL_RE.test(resetEmail.trim())) {
      setResetErr("이메일 형식이 올바르지 않습니다.");
      return;
    }

    setResetLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(
        resetEmail.trim(),
        { redirectTo: `${window.location.origin}/auth/update-password` },
      );
      if (error) {
        setResetErr("메일 발송 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
        return;
      }
      // 가입 여부와 무관하게 동일 문구 — 계정 존재 여부를 노출하지 않는다
      setResetSent(true);
    } finally {
      setResetLoading(false);
    }
  };

  // 탈퇴 유예 중인 계정 — 복구 안내 화면
  if (withdrawn) {
    const due = withdrawn.scheduledAt
      ? new Date(withdrawn.scheduledAt).toLocaleDateString("ko-KR")
      : null;
    return (
      <div className={AUTH_PAGE}>
        <div className={AUTH_CARD}>
          <h1 className={AUTH_TITLE}>탈퇴 처리 중인 계정입니다</h1>
          <p className={AUTH_SUB}>
            현재 탈퇴 유예 기간에 있는 계정입니다. 계정을 다시 사용하시려면 아래
            버튼을 눌러주세요. 지금까지의 회원 정보가 그대로 복구됩니다.
          </p>
          {due && (
            <p className="mt-3 text-[13px] leading-relaxed text-[#ff9a9a]">
              {due} 이후에는 모든 정보가 영구 삭제되어 복구하실 수 없습니다.
            </p>
          )}

          {recoverErr && <p className={`${ALERT_ERR} mt-5`}>{recoverErr}</p>}

          <div className="mt-7 space-y-3">
            <button
              type="button"
              onClick={recover}
              disabled={recovering}
              className={BTN_PRIMARY}
            >
              {recovering ? "복구 중" : "계정 복구하기"}
            </button>
            <button
              type="button"
              onClick={cancelRecover}
              disabled={recovering}
              className={BTN_GHOST}
            >
              복구하지 않고 나가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={AUTH_PAGE}>
      <div className={AUTH_CARD}>
        <h1 className={AUTH_TITLE}>로그인</h1>
        <p className={AUTH_SUB}>
          가입하신 이메일과 비밀번호를 입력해주세요.
        </p>

        <form onSubmit={onSubmit} noValidate className="mt-7 space-y-5">
          <div>
            <label htmlFor="li-email" className={LABEL}>
              이메일
            </label>
            <input
              id="li-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className={`${INPUT} ${fieldErr.email ? INPUT_ERR : ""}`}
            />
            {fieldErr.email && <p className={FIELD_ERR}>{fieldErr.email}</p>}
          </div>

          <div>
            <label htmlFor="li-pw" className={LABEL}>
              비밀번호
            </label>
            <input
              id="li-pw"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              className={`${INPUT} ${fieldErr.password ? INPUT_ERR : ""}`}
            />
            {fieldErr.password && <p className={FIELD_ERR}>{fieldErr.password}</p>}
          </div>

          {formError && <p className={ALERT_ERR}>{formError}</p>}

          <button type="submit" disabled={loading} className={BTN_PRIMARY}>
            {loading ? "로그인 중" : "로그인"}
          </button>
        </form>

        {/* 링크 영역 */}
        <div className="mt-6 flex items-center justify-between gap-3 text-[13px]">
          <Link
            href={redirectTo === "/" ? "/signup" : `/signup?redirect=${encodeURIComponent(redirectTo)}`}
            className={LINK}
          >
            회원가입
          </Link>
          <button
            type="button"
            onClick={() => setResetOpen((v) => !v)}
            aria-expanded={resetOpen}
            className="font-semibold text-[#8a8a8a] transition-colors hover:text-[#22B573]"
          >
            비밀번호를 잊으셨나요
          </button>
        </div>

        {/* 비밀번호 찾기 — 접힘 영역 */}
        <div
          className="overflow-hidden transition-[max-height] duration-300"
          style={{ maxHeight: resetOpen ? "340px" : "0px" }}
        >
          <div className="mt-5 rounded-xl border border-[#242424] bg-[#101010] p-5">
            {resetSent ? (
              <p className={ALERT_OK}>
                입력하신 주소로 비밀번호 재설정 메일을 보냈습니다. 메일의 링크를
                눌러 새 비밀번호를 설정해주세요.
              </p>
            ) : (
              <form onSubmit={onReset} noValidate className="space-y-4">
                <div>
                  <label htmlFor="li-reset" className={LABEL}>
                    비밀번호 재설정 메일 받기
                  </label>
                  <input
                    id="li-reset"
                    type="email"
                    autoComplete="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="가입하신 이메일"
                    className={`${INPUT} ${resetErr ? INPUT_ERR : ""}`}
                  />
                  {resetErr && <p className={FIELD_ERR}>{resetErr}</p>}
                </div>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className={BTN_GHOST}
                >
                  {resetLoading ? "발송 중" : "재설정 메일 발송"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
