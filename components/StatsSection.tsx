const stats = [
  { value: "500+", label: "누적 컨설팅", sub: "건 수행" },
  { value: "21+", label: "파트너사", sub: "국내외 협력" },
  { value: "5년+", label: "업계 경력", sub: "전문 노하우" },
  { value: "1,000+", label: "교육 수강생", sub: "그로우 에듀" },
];

export default function StatsSection() {
  return (
    <section className="bg-[#009519] py-14 sm:py-20 overflow-hidden relative">
      {/* Background subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(circle, white 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-white/60 text-xs sm:text-sm font-bold tracking-widest uppercase mb-3">
            ACHIEVEMENTS
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
            숫자로 보는 더그로우컴퍼니
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="text-center group"
            >
              <div className="inline-flex flex-col items-center justify-center w-full py-6 sm:py-8 px-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors duration-300 border border-white/20">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-none mb-2">
                  {stat.value}
                </span>
                <span className="text-base sm:text-lg font-bold text-white/90 mb-1">
                  {stat.label}
                </span>
                <span className="text-xs sm:text-sm text-white/60">{stat.sub}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-white/40 text-xs mt-8 sm:mt-10">
          * 상기 수치는 누적 데이터 기준입니다
        </p>
      </div>
    </section>
  );
}
