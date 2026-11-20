"use client";

// ② 기업·호텔·공공기관 위탁 — /consulting/community2 (명세: docs/community-landing-spec.md, 13블록)
//  · 상단 탭 3개(기업/호텔/공공). ?type=corp|hotel|public 으로도 열린다
//  · 탭이 바뀌면 2·3·5·6(추천 배지)블록과 폼 service 기본값이 바뀐다. 나머지는 공통
import { useEffect, useState } from "react";
import Shell from "./Shell";
import FacilityApplyForm from "./FacilityApplyForm";
import { BigIn, Block, Btn, Cards, Faq, FormBlock, Hero, Hl, Photo, ReportMock, Scenarios, Steps } from "./parts";
import type { CardItem } from "./parts";
import { COMMUNITY_IMG, SVC_CORP, SVC_HOTEL, SVC_PUBLIC } from "@/lib/community";

const CTA = "시설 운영 진단 받아보기";

type Tab = "corp" | "hotel" | "public";
const TABS: { key: Tab; label: string; service: string }[] = [
  { key: "corp", label: "기업 사내 시설", service: SVC_CORP },
  { key: "hotel", label: "호텔", service: SVC_HOTEL },
  { key: "public", label: "공공기관", service: SVC_PUBLIC },
];

const HERO: Record<Tab, { a: string; hl: string; b: string; sub: string }> = {
  corp: {
    a: "만들어 놓고 아무도 안 쓰는",
    hl: "사내 피트니스",
    b: "는 비용입니다.",
    sub: "출근 전, 점심, 퇴근 후. 임직원의 하루에 맞춘 프로그램과 코칭으로 이용률을 만들고, 분기마다 숫자로 보고합니다.",
  },
  hotel: {
    a: "투숙객 리뷰의 한 줄은",
    hl: "피트니스에서도",
    b: " 나옵니다.",
    sub: "호텔 등급에 맞는 응대, 회원권 회원이 떠나지 않는 운영. 회원 등록과 재등록을 만들어 온 방식을 호텔 피트니스에 맞춥니다.",
  },
  public: {
    a: "이용률과 만족도,",
    hl: "보고서로 증명하는",
    b: " 공공체육시설.",
    sub: "적자 시설이라는 지적 앞에서 필요한 건 숫자입니다. 시민 계층별 프로그램과 월간 성과 보고로 결과를 남깁니다.",
  },
};

const WORRY: Record<Tab, { who: string; items: string[] }> = {
  corp: { who: "대표·HR·총무", items: ["기구만 있고 사람이 없다", "경영진에게 보고할 숫자가 없다", "교대·사무·현장직마다 쓸 수 있는 시간이 다르다"] },
  hotel: { who: "총지배인·오너", items: ["강사 한 명의 태도가 리뷰로 남는다", "재등록 관리가 없으면 회원권 매출이 줄어든다", "외국인 투숙객 영문 응대가 필요하다"] },
  public: { who: "기관장·담당 부서", items: ["의회·언론의 적자 지적", "감사 대응용 항목별 기록", "시니어·청소년·여성·장애인 체육까지 고른 프로그램"] },
};

const PROGRAMS: Record<Tab, { items: CardItem[]; img: string; alt: string }> = {
  corp: {
    img: COMMUNITY_IMG.corp,
    alt: "기업 사내 피트니스",
    items: [
      { eyebrow: "출근 전", title: "그룹GX·바레" },
      { eyebrow: "점심", title: "스트레칭·요가·근골격계" },
      { eyebrow: "퇴근 후", title: "복싱·PT·골프" },
      { eyebrow: "임원", title: "1:1 PT·골프 케어" },
      { eyebrow: "부서", title: "그룹 클래스·웰니스 워크숍" },
    ],
  },
  hotel: {
    img: COMMUNITY_IMG.hotel,
    alt: "호텔 피트니스",
    items: [
      { eyebrow: "데일리", title: "요가·바레·필라테스" },
      { eyebrow: "1:1", title: "PT(영문 응대)" },
      { eyebrow: "그룹", title: "복싱·기능성 GX" },
      { eyebrow: "연계", title: "골프 레슨·스파 연계" },
      { eyebrow: "VIP", title: "VIP 전용 케어" },
    ],
  },
  public: {
    img: COMMUNITY_IMG.public,
    alt: "공공 체육시설",
    items: [
      { eyebrow: "시민 웰니스", title: "그룹GX·필라테스·요가" },
      { eyebrow: "시니어", title: "낙상예방·근력·인지 운동" },
      { eyebrow: "청소년", title: "복싱·체력증진" },
      { eyebrow: "여성·임산부", title: "바레·산전후 회복" },
      { eyebrow: "장애인·취약계층", title: "체육·맞춤 케어" },
    ],
  },
};

const MODELS: { title: string; rec: Tab[] }[] = [
  { title: "위탁수수료형", rec: ["public"] },
  { title: "프로그램 분리형", rec: ["corp", "hotel"] },
  { title: "임대형", rec: ["hotel"] },
];

const FAQ = [
  { q: "계약 기간은 시설 상황에 맞춰 정합니다.", a: "시설 규모와 투자 범위, 운영 모델에 따라 협의해 정합니다." },
  { q: "강사 부재 시 48시간 안에 대체 인력을 배치합니다.", a: "검증된 강사 풀에서 대체 인력을 배치해 수업 공백을 줄입니다." },
  { q: "안전사고 대비 배상책임보험에 가입합니다.", a: "시설 이용 중 발생할 수 있는 사고에 대비해 배상책임보험에 가입합니다." },
  { q: "공공기관 입찰 자격과 이행 실적은 상담 시 안내합니다.", a: "입찰 공고 조건에 맞춰 필요한 자격과 실적 자료를 상담 시 안내드립니다." },
];

function EvidenceBlock({ tab }: { tab: Tab }) {
  if (tab === "corp")
    return (
      <>
        <h2 style={{ fontSize: 26 }}>제조·물류 사업장이라면, 근골격계 예방은 복지가 아니라 관리 의무와 맞닿아 있습니다.</h2>
        <p className="cm-tx cm-gap">
          근골격계부담작업이 있는 사업장은 3년마다 유해요인조사를 해야 합니다(산업안전보건기준에 관한 규칙 제657조). 조사로 끝나지 않도록 현장 직무에 맞춘 스트레칭·근력 프로그램을 운영합니다.
        </p>
      </>
    );
  if (tab === "hotel")
    return (
      <>
        <h2 style={{ fontSize: 26 }}>여행 중에도 운동 루틴을 지키려는 투숙객이 늘고 있습니다.</h2>
        <p className="cm-sub cm-gap">글로벌 웰니스 관광 시장</p>
        <div className="cm-pair cm-gap2">
          <div>
            <span className="cm-n">
              6,550<small>억 달러</small>
            </span>
            <span className="cm-cap">(2019)</span>
          </div>
          <i aria-hidden="true">→</i>
          <div>
            <span className="cm-n">
              8,940<small>억 달러</small>
            </span>
            <span className="cm-cap">(2024)</span>
          </div>
        </div>
        <p className="cm-cap cm-gap2">Global Wellness Institute 인용(Hospitality Net)</p>
        <p className="cm-tx cm-gap">
          투숙객과 회원권 회원이 같은 시설을 쓰는 구조, 피크 시간 운영, 전문 코치 확보가 호텔 피트니스의 과제입니다.
        </p>
      </>
    );
  return (
    <>
      <h2 style={{ fontSize: 30 }}>
        위탁 운영 공공시설 <BigIn>19%</BigIn>가 운영수익을 냈고, 직영은 <BigIn>3%</BigIn>에 못 미쳤습니다.
      </h2>
      <p className="cm-cap cm-gap2">한국지방행정연구원 브리프(2017년 기준 공공시설 737개)</p>
      <p className="cm-tx cm-gap">성과 평가와 주민만족도 정기 조사가 운영자 평가의 기준이 되고 있습니다.</p>
    </>
  );
}

export default function CommunityOrg() {
  const [tab, setTab] = useState<Tab>("corp");

  // ?type=corp|hotel|public 으로 열기
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("type");
    if (t === "corp" || t === "hotel" || t === "public") setTab(t);
  }, []);

  const pick = (k: Tab) => {
    setTab(k);
    try {
      const u = new URL(window.location.href);
      u.searchParams.set("type", k);
      window.history.replaceState(null, "", u.toString());
    } catch {
      // 주소 갱신 실패는 무시
    }
  };

  const h = HERO[tab];
  const w = WORRY[tab];
  const prog = PROGRAMS[tab];
  const service = TABS.find((x) => x.key === tab)!.service;

  return (
    <Shell cta={CTA}>
      {/* 1 히어로 + 탭 */}
      <Hero
        img={COMMUNITY_IMG.hero}
        eyebrow="기업 · 호텔 · 공공기관 시설 위탁운영"
        top={
          <div className="cm-tabs" role="tablist" aria-label="시설 유형">
            {TABS.map((t) => (
              <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} className="cm-tab" onClick={() => pick(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
        }
      >
        <h1>
          {h.a}
          <br />
          <Hl>{h.hl}</Hl>
          {h.b}
        </h1>
        <p className="cm-tx cm-gap">{h.sub}</p>
        <Btn label={CTA} />
      </Hero>

      {/* 2 결정자의 고민 */}
      <Block n={2} tone="wt" wide>
        <p className="cm-ey">{w.who}</p>
        <h2>이런 고민이 있으시죠.</h2>
        <Cards num cols={3} items={w.items.map((t) => ({ title: t }))} />
      </Block>

      {/* 3 근거 */}
      <Block n={3} tone="dk" wide>
        <EvidenceBlock tab={tab} />
      </Block>

      {/* 4 이용자를 만드는 회사 */}
      <Block n={4} tone="wt" wide>
        <h2>
          시설을 관리하는 회사가 아니라,
          <br />
          <Hl>이용자를 만드는 회사</Hl>입니다.
        </h2>
        <Cards
          cols={4}
          items={[
            { eyebrow: "진단", title: "이용자 분석·현장 실사" },
            { eyebrow: "기획", title: "시간대·계층별 라인업" },
            { eyebrow: "운영", title: "검증 강사, 부재 시 48시간 내 대체" },
            { eyebrow: "교육", title: "그로우 에듀 정기 재교육" },
          ]}
        />
      </Block>

      {/* 5 프로그램 + 사진 */}
      <Block n={5} tone="dk" wide>
        <h2>이용 대상에 맞춘 프로그램</h2>
        <div className="cm-split cm-gap">
          <Cards items={prog.items} />
          <Photo src={prog.img} alt={prog.alt} />
        </div>
      </Block>

      {/* 6 운영 모델 */}
      <Block n={6} tone="wt" wide>
        <h2>운영 모델은 시설에 맞춰 고릅니다.</h2>
        <Cards
          cols={3}
          items={MODELS.map((m) => ({
            title: m.title,
            rec: m.rec.includes(tab),
            badge: m.rec.includes(tab) ? "추천" : undefined,
          }))}
        />
        <Btn label={CTA} />
      </Block>

      {/* 7 리포트 */}
      <Block n={7} tone="dk" wide>
        <h2>
          보고서 한 장이
          <br />
          <Hl>다음 예산을 지킵니다.</Hl>
        </h2>
        <ReportMock
          title="분기 운영 성과 리포트"
          rows={[
            ["월평균 이용자", "310명"],
            ["프로그램 참여", "1,420회"],
            ["만족도", "4.6 / 5"],
            ["민원 처리", "5건"],
          ]}
          bars={[{ label: "만족도", value: 4.6, text: "4.6 / 5" }]}
          barMax={5}
        />
      </Block>

      {/* 8 시스템 */}
      <Block n={8} tone="wt" wide>
        <h2>사람이 아니라 시스템으로 운영합니다.</h2>
        <Cards
          cols={2}
          items={[
            { title: "안전", lines: ["일·주·월 점검표", "응급 대응 교육", "배상책임보험"] },
            { title: "민원", lines: ["접수→처리→회신", "24시간 내 1차 회신"] },
            { title: "정산", lines: ["수입·지출 항목별 공개"] },
            { title: "인력", lines: ["자격·경력·범죄경력 확인", "분기 평가·재교육"] },
          ]}
        />
      </Block>

      {/* 9 인력 검증 */}
      <Block n={9} tone="dk">
        <h2>인력은 3단계로 검증합니다.</h2>
        <Steps items={[{ t: "자격 검증" }, { t: "실무 교육" }, { t: "정기 평가" }]} />
      </Block>

      {/* 10 사례 */}
      <Block n={10} tone="wt" wide>
        <Scenarios
          cols={3}
          items={[
            {
              title: "기업 · 제조사 현장직 800명",
              situation: "800명 규모 제조 사업장에서 현장직의 근골격계 부담 관리가 과제입니다.",
              steps: ["직무별 부담 부위 파악과 현장 실사", "교대 시간에 맞춘 스트레칭·근력 프로그램 편성", "분기별 이용 성과 보고"],
              outcome: "현장직 이용률을 분기마다 숫자로 보고하는 것을 목표로 합니다.",
            },
            {
              title: "호텔 · 5성 호텔 피트니스",
              situation: "회원권 회원과 투숙객이 같은 피트니스를 함께 이용합니다.",
              steps: ["피크 시간대 이용 동선과 예약 운영 설계", "영문 응대가 가능한 코치 배치", "회원권 재등록 관리"],
              outcome: "투숙객 응대 수준을 지키면서 회원권 회원 유지를 목표로 합니다.",
            },
            {
              title: "공공 · 구립 체육센터",
              situation: "이용률과 만족도에 대한 성과 보고를 요구받는 구립 체육센터입니다.",
              steps: ["시니어·청소년·여성 등 계층별 강좌 편성", "항목별 수입·지출 기록", "월간 성과 보고서 제출"],
              outcome: "감사와 성과 평가에 쓸 기록을 매달 남기는 것을 목표로 합니다.",
            },
          ]}
        />
      </Block>

      {/* 11 FAQ */}
      <Block n={11} tone="dk">
        <h2>자주 묻는 내용</h2>
        <Faq items={FAQ} />
      </Block>

      {/* 12 진행 단계 */}
      <Block n={12} tone="wt">
        <h2>진행은 6단계입니다.</h2>
        <Steps
          items={[{ t: "문의 접수" }, { t: "현장 실사" }, { t: "운영 제안서" }, { t: "계약" }, { t: "운영 개시" }, { t: "정기 보고" }]}
        />
        <p className="cm-tx cm-gap">
          평균 <BigIn>30~60일</BigIn> 안에 운영 개시
        </p>
      </Block>

      {/* 13 폼 */}
      <FormBlock
        n={13}
        head={
          <>
            시설 정보를 남겨 주시면
            <br />
            <Hl>제안서로 답합니다.</Hl>
          </>
        }
      >
        <FacilityApplyForm variant="org" defaultService={service} cta={CTA} />
      </FormBlock>
    </Shell>
  );
}
