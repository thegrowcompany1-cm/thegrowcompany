import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "창업 클래스 | 그로우 에듀 | 더그로우컴퍼니",
  description: "피트니스 창업을 준비하는 분들을 위한 실무 창업 클래스. 창업 전 과정을 교육합니다.",
};

const modules = [
  { week: "1주차", title: "시장 조사 & 상권 분석", desc: "피트니스 시장 현황, 상권 분석 방법, 경쟁사 조사 기법" },
  { week: "2주차", title: "사업 계획 수립", desc: "사업계획서 작성, 수익 모델 설계, 투자비 및 운영비 산출" },
  { week: "3주차", title: "공간 & 인테리어", desc: "효율적인 공간 구성, 장비 선정, 인테리어 트렌드" },
  { week: "4주차", title: "마케팅 & 오픈 전략", desc: "사전 마케팅, SNS 활용, 오픈 이벤트 기획, 초기 회원 모집" },
  { week: "5주차", title: "운영 & 인력 관리", desc: "운영 시스템 구축, 직원 채용, 교육, 성과 관리" },
  { week: "6주차", title: "재무 & 성장 전략", desc: "재무 관리, 손익 분석, 지속 성장을 위한 중장기 전략" },
];

export default function StartupClassPage() {
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
              <span className="text-[#009519] text-sm font-semibold">창업 클래스</span>
            </div>
            <p className="text-[#009519] text-xs font-bold tracking-widest uppercase mb-4">GROW EDU — STARTUP CLASS</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-6">
              창업의 모든 것을
              <br />
              <span className="text-[#009519]">6주 안에</span> 배웁니다
            </h1>
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
              피트니스 창업을 준비하는 예비 창업자를 위한 집중 과정.
              <br className="hidden sm:block" />
              실제 창업 경험을 가진 전문가가 직접 가르치는 현장 교육입니다.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <span className="px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold">6주 과정</span>
              <span className="px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold">소규모 그룹 수업</span>
              <span className="px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-semibold">수료 후 지속 지원</span>
            </div>
            <div className="mt-8">
              <a href="tel:15514476" className="inline-flex items-center gap-2 bg-[#009519] hover:bg-[#007a14] text-white font-bold px-6 py-3 rounded-full text-sm transition-all">
                수강 신청하기
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-[#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#009519] text-xs font-bold tracking-widest uppercase mb-3">CURRICULUM</p>
            <h2 className="text-2xl sm:text-3xl font-black text-[#EEEEEE]">6주 커리큘럼</h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {modules.map((m, i) => (
              <div key={i} className="flex gap-4 sm:gap-6 p-5 rounded-2xl bg-[#1A1A1A] hover:bg-[#009519]/10 hover:border-[#009519]/30 border border-white/5 transition-all">
                <div className="flex-shrink-0 w-16 h-16 bg-[#009519]/10 rounded-xl flex items-center justify-center">
                  <span className="text-[#009519] text-xs font-black text-center leading-tight">{m.week}</span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#EEEEEE] mb-1">{m.title}</h3>
                  <p className="text-sm text-[#999999]">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-[#009519] text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">창업 클래스 수강 신청</h2>
          <p className="text-white/70 mb-8">소규모 운영으로 조기 마감될 수 있습니다</p>
          <a href="tel:15514476" className="inline-flex items-center gap-2 bg-white text-[#009519] font-black px-8 py-4 rounded-full text-base hover:bg-gray-100 transition-colors">
            1551-4476 수강 신청
          </a>
        </div>
      </section>
    </div>
  );
}
