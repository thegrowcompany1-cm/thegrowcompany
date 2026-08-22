"use client";

// 회원가입 폼 — 이름 → 이메일 → 전화번호 → 비밀번호 → 비밀번호 확인
//
// 이메일 중복확인 버튼은 SUPABASE_SERVICE_ROLE_KEY 가 없으면 서버에서 auth.users 를
// 조회할 수 없으므로 노출하지 않는다. 대신 signUp 응답의 "already registered" 에러로
// 분기해 안내한다. (키를 등록하면 /api/check-email 라우트를 붙여 버튼을 살릴 수 있다)

import { useState } from "react";
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
  formatPhone,
  EMAIL_RE,
  PHONE_RE,
  MIN_PASSWORD,
} from "@/lib/authStyles";

type Errors = Partial<
  Record<"name" | "email" | "phone" | "password" | "confirm" | "agree", string>
>;

export default function SignupForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);

  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  // 이메일 인증이 켜져 있으면 signUp 이 세션을 주지 않는다 — 그 경우 안내 문구로 분기
  const [needsConfirm, setNeedsConfirm] = useState(false);

  const validate = (): Errors => {
    const e: Errors = {};
    if (!name.trim()) e.name = "이름을 입력해주세요.";
    if (!email.trim()) e.email = "이메일을 입력해주세요.";
    else if (!EMAIL_RE.test(email.trim()))
      e.email = "이메일 형식이 올바르지 않습니다.";
    if (!phone.trim()) e.phone = "전화번호를 입력해주세요.";
    else if (!PHONE_RE.test(phone.trim()))
      e.phone = "전화번호를 010-0000-0000 형식으로 입력해주세요.";
    if (!password) e.password = "비밀번호를 입력해주세요.";
    else if (password.length < MIN_PASSWORD)
      e.password = `비밀번호는 ${MIN_PASSWORD}자 이상이어야 합니다.`;
    if (!confirm) e.confirm = "비밀번호 확인을 입력해주세요.";
    else if (password !== confirm) e.confirm = "비밀번호가 일치하지 않습니다.";
    if (!agree) e.agree = "개인정보처리방침에 동의해주세요.";
    return e;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setFormError("");
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          // handle_new_user 트리거가 이 두 값을 읽어 profiles 행을 만든다
          data: { username: name.trim(), phone: phone.trim() },
        },
      });

      if (error) {
        // 개발자가 원인을 바로 볼 수 있도록 원본 에러는 콘솔에 남긴다
        // (화면에는 사유를 구체적으로 노출하지 않는다)
        console.error("signUp 실패:", error.code, error.message);
        const msg = error.message.toLowerCase();
        if (error.code === "email_provider_disabled") {
          // Supabase 대시보드에서 이메일 가입이 꺼져 있는 상태
          setFormError(
            "현재 이메일 회원가입이 중단되어 있습니다. 잠시 후 다시 시도해주세요.",
          );
        } else if (msg.includes("already registered") || msg.includes("already been registered")) {
          setErrors((prev) => ({ ...prev, email: "이미 가입된 이메일입니다." }));
          setFormError("이미 가입된 이메일입니다. 로그인 화면으로 이동해주세요.");
        } else if (msg.includes("password")) {
          setErrors((prev) => ({
            ...prev,
            password: `비밀번호는 ${MIN_PASSWORD}자 이상이어야 합니다.`,
          }));
        } else {
          setFormError("가입 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
        return;
      }

      setDone(true);
      if (data.session) {
        // 자동 로그인 상태 — 잠시 환영 문구를 보여준 뒤 메인으로
        router.refresh();
        setTimeout(() => router.push("/"), 1600);
      } else {
        // 프로젝트에서 이메일 인증을 켜둔 경우
        setNeedsConfirm(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className={AUTH_PAGE}>
        <div className={AUTH_CARD}>
          <h1 className={AUTH_TITLE}>가입을 환영합니다</h1>
          {needsConfirm ? (
            <>
              <p className={AUTH_SUB}>
                {email.trim()} 으로 인증 메일을 보냈습니다. 메일의 링크를 눌러
                인증을 완료하시면 로그인하실 수 있습니다.
              </p>
              <div className="mt-6">
                <Link href="/login" className={LINK}>
                  로그인 화면으로 이동
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className={AUTH_SUB}>
                {name.trim()}님, 반갑습니다. 잠시 후 메인 화면으로 이동합니다.
              </p>
              <div className="mt-6">
                <Link href="/" className={LINK}>
                  바로 이동하기
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={AUTH_PAGE}>
      <div className={AUTH_CARD}>
        <h1 className={AUTH_TITLE}>회원가입</h1>
        <p className={AUTH_SUB}>
          더그로우컴퍼니 회원으로 가입하시면 정보마당과 교육 신청을 이용하실 수
          있습니다.
        </p>

        <form onSubmit={onSubmit} noValidate className="mt-7 space-y-5">
          {/* 이름 */}
          <div>
            <label htmlFor="su-name" className={LABEL}>
              이름
            </label>
            <input
              id="su-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className={`${INPUT} ${errors.name ? INPUT_ERR : ""}`}
            />
            {errors.name && <p className={FIELD_ERR}>{errors.name}</p>}
          </div>

          {/* 이메일 */}
          <div>
            <label htmlFor="su-email" className={LABEL}>
              이메일
            </label>
            <input
              id="su-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className={`${INPUT} ${errors.email ? INPUT_ERR : ""}`}
            />
            {errors.email && <p className={FIELD_ERR}>{errors.email}</p>}
          </div>

          {/* 전화번호 — 입력하는 대로 하이픈 자동 삽입 */}
          <div>
            <label htmlFor="su-phone" className={LABEL}>
              전화번호
            </label>
            <input
              id="su-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="010-0000-0000"
              className={`${INPUT} ${errors.phone ? INPUT_ERR : ""}`}
            />
            {errors.phone && <p className={FIELD_ERR}>{errors.phone}</p>}
          </div>

          {/* 비밀번호 */}
          <div>
            <label htmlFor="su-pw" className={LABEL}>
              비밀번호
            </label>
            <input
              id="su-pw"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={`${MIN_PASSWORD}자 이상`}
              className={`${INPUT} ${errors.password ? INPUT_ERR : ""}`}
            />
            {errors.password && <p className={FIELD_ERR}>{errors.password}</p>}
          </div>

          {/* 비밀번호 확인 */}
          <div>
            <label htmlFor="su-pw2" className={LABEL}>
              비밀번호 확인
            </label>
            <input
              id="su-pw2"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="비밀번호를 한 번 더 입력해주세요"
              className={`${INPUT} ${errors.confirm ? INPUT_ERR : ""}`}
            />
            {errors.confirm && <p className={FIELD_ERR}>{errors.confirm}</p>}
          </div>

          {/* 개인정보처리방침 동의 */}
          <div>
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 cursor-pointer accent-[#22B573]"
              />
              <span className="text-[13px] leading-relaxed text-[#bbb]">
                <a
                  href="/legal/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={LINK}
                >
                  개인정보처리방침
                </a>
                에 동의합니다.
              </span>
            </label>
            {errors.agree && <p className={FIELD_ERR}>{errors.agree}</p>}
          </div>

          {formError && <p className={ALERT_ERR}>{formError}</p>}

          <button type="submit" disabled={loading} className={BTN_PRIMARY}>
            {loading ? "가입 처리 중" : "가입하기"}
          </button>
        </form>

        <p className="mt-6 text-center text-[13px] text-[#8a8a8a]">
          이미 계정이 있으신가요.{" "}
          <Link href="/login" className={LINK}>
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
