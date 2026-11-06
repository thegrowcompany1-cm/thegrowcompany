"use client";

import { fireGa } from "./ApplyForm";
import { STARTUP4_FORM_SOURCE } from "@/lib/startup4";

// 히어로 CTA — 폼으로 부드럽게 이동 (Shell 의 하단 고정 바가 이 버튼의 id 를 보고 숨김 여부를 정한다)
export default function GoForm({ p, cta, product }: { p: string; cta: string; product: string }) {
  return (
    <button
      type="button"
      id={`${p}-hero-cta`}
      className={`${p}-cta`}
      onClick={() => {
        fireGa("cta_click", { cta_location: "hero", cta_text: cta, form_source: STARTUP4_FORM_SOURCE, product });
        const el = document.getElementById(`${p}-form`);
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
      }}
    >
      {cta}
    </button>
  );
}
