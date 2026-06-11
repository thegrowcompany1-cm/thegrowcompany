import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "기업/아파트 커뮤니티 위탁 | 더그로우컴퍼니",
  description: "기업 복지시설, 아파트 피트니스 센터 위탁 운영 전문. 체계적인 관리 시스템으로 운영합니다.",
};

export default function CommunityPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-[#111111] text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">홈</Link>
              <span className="text-gray-600">/</span>
              <span className="text-[#009519] text-sm font-semibold">커뮤니티 위탁</span>
            </div>
            <p className="text-[#009519] text-xs font-bold tracking-widest uppercase mb-4">COMMUNITY OUTSOURCING</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-6">
              기업·아파트
              <br />
              <span className="text-[#009519]">커뮤니티 피트니스</span> 위탁
            </h1>
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
              기업 복지 시설, 아파트 커뮤니티 피트니스 센터의 전문 위탁 운영.
              <br className="hidden sm:block" />
              입주민과 직원들의 건강한 생활을 지원합니다.
            </p>
            <div className="mt-8">
              <a href="tel:15514476" className="inline-flex items-center gap-2 bg-[#009519] hover:bg-[#007a14] text-white font-bold px-6 py-3 rounded-full text-sm transition-all">
                무료 상담 신청
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-[#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-8 rounded-2xl bg-[#1A1A1A] border border-white/5">
              <div className="w-12 h-12 bg-[#009519]/10 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#009519]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-[#EEEEEE] mb-3">기업 복지 시설</h3>
              <ul className="space-y-2 text-sm text-[#999999]">
                <li className="flex items-start gap-2"><span className="text-[#009519] mt-1">•</span>사내 피트니스 센터 위탁 운영</li>
                <li className="flex items-start gap-2"><span className="text-[#009519] mt-1">•</span>직원 건강 프로그램 기획</li>
                <li className="flex items-start gap-2"><span className="text-[#009519] mt-1">•</span>전문 트레이너 파견</li>
                <li className="flex items-start gap-2"><span className="text-[#009519] mt-1">•</span>시설 유지관리</li>
              </ul>
            </div>
            <div className="p-8 rounded-2xl bg-[#1A1A1A] border border-white/5">
              <div className="w-12 h-12 bg-[#009519]/10 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-[#009519]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-[#EEEEEE] mb-3">아파트 커뮤니티</h3>
              <ul className="space-y-2 text-sm text-[#999999]">
                <li className="flex items-start gap-2"><span className="text-[#009519] mt-1">•</span>아파트 피트니스 센터 위탁 운영</li>
                <li className="flex items-start gap-2"><span className="text-[#009519] mt-1">•</span>입주민 맞춤 프로그램 운영</li>
                <li className="flex items-start gap-2"><span className="text-[#009519] mt-1">•</span>안전하고 체계적인 관리</li>
                <li className="flex items-start gap-2"><span className="text-[#009519] mt-1">•</span>관리비 절감 및 수익화</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-[#009519] text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">커뮤니티 위탁 문의</h2>
          <p className="text-white/70 mb-8">규모와 상황에 맞는 최적의 위탁 방안을 제안드립니다</p>
          <a href="tel:15514476" className="inline-flex items-center gap-2 bg-white text-[#009519] font-black px-8 py-4 rounded-full text-base hover:bg-gray-100 transition-colors">
            1551-4476 전화 상담
          </a>
        </div>
      </section>
    </div>
  );
}
