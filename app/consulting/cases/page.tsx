import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "컨설팅사례 | 더그로우컴퍼니",
  description: "더그로우컴퍼니의 실제 컨설팅 성공 사례들을 확인하세요.",
};

const cases = [
  {
    category: "창업컨설팅",
    title: "필라테스 스튜디오 성공 창업",
    location: "인천 서구",
    result: "오픈 3개월 만에 회원 200명 달성",
    desc: "상권 분석부터 인테리어, 장비 선정, 강사 채용까지 전 과정을 지원하여 성공적인 창업을 이끌었습니다.",
  },
  {
    category: "위탁컨설팅",
    title: "헬스장 위탁 운영 매출 2배 성장",
    location: "서울 강서",
    result: "위탁 6개월 후 매출 200% 증가",
    desc: "마케팅 전략 재정립과 운영 시스템 개선으로 침체된 헬스장을 성공적으로 살려냈습니다.",
  },
  {
    category: "진단컨설팅",
    title: "PT 센터 회원 이탈 문제 해결",
    location: "경기 부천",
    result: "이탈률 40% 감소, 재등록률 상승",
    desc: "고객 만족도 조사와 서비스 프로세스 분석을 통해 회원 이탈의 근본 원인을 찾고 개선했습니다.",
  },
  {
    category: "커뮤니티 위탁",
    title: "아파트 피트니스 센터 활성화",
    location: "인천 미추홀",
    result: "이용률 3배 증가, 주민 만족도 향상",
    desc: "체계적인 프로그램 구성과 전문 운영 인력 파견으로 방치되던 커뮤니티 시설을 활성화했습니다.",
  },
];

export default function CasesPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-[#111111] text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">홈</Link>
              <span className="text-gray-600">/</span>
              <span className="text-[#009519] text-sm font-semibold">컨설팅사례</span>
            </div>
            <p className="text-[#009519] text-xs font-bold tracking-widest uppercase mb-4">CASES</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-6">
              <span className="text-[#009519]">성공 사례</span>로
              <br />
              증명합니다
            </h1>
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
              500건 이상의 컨설팅 경험에서 나온 실제 성공 사례들을 확인하세요.
            </p>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-[#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {cases.map((c, i) => (
              <div key={i} className="p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#1A1A1A] hover:shadow-xl hover:shadow-black/40 transition-all hover:-translate-y-0.5">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#009519]/15 text-[#009519] text-xs font-bold mb-4">
                  {c.category}
                </span>
                <h3 className="text-xl font-black text-[#EEEEEE] mb-1">{c.title}</h3>
                <p className="text-sm text-[#999999] mb-4">📍 {c.location}</p>
                <div className="p-3 rounded-xl bg-[#009519]/10 border border-[#009519]/30 mb-4">
                  <p className="text-sm font-bold text-[#009519]">✓ {c.result}</p>
                </div>
                <p className="text-sm text-[#999999] leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-[#009519] text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">다음 성공 사례는 바로 당신입니다</h2>
          <p className="text-white/70 mb-8">지금 바로 상담 신청하세요</p>
          <a href="tel:15514476" className="inline-flex items-center gap-2 bg-white text-[#009519] font-black px-8 py-4 rounded-full text-base hover:bg-gray-100 transition-colors">
            1551-4476 무료 상담
          </a>
        </div>
      </section>
    </div>
  );
}
