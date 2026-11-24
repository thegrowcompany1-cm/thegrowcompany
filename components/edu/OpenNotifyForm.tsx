"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 그로우 에듀 "오픈 알림 받기" 폼 — 준비중 클래스(fc-class · startup-class · gx-class)와 종료된 세미나(sales-ops)에 쓴다.
//  · POST /api/edu-notify (Supabase edu_notify 테이블, service role 로만 저장). 중복(24시간 내 같은 과정·연락처)은 서버가 성공만 돌려준다.
//  · course · page 는 prop 으로 받아 숨김 전송한다. page 를 주지 않으면 현재 경로를 쓴다.
//  · 필수: 성함 · 연락처 · 개인정보 수집·이용 동의 · 광고성 정보(오픈 안내) 수신 동의. 이메일·지역·직책은 선택.
//  · 측정: 성공 시 GA4 form_submit {form_source:"에듀_오픈알림", course}, 메타 Lead (해당 페이지에 픽셀이 매핑된 경우에만 전송된다).
//  · NotifySection: id="notify" 앵커 + 안내 문구 + 이 폼. 각 페이지의 #notify 가 이것이다.
//  · CSS 접두사 onf-. 강조색은 부모가 --onf-acc / --onf-acc-dark 로 바꿀 수 있다.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { formatPhone } from "@/lib/authStyles";
import { EDU_NOTIFY_DONE, EDU_NOTIFY_ROLES, EDU_NOTIFY_SOURCE } from "@/lib/eduNotify";
import type { EduNotifyCourse } from "@/lib/eduNotify";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const STYLE = `
.onf{--onf-acc:#009519;--onf-acc-dark:#007A14;max-width:560px;margin:0 auto;text-align:left;letter-spacing:-.01em;word-break:keep-all;color:#161616;font-family:inherit}
.onf *{box-sizing:border-box}
.onf-card{background:#fff;border-radius:18px;padding:26px 22px;box-shadow:0 10px 32px rgba(0,0,0,.14)}
.onf-g{margin:0 0 18px}
.onf-l{display:block;margin:0 0 8px;font-size:15px;font-weight:800;color:#161616}
.onf-req{color:#D6303A;margin-left:3px}
.onf-in{width:100%;height:50px;border:1px solid #C9CFCC;border-radius:10px;padding:0 14px;font:inherit;font-size:16px;color:#161616;background:#fff;outline:none;transition:border-color .16s,box-shadow .16s}
.onf-in::placeholder{color:#6B716E}
.onf-in:focus{border-color:var(--onf-acc);box-shadow:0 0 0 3px rgba(0,149,25,.18)}
.onf-roles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:0;padding:0;border:0;min-width:0}
.onf-role{position:relative;display:block}
.onf-role input{position:absolute;inset:0;opacity:0;margin:0;cursor:pointer}
.onf-role span{display:flex;align-items:center;justify-content:center;min-height:48px;padding:6px 8px;border:1px solid #C9CFCC;border-radius:10px;background:#fff;font-size:15px;font-weight:700;text-align:center;line-height:1.3;transition:background-color .16s,border-color .16s,color .16s}
.onf-role input:checked+span{background:#E6F4E8;border-color:var(--onf-acc);color:var(--onf-acc-dark)}
.onf-role input:focus-visible+span{outline:2px solid var(--onf-acc);outline-offset:2px}
.onf-agree{display:flex;gap:10px;align-items:flex-start;margin:0 0 10px;font-size:14px;line-height:1.5;font-weight:600;color:#333;cursor:pointer}
.onf-agree input{width:20px;height:20px;margin-top:1px;accent-color:var(--onf-acc);flex:0 0 auto}
.onf-agrees{margin:6px 0 20px;padding:14px;border-radius:12px;background:#F4F5F4}
.onf-agrees .onf-agree:last-child{margin-bottom:0}
.onf-err{margin:0 0 14px;font-size:14px;font-weight:700;color:#D6303A}
.onf-btn{display:flex;align-items:center;justify-content:center;width:100%;height:58px;border:0;border-radius:10px;background:var(--onf-acc);color:#fff;font:inherit;font-size:19px;font-weight:800;cursor:pointer;transition:transform 160ms cubic-bezier(.23,1,.32,1),background-color 160ms cubic-bezier(.23,1,.32,1)}
.onf-btn:active:not(:disabled){transform:scale(.97)}
.onf-btn:disabled{opacity:.6;cursor:default}
@media (hover:hover) and (pointer:fine){.onf-btn:hover:not(:disabled){background:var(--onf-acc-dark)}}
.onf-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
.onf-done{padding:36px 8px;text-align:center}
.onf-done b{display:block;font-size:21px;line-height:1.5;font-weight:900;color:#161616}
.onf-sec{padding:64px 20px;scroll-margin-top:84px}
.onf-sec.is-dark{background:#0d0d0d;color:#fff}
.onf-sec.is-light{background:#f6f5f2;color:#161616}
.onf-sec.is-bare{padding:8px 0 0;color:inherit}
.onf fieldset.onf-fs{border:0;padding:0;margin:0 0 18px;min-width:0}
.onf-sec-in{max-width:560px;margin:0 auto;text-align:center}
.onf-sec h2{margin:0;font-size:26px;line-height:1.4;font-weight:900;letter-spacing:-.03em;word-break:keep-all}
.onf-sec p.onf-sec-sub{margin:12px 0 28px;font-size:16px;line-height:1.65;font-weight:600;opacity:.82}
@media (min-width:768px){.onf-sec h2{font-size:32px}.onf-card{padding:32px 30px}}
@media (prefers-reduced-motion:reduce){.onf-btn,.onf-in,.onf-role span{transition:none}}
`;

type Props = {
  course: EduNotifyCourse;
  /** 신청한 페이지 경로 — 숨김 전송. 비우면 현재 경로 */
  page?: string;
  /** 제출 버튼 문구 */
  cta?: string;
};

export default function OpenNotifyForm({ course, page, cta = "오픈 알림 받기" }: Props) {
  const sendingRef = useRef(false);
  const doneRef = useRef(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [phone, setPhone] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sendingRef.current || doneRef.current) return;
    const form = e.currentTarget;
    const get = (n: string) => (form.elements.namedItem(n) as HTMLInputElement | null)?.value.trim() ?? "";
    const checked = (n: string) => !!(form.elements.namedItem(n) as HTMLInputElement | null)?.checked;

    const name = get("name");
    const digits = phone.replace(/\D/g, "");
    const email = get("email");
    if (!name) return setErr("성함을 입력해주세요.");
    if (!/^0\d{8,10}$/.test(digits)) return setErr("연락처를 정확히 입력해주세요.");
    if (email && !EMAIL_RE.test(email)) return setErr("이메일 형식을 확인해주세요.");
    if (!checked("privacy")) return setErr("개인정보 수집·이용에 동의해주세요.");
    if (!checked("marketing")) return setErr("광고성 정보(오픈 안내) 수신에 동의해주세요.");

    sendingRef.current = true;
    setSending(true);
    setErr("");
    try {
      const res = await fetch("/api/edu-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course,
          page: page ?? window.location.pathname,
          name,
          phone: digits,
          email,
          region: get("region"),
          role: (form.querySelector<HTMLInputElement>('input[name="role"]:checked')?.value ?? ""),
          privacyAgree: true,
          marketingAgree: true,
          website: get("website"),
        }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
      if (!res.ok || !data?.ok) {
        setErr(data?.message || "접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
        sendingRef.current = false;
        setSending(false);
        return;
      }
      doneRef.current = true;
      setDone(true);
      try {
        const w = window as unknown as {
          gtag?: (...a: unknown[]) => void;
          __tgcFbTrack?: (ev: string, d: Record<string, unknown>) => void;
        };
        if (typeof w.gtag === "function") w.gtag("event", "form_submit", { form_source: EDU_NOTIFY_SOURCE, course });
        if (typeof w.__tgcFbTrack === "function") w.__tgcFbTrack("Lead", { content_name: EDU_NOTIFY_SOURCE, course });
      } catch {
        // 측정 실패는 화면에 영향을 주지 않는다
      }
    } catch {
      setErr("접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
      sendingRef.current = false;
      setSending(false);
    }
  };

  return (
    <div className="onf">
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="onf-card">
        {done ? (
          <div className="onf-done" role="status">
            <b>{EDU_NOTIFY_DONE}</b>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <div className="onf-g">
              <label className="onf-l" htmlFor={`onf-name-${course}`}>
                성함<span className="onf-req">*</span>
              </label>
              <input id={`onf-name-${course}`} className="onf-in" name="name" type="text" autoComplete="name" maxLength={50} />
            </div>
            <div className="onf-g">
              <label className="onf-l" htmlFor={`onf-phone-${course}`}>
                연락처<span className="onf-req">*</span>
              </label>
              <input
                id={`onf-phone-${course}`}
                className="onf-in"
                name="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="010-1234-5678"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
              />
            </div>
            <div className="onf-g">
              <label className="onf-l" htmlFor={`onf-email-${course}`}>
                이메일
              </label>
              <input id={`onf-email-${course}`} className="onf-in" name="email" type="email" autoComplete="email" maxLength={100} placeholder="example@email.com" />
            </div>
            <div className="onf-g">
              <label className="onf-l" htmlFor={`onf-region-${course}`}>
                사는 지역
              </label>
              <input id={`onf-region-${course}`} className="onf-in" name="region" type="text" maxLength={50} placeholder="예) 서울 마포구" />
            </div>
            <fieldset className="onf-fs">
              <legend className="onf-l">직책</legend>
              <div className="onf-roles">
                {EDU_NOTIFY_ROLES.map((r) => (
                  <label key={r} className="onf-role">
                    <input type="radio" name="role" value={r} />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* 봇 함정 — 사람 눈에는 보이지 않는다 */}
            <div className="onf-hp" aria-hidden="true">
              <label>
                웹사이트
                <input name="website" type="text" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <div className="onf-agrees">
              <label className="onf-agree">
                <input type="checkbox" name="privacy" />
                <span>
                  [필수] 개인정보 수집·이용에 동의합니다. (오픈 안내 목적, 1년간 보관)
                </span>
              </label>
              <label className="onf-agree">
                <input type="checkbox" name="marketing" />
                <span>[필수] 광고성 정보(오픈 안내) 수신에 동의합니다.</span>
              </label>
            </div>

            {err ? (
              <p className="onf-err" role="alert">
                {err}
              </p>
            ) : null}
            <button type="submit" className="onf-btn" disabled={sending}>
              {sending ? "접수 중..." : cta}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/** 각 페이지의 #notify — 안내 문구 + 폼. tone 은 바탕색(어두운 구간 / 밝은 구간) */
export function NotifySection({
  course,
  page,
  title,
  sub,
  tone = "dark",
}: {
  course: EduNotifyCourse;
  page?: string;
  title: ReactNode;
  sub?: ReactNode;
  tone?: "dark" | "light" | "bare";
}) {
  return (
    <section id="notify" className={`onf-sec is-${tone}`} data-track-section="notify">
      <style dangerouslySetInnerHTML={{ __html: STYLE }} />
      <div className="onf-sec-in">
        <h2>{title}</h2>
        {sub ? <p className="onf-sec-sub">{sub}</p> : null}
        <OpenNotifyForm course={course} page={page} />
      </div>
    </section>
  );
}
