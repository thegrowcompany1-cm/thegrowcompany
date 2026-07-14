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
// 상위노출 마퀴 4장 + 카톡 마퀴 6장(역방향,320px) + 강의 마퀴 6장 (각 2회 배치).
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
.hjy-prelead{margin:0 auto 26px;max-width:600px}

.hjy-stats{display:flex;justify-content:center;gap:36px;flex-wrap:wrap;margin:26px auto 4px}
.hjy-stat{text-align:center}
.hjy-stat b{display:block;font-size:34px;font-weight:800;color:var(--g);line-height:1}
.hjy-stat span{display:block;margin-top:8px;font-size:13px;color:#a8a8a8}
@media(max-width:640px){.hjy-stats{gap:22px}.hjy-stat b{font-size:26px}}

.hjy-nums{display:grid;grid-template-columns:1fr 1fr;gap:14px;max-width:680px;margin:32px auto 0}
.hjy-num-card{background:#141414;border:1px solid #232323;border-radius:16px;padding:30px 24px;text-align:center}
.hjy-num-card b{display:block;font-size:34px;font-weight:800;color:var(--g);line-height:1.15}
.hjy-num-card span{display:block;margin-top:10px;font-size:14px;color:#bdbdbd;line-height:1.5}
@media(max-width:640px){.hjy-nums{grid-template-columns:1fr}.hjy-num-card b{font-size:30px}}

.hjy-checks{max-width:640px;margin:36px auto 0;display:flex;flex-direction:column;gap:12px}
.hjy-check{position:relative;background:#141414;border:1px solid #262626;border-radius:14px;padding:18px 20px 18px 56px;cursor:pointer;transition:border-color .2s;user-select:none;-webkit-user-select:none}
.hjy-check::before{content:'';position:absolute;left:18px;top:50%;transform:translateY(-50%);width:24px;height:24px;border:2px solid #444;border-radius:7px;transition:.2s}
.hjy-check span{font-size:15px;color:#dcdcdc;line-height:1.5}
.hjy-check.is-on{border-color:var(--g)}
.hjy-check.is-on::before{background:var(--g);border-color:var(--g)}
.hjy-check.is-on::after{content:'\\2713';position:absolute;left:24px;top:50%;transform:translateY(-50%);color:#04240f;font-weight:800;font-size:14px}

.hjy-holes{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;max-width:900px;margin:14px auto 0}
.hjy-hole{background:#111;border:1px solid #232323;border-radius:18px;padding:28px 24px;text-align:left}
.hjy-hole-num{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:var(--g);color:#04240f;font-weight:800;font-size:18px;margin-bottom:16px}
.hjy-hole h3{font-size:19px;font-weight:800;color:#fff;margin:0 0 10px}
.hjy-hole p{font-size:14px;color:#bdbdbd;line-height:1.65;margin:0}
@media(max-width:640px){.hjy-holes{grid-template-columns:1fr}}

#hjyReviewMarquee .hjy-mq-track img{height:320px}
</style>

<!-- 1. 오프닝 -->
<section class="hjy-sec">
  <div class="hjy-inner">
    <h2 class="hjy-h2">광고비 10억을<br>태워보고 알았습니다.</h2>
    <span class="hjy-vline"></span>
    <p class="hjy-accent"><em>매출은 광고가 아니라 '구조'에서<br>새고 있었습니다.</em></p>
  </div>
</section>

<!-- 2. 증거 선공 — 상위노출 사례 -->
<section class="hjy-sec hjy-sec--alt">
  <div class="hjy-inner">
    <h2 class="hjy-h2">말보다 결과가 빠릅니다.</h2>
    <p class="hjy-lead">지역 키워드 검색 시 상위 노출된 실제 결과입니다.</p>
    <div class="hjy-stats">
      <div class="hjy-stat"><b>200+</b><span>진행 센터</span></div>
      <div class="hjy-stat"><b>92%</b><span>상위노출 달성</span></div>
      <div class="hjy-stat"><b>1~3위</b><span>평균 순위</span></div>
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

<!-- 3. 증거 선공 — 카톡 후기 (역방향, 320px) -->
<section class="hjy-sec">
  <div class="hjy-inner">
    <h2 class="hjy-h2">실제 대표님들의 후기</h2>
    <p class="hjy-lead">함께한 센터들의 실제 카카오톡 대화입니다.</p>
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
</section>

<!-- 4. 자기소개 — 숫자 4개 -->
<section class="hjy-sec hjy-sec--alt">
  <div class="hjy-inner">
    <p class="hjy-lead hjy-prelead"><em>대행사가 아니라, 더그로우의 마케팅 총괄입니다.</em></p>
    <div class="hjy-nums">
      <div class="hjy-num-card"><b>10억</b><span>메타광고 누적 광고액</span></div>
      <div class="hjy-num-card"><b>110개+</b><span>그로우 마케팅 운영</span></div>
      <div class="hjy-num-card"><b>1급</b><span>검색광고마케터 (네이버·구글·카카오)</span></div>
      <div class="hjy-num-card"><b>800명</b><span>그로우 에듀 누적 수강생</span></div>
    </div>
  </div>
</section>

<!-- 5. 체크리스트 (인터랙티브) -->
<section class="hjy-sec">
  <div class="hjy-inner">
    <h2 class="hjy-h2">이 중 몇 개가<br>해당되는지 체크해보세요.</h2>
    <div class="hjy-checks">
      <div class="hjy-check"><span>광고는 돌리는데 신규 문의가 일정하지 않다</span></div>
      <div class="hjy-check"><span>문의는 오는데 상담에서 등록으로 이어지지 않는다</span></div>
      <div class="hjy-check"><span>등록한 회원이 재등록 시점에 조용히 사라진다</span></div>
      <div class="hjy-check"><span>상담을 누가 하느냐에 따라 등록률이 널뛴다</span></div>
      <div class="hjy-check"><span>매출이 빠지면 어디서 새는지 짚어낼 수가 없다</span></div>
    </div>
    <p class="hjy-note"><em>두 개 이상이라면, 광고가 아니라 매출 구조 전체를 점검할 때입니다.</em></p>
  </div>
</section>

<!-- 6. 핵심 논리 — 매출이 새는 3개의 구멍 -->
<section class="hjy-sec hjy-sec--alt">
  <div class="hjy-inner">
    <h2 class="hjy-h2">매출이 새는<br><em>3개의 구멍</em></h2>
  </div>
  <div class="hjy-inner">
    <div class="hjy-holes">
      <div class="hjy-hole"><span class="hjy-hole-num">1</span><h3>유입</h3><p>신규 고객을 데려오는 광고·노출 구조</p></div>
      <div class="hjy-hole"><span class="hjy-hole-num">2</span><h3>전환</h3><p>문의를 등록으로 바꾸는 상담·응대 구조</p></div>
      <div class="hjy-hole"><span class="hjy-hole-num">3</span><h3>유지</h3><p>등록을 재등록으로 잇는 관리·관계 구조</p></div>
    </div>
    <p class="hjy-note"><em>세 구멍 중 하나만 뚫려 있어도 광고비는 밑 빠진 독입니다.</em><br>저는 세 개를 한 번에 봅니다.</p>
  </div>
</section>

<!-- 7. 차별점 -->
<section class="hjy-sec">
  <div class="hjy-inner">
    <h2 class="hjy-h2">반쪽 진단이<br><em>매출을 새게 둡니다.</em></h2>
    <p class="hjy-lead">광고 대행사는 유입만 봅니다.<br>운영 컨설턴트는 내부만 봅니다.<br>매출은 그 사이에서 샙니다.</p>
    <p class="hjy-lead">저는 광고 계정과 상담 일지를<br><strong>같은 날, 같은 테이블에서</strong> 봅니다.</p>
    <span class="hjy-vline"></span>
    <p class="hjy-accent"><em>한 달 뒤, 제가 필요 없어지게 만드는 게 목표입니다.</em></p>
  </div>
</section>

<!-- 8. 프로그램 -->
<section class="hjy-sec hjy-sec--alt">
  <div class="hjy-inner">
    <h2 class="hjy-h2">허준영 컨설턴트의 솔루션:<br><em>매출 구조 전체</em>를 뜯어고치는 밀착 진단</h2>
    <div class="hjy-prog">
      <div class="hjy-prog-item">
        <div class="hjy-prog-label">프로그램</div>
        <p class="hjy-prog-body">허준영 컨설턴트의 1:1 매출 구조 밀착 진단</p>
      </div>
      <div class="hjy-prog-item">
        <div class="hjy-prog-label">진단 시간</div>
        <p class="hjy-prog-body">주 1회, 한달 코스로 진행합니다.</p>
      </div>
      <div class="hjy-prog-item">
        <div class="hjy-prog-label">커리큘럼</div>
        <ul class="hjy-prog-list">
          <li><b>[유입 진단]</b> 광고 계정·플레이스·채널 점검, 신규 문의가 새는 지점 특정</li>
          <li><b>[전환 교정]</b> 신규 상담 프로세스 재설계, 문의가 등록으로 이어지는 응대 구조 구축</li>
          <li><b>[유지 설계]</b> 재등록 시점 관리 체계와 이탈 방지 루틴 구축</li>
          <li><b>[자립 완성]</b> 광고 운영부터 상담·재등록 관리까지, 대표와 직원이 직접 굴리는 체계 완성</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- 9. 강의 사진 마퀴 -->
<section class="hjy-sec">
  <div class="hjy-inner">
    <h2 class="hjy-h2">800명이 거쳐간<br><em>강의 현장</em>입니다.</h2>
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
</section>

<!-- 10. 철학 레터 -->
<section class="hjy-sec hjy-sec--alt">
  <div class="hjy-inner">
    <div class="hjy-letter-wrap">
      <div class="hjy-letter-txt">
        <h2>매출은 구조에서 새고,<br>구조에서 다시 삽니다.</h2>
        <p>110개 센터의 마케팅을 운영하며 알게 됐습니다.<br>광고를 고쳐서 매출이 오른 센터보다,<br>상담과 재등록을 고쳐서 오른 센터가 더 많았습니다.</p>
        <p>그래서 저는 광고만 봐드리지 않습니다.<br>문의가 등록이 되고,<br>등록이 재등록으로 이어지는<br>그 구조 전체를 함께 뜯어고칩니다.</p>
        <p>한 달 뒤에는<br>제가 없어도 돌아가게 만들어 드리겠습니다.</p>
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

  // 체크리스트 토글 (이벤트 위임, 전역 오염 없음 — 컨테이너 제거 시 리스너도 함께 GC)
  var checks = document.querySelector('.hjy-checks');
  if (checks){
    checks.addEventListener('click', function(e){
      var t = e.target;
      while (t && t !== checks && !(t.classList && t.classList.contains('hjy-check'))){ t = t.parentNode; }
      if (t && t.classList && t.classList.contains('hjy-check')){ t.classList.toggle('is-on'); }
    });
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
