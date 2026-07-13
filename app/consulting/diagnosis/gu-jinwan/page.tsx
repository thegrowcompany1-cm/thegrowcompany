"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 진단 컨설턴트 상세페이지 — 구진완
//  구조(김승호 최종본과 동일): [상단 인물사진 + 상담폼] → DETAIL_HTML(다크 랜딩)
//   → [하단 상담폼(-bottom id)] → ConsultantCarousel → 추천 카드
//  · 클래스 접두사 gjw- / 전역 정지 훅 __gjwMarqueeStop
//  · mounted 클라이언트 전용 렌더 + suppressHydrationWarning
//  · innerHTML <script> 는 주입 이펙트(injectContainer)가 재생성 append 하여 실행
//  · 현장사진 마퀴는 requestAnimationFrame + cancelAnimationFrame 정리
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ConsultantCarousel from "@/components/ConsultantCarousel";

// 좌측 메인 이미지 (public 기준)
const MAIN_IMAGE = "/consultants/gu-jinwan.png";

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
          <input type="radio" name="consultant" value="허준영" class="consultant-radio">
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
  // DOMContentLoaded 대신 즉시 실행하고, data-gjw-init 로 재실행 시 중복 바인딩을 막는다.
  function initForm(wrapper){
    if (!wrapper || wrapper.getAttribute('data-gjw-init')) return;
    wrapper.setAttribute('data-gjw-init', '1');

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

// ─── 황봉남 진단 랜딩 상세 HTML (gjw- 접두사, eyebrow 없음) ────────────────────
// 현장사진 마퀴 <script> 포함. detailRef 주입 이펙트가 script 재실행 + rAF 정리.
// 인증사진 마퀴 11장(각 2회씩 = 22개 img) + 카톡 후기 가로 스크롤 스트립 10장.
const DETAIL_HTML = `<div class="gjw">
<style>
.gjw{--g:#22B573;--bg:#0A0A0A;--bg2:#0d0d0d;--cream:#FBF8EC;--ink:#141414;--mark:#b6f2c9;background:var(--bg);color:#fff;font-family:'Pretendard',-apple-system,BlinkMacSystemFont,system-ui,'Apple SD Gothic Neo',sans-serif;line-height:1.8;letter-spacing:-0.01em;overflow:hidden}
.gjw *{box-sizing:border-box}
.gjw-inner{max-width:760px;margin:0 auto;padding:0 20px}
.gjw-sec{padding:96px 0}
.gjw-sec--alt{background:var(--bg2)}
.gjw-h2{font-size:29px;font-weight:800;text-align:center;line-height:1.5;margin:0 0 22px}
.gjw-h2 em{font-style:normal;color:var(--g)}
.gjw-lead{font-size:17px;color:#c9c9c9;text-align:center;margin:0 0 16px;line-height:1.85}
.gjw-lead strong{color:#fff;font-weight:700}
.gjw-lead em{font-style:normal;color:var(--g);font-weight:700}
.gjw-vline{display:block;width:2px;height:56px;background:var(--g);margin:36px auto}
.gjw-accent{font-size:19px;font-weight:800;color:#fff;text-align:center;margin:0;line-height:1.6}
.gjw-accent em{font-style:normal;color:var(--g)}
@media(max-width:640px){.gjw-h2{font-size:23px}.gjw-lead{font-size:15px}.gjw-sec{padding:76px 0}}

.gjw-points{display:flex;flex-direction:column;gap:18px;max-width:600px;margin:36px auto 0}
.gjw-point{background:#141414;border:1px solid #232323;border-left:3px solid var(--g);border-radius:14px;padding:24px}
.gjw-point h3{margin:0 0 8px;font-size:18px;font-weight:800;color:#fff}
.gjw-point p{margin:0;font-size:15px;color:#bdbdbd;line-height:1.75}
.gjw-note{margin:40px auto 0;max-width:600px;text-align:center;font-size:16px;color:#e6e6e6;line-height:1.85}
.gjw-note em{font-style:normal;color:var(--g);font-weight:700}

.gjw-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;max-width:680px;margin:40px auto 0}
.gjw-card{background:var(--cream);color:var(--ink);border-radius:18px;padding:28px 24px}
.gjw-card h4{margin:0 0 4px;font-size:12px;font-weight:700;color:#5a7d64;letter-spacing:.04em}
.gjw-card h3{margin:0 0 12px;font-size:19px;font-weight:800}
.gjw-card p{margin:0;font-size:14px;line-height:1.8;color:#333}
.gjw-card mark{background:var(--mark);color:var(--ink);padding:1px 4px;border-radius:4px;font-weight:600}
@media(max-width:640px){.gjw-grid{grid-template-columns:1fr}}

.gjw-trust{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#232323;border:1px solid #232323;border-radius:16px;overflow:hidden;max-width:680px;margin:24px auto 0}
.gjw-trust div{background:#111;padding:22px 14px;text-align:center;font-size:14px;font-weight:600;color:#eaeaea;line-height:1.6}
.gjw-trust b{color:var(--g);font-weight:800}
@media(max-width:640px){.gjw-trust{grid-template-columns:1fr}}

.gjw-mq{overflow:hidden;width:100%;max-width:100%;margin-top:14px;-webkit-user-select:none;user-select:none}
.gjw-mq-track{display:flex;width:max-content;gap:14px;will-change:transform}
.gjw-mq-track img{height:280px;width:auto;display:block;border-radius:16px;background:#1a1a1a;flex:0 0 auto}

.gjw-strip{display:flex;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;align-items:flex-start;padding:10px 20px 20px;margin-top:14px;-webkit-overflow-scrolling:touch}
.gjw-strip img{flex:0 0 360px;width:360px;height:auto;scroll-snap-align:start;border-radius:16px;background:#1a1a1a;display:block}
@media(max-width:640px){.gjw-strip img{flex:0 0 320px;width:320px}}

.gjw-who{display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:680px;margin:40px auto 0}
.gjw-who-item{background:#141414;border:1px solid #232323;border-radius:16px;padding:26px 22px}
.gjw-who-num{display:block;font-size:34px;font-weight:800;color:var(--g);line-height:1;margin-bottom:12px}
.gjw-who-item h3{margin:0 0 8px;font-size:16px;font-weight:800;color:#fff}
.gjw-who-item p{margin:0;font-size:14px;color:#bdbdbd;line-height:1.7}
@media(max-width:640px){.gjw-who{grid-template-columns:1fr}}

.gjw-letter-wrap{display:flex;gap:40px;align-items:center;max-width:760px;margin:0 auto}
.gjw-letter-txt{flex:1;min-width:0}
.gjw-letter-txt h2{font-size:25px;font-weight:800;color:var(--g);line-height:1.5;margin:0 0 24px}
.gjw-letter-txt p{font-size:16px;color:#dcdcdc;line-height:1.95;margin:0 0 24px}
.gjw-sign{font-size:22px;font-weight:800;color:#fff;letter-spacing:.35em;margin:0}
.gjw-letter-img{flex:0 0 280px;width:280px;aspect-ratio:3/4;object-fit:cover;border-radius:18px;filter:grayscale(1);background:#1a1a1a}
@media(max-width:760px){.gjw-letter-wrap{flex-direction:column}.gjw-letter-img{width:100%;max-width:340px}}
@media(max-width:640px){.gjw-letter-txt h2{font-size:22px}}

.gjw-prog{max-width:600px;margin:36px auto 0}
.gjw-prog-item{padding:26px 0;border-top:1px solid #222}
.gjw-prog-item:first-child{border-top:0}
.gjw-prog-label{font-size:12px;font-weight:800;letter-spacing:.06em;color:var(--g);margin-bottom:8px}
.gjw-prog-body{font-size:16px;color:#eaeaea;line-height:1.7;margin:0}
.gjw-prog-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:12px}
.gjw-prog-list li{font-size:15px;color:#d8d8d8;line-height:1.7}
.gjw-prog-list li b{color:#fff;font-weight:800;margin-right:4px}
</style>

<style>
.gjw-trust{grid-template-columns:repeat(2,1fr)}
.gjw-who-full{grid-column:1 / -1}
.gjw-price{padding-top:24px;border-top:1px solid #222;text-align:right;font-size:26px;font-weight:800;color:var(--g)}
@media(max-width:640px){.gjw-trust{grid-template-columns:1fr}.gjw-price{font-size:22px;text-align:center}}
</style>

<!-- 1. 공감 -->
<section class="gjw-sec">
  <div class="gjw-inner">
    <h2 class="gjw-h2">54개 지점, 600억 매출.<br>도전하고 성공하고 실패한 사람의<br><em>'진짜'</em> 위로와 해답.</h2>
    <p class="gjw-lead">GOTO, 새마을 피트니스.<br>대한민국 피트니스의 표준을 만들었던 이름입니다.</p>
    <p class="gjw-lead">그 모든 과정을 직접 짊어졌기에<br>결정 앞에 홀로 선 대표님의 무게를 압니다.</p>
    <span class="gjw-vline"></span>
    <p class="gjw-accent"><em>제가 겪은 수백 억의 오답이,<br>당신에겐 가장 확실한 정답이 됩니다.</em></p>
  </div>
</section>

<!-- 2. 문제 -->
<section class="gjw-sec gjw-sec--alt">
  <div class="gjw-inner">
    <h2 class="gjw-h2">결정 앞에서 멈춰 서게 만드는 건<br>실력이 아니라 <em>'불확실성'</em>입니다.</h2>
    <div class="gjw-points">
      <div class="gjw-point">
        <h3>불확실성의 공포</h3>
        <p>전진하지 못하는 진짜 이유는 실력이 없어서가 아니라, 제대로 하고 있다는 확신이 없기 때문입니다.</p>
      </div>
      <div class="gjw-point">
        <h3>미뤄지는 결정</h3>
        <p>지금 결정을 미루고 있다면, 그것은 대표님이 게을러서가 아닙니다. 기준이 없기 때문입니다.</p>
      </div>
      <div class="gjw-point">
        <h3>제자리에 서게 하는 겁</h3>
        <p>불확실성은 겁을 낳고, 그 겁은 당신을 제자리에 멈춰 서게 만듭니다.</p>
      </div>
    </div>
    <p class="gjw-note">수학문제를 보듯,<br><em>정답은 모를 수 있어도 무엇이 문제인지는 정확히 압니다.</em></p>
  </div>
</section>

<!-- 3. 해결 -->
<section class="gjw-sec">
  <div class="gjw-inner">
    <h2 class="gjw-h2">오답을 지우면,<br><em>정답이 남습니다.</em></h2>
    <div class="gjw-grid">
      <div class="gjw-card">
        <h4>(Mindset)</h4><h3>불안의 재해석</h3>
        <p>불안이 없으면 나태해집니다. 당신이 느끼는 그 '겁'을 <mark>전진하기 위한 가장 본능적인 에너지로 재설계</mark>해 드립니다.</p>
      </div>
      <div class="gjw-card">
        <h4>(Decision)</h4><h3>우선순위의 확립</h3>
        <p>지금 당장 <mark>해야 할 일과 하지 말아야 할 일을 정해</mark>드립니다. 결정 장애는 미루는 것이 아니라, 기준이 없기 때문입니다.</p>
      </div>
      <div class="gjw-card">
        <h4>(Audit)</h4><h3>자만과 오만의 경계</h3>
        <p>내 회사의 위협 5가지를 모르면 자만입니다. <mark>조직 내 숨겨진 위협을 직시하고 안주하는 메커니즘을 깨뜨립니다.</mark></p>
      </div>
      <div class="gjw-card">
        <h4>(Recovery)</h4><h3>휴식과 회복의 권리</h3>
        <p>죄책감 때문에 쉬지 못하는 대표님들을 위해, 직위를 잠시 내려놓고 <mark>다시 전진할 힘을 얻는 '회복의 공간'</mark>이 되어드립니다.</p>
      </div>
    </div>
    <div class="gjw-trust">
      <div><b>운영</b><br>새마을/GOTO 피트니스 전 지점 총괄 운영</div>
      <div><b>성장</b><br>전국 54개 지점 확장 및 매출 600억 달성</div>
      <div><b>자본</b><br>250억 투자 유치를 이끌어낸 경영 노하우</div>
      <div><b>조직</b><br>500명 규모의 조직 관리와 실전 지표 보유</div>
    </div>
  </div>
</section>

<!-- 4-1. 카톡 후기 (손으로 넘기는 가로 스크롤 스트립) -->
<section class="gjw-sec gjw-sec--alt">
  <div class="gjw-inner">
    <h2 class="gjw-h2">현장에서 도착한<br><em>진짜 메시지</em>들입니다.</h2>
  </div>
  <div class="gjw-strip">
    <img src="https://cdn.imweb.me/thumbnail/20260219/499f15574e611.jpg" alt="구진완 컨설턴트 카톡 후기 1">
    <img src="https://cdn.imweb.me/thumbnail/20260219/86da1e1f996da.png" alt="구진완 컨설턴트 카톡 후기 2">
    <img src="https://cdn.imweb.me/thumbnail/20260219/4053262a9069e.jpg" alt="구진완 컨설턴트 카톡 후기 3">
    <img src="https://cdn.imweb.me/thumbnail/20260305/29db790b59c4f.jpg" alt="구진완 컨설턴트 카톡 후기 4">
    <img src="https://cdn.imweb.me/thumbnail/20260305/f871ed09cc67e.jpg" alt="구진완 컨설턴트 카톡 후기 5">
    <img src="https://cdn.imweb.me/thumbnail/20260306/7bd8e5cc0bedd.jpg" alt="구진완 컨설턴트 카톡 후기 6">
    <img src="https://cdn.imweb.me/thumbnail/20260306/f6533b0fc9f8b.jpg" alt="구진완 컨설턴트 카톡 후기 7">
    <img src="https://cdn.imweb.me/thumbnail/20260306/d603444f0c8c8.png" alt="구진완 컨설턴트 카톡 후기 8">
    <img src="https://cdn.imweb.me/thumbnail/20260306/29afb387277f8.jpg" alt="구진완 컨설턴트 카톡 후기 9">
    <img src="https://cdn.imweb.me/thumbnail/20260306/0cd8a1f2ed12c.png" alt="구진완 컨설턴트 카톡 후기 10">
  </div>
</section>

<!-- 4-2. 인증사진 마퀴 -->
<section class="gjw-sec">
  <div class="gjw-inner">
    <h2 class="gjw-h2">함께한 대표님들이<br><em>증명</em>합니다.</h2>
  </div>
  <div class="gjw-mq" id="gjwLectureMarquee">
    <div class="gjw-mq-track">
      <img src="https://cdn.imweb.me/thumbnail/20260128/52a13480199df.jpg" alt="구진완 컨설턴트 인증사진 1">
      <img src="https://cdn.imweb.me/thumbnail/20260128/ff209d8ca7a9b.jpg" alt="구진완 컨설턴트 인증사진 2">
      <img src="https://cdn.imweb.me/thumbnail/20260128/3eed6529afda6.jpg" alt="구진완 컨설턴트 인증사진 3">
      <img src="https://cdn.imweb.me/thumbnail/20260128/71a22de08b880.jpg" alt="구진완 컨설턴트 인증사진 4">
      <img src="https://cdn.imweb.me/thumbnail/20260128/8ee3f4ec9659c.jpg" alt="구진완 컨설턴트 인증사진 5">
      <img src="https://cdn.imweb.me/thumbnail/20260128/e90d64c3f8402.jpg" alt="구진완 컨설턴트 인증사진 6">
      <img src="https://cdn.imweb.me/thumbnail/20260128/3fce2398d905f.jpg" alt="구진완 컨설턴트 인증사진 7">
      <img src="https://cdn.imweb.me/thumbnail/20260128/f3b82bac654b5.jpg" alt="구진완 컨설턴트 인증사진 8">
      <img src="https://cdn.imweb.me/thumbnail/20260128/3fa992edaac11.jpg" alt="구진완 컨설턴트 인증사진 9">
      <img src="https://cdn.imweb.me/thumbnail/20260128/bb03b9f3e5239.jpg" alt="구진완 컨설턴트 인증사진 10">
      <img src="https://cdn.imweb.me/thumbnail/20260128/e04d0f740d180.jpg" alt="구진완 컨설턴트 인증사진 11">
      <img src="https://cdn.imweb.me/thumbnail/20260128/52a13480199df.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260128/ff209d8ca7a9b.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260128/3eed6529afda6.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260128/71a22de08b880.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260128/8ee3f4ec9659c.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260128/e90d64c3f8402.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260128/3fce2398d905f.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260128/f3b82bac654b5.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260128/3fa992edaac11.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260128/bb03b9f3e5239.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20260128/e04d0f740d180.jpg" alt="" aria-hidden="true">
    </div>
  </div>
</section>

<!-- 4-3. 추천 대상 -->
<section class="gjw-sec gjw-sec--alt">
  <div class="gjw-inner">
    <h2 class="gjw-h2">이런 분들에게<br>추천합니다.</h2>
    <div class="gjw-who">
      <div class="gjw-who-item"><span class="gjw-who-num">1</span><h3>확신이 없어 공허한 분</h3><p>매출은 성장했으나 확신이 없어 마음이 공허한 대표님</p></div>
      <div class="gjw-who-item"><span class="gjw-who-num">2</span><h3>결정이 두려운 분</h3><p>결정의 무게와 오답에 대한 공포로 밤잠 설치는 경영자</p></div>
      <div class="gjw-who-item"><span class="gjw-who-num">3</span><h3>번아웃 경계에 선 리더</h3><p>죄책감 없는 휴식을 잊은 채 번아웃 경계에 선 리더</p></div>
      <div class="gjw-who-item"><span class="gjw-who-num">4</span><h3>사람에 상처받은 분</h3><p>사람에 상처받고 조직 관리의 본질을 놓치고 계신 분</p></div>
      <div class="gjw-who-item gjw-who-full"><span class="gjw-who-num">5</span><h3>실전 해답이 필요한 분</h3><p>이론이 아닌 600억 현장의 날카로운 실전 해답이 필요한 분</p></div>
    </div>
  </div>
</section>

<!-- 4-4. 철학 레터 -->
<section class="gjw-sec">
  <div class="gjw-inner">
    <div class="gjw-letter-wrap">
      <div class="gjw-letter-txt">
        <h2>화려한 성공보다 값진,<br>나의 '실패' 기록</h2>
        <p>600억 매출, 54개 지점, 250억 투자.<br>나의 도전은 한때 성공으로 포장된 적도 있었지만<br>결국에는 실패로 마무리 되었습니다.<br>실패를 복기하며 새로운 나를 만들었습니다.<br>실패가 나의 황금열쇠였습니다.</p>
        <p>대표가 쉬면서도 불안한 이유,<br>그건 '불확실성'이라는 겁 때문입니다.<br>하지만 불안은 전진을 멈추지 않게 하는 힘입니다.<br>문제가 있다면,<br>오답을 마주할 여유가 없는 것입니다.</p>
        <p>내 회사를 위협하는 5가지를 모른다면<br>안정이 아니라 자만입니다.<br>실패를 겪고 알게 되었습니다.<br>해야 할 일과, 하지 말아야 할 일,<br>그리고 모든 과정에는 먼저가 있다는 것을.</p>
        <p>단순한 컨설턴트가 아닌,<br>힘들 때 돌아와 회복을 선물하는<br>피트니스 업계의 멘토가 되겠습니다.</p>
        <p class="gjw-sign">구 진 완</p>
      </div>
      <img class="gjw-letter-img" src="/consultants/gu-jinwan.png" alt="더그로우컴퍼니 구진완 진단 컨설턴트">
    </div>
  </div>
</section>

<!-- 4-5. 프로그램 (유료 진단) -->
<section class="gjw-sec gjw-sec--alt">
  <div class="gjw-inner">
    <h2 class="gjw-h2">구진완 컨설턴트의 통찰:<br><em>비즈니스 오답 지우기</em> 60분</h2>
    <div class="gjw-prog">
      <div class="gjw-prog-item">
        <div class="gjw-prog-label">프로그램</div>
        <p class="gjw-prog-body">구진완 컨설턴트의 1:1 비즈니스 밀착 진단</p>
      </div>
      <div class="gjw-prog-item">
        <div class="gjw-prog-label">소요시간</div>
        <p class="gjw-prog-body">60분 (대면 / 화상 선택 가능)</p>
      </div>
      <div class="gjw-prog-item">
        <div class="gjw-prog-label">커리큘럼</div>
        <ul class="gjw-prog-list">
          <li><b>[성공 로직]</b> 54개 지점, 600억 매출을 만든 시스템 분석</li>
          <li><b>[모델 진단]</b> 250억 투자 유치를 이끌어낸 비즈니스 모델 점검</li>
          <li><b>[오답 제거]</b> 새마을·고투 피트니스 운영 전 과정의 실전 데이터 공유</li>
          <li><b>[즉시 처방]</b> 현재 대표님 사업의 병목 구간(꽉 막힌 곳) 판별</li>
        </ul>
      </div>
      <div class="gjw-price">150,000원</div>
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
    var track = root.querySelector('.gjw-mq-track');
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

  marquee('gjwLectureMarquee', 36, false);

  // 언마운트 정리용 전역 정지 훅 (React cleanup 에서 호출 후 no-op 으로 교체)
  window.__gjwMarqueeStop = function(){
    for (var i = 0; i < stops.length; i++){ stops[i](); }
  };
})();
</script>
</div>`;

export default function GuJinwanDiagnosisPage() {
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
  //  전역 정지 훅(__gjwMarqueeStop) 호출로 cancelAnimationFrame 후 no-op 교체(삭제 금지).
  useEffect(() => {
    if (!mounted) return;
    const container = detailRef.current;
    if (!container) return;
    const injected = injectContainer(container);
    return () => {
      injected.forEach((s) => s.remove());
      const w = window as unknown as Record<string, unknown>;
      const stop = w["__gjwMarqueeStop"];
      if (typeof stop === "function") (stop as () => void)();
      w["__gjwMarqueeStop"] = () => {};
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
                alt="구진완 헬스장·필라테스 운영 진단 컨설턴트"
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

      {/* ───────────────── 랜딩 상세 (gjw-) ───────────────── */}
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
          지금, 진단으로 시작합니다.
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
      <ConsultantCarousel currentSlug="gu-jinwan" />

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
