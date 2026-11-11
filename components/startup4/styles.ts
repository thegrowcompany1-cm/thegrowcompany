// 창업 신규 랜딩 2종 공통 스타일 — 접두사(p)로 페이지별 격리 (stk- 인수창업 / slc- 입지상권)
// 신청 폼(ApplyForm) 스타일 — /consulting/startup 은 이것만 따로 주입한다 (본문 스타일은 baseCss)
export const formCss = (p: string) => `
/* 폼 - 기존 창업 폼 톤(흰 카드) */
.${p}-formsec{padding:56px 0 72px;background:linear-gradient(180deg,#0c0f0d,#12301a)}
.${p}-formcard{background:#fff;border-radius:20px;padding:26px 20px 22px;color:#111;box-shadow:0 20px 50px rgba(0,0,0,.35)}
.${p}-formhead{font-size:22px;font-weight:900;color:#1a1a1a;text-align:center;padding-bottom:18px;margin-bottom:18px;border-bottom:2px solid #e8f5e9;letter-spacing:-.02em}
.${p}-group{margin-bottom:20px}
.${p}-label{display:block;font-size:15px;font-weight:700;color:#111;margin-bottom:8px;line-height:1.5}
.${p}-label small{font-size:13px;font-weight:400;color:#777}
.${p}-req{color:#e53935}
.${p}-input{width:100%;min-height:48px;padding:12px 14px;font-size:16px;color:#111;background:#fff;border:2px solid #e2e5e3;border-radius:10px;font-family:inherit}
.${p}-input::placeholder{color:#999}
.${p}-input:focus{outline:none;border-color:#4CAF50}
.${p}-phone-row{display:flex;align-items:center;gap:6px}
.${p}-phone-row .${p}-input{flex:1 1 0;min-width:0;text-align:center;padding:12px 4px}
.${p}-dash{color:#aaa;font-size:16px}
.${p}-radio{display:flex;align-items:center;gap:10px;margin-bottom:8px;padding:11px 14px;background:#f5f7f6;border:2px solid transparent;border-radius:10px;font-size:15px;color:#111;cursor:pointer}
.${p}-radio:hover{background:#e8f5e9;border-color:#4CAF50}
.${p}-radio input{width:18px;height:18px;accent-color:#4CAF50;flex:none}
.${p}-actions{text-align:center;margin-top:26px}
.${p}-submit{width:100%;min-height:56px;padding:0 20px;background:linear-gradient(135deg,#4CAF50,#2e7d32);color:#fff;border:0;border-radius:100px;font-size:17px;font-weight:800;cursor:pointer;box-shadow:0 8px 25px rgba(76,175,80,.3);font-family:inherit}
.${p}-submit:disabled{opacity:.55;cursor:not-allowed}
.${p}-err{margin:14px 0 0;font-size:14px;color:#d32f2f;text-align:center;line-height:1.5}
.${p}-notice{margin-top:20px;padding:14px;background:#f5f7f6;border-radius:12px;text-align:center}
.${p}-notice p{margin:0;font-size:14px;line-height:1.7;color:#777}
.${p}-notice strong{color:#2e7d32}
.${p}-done{padding:34px 8px;text-align:center}
.${p}-done b{display:block;font-size:22px;color:#2e7d32;margin-bottom:10px}
.${p}-done span{font-size:16px;line-height:1.7;color:#555}
.${p}-done strong{color:#2e7d32}

`;

export const baseCss = (p: string) => `
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css');
.${p}-root{--bg:#0a0d0b;--bg2:#101512;--bg3:#161c18;--line:rgba(255,255,255,.1);--tx:#eef2ef;--mu:#9aa8a1;--gr:#4fcf5f;--gr2:#2e9d3c;--rd:#e8695f;--am:#e6b04b;
  font-family:'Pretendard Variable','Pretendard','Noto Sans KR',sans-serif;background:var(--bg);color:var(--tx);word-break:keep-all;line-break:strict;-webkit-font-smoothing:antialiased;font-size:16px;line-height:1.7}
.${p}-root *{box-sizing:border-box}
:where(.${p}-root) :is(h1,h2,h3,p,ul,ol,figure,blockquote){margin:0;padding:0}
.${p}-root em{font-style:normal;color:var(--gr)}
.${p}-wrap{max-width:1120px;margin:0 auto;padding:0 22px}
@media(min-width:768px){.${p}-wrap{padding:0 40px}}

/* 스크롤 등장 - 스크립트가 켜진 경우에만 숨겼다가 보여 준다 */
.${p}-js .${p}-rv{opacity:0;transform:translateY(22px);transition:opacity .75s cubic-bezier(.2,.7,.2,1),transform .75s cubic-bezier(.2,.7,.2,1)}
.${p}-js .${p}-rv.in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){.${p}-js .${p}-rv{opacity:1;transform:none;transition:none}.${p}-fill{transition:none!important}}

/* 섹션 공통 */
.${p}-sec{padding:84px 0;border-top:1px solid var(--line)}
.${p}-sec.alt{background:var(--bg2)}
@media(min-width:768px){.${p}-sec{padding:128px 0}}
.${p}-eyebrow{display:flex;align-items:center;gap:12px;font-size:13px;font-weight:700;letter-spacing:.02em;color:var(--gr);margin-bottom:18px}
.${p}-eyebrow b{font-weight:800;color:#fff;opacity:.55}
.${p}-eyebrow::after{content:'';flex:0 0 36px;height:1px;background:var(--gr);opacity:.6}
.${p}-h2{font-size:clamp(26px,6.6vw,46px);font-weight:800;line-height:1.28;letter-spacing:-.035em;color:#fff;max-width:760px}
.${p}-lead{font-size:16.5px;line-height:1.8;color:var(--mu);max-width:640px;margin-top:20px}
.${p}-head{margin-bottom:44px}
@media(min-width:768px){.${p}-head{margin-bottom:64px}.${p}-lead{font-size:18px}}
.${p}-note{font-size:13px;line-height:1.65;color:#7c8a83;margin-top:18px}

/* 히어로 */
.${p}-hero{min-height:calc(100svh - 80px);display:flex;align-items:center;padding:56px 0 48px;background:radial-gradient(110% 80% at 85% 0%,rgba(46,157,60,.28) 0%,rgba(10,13,11,0) 60%),var(--bg)}
.${p}-kicker{display:inline-block;font-size:13px;font-weight:700;color:var(--gr);padding:7px 14px;border:1px solid rgba(79,207,95,.38);border-radius:100px;margin-bottom:26px}
.${p}-h1{font-size:clamp(31px,8.6vw,68px);font-weight:800;line-height:1.2;letter-spacing:-.04em;color:#fff}
.${p}-h1 span{display:block}
.${p}-sub{font-size:16.5px;line-height:1.8;color:#b3bfb8;margin-top:24px;max-width:560px}
@media(min-width:768px){.${p}-sub{font-size:19px;margin-top:30px}}
.${p}-cta-row{display:flex;flex-direction:column;align-items:flex-start;gap:16px;margin-top:34px}
@media(min-width:520px){.${p}-cta-row{flex-direction:row;align-items:center;gap:26px}}
.${p}-cta{display:inline-flex;align-items:center;justify-content:center;min-height:58px;padding:0 32px;border:0;border-radius:100px;background:linear-gradient(135deg,#4fcf5f,#2e9d3c);color:#06210b;font-size:17px;font-weight:800;cursor:pointer;box-shadow:0 10px 30px rgba(79,207,95,.28);font-family:inherit;transition:transform .2s,filter .2s}
.${p}-cta:hover{transform:translateY(-2px);filter:brightness(1.06)}
.${p}-ghost{font-size:15px;font-weight:700;color:#cfd8d3;text-decoration:none;border-bottom:1px solid rgba(255,255,255,.35);padding-bottom:3px}
.${p}-ghost:hover{color:#fff;border-color:#fff}
.${p}-hero-grid{display:grid;gap:44px}
@media(min-width:960px){.${p}-hero-grid{grid-template-columns:1.15fr .85fr;align-items:center;gap:72px}}

/* 히어로 개념도 */
.${p}-viz{border:1px solid var(--line);border-radius:18px;padding:22px 20px;background:rgba(255,255,255,.03)}
.${p}-viz-t{font-size:13px;font-weight:700;color:var(--mu);margin-bottom:16px}
.${p}-vrow{margin-bottom:16px}
.${p}-vrow:last-of-type{margin-bottom:0}
.${p}-vlab{font-size:14px;font-weight:700;color:#dfe6e2;margin-bottom:8px;display:flex;justify-content:space-between;gap:10px}
.${p}-vtrack{height:14px;border-radius:7px;background:rgba(255,255,255,.07);overflow:hidden}
.${p}-vfill{display:block;height:100%;border-radius:7px;width:var(--w);transition:width 1.1s cubic-bezier(.2,.7,.2,1) .25s}
.${p}-js .${p}-viz:not(.in) .${p}-vfill{width:0}
.${p}-vfill.g{background:linear-gradient(90deg,#2e9d3c,#4fcf5f)}
.${p}-vfill.a{background:linear-gradient(90deg,#b8862b,#e6b04b)}
.${p}-vfill.r{background:linear-gradient(90deg,#b8463d,#e8695f)}
.${p}-vcap{font-size:12.5px;color:#7c8a83;margin-top:16px}
.${p}-chips{display:flex;flex-wrap:wrap;gap:8px}
.${p}-chip{font-size:14px;font-weight:700;padding:8px 14px;border-radius:100px;border:1px solid var(--line);color:#dfe6e2}
.${p}-chip.x{color:#8d9a93;text-decoration:line-through;text-decoration-color:var(--rd)}
.${p}-chip.o{border-color:rgba(79,207,95,.5);color:var(--gr)}
.${p}-vdiv{height:1px;background:var(--line);margin:20px 0}

/* 편집형 행 리스트 (위험·변수) */
.${p}-rows{border-top:1px solid var(--line)}
.${p}-row{display:grid;gap:10px;padding:28px 0;border-bottom:1px solid var(--line)}
.${p}-rn{font-size:15px;font-weight:800;color:var(--gr)}
.${p}-rt{font-size:clamp(21px,5.2vw,30px);font-weight:800;line-height:1.35;letter-spacing:-.03em;color:#fff}
.${p}-rd{font-size:16px;line-height:1.8;color:var(--mu)}
@media(min-width:900px){.${p}-row{grid-template-columns:72px 1fr 1.15fr;gap:40px;padding:38px 0;align-items:start}}

/* 흔한 판단 → 실제 */
.${p}-wrong{font-size:clamp(20px,5vw,28px);font-weight:800;line-height:1.4;letter-spacing:-.03em;color:#7d8a83;text-decoration:line-through;text-decoration-color:var(--rd);text-decoration-thickness:2px}
.${p}-tag{display:block;font-size:12.5px;font-weight:800;letter-spacing:.02em;color:var(--mu);margin-bottom:8px}
.${p}-tag.g{color:var(--gr)}
.${p}-fix{font-size:16px;line-height:1.8;color:#cdd7d2}
.${p}-row.pair{padding:30px 0}
@media(min-width:900px){.${p}-row.pair{grid-template-columns:1fr 1.1fr;gap:56px}}

/* 시뮬레이션 */
.${p}-sims{display:grid;gap:18px}
@media(min-width:900px){.${p}-sims{grid-template-columns:1fr 1fr;gap:24px}}
.${p}-sim{border:1px solid var(--line);border-radius:20px;padding:26px 22px;background:var(--bg3)}
@media(min-width:768px){.${p}-sim{padding:34px 32px}}
.${p}-sim-h{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:22px}
.${p}-sim-n{font-size:18px;font-weight:800;color:#fff}
.${p}-sim-s{font-size:13px;color:var(--mu)}
.${p}-stack{display:flex;height:46px;border-radius:10px;overflow:hidden;background:rgba(255,255,255,.06)}
.${p}-seg{display:block;height:100%;width:var(--w);transition:width 1.1s cubic-bezier(.2,.7,.2,1) .2s}
.${p}-js .${p}-sim:not(.in) .${p}-seg{width:0}
.${p}-seg.r{background:#c4564d}.${p}-seg.a{background:#c9962f}.${p}-seg.g{background:#3ba94a}
.${p}-leg{list-style:none;margin-top:20px}
.${p}-leg li{display:flex;align-items:center;gap:10px;padding:11px 0;border-bottom:1px solid var(--line);font-size:15px;color:#cdd7d2}
.${p}-leg li:last-child{border-bottom:0}
.${p}-dot{flex:none;width:10px;height:10px;border-radius:3px}
.${p}-dot.r{background:#c4564d}.${p}-dot.a{background:#c9962f}.${p}-dot.g{background:#3ba94a}.${p}-dot.w{background:#e9efeb}
.${p}-leg b{margin-left:auto;font-size:16px;font-weight:800;color:#fff;white-space:nowrap}
.${p}-res{margin-top:22px;padding-top:20px;border-top:1px dashed var(--line)}
.${p}-res small{display:block;font-size:13px;color:var(--mu);margin-bottom:4px}
.${p}-res strong{display:block;font-size:clamp(26px,6.4vw,36px);font-weight:800;letter-spacing:-.03em;color:#fff}
.${p}-res strong.bad{color:var(--rd)}
.${p}-formula{margin-top:26px;padding:18px 20px;border-radius:14px;background:rgba(79,207,95,.07);border:1px solid rgba(79,207,95,.22);font-size:15px;line-height:1.8;color:#cfe6d3}

/* 표 (모바일에서는 항목별 카드형으로 전환) */
.${p}-tbl{border:1px solid var(--line);border-radius:18px;overflow:hidden;background:var(--bg3)}
.${p}-th{display:none}
.${p}-tr{display:block;padding:20px 20px;border-top:1px solid var(--line)}
.${p}-tr:first-of-type{border-top:0}
.${p}-td{display:block;font-size:15px;line-height:1.7;color:#cdd7d2;padding:2px 0}
.${p}-td+.${p}-td{margin-top:10px}
.${p}-td::before{content:attr(data-l);display:block;font-size:12px;font-weight:800;color:var(--gr);margin-bottom:2px}
.${p}-td.k{font-size:17px;font-weight:800;color:#fff}
.${p}-td.k::before{display:none}
.${p}-td.hl{color:#fff}
@media(min-width:900px){
  .${p}-th{display:grid;grid-template-columns:var(--cols);gap:28px;padding:16px 28px;background:rgba(255,255,255,.04);font-size:13px;font-weight:800;color:var(--mu)}
  .${p}-th span.hl{color:var(--gr)}
  .${p}-tr{display:grid;grid-template-columns:var(--cols);gap:28px;padding:24px 28px;align-items:start}
  .${p}-td{padding:0}
  .${p}-td+.${p}-td{margin-top:0}
  .${p}-td::before{display:none}
  .${p}-td.k{font-size:16px}
}
.${p}-td.hl{background:none}
@media(min-width:900px){.${p}-td.hl{color:#e9f8ec}}

/* 진행 단계 */
.${p}-steps{list-style:none;position:relative}
.${p}-step{display:grid;grid-template-columns:48px 1fr;gap:18px;padding:0 0 38px;position:relative}
.${p}-step:last-child{padding-bottom:0}
.${p}-step::before{content:'';position:absolute;left:23px;top:46px;bottom:-2px;width:1px;background:var(--line)}
.${p}-step:last-child::before{display:none}
.${p}-sn{width:46px;height:46px;border-radius:50%;border:1px solid rgba(79,207,95,.5);display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:var(--gr);background:var(--bg)}
.${p}-st{font-size:clamp(20px,5vw,26px);font-weight:800;color:#fff;letter-spacing:-.03em;line-height:1.4;padding-top:7px}
.${p}-sd{font-size:16px;line-height:1.8;color:var(--mu);margin-top:6px;max-width:620px}
@media(min-width:900px){.${p}-step{grid-template-columns:64px 1fr;gap:28px;padding-bottom:48px}.${p}-step::before{left:31px;top:64px}.${p}-sn{width:62px;height:62px;font-size:18px}.${p}-st{padding-top:14px}}

/* 신뢰 구간 */
.${p}-proof{display:grid;gap:44px}
@media(min-width:960px){.${p}-proof{grid-template-columns:1fr 1fr;gap:80px;align-items:start}}
.${p}-big{font-size:clamp(54px,16vw,110px);font-weight:800;line-height:1;letter-spacing:-.05em;color:#fff}
.${p}-big em{display:block;font-size:clamp(16px,4vw,20px);letter-spacing:-.01em;font-weight:700;margin-bottom:14px}
.${p}-ptext{font-size:17px;line-height:1.85;color:#c3cec8;margin-top:24px}
.${p}-ptext+.${p}-ptext{margin-top:16px}
.${p}-quote{margin-top:30px;padding:24px 22px;border-left:3px solid var(--gr);background:rgba(255,255,255,.03);border-radius:0 14px 14px 0}
.${p}-quote p{font-size:17px;line-height:1.8;color:#e5ece8}
.${p}-quote cite{display:block;font-style:normal;font-size:13.5px;color:var(--mu);margin-top:12px}
.${p}-vid{max-width:300px}
.${p}-vidbox{position:relative;aspect-ratio:9/16;border-radius:18px;overflow:hidden;background:#000;border:1px solid var(--line)}
.${p}-vidbox img,.${p}-vidbox video{width:100%;height:100%;object-fit:cover;display:block}
.${p}-play{position:absolute;inset:0;border:0;background:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.55));cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit}
.${p}-play span{width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,.92);display:flex;align-items:center;justify-content:center}
.${p}-vcap2{font-size:15px;font-weight:700;color:#dfe6e2;margin-top:14px;line-height:1.5}
.${p}-vsub{font-size:13px;color:#7c8a83;margin-top:4px}
.${p}-ph{margin:0}
.${p}-ph img{width:100%;height:auto;display:block;border-radius:16px;border:1px solid var(--line);background:var(--bg3)}
.${p}-ph figcaption{font-size:13px;color:#7c8a83;margin-top:10px;line-height:1.6}
.${p}-split{display:grid;gap:36px}
@media(min-width:900px){.${p}-split{grid-template-columns:.8fr 1.2fr;gap:72px;align-items:start}.${p}-split.rev{grid-template-columns:1.2fr .8fr}}
.${p}-ph.tall img{aspect-ratio:3/4;object-fit:cover;max-height:560px}

/* 결과 항목 */
.${p}-trio{display:grid;gap:14px}
@media(min-width:900px){.${p}-trio{grid-template-columns:repeat(3,1fr);gap:20px}}
.${p}-tri{border:1px solid var(--line);border-radius:18px;padding:28px 24px;background:var(--bg3);position:relative;overflow:hidden}
.${p}-tri::before{content:'';position:absolute;left:0;top:0;right:0;height:4px;background:var(--c)}
.${p}-tri h3{font-size:clamp(20px,5vw,24px);font-weight:800;color:#fff;letter-spacing:-.03em;line-height:1.4}
.${p}-tri p{font-size:15.5px;line-height:1.75;color:var(--mu);margin-top:10px}
.${p}-list{list-style:none;margin-top:36px;border-top:1px solid var(--line)}
.${p}-list li{display:flex;gap:14px;padding:18px 0;border-bottom:1px solid var(--line);font-size:17px;font-weight:700;color:#e5ece8;line-height:1.55}
.${p}-list li::before{content:'';flex:none;width:8px;height:8px;border-radius:50%;background:var(--gr);margin-top:10px}

/* FAQ */
.${p}-faq{border-top:1px solid var(--line)}
.${p}-faq details{border-bottom:1px solid var(--line)}
.${p}-faq summary{list-style:none;cursor:pointer;padding:24px 44px 24px 0;font-size:clamp(17px,4.4vw,21px);font-weight:700;color:#fff;line-height:1.5;position:relative;letter-spacing:-.02em}
.${p}-faq summary::-webkit-details-marker{display:none}
.${p}-faq summary::after{content:'+';position:absolute;right:4px;top:50%;transform:translateY(-50%);font-size:26px;font-weight:400;color:var(--gr);transition:transform .25s}
.${p}-faq details[open] summary::after{transform:translateY(-50%) rotate(45deg)}
.${p}-faq details p{padding:0 0 26px;font-size:16px;line-height:1.85;color:var(--mu);max-width:720px}

/* 상담 안내 */
.${p}-prep{display:grid;gap:14px;margin-bottom:40px}
@media(min-width:900px){.${p}-prep{grid-template-columns:repeat(3,1fr);gap:20px}}
.${p}-pb{border:1px solid rgba(255,255,255,.14);border-radius:16px;padding:22px 22px;background:rgba(255,255,255,.04)}
.${p}-pb h3{font-size:16px;font-weight:800;color:var(--gr);margin-bottom:12px}
.${p}-pb ol,.${p}-pb ul{list-style:none}
.${p}-pb li{font-size:15px;line-height:1.7;color:#d3dcd7;padding:5px 0 5px 18px;position:relative}
.${p}-pb li::before{content:'';position:absolute;left:0;top:15px;width:6px;height:6px;border-radius:50%;background:rgba(79,207,95,.7)}
.${p}-formtitle{font-size:clamp(26px,6.6vw,42px);font-weight:800;letter-spacing:-.035em;color:#fff;line-height:1.3;margin-bottom:12px}
.${p}-formsub{font-size:16.5px;color:#b3bfb8;line-height:1.8;margin-bottom:34px;max-width:620px}
.${p}-formbox{max-width:620px}

${formCss(p)}
/* 다른 창업 서비스 */
.${p}-other{padding:64px 0 72px;background:#f4f6f5;color:#1a1a1a}
.${p}-other .${p}-h2{color:#1a1a1a;font-size:clamp(22px,5.6vw,30px);margin-bottom:10px}
.${p}-bridge{margin:0 0 22px;font-size:16px;line-height:1.6;color:#4a5550;font-weight:600}
.${p}-cards{display:grid;grid-template-columns:1fr;gap:12px;margin-top:22px}
.${p}-card{display:block;padding:20px 20px 18px;background:#fff;border:1px solid #dfe5e1;border-radius:14px;text-decoration:none;color:#1a1a1a;transition:border-color .2s,transform .2s}
.${p}-card:hover{border-color:#009519;transform:translateY(-2px)}
.${p}-card b{display:block;font-size:18px;font-weight:800;margin-bottom:6px;letter-spacing:-.02em}
.${p}-card span{display:block;font-size:14.5px;line-height:1.55;color:#66716b}
.${p}-ext{width:14px;height:14px;fill:currentColor;vertical-align:-2px;margin-left:5px}
.${p}-card i{display:block;margin-top:10px;font-style:normal;font-size:14px;font-weight:700;color:#009519}

/* 하단 고정 바 */
.${p}-bar{position:fixed;left:0;right:0;bottom:0;z-index:50;background:#009519;color:#fff;border:0;box-shadow:0 -4px 20px rgba(0,0,0,.18);transition:transform .3s ease;padding-bottom:env(safe-area-inset-bottom);font-family:inherit;cursor:pointer;width:100%}
.${p}-bar span{display:flex;min-height:60px;align-items:center;justify-content:center;font-size:17px;font-weight:800}
.${p}-bar.off{transform:translateY(100%);pointer-events:none}
.${p}-spacer{height:calc(60px + env(safe-area-inset-bottom))}


@media(min-width:768px){
  .${p}-bar,.${p}-spacer{display:none}
  .${p}-cards{grid-template-columns:repeat(3,1fr)}
  .${p}-formcard{padding:34px 34px 28px}
}
`;
