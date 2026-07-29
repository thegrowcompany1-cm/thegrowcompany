"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 진단 컨설턴트 상세페이지 — 허준영
//  구조(김승호 최종본과 동일): [상단 인물사진 + 상담폼] → DETAIL_HTML(다크 랜딩)
//   → [하단 상담폼(-bottom id)] → ConsultantCarousel → 추천 카드
//  · 클래스 접두사 hjy- / 전역 정지 훅 __hjyMarqueeStop
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
  serviceType: "헬스장 마케팅·필라테스 마케팅 컨설팅",
  name: "허준영 컨설턴트 진단 컨설팅",
  url: `${SITE_URL}/consulting/diagnosis/heo-junyoung`,
  areaServed: "KR",
  description:
    "허준영 컨설턴트의 헬스장 마케팅·필라테스 마케팅 1:1 진단으로 매출로 이어지는 구조를 설계합니다.",
  provider: {
    "@type": "Organization",
    name: "더그로우컴퍼니",
    url: SITE_URL,
    employee: {
      "@type": "Person",
      name: "허준영",
      jobTitle: "FC운영·마케팅 컨설턴트",
    },
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "KRW",
  },
};

// 좌측 메인 이미지 (public 기준)
const MAIN_IMAGE = "/consultants/heo-junyoung.jpg";

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
        <label class="checkbox-label">
          <input type="radio" name="consultant" value="구진완" class="consultant-radio">
          <span class="checkbox-text">구진완</span>
        </label>
        <label class="checkbox-label">
          <input type="radio" name="consultant" value="허준영" class="consultant-radio" checked>
          <span class="checkbox-text">허준영</span>
        </label>
        <label class="checkbox-label">
          <input type="radio" name="consultant" value="이석훈" class="consultant-radio">
          <span class="checkbox-text">이석훈</span>
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
  // DOMContentLoaded 대신 즉시 실행하고, data-hjy-init 로 재실행 시 중복 바인딩을 막는다.
  function initForm(wrapper){
    if (!wrapper || wrapper.getAttribute('data-hjy-init')) return;
    wrapper.setAttribute('data-hjy-init', '1');

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

// ─── 황봉남 진단 랜딩 상세 HTML (hjy- 접두사, eyebrow 없음) ────────────────────
// 현장사진 마퀴 <script> 포함. detailRef 주입 이펙트가 script 재실행 + rAF 정리.
// 상위노출 마퀴 4장(140px) + 카톡 마퀴 6장(320px,역방향) + 강의 마퀴 6장(200px), 각 2회 배치.
const DETAIL_HTML = `<div class="hjy">
<style>
.hjy{--g:#22B573;--bg:#0A0A0A;--bg2:#0d0d0d;--cream:#FBF8EC;--ink:#141414;--mark:#b6f2c9;background:var(--bg);color:#fff;font-family:'Pretendard',-apple-system,BlinkMacSystemFont,system-ui,'Apple SD Gothic Neo',sans-serif;line-height:1.8;letter-spacing:-0.01em;overflow:hidden}
.hjy *{box-sizing:border-box}
.hjy-inner{max-width:760px;margin:0 auto;padding:0 20px}
.hjy-sec{padding:96px 0}
.hjy-sec--alt{background:var(--bg2)}
.hjy-h2{font-size:29px;font-weight:800;text-align:center;line-height:1.5;margin:0 0 22px}
.hjy-h2 em{font-style:normal;color:var(--g)}
.hjy-lead{font-size:17px;color:#c9c9c9;text-align:center;margin:0 0 16px;line-height:1.85}
.hjy-lead strong{color:#fff;font-weight:700}
.hjy-lead em{font-style:normal;color:var(--g);font-weight:700}
.hjy-vline{display:block;width:2px;height:56px;background:var(--g);margin:36px auto}
.hjy-accent{font-size:19px;font-weight:800;color:#fff;text-align:center;margin:0;line-height:1.6}
.hjy-accent em{font-style:normal;color:var(--g)}
.hjy-kw{font-size:14px;font-weight:700;color:var(--g);text-align:center;margin:0 0 14px;letter-spacing:.01em}
.hjy-sec.tl .hjy-kw{text-align:left}
@media(max-width:640px){.hjy-h2{font-size:23px}.hjy-lead{font-size:15px}.hjy-sec{padding:76px 0}}

.hjy-points{display:flex;flex-direction:column;gap:18px;max-width:600px;margin:36px auto 0}
.hjy-point{background:#141414;border:1px solid #232323;border-left:3px solid var(--g);border-radius:14px;padding:24px}
.hjy-point h3{margin:0 0 8px;font-size:18px;font-weight:800;color:#fff}
.hjy-point p{margin:0;font-size:15px;color:#bdbdbd;line-height:1.75}
.hjy-note{margin:40px auto 0;max-width:600px;text-align:center;font-size:16px;color:#e6e6e6;line-height:1.85}
.hjy-note em{font-style:normal;color:var(--g);font-weight:700}

.hjy-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;max-width:680px;margin:40px auto 0}
.hjy-card{background:var(--cream);color:var(--ink);border-radius:18px;padding:28px 24px}
.hjy-card h4{margin:0 0 4px;font-size:12px;font-weight:700;color:#5a7d64;letter-spacing:.04em}
.hjy-card h3{margin:0 0 12px;font-size:19px;font-weight:800}
.hjy-card p{margin:0;font-size:14px;line-height:1.8;color:#333}
.hjy-card mark{background:var(--mark);color:var(--ink);padding:1px 4px;border-radius:4px;font-weight:600}
@media(max-width:640px){.hjy-grid{grid-template-columns:1fr}}

.hjy-trust{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#232323;border:1px solid #232323;border-radius:16px;overflow:hidden;max-width:680px;margin:24px auto 0}
.hjy-trust div{background:#111;padding:22px 14px;text-align:center;font-size:14px;font-weight:600;color:#eaeaea;line-height:1.6}
.hjy-trust b{color:var(--g);font-weight:800}
@media(max-width:640px){.hjy-trust{grid-template-columns:1fr}}

.hjy-mq{overflow:hidden;width:100%;max-width:100%;margin-top:14px;-webkit-user-select:none;user-select:none}
.hjy-mq-track{display:flex;width:max-content;gap:14px;will-change:transform}
.hjy-mq-track img{height:280px;width:auto;display:block;border-radius:16px;background:#1a1a1a;flex:0 0 auto}

.hjy-strip{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;align-items:flex-start;padding:10px 20px 20px;margin-top:14px;-webkit-overflow-scrolling:touch}
.hjy-strip img{flex:0 0 360px;width:360px;height:auto;scroll-snap-align:start;border-radius:16px;background:#1a1a1a;display:block}
@media(max-width:640px){.hjy-strip img{flex:0 0 320px;width:320px}}

.hjy-who{display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:680px;margin:40px auto 0}
.hjy-who-item{background:#141414;border:1px solid #232323;border-radius:16px;padding:26px 22px}
.hjy-who-num{display:block;font-size:34px;font-weight:800;color:var(--g);line-height:1;margin-bottom:12px}
.hjy-who-item h3{margin:0 0 8px;font-size:16px;font-weight:800;color:#fff}
.hjy-who-item p{margin:0;font-size:14px;color:#bdbdbd;line-height:1.7}
@media(max-width:640px){.hjy-who{grid-template-columns:1fr}}

.hjy-letter-wrap{display:flex;gap:40px;align-items:center;max-width:760px;margin:0 auto}
.hjy-letter-txt{flex:1;min-width:0}
.hjy-letter-txt h2{font-size:25px;font-weight:800;color:var(--g);line-height:1.5;margin:0 0 24px}
.hjy-letter-txt p{font-size:16px;color:#dcdcdc;line-height:1.95;margin:0 0 24px}
.hjy-sign{font-size:22px;font-weight:800;color:#fff;letter-spacing:.35em;margin:0}
.hjy-letter-img{flex:0 0 280px;width:280px;aspect-ratio:3/4;object-fit:cover;border-radius:18px;filter:grayscale(1);background:#1a1a1a}
@media(max-width:760px){.hjy-letter-wrap{flex-direction:column}.hjy-letter-img{width:100%;max-width:340px}}
@media(max-width:640px){.hjy-letter-txt h2{font-size:22px}}

.hjy-prog{max-width:600px;margin:36px auto 0}
.hjy-prog-item{padding:26px 0;border-top:1px solid #222}
.hjy-prog-item:first-child{border-top:0}
.hjy-prog-label{font-size:12px;font-weight:800;letter-spacing:.06em;color:var(--g);margin-bottom:8px}
.hjy-prog-body{font-size:16px;color:#eaeaea;line-height:1.7;margin:0}
.hjy-prog-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}
.hjy-prog-list li{font-size:15px;color:#d8d8d8;line-height:1.7}
.hjy-prog-list li b{color:#fff;font-weight:800;margin-right:4px}
</style>

<style>
/* ── 이 페이지 전용: 밀도↓ / 타이포↑ / 좌측정렬 지그재그 ── */
.hjy-sec{padding:60px 0}
.hjy-inner{max-width:820px}
.hjy-h2{font-size:28px;line-height:1.45}
.hjy-lead{font-size:18px;line-height:1.75;color:#d2d2d2}
.hjy-accent{font-size:21px;line-height:1.6}
.hjy-note{font-size:17px;line-height:1.85}
@media(max-width:640px){.hjy-sec{padding:48px 0}.hjy-h2{font-size:23px}.hjy-lead{font-size:16px}.hjy-accent{font-size:18px}}

.hjy-sec.tl .hjy-h2,.hjy-sec.tl .hjy-lead,.hjy-sec.tl .hjy-accent,.hjy-sec.tl .hjy-note{text-align:left}
.hjy-sec.tl .hjy-vline{margin:26px 0}

.hjy-sub{font-size:20px;font-weight:800;color:#fff;text-align:center;margin:52px 0 0}
.hjy-punch{font-size:19px;font-weight:800;color:var(--g);margin:18px 0 0}

.hjy-nums{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#232323;border:1px solid #232323;border-radius:16px;overflow:hidden;margin:32px 0 0}
.hjy-num-card{background:#111;padding:26px 16px;text-align:center}
.hjy-num-card b{display:block;font-size:29px;font-weight:800;color:var(--g);line-height:1.1}
.hjy-num-card span{display:block;margin-top:8px;font-size:13px;color:#b0b0b0;line-height:1.45}
@media(max-width:640px){.hjy-nums{grid-template-columns:1fr 1fr}.hjy-num-card b{font-size:25px}}

.hjy-stats{display:flex;gap:34px;flex-wrap:wrap;margin:18px 0 4px}
.hjy-stat b{font-size:26px;font-weight:800;color:var(--g)}
.hjy-stat span{margin-left:8px;font-size:14px;color:#a8a8a8}
@media(max-width:640px){.hjy-stats{gap:18px}}

.hjy-checks{margin:32px 0 0;display:flex;flex-direction:column;gap:12px}
.hjy-check{position:relative;background:#141414;border:1px solid #262626;border-radius:14px;padding:18px 20px 18px 56px;cursor:pointer;transition:border-color .2s;user-select:none;-webkit-user-select:none}
.hjy-check::before{content:'';position:absolute;left:18px;top:50%;transform:translateY(-50%);width:24px;height:24px;border:2px solid #444;border-radius:7px;transition:.2s}
.hjy-check span{font-size:16px;color:#dcdcdc;line-height:1.55}
.hjy-check.is-on{border-color:var(--g)}
.hjy-check.is-on::before{background:var(--g);border-color:var(--g)}
.hjy-check.is-on::after{content:'\\2713';position:absolute;left:24px;top:50%;transform:translateY(-50%);color:#04240f;font-weight:800;font-size:14px}

.hjy-holes4{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:24px 0 0}
.hjy-hole4{background:#141414;border:1px solid #232323;border-left:3px solid var(--g);border-radius:14px;padding:22px}
.hjy-hole4 h4{margin:0 0 6px;font-size:17px;font-weight:800;color:var(--g)}
.hjy-hole4 p{margin:0;font-size:15px;color:#c2c2c2;line-height:1.6}
@media(max-width:640px){.hjy-holes4{grid-template-columns:1fr}}

.hjy-cmp2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:32px 0 0}
.hjy-cmp2-card{border-radius:18px;padding:28px 24px}
.hjy-cmp2-card--bad{background:#101010;border:1px solid #2a2a2a}
.hjy-cmp2-card--good{background:linear-gradient(180deg,rgba(34,181,115,0.08),#111);border:2px solid var(--g)}
.hjy-cmp2-tag{font-size:14px;font-weight:800;margin-bottom:16px}
.hjy-cmp2-card--bad .hjy-cmp2-tag{color:#8a8a8a}
.hjy-cmp2-card--good .hjy-cmp2-tag{color:var(--g)}
.hjy-cmp2 ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}
.hjy-cmp2 li{position:relative;padding-left:22px;font-size:15px;line-height:1.6}
.hjy-cmp2-card--bad li{color:#9a9a9a}
.hjy-cmp2-card--good li{color:#e4e4e4}
.hjy-cmp2-card--bad li::before{content:'—';position:absolute;left:0;color:#555}
.hjy-cmp2-card--good li::before{content:'\\2713';position:absolute;left:0;color:var(--g);font-weight:800}
@media(max-width:640px){.hjy-cmp2{grid-template-columns:1fr}}

.hjy-prog{max-width:660px;margin:32px 0 0}
.hjy-prog-body{font-size:16px}
.hjy-prog-list li{font-size:15px}

.hjy-mqcap{text-align:center;font-size:17px;color:#d2d2d2;margin:0 auto 4px}
.hjy-lead mark{background:var(--mark);color:var(--ink);padding:1px 4px;border-radius:4px;font-weight:600}

/* ── 웹사이트 제작 캐러셀 (hjy-web-, 3D 원통형 드래그 캐러셀 이식) ── */
.hjy-web-wrap{margin-top:36px;overflow:hidden;-webkit-user-select:none;user-select:none}
.hjy-web-scene{width:100%;height:340px;position:relative;perspective:1100px;overflow:visible;cursor:grab;touch-action:pan-y}
.hjy-web-scene:active{cursor:grabbing}
.hjy-web-rotor{width:260px;height:170px;position:absolute;left:50%;top:50%;transform-style:preserve-3d;transform:translate(-50%,-50%) rotateX(-6deg) rotateY(0deg)}
.hjy-web-card{position:absolute;width:260px;height:170px;left:0;top:0;border-radius:16px;overflow:hidden;backface-visibility:visible;-webkit-backface-visibility:visible;border:1px solid rgba(0,0,0,0.05);background:#111;transition:filter .5s ease,opacity .5s ease,box-shadow .5s ease;filter:brightness(0.3) contrast(1.1);opacity:.8;box-shadow:0 10px 30px rgba(0,0,0,0.1);display:block;text-decoration:none;color:inherit}
.hjy-web-card img{width:100%;height:100%;object-fit:cover;object-position:top;pointer-events:none;display:block}
.hjy-web-card.is-front{filter:brightness(1) contrast(1.05);opacity:1;border-color:rgba(255,59,48,.4);box-shadow:0 25px 50px -12px rgba(0,0,0,.3),0 0 0 1px rgba(255,59,48,.3),0 10px 20px rgba(255,59,48,.15)}
.hjy-web-card.is-adjacent{filter:brightness(0.6) contrast(1.1);opacity:.95}
.hjy-web-overlay{position:absolute;bottom:0;left:0;right:0;padding:16px;background:linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 60%, transparent 100%);display:flex;align-items:center;justify-content:space-between;opacity:0;transform:translateY(10px);transition:opacity .4s ease,transform .4s ease;pointer-events:none}
.hjy-web-card.is-front .hjy-web-overlay{opacity:1;transform:translateY(0)}
.hjy-web-overlay-name{font-size:14px;font-weight:700;color:#fff}
.hjy-web-overlay-link{font-size:11px;font-weight:600;color:#FF3B30;display:flex;align-items:center;gap:4px;background:#fff;padding:4px 8px;border-radius:20px}
.hjy-web-overlay-link svg{width:12px;height:12px}
.hjy-web-nav{position:absolute;top:50%;transform:translateY(-50%);z-index:20;width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,.95);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(0,0,0,.08);box-shadow:0 4px 16px rgba(0,0,0,.1);color:#333;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .3s ease}
.hjy-web-nav:hover{background:#111;color:#fff;border-color:#111;transform:translateY(-50%) scale(1.05)}
.hjy-web-nav--prev{left:10px}
.hjy-web-nav--next{right:10px}
.hjy-web-nav svg{width:20px;height:20px}
.hjy-web-dots{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:24px}
.hjy-web-dot{width:8px;height:8px;border-radius:50%;background:#D1D1D1;cursor:pointer;transition:all .3s ease}
.hjy-web-dot.active{background:#FF3B30;width:24px;border-radius:4px}
@media(min-width:768px){.hjy-web-scene{height:440px;perspective:1300px}.hjy-web-rotor{width:360px;height:240px}.hjy-web-card{width:360px;height:240px;border-radius:20px}.hjy-web-nav{width:50px;height:50px}.hjy-web-nav--prev{left:30px}.hjy-web-nav--next{right:30px}}
@media(min-width:1024px){.hjy-web-scene{height:540px;perspective:1500px}.hjy-web-rotor{width:460px;height:300px}.hjy-web-card{width:460px;height:300px;border-radius:24px}.hjy-web-nav--prev{left:calc(50% - 400px)}.hjy-web-nav--next{right:calc(50% - 400px)}}

#hjyRankMarquee .hjy-mq-track img{height:140px}
#hjyReviewMarquee .hjy-mq-track img{height:320px}
#hjyLectureMarquee .hjy-mq-track img{height:200px}
</style>

<!-- 섹션 1 — 오프닝 (좌측 정렬) -->
<section class="hjy-sec tl">
  <div class="hjy-inner">
    <p class="hjy-kw">헬스장 마케팅·필라테스 마케팅, 매출 구조부터 다시 봅니다</p>
    <h1 class="hjy-h2"><em>지역 1등</em> 마케팅 매장으로 만들어 드립니다.</h1>
    <p class="hjy-lead">신규는 들쭉날쭉, 재등록은 애매하게,<br>인건비는 꼬박꼬박.</p>
    <p class="hjy-lead">어디서 새는지 찾아 메꾸고,<br>한 달 뒤엔 대표님이 직접 굴리게 만들어 드립니다.</p>
  </div>
</section>

<!-- 섹션 2 — 문제 (체크리스트 + 구멍 4개) -->
<section class="hjy-sec hjy-sec--alt">
  <div class="hjy-inner">
    <h2 class="hjy-h2">몇 개가 해당되는지,<br>눌러서 세어보세요.</h2>
    <div class="hjy-checks">
      <div class="hjy-check"><span>지난달보다 바빴는데, 정산해보니 남은 건 비슷하거나 더 적음</span></div>
      <div class="hjy-check"><span>문의 10건이 오면 등록은 3건. 나머지 7건은 행방불명</span></div>
      <div class="hjy-check"><span>만기 일주일 전, 잘 나오던 회원이 갑자기 조용해짐</span></div>
      <div class="hjy-check"><span>직원은 늘었는데 매출은 그대로 — 인건비만 확실하게 늘어남</span></div>
      <div class="hjy-check"><span>매출이 빠진 달, 원인을 짚으라면 "글쎄요"가 먼저 나옴</span></div>
    </div>
    <p class="hjy-note">두 개 이상이라면, 문제는 대표님의 노력이 아닙니다.<br><em>어디서 새는지 보이지 않는다는 것.</em><br>그게 문제입니다.</p>
    <h3 class="hjy-sub">매출은 네 곳에서만 샙니다.</h3>
    <div class="hjy-holes4">
      <div class="hjy-hole4"><h4>유입</h4><p>신규를 데려오는 광고·노출</p></div>
      <div class="hjy-hole4"><h4>전환</h4><p>문의를 등록으로 바꾸는 상담·응대</p></div>
      <div class="hjy-hole4"><h4>유지</h4><p>등록을 재등록으로 잇는 관리·관계</p></div>
      <div class="hjy-hole4"><h4>비용</h4><p>번 돈을 지키는 인건비·지출 구조</p></div>
    </div>
    <p class="hjy-note" style="margin-top:28px">하나만 뚫려 있어도, 열심히는 통장에 남지 않습니다.</p>
    <p class="hjy-punch" style="text-align:center">그래서 안 쌓이는 겁니다.</p>
  </div>
</section>

<!-- 섹션 3 — 가이드 (공감 → 권위, 좌측 정렬) -->
<section class="hjy-sec tl">
  <div class="hjy-inner">
    <h2 class="hjy-h2">저도 20억을 태워보고 알았습니다.</h2>
    <p class="hjy-lead">광고에 누적 20억 이상 집행하며 확인했습니다.<br>광고를 잘해서 매출이 오른 센터보다,<br><mark>상담·재등록·비용 구조</mark>를 고쳐서 오른 센터가 더 많았습니다.</p>
    <p class="hjy-accent"><em>매출은 광고가 아니라 구조가 만듭니다.</em></p>
    <div class="hjy-nums">
      <div class="hjy-num-card"><b class="hjy-count" data-to="20" data-suffix="억+">0억+</b><span>광고 누적 집행액</span></div>
      <div class="hjy-num-card"><b class="hjy-count" data-to="110" data-suffix="개+">0개+</b><span>헬스장·필라테스 마케팅 운영 센터</span></div>
      <div class="hjy-num-card"><b class="hjy-count" data-prefix="1급 " data-to="3" data-suffix="종">1급 0종</b><span>검색광고마케터 (네이버·구글·카카오)</span></div>
      <div class="hjy-num-card"><b class="hjy-count" data-to="800" data-suffix="명">0명</b><span>그로우 에듀 누적 수강생</span></div>
    </div>
  </div>
  <div class="hjy-mq" id="hjyRankMarquee">
    <div class="hjy-mq-track">
      <img src="https://cdn.imweb.me/thumbnail/20250911/7555d085677f2.png" alt="허준영 컨설턴트 상위노출 사례 1">
      <img src="https://cdn.imweb.me/thumbnail/20250911/ab6c3a9f7007f.png" alt="허준영 컨설턴트 상위노출 사례 2">
      <img src="https://cdn.imweb.me/thumbnail/20250911/17751ea0cb81e.png" alt="허준영 컨설턴트 상위노출 사례 3">
      <img src="https://cdn.imweb.me/thumbnail/20250911/993bfd5741d22.jpg" alt="허준영 컨설턴트 상위노출 사례 4">
      <img src="https://cdn.imweb.me/thumbnail/20250911/7555d085677f2.png" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20250911/ab6c3a9f7007f.png" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20250911/17751ea0cb81e.png" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20250911/993bfd5741d22.jpg" alt="" aria-hidden="true">
    </div>
  </div>
</section>

<!-- 섹션 3.5 — 웹사이트 제작 (web-carousel.html 이식, hjy-web- 접두사) -->
<section class="hjy-sec hjy-sec--alt tl">
  <div class="hjy-inner">
    <h2 class="hjy-h2">유입의 시작은 홈페이지입니다.<br>그래서 직접 만들고, 직접 운영합니다.</h2>
    <p class="hjy-lead">피트니스 전문 웹사이트 제작 — 광고를 아는 사람이 만드는 홈페이지는 다릅니다.</p>
  </div>
  <div class="hjy-web-wrap">
    <p class="hjy-mqcap" style="margin-top:20px">좌우로 드래그하여 확인해보세요</p>
    <div class="hjy-web-scene" id="hjyWebScene">
      <button class="hjy-web-nav hjy-web-nav--prev" id="hjyWebPrev" aria-label="이전">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
      </button>
      <button class="hjy-web-nav hjy-web-nav--next" id="hjyWebNext" aria-label="다음">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
      </button>
      <div class="hjy-web-rotor" id="hjyWebRotor">
        <a class="hjy-web-card" href="https://pilateslean.co.kr" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn.imweb.me/thumbnail/20260210/93f98b61c2c1a.png" alt="필라테스 린">
          <div class="hjy-web-overlay">
            <span class="hjy-web-overlay-name">필라테스 린</span>
            <span class="hjy-web-overlay-link">Visit <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg></span>
          </div>
        </a>
        <a class="hjy-web-card" href="https://chaeumofficial.com" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn.imweb.me/thumbnail/20260210/152c69f74e0c0.png" alt="채움">
          <div class="hjy-web-overlay">
            <span class="hjy-web-overlay-name">채움</span>
            <span class="hjy-web-overlay-link">Visit <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg></span>
          </div>
        </a>
        <a class="hjy-web-card" href="https://growinterior.co.kr" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn.imweb.me/thumbnail/20260210/12ffb4b4c6c58.png" alt="그로우 인테리어">
          <div class="hjy-web-overlay">
            <span class="hjy-web-overlay-name">그로우 인테리어</span>
            <span class="hjy-web-overlay-link">Visit <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg></span>
          </div>
        </a>
        <a class="hjy-web-card" href="https://fitness-demo-topaz.vercel.app/" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn.imweb.me/thumbnail/20260210/048066d8b3030.png" alt="파워짐">
          <div class="hjy-web-overlay">
            <span class="hjy-web-overlay-name">파워짐</span>
            <span class="hjy-web-overlay-link">Visit <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg></span>
          </div>
        </a>
        <a class="hjy-web-card" href="https://pilates-demo.vercel.app/" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn.imweb.me/thumbnail/20260210/1c752a7dc6aa8.png" alt="소울 필라테스">
          <div class="hjy-web-overlay">
            <span class="hjy-web-overlay-name">소울 필라테스</span>
            <span class="hjy-web-overlay-link">Visit <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg></span>
          </div>
        </a>
        <a class="hjy-web-card" href="https://thebenefit.co.kr/" target="_blank" rel="noopener noreferrer">
          <img src="https://cdn.imweb.me/thumbnail/20260210/bc4c1227c16a0.png" alt="더배내핏">
          <div class="hjy-web-overlay">
            <span class="hjy-web-overlay-name">더배내핏</span>
            <span class="hjy-web-overlay-link">Visit <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg></span>
          </div>
        </a>
      </div>
    </div>
    <div class="hjy-web-dots" id="hjyWebDots">
      <div class="hjy-web-dot active" data-dot="0"></div>
      <div class="hjy-web-dot" data-dot="1"></div>
      <div class="hjy-web-dot" data-dot="2"></div>
      <div class="hjy-web-dot" data-dot="3"></div>
      <div class="hjy-web-dot" data-dot="4"></div>
      <div class="hjy-web-dot" data-dot="5"></div>
    </div>
  </div>
  <div class="hjy-inner" style="margin-top:36px">
    <p class="hjy-punch" style="text-align:center">지금 보고 계신 이 홈페이지도, 저희가 직접 만들어 운영합니다.</p>
  </div>
</section>

<!-- 섹션 4 — 계획 (좌측 정렬) -->
<section class="hjy-sec hjy-sec--alt tl">
  <div class="hjy-inner">
    <h2 class="hjy-h2">허준영 컨설턴트의 솔루션:<br>1인샵부터 다지점까지, <em>규모 맞춤 마케팅 마스터</em></h2>
    <p class="hjy-lead">광고 대행사는 유입만 봅니다.<br>운영 컨설턴트는 내부만 봅니다.<br>매출은 그 사이에서 샙니다.</p>
    <p class="hjy-lead"><em>저는 광고 계정과 상담 일지를<br>같은 날, 같은 테이블에서 봅니다.</em></p>
    <div class="hjy-prog">
      <div class="hjy-prog-item">
        <div class="hjy-prog-label">프로그램</div>
        <p class="hjy-prog-body">허준영 컨설턴트의 1:1 헬스장·필라테스 마케팅 밀착 컨설팅</p>
      </div>
      <div class="hjy-prog-item">
        <div class="hjy-prog-label">진단 시간</div>
        <p class="hjy-prog-body">주 1회, 한달 코스로 진행합니다.</p>
      </div>
      <div class="hjy-prog-item">
        <div class="hjy-prog-label">커리큘럼</div>
        <ul class="hjy-prog-list">
          <li><b>[규모 진단]</b> 1인샵·다지점 등 센터 규모와 상권에 맞는 마케팅 전략 수립</li>
          <li><b>[채널 장악]</b> 플레이스·블로그·메타 광고, 대표가 직접 운용하는 채널 세팅</li>
          <li><b>[실전 집행]</b> 광고 집행·소재 제작·글쓰기, 직접 해보며 몸에 익히는 실전</li>
          <li><b>[매출 연결]</b> 유입이 상담·등록·재등록·손익으로 이어지는 구조 완성</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- 섹션 5 — 실패 vs 성공 (좌우 2단, 실패 먼저) -->
<section class="hjy-sec">
  <div class="hjy-inner">
    <h2 class="hjy-h2" style="text-align:center">한 달 뒤,<br>두 가지 미래가 있습니다.</h2>
    <div class="hjy-cmp2">
      <div class="hjy-cmp2-card hjy-cmp2-card--bad">
        <div class="hjy-cmp2-tag">이대로 가면</div>
        <ul>
          <li>바쁜 건 그대로, 남는 것도 그대로</li>
          <li>매출이 빠져도 여전히 "글쎄요"</li>
          <li>인건비는 오르고 마진은 줄고</li>
        </ul>
      </div>
      <div class="hjy-cmp2-card hjy-cmp2-card--good">
        <div class="hjy-cmp2-tag">한 달을 쓰면</div>
        <ul>
          <li>새는 곳을 스스로 짚어내는 대표</li>
          <li>유입→등록→재등록→손익이 숫자로 보이는 센터</li>
          <li>그리고, 제가 필요 없어진 센터</li>
        </ul>
      </div>
    </div>
    <p class="hjy-punch" style="text-align:center;font-size:21px">한 달 뒤, 제가 필요 없어지게 만드는 게 목표입니다.</p>
  </div>
</section>

<!-- 섹션 6 — 증거 + 레터 -->
<section class="hjy-sec hjy-sec--alt">
  <div class="hjy-inner">
    <p class="hjy-mqcap">실제 대표님들의 카톡입니다.</p>
  </div>
  <div class="hjy-mq" id="hjyReviewMarquee">
    <div class="hjy-mq-track">
      <img src="https://cdn.imweb.me/thumbnail/20250728/ceddd35ebfc47.png" alt="허준영 컨설턴트 고객 후기 1">
      <img src="https://cdn.imweb.me/thumbnail/20250728/d5ef8194aae01.png" alt="허준영 컨설턴트 고객 후기 2">
      <img src="https://cdn.imweb.me/thumbnail/20250728/f1c64153b5faf.png" alt="허준영 컨설턴트 고객 후기 3">
      <img src="https://cdn.imweb.me/thumbnail/20250728/3a275f9fb2f61.png" alt="허준영 컨설턴트 고객 후기 4">
      <img src="https://cdn.imweb.me/thumbnail/20250728/77e4db3112261.png" alt="허준영 컨설턴트 고객 후기 5">
      <img src="https://cdn.imweb.me/thumbnail/20250728/07fd3d27b83d7.png" alt="허준영 컨설턴트 고객 후기 6">
      <img src="https://cdn.imweb.me/thumbnail/20250728/ceddd35ebfc47.png" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20250728/d5ef8194aae01.png" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20250728/f1c64153b5faf.png" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20250728/3a275f9fb2f61.png" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20250728/77e4db3112261.png" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20250728/07fd3d27b83d7.png" alt="" aria-hidden="true">
    </div>
  </div>
  <div class="hjy-inner" style="margin-top:52px">
    <p class="hjy-mqcap">800명이 이 강의를 거쳐갔습니다.</p>
  </div>
  <div class="hjy-mq" id="hjyLectureMarquee">
    <div class="hjy-mq-track">
      <img src="https://cdn.imweb.me/thumbnail/20260129/8e4d9dcb6ba10.jpg" alt="허준영 컨설턴트 강의 현장 1">
      <img src="https://cdn.imweb.me/thumbnail/20251024/82df487ecc05e.jpg" alt="허준영 컨설턴트 강의 현장 2">
      <img src="https://cdn.imweb.me/thumbnail/20251024/21fbb1985dcd7.jpg" alt="허준영 컨설턴트 강의 현장 3">
      <img src="https://cdn.imweb.me/thumbnail/20260129/d7505685c11bd.jpg" alt="허준영 컨설턴트 강의 현장 4">
      <img src="https://cdn.imweb.me/thumbnail/20260129/d3366bea96bbb.jpg" alt="허준영 컨설턴트 강의 현장 5">
      <img src="https://cdn.imweb.me/thumbnail/20260129/cadc3e3228271.jpg" alt="허준영 컨설턴트 강의 현장 6">
      <img src="https://cdn.imweb.me/thumbnail/20260129/8e4d9dcb6ba10.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20251024/82df487ecc05e.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20251024/21fbb1985dcd7.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260129/d7505685c11bd.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260129/d3366bea96bbb.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260129/cadc3e3228271.jpg" alt="" aria-hidden="true">
    </div>
  </div>
  <div class="hjy-inner" style="margin-top:56px">
    <div class="hjy-letter-wrap">
      <div class="hjy-letter-txt">
        <h2>매출은 구조에서 새고,<br>구조에서 다시 삽니다.</h2>
        <p>110개 센터를 운영하며 알게 됐습니다.<br>광고를 고쳐 매출이 오른 센터보다,<br>상담과 재등록을 고쳐 오른 센터가 더 많았습니다.</p>
        <p>그래서 저는 광고만 봐드리지 않습니다.<br>유입부터 등록, 재등록, 손익까지<br>구조 전체를 함께 뜯어고칩니다.</p>
        <p class="hjy-sign">허 준 영</p>
      </div>
      <img class="hjy-letter-img" src="/consultants/heo-junyoung.jpg" alt="더그로우컴퍼니 허준영 진단 컨설턴트">
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
    var track = root.querySelector('.hjy-mq-track');
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

  marquee('hjyRankMarquee', 36, false);
  marquee('hjyReviewMarquee', 36, true);
  marquee('hjyLectureMarquee', 36, false);

  // 웹사이트 제작 캐러셀 (hjy-web-, 3D 원통형 드래그 캐러셀 — window 리스너는
  // stops[]에 추적해 언마운트 시 __hjyMarqueeStop 호출로 함께 정리)
  (function(){
    var scene = document.getElementById('hjyWebScene');
    if (!scene) return;
    var rotor = document.getElementById('hjyWebRotor');
    var cards = scene.querySelectorAll('.hjy-web-card');
    var dots = document.querySelectorAll('#hjyWebDots .hjy-web-dot');
    var total = cards.length;
    var stepAngle = 360 / total;

    var currentAngle = 0;
    var currentIndex = 0;
    var isDragging = false;
    var startX = 0;
    var dragStartAngle = 0;
    var hasDragged = false;

    function getBaseRotX(){ return window.innerWidth >= 1024 ? -6 : -4; }

    function getRadius(){
      var cardWidth = rotor.offsetWidth;
      var radius = (cardWidth / 2) / Math.tan(Math.PI / total);
      return Math.round(radius) + (window.innerWidth >= 768 ? 40 : 20);
    }

    function layout(){
      var r = getRadius();
      cards.forEach(function(card, i){
        card.style.transform = 'rotateY(' + (stepAngle * i) + 'deg) translateZ(' + r + 'px)';
      });
      updateClasses();
    }

    function render(angle, animate){
      rotor.style.transition = animate ? 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none';
      rotor.style.transform = 'translate(-50%, -50%) rotateX(' + getBaseRotX() + 'deg) rotateY(' + angle + 'deg)';
    }

    function updateClasses(){
      var normalizedAngle = currentAngle % 360;
      if (normalizedAngle > 0) normalizedAngle -= 360;
      currentIndex = Math.round(Math.abs(normalizedAngle) / stepAngle) % total;
      var prev = (currentIndex - 1 + total) % total;
      var next = (currentIndex + 1) % total;
      cards.forEach(function(card, i){
        card.classList.remove('is-front', 'is-adjacent');
        if (i === currentIndex) card.classList.add('is-front');
        else if (i === prev || i === next) card.classList.add('is-adjacent');
      });
      dots.forEach(function(dot, i){ dot.classList.toggle('active', i === currentIndex); });
    }

    function moveToIndex(direction){
      currentAngle -= direction * stepAngle;
      render(currentAngle, true);
      updateClasses();
    }

    function onDragStart(e){
      isDragging = true;
      hasDragged = false;
      startX = e.type.indexOf('mouse') === 0 ? e.pageX : e.touches[0].pageX;
      dragStartAngle = currentAngle;
      scene.style.cursor = 'grabbing';
    }
    function onDragMove(e){
      if (!isDragging) return;
      var x = e.type.indexOf('mouse') === 0 ? e.pageX : e.touches[0].pageX;
      var dist = x - startX;
      if (Math.abs(dist) > 5) hasDragged = true;
      var rotationSensitivity = 0.4;
      currentAngle = dragStartAngle + (dist * rotationSensitivity);
      render(currentAngle, false);
      updateClasses();
    }
    function onDragEnd(){
      if (!isDragging) return;
      isDragging = false;
      scene.style.cursor = 'grab';
      currentAngle = Math.round(currentAngle / stepAngle) * stepAngle;
      render(currentAngle, true);
      updateClasses();
    }
    function onResize(){ layout(); render(currentAngle, true); }

    scene.addEventListener('mousedown', onDragStart);
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);
    scene.addEventListener('touchstart', onDragStart, { passive: true });
    window.addEventListener('touchmove', onDragMove, { passive: true });
    window.addEventListener('touchend', onDragEnd);
    window.addEventListener('resize', onResize);

    var prevBtn = document.getElementById('hjyWebPrev');
    var nextBtn = document.getElementById('hjyWebNext');
    function onPrevClick(){ moveToIndex(-1); }
    function onNextClick(){ moveToIndex(1); }
    if (prevBtn) prevBtn.addEventListener('click', onPrevClick);
    if (nextBtn) nextBtn.addEventListener('click', onNextClick);

    cards.forEach(function(card, idx){
      card.addEventListener('click', function(e){
        if (hasDragged){ e.preventDefault(); return; }
        if (idx !== currentIndex){
          // 정면이 아닌 카드를 클릭하면 이동만 하고, 새 탭 이동은 막는다.
          e.preventDefault();
          var diff = idx - currentIndex;
          if (diff > total / 2) diff -= total;
          if (diff < -total / 2) diff += total;
          currentAngle -= diff * stepAngle;
          render(currentAngle, true);
          updateClasses();
        }
        // idx === currentIndex && !hasDragged → <a target="_blank"> 기본 동작으로 이동
      });
    });

    dots.forEach(function(dot, idx){
      dot.addEventListener('click', function(){
        var diff = idx - currentIndex;
        if (diff > total / 2) diff -= total;
        if (diff < -total / 2) diff += total;
        currentAngle -= diff * stepAngle;
        render(currentAngle, true);
        updateClasses();
      });
    });

    layout();
    render(currentAngle, false);
    updateClasses();

    stops.push(function(){
      window.removeEventListener('mousemove', onDragMove);
      window.removeEventListener('mouseup', onDragEnd);
      window.removeEventListener('touchmove', onDragMove);
      window.removeEventListener('touchend', onDragEnd);
      window.removeEventListener('resize', onResize);
    });
  })();

  // 체크리스트 토글 (이벤트 위임, 전역 오염 없음 — 컨테이너 제거 시 리스너도 함께 GC)
  var checks = document.querySelector('.hjy-checks');
  if (checks){
    checks.addEventListener('click', function(e){
      var t = e.target;
      while (t && t !== checks && !(t.classList && t.classList.contains('hjy-check'))){ t = t.parentNode; }
      if (t && t.classList && t.classList.contains('hjy-check')){ t.classList.toggle('is-on'); }
    });
  }

  // 숫자 카운터 (뷰포트 진입 시 1회 카운트업, 전역 오염 없음)
  function runCount(el){
    var to = parseInt(el.getAttribute('data-to'), 10) || 0;
    var pre = el.getAttribute('data-prefix') || '';
    var suf = el.getAttribute('data-suffix') || '';
    var dur = 1300, t0 = 0;
    function step(ts){
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + Math.round(to * eased) + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('.hjy-count');
  if (counters.length){
    if (typeof IntersectionObserver !== 'undefined'){
      var io = new IntersectionObserver(function(entries){
        for (var k = 0; k < entries.length; k++){
          if (entries[k].isIntersecting){ runCount(entries[k].target); io.unobserve(entries[k].target); }
        }
      }, { threshold: 0.4 });
      for (var i = 0; i < counters.length; i++){ io.observe(counters[i]); }
      stops.push(function(){ io.disconnect(); });
    } else {
      for (var j = 0; j < counters.length; j++){ runCount(counters[j]); }
    }
  }

  // 언마운트 정리용 전역 정지 훅 (React cleanup 에서 호출 후 no-op 으로 교체)
  window.__hjyMarqueeStop = function(){
    for (var i = 0; i < stops.length; i++){ stops[i](); }
  };
})();
</script>
</div>`;

export default function HeoJunyoungDiagnosisPage() {
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
  //  전역 정지 훅(__hjyMarqueeStop) 호출로 cancelAnimationFrame 후 no-op 교체(삭제 금지).
  useEffect(() => {
    if (!mounted) return;
    const container = detailRef.current;
    if (!container) return;
    const injected = injectContainer(container);
    return () => {
      injected.forEach((s) => s.remove());
      const w = window as unknown as Record<string, unknown>;
      const stop = w["__hjyMarqueeStop"];
      if (typeof stop === "function") (stop as () => void)();
      w["__hjyMarqueeStop"] = () => {};
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
                alt="허준영 헬스장·필라테스 운영 진단 컨설턴트"
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

      {/* ───────────────── 랜딩 상세 (hjy-) ───────────────── */}
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
          지금, 무료 상담으로 시작합니다.
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
      <ConsultantCarousel currentSlug="heo-junyoung" />

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
