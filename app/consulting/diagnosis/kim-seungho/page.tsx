"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 진단 컨설턴트 상세페이지 — 김승호
//  구조(김재강 최종본과 동일): [상단 인물사진 + 상담폼] → DETAIL_HTML(다크 랜딩)
//   → [하단 상담폼(-bottom id)] → ConsultantCarousel → 추천 카드
//  · 클래스 접두사 ksh-
//  · mounted 클라이언트 전용 렌더 + suppressHydrationWarning
//  · innerHTML <script> 는 주입 이펙트가 재생성 append 하여 실행
//  · 강의사진 마퀴는 requestAnimationFrame + cancelAnimationFrame 정리
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
  name: "김승호 컨설턴트 진단 컨설팅",
  url: `${SITE_URL}/consulting/diagnosis/kim-seungho`,
  areaServed: "KR",
  provider: {
    "@type": "Organization",
    name: "더그로우컴퍼니",
    url: SITE_URL,
    employee: {
      "@type": "Person",
      name: "김승호",
      jobTitle: "FC운영·PT 컨설턴트",
    },
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "KRW",
  },
};

// 좌측 메인 이미지 (public 기준)
const MAIN_IMAGE = "/consultants/kim-seungho.jpg";

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

// ─── 진단 상담 폼 HTML (김재강과 동일, 폼 스코프 스크립트) ─────────────────────
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
  // DOMContentLoaded 대신 즉시 실행하고, data-ksh-init 로 재실행 시 중복 바인딩을 막는다.
  function initForm(wrapper){
    if (!wrapper || wrapper.getAttribute('data-ksh-init')) return;
    wrapper.setAttribute('data-ksh-init', '1');

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

// ─── 김승호 진단 랜딩 상세 HTML (ksh- 접두사, eyebrow 없음) ────────────────────
// 강의사진 마퀴 <script> 포함. detailRef 주입 이펙트가 script 재실행 + rAF 정리.
// 강의사진 14장(이음매 없는 무한 루프를 위해 각 2회씩 = 28개 img).
const DETAIL_HTML = `<div class="ksh">
<style>
.ksh{--g:#22B573;--bg:#0A0A0A;--bg2:#0d0d0d;--cream:#FBF8EC;--ink:#141414;--mark:#b6f2c9;background:var(--bg);color:#fff;font-family:'Pretendard',-apple-system,BlinkMacSystemFont,system-ui,'Apple SD Gothic Neo',sans-serif;line-height:1.8;letter-spacing:-0.01em;overflow:hidden}
.ksh *{box-sizing:border-box}
.ksh-inner{max-width:760px;margin:0 auto;padding:0 20px}
.ksh-sec{padding:96px 0}
.ksh-sec--alt{background:var(--bg2)}
.ksh-h2{font-size:29px;font-weight:800;text-align:center;line-height:1.5;margin:0 0 22px}
.ksh-h2 em{font-style:normal;color:var(--g)}
.ksh-lead{font-size:17px;color:#c9c9c9;text-align:center;margin:0 0 16px;line-height:1.85}
.ksh-lead strong{color:#fff;font-weight:700}
.ksh-lead em{font-style:normal;color:var(--g);font-weight:700}
.ksh-vline{display:block;width:2px;height:56px;background:var(--g);margin:36px auto}
.ksh-accent{font-size:19px;font-weight:800;color:#fff;text-align:center;margin:0;line-height:1.6}
.ksh-accent em{font-style:normal;color:var(--g)}
@media(max-width:640px){.ksh-h2{font-size:23px}.ksh-lead{font-size:15px}.ksh-sec{padding:76px 0}}

.ksh-points{display:flex;flex-direction:column;gap:18px;max-width:600px;margin:36px auto 0}
.ksh-point{background:#141414;border:1px solid #232323;border-left:3px solid var(--g);border-radius:14px;padding:24px}
.ksh-point h3{margin:0 0 8px;font-size:18px;font-weight:800;color:#fff}
.ksh-point p{margin:0;font-size:15px;color:#bdbdbd;line-height:1.75}
.ksh-note{margin:40px auto 0;max-width:600px;text-align:center;font-size:16px;color:#e6e6e6;line-height:1.85}
.ksh-note em{font-style:normal;color:var(--g);font-weight:700}

.ksh-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;max-width:680px;margin:40px auto 0}
.ksh-card{background:var(--cream);color:var(--ink);border-radius:18px;padding:28px 24px}
.ksh-card h4{margin:0 0 4px;font-size:12px;font-weight:700;color:#5a7d64;letter-spacing:.04em}
.ksh-card h3{margin:0 0 12px;font-size:19px;font-weight:800}
.ksh-card p{margin:0;font-size:14px;line-height:1.8;color:#333}
.ksh-card mark{background:var(--mark);color:var(--ink);padding:1px 4px;border-radius:4px;font-weight:600}
@media(max-width:640px){.ksh-grid{grid-template-columns:1fr}}

.ksh-trust{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#232323;border:1px solid #232323;border-radius:16px;overflow:hidden;max-width:680px;margin:24px auto 0}
.ksh-trust div{background:#111;padding:22px 12px;text-align:center;font-size:15px;font-weight:700;color:#fff}
.ksh-trust b{color:var(--g)}
@media(max-width:640px){.ksh-trust{grid-template-columns:1fr}}

.ksh-mq{overflow:hidden;width:100%;max-width:100%;margin-top:14px;-webkit-user-select:none;user-select:none}
.ksh-mq-track{display:flex;width:max-content;gap:14px;will-change:transform}
.ksh-mq-track img{height:280px;width:auto;display:block;border-radius:16px;background:#1a1a1a;flex:0 0 auto}

.ksh-who{display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:680px;margin:40px auto 0}
.ksh-who-item{background:#141414;border:1px solid #232323;border-radius:16px;padding:26px 22px}
.ksh-who-num{display:block;font-size:34px;font-weight:800;color:var(--g);line-height:1;margin-bottom:12px}
.ksh-who-item h3{margin:0 0 8px;font-size:16px;font-weight:800;color:#fff}
.ksh-who-item p{margin:0;font-size:14px;color:#bdbdbd;line-height:1.7}
@media(max-width:640px){.ksh-who{grid-template-columns:1fr}}

.ksh-letter-wrap{display:flex;gap:40px;align-items:center;max-width:760px;margin:0 auto}
.ksh-letter-txt{flex:1;min-width:0}
.ksh-letter-txt h2{font-size:25px;font-weight:800;color:var(--g);line-height:1.5;margin:0 0 24px}
.ksh-letter-txt p{font-size:16px;color:#dcdcdc;line-height:1.95;margin:0 0 24px}
.ksh-sign{font-size:22px;font-weight:800;color:#fff;letter-spacing:.35em;margin:0}
.ksh-letter-img{flex:0 0 280px;width:280px;aspect-ratio:3/4;object-fit:cover;border-radius:18px;filter:grayscale(1);background:#1a1a1a}
@media(max-width:760px){.ksh-letter-wrap{flex-direction:column}.ksh-letter-img{width:100%;max-width:340px}}
@media(max-width:640px){.ksh-letter-txt h2{font-size:22px}}

.ksh-prog{max-width:600px;margin:36px auto 0}
.ksh-prog-item{padding:26px 0;border-top:1px solid #222}
.ksh-prog-item:first-child{border-top:0}
.ksh-prog-label{font-size:12px;font-weight:800;letter-spacing:.06em;color:var(--g);margin-bottom:8px}
.ksh-prog-body{font-size:16px;color:#eaeaea;line-height:1.7;margin:0}
.ksh-prog-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}
.ksh-prog-list li{font-size:15px;color:#d8d8d8;line-height:1.7}
.ksh-prog-list li b{color:#fff;font-weight:800;margin-right:4px}
</style>

<!-- 1. 공감 -->
<section class="ksh-sec">
  <div class="ksh-inner">
    <h1 class="ksh-h2">피트니스 열정으로 시작했지만,<br>운영으로만 살아남습니다.</h1>
    <p class="ksh-lead">54개 지점, 500명의 조직을<br>오직 구조와 지시로 움직였습니다.</p>
    <p class="ksh-lead">누군가는 저를 '저승사자'라 불렀지만,<br>저는 타협 없이 운영의 거품을 걷어냈습니다.</p>
    <span class="ksh-vline"></span>
    <p class="ksh-accent"><em>감정이 아닌 시스템이 결과를 만듭니다.</em></p>
  </div>
</section>

<!-- 2. 문제 -->
<section class="ksh-sec ksh-sec--alt">
  <div class="ksh-inner">
    <h2 class="ksh-h2">성장이 멈춘 이유는<br>의지나 실력 부족이 아닙니다.</h2>
    <div class="ksh-points">
      <div class="ksh-point">
        <h3>방법의 부재</h3>
        <p>무엇을, 누구에게, 어떻게 시킬지 그 방법을 모르기에 결정은 미뤄지고 지시는 흐려집니다.</p>
      </div>
      <div class="ksh-point">
        <h3>성향에 맡겨진 운영</h3>
        <p>기준이 없으니 운영은 직원의 성향에 맡겨지고, 그때부터 센터는 운영되는 게 아니라 간신히 버티는 것이 됩니다.</p>
      </div>
      <div class="ksh-point">
        <h3>기준의 부재</h3>
        <p>문제는 실행력이 아니라 기준의 부재입니다. 지금 대표님께 필요한 건 조언이 아니라 즉시 지시 가능한 운영 기준입니다.</p>
      </div>
    </div>
    <p class="ksh-note">열정으로 버텨온 시간, 충분합니다.<br><em>부족한 건 실력이 아닌 '기준'입니다.</em></p>
  </div>
</section>

<!-- 3. 해결 -->
<section class="ksh-sec">
  <div class="ksh-inner">
    <h2 class="ksh-h2">피트니스 센터의<br><em>'운영 OS'</em>를 설치해 드립니다.</h2>
    <p class="ksh-lead">사람이 아니라 구조를 바꿉니다.</p>
    <div class="ksh-grid">
      <div class="ksh-card">
        <h4>(Flow)</h4><h3>상태의 객관화</h3>
        <p>센터가 정체된 이유부터 찾습니다. <mark>운영의 흐름을 분석하여 막연한 답답함의 원인을 데이터로 특정</mark>합니다.</p>
      </div>
      <div class="ksh-card">
        <h4>(Focus)</h4><h3>결단의 명확화</h3>
        <p>대표님이 직접 하실 일과 맡길 일을 구분해 <mark>에너지를 쏟을 지점을 정합니다.</mark></p>
      </div>
      <div class="ksh-card">
        <h4>(Standard)</h4><h3>질서의 재정립</h3>
        <p>지시와 책임의 혼선을 끝내고 <mark>시스템이 스스로 돌아가는 규칙</mark>을 세웁니다.</p>
      </div>
      <div class="ksh-card">
        <h4>(Freedom)</h4><h3>운영의 자동화</h3>
        <p>운영 구조를 완전히 고정하여 <mark>대표님 없이도 성장하는, 불안 없는 경영의 자유</mark>를 드립니다.</p>
      </div>
    </div>
    <div class="ksh-trust">
      <div><b>54개 지점</b> 총괄</div>
      <div><b>500명</b> 조직 리딩</div>
      <div><b>업력 20년</b> · 교육생 5천 명</div>
    </div>
  </div>
</section>

<!-- 4-1. 강의사진 마퀴 -->
<section class="ksh-sec ksh-sec--alt">
  <div class="ksh-inner">
    <h2 class="ksh-h2">현장에서 증명해온<br><em>티칭의 기록</em>입니다.</h2>
  </div>
  <div class="ksh-mq" id="kshLectureMarquee">
    <div class="ksh-mq-track">
      <img src="https://cdn.imweb.me/thumbnail/20260209/3c63360d5f46a.jpg" alt="김승호 컨설턴트 강의 현장 1">
      <img src="https://cdn.imweb.me/thumbnail/20260209/54d5e7f52a0cc.jpg" alt="김승호 컨설턴트 강의 현장 2">
      <img src="https://cdn.imweb.me/thumbnail/20260209/41963b4f780fd.jpg" alt="김승호 컨설턴트 강의 현장 3">
      <img src="https://cdn.imweb.me/thumbnail/20260209/432c811868679.jpg" alt="김승호 컨설턴트 강의 현장 4">
      <img src="https://cdn.imweb.me/thumbnail/20260209/f23eaab2c50b9.jpg" alt="김승호 컨설턴트 강의 현장 5">
      <img src="https://cdn.imweb.me/thumbnail/20260209/f1035b4839f0b.jpg" alt="김승호 컨설턴트 강의 현장 6">
      <img src="https://cdn.imweb.me/thumbnail/20260209/8910d775f9399.jpg" alt="김승호 컨설턴트 강의 현장 7">
      <img src="https://cdn.imweb.me/thumbnail/20260209/dac556b3cf632.jpg" alt="김승호 컨설턴트 강의 현장 8">
      <img src="https://cdn.imweb.me/thumbnail/20260209/9bb6b7067e3cd.jpg" alt="김승호 컨설턴트 강의 현장 9">
      <img src="https://cdn.imweb.me/thumbnail/20260209/a369b5e42e0bd.jpg" alt="김승호 컨설턴트 강의 현장 10">
      <img src="https://cdn.imweb.me/thumbnail/20260209/666b676e8b498.jpg" alt="김승호 컨설턴트 강의 현장 11">
      <img src="https://cdn.imweb.me/thumbnail/20260209/8d28f598b0b35.jpg" alt="김승호 컨설턴트 강의 현장 12">
      <img src="https://cdn.imweb.me/thumbnail/20260209/f44e755fd4529.jpg" alt="김승호 컨설턴트 강의 현장 13">
      <img src="https://cdn.imweb.me/thumbnail/20260209/e1fd36de1bcb8.jpg" alt="김승호 컨설턴트 강의 현장 14">
      <img src="https://cdn.imweb.me/thumbnail/20260209/3c63360d5f46a.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260209/54d5e7f52a0cc.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260209/41963b4f780fd.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260209/432c811868679.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260209/f23eaab2c50b9.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260209/f1035b4839f0b.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260209/8910d775f9399.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260209/dac556b3cf632.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260209/9bb6b7067e3cd.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260209/a369b5e42e0bd.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260209/666b676e8b498.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260209/8d28f598b0b35.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260209/f44e755fd4529.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260209/e1fd36de1bcb8.jpg" alt="" aria-hidden="true">
    </div>
  </div>
</section>

<!-- 4-2. 추천 대상 -->
<section class="ksh-sec">
  <div class="ksh-inner">
    <h2 class="ksh-h2">이런 고민을 가진 분들에게<br>추천합니다.</h2>
    <div class="ksh-who">
      <div class="ksh-who-item"><span class="ksh-who-num">1</span><h3>고독한 결정에 지친 분</h3><p>모든 결정을 혼자 감당해야 하는 고독한 운영을 하고 계신 분</p></div>
      <div class="ksh-who-item"><span class="ksh-who-num">2</span><h3>잔소리가 고통이 된 리더</h3><p>입만 아픈 지시와 반복되는 잔소리가 고통이 되어버린 분</p></div>
      <div class="ksh-who-item"><span class="ksh-who-num">3</span><h3>이론이 멀게 느껴지는 분</h3><p>현장 일만으로도 시간이 모자라 복잡한 이론은 멀게만 느껴지는 경영자</p></div>
      <div class="ksh-who-item"><span class="ksh-who-num">4</span><h3>위험한 구조 속에 계신 분</h3><p>잠시만 자리를 비워도 센터가 걱정되는 위험한 구조 속에 계신 대표님</p></div>
    </div>
  </div>
</section>

<!-- 4-3. 철학 레터 -->
<section class="ksh-sec ksh-sec--alt">
  <div class="ksh-inner">
    <div class="ksh-letter-wrap">
      <div class="ksh-letter-txt">
        <h2>대표를 성장시키지 않겠습니다.<br>센터가 '돌아가게' 만듭니다.</h2>
        <p>많은 대표님들이<br>성장, 매출, 확장에 대해서 이야기합니다.<br>하지만 현장에서 멈추는 이유는 늘 같습니다.<br>말은 많은데 실행은 없고,<br>기준은 없는데 책임만 있습니다.</p>
        <p>저는 아이디어를 던지지 않습니다.<br>무엇을 · 누가 · 언제까지<br>이 세 가지가 명확하지 않으면<br>그건 전략이 아닙니다.</p>
        <p>대표가 하기 싫어서 미뤄둔 일들,<br>누군가는 반드시 해야 합니다.</p>
        <p>그래서 저는<br>사람이 아니라 구조를 바꿉니다.</p>
        <p class="ksh-sign">김 승 호</p>
      </div>
      <img class="ksh-letter-img" src="/consultants/kim-seungho.jpg" alt="더그로우컴퍼니 김승호 진단 컨설턴트">
    </div>
  </div>
</section>

<!-- 4-4. 프로그램 -->
<section class="ksh-sec">
  <div class="ksh-inner">
    <h2 class="ksh-h2">김승호 컨설턴트의 솔루션:<br>멈추지 않는 <em>운영 OS 설계</em></h2>
    <div class="ksh-prog">
      <div class="ksh-prog-item">
        <div class="ksh-prog-label">프로그램</div>
        <p class="ksh-prog-body">김승호 컨설턴트의 1:1 운영 시스템 밀착 구축</p>
      </div>
      <div class="ksh-prog-item">
        <div class="ksh-prog-label">진단 시간</div>
        <p class="ksh-prog-body">주 1회, 5시간씩 집중적으로 진행되는 한달 코스입니다.</p>
      </div>
      <div class="ksh-prog-item">
        <div class="ksh-prog-label">커리큘럼</div>
        <ul class="ksh-prog-list">
          <li><b>[구조 진단]</b> 관리자 판단 구조 분석 · 대표에게만 묻게 되는 의존 구조 파악</li>
          <li><b>[흐름 점검]</b> 운영 관리 흐름 설계 · 사람에 매달리지 않는 운영 방식 점검</li>
          <li><b>[우선순위]</b> 관리 기준 및 순위 정립 · 미뤄도 될 일과 보고 기준 명확화</li>
          <li><b>[시스템 설치]</b> 운영 OS 고정 및 자동화 · 대표가 없어도 돌아가는 완전한 구조</li>
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
    var track = root.querySelector('.ksh-mq-track');
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

  marquee('kshLectureMarquee', 36, false);

  // 언마운트 정리용 전역 정지 훅 (React cleanup 에서 호출 후 no-op 으로 교체)
  window.__kshMarqueeStop = function(){
    for (var i = 0; i < stops.length; i++){ stops[i](); }
  };
})();
</script>
</div>`;

export default function KimSeunghoDiagnosisPage() {
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

  // 랜딩 상세 주입 — 강의사진 마퀴 <script> 재실행 + 언마운트 시 rAF 정리.
  //  전역 정지 훅(__kshMarqueeStop) 호출로 cancelAnimationFrame 후 no-op 교체(삭제 금지).
  useEffect(() => {
    if (!mounted) return;
    const container = detailRef.current;
    if (!container) return;
    const injected = injectContainer(container);
    return () => {
      injected.forEach((s) => s.remove());
      const w = window as unknown as Record<string, unknown>;
      const stop = w["__kshMarqueeStop"];
      if (typeof stop === "function") (stop as () => void)();
      w["__kshMarqueeStop"] = () => {};
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
                alt="김승호 헬스장·필라테스 운영 진단 컨설턴트"
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

      {/* ───────────────── 랜딩 상세 (ksh-) ───────────────── */}
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
      <ConsultantCarousel currentSlug="kim-seungho" />

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
