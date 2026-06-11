import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "정규 FC 클래스 | 그로우 에듀 | 더그로우컴퍼니",
  description: "마케팅, 운영, CS 분야의 정규 FC 클래스. 현장 중심의 실무 교육으로 피트니스 전문가를 양성합니다.",
};

const curriculum = [
  {
    module: "마케팅",
    color: "bg-blue-950/40 border-blue-700/40",
    accent: "text-blue-400",
    topics: ["SNS 마케팅 전략", "온라인 광고 운영", "콘텐츠 기획", "브랜드 포지셔닝", "회원 유치 전략"],
  },
  {
    module: "운영",
    color: "bg-green-950/40 border-green-700/40",
    accent: "text-[#009519]",
    topics: ["센터 운영 시스템", "수업 스케줄링", "직원 관리", "매출 분석", "CS 향상 전략"],
  },
  {
    module: "CS (고객 서비스)",
    color: "bg-orange-950/40 border-orange-700/40",
    accent: "text-orange-400",
    topics: ["고객 응대 스킬", "클레임 처리", "회원 재등록 전략", "VIP 고객 관리", "만족도 향상 방법"],
  },
];

export default function FCClassPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-[#111111] text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">홈</Link>
              <span className="text-gray-600">/</span>
              <Link href="/edu/fc-class" className="text-gray-400 hover:text-white text-sm transition-colors">그로우 에듀</Link>
              <span className="text-gray-600">/</span>
              <span className="text-[#009519] text-sm font-semibold">정규 FC 클래스</span>
            </div>
            <p className="text-[#009519] text-xs font-bold tracking-widest uppercase mb-4">GROW EDU — FC CLASS</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-6">
              마케팅·운영·CS
              <br />
              <span className="text-[#009519]">정규 FC 클래스</span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
              피트니스 센터 운영의 핵심 역량을 현장 전문가에게 직접 배웁니다.
              <br className="hidden sm:block" />
              이론이 아닌 실무 중심의 교육으로 바로 적용 가능한 스킬을 습득합니다.
            </p>
            <div className="mt-8">
              <a href="tel:15514476" className="inline-flex items-center gap-2 bg-[#009519] hover:bg-[#007a14] text-white font-bold px-6 py-3 rounded-full text-sm transition-all">
                수강 문의하기
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-[#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#009519] text-xs font-bold tracking-widest uppercase mb-3">CURRICULUM</p>
            <h2 className="text-2xl sm:text-3xl font-black text-[#EEEEEE]">커리큘럼</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {curriculum.map((c) => (
              <div key={c.module} className={`p-6 rounded-2xl border-2 ${c.color}`}>
                <h3 className={`text-xl font-black mb-4 ${c.accent}`}>{c.module}</h3>
                <ul className="space-y-2.5">
                  {c.topics.map((topic) => (
                    <li key={topic} className="flex items-start gap-2 text-sm text-[#CCCCCC]">
                      <svg className={`w-4 h-4 flex-shrink-0 mt-0.5 ${c.accent}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-[#009519] text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">FC 클래스 수강 신청</h2>
          <p className="text-white/70 mb-8">다음 기수 일정을 문의하세요</p>
          <a href="tel:15514476" className="inline-flex items-center gap-2 bg-white text-[#009519] font-black px-8 py-4 rounded-full text-base hover:bg-gray-100 transition-colors">
            1551-4476 수강 문의
          </a>
        </div>
      </section>
    </div>
  );
}
