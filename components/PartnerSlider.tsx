import Image from "next/image";

const partners = [
  { name: "LEXCO", logo: "/logos/lexco.png" },
  { name: "FirstCS", logo: "/logos/firstcs.png" },
  { name: "Bodydot", logo: "/logos/bodydot.png" },
  { name: "InBody", logo: "/logos/inbody.png" },
  { name: "BARRETECH", logo: "/logos/barretech.png" },
  { name: "Hammer Strength", logo: "/logos/hammer-strength.png" },
  { name: "Panatta", logo: "/logos/panatta.png" },
  { name: "gym80", logo: "/logos/gym80.png" },
  { name: "Motioncare PILATES", logo: "/logos/motioncare-pilates.png" },
  { name: ".fonv", logo: "/logos/fonv.png" },
  { name: "DRAX", logo: "/logos/drax.png" },
  { name: "HONG STARS", logo: "/logos/hong-stars.png" },
  { name: "BROJ", logo: "/logos/broj.png" },
  { name: "대구대학교", logo: "/logos/daegu-university.png" },
  { name: "대경대학교", logo: "/logos/daekyeung-university.png" },
  { name: "제이에스헬스케어", logo: "/logos/js-healthcare.png" },
  { name: "SW HEALTHCARE", logo: "/logos/sw-healthcare.png" },
  { name: "Life Fitness", logo: "/logos/life-fitness.png" },
  { name: "VILITI Fitness", logo: "/logos/viliti-fitness.png" },
  { name: "bodycodi", logo: "/logos/bodycodi.png" },
  { name: "into PILATES", logo: "/logos/into-pilates.png" },
];

// 7개씩 3행으로 분할
const row1 = partners.slice(0, 7);
const row2 = partners.slice(7, 14);
const row3 = partners.slice(14, 21);

function LogoItem({ partner }: { partner: (typeof partners)[0] }) {
  return (
    <div className="flex-shrink-0 flex items-center justify-center mx-2 sm:mx-5 h-10 sm:h-14">
      <div className="relative h-7 sm:h-10 w-16 sm:w-28">
        <Image
          src={partner.logo}
          alt={`파트너사 ${partner.name} 로고`}
          fill
          className="object-contain p-1"
          sizes="128px"
        />
      </div>
    </div>
  );
}

export default function PartnerSlider() {
  const row1Doubled = [...row1, ...row1];
  const row2Doubled = [...row2, ...row2];
  const row3Doubled = [...row3, ...row3];

  return (
    <section className="py-14 sm:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10 sm:mb-14">
        <p className="text-[#009519] text-xs sm:text-sm font-bold tracking-widest uppercase mb-3">
          PARTNERS
        </p>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111111]">
          함께하는 파트너
        </h2>
        <p className="text-[#888888] mt-3 text-sm sm:text-base">
          피트니스 업계 리딩 브랜드들과 함께합니다
        </p>
      </div>

      {/* Row 1 — 왼쪽→오른쪽 */}
      <div className="marquee-container overflow-hidden mb-4 sm:mb-6">
        <div className="marquee-track-left flex items-center w-max">
          {row1Doubled.map((p, i) => (
            <LogoItem key={`r1-${i}`} partner={p} />
          ))}
        </div>
      </div>

      {/* Row 2 — 오른쪽→왼쪽 */}
      <div className="marquee-container overflow-hidden mb-4 sm:mb-6">
        <div className="marquee-track-right flex items-center w-max">
          {row2Doubled.map((p, i) => (
            <LogoItem key={`r2-${i}`} partner={p} />
          ))}
        </div>
      </div>

      {/* Row 3 — 왼쪽→오른쪽 */}
      <div className="marquee-container overflow-hidden">
        <div className="marquee-track-left flex items-center w-max">
          {row3Doubled.map((p, i) => (
            <LogoItem key={`r3-${i}`} partner={p} />
          ))}
        </div>
      </div>

    </section>
  );
}
