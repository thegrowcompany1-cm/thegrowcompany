import type { Metadata } from "next";
import Image from "next/image";

// ─────────────────────────────────────────────────────────────────────────────
// 채용공고 — 모바일 상세페이지 이미지 1장을 중앙 정렬로 보여주는 페이지.
// 이미지 교체 시 public/recruit/recruit-mobile.webp 만 바꾸고 IMG_H 를 맞추면 된다.
// 하단에 지원 CTA(이메일·전화·인스타그램) 고정 바.
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "채용공고 | 더그로우컴퍼니",
  description: "더그로우 현장 FC · 지점 매니저 상시 모집. 피트니스 현장 창업 및 위탁 근무, 신입·경력 모두 지원 가능합니다.",
  openGraph: {
    title: "WE'RE HIRING — 더그로우 현장 FC & 매니저",
    description: "서울·수도권 각 지점, 상시 모집. 성장을 향한 당신의 다음 시작, 더그로우 컴퍼니가 기다립니다.",
    images: [{ url: "/recruit/recruit-mobile.webp" }],
  },
};

const IMG_W = 1242;
const IMG_H = 7998;

const APPLY_EMAIL = "thegrow_company@naver.com";
const APPLY_TEL = "010-2083-8685";
const INSTAGRAM_URL = "https://www.instagram.com/thegrow.company";

export default function RecruitPage() {
  return (
    <div className="bg-[#0A0A0A] pb-28">
      <div className="mx-auto w-full max-w-[520px]">
        <Image
          src="/recruit/recruit-mobile.webp"
          alt="더그로우컴퍼니 채용공고 — 현장 FC 및 지점 매니저 상시 모집. 신입·경력, 프리랜서, 서울 및 수도권 각 지점, 급여 평균 350~700만 원"
          width={IMG_W}
          height={IMG_H}
          priority
          sizes="(min-width: 520px) 520px, 100vw"
          className="h-auto w-full"
        />
      </div>

      {/* 하단 고정 지원 바 */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#111111]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[520px] items-center gap-2 px-3 py-3">
          <a
            href={`mailto:${APPLY_EMAIL}?subject=${encodeURIComponent("[지원] 더그로우 현장 FC·매니저")}`}
            className="flex flex-1 items-center justify-center rounded-xl bg-[#39FF14] px-3 py-3 text-sm font-black text-[#0A0A0A] transition-colors hover:bg-[#2fe60f]"
          >
            이메일로 지원하기
          </a>
          <a
            href={`tel:${APPLY_TEL.replace(/-/g, "")}`}
            className="flex items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-sm font-bold text-[#EEEEEE] transition-colors hover:border-[#39FF14] hover:text-[#39FF14]"
          >
            전화 문의
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-sm font-bold text-[#EEEEEE] transition-colors hover:border-[#39FF14] hover:text-[#39FF14]"
          >
            인스타그램
          </a>
        </div>
      </div>
    </div>
  );
}
