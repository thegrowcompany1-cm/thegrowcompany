"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 창업 세미나 (원데이 클래스) 랜딩 — 스마트스토어/상세페이지 문법
//  · 클래스 접두사 sm1- (컨설턴트 페이지와 CSS 충돌 방지)
//  · 단일 DETAIL_HTML(백틱) + dangerouslySetInnerHTML + mounted + suppressHydrationWarning
//  · injectContainer 로 <script> 재생성 append (마퀴 rAF / 결제 버튼 / 하단 고정바)
//  · 마퀴는 requestAnimationFrame + cancelAnimationFrame 정리(__sm1Stop)
//  · 다음 세미나 때는 아래 SEMINAR_* / PRICE_* 상수만 수정 + SCHEDULE_TBD=false
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

// 다음 일정이 확정되면 SCHEDULE_TBD 를 false 로만 바꾸면 위 상수(날짜·시간·장소)가 자동 노출됨
const SCHEDULE_TBD = true;
const BAR_SCHEDULE = SCHEDULE_TBD
  ? "다음 일정 준비중"
  : `${SEMINAR_DATE} · ${SEMINAR_TIME} · ${SEMINAR_PLACE}`;

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

.sm1-h2{font-size:30px;font-weight:800;text-align:center;line-height:1.4;margin:0 0 14px}
.sm1-h2 em{font-style:normal;color:var(--g)}
.sm1-lead{font-size:17px;text-align:center;margin:0;line-height:1.75;opacity:.85}
@media(max-width:640px){.sm1-h2{font-size:24px}.sm1-lead{font-size:15px}}

/* 1 최상단 (이미지 / 결제 카드) */
.sm1-top{background:#f6f5f2}
.sm1-top-title{font-size:29px;font-weight:900;text-align:center;line-height:1.4;margin:0 0 28px;color:#161616;word-break:keep-all}
.sm1-top-title em{font-style:normal;color:var(--g)}
.sm1-top-grid{display:grid;grid-template-columns:1fr 1fr;gap:28px;align-items:center}
.sm1-top-img img{width:100%;height:auto;display:block;border-radius:16px}
.sm1-pays{display:flex;flex-direction:column;gap:16px}
.sm1-pay-card{background:#fff;border:1px solid #e6e6e6;border-radius:18px;padding:26px 24px;box-shadow:0 6px 24px rgba(0,0,0,.06)}
.sm1-pay-card--sale{border:2px solid var(--g);box-shadow:0 10px 30px rgba(34,181,115,.15)}
.sm1-pay-tag{font-size:13px;font-weight:700;color:#888;margin-bottom:10px}
.sm1-pay-card--sale .sm1-pay-tag{color:var(--g)}
.sm1-pay-price{font-size:26px;font-weight:900;color:#161616;line-height:1.3;margin-bottom:18px}
.sm1-pay-was{font-size:17px;color:#aaa;text-decoration:line-through;margin-right:9px;font-weight:700}
.sm1-pay-now{color:var(--g)}
.sm1-pay-vat{font-size:14px;color:#999;font-weight:600}
.sm1-pay-btn{width:100%;height:52px;border:none;border-radius:12px;background:#161616;color:#fff;font-size:16px;font-weight:800;cursor:pointer;transition:opacity .2s}
.sm1-pay-btn--sale{background:var(--g)}
.sm1-pay-btn:hover{opacity:.9}
.sm1-pay-note{font-size:12px;color:#888;line-height:1.7;margin:4px 2px 0}
@media(max-width:860px){.sm1-top-grid{grid-template-columns:1fr;gap:22px}}
@media(max-width:640px){.sm1-top-title{font-size:23px}.sm1-pay-price{font-size:23px}}

/* 2 대상 체크 */
.sm1-checks{max-width:600px;margin:32px auto 0;display:flex;flex-direction:column;gap:12px}
.sm1-check{display:flex;align-items:flex-start;gap:14px;background:#fff;border:1px solid #ece7d5;border-radius:14px;padding:18px 20px;font-size:16px;font-weight:600;color:#2a2a2a;line-height:1.55}
.sm1-check i{flex:0 0 auto;width:26px;height:26px;border-radius:50%;background:var(--g);color:#fff;font-size:14px;font-weight:800;font-style:normal;display:flex;align-items:center;justify-content:center;margin-top:1px}

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

/* 10 하단 고정바 + 여백 */
.sm1-barspacer{height:96px}
.sm1-bar{position:fixed;left:0;right:0;bottom:0;z-index:60;background:#0d0d0d;border-top:1px solid #222;padding:12px 16px calc(12px + env(safe-area-inset-bottom));transform:translateY(0);transition:transform .3s ease}
.sm1-bar.is-hidden{transform:translateY(140%)}
.sm1-bar-in{max-width:760px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:14px}
.sm1-bar-info{min-width:0}
.sm1-bar-when{font-size:14px;font-weight:800;color:#fff;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sm1-bar-cta{flex:0 0 auto;background:var(--g);color:#fff;font-size:15px;font-weight:800;padding:13px 26px;border-radius:12px;text-decoration:none;white-space:nowrap}
@media(max-width:480px){.sm1-bar-cta{padding:12px 20px;font-size:14px}.sm1-bar-when{font-size:13px}}
</style>

<!-- 1. 최상단 (이미지 / 결제 카드) -->
<section class="sm1-sec sm1-top" id="sm1-top">
  <div class="sm1-wrap">
    <h1 class="sm1-top-title">피트니스·필라테스 창업,<br><em>기초부터 심화까지</em> 하루에 공개합니다.</h1>
    <div class="sm1-top-grid">
      <div class="sm1-top-img">
        <img src="/startup/startupjk.png" alt="더그로우컴퍼니 대표 김재강 이력">
      </div>
      <div class="sm1-pays">
        <div class="sm1-pay-card">
          <div class="sm1-pay-tag">창업 원데이 클래스 정가</div>
          <div class="sm1-pay-price">${PRICE_ORIGINAL} <span class="sm1-pay-vat">(VAT포함)</span></div>
          <button type="button" class="sm1-pay-btn">결제하기</button>
        </div>
        <div class="sm1-pay-card sm1-pay-card--sale">
          <div class="sm1-pay-tag">인스타 스토리 공유 시 할인가</div>
          <div class="sm1-pay-price"><span class="sm1-pay-was">${PRICE_ORIGINAL}</span><span class="sm1-pay-now">${PRICE_SALE}</span> <span class="sm1-pay-vat">(VAT포함)</span></div>
          <button type="button" class="sm1-pay-btn sm1-pay-btn--sale">할인가로 결제하기</button>
        </div>
        <p class="sm1-pay-note">현재 신청 문의가 많아 정원 초과 시 100% 환불해 드립니다. 응답이 없을 경우 자동 취소되는 점 양해 바랍니다.</p>
      </div>
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

<div class="sm1-barspacer"></div>

<!-- 10. 하단 고정 바 -->
<div class="sm1-bar" id="sm1-bar">
  <div class="sm1-bar-in">
    <div class="sm1-bar-info">
      <div class="sm1-bar-when">${BAR_SCHEDULE}</div>
    </div>
    <a href="#sm1-top" class="sm1-bar-cta" id="sm1-bar-cta">신청하기</a>
  </div>
</div>

<script>
(function(){
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

  /* 결제 버튼 (TODO: 토스페이먼츠 연동) */
  var payBtns = document.querySelectorAll('.sm1-pay-btn');
  for (var pi = 0; pi < payBtns.length; pi++){
    payBtns[pi].addEventListener('click', function(){
      // TODO: 토스페이먼츠 연동
      alert('결제 준비중입니다. 오픈 예정이니 조금만 기다려주세요.');
    });
  }

  /* 하단 고정 바 — 최상단(결제 카드)이 보이면 숨김, 스크롤 내리면 표시 + 부드러운 스크롤 */
  var bar = document.getElementById('sm1-bar');
  var target = document.getElementById('sm1-top');
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
