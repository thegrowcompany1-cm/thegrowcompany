import Link from "next/link";

type CourseItem = { duration: string; title: string };
type ServiceItem = string | CourseItem;

const services: {
  icon: React.ReactNode;
  tag: string;
  title: string;
  description: string;
  items: ServiceItem[];
  href: string;
  external: boolean;
}[] = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    tag: "CONSULTING",
    title: "컨설팅",
    description:
      "창업부터 위탁, 진단까지 피트니스 비즈니스의 모든 단계를 지원합니다. 현장 경험을 바탕으로 한 실질적인 컨설팅을 제공합니다.",
    items: ["창업컨설팅", "위탁컨설팅", "커뮤니티 위탁", "진단컨설팅", "컨설팅사례"],
    href: "/consulting/startup",
    external: false,
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      </svg>
    ),
    tag: "EDUCATION",
    title: "그로우 에듀",
    description:
      "현장 중심의 실무 교육으로 피트니스 전문가를 양성합니다. 마케팅, 운영, CS, 창업까지 실전 교육 프로그램을 제공합니다.",
    items: [
      { duration: "하루", title: "필수 콘텐츠 AI 5종" },
      { duration: "하루", title: "트레이너 과정" },
      { duration: "4주", title: "FC 심화과정" },
      { duration: "4주", title: "관리자 심화과정" },
      { duration: "12주", title: "1:1 관리자 PT" },
    ],
    href: "/edu/fc-class",
    external: false,
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    tag: "INTERIOR",
    title: "(주)그로우인테리어",
    description:
      "피트니스 공간에 최적화된 인테리어 설계 및 시공. 필라테스, 헬스, PT 센터에 특화된 전문 인테리어 서비스를 제공합니다.",
    items: ["피트니스 공간 설계", "인테리어 시공", "장비 배치 컨설팅"],
    href: "https://www.growinterior.co.kr",
    external: true,
  },
];

function isCourse(item: ServiceItem): item is CourseItem {
  return typeof item === "object";
}

export default function ServiceCards() {
  return (
    <section className="py-14 sm:py-20 bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-[#009519] text-xs sm:text-sm font-bold tracking-widest uppercase mb-3">
            SERVICES
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#EEEEEE]">
            전문 서비스
          </h2>
          <p className="text-[#999999] mt-3 text-sm sm:text-base max-w-xl mx-auto">
            피트니스 비즈니스 성공을 위한 전방위 지원
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service) => {
            const hasCourses = service.items.some(isCourse);

            return (
              <div
                key={service.title}
                className="group bg-[#1A1A1A] rounded-2xl overflow-hidden shadow-sm shadow-black/30 hover:shadow-xl hover:shadow-black/50 transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {/* Top accent line */}
                <div className="h-1 bg-white/10 group-hover:bg-[#009519] transition-colors duration-300" />

                <div className="p-6 sm:p-8 flex flex-col flex-1">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-[#009519]/10 text-[#009519] flex items-center justify-center mb-5 group-hover:bg-[#009519] group-hover:text-white transition-all duration-300">
                    {service.icon}
                  </div>

                  {/* Tag */}
                  <span className="text-[10px] font-bold tracking-widest text-[#009519] uppercase mb-2">
                    {service.tag}
                  </span>

                  {/* Title */}
                  <h3 className="text-xl font-black text-[#EEEEEE] mb-3">{service.title}</h3>

                  {/* Description */}
                  <p className="text-sm text-[#999999] leading-relaxed mb-5">{service.description}</p>

                  {/* Items — course badge style or bullet list */}
                  {hasCourses ? (
                    <ul className="space-y-2 mb-6 flex-1">
                      {service.items.map((item) => {
                        const course = item as CourseItem;
                        return (
                          <li key={course.title} className="flex items-center gap-2.5">
                            <span className="inline-flex items-center justify-center min-w-[3rem] px-2 py-0.5 rounded-md bg-[#009519]/15 border border-[#009519]/25 text-[#009519] text-[10px] font-black tracking-wide flex-shrink-0">
                              {course.duration}
                            </span>
                            <span className="text-sm text-[#CCCCCC]">{course.title}</span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <ul className="space-y-2 mb-6 flex-1">
                      {service.items.map((item) => (
                        <li key={item as string} className="flex items-center gap-2 text-sm text-[#CCCCCC]">
                          <span className="w-1.5 h-1.5 bg-[#009519] rounded-full flex-shrink-0" />
                          {item as string}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* CTA */}
                  {service.external ? (
                    <a
                      href={service.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-[#009519] hover:text-[#007a14] transition-colors group/link mt-auto"
                    >
                      자세히 보기
                      <svg
                        className="w-4 h-4 transition-transform group-hover/link:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  ) : (
                    <Link
                      href={service.href}
                      className="inline-flex items-center gap-2 text-sm font-bold text-[#009519] hover:text-[#007a14] transition-colors group/link mt-auto"
                    >
                      자세히 보기
                      <svg
                        className="w-4 h-4 transition-transform group-hover/link:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
