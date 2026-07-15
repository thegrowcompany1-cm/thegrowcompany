"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 창업 세미나 (원데이 클래스) 랜딩 — 스마트스토어/상세페이지 문법
//  · 클래스 접두사 sm1- (컨설턴트 페이지와 CSS 충돌 방지)
//  · 단일 DETAIL_HTML(백틱) + dangerouslySetInnerHTML + mounted + suppressHydrationWarning
//  · injectContainer 로 <script> 재생성 append (마퀴 rAF / 폼 전송 / 하단 고정바)
//  · 마퀴는 requestAnimationFrame + cancelAnimationFrame 정리(__sm1Stop)
//  · 다음 세미나 때는 아래 SEMINAR_* / PRICE_* 상수만 수정하면 됨
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";

/* ▼▼ 다음 세미나 때 이 상수만 수정 ▼▼ */
const SEMINAR_DATE = "6월 14일 (일요일)";
const SEMINAR_TIME = "10:00~13:00 (3시간)";
const SEMINAR_PLACE =
  "경기 광명시 양지로 19 유플래닛어반브릭스 B동 4층 403호 (핏 클러스터)";
const PRICE_ORIGINAL = "220,000원";
const PRICE_SALE = "99,000원";
/* ▲▲ 여기까지 ▲▲ */

const HERO_BG = "https://cdn.imweb.me/thumbnail/20241212/e099e829a3cdc.png";

const DETAIL_HTML = `<div class="sm1">
<style>
.sm1{--g:#22B573;--dark:#0A0A0A;--dark2:#0d0d0d;--cream:#FBF8EC;--ink:#141414;background:#fff;color:#141414;font-family:'Pretendard',-apple-system,BlinkMacSystemFont,system-ui,'Apple SD Gothic Neo',sans-serif;line-height:1.7;letter-spacing:-0.01em;overflow:hidden}
.sm1 *{box-sizing:border-box}
.sm1-wrap{max-width:760px;margin:0 auto;padding:0 20px}
.sm1-sec{padding:60px 0}
@media(max-width:640px){.sm1-sec{padding:48px 0}}
.sm1-dark{background:var(--dark);color:#fff}
.sm1-dark2{background:var(--dark2);color:#fff}
.sm1-cream{background:var(--cream);color:var(--ink)}
.sm1-green{background:var(--g);color:#fff}

.sm1-h2{font-size:30px;font-weight:800;text-align:center;line-height:1.4;margin:0 0 14px}
.sm1-h2 em{font-style:normal;color:var(--g)}
.sm1-lead{font-size:17px;text-align:center;margin:0;line-height:1.75;opacity:.85}
@media(max-width:640px){.sm1-h2{font-size:24px}.sm1-lead{font-size:15px}}

/* 1 히어로 */
.sm1-hero{position:relative;min-height:78vh;display:flex;align-items:center;justify-content:center;text-align:center;color:#fff;overflow:hidden}
.sm1-hero-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center}
.sm1-hero-ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.55),rgba(0,0,0,.78))}
.sm1-hero-in{position:relative;z-index:2;padding:40px 20px;max-width:760px}
.sm1-hero h1{font-size:37px;font-weight:900;line-height:1.35;margin:0 0 18px;word-break:keep-all}
.sm1-hero p{font-size:18px;color:#e8e8e8;margin:0 0 26px;word-break:keep-all}
.sm1-badges{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
.sm1-badge{border:1px solid rgba(255,255,255,.4);border-radius:50px;padding:8px 16px;font-size:13px;font-weight:700;color:#fff;background:rgba(255,255,255,.08)}
@media(max-width:640px){.sm1-hero h1{font-size:27px}.sm1-hero p{font-size:15px}}

/* 2 대상 체크 */
.sm1-checks{max-width:600px;margin:32px auto 0;display:flex;flex-direction:column;gap:12px}
.sm1-check{display:flex;align-items:flex-start;gap:14px;background:#fff;border:1px solid #ece7d5;border-radius:14px;padding:18px 20px;font-size:16px;font-weight:600;color:#2a2a2a;line-height:1.55}
.sm1-check i{flex:0 0 auto;width:26px;height:26px;border-radius:50%;background:var(--g);color:#fff;font-size:14px;font-weight:800;font-style:normal;display:flex;align-items:center;justify-content:center;margin-top:1px}

/* 3 강사 소개 */
.sm1-prof{max-width:820px;margin:0 auto;text-align:left}
.sm1-prof-role{font-size:15px;font-weight:700;color:rgba(255,255,255,.85);margin:0 0 4px}
.sm1-prof-name{font-size:31px;font-weight:900;color:#fff;margin:0 0 22px;letter-spacing:-.02em}
.sm1-career{list-style:none;padding:0;margin:0 0 30px;display:grid;grid-template-columns:1fr 1fr;gap:8px 24px}
.sm1-career li{position:relative;padding-left:16px;font-size:14px;color:#eafff2;line-height:1.5}
.sm1-career li::before{content:'';position:absolute;left:0;top:9px;width:5px;height:5px;border-radius:50%;background:#fff}
.sm1-story{border-top:1px solid rgba(255,255,255,.25);padding-top:26px}
.sm1-story p{font-size:16px;color:#f4fff9;line-height:1.9;margin:0 0 18px}
.sm1-story p:last-child{margin-bottom:0}
@media(max-width:640px){.sm1-career{grid-template-columns:1fr}.sm1-prof-name{font-size:25px}}

/* 4 증거 */
.sm1-evi-img{display:block;width:100%;max-width:720px;margin:28px auto 16px;border-radius:16px;background:#1a1a1a}
.sm1-evi-cap{text-align:center;font-size:15px;color:#bdbdbd;margin:0}

/* 5 커리큘럼 */
.sm1-curr{max-width:720px;margin:32px auto 0;display:flex;flex-direction:column;gap:16px}
.sm1-cur{display:flex;gap:20px;background:#fff;border:1px solid #eee;border-radius:18px;padding:28px 26px;box-shadow:0 6px 24px rgba(0,0,0,.05)}
.sm1-cur-no{flex:0 0 auto;width:52px;height:52px;border-radius:14px;background:var(--g);color:#fff;font-size:24px;font-weight:900;display:flex;align-items:center;justify-content:center}
.sm1-cur-body h3{font-size:19px;font-weight:800;color:#161616;margin:0 0 8px;line-height:1.4}
.sm1-cur-body p{font-size:15px;color:#555;line-height:1.7;margin:0}
.sm1-curr-img{display:block;width:100%;max-width:720px;margin:24px auto 0;border-radius:16px}
@media(max-width:640px){.sm1-cur{padding:22px 20px;gap:14px}.sm1-cur-no{width:44px;height:44px;font-size:20px;border-radius:12px}.sm1-cur-body h3{font-size:17px}}

/* 6 마퀴 */
.sm1-mq{overflow:hidden;width:100%;max-width:100%;margin-top:26px;-webkit-user-select:none;user-select:none}
.sm1-mq-track{display:flex;width:max-content;gap:14px;will-change:transform}
.sm1-mq-track img{height:220px;width:auto;display:block;border-radius:14px;background:#1a1a1a;flex:0 0 auto}
@media(max-width:640px){.sm1-mq-track img{height:170px}}

/* 7 혜택 */
.sm1-benefits{max-width:720px;margin:32px auto 0;display:grid;grid-template-columns:1fr 1fr;gap:16px}
.sm1-benefit{background:#fff;border:1px solid #eee;border-radius:18px;padding:30px 26px;text-align:center;box-shadow:0 6px 24px rgba(0,0,0,.05)}
.sm1-benefit b{display:inline-block;background:rgba(34,181,115,.12);color:var(--g);font-size:12px;font-weight:800;padding:6px 14px;border-radius:50px;margin-bottom:14px;letter-spacing:.04em}
.sm1-benefit p{font-size:15px;color:#3a3a3a;line-height:1.7;margin:0;font-weight:600}
@media(max-width:640px){.sm1-benefits{grid-template-columns:1fr}}

/* 8 가격 */
.sm1-price{max-width:720px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:16px}
.sm1-price-card{background:#131313;border:1px solid #262626;border-radius:18px;padding:30px 26px;text-align:center}
.sm1-price-card--sale{border:2px solid var(--g);background:linear-gradient(180deg,rgba(34,181,115,.1),#131313)}
.sm1-price-tag{font-size:13px;font-weight:700;color:#9a9a9a;margin-bottom:12px}
.sm1-price-card--sale .sm1-price-tag{color:var(--g)}
.sm1-price-num{font-size:26px;font-weight:900;color:#fff;line-height:1.3}
.sm1-price-was{font-size:17px;color:#888;text-decoration:line-through;margin-right:9px;font-weight:700}
.sm1-price-now{color:var(--g)}
.sm1-price-vat{font-size:14px;color:#8a8a8a;font-weight:600}
.sm1-price-note{max-width:640px;margin:24px auto 0;font-size:13px;color:#9a9a9a;line-height:1.75;text-align:center}
@media(max-width:640px){.sm1-price{grid-template-columns:1fr}.sm1-price-num{font-size:23px}}

/* 9 폼 */
.sm1-info{max-width:560px;margin:24px auto 0;background:#fff;border:1px solid #ece7d5;border-radius:14px;padding:20px 22px;font-size:14px;color:#333;line-height:1.7}
.sm1-info div{display:flex;gap:10px}
.sm1-info div+div{margin-top:8px}
.sm1-info b{flex:0 0 42px;color:var(--g);font-weight:800}
.sm1-form{max-width:560px;margin:24px auto 0;background:#fff;border:1px solid #ece7d5;border-radius:20px;padding:32px 26px}
.sm1-fg{margin-bottom:20px}
.sm1-label{display:block;font-size:14px;font-weight:700;color:#2a2a2a;margin-bottom:10px}
.sm1-label .req{color:var(--g)}
.sm1-input{width:100%;height:48px;border:1px solid #ddd;border-radius:10px;padding:0 14px;font-size:15px;color:#161616;background:#fafafa}
.sm1-input:focus{outline:none;border-color:var(--g);background:#fff}
.sm1-phone{display:flex;align-items:center;gap:8px}
.sm1-phone input{flex:1;min-width:0;text-align:center;padding:0 6px}
.sm1-phone span{color:#bbb}
.sm1-row{display:flex;gap:12px}
.sm1-row .sm1-fg{flex:1;margin-bottom:0}
.sm1-checkgroup{display:flex;flex-wrap:wrap;gap:10px}
.sm1-checklabel{display:flex;align-items:center;gap:8px;border:1px solid #ddd;border-radius:10px;padding:11px 14px;font-size:14px;color:#333;cursor:pointer;background:#fafafa}
.sm1-checklabel input[type="checkbox"]{width:17px;height:17px;accent-color:var(--g)}
.sm1-etc{width:130px !important;height:38px;border:1px solid #ddd;border-radius:8px;padding:0 10px;font-size:14px;background:#fff}
.sm1-submit{width:100%;height:54px;border:none;border-radius:12px;background:var(--g);color:#fff;font-size:17px;font-weight:800;cursor:pointer;margin-top:4px;transition:opacity .2s}
.sm1-submit:hover{opacity:.9}
.sm1-submit:disabled{opacity:.6;cursor:default}

/* 10 하단 고정바 + 여백 */
.sm1-barspacer{height:96px}
.sm1-bar{position:fixed;left:0;right:0;bottom:0;z-index:60;background:#0d0d0d;border-top:1px solid #222;padding:12px 16px calc(12px + env(safe-area-inset-bottom));transform:translateY(0);transition:transform .3s ease}
.sm1-bar.is-hidden{transform:translateY(140%)}
.sm1-bar-in{max-width:760px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:14px}
.sm1-bar-info{min-width:0}
.sm1-bar-when{font-size:14px;font-weight:800;color:#fff;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sm1-bar-where{font-size:12px;color:#9a9a9a;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sm1-bar-cta{flex:0 0 auto;background:var(--g);color:#fff;font-size:15px;font-weight:800;padding:13px 26px;border-radius:12px;text-decoration:none;white-space:nowrap}
@media(max-width:480px){.sm1-bar-cta{padding:12px 20px;font-size:14px}.sm1-bar-when{font-size:13px}}
</style>

<!-- 1. 히어로 -->
<section class="sm1-hero">
  <img class="sm1-hero-bg" src="${HERO_BG}" alt="더그로우 피트니스·필라테스 창업 세미나 현장 배경">
  <div class="sm1-hero-ov"></div>
  <div class="sm1-hero-in">
    <h1>피트니스·필라테스 창업,<br>기초부터 심화까지 전부 공개합니다.</h1>
    <p>단 하루만에 끝내는 헬스장·필라테스 창업 노하우</p>
    <div class="sm1-badges">
      <span class="sm1-badge">창업 200회 경험</span>
      <span class="sm1-badge">원데이 클래스</span>
      <span class="sm1-badge">선착순 정원제</span>
    </div>
  </div>
</section>

<!-- 2. 대상 체크 -->
<section class="sm1-sec sm1-cream">
  <div class="sm1-wrap">
    <h2 class="sm1-h2">이런 분들이<br><em>들으시면 좋습니다.</em></h2>
    <div class="sm1-checks">
      <div class="sm1-check"><i>✓</i>창업을 앞둔 헬스장·필라테스 강사, 매니저님</div>
      <div class="sm1-check"><i>✓</i>추가 지점 확장을 계획하고 계시는 대표님</div>
      <div class="sm1-check"><i>✓</i>인테리어 사기 당하지 않고 싶으신 분</div>
      <div class="sm1-check"><i>✓</i>오픈 프리세일 노하우가 궁금하신 분</div>
      <div class="sm1-check"><i>✓</i>내 매장을 차리고 싶은데 확실한 정보를 얻고 싶은 분</div>
    </div>
  </div>
</section>

<!-- 3. 강사 소개 -->
<section class="sm1-sec sm1-green">
  <div class="sm1-wrap">
    <div class="sm1-prof">
      <p class="sm1-prof-role">(주)더그로우컴퍼니 대표</p>
      <p class="sm1-prof-name">김 재 강</p>
      <ul class="sm1-career">
        <li>㈜더그로우컴퍼니 대표</li>
        <li>그로우마케팅 대표</li>
        <li>그로우아카데미 대표</li>
        <li>필라테스린 프랜차이즈 대표</li>
        <li>인스팟 대표</li>
        <li>IFBB PRO NPC 스포츠모델부문 심사위원</li>
        <li>한국대학보디빌딩협회 이사</li>
        <li>전) 바디타임즈 휘트니스 총괄실장</li>
        <li>전) 까르페디엠 휘트니스 총괄이사</li>
        <li>전) 끌로에필라테스 총괄이사</li>
      </ul>
      <div class="sm1-story">
        <p>저도 트레이너로 시작해 지금에 이르기까지 결코 쉽지 않은 길을 걸어왔습니다. 사업도 한번, 크게 망해봤기에 누구보다 그 아픔을 잘 알고 있습니다.</p>
        <p>제가 망했던 이유 중 하나가 입지 선정과 상권, 그리고 시스템에 대한 이해였습니다. 입지와 상권은 단순히 유동 인구가 많은 곳이 아니라, 임대차·세무·프리세일·상권 분석까지 따져야 보이는 것이었습니다.</p>
        <p>그동안의 시행착오로 얻은 창업 노하우를 A부터 Z까지 모두 알려드리는 강의를 준비했습니다. 지금 이 순간에도 사용하고 있는 방법입니다.</p>
      </div>
    </div>
  </div>
</section>

<!-- 4. 증거 — 프리세일 매출 -->
<section class="sm1-sec sm1-dark">
  <div class="sm1-wrap">
    <h2 class="sm1-h2">45일 프리세일,<br>이 <em>숫자가 증거</em>입니다.</h2>
    <img class="sm1-evi-img" src="https://cdn.imweb.me/thumbnail/20250326/b88bdce183157.png" alt="더그로우 창업 프리세일 매출 사례 — 1.7억, 2.6억, 1.83억">
    <p class="sm1-evi-cap">입지 분석과 프리세일 설계가 만든 실제 결과입니다.</p>
  </div>
</section>

<!-- 5. 커리큘럼 -->
<section class="sm1-sec">
  <div class="sm1-wrap">
    <h2 class="sm1-h2">하루 동안 이 <em>4가지</em>를<br>가져갑니다.</h2>
    <div class="sm1-curr">
      <div class="sm1-cur">
        <div class="sm1-cur-no">1</div>
        <div class="sm1-cur-body">
          <h3>부동산 입지선정 — 선정 방법 100가지</h3>
          <p>역세권이 무조건 답은 아닙니다. 고정 지출까지 고려한 분석법과, 수백 번 임장을 다니며 메모해 얻은 노하우를 알려드립니다.</p>
        </div>
      </div>
      <div class="sm1-cur">
        <div class="sm1-cur-no">2</div>
        <div class="sm1-cur-body">
          <h3>인테리어 업체 선정 — 사기 당하지 않는 법</h3>
          <p>같은 자재여도 업체마다 가격이 다릅니다. 몇 가지 기준만 알면 사후 A/S까지 제대로 해주는 업체를 고를 수 있습니다.</p>
        </div>
      </div>
      <div class="sm1-cur">
        <div class="sm1-cur-no">3</div>
        <div class="sm1-cur-body">
          <h3>오픈 프리세일 — 억대 매출 내는 방법과 현장 사례</h3>
          <p>신규 오픈이라는 멘트는 고객에게 가장 큰 메리트입니다. 단순 가격 할인이 아닌, 시기에 맞는 퍼포먼스를 내는 법을 알려드립니다.</p>
        </div>
      </div>
      <div class="sm1-cur">
        <div class="sm1-cur-no">4</div>
        <div class="sm1-cur-body">
          <h3>마무리 피드백 및 운영 교육</h3>
          <p>오픈 이후에도 흔들리지 않는 운영 기준까지 잡아드립니다.</p>
        </div>
      </div>
    </div>
    <img class="sm1-curr-img" src="https://cdn.imweb.me/thumbnail/20241212/bdfa2dbaa07b9.png" alt="부동산 입지선정과 200개 창업 성공 100가지 노하우 체크리스트">
  </div>
</section>

<!-- 6. 세미나 현장 마퀴 -->
<section class="sm1-sec sm1-dark2">
  <div class="sm1-wrap">
    <h2 class="sm1-h2">현장 분위기를<br>먼저 보여드립니다.</h2>
  </div>
  <div class="sm1-mq" id="sm1LectureMarquee">
    <div class="sm1-mq-track">
      <img src="https://cdn.imweb.me/thumbnail/20241212/0d6bba5c56ae3.jpg" alt="더그로우 창업 세미나 현장 1">
      <img src="https://cdn.imweb.me/thumbnail/20241212/c8ac4e26b3b29.jpg" alt="더그로우 창업 세미나 현장 2">
      <img src="https://cdn.imweb.me/thumbnail/20241212/d983430471a18.jpg" alt="더그로우 창업 세미나 현장 3">
      <img src="https://cdn.imweb.me/thumbnail/20241212/2041b752c6153.jpg" alt="더그로우 창업 세미나 현장 4">
      <img src="https://cdn.imweb.me/thumbnail/20241212/a11c958761af6.jpg" alt="더그로우 창업 세미나 현장 5">
      <img src="https://cdn.imweb.me/thumbnail/20241212/577699bfe5a3e.jpg" alt="더그로우 창업 세미나 현장 6">
      <img src="https://cdn.imweb.me/thumbnail/20241212/14ef0952b9b0d.jpg" alt="더그로우 창업 세미나 현장 7">
      <img src="https://cdn.imweb.me/thumbnail/20241212/0d6bba5c56ae3.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20241212/c8ac4e26b3b29.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20241212/d983430471a18.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20241212/2041b752c6153.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20241212/a11c958761af6.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20241212/577699bfe5a3e.jpg" alt="" aria-hidden="true">
      <img src="https://cdn.imweb.me/thumbnail/20241212/14ef0952b9b0d.jpg" alt="" aria-hidden="true">
    </div>
  </div>
</section>

<!-- 7. 혜택 -->
<section class="sm1-sec sm1-cream">
  <div class="sm1-wrap">
    <h2 class="sm1-h2">하루 교육으로<br><em>끝나지 않습니다.</em></h2>
    <div class="sm1-benefits">
      <div class="sm1-benefit">
        <b>혜택 1</b>
        <p>20만원 상당의 센터운영 전략 전자책 + 헬스장·필라테스 마케팅 전자책 무료 증정</p>
      </div>
      <div class="sm1-benefit">
        <b>혜택 2</b>
        <p>고객관리·마케팅·상담 등 매장 운영 무료 강의에 지속 참여할 수 있는 기회 제공</p>
      </div>
    </div>
  </div>
</section>

<!-- 8. 가격 -->
<section class="sm1-sec sm1-dark">
  <div class="sm1-wrap">
    <h2 class="sm1-h2">지금 신청하면<br><em>이 가격</em>입니다.</h2>
    <div class="sm1-price">
      <div class="sm1-price-card">
        <div class="sm1-price-tag">창업 원데이 클래스 정가</div>
        <div class="sm1-price-num">${PRICE_ORIGINAL} <span class="sm1-price-vat">(VAT포함)</span></div>
      </div>
      <div class="sm1-price-card sm1-price-card--sale">
        <div class="sm1-price-tag">인스타 스토리 공유 시 할인가</div>
        <div class="sm1-price-num"><span class="sm1-price-was">${PRICE_ORIGINAL}</span><span class="sm1-price-now">${PRICE_SALE}</span> <span class="sm1-price-vat">(VAT포함)</span></div>
      </div>
    </div>
    <p class="sm1-price-note">현재 신청 문의가 많아 정원 초과 시 100% 환불해 드립니다. 신청서만 작성 시 별도 연락을 드리며, 응답 없을 시 자동 취소되는 점 양해 바랍니다.</p>
  </div>
</section>

<!-- 9. 신청 폼 -->
<section class="sm1-sec sm1-cream" id="sm1-form">
  <div class="sm1-wrap">
    <h2 class="sm1-h2">지금, <em>신청서</em>를<br>작성해주세요.</h2>
    <div class="sm1-info">
      <div><b>일시</b><span>${SEMINAR_DATE} · ${SEMINAR_TIME}</span></div>
      <div><b>장소</b><span>${SEMINAR_PLACE}</span></div>
    </div>
    <div class="sm1-formwrap">
      <form class="sm1-form" novalidate>
        <div class="sm1-fg">
          <label class="sm1-label">방문 경로 <span class="req">*</span></label>
          <div class="sm1-checkgroup">
            <label class="sm1-checklabel"><input type="checkbox" class="sm1-route" value="인스타 스토리"><span>인스타 스토리</span></label>
            <label class="sm1-checklabel"><input type="checkbox" class="sm1-route" value="인스타·페이스북 광고"><span>인스타·페이스북 광고</span></label>
            <label class="sm1-checklabel"><input type="checkbox" class="sm1-route" value="검색"><span>검색</span></label>
            <label class="sm1-checklabel"><input type="checkbox" class="sm1-route" value="기타"><span>기타</span><input type="text" class="sm1-etc" placeholder="직접입력" disabled></label>
          </div>
        </div>
        <div class="sm1-fg">
          <label class="sm1-label">이름 <span class="req">*</span></label>
          <input type="text" class="sm1-input" name="name" placeholder="성함을 입력해주세요">
        </div>
        <div class="sm1-fg">
          <label class="sm1-label">연락처 <span class="req">*</span></label>
          <div class="sm1-phone">
            <input class="sm1-input" name="phone1" maxlength="3" inputmode="numeric">
            <span>-</span>
            <input class="sm1-input" name="phone2" maxlength="4" inputmode="numeric">
            <span>-</span>
            <input class="sm1-input" name="phone3" maxlength="4" inputmode="numeric">
          </div>
        </div>
        <div class="sm1-fg">
          <label class="sm1-label">연락처 중복확인 <span class="req">*</span></label>
          <div class="sm1-phone">
            <input class="sm1-input" name="phoneConfirm1" maxlength="3" inputmode="numeric">
            <span>-</span>
            <input class="sm1-input" name="phoneConfirm2" maxlength="4" inputmode="numeric">
            <span>-</span>
            <input class="sm1-input" name="phoneConfirm3" maxlength="4" inputmode="numeric">
          </div>
        </div>
        <div class="sm1-row">
          <div class="sm1-fg">
            <label class="sm1-label">업체 (브랜드명)</label>
            <input type="text" class="sm1-input" name="company" placeholder="브랜드·매장명">
          </div>
          <div class="sm1-fg">
            <label class="sm1-label">직책</label>
            <input type="text" class="sm1-input" name="position" placeholder="예) 대표, 매니저">
          </div>
        </div>
        <button type="submit" class="sm1-submit">신청서 제출하기</button>
      </form>
    </div>
  </div>
</section>

<div class="sm1-barspacer"></div>

<!-- 10. 하단 고정 바 -->
<div class="sm1-bar" id="sm1-bar">
  <div class="sm1-bar-in">
    <div class="sm1-bar-info">
      <div class="sm1-bar-when">${SEMINAR_DATE} · ${SEMINAR_TIME}</div>
      <div class="sm1-bar-where">광명 핏 클러스터</div>
    </div>
    <a href="#sm1-form" class="sm1-bar-cta" id="sm1-bar-cta">신청하기</a>
  </div>
</div>

<script>
(function(){
  var SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyelFqoWSqeRWmjVGARFePbNqTtkTtkG9MtXZpfusvTSUxnE42SrjJgmKM4dQDVcI-QAg/exec';
  var SECRET_TOKEN = 'grow2026secure';
  var stops = [];

  /* 무한 마퀴 (rAF, 호버 일시정지) */
  function marquee(id, pxPerSec, toRight){
    var root = document.getElementById(id);
    if (!root) return;
    var track = root.querySelector('.sm1-mq-track');
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
  marquee('sm1LectureMarquee', 34, false);

  /* 신청 폼 — 폼 스코프 기준 초기화(id 하드코딩 없음) */
  function initForm(wrap){
    if (!wrap || wrap.getAttribute('data-sm1-init')) return;
    wrap.setAttribute('data-sm1-init', '1');
    var form = wrap.querySelector('.sm1-form');
    if (!form) return;
    function q(s){ return wrap.querySelector(s); }
    function qa(s){ return wrap.querySelectorAll(s); }
    function val(s){ var el = q(s); return el ? el.value : ''; }

    var etcChk = q('.sm1-route[value="기타"]');
    var etcIn = q('.sm1-etc');
    if (etcChk && etcIn){
      etcChk.addEventListener('change', function(){
        etcIn.disabled = !this.checked;
        if (this.checked) etcIn.focus(); else etcIn.value = '';
      });
    }

    var phones = qa('.sm1-phone input');
    phones.forEach(function(inp, i){
      inp.addEventListener('input', function(){
        this.value = this.value.replace(/[^0-9]/g, '');
        if (this.value.length >= this.maxLength && i < phones.length - 1){ phones[i + 1].focus(); }
      });
    });

    var btn = form.querySelector('.sm1-submit');
    form.addEventListener('submit', function(e){
      e.preventDefault();
      if (!val('[name="name"]').trim()){ alert('이름을 입력해주세요.'); return; }
      var p = val('[name="phone1"]') + val('[name="phone2"]') + val('[name="phone3"]');
      var pc = val('[name="phoneConfirm1"]') + val('[name="phoneConfirm2"]') + val('[name="phoneConfirm3"]');
      if (!p){ alert('연락처를 입력해주세요.'); return; }
      if (p !== pc){ alert('연락처가 일치하지 않습니다. 다시 확인해주세요.'); return; }
      var routes = qa('.sm1-route:checked');
      if (routes.length === 0){ alert('방문 경로를 선택해주세요.'); return; }

      var routeVals = Array.prototype.map.call(routes, function(cb){ return cb.value; });
      if (etcChk && etcChk.checked && etcIn && etcIn.value.trim()){
        routeVals = routeVals.filter(function(v){ return v !== '기타'; });
        routeVals.push('기타 - ' + etcIn.value.trim());
      }

      if (btn){ btn.disabled = true; btn.textContent = '전송중...'; }

      var params = new URLSearchParams();
      params.append('source', '창업세미나');
      params.append('token', SECRET_TOKEN);
      params.append('name', val('[name="name"]'));
      params.append('phone', val('[name="phone1"]') + '-' + val('[name="phone2"]') + '-' + val('[name="phone3"]'));
      params.append('phoneCheck1', val('[name="phoneConfirm1"]'));
      params.append('phoneCheck2', val('[name="phoneConfirm2"]'));
      params.append('phoneCheck3', val('[name="phoneConfirm3"]'));
      params.append('route', routeVals.join(', '));
      params.append('company', val('[name="company"]'));
      params.append('position', val('[name="position"]'));

      fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      })
      .then(function(){
        alert('창업 세미나 신청이 정상적으로 접수되었습니다.\\n빠른 시일 내에 연락드리겠습니다.');
        form.reset();
        if (etcIn) etcIn.disabled = true;
      })
      .catch(function(){
        alert('전송 중 오류가 발생했습니다. 다시 시도해주세요.');
      })
      .finally(function(){
        if (btn){ btn.disabled = false; btn.textContent = '신청서 제출하기'; }
      });
    });
  }
  var fws = document.querySelectorAll('.sm1-formwrap');
  for (var fi = 0; fi < fws.length; fi++){ initForm(fws[fi]); }

  /* 하단 고정 바 — 폼이 보이면 숨김 + 부드러운 스크롤 */
  var bar = document.getElementById('sm1-bar');
  var target = document.getElementById('sm1-form');
  if (bar && target && typeof IntersectionObserver !== 'undefined'){
    var io = new IntersectionObserver(function(entries){
      for (var k = 0; k < entries.length; k++){ bar.classList.toggle('is-hidden', entries[k].isIntersecting); }
    }, { threshold: 0.12 });
    io.observe(target);
    stops.push(function(){ io.disconnect(); });
  }
  var cta = document.getElementById('sm1-bar-cta');
  if (cta && target){
    cta.addEventListener('click', function(e){
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.pageYOffset - 72;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  }

  /* 언마운트 정리용 전역 정지 훅 (React cleanup 에서 호출 후 no-op 으로 교체) */
  window.__sm1Stop = function(){
    for (var i = 0; i < stops.length; i++){ stops[i](); }
  };
})();
</script>
</div>`;

export default function StartupClass() {
  const [mounted, setMounted] = useState(false);
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

  useEffect(() => {
    if (!mounted) return;
    const container = detailRef.current;
    if (!container) return;
    const injected = injectContainer(container);
    return () => {
      injected.forEach((s) => s.remove());
      const w = window as unknown as Record<string, unknown>;
      const stop = w["__sm1Stop"];
      if (typeof stop === "function") (stop as () => void)();
      w["__sm1Stop"] = () => {};
    };
  }, [mounted]);

  return (
    <div className="overflow-x-hidden bg-white">
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
    </div>
  );
}
