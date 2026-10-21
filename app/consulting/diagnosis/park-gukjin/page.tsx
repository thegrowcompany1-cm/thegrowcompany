"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 진단 멘토 상세페이지 — 박국진 (자금·보증 파트) · 황현진 v2 구조를 그대로 재사용
//  구조(다크/화이트 교차): 히어로 → 오픈루프 → 공감 체크 → 방치 비용 → 통념 뒤집기 → 진행 이력 슬라이드 → 상단 상담폼
//   → 3가지 차이 → 자금진단 5가지 → 진행 절차 → FAQ → 솔직히 + 신청(하단 상담폼, -bottom id) → 하단 고지
//   → ConsultantCarousel → 추천 카드. 모바일 하단 고정 CTA.
//  · 클래스 접두사 pgj-, 스타일은 이 파일의 PGJ_CSS. 글꼴은 사이트 기본 Noto Sans KR.
//  · 상담폼은 허준영·황현진 폼과 같은 전송 구조(네이티브 form + 숨김 iframe, source="진단상담")에 자금진단 필드를 얹었다.
//  · mounted 클라이언트 전용 폼 렌더 + suppressHydrationWarning, innerHTML <script> 는 주입 이펙트가 재생성.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ConsultantCarousel from "@/components/ConsultantCarousel";
import { SITE_URL } from "@/lib/site";

// 진단 솔루션 Service 구조화 데이터 — 담당자는 provider.employee(Person)로 중첩
const SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "사업장 정책자금·신용보증·기술보증 자금진단",
  name: "박국진 컨설턴트 자금진단",
  url: `${SITE_URL}/consulting/diagnosis/park-gukjin`,
  areaServed: "KR",
  description:
    "정책자금·신용보증·기술보증, 우리 사업장이 받을 수 있는지부터 확인합니다. 박국진 컨설턴트의 자금진단.",
  provider: {
    "@type": "Organization",
    name: "더그로우컴퍼니",
    url: SITE_URL,
    employee: {
      "@type": "Person",
      name: "박국진",
      jobTitle: "자금·보증 컨설턴트",
    },
  },
};

// 하단 "다른 서비스 둘러보기" 추천 카드 (현재 페이지인 진단 솔루션은 제외)
const RELATED_SERVICES = [
  {
    title: "창업 솔루션",
    desc: "헬스장·필라테스 등 창업 준비를 위한 솔루션",
    href: "/consulting/startup",
    img: "/startup/startup50.png",
  },
  {
    title: "매장 위탁운영",
    desc: "운영이 어려운 매장을 위한 단기 위탁",
    href: "/consulting/outsourcing",
    img: "/wt/wt.png",
  },
  {
    title: "시설 위탁운영",
    desc: "아파트·기업·공공기관 장기 위탁",
    href: "/consulting/community",
    img: "/wt/community.png",
  },
  {
    title: "그로우 에듀",
    desc: "피트니스 실무 교육 프로그램",
    href: "/edu/fc-class",
    img: "/edu/edufc.jpg",
  },
];

function RelatedServiceCard({
  service,
}: {
  service: (typeof RELATED_SERVICES)[number];
}) {
  const [imgError, setImgError] = useState(false);

  const cardCls =
    "group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-[#009519] hover:shadow-lg";

  return (
    <Link href={service.href} className={cardCls}>
      <div className="relative aspect-square w-full overflow-hidden bg-[#ececec]">
        {!imgError ? (
          <Image
            src={service.img}
            alt={service.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, 50vw"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">
            {service.img}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3 sm:p-4">
        <h3 className="text-sm font-bold text-[#1a1a1a] group-hover:text-[#009519] sm:text-base">
          {service.title}
        </h3>
        <p className="text-xs leading-snug text-[#777] sm:text-sm">
          {service.desc}
        </p>
      </div>
    </Link>
  );
}

// ─── 자금진단 상담 폼 HTML (허준영·황현진 폼과 같은 구조: 네이티브 form + 숨김 iframe, 폼 스코프 스크립트) ─────────
// 필드: 상호 · 연락처(확인 포함) · 업종 · 업력 · 연매출 · 기존 대출 · 자금 목적. consultant 값은 슬러그(park-gukjin).
const FORM_HTML = `<div class="consult-form-wrapper">
  <div class="form-header">
    <h2>우리 사업장 자금진단 신청</h2>
  </div>

  <!-- 전송은 네이티브 폼 POST + 숨김 iframe 방식이다. action/method/target 과 source·token hidden 을
       마크업에 직접 둬서, 아래 스크립트가 죽어도 브라우저가 폼을 그대로 전송한다 (리드 유실 방지 폴백). -->
  <form id="consultForm" class="consult-form"
        action="https://script.google.com/macros/s/AKfycbyTIVLMDS-DQjOZ1fIP9DbzJ2NONxyn6mdjEik1_ZG31XB9TVO0Y5_odvFwO1M0AcJ21Q/exec"
        method="POST" target="diag_iframe_top">
    <div class="form-group">
      <label class="form-label">상호 <span class="required">*</span></label>
      <input type="text" name="name" id="name" required>
    </div>

    <div class="form-group">
      <label class="form-label">연락처를 입력해주세요. <span class="required">*</span></label>
      <div class="phone-inputs">
        <input type="text" name="phone1" id="phone1" maxlength="3" required>
        <span class="phone-dash">-</span>
        <input type="text" name="phone2" id="phone2" maxlength="4" required>
        <span class="phone-dash">-</span>
        <input type="text" name="phone3" id="phone3" maxlength="4" required>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">연락처를 입력해주세요(중복확인). <span class="required">*</span></label>
      <div class="phone-inputs">
        <input type="text" name="phoneConfirm1" id="phoneConfirm1" maxlength="3" required>
        <span class="phone-dash">-</span>
        <input type="text" name="phoneConfirm2" id="phoneConfirm2" maxlength="4" required>
        <span class="phone-dash">-</span>
        <input type="text" name="phoneConfirm3" id="phoneConfirm3" maxlength="4" required>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">업종 <span class="required">*</span></label>
      <input type="text" name="industry" id="industry" required>
    </div>

    <div class="form-group">
      <label class="form-label">업력 <span class="required">*</span></label>
      <div class="checkbox-group radio-row">
        <label class="checkbox-label"><input type="radio" name="bizAge" value="1년 미만" required><span class="checkbox-text">1년 미만</span></label>
        <label class="checkbox-label"><input type="radio" name="bizAge" value="1~3년"><span class="checkbox-text">1~3년</span></label>
        <label class="checkbox-label"><input type="radio" name="bizAge" value="3년 이상"><span class="checkbox-text">3년 이상</span></label>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">연매출 <span class="required">*</span></label>
      <div class="checkbox-group radio-row">
        <label class="checkbox-label"><input type="radio" name="revenue" value="1억 미만" required><span class="checkbox-text">1억 미만</span></label>
        <label class="checkbox-label"><input type="radio" name="revenue" value="1~5억"><span class="checkbox-text">1~5억</span></label>
        <label class="checkbox-label"><input type="radio" name="revenue" value="5억 이상"><span class="checkbox-text">5억 이상</span></label>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">기존 대출 <span class="required">*</span></label>
      <div class="checkbox-group radio-row">
        <label class="checkbox-label"><input type="radio" name="hasLoan" value="있음" required><span class="checkbox-text">있음</span></label>
        <label class="checkbox-label"><input type="radio" name="hasLoan" value="없음"><span class="checkbox-text">없음</span></label>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">자금 목적 <span class="required">*</span></label>
      <div class="checkbox-group radio-row">
        <label class="checkbox-label"><input type="radio" name="fundPurpose" value="운영" required><span class="checkbox-text">운영</span></label>
        <label class="checkbox-label"><input type="radio" name="fundPurpose" value="시설·확장"><span class="checkbox-text">시설·확장</span></label>
        <label class="checkbox-label"><input type="radio" name="fundPurpose" value="기존 대출 점검"><span class="checkbox-text">기존 대출 점검</span></label>
        <label class="checkbox-label"><input type="radio" name="fundPurpose" value="잘 모르겠음"><span class="checkbox-text">잘 모르겠음</span></label>
      </div>
    </div>

    <!-- 페이지 구분 · 보안 토큰 · 멘토 — 스크립트 상황과 무관하게 항상 전송된다 -->
    <input type="hidden" name="source" value="진단상담">
    <input type="hidden" name="token" value="grow2026secure">
    <input type="hidden" name="consultant" value="park-gukjin">
    <input type="hidden" name="consultField" value="자금·보증">

    <!-- 전송용 조립 필드 — 제출 핸들러가 검증 통과 후 값을 넣고 disabled 를 푼다.
         기본이 disabled 인 이유: 스크립트가 죽은 폴백 경로에서 화면 입력칸(phone1~3 / phoneConfirm1~3)의 값이 그대로 가게 하려는 것. -->
    <input type="hidden" name="phone" class="diag-h-phone" value="" disabled>
    <input type="hidden" name="phoneCheck1" class="diag-h-pc1" value="" disabled>
    <input type="hidden" name="phoneCheck2" class="diag-h-pc2" value="" disabled>
    <input type="hidden" name="phoneCheck3" class="diag-h-pc3" value="" disabled>

    <div class="form-submit">
      <button type="submit" id="submitBtn">작성</button>
    </div>
  </form>

  <!-- 전송 대상 iframe. 화면에 자리를 차지하지 않도록 display:none · 0×0. -->
  <iframe name="diag_iframe_top" class="diag-iframe" title="자금진단 신청 전송" src="about:blank"
          style="display:none;width:0;height:0;border:0"></iframe>
</div>

<style>
.consult-form-wrapper {
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
}

.form-header {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  padding: 25px 20px;
  text-align: center;
}

.form-header h2 {
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  margin: 0;
}

.consult-form {
  padding: 40px 50px;
}

.form-group {
  margin-bottom: 30px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
  font-weight: 500;
}

.required {
  color: #e53935;
}

.consult-form input[type="text"] {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  background: #fff;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.consult-form input[type="text"]:focus {
  outline: none;
  border-color: #4CAF50;
}

.consult-form input[type="text"]::placeholder {
  color: #999;
}

.phone-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.phone-inputs input {
  width: 100px !important;
  text-align: center;
}

.phone-dash {
  color: #333;
  font-weight: 400;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin-right: 10px;
  cursor: pointer;
  accent-color: #4CAF50;
}

.checkbox-label input[type="radio"] {
  width: 18px;
  height: 18px;
  margin-right: 10px;
  cursor: pointer;
  accent-color: #4CAF50;
}

.checkbox-text {
  font-size: 14px;
  color: #333;
  font-weight: 400;
}

.etc-label {
  flex-wrap: wrap;
  gap: 10px;
}

.etc-input {
  width: 150px !important;
  margin-left: auto;
  padding: 8px 12px !important;
  font-size: 13px !important;
}

.etc-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.form-submit {
  text-align: center;
  margin-top: 40px;
}

.form-submit button {
  background: #4CAF50;
  color: #fff;
  border: none;
  padding: 14px 60px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.form-submit button:hover {
  background: #45a049;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
}

.form-submit button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .consult-form {
    padding: 30px 20px;
  }

  .phone-inputs input {
    width: 80px !important;
  }

  .etc-input {
    width: 120px !important;
  }

  .form-header h2 {
    font-size: 18px;
  }
}
.radio-row{flex-direction:row;flex-wrap:wrap;gap:10px 22px}
</style>

<script>
(function(){
  // 폼 스코프(각 .consult-form-wrapper) 기준으로 동작. 상단/하단 두 폼이 있어도 각자 정상 동작한다.
  function initForm(wrapper){
    if (!wrapper || wrapper.getAttribute('data-pgj-init')) return;
    wrapper.setAttribute('data-pgj-init', '1');

    var form = wrapper.querySelector('.consult-form');
    if (!form) return;

    function q(sel){ return wrapper.querySelector(sel); }
    function val(sel){ var el = q(sel); return el ? el.value : ''; }

    var phoneInputs = wrapper.querySelectorAll('.phone-inputs input');
    phoneInputs.forEach(function(input, index){
      input.addEventListener('input', function(){
        this.value = this.value.replace(/[^0-9]/g, '');
        if (this.value.length >= this.maxLength && index < phoneInputs.length - 1){
          phoneInputs[index + 1].focus();
        }
      });
    });

    var submitBtn = q('.form-submit button');
    var iframe = wrapper.querySelector('.diag-iframe');
    var hid = {
      phone:       q('.diag-h-phone'),
      phoneCheck1: q('.diag-h-pc1'),
      phoneCheck2: q('.diag-h-pc2'),
      phoneCheck3: q('.diag-h-pc3')
    };
    function setHidDisabled(flag){
      for (var k in hid){ if (hid[k]) hid[k].disabled = flag; }
    }
    function restoreForm(){
      setHidDisabled(true);
      if (submitBtn){ submitBtn.disabled = false; submitBtn.textContent = '작성'; }
    }

    form.addEventListener('submit', function(e){
      e.preventDefault();

      var done = false;
      var timer = null;
      var onLoad = null;

      try {
        // 번호 일치 — 칸별 비교
        var p1 = val('[name="phone1"]'), p2 = val('[name="phone2"]'), p3 = val('[name="phone3"]');
        var c1 = val('[name="phoneConfirm1"]'), c2 = val('[name="phoneConfirm2"]'), c3 = val('[name="phoneConfirm3"]');
        if (p1 !== c1 || p2 !== c2 || p3 !== c3){ alert('연락처가 일치하지 않습니다. 다시 확인해주세요.'); return; }

        if (hid.phone)       hid.phone.value = p1 + '-' + p2 + '-' + p3;
        if (hid.phoneCheck1) hid.phoneCheck1.value = c1;
        if (hid.phoneCheck2) hid.phoneCheck2.value = c2;
        if (hid.phoneCheck3) hid.phoneCheck3.value = c3;

        setHidDisabled(false);
        if (submitBtn){ submitBtn.disabled = true; submitBtn.textContent = '전송중...'; }
        if (!iframe) throw new Error('diag iframe not found');

        // 성공 판정은 iframe 의 load 1회 (응답 본문은 교차 출처라 읽을 수 없다)
        onLoad = function(){
          if (done) return;
          done = true;
          if (timer) clearTimeout(timer);
          iframe.removeEventListener('load', onLoad);
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'form_submit', { form_source: '진단상담' });
          }
          if (typeof window.__tgcFbTrack === 'function') {
            window.__tgcFbTrack('Lead', { content_name: '진단상담' });
          }
          alert('자금진단 신청이 정상적으로 접수되었습니다.\\n빠른 시일 내에 연락드리겠습니다.');
          form.reset();
          restoreForm();
        };
        iframe.addEventListener('load', onLoad);

        // 15초 안에 load 가 오지 않으면 실패로 보고 버튼을 돌려준다.
        timer = setTimeout(function(){
          if (done) return;
          done = true;
          iframe.removeEventListener('load', onLoad);
          alert('전송 중 오류가 발생했습니다. 다시 시도해주세요.');
          restoreForm();
        }, 15000);

        form.submit();
      } catch (err) {
        done = true;
        if (timer) clearTimeout(timer);
        if (iframe && onLoad) iframe.removeEventListener('load', onLoad);
        alert('전송 중 오류가 발생했습니다. 다시 시도해주세요.');
        restoreForm();
      }
    });
  }

  var wrappers = document.querySelectorAll('.consult-form-wrapper');
  for (var i = 0; i < wrappers.length; i++){ initForm(wrappers[i]); }
})();
</script>`;

// 하단 상담폼: 상단과 동일하되 마크업의 모든 id 에 -bottom 접미사를 붙여 중복 방지.
const FORM_HTML_BOTTOM = FORM_HTML
  .replace(/id="([\w-]+)"/g, 'id="$1-bottom"')
  // iframe 이름과 form[target] 은 id 가 아니어서 위 치환에 걸리지 않는다. 상단/하단 폼이 서로 다른 iframe 을 쓰도록 따로 바꾼다.
  .replace(/diag_iframe_top/g, "diag_iframe_bottom");

// ─── 박국진 컨설턴트 (자금·보증 파트) — 더그로우 메인 톤(DESIGN.md 1층) + 설득 구조·다크/화이트 교차(v2) ──────────────
// 황현진 페이지(v2)의 구조·톤·컴포넌트를 그대로 쓰고, 문구·데이터만 바꿨다. 클래스 접두사 pgj-.
// 카피 규칙: 물음표 금지, 마침표로 끝낸다. 아래 문구 외 수치·실적·경력을 새로 만들지 않는다.
// 이미지는 public/consultants/park-gukjin/ (프로필은 public/consultants/park-gukjin.jpg) — 파일이 없으면 회색 플레이스홀더로 보인다.

const IMG_DIR = "/consultants/park-gukjin";

const CHECKS = [
  "정책자금이 있다는 건 들었지만, 우리 사업장도 대상인지는 모른다.",
  "은행에서 한 번 거절당한 뒤로 다시 알아보지 않았다.",
  "이미 대출이 있어서 추가는 안 된다고 생각한다.",
  "신보·기보·소진공, 이름은 아는데 차이는 모른다.",
  "확장·리모델링 자금은 결국 내 돈으로 해야 한다고 여겼다.",
];

const DIFFS = [
  { no: "01", title: "기관 선택", body: "우리 조건에 맞는 보증기관부터 찾습니다." },
  { no: "02", title: "준비 순서", body: "신청 전에 보완할 것을 먼저 정리합니다." },
  { no: "03", title: "서류의 논리", body: "매출과 자금 용도가 하나의 이야기로 연결되게 만듭니다." },
];

const DIAG5 = [
  { title: "기본 조건", body: "업력·업종·사업자 유형" },
  { title: "매출·재무", body: "매출 흐름·부채·현금흐름" },
  { title: "신용·금융거래", body: "기존 대출·보증 잔액·연체 이력" },
  { title: "자금 목적", body: "운영·시설·확장 경로" },
  { title: "실행 순서", body: "보완점·준비서류·일정" },
];

const PROCESS = ["간편 접수", "현황 확인", "적합성 검토", "준비 방향 안내", "후속 진행 협의"];

const FAQS: { q: string; a: string | null }[] = [
  { q: "업력이 짧아도 상담할 수 있습니다.", a: "실제 지원 여부는 제도별 요건과 심사에 따라 달라집니다." },
  { q: "기존 대출이 있어도 검토할 수 있습니다.", a: "부채 규모·상환 상태·보증 잔액에 따라 개별 검토합니다." },
  { q: "신용점수가 낮아도 먼저 확인해 볼 수 있습니다.", a: "기관·상품마다 신용 요건이 다릅니다." },
  { q: "자금 확보를 보장하지는 않습니다. 대신 될 수 있는 길을 먼저 찾습니다.", a: "승인·한도·금리는 각 기관 심사로 결정됩니다." },
  { q: "상담 비용과 범위는 신청 전에 안내합니다.", a: null },
];

// 진행 이력 — 큰 숫자 + 작은 라벨. 합계 금액은 표시하지 않는다.
type Doc = { img: string; big: string; label: string; sub?: string };
const HISTORY_TABS: { key: string; label: string; items: Doc[] }[] = [
  {
    key: "sb",
    label: "신용보증기금",
    items: [
      { img: "sb-1.png", big: "2억원", label: "보증" },
      { img: "sb-2.png", big: "1억 5천만원", label: "보증" },
      { img: "sb-3.png", big: "4,950만원", label: "보증" },
    ],
  },
  {
    key: "kb",
    label: "기술보증기금",
    items: [
      { img: "kb-1.png", big: "1억원", label: "보증", sub: "대출 1억원" },
      { img: "kb-2.png", big: "9,500만원", label: "보증", sub: "대출 1억원" },
      { img: "kb-3.png", big: "6,300만원", label: "보증", sub: "대출 7,000만원" },
      { img: "kb-4.png", big: "2,601만원", label: "보증", sub: "대출 2,890만원" },
    ],
  },
  {
    key: "cert",
    label: "기업 인증",
    items: [
      { img: "cert-venture.png", big: "벤처기업", label: "혁신성장유형 · 2026.09" },
      { img: "cert-mainbiz.png", big: "메인비즈", label: "2026.09" },
      { img: "cert-sobujang.png", big: "소부장 전문기업", label: "2026.07" },
    ],
  },
  {
    key: "uni",
    label: "산학협력",
    items: [
      { img: "uni-myongji.jpg", big: "명지대학교", label: "가족회사 · 2026.10" },
      { img: "uni-ajou.jpg", big: "아주대학교", label: "가족회사 · 2026.09" },
    ],
  },
];

const PGJ_CSS = `
.pgj{--bg:#111111;--bg2:#0A0A0A;--card:#161616;--chip:#1E1E1E;--tx:#EEEEEE;--sub:#BDBDBD;--sub2:#9A9A9A;--g:#009519;--gt:#2FBF5F;--line:rgba(255,255,255,.1);background:var(--bg);color:var(--tx);font-family:inherit;font-size:16px;line-height:1.75;word-break:keep-all;overflow-wrap:anywhere}
.pgj *{box-sizing:border-box}
.pgj [id]{scroll-margin-top:104px}
.pgj a:focus-visible,.pgj button:focus-visible{outline:2px solid var(--gt);outline-offset:3px}
.pgj a,.pgj button{touch-action:manipulation}
.pgj-wrap{max-width:1152px;margin:0 auto;padding:0 16px}
@media(min-width:640px){.pgj-wrap{padding:0 24px}}
@media(min-width:1024px){.pgj-wrap{padding:0 32px}}
.pgj-sec{padding:56px 0}
@media(min-width:640px){.pgj-sec{padding:80px 0}}
/* 다크/화이트 교차 — 같은 색 섹션은 한 덩어리로 묶고 구분선 없이 여백(64px)으로만 나눈다 */
.pgj-blk{padding:64px 0}
.pgj-blk .pgj-sec{padding:0}
.pgj-blk .pgj-sec+.pgj-sec{margin-top:64px}
.pgj-light{--tx:#111111;--sub:#333333;--sub2:#666666;--card:#F5F5F5;--chip:#F0F0F0;--gt:#007A14;--line:transparent;background:#FFFFFF;color:#111111}
.pgj-light .pgj-stat span,.pgj-light .pgj-vid-cap,.pgj-light .pgj-left small,.pgj-light .pgj-scene-l{color:#666666}
.pgj-light .pgj-chips li{color:#333333}
.pgj-light .pgj-check:hover{border-color:#CCCCCC}
.pgj-light .pgj-check-ic{border-color:#CCCCCC}
.pgj-light .pgj-check.is-on{border-color:var(--g)}
.pgj-light .pgj-check.is-on .pgj-check-ic{border-color:var(--g)}
.pgj-light .pgj-bad{color:#111111}
.pgj-light .is-fixed .pgj-bad{color:#999999}
.pgj-light .pgj-strike{background-image:linear-gradient(#999999,#999999)}
.pgj-light .pgj-fix-in{background:#EAF6EC}
.pgj-light .pgj-good{color:#0B3D17}
.pgj-light .pgj-note{color:#2E6B3F}
.pgj-light .is-fixed .pgj-sw{background:#2A2A2A;color:#EEEEEE}
.pgj-light .pgj-left{border:0;box-shadow:inset 4px 0 0 var(--g)}
.pgj-eyebrow{margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--gt)}
.pgj-h2{margin:0 0 16px;max-width:22em;font-size:clamp(24px,3.4vw,36px);font-weight:900;line-height:1.35;letter-spacing:-.02em;color:var(--tx)}
.pgj-bt{display:flex;align-items:center;gap:12px;margin:0 0 20px}
.pgj-bt::before{content:"";flex:0 0 4px;height:20px;border-radius:999px;background:var(--g)}
.pgj-bt h2{margin:0;font-size:clamp(22px,3vw,30px);font-weight:900;line-height:1.35;letter-spacing:-.02em}
.pgj-p{margin:0 0 16px;max-width:34em;color:var(--sub)}
.pgj-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:24px}
@media(min-width:640px){.pgj-card{padding:32px}}
.pgj-cta{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:54px;padding:0 28px;border:0;border-radius:12px;background:var(--g);color:#fff;font:inherit;font-size:19px;font-weight:900;text-decoration:none;cursor:pointer;transition:background-color .2s}
.pgj-cta:hover{background:#007a14}

/* 1. 히어로 — 모바일은 사진을 화면 가득 깔고 아래 60% 를 #111 로 녹인다. 데스크톱은 좌 텍스트 / 우 사진 카드 */
.pgj-hero{position:relative;overflow:hidden;min-height:720px;display:flex;align-items:flex-end}
.pgj-hero-in{width:100%;padding-top:470px;padding-bottom:48px}
.pgj-hero-text{position:relative;z-index:1}
.pgj-hero-photo{position:absolute;inset:0}
.pgj-hero-photo::after{content:"";position:absolute;left:0;right:0;bottom:0;height:60%;background:linear-gradient(to bottom,rgba(17,17,17,0) 0%,rgba(17,17,17,.92) 28%,#111111 52%)}
.pgj-h1{margin:0 0 20px;font-size:clamp(34px,5.6vw,60px);font-weight:900;line-height:1.2;letter-spacing:-.03em}
.pgj-sub{margin:0 0 28px;max-width:28em;font-size:17px;color:var(--sub)}
@media(min-width:1024px){
  .pgj-hero{display:block;min-height:0;padding:72px 0}
  .pgj-hero-in{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:56px;align-items:center;padding-top:0;padding-bottom:0}
  .pgj-hero-photo{position:relative;inset:auto;order:2;aspect-ratio:4/5;border-radius:16px;overflow:hidden;border:1px solid var(--line);background:var(--card)}
  .pgj-hero-photo::after{display:none}
}

/* 3. 공감 체크 */
.pgj-checks{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;margin:24px 0 0}
@media(min-width:768px){.pgj-checks{grid-template-columns:repeat(2,minmax(0,1fr))}}
.pgj-check{display:flex;align-items:center;gap:14px;width:100%;padding:20px;border:1px solid var(--line);border-radius:16px;background:var(--card);color:var(--tx);font:inherit;font-size:16px;font-weight:600;text-align:left;cursor:pointer;transition:border-color .2s}
.pgj-check:hover{border-color:rgba(255,255,255,.3)}
.pgj-check-ic{flex:0 0 26px;width:26px;height:26px;display:grid;place-items:center;border:2px solid #4a4a4a;border-radius:50%;color:transparent;transition:background-color .2s,border-color .2s}
.pgj-check-ic svg{width:14px;height:14px}
.pgj-check.is-on{border-color:var(--g)}
.pgj-check.is-on .pgj-check-ic{background:var(--g);border-color:var(--g);color:#fff}
.pgj-count{margin:20px 0 0;font-size:16px;font-weight:700;color:var(--gt)}

/* 4. 방치 비용 · 11. 솔직히 */
.pgj-card .pgj-h2{max-width:24em}

/* 5. 뒤집기 */
.pgj-old{margin:0 0 12px;font-size:18px;color:var(--sub2);text-decoration:line-through}
.pgj-em{color:var(--gt)}

/* 6. 권위 */
.pgj-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:28px 0 0;max-width:640px}
.pgj-stat{padding:22px 20px;border:1px solid var(--line);border-radius:16px;background:var(--card)}
.pgj-stat b{display:block;font-size:clamp(26px,3.6vw,36px);font-weight:900;line-height:1.15;color:var(--gt);font-variant-numeric:tabular-nums;white-space:nowrap}
.pgj-stat span{display:block;margin-top:6px;font-size:13px;color:var(--sub)}
.pgj-hist{list-style:none;margin:28px 0 0;padding:0;display:grid;gap:10px;max-width:40em}
.pgj-hist li{position:relative;padding-left:16px;color:var(--tx)}
.pgj-hist li::before{content:"";position:absolute;left:0;top:.8em;width:6px;height:6px;border-radius:50%;background:var(--g)}
.pgj-chips{display:flex;flex-wrap:wrap;gap:8px;margin:28px 0 0;padding:0;list-style:none}
.pgj-chips li{padding:8px 16px;border-radius:999px;background:var(--chip);font-size:14px;font-weight:600;color:var(--tx)}
.pgj-books{display:flex;gap:14px;margin:28px 0 0;padding:0 0 8px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}
.pgj-books img{flex:0 0 auto;display:block;height:180px;width:auto;border-radius:6px;scroll-snap-align:start;background:var(--chip)}

/* 상담폼 래퍼 — 폼 내부는 다른 멘토 페이지와 같은 원래 초록. 감싸는 상자만 둥글게 */
.pgj-formbox{max-width:840px;margin:0 auto;border-radius:16px;overflow:hidden}
.pgj-formsec{padding:56px 0}
@media(min-width:640px){.pgj-formsec{padding:72px 0}}
.pgj-formsec .pgj-h2{max-width:26em}

/* 7. 교정본 */
.pgj-scenes{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;margin:32px 0 0}
@media(min-width:900px){.pgj-scenes{grid-template-columns:repeat(3,minmax(0,1fr))}}
.pgj-scene{display:flex;flex-direction:column;padding:24px;border:1px solid var(--line);border-radius:16px;background:var(--card)}
.pgj-scene-l{margin:0 0 14px;font-size:13px;font-weight:700;color:var(--sub2)}
.pgj-scene-l b{margin-right:8px;font-size:15px;font-weight:900;color:var(--gt)}
.pgj-bad{margin:0;font-size:17px;font-weight:700;line-height:1.7;color:var(--tx);transition:color .4s ease}
.pgj-strike{background-image:linear-gradient(#9A9A9A,#9A9A9A);background-repeat:no-repeat;background-position:0 58%;background-size:0% 2px;-webkit-box-decoration-break:clone;box-decoration-break:clone;transition:background-size .4s ease-out}
.is-fixed .pgj-bad{color:var(--sub2)}
.is-fixed .pgj-strike{background-size:100% 2px}
.pgj-fix{max-height:0;margin:0;opacity:0;overflow:hidden;transition:opacity .4s ease .2s,max-height .4s ease .2s,margin .4s ease .2s}
.is-fixed .pgj-fix{max-height:360px;margin:14px 0 0;opacity:1}
.pgj-fix-in{padding:16px;border-radius:12px;background:#0F2416}
.pgj-good{margin:0 0 8px;font-size:18px;font-weight:900;line-height:1.55;color:#FFFFFF}
.pgj-note{margin:0;font-size:14px;line-height:1.65;color:#A7D8B5}
.pgj-sw{margin-top:20px;min-height:48px;padding:0 16px;border:0;border-radius:12px;background:var(--g);color:#fff;font:inherit;font-size:15px;font-weight:800;cursor:pointer;transition:background-color .2s}
.pgj-sw:hover{background:#007a14}
.is-fixed .pgj-sw{background:#2A2A2A;color:var(--tx)}
.is-fixed .pgj-sw:hover{background:#363636}
.pgj-after{margin:16px 0 0;padding:24px;border:1px solid var(--line);border-radius:16px;background:var(--card);font-size:18px;font-weight:700;line-height:1.6}
@media(prefers-reduced-motion:reduce){.pgj-strike,.pgj-fix,.pgj-bad,.pgj-check,.pgj-check-ic,.pgj-sw,.pgj-cta{transition:none}}

/* 8. 영상 */
.pgj-vids{display:flex;gap:16px;margin:28px 0 0;padding:0 0 8px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}
.pgj-vid{flex:0 0 min(260px,72vw);scroll-snap-align:start}
.pgj-vid-card{position:relative;aspect-ratio:9/16;border-radius:16px;overflow:hidden;background:var(--card)}
.pgj-vid-card video{display:block;width:100%;height:100%;object-fit:cover}
.pgj-vid-cap{margin:8px 0 0;font-size:13px;color:var(--sub)}

/* 9. 솔루션 */
.pgj-steps{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;margin:28px 0 16px}
@media(min-width:640px){.pgj-steps{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(min-width:1024px){.pgj-steps{grid-template-columns:repeat(4,minmax(0,1fr))}}
.pgj-step{padding:22px;border:1px solid var(--line);border-radius:16px;background:var(--card)}
.pgj-step-no{display:block;margin:0 0 10px;font-size:13px;font-weight:900;letter-spacing:.08em;color:var(--gt)}
.pgj-step h3{margin:0 0 8px;font-size:18px;font-weight:700}
.pgj-step p{margin:0;font-size:14px;line-height:1.7;color:var(--sub)}
.pgj-left{margin:0;padding:24px;border:1px solid var(--g);border-radius:16px;background:var(--card)}
.pgj-left b{display:block;margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:.08em;color:var(--gt)}
.pgj-left p{margin:0 0 8px;color:var(--tx)}
.pgj-left small{display:block;font-size:13px;color:var(--sub)}

/* 10. 대상 */
.pgj-fits{list-style:none;margin:8px 0 0;padding:0;display:grid;gap:12px;max-width:40em}
.pgj-fits li{display:flex;align-items:flex-start;gap:12px;font-size:17px;font-weight:600}
.pgj-fits svg{flex:0 0 24px;width:24px;height:24px;margin-top:2px;color:var(--gt)}

/* 11. 솔직히 */
.pgj-link{display:inline-flex;align-items:center;gap:6px;margin-top:8px;font-weight:700;color:var(--gt);text-decoration:none}
.pgj-link:hover{text-decoration:underline;text-underline-offset:4px}

/* 모바일 고정 CTA */
.pgj-stick{position:fixed;left:0;right:0;bottom:0;z-index:40;padding:12px 16px calc(12px + env(safe-area-inset-bottom));background:rgba(17,17,17,.97);border-top:1px solid var(--line);transform:translateY(100%);visibility:hidden;transition:transform .25s ease,visibility 0s linear .25s}
.pgj-stick.is-on{transform:none;visibility:visible;transition-delay:0s}
.pgj-stick .pgj-cta{width:100%}
@media(min-width:1024px){.pgj-stick{display:none}}
@media(prefers-reduced-motion:reduce){.pgj-stick,.pgj-stick.is-on{transition:none}}
.pgj-spacer{height:84px}
@media(min-width:1024px){.pgj-spacer{display:none}}

/* ── 박국진 페이지 전용 ── */
.pgj-open{padding-top:0}
.pgj-open-l{margin:0 0 14px;max-width:26em;font-size:clamp(20px,2.6vw,28px);font-weight:700;line-height:1.5;color:var(--sub)}
.pgj-open-em{margin-top:22px;color:#FFFFFF;font-weight:900}
.pgj-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 20px}
.pgj-tab{appearance:none;min-height:44px;padding:0 18px;border:0;border-radius:999px;background:#F0F0F0;color:#333333;font:inherit;font-size:15px;font-weight:700;cursor:pointer}
.pgj-tab span{font-weight:400;color:#666666}
.pgj-tab.is-on{background:#007A14;color:#FFFFFF}
.pgj-tab.is-on span{color:#FFFFFF}
.pgj-slide{position:relative}
.pgj-docs{display:flex;gap:16px;padding-bottom:4px;overflow-x:auto;scroll-snap-type:x mandatory;overscroll-behavior-x:contain;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.pgj-docs::-webkit-scrollbar{display:none}
.pgj-doc{flex:0 0 72%;scroll-snap-align:start;display:flex;flex-direction:column;gap:6px;min-width:0;padding:14px;border:0;border-radius:16px;background:#F5F5F5;color:#111111;font:inherit;text-align:left;cursor:zoom-in}
@media(min-width:640px){.pgj-doc{flex-basis:calc((100% - 32px) / 3)}}
.pgj-doc-th{position:relative;display:block;aspect-ratio:3/4;border-radius:10px;background:#FFFFFF;overflow:hidden}
.pgj-doc-th img{position:absolute;inset:0;width:100%;height:100%}
.pgj-ph{position:absolute;inset:0;display:block;background:#E5E5E5}
.pgj-doc-big{display:block;margin-top:6px;font-size:24px;font-weight:900;line-height:1.25;color:#111111}
.pgj-doc-lb{display:block;font-size:13px;line-height:1.5;color:#666666}
.pgj-arrow{display:none;position:absolute;top:38%;z-index:2;width:44px;height:44px;align-items:center;justify-content:center;border:1px solid #CCCCCC;border-radius:50%;background:#FFFFFF;color:#111111;cursor:pointer}
.pgj-arrow:disabled{opacity:.3;cursor:default}
.pgj-arrow--l{left:8px}
.pgj-arrow--r{right:8px}
@media(min-width:640px){.pgj-arrow{display:flex}}
.pgj-dots{display:flex;justify-content:center;margin-top:14px}
.pgj-dots button{appearance:none;display:flex;align-items:center;justify-content:center;width:26px;height:26px;padding:0;border:0;background:none;cursor:pointer}
.pgj-dots span{display:block;height:8px;border-radius:999px;transition:width .25s ease}
.pgj-cap{margin:14px 0 0;font-size:13px;color:#666666}
.pgj-lb{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.88)}
.pgj-lb-in{position:relative;width:min(92vw,820px);height:min(86vh,1100px)}
.pgj-lb-in img{position:absolute;inset:0;width:100%;height:100%}
.pgj-lb .pgj-ph{background:#333333}
.pgj-lb-x{position:absolute;top:12px;right:12px;z-index:2;display:grid;place-items:center;width:44px;height:44px;border:0;border-radius:50%;background:#FFFFFF;color:#111111;cursor:pointer}
.pgj-three{display:grid;grid-template-columns:minmax(0,1fr);gap:12px}
@media(min-width:768px){.pgj-three{grid-template-columns:repeat(3,minmax(0,1fr))}}
.pgj-five{display:grid;grid-template-columns:minmax(0,1fr);gap:12px}
@media(min-width:640px){.pgj-five{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(min-width:1024px){.pgj-five{grid-template-columns:repeat(5,minmax(0,1fr))}}
.pgj-after{margin:20px 0 0;max-width:34em;font-size:17px;font-weight:700;line-height:1.6;color:#111111}
.pgj-proc{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:minmax(0,1fr);gap:12px}
@media(min-width:768px){.pgj-proc{grid-template-columns:repeat(5,minmax(0,1fr))}}
.pgj-proc li{padding:20px;border:1px solid var(--line);border-radius:16px;background:var(--card)}
.pgj-proc-no{display:block;margin:0 0 8px;font-size:13px;font-weight:900;letter-spacing:.08em;color:var(--gt)}
.pgj-proc b{font-size:17px;font-weight:700}
.pgj-faq{display:grid;gap:10px;max-width:760px}
.pgj-faq-item{border-radius:16px;background:#F5F5F5;overflow:hidden}
.pgj-faq-item summary{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:18px 20px;list-style:none;font-size:16px;font-weight:700;line-height:1.6;color:#111111;cursor:pointer}
.pgj-faq-item summary::-webkit-details-marker{display:none}
.pgj-faq-item summary::after{content:"+";flex:0 0 auto;font-size:22px;font-weight:400;color:#666666}
.pgj-faq-item[open] summary::after{content:"\\2212"}
.pgj-faq-item p{margin:0;padding:0 20px 18px;font-size:15px;line-height:1.7;color:#333333}
.pgj-faq-static{padding:18px 20px;font-size:16px;font-weight:700;line-height:1.6;color:#111111}
.pgj-honest{margin:0 0 10px;font-size:clamp(18px,2.4vw,24px);font-weight:700;line-height:1.55;color:var(--tx)}
.pgj-disc{margin:20px 0 0;font-size:13px;line-height:1.6;color:#9A9A9A}
`;

const smoothTo = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
};

const CheckSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

/** 문서 썸네일 — 파일이 없으면 회색 플레이스홀더 */
function DocImg({ file, alt, contain = true }: { file: string; alt: string; contain?: boolean }) {
  const [err, setErr] = useState(false);
  if (err) return <span className="pgj-ph" aria-hidden="true" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`${IMG_DIR}/${file}`} alt={alt} loading="lazy" draggable={false} onError={() => setErr(true)} style={{ objectFit: contain ? "contain" : "cover" }} />
  );
}

function HistorySlider() {
  const [tab, setTab] = useState(0);
  const [lightbox, setLightbox] = useState<Doc | null>(null);
  const [canScroll, setCanScroll] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [active, setActive] = useState(0);
  const scRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const cur = HISTORY_TABS[tab];

  // 슬라이더 상태 (양끝·스크롤 가능 여부·현재 카드)
  useEffect(() => {
    const el = scRef.current;
    if (!el) return;
    el.scrollLeft = 0;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = el.scrollWidth - el.clientWidth;
      setCanScroll(max > 2);
      setAtStart(el.scrollLeft <= 2);
      setAtEnd(el.scrollLeft >= max - 2);
      const kids = Array.from(el.children) as HTMLElement[];
      let best = 0;
      let bd = Infinity;
      kids.forEach((k, i) => {
        const d = Math.abs(k.offsetLeft - el.scrollLeft);
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      setActive(max > 2 && el.scrollLeft >= max - 2 ? kids.length - 1 : best);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    el.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      el.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [tab]);

  // 라이트박스 — Esc 로 닫기, 열린 동안 배경 스크롤 잠금, 닫기 버튼으로 포커스
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightbox]);

  const smooth = () => (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");
  const step = (dir: -1 | 1) => {
    const el = scRef.current;
    const first = el?.children[0] as HTMLElement | undefined;
    if (!el || !first) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: dir * (first.offsetWidth + gap), behavior: smooth() });
  };
  const goTo = (i: number) => {
    const el = scRef.current;
    const k = el?.children[i] as HTMLElement | undefined;
    if (el && k) el.scrollTo({ left: k.offsetLeft, behavior: smooth() });
  };

  return (
    <div>
      <div className="pgj-tabs" role="tablist" aria-label="진행 이력 분류">
        {HISTORY_TABS.map((t, i) => (
          <button key={t.key} type="button" role="tab" id={`pgj-tab-${t.key}`} aria-selected={i === tab} aria-controls="pgj-tabpanel" className={`pgj-tab${i === tab ? " is-on" : ""}`} onClick={() => setTab(i)}>
            {t.label} <span>({t.items.length})</span>
          </button>
        ))}
      </div>

      <div className="pgj-slide" id="pgj-tabpanel" role="tabpanel" aria-labelledby={`pgj-tab-${cur.key}`}>
        <div className="pgj-docs" ref={scRef} key={cur.key}>
          {cur.items.map((d) => (
            <button key={d.img} type="button" className="pgj-doc" onClick={() => setLightbox(d)} aria-label={`${d.big} ${d.label} 문서 크게 보기`}>
              <span className="pgj-doc-th">
                <DocImg file={d.img} alt={`${cur.label} ${d.big} 문서`} />
              </span>
              <span className="pgj-doc-big">{d.big}</span>
              <span className="pgj-doc-lb">
                {d.label}
                {d.sub ? ` · ${d.sub}` : ""}
              </span>
            </button>
          ))}
        </div>
        {canScroll && (
          <>
            <button type="button" aria-label="이전 이력" disabled={atStart} onClick={() => step(-1)} className="pgj-arrow pgj-arrow--l">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <button type="button" aria-label="다음 이력" disabled={atEnd} onClick={() => step(1)} className="pgj-arrow pgj-arrow--r">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>
      {canScroll && (
        <div className="pgj-dots">
          {cur.items.map((d, i) => (
            <button key={d.img} type="button" aria-label={`${i + 1}번째 이력으로 이동`} aria-current={i === active ? "true" : undefined} onClick={() => goTo(i)}>
              <span style={{ width: i === active ? 22 : 8, background: i === active ? "#009519" : "#CCCCCC" }} />
            </button>
          ))}
        </div>
      )}
      <p className="pgj-cap">박국진 컨설턴트 진행 이력 · 고객사 정보는 비공개 처리했습니다</p>

      {lightbox && (
        <div className="pgj-lb" role="dialog" aria-modal="true" aria-label="진행 이력 문서 확대" onClick={() => setLightbox(null)}>
          <button ref={closeRef} type="button" className="pgj-lb-x" aria-label="닫기" onClick={() => setLightbox(null)}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <div className="pgj-lb-in" onClick={(e) => e.stopPropagation()}>
            <DocImg file={lightbox.img} alt={`${lightbox.big} ${lightbox.label} 문서`} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function ParkGukjinDiagnosisPage() {
  const [mounted, setMounted] = useState(false);
  const [checked, setChecked] = useState<boolean[]>(CHECKS.map(() => false));
  const [photoErr, setPhotoErr] = useState(false);
  const [stickOn, setStickOn] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);
  const bottomFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 컨테이너 내부 <script> 재생성 + 중복 id dedupe 공통 처리
  const injectContainer = (container: HTMLDivElement) => {
    const seen = new Set<string>();
    container.querySelectorAll<HTMLElement>("[id]").forEach((el) => {
      if (!seen.has(el.id)) {
        seen.add(el.id);
        return;
      }
      let n = 2;
      while (document.getElementById(`${el.id}-${n}`)) n++;
      el.id = `${el.id}-${n}`;
    });

    const injected: HTMLScriptElement[] = [];
    container.querySelectorAll("script").forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      document.body.appendChild(newScript);
      injected.push(newScript);
    });
    return injected;
  };

  useEffect(() => {
    if (!mounted) return;
    const container = formRef.current;
    if (!container) return;
    const injected = injectContainer(container);
    return () => injected.forEach((s) => s.remove());
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const container = bottomFormRef.current;
    if (!container) return;
    const injected = injectContainer(container);
    return () => injected.forEach((s) => s.remove());
  }, [mounted]);

  // 모바일 고정 CTA — 히어로와 두 폼 영역이 보이는 동안은 숨긴다
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const visible = new Set<string>();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) visible.add(e.target.id);
        else visible.delete(e.target.id);
      });
      setStickOn(visible.size === 0);
    });
    ["pgj-hero", "pgj-form-top", "apply"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <div className="pgj overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: PGJ_CSS }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_SCHEMA) }} />

      {/* 다크 블록 1: 히어로 + 오픈루프 */}
      <section className="pgj-hero" id="pgj-hero">
        <div className="pgj-wrap pgj-hero-in">
          <div className="pgj-hero-text">
            <p className="pgj-eyebrow">박국진 컨설턴트 · 정책자금 · 신용보증 · 기술보증</p>
            <h1 className="pgj-h1">
              사업자 자금, 못 받는 이유는 대부분 &lsquo;몰라서&rsquo;입니다.
            </h1>
            <p className="pgj-sub">받을 수 있는지부터 확인해 드립니다.</p>
            <button type="button" className="pgj-cta" onClick={() => smoothTo("apply")}>
              우리 사업장 자금진단 신청하기 →
            </button>
          </div>
          <div className="pgj-hero-photo">
            {!photoErr && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/consultants/park-gukjin.jpg" alt="박국진 컨설턴트" onError={() => setPhotoErr(true)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 10%" }} />
            )}
          </div>
        </div>
      </section>

      <section className="pgj-sec pgj-open">
        <div className="pgj-wrap">
          <p className="pgj-open-l">같은 업종, 비슷한 매출의 두 대표가 있습니다.</p>
          <p className="pgj-open-l">한 명은 보증서를 받았고, 한 명은 신청조차 하지 않았습니다.</p>
          <p className="pgj-open-l pgj-open-em">차이는 조건이 아니었습니다. 알고 있었느냐, 하나였습니다.</p>
        </div>
      </section>

      {/* 흰 블록: 체크리스트 */}
      <div className="pgj-blk pgj-light">
        <section className="pgj-sec">
          <div className="pgj-wrap">
            <div className="pgj-bt">
              <h2>이 중 하나라도 해당된다면, 확인해 볼 이유가 충분합니다.</h2>
            </div>
            <div className="pgj-checks">
              {CHECKS.map((c, i) => (
                <button
                  key={c}
                  type="button"
                  role="checkbox"
                  aria-checked={checked[i]}
                  className={`pgj-check${checked[i] ? " is-on" : ""}`}
                  onClick={() => setChecked((s) => s.map((v, j) => (j === i ? !v : v)))}
                >
                  <span className="pgj-check-ic">
                    <CheckSvg />
                  </span>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* 다크 블록 2: 방치 비용 + 통념 뒤집기 */}
      <div className="pgj-blk">
        <section className="pgj-sec">
          <div className="pgj-wrap">
            <div className="pgj-card">
              <h2 className="pgj-h2">혼자 알아보면 기관을 고르는 데서부터 막힙니다.</h2>
              <p className="pgj-p">맞지 않는 곳부터 두드리면, 서류는 쌓이고 시간만 갑니다.</p>
              <p className="pgj-p" style={{ marginBottom: 0 }}>자금이 가장 필요한 시점에 가장 늦게 도착합니다.</p>
            </div>
          </div>
        </section>
        <section className="pgj-sec">
          <div className="pgj-wrap">
            <p className="pgj-old">정책자금은 규모 있는 회사 얘기다.</p>
            <h2 className="pgj-h2">
              아닙니다.
              <br />
              기관마다 보는 기준이 다를 뿐입니다.
            </h2>
          </div>
        </section>
      </div>

      {/* 흰 블록: 진행 이력 + 상단 폼 + 3가지 차이 + 자금진단 5가지 */}
      <div className="pgj-blk pgj-light">
        <section className="pgj-sec">
          <div className="pgj-wrap">
            <div className="pgj-bt">
              <h2>2026년 진행 이력 — 보증 7건 · 인증 5건</h2>
            </div>
            <HistorySlider />
          </div>
        </section>

        <section className="pgj-sec" id="pgj-form-top">
          <div className="pgj-wrap">
            <div className="pgj-formbox">
              {mounted ? (
                <div ref={formRef} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: FORM_HTML }} />
              ) : (
                <div ref={formRef} suppressHydrationWarning />
              )}
            </div>
          </div>
        </section>

        <section className="pgj-sec">
          <div className="pgj-wrap">
            <div className="pgj-bt">
              <h2>받는 대표의 3가지 차이</h2>
            </div>
            <div className="pgj-three">
              {DIFFS.map((d) => (
                <div className="pgj-step" key={d.no}>
                  <span className="pgj-step-no">{d.no}</span>
                  <h3>{d.title}</h3>
                  <p>{d.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pgj-sec">
          <div className="pgj-wrap">
            <div className="pgj-bt">
              <h2>자금진단 5가지</h2>
            </div>
            <div className="pgj-five">
              {DIAG5.map((d) => (
                <div className="pgj-step" key={d.title}>
                  <h3>{d.title}</h3>
                  <p>{d.body}</p>
                </div>
              ))}
            </div>
            <p className="pgj-after">진단이 끝나면, 검토할 기관과 준비할 서류, 신청 순서가 한 장으로 정리됩니다.</p>
          </div>
        </section>
      </div>

      {/* 다크: 진행 절차 */}
      <div className="pgj-blk">
        <section className="pgj-sec">
          <div className="pgj-wrap">
            <div className="pgj-bt">
              <h2>진행 절차</h2>
            </div>
            <ol className="pgj-proc">
              {PROCESS.map((p, i) => (
                <li key={p}>
                  <span className="pgj-proc-no">{String(i + 1).padStart(2, "0")}</span>
                  <b>{p}</b>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>

      {/* 흰: FAQ */}
      <div className="pgj-blk pgj-light">
        <section className="pgj-sec">
          <div className="pgj-wrap">
            <div className="pgj-bt">
              <h2>자주 확인하시는 내용</h2>
            </div>
            <div className="pgj-faq">
              {FAQS.map((f) =>
                f.a ? (
                  <details className="pgj-faq-item" key={f.q}>
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ) : (
                  <div className="pgj-faq-item pgj-faq-static" key={f.q}>
                    {f.q}
                  </div>
                ),
              )}
            </div>
          </div>
        </section>
      </div>

      {/* 다크: 솔직히 + 신청 */}
      <div className="pgj-blk">
        <section className="pgj-sec" id="apply">
          <div className="pgj-wrap">
            <div className="pgj-card">
              <p className="pgj-honest">솔직히 말씀드리면, 모든 사업장이 받을 수 있는 건 아닙니다.</p>
              <p className="pgj-honest">그래서 신청 전에 진단부터 합니다.</p>
              <p className="pgj-honest">안 되는 이유를 아는 것도, 다음 준비의 시작입니다.</p>
              <button type="button" className="pgj-cta" style={{ marginTop: 20 }} onClick={() => smoothTo("pgj-form-bottom-wrap")}>
                박국진 컨설턴트에게 진단 신청하기 →
              </button>
            </div>
            <div className="pgj-formbox" id="pgj-form-bottom-wrap" style={{ marginTop: 24 }}>
              {mounted ? (
                <div ref={bottomFormRef} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: FORM_HTML_BOTTOM }} />
              ) : (
                <div ref={bottomFormRef} suppressHydrationWarning />
              )}
            </div>
            <p className="pgj-disc">자금 지원과 보증 승인은 각 기관의 심사로 결정되며, 본 컨설팅은 승인을 보장하지 않습니다.</p>
          </div>
        </section>
      </div>

      {/* 다른 멘토 확인 → 추천 서비스 */}
      <ConsultantCarousel currentSlug="park-gukjin" />

      <section className="w-full bg-[#f8f9fa]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <h2 className="mb-8 text-center text-xl font-extrabold text-[#1a1a1a] sm:mb-12 sm:text-2xl">이런 서비스도 있어요</h2>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {RELATED_SERVICES.map((s) => (
              <RelatedServiceCard key={s.href} service={s} />
            ))}
          </div>
        </div>
      </section>

      {/* 모바일 고정 CTA 가 푸터를 가리지 않도록 */}
      <div className="pgj-spacer" aria-hidden="true" />
      <div className={`pgj-stick${stickOn ? " is-on" : ""}`} aria-hidden={!stickOn} data-sticky-cta>
        <button type="button" className="pgj-cta" tabIndex={stickOn ? 0 : -1} onClick={() => smoothTo("pgj-form-bottom-wrap")}>
          우리 사업장 자금진단 신청하기 →
        </button>
      </div>
    </div>
  );
}
