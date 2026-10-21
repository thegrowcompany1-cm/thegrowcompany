"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 진단 멘토 상세페이지 — 황현진 (세일즈 파트) · v2: 더그로우 메인 톤(DESIGN.md 1층) + 설득 구조
//  구조: 히어로 → 오픈루프 → 공감 → 방치 비용 → 뒤집기 → 권위 → 상단 상담폼 → 교정본 → 영상 → 솔루션 → 대상 → 솔직히
//   → 신청(하단 상담폼, -bottom id) → ConsultantCarousel → 추천 카드. 모바일 하단 고정 CTA.
//  · 클래스 접두사 hhj-, 스타일은 이 파일의 HHJ_CSS(사이트의 so-/sop- 방식과 같다). 글꼴은 사이트 기본 Noto Sans KR.
//  · 상담폼(FORM_HTML)은 허준영 페이지와 같은 구조·원래 초록을 그대로 쓴다.
//  · mounted 클라이언트 전용 폼 렌더 + suppressHydrationWarning, innerHTML <script> 는 주입 이펙트가 재생성
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
  serviceType: "헬스장·필라테스 상담·세일즈 진단 솔루션",
  name: "황현진 멘토 진단 솔루션",
  url: `${SITE_URL}/consulting/diagnosis/hwang-hyunjin`,
  areaServed: "KR",
  description:
    "세일즈작가 황현진의 1:1 진단으로 상담 등록률과 재등록을 바꿉니다. 센터 맞춤 상담 대본을 함께 씁니다.",
  provider: {
    "@type": "Organization",
    name: "더그로우컴퍼니",
    url: SITE_URL,
    employee: {
      "@type": "Person",
      name: "황현진",
      jobTitle: "세일즈·상담 멘토",
    },
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "KRW",
  },
};

// 좌측 메인 이미지 (public 기준)
const MAIN_IMAGE = "/consultants/hwang-hyunjin.png";

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

// ─── 진단 상담 폼 HTML (김승호/김재강과 동일, 폼 스코프 스크립트) ────────────────
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
          <input type="radio" name="consultant" value="황현진" class="consultant-radio" checked>
          <span class="checkbox-text">황현진</span>
        </label>
        <label class="checkbox-label">
          <input type="radio" name="consultant" value="이석훈" class="consultant-radio">
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
  // 이 스크립트가 한 줄도 실행되지 않아도 전송이 되도록 마크업에 둔다.

  // 폼 스코프(각 .consult-form-wrapper) 기준으로 동작 — id 하드코딩 없이 초기화.
  // 상단/하단 두 개의 폼이 있어도 각자 정상 동작하며, id 접미사(-bottom)와 무관.
  // DOMContentLoaded 대신 즉시 실행하고, data-hhj-init 로 재실행 시 중복 바인딩을 막는다.
  function initForm(wrapper){
    if (!wrapper || wrapper.getAttribute('data-hhj-init')) return;
    wrapper.setAttribute('data-hhj-init', '1');

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

// ─── v2: 더그로우 메인 톤(DESIGN.md 1층) + 설득 구조 ───────────────────────────
// 바탕 #111 · 카드 #161616/16px · 글꼴은 사이트 기본 Noto Sans KR 만(이 페이지 전용 글꼴 없음) · 포인트 #009519(작은 글씨는 #2FBF5F).
// 구조: 히어로 단언 → 오픈루프 → 공감 → 방치 비용 → 뒤집기 → 권위 → (상단 폼) → 루프 닫기(교정본) → 영상 → 솔루션 → 대상 → 솔직히 → 신청

// 영상 제목 — 값이 있을 때만 캡션을 보여준다. TODO 대표님 입력 (영상 순서: sales-01 ~ sales-04)
const VIDEO_TITLES: string[] = ["", "", "", ""];
const VIDEOS = [1, 2, 3, 4].map((n) => ({
  src: `/edu/sales-ops/videos/sales-0${n}.mp4`,
  poster: `/edu/sales-ops/videos/sales-0${n}.jpg`,
}));

// 기업 칩 — 텍스트만 (로고 이미지는 쓰지 않는다)
const COMPANY_CHIPS = [
  "아모레퍼시픽",
  "LG유플러스",
  "현대자동차 영업본부",
  "코웨이",
  "마세라티",
  "신한은행",
  "삼성생명",
  "바디프랜드",
  "암웨이",
  "CGV",
];

const BOOKS = [
  { src: "/edu/sales-ops/salesbook1.png", title: "팔리는 한 문장은 다르다" },
  { src: "/edu/sales-ops/salesbook2.png", title: "잘 파는 사람은 이렇게 팝니다" },
  { src: "/edu/sales-ops/salesbook3.png", title: "세일즈, 말부터 바꿔라" },
  { src: "/edu/sales-ops/salesbook4.png", title: "설득의 정석" },
];

// 공감 체크 카드
const CHECKS = [
  "가격을 물으면 할인부터 꺼낸다",
  "\"생각해볼게요\" 한마디에 상담이 끝난다",
  "트레이너가 PT 권유를 '영업'이라 느껴 말을 아낀다",
  "회원이 반문하면 설명이 길어지고, 길수록 멀어진다",
];

const STATS = [
  { to: 15, suffix: "년", label: "세일즈 교육" },
  { to: 20, suffix: "만+", label: "교육한 영업인" },
  { to: 2, suffix: "년 연속", label: "홈쇼핑 최다매출" },
  { to: 7, suffix: "권", label: "세일즈·설득 저서" },
];

const HISTORY = [
  "현) 리얼세일즈 주식회사 대표 · 세일즈학교 교장",
  "전) NS홈쇼핑 쇼핑호스트 — 홈쇼핑 기네스 기록",
  "2013 한국강사협회 '명강사' · 전국 강연콘테스트 대상",
];

// 교정본 — 하수 문장 → 고수 문장. TODO 황현진 대표 확인: 3번 하수 문장(운동할 시간 없으시면 주말에라도 오세요)은 이 페이지에서 새로 쓴 문장
const SCENES = [
  {
    n: "01",
    label: "기간 권유",
    bad: "3개월보단 12개월이 훨씬 저렴하니까 이렇게 하세요.",
    good: "도화지 10장에 그리는 그림 vs 100장에 그리는 그림, 어떤 완성도를 원하세요?",
    note: "가격 비교 대신, 회원이 원하는 결과의 크기로 기간을 고르게 합니다.",
  },
  {
    n: "02",
    label: "반문 대응",
    bad: "주사요? 에이~ 살 빼려면 땀을 흘리셔야죠.",
    good: "운동이 적금이라면, 주사는 대출입니다.",
    note: "반박하지 않고, 회원이 이미 아는 말로 차이를 그려 줍니다.",
  },
  {
    n: "03",
    label: "시간 핑계",
    bad: "운동할 시간 없으시면 주말에라도 오세요.",
    good: "시간이 없는 게 아니라, 회원님의 배터리가 방전된 겁니다.",
    note: "핑계를 받아치지 않고, 운동이 필요한 이유로 뒤집습니다.",
  },
];

const SOLUTION_STEPS = [
  { no: "01", name: "상담 듣기", body: "실제 상담 흐름과 자주 듣는 반문을 함께 듣고, 새는 문장을 찾습니다." },
  { no: "02", name: "대본 쓰기", body: "첫마디·권유·반론 극복·클로징, 단계별 세일즈 언어 세트를 씁니다." },
  { no: "03", name: "롤플레이 훈련", body: "FC·트레이너가 대본을 자기 말로 바꿔 쓰도록 롤플레이로 훈련합니다." },
  { no: "04", name: "재등록까지 잇기", body: "만기 전 상담과 재등록 권유까지, 같은 언어로 잇습니다." },
];

const FITS = [
  "상담·FC 직원마다 등록률이 크게 다른 센터",
  "PT 권유를 트레이너가 어려워하는 센터",
  "직원이 자주 바뀌어 상담을 매번 새로 가르치는 센터",
];

const HHJ_CSS = `
.hhj{--bg:#111111;--bg2:#0A0A0A;--card:#161616;--chip:#1E1E1E;--tx:#EEEEEE;--sub:#BDBDBD;--sub2:#9A9A9A;--g:#009519;--gt:#2FBF5F;--line:rgba(255,255,255,.1);background:var(--bg);color:var(--tx);font-family:inherit;font-size:16px;line-height:1.75;word-break:keep-all;overflow-wrap:anywhere}
.hhj *{box-sizing:border-box}
.hhj [id]{scroll-margin-top:104px}
.hhj a:focus-visible,.hhj button:focus-visible{outline:2px solid var(--gt);outline-offset:3px}
.hhj a,.hhj button{touch-action:manipulation}
.hhj-wrap{max-width:1152px;margin:0 auto;padding:0 16px}
@media(min-width:640px){.hhj-wrap{padding:0 24px}}
@media(min-width:1024px){.hhj-wrap{padding:0 32px}}
.hhj-sec{padding:56px 0}
@media(min-width:640px){.hhj-sec{padding:80px 0}}
.hhj-sec--alt{background:var(--bg2)}
.hhj-eyebrow{margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--gt)}
.hhj-h2{margin:0 0 16px;max-width:22em;font-size:clamp(24px,3.4vw,36px);font-weight:900;line-height:1.35;letter-spacing:-.02em;color:var(--tx)}
.hhj-bt{display:flex;align-items:center;gap:12px;margin:0 0 20px}
.hhj-bt::before{content:"";flex:0 0 4px;height:20px;border-radius:999px;background:var(--g)}
.hhj-bt h2{margin:0;font-size:clamp(22px,3vw,30px);font-weight:900;line-height:1.35;letter-spacing:-.02em}
.hhj-p{margin:0 0 16px;max-width:34em;color:var(--sub)}
.hhj-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:24px}
@media(min-width:640px){.hhj-card{padding:32px}}
.hhj-cta{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:54px;padding:0 28px;border:0;border-radius:12px;background:var(--g);color:#fff;font:inherit;font-size:19px;font-weight:900;text-decoration:none;cursor:pointer;transition:background-color .2s}
.hhj-cta:hover{background:#007a14}

/* 1. 히어로 — 모바일은 사진을 화면 가득 깔고 아래 60% 를 #111 로 녹인다. 데스크톱은 좌 텍스트 / 우 사진 카드 */
.hhj-hero{position:relative;overflow:hidden;min-height:720px;display:flex;align-items:flex-end}
.hhj-hero-in{width:100%;padding-top:470px;padding-bottom:48px}
.hhj-hero-text{position:relative;z-index:1}
.hhj-hero-photo{position:absolute;inset:0}
.hhj-hero-photo::after{content:"";position:absolute;left:0;right:0;bottom:0;height:60%;background:linear-gradient(to bottom,rgba(17,17,17,0) 0%,rgba(17,17,17,.92) 28%,#111111 52%)}
.hhj-h1{margin:0 0 20px;font-size:clamp(34px,5.6vw,60px);font-weight:900;line-height:1.2;letter-spacing:-.03em}
.hhj-sub{margin:0 0 28px;max-width:28em;font-size:17px;color:var(--sub)}
@media(min-width:1024px){
  .hhj-hero{display:block;min-height:0;padding:72px 0}
  .hhj-hero-in{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:56px;align-items:center;padding-top:0;padding-bottom:0}
  .hhj-hero-photo{position:relative;inset:auto;order:2;aspect-ratio:4/5;border-radius:16px;overflow:hidden;border:1px solid var(--line);background:var(--card)}
  .hhj-hero-photo::after{display:none}
}

/* 3. 공감 체크 */
.hhj-checks{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;margin:24px 0 0}
@media(min-width:768px){.hhj-checks{grid-template-columns:repeat(2,minmax(0,1fr))}}
.hhj-check{display:flex;align-items:center;gap:14px;width:100%;padding:20px;border:1px solid var(--line);border-radius:16px;background:var(--card);color:var(--tx);font:inherit;font-size:16px;font-weight:600;text-align:left;cursor:pointer;transition:border-color .2s}
.hhj-check:hover{border-color:rgba(255,255,255,.3)}
.hhj-check-ic{flex:0 0 26px;width:26px;height:26px;display:grid;place-items:center;border:2px solid #4a4a4a;border-radius:50%;color:transparent;transition:background-color .2s,border-color .2s}
.hhj-check-ic svg{width:14px;height:14px}
.hhj-check.is-on{border-color:var(--g)}
.hhj-check.is-on .hhj-check-ic{background:var(--g);border-color:var(--g);color:#fff}
.hhj-count{margin:20px 0 0;font-size:16px;font-weight:700;color:var(--gt)}

/* 4. 방치 비용 · 11. 솔직히 */
.hhj-card .hhj-h2{max-width:24em}

/* 5. 뒤집기 */
.hhj-old{margin:0 0 12px;font-size:18px;color:var(--sub2);text-decoration:line-through}
.hhj-em{color:var(--gt)}

/* 6. 권위 */
.hhj-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:28px 0 0;max-width:640px}
.hhj-stat{padding:22px 20px;border:1px solid var(--line);border-radius:16px;background:var(--card)}
.hhj-stat b{display:block;font-size:clamp(26px,3.6vw,36px);font-weight:900;line-height:1.15;color:var(--gt);font-variant-numeric:tabular-nums;white-space:nowrap}
.hhj-stat span{display:block;margin-top:6px;font-size:13px;color:var(--sub)}
.hhj-hist{list-style:none;margin:28px 0 0;padding:0;display:grid;gap:10px;max-width:40em}
.hhj-hist li{position:relative;padding-left:16px;color:var(--tx)}
.hhj-hist li::before{content:"";position:absolute;left:0;top:.8em;width:6px;height:6px;border-radius:50%;background:var(--g)}
.hhj-chips{display:flex;flex-wrap:wrap;gap:8px;margin:28px 0 0;padding:0;list-style:none}
.hhj-chips li{padding:8px 16px;border-radius:999px;background:var(--chip);font-size:14px;font-weight:600;color:var(--tx)}
.hhj-books{display:flex;gap:14px;margin:28px 0 0;padding:0 0 8px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}
.hhj-books img{flex:0 0 auto;display:block;height:180px;width:auto;border-radius:6px;scroll-snap-align:start;background:var(--chip)}

/* 상담폼 래퍼 — 폼 내부는 다른 멘토 페이지와 같은 원래 초록. 감싸는 상자만 둥글게 */
.hhj-formbox{max-width:840px;margin:0 auto;border-radius:16px;overflow:hidden}
.hhj-formsec{padding:56px 0}
@media(min-width:640px){.hhj-formsec{padding:72px 0}}
.hhj-formsec .hhj-h2{max-width:26em}

/* 7. 교정본 */
.hhj-scenes{display:grid;grid-template-columns:minmax(0,1fr);gap:16px;margin:32px 0 0}
@media(min-width:900px){.hhj-scenes{grid-template-columns:repeat(3,minmax(0,1fr))}}
.hhj-scene{display:flex;flex-direction:column;padding:24px;border:1px solid var(--line);border-radius:16px;background:var(--card)}
.hhj-scene-l{margin:0 0 14px;font-size:13px;font-weight:700;color:var(--sub2)}
.hhj-scene-l b{margin-right:8px;font-size:15px;font-weight:900;color:var(--gt)}
.hhj-bad{margin:0;font-size:17px;font-weight:700;line-height:1.7;color:var(--tx);transition:color .4s ease}
.hhj-strike{background-image:linear-gradient(#9A9A9A,#9A9A9A);background-repeat:no-repeat;background-position:0 58%;background-size:0% 2px;-webkit-box-decoration-break:clone;box-decoration-break:clone;transition:background-size .4s ease-out}
.is-fixed .hhj-bad{color:var(--sub2)}
.is-fixed .hhj-strike{background-size:100% 2px}
.hhj-fix{max-height:0;margin:0;opacity:0;overflow:hidden;transition:opacity .4s ease .2s,max-height .4s ease .2s,margin .4s ease .2s}
.is-fixed .hhj-fix{max-height:360px;margin:14px 0 0;opacity:1}
.hhj-fix-in{padding:16px;border-radius:12px;background:#0F2416}
.hhj-good{margin:0 0 8px;font-size:18px;font-weight:900;line-height:1.55;color:#FFFFFF}
.hhj-note{margin:0;font-size:14px;line-height:1.65;color:#A7D8B5}
.hhj-sw{margin-top:20px;min-height:48px;padding:0 16px;border:0;border-radius:12px;background:var(--g);color:#fff;font:inherit;font-size:15px;font-weight:800;cursor:pointer;transition:background-color .2s}
.hhj-sw:hover{background:#007a14}
.is-fixed .hhj-sw{background:#2A2A2A;color:var(--tx)}
.is-fixed .hhj-sw:hover{background:#363636}
.hhj-after{margin:16px 0 0;padding:24px;border:1px solid var(--line);border-radius:16px;background:var(--card);font-size:18px;font-weight:700;line-height:1.6}
@media(prefers-reduced-motion:reduce){.hhj-strike,.hhj-fix,.hhj-bad,.hhj-check,.hhj-check-ic,.hhj-sw,.hhj-cta{transition:none}}

/* 8. 영상 */
.hhj-vids{display:flex;gap:16px;margin:28px 0 0;padding:0 0 8px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}
.hhj-vid{flex:0 0 min(260px,72vw);scroll-snap-align:start}
.hhj-vid-card{position:relative;aspect-ratio:9/16;border-radius:16px;overflow:hidden;background:var(--card)}
.hhj-vid-card video{display:block;width:100%;height:100%;object-fit:cover}
.hhj-vid-cap{margin:8px 0 0;font-size:13px;color:var(--sub)}

/* 9. 솔루션 */
.hhj-steps{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;margin:28px 0 16px}
@media(min-width:640px){.hhj-steps{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(min-width:1024px){.hhj-steps{grid-template-columns:repeat(4,minmax(0,1fr))}}
.hhj-step{padding:22px;border:1px solid var(--line);border-radius:16px;background:var(--card)}
.hhj-step-no{display:block;margin:0 0 10px;font-size:13px;font-weight:900;letter-spacing:.08em;color:var(--gt)}
.hhj-step h3{margin:0 0 8px;font-size:18px;font-weight:700}
.hhj-step p{margin:0;font-size:14px;line-height:1.7;color:var(--sub)}
.hhj-left{margin:0;padding:24px;border:1px solid var(--g);border-radius:16px;background:var(--card)}
.hhj-left b{display:block;margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:.08em;color:var(--gt)}
.hhj-left p{margin:0 0 8px;color:var(--tx)}
.hhj-left small{display:block;font-size:13px;color:var(--sub)}

/* 10. 대상 */
.hhj-fits{list-style:none;margin:8px 0 0;padding:0;display:grid;gap:12px;max-width:40em}
.hhj-fits li{display:flex;align-items:flex-start;gap:12px;font-size:17px;font-weight:600}
.hhj-fits svg{flex:0 0 24px;width:24px;height:24px;margin-top:2px;color:var(--gt)}

/* 11. 솔직히 */
.hhj-link{display:inline-flex;align-items:center;gap:6px;margin-top:8px;font-weight:700;color:var(--gt);text-decoration:none}
.hhj-link:hover{text-decoration:underline;text-underline-offset:4px}

/* 모바일 고정 CTA */
.hhj-stick{position:fixed;left:0;right:0;bottom:0;z-index:40;padding:12px 16px calc(12px + env(safe-area-inset-bottom));background:rgba(17,17,17,.97);border-top:1px solid var(--line);transform:translateY(100%);visibility:hidden;transition:transform .25s ease,visibility 0s linear .25s}
.hhj-stick.is-on{transform:none;visibility:visible;transition-delay:0s}
.hhj-stick .hhj-cta{width:100%}
@media(min-width:1024px){.hhj-stick{display:none}}
@media(prefers-reduced-motion:reduce){.hhj-stick,.hhj-stick.is-on{transition:none}}
.hhj-spacer{height:84px}
@media(min-width:1024px){.hhj-spacer{display:none}}
`;

const smoothTo = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
};

/** 뷰포트에 들어올 때 1회 카운트업 (모션 줄이기·옵저버 없음이면 최종값 그대로) */
function CountUp({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLElement>(null);
  const [v, setV] = useState(to);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let done = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || done) return;
        done = true;
        io.disconnect();
        const t0 = performance.now();
        setV(0);
        const step = (t: number) => {
          const p = Math.min((t - t0) / 1300, 1);
          setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);
  return (
    <b ref={ref}>
      {v}
      {suffix}
    </b>
  );
}

function Scene({
  s,
  fixed,
  onToggle,
  cardRef,
}: {
  s: (typeof SCENES)[number];
  fixed: boolean;
  onToggle: () => void;
  cardRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div ref={cardRef} className={`hhj-scene${fixed ? " is-fixed" : ""}`}>
      <p className="hhj-scene-l">
        <b>{s.n}</b>장면 · {s.label}
      </p>
      <p className="hhj-bad">
        <span className="hhj-strike">{s.bad}</span>
      </p>
      <div className="hhj-fix" aria-live="polite" aria-hidden={!fixed}>
        <div className="hhj-fix-in">
          <p className="hhj-good">{s.good}</p>
          <p className="hhj-note">{s.note}</p>
        </div>
      </div>
      <button type="button" className="hhj-sw" onClick={onToggle}>
        {fixed ? "원래 문장 보기" : "세일즈작가의 문장으로 바꾸기"}
      </button>
    </div>
  );
}

const CheckSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

export default function HwangHyunjinDiagnosisPage() {
  const [mounted, setMounted] = useState(false);
  const [checked, setChecked] = useState<boolean[]>(CHECKS.map(() => false));
  // 교정본 카드 — 첫 카드는 처음부터 바뀐 상태. 나머지는 화면에 들어오면 1회 자동 변경(직접 누른 카드는 건드리지 않는다)
  const [fixed, setFixed] = useState<boolean[]>([true, false, false]);
  const handled = useRef<boolean[]>([true, false, false]);
  const sceneEls = useRef<(HTMLDivElement | null)[]>([]);
  const videoEls = useRef<(HTMLVideoElement | null)[]>([]);
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

  // 상단 상담폼 주입
  useEffect(() => {
    if (!mounted) return;
    const container = formRef.current;
    if (!container) return;
    const injected = injectContainer(container);
    return () => injected.forEach((s) => s.remove());
  }, [mounted]);

  // 하단 상담폼 주입 (id 는 이미 -bottom 접미사라 상단과 충돌 없음)
  useEffect(() => {
    if (!mounted) return;
    const container = bottomFormRef.current;
    if (!container) return;
    const injected = injectContainer(container);
    return () => injected.forEach((s) => s.remove());
  }, [mounted]);

  // 교정본: 카드가 60% 이상 보이면 1회 자동 변경
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const i = sceneEls.current.indexOf(entry.target as HTMLDivElement);
          io.unobserve(entry.target);
          if (i < 0 || handled.current[i]) return;
          handled.current[i] = true;
          setFixed((f) => f.map((v, j) => (j === i ? true : v)));
        });
      },
      { threshold: 0.6 },
    );
    sceneEls.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

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
    ["hhj-hero", "hhj-form-top", "hhj-form-bottom"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const toggleScene = (i: number) => {
    handled.current[i] = true;
    setFixed((f) => f.map((v, j) => (j === i ? !v : v)));
  };

  // 영상 — 하나를 재생하면 나머지는 멈춘다
  const pauseOthers = (index: number) => {
    videoEls.current.forEach((v, i) => {
      if (v && i !== index && !v.paused) v.pause();
    });
  };

  const hitCount = checked.filter(Boolean).length;

  return (
    <div className="hhj overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: HHJ_CSS }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_SCHEMA) }} />

      {/* 1. 히어로 */}
      <section className="hhj-hero" id="hhj-hero">
        <div className="hhj-wrap hhj-hero-in">
          <div className="hhj-hero-text">
            <p className="hhj-eyebrow">진단솔루션 · 세일즈 파트 | 황현진 멘토</p>
            <h1 className="hhj-h1">
              같은 회원, 같은 가격.
              <br />
              등록은 상담 대본이
              <br />
              결정합니다.
            </h1>
            <p className="hhj-sub">홈쇼핑 생방송에서 검증한 설득 언어로, 우리 센터의 상담 대본을 함께 씁니다.</p>
            <button type="button" className="hhj-cta" onClick={() => smoothTo("hhj-form-bottom")}>
              무료 대본 진단 받아보기 →
            </button>
          </div>
          <div className="hhj-hero-photo">
            <Image
              src={MAIN_IMAGE}
              alt="세일즈작가 황현진 상담·세일즈 진단 멘토"
              fill
              priority
              className="object-cover"
              style={{ objectPosition: "50% 10%" }}
              sizes="(min-width: 1024px) 480px, 100vw"
            />
          </div>
        </div>
      </section>

      {/* 2. 오픈루프 */}
      <section className="hhj-sec hhj-sec--alt">
        <div className="hhj-wrap">
          <p className="hhj-eyebrow">OPEN LOOP</p>
          <h2 className="hhj-h2">등록률이 낮은 센터의 상담에는 공통으로 들어가는 &lsquo;한 문장&rsquo;이 있습니다.</h2>
          <p className="hhj-p">시설 문제도, 가격 문제도 아닙니다. 그 문장이 무엇인지는 이 페이지 중간, 교정본에서 직접 보여드리겠습니다.</p>
        </div>
      </section>

      {/* 3. 공감 */}
      <section className="hhj-sec">
        <div className="hhj-wrap">
          <div className="hhj-bt">
            <h2>오늘 상담실에서 나온 말</h2>
          </div>
          <p className="hhj-p">몇 개가 우리 센터 얘기인지 세어보세요.</p>
          <div className="hhj-checks">
            {CHECKS.map((c, i) => (
              <button
                key={c}
                type="button"
                role="checkbox"
                aria-checked={checked[i]}
                className={`hhj-check${checked[i] ? " is-on" : ""}`}
                onClick={() => setChecked((s) => s.map((v, j) => (j === i ? !v : v)))}
              >
                <span className="hhj-check-ic">
                  <CheckSvg />
                </span>
                {c}
              </button>
            ))}
          </div>
          <p className="hhj-count" aria-live="polite">
            {hitCount}개 해당
          </p>
        </div>
      </section>

      {/* 4. 방치 비용 */}
      <section className="hhj-sec hhj-sec--alt">
        <div className="hhj-wrap">
          <div className="hhj-card">
            <p className="hhj-eyebrow">그대로 두면</p>
            <h2 className="hhj-h2">상담을 잘하는 직원 한 명이 나가면, 등록률도 그 직원과 함께 나갑니다.</h2>
            <p className="hhj-p" style={{ marginBottom: 0 }}>
              센터의 상담 실력이 &lsquo;사람&rsquo;에 들어 있고 &lsquo;문장&rsquo;으로 남아 있지 않기 때문입니다. 새 직원이 올 때마다 처음부터 다시 배웁니다.
            </p>
          </div>
        </div>
      </section>

      {/* 5. 뒤집기 */}
      <section className="hhj-sec">
        <div className="hhj-wrap">
          <p className="hhj-old">상담을 잘하려면 말을 잘해야 한다</p>
          <h2 className="hhj-h2">
            아닙니다.
            <br />
            <span className="hhj-em">대본이 있는 센터</span>가 이깁니다.
          </h2>
          <p className="hhj-p">말재주는 사람마다 다르지만, 대본은 누가 읽어도 같은 결과를 냅니다. 그래서 세일즈작가가 필요합니다.</p>
        </div>
      </section>

      {/* 6. 권위 */}
      <section className="hhj-sec hhj-sec--alt">
        <div className="hhj-wrap">
          <div className="hhj-bt">
            <h2>세일즈작가 황현진</h2>
          </div>
          <p className="hhj-p">
            홈쇼핑 쇼핑호스트 시절 기록적인 매출로 검증한 &lsquo;실전 설득 언어&rsquo;를 바탕으로, 15년간 20만여 명의 영업인과 기업의 세일즈 현장을 바꿔 왔습니다.
          </p>
          <div className="hhj-stats">
            {STATS.map((s) => (
              <div className="hhj-stat" key={s.label}>
                <CountUp to={s.to} suffix={s.suffix} />
                <span>{s.label}</span>
              </div>
            ))}
          </div>
          <ul className="hhj-hist">
            {HISTORY.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
          <ul className="hhj-chips" aria-label="강의·컨설팅 기업 일부">
            {COMPANY_CHIPS.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <div className="hhj-books" role="group" aria-label="황현진 저서 표지">
            {BOOKS.map((b) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={b.src} src={b.src} alt={`${b.title} 표지`} width={371} height={548} loading="lazy" draggable={false} />
            ))}
          </div>
        </div>
      </section>

      {/* 상단 상담폼 — 권위 섹션 다음 (원래 초록 폼 그대로) */}
      <section className="hhj-formsec" id="hhj-form-top">
        <div className="hhj-wrap">
          <div className="hhj-formbox">
            {mounted ? (
              <div ref={formRef} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: FORM_HTML }} />
            ) : (
              <div ref={formRef} suppressHydrationWarning />
            )}
          </div>
        </div>
      </section>

      {/* 7. 교정본 (오픈루프 닫기) */}
      <section className="hhj-sec hhj-sec--alt">
        <div className="hhj-wrap">
          <p className="hhj-eyebrow">교정본 · 그 한 문장</p>
          <h2 className="hhj-h2">
            같은 상황,
            <br />
            다른 한 문장.
          </h2>
          <p className="hhj-p">앞에서 말한 &lsquo;한 문장&rsquo;은 이런 말들입니다. 눌러서 세일즈작가의 문장으로 바꿔 보세요.</p>
          <div className="hhj-scenes">
            {SCENES.map((s, i) => (
              <Scene
                key={s.n}
                s={s}
                fixed={fixed[i]}
                onToggle={() => toggleScene(i)}
                cardRef={(el) => {
                  sceneEls.current[i] = el;
                }}
              />
            ))}
          </div>
          <p className="hhj-after">회원은 &lsquo;좋은 사람&rsquo;이 권하는 &lsquo;좋아 보이는 것&rsquo;을 선택합니다.</p>
        </div>
      </section>

      {/* 8. 영상 */}
      <section className="hhj-sec">
        <div className="hhj-wrap">
          <div className="hhj-bt">
            <h2>말 한 줄이 상담을 바꾸는 장면</h2>
          </div>
          <div className="hhj-vids" role="group" aria-label="황현진 멘토 세일즈 화법 영상">
            {VIDEOS.map((v, i) => (
              <div className="hhj-vid" key={v.src}>
                <div className="hhj-vid-card">
                  <video
                    ref={(el) => {
                      videoEls.current[i] = el;
                    }}
                    src={v.src}
                    poster={v.poster}
                    controls
                    muted
                    playsInline
                    preload="none"
                    onPlay={() => pauseOthers(i)}
                    aria-label={`황현진 멘토 세일즈 화법 영상 ${i + 1}`}
                  />
                </div>
                {VIDEO_TITLES[i] ? <p className="hhj-vid-cap">{VIDEO_TITLES[i]}</p> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. 솔루션 */}
      <section className="hhj-sec hhj-sec--alt">
        <div className="hhj-wrap">
          <div className="hhj-bt">
            <h2>솔루션 · 우리 센터 상담 대본 개발</h2>
          </div>
          <p className="hhj-p">
            스펙이 아닌 스토리로. 상담 → 권유 → 반론 → 클로징까지, 단계마다 5~6문장의 &lsquo;세일즈 언어 한 세트&rsquo;를 우리 센터 상품과 회원에 맞춰 함께 씁니다.
          </p>
          <div className="hhj-steps">
            {SOLUTION_STEPS.map((s) => (
              <div className="hhj-step" key={s.no}>
                <span className="hhj-step-no">{s.no}</span>
                <h3>{s.name}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
          <div className="hhj-left">
            <b>남는 것</b>
            <p>직원이 바뀌어도 그대로 쓰는 센터의 상담 대본. 원하면 세일즈노트·포켓북으로 제작합니다(선택, 제작비 별도).</p>
            {/* TODO 대표님 확인: 진단 횟수·기간 */}
            <small>진행 방식은 센터 상황에 맞춰 협의 후 정합니다</small>
          </div>
        </div>
      </section>

      {/* 10. 대상 */}
      <section className="hhj-sec">
        <div className="hhj-wrap">
          <div className="hhj-bt">
            <h2>이런 센터에 맞습니다</h2>
          </div>
          <ul className="hhj-fits">
            {FITS.map((f) => (
              <li key={f}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" strokeWidth="1.8" />
                  <path d="M7.5 12.5l3 3 6-6.5" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 11. 솔직히 */}
      <section className="hhj-sec hhj-sec--alt">
        <div className="hhj-wrap">
          <div className="hhj-card">
            <p className="hhj-eyebrow">솔직히 말씀드리면</p>
            <h2 className="hhj-h2">대본만으로 모든 매출 문제가 풀리지는 않습니다.</h2>
            <p className="hhj-p">
              가격 구조, 인력 배치, 재등록 관리처럼 운영에서 새는 곳은 따로 있습니다. 그래서 황현진 멘토는 더그로우 진단솔루션의 세일즈 파트를 맡고, 운영은 다른 멘토들과 함께 봅니다.
            </p>
            <Link href="/consulting/diagnosis" className="hhj-link">
              진단솔루션 멘토 전체 보기 →
            </Link>
          </div>
        </div>
      </section>

      {/* 12. 신청 — 하단 상담폼 */}
      <section className="hhj-formsec" id="hhj-form-bottom">
        <div className="hhj-wrap">
          <h2 className="hhj-h2">우리 센터 상담에서 어떤 문장이 새는지, 먼저 들어보겠습니다.</h2>
          <p className="hhj-p">무료 상담 · 더그로우컴퍼니 진단솔루션</p>
          <div className="hhj-formbox" style={{ marginTop: 24 }}>
            {mounted ? (
              <div ref={bottomFormRef} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: FORM_HTML_BOTTOM }} />
            ) : (
              <div ref={bottomFormRef} suppressHydrationWarning />
            )}
          </div>
        </div>
      </section>

      {/* 13. 다른 멘토 확인 → 추천 서비스 */}
      <ConsultantCarousel currentSlug="hwang-hyunjin" />

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
      <div className="hhj-spacer" aria-hidden="true" />
      <div className={`hhj-stick${stickOn ? " is-on" : ""}`} aria-hidden={!stickOn}>
        <button type="button" className="hhj-cta" tabIndex={stickOn ? 0 : -1} onClick={() => smoothTo("hhj-form-bottom")}>
          무료 대본 진단 받아보기 →
        </button>
      </div>
    </div>
  );
}
