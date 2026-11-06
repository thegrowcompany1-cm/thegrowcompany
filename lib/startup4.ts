// ─────────────────────────────────────────────────────────────────────────────
// 창업 신규 랜딩 3종(인수창업·입지상권·인테리어)의 카피와 공통 데이터
//  · 카피 출처: startup-4-plan.md (기획서 그대로, 확인 필요 항목 미반영)
//  · 문구의 [대괄호] 구간은 화면에서 초록 강조로 그린다
//  · 사용자 노출 문구에 물음표·영문 라벨·"무료 상담"·창업 수치(250회 외)를 넣지 않는다
// ─────────────────────────────────────────────────────────────────────────────

export type Startup4Key = "stk" | "slc" | "sin";

export type Startup4Step = { t: string; d: string };

export type Startup4Config = {
  key: Startup4Key;
  path: string;
  /** route 뒤에 붙는 " / 상품: ○○" 값 */
  product: string;
  badge: string;
  headline: string[];
  sub: string;
  cta: string;
  empathyTitle: string;
  empathy: string[];
  redefineTitle: string;
  redefineBody: string;
  stepsTitle: string;
  steps: Startup4Step[];
  takeawayTitle?: string;
  takeaway?: string[];
  whyTitle?: string;
  why?: string[];
  notice?: string;
  /** 입지 페이지: 다른 서비스 섹션 위 연결 문구 */
  bridge?: string;
  evidence?: boolean;
};

export const STARTUP4_FORM_ACTION =
  "https://script.google.com/macros/s/AKfycbyTIVLMDS-DQjOZ1fIP9DbzJ2NONxyn6mdjEik1_ZG31XB9TVO0Y5_odvFwO1M0AcJ21Q/exec";
export const STARTUP4_FORM_SOURCE = "창업지원상담_아임웹";

export const STARTUP4_TAKEOVER: Startup4Config = {
  key: "stk",
  path: "/consulting/startup/takeover",
  product: "인수창업",
  badge: "헬스장·필라테스 인수창업",
  headline: ["매물은 찾았는데", "[이 가격에 들어가도 되는지]", "확신이 서지 않는다면"],
  sub: "권리금, 회원 승계, 실제 매출까지. 계약 전에 숫자부터 같이 확인해 드립니다.",
  cta: "인수 매물 검토 신청하기",
  empathyTitle: "인수를 앞두고 드는 생각",
  empathy: [
    "양도자가 보여준 매출이 진짜인지 모르겠다",
    "권리금이 적정한지 비교할 기준이 없다",
    "남아 있는 회원권을 내가 떠안아야 하는지 헷갈린다",
    "기구·시설 상태가 가격만큼인지 판단이 안 선다",
    "지금 직원과 강사가 그대로 남을지 불안하다",
  ],
  redefineTitle: "인수는 센터가 아니라 [숫자를 사는 일]입니다",
  redefineBody:
    "이미 결제된 회원권은 인수 후 대표님이 수업으로 갚아야 하는 돈입니다. 매출처럼 보였던 숫자가 실제로는 부담이 될 수 있습니다.",
  stepsTitle: "이렇게 검토합니다",
  steps: [
    { t: "실제 매출과 남은 회원권", d: "결제 내역과 남은 수업 수를 나눠서 봅니다." },
    { t: "권리금 적정성", d: "시설·회원·입지 가치로 나눠 협상 포인트를 정리합니다." },
    { t: "시설·기구 상태", d: "교체가 필요한 기구, 렌탈·리스 승계 조건까지 확인합니다." },
    { t: "임대차와 계약 승계", d: "남은 계약 기간, 보증금, 원상복구 조건을 확인합니다." },
    { t: "인수 후 90일 계획", d: "인수 직후 이탈을 막고 매출을 회복할 순서를 같이 짭니다." },
  ],
  takeawayTitle: "받는 것",
  takeaway: [
    "인수 검토 리포트 - 들어가도 되는지, 조건을 바꾸면 되는지, 멈춰야 하는지 의견",
    "권리금 협상 포인트",
    "인수 후 90일 운영 계획",
  ],
  whyTitle: "왜 더그로우",
  why: [
    "운영이 어려운 센터에 직접 들어가 운영해 온 위탁운영 경험으로, 인수 후 어디서 무너지는지를 먼저 압니다.",
    "인수 이후 필요하면 위탁운영·운영 교육으로 이어서 도와드립니다.",
  ],
  notice: "계약서의 법률 검토와 세무 판단은 변호사·세무사 확인을 함께 권합니다.",
};

export const STARTUP4_LOCATION: Startup4Config = {
  key: "slc",
  path: "/consulting/startup/location",
  product: "입지상권",
  badge: "헬스장·필라테스 입지·상권 분석",
  headline: ["인테리어는 고칠 수 있어도", "[자리는 바꿀 수 없습니다]"],
  sub: "후보지 비교부터 임대 조건 협상, 계약 동행까지. 자리 하나만 제대로 골라 드립니다.",
  cta: "후보지 분석 신청하기",
  empathyTitle: "자리를 앞두고 드는 생각",
  empathy: [
    "중개사가 좋다는 자리, 피트니스에도 좋은지 모르겠다",
    "유동인구는 많은데 우리 회원이 될 사람인지 모르겠다",
    "주변 센터가 몇 곳인지, 얼마 받는지 정리가 안 된다",
    "보증금과 월세가 적정한지 협상할 자신이 없다",
  ],
  redefineTitle: "유동인구보다 먼저 봐야 할 [세 가지]가 있습니다",
  redefineBody: "걸어 다니는 사람이 아니라, 매달 결제할 사람이 근처에 사는지가 먼저입니다.",
  stepsTitle: "이렇게 분석합니다",
  steps: [
    { t: "배후 수요", d: "주거·직장 인구와 업종별 타깃 연령대를 봅니다." },
    { t: "경쟁 센터", d: "반경 내 센터 규모·가격·후기를 정리합니다." },
    { t: "건물 조건", d: "층고, 바닥 하중, 전기 용량, 소음, 주차, 엘리베이터를 확인합니다." },
    { t: "임대 조건", d: "보증금·월세 협상, 무상 임대 기간, 원상복구 조건을 봅니다." },
    { t: "계약 동행", d: "계약서 날인 전에 현장에 함께 갑니다." },
  ],
  takeawayTitle: "받는 것",
  takeaway: ["후보지 비교 리포트 - 업종·평수별 적합도", "임대 조건 협상 포인트", "계약 전 체크리스트"],
  bridge: "자리가 정해지면, 오픈까지 한 팀으로 이어갈 수 있습니다",
};

export const STARTUP4_INTERIOR: Startup4Config = {
  key: "sin",
  path: "/consulting/startup/interior",
  product: "인테리어",
  badge: "피트니스 전문 인테리어",
  headline: ["견적서 세 장이", "[전부 다른 이유]부터 알려드립니다"],
  sub: "매출 동선 설계부터 직접 시공, 기구 연결까지. 헬스장·필라테스만 시공해 온 팀이 맡습니다.",
  cta: "인테리어 견적 상담 신청하기",
  empathyTitle: "견적을 받고 드는 생각",
  empathy: [
    "견적마다 금액 차이가 너무 크다",
    "공사 중에 추가금이 계속 붙을까 봐 걱정된다",
    "일반 인테리어 업체는 운동 공간을 잘 모른다",
    "샤워실·바닥·방음처럼 운동 시설만의 공사가 걱정된다",
  ],
  redefineTitle: "견적서에서 [가장 자주 부풀려지는] 항목이 있습니다",
  redefineBody: "항목별로 왜 이 금액인지 보여드리고, 필요 없는 공사는 빼드립니다.",
  stepsTitle: "이렇게 진행합니다",
  steps: [
    { t: "실측과 동선 설계", d: "기구 배치, 상담 공간, 회원 동선을 잡습니다." },
    { t: "항목별 견적", d: "금액 근거를 항목마다 공개합니다." },
    { t: "전속 인테리어팀 직접 시공", d: "중간 업체 없이 진행합니다." },
    { t: "기구 사업자 조건 연결", d: "소매가가 아닌 조건으로 연결합니다." },
  ],
  evidence: true,
};

export type Startup4Service = { key: Startup4Key | "total"; title: string; desc: string; href: string };

export const STARTUP4_SERVICES: Startup4Service[] = [
  { key: "stk", title: "인수창업 컨설팅", desc: "매물로 나온 센터, 이 가격에 들어가도 되는지 숫자부터 확인합니다.", href: "/consulting/startup/takeover" },
  { key: "slc", title: "입지·상권 분석 컨설팅", desc: "자리부터 제대로 고르고 싶은 분께 후보지 비교를 드립니다.", href: "/consulting/startup/location" },
  { key: "total", title: "토탈 창업 컨설팅", desc: "입지부터 인테리어, 오픈 프리세일, 운영까지 한 팀이 끝까지", href: "/consulting/startup" },
  { key: "sin", title: "그로우 인테리어", desc: "헬스장·필라테스 전문 인테리어만 따로 맡길 수 있습니다.", href: "/consulting/startup/interior" },
];

/** /consulting/startup 시공사례 갤러리와 같은 46장 (파일은 public/legacy/startup) */
export const STARTUP4_GALLERY: string[] = [
  "/legacy/startup/7febfcc8985e2.png",
  "/legacy/startup/147fe84156057.png",
  "/legacy/startup/0c832ab248ce4.png",
  "/legacy/startup/971ea42cfd8a8.png",
  "/legacy/startup/16d3196b68f2e.png",
  "/legacy/startup/e8eb94b6d52ff.png",
  "/legacy/startup/050b276ee45d7.png",
  "/legacy/startup/7fddde5b80282.png",
  "/legacy/startup/bdffa96015f92.png",
  "/legacy/startup/429d83e687190.png",
  "/legacy/startup/994f3e4444876.png",
  "/legacy/startup/4a9b8cbefcace.png",
  "/legacy/startup/d62ab4ed1c51e.png",
  "/legacy/startup/bcb8f87ab7f88.png",
  "/legacy/startup/dded8e6197f60.png",
  "/legacy/startup/24150a19c2437.png",
  "/legacy/startup/05fdbed8a415e.png",
  "/legacy/startup/5a7016f66c8e7.png",
  "/legacy/startup/5b6b3c8c692a6.png",
  "/legacy/startup/c0ad9289bb4b3.png",
  "/legacy/startup/a5225411385cf.png",
  "/legacy/startup/e7ec9b6e8f936.png",
  "/legacy/startup/d918cd70d9c08.png",
  "/legacy/startup/48a5270a28abe.png",
  "/legacy/startup/7855e31a685e9.png",
  "/legacy/startup/e75529ae4fab7.png",
  "/legacy/startup/425d8005700dd.png",
  "/legacy/startup/bf3bf2aea61a1.png",
  "/legacy/startup/b02205ae2e7da.png",
  "/legacy/startup/543e8bd02106a.png",
  "/legacy/startup/35a5086c05f11.png",
  "/legacy/startup/e49fbb8f83360.png",
  "/legacy/startup/ee0af39a17497.png",
  "/legacy/startup/31d7a26b1bcf3.png",
  "/legacy/startup/4e18b37fda8fc.png",
  "/legacy/startup/8ff784baa524b.png",
  "/legacy/startup/ce858defec5b3.png",
  "/legacy/startup/13ef060b46ff4.png",
  "/legacy/startup/ed2606eb9f936.png",
  "/legacy/startup/6542da8356ba3.png",
  "/legacy/startup/88d10aeb9e1fd.png",
  "/legacy/startup/500c88fe40f06.png",
  "/legacy/startup/fe2ba70d48273.png",
  "/legacy/startup/ba9e88035d811.png",
  "/legacy/startup/5985b8b2d6a41.png",
  "/legacy/startup/31adc48935f10.png",
];

export const STARTUP4_REVIEW = {
  name: "최○○ 대표님",
  meta: "헬스장 · 경기 수원",
  text: "인테리어 비용이 합리적인데 퀄리티는 최고였어요. 동선까지 고려한 설계 덕분에 상담 전환율이 정말 높습니다.",
};
