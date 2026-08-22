"use client";

// 마이페이지 — 이름/전화번호 수정, 이메일 표시(수정 불가), 비밀번호 변경, 회원탈퇴 자리
//
// 비밀번호 변경은 현재 비밀번호로 재로그인해 본인 확인을 한 뒤 updateUser 를 호출한다.
// (Supabase 는 updateUser 시 현재 비밀번호를 요구하지 않으므로 직접 확인한다)

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  AUTH_PAGE,
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
  formatPhone,
  PHONE_RE,
  MIN_PASSWORD,
} from "@/lib/authStyles";

const CARD = "rounded-2xl border border-[#242424] bg-[#141414] p-6 sm:p-7";
const CARD_TITLE = "text-base font-extrabold text-white";

type Props = {
  email: string;
  initialName: string;
  initialPhone: string;
};

export default function MyPageView({ email, initialName, initialPhone }: Props) {
  const router = useRouter();

  // ── 프로필 ──
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [profileErr, setProfileErr] = useState<{ name?: string; phone?: string }>({});
  const [profileMsg, setProfileMsg] = useState("");
  const [profileFail, setProfileFail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // ── 비밀번호 변경 ──
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");
  const [pwErr, setPwErr] = useState<{ cur?: string; next?: string; confirm?: string }>({});
  const [pwMsg, setPwMsg] = useState("");
  const [pwFail, setPwFail] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  const saveProfile = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setProfileMsg("");
    setProfileFail("");

    const e: { name?: string; phone?: string } = {};
    if (!name.trim()) e.name = "이름을 입력해주세요.";
    if (!phone.trim()) e.phone = "전화번호를 입력해주세요.";
    else if (!PHONE_RE.test(phone.trim()))
      e.phone = "전화번호를 010-0000-0000 형식으로 입력해주세요.";
    setProfileErr(e);
    if (Object.keys(e).length > 0) return;

    setSavingProfile(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr || !user) {
        router.push("/login");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          username: name.trim(),
          phone: phone.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        setProfileFail("정보 저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      // 헤더에 표시되는 이름도 함께 갱신되도록 메타데이터를 맞춰 둔다
      await supabase.auth.updateUser({
        data: { username: name.trim(), phone: phone.trim() },
      });

      setProfileMsg("회원 정보가 저장되었습니다.");
      router.refresh();
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setPwMsg("");
    setPwFail("");

    const e: { cur?: string; next?: string; confirm?: string } = {};
    if (!curPw) e.cur = "현재 비밀번호를 입력해주세요.";
    if (!newPw) e.next = "새 비밀번호를 입력해주세요.";
    else if (newPw.length < MIN_PASSWORD)
      e.next = `비밀번호는 ${MIN_PASSWORD}자 이상이어야 합니다.`;
    if (!newPw2) e.confirm = "새 비밀번호 확인을 입력해주세요.";
    else if (newPw !== newPw2) e.confirm = "비밀번호가 일치하지 않습니다.";
    setPwErr(e);
    if (Object.keys(e).length > 0) return;

    setSavingPw(true);
    try {
      const supabase = createClient();

      // 현재 비밀번호로 본인 확인
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password: curPw,
      });
      if (signInErr) {
        setPwErr({ cur: "현재 비밀번호가 일치하지 않습니다." });
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("should be different") || msg.includes("same as")) {
          setPwErr({ next: "기존 비밀번호와 다른 비밀번호를 입력해주세요." });
        } else {
          setPwFail("비밀번호 변경에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
        return;
      }

      setCurPw("");
      setNewPw("");
      setNewPw2("");
      setPwMsg("비밀번호가 변경되었습니다.");
      router.refresh();
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className={AUTH_PAGE}>
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-8">
          <h1 className={AUTH_TITLE}>마이페이지</h1>
          <p className={AUTH_SUB}>회원 정보를 확인하고 수정하실 수 있습니다.</p>
        </header>

        <div className="space-y-5">
          {/* 회원 정보 */}
          <section className={CARD}>
            <h2 className={CARD_TITLE}>회원 정보</h2>

            <form onSubmit={saveProfile} noValidate className="mt-5 space-y-5">
              {/* 이메일 — 수정 불가 */}
              <div>
                <label htmlFor="mp-email" className={LABEL}>
                  이메일
                </label>
                <input
                  id="mp-email"
                  type="email"
                  value={email}
                  readOnly
                  disabled
                  className={`${INPUT} cursor-not-allowed text-[#8a8a8a]`}
                />
                <p className="mt-1.5 text-xs text-[#666]">
                  이메일은 변경하실 수 없습니다.
                </p>
              </div>

              <div>
                <label htmlFor="mp-name" className={LABEL}>
                  이름
                </label>
                <input
                  id="mp-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`${INPUT} ${profileErr.name ? INPUT_ERR : ""}`}
                />
                {profileErr.name && <p className={FIELD_ERR}>{profileErr.name}</p>}
              </div>

              <div>
                <label htmlFor="mp-phone" className={LABEL}>
                  전화번호
                </label>
                <input
                  id="mp-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="010-0000-0000"
                  className={`${INPUT} ${profileErr.phone ? INPUT_ERR : ""}`}
                />
                {profileErr.phone && <p className={FIELD_ERR}>{profileErr.phone}</p>}
              </div>

              {profileFail && <p className={ALERT_ERR}>{profileFail}</p>}
              {profileMsg && <p className={ALERT_OK}>{profileMsg}</p>}

              <button type="submit" disabled={savingProfile} className={BTN_PRIMARY}>
                {savingProfile ? "저장 중" : "회원 정보 저장"}
              </button>
            </form>
          </section>

          {/* 비밀번호 변경 */}
          <section className={CARD}>
            <h2 className={CARD_TITLE}>비밀번호 변경</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-[#8a8a8a]">
              보안을 위해 현재 비밀번호를 함께 입력해주세요.
            </p>

            <form onSubmit={changePassword} noValidate className="mt-5 space-y-5">
              <div>
                <label htmlFor="mp-curpw" className={LABEL}>
                  현재 비밀번호
                </label>
                <input
                  id="mp-curpw"
                  type="password"
                  autoComplete="current-password"
                  value={curPw}
                  onChange={(e) => setCurPw(e.target.value)}
                  className={`${INPUT} ${pwErr.cur ? INPUT_ERR : ""}`}
                />
                {pwErr.cur && <p className={FIELD_ERR}>{pwErr.cur}</p>}
              </div>

              <div>
                <label htmlFor="mp-newpw" className={LABEL}>
                  새 비밀번호
                </label>
                <input
                  id="mp-newpw"
                  type="password"
                  autoComplete="new-password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder={`${MIN_PASSWORD}자 이상`}
                  className={`${INPUT} ${pwErr.next ? INPUT_ERR : ""}`}
                />
                {pwErr.next && <p className={FIELD_ERR}>{pwErr.next}</p>}
              </div>

              <div>
                <label htmlFor="mp-newpw2" className={LABEL}>
                  새 비밀번호 확인
                </label>
                <input
                  id="mp-newpw2"
                  type="password"
                  autoComplete="new-password"
                  value={newPw2}
                  onChange={(e) => setNewPw2(e.target.value)}
                  className={`${INPUT} ${pwErr.confirm ? INPUT_ERR : ""}`}
                />
                {pwErr.confirm && <p className={FIELD_ERR}>{pwErr.confirm}</p>}
              </div>

              {pwFail && <p className={ALERT_ERR}>{pwFail}</p>}
              {pwMsg && <p className={ALERT_OK}>{pwMsg}</p>}

              <button type="submit" disabled={savingPw} className={BTN_GHOST}>
                {savingPw ? "변경 중" : "비밀번호 변경"}
              </button>
            </form>
          </section>

          {/* 회원탈퇴 — 자리만 (TODO: 다음 작업에서 구현) */}
          <section className={CARD}>
            <h2 className={CARD_TITLE}>회원탈퇴</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-[#8a8a8a]">
              탈퇴 기능은 준비 중입니다. 탈퇴가 필요하시면 고객센터로 문의해주세요.
            </p>
            {/* TODO(회원탈퇴): profiles.deleted_at / scheduled_deletion_at 을 쓰는
                유예 기간 방식으로 다음 작업에서 구현. 서버 라우트에서 service role 로
                auth.users 삭제까지 처리해야 하므로 클라이언트만으로는 완결되지 않는다. */}
            <button
              type="button"
              disabled
              className="mt-4 w-full cursor-not-allowed rounded-xl border border-[#2a2a2a] bg-[#191919] px-4 py-3 text-sm font-bold text-[#5a5a5a]"
            >
              회원탈퇴 준비 중
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
