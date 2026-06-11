import Link from "next/link";

const courses = [
  {
    duration: "하루",
    durationUnit: "",
    title: "필수 콘텐츠 AI 5종",
    tag: "AI 활용",
    desc: "피트니스 센터 운영에 꼭 필요한 AI 콘텐츠 툴 5가지를 하루 만에 마스터합니다.",
    href: "/edu/fc-class",
    accent: "from-emerald-500/20 to-brand/10",
  },
  {
    duration: "하루",
    durationUnit: "",
    title: "트레이너 과정",
    tag: "트레이너",
    desc: "현장 트레이너에게 필요한 핵심 역량을 집중적으로 배우는 1일 완성 과정입니다.",
    href: "/edu/fc-class",
    accent: "from-emerald-500/20 to-brand/10",
  },
  {
    duration: "4주",
    durationUnit: "",
    title: "FC 심화과정",
    tag: "FC 심화",
    desc: "마케팅·운영·CS 전 영역을 심화 학습하는 4주 정규 과정입니다.",
    href: "/edu/fc-class",
    accent: "from-brand/20 to-brand/5",
  },
  {
    duration: "4주",
    durationUnit: "",
    title: "관리자 심화과정",
    tag: "관리자",
    desc: "센터 관리자로서 필요한 리더십·수익 관리·인력 운용을 4주간 집중 학습합니다.",
    href: "/edu/fc-class",
    accent: "from-brand/20 to-brand/5",
  },
  {
    duration: "12주",
    durationUnit: "완성",
    title: "1:1 관리자 PT",
    tag: "프리미엄",
    desc: "전담 컨설턴트와 1:1로 진행하는 12주 관리자 밀착 코칭 프로그램입니다.",
    href: "/edu/startup-class",
    accent: "from-amber-500/15 to-brand/5",
    premium: true,
  },
];

export default function EduCourses() {
  return (
    <section className="py-14 sm:py-20 bg-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-[#009519] text-xs sm:text-sm font-bold tracking-widest uppercase mb-3">
            GROW EDU
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#EEEEEE]">
            교육 과정
          </h2>
          <p className="text-[#999999] mt-3 text-sm sm:text-base max-w-xl mx-auto">
            현장 전문가가 직접 가르치는 피트니스 실무 교육
          </p>
        </div>

        {/* Course grid — 2+2+1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {courses.map((course, i) => (
            <Link
              key={i}
              href={course.href}
              className={`group relative flex flex-col rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50
                ${course.premium
                  ? "border-amber-500/30 hover:border-amber-400/50"
                  : "border-white/8 hover:border-[#009519]/40"
                }
                ${i === 4 ? "sm:col-span-2 lg:col-span-1" : ""}
              `}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${course.accent} opacity-100`} />
              <div className="absolute inset-0 bg-[#141414]" style={{ zIndex: -1 }} />

              <div className="relative p-6 sm:p-7 flex flex-col flex-1">
                {/* Duration badge */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`font-black leading-none tabular-nums
                        ${course.duration === "12주" ? "text-5xl sm:text-6xl" : "text-5xl sm:text-6xl"}
                        ${course.premium ? "text-amber-400" : "text-[#009519]"}
                      `}
                    >
                      {course.duration}
                    </span>
                    <span className={`text-base font-bold ${course.premium ? "text-amber-400/70" : "text-[#009519]/70"}`}>
                      완성
                    </span>
                  </div>

                  {/* Tag pill */}
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide
                      ${course.premium
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        : "bg-[#009519]/15 text-[#009519] border border-[#009519]/25"
                      }
                    `}
                  >
                    {course.tag}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-black text-[#EEEEEE] mb-2 leading-snug">
                  {course.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-[#999999] leading-relaxed flex-1">
                  {course.desc}
                </p>

                {/* Arrow link */}
                <div className={`mt-5 flex items-center gap-1.5 text-sm font-bold transition-colors
                  ${course.premium ? "text-amber-400 group-hover:text-amber-300" : "text-[#009519] group-hover:text-[#00b81f]"}`}
                >
                  자세히 보기
                  <svg
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>

              {/* Premium shimmer line */}
              {course.premium && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
              )}
              {!course.premium && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#009519]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 sm:mt-12 text-center">
          <Link
            href="/edu/fc-class"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#009519] hover:text-[#00b81f] transition-colors"
          >
            전체 교육 과정 보기
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
