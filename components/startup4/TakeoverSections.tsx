// 인수창업 컨설팅 본문 — 핵심 메시지: 인수하기 전에 검토해야 할 숫자가 있습니다
//  · 사용자 노출 문구에 물음표·영문 라벨·"무료 상담" 없음, 창업 수치는 "250회"만
//  · 시뮬레이션 수치는 계산 구조를 설명하는 가상의 예시이며 실제 사례·성과가 아니다 (화면에 명시)
import GoForm from "./GoForm";
import VideoReview from "./VideoReview";
import { Faq, SectionHead, Steps, Table } from "./Parts";

const p = "stk";
export const TAKEOVER_CTA = "검토 중인 매물 상담받기";

const RISKS = [
  { t: "권리금", d: "권리금에 시설, 회원, 입지 가치가 각각 얼마나 들어 있는지 나눠 보지 않으면 협상할 근거가 없습니다. 얼마를 주고 무엇을 사는 것인지부터 분리해야 합니다." },
  { t: "남은 회원권", d: "이미 결제된 회원권은 인수 후 대표님이 수업으로 갚아야 하는 몫입니다. 매출처럼 보였던 숫자가 인수 후에는 현금 없이 수업만 남는 부담이 될 수 있습니다." },
  { t: "고정비", d: "임대료, 인건비, 렌탈·리스, 관리비는 회원이 줄어도 그대로 나갑니다. 매출이 아니라 고정비를 먼저 보아야 버틸 수 있는 구조인지 알 수 있습니다." },
  { t: "노후 시설", d: "교체가 필요한 기구, 렌탈·리스 승계 조건, 원상복구 조건은 인수가에 들어 있지 않고 인수 후 비용으로 돌아옵니다." },
  { t: "회원 이탈", d: "주인이 바뀌면 강사와 직원이 남을지, 기존 회원이 재등록할지가 흔들립니다. 인수 직후 매출은 이 두 가지에 크게 좌우됩니다." },
];

const AREAS = [
  ["매출 검증", "결제 내역, 회원권 잔여 현황, 월별 신규·재등록 내역", "보여준 매출 중 인수 후에도 이어질 몫"],
  ["지출 분석", "임대료, 인건비, 렌탈·리스, 관리비, 그 밖의 고정 지출", "매출이 줄어도 나가는 돈의 크기"],
  ["인수 조건", "권리금, 보증금, 임대차 승계, 원상복구 조건", "권리금의 근거와 협상 포인트"],
  ["운영 리스크", "기구·시설 상태, 직원·강사 구성, 회원 이탈 가능성", "인수 직후 무너질 수 있는 지점"],
  ["개선 가능성", "가격 구조, 상담 구조, 회원 관리 현황", "인수 후 매출을 회복할 여지와 순서"],
];

const STEPS = [
  { t: "상담 접수", d: "검토 중인 매물의 지역, 업종, 지금 진행 단계를 먼저 듣습니다." },
  { t: "자료 확인", d: "준비되는 자료부터 받습니다. 결제 내역, 임대차 계약서, 지출 내역, 회원권 잔여 현황이 있으면 가장 정확합니다." },
  { t: "숫자 분석", d: "실제 매출, 선결제 비중, 고정비, 권리금 회수 구조를 다시 계산합니다." },
  { t: "현장 확인", d: "시설·기구 상태와 운영 상황은 필요한 경우 현장에서 확인합니다." },
  { t: "계약 전 판단", d: "들어가도 되는지, 조건을 바꾸면 되는지, 멈춰야 하는지 의견을 드립니다." },
];

const FAQ = [
  { q: "자료가 부족한 매물도 상담할 수 있습니다", a: "가능합니다. 먼저 매물 개요와 양도자가 제시한 조건을 알려 주세요. 어떤 자료가 더 필요한지부터 함께 정리합니다. 자료를 요청해도 받기 어려운 경우라면, 그 자체도 판단의 재료가 됩니다." },
  { q: "권리금이 적정한지는 이렇게 봅니다", a: "권리금을 시설, 회원, 입지 가치로 나누고 각각이 인수 후 실제 수익으로 이어지는지 확인합니다. 주변 시세를 비교하는 데서 끝나지 않고, 이 매장의 숫자로 회수 가능한지를 봅니다." },
  { q: "현장에 직접 와서 확인하는지 궁금합니다", a: "시설·기구 상태와 운영 상황은 현장에서 보는 것이 가장 정확합니다. 현장 확인이 필요한지와 범위는 매물 상황에 맞춰 상담에서 안내드립니다." },
  { q: "인수를 아직 결정하지 못했어도 상담할 수 있습니다", a: "계약 전이라면 언제든 가능합니다. 오히려 계약금을 넣기 전에 숫자를 확인하는 것이 가장 효과적입니다." },
  { q: "계약서 검토도 함께 해 주는지 궁금합니다", a: "임대차와 계약 승계에서 확인해야 할 항목은 짚어 드립니다. 다만 계약서의 법률 검토와 세무 판단은 변호사·세무사 확인을 함께 권합니다." },
  { q: "인수 이후에도 도움을 받을 수 있습니다", a: "필요하면 위탁운영과 운영 교육으로 이어서 도와드립니다." },
];

export const TAKEOVER_PREP = [
  { title: "상담은 이렇게 진행됩니다", items: ["신청서를 남겨 주세요", "신청 후 24시간 이내 담당자가 연락드립니다", "매물 개요를 듣고 필요한 자료를 안내합니다"] },
  { title: "준비하면 좋은 정보", items: ["매물의 위치와 업종", "양도자가 제시한 매출, 권리금, 보증금", "임대차 조건과 회원권 잔여 현황이 있다면 함께", "자료가 없어도 신청할 수 있습니다"] },
  { title: "상담 후 확인할 수 있는 범위", items: ["전달해 주신 자료 기준의 검토 방향", "추가로 필요한 자료와 확인할 항목", "현장 확인이 필요한지 여부"] },
];

export default function TakeoverSections() {
  return (
    <>
      <section className="stk-hero" data-track-section="hero">
        <div className="stk-wrap stk-hero-grid">
          <div>
            <span className="stk-kicker">헬스장·PT샵·필라테스 인수창업</span>
            <h1 className="stk-h1">
              <span>인수하기 전에</span>
              <span>
                <em>검토해야 할 숫자</em>가
              </span>
              <span>있습니다</span>
            </h1>
            <p className="stk-sub">
              양도자가 보여준 매출과 인수 후 실제로 남는 수익은 다를 수 있습니다. 계약서에 도장을 찍기 전에 그 차이부터 확인합니다.
            </p>
            <div className="stk-cta-row">
              <GoForm p={p} cta={TAKEOVER_CTA} product="인수창업" />
              <a className="stk-ghost" href="#stk-sim">
                수익성 분석 예시 보기
              </a>
            </div>
          </div>
          <div className="stk-viz" aria-label="개념도">
            <p className="stk-viz-t">인수 검토의 출발점</p>
            <div className="stk-vrow">
              <div className="stk-vlab">
                <span>양도자가 말한 월 매출</span>
              </div>
              <div className="stk-vtrack">
                <span className="stk-vfill g" style={{ ["--w" as string]: "100%" }} />
              </div>
            </div>
            <div className="stk-vrow">
              <div className="stk-vlab">
                <span>인수 후 실제로 남는 돈</span>
              </div>
              <div className="stk-vtrack">
                <span className="stk-vfill a" style={{ ["--w" as string]: "34%" }} />
              </div>
            </div>
            <p className="stk-vcap">이 차이를 계약 전에 확인합니다. 개념을 보여 주는 그림이며 실제 수치가 아닙니다.</p>
          </div>
        </div>
      </section>

      <section className="stk-sec" data-track-section="risk">
        <div className="stk-wrap">
          <SectionHead
            p={p}
            no="01"
            label="인수 검토의 핵심 위험"
            title="매물 소개서에는 잘 나오지 않는 [다섯 가지]가 있습니다"
            lead="인수는 빈 상가에서 시작하는 창업보다 빠릅니다. 하지만 숫자를 잘못 보면 남의 부담까지 함께 인수하게 됩니다."
          />
          <div className="stk-rows">
            {RISKS.map((r, i) => (
              <div key={r.t} className="stk-row stk-rv">
                <span className="stk-rn">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="stk-rt">{r.t}</h3>
                <p className="stk-rd">{r.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="stk-sec alt" id="stk-sim" data-track-section="simulation">
        <div className="stk-wrap">
          <SectionHead
            p={p}
            no="02"
            label="수익성 시뮬레이션"
            title="표시된 매출이 같아도 인수 후 남는 돈은 [다릅니다]"
            lead="아래는 계산 구조를 설명하기 위한 분석 예시입니다. 가상의 매장 수치이며 실제 사례나 성과가 아닙니다."
          />
          <div className="stk-sims">
            <div className="stk-sim">
              <div className="stk-sim-h">
                <span className="stk-sim-n">매물 1</span>
                <span className="stk-sim-s">양도자가 말한 월 매출 1,000만원</span>
              </div>
              <div className="stk-stack" aria-hidden="true">
                <span className="stk-seg r" style={{ ["--w" as string]: "20%" }} />
                <span className="stk-seg a" style={{ ["--w" as string]: "45%" }} />
                <span className="stk-seg g" style={{ ["--w" as string]: "35%" }} />
              </div>
              <ul className="stk-leg">
                <li>
                  <i className="stk-dot r" />
                  인수 후 현금이 들어오지 않는 선결제 소진분<b>200만원</b>
                </li>
                <li>
                  <i className="stk-dot a" />
                  월 고정비<b>450만원</b>
                </li>
                <li>
                  <i className="stk-dot g" />
                  월 남는 돈<b>350만원</b>
                </li>
              </ul>
              <div className="stk-res">
                <small>권리금 3,000만원 회수 기간</small>
                <strong>약 9개월</strong>
              </div>
            </div>
            <div className="stk-sim">
              <div className="stk-sim-h">
                <span className="stk-sim-n">매물 2</span>
                <span className="stk-sim-s">양도자가 말한 월 매출 1,000만원</span>
              </div>
              <div className="stk-stack" aria-hidden="true">
                <span className="stk-seg r" style={{ ["--w" as string]: "40%" }} />
                <span className="stk-seg a" style={{ ["--w" as string]: "60%" }} />
                <span className="stk-seg g" style={{ ["--w" as string]: "0%" }} />
              </div>
              <ul className="stk-leg">
                <li>
                  <i className="stk-dot r" />
                  인수 후 현금이 들어오지 않는 선결제 소진분<b>400만원</b>
                </li>
                <li>
                  <i className="stk-dot a" />
                  월 고정비<b>600만원</b>
                </li>
                <li>
                  <i className="stk-dot g" />
                  월 남는 돈<b>0원</b>
                </li>
              </ul>
              <div className="stk-res">
                <small>권리금 3,000만원 회수 기간</small>
                <strong className="bad">회수할 수 없음</strong>
              </div>
            </div>
          </div>
          <p className="stk-formula stk-rv">
            월 매출 − 선결제 소진분 − 월 고정비 = 월 남는 돈. 권리금 ÷ 월 남는 돈 = 회수 기간. 더그로우는 실제 매물의 결제 내역과 지출 자료로 이 구조를 다시 계산합니다.
          </p>
        </div>
      </section>

      <section className="stk-sec" data-track-section="areas">
        <div className="stk-wrap">
          <SectionHead
            p={p}
            no="03"
            label="더그로우의 검토 영역"
            title="다섯 가지 영역을 [숫자로 다시] 봅니다"
          />
          <Table
            p={p}
            cols="0.7fr 1.3fr 1fr"
            head={["검토 영역", "확인하는 자료", "판단하는 것"]}
            hlCol={2}
            rows={AREAS}
          />
        </div>
      </section>

      <section className="stk-sec alt" data-track-section="process">
        <div className="stk-wrap">
          <SectionHead
            p={p}
            no="04"
            label="실제 분석 프로세스"
            title="자료 확인에서 [계약 전 판단]까지"
            lead="준비되는 자료부터 시작합니다. 자료가 모두 갖춰지지 않아도 상담은 시작할 수 있습니다."
          />
          <Steps p={p} items={STEPS} />
        </div>
      </section>

      <section className="stk-sec" data-track-section="proof">
        <div className="stk-wrap stk-proof">
          <div className="stk-rv">
            <div className="stk-eyebrow">
              <b>05</b>더그로우의 운영·창업 경험
            </div>
            <p className="stk-big">
              <em>헬스장·필라테스</em>창업 250회
            </p>
            <p className="stk-ptext">
              운영이 어려운 센터에 직접 들어가 운영해 온 위탁운영 경험이 있습니다. 그래서 인수한 뒤 어디서 무너지는지를 먼저 압니다.
            </p>
            <p className="stk-ptext">인수 이후 필요하면 위탁운영과 운영 교육으로 이어서 도와드립니다.</p>
            <blockquote className="stk-quote">
              <p>운영 시스템을 만들어주셔서 지금은 제가 매장에 없어도 잘 돌아갑니다. 진짜 사업하는 느낌이에요.</p>
              <cite>박○○ 대표님 · 필라테스 · 인천 송도 (더그로우 창업 후기)</cite>
            </blockquote>
          </div>
          <div className="stk-rv">
            <VideoReview
              p={p}
              src="/reviews/review-2.mp4"
              poster="/reviews/review-2.jpg"
              caption="의심을 확인으로 바꾼 PT 스튜디오 창업"
              sub="더그로우와 함께한 창업 후기 영상"
            />
          </div>
        </div>
      </section>

      <section className="stk-sec alt" data-track-section="results">
        <div className="stk-wrap">
          <SectionHead
            p={p}
            no="06"
            label="컨설팅을 통해 확인할 수 있는 결과"
            title="검토의 결론은 [세 가지 중 하나]입니다"
          />
          <div className="stk-trio">
            <div className="stk-tri stk-rv" style={{ ["--c" as string]: "#3ba94a" }}>
              <h3>들어가도 되는지</h3>
              <p>숫자가 맞고 위험을 관리할 수 있는 매물이라면 그 근거와 함께 말씀드립니다.</p>
            </div>
            <div className="stk-tri stk-rv" style={{ ["--c" as string]: "#c9962f" }}>
              <h3>조건을 바꾸면 되는지</h3>
              <p>권리금이나 승계 조건을 조정하면 가능한 매물이라면 협상 포인트를 정리합니다.</p>
            </div>
            <div className="stk-tri stk-rv" style={{ ["--c" as string]: "#c4564d" }}>
              <h3>멈춰야 하는지</h3>
              <p>숫자로 설명되지 않는 매물이라면 멈추는 것이 맞다는 의견도 드립니다.</p>
            </div>
          </div>
          <ul className="stk-list stk-rv">
            <li>권리금 협상 포인트</li>
            <li>인수 직후 운영 계획</li>
          </ul>
          <p className="stk-note">
            상담은 전달해 주신 자료의 범위 안에서 이루어집니다. 계약서의 법률 검토와 세무 판단은 변호사·세무사 확인을 함께 권합니다.
          </p>
        </div>
      </section>

      <section className="stk-sec" data-track-section="faq">
        <div className="stk-wrap">
          <SectionHead p={p} no="07" label="자주 묻는 질문" title="상담 전에 많이 궁금해하시는 [내용]" />
          <Faq p={p} items={FAQ} />
        </div>
      </section>
    </>
  );
}
