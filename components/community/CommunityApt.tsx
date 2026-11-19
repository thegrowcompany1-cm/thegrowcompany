// ① 아파트 커뮤니티 위탁 — /consulting/community (명세: docs/community-landing-spec.md, 13블록)
import Shell from "./Shell";
import FacilityApplyForm from "./FacilityApplyForm";
import { Block, Bubble, Btn, Cards, Checks, Faq, FormBlock, Hero, Hl, Ph, Photo, ReportMock, Steps } from "./parts";
import { COMMUNITY_IMG, SVC_APT } from "@/lib/community";

const CTA = "단지 운영 진단 받아보기";

const FAQ = [
  { q: "입대의 임기가 바뀌어도 계약은 유지됩니다.", a: "계약 당사자는 입대의·관리주체이며, 신임 입대의에도 같은 리포트로 보고합니다." },
  { q: "관리비 부과 방식은 단지 규약에 맞춥니다.", a: "전 세대 부담, 이용자 부담, 혼합형 중 단지 결정에 맞춰 정산합니다." },
  { q: "입찰 서류와 제안서를 함께 준비합니다.", a: "운영 계획, 인력 구성, 견적을 입찰 일정에 맞춰 제출합니다." },
  { q: "신축 단지는 입주 전부터 준비합니다.", a: "입주 시기에 맞춰 시설 세팅, 규정, 프로그램을 미리 준비합니다." },
];

export default function CommunityApt() {
  return (
    <Shell cta={CTA}>
      {/* 1 히어로 */}
      <Hero img={COMMUNITY_IMG.hero} eyebrow="아파트 커뮤니티 시설 위탁운영">
        <h1>
          커뮤니티는 비용이 아니라,
          <br />
          <Hl>운영으로 유지되는 시설</Hl>입니다.
        </h1>
        <p className="cm-tx cm-gap">
          관리비를 더 걷자고 말해야 하는 순간이 오기 전에. 헬스장·필라테스를 직접 운영해 온 팀이 프로그램, 인력, 수지까지 함께 맡습니다.
        </p>
        <div className="cm-stats">
          <div className="cm-st">
            <b>10년+</b>
            <span>피트니스 현장 운영</span>
          </div>
          <div className="cm-st">
            <b>52개</b>
            <span>센터 총괄 운영 경험</span>
          </div>
          <div className="cm-st">
            <b>무상</b>
            <span>현장 실사·제안서</span>
          </div>
        </div>
        <Btn label={CTA} />
      </Hero>

      {/* 2 관리비 */}
      <Block n={2} tone="wt">
        <h2>
          시설은 그대로인데,
          <br />
          <Hl>관리비만 오릅니다.</Hl>
        </h2>
        <div className="cm-bars" role="img" aria-label="공동주택 평균 관리비 2021년 제곱미터당 2,442원, 2025년 3,033원">
          <div className="cm-bc">
            <b>2,442원</b>
            <i style={{ height: 130 }} />
            <span>2021년</span>
          </div>
          <div className="cm-bc hi">
            <b>3,033원</b>
            <i style={{ height: 162 }} />
            <span>2025년</span>
          </div>
        </div>
        <p className="cm-cap cm-gap2">㎡당 월 관리비</p>
        <div className="cm-chip">84㎡ 기준 월 약 20.5만 → 25.5만원, +24%</div>
        <p className="cm-cap cm-gap2">공동주택 평균 관리비 (한국경제, 2026.6 보도 인용)</p>
      </Block>

      {/* 3 회의실 말풍선 */}
      <Block n={3} tone="dk">
        <h2>회의실에서 매달 듣는 말</h2>
        <div className="cm-bubs">
          <Bubble side="l">&ldquo;안 쓰는 집도 왜 똑같이 내요&rdquo;</Bubble>
          <Bubble side="r">&ldquo;집값 보고 산 시설인데 왜 줄여요&rdquo;</Bubble>
          <Bubble side="l">&ldquo;이번 달 관리비 또 올랐던데요&rdquo;</Bubble>
        </div>
        <p className="cm-tx cm-gap">이용 세대와 비이용 세대의 부담 논쟁은, 결국 입대의 테이블로 옵니다.</p>
      </Block>

      {/* 4 숫자 없이 결정 */}
      <Block n={4} tone="wt">
        <h2>
          입대의는
          <br />
          <Hl>숫자 없이 결정해야 합니다.</Hl>
        </h2>
        <p className="cm-tx cm-gap">
          커뮤니티 이용료 부과 기준은 입주자대표회의 과반수 의결로 정합니다. 그런데 어떻게 나눠야 하는지에 대한 구체적 기준은 없습니다. 그래서 같은 안건이 회의마다 반복됩니다.
        </p>
        <div className="cm-key cm-gap">전문가들이 공통으로 꼽는 해법은 하나입니다. 운영 데이터를 모으고, 공개하는 것.</div>
      </Block>

      {/* 5 사례 인용 */}
      <Block n={5} tone="dk">
        <div className="cm-quote">
          서울의 한 900세대 신축 단지는 한 달 수입 약 6,651만원, 지출 8,000만원 이상으로 1,715만원 적자가 났고, 운영사 교체가 겹치며 헬스장과 골프연습장이 약 3주간 멈췄습니다.
          <small>아시아경제, 2026.8</small>
        </div>
        <h2 className="cm-gap">
          적자와 공백,
          <br />
          <Hl>둘 다 입대의 책임이 됩니다.</Hl>
        </h2>
      </Block>

      {/* 6 운영사 비교 */}
      <Block n={6} tone="wt">
        <h2>
          필요한 건 관리인이 아니라,
          <br />
          <Hl>수지를 설계하는 운영사</Hl>입니다.
        </h2>
        <table className="cm-tb">
          <thead>
            <tr>
              <th>구분</th>
              <th>인력 파견형 운영사</th>
              <th>더그로우</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">운영 목표</th>
              <td>시설 관리·자리 지키기</td>
              <td>이용률과 수지를 함께 관리</td>
            </tr>
            <tr>
              <th scope="row">프로그램</th>
              <td>강사가 할 수 있는 수업</td>
              <td>입주민 연령 분포에 맞춰 설계</td>
            </tr>
            <tr>
              <th scope="row">인력</th>
              <td>개인 강사 의존</td>
              <td>검증 강사 풀·그로우 에듀 재교육</td>
            </tr>
            <tr>
              <th scope="row">보고</th>
              <td>요청할 때만</td>
              <td>매월 수지·이용·민원 리포트</td>
            </tr>
          </tbody>
        </table>
        <p className="cm-tx cm-gap">더그로우는 헬스장·필라테스 매장의 등록과 재등록을 직접 만들어 온 회사입니다.</p>
      </Block>

      {/* 7 단지 상황 */}
      <Block n={7} tone="dk">
        <h2>단지 상황부터 고르세요.</h2>
        <Cards
          items={[
            {
              title: "신축·입주 예정 단지",
              lines: ["입주 전 이용량·운영비 시뮬레이션", "시설 세팅·이용 규정·요금 체계", "조합·입대의 양쪽에 같은 자료로 보고"],
            },
            {
              title: "운영사 교체 검토 단지",
              lines: ["현 운영 수지·민원·이용률 무상 진단", "강사 승계와 회원 데이터 이관", "시설 공백을 최소화한 전환 일정"],
            },
          ]}
        />
      </Block>

      {/* 8 요금 구조 */}
      <Block n={8} tone="wt">
        <h2>
          요금 구조도
          <br />
          <Hl>단지에 맞게 설계합니다.</Hl>
        </h2>
        <Cards
          num
          items={[{ title: "전 세대 공동 부담형" }, { title: "무료 횟수 + 초과 이용료형" }, { title: "기본 무료 + 유료 강좌형" }]}
        />
        <p className="cm-cap cm-gap">
          실제로 무료 이용 횟수를 정하고 초과 시 회당 1,000원을 받거나, 일부 강습을 외부에 개방해 관리비를 줄이는 단지들이 있습니다.
        </p>
        <Btn label={CTA} />
      </Block>

      {/* 9 단지 가치 */}
      <Block n={9} tone="dk">
        <h2>
          우리 단지에 이런 시설이 있어서 좋다,
          <br />
          <Hl>그 말이 단지 가치가 됩니다.</Hl>
        </h2>
        <ul className="cm-ages">
          <li>
            <b>시니어</b>
            <span>건강체조·낙상예방·근력</span>
          </li>
          <li>
            <b>주부</b>
            <span>바레·필라테스·요가</span>
          </li>
          <li>
            <b>키즈</b>
            <span>체조·스포츠 활동</span>
          </li>
          <li>
            <b>청장년</b>
            <span>복싱·그룹GX·PT</span>
          </li>
          <li>
            <b>가족</b>
            <span>골프 클래스·단지 이벤트</span>
          </li>
        </ul>
        <Photo src={COMMUNITY_IMG.apt} alt="아파트 커뮤니티 시설" />
      </Block>

      {/* 10 리포트 */}
      <Block n={10} tone="wt">
        <h2>
          입대의 회의에
          <br />
          <Hl>그대로 가져가는 한 장</Hl>
        </h2>
        <ReportMock
          title="○○단지 커뮤니티 월간 리포트"
          rows={[
            ["월 이용자", "[ ]명"],
            ["프로그램 수입", "[ ]원"],
            ["운영 지출", "[ ]원"],
            ["민원 처리", "[ ]건"],
          ]}
        />
        <Checks items={["월간 수지·이용 리포트 발송", "민원 접수→처리→회신 기록", "분기별 운영 성과 미팅"]} />
      </Block>

      {/* 11 전환 */}
      <Block n={11} tone="dk">
        <h2>
          문을 닫지 않고 바꾸는 것까지
          <br />
          <Hl>운영사의 일입니다.</Hl>
        </h2>
        <Steps items={[{ t: "계약 종료 전 실사" }, { t: "강사 승계 면담" }, { t: "회원 데이터 이관" }, { t: "공백 최소화 전환" }]} />
      </Block>

      {/* 12 사례 + FAQ */}
      <Block n={12} tone="wt">
        <Ph label="[운영 단지 사례]" />
        <Ph label="[입대의·관리소장 후기]" />
        <Faq items={FAQ} />
      </Block>

      {/* 13 폼 */}
      <FormBlock
        n={13}
        head={
          <>
            단지 정보를 남겨 주시면
            <br />
            <Hl>제안서로 답합니다.</Hl>
          </>
        }
        sub="현장 실사와 운영 제안서는 무상입니다."
      >
        <FacilityApplyForm variant="apt" defaultService={SVC_APT} cta={CTA} />
      </FormBlock>
    </Shell>
  );
}
