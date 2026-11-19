"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 시설 위탁운영 신청 폼 — 창업 ApplyForm(components/startup4/ApplyForm.tsx)과 같은 방식
//  · native form + 숨김 iframe(접두사별 고유 이름) + load 성공 판정(done 가드·15초·try/catch) + 중복 제출 차단
//  · action·token·source 는 기존 커뮤니티 폼과 같다(lib/community.ts). 필드명도 그대로:
//    name, phone, phoneConfirm, email, facilityType(=service 값), facilityName, message
//  · 세그먼트 선택 입력은 새 필드로 보내지 않고 message 앞에 "[세대수: ○ / 입주 시기: ○]" 로 붙인다
//    (이름 없는 입력 → 제출 직전 숨김 message 에 합친다)
//  · 맨 위 필수 라디오 name="service"
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  COMMUNITY_EXTRAS,
  COMMUNITY_FORM_ACTION,
  COMMUNITY_FORM_SOURCE,
  COMMUNITY_FORM_TOKEN,
  COMMUNITY_SERVICES,
} from "@/lib/community";
import type { CommunityVariant } from "@/lib/community";

type Gtag = (...args: unknown[]) => void;

function fireGa(name: string, params: Record<string, unknown>) {
  try {
    const g = (window as unknown as { gtag?: Gtag }).gtag;
    if (typeof g === "function") g("event", name, params);
  } catch {
    // 측정 실패는 화면에 영향을 주지 않는다
  }
}

export default function FacilityApplyForm({
  p = "cm",
  variant,
  defaultService,
  cta,
}: {
  p?: string;
  variant: CommunityVariant;
  defaultService: string;
  cta: string;
}) {
  const iframeName = `${p}_${variant}_hidden_iframe`;
  const frameRef = useRef<HTMLIFrameElement>(null);
  const sendingRef = useRef(false);
  const doneRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [service, setService] = useState<string>(defaultService);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  // 탭이 바뀌면(community2) 기본 선택값을 따라간다
  useEffect(() => {
    setService(defaultService);
  }, [defaultService]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };
  const finishSuccess = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    sendingRef.current = false;
    clearTimer();
    setDone(true);
  };
  const finishFail = () => {
    if (doneRef.current) return;
    sendingRef.current = false;
    clearTimer();
    setSending(false);
    setErr("접수 응답을 확인하지 못했습니다. 잠시 후 다시 시도해주세요.");
  };

  const onFrameLoad = () => {
    if (!sendingRef.current || doneRef.current) return;
    let ok = true;
    try {
      const text = frameRef.current?.contentDocument?.body?.innerText ?? "";
      if (/error|오류|실패/i.test(text) && !/ok|success|성공/i.test(text)) ok = false;
    } catch {
      // 교차 출처 응답 - 응답이 돌아온 것으로 본다
    }
    if (ok) finishSuccess();
    else finishFail();
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    if (sendingRef.current || doneRef.current) {
      e.preventDefault();
      return;
    }
    const get = (n: string) => (form.elements.namedItem(n) as HTMLInputElement | null)?.value.trim() ?? "";
    if (get("phone") !== get("phoneConfirm")) {
      e.preventDefault();
      window.alert("연락처가 일치하지 않습니다. 다시 확인해주세요.");
      return;
    }

    // 선택 입력 → message 앞에 붙이기 (입력한 항목만)
    const parts: string[] = [];
    for (const f of COMMUNITY_EXTRAS[variant]) {
      const v = (form.querySelector<HTMLInputElement>(`[data-extra="${f.key}"]`)?.value ?? "").trim();
      if (v) parts.push(`${f.label}: ${v}`);
    }
    const free = (form.querySelector<HTMLTextAreaElement>("[data-free]")?.value ?? "").trim();
    const merged = (parts.length ? `[${parts.join(" / ")}]` : "") + (parts.length && free ? " " : "") + free;
    const hidden = form.elements.namedItem("message") as HTMLInputElement | null;
    if (hidden) hidden.value = merged;
    const ft = form.elements.namedItem("facilityType") as HTMLInputElement | null;
    if (ft) ft.value = service;

    fireGa("form_submit", { form_source: COMMUNITY_FORM_SOURCE, service });
    try {
      const fb = (window as unknown as { __tgcFbTrack?: (ev: string, d: Record<string, unknown>) => void }).__tgcFbTrack;
      if (typeof fb === "function") fb("Lead", { content_name: COMMUNITY_FORM_SOURCE, service });
    } catch {
      // 픽셀 실패는 무시
    }

    sendingRef.current = true;
    clearTimer();
    timerRef.current = setTimeout(finishFail, 15000);
    setTimeout(() => {
      setErr("");
      setSending(true);
    }, 0);
  };

  const extras = COMMUNITY_EXTRAS[variant];

  return (
    <div className={`${p}-formcard`}>
      {done ? (
        <div className={`${p}-done`} role="status">
          <b>접수되었습니다.</b>
          <span>영업일 기준 2~3일 안에 연락드립니다.</span>
        </div>
      ) : (
        <form id={`${p}-${variant}-form`} action={COMMUNITY_FORM_ACTION} method="POST" target={iframeName} onSubmit={onSubmit}>
          <div className={`${p}-group`}>
            <label className={`${p}-label`}>
              상담받고 싶은 시설을 선택해주세요. <span className={`${p}-req`}>*</span>
            </label>
            {COMMUNITY_SERVICES.map((v, i) => (
              <label key={v} className={`${p}-radio`}>
                <input type="radio" name="service" value={v} checked={service === v} required={i === 0} onChange={() => setService(v)} />
                <span>{v}</span>
              </label>
            ))}
          </div>

          <div className={`${p}-group`}>
            <label className={`${p}-label`}>
              담당자명 <span className={`${p}-req`}>*</span>
            </label>
            <input type="text" name="name" className={`${p}-input`} required autoComplete="name" />
          </div>
          <div className={`${p}-group`}>
            <label className={`${p}-label`}>
              연락처 <span className={`${p}-req`}>*</span>
            </label>
            <input type="tel" name="phone" className={`${p}-input`} inputMode="numeric" placeholder="01012345678" required autoComplete="tel" />
          </div>
          <div className={`${p}-group`}>
            <label className={`${p}-label`}>
              연락처 확인 <span className={`${p}-req`}>*</span>
            </label>
            <input type="tel" name="phoneConfirm" className={`${p}-input`} inputMode="numeric" placeholder="한 번 더 입력해주세요" required />
          </div>
          <div className={`${p}-group`}>
            <label className={`${p}-label`}>이메일</label>
            <input type="email" name="email" className={`${p}-input`} placeholder="example@email.com" autoComplete="email" />
          </div>
          <div className={`${p}-group`}>
            <label className={`${p}-label`}>시설명 · 소속</label>
            <input type="text" name="facilityName" className={`${p}-input`} placeholder="○○아파트 / ○○기업 / ○○대학교" />
          </div>

          <div className={`${p}-sec`}>
            <div className={`${p}-sec-t`}>선택 입력</div>
            {extras.map((f) => (
              <div key={f.key} className={`${p}-group`}>
                <label className={`${p}-label`}>{f.label}</label>
                {f.options ? (
                  <select data-extra={f.key} className={`${p}-select`} defaultValue="">
                    <option value="">(선택)</option>
                    {f.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input type="text" data-extra={f.key} className={`${p}-input`} placeholder={f.placeholder} />
                )}
              </div>
            ))}
          </div>

          <div className={`${p}-group`}>
            <label className={`${p}-label`}>문의 내용</label>
            <textarea data-free="1" className={`${p}-ta`} placeholder="시설 규모·운영 상황·관심 있는 운영 모델 등을 자유롭게 작성해주세요." />
          </div>

          <input type="hidden" name="message" defaultValue="" />
          <input type="hidden" name="facilityType" value={service} readOnly />
          <input type="hidden" name="source" value={COMMUNITY_FORM_SOURCE} />
          <input type="hidden" name="token" value={COMMUNITY_FORM_TOKEN} />

          <label className={`${p}-agree`}>
            <input type="checkbox" required />
            <span>개인정보 수집·이용에 동의합니다. (위탁운영 상담 목적, 1년간 보관)</span>
          </label>

          {err ? (
            <p className={`${p}-err`} role="alert">
              {err}
            </p>
          ) : null}

          <button type="submit" className={`${p}-submit`} disabled={sending}>
            {sending ? "전송 중..." : cta}
          </button>
        </form>
      )}
      <iframe ref={frameRef} name={iframeName} title="신청 전송" style={{ display: "none" }} onLoad={onFrameLoad} />
    </div>
  );
}
