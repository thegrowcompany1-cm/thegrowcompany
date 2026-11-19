"use client";

// 시설 위탁운영 랜딩 공통 셸 — 폰트·스타일 주입, 480px 기둥, 모바일 하단 고정 CTA(폼이 보이면 숨김)
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { CM_CSS, PRETENDARD } from "./styles";
import { FORM_ID } from "./parts";

export default function Shell({ cta, children }: { cta: string; children: ReactNode }) {
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    const el = document.getElementById(FORM_ID);
    if (!el || typeof IntersectionObserver !== "function") return;
    const io = new IntersectionObserver((en) => setFormVisible(en[0].isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="cm">
      <link rel="stylesheet" href={PRETENDARD} precedence="default" />
      <style dangerouslySetInnerHTML={{ __html: CM_CSS }} />
      <div className="cm-col">{children}</div>
      <div className="cm-spacer" aria-hidden="true" />
      <div className={`cm-bar${formVisible ? " off" : ""}`} aria-hidden={formVisible}>
        <a href={`#${FORM_ID}`} tabIndex={formVisible ? -1 : 0}>
          {cta}
        </a>
      </div>
    </div>
  );
}
