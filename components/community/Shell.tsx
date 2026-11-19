"use client";

// 시설 위탁운영 랜딩 공통 셸 — 폰트·스타일 주입, 480px 기둥, 모바일 하단 고정 CTA(폼이 보이면 숨김)
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { CM_CSS, PRETENDARD } from "./styles";
import { FORM_ID } from "./parts";

export default function Shell({ cta, children }: { cta: string; children: ReactNode }) {
  const [formVisible, setFormVisible] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);

  // 폼이 보이거나, 본문에 신청 버튼이 이미 보이는 동안에는 하단 고정 바를 숨긴다
  useEffect(() => {
    if (typeof IntersectionObserver !== "function") return;
    const form = document.getElementById(FORM_ID);
    const ios: IntersectionObserver[] = [];
    if (form) {
      const io = new IntersectionObserver((en) => setFormVisible(en[0].isIntersecting));
      io.observe(form);
      ios.push(io);
    }
    const seen = new Set<Element>();
    const ioC = new IntersectionObserver((en) => {
      en.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
      setCtaVisible(seen.size > 0);
    });
    document.querySelectorAll("[data-cta]").forEach((a) => ioC.observe(a));
    ios.push(ioC);
    return () => ios.forEach((io) => io.disconnect());
  }, []);
  const barOff = formVisible || ctaVisible;

  // 스크롤 등장: JS 가 돌고 움직임 감소가 아닐 때만, 화면 아래 요소를 숨겼다가 들어올 때 한 번 올라오게 한다(안 돌면 전부 그대로 보임)
  useEffect(() => {
    const root = document.querySelector(".cm");
    if (!root || typeof IntersectionObserver !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(".cm-b:not(.cm-hero) .cm-in > *"));
    const vh = window.innerHeight;
    els.forEach((el) => {
      const idx = Array.prototype.indexOf.call(el.parentElement?.children ?? [], el);
      el.style.setProperty("--d", `${Math.min(idx, 4) * 70}ms`);
      if (el.getBoundingClientRect().top < vh) el.setAttribute("data-seen", "1");
    });
    root.classList.add("cm-anim");
    const io = new IntersectionObserver(
      (en) =>
        en.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute("data-seen", "1");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => {
      if (!el.hasAttribute("data-seen")) io.observe(el);
    });
    // 탭 전환처럼 나중에 새로 생긴 블록 요소는 숨기지 않고 바로 보이게 한다
    const mo = new MutationObserver((ms) =>
      ms.forEach((m) =>
        m.addedNodes.forEach((n) => {
          if (n instanceof HTMLElement && n.parentElement?.classList.contains("cm-in")) n.setAttribute("data-seen", "1");
        }),
      ),
    );
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      root.classList.remove("cm-anim");
    };
  }, []);

  return (
    <div className="cm">
      <link rel="stylesheet" href={PRETENDARD} precedence="default" />
      <style dangerouslySetInnerHTML={{ __html: CM_CSS }} />
      <div className="cm-col">{children}</div>
      <div className="cm-spacer" aria-hidden="true" />
      <div className={`cm-bar${barOff ? " off" : ""}`} aria-hidden={barOff}>
        <a href={`#${FORM_ID}`} tabIndex={barOff ? -1 : 0}>
          {cta}
        </a>
      </div>
    </div>
  );
}
