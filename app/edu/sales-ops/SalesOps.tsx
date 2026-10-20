"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 피트니스 성장 마스터키 세미나 (/edu/sales-ops)
//
//  · 화면은 SalesOpsLanding(모바일 우선 랜딩)이 그린다 — 히어로·역할 칩·고통·강사 소개·운영 화면·타임테이블·영상·FAQ.
//  · 신청 폼·결제(SalesOpsPay)는 그대로 applySection 에 넣는다. 앵커는 #so-apply (랜딩이 id 를 갖는다).
//  · 히어로의 역할 칩을 고르면 신청 폼의 역할 선택이 같은 값으로 맞춰진다 (presetRole).
//  · 모바일(768px 미만) 하단 고정 CTA 는 여기서 붙인다 — 히어로가 보이는 동안과 신청 섹션에 닿은 뒤에는 숨긴다.
//    잔여석 표기는 실제 숫자 연동 전까지 넣지 않는다.
//  · 일자·장소·정원·가격은 lib/salesOps.ts 상수만 수정한다.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import SalesOpsPay from "@/components/edu/SalesOpsPay";
import { SO_PRICE_STORY, soFormatPrice } from "@/lib/salesOps";
import SalesOpsLanding, { type RoleId } from "./SalesOpsLanding";

// 칩 → 신청 폼의 역할 선택값 (components/edu/SalesOpsPay.tsx 의 ROLES 와 같은 문자열)
const ROLE_LABEL: Record<RoleId, string> = {
  trainer: "트레이너 · 강사",
  manager: "관리자 · 팀장 · 실장",
  owner: "대표 · 원장",
};

const SOS_STYLE = `
.sos-sticky{display:none}
@media(max-width:767px){
  .sos-sticky{display:block;position:fixed;left:0;right:0;bottom:0;z-index:40;padding:10px 16px calc(10px + env(safe-area-inset-bottom));background:rgba(18,18,18,.94);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);transform:translateY(100%);visibility:hidden;transition:transform .25s ease,visibility 0s linear .25s}
  .sos-sticky.is-on{transform:none;visibility:visible;transition-delay:0s}
  .sos-sticky a{display:flex;align-items:center;justify-content:center;width:100%;height:52px;border-radius:12px;background:#d9400a;color:#fff;font-size:16px;font-weight:800;text-decoration:none;letter-spacing:-.01em}
}
@media(prefers-reduced-motion:reduce){.sos-sticky,.sos-sticky.is-on{transition:none}}
`;

export default function SalesOps() {
  // 히어로 칩이 고른 역할 (신청 폼에 미리 채운다)
  const [presetRole, setPresetRole] = useState<string | undefined>(undefined);
  // 모바일 하단 고정 CTA 표시 여부
  const [stickyOn, setStickyOn] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("so-hero");
    const apply = document.getElementById("so-apply");
    if (!hero || !apply) return;
    // 상태는 요소의 현재 위치로 다시 읽는다. IntersectionObserver 는 경계를 '넘는 순간'만 알려 주어서
    // 앵커 이동처럼 한 번에 크게 점프하면(신청 섹션을 지나친 상태에서 위로 되돌아갈 때) 놓칠 수 있다.
    // 그래서 옵저버가 깨우면 위치를 다시 읽고, 스크롤·크기 변화에서도 같은 계산을 한다.
    const sync = () => {
      const vh = window.innerHeight;
      const h = hero.getBoundingClientRect();
      const a = apply.getBoundingClientRect();
      const heroIn = h.bottom > 0 && h.top < vh; // 히어로가 화면에 보이는 동안
      const applyHide = a.top < vh; // 신청 섹션이 들어왔거나(보이는 중) 이미 지나쳤다
      setStickyOn(!heroIn && !applyHide);
    };
    let raf = 0;
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; sync(); });
    };
    const io = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(schedule, { threshold: 0 });
    io?.observe(hero);
    io?.observe(apply);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    sync();
    return () => {
      io?.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // '#so-apply' 로 가는 링크(히어로 CTA·하단 바)는 부드럽게 스크롤한다. 대상이 없으면 기본 동작에 맡긴다.
  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = (e.target as HTMLElement).closest?.('a[href="#so-apply"]');
    if (!a) return;
    const el = document.getElementById("so-apply");
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div onClick={onClick}>
      <style dangerouslySetInnerHTML={{ __html: SOS_STYLE }} />
      <SalesOpsLanding
        onRoleChange={(id) => setPresetRole(ROLE_LABEL[id])}
        applySection={
          <SalesOpsPay stack accent="#d9400a" accentDark="#a82f06" accentSoft="rgba(217,64,10,.12)" presetRole={presetRole} />
        }
      />

      <div className={`sos-sticky${stickyOn ? " is-on" : ""}`} aria-hidden={!stickyOn}>
        <a href="#so-apply" tabIndex={stickyOn ? 0 : -1}>
          {soFormatPrice(SO_PRICE_STORY)} 신청하기
        </a>
      </div>
    </div>
  );
}
