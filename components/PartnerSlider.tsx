import Image from "next/image";

export const partners = [
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

// 넓은 화면(1920px+)에서 한 세트(7개) 폭이 뷰포트보다 좁아 복제 경계 사이
// 빈 구간이 보이는 문제를 막기 위해, 애니메이션 루프가 도는 "한 세트"
// 자체를 베이스 로고 배열을 여러 번 반복한 긴 세트로 구성한다.
const SET_REPEAT = 4;
// 세트 폭이 SET_REPEAT배 길어진 만큼, 체감 흐름 속도를 유지하려면
// 재생 시간도 같은 배수로 늘려야 한다 (기존 단일 세트 기준 45s).
const TRACK_DURATION_S = 45 * SET_REPEAT;

type TrackItem = { partner: (typeof partners)[0]; decorative: boolean };

// 한 세트 = 베이스 로고를 SET_REPEAT회 반복. 맨 처음 한 바퀴(베이스 배열
// 원본)만 의미 있는 alt 텍스트를 유지하고, 폭 채우기용 반복분은 장식 처리.
function buildSet(base: (typeof partners)[0][]): TrackItem[] {
  const set: TrackItem[] = [];
  for (let rep = 0; rep < SET_REPEAT; rep++) {
    base.forEach((partner) => set.push({ partner, decorative: rep > 0 }));
  }
  return set;
}

// 무한 루프는 이 "세트" 전체를 두 번 이어붙이고 50%만큼 이동시키는
// 방식이라, 두 번째 사본은 항상 전부 장식용(alt="", aria-hidden)이다.
function buildTrack(base: (typeof partners)[0][]): TrackItem[] {
  const set = buildSet(base);
  return [...set, ...set.map((item) => ({ ...item, decorative: true }))];
}

function LogoItem({ item }: { item: TrackItem }) {
  const { partner, decorative } = item;
  return (
    <div className="flex-shrink-0 flex items-center justify-center mx-2 sm:mx-5 h-10 sm:h-14">
      <div className="relative h-7 sm:h-10 w-16 sm:w-28">
        <Image
          src={partner.logo}
          alt={decorative ? "" : `파트너사 ${partner.name} 로고`}
          aria-hidden={decorative ? "true" : undefined}
          fill
          className="object-contain p-1"
          sizes="128px"
        />
      </div>
    </div>
  );
}

export default function PartnerSlider() {
  const row1Track = buildTrack(row1);
  const row2Track = buildTrack(row2);
  const row3Track = buildTrack(row3);

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
        <div
          className="marquee-track-left flex items-center w-max"
          style={{ animationDuration: `${TRACK_DURATION_S}s` }}
        >
          {row1Track.map((item, i) => (
            <LogoItem key={`r1-${i}`} item={item} />
          ))}
        </div>
      </div>

      {/* Row 2 — 오른쪽→왼쪽 */}
      <div className="marquee-container overflow-hidden mb-4 sm:mb-6">
        <div
          className="marquee-track-right flex items-center w-max"
          style={{ animationDuration: `${TRACK_DURATION_S}s` }}
        >
          {row2Track.map((item, i) => (
            <LogoItem key={`r2-${i}`} item={item} />
          ))}
        </div>
      </div>

      {/* Row 3 — 왼쪽→오른쪽 */}
      <div className="marquee-container overflow-hidden">
        <div
          className="marquee-track-left flex items-center w-max"
          style={{ animationDuration: `${TRACK_DURATION_S}s` }}
        >
          {row3Track.map((item, i) => (
            <LogoItem key={`r3-${i}`} item={item} />
          ))}
        </div>
      </div>

    </section>
  );
}
