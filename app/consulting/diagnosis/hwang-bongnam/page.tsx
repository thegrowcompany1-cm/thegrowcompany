"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 진단 컨설턴트 상세페이지 — 황봉남
//  구조(김승호 최종본과 동일): [상단 인물사진 + 상담폼] → DETAIL_HTML(다크 랜딩)
//   → [하단 상담폼(-bottom id)] → ConsultantCarousel → 추천 카드
//  · 클래스 접두사 hbn- / 전역 정지 훅 __hbnMarqueeStop
//  · mounted 클라이언트 전용 렌더 + suppressHydrationWarning
//  · innerHTML <script> 는 주입 이펙트(injectContainer)가 재생성 append 하여 실행
//  · 현장사진 마퀴는 requestAnimationFrame + cancelAnimationFrame 정리
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ConsultantCarousel from "@/components/ConsultantCarousel";
import { SITE_URL } from "@/lib/site";

// 진단 컨설팅 Service 구조화 데이터 — 담당자는 provider.employee(Person)로 중첩
const SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "피트니스 센터 진단 컨설팅",
  name: "황봉남 컨설턴트 진단 컨설팅",
  url: `${SITE_URL}/consulting/diagnosis/hwang-bongnam`,
  areaServed: "KR",
  provider: {
    "@type": "Organization",
    name: "더그로우컴퍼니",
    url: SITE_URL,
    employee: {
      "@type": "Person",
      name: "황봉남",
      jobTitle: "인적자원·PT 컨설턴트",
    },
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "KRW",
  },
};

// 좌측 메인 이미지 (public 기준)
const MAIN_IMAGE = "/consultants/hwang-bongnam.jpg";

// 하단 "다른 서비스 둘러보기" 추천 카드 (현재 페이지인 진단 컨설팅은 제외)
const RELATED_SERVICES = [
  {
    title: "창업 컨설팅",
    desc: "헬스장·필라테스 등 창업 준비를 위한 컨설팅",
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

  return (
    <Link
      href={service.href}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-[#009519] hover:shadow-lg"
    >
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
    <h2>진단 컨설팅 상담 신청(무료)</h2>
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
      <label class="form-label">원하시는 컨설팅 분야를 선택해주세요. (중복 선택 가능합니다) <span class="required">*</span></label>
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
      <label class="form-label">도움받고 싶은 컨설턴트를 알려주세요. <span class="required">*</span></label>
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
  // DOMContentLoaded 대신 즉시 실행하고, data-hbn-init 로 재실행 시 중복 바인딩을 막는다.
  function initForm(wrapper){
    if (!wrapper || wrapper.getAttribute('data-hbn-init')) return;
    wrapper.setAttribute('data-hbn-init', '1');

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
      if (selectedConsultField.length === 0){ alert('원하시는 컨설팅 분야를 선택해주세요.'); return; }
      var selectedConsultant = q('.consultant-radio:checked');
      if (!selectedConsultant){ alert('도움받고 싶은 컨설턴트를 선택해주세요.'); return; }

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
        alert('진단 컨설팅 상담 신청이 정상적으로 접수되었습니다.\\n빠른 시일 내에 연락드리겠습니다.');
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
const FORM_HTML_BOTTOM = FORM_HTML.replace(/id="([\w-]+)"/g, 'id="$1-bottom"');

// ─── 황봉남 진단 랜딩 상세 HTML (hbn- 접두사, eyebrow 없음) ────────────────────
// 현장사진 마퀴 <script> 포함. detailRef 주입 이펙트가 script 재실행 + rAF 정리.
// 현장사진 13장(이음매 없는 무한 루프를 위해 각 2회씩 = 26개 img).
const DETAIL_HTML = `<div class="hbn">
<style>
.hbn{--g:#22B573;--bg:#0A0A0A;--bg2:#0d0d0d;--cream:#FBF8EC;--ink:#141414;--mark:#b6f2c9;background:var(--bg);color:#fff;font-family:'Pretendard',-apple-system,BlinkMacSystemFont,system-ui,'Apple SD Gothic Neo',sans-serif;line-height:1.8;letter-spacing:-0.01em;overflow:hidden}
.hbn *{box-sizing:border-box}
.hbn-inner{max-width:760px;margin:0 auto;padding:0 20px}
.hbn-sec{padding:96px 0}
.hbn-sec--alt{background:var(--bg2)}
.hbn-h2{font-size:29px;font-weight:800;text-align:center;line-height:1.5;margin:0 0 22px}
.hbn-h2 em{font-style:normal;color:var(--g)}
.hbn-lead{font-size:17px;color:#c9c9c9;text-align:center;margin:0 0 16px;line-height:1.85}
.hbn-lead strong{color:#fff;font-weight:700}
.hbn-lead em{font-style:normal;color:var(--g);font-weight:700}
.hbn-vline{display:block;width:2px;height:56px;background:var(--g);margin:36px auto}
.hbn-accent{font-size:19px;font-weight:800;color:#fff;text-align:center;margin:0;line-height:1.6}
.hbn-accent em{font-style:normal;color:var(--g)}
@media(max-width:640px){.hbn-h2{font-size:23px}.hbn-lead{font-size:15px}.hbn-sec{padding:76px 0}}

.hbn-points{display:flex;flex-direction:column;gap:18px;max-width:600px;margin:36px auto 0}
.hbn-point{background:#141414;border:1px solid #232323;border-left:3px solid var(--g);border-radius:14px;padding:24px}
.hbn-point h3{margin:0 0 8px;font-size:18px;font-weight:800;color:#fff}
.hbn-point p{margin:0;font-size:15px;color:#bdbdbd;line-height:1.75}
.hbn-note{margin:40px auto 0;max-width:600px;text-align:center;font-size:16px;color:#e6e6e6;line-height:1.85}
.hbn-note em{font-style:normal;color:var(--g);font-weight:700}

.hbn-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;max-width:680px;margin:40px auto 0}
.hbn-card{background:var(--cream);color:var(--ink);border-radius:18px;padding:28px 24px}
.hbn-card h4{margin:0 0 4px;font-size:12px;font-weight:700;color:#5a7d64;letter-spacing:.04em}
.hbn-card h3{margin:0 0 12px;font-size:19px;font-weight:800}
.hbn-card p{margin:0;font-size:14px;line-height:1.8;color:#333}
.hbn-card mark{background:var(--mark);color:var(--ink);padding:1px 4px;border-radius:4px;font-weight:600}
@media(max-width:640px){.hbn-grid{grid-template-columns:1fr}}

.hbn-trust{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#232323;border:1px solid #232323;border-radius:16px;overflow:hidden;max-width:680px;margin:24px auto 0}
.hbn-trust div{background:#111;padding:22px 14px;text-align:center;font-size:14px;font-weight:600;color:#eaeaea;line-height:1.6}
.hbn-trust b{color:var(--g);font-weight:800}
@media(max-width:640px){.hbn-trust{grid-template-columns:1fr}}

.hbn-mq{overflow:hidden;width:100%;max-width:100%;margin-top:14px;-webkit-user-select:none;user-select:none}
.hbn-mq-track{display:flex;width:max-content;gap:14px;will-change:transform}
.hbn-mq-track img{height:280px;width:auto;display:block;border-radius:16px;background:#1a1a1a;flex:0 0 auto}

.hbn-who{display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:680px;margin:40px auto 0}
.hbn-who-item{background:#141414;border:1px solid #232323;border-radius:16px;padding:26px 22px}
.hbn-who-num{display:block;font-size:34px;font-weight:800;color:var(--g);line-height:1;margin-bottom:12px}
.hbn-who-item h3{margin:0 0 8px;font-size:16px;font-weight:800;color:#fff}
.hbn-who-item p{margin:0;font-size:14px;color:#bdbdbd;line-height:1.7}
@media(max-width:640px){.hbn-who{grid-template-columns:1fr}}

.hbn-letter-wrap{display:flex;gap:40px;align-items:center;max-width:760px;margin:0 auto}
.hbn-letter-txt{flex:1;min-width:0}
.hbn-letter-txt h2{font-size:25px;font-weight:800;color:var(--g);line-height:1.5;margin:0 0 24px}
.hbn-letter-txt p{font-size:16px;color:#dcdcdc;line-height:1.95;margin:0 0 24px}
.hbn-sign{font-size:22px;font-weight:800;color:#fff;letter-spacing:.35em;margin:0}
.hbn-letter-img{flex:0 0 280px;width:280px;aspect-ratio:3/4;object-fit:cover;border-radius:18px;filter:grayscale(1);background:#1a1a1a}
@media(max-width:760px){.hbn-letter-wrap{flex-direction:column}.hbn-letter-img{width:100%;max-width:340px}}
@media(max-width:640px){.hbn-letter-txt h2{font-size:22px}}

.hbn-prog{max-width:600px;margin:36px auto 0}
.hbn-prog-item{padding:26px 0;border-top:1px solid #222}
.hbn-prog-item:first-child{border-top:0}
.hbn-prog-label{font-size:12px;font-weight:800;letter-spacing:.06em;color:var(--g);margin-bottom:8px}
.hbn-prog-body{font-size:16px;color:#eaeaea;line-height:1.7;margin:0}
.hbn-prog-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}
.hbn-prog-list li{font-size:15px;color:#d8d8d8;line-height:1.7}
.hbn-prog-list li b{color:#fff;font-weight:800;margin-right:4px}
</style>

<!-- 1. 공감 -->
<section class="hbn-sec">
  <div class="hbn-inner">
    <h1 class="hbn-h2">18년 실전 전문가의 깊이,<br>대표님께는 흔들리지 않는 확신을 드립니다.</h1>
    <p class="hbn-lead">밤낮없이 매달려도<br>늘 제자리걸음인 기분이 드는 건,<br>대표님의 헌신이 모자라서가 아닙니다.</p>
    <p class="hbn-lead">저는 1개의 매장에서 11개의 직영 전략까지,<br>수천 번의 시행착오를 먼저 겪어낸 사람입니다.</p>
    <span class="hbn-vline"></span>
    <p class="hbn-accent"><em>흔들리는 감정이 아닌, 단단한 내실을 심어<br>지속 가능한 성장을 만듭니다.</em></p>
  </div>
</section>

<!-- 2. 문제 -->
<section class="hbn-sec hbn-sec--alt">
  <div class="hbn-inner">
    <h2 class="hbn-h2">새는 구멍을 못 본 채,<br>밤에도 혼자 고민하게 됩니다.</h2>
    <div class="hbn-points">
      <div class="hbn-point">
        <h3>밑 빠진 독</h3>
        <p>신규 유입에 공을 들여도 고객이 새어나가고 있다면, 그것은 홍보의 부족이 아니라 내부의 보이지 않는 구멍 때문입니다.</p>
      </div>
      <div class="hbn-point">
        <h3>보존되지 않는 에너지</h3>
        <p>쏟아부은 에너지를 보존할 그릇에 미처 발견하지 못한 구멍이 있다면, 성과는 늘 제자리에 머뭅니다.</p>
      </div>
      <div class="hbn-point">
        <h3>불 끄기식 운영</h3>
        <p>터진 문제를 급한 대로 막는 하루가 반복되면, 내일이 기대되는 경영은 점점 멀어집니다.</p>
      </div>
    </div>
    <p class="hbn-note">이제는 무작정 물을 채우는 열정보다,<br><em>그 구멍을 찾아 견고하게 메우는 '구조의 보수'가 시급합니다.</em></p>
  </div>
</section>

<!-- 3. 해결 -->
<section class="hbn-sec">
  <div class="hbn-inner">
    <h2 class="hbn-h2">불을 끄는 운영이 아닌,<br>내일이 기대되는 <em>'확신 경영'</em>을 선물합니다.</h2>
    <div class="hbn-grid">
      <div class="hbn-card">
        <h4>(System)</h4><h3>운영의 시각화</h3>
        <p>매출이 정체되는 원인부터 찾습니다. <mark>데이터로 새는 구멍을 특정하고 누구든 등록시키는 '표준 그릇'을 설계</mark>합니다.</p>
      </div>
      <div class="hbn-card">
        <h4>(Culture)</h4><h3>자발적 팀 문화</h3>
        <p>대표님만 바쁜 구조를 끝냅니다. <mark>지시 없이도 팀이 스스로 움직이는 '오토 운영 엔진'</mark>을 이식합니다.</p>
      </div>
      <div class="hbn-card">
        <h4>(Product)</h4><h3>객단가 혁신</h3>
        <p>제자리인 수익 구조를 바꿉니다. <mark>저가 전쟁을 끝낼 독점 상품으로 '비즈니스의 품격'</mark>을 높여드립니다.</p>
      </div>
      <div class="hbn-card">
        <h4>(Brand Story)</h4><h3>현장중심 전문가</h3>
        <p>트레이너, 관리자, 그리고 대표까지 모든 위치를 경험했기에 <mark>'조직 문화'를 이끌어 냅니다.</mark></p>
      </div>
    </div>
    <div class="hbn-trust">
      <div><b>11개 센터</b> 직영·위탁 총괄<br>월 매출 1천만~5억 전 지표 보유</div>
      <div>국가 검증 체육시설 전문가<br><b>KSPO</b> 선정 우수 수행 기업</div>
      <div><b>1,700회</b> 교육<br>국내 최초 'Aging Fit' 구축</div>
    </div>
  </div>
</section>

<!-- 4-1. 현장사진 마퀴 -->
<section class="hbn-sec hbn-sec--alt">
  <div class="hbn-inner">
    <h2 class="hbn-h2">18년의 현장이<br><em>남긴 기록</em>입니다.</h2>
  </div>
  <div class="hbn-mq" id="hbnLectureMarquee">
    <div class="hbn-mq-track">
      <img src="https://cdn.imweb.me/thumbnail/20260210/bd4e478ad71f0.jpg" alt="황봉남 컨설턴트 현장 기록 1">
      <img src="https://cdn.imweb.me/thumbnail/20260210/1cb2029e978ba.jpg" alt="황봉남 컨설턴트 현장 기록 2">
      <img src="https://cdn.imweb.me/thumbnail/20260210/9fbbe601c5177.jpg" alt="황봉남 컨설턴트 현장 기록 3">
      <img src="https://cdn.imweb.me/thumbnail/20260210/c396446783205.jpg" alt="황봉남 컨설턴트 현장 기록 4">
      <img src="https://cdn.imweb.me/thumbnail/20260210/8fac3547be40c.jpg" alt="황봉남 컨설턴트 현장 기록 5">
      <img src="https://cdn.imweb.me/thumbnail/20260210/f04c5607f96aa.jpg" alt="황봉남 컨설턴트 현장 기록 6">
      <img src="https://cdn.imweb.me/thumbnail/20260210/661eed89397cd.jpg" alt="황봉남 컨설턴트 현장 기록 7">
      <img src="https://cdn.imweb.me/thumbnail/20260210/b909e9f5af176.jpg" alt="황봉남 컨설턴트 현장 기록 8">
      <img src="https://cdn.imweb.me/thumbnail/20260210/327b17c75bcc6.jpg" alt="황봉남 컨설턴트 현장 기록 9">
      <img src="https://cdn.imweb.me/thumbnail/20260210/f10244845d35b.jpg" alt="황봉남 컨설턴트 현장 기록 10">
      <img src="https://cdn.imweb.me/thumbnail/20260210/de6905c98e19c.jpg" alt="황봉남 컨설턴트 현장 기록 11">
      <img src="https://cdn.imweb.me/thumbnail/20260210/56d9bcb6230a7.jpg" alt="황봉남 컨설턴트 현장 기록 12">
      <img src="https://cdn.imweb.me/thumbnail/20260210/456372ee5d93c.jpg" alt="황봉남 컨설턴트 현장 기록 13">
      <img src="https://cdn.imweb.me/thumbnail/20260210/bd4e478ad71f0.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260210/1cb2029e978ba.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260210/9fbbe601c5177.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260210/c396446783205.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260210/8fac3547be40c.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260210/f04c5607f96aa.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260210/661eed89397cd.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260210/b909e9f5af176.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260210/327b17c75bcc6.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260210/f10244845d35b.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260210/de6905c98e19c.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260210/56d9bcb6230a7.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260210/456372ee5d93c.jpg" alt="" aria-hidden="true">
    </div>
  </div>
</section>

<!-- 4-2. 추천 대상 -->
<section class="hbn-sec">
  <div class="hbn-inner">
    <h2 class="hbn-h2">이런 고민을 가진 분들에게<br>추천합니다.</h2>
    <div class="hbn-who">
      <div class="hbn-who-item"><span class="hbn-who-num">1</span><h3>내실을 다지고 싶은 분</h3><p>확장보다 내실을 다져 순수익을 극대화하고 싶은 대표님</p></div>
      <div class="hbn-who-item"><span class="hbn-who-num">2</span><h3>팀 분위기를 바꾸고 싶은 리더</h3><p>직원 관리의 어려움을 해결하고 팀 분위기를 새롭게 바꾸고 싶은 분</p></div>
      <div class="hbn-who-item"><span class="hbn-who-num">3</span><h3>디지털 관리가 필요한 분</h3><p>디지털 고객 관리를 도입해 상담과 응대 수준을 일정하게 높이고 싶은 분</p></div>
      <div class="hbn-who-item"><span class="hbn-who-num">4</span><h3>새 시장을 원하는 분</h3><p>Aging Fit 시스템으로 경쟁 없는 새로운 시장을 독점하고 싶은 분</p></div>
    </div>
  </div>
</section>

<!-- 4-3. 철학 레터 -->
<section class="hbn-sec hbn-sec--alt">
  <div class="hbn-inner">
    <div class="hbn-letter-wrap">
      <div class="hbn-letter-txt">
        <h2>11개 지점의 생존 기록,<br>'설계의 답'입니다.</h2>
        <p>성과가 제자리인 건<br>대표님의 열정이 부족해서가 아닙니다.<br>쏟아부은 에너지를 보존할 '그릇'에<br>우리가 미처 발견하지 못한 '구멍'이 있기 때문입니다.</p>
        <p>저는 이론만 읊는 교수가 아닙니다.<br>수업 12개를 소화하던 트레이너였고,<br>직원들 눈치를 보던 중간 관리자였고,<br>11개 지점의 생존을 책임졌던 경영자였습니다.</p>
        <p>이 모든 과정을 직접 겪었기에<br>대표님이 마주한 현장의 고통을 누구보다 잘 압니다.</p>
        <p>그 고통을 끝내기 위해<br>저는 피트니스 데이터에 매달렸습니다.<br>저의 시스템은 단순한 이론이 아니라,<br>현장에서 살아남아 수익을 남기기 위해 찾아낸<br>'유일한 생존 해답'입니다.</p>
        <p class="hbn-sign">황 봉 남</p>
      </div>
      <img class="hbn-letter-img" src="/consultants/hwang-bongnam.jpg" alt="더그로우컴퍼니 황봉남 진단 컨설턴트">
    </div>
  </div>
</section>

<!-- 4-4. 프로그램 -->
<section class="hbn-sec">
  <div class="hbn-inner">
    <h2 class="hbn-h2">황봉남 컨설턴트의 전략:<br>현장형 <em>생존 데이터 시스템</em></h2>
    <div class="hbn-prog">
      <div class="hbn-prog-item">
        <div class="hbn-prog-label">프로그램</div>
        <p class="hbn-prog-body">황봉남 컨설턴트의 1:1 [확신 경영 지표] 이식</p>
      </div>
      <div class="hbn-prog-item">
        <div class="hbn-prog-label">진단 시간</div>
        <p class="hbn-prog-body">월 2회, 현장 방문 및 상시 온라인 피드백으로 진행합니다.</p>
      </div>
      <div class="hbn-prog-item">
        <div class="hbn-prog-label">커리큘럼</div>
        <ul class="hbn-prog-list">
          <li><b>[운영 진단]</b> 전환율/재등록률 데이터 분석</li>
          <li><b>[조직 진단]</b> 직원 성향 및 리더십 코칭</li>
          <li><b>[시스템 처방]</b> AI 도구 및 표준 매뉴얼 제공</li>
          <li><b>[미래 설계]</b> 고객 생애주기 시스템 로드맵</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<script>
(function(){
  var stops = [];
  // requestAnimationFrame 무한 마퀴 (이음매 없는 흐름 + 호버 일시정지)
  function marquee(id, pxPerSec, toRight){
    var root = document.getElementById(id);
    if (!root) return;
    var track = root.querySelector('.hbn-mq-track');
    if (!track) return;
    var paused = false, offset = 0, last = 0, rafId = 0;
    root.addEventListener('mouseenter', function(){ paused = true; });
    root.addEventListener('mouseleave', function(){ paused = false; });
    function frame(ts){
      if (!last) last = ts;
      var dt = ts - last; last = ts;
      var half = track.scrollWidth / 2;
      if (!paused && half > 0){
        if (toRight){ offset += pxPerSec * dt / 1000; if (offset >= 0) offset -= half; }
        else { offset -= pxPerSec * dt / 1000; if (offset <= -half) offset += half; }
        track.style.transform = 'translateX(' + offset + 'px)';
      }
      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);
    stops.push(function(){ cancelAnimationFrame(rafId); });
  }

  marquee('hbnLectureMarquee', 36, false);

  // 언마운트 정리용 전역 정지 훅 (React cleanup 에서 호출 후 no-op 으로 교체)
  window.__hbnMarqueeStop = function(){
    for (var i = 0; i < stops.length; i++){ stops[i](); }
  };
})();
</script>
</div>`;

export default function HwangBongnamDiagnosisPage() {
  const [imgError, setImgError] = useState(false);
  const [mounted, setMounted] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);
  const bottomFormRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

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

  // 랜딩 상세 주입 — 현장사진 마퀴 <script> 재실행 + 언마운트 시 rAF 정리.
  //  전역 정지 훅(__hbnMarqueeStop) 호출로 cancelAnimationFrame 후 no-op 교체(삭제 금지).
  useEffect(() => {
    if (!mounted) return;
    const container = detailRef.current;
    if (!container) return;
    const injected = injectContainer(container);
    return () => {
      injected.forEach((s) => s.remove());
      const w = window as unknown as Record<string, unknown>;
      const stop = w["__hbnMarqueeStop"];
      if (typeof stop === "function") (stop as () => void)();
      w["__hbnMarqueeStop"] = () => {};
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
          {/* 좌: 인물 세로형 이미지 */}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[#f1f1f1]">
            {!imgError ? (
              <Image
                src={MAIN_IMAGE}
                alt="황봉남 헬스장·필라테스 운영 진단 컨설턴트"
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

          {/* 우: 진단 상담 폼 */}
          <div className="w-full">
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

      {/* ───────────────── 랜딩 상세 (hbn-) ───────────────── */}
      {mounted ? (
        <div
          ref={detailRef}
          className="w-full"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: DETAIL_HTML }}
        />
      ) : (
        <div ref={detailRef} className="w-full" suppressHydrationWarning />
      )}

      {/* ── 하단 상담폼 ── */}
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

      {/* ───────────────── 다른 컨설턴트 확인 ───────────────── */}
      <ConsultantCarousel currentSlug="hwang-bongnam" />

      {/* ───────────────── 다른 서비스 둘러보기 (추천 상품) ───────────────── */}
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
