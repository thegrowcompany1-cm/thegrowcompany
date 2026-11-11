"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 창업 신규 랜딩 공통 셸 — 스타일 주입, 스크롤 등장, 하단 고정 CTA 바, 신청 폼, 다른 창업 서비스
//  · 하단 고정 바: 히어로 CTA 가 보이면 숨김, 폼이 보이면 숨김 (모바일에서만 표시)
//  · 본문 섹션은 서버 컴포넌트(children)로 받는다
//  · 헤더·푸터는 app/layout.tsx 것을 그대로 쓴다
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import ApplyForm, { fireGa } from "./ApplyForm";
import { baseCss } from "./styles";
import { STARTUP4_FORM_SOURCE, STARTUP4_SERVICES } from "@/lib/startup4";
import type { Startup4Key } from "@/lib/startup4";

export type ShellProps = {
  p: Startup4Key;
  cta: string;
  product: string;
  /** 폼의 service 라디오 기본 선택 */
  defaultService: string;
  formTitle: string;
  formSub: string;
  prep: { title: string; items: string[] }[];
  bridge?: string;
  children: ReactNode;
};

export default function Shell({ p, cta, product, defaultService, formTitle, formSub, prep, bridge, children }: ShellProps) {
  const [heroVisible, setHeroVisible] = useState(true);
  const [formVisible, setFormVisible] = useState(false);

  // 스크롤 등장 + 히어로 CTA·폼 가시성 관찰
  useEffect(() => {
    const root = document.getElementById(`${p}-root`);
    if (!root) return;
    root.classList.add(`${p}-js`);
    const targets = root.querySelectorAll<HTMLElement>(`.${p}-rv, .${p}-viz, .${p}-sim`);
    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver === "function") {
      io = new IntersectionObserver(
        (en) =>
          en.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("in");
              io?.unobserve(e.target);
            }
          }),
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
      );
      targets.forEach((t) => io?.observe(t));
    } else {
      targets.forEach((t) => t.classList.add("in"));
    }

    const heroEl = document.getElementById(`${p}-hero-cta`);
    const formEl = document.getElementById(`${p}-form`);
    let io1: IntersectionObserver | null = null;
    let io2: IntersectionObserver | null = null;
    if (typeof IntersectionObserver === "function") {
      io1 = new IntersectionObserver((en) => setHeroVisible(en[0].isIntersecting));
      io2 = new IntersectionObserver((en) => setFormVisible(en[0].isIntersecting));
      if (heroEl) io1.observe(heroEl);
      if (formEl) io2.observe(formEl);
    }
    return () => {
      io?.disconnect();
      io1?.disconnect();
      io2?.disconnect();
    };
  }, [p]);

  const goForm = () => {
    fireGa("cta_click", { cta_location: "sticky", cta_text: cta, form_source: STARTUP4_FORM_SOURCE, product });
    const el = document.getElementById(`${p}-form`);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
  };

  const barOff = heroVisible || formVisible;
  const others = STARTUP4_SERVICES.filter((s) => s.key !== p);

  return (
    <div className={`${p}-root`} id={`${p}-root`}>
      <style dangerouslySetInnerHTML={{ __html: baseCss(p) }} />

      {children}

      <section className={`${p}-formsec`} id={`${p}-form`} data-track-section="form">
        <div className={`${p}-wrap`}>
          <h2 className={`${p}-formtitle`}>{formTitle}</h2>
          <p className={`${p}-formsub`}>{formSub}</p>
          <div className={`${p}-prep`}>
            {prep.map((b) => (
              <div key={b.title} className={`${p}-pb`}>
                <h3>{b.title}</h3>
                <ul>
                  {b.items.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className={`${p}-formbox`}>
            <ApplyForm p={p} cta={cta} defaultService={defaultService} />
          </div>
        </div>
      </section>

      <section className={`${p}-other`} data-track-section="related">
        <div className={`${p}-wrap`}>
          <h2 className={`${p}-h2`}>다른 창업 서비스</h2>
          {bridge ? <p className={`${p}-bridge`}>{bridge}</p> : null}
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
        onClick={goForm}
      >
        <span>{cta}</span>
      </button>
    </div>
  );
}
