"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 창업 신규 랜딩 2종 공통 컴포넌트 (인수창업 stk- / 입지상권 slc-)
//  · 카피는 lib/startup4.ts, CSS 접두사는 config.key
//  · 폼은 /consulting/startup 의 창업 폼과 동일(action·token·source·name·필드). 새 필드 없음.
//    제출 직전 route 값 뒤에 " / 상품: ○○" 만 붙인다.
//  · 하단 고정 바: 히어로 CTA 가 보이면 숨김, 폼이 보이면 숨김
//  · 헤더·푸터는 app/layout.tsx 것을 그대로 쓴다
// ─────────────────────────────────────────────────────────────────────────────

import { Fragment, useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import Link from "next/link";
import {
  STARTUP4_FORM_ACTION,
  STARTUP4_FORM_SOURCE,
  STARTUP4_SERVICES,
} from "@/lib/startup4";
import type { Startup4Config } from "@/lib/startup4";

type Gtag = (...args: unknown[]) => void;

const ROUTES: { value: string; label: string }[] = [
  { value: "네이버 검색(창업, 창업솔루션 등)", label: "네이버 검색 (창업, 창업솔루션 등)" },
  { value: "인스타/페이스북 광고", label: "인스타/페이스북 광고" },
  { value: "네이버 블로그", label: "네이버 블로그" },
  { value: "지인 소개/아카데미 수강생", label: "지인 소개 / 아카데미 수강생" },
  { value: "기타", label: "기타" },
];

/** "[강조]" 구간을 초록 강조로 바꾼다 */
function emphasize(text: string): ReactNode {
  const parts = text.split(/\[(.+?)\]/g);
  return parts.map((p, i) => (i % 2 === 1 ? <em key={i}>{p}</em> : <Fragment key={i}>{p}</Fragment>));
}

function fireGa(name: string, params: Record<string, unknown>) {
  try {
    const g = (window as unknown as { gtag?: Gtag }).gtag;
    if (typeof g === "function") g("event", name, params);
  } catch {
    // 측정 실패는 화면에 영향을 주지 않는다
  }
}

// ─── 신청 폼 ─────────────────────────────────────────────────────────────────
function ApplyForm({ cfg }: { cfg: Startup4Config }) {
  const p = cfg.key;
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
      checked.value = `${base} / 상품: ${cfg.product}`;
    }

    fireGa("form_submit", { form_source: STARTUP4_FORM_SOURCE, product: cfg.product });
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
      <div className={`${p}-formhead`}>{cfg.cta}</div>
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
              {sending ? "전송 중..." : cfg.cta}
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

// ─── 스타일 (접두사로 페이지별 격리) ─────────────────────────────────────────
const css = (p: string) => `
.${p}-root{font-family:'Pretendard','Noto Sans KR',sans-serif;background:#0c0f0d;color:#eef2ef;word-break:keep-all;-webkit-font-smoothing:antialiased}
.${p}-root *{box-sizing:border-box}
.${p}-root em{font-style:normal;color:#5fd06b}
.${p}-wrap{max-width:720px;margin:0 auto;padding:0 22px}

/* 히어로 - 사진 없이 텍스트만, 다음 섹션 제목이 첫 화면에 보이도록 85vh */
.${p}-hero{min-height:calc(85vh - 80px);min-height:calc(85svh - 80px);display:flex;align-items:center;background:radial-gradient(120% 70% at 50% 0%,#14301a 0%,#0c0f0d 62%);padding:48px 0 40px}
.${p}-badge{display:inline-block;font-size:13px;font-weight:700;color:#5fd06b;border:1px solid rgba(95,208,107,.4);background:rgba(76,175,80,.1);padding:7px 14px;border-radius:100px;margin-bottom:22px}
.${p}-h1{font-size:clamp(26px,7.2vw,50px);font-weight:900;line-height:1.32;letter-spacing:-.03em;margin:0 0 20px;color:#fff}
.${p}-h1 span{display:block}
.${p}-sub{font-size:16px;line-height:1.7;color:#aab5ae;margin:0 0 30px;max-width:520px}
.${p}-cta{display:inline-flex;align-items:center;justify-content:center;min-height:56px;padding:0 30px;border:0;border-radius:100px;background:linear-gradient(135deg,#4CAF50,#2e7d32);color:#fff;font-size:17px;font-weight:800;cursor:pointer;box-shadow:0 8px 25px rgba(76,175,80,.3);font-family:inherit}
.${p}-cta:hover{filter:brightness(1.08)}

.${p}-sec{padding:60px 0}
.${p}-sec.alt{background:#141816}
.${p}-h2{font-size:clamp(24px,6.4vw,36px);font-weight:900;line-height:1.38;letter-spacing:-.025em;margin:0 0 28px;color:#fff}
.${p}-eyebrow{display:block;font-size:13px;font-weight:700;color:#5fd06b;margin-bottom:10px}

/* 공감 - ✕ 리스트 */
.${p}-x{list-style:none;margin:0;padding:0}
.${p}-x li{display:flex;gap:14px;align-items:flex-start;padding:18px 0;border-bottom:1px solid rgba(255,255,255,.09);font-size:18px;line-height:1.55;font-weight:600;color:#e3e9e5}
.${p}-x li:last-child{border-bottom:0}
.${p}-x li i{flex:none;font-style:normal;font-weight:900;color:#ee6b62;font-size:20px;line-height:1.4}

/* 재정의 */
.${p}-body{font-size:17px;line-height:1.8;color:#b8c2bc;margin:0}

/* 진행·분석 - 번호 + 큰 문장 + 1~2줄 */
.${p}-steps{list-style:none;margin:0;padding:0}
.${p}-steps li{display:flex;gap:18px;padding:26px 0;border-bottom:1px solid rgba(255,255,255,.09)}
.${p}-steps li:last-child{border-bottom:0}
.${p}-num{flex:none;width:44px;font-size:30px;font-weight:900;line-height:1.1;color:#5fd06b;letter-spacing:-.02em}
.${p}-st{font-size:21px;font-weight:800;line-height:1.4;color:#fff;margin:0 0 6px;letter-spacing:-.02em}
.${p}-sd{font-size:15.5px;line-height:1.65;color:#a4afa8;margin:0}

/* 받는 것·왜 더그로우 */
.${p}-list{list-style:none;margin:0;padding:0}
.${p}-list li{position:relative;padding:14px 0 14px 28px;font-size:17px;line-height:1.6;color:#e3e9e5;font-weight:600}
.${p}-list li::before{content:'';position:absolute;left:4px;top:23px;width:9px;height:9px;border-radius:50%;background:#4CAF50}
.${p}-notice-s{margin:28px 0 0;font-size:13px;line-height:1.6;color:#7f8a84}


/* 폼 - 기존 창업 폼 톤(흰 카드) */
.${p}-formsec{padding:56px 0 72px;background:linear-gradient(180deg,#0c0f0d,#12301a)}
.${p}-formcard{background:#fff;border-radius:20px;padding:26px 20px 22px;color:#111;box-shadow:0 20px 50px rgba(0,0,0,.35)}
.${p}-formhead{font-size:22px;font-weight:900;color:#1a1a1a;text-align:center;padding-bottom:18px;margin-bottom:18px;border-bottom:2px solid #e8f5e9;letter-spacing:-.02em}
.${p}-group{margin-bottom:20px}
.${p}-label{display:block;font-size:15px;font-weight:700;color:#111;margin-bottom:8px;line-height:1.5}
.${p}-label small{font-size:13px;font-weight:400;color:#777}
.${p}-req{color:#e53935}
.${p}-input{width:100%;min-height:48px;padding:12px 14px;font-size:16px;color:#111;background:#fff;border:2px solid #e2e5e3;border-radius:10px;font-family:inherit}
.${p}-input::placeholder{color:#999}
.${p}-input:focus{outline:none;border-color:#4CAF50}
.${p}-phone-row{display:flex;align-items:center;gap:6px}
.${p}-phone-row .${p}-input{flex:1 1 0;min-width:0;text-align:center;padding:12px 4px}
.${p}-dash{color:#aaa;font-size:16px}
.${p}-radio{display:flex;align-items:center;gap:10px;margin-bottom:8px;padding:11px 14px;background:#f5f7f6;border:2px solid transparent;border-radius:10px;font-size:15px;color:#111;cursor:pointer}
.${p}-radio:hover{background:#e8f5e9;border-color:#4CAF50}
.${p}-radio input{width:18px;height:18px;accent-color:#4CAF50;flex:none}
.${p}-actions{text-align:center;margin-top:26px}
.${p}-submit{width:100%;min-height:56px;padding:0 20px;background:linear-gradient(135deg,#4CAF50,#2e7d32);color:#fff;border:0;border-radius:100px;font-size:17px;font-weight:800;cursor:pointer;box-shadow:0 8px 25px rgba(76,175,80,.3);font-family:inherit}
.${p}-submit:disabled{opacity:.55;cursor:not-allowed}
.${p}-err{margin:14px 0 0;font-size:14px;color:#d32f2f;text-align:center;line-height:1.5}
.${p}-notice{margin-top:20px;padding:14px;background:#f5f7f6;border-radius:12px;text-align:center}
.${p}-notice p{margin:0;font-size:14px;line-height:1.7;color:#777}
.${p}-notice strong{color:#2e7d32}
.${p}-done{padding:34px 8px;text-align:center}
.${p}-done b{display:block;font-size:22px;color:#2e7d32;margin-bottom:10px}
.${p}-done span{font-size:16px;line-height:1.7;color:#555}
.${p}-done strong{color:#2e7d32}

/* 다른 창업 서비스 */
.${p}-other{padding:64px 0 72px;background:#f4f6f5;color:#1a1a1a}
.${p}-other .${p}-h2{color:#1a1a1a;font-size:clamp(22px,5.6vw,30px);margin-bottom:10px}
.${p}-bridge{margin:0 0 22px;font-size:16px;line-height:1.6;color:#4a5550;font-weight:600}
.${p}-cards{display:grid;grid-template-columns:1fr;gap:12px;margin-top:22px}
.${p}-card{display:block;padding:20px 20px 18px;background:#fff;border:1px solid #dfe5e1;border-radius:14px;text-decoration:none;color:#1a1a1a;transition:border-color .2s,transform .2s}
.${p}-card:hover{border-color:#009519;transform:translateY(-2px)}
.${p}-card b{display:block;font-size:18px;font-weight:800;margin-bottom:6px;letter-spacing:-.02em}
.${p}-card span{display:block;font-size:14.5px;line-height:1.55;color:#66716b}
.${p}-ext{width:14px;height:14px;fill:currentColor;vertical-align:-2px;margin-left:5px}
.${p}-card i{display:block;margin-top:10px;font-style:normal;font-size:14px;font-weight:700;color:#009519}

/* 하단 고정 바 */
.${p}-bar{position:fixed;left:0;right:0;bottom:0;z-index:50;background:#009519;color:#fff;border:0;box-shadow:0 -4px 20px rgba(0,0,0,.18);transition:transform .3s ease;padding-bottom:env(safe-area-inset-bottom);font-family:inherit;cursor:pointer;width:100%}
.${p}-bar span{display:flex;min-height:60px;align-items:center;justify-content:center;font-size:17px;font-weight:800}
.${p}-bar.off{transform:translateY(100%);pointer-events:none}
.${p}-spacer{height:calc(60px + env(safe-area-inset-bottom))}

@media(min-width:768px){
  .${p}-bar,.${p}-spacer{display:none}
  .${p}-wrap{padding:0 32px}
  .${p}-sec{padding:96px 0}
  .${p}-cards{grid-template-columns:repeat(3,1fr)}
  .${p}-formcard{padding:34px 34px 28px}
}
`;

export default function Startup4Landing({ cfg }: { cfg: Startup4Config }) {
  const p = cfg.key;
  const heroCtaRef = useRef<HTMLButtonElement>(null);
  const [heroVisible, setHeroVisible] = useState(true);
  const [formVisible, setFormVisible] = useState(false);

  // 히어로 CTA 가 보이면 숨김, 폼이 보이면 숨김
  useEffect(() => {
    const heroEl = heroCtaRef.current;
    const formEl = document.getElementById(`${p}-form`);
    if (typeof IntersectionObserver !== "function") return;
    const io1 = new IntersectionObserver((en) => setHeroVisible(en[0].isIntersecting));
    const io2 = new IntersectionObserver((en) => setFormVisible(en[0].isIntersecting));
    if (heroEl) io1.observe(heroEl);
    if (formEl) io2.observe(formEl);
    return () => {
      io1.disconnect();
      io2.disconnect();
    };
  }, [p]);

  const goForm = (where: "hero" | "sticky") => {
    fireGa("cta_click", { cta_location: where, cta_text: cfg.cta, form_source: STARTUP4_FORM_SOURCE, product: cfg.product });
    const el = document.getElementById(`${p}-form`);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const barOff = heroVisible || formVisible;
  const others = STARTUP4_SERVICES.filter((s) => s.key !== p);

  return (
    <div className={`${p}-root`}>
      <style dangerouslySetInnerHTML={{ __html: css(p) }} />

      <section className={`${p}-hero`} data-track-section="hero">
        <div className={`${p}-wrap`}>
          <span className={`${p}-badge`}>{cfg.badge}</span>
          <h1 className={`${p}-h1`}>
            {cfg.headline.map((line, i) => (
              <span key={i}>{emphasize(line)}</span>
            ))}
          </h1>
          <p className={`${p}-sub`}>{cfg.sub}</p>
          <button ref={heroCtaRef} type="button" className={`${p}-cta`} onClick={() => goForm("hero")}>
            {cfg.cta}
          </button>
        </div>
      </section>

      <section className={`${p}-sec`} data-track-section="empathy">
        <div className={`${p}-wrap`}>
          <h2 className={`${p}-h2`}>{cfg.empathyTitle}</h2>
          <ul className={`${p}-x`}>
            {cfg.empathy.map((t) => (
              <li key={t}>
                <i aria-hidden="true">✕</i>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`${p}-sec alt`} data-track-section="redefine">
        <div className={`${p}-wrap`}>
          <h2 className={`${p}-h2`}>{emphasize(cfg.redefineTitle)}</h2>
          <p className={`${p}-body`}>{cfg.redefineBody}</p>
        </div>
      </section>

      <section className={`${p}-sec`} data-track-section="process">
        <div className={`${p}-wrap`}>
          <h2 className={`${p}-h2`}>{cfg.stepsTitle}</h2>
          <ol className={`${p}-steps`}>
            {cfg.steps.map((s, i) => (
              <li key={s.t}>
                <span className={`${p}-num`}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className={`${p}-st`}>{s.t}</p>
                  <p className={`${p}-sd`}>{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {cfg.takeaway ? (
        <section className={`${p}-sec alt`} data-track-section="deliver">
          <div className={`${p}-wrap`}>
            <h2 className={`${p}-h2`}>{cfg.takeawayTitle}</h2>
            <ul className={`${p}-list`}>
              {cfg.takeaway.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {cfg.why ? (
        <section className={`${p}-sec`} data-track-section="why">
          <div className={`${p}-wrap`}>
            <h2 className={`${p}-h2`}>{cfg.whyTitle}</h2>
            <ul className={`${p}-list`}>
              {cfg.why.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            {cfg.notice ? <p className={`${p}-notice-s`}>{cfg.notice}</p> : null}
          </div>
        </section>
      ) : null}

      <section className={`${p}-formsec`} id={`${p}-form`} data-track-section="form">
        <div className={`${p}-wrap`}>
          <ApplyForm cfg={cfg} />
        </div>
      </section>

      <section className={`${p}-other`} data-track-section="related">
        <div className={`${p}-wrap`}>
          <h2 className={`${p}-h2`}>다른 창업 서비스</h2>
          {cfg.bridge ? <p className={`${p}-bridge`}>{cfg.bridge}</p> : null}
          <div className={`${p}-cards`}>
            {others.map((s) =>
              s.external ? (
                <a key={s.href} href={s.href} target="_blank" rel="noopener" className={`${p}-card`}>
                  <b>{s.title}</b>
                  <span>{s.desc}</span>
                  <i>
                    새 창에서 열기
                    <svg className={`${p}-ext`} viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M14 3h7v7h-2V6.4l-8.3 8.3-1.4-1.4L17.6 5H14V3zM5 5h6v2H7v10h10v-4h2v6H5V5z" />
                    </svg>
                  </i>
                </a>
              ) : (
                <Link key={s.href} href={s.href} className={`${p}-card`}>
                  <b>{s.title}</b>
                  <span>{s.desc}</span>
                  <i>자세히 보기 →</i>
                </Link>
              ),
            )}
          </div>
        </div>
      </section>

      <div className={`${p}-spacer`} aria-hidden="true" />
      <button
        type="button"
        className={`${p}-bar${barOff ? " off" : ""}`}
        aria-hidden={barOff}
        tabIndex={barOff ? -1 : 0}
        onClick={() => goForm("sticky")}
      >
        <span>{cfg.cta}</span>
      </button>
    </div>
  );
}
