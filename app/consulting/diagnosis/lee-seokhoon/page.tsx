"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 진단 멘토 상세페이지 — 이석훈 (운영시스템 / 데이터·AI) · 박국진·황현진 v2 구조를 그대로 재사용
//  카피 출처: lee-seokhoon-copy.md
//  구조(다크/화이트 교차): 히어로 → 공감 → 문제 재정의 → 왜 이석훈 멘토인가 + 진단 4가지 → AI 진단 화면 예시
//   → 진단 후 달라지는 것 + 후기 카드(가로 스와이프) → 클로징 + 신청(하단 상담폼, -bottom id)
//   → ConsultantCarousel → 추천 카드. 모바일 하단 고정 CTA.
//  · 클래스 접두사 lsh-, 스타일은 이 파일의 LSH_CSS. 글꼴은 사이트 기본 Noto Sans KR.
//  · 상담폼은 허준영 폼과 같은 전송 구조(네이티브 form + 숨김 iframe, source="진단상담", token·action 동일).
//    멘토 라디오 기본 선택만 이석훈.
//  · mounted 클라이언트 전용 폼 렌더 + suppressHydrationWarning, innerHTML <script> 는 주입 이펙트가 재생성.
//  · 카피 규칙: 물음표 금지, 영문 eyebrow 금지, "컨설턴트" 대신 "멘토", 도입 센터 수·거래액 등 확인 안 된 수치 금지.
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
  serviceType: "피트니스 센터 운영시스템·데이터 AI 진단",
  name: "이석훈 멘토 운영 진단",
  url: `${SITE_URL}/consulting/diagnosis/lee-seokhoon`,
  areaServed: "KR",
  description:
    "매출은 오르는데 통장에 남는 돈이 없는 센터를 위한 운영 진단. 이석훈 멘토가 센터 안에서 새는 돈을 데이터로 찾아드립니다.",
  provider: {
    "@type": "Organization",
    name: "더그로우컴퍼니",
    url: SITE_URL,
    employee: {
      "@type": "Person",
      name: "이석훈",
      jobTitle: "운영시스템·데이터 AI 멘토",
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

// ─── 진단 상담 폼 HTML (허준영 폼과 동일 구조, 폼 스코프 스크립트) ────────────────
const FORM_HTML = `<div class="consult-form-wrapper">
  <div class="form-header">
    <h2>진단 솔루션 상담 신청(무료)</h2>
  </div>

  <!-- 전송은 네이티브 폼 POST + 숨김 iframe 방식이다. action/method/target 과
       source·token hidden 을 마크업에 직접 둬서, 아래 주입 스크립트가 죽어도
       브라우저가 폼을 그대로 전송한다 (리드 유실 방지 폴백). -->
  <form id="consultForm" class="consult-form"
        action="https://script.google.com/macros/s/AKfycbyTIVLMDS-DQjOZ1fIP9DbzJ2NONxyn6mdjEik1_ZG31XB9TVO0Y5_odvFwO1M0AcJ21Q/exec"
        method="POST" target="diag_iframe_top">
    <div class="form-group">
      <label class="form-label">이름 <span class="required">*</span></label>
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
      <div class="checkbox-group">
        <label class="checkbox-label">
          <input type="checkbox" name="industry" value="헬스장" class="industry-checkbox">
          <span class="checkbox-text">헬스장</span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" name="industry" value="PT샵" class="industry-checkbox">
          <span class="checkbox-text">PT샵</span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" name="industry" value="필라테스샵" class="industry-checkbox">
          <span class="checkbox-text">필라테스샵</span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" name="industry" value="골프장" class="industry-checkbox">
          <span class="checkbox-text">골프장</span>
        </label>
        <label class="checkbox-label etc-label">
          <input type="checkbox" name="industry" value="기타" class="industry-checkbox" id="industryEtcCheck">
          <span class="checkbox-text">기타</span>
          <input type="text" name="industryEtc" id="industryEtc" class="etc-input" placeholder="직접입력" disabled>
        </label>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">지역을 알려주세요. <span class="required">*</span></label>
      <input type="text" name="area" id="area" placeholder="예) 서울 마포구, 경기 남부, 부산 서면 인근 등" required>
    </div>

    <div class="form-group">
      <label class="form-label">신청 경로를 알려주세요. <span class="required">*</span></label>
      <div class="checkbox-group">
        <label class="checkbox-label">
          <input type="checkbox" name="route" value="네이버 검색" class="route-checkbox">
          <span class="checkbox-text">네이버 검색</span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" name="route" value="인스타/페이스북 광고" class="route-checkbox">
          <span class="checkbox-text">인스타/페이스북 광고</span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" name="route" value="네이버 블로그" class="route-checkbox">
          <span class="checkbox-text">네이버 블로그</span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" name="route" value="지인 소개 / 아카데미 수강생" class="route-checkbox">
          <span class="checkbox-text">지인 소개 / 아카데미 수강생</span>
        </label>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">원하시는 솔루션 분야를 선택해주세요. (중복 선택 가능합니다) <span class="required">*</span></label>
      <div class="checkbox-group">
        <label class="checkbox-label">
          <input type="checkbox" name="consultField" value="FC운영" class="consultField-checkbox">
          <span class="checkbox-text">FC운영</span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" name="consultField" value="리더십" class="consultField-checkbox">
          <span class="checkbox-text">리더십</span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" name="consultField" value="PT" class="consultField-checkbox">
          <span class="checkbox-text">PT</span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" name="consultField" value="인적자원관리" class="consultField-checkbox">
          <span class="checkbox-text">인적자원관리</span>
        </label>
        <label class="checkbox-label">
          <input type="checkbox" name="consultField" value="세일즈·상담" class="consultField-checkbox">
          <span class="checkbox-text">세일즈·상담</span>
        </label>
      </div>
    </div>

    <div class="form-group">
      <label class="form-label">도움받고 싶은 멘토를 알려주세요. <span class="required">*</span></label>
      <div class="checkbox-group">
        <label class="checkbox-label">
          <input type="radio" name="consultant" value="김재강" class="consultant-radio" required>
          <span class="checkbox-text">김재강</span>
        </label>
        <label class="checkbox-label">
          <input type="radio" name="consultant" value="김승호" class="consultant-radio">
          <span class="checkbox-text">김승호</span>
        </label>
        <label class="checkbox-label">
          <input type="radio" name="consultant" value="박정민" class="consultant-radio">
          <span class="checkbox-text">박정민</span>
        </label>
        <label class="checkbox-label">
          <input type="radio" name="consultant" value="구진완" class="consultant-radio">
          <span class="checkbox-text">구진완</span>
        </label>
        <label class="checkbox-label">
          <input type="radio" name="consultant" value="허준영" class="consultant-radio">
          <span class="checkbox-text">허준영</span>
        </label>
        <label class="checkbox-label">
          <input type="radio" name="consultant" value="황현진" class="consultant-radio">
          <span class="checkbox-text">황현진</span>
        </label>
        <label class="checkbox-label">
          <input type="radio" name="consultant" value="이석훈" class="consultant-radio" checked>
          <span class="checkbox-text">이석훈</span>
        </label>
      </div>
    </div>

    <!-- 페이지 구분 · 보안 토큰 — 스크립트 상황과 무관하게 항상 전송된다 -->
    <input type="hidden" name="source" value="진단상담">
    <input type="hidden" name="token" value="grow2026secure">

    <!-- 전송용 조립 필드 — 제출 핸들러가 검증 통과 후 값을 넣고 disabled 를 푼다.
         기본이 disabled 인 이유: 스크립트가 죽은 폴백 경로에서 보내지지 않아야
         화면 입력칸(phone1~3 / phoneConfirm1~3 / 체크박스)의 값이 살아남는다.
         (반대로 항상 enabled 이면 폴백에서 빈 industry 가 먼저 전송되어 값을 덮어버린다) -->
    <input type="hidden" name="phone" class="diag-h-phone" value="" disabled>
    <input type="hidden" name="phoneCheck1" class="diag-h-pc1" value="" disabled>
    <input type="hidden" name="phoneCheck2" class="diag-h-pc2" value="" disabled>
    <input type="hidden" name="phoneCheck3" class="diag-h-pc3" value="" disabled>
    <input type="hidden" name="industry" class="diag-h-industry" value="" disabled>
    <input type="hidden" name="route" class="diag-h-route" value="" disabled>
    <input type="hidden" name="consultField" class="diag-h-cfield" value="" disabled>

    <div class="form-submit">
      <button type="submit" id="submitBtn">작성</button>
    </div>
  </form>

  <!-- 전송 대상 iframe. 화면에 전혀 자리를 차지하지 않도록 display:none · 0×0.
       src="about:blank" 은 초기 load 이벤트를 주입 시점에 발생시켜,
       제출 직전에 붙이는 1회용 load 리스너가 오지 않게 한다. -->
  <iframe name="diag_iframe_top" class="diag-iframe" title="진단 상담 신청 전송" src="about:blank"
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
</style>

<script>
(function(){
  // 전송 URL·token·source 는 모두 마크업의 form[action] / hidden input 으로 옮겼다.
  // 이 스크립트가 한 줄도 실행되지 않아도 및에 발생하는 상황을 막기 위해 마크업에 둔다.

  // 폼 스코프(각 .consult-form-wrapper) 기준으로 동작 — id 하드코딩 없이 초기화.
  // 상단/하단 두 개의 폼이 있어도 각자 정상 동작하며, id 접미사(-bottom)와 무관.
  // DOMContentLoaded 대신 즉시 실행하고, data-lsh-init 로 재실행 시 중복 바인딩을 막는다.
  function initForm(wrapper){
    if (!wrapper || wrapper.getAttribute('data-lsh-init')) return;
    wrapper.setAttribute('data-lsh-init', '1');

    var form = wrapper.querySelector('.consult-form');
    if (!form) return;

    function q(sel){ return wrapper.querySelector(sel); }
    function qa(sel){ return wrapper.querySelectorAll(sel); }
    function val(sel){ var el = q(sel); return el ? el.value : ''; }

    var etcCheckbox = q('.industry-checkbox[value="기타"]');
    var etcInput = q('.etc-input');
    if (etcCheckbox && etcInput){
      etcCheckbox.addEventListener('change', function(){
        etcInput.disabled = !this.checked;
        if (this.checked) etcInput.focus(); else etcInput.value = '';
      });
    }

    var phoneInputs = qa('.phone-inputs input');
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

    // 전송용 조립 hidden (기본 disabled — 마크업 주석 참고)
    var hid = {
      phone:        q('.diag-h-phone'),
      phoneCheck1:  q('.diag-h-pc1'),
      phoneCheck2:  q('.diag-h-pc2'),
      phoneCheck3:  q('.diag-h-pc3'),
      industry:     q('.diag-h-industry'),
      route:        q('.diag-h-route'),
      consultField: q('.diag-h-cfield')
    };

    function setHidDisabled(flag){
      for (var k in hid){ if (hid[k]) hid[k].disabled = flag; }
    }

    // industry / route / consultField 는 체크박스와 조립 hidden 의 name 이 같다.
    // 정상 경로에서는 체크박스를 disabled 로 빼서 조립값만 전송되게 한다.
    // (체크박스를 그대로 두면 같은 name 이 여러 번 전송되어 값 형식이 달라진다)
    function setBoxesDisabled(flag){
      var boxes = qa('.industry-checkbox, .route-checkbox, .consultField-checkbox');
      for (var b = 0; b < boxes.length; b++){ boxes[b].disabled = flag; }
    }

    // 전송이 끝나면(성공·실패 무관) 화면을 다시 쓸 수 있는 상태로 되돌린다.
    // form.reset() 은 disabled 를 건드리지 않으므로 여기서 직접 복구해야 한다.
    function restoreForm(){
      setBoxesDisabled(false);
      setHidDisabled(true);
      if (etcInput) etcInput.disabled = !(etcCheckbox && etcCheckbox.checked);
      if (submitBtn){ submitBtn.disabled = false; submitBtn.textContent = '작성'; }
    }

    form.addEventListener('submit', function(e){
      e.preventDefault();

      var done = false;
      var timer = null;
      var onLoad = null;

      try {
        // 번호 일치 — 창업 폼과 같은 칸별 비교.
        // 이어붙여 비교하면 010|1234|5678 과 0101|234|5678 이 같다고 판정되던 문제가 있었다.
        var p1 = val('[name="phone1"]'), p2 = val('[name="phone2"]'), p3 = val('[name="phone3"]');
        var c1 = val('[name="phoneConfirm1"]'), c2 = val('[name="phoneConfirm2"]'), c3 = val('[name="phoneConfirm3"]');
        if (p1 !== c1 || p2 !== c2 || p3 !== c3){ alert('연락처가 일치하지 않습니다. 다시 확인해주세요.'); return; }

        var selectedIndustry = qa('.industry-checkbox:checked');
        if (selectedIndustry.length === 0){ alert('업종을 선택해주세요.'); return; }
        var selectedRoute = qa('.route-checkbox:checked');
        if (selectedRoute.length === 0){ alert('신청 경로를 선택해주세요.'); return; }
        var selectedConsultField = qa('.consultField-checkbox:checked');
        if (selectedConsultField.length === 0){ alert('원하시는 솔루션 분야를 선택해주세요.'); return; }
        var selectedConsultant = q('.consultant-radio:checked');
        if (!selectedConsultant){ alert('도움받고 싶은 멘토를 선택해주세요.'); return; }

        var industryValues = Array.prototype.map.call(selectedIndustry, function(cb){ return cb.value; });
        if (etcCheckbox && etcCheckbox.checked && etcInput && etcInput.value.trim()){
          industryValues = industryValues.filter(function(v){ return v !== '기타'; });
          industryValues.push('기타 - ' + etcInput.value.trim());
        }

        // 조립 hidden 채우기 — 값 형식은 기존 fetch 페이로드와 동일하게 유지한다.
        if (hid.phone)        hid.phone.value = p1 + '-' + p2 + '-' + p3;
        if (hid.phoneCheck1)  hid.phoneCheck1.value = c1;
        if (hid.phoneCheck2)  hid.phoneCheck2.value = c2;
        if (hid.phoneCheck3)  hid.phoneCheck3.value = c3;
        if (hid.industry)     hid.industry.value = industryValues.join(', ');
        if (hid.route)        hid.route.value = Array.prototype.map.call(selectedRoute, function(cb){ return cb.value; }).join(', ');
        if (hid.consultField) hid.consultField.value = Array.prototype.map.call(selectedConsultField, function(cb){ return cb.value; }).join(', ');

        setHidDisabled(false);
        setBoxesDisabled(true);

        if (submitBtn){ submitBtn.disabled = true; submitBtn.textContent = '전송중...'; }

        if (!iframe) throw new Error('diag iframe not found');

        // 성공 판정은 iframe 의 load 1회. 응답 본문은 교차 출처라 읽을 수 없으므로
        // "요청이 완료되어 응답 문서가 로드됨" 까지만 확인한다.
        onLoad = function(){
          if (done) return;
          done = true;
          if (timer) clearTimeout(timer);
          iframe.removeEventListener('load', onLoad);

          /* GA4 전환 이벤트 (gtag 미로드 시 조용히 무시) */
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'form_submit', { form_source: '진단상담' });
          }
          /* 메타 픽셀 Lead — 이 페이지에 픽셀이 매핑된 경우에만 전송된다 */
          if (typeof window.__tgcFbTrack === 'function') {
            window.__tgcFbTrack('Lead', { content_name: '진단상담' });
          }
          alert('진단 솔루션 상담 신청이 정상적으로 접수되었습니다.\\n빠른 시일 내에 연락드리겠습니다.');
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
        // 예외로 전송이 끊긴 경우 — 리스너·타이머를 걷고 버튼을 되돌린다.
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
  // iframe 이름과 form[target] 은 id 가 아니어서 위 치환에 걸리지 않는다.
  // 상단/하단 폼이 서로 다른 iframe 을 쓰도록 따로 바꾼다.
  .replace(/diag_iframe_top/g, "diag_iframe_bottom");

// ─── 이석훈 멘토 (운영시스템 / 데이터·AI) — 더그로우 메인 톤(DESIGN.md 1층) + 다크/화이트 교차(v2) ──────────────
// 카피는 lee-seokhoon-copy.md 그대로. 아래 문구 외 수치·실적·경력을 새로 만들지 않는다. 클래스 접두사 lsh-.
// 이미지: 프로필 /consultants/lee-seokhun.png(기존 파일), 6번 화면 lsh-ai-briefing.png, 4번 현장 사진 lsh-ai-day.png.

const IMG_PROFILE = "/consultants/lee-seokhun.png";
const IMG_DAY = "/consultants/lee-seokhoon/lsh-ai-day.png";
const IMG_BRIEFING = "/consultants/lee-seokhoon/lsh-ai-briefing.png";

const PAINS = [
  "선수금으로 들어온 돈을 이번 달 매출로 보고 계십니다",
  "강사 정산을 아직 엑셀로 하고 계십니다",
  "재등록·휴면 회원 관리를 감으로 하고 계십니다",
  "대표님이 자리를 비우면 센터가 멈춥니다",
];

const CAREER = [
  "미국에서 컴퓨터 사이언스 전공",
  "글로벌 피트니스 기업 24 Hour Fitness 근무",
  "2015년 피트니스 센터 운영 솔루션 바디코디 설립, 현재 대표",
  "GC녹십자홀딩스·퓨처플레이·신한캐피탈 시리즈 A 투자 유치",
  "피트니스 센터 대표·관리자 대상 운영 실무 AI 활용 교육 진행",
];

const FOUR = [
  { no: "01", title: "매출·선수금 구조", body: "들어온 돈과 실제 번 돈을 나눠서 봅니다" },
  { no: "02", title: "회원 이탈·휴면", body: "떠나기 전에 신호를 잡습니다" },
  { no: "03", title: "강사 정산·성과", body: "감이 아닌 숫자로 강사를 봅니다" },
  { no: "04", title: "대표 없이 돌아가는 루틴", body: "매일·매주 할 일을 시스템으로 만듭니다" },
];

const CHIPS = ["오늘이 마지막 수업", "오늘 이용권 만료", "이용권 만료 D-7", "PT 잔여 3회 이하", "장기 미출석 이탈 위험", "오늘 생일"];

const FLOW = ["데이터 진단", "오늘의 실행 목록", "매주 점검"];

const VOICES = [
  {
    label: "매일 쓰는 경영 파트너",
    quote: "이제 바디코디 AI 없으면 뒤처질 수밖에 없을 것이다. 너무 재미있고 도움이 되니까 AI와 매일 밤새고 있다.",
    by: "바디코디 AI 이용 센터 대표",
  },
  {
    label: "분석이 실행으로",
    quote: "잘 인지하지 못했던 사실을 이해하기 쉽게 딱 알려주고, 실행 전략도 짜주니까 진짜 매출이 오르고, 앞으로 더 잘될 거란 확신이 든다.",
    by: "바디코디 AI 이용 센터 대표",
  },
  {
    label: "다음 행동이 명확하게",
    quote: "이런 게 가능할 줄은 생각도 못 했다. 대화할수록 무엇을 해야 하는지 명확해진다. 이제 엄청난 수준의 참모와 함께 사업한다.",
    by: "바디코디 AI 이용 센터 총괄 대표",
  },
];

const LSH_CSS = `
.lsh{--bg:#111111;--bg2:#0A0A0A;--card:#161616;--chip:#1E1E1E;--tx:#EEEEEE;--sub:#BDBDBD;--sub2:#9A9A9A;--g:#009519;--gt:#2FBF5F;--line:rgba(255,255,255,.1);background:var(--bg);color:var(--tx);font-family:inherit;font-size:16px;line-height:1.75;word-break:keep-all;overflow-wrap:anywhere}
.lsh *{box-sizing:border-box}
.lsh [id]{scroll-margin-top:104px}
.lsh a:focus-visible,.lsh button:focus-visible{outline:2px solid var(--gt);outline-offset:3px}
.lsh a,.lsh button{touch-action:manipulation}
.lsh-wrap{max-width:1152px;margin:0 auto;padding:0 16px}
@media(min-width:640px){.lsh-wrap{padding:0 24px}}
@media(min-width:1024px){.lsh-wrap{padding:0 32px}}
.lsh-sec{padding:56px 0}
@media(min-width:640px){.lsh-sec{padding:80px 0}}
/* 다크/화이트 교차 — 같은 색 섹션은 한 덩어리로 묶고 구분선 없이 여백(64px)으로만 나눈다 */
.lsh-blk{padding:64px 0}
.lsh-blk .lsh-sec{padding:0}
.lsh-blk .lsh-sec+.lsh-sec{margin-top:64px}
.lsh-light{--tx:#111111;--sub:#333333;--sub2:#666666;--card:#F5F5F5;--chip:#F0F0F0;--gt:#007A14;--line:transparent;background:#FFFFFF;color:#111111}
.lsh-light .lsh-stat span,.lsh-light .lsh-vid-cap,.lsh-light .lsh-left small,.lsh-light .lsh-scene-l{color:#666666}
.lsh-light .lsh-chips li{color:#333333}
.lsh-light .lsh-check:hover{border-color:#CCCCCC}
.lsh-light .lsh-check-ic{border-color:#CCCCCC}
.lsh-light .lsh-check.is-on{border-color:var(--g)}
.lsh-light .lsh-check.is-on .lsh-check-ic{border-color:var(--g)}
.lsh-light .lsh-bad{color:#111111}
.lsh-light .is-fixed .lsh-bad{color:#999999}
.lsh-light .lsh-strike{background-image:linear-gradient(#999999,#999999)}
.lsh-light .lsh-fix-in{background:#EAF6EC}
.lsh-light .lsh-good{color:#0B3D17}
.lsh-light .lsh-note{color:#2E6B3F}
.lsh-light .is-fixed .lsh-sw{background:#2A2A2A;color:#EEEEEE}
.lsh-light .lsh-left{border:0;box-shadow:inset 4px 0 0 var(--g)}
.lsh-eyebrow{margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--gt)}
.lsh-h2{margin:0 0 16px;max-width:22em;font-size:clamp(24px,3.4vw,36px);font-weight:900;line-height:1.35;letter-spacing:-.02em;color:var(--tx)}
.lsh-bt{display:flex;align-items:center;gap:12px;margin:0 0 20px}
.lsh-bt::before{content:"";flex:0 0 4px;height:20px;border-radius:999px;background:var(--g)}
.lsh-bt h2{margin:0;font-size:clamp(22px,3vw,30px);font-weight:900;line-height:1.35;letter-spacing:-.02em}
.lsh-p{margin:0 0 16px;max-width:34em;color:var(--sub)}
.lsh-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:24px}
@media(min-width:640px){.lsh-card{padding:32px}}
.lsh-cta{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:54px;padding:0 28px;border:0;border-radius:12px;background:var(--g);color:#fff;font:inherit;font-size:19px;font-weight:900;text-decoration:none;cursor:pointer;transition:background-color .2s}
.lsh-cta:hover{background:#007a14}

/* 1. 히어로 — 모바일은 사진을 화면 가득 깔고 아래 60% 를 #111 로 녹인다. 데스크톱은 좌 텍스트 / 우 사진 카드 */
.lsh-hero{position:relative;overflow:hidden;min-height:720px;display:flex;align-items:flex-end}
.lsh-hero-in{width:100%;padding-top:470px;padding-bottom:48px}
.lsh-hero-text{position:relative;z-index:1}
.lsh-hero-photo{position:absolute;inset:0}
.lsh-hero-photo::after{content:"";position:absolute;left:0;right:0;bottom:0;height:60%;background:linear-gradient(to bottom,rgba(17,17,17,0) 0%,rgba(17,17,17,.92) 28%,#111111 52%)}
.lsh-h1{margin:0 0 20px;font-size:clamp(34px,5.6vw,60px);font-weight:900;line-height:1.2;letter-spacing:-.03em}
.lsh-sub{margin:0 0 28px;max-width:28em;font-size:17px;color:var(--sub)}
@media(min-width:1024px){
  .lsh-hero{display:block;min-height:0;padding:72px 0}
  .lsh-hero-in{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:56px;align-items:center;padding-top:0;padding-bottom:0}
  .lsh-hero-photo{position:relative;inset:auto;order:2;aspect-ratio:4/5;border-radius:16px;overflow:hidden;border:1px solid var(--line);background:var(--card)}
  .lsh-hero-photo::after{display:none}
}

/* 3. 공감 체크 */
.lsh-checks{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;margin:24px 0 0}
@media(min-width:768px){.lsh-checks{grid-template-columns:repeat(2,minmax(0,1fr))}}
.lsh-check{display:flex;align-items:center;gap:14px;width:100%;padding:20px;border:1px solid var(--line);border-radius:16px;background:var(--card);color:var(--tx);font:inherit;font-size:16px;font-weight:600;text-align:left;cursor:pointer;transition:border-color .2s}
.lsh-check:hover{border-color:rgba(255,255,255,.3)}
.lsh-check-ic{flex:0 0 26px;width:26px;height:26px;display:grid;place-items:center;border:2px solid #4a4a4a;border-radius:50%;color:transparent;transition:background-color .2s,border-color .2s}
.lsh-check-ic svg{width:14px;height:14px}
.lsh-check.is-on{border-color:var(--g)}
.lsh-check.is-on .lsh-check-ic{background:var(--g);border-color:var(--g);color:#fff}
.lsh-count{margin:20px 0 0;font-size:16px;font-weight:700;color:var(--gt)}

/* 4. 방치 비용 · 11. 솔직히 */
.lsh-card .lsh-h2{max-width:24em}

/* 5. 뒤집기 */
.lsh-old{margin:0 0 12px;font-size:18px;color:var(--sub2);text-decoration:line-through}
.lsh-em{color:var(--gt)}

/* 6. 권위 */
.lsh-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:28px 0 0;max-width:640px}
.lsh-stat{padding:22px 20px;border:1px solid var(--line);border-radius:16px;background:var(--card)}
.lsh-stat b{display:block;font-size:clamp(26px,3.6vw,36px);font-weight:900;line-height:1.15;color:var(--gt);font-variant-numeric:tabular-nums;white-space:nowrap}
.lsh-stat span{display:block;margin-top:6px;font-size:13px;color:var(--sub)}
.lsh-hist{list-style:none;margin:28px 0 0;padding:0;display:grid;gap:10px;max-width:40em}
.lsh-hist li{position:relative;padding-left:16px;color:var(--tx)}
.lsh-hist li::before{content:"";position:absolute;left:0;top:.8em;width:6px;height:6px;border-radius:50%;background:var(--g)}
.lsh-chips{display:flex;flex-wrap:wrap;gap:8px;margin:28px 0 0;padding:0;list-style:none}
.lsh-chips li{padding:8px 16px;border-radius:999px;background:var(--chip);font-size:14px;font-weight:600;color:var(--tx)}
.lsh-books{display:flex;gap:14px;margin:28px 0 0;padding:0 0 8px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}
.lsh-books img{flex:0 0 auto;display:block;height:180px;width:auto;border-radius:6px;scroll-snap-align:start;background:var(--chip)}

/* 상담폼 래퍼 — 폼 내부는 다른 멘토 페이지와 같은 원래 초록. 감싸는 상자만 둥글게 */
.lsh-formbox{max-width:840px;margin:0 auto;border-radius:16px;overflow:hidden}
.lsh-formsec{padding:56px 0}
@media(min-width:640px){.lsh-formsec{padding:72px 0}}
.lsh-formsec .lsh-h2{max-width:26em}

/* 7. 교정본 */
.lsh-scenes{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;margin:32px 0 0}
@media(min-width:900px){.lsh-scenes{grid-template-columns:repeat(3,minmax(0,1fr))}}
.lsh-scene{display:flex;flex-direction:column;padding:24px;border:1px solid var(--line);border-radius:16px;background:var(--card)}
.lsh-scene-l{margin:0 0 14px;font-size:13px;font-weight:700;color:var(--sub2)}
.lsh-scene-l b{margin-right:8px;font-size:15px;font-weight:900;color:var(--gt)}
.lsh-bad{margin:0;font-size:17px;font-weight:700;line-height:1.7;color:var(--tx);transition:color .4s ease}
.lsh-strike{background-image:linear-gradient(#9A9A9A,#9A9A9A);background-repeat:no-repeat;background-position:0 58%;background-size:0% 2px;-webkit-box-decoration-break:clone;box-decoration-break:clone;transition:background-size .4s ease-out}
.is-fixed .lsh-bad{color:var(--sub2)}
.is-fixed .lsh-strike{background-size:100% 2px}
.lsh-fix{max-height:0;margin:0;opacity:0;overflow:hidden;transition:opacity .4s ease .2s,max-height .4s ease .2s,margin .4s ease .2s}
.is-fixed .lsh-fix{max-height:360px;margin:14px 0 0;opacity:1}
.lsh-fix-in{padding:16px;border-radius:12px;background:#0F2416}
.lsh-good{margin:0 0 8px;font-size:18px;font-weight:900;line-height:1.55;color:#FFFFFF}
.lsh-note{margin:0;font-size:14px;line-height:1.65;color:#A7D8B5}
.lsh-sw{margin-top:20px;min-height:48px;padding:0 16px;border:0;border-radius:12px;background:var(--g);color:#fff;font:inherit;font-size:15px;font-weight:800;cursor:pointer;transition:background-color .2s}
.lsh-sw:hover{background:#007a14}
.is-fixed .lsh-sw{background:#2A2A2A;color:var(--tx)}
.is-fixed .lsh-sw:hover{background:#363636}
.lsh-after{margin:16px 0 0;padding:24px;border:1px solid var(--line);border-radius:16px;background:var(--card);font-size:18px;font-weight:700;line-height:1.6}
@media(prefers-reduced-motion:reduce){.lsh-strike,.lsh-fix,.lsh-bad,.lsh-check,.lsh-check-ic,.lsh-sw,.lsh-cta{transition:none}}

/* 8. 영상 */
.lsh-vids{display:flex;gap:16px;margin:28px 0 0;padding:0 0 8px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}
.lsh-vid{flex:0 0 min(260px,72vw);scroll-snap-align:start}
.lsh-vid-card{position:relative;aspect-ratio:9/16;border-radius:16px;overflow:hidden;background:var(--card)}
.lsh-vid-card video{display:block;width:100%;height:100%;object-fit:cover}
.lsh-vid-cap{margin:8px 0 0;font-size:13px;color:var(--sub)}

/* 9. 솔루션 */
.lsh-steps{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;margin:28px 0 16px}
@media(min-width:640px){.lsh-steps{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(min-width:1024px){.lsh-steps{grid-template-columns:repeat(4,minmax(0,1fr))}}
.lsh-step{padding:22px;border:1px solid var(--line);border-radius:16px;background:var(--card)}
.lsh-step-no{display:block;margin:0 0 10px;font-size:13px;font-weight:900;letter-spacing:.08em;color:var(--gt)}
.lsh-step h3{margin:0 0 8px;font-size:18px;font-weight:700}
.lsh-step p{margin:0;font-size:14px;line-height:1.7;color:var(--sub)}
.lsh-left{margin:0;padding:24px;border:1px solid var(--g);border-radius:16px;background:var(--card)}
.lsh-left b{display:block;margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:.08em;color:var(--gt)}
.lsh-left p{margin:0 0 8px;color:var(--tx)}
.lsh-left small{display:block;font-size:13px;color:var(--sub)}

/* 10. 대상 */
.lsh-fits{list-style:none;margin:8px 0 0;padding:0;display:grid;gap:12px;max-width:40em}
.lsh-fits li{display:flex;align-items:flex-start;gap:12px;font-size:17px;font-weight:600}
.lsh-fits svg{flex:0 0 24px;width:24px;height:24px;margin-top:2px;color:var(--gt)}

/* 11. 솔직히 */
.lsh-link{display:inline-flex;align-items:center;gap:6px;margin-top:8px;font-weight:700;color:var(--gt);text-decoration:none}
.lsh-link:hover{text-decoration:underline;text-underline-offset:4px}

/* 모바일 고정 CTA */
.lsh-stick{position:fixed;left:0;right:0;bottom:0;z-index:40;padding:12px 16px calc(12px + env(safe-area-inset-bottom));background:rgba(17,17,17,.97);border-top:1px solid var(--line);transform:translateY(100%);visibility:hidden;transition:transform .25s ease,visibility 0s linear .25s}
.lsh-stick.is-on{transform:none;visibility:visible;transition-delay:0s}
.lsh-stick .lsh-cta{width:100%}
@media(min-width:1024px){.lsh-stick{display:none}}
@media(prefers-reduced-motion:reduce){.lsh-stick,.lsh-stick.is-on{transition:none}}
.lsh-spacer{height:84px}
@media(min-width:1024px){.lsh-spacer{display:none}}

/* ── 이석훈 페이지 전용 ── */
.lsh-name{margin:0 0 6px;font-size:clamp(20px,2.6vw,26px);font-weight:900;line-height:1.4;color:var(--tx)}
.lsh-org{margin:0 0 22px;font-size:15px;color:var(--sub)}
.lsh-hero .lsh-h1{margin-bottom:18px}
.lsh-em{font-style:normal;color:var(--gt)}
.lsh-light .lsh-em{color:var(--gt)}
.lsh-xs{list-style:none;margin:24px 0 0;padding:0;display:grid;grid-template-columns:minmax(0,1fr);gap:12px}
@media(min-width:768px){.lsh-xs{grid-template-columns:repeat(2,minmax(0,1fr))}}
.lsh-x{display:flex;align-items:center;gap:14px;padding:20px;border-radius:16px;background:var(--card);font-size:16px;font-weight:600;color:var(--tx)}
.lsh-x svg{flex:0 0 22px;width:22px;height:22px;color:#999999}
.lsh-close{margin:24px 0 0;max-width:34em;font-size:17px;font-weight:700;line-height:1.6;color:var(--tx)}
.lsh-lines{margin:0;padding:0;list-style:none;display:grid;gap:6px}
.lsh-lines li{font-size:clamp(17px,2.2vw,20px);line-height:1.7;color:var(--sub)}
.lsh-lines li:last-child{color:var(--tx);font-weight:700}
.lsh-two{display:grid;grid-template-columns:minmax(0,1fr);gap:28px;align-items:center}
@media(min-width:900px){.lsh-two{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:48px}}
.lsh-fig{margin:0}
.lsh-fig img{display:block;width:100%;height:auto;border-radius:16px;background:var(--chip)}
.lsh-fig figcaption{margin:10px 0 0;font-size:13px;line-height:1.6;color:var(--sub2)}
.lsh-light .lsh-fits li{font-weight:600}
.lsh-four{display:grid;grid-template-columns:minmax(0,1fr);gap:12px}
@media(min-width:640px){.lsh-four{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(min-width:1024px){.lsh-four{grid-template-columns:repeat(4,minmax(0,1fr))}}
.lsh-shot{margin:28px auto 0;max-width:760px}
.lsh-shot img{display:block;width:100%;height:auto;border-radius:20px;box-shadow:0 16px 40px rgba(0,0,0,.5)}
.lsh-chip6{list-style:none;margin:24px auto 0;padding:0;max-width:760px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.lsh-chip6 li{padding:12px 14px;border-radius:999px;background:var(--chip);font-size:14px;font-weight:600;text-align:center;color:var(--tx)}
.lsh-shotcap{margin:14px auto 0;max-width:760px;font-size:13px;line-height:1.6;color:var(--sub2);text-align:center}
.lsh-flow{list-style:none;margin:24px 0 20px;padding:0;display:grid;grid-template-columns:minmax(0,1fr);gap:10px}
@media(min-width:768px){.lsh-flow{grid-template-columns:repeat(3,minmax(0,1fr));gap:28px}}
.lsh-flow li{position:relative;padding:22px;border-radius:16px;background:var(--card);font-size:18px;font-weight:700}
.lsh-flow li b{display:block;margin:0 0 6px;font-size:13px;font-weight:900;letter-spacing:.08em;color:var(--gt)}
@media(min-width:768px){.lsh-flow li+li::before{content:"";position:absolute;left:-20px;top:50%;width:12px;height:12px;border-top:2px solid var(--gt);border-right:2px solid var(--gt);transform:translateY(-50%) rotate(45deg)}}
@media(max-width:767px){.lsh-flow li+li::before{content:"";position:absolute;left:50%;top:-8px;width:10px;height:10px;border-bottom:2px solid var(--gt);border-right:2px solid var(--gt);transform:translateX(-50%) rotate(45deg);background:transparent}}
.lsh-voices{display:flex;gap:16px;margin:28px 0 0;padding:0 0 8px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain;list-style:none}
.lsh-voice{flex:0 0 min(340px,82vw);scroll-snap-align:start;display:flex;flex-direction:column;margin:0;border-radius:16px;background:var(--card);overflow:hidden}
.lsh-voice-lb{margin:0;padding:12px 20px;background:var(--g);font-size:14px;font-weight:900;color:#FFFFFF}
.lsh-voice blockquote{margin:0;padding:20px 20px 8px;font-size:16px;line-height:1.75;color:var(--tx)}
.lsh-voice blockquote::before{content:"\\201C";display:block;margin:0 0 4px;font-size:34px;font-weight:900;line-height:1;color:var(--gt)}
.lsh-voice cite{display:block;padding:0 20px 20px;font-size:14px;font-style:normal;color:var(--sub2)}
.lsh-disc{margin:14px 0 0;font-size:13px;line-height:1.6;color:var(--sub2)}
.lsh-ctasec .lsh-h2{max-width:26em}
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

const XSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export default function LeeSeokhoonDiagnosisPage() {
  const [mounted, setMounted] = useState(false);
  const [photoErr, setPhotoErr] = useState(false);
  const [stickOn, setStickOn] = useState(false);

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
    const container = bottomFormRef.current;
    if (!container) return;
    const injected = injectContainer(container);
    return () => injected.forEach((s) => s.remove());
  }, [mounted]);

  // 모바일 고정 CTA — 히어로와 하단 신청 영역이 보이는 동안은 숨긴다
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
    ["lsh-hero", "apply"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <div className="lsh overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: LSH_CSS }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_SCHEMA) }} />

      {/* 1. 히어로 (다크) */}
      <section className="lsh-hero" id="lsh-hero">
        <div className="lsh-wrap lsh-hero-in">
          <div className="lsh-hero-text">
            <p className="lsh-eyebrow">운영시스템 / 데이터·AI 멘토</p>
            <p className="lsh-name">이석훈 멘토</p>
            <p className="lsh-org">피트니스 센터 운영 솔루션 바디코디 대표</p>
            <h1 className="lsh-h1">
              매출은 오르는데
              <br />
              <em className="lsh-em">통장에 남는 돈이 없다면</em>
            </h1>
            <p className="lsh-sub">문제는 매출이 아니라 운영 구조에 있습니다. 센터 안에서 새는 돈을 데이터로 찾아드립니다.</p>
            <button type="button" className="lsh-cta" onClick={() => smoothTo("lsh-form-bottom-wrap")}>
              운영 진단 받아보기 →
            </button>
          </div>
          <div className="lsh-hero-photo">
            {!photoErr && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={IMG_PROFILE} alt="이석훈 멘토" onError={() => setPhotoErr(true)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 10%" }} />
            )}
          </div>
        </div>
      </section>

      {/* 2. 공감 (화이트) */}
      <div className="lsh-blk lsh-light">
        <section className="lsh-sec">
          <div className="lsh-wrap">
            <div className="lsh-bt">
              <h2>센터는 돌아가는데, 대표님만 쉬지 못하고 있다면</h2>
            </div>
            <ul className="lsh-xs">
              {PAINS.map((p) => (
                <li className="lsh-x" key={p}>
                  <XSvg />
                  {p}
                </li>
              ))}
            </ul>
            <p className="lsh-close">이건 대표님이 게을러서가 아닙니다. 매일 봐야 할 숫자가 한눈에 보이지 않기 때문입니다.</p>
          </div>
        </section>
      </div>

      {/* 3. 문제 재정의 (다크) */}
      <div className="lsh-blk">
        <section className="lsh-sec">
          <div className="lsh-wrap">
            <div className="lsh-card">
              <h2 className="lsh-h2">
                신규만 쫓는 센터는 <em className="lsh-em">현금흐름이 먼저</em> 무너집니다
              </h2>
              <ul className="lsh-lines">
                <li>광고로 신규를 데려와도, 기존 회원이 조용히 빠져나가면 남는 게 없습니다.</li>
                <li>만료를 앞둔 회원, 발길이 끊긴 회원, PT가 몇 회 안 남은 회원.</li>
                <li>매일 챙겨야 할 사람은 이미 데이터 안에 있습니다.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* 4. 왜 이석훈 멘토인가 + 5. 진단 4가지 (화이트) */}
      <div className="lsh-blk lsh-light">
        <section className="lsh-sec">
          <div className="lsh-wrap">
            <div className="lsh-two">
              <div>
                <div className="lsh-bt">
                  <h2>피트니스 현장과 소프트웨어, 양쪽을 모두 아는 사람</h2>
                </div>
                <ul className="lsh-fits">
                  {CAREER.map((c) => (
                    <li key={c}>
                      <CheckSvg />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
              <figure className="lsh-fig">
                <Image src={IMG_DAY} alt="피트니스 센터 운영 실무 AI 활용 교육 현장 단체 사진" width={779} height={424} sizes="(min-width: 900px) 540px, 100vw" />
                <figcaption>피트니스 센터 운영 실무 AI 활용 교육 현장</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="lsh-sec">
          <div className="lsh-wrap">
            <div className="lsh-bt">
              <h2>
                이석훈 멘토가 보는 <em className="lsh-em">4가지</em>
              </h2>
            </div>
            <div className="lsh-four">
              {FOUR.map((f) => (
                <div className="lsh-step" key={f.no}>
                  <span className="lsh-step-no">{f.no}</span>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* 6. AI 진단 화면 예시 (다크) */}
      <div className="lsh-blk">
        <section className="lsh-sec">
          <div className="lsh-wrap">
            <h2 className="lsh-h2">
              오늘 누구에게 연락해야 하는지, <em className="lsh-em">AI가 먼저</em> 알려줍니다
            </h2>
            <div className="lsh-shot">
              <Image src={IMG_BRIEFING} alt="바디코디 AI 데일리 브리핑 화면. 회원 정보는 가림 처리했습니다" width={991} height={639} sizes="(min-width: 800px) 760px, 100vw" />
            </div>
            <ul className="lsh-chip6">
              {CHIPS.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <p className="lsh-shotcap">바디코디 AI 데일리 브리핑 실제 화면 · 회원 정보는 가림 처리했습니다</p>
          </div>
        </section>
      </div>

      {/* 7. 진단 후 달라지는 것 + 9. 후기 (화이트) */}
      <div className="lsh-blk lsh-light">
        <section className="lsh-sec">
          <div className="lsh-wrap">
            <div className="lsh-bt">
              <h2>
                분석으로 끝나지 않고, <em className="lsh-em">실행</em>으로 이어집니다
              </h2>
            </div>
            <ol className="lsh-flow">
              {FLOW.map((f, i) => (
                <li key={f}>
                  <b>{String(i + 1).padStart(2, "0")}</b>
                  {f}
                </li>
              ))}
            </ol>
            <p className="lsh-p" style={{ marginBottom: 0 }}>
              무엇이 문제인지 알려드리고, 누구에게 무엇을 언제 해야 하는지까지 정리해드립니다.
            </p>
          </div>
        </section>

        <section className="lsh-sec">
          <div className="lsh-wrap">
            <div className="lsh-bt">
              <h2>바디코디 AI를 먼저 쓰고 있는 대표님들의 이야기</h2>
            </div>
            <ul className="lsh-voices" aria-label="바디코디 AI 이용 센터 대표님 후기">
              {VOICES.map((v) => (
                <li className="lsh-voice" key={v.label}>
                  <p className="lsh-voice-lb">{v.label}</p>
                  <blockquote>{v.quote}</blockquote>
                  <cite>— {v.by}</cite>
                </li>
              ))}
            </ul>
            <p className="lsh-disc">바디코디 AI 서비스 이용 센터의 후기입니다.</p>
          </div>
        </section>
      </div>

      {/* 10. 클로징 + 폼 (다크) */}
      <div className="lsh-blk">
        <section className="lsh-sec lsh-ctasec" id="apply">
          <div className="lsh-wrap">
            <div className="lsh-card">
              <h2 className="lsh-h2">
                대표님 센터의 숫자, <em className="lsh-em">한 번 같이</em> 보시죠
              </h2>
              <p className="lsh-p" style={{ marginBottom: 0 }}>
                매일 봐야 할 숫자와 오늘 해야 할 일을 정리해드립니다.
              </p>
            </div>
            <div className="lsh-formbox" id="lsh-form-bottom-wrap" style={{ marginTop: 24 }}>
              {mounted ? (
                <div ref={bottomFormRef} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: FORM_HTML_BOTTOM }} />
              ) : (
                <div ref={bottomFormRef} suppressHydrationWarning />
              )}
            </div>
          </div>
        </section>
      </div>

      {/* 다른 멘토 확인 → 추천 서비스 */}
      <ConsultantCarousel currentSlug="lee-seokhoon" />

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
      <div className="lsh-spacer" aria-hidden="true" />
      <div className={`lsh-stick${stickOn ? " is-on" : ""}`} aria-hidden={!stickOn} data-sticky-cta>
        <button type="button" className="lsh-cta" tabIndex={stickOn ? 0 : -1} onClick={() => smoothTo("lsh-form-bottom-wrap")}>
          운영 진단 받아보기 →
        </button>
      </div>
    </div>
  );
}
