// 진단 컨설턴트 양성과정 일정 — 날짜는 이 파일 한 곳만 고친다.
// 쓰는 곳: app/edu/diagnostic-consultant (히어로·커리큘럼·하단 문구·JSON-LD 메타), app/edu/EduHub.tsx
//
// DCC_SCHEDULE 는 커리큘럼 표(CURRICULUM)와 같은 순서(회차·휴식·휴강 포함 12줄)다.
//  · date : 화면 표기 "MM/DD" (5회차는 배정 매장과 조율하는 평일 1일이라 문구)
//  · iso  : 날짜 데이터용 "YYYY-MM-DD". 연도가 바뀌는 구간(2027)도 여기서 정확히 관리한다. 평일 1일은 null.

export const DCC_SCHEDULE: { date: string; iso: string | null }[] = [
  { date: "12/06", iso: "2026-12-06" }, // 1회차 교육
  { date: "12/13", iso: "2026-12-13" }, // 2회차 교육
  { date: "12/20", iso: "2026-12-20" }, // 3회차 과제발표 ①
  { date: "12/27", iso: "2026-12-27" }, // 휴식 보완
  { date: "01/03", iso: "2027-01-03" }, // 4회차 교육
  { date: "평일 1일", iso: null }, //       5회차 현장실습
  { date: "01/17", iso: "2027-01-17" }, // 6회차 과제발표 ②
  { date: "01/24", iso: "2027-01-24" }, // 휴식 보완
  { date: "01/31", iso: "2027-01-31" }, // 7회차 교육
  { date: "02/07", iso: "2027-02-07" }, // 설 연휴 휴강
  { date: "02/14", iso: "2027-02-14" }, // 8회차 교육
  { date: "02/21", iso: "2027-02-21" }, // 9회차 최종발표 ③
];

const dated = DCC_SCHEDULE.filter((s): s is { date: string; iso: string } => s.iso !== null);

/** 개강일·종강일 (ISO) — JSON-LD Course startDate / endDate */
export const DCC_START_ISO = dated[0].iso;
export const DCC_END_ISO = dated[dated.length - 1].iso;

/** 화면 표기용 — "2026.12.06" / "12.06" / "12/06" */
export const DCC_OPEN_DOTTED = DCC_START_ISO.replace(/-/g, ".");
export const DCC_OPEN_SHORT_DOT = DCC_START_ISO.slice(5).replace("-", ".");
export const DCC_OPEN_SHORT_SLASH = DCC_START_ISO.slice(5).replace("-", "/");
/** 개강일 한글 표기 — "12월 6일" */
export const DCC_OPEN_KO = `${Number(DCC_START_ISO.slice(5, 7))}월 ${Number(DCC_START_ISO.slice(8, 10))}일`;
