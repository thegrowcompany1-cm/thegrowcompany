// ─────────────────────────────────────────────────────────────────────────────
// 시설 위탁운영 세그먼트 랜딩 3종(/consulting/community · community2 · community3) 공통 상수
//  · 기획: docs/community-landing-spec.md
//  · 폼 action·token·source 는 기존 커뮤니티 폼과 동일하다. 바꾸면 시트 집계가 끊긴다.
//  · service 라디오 값은 Apps Script 가 그대로 읽는다(facilityType 열에도 같은 값을 넣어 보낸다)
// ─────────────────────────────────────────────────────────────────────────────

export const COMMUNITY_FORM_ACTION =
  "https://script.google.com/macros/s/AKfycbyTIVLMDS-DQjOZ1fIP9DbzJ2NONxyn6mdjEik1_ZG31XB9TVO0Y5_odvFwO1M0AcJ21Q/exec";
export const COMMUNITY_FORM_SOURCE = "커뮤니티문의";
export const COMMUNITY_FORM_TOKEN = "grow2026secure";

export const COMMUNITY_SERVICES = [
  "아파트 커뮤니티",
  "기업 사내 시설",
  "호텔 부속 시설",
  "공공기관·공공체육시설",
  "대학교 체육시설",
] as const;

export const SVC_APT = COMMUNITY_SERVICES[0];
export const SVC_CORP = COMMUNITY_SERVICES[1];
export const SVC_HOTEL = COMMUNITY_SERVICES[2];
export const SVC_PUBLIC = COMMUNITY_SERVICES[3];
export const SVC_UNIV = COMMUNITY_SERVICES[4];

export type CommunityVariant = "apt" | "org" | "univ";

export type ExtraField = {
  key: string;
  label: string;
  placeholder?: string;
  options?: string[];
};

/** 세그먼트별 선택 입력 — 새 필드로 보내지 않고 message 앞에 [라벨: 값 / ...] 로 붙인다 */
export const COMMUNITY_EXTRAS: Record<CommunityVariant, ExtraField[]> = {
  apt: [
    { key: "households", label: "세대수", placeholder: "예) 900" },
    { key: "moveIn", label: "입주 시기", placeholder: "신축이면 입력" },
    { key: "operation", label: "현재 운영", options: ["직영", "위탁 운영 중", "미운영·신축"] },
  ],
  org: [
    { key: "scale", label: "이용 대상 규모", placeholder: "임직원 수·객실 수 등" },
    { key: "start", label: "희망 시작 시기", placeholder: "예) 2027년 상반기" },
  ],
  univ: [
    { key: "dept", label: "담당 부서", placeholder: "예) 시설팀" },
    { key: "kind", label: "시설 종류", options: ["체육관·피트니스", "생활관 피트니스", "복합 체육시설", "신축·리뉴얼 예정"] },
    { key: "term", label: "희망 시작 학기", placeholder: "예) 2027학년도 1학기" },
  ],
};

export const COMMUNITY_IMG = {
  hero: "/legacy/community/4c3820f8a0b35.png",
  apt: "/legacy/community/837b72cda206d.png",
  public: "/legacy/community/4091425bf2bf7.png",
  corp: "/legacy/community/0ff52097117d9.png",
  hotel: "/legacy/community/425b5e9b225b2.png",
} as const;
