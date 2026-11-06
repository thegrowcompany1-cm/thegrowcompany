"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 창업 신규 랜딩 공통 신청 폼 — /consulting/startup 의 창업 폼과 동일(action·token·source·name·필드, 새 필드 없음)
//  · 제출 직전 route 뒤에 " / 상품: ○○" 만 붙인다
//  · iframe 이름은 접두사별 고유(stk_hidden_iframe 등), load 성공 판정(done 가드·15초·try/catch)
//  · 제출 중 중복 제출 차단(sendingRef/doneRef), 측정 이벤트는 제출당 1회
// ─────────────────────────────────────────────────────────────────────────────

import { Fragment, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { STARTUP4_FORM_ACTION, STARTUP4_FORM_SOURCE } from "@/lib/startup4";

type Gtag = (...args: unknown[]) => void;

const ROUTES: { value: string; label: string }[] = [
  { value: "네이버 검색(창업, 창업솔루션 등)", label: "네이버 검색 (창업, 창업솔루션 등)" },
  { value: "인스타/페이스북 광고", label: "인스타/페이스북 광고" },
  { value: "네이버 블로그", label: "네이버 블로그" },
  { value: "지인 소개/아카데미 수강생", label: "지인 소개 / 아카데미 수강생" },
  { value: "기타", label: "기타" },
];

export function fireGa(name: string, params: Record<string, unknown>) {
  try {
    const g = (window as unknown as { gtag?: Gtag }).gtag;
    if (typeof g === "function") g("event", name, params);
  } catch {
    // 측정 실패는 화면에 영향을 주지 않는다
  }
}

// ─── 신청 폼 ─────────────────────────────────────────────────────────────────
export default function ApplyForm({ p, cta, product }: { p: string; cta: string; product: string }) {
  const iframeName = `${p}_hidden_iframe`;
  const formRef = useRef<HTMLFormElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const sendingRef = useRef(false);
  const doneRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

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

  // 숨김 iframe 의 load = 시트 응답이 돌아온 것. 제출 전의 초기 load 는 무시한다.
  const onFrameLoad = () => {
    if (!sendingRef.current || doneRef.current) return;
    let ok = true;
    try {
      const d = frameRef.current?.contentDocument;
      const text = d?.body?.innerText ?? "";
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
    const v = (n: string) => (form.elements.namedItem(n) as HTMLInputElement | null)?.value ?? "";
    if (v("phone1") !== v("phoneCheck1") || v("phone2") !== v("phoneCheck2") || v("phone3") !== v("phoneCheck3")) {
      e.preventDefault();
      window.alert("연락처가 일치하지 않습니다. 다시 확인해주세요.");
      return;
    }

    // 제출 직전 route 뒤에 상품 구분을 붙인다 (시트 열 구조·source 는 그대로)
    const checked = form.querySelector<HTMLInputElement>('input[name="route"]:checked');
    if (checked) {
      const base = checked.getAttribute("data-base") ?? checked.value;
      checked.value = `${base} / 상품: ${product}`;
    }

    fireGa("form_submit", { form_source: STARTUP4_FORM_SOURCE, product: product });
    try {
      const fb = (window as unknown as { __tgcFbTrack?: (ev: string, d: Record<string, unknown>) => void }).__tgcFbTrack;
      if (typeof fb === "function") fb("Lead", { content_name: STARTUP4_FORM_SOURCE });
    } catch {
      // 픽셀 실패는 무시
    }

    sendingRef.current = true;
    clearTimer();
    timerRef.current = setTimeout(finishFail, 15000);
    // 상태 갱신은 브라우저가 폼 값을 읽은 뒤로 미룬다 (route 값이 되돌려지지 않도록)
    setTimeout(() => {
      setErr("");
      setSending(true);
    }, 0);
  };

  // 실패 후 재시도 때 route 값이 중복으로 붙지 않도록 원래 값을 복원한다
  useEffect(() => {
    if (sending) return;
    formRef.current?.querySelectorAll<HTMLInputElement>('input[name="route"]').forEach((r) => {
      const base = r.getAttribute("data-base");
      if (base) r.value = base;
    });
  }, [sending]);

  const onPhoneInput = (e: FormEvent<HTMLInputElement>) => {
    const t = e.currentTarget;
    if (t.value.length >= t.maxLength) {
      const all = Array.from(t.form?.querySelectorAll<HTMLInputElement>(".tg-phone") ?? []);
      const i = all.indexOf(t);
      if (i >= 0 && i < all.length - 1) all[i + 1].focus();
    }
  };
  const onPhoneKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key.length === 1 && !/[0-9]/.test(e.key)) e.preventDefault();
  };

  const phoneRow = (prefix: "phone" | "phoneCheck") => (
    <div className={`${p}-phone-row`}>
      {[1, 2, 3].map((n) => (
        <Fragment key={n}>
          {n > 1 ? <span className={`${p}-dash`}>-</span> : null}
          <input
            type="text"
            inputMode="numeric"
            name={`${prefix}${n}`}
            className={`${p}-input tg-phone`}
            maxLength={n === 1 ? 3 : 4}
            required
            onInput={onPhoneInput}
            onKeyPress={onPhoneKey}
          />
        </Fragment>
      ))}
    </div>
  );

  return (
    <div className={`${p}-formcard`} id={`${p}-formcard`}>
      <div className={`${p}-formhead`}>{cta}</div>
      {done ? (
        <div className={`${p}-done`} role="status">
          <b>신청이 접수되었습니다.</b>
          <span>
            신청 후 <strong>24시간 이내</strong> 담당자가 연락드립니다.
            <br />
            감사합니다.
          </span>
        </div>
      ) : (
        <form
          ref={formRef}
          id={`${p}-startupForm`}
          action={STARTUP4_FORM_ACTION}
          method="POST"
          target={iframeName}
          onSubmit={onSubmit}
        >
          <div className={`${p}-group`}>
            <label className={`${p}-label`}>
              희망 업종을 선택해주세요. <span className={`${p}-req`}>*</span>
            </label>
            <select name="industry" className={`${p}-input`} required defaultValue="">
              <option value="">(선택)</option>
              <option value="헬스장">헬스장</option>
              <option value="필라테스">필라테스</option>
              <option value="PT 스튜디오">PT 스튜디오</option>
              <option value="요가">요가</option>
              <option value="기타">기타</option>
            </select>
          </div>

          <div className={`${p}-group`}>
            <label className={`${p}-label`}>
              선호 희망 지역을 알려주세요.
              <br />
              <small>(입지 상권을 함께 봐드립니다.)</small>
            </label>
            <input
              type="text"
              name="area"
              className={`${p}-input`}
              placeholder="예) 서울 마포구, 경기 남부, 부산 서면 인근 등"
            />
          </div>

          <div className={`${p}-group`}>
            <label className={`${p}-label`}>
              이름을 입력해주세요. <span className={`${p}-req`}>*</span>
            </label>
            <input type="text" name="name" className={`${p}-input`} required />
          </div>

          <div className={`${p}-group`}>
            <label className={`${p}-label`}>
              연락처를 입력해주세요. <span className={`${p}-req`}>*</span>
            </label>
            {phoneRow("phone")}
          </div>

          <div className={`${p}-group`}>
            <label className={`${p}-label`}>
              연락처를 입력해주세요(중복확인). <span className={`${p}-req`}>*</span>
            </label>
            {phoneRow("phoneCheck")}
          </div>

          <div className={`${p}-group`}>
            <label className={`${p}-label`}>
              신청 경로를 알려주세요. <span className={`${p}-req`}>*</span>
            </label>
            {ROUTES.map((r, i) => (
              <label key={r.value} className={`${p}-radio`}>
                <input type="radio" name="route" value={r.value} data-base={r.value} required={i === 0} />
                <span>{r.label}</span>
              </label>
            ))}
          </div>

          <input type="hidden" name="source" value={STARTUP4_FORM_SOURCE} />
          <input type="hidden" name="token" value="grow2026secure" />

          {err ? (
            <p className={`${p}-err`} role="alert">
              {err}
            </p>
          ) : null}

          <div className={`${p}-actions`}>
            <button type="submit" className={`${p}-submit`} disabled={sending}>
              {sending ? "전송 중..." : cta}
            </button>
          </div>
        </form>
      )}
      <iframe ref={frameRef} name={iframeName} title="신청 전송" style={{ display: "none" }} onLoad={onFrameLoad} />
      {done ? null : (
        <div className={`${p}-notice`}>
          <p>
            신청 후 <strong>24시간 이내</strong> 담당자가 연락드립니다.
          </p>
        </div>
      )}
    </div>
  );
}
