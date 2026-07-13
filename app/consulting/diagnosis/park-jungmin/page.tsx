"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 진단 컨설턴트 상세페이지 — 박정민
//  구조(김승호 최종본과 동일): [상단 인물사진 + 상담폼] → DETAIL_HTML(다크 랜딩)
//   → [하단 상담폼(-bottom id)] → ConsultantCarousel → 추천 카드
//  · 클래스 접두사 pjm- / 전역 정지 훅 __pjmMarqueeStop
//  · mounted 클라이언트 전용 렌더 + suppressHydrationWarning
//  · innerHTML <script> 는 주입 이펙트(injectContainer)가 재생성 append 하여 실행
//  · 현장사진 마퀴는 requestAnimationFrame + cancelAnimationFrame 정리
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ConsultantCarousel from "@/components/ConsultantCarousel";

// 좌측 메인 이미지 (public 기준)
const MAIN_IMAGE = "/consultants/park-jungmin.png";

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
  // DOMContentLoaded 대신 즉시 실행하고, data-pjm-init 로 재실행 시 중복 바인딩을 막는다.
  function initForm(wrapper){
    if (!wrapper || wrapper.getAttribute('data-pjm-init')) return;
    wrapper.setAttribute('data-pjm-init', '1');

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

// ─── 황봉남 진단 랜딩 상세 HTML (pjm- 접두사, eyebrow 없음) ────────────────────
// 현장사진 마퀴 <script> 포함. detailRef 주입 이펙트가 script 재실행 + rAF 정리.
// 인증사진 마퀴 10장(각 2회씩 = 20개 img) + 카톡 후기 가로 스크롤 스트립 5장.
const DETAIL_HTML = `<div class="pjm">
<style>
.pjm{--g:#22B573;--bg:#0A0A0A;--bg2:#0d0d0d;--cream:#FBF8EC;--ink:#141414;--mark:#b6f2c9;background:var(--bg);color:#fff;font-family:'Pretendard',-apple-system,BlinkMacSystemFont,system-ui,'Apple SD Gothic Neo',sans-serif;line-height:1.8;letter-spacing:-0.01em;overflow:hidden}
.pjm *{box-sizing:border-box}
.pjm-inner{max-width:760px;margin:0 auto;padding:0 20px}
.pjm-sec{padding:96px 0}
.pjm-sec--alt{background:var(--bg2)}
.pjm-h2{font-size:29px;font-weight:800;text-align:center;line-height:1.5;margin:0 0 22px}
.pjm-h2 em{font-style:normal;color:var(--g)}
.pjm-lead{font-size:17px;color:#c9c9c9;text-align:center;margin:0 0 16px;line-height:1.85}
.pjm-lead strong{color:#fff;font-weight:700}
.pjm-lead em{font-style:normal;color:var(--g);font-weight:700}
.pjm-vline{display:block;width:2px;height:56px;background:var(--g);margin:36px auto}
.pjm-accent{font-size:19px;font-weight:800;color:#fff;text-align:center;margin:0;line-height:1.6}
.pjm-accent em{font-style:normal;color:var(--g)}
@media(max-width:640px){.pjm-h2{font-size:23px}.pjm-lead{font-size:15px}.pjm-sec{padding:76px 0}}

.pjm-points{display:flex;flex-direction:column;gap:18px;max-width:600px;margin:36px auto 0}
.pjm-point{background:#141414;border:1px solid #232323;border-left:3px solid var(--g);border-radius:14px;padding:24px}
.pjm-point h3{margin:0 0 8px;font-size:18px;font-weight:800;color:#fff}
.pjm-point p{margin:0;font-size:15px;color:#bdbdbd;line-height:1.75}
.pjm-note{margin:40px auto 0;max-width:600px;text-align:center;font-size:16px;color:#e6e6e6;line-height:1.85}
.pjm-note em{font-style:normal;color:var(--g);font-weight:700}

.pjm-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;max-width:680px;margin:40px auto 0}
.pjm-card{background:var(--cream);color:var(--ink);border-radius:18px;padding:28px 24px}
.pjm-card h4{margin:0 0 4px;font-size:12px;font-weight:700;color:#5a7d64;letter-spacing:.04em}
.pjm-card h3{margin:0 0 12px;font-size:19px;font-weight:800}
.pjm-card p{margin:0;font-size:14px;line-height:1.8;color:#333}
.pjm-card mark{background:var(--mark);color:var(--ink);padding:1px 4px;border-radius:4px;font-weight:600}
@media(max-width:640px){.pjm-grid{grid-template-columns:1fr}}

.pjm-trust{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#232323;border:1px solid #232323;border-radius:16px;overflow:hidden;max-width:680px;margin:24px auto 0}
.pjm-trust div{background:#111;padding:22px 14px;text-align:center;font-size:14px;font-weight:600;color:#eaeaea;line-height:1.6}
.pjm-trust b{color:var(--g);font-weight:800}
@media(max-width:640px){.pjm-trust{grid-template-columns:1fr}}

.pjm-mq{overflow:hidden;width:100%;max-width:100%;margin-top:14px;-webkit-user-select:none;user-select:none}
.pjm-mq-track{display:flex;width:max-content;gap:14px;will-change:transform}
.pjm-mq-track img{height:280px;width:auto;display:block;border-radius:16px;background:#1a1a1a;flex:0 0 auto}

.pjm-strip{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;align-items:flex-start;padding:10px 20px 20px;margin-top:14px;-webkit-overflow-scrolling:touch}
.pjm-strip img{flex:0 0 360px;width:360px;height:auto;scroll-snap-align:start;border-radius:16px;background:#1a1a1a;display:block}
@media(max-width:640px){.pjm-strip img{flex:0 0 320px;width:320px}}

.pjm-who{display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:680px;margin:40px auto 0}
.pjm-who-item{background:#141414;border:1px solid #232323;border-radius:16px;padding:26px 22px}
.pjm-who-num{display:block;font-size:34px;font-weight:800;color:var(--g);line-height:1;margin-bottom:12px}
.pjm-who-item h3{margin:0 0 8px;font-size:16px;font-weight:800;color:#fff}
.pjm-who-item p{margin:0;font-size:14px;color:#bdbdbd;line-height:1.7}
@media(max-width:640px){.pjm-who{grid-template-columns:1fr}}

.pjm-letter-wrap{display:flex;gap:40px;align-items:center;max-width:760px;margin:0 auto}
.pjm-letter-txt{flex:1;min-width:0}
.pjm-letter-txt h2{font-size:25px;font-weight:800;color:var(--g);line-height:1.5;margin:0 0 24px}
.pjm-letter-txt p{font-size:16px;color:#dcdcdc;line-height:1.95;margin:0 0 24px}
.pjm-sign{font-size:22px;font-weight:800;color:#fff;letter-spacing:.35em;margin:0}
.pjm-letter-img{flex:0 0 280px;width:280px;aspect-ratio:3/4;object-fit:cover;border-radius:18px;filter:grayscale(1);background:#1a1a1a}
@media(max-width:760px){.pjm-letter-wrap{flex-direction:column}.pjm-letter-img{width:100%;max-width:340px}}
@media(max-width:640px){.pjm-letter-txt h2{font-size:22px}}

.pjm-prog{max-width:600px;margin:36px auto 0}
.pjm-prog-item{padding:26px 0;border-top:1px solid #222}
.pjm-prog-item:first-child{border-top:0}
.pjm-prog-label{font-size:12px;font-weight:800;letter-spacing:.06em;color:var(--g);margin-bottom:8px}
.pjm-prog-body{font-size:16px;color:#eaeaea;line-height:1.7;margin:0}
.pjm-prog-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}
.pjm-prog-list li{font-size:15px;color:#d8d8d8;line-height:1.7}
.pjm-prog-list li b{color:#fff;font-weight:800;margin-right:4px}
</style>

<!-- 1. 공감 -->
<section class="pjm-sec">
  <div class="pjm-inner">
    <h2 class="pjm-h2">현장 없는 이론은<br>절대 실력이 될 수 없습니다.</h2>
    <p class="pjm-lead">2010년 강사로 시작해<br>총괄 임원까지 15년의 시간,<br>모든 계절을 현장에서 이겨냈습니다.</p>
    <p class="pjm-lead">운동이 좋아 뛰어든 이 시장에서<br>홀로 고군분투하는 대표님들을 볼 때마다<br>늘 마음이 무거웠습니다.</p>
    <span class="pjm-vline"></span>
    <p class="pjm-accent"><em>대표님들의 든든한 신호등이 되어<br>더 많은 성장의 가치를 나누고 싶습니다.</em></p>
  </div>
</section>

<!-- 2. 문제 -->
<section class="pjm-sec pjm-sec--alt">
  <div class="pjm-inner">
    <h2 class="pjm-h2">대표님의 현장은<br>늘 혹독한 겨울에 머물러 있습니다.</h2>
    <div class="pjm-points">
      <div class="pjm-point">
        <h3>구조적 불모지</h3>
        <p>열심히 물을 주는데도 싹이 트지 않는다면, 그것은 대표님의 정성이 부족해서가 아니라 토양 자체가 정비되지 않았기 때문입니다.</p>
      </div>
      <div class="pjm-point">
        <h3>건너뛴 계절</h3>
        <p>씨앗을 뿌리고 열매를 맺는 자연의 순리처럼, 사업도 단계별 성장이 필요합니다. 순서를 건너뛴 성장은 반드시 흔들립니다.</p>
      </div>
      <div class="pjm-point">
        <h3>불확실한 적신호</h3>
        <p>지금 우리 시장은 불확실한 적신호 앞에 있습니다. 멈춰야 할지 나아가야 할지, 그 판단을 혼자 감당하고 계십니다.</p>
      </div>
    </div>
    <p class="pjm-note">이제는 무작정 땀 흘리는 노동보다,<br><em>다음 계절로 넘어갈 수 있게 만드는 '운영의 자양분'이 필요합니다.</em></p>
  </div>
</section>

<!-- 3. 해결 -->
<section class="pjm-sec">
  <div class="pjm-inner">
    <h2 class="pjm-h2">운영을 대신하지 않습니다.<br>스스로 열매 맺는 <em>'성장 뿌리'</em>를 심습니다.</h2>
    <div class="pjm-grid">
      <div class="pjm-card">
        <h4>(Vitality)</h4><h3>고객 유입</h3>
        <p><mark>나갈 사람도 다시 결제하게 만들어</mark> 꽉 막힌 매출을 즉시 뚫어냅니다.</p>
      </div>
      <div class="pjm-card">
        <h4>(Role-Clear)</h4><h3>역할 분담</h3>
        <p>내 일과 네 일을 명확히 나눠 <mark>대표님의 머리 아픈 잡무를 완전히 없앱니다.</mark></p>
      </div>
      <div class="pjm-card">
        <h4>(Standard)</h4><h3>성과 공식</h3>
        <p>초보도 고수처럼 결과물을 내는 <mark>'일하는 도구'</mark>를 드려 운영 기복을 없앱니다.</p>
      </div>
      <div class="pjm-card">
        <h4>(Forecasting)</h4><h3>결과 예측</h3>
        <p>감이 아닌 숫자로 <mark>이번 달 매출을 미리 맞추고</mark> 다음 성장을 준비합니다.</p>
      </div>
    </div>
    <div class="pjm-trust">
      <div>GX 강사부터 총괄 임원까지 <b>15년</b></div>
      <div><b>400여 명</b> 신입을<br>핵심 인재로 육성</div>
      <div>모든 계절을 견뎌낸<br>데이터 기반 운영 공식</div>
    </div>
  </div>
</section>

<!-- 4-1. 카톡 후기 (손으로 넘기는 가로 스크롤 스트립) -->
<section class="pjm-sec pjm-sec--alt">
  <div class="pjm-inner">
    <h2 class="pjm-h2">현장에서 도착한<br><em>진짜 메시지</em>들입니다.</h2>
  </div>
  <div class="pjm-strip">
    <img src="https://cdn.imweb.me/thumbnail/20260306/a35547dd7150f.jpg" alt="박정민 컨설턴트 카톡 후기 1">
    <img src="https://cdn.imweb.me/thumbnail/20260306/832ff981ca6a8.jpg" alt="박정민 컨설턴트 카톡 후기 2">
    <img src="https://cdn.imweb.me/thumbnail/20260306/c2b91999b556d.jpg" alt="박정민 컨설턴트 카톡 후기 3">
    <img src="https://cdn.imweb.me/thumbnail/20260306/5587dcdc52258.jpg" alt="박정민 컨설턴트 카톡 후기 4">
    <img src="https://cdn.imweb.me/thumbnail/20260306/fc8dfdf3c46e4.jpg" alt="박정민 컨설턴트 카톡 후기 5">
  </div>
</section>

<!-- 4-2. 인증사진 마퀴 -->
<section class="pjm-sec">
  <div class="pjm-inner">
    <h2 class="pjm-h2">함께한 대표님들이<br><em>증명</em>합니다.</h2>
  </div>
  <div class="pjm-mq" id="pjmLectureMarquee">
    <div class="pjm-mq-track">
      <img src="https://cdn.imweb.me/thumbnail/20260305/651aebcb6e3d2.jpg" alt="박정민 컨설턴트 인증사진 1">
      <img src="https://cdn.imweb.me/thumbnail/20260305/1ff121508799f.jpg" alt="박정민 컨설턴트 인증사진 2">
      <img src="https://cdn.imweb.me/thumbnail/20260305/a5c120d0df47a.jpg" alt="박정민 컨설턴트 인증사진 3">
      <img src="https://cdn.imweb.me/thumbnail/20260305/01b4be01917af.jpg" alt="박정민 컨설턴트 인증사진 4">
      <img src="https://cdn.imweb.me/thumbnail/20260305/e197bb53093c6.jpg" alt="박정민 컨설턴트 인증사진 5">
      <img src="https://cdn.imweb.me/thumbnail/20260305/48324e8f3ccfb.jpg" alt="박정민 컨설턴트 인증사진 6">
      <img src="https://cdn.imweb.me/thumbnail/20260305/7c3d82ae44ab6.jpg" alt="박정민 컨설턴트 인증사진 7">
      <img src="https://cdn.imweb.me/thumbnail/20260305/29ff7811ade8b.jpg" alt="박정민 컨설턴트 인증사진 8">
      <img src="https://cdn.imweb.me/thumbnail/20260305/3c4c887afabd0.jpg" alt="박정민 컨설턴트 인증사진 9">
      <img src="https://cdn.imweb.me/thumbnail/20260305/12139033734c4.jpg" alt="박정민 컨설턴트 인증사진 10">
      <img src="https://cdn.imweb.me/thumbnail/20260305/651aebcb6e3d2.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260305/1ff121508799f.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260305/a5c120d0df47a.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260305/01b4be01917af.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260305/e197bb53093c6.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260305/48324e8f3ccfb.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260305/7c3d82ae44ab6.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260305/29ff7811ade8b.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260305/3c4c887afabd0.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260305/12139033734c4.jpg" alt="" aria-hidden="true">
    </div>
  </div>
</section>

<!-- 4-2. 추천 대상 -->
<section class="pjm-sec">
  <div class="pjm-inner">
    <h2 class="pjm-h2">이런 고민을 가진 분들에게<br>추천합니다.</h2>
    <div class="pjm-who">
      <div class="pjm-who-item"><span class="pjm-who-num">1</span><h3>다지점 시스템이 필요한 분</h3><p>여러 지점의 운영 시스템 정비가 필요한 대표님</p></div>
      <div class="pjm-who-item"><span class="pjm-who-num">2</span><h3>객관적 분석이 필요한 분</h3><p>운영 성과에 대한 객관적 분석과 진단이 필요한 분</p></div>
      <div class="pjm-who-item"><span class="pjm-who-num">3</span><h3>매뉴얼이 없는 분</h3><p>사내 업무 매뉴얼이 정비되지 않아 사람마다 결과가 다른 센터</p></div>
      <div class="pjm-who-item"><span class="pjm-who-num">4</span><h3>시작점을 모르는 분</h3><p>어디서부터 어떻게 손대야 할지 막막한 대표님</p></div>
    </div>
  </div>
</section>

<!-- 4-3. 철학 레터 -->
<section class="pjm-sec pjm-sec--alt">
  <div class="pjm-inner">
    <div class="pjm-letter-wrap">
      <div class="pjm-letter-txt">
        <h2>멈춤과 전진 사이,<br>대표님의 가장 든든한 신호등이 되겠습니다.</h2>
        <p>저 역시 운동이 좋아 시작해<br>15년 동안 강사부터 임원까지<br>치열하게 현장을 누볐습니다.<br>뜨거운 열정으로 시작했지만<br>홀로 고군분투하는 대표님들을 볼 때마다<br>늘 마음이 무거웠습니다.</p>
        <p>지금 우리 시장은<br>불확실한 '적신호' 앞에 있습니다.<br>하지만 준비된 토양에는 반드시 싹이 틉니다.<br>저는 단순히 기술만 전하는 사람이 아닌,<br>혼란스러운 '주황불' 아래서<br>대표님이 안전하게 다음 보폭을 내디딜 수 있도록<br>길을 여는 페이스메이커가 되겠습니다.</p>
        <p>15년 현장의 모든 계절을 견뎌낸 압도적 실전 기록입니다.<br>이제 당신의 막막한 적신호를<br>성장의 '초록불'로 바꾸는 명확한 설계자가 되겠습니다.</p>
        <p class="pjm-sign">박 정 민</p>
      </div>
      <img class="pjm-letter-img" src="/consultants/park-jungmin.png" alt="더그로우컴퍼니 박정민 진단 컨설턴트">
    </div>
  </div>
</section>

<!-- 4-4. 프로그램 -->
<section class="pjm-sec">
  <div class="pjm-inner">
    <h2 class="pjm-h2">박정민 컨설턴트의 솔루션:<br><em>적신호를 초록불로</em> 바꾸는 현장 시스템</h2>
    <div class="pjm-prog">
      <div class="pjm-prog-item">
        <div class="pjm-prog-label">프로그램</div>
        <p class="pjm-prog-body">박정민 컨설턴트의 1:1 운영 시스템 밀착 구축</p>
      </div>
      <div class="pjm-prog-item">
        <div class="pjm-prog-label">진단 시간</div>
        <p class="pjm-prog-body">주 1회, 한달 코스로 진행합니다.</p>
      </div>
      <div class="pjm-prog-item">
        <div class="pjm-prog-label">커리큘럼</div>
        <ul class="pjm-prog-list">
          <li><b>[손실 차단]</b> 데이터 정밀 분석을 통한 돈이 새는 구간 및 병목 지점 추출</li>
          <li><b>[역할 정의]</b> 관리자와 실무자의 직무 선 명확화 및 대표 개입 없는 자율 구조 설계</li>
          <li><b>[실무 교정]</b> 시간 낭비인 보고용 회의의 폐기 및 매출을 바꾸는 주간 액션 중심 교정</li>
          <li><b>[자생 구축]</b> 대표 부재 시의 의사결정 체계 검증 및 스스로 돌아가는 자생 환경 완성</li>
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
    var track = root.querySelector('.pjm-mq-track');
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

  marquee('pjmLectureMarquee', 36, false);

  // 언마운트 정리용 전역 정지 훅 (React cleanup 에서 호출 후 no-op 으로 교체)
  window.__pjmMarqueeStop = function(){
    for (var i = 0; i < stops.length; i++){ stops[i](); }
  };
})();
</script>
</div>`;

export default function ParkJungminDiagnosisPage() {
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
  //  전역 정지 훅(__pjmMarqueeStop) 호출로 cancelAnimationFrame 후 no-op 교체(삭제 금지).
  useEffect(() => {
    if (!mounted) return;
    const container = detailRef.current;
    if (!container) return;
    const injected = injectContainer(container);
    return () => {
      injected.forEach((s) => s.remove());
      const w = window as unknown as Record<string, unknown>;
      const stop = w["__pjmMarqueeStop"];
      if (typeof stop === "function") (stop as () => void)();
      w["__pjmMarqueeStop"] = () => {};
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
                alt="박정민 헬스장·필라테스 운영 진단 컨설턴트"
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

      {/* ───────────────── 랜딩 상세 (pjm-) ───────────────── */}
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
      <ConsultantCarousel currentSlug="park-jungmin" />

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
