export default function CTASection() {
  return (
    <section className="py-14 sm:py-24 bg-[#151515]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-[#009519]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-[#009519]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>

        <p className="text-[#009519] text-xs sm:text-sm font-bold tracking-widest uppercase mb-4">
          FREE CONSULTATION
        </p>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-[#EEEEEE] leading-tight mb-4">
          피트니스 창업,
          <br />
          어디서부터 시작해야 할지
          <br className="sm:hidden" />
          <span className="text-[#009519]"> 모르겠다면</span>
        </h2>

        <p className="text-[#999999] text-sm sm:text-base lg:text-lg leading-relaxed mb-8 sm:mb-10 max-w-2xl mx-auto">
          더그로우컴퍼니의 전문 컨설턴트가 무료로 상담해 드립니다.
          <br className="hidden sm:block" />
          창업 아이디어부터 실행 계획까지, 함께 설계해 드립니다.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="tel:15514476"
            className="inline-flex items-center justify-center gap-3 bg-[#009519] hover:bg-[#007a14] text-white font-bold px-8 py-4 rounded-full text-base sm:text-lg transition-all duration-200 shadow-lg shadow-green-900/20 hover:shadow-green-900/40 hover:-translate-y-0.5 w-full sm:w-auto"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            1551-4476 전화 상담
          </a>

          <a
            href="mailto:thegrow_company@naver.com"
            className="inline-flex items-center justify-center gap-3 bg-[#2A2A2A] hover:bg-[#333333] text-white font-bold px-8 py-4 rounded-full text-base sm:text-lg transition-all duration-200 hover:-translate-y-0.5 border border-white/10 w-full sm:w-auto"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            이메일 문의
          </a>
        </div>

        {/* Trust badge */}
        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-[#999999]">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#009519]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            무료 초기 상담
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#009519]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            현장 경험 기반 전문 컨설팅
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#009519]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            맞춤형 솔루션 제공
          </div>
        </div>
      </div>
    </section>
  );
}
