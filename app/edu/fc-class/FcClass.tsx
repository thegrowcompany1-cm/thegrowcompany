"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 정규 FC 클래스 랜딩 (1/3차) — 그로우 아카데미
//  · 클래스 접두사 fc1- (아임웹 원본 클래스명 리네이밍, CSS 충돌 방지)
//  · 최상단(랜덤 강의사진 + 결제 카드)은 React JSX, 히어로/문제/해결은 DETAIL_HTML 주입
//  · injectContainer 로 <script> 재생성 append (문제 섹션 IntersectionObserver)
//  · IntersectionObserver 는 __fc1Stop 으로 언마운트 시 disconnect (전역함수 no-op 교체)
//  · 다음 기수 때는 상단 SEMINAR_* / PRICE_* 상수만 수정
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";

/* ▼▼ 다음 기수 때 이 상수만 수정 ▼▼ */
const SEMINAR_DATE = "준비중";
const SEMINAR_TIME = "총 4시간";
const SEMINAR_PLACE = "준비중";
const PRICE_ORIGINAL = "290,000원";
const PRICE_SALE = "190,000원";
/* ▲▲ 여기까지 ▲▲ */

// 최상단 좌측 강의 사진 후보 — 로드 시 클라이언트에서 1장 랜덤 선택
const LECTURE_IMAGES = [
  "https://cdn.imweb.me/thumbnail/20260131/2c27053d77aa7.jpg",
  "https://cdn.imweb.me/thumbnail/20260131/585cf1ee7e5d1.jpg",
  "https://cdn.imweb.me/thumbnail/20260131/c51e290737724.jpg",
  "https://cdn.imweb.me/thumbnail/20260131/d71d22f9eea53.jpg",
  "https://cdn.imweb.me/thumbnail/20260131/2f1084024ac28.jpg",
  "https://cdn.imweb.me/thumbnail/20260131/c8b4857c6a396.jpg",
  "https://cdn.imweb.me/thumbnail/20260131/4b9ce2fb80778.jpg",
  "https://cdn.imweb.me/thumbnail/20260131/626df956ffc13.jpg",
];

const TOP_STYLE = `@keyframes fc1Pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}.fc1-pulse{animation:fc1Pulse 2.2s ease-in-out infinite}`;

const DETAIL_HTML = `<div class="fc1">
<style>
.fc1{--g:#22B573;font-family:'Pretendard',-apple-system,BlinkMacSystemFont,system-ui,'Apple SD Gothic Neo',sans-serif;letter-spacing:-0.01em;overflow:hidden}
.fc1 *{box-sizing:border-box}
.fc1-wrap{max-width:820px;margin:0 auto;padding:0 20px}
.fc1-sec{padding:64px 0}
@media(max-width:640px){.fc1-sec{padding:52px 0}}

@keyframes fc1FadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
.fc1-fu{opacity:0;animation:fc1FadeUp .8s ease forwards}
.fc1-d1{animation-delay:.15s}.fc1-d2{animation-delay:.45s}.fc1-d3{animation-delay:.75s}
.fc1-d4{animation-delay:1.05s}.fc1-d5{animation-delay:1.35s}.fc1-d6{animation-delay:1.65s}

.fc1-reveal{opacity:0;transform:translateY(28px);transition:opacity .7s ease,transform .7s ease}
.fc1-reveal.fc1-in{opacity:1;transform:none}
.fc1-pcards .fc1-pcard:nth-child(2){transition-delay:.12s}
.fc1-pcards .fc1-pcard:nth-child(3){transition-delay:.24s}
.fc1-points .fc1-point:nth-child(2){transition-delay:.12s}
.fc1-points .fc1-point:nth-child(3){transition-delay:.24s}

/* 1 히어로 */
.fc1-hero{position:relative;min-height:90vh;display:flex;align-items:center;justify-content:center;text-align:center;color:#fff;overflow:hidden;background:#000}
.fc1-hero-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;animation:fc1Pan 20s ease-in-out infinite alternate;will-change:transform}
@keyframes fc1Pan{from{transform:scale(1.1) translateX(-2.5%)}to{transform:scale(1.1) translateX(2.5%)}}
.fc1-hero-ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.45) 0%,rgba(0,0,0,.72) 60%,rgba(0,0,0,.85) 100%)}
.fc1-hero-in{position:relative;z-index:2;padding:44px 20px;max-width:820px}
.fc1-hero-sub{font-size:15px;letter-spacing:.1em;color:#bfe6d4;margin:0 0 26px;font-weight:600}
.fc1-hero-q{font-size:26px;font-weight:800;line-height:1.5;margin:0 0 14px}
.fc1-red{color:#ff5d5d}
.fc1-divider{display:block;width:60px;height:3px;background:var(--g);border-radius:2px;margin:30px auto}
.fc1-hero-big{font-size:46px;font-weight:900;color:#ffd83d;margin:0 0 16px}
.fc1-hero-close{font-size:22px;font-weight:700;line-height:1.55;margin:0;color:#f0f0f0}
.fc1-scroll{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);z-index:2;opacity:0;animation:fc1ScrollIn 1s ease 1.9s forwards}
@keyframes fc1ScrollIn{to{opacity:1}}
.fc1-mouse{display:block;width:26px;height:42px;border:2px solid rgba(255,255,255,.55);border-radius:14px;position:relative}
.fc1-mouse::before{content:'';position:absolute;left:50%;top:8px;width:4px;height:8px;margin-left:-2px;background:#fff;border-radius:2px;animation:fc1Wheel 1.6s ease infinite}
@keyframes fc1Wheel{0%{opacity:0;transform:translateY(0)}30%{opacity:1}100%{opacity:0;transform:translateY(12px)}}
@media(max-width:640px){.fc1-hero{min-height:86vh}.fc1-hero-q{font-size:20px}.fc1-hero-big{font-size:34px}.fc1-hero-close{font-size:18px}}

/* 공통 헤딩 */
.fc1-h2{font-size:28px;font-weight:800;text-align:center;line-height:1.45;margin:0 0 12px;color:inherit}
.fc1-h2 em{font-style:normal;color:var(--g)}
.fc1-sub{font-size:16px;text-align:center;margin:0 0 8px;opacity:.72}
@media(max-width:640px){.fc1-h2{font-size:23px}}

/* 2 문제 */
.fc1-problem{background:#0A0A0A;color:#fff}
.fc1-pcards{display:flex;flex-direction:column;gap:14px;max-width:640px;margin:36px auto 0}
.fc1-pcard{background:#141414;border:1px solid #232323;border-left:4px solid #e23b3b;border-radius:14px;padding:24px}
.fc1-pcard-no{color:#e23b3b;font-weight:900;font-size:14px;margin-bottom:8px;letter-spacing:.06em}
.fc1-pcard h3{font-size:18px;font-weight:800;margin:0 0 10px;line-height:1.45}
.fc1-pcard p{font-size:15px;color:#bdbdbd;line-height:1.7;margin:0}
.fc1-pbox{max-width:640px;margin:32px auto 0;background:#111;border:1px solid #222;border-radius:18px;padding:30px 26px;text-align:center}
.fc1-pbox p{margin:0;font-size:17px;line-height:1.8;color:#eee}
.fc1-pbox em{font-style:normal;color:var(--g);font-weight:700}

/* 3 해결책 */
.fc1-solution{background:#fff;color:#141414}
.fc1-solution .fc1-wrap{text-align:center}
.fc1-badge{display:inline-block;background:rgba(34,181,115,.12);color:var(--g);font-size:12px;font-weight:800;padding:7px 16px;border-radius:50px;letter-spacing:.04em;margin-bottom:14px}
.fc1-sub-dark{color:#555;opacity:1}
.fc1-points{display:flex;flex-direction:column;gap:16px;max-width:680px;margin:36px auto 0;text-align:left}
.fc1-point{background:#fafafa;border:1px solid #eee;border-radius:16px;padding:28px 26px}
.fc1-point-label{color:var(--g);font-weight:800;font-size:13px;margin-bottom:8px;letter-spacing:.02em}
.fc1-point h3{font-size:19px;font-weight:800;color:#161616;margin:0 0 10px;line-height:1.45}
.fc1-point p{font-size:15px;color:#555;line-height:1.75;margin:0}
.fc1-summary{max-width:680px;margin:34px auto 0;background:#111;color:#fff;border-radius:20px;padding:36px 30px;text-align:center}
.fc1-summary p{margin:0;font-size:19px;font-weight:800;line-height:1.7}
.fc1-summary em{font-style:normal;color:var(--g)}
.fc1-summary-500{margin-top:18px !important;font-size:14px !important;font-weight:600 !important;color:#aaa !important}
</style>

<!-- 1. 히어로 -->
<section class="fc1-hero">
  <img class="fc1-hero-bg" src="https://cdn.imweb.me/thumbnail/20251024/6b0de22aa5b3b.jpg" alt="정규 FC 클래스 강의 현장 배경">
  <div class="fc1-hero-ov"></div>
  <div class="fc1-hero-in">
    <p class="fc1-hero-sub fc1-fu fc1-d1">— 정규 FC 클래스 —</p>
    <p class="fc1-hero-q fc1-fu fc1-d2">매달 신규 문의 때문에<br><span class="fc1-red">잠 못 드는 밤</span>이 있습니다.</p>
    <p class="fc1-hero-q fc1-fu fc1-d3">혹시 <span class="fc1-red">적자를 겨우 면하고</span> 있는 달도 있습니다.</p>
    <span class="fc1-divider fc1-fu fc1-d4"></span>
    <p class="fc1-hero-big fc1-fu fc1-d5">걱정마세요</p>
    <p class="fc1-hero-close fc1-fu fc1-d6">어쩌면 이 강의로<br>상황이 바뀔지도 모릅니다.</p>
  </div>
  <div class="fc1-scroll" aria-hidden="true"><span class="fc1-mouse"></span></div>
</section>

<!-- 2. 문제 -->
<section class="fc1-sec fc1-problem">
  <div class="fc1-wrap">
    <h2 class="fc1-h2 fc1-reveal">매출이 잘 오르지 않는 이유는<br>아마도 이 <em>3가지 중 1개</em>일 확률이 큽니다.</h2>
    <p class="fc1-sub fc1-reveal">해당되는 부분이 있는지 확인해보세요.</p>
    <div class="fc1-pcards">
      <div class="fc1-pcard fc1-reveal">
        <div class="fc1-pcard-no">CASE 01</div>
        <h3>매출 부진을 외부 탓으로 돌리고 있습니다.</h3>
        <p>경기, 상권, 주변 경쟁… 안 되는 이유를 밖에서 찾으며, 어쩔 수 없는 일이라고 받아들이고 계신지도 모릅니다.</p>
      </div>
      <div class="fc1-pcard fc1-reveal">
        <div class="fc1-pcard-no">CASE 02</div>
        <h3>수업 실력은 최고지만, 운영은 배운 적이 없습니다.</h3>
        <p>회원을 가르치는 전문성은 뛰어나지만, 매장을 매출이 나오는 구조로 '운영'하는 법은 아무도 알려주지 않았습니다.</p>
      </div>
      <div class="fc1-pcard fc1-reveal">
        <div class="fc1-pcard-no">CASE 03</div>
        <h3>좋은 프로그램을 알릴 방법을 모릅니다.</h3>
        <p>실력과 콘텐츠는 충분한데, 신규 고객에게 제대로 알리고 유입시키는 마케팅을 몰라 문의가 끊깁니다.</p>
      </div>
    </div>
    <div class="fc1-pbox fc1-reveal">
      <p>그래서 준비했습니다.<br><em>고객관리, 상담, 재등록, 서비스, 관리시스템, 마케팅</em> 등<br>매출에 관련된 모든 부분을 교육해드립니다.</p>
    </div>
  </div>
</section>

<!-- 3. 해결책 -->
<section class="fc1-sec fc1-solution">
  <div class="fc1-wrap">
    <span class="fc1-badge fc1-reveal">그로우 아카데미 FC 클래스</span>
    <h2 class="fc1-h2 fc1-reveal">단순히 듣기만 하는<br>교육이 아닙니다.</h2>
    <p class="fc1-sub fc1-sub-dark fc1-reveal">현장에서 바로 쓰는 실전을, 직접 겪은 사람에게 배웁니다.</p>
    <div class="fc1-points">
      <div class="fc1-point fc1-reveal">
        <div class="fc1-point-label">직접 매장을 운영하는 사람</div>
        <h3>이론이 아니라, 지금도 매장을 운영하는 사람이 가르칩니다.</h3>
        <p>책에서 배운 이론이 아닌, 지금 이 순간에도 현장에서 검증하고 있는 실전 노하우를 그대로 전달합니다.</p>
      </div>
      <div class="fc1-point fc1-reveal">
        <div class="fc1-point-label">업계 출신 강사</div>
        <h3>피트니스 현장을 직접 겪은 사람이 압니다.</h3>
        <p>업계를 겪어본 사람만이 아는 진짜 문제와 해법을, 대표님의 상황에 맞춰 짚어드립니다.</p>
      </div>
      <div class="fc1-point fc1-reveal">
        <div class="fc1-point-label">검증된 강사 2인 직강</div>
        <h3>운영과 마케팅, 각 분야 전문가가 직접 가르칩니다.</h3>
        <p>한 명이 다 하는 교육이 아닙니다. 창업 217개를 만든 김재강 대표와 검색광고 1급 허준영 본부장이 각자의 무기를 직강합니다.</p>
      </div>
    </div>
    <div class="fc1-summary fc1-reveal">
      <p><em>마케팅</em>은 고객을 끌어오고<br><em>시스템</em>은 고객을 묶어두고<br><em>자동화</em>는 시간을 벌어줍니다.</p>
      <p class="fc1-summary-500">이미 500명이 넘는 원장·대표님이 이 교육을 거쳐갔습니다.</p>
    </div>
  </div>
</section>

<script>
(function(){
  var stops = [];
  var els = document.querySelectorAll('.fc1-reveal');
  if (els.length && typeof IntersectionObserver !== 'undefined'){
    var io = new IntersectionObserver(function(entries){
      for (var k = 0; k < entries.length; k++){
        if (entries[k].isIntersecting){ entries[k].target.classList.add('fc1-in'); io.unobserve(entries[k].target); }
      }
    }, { threshold: 0.15 });
    for (var i = 0; i < els.length; i++){ io.observe(els[i]); }
    stops.push(function(){ io.disconnect(); });
  } else {
    for (var j = 0; j < els.length; j++){ els[j].classList.add('fc1-in'); }
  }

  // 언마운트 정리용 전역 정지 훅 (React cleanup 에서 호출 후 no-op 으로 교체)
  window.__fc1Stop = function(){
    for (var s = 0; s < stops.length; s++){ stops[s](); }
  };
})();
</script>
</div>`;

export default function FcClass() {
  const [mounted, setMounted] = useState(false);
  const [heroImg, setHeroImg] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setHeroImg(LECTURE_IMAGES[Math.floor(Math.random() * LECTURE_IMAGES.length)]);
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
      const stop = w["__fc1Stop"];
      if (typeof stop === "function") (stop as () => void)();
      w["__fc1Stop"] = () => {};
    };
  }, [mounted]);

  const payAlert = () => {
    // TODO: 토스페이먼츠 연동
    alert("결제 준비중입니다. 오픈 예정이니 조금만 기다려주세요.");
  };

  return (
    <div
      className="overflow-x-hidden bg-white"
      data-seminar-date={SEMINAR_DATE}
      data-seminar-time={SEMINAR_TIME}
      data-seminar-place={SEMINAR_PLACE}
    >
      <style dangerouslySetInnerHTML={{ __html: TOP_STYLE }} />

      {/* ── 0. 최상단: 랜덤 강의사진 / 결제 카드 2개 ── */}
      <section className="bg-[#f6f5f2] py-12 sm:py-16">
        <div className="mx-auto max-w-[1080px] px-4 sm:px-6">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[1.5fr_1fr]">
            {/* 좌: 랜덤 강의 사진 */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#e6e4df]">
              {heroImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heroImg}
                  alt="그로우 아카데미 FC 클래스 교육 현장"
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>

            {/* 우: 결제 카드 2개 */}
            <div className="flex flex-col gap-4">
              {/* 카드 1 — 정상가 */}
              <div className="rounded-2xl border border-[#e6e6e6] bg-white p-6 shadow-[0_6px_24px_rgba(0,0,0,0.06)]">
                <div className="text-sm font-bold text-gray-500">그로우 아카데미 FC 클래스</div>
                <div className="mt-2 text-2xl font-black text-[#161616]">
                  {PRICE_ORIGINAL} <span className="text-sm font-semibold text-gray-500">(VAT포함)</span>
                </div>
                <button
                  type="button"
                  onClick={payAlert}
                  className="mt-5 w-full rounded-xl bg-[#161616] py-4 text-base font-extrabold text-white transition-opacity hover:opacity-90"
                >
                  정상가로 신청하기
                </button>
              </div>

              {/* 카드 2 — 얼리버드 할인가 */}
              <div className="relative rounded-2xl border-2 border-[#22B573] bg-gradient-to-b from-[#22B573]/10 to-white p-6 shadow-[0_10px_30px_rgba(34,181,115,0.15)]">
                <span className="absolute -top-3 left-6 rounded-full bg-[#e23b3b] px-3 py-1 text-[11px] font-extrabold tracking-wide text-white">
                  EARLY BIRD
                </span>
                <div className="text-sm font-bold text-[#22B573]">얼리버드 할인가</div>
                <div className="mt-2 text-2xl font-black text-[#161616]">
                  <span className="mr-2 text-lg font-bold text-gray-400 line-through">{PRICE_ORIGINAL}</span>
                  <span className="text-[#22B573]">{PRICE_SALE}</span>{" "}
                  <span className="text-sm font-semibold text-gray-500">(VAT포함)</span>
                </div>
                <button
                  type="button"
                  onClick={payAlert}
                  className="fc1-pulse mt-5 w-full rounded-xl bg-[#22B573] py-4 text-base font-extrabold text-white transition-opacity hover:opacity-90"
                >
                  얼리버드 할인가로 신청하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 1~3. 히어로 / 문제 / 해결책 (DETAIL_HTML 주입) ── */}
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
