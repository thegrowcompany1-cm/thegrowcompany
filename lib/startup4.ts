// ─────────────────────────────────────────────────────────────────────────────
// 창업 신규 랜딩 2종(인수창업·입지상권)의 공통 상수
//  · 페이지 카피는 components/startup4/TakeoverSections.tsx · LocationSections.tsx 에 있다
//  · 사용자 노출 문구에 물음표·영문 라벨·"무료 상담"·창업 수치(250회 외)를 넣지 않는다
//  · 그로우 인테리어는 자체 랜딩 없이 외부 사이트로 연결한다
// ─────────────────────────────────────────────────────────────────────────────

export type Startup4Key = "stk" | "slc";

export const STARTUP4_FORM_ACTION =
  "https://script.google.com/macros/s/AKfycbyTIVLMDS-DQjOZ1fIP9DbzJ2NONxyn6mdjEik1_ZG31XB9TVO0Y5_odvFwO1M0AcJ21Q/exec";
export const STARTUP4_FORM_SOURCE = "창업지원상담_아임웹";

export type Startup4Service = {
  key: Startup4Key | "total" | "interior";
  title: string;
  desc: string;
  href: string;
  /** 외부 사이트 - 새 탭으로 열고 외부 링크 아이콘을 보인다 */
  external?: boolean;
};

export const STARTUP4_SERVICES: Startup4Service[] = [
  { key: "stk", title: "인수창업 컨설팅", desc: "매물로 나온 센터, 이 가격에 들어가도 되는지 숫자부터 확인합니다.", href: "/consulting/startup/takeover" },
  { key: "slc", title: "입지·상권 분석 컨설팅", desc: "자리부터 제대로 고르고 싶은 분께 후보지 비교를 드립니다.", href: "/consulting/startup/location" },
  { key: "total", title: "토탈 창업 컨설팅", desc: "입지부터 인테리어, 오픈 프리세일, 운영까지 한 팀이 끝까지", href: "/consulting/startup" },
  { key: "interior", title: "그로우 인테리어", desc: "헬스장·필라테스 전문 인테리어만 따로 맡길 수 있습니다.", href: "https://www.growinterior.co.kr/", external: true },
];
