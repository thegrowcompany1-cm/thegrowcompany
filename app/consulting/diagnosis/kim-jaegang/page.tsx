"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 진단 멘토 상세페이지 — 김재강
//
// 구성
//  1) 상단 메인 영역 (2단): 좌측 정사각형 이미지 / 우측 진단 상담 폼(FORM_HTML)
//     - 우측 폼은 외부 HTML(+CSS+JS) 문자열을 dangerouslySetInnerHTML 로 렌더링.
//       (창업/위탁 페이지의 상세 HTML 처리 로직을 그대로 재사용)
//  2) 하단 "다른 서비스 둘러보기" 추천 카드.
//
// 헤더/푸터는 app/layout.tsx 를 그대로 사용한다.
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
  serviceType: "피트니스 센터 진단 솔루션",
  name: "김재강 멘토 진단 솔루션",
  url: `${SITE_URL}/consulting/diagnosis/kim-jaegang`,
  areaServed: "KR",
  provider: {
    "@type": "Organization",
    name: "더그로우컴퍼니",
    url: SITE_URL,
    employee: {
      "@type": "Person",
      name: "김재강",
      jobTitle: "대표 멘토",
    },
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "KRW",
  },
};

// 좌측 메인 이미지 (public 기준). 없으면 회색 placeholder 로 대체.
const MAIN_IMAGE = "/consultants/kim-jaegang.jpg";

// 하단 "다른 서비스 둘러보기" 추천 카드 (현재 페이지인 진단 솔루션은 제외)
const RELATED_SERVICES = [
  {
    title: "창업 솔루션",
    desc: "헬스장·필라테스 등 창업 준비를 위한 솔루션",
    href: "/consulting/startup",
    img: "/startup/startup50.png", // 창업 솔루션 카드 이미지
  },
  {
    title: "매장 위탁운영",
    desc: "운영이 어려운 매장을 위한 단기 위탁",
    href: "/consulting/outsourcing",
    img: "/wt/wt.png", // 매장 위탁운영 카드 이미지
  },
  {
    title: "시설 위탁운영",
    desc: "아파트·기업·공공기관 장기 위탁",
    href: "/consulting/community",
    img: "/wt/community.png", // 시설 위탁운영 카드 이미지
  },
  {
    title: "그로우 에듀",
    desc: "피트니스 실무 교육 프로그램",
    href: "/edu/fc-class",
    img: "/edu/edufc.jpg", // 정규 FC 세미나 (피트니스 실무 교육)
  },
];

// 추천 카드 1개 (이미지 로드 실패 시 회색 placeholder fallback)
function RelatedServiceCard({
  service,
}: {
  service: (typeof RELATED_SERVICES)[number];
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={service.href}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-[#009519] hover:shadow-lg"
    >
      {/* 상단 정사각형 이미지 영역 */}
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
      {/* 하단 텍스트 */}
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

// ─── 진단 상담 폼 HTML ────────────────────────────────────────────────────────
// 아임웹용 진단 상담 폼 HTML(+<style>+<script>) 전체를 이 백틱 문자열 안에 붙여넣으세요.
//
// 붙여넣기 주의:
//  - 백틱( ` ) 과 ${ 두 가지만 \` , \${ 로 이스케이프하면 됩니다. (그 외엔 손댈 필요 없음)
//  - alert 등의 문자열 안 \n 은 \\n 으로 이스케이프하세요. (템플릿 리터럴이 실제 줄바꿈으로
//    해석해 문자열이 깨지는 것을 방지)
//  - <style>, <script> 등은 그대로 둬도 아래 useEffect 가 동작하게 처리합니다.
const FORM_HTML = `<div class="consult-form-wrapper">
  <div class="form-header">
    <h2>진단 솔루션 상담 신청(무료)</h2>
  </div>

  <form id="consultForm" class="consult-form">
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
          <input type="radio" name="consultant" value="황봉남" class="consultant-radio">
          <span class="checkbox-text">황봉남</span>
        </label>
      </div>
    </div>

    <div class="form-submit">
      <button type="submit" id="submitBtn">작성</button>
    </div>
  </form>
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
  var SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyelFqoWSqeRWmjVGARFePbNqTtkTtkG9MtXZpfusvTSUxnE42SrjJgmKM4dQDVcI-QAg/exec';
  var SECRET_TOKEN = 'grow2026secure';

  // 폼 스코프(각 .consult-form-wrapper) 기준으로 동작 — id 하드코딩 없이 초기화.
  // 상단/하단 두 개의 폼이 있어도 각자 정상 동작하며, id 접미사(-bottom)와 무관.
  // DOMContentLoaded 대신 즉시 실행하고, data-kjk-init 로 재실행 시 중복 바인딩을 막는다.
  function initForm(wrapper){
    if (!wrapper || wrapper.getAttribute('data-kjk-init')) return;
    wrapper.setAttribute('data-kjk-init', '1');

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

    form.addEventListener('submit', function(e){
      e.preventDefault();

      var phone = val('[name="phone1"]') + val('[name="phone2"]') + val('[name="phone3"]');
      var phoneConfirm = val('[name="phoneConfirm1"]') + val('[name="phoneConfirm2"]') + val('[name="phoneConfirm3"]');
      if (phone !== phoneConfirm){ alert('연락처가 일치하지 않습니다. 다시 확인해주세요.'); return; }

      var selectedIndustry = qa('.industry-checkbox:checked');
      if (selectedIndustry.length === 0){ alert('업종을 선택해주세요.'); return; }
      var selectedRoute = qa('.route-checkbox:checked');
      if (selectedRoute.length === 0){ alert('신청 경로를 선택해주세요.'); return; }
      var selectedConsultField = qa('.consultField-checkbox:checked');
      if (selectedConsultField.length === 0){ alert('원하시는 솔루션 분야를 선택해주세요.'); return; }
      var selectedConsultant = q('.consultant-radio:checked');
      if (!selectedConsultant){ alert('도움받고 싶은 멘토를 선택해주세요.'); return; }

      if (submitBtn){ submitBtn.disabled = true; submitBtn.textContent = '전송중...'; }

      var industryValues = Array.prototype.map.call(selectedIndustry, function(cb){ return cb.value; });
      if (etcCheckbox && etcCheckbox.checked && etcInput && etcInput.value.trim()){
        industryValues = industryValues.filter(function(v){ return v !== '기타'; });
        industryValues.push('기타 - ' + etcInput.value.trim());
      }

      var params = new URLSearchParams();
      params.append('source', '진단상담');
      params.append('token', SECRET_TOKEN);
      params.append('name', val('[name="name"]'));
      params.append('phone', val('[name="phone1"]') + '-' + val('[name="phone2"]') + '-' + val('[name="phone3"]'));
      params.append('phoneCheck1', val('[name="phoneConfirm1"]'));
      params.append('phoneCheck2', val('[name="phoneConfirm2"]'));
      params.append('phoneCheck3', val('[name="phoneConfirm3"]'));
      params.append('industry', industryValues.join(', '));
      params.append('area', val('[name="area"]'));
      params.append('route', Array.prototype.map.call(selectedRoute, function(cb){ return cb.value; }).join(', '));
      params.append('consultField', Array.prototype.map.call(selectedConsultField, function(cb){ return cb.value; }).join(', '));
      params.append('consultant', selectedConsultant.value);

      fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      })
      .then(function(){
        alert('진단 솔루션 상담 신청이 정상적으로 접수되었습니다.\\n빠른 시일 내에 연락드리겠습니다.');
        form.reset();
        if (etcInput) etcInput.disabled = true;
      })
      .catch(function(){
        alert('전송 중 오류가 발생했습니다. 다시 시도해주세요.');
      })
      .finally(function(){
        if (submitBtn){ submitBtn.disabled = false; submitBtn.textContent = '작성'; }
      });
    });
  }

  var wrappers = document.querySelectorAll('.consult-form-wrapper');
  for (var i = 0; i < wrappers.length; i++){ initForm(wrappers[i]); }
})();
</script>`;

// 하단 상담폼: 상단과 동일하되 마크업의 모든 id 에 -bottom 접미사를 붙여 중복 방지.
// (폼 스크립트는 id 가 아닌 폼 스코프/클래스/name 기준이라 접미사와 무관하게 동작)
const FORM_HTML_BOTTOM = FORM_HTML.replace(/id="([\w-]+)"/g, 'id="$1-bottom"');

// ─── 김재강 진단 랜딩 상세 HTML (kjk- 접두사) ───────────────────────────────
// 다크 배경 랜딩 + 인증사진 슬라이더(<script> 포함).
// detailRef 주입 이펙트가 script 재실행 / setInterval 추적·정리 / dedupe(kjk-form 제외) 를 처리.
// 슬라이더 스크립트는 IIFE + addEventListener 로만 구성 → window 전역 함수 미등록(정리 안전).
const DETAIL_HTML_1 = `<div class="kjk">
<style>
.kjk{--g:#22B573;--bg:#0A0A0A;--bg2:#0d0d0d;--cream:#FBF8EC;--ink:#141414;--mark:#b6f2c9;background:var(--bg);color:#fff;font-family:'Pretendard',-apple-system,BlinkMacSystemFont,system-ui,'Apple SD Gothic Neo',sans-serif;line-height:1.8;letter-spacing:-0.01em;overflow:hidden}
.kjk *{box-sizing:border-box}
.kjk-inner{max-width:760px;margin:0 auto;padding:0 20px}
.kjk-sec{padding:96px 0}
.kjk-sec--alt{background:var(--bg2)}
.kjk-eyebrow{display:flex;flex-direction:column;align-items:center;gap:12px;margin-bottom:28px}
.kjk-eyebrow i{display:block;width:2px;height:34px;background:var(--g)}
.kjk-eyebrow span{font-size:12px;letter-spacing:.22em;color:#8f8f8f;text-transform:uppercase}
.kjk-h2{font-size:29px;font-weight:800;text-align:center;line-height:1.5;margin:0 0 22px}
.kjk-h2 em{font-style:normal;color:var(--g)}
.kjk-lead{font-size:17px;color:#c9c9c9;text-align:center;margin:0 0 16px;line-height:1.85}
.kjk-lead strong{color:#fff;font-weight:700}
.kjk-lead em{font-style:normal;color:var(--g);font-weight:700}
.kjk-vline{display:block;width:2px;height:56px;background:var(--g);margin:36px auto}
.kjk-accent{font-size:19px;font-weight:800;color:#fff;text-align:center;margin:0;line-height:1.6}
.kjk-accent em{font-style:normal;color:var(--g)}
@media(max-width:640px){.kjk-h2{font-size:23px}.kjk-lead{font-size:15px}.kjk-sec{padding:76px 0}}

.kjk-points{display:flex;flex-direction:column;gap:18px;max-width:600px;margin:36px auto 0}
.kjk-point{background:#141414;border:1px solid #232323;border-left:3px solid var(--g);border-radius:14px;padding:24px}
.kjk-point h3{margin:0 0 8px;font-size:18px;font-weight:800;color:#fff}
.kjk-point p{margin:0;font-size:15px;color:#bdbdbd;line-height:1.75}
.kjk-note{margin:40px auto 0;max-width:600px;text-align:center;font-size:16px;color:#e6e6e6;line-height:1.85}
.kjk-note em{font-style:normal;color:var(--g);font-weight:700}

.kjk-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;max-width:680px;margin:40px auto 0}
.kjk-card{background:var(--cream);color:var(--ink);border-radius:18px;padding:28px 24px}
.kjk-card h4{margin:0 0 4px;font-size:12px;font-weight:700;color:#5a7d64;letter-spacing:.04em}
.kjk-card h3{margin:0 0 12px;font-size:19px;font-weight:800}
.kjk-card p{margin:0;font-size:14px;line-height:1.8;color:#333}
.kjk-card mark{background:var(--mark);color:var(--ink);padding:1px 4px;border-radius:4px;font-weight:600}
@media(max-width:640px){.kjk-grid{grid-template-columns:1fr}}

.kjk-trust{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#232323;border:1px solid #232323;border-radius:16px;overflow:hidden;max-width:680px;margin:24px auto 0}
.kjk-trust div{background:#111;padding:22px 12px;text-align:center;font-size:15px;font-weight:700;color:#fff}
.kjk-trust b{color:var(--g)}
@media(max-width:640px){.kjk-trust{grid-template-columns:1fr}}

.kjk-strip{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;align-items:flex-start;padding:10px 20px 20px;margin-top:14px;-webkit-overflow-scrolling:touch}
.kjk-strip img{flex:0 0 360px;width:360px;height:auto;scroll-snap-align:start;border-radius:16px;background:#1a1a1a;display:block}
@media(max-width:640px){.kjk-strip img{flex:0 0 320px;width:320px}}

.kjk-mq{overflow:hidden;width:100%;max-width:100%;margin-top:14px;-webkit-user-select:none;user-select:none}
.kjk-mq-track{display:flex;width:max-content;gap:14px;will-change:transform}
.kjk-mq-track img{height:280px;width:auto;display:block;border-radius:16px;background:#1a1a1a;flex:0 0 auto}

.kjk-who{display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:680px;margin:40px auto 0}
.kjk-who-item{background:#141414;border:1px solid #232323;border-radius:16px;padding:26px 22px}
.kjk-who-num{display:block;font-size:34px;font-weight:800;color:var(--g);line-height:1;margin-bottom:12px}
.kjk-who-item h3{margin:0 0 8px;font-size:16px;font-weight:800;color:#fff}
.kjk-who-item p{margin:0;font-size:14px;color:#bdbdbd;line-height:1.7}
@media(max-width:640px){.kjk-who{grid-template-columns:1fr}}

.kjk-letter{max-width:640px;margin:0 auto;text-align:left}
.kjk-letter h2{font-size:26px;font-weight:800;color:var(--g);line-height:1.5;margin:0 0 24px}
.kjk-letter p{font-size:16px;color:#dcdcdc;line-height:1.95;margin:0 0 24px}
.kjk-sign{font-size:22px;font-weight:800;color:#fff;letter-spacing:.35em;margin:0}
@media(max-width:640px){.kjk-letter h2{font-size:22px}}

.kjk-prog{max-width:600px;margin:36px auto 0}
.kjk-prog-item{padding:26px 0;border-top:1px solid #222}
.kjk-prog-item:first-child{border-top:0}
.kjk-prog-label{font-size:12px;font-weight:800;letter-spacing:.06em;color:var(--g);margin-bottom:8px}
.kjk-prog-body{font-size:16px;color:#eaeaea;line-height:1.7;margin:0}
.kjk-prog-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}
.kjk-prog-list li{font-size:15px;color:#d8d8d8;line-height:1.7}
.kjk-prog-list li b{color:#fff;font-weight:800;margin-right:4px}
</style>

<!-- STEP 01 · EMPATHY -->
<section class="kjk-sec">
  <div class="kjk-inner">
    <div class="kjk-eyebrow"><i></i><span>STEP 01 · EMPATHY</span></div>
    <h1 class="kjk-h2">대표님, 오늘도<br>혼자 뛰고 계셨습니다.</h1>
    <p class="kjk-lead">매출이 떨어지면 잠이 오지 않고<br>관리자가 흔들리면 대표가 대신 뜁니다.<br>그렇게 버티는 하루하루를, 저도 살아봤습니다.</p>
    <p class="kjk-lead">저는 46개 필라테스와 6개 대형 피트니스를 총괄하며<br>매출 압박 속에 눈치로 버티던 관리자들을<br>현장에서 직접 마주해온 사람입니다.</p>
    <span class="kjk-vline"></span>
    <p class="kjk-accent">성과 뒤의 답답함.<br><em>그 마음을 압니다.</em></p>
  </div>
</section>
</div>`;

// STEP 02 이후 상세 (문제 → 해결 → 설득 → CTA + 슬라이더 script)
const DETAIL_HTML_2 = `<div class="kjk">
<!-- STEP 02 · PROBLEM -->
<section class="kjk-sec kjk-sec--alt">
  <div class="kjk-inner">
    <div class="kjk-eyebrow"><i></i><span>STEP 02 · PROBLEM</span></div>
    <h2 class="kjk-h2">진짜 위기는 매출이 아니라,<br><em>'운영의 눈멀음'</em>입니다.</h2>
    <div class="kjk-points">
      <div class="kjk-point">
        <h3>혼자 뛰는 운동장</h3>
        <p>위기 상황에 대안을 가져오는 직원이 없다면, 그곳은 조직이 아니라 대표님 혼자 뛰는 운동장입니다.</p>
      </div>
      <div class="kjk-point">
        <h3>겉도는 소통</h3>
        <p>서로가 합의한 행동 기준이 없기에 소통은 겉돌고, 모든 리스크는 대표님의 고독한 결단으로 남습니다.</p>
      </div>
      <div class="kjk-point">
        <h3>보이지 않는 고장</h3>
        <p>어디가 고장 났는지 모른 채 감으로 버티는 운영. 대표가 더 열심히 할수록 조직은 더 의존하게 됩니다.</p>
      </div>
    </div>
    <p class="kjk-note">지금 필요한 건 더 많은 지시가 아닙니다.<br><em>현장을 스스로 읽게 할 '공통의 지표'입니다.</em></p>
  </div>
</section>

<!-- STEP 03 · SOLUTION -->
<section class="kjk-sec">
  <div class="kjk-inner">
    <div class="kjk-eyebrow"><i></i><span>STEP 03 · SOLUTION</span></div>
    <h2 class="kjk-h2">감이 아니라 <em>구조</em>로<br>돌아가게 만듭니다.</h2>
    <p class="kjk-lead">매출에 쫓기는 운영이 아니라,<br>방향이 분명하고 실행이 반복되는 구조입니다.</p>
    <div class="kjk-grid">
      <div class="kjk-card">
        <h4>(Detect)</h4><h3>데이터 분석</h3>
        <p>막연한 추측이 아닌 데이터로 현상을 진단합니다. <mark>상담 성공률, 회원 유지율 등 현장의 문제 지점을 데이터로 특정</mark>하여 개선 우선순위를 정합니다.</p>
      </div>
      <div class="kjk-card">
        <h4>(Divide)</h4><h3>역할 분리</h3>
        <p>트레이너와 매니저의 업무를 명확히 나누고, 지시 없이도 각자의 위치에서 <mark>스스로 판단하고 책임질 업무 범위를 설정</mark>합니다.</p>
      </div>
      <div class="kjk-card">
        <h4>(Action)</h4><h3>주간 실행</h3>
        <p>단순 결과 보고 회의를 없애고, 데이터를 근거로 <mark>관리자가 다음 주에 실행할 구체적인 계획</mark>을 직접 수립하게 만듭니다.</p>
      </div>
      <div class="kjk-card">
        <h4>(Decide)</h4><h3>의사 결정</h3>
        <p>대표님의 판단에만 의존하는 구조를 깨고, 관리자가 <mark>데이터라는 확신을 가지고 현장에서 즉시 결정하는 체계</mark>를 구축합니다.</p>
      </div>
    </div>
    <div class="kjk-trust">
      <div><b>52개</b> 센터 총괄</div>
      <div><b>10년</b> 운영 데이터</div>
      <div><b>수백 명</b> 조직 리딩</div>
    </div>
  </div>
</section>

<!-- STEP 04-1 · PROOF (카톡 후기) -->
<section class="kjk-sec kjk-sec--alt">
  <div class="kjk-inner">
    <div class="kjk-eyebrow"><i></i><span>STEP 04 · REAL TALK</span></div>
    <h2 class="kjk-h2">현장에서 도착한<br><em>진짜 메시지</em>들입니다.</h2>
  </div>
  <div class="kjk-strip">
    <img src="https://cdn.imweb.me/thumbnail/20260225/e93ca9ff08f57.jpg" alt="김재강 멘토 실시간 카톡 후기 1">
    <img src="https://cdn.imweb.me/thumbnail/20260225/916c4041aee53.jpg" alt="김재강 멘토 실시간 카톡 후기 2">
    <img src="https://cdn.imweb.me/thumbnail/20260225/d9aad9fd0bfd0.jpg" alt="김재강 멘토 실시간 카톡 후기 3">
    <img src="https://cdn.imweb.me/thumbnail/20260311/36b12b4672c0d.png" alt="김재강 멘토 실시간 카톡 후기 4">
    <img src="https://cdn.imweb.me/thumbnail/20260312/9e8faf83a4069.jpg" alt="김재강 멘토 실시간 카톡 후기 5">
    <img src="https://cdn.imweb.me/thumbnail/20260312/b04ef0ea34d4b.jpg" alt="김재강 멘토 실시간 카톡 후기 6">
    <img src="https://cdn.imweb.me/thumbnail/20260225/6ab322c87ee75.jpg" alt="김재강 멘토 실시간 카톡 후기 7">
    <img src="https://cdn.imweb.me/thumbnail/20260225/36ab76ce44623.jpg" alt="김재강 멘토 실시간 카톡 후기 8">
    <img src="https://cdn.imweb.me/thumbnail/20260225/a139d97449a27.jpg" alt="김재강 멘토 실시간 카톡 후기 9">
    <img src="https://cdn.imweb.me/thumbnail/20260225/6c5b4f8faba0b.jpg" alt="김재강 멘토 실시간 카톡 후기 10">
  </div>
</section>

<!-- STEP 04-2 · PROOF (인증사진 무한 마퀴) -->
<section class="kjk-sec">
  <div class="kjk-inner">
    <div class="kjk-eyebrow"><i></i><span>PROOF · CERTIFIED</span></div>
    <h2 class="kjk-h2">함께한 대표님들이<br><em>증명</em>합니다.</h2>
  </div>
  <div class="kjk-mq" id="kjkCertMarquee">
    <div class="kjk-mq-track">
      <img src="https://cdn.imweb.me/thumbnail/20260223/07206486c31ee.jpg" alt="김재강 멘토 회원 매출 인증 사진 1">
      <img src="https://cdn.imweb.me/thumbnail/20260223/c39bde9d80ca8.jpg" alt="김재강 멘토 회원 매출 인증 사진 2">
      <img src="https://cdn.imweb.me/thumbnail/20260223/6205ff8de0c6c.jpg" alt="김재강 멘토 회원 매출 인증 사진 3">
      <img src="https://cdn.imweb.me/thumbnail/20260223/92e7b7e705ba3.jpg" alt="김재강 멘토 회원 매출 인증 사진 4">
      <img src="https://cdn.imweb.me/thumbnail/20260223/fc284d3b69261.jpg" alt="김재강 멘토 회원 매출 인증 사진 5">
      <img src="https://cdn.imweb.me/thumbnail/20260223/1c1186df37343.jpg" alt="김재강 멘토 회원 매출 인증 사진 6">
      <img src="https://cdn.imweb.me/thumbnail/20260223/e813e7b6e3237.jpg" alt="김재강 멘토 회원 매출 인증 사진 7">
      <img src="https://cdn.imweb.me/thumbnail/20260224/e62ff81508acf.jpg" alt="김재강 멘토 회원 매출 인증 사진 8">
      <img src="https://cdn.imweb.me/thumbnail/20260223/07206486c31ee.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260223/c39bde9d80ca8.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260223/6205ff8de0c6c.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260223/92e7b7e705ba3.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260223/fc284d3b69261.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260223/1c1186df37343.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260223/e813e7b6e3237.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260224/e62ff81508acf.jpg" alt="" aria-hidden="true">
    </div>
  </div>
</section>

<!-- STEP 04-3 · PROOF (강연 현장 무한 마퀴, 인증사진과 반대 방향) -->
<section class="kjk-sec kjk-sec--alt">
  <div class="kjk-inner">
    <div class="kjk-eyebrow"><i></i><span>PROOF · ON THE FIELD</span></div>
    <h2 class="kjk-h2">데이터로 증명하는<br><em>강연 현장</em></h2>
  </div>
  <div class="kjk-mq" id="kjkSeminarMarquee">
    <div class="kjk-mq-track">
      <img src="https://cdn.imweb.me/thumbnail/20260223/0beb9f453dc77.jpg" alt="김재강 멘토 강연 현장 사진 1">
      <img src="https://cdn.imweb.me/thumbnail/20260220/fe5d6209a54a9.jpg" alt="김재강 멘토 강연 현장 사진 2">
      <img src="https://cdn.imweb.me/thumbnail/20260220/42259675f4f0b.jpg" alt="김재강 멘토 강연 현장 사진 3">
      <img src="https://cdn.imweb.me/thumbnail/20260220/9e172a0003d05.jpg" alt="김재강 멘토 강연 현장 사진 4">
      <img src="https://cdn.imweb.me/thumbnail/20260220/82c1ee03de2f5.jpg" alt="김재강 멘토 강연 현장 사진 5">
      <img src="https://cdn.imweb.me/thumbnail/20260223/0beb9f453dc77.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260220/fe5d6209a54a9.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260220/42259675f4f0b.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260220/9e172a0003d05.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260220/82c1ee03de2f5.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260223/0beb9f453dc77.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260220/fe5d6209a54a9.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260220/42259675f4f0b.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260220/9e172a0003d05.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260220/82c1ee03de2f5.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260223/0beb9f453dc77.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260220/fe5d6209a54a9.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260220/42259675f4f0b.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260220/9e172a0003d05.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260220/82c1ee03de2f5.jpg" alt="" aria-hidden="true">
    </div>
  </div>
</section>

<!-- STEP 04-4 · PROOF (추천 대상) -->
<section class="kjk-sec">
  <div class="kjk-inner">
    <div class="kjk-eyebrow"><i></i><span>PROOF · FOR YOU</span></div>
    <h2 class="kjk-h2">이런 분들에게<br>추천합니다.</h2>
    <div class="kjk-who">
      <div class="kjk-who-item"><span class="kjk-who-num">1</span><h3>내 헌신으로 버티는 분</h3><p>매출이 떨어지면 대표님이 가장 먼저 현장에 뛰어들어 대신 뛰고 계신 분</p></div>
      <div class="kjk-who-item"><span class="kjk-who-num">2</span><h3>직원에게 의존받는 분</h3><p>사소한 결정도 대표님 없이는 멈춰버려, 24시간 핸드폰을 놓지 못하는 분</p></div>
      <div class="kjk-who-item"><span class="kjk-who-num">3</span><h3>회의 목적이 불분명한 분</h3><p>결과만 읊는 의미 없는 보고 대신, 데이터 기반의 확실한 대안이 필요한 분</p></div>
      <div class="kjk-who-item"><span class="kjk-who-num">4</span><h3>자유로운 성장을 꿈꾸는 분</h3><p>대표의 부재가 센터의 성장이 되는 시스템이 필요한 분</p></div>
    </div>
  </div>
</section>

<!-- STEP 04-5 · CLOSING (철학 레터) -->
<section class="kjk-sec kjk-sec--alt">
  <div class="kjk-inner">
    <div class="kjk-eyebrow"><i></i><span>CLOSING · LETTER</span></div>
    <div class="kjk-letter">
      <h2>대표가 없어도 돌아가는<br>센터를 만듭니다.</h2>
      <p>대표를 더 강하게 만드는 대신<br>센터를 더 단단하게 만드는 길을 택했습니다.</p>
      <p>팀장이 스스로 계획을 세우고<br>매니저가 숫자를 읽고<br>회의에서 다음 액션이 결정되는 구조.</p>
      <p>그걸 함께 만듭니다.</p>
      <p class="kjk-sign">김 재 강</p>
    </div>
  </div>
</section>

<!-- STEP 04-6 · PROGRAM (박스 없이 다크 톤) -->
<section class="kjk-sec">
  <div class="kjk-inner">
    <div class="kjk-eyebrow"><i></i><span>PROGRAM</span></div>
    <h2 class="kjk-h2">김재강 멘토의 솔루션:<br>멈추지 않는 <em>관리자 자립의 기술</em></h2>
    <div class="kjk-prog">
      <div class="kjk-prog-item">
        <div class="kjk-prog-label">프로그램</div>
        <p class="kjk-prog-body">김재강 멘토의 1:1 운영 시스템 밀착 구축</p>
      </div>
      <div class="kjk-prog-item">
        <div class="kjk-prog-label">진단 시간</div>
        <p class="kjk-prog-body">주 1회, 한달 코스로 진행합니다.</p>
      </div>
      <div class="kjk-prog-item">
        <div class="kjk-prog-label">커리큘럼</div>
        <ul class="kjk-prog-list">
          <li><b>[지표 판별]</b> 상담 성공률·유지율 분석 및 매출 병목 지점 추출</li>
          <li><b>[권한 분리]</b> 관리자-트레이너 직무 구분 및 자율 판단 범위 확정</li>
          <li><b>[루틴 교정]</b> 결과 보고 회의의 폐기 및 데이터 기반 주간 액션 설계</li>
          <li><b>[구조 안착]</b> 대표 부재 시의 의사결정 체계 검증 및 자생 환경 완성</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<script>
(function(){
  var stops = [];

  // requestAnimationFrame 기반 무한 마퀴 (로고 슬라이더와 동일 원리)
  //  - 트랙은 [원본 세트 + 동일 세트] 로 구성되어, scrollWidth/2 만큼 이동 시 되감아 이음매가 없음.
  //  - toRight=false 는 왼쪽으로 흐름, toRight=true 는 오른쪽으로 흐름(반대 방향).
  function marquee(id, pxPerSec, toRight){
    var root = document.getElementById(id);
    if (!root) return;
    var track = root.querySelector('.kjk-mq-track');
    if (!track) return;
    var paused = false, offset = 0, last = 0, rafId = 0;
    // 데스크톱 호버 시 일시정지, 벗어나면 재개
    root.addEventListener('mouseenter', function(){ paused = true; });
    root.addEventListener('mouseleave', function(){ paused = false; });
    function frame(ts){
      if (!last) last = ts;
      var dt = ts - last; last = ts;
      var half = track.scrollWidth / 2;
      if (!paused && half > 0){
        if (toRight){
          offset += pxPerSec * dt / 1000;
          if (offset >= 0) offset -= half;
        } else {
          offset -= pxPerSec * dt / 1000;
          if (offset <= -half) offset += half;
        }
        track.style.transform = 'translateX(' + offset + 'px)';
      }
      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);
    stops.push(function(){ cancelAnimationFrame(rafId); });
  }

  marquee('kjkCertMarquee', 36, false);    // 인증사진: 왼쪽으로
  marquee('kjkSeminarMarquee', 36, true);  // 강연사진: 반대(오른쪽)로

  // 언마운트 정리용 전역 정지 훅. React cleanup 에서 호출한 뒤 no-op 으로 교체(삭제 금지).
  window.__kjkMarqueeStop = function(){
    for (var i = 0; i < stops.length; i++){ stops[i](); }
  };

  // CTA → 상단 상담폼(#kjk-form) 부드럽게 스크롤 (고정 헤더 높이만큼 오프셋)
  var cta = document.querySelector('.kjk-cta');
  if (cta) {
    cta.onclick = function(e){
      e.preventDefault();
      var t = document.getElementById('kjk-form');
      if (!t) return;
      var y = t.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: y, behavior: 'smooth' });
    };
  }
})();
</script>
</div>`;

// ─── 로고 슬라이더 HTML (다크, kjk-logo- 접두사) ───────────────────────────
// 3행 무한 마퀴(rAF). 클래스/id 는 kjk-logo- / kjkLogoRow* 로 접두사 처리(충돌 방지).
// rAF 는 행별 id 추적 → 전역 정지 훅(__kjkLogoStop) 로 언마운트 시 cancelAnimationFrame.
const LOGO_HTML = `<style>
  .kjk-logo-wrap{width:100%;max-width:100%;background:#000;padding:24px 0;overflow:hidden}
  .kjk-logo-row{width:100%;overflow:hidden;margin-bottom:20px}
  .kjk-logo-row:last-child{margin-bottom:0}
  .kjk-logo-inner{display:flex;align-items:center;will-change:transform}
  .kjk-logo-track{display:flex;align-items:center;gap:48px;padding:0 24px;flex-shrink:0}
  .kjk-logo-track img{height:55px;width:auto;object-fit:contain;flex-shrink:0;display:block}
</style>

<div class="kjk-logo-wrap">
  <div class="kjk-logo-row" id="kjkLogoRow1"></div>
  <div class="kjk-logo-row" id="kjkLogoRow2"></div>
  <div class="kjk-logo-row" id="kjkLogoRow3"></div>
</div>

<script>
(function() {
  var stops = [];
  var rows = [
    {
      id: 'kjkLogoRow1', direction: -1, speed: 0.5,
      logos: [
        'https://cdn.imweb.me/thumbnail/20260223/7841a3371cc29.png',
        'https://cdn.imweb.me/thumbnail/20260223/3945899095a5b.png',
        'https://cdn.imweb.me/thumbnail/20260223/0a41b156648cf.png',
        'https://cdn.imweb.me/thumbnail/20260223/ba9d2fadf5832.png',
        'https://cdn.imweb.me/thumbnail/20260223/c4174f387fe6b.png',
        'https://cdn.imweb.me/thumbnail/20260223/e13a8a36924c8.png'
      ]
    },
    {
      id: 'kjkLogoRow2', direction: 1, speed: 0.4,
      logos: [
        'https://cdn.imweb.me/thumbnail/20260223/1cdfdc0ac2452.png',
        'https://cdn.imweb.me/thumbnail/20260223/e7f1f1c277127.png',
        'https://cdn.imweb.me/thumbnail/20260223/bb90b7eaef3d7.png',
        'https://cdn.imweb.me/thumbnail/20260223/d3ae7ae970f2a.png',
        'https://cdn.imweb.me/thumbnail/20260223/827c64d3f3db9.png',
        'https://cdn.imweb.me/thumbnail/20260223/cccdfd0f52cb0.png'
      ]
    },
    {
      id: 'kjkLogoRow3', direction: -1, speed: 0.55,
      logos: [
        'https://cdn.imweb.me/thumbnail/20260223/7749e65c1c4eb.png',
        'https://cdn.imweb.me/thumbnail/20260223/ae249b50f1585.png',
        'https://cdn.imweb.me/thumbnail/20260223/bd91df10a076b.png',
        'https://cdn.imweb.me/thumbnail/20260223/49528417a6225.png',
        'https://cdn.imweb.me/thumbnail/20260223/82d6d15032feb.png',
        'https://cdn.imweb.me/thumbnail/20260223/5f15997a2500b.png'
      ]
    }
  ];

  function buildTrack(logos) {
    var track = document.createElement('div');
    track.className = 'kjk-logo-track';
    logos.forEach(function(src, i) {
      var img = document.createElement('img');
      img.src = src;
      img.alt = '파트너사 로고 ' + (i + 1);
      track.appendChild(img);
    });
    return track;
  }

  rows.forEach(function(rowConfig) {
    var rowEl = document.getElementById(rowConfig.id);
    if (!rowEl) return;
    rowEl.innerHTML = ''; // 재주입 시 중복 방지

    var inner = document.createElement('div');
    inner.className = 'kjk-logo-inner';
    rowEl.appendChild(inner);

    var firstTrack = buildTrack(rowConfig.logos);
    inner.appendChild(firstTrack);

    var rafId = 0;
    rafId = requestAnimationFrame(function() {
      var trackW = firstTrack.offsetWidth || 300; // 0 이면 무한루프 방지용 폴백
      var screenW = window.innerWidth || 375;
      var count = Math.ceil((screenW * 3) / trackW) + 2;
      for (var i = 0; i < count; i++) {
        inner.appendChild(buildTrack(rowConfig.logos));
      }

      var offset = rowConfig.direction === 1 ? -trackW : 0;

      function animate() {
        offset += rowConfig.direction * rowConfig.speed;
        if (rowConfig.direction === -1 && offset <= -trackW) offset += trackW;
        if (rowConfig.direction === 1 && offset >= 0) offset -= trackW;
        inner.style.transform = 'translateX(' + offset + 'px)';
        rafId = requestAnimationFrame(animate);
      }
      animate();
    });

    stops.push(function() { cancelAnimationFrame(rafId); });
  });

  // 언마운트 정리용 전역 정지 훅. React cleanup 에서 호출 후 no-op 으로 교체(삭제 금지).
  window.__kjkLogoStop = function() {
    for (var i = 0; i < stops.length; i++) { stops[i](); }
  };
})();
</script>`;

export default function KimJaegangDiagnosisPage() {
  const [imgError, setImgError] = useState(false);

  // 우측 진단 폼(FORM_HTML)은 클라이언트에서만 렌더링하여 서버/클라이언트 HTML 불일치를
  // 원천 차단한다. (FORM_HTML 은 외부 HTML + script 가 섞여 있음)
  const [mounted, setMounted] = useState(false);

  // 폼 HTML 컨테이너 ref (상단 / 하단)
  const formRef = useRef<HTMLDivElement>(null);
  const bottomFormRef = useRef<HTMLDivElement>(null);
  // 랜딩 상세 컨테이너 ref — STEP01(파트너 슬라이더 앞) / STEP02+(슬라이더 뒤, script 포함)
  const detailRef1 = useRef<HTMLDivElement>(null);
  const detailRef2 = useRef<HTMLDivElement>(null);
  // 로고 슬라이더(LOGO_HTML) 컨테이너 ref
  const logoRef = useRef<HTMLDivElement>(null);

  // 마운트 후에만 FORM_HTML 을 삽입한다.
  useEffect(() => {
    setMounted(true);
  }, []);

  // 외부 HTML(+CSS+JS)을 React 환경에서 제대로 동작시키기 위한 처리.
  //  1) dangerouslySetInnerHTML 로 들어온 DOM이 커밋된 뒤(useEffect 시점) 실행.
  //  2) 중복 id 충돌 방지: 두 번째부터 -2, -3 … 접미사를 붙임 (script 실행 전에 수행).
  //  3) innerHTML 로 삽입된 <script> 는 실행되지 않으므로, 같은 내용의 새 <script>를
  //     만들어 document.body 에 append → 실행시킴 (DOM 삽입 → 스크립트 실행 순서 보장).
  //  4) 언마운트 시 추가한 <script>, 슬라이더 interval, 인라인 핸들러용 전역 함수를 정리.
  useEffect(() => {
    // 마운트되어 FORM_HTML 이 실제 DOM 에 삽입된 뒤에만 실행한다.
    if (!mounted) return;
    const container = formRef.current;
    if (!container) return;

    // 2) 중복 id 충돌 방지
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

    // 3) <script> 재생성 → body 에 append 하여 실행
    //    슬라이더 자동재생 등에서 만든 setInterval 을 cleanup 에서 끄기 위해,
    //    스크립트 실행 동안 생성되는 interval id 를 가로채 기록한다.
    //    (이렇게 하지 않으면 언마운트 후에도 setInterval 이 살아남아
    //     이미 삭제된 전역 함수를 호출 → TypeError)
    const intervalIds: number[] = [];
    const origSetInterval = window.setInterval;
    window.setInterval = function (
      this: unknown,
      ...a: Parameters<typeof window.setInterval>
    ) {
      const id = origSetInterval.apply(window, a);
      intervalIds.push(id as unknown as number);
      return id;
    } as typeof window.setInterval;

    const injected: HTMLScriptElement[] = [];
    container.querySelectorAll("script").forEach((oldScript) => {
      const newScript = document.createElement("script");
      // 속성 복사 (src, type 등)
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      newScript.textContent = oldScript.textContent;
      document.body.appendChild(newScript);
      injected.push(newScript);
    });

    // 스크립트 실행이 끝났으니 원래 setInterval 복구
    window.setInterval = origSetInterval;

    // 4) cleanup
    return () => {
      // 먼저 슬라이더 자동재생 interval 정리 (전역 함수 삭제 전에)
      intervalIds.forEach((id) => clearInterval(id));
      injected.forEach((s) => s.remove());
      // 인라인 onclick 이 참조하던 전역 함수 정리 (best-effort)
      const globals = [
        "toggleFaq",
        "toggleCheck",
        "updateCheckResult",
        "animateCount",
        "moveEvSlide",
        "moveRevSlide",
        "acSlide",
        "scrollToForm",
      ];
      const w = window as unknown as Record<string, unknown>;
      globals.forEach((fn) => {
        try {
          delete w[fn];
        } catch {
          // 전역 함수 선언은 삭제 불가일 수 있음 — 무시
        }
      });
    };
  }, [mounted]);

  // 랜딩 상세(DETAIL_HTML) 주입 처리 — 인증사진 슬라이더 <script> 재실행.
  //  · dedupe 시 CTA 앵커 대상 id="kjk-form" 는 보존(제외).
  //  · 슬라이더 스크립트는 window 전역 함수를 등록하지 않으므로, cleanup 은
  //    setInterval 정리 + 주입 script 제거만 수행한다.(전역 delete 로 인한
  //    "is not a function" 위험 없음)
  useEffect(() => {
    if (!mounted) return;
    const container = detailRef2.current;
    if (!container) return;

    // 중복 id 충돌 방지 (앵커 대상 kjk-form 은 제외)
    const seen = new Set<string>();
    container.querySelectorAll<HTMLElement>("[id]").forEach((el) => {
      if (el.id === "kjk-form") return;
      if (!seen.has(el.id)) {
        seen.add(el.id);
        return;
      }
      let n = 2;
      while (document.getElementById(`${el.id}-${n}`)) n++;
      el.id = `${el.id}-${n}`;
    });

    // <script> 재생성 → body 에 append 하여 실행. 실행 중 만든 setInterval 추적.
    const intervalIds: number[] = [];
    const origSetInterval = window.setInterval;
    window.setInterval = function (
      this: unknown,
      ...a: Parameters<typeof window.setInterval>
    ) {
      const id = origSetInterval.apply(window, a);
      intervalIds.push(id as unknown as number);
      return id;
    } as typeof window.setInterval;

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

    window.setInterval = origSetInterval;

    return () => {
      intervalIds.forEach((id) => clearInterval(id));
      injected.forEach((s) => s.remove());
      // 마퀴 requestAnimationFrame 정리: 전역 정지 훅 호출 후 no-op 으로 교체(삭제 금지 →
      // 페이지 이동 뒤 잔여 참조가 호출돼도 "is not a function" 이 발생하지 않게).
      const w = window as unknown as Record<string, unknown>;
      const stop = w["__kjkMarqueeStop"];
      if (typeof stop === "function") (stop as () => void)();
      w["__kjkMarqueeStop"] = () => {};
    };
  }, [mounted]);

  // 로고 슬라이더(LOGO_HTML) 주입 — rAF 마퀴 script 재실행.
  //  · 언마운트 시 전역 정지 훅(__kjkLogoStop) 호출로 rAF 취소 후 no-op 교체(삭제 금지).
  useEffect(() => {
    if (!mounted) return;
    const container = logoRef.current;
    if (!container) return;

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

    return () => {
      injected.forEach((s) => s.remove());
      const w = window as unknown as Record<string, unknown>;
      const stop = w["__kjkLogoStop"];
      if (typeof stop === "function") (stop as () => void)();
      w["__kjkLogoStop"] = () => {};
    };
  }, [mounted]);

  // 하단 상담폼(FORM_HTML_BOTTOM) 주입 — 스크립트 재실행(폼 스코프 초기화).
  //  · 하단 폼 id 는 이미 -bottom 접미사라 상단과 충돌 없음.
  //  · 폼 스크립트는 window 전역 미등록 → cleanup 은 주입 script 제거만.
  useEffect(() => {
    if (!mounted) return;
    const container = bottomFormRef.current;
    if (!container) return;

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

    return () => {
      injected.forEach((s) => s.remove());
    };
  }, [mounted]);

  return (
    <div className="bg-white overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_SCHEMA) }}
      />
      {/* ───────────────── 상단 메인 영역 (2단) ───────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 lg:items-start">
          {/* 좌: 인물 세로형 이미지 (3/4~4/5) */}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[#f1f1f1]">
            {!imgError ? (
              <Image
                src={MAIN_IMAGE}
                alt="김재강 헬스장·필라테스 운영 진단 멘토"
                fill
                priority
                className="object-cover object-center"
                sizes="(min-width: 1024px) 50vw, 100vw"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
                <svg
                  className="h-12 w-12"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M2.25 6.75h19.5M3.75 4.5h16.5a1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V6a1.5 1.5 0 011.5-1.5z"
                  />
                </svg>
                <span className="text-xs">{MAIN_IMAGE}</span>
              </div>
            )}
          </div>

          {/* 우: 진단 상담 폼 (FORM_HTML 삽입 영역) — CTA(#kjk-form) 스크롤 타겟 */}
          <div id="kjk-form" className="w-full scroll-mt-24">
            {/* 여기에 진단 상담 폼 HTML 삽입 — 위 FORM_HTML 문자열에 붙여넣기 */}
            {mounted ? (
              <div
                ref={formRef}
                suppressHydrationWarning
                dangerouslySetInnerHTML={{ __html: FORM_HTML }}
              />
            ) : (
              <div ref={formRef} suppressHydrationWarning />
            )}
          </div>
        </div>
      </section>

      {/* ── 랜딩 상세 STEP 01 (공감) — 파트너 슬라이더 앞 ── */}
      {mounted ? (
        <div
          ref={detailRef1}
          className="w-full"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: DETAIL_HTML_1 }}
        />
      ) : (
        <div ref={detailRef1} className="w-full" suppressHydrationWarning />
      )}

      {/* ── 로고 슬라이더 (STEP 01 ↔ STEP 02 사이, 다크) ── */}
      <div className="w-full bg-black">
        <div className="mx-auto max-w-[760px] px-5 pt-16 pb-2 text-center">
          <p className="text-sm text-[#9a9a9a]">
            숫자가 아니라, 이름으로 증명합니다.
          </p>
        </div>
        {mounted ? (
          <div
            ref={logoRef}
            className="w-full"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: LOGO_HTML }}
          />
        ) : (
          <div ref={logoRef} className="w-full" suppressHydrationWarning />
        )}
      </div>

      {/* ── 랜딩 상세 STEP 02~ (문제 이후 + 슬라이더 script) ── */}
      {mounted ? (
        <div
          ref={detailRef2}
          className="w-full"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: DETAIL_HTML_2 }}
        />
      ) : (
        <div ref={detailRef2} className="w-full" suppressHydrationWarning />
      )}

      {/* ── 하단 상담폼 (프로그램 아래, ConsultantCarousel 위) ── */}
      <section className="w-full bg-[#0d0d0d] px-4 py-16 sm:py-20">
        <h2 className="mb-8 text-center text-xl font-extrabold text-white sm:text-2xl">
          지금, 1회 무료 진단으로 시작합니다.
        </h2>
        {mounted ? (
          <div
            ref={bottomFormRef}
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: FORM_HTML_BOTTOM }}
          />
        ) : (
          <div ref={bottomFormRef} suppressHydrationWarning />
        )}
      </section>

      {/* ───────────────── 다른 서비스 둘러보기 (추천 상품) ───────────────── */}
      {/* 다른 멘토 확인 */}
      <ConsultantCarousel currentSlug="kim-jaegang" />

      <section className="w-full bg-[#f8f9fa]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <h2 className="mb-8 text-center text-xl font-extrabold text-[#1a1a1a] sm:mb-12 sm:text-2xl">
            이런 서비스도 있어요
          </h2>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {RELATED_SERVICES.map((s) => (
              <RelatedServiceCard key={s.href} service={s} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
