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
    <h2>마케팅 상담 신청(무료)</h2>
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
      <label class="form-label">원하시는 방식을 선택해주세요. <span class="required">*</span></label>
      <div class="checkbox-group">
        <label class="checkbox-label">
          <input type="radio" name="consultField" value="1:1 마케팅 컨설팅(직접 배우기)" class="consultField-checkbox">
          <span class="checkbox-text">1:1 마케팅 컨설팅(직접 배우기)</span>
        </label>
        <label class="checkbox-label">
          <input type="radio" name="consultField" value="마케팅 대행(맡기기)" class="consultField-checkbox">
          <span class="checkbox-text">마케팅 대행(맡기기)</span>
        </label>
        <label class="checkbox-label">
          <input type="radio" name="consultField" value="상담 후 결정" class="consultField-checkbox">
          <span class="checkbox-text">상담 후 결정</span>
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
      if (selectedConsultField.length === 0){ alert('원하시는 방식을 선택해주세요.'); return; }
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
        alert('마케팅 상담 신청이 정상적으로 접수되었습니다.\\n빠른 시일 내에 연락드리겠습니다.');
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
// 카톡 스트립 6장 + 상위노출 마퀴 4장(x2) + 강의 마퀴 6장(x2, 역방향).
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
.hjy-trust{grid-template-columns:repeat(2,1fr)}
.hjy-prelead{margin:0 auto 20px;max-width:600px}

.hjy-checks{max-width:640px;margin:36px auto 0;display:flex;flex-direction:column;gap:12px}
.hjy-check{display:flex;align-items:center;gap:14px;background:#141414;border:1px solid #262626;border-radius:14px;padding:18px 20px;cursor:pointer;transition:border-color .2s}
.hjy-check:hover{border-color:var(--g)}
.hjy-check input{width:22px;height:22px;flex:0 0 auto;accent-color:var(--g);cursor:pointer;margin:0}
.hjy-check span{font-size:15px;color:#dcdcdc;line-height:1.5}

.hjy-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;max-width:900px;margin:14px auto 0}
.hjy-step{background:#111;border:1px solid #232323;border-radius:18px;padding:28px 24px;text-align:left}
.hjy-step-num{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:var(--g);color:#04240f;font-weight:800;font-size:18px;margin-bottom:16px}
.hjy-step h3{font-size:18px;font-weight:800;color:#fff;margin:0}
.hjy-step-sub{font-size:13px;color:var(--g);font-weight:700;margin:6px 0 16px}
.hjy-step ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px}
.hjy-step li{position:relative;padding-left:18px;font-size:14px;color:#bdbdbd;line-height:1.55}
.hjy-step li::before{content:'';position:absolute;left:0;top:8px;width:6px;height:6px;border-radius:50%;background:var(--g)}
@media(max-width:640px){.hjy-steps{grid-template-columns:1fr}}

.hjy-cmp{display:grid;grid-template-columns:1fr 1fr;gap:18px;max-width:820px;margin:14px auto 0}
.hjy-cmp-card{background:#111;border:1px solid #232323;border-radius:18px;padding:30px 26px}
.hjy-cmp-card--good{border:2px solid var(--g);background:linear-gradient(180deg,rgba(34,181,115,0.07),#111)}
.hjy-cmp-tag{font-size:13px;color:#9a9a9a;font-weight:700}
.hjy-cmp-card--good .hjy-cmp-tag{color:var(--g)}
.hjy-cmp-title{font-size:19px;font-weight:800;color:#fff;margin:6px 0 20px;line-height:1.35}
.hjy-cmp ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:12px}
.hjy-cmp li{position:relative;padding-left:22px;font-size:14px;color:#c4c4c4;line-height:1.55}
.hjy-cmp li::before{content:'✕';position:absolute;left:0;top:0;color:#666;font-weight:700;font-size:12px}
.hjy-cmp-card--good li::before{content:'✓';color:var(--g);font-weight:800}
.hjy-cmp-note{margin-top:18px;font-size:12px;color:#7f7f7f;line-height:1.7;border-top:1px solid #232323;padding-top:14px}
@media(max-width:640px){.hjy-cmp{grid-template-columns:1fr}}

.hjy-stats{display:flex;justify-content:center;gap:36px;flex-wrap:wrap;margin:26px auto 4px}
.hjy-stat{text-align:center}
.hjy-stat b{display:block;font-size:34px;font-weight:800;color:var(--g);line-height:1}
.hjy-stat span{display:block;margin-top:8px;font-size:13px;color:#a8a8a8}
@media(max-width:640px){.hjy-stats{gap:22px}.hjy-stat b{font-size:26px}}

.hjy-tl{max-width:640px;margin:40px auto 0;position:relative;padding-left:34px}
.hjy-tl::before{content:'';position:absolute;left:9px;top:6px;bottom:6px;width:2px;background:linear-gradient(180deg,var(--g),rgba(34,181,115,0.15))}
.hjy-tl-item{position:relative;padding-bottom:30px}
.hjy-tl-item:last-child{padding-bottom:0}
.hjy-tl-item::before{content:'';position:absolute;left:-33px;top:3px;width:20px;height:20px;border-radius:50%;background:#0a0a0a;border:3px solid var(--g)}
.hjy-tl-wk{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px}
.hjy-tl-num{font-size:16px;font-weight:800;color:#fff}
.hjy-tl-badge{font-size:11px;font-weight:700;color:var(--g);border:1px solid var(--g);border-radius:50px;padding:2px 11px}
.hjy-tl-title{font-size:16px;font-weight:800;color:#eee;margin:0 0 6px}
.hjy-tl-desc{font-size:14px;color:#a8a8a8;line-height:1.65;margin:0}
@media(max-width:640px){.hjy-trust{grid-template-columns:1fr}}
</style>

<!-- 1. 공감 -->
<section class="hjy-sec">
  <div class="hjy-inner">
    <h2 class="hjy-h2">신규 고객, 광고부터 등록까지<br><em>이어지게</em> 만듭니다.</h2>
    <p class="hjy-lead">광고비는 쓰는데 신규 문의는 들쭉날쭉.<br>문의는 오는데 등록까지 이어지지 않는다면,</p>
    <p class="hjy-lead">문제는 광고가 아니라<br><strong>광고 이후의 구조</strong>입니다.</p>
    <span class="hjy-vline"></span>
    <p class="hjy-accent"><em>신규 유입은 광고에서,<br>등록은 구조에서 결정됩니다.</em></p>
  </div>
</section>

<!-- 2. 권위 증명 -->
<section class="hjy-sec hjy-sec--alt">
  <div class="hjy-inner">
    <p class="hjy-lead hjy-prelead">더그로우컴퍼니 마케팅 총괄,<br><em>숫자로 먼저 증명합니다.</em></p>
    <div class="hjy-trust">
      <div><b>10억</b><br>메타광고 누적 광고액</div>
      <div><b>110개+</b><br>그로우 마케팅 운영</div>
      <div><b>1급</b><br>검색광고마케터 (네이버·구글·카카오)</div>
      <div><b>800명</b><br>그로우 에듀 누적 수강생</div>
    </div>
  </div>
</section>

<!-- 3. 문제 (체크리스트) -->
<section class="hjy-sec">
  <div class="hjy-inner">
    <h2 class="hjy-h2">이 중 몇 개가<br>해당되는지 세어보세요.</h2>
    <div class="hjy-checks">
      <label class="hjy-check"><input type="checkbox"><span>광고는 돌리는데 신규 문의가 일정하지 않다</span></label>
      <label class="hjy-check"><input type="checkbox"><span>문의는 오지만 등록까지 이어지는 비율이 낮다</span></label>
      <label class="hjy-check"><input type="checkbox"><span>경쟁 센터보다 광고를 해도 신규 유입이 밀린다</span></label>
      <label class="hjy-check"><input type="checkbox"><span>광고 소재·문구가 계속 비슷하다</span></label>
      <label class="hjy-check"><input type="checkbox"><span>신규 회원 유입이 특정 채널에만 의존돼 있다</span></label>
    </div>
    <p class="hjy-note"><em>두 개 이상 해당된다면,<br>광고가 아니라 구조를 점검할 때입니다.</em></p>
  </div>
</section>

<!-- 4. 해결 (3단계 유입 구조) -->
<section class="hjy-sec hjy-sec--alt">
  <div class="hjy-inner">
    <h2 class="hjy-h2">우리가 보는<br><em>신규 유입 구조</em></h2>
    <p class="hjy-lead">광고부터 등록까지, 끊기지 않는 흐름을 만듭니다.</p>
  </div>
  <div class="hjy-inner">
    <div class="hjy-steps">
      <div class="hjy-step">
        <span class="hjy-step-num">1</span>
        <h3>광고</h3>
        <p class="hjy-step-sub">신규 고객을 데려옵니다</p>
        <ul>
          <li>지역·업종·관심사에 맞는 광고 집행</li>
          <li>문의 가능성 있는 고객만 타겟팅</li>
          <li>무작위 노출 배제</li>
        </ul>
      </div>
      <div class="hjy-step">
        <span class="hjy-step-num">2</span>
        <h3>유입 과정</h3>
        <p class="hjy-step-sub">기대감을 만듭니다</p>
        <ul>
          <li>클릭을 부르는 광고 문구</li>
          <li>신뢰를 주는 랜딩 페이지</li>
          <li>플레이스·SNS 연결 흐름</li>
        </ul>
      </div>
      <div class="hjy-step">
        <span class="hjy-step-num">3</span>
        <h3>문의 → 등록</h3>
        <p class="hjy-step-sub">선택을 쉽게 만듭니다</p>
        <ul>
          <li>명확한 문의 버튼</li>
          <li>첫 화면 메시지 설계</li>
          <li>등록까지의 자연스러운 동선</li>
        </ul>
      </div>
    </div>
    <p class="hjy-note"><em>관심 → 문의 → 등록이 끊기지 않게 연결하는 것,</em><br>그것이 마케팅의 역할입니다.</p>
  </div>
</section>

<!-- 5. 차별점 (비교 2카드) -->
<section class="hjy-sec">
  <div class="hjy-inner">
    <h2 class="hjy-h2">그로우 마케팅이<br><em>다른 이유</em></h2>
  </div>
  <div class="hjy-inner">
    <div class="hjy-cmp">
      <div class="hjy-cmp-card">
        <div class="hjy-cmp-tag">많은 대행사</div>
        <div class="hjy-cmp-title">광고만 집행합니다</div>
        <ul>
          <li>광고 세팅 후 방치</li>
          <li>클릭 수, 노출 수만 보고</li>
          <li>문의·등록은 센터 몫</li>
          <li>성과 없으면 광고비 탓</li>
        </ul>
      </div>
      <div class="hjy-cmp-card hjy-cmp-card--good">
        <div class="hjy-cmp-tag">그로우 마케팅</div>
        <div class="hjy-cmp-title">등록까지 책임집니다</div>
        <ul>
          <li>신규 유입 기준으로 광고 설계</li>
          <li>문의가 잘 발생하는 구조로 유입</li>
          <li>등록까지 이어지는 흐름 구축</li>
          <li>데이터 기반 지속 개선</li>
        </ul>
      </div>
    </div>
    <p class="hjy-note"><em>신규 고객이 '들어오는 것'이 아니라 '등록되는 것'</em>까지가 기준입니다.</p>
  </div>
</section>

<!-- 6-1. 카톡 후기 스트립 -->
<section class="hjy-sec hjy-sec--alt">
  <div class="hjy-inner">
    <h2 class="hjy-h2">실제 대표님들의 후기</h2>
    <p class="hjy-lead">함께한 센터들의 실제 카카오톡 대화입니다.</p>
  </div>
  <div class="hjy-strip">
    <img src="https://cdn.imweb.me/thumbnail/20250728/ceddd35ebfc47.png" alt="허준영 컨설턴트 카톡 후기 1">
    <img src="https://cdn.imweb.me/thumbnail/20250728/d5ef8194aae01.png" alt="허준영 컨설턴트 카톡 후기 2">
    <img src="https://cdn.imweb.me/thumbnail/20250728/f1c64153b5faf.png" alt="허준영 컨설턴트 카톡 후기 3">
    <img src="https://cdn.imweb.me/thumbnail/20250728/3a275f9fb2f61.png" alt="허준영 컨설턴트 카톡 후기 4">
    <img src="https://cdn.imweb.me/thumbnail/20250728/77e4db3112261.png" alt="허준영 컨설턴트 카톡 후기 5">
    <img src="https://cdn.imweb.me/thumbnail/20250728/07fd3d27b83d7.png" alt="허준영 컨설턴트 카톡 후기 6">
  </div>
</section>

<!-- 6-2. 상위노출 사례 마퀴 -->
<section class="hjy-sec">
  <div class="hjy-inner">
    <h2 class="hjy-h2">상위노출 <em>실제 사례</em></h2>
    <p class="hjy-lead">지역 키워드 검색 시 상위 노출된 결과입니다.</p>
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

<!-- 6-3. 강의 사진 마퀴 (역방향) -->
<section class="hjy-sec hjy-sec--alt">
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

<!-- 7. 선택 분기 (2카드) -->
<section class="hjy-sec">
  <div class="hjy-inner">
    <h2 class="hjy-h2">대행과 컨설팅,<br>지금 상황에 맞는 <em>선택이 다릅니다.</em></h2>
  </div>
  <div class="hjy-inner">
    <div class="hjy-cmp">
      <div class="hjy-cmp-card">
        <div class="hjy-cmp-tag">전문가에게 맡기고 싶은 분</div>
        <div class="hjy-cmp-title">마케팅 대행</div>
        <ul>
          <li>마케팅에 쓸 시간이 없으신 분</li>
          <li>전문가에게 완전히 맡기고 싶은 분</li>
          <li>직접 배우기보다 결과만 원하는 분</li>
          <li>마케팅 담당 직원이 없는 센터</li>
        </ul>
        <p class="hjy-cmp-note">모두 신청하신다고 해서 모든 업체를 진행해드릴 순 없습니다. 지역·업종별로 TO를 제한하고 있으며, 분석 후 효과가 나올 것이라는 확신이 생기면 그때 진행합니다.</p>
      </div>
      <div class="hjy-cmp-card hjy-cmp-card--good">
        <div class="hjy-cmp-tag">직접 하고 싶은 분</div>
        <div class="hjy-cmp-title">1:1 마케팅 컨설팅</div>
        <ul>
          <li>마케팅을 직접 배워서 하고 싶은 분</li>
          <li>내부 직원에게 마케팅을 맡기고 싶은 분</li>
          <li>장기적으로 마케팅 역량을 키우고 싶은 분</li>
          <li>비용을 줄이면서 성과를 내고 싶은 분</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- 8. 컨설팅 진행 방식 (4주 타임라인) -->
<section class="hjy-sec hjy-sec--alt">
  <div class="hjy-inner">
    <h2 class="hjy-h2">한 달 동안<br><em>이렇게 진행됩니다.</em></h2>
    <div class="hjy-tl">
      <div class="hjy-tl-item">
        <div class="hjy-tl-wk"><span class="hjy-tl-num">1주차</span><span class="hjy-tl-badge">방문</span></div>
        <p class="hjy-tl-title">현황 분석 &amp; 전략 수립</p>
        <p class="hjy-tl-desc">센터에 직접 방문해 현황과 상권을 분석하고 맞춤형 마케팅 전략을 함께 세웁니다.</p>
      </div>
      <div class="hjy-tl-item">
        <div class="hjy-tl-wk"><span class="hjy-tl-num">2주차</span><span class="hjy-tl-badge">줌 미팅</span></div>
        <p class="hjy-tl-title">플랫폼 세팅 교육</p>
        <p class="hjy-tl-desc">네이버 플레이스, 블로그, 광고 계정 등 마케팅 채널을 직접 세팅합니다.</p>
      </div>
      <div class="hjy-tl-item">
        <div class="hjy-tl-wk"><span class="hjy-tl-num">3주차</span><span class="hjy-tl-badge">방문</span></div>
        <p class="hjy-tl-title">실전 운영 교육</p>
        <p class="hjy-tl-desc">광고 집행, 콘텐츠 제작, 글쓰기 등 실제로 직접 해보며 배웁니다.</p>
      </div>
      <div class="hjy-tl-item">
        <div class="hjy-tl-wk"><span class="hjy-tl-num">4주차</span><span class="hjy-tl-badge">줌 미팅</span></div>
        <p class="hjy-tl-title">성과 점검 &amp; 자립 설계</p>
        <p class="hjy-tl-desc">한 달의 성과를 함께 점검하고, 이후 혼자서도 운영할 수 있는 체계를 완성합니다.</p>
      </div>
    </div>
    <p class="hjy-note"><em>한 달이 지나면, 마케팅을 직접 운영할 수 있는 실력을 갖추게 됩니다.</em></p>
  </div>
</section>

<!-- 9. 철학 레터 -->
<section class="hjy-sec">
  <div class="hjy-inner">
    <div class="hjy-letter-wrap">
      <div class="hjy-letter-txt">
        <h2>광고비가 아니라,<br>구조에 답이 있습니다.</h2>
        <p>110개가 넘는 센터의 마케팅을 운영하며<br>한 가지 확신이 생겼습니다.<br>성과가 나지 않는 센터의 문제는<br>광고비가 아니라 구조였습니다.</p>
        <p>같은 광고비로도<br>어떤 센터는 문의가 쌓이고<br>어떤 센터는 클릭만 쌓입니다.<br>그 차이를 만드는 것이 제 일입니다.</p>
        <p>맡기셔도 좋고, 배우셔도 좋습니다.<br>어느 쪽이든<br>대표님 센터에 신규 등록이 이어지는 구조,<br>그것 하나를 만들어 드리겠습니다.</p>
        <p class="hjy-sign">허 준 영</p>
      </div>
      <img class="hjy-letter-img" src="/consultants/heo-junyoung.jpg" alt="더그로우컴퍼니 허준영 마케팅 컨설턴트">
    </div>
  </div>
</section>

<!-- 10. 프로그램 -->
<section class="hjy-sec hjy-sec--alt">
  <div class="hjy-inner">
    <h2 class="hjy-h2">허준영 컨설턴트의 솔루션:<br>광고부터 등록까지, <em>신규 유입 구조 설계</em></h2>
    <div class="hjy-prog">
      <div class="hjy-prog-item">
        <div class="hjy-prog-label">프로그램</div>
        <p class="hjy-prog-body">1:1 마케팅 컨설팅(한 달) 또는 마케팅 대행 중 선택</p>
      </div>
      <div class="hjy-prog-item">
        <div class="hjy-prog-label">진행 방식</div>
        <p class="hjy-prog-body">컨설팅은 방문 2회 + 줌 미팅 2회 격주 교차, 대행은 상담 후 범위 확정</p>
      </div>
      <div class="hjy-prog-item">
        <div class="hjy-prog-label">커리큘럼 (컨설팅 기준)</div>
        <ul class="hjy-prog-list">
          <li><b>[현황 분석]</b> 센터 상권·경쟁·채널 진단 및 전략 수립</li>
          <li><b>[채널 세팅]</b> 플레이스·블로그·광고 계정 직접 구축</li>
          <li><b>[실전 운영]</b> 광고 집행·콘텐츠 제작·글쓰기 실습</li>
          <li><b>[자립 완성]</b> 성과 점검 및 혼자 운영 가능한 체계 구축</li>
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
  marquee('hjyLectureMarquee', 36, true);

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
