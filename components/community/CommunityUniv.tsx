// ③ 대학교 체육시설 위탁 — /consulting/community3 (명세: docs/community-landing-spec.md, 13블록)
import Shell from "./Shell";
import FacilityApplyForm from "./FacilityApplyForm";
import { Block, Btn, Cards, Faq, FormBlock, Hero, Hl, ReportMock, Scenarios, Steps } from "./parts";
import { COMMUNITY_IMG, SVC_UNIV } from "@/lib/community";

const CTA = "캠퍼스 시설 진단 받아보기";

// 1~12월 — 3~6월·9~12월 진하게, 1~2월·7~8월 옅게
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const ON = new Set([3, 4, 5, 6, 9, 10, 11, 12]);

const FAQ = [
  { q: "학기 시작에 맞춰 운영을 개시합니다.", a: "학사 일정에 맞춰 시설 준비와 인력 배치를 마치고 학기 시작과 함께 운영을 개시합니다." },
  { q: "지역 주민 개방 범위는 학교가 정합니다.", a: "개방 시간대와 대상은 학교 방침에 맞춰 정하고, 운영표에 반영합니다." },
  { q: "시설 리뉴얼 비용 분담은 계약 구조에 따라 정합니다.", a: "임대형, 위탁형 등 계약 구조에 따라 투자 범위와 비용 분담을 협의해 정합니다." },
  { q: "생활관(기숙사) 피트니스만 따로 맡을 수 있습니다.", a: "체육관과 별개로 생활관 피트니스만 위탁받아 운영할 수 있습니다." },
];

export default function CommunityUniv() {
  return (
    <Shell cta={CTA}>
      {/* 1 히어로 */}
      <Hero img={COMMUNITY_IMG.hero} eyebrow="대학교 체육시설 위탁운영">
        <h1>
          학기 중엔 붐비고,
          <br />
          <Hl>방학엔 비는</Hl> 캠퍼스 체육시설.
        </h1>
        <p className="cm-tx cm-gap">
          학생, 교직원, 지역 주민까지 한 시설에서 운영합니다. 리뉴얼부터 프로그램, 운영까지 한 팀이 맡아 학교 예산 부담을 줄입니다.
        </p>
        <Btn label={CTA} />
      </Hero>

      {/* 2 캘린더 */}
      <Block n={2} tone="wt" wide>
        <h2>
          1년 중 넉 달은
          <br />
          <Hl>시설이 쉬고 있습니다.</Hl>
        </h2>
        <div className="cm-cal" role="img" aria-label="3~6월과 9~12월은 학기 중, 1~2월과 7~8월은 방학">
          {MONTHS.map((m) => (
            <div key={m} className={ON.has(m) ? "on" : undefined}>
              {m}월
            </div>
          ))}
        </div>
        <p className="cm-cap cm-gap2">진한 달은 학기 중, 옅은 달은 방학</p>
      </Block>

      {/* 3 운영 부담 */}
      <Block n={3} tone="dk" wide>
        <h2>
          시설은 학교 것인데,
          <br />
          <Hl>운영 부담도 전부 학교 몫입니다.</Hl>
        </h2>
        <Cards
          cols={4}
          items={[
            { title: "방학 공실" },
            { title: "노후 시설·장비 교체 예산" },
            { title: "수익이 안 나면 운영사 중도 이탈" },
            { title: "가격·시간·혼잡도 학생 민원" },
          ]}
        />
      </Block>

      {/* 4 이용자 3분류 */}
      <Block n={4} tone="wt" wide>
        <h2>이용자는 세 갈래입니다.</h2>
        <Cards
          cols={3}
          items={[
            { title: "학생", lines: ["학기권·시험기간 단기권", "그룹 클래스", "동아리·운동부 지원"] },
            { title: "교직원", lines: ["점심 스트레칭·근골격계 케어", "퇴근 후 PT·필라테스"] },
            { title: "지역 주민", lines: ["시간대 분리 개방", "시니어·키즈 강좌", "방학 단기 프로그램"] },
          ]}
        />
      </Block>

      {/* 5 학기·방학 운영표 */}
      <Block n={5} tone="dk" wide>
        <h2>학기와 방학에 맞춘 운영표</h2>
        <Cards
          cols={4}
          items={[
            { eyebrow: "3~6월", title: "1학기" },
            { eyebrow: "7~8월", title: "여름방학", lines: ["주민 개방", "단기 집중 강좌"] },
            { eyebrow: "9~12월", title: "2학기", lines: ["학기권 재등록", "시험기간 조정"] },
            { eyebrow: "1~2월", title: "겨울방학", lines: ["시설 점검", "장비 교체", "주민 강좌"] },
          ]}
        />
      </Block>

      {/* 6 임대형 구조 */}
      <Block n={6} tone="wt" wide>
        <h2>
          운영사가
          <br />
          <Hl>시설 투자까지 <span className="cm-nw">책임지는 구조</span></Hl>
        </h2>
        <div className="cm-quote cm-gap">
          대학 시설 위탁은 운영사가 임대료를 내고 인테리어·장비를 직접 갖추는 임대형이 많습니다. 그래서 운영 능력과 시설 투자 능력을 함께 봅니다.
        </div>
        <Btn label={CTA} />
      </Block>

      {/* 7 리뉴얼부터 운영까지 */}
      <Block n={7} tone="dk">
        <h2>
          리뉴얼부터 운영까지,
          <br />
          <Hl>한 회사가</Hl> 책임집니다.
        </h2>
        <Steps
          items={[
            { t: "현장 실사·이용자 분석" },
            { t: "리뉴얼·장비 구성안", d: "그로우인테리어" },
            { t: "요금·프로그램·인력 계획" },
            { t: "월간 보고·학기별 성과 미팅" },
          ]}
        />
        <p className="cm-tx cm-gap">
          피트니스 전문 인테리어 계열사 그로우인테리어와 함께 제안합니다. 시공사와 운영사가 따로일 때 생기는 책임 공백이 없습니다.
        </p>
      </Block>

      {/* 8 평가 항목 */}
      <Block n={8} tone="wt" wide>
        <h2>
          공고의 평가 항목마다
          <br />
          <Hl>준비된 답</Hl>이 있습니다.
        </h2>
        <div className="cm-tbw">
        <table className="cm-tb">
          <thead>
            <tr>
              <th>평가 항목</th>
              <th colSpan={2}>더그로우 제안</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">운영 계획·인력 구성</th>
              <td colSpan={2}>학사 일정 맞춤 운영표, 검증 강사 풀</td>
            </tr>
            <tr>
              <th scope="row">시설·투자 계획</th>
              <td colSpan={2}>그로우인테리어 리뉴얼·장비 구성안</td>
            </tr>
            <tr>
              <th scope="row">이용 요금·고객 서비스</th>
              <td colSpan={2}>학생·교직원·주민 요금 체계, 민원 처리 절차</td>
            </tr>
            <tr>
              <th scope="row">업체 실적</th>
              <td colSpan={2}>그로우 계열 창업·운영 경험: 창업 250회 · 52개 센터 총괄 운영</td>
            </tr>
          </tbody>
        </table>
        </div>
        <p className="cm-cap cm-gap2">대학 시설 위탁운영자 모집 공고에서 흔히 쓰는 평가 항목 기준</p>
      </Block>

      {/* 9 요금 체계 예시 */}
      <Block n={9} tone="dk" wide>
        <h2>요금 체계 예시</h2>
        <Cards
          cols={3}
          items={[
            { title: "학기권", note: "예시 · 학교와 협의", price: "9만원" },
            { title: "시험기간 단기권", note: "예시 · 학교와 협의", price: "2만원" },
            { title: "주민 시간대 이용권", note: "예시 · 학교와 협의", price: "월 5만원" },
          ]}
        />
      </Block>

      {/* 10 리포트 */}
      <Block n={10} tone="wt" wide>
        <h2>
          학교에 보고하는
          <br />
          <Hl>월간 리포트</Hl>
        </h2>
        <ReportMock
          title="캠퍼스 체육시설 월간 리포트"
          rows={[
            ["이용자(학생)", "1,120명"],
            ["이용자(교직원)", "140명"],
            ["이용자(주민)", "260명"],
            ["수입", "2,050만원"],
            ["민원", "7건"],
          ]}
          bars={[
            { label: "학생", value: 1120, text: "1,120명" },
            { label: "교직원", value: 140, text: "140명", dark: true },
            { label: "주민", value: 260, text: "260명", dark: true },
          ]}
        />
      </Block>

      {/* 11 사례 */}
      <Block n={11} tone="dk">
        <Scenarios
          items={[
            {
              title: "사립대 · 재학생 1만 명",
              situation: "재학생 1만 명 규모 사립대의 체육시설이 방학마다 비어 있습니다.",
              steps: ["현장 실사와 리뉴얼·장비 구성안(그로우인테리어)", "학기권·시험기간권 요금 설계", "방학 주민 개방 프로그램 편성"],
              outcome: "방학 공실을 줄이고 학교의 예산 부담을 낮추는 것을 목표로 합니다.",
            },
          ]}
        />
      </Block>

      {/* 12 FAQ */}
      <Block n={12} tone="wt">
        <h2>자주 묻는 내용</h2>
        <Faq items={FAQ} />
      </Block>

      {/* 13 폼 */}
      <FormBlock
        n={13}
        head={
          <>
            캠퍼스 정보를 남겨 주시면
            <br />
            <Hl>제안서로 답합니다.</Hl>
          </>
        }
      >
        <FacilityApplyForm variant="univ" defaultService={SVC_UNIV} cta={CTA} />
      </FormBlock>
    </Shell>
  );
}
