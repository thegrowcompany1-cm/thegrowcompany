import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "창업컨설팅 | 더그로우컴퍼니",
  description: "피트니스 창업의 모든 과정을 전문 컨설턴트가 함께합니다. 필라테스, PT, 헬스, 골프 창업 전문 컨설팅.",
};

const steps = [
  { step: "01", title: "초기 상담", desc: "창업 아이디어 및 방향성 논의, 시장 현황 분석" },
  { step: "02", title: "상권 분석", desc: "입지 선정 및 상권 분석, 경쟁사 조사" },
  { step: "03", title: "사업 계획", desc: "사업계획서 작성, 수익 모델 설계, 투자비 산출" },
  { step: "04", title: "공간 설계", desc: "인테리어 방향성 결정, 장비 선정 및 배치" },
  { step: "05", title: "오픈 준비", desc: "직원 채용, 시스템 구축, 마케팅 전략 수립" },
  { step: "06", title: "사후 관리", desc: "오픈 후 3개월 모니터링, 개선 방안 제시" },
];

export default function StartupConsultingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-[#111111] text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">홈</Link>
              <span className="text-gray-600">/</span>
              <span className="text-[#009519] text-sm font-semibold">창업컨설팅</span>
            </div>
            <p className="text-[#009519] text-xs font-bold tracking-widest uppercase mb-4">STARTUP CONSULTING</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-6">
              피트니스 창업,
              <br />
              <span className="text-[#009519]">성공적인 시작</span>을 위해
            </h1>
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
              수백 건의 피트니스 창업 경험을 바탕으로 한 전문 컨설팅.
              <br className="hidden sm:block" />
              필라테스, PT, 헬스, 골프 등 모든 피트니스 종목의 창업을 지원합니다.
            </p>
            <div className="flex gap-4 mt-8">
              <a
                href="tel:15514476"
                className="inline-flex items-center gap-2 bg-[#009519] hover:bg-[#007a14] text-white font-bold px-6 py-3 rounded-full text-sm transition-all"
              >
                무료 상담 신청
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-14 sm:py-20 bg-[#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#009519] text-xs font-bold tracking-widest uppercase mb-3">PROCESS</p>
            <h2 className="text-2xl sm:text-3xl font-black text-[#EEEEEE]">컨설팅 프로세스</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div key={s.step} className="p-6 rounded-2xl bg-[#1A1A1A] hover:bg-[#009519]/10 border border-white/5 hover:border-[#009519]/30 transition-all">
                <span className="text-4xl font-black text-[#009519]/30">{s.step}</span>
                <h3 className="text-lg font-black text-[#EEEEEE] mt-2 mb-2">{s.title}</h3>
                <p className="text-sm text-[#999999]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-20 bg-[#009519] text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">지금 바로 상담하세요</h2>
          <p className="text-white/70 mb-8">전문 컨설턴트가 무료로 상담해 드립니다</p>
          <a
            href="tel:15514476"
            className="inline-flex items-center gap-2 bg-white text-[#009519] font-black px-8 py-4 rounded-full text-base hover:bg-gray-100 transition-colors"
          >
            1551-4476 전화 상담
          </a>
        </div>
      </section>
    </div>
  );
}
