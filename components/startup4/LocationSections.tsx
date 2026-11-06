// 입지·상권 분석 컨설팅 본문 — 핵심 메시지: 창업할 수 있는 자리와 수익을 낼 수 있는 자리는 다릅니다
//  · 사용자 노출 문구에 물음표·영문 라벨·"무료 상담" 없음, 창업 수치는 "250회"만
//  · 후보지 비교표는 비교 방식을 설명하는 가상의 예시이며 실제 분석 결과가 아니다 (화면에 명시)
//  · 지도·분석 캡처는 출처와 사용 권한을 확인할 수 없어 쓰지 않는다
import GoForm from "./GoForm";
import VideoReview from "./VideoReview";
import { Faq, SectionHead, Steps, Table } from "./Parts";

const p = "slc";
export const LOCATION_CTA = "내 창업 후보지 분석 상담받기";

const MYTHS = [
  { w: "유동인구가 많으면 회원도 많다", f: "걸어 다니는 사람이 아니라 매달 결제할 사람이 근처에 살거나 일하는지가 먼저입니다. 운동은 지나가다 등록하기보다 생활 동선 안에서 정해집니다." },
  { w: "역세권이라 접근성이 좋다", f: "역과 가까운 것보다 퇴근 동선 안에 있는지, 건물 층수와 엘리베이터 이용이 편한지가 등록에 영향을 줍니다." },
  { w: "월세가 싸서 남는다", f: "월세 숫자만이 아니라 이 평수에서 받을 수 있는 회원 수, 보증금, 무상 임대 기간, 원상복구 비용까지 합친 손익으로 봐야 합니다." },
  { w: "주변에 센터가 없으니 기회다", f: "센터가 없는 이유가 수요가 없어서일 수 있습니다. 경쟁이 없는 것과 수요가 있는 것은 다릅니다." },
];

const VARS = [
  ["배후 수요", "거주·직장 인구 전반, 연령 폭이 넓은 수요", "젊은 여성 거주·직장 인구의 밀도", "소득이 있는 직장인과 개인 관리 수요"],
  ["고객 특성", "가격 대비 시설 규모를 비교해 선택", "강사, 수업 품질, 후기를 보고 선택", "담당 트레이너와 결과를 보고 선택"],
  ["경쟁 센터", "반경 안 대형 센터와의 가격·시설 비교", "소규모 스튜디오가 얼마나 몰려 있는지, 수업 구성", "비슷한 규모의 PT샵과 1대1 가격대"],
  ["가격대", "이 상권이 받아 주는 월 회원권 범위", "수업 횟수 패키지 가격 범위", "회차당 단가 범위"],
  ["접근성", "주차, 도보권, 늦은 시간 이용 동선", "대중교통과 출퇴근 전후 시간대", "직장과의 거리, 점심·퇴근 후 이용 동선"],
];

const BUILDING = [
  { t: "층고", d: "천장 설비와 마감을 빼고 나면 실제로 쓸 수 있는 높이가 줄어듭니다. 운동 종류와 기구 선택이 여기서 갈립니다." },
  { t: "바닥 하중", d: "프리웨이트와 머신 같은 무거운 기구를 놓을 수 있는지, 보강이 필요한지를 확인합니다." },
  { t: "전기 용량", d: "냉난방, 샤워 설비, 유산소 기구를 동시에 쓸 때 부족하지 않은지, 증설이 가능한지 봅니다." },
  { t: "소음·진동", d: "위아래 층 입주 업종과 민원 가능성, 방음 공사가 필요한 범위를 미리 가늠합니다." },
  { t: "동선", d: "기구 반입 경로, 엘리베이터, 주차, 회원이 오르내리는 동선이 운영에 맞는지 확인합니다." },
];

const COMPARE = [
  ["배후 수요", "유동인구는 많지만 거주·근무 인구는 적음", "아파트 단지와 사무실이 함께 있어 평일과 주말 수요가 고름"],
  ["경쟁 센터", "반경 안에 대형 센터가 여럿, 가격 경쟁이 심함", "같은 업종은 적지만 수요가 실제로 있는지 확인이 필요함"],
  ["접근성", "역 출구 앞이지만 건물 상층부라 엘리베이터를 타야 함", "도보 접근이 쉽고 1층이라 외부 노출이 좋음"],
  ["건물 조건", "층고가 낮아 기구 선택에 제한, 전기 증설 필요", "층고와 하중 조건은 양호, 방음 공사 필요"],
  ["임대 조건", "보증금과 월세는 낮지만 무상 임대 기간이 짧음", "월세는 높지만 무상 임대와 원상복구 조건을 협상할 여지가 있음"],
  ["초기 비용", "낮은 월세 대신 전기 증설과 공사비가 추가됨", "공사비는 적게 들지만 보증금 부담이 큼"],
  ["종합 의견", "조건이 바뀌지 않으면 보류", "월세 협상이 되면 진행 검토"],
];

const ROLE = [
  ["목적", "임대차 계약을 성사시키는 것", "이 자리에서 센터가 손익을 낼 수 있는지 판단하는 것"],
  ["보는 것", "건물, 면적, 임대 조건", "배후 수요, 경쟁 센터, 업종별 건물 조건, 손익 구조"],
  ["전문 분야", "상가와 부동산 거래 전반", "헬스장·PT샵·필라테스의 창업과 운영"],
  ["계약에 대한 입장", "계약이 성사되어야 업무가 마무리되는 구조", "계약하지 않는 편이 나은 자리도 근거와 함께 말씀드림"],
  ["계약 이후", "계약으로 종료", "필요하면 오픈 준비와 운영까지 이어서 지원"],
];

const STEPS = [
  { t: "상담 접수", d: "창업하려는 업종과 지역, 후보지가 있다면 몇 곳인지 먼저 듣습니다." },
  { t: "후보지 정보 확인", d: "주소 또는 상권, 평수, 임대 조건을 받습니다. 후보지가 정해지지 않았다면 조건부터 정리합니다." },
  { t: "변수별 비교 분석", d: "배후 수요, 경쟁 센터, 가격대, 접근성, 건물 조건을 같은 기준으로 놓고 비교합니다." },
  { t: "현장 확인", d: "건물 상태와 주변 환경은 필요한 경우 현장에서 확인합니다." },
  { t: "계약 전 점검", d: "임대 조건 협상 포인트와 체크리스트를 정리하고, 필요하면 계약 현장에 함께 갑니다." },
];

const FAQ = [
  { q: "후보지가 아직 정해지지 않았어도 상담할 수 있습니다", a: "가능합니다. 업종, 희망 지역, 예산 범위를 알려 주시면 어떤 조건의 자리를 찾아야 하는지부터 함께 정리합니다." },
  { q: "후보지가 여러 곳이어도 비교할 수 있습니다", a: "후보지가 두세 곳일 때 가장 도움이 됩니다. 같은 기준으로 놓고 비교해야 어느 자리가 손익에 맞는지 보입니다." },
  { q: "공인중개사와 함께 진행해도 됩니다", a: "중개사를 대체하는 것이 아니라 계약 전에 판단 기준을 더하는 역할입니다. 중개사가 소개한 자리도 같은 기준으로 확인합니다." },
  { q: "임대 조건 협상도 도와주는지 궁금합니다", a: "보증금, 월세, 무상 임대 기간, 원상복구 조건에서 협상할 포인트를 정리해 드립니다. 필요하면 계약 현장에도 함께 갑니다." },
  { q: "현장에 직접 와서 확인하는지 궁금합니다", a: "건물 조건은 현장에서 봐야 정확합니다. 현장 확인이 필요한지와 범위는 후보지 상황에 맞춰 상담에서 안내드립니다." },
  { q: "자리가 정해진 뒤에도 이어서 도움을 받을 수 있습니다", a: "자리가 정해지면 인테리어와 오픈 준비, 운영까지 한 팀으로 이어갈 수 있습니다." },
];

export const LOCATION_PREP = [
  { title: "상담은 이렇게 진행됩니다", items: ["신청서를 남겨 주세요", "신청 후 24시간 이내 담당자가 연락드립니다", "창업 계획과 후보지를 듣고 필요한 정보를 안내합니다"] },
  { title: "준비하면 좋은 정보", items: ["희망 업종과 지역", "후보지 주소 또는 상권, 평수", "임대 조건(보증금, 월세)이 있다면 함께", "후보지가 정해지지 않아도 신청할 수 있습니다"] },
  { title: "상담 후 확인할 수 있는 범위", items: ["전달해 주신 정보 기준의 검토 방향", "추가로 확인해야 할 항목", "현장 확인이 필요한지 여부"] },
];

export default function LocationSections() {
  return (
    <>
      <section className="slc-hero" data-track-section="hero">
        <div className="slc-wrap slc-hero-grid">
          <div>
            <span className="slc-kicker">헬스장·PT샵·필라테스 입지·상권 분석</span>
            <h1 className="slc-h1">
              <span>창업할 수 있는 자리와</span>
              <span>
                <em>수익을 낼 수 있는 자리</em>는
              </span>
              <span>다릅니다</span>
            </h1>
            <p className="slc-sub">
              유동인구가 많고 월세가 낮아 보여도 손익이 맞지 않는 자리가 있습니다. 계약하기 전에 후보지를 같은 기준으로 비교합니다.
            </p>
            <div className="slc-cta-row">
              <GoForm p={p} cta={LOCATION_CTA} product="입지상권" />
              <a className="slc-ghost" href="#slc-compare">
                후보지 비교 예시 보기
              </a>
            </div>
          </div>
          <div className="slc-viz" aria-label="개념도">
            <p className="slc-viz-t">겉으로 보이는 조건</p>
            <div className="slc-chips">
              <span className="slc-chip x">유동인구 많음</span>
              <span className="slc-chip x">역세권</span>
              <span className="slc-chip x">낮은 월세</span>
            </div>
            <div className="slc-vdiv" />
            <p className="slc-viz-t">계약 전에 확인할 것</p>
            <div className="slc-chips">
              <span className="slc-chip o">매달 결제할 사람</span>
              <span className="slc-chip o">경쟁 센터</span>
              <span className="slc-chip o">건물 조건</span>
              <span className="slc-chip o">손익 구조</span>
            </div>
          </div>
        </div>
      </section>

      <section className="slc-sec" data-track-section="myths">
        <div className="slc-wrap">
          <SectionHead
            p={p}
            no="01"
            label="입지 선택의 흔한 오류"
            title="좋은 자리라고 믿게 만드는 [네 가지 판단]"
            lead="자리는 계약하는 순간 바꿀 수 없습니다. 그래서 아래 판단이 맞는지 계약 전에 확인해야 합니다."
          />
          <div className="slc-rows">
            {MYTHS.map((m) => (
              <div key={m.w} className="slc-row pair slc-rv">
                <div>
                  <span className="slc-tag">흔한 판단</span>
                  <p className="slc-wrong">{m.w}</p>
                </div>
                <div>
                  <span className="slc-tag g">실제로 봐야 할 것</span>
                  <p className="slc-fix">{m.f}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="slc-sec alt" data-track-section="market">
        <div className="slc-wrap">
          <SectionHead
            p={p}
            no="02"
            label="피트니스 상권 분석"
            title="자리는 [다섯 가지 변수]로 읽습니다"
            lead="같은 상권이어도 업종에 따라 먼저 보는 것이 다릅니다. 업종별로 우선순위를 달리해 읽습니다."
          />
          <Table
            p={p}
            cols="0.7fr 1fr 1fr 1fr"
            head={["변수", "헬스장", "필라테스", "PT샵"]}
            rows={VARS}
          />
        </div>
      </section>

      <section className="slc-sec" data-track-section="building">
        <div className="slc-wrap">
          <SectionHead
            p={p}
            no="03"
            label="건물 자체의 적합성"
            title="자리가 좋아도 [그 건물]이 맞지 않으면 안 됩니다"
            lead="상권이 좋아도 건물이 운동 시설을 받아 주지 못하면 공사비가 늘거나 아예 운영할 수 없습니다."
          />
          <div className="slc-split rev">
            <div className="slc-rows slc-rv">
              {BUILDING.map((b, i) => (
                <div key={b.t} className="slc-row">
                  <span className="slc-rn">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="slc-rt">{b.t}</h3>
                  <p className="slc-rd">{b.d}</p>
                </div>
              ))}
            </div>
            <figure className="slc-ph tall slc-rv">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/legacy/startup/640d2ed2ca7b9.jpg" alt="공실 현장 확인" width={1050} height={1400} loading="lazy" decoding="async" />
              <figcaption>공실 현장 확인. 더그로우 창업 현장 실제 사진</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="slc-sec alt" id="slc-compare" data-track-section="compare">
        <div className="slc-wrap">
          <SectionHead
            p={p}
            no="04"
            label="후보지 비교 분석"
            title="후보지 두 곳을 [같은 기준]으로 놓고 봅니다"
            lead="아래는 비교 방식을 설명하기 위한 예시입니다. 가상의 후보지이며 실제 분석 결과가 아닙니다."
          />
          <Table
            p={p}
            cols="0.6fr 1fr 1fr"
            head={["비교 항목", "후보지 1", "후보지 2"]}
            rows={COMPARE}
          />
          <p className="slc-note">점수 하나로 결론을 내지 않고, 손익이 맞는지에 대한 근거를 항목마다 남깁니다.</p>
        </div>
      </section>

      <section className="slc-sec" data-track-section="role">
        <div className="slc-wrap">
          <SectionHead
            p={p}
            no="05"
            label="부동산 중개와 창업 입지 컨설팅"
            title="하는 일이 [서로 다릅니다]"
            lead="중개사를 대체하는 것이 아닙니다. 계약 전에 판단 기준을 하나 더하는 역할입니다."
          />
          <Table
            p={p}
            cols="0.6fr 1fr 1.2fr"
            head={["구분", "부동산 중개", "창업 입지 컨설팅"]}
            hlCol={2}
            rows={ROLE}
          />
        </div>
      </section>

      <section className="slc-sec alt" data-track-section="proof">
        <div className="slc-wrap slc-proof">
          <div className="slc-rv">
            <div className="slc-eyebrow">
              <b>06</b>실제 현장 경험
            </div>
            <p className="slc-big">
              <em>헬스장·필라테스</em>창업 250회
            </p>
            <p className="slc-ptext">
              자리를 고르는 일부터 오픈까지 함께해 왔습니다. 계약 현장에 함께 들어가 임대 조건을 확인한 경험이 이 서비스의 바탕입니다.
            </p>
            <blockquote className="slc-quote">
              <p>혼자 준비했으면 분명 실패했을 거예요. 입지 선정부터 인테리어, 프리세일까지 전부 함께 해주셔서 오픈 첫 달부터 안정적으로 시작했습니다.</p>
              <cite>김○○ 대표님 · 필라테스 · 경기 성남 (더그로우 창업 후기)</cite>
            </blockquote>
            <figure className="slc-ph slc-rv" style={{ marginTop: 30 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/legacy/startup/3fe6ca005fb28.jpg" alt="계약 현장" width={1440} height={1080} loading="lazy" decoding="async" />
              <figcaption>계약 현장. 더그로우 창업 현장 실제 사진</figcaption>
            </figure>
          </div>
          <div className="slc-rv">
            <VideoReview
              p={p}
              src="/reviews/review-1.mp4"
              poster="/reviews/review-1.jpg"
              caption="수치와 데이터로 증명한 첫 창업 이야기"
              sub="더그로우와 함께한 창업 후기 영상"
            />
          </div>
        </div>
      </section>

      <section className="slc-sec" data-track-section="process">
        <div className="slc-wrap">
          <SectionHead
            p={p}
            no="07"
            label="상담 과정과 확인할 수 있는 결과"
            title="후보지 정보에서 [계약 전 점검]까지"
          />
          <Steps p={p} items={STEPS} />
          <ul className="slc-list slc-rv">
            <li>후보지 비교 리포트: 업종과 평수별 적합도</li>
            <li>임대 조건 협상 포인트</li>
            <li>계약 전 체크리스트</li>
          </ul>
          <p className="slc-note">상담은 전달해 주신 정보의 범위 안에서 이루어집니다.</p>
        </div>
      </section>

      <section className="slc-sec alt" data-track-section="faq">
        <div className="slc-wrap">
          <SectionHead p={p} no="08" label="자주 묻는 질문" title="상담 전에 많이 궁금해하시는 [내용]" />
          <Faq p={p} items={FAQ} />
        </div>
      </section>
    </>
  );
}
