// ─────────────────────────────────────────────────────────────────────────────
// 파트너 센터 로고 — 검은 바탕용 흰색 단색 버전 (public/fitness-logos/white/N.png)
//
//  · 원본(public/fitness-logos/N.png)은 그대로 두고, 배경을 투명으로 날리고 로고만
//    흰색으로 바꾼 파일을 white/ 에 따로 만들었다. 히어로 마퀴(HeroSection)는
//    원본을 계속 쓴다.
//  · ratio 는 트림 후 가로/세로 비율이다. 마퀴는 이미지가 로드되기 전에도 각 로고의
//    폭을 알아야 한다(폭이 제각각이라 로드 후에 폭이 정해지면 트랙 길이가 바뀌어
//    -50 퍼센트 이음새가 어긋난다). 파일을 다시 만들면 이 값도 같이 갱신해야 한다.
//  · 노출 대상은 아래 EXCLUDED_LOGOS 를 뺀 나머지다. 되살리려면 번호만 지우면 된다.
// ─────────────────────────────────────────────────────────────────────────────

export type PartnerLogo = { n: number; ratio: number };

/** 변환된 전체 50개 */
export const ALL_PARTNER_LOGOS: PartnerLogo[] = [
  { n: 1, ratio: 2.325 },
  { n: 2, ratio: 1.0 },
  { n: 3, ratio: 2.475 },
  { n: 4, ratio: 3.156 },
  { n: 5, ratio: 1.481 },
  { n: 6, ratio: 0.969 },
  { n: 7, ratio: 1.05 },
  { n: 8, ratio: 2.15 },
  { n: 9, ratio: 1.444 },
  { n: 10, ratio: 2.894 },
  { n: 11, ratio: 0.894 },
  { n: 12, ratio: 0.925 },
  { n: 13, ratio: 1.544 },
  { n: 14, ratio: 2.1 },
  { n: 15, ratio: 0.7 },
  { n: 16, ratio: 1.306 },
  { n: 17, ratio: 1.113 },
  { n: 18, ratio: 1.681 },
  { n: 19, ratio: 0.938 },
  { n: 20, ratio: 1.1 },
  { n: 21, ratio: 1.081 },
  { n: 22, ratio: 0.944 },
  { n: 23, ratio: 1.0 },
  { n: 24, ratio: 4.025 },
  { n: 25, ratio: 1.119 },
  { n: 26, ratio: 13.913 },
  { n: 27, ratio: 1.019 },
  { n: 28, ratio: 1.344 },
  { n: 29, ratio: 1.812 },
  { n: 30, ratio: 2.038 },
  { n: 31, ratio: 1.275 },
  { n: 32, ratio: 0.875 },
  { n: 33, ratio: 3.381 },
  { n: 34, ratio: 2.094 },
  { n: 35, ratio: 0.963 },
  { n: 36, ratio: 3.906 },
  { n: 37, ratio: 1.869 },
  { n: 38, ratio: 0.881 },
  { n: 39, ratio: 1.562 },
  { n: 40, ratio: 1.081 },
  { n: 41, ratio: 0.963 },
  { n: 42, ratio: 4.183 },
  { n: 43, ratio: 1.387 },
  { n: 44, ratio: 2.206 },
  { n: 45, ratio: 0.956 },
  { n: 46, ratio: 1.175 },
  { n: 47, ratio: 0.963 },
  { n: 48, ratio: 1.675 },
  { n: 49, ratio: 1.562 },
  { n: 50, ratio: 1.15 },
];

/**
 * 마퀴에서 뺀 로고.
 *  · 4·5·19·24·29·32 : 요청으로 제외 (원본이 흰 타일 위에서 연하게 보이던 것들)
 *  · 9  : 3번(EDGE PILATES) 과 같은 브랜드
 *  · 22 : 11번(Maison Flow) 과 같은 브랜드
 */
export const EXCLUDED_LOGOS: number[] = [4, 5, 19, 24, 29, 32, 9, 22];

export const PARTNER_LOGOS: PartnerLogo[] = ALL_PARTNER_LOGOS.filter(
  (l) => !EXCLUDED_LOGOS.includes(l.n),
);
