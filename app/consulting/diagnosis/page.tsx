import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "진단컨설팅 | 더그로우컴퍼니",
  description: "기존 피트니스 센터의 문제점을 진단하고 개선 방안을 제시합니다. 매출, 운영, 마케팅 전반을 분석합니다.",
};

const diagnosisItems = [
  { area: "매출 분석", items: ["회원 현황 및 이탈률 분석", "매출 추이 및 수익성 검토", "가격 정책 적정성 평가"] },
  { area: "운영 진단", items: ["운영 프로세스 효율성 검토", "직원 배치 및 역량 평가", "고객 서비스 수준 진단"] },
  { area: "마케팅 점검", items: ["SNS 및 온라인 채널 분석", "회원 유치 전략 평가", "경쟁사 대비 포지셔닝"] },
  { area: "공간·시설", items: ["레이아웃 효율성 분석", "장비 상태 및 활용도 점검", "인테리어 개선 방향 제시"] },
];

export default function DiagnosisPage() {
  return (
    <div className="min-h-screen">
      <section className="bg-[#111111] text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors">홈</Link>
              <span className="text-gray-600">/</span>
              <span className="text-[#009519] text-sm font-semibold">진단컨설팅</span>
            </div>
            <p className="text-[#009519] text-xs font-bold tracking-widest uppercase mb-4">DIAGNOSIS CONSULTING</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight mb-6">
              센터의 문제,
              <br />
              <span className="text-[#009519]">정확하게 진단</span>합니다
            </h1>
            <p className="text-gray-400 text-base sm:text-lg leading-relaxed">
              매출 정체, 회원 감소, 운영 비효율... 문제의 원인을 찾아드립니다.
              <br className="hidden sm:block" />
              현장 분석을 통한 정확한 진단과 실행 가능한 개선안을 제시합니다.
            </p>
            <div className="mt-8">
              <a href="tel:15514476" className="inline-flex items-center gap-2 bg-[#009519] hover:bg-[#007a14] text-white font-bold px-6 py-3 rounded-full text-sm transition-all">
                진단 신청하기
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-[#111111]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#009519] text-xs font-bold tracking-widest uppercase mb-3">DIAGNOSIS AREAS</p>
            <h2 className="text-2xl sm:text-3xl font-black text-[#EEEEEE]">진단 영역</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {diagnosisItems.map((d) => (
              <div key={d.area} className="p-6 rounded-2xl border border-white/10 hover:border-[#009519]/40 hover:shadow-lg hover:shadow-black/40 bg-[#1A1A1A] transition-all">
                <h3 className="text-lg font-black text-[#EEEEEE] mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#009519] rounded-full" />
                  {d.area}
                </h3>
                <ul className="space-y-2">
                  {d.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-[#999999]">
                      <svg className="w-4 h-4 text-[#009519] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {item}
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
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">진단 컨설팅 신청</h2>
          <p className="text-white/70 mb-8">전문 컨설턴트가 직접 방문하여 진단합니다</p>
          <a href="tel:15514476" className="inline-flex items-center gap-2 bg-white text-[#009519] font-black px-8 py-4 rounded-full text-base hover:bg-gray-100 transition-colors">
            1551-4476 전화 신청
          </a>
        </div>
      </section>
    </div>
  );
}
