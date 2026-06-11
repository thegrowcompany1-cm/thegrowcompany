import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "위탁컨설팅 | 더그로우컴퍼니",
  description: "피트니스 센터 위탁 운영 전문 컨설팅. 전문 운영팀이 직접 센터를 관리하여 수익을 극대화합니다.",
};

const features = [
  { icon: "📊", title: "운영 관리", desc: "일정, 예약, 직원 관리 등 센터 전체 운영을 전담합니다" },
  { icon: "📱", title: "마케팅", desc: "SNS, 온라인 광고, 지역 마케팅 등 회원 유치를 위한 전략을 실행합니다" },
  { icon: "👥", title: "인력 관리", desc: "강사, 직원 채용부터 교육, 평가까지 인력 관리 전반을 담당합니다" },
  { icon: "💰", title: "수익 최적화", desc: "가격 정책, 상품 구성, 매출 분석으로 수익성을 높입니다" },
  { icon: "📋", title: "정기 보고", desc: "월별 운영 현황, 재무 보고서를 제공하여 투명하게 운영합니다" },
  { icon: "🔧", title: "시설 관리", desc: "장비 유지보수, 공간 관리, 안전 점검을 체계적으로 관리합니다" },
];

export default function OutsourcingPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-[#111111] text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">홈</Link>
              <span className="text-gray-600">/</span>
              <span className="text-[#009519] text-sm font-semibold">위탁컨설팅</span>
            </div>
            <p className="text-[#009519] text-xs font-bold tracking-widest uppercase mb-4">OUTSOURCING CONSULTING</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-6">
              전문가에게 맡기고
              <br />
              <span className="text-[#009519]">수익에 집중</span>하세요
            </h1>
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
              피트니스 센터 운영의 모든 것을 더그로우컴퍼니가 책임집니다.
              <br className="hidden sm:block" />
              전문 운영팀이 직접 관리하여 안정적인 수익을 창출합니다.
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
          <div className="text-center mb-12">
            <p className="text-[#009519] text-xs font-bold tracking-widest uppercase mb-3">SERVICES</p>
            <h2 className="text-2xl sm:text-3xl font-black text-[#EEEEEE]">위탁 운영 서비스</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="p-6 rounded-2xl bg-[#1A1A1A] hover:shadow-lg hover:shadow-black/40 transition-all border border-white/5">
                <span className="text-3xl mb-4 block">{f.icon}</span>
                <h3 className="text-lg font-black text-[#EEEEEE] mb-2">{f.title}</h3>
                <p className="text-sm text-[#999999]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-[#009519] text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">위탁 운영 문의하기</h2>
          <p className="text-white/70 mb-8">귀 센터에 맞는 위탁 운영 방안을 제안드립니다</p>
          <a href="tel:15514476" className="inline-flex items-center gap-2 bg-white text-[#009519] font-black px-8 py-4 rounded-full text-base hover:bg-gray-100 transition-colors">
            1551-4476 전화 상담
          </a>
        </div>
      </section>
    </div>
  );
}
