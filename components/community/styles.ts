// 시설 위탁운영 랜딩 3종 공통 CSS (접두사 cm-) — ops3 상세페이지형 문법 + 데스크톱 2단 폭(글 560 / 데이터 880)
//  · 초록: 큰 면·형광 박스·버튼은 #009519(흰 글자 19px 이상 굵게만), 19px 미만 글자가 올라가는 면은 #007A14
//  · 모션: 기본은 전부 보이는 상태. 지원하는 브라우저에서만 CSS 로 은은한 등장(prefers-reduced-motion 이면 끔)
export const PRETENDARD = "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css";

export const CM_CSS = `
.cm{--g:#009519;--gd:#007A14;--ease:cubic-bezier(.23,1,.32,1);font-family:'Pretendard',-apple-system,BlinkMacSystemFont,system-ui,'Apple SD Gothic Neo','Noto Sans KR',sans-serif;background:#111;color:#fff;word-break:keep-all;overflow-wrap:anywhere;letter-spacing:-.01em;overflow-x:clip}
.cm *{box-sizing:border-box}
.cm :where(h1,h2,h3,h4,p,ul,ol,figure){margin:0;padding:0}
.cm-nw{white-space:nowrap}
.cm ul,.cm ol{list-style:none}
.cm h1,.cm h2{text-wrap:balance}
.cm p{text-wrap:pretty}

/* 블록 — 배경은 화면 전체 폭, 내용은 가운데 기둥(글 560 / 데이터 880) */
.cm-b{position:relative;padding:72px 20px;text-align:center}
.cm-in{max-width:560px;margin:0 auto}
.cm-dk{background:#111;color:#fff}
.cm-wt{background:#fff;color:#111}
.cm-b+.cm-b::before{content:"";position:absolute;left:50%;top:-36px;width:1px;height:72px;background:var(--g);z-index:2}
@media (min-width:1024px){
  .cm-b{padding:120px 32px}
  .cm-in.w{max-width:880px}
  .cm-b+.cm-b::before{top:-48px;height:96px}
}

/* 타입 */
.cm h1,.cm h2{font-size:32px;line-height:1.28;font-weight:900;letter-spacing:-.035em}
.cm-hero h1{font-size:38px;line-height:1.2;letter-spacing:-.04em}
.cm-sub{font-size:20px;line-height:1.4;font-weight:800}
.cm-tx{font-size:18px;line-height:1.65;font-weight:500}
.cm-cap{font-size:14px;line-height:1.55;font-weight:500}
.cm-dk .cm-cap{color:#B9C2BD}
.cm-wt .cm-cap{color:#5B6660}
.cm-hl{display:inline;font-style:normal;background:var(--g);color:#fff;padding:2px 10px;font-weight:900;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.cm-gap{margin-top:32px}
.cm-gap2{margin-top:18px}
.cm-ey{font-size:15px;font-weight:700;color:#C8D3CD;margin-bottom:22px}
.cm-wt .cm-ey{color:var(--gd)}
@media (min-width:768px){
  .cm h1,.cm h2{font-size:42px}
  .cm-hero h1{font-size:60px;line-height:1.15}
  .cm-tx{font-size:20px}
}

/* 큰 숫자 */
.cm-n{display:block;font-size:72px;line-height:1;font-weight:900;letter-spacing:-.045em;font-variant-numeric:tabular-nums;color:var(--g)}
.cm-dk .cm-n{color:#2FBF5F}
.cm-n small{font-size:.38em;font-weight:800;letter-spacing:-.02em;margin-left:4px;color:inherit}
@media (min-width:768px){.cm-n{font-size:104px}}
.cm-em{font-weight:900;color:#2FBF5F;font-variant-numeric:tabular-nums}
.cm-wt .cm-em{color:var(--gd)}
.cm-bigin{font-size:1.9em;line-height:1.1;font-weight:900;letter-spacing:-.04em;color:#2FBF5F;font-variant-numeric:tabular-nums}
.cm-wt .cm-bigin{color:var(--gd)}

/* 버튼 — 19px 800 이상(초록 면 위 흰 글자) */
.cm-btn{display:flex;align-items:center;justify-content:center;width:100%;height:60px;margin-top:40px;border-radius:10px;background:var(--g);color:#fff;font-size:19px;font-weight:800;text-decoration:none;transition:transform 160ms var(--ease),background-color 160ms var(--ease)}
.cm-btn:active{transform:scale(.97)}
@media (hover:hover) and (pointer:fine){.cm-btn:hover{background:var(--gd)}}
@media (min-width:768px){.cm-btn{width:auto;min-width:340px;padding:0 40px;margin-left:auto;margin-right:auto}}

/* 히어로 — 화면 전체 폭 사진 위 */
.cm-hero{padding:88px 20px 72px;overflow:hidden}
.cm-hero-bg{position:absolute;inset:0;background-size:cover;background-position:center;opacity:.4}
.cm-hero-ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(17,17,17,.5),rgba(17,17,17,.94))}
.cm-hero-in{position:relative;z-index:1}
.cm-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:40px}
.cm-st{padding:20px 6px;border-radius:14px;background:rgba(255,255,255,.1)}
.cm-st b{display:block;font-size:34px;font-weight:900;color:#fff;line-height:1.1;letter-spacing:-.04em}
.cm-st span{display:block;margin-top:8px;font-size:14px;line-height:1.4;font-weight:600;color:#DCE3DF}
@media (min-width:768px){.cm-st b{font-size:52px}.cm-st span{font-size:16px}.cm-hero{padding:136px 32px 112px}}

/* 탭 */
.cm-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;max-width:560px;margin:0 auto 40px}
.cm-tab{height:48px;border:0;border-radius:10px;background:rgba(255,255,255,.12);color:#fff;font:inherit;font-size:16px;font-weight:700;cursor:pointer;transition:transform 160ms var(--ease),background-color 160ms var(--ease)}
.cm-tab:active{transform:scale(.97)}
.cm-tab[aria-selected=true]{background:#fff;color:#111}
@media (hover:hover) and (pointer:fine){.cm-tab[aria-selected=false]:hover{background:rgba(255,255,255,.22)}}

/* 숫자 쌍 (A → B) */
.cm-pair{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center}
.cm-pair .cm-n{font-size:56px}
.cm-pair .cm-n small{display:block;margin:8px 0 0;font-size:18px}
.cm-pair .cm-cap{display:block;margin-top:8px}
.cm-pair i{font-style:normal;font-size:32px;font-weight:900;color:#fff}
@media (min-width:768px){.cm-pair .cm-n{font-size:88px}.cm-pair .cm-n small{font-size:22px}.cm-pair i{font-size:44px}}
.cm-split .cm-btn{margin-left:0}

/* 2단(데스크톱) */
.cm-split{display:grid;gap:36px;align-items:center}
@media (min-width:1024px){.cm-split{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:64px;text-align:left}.cm-split .cm-left-d{text-align:left}}

/* 막대 그래픽 */
.cm-bars{--bh:200px;display:flex;align-items:flex-end;justify-content:center;gap:24px;margin-top:40px;padding-bottom:0}
.cm-bc{width:132px;display:flex;flex-direction:column;justify-content:flex-end;align-items:center}
.cm-bc i{display:block;width:100%;height:calc(var(--h) * var(--bh));border-radius:10px 10px 0 0;background:#C9CFCC}
.cm-bc.hi i{background:var(--g)}
.cm-bc b{font-size:26px;font-weight:900;margin-bottom:10px;white-space:nowrap;letter-spacing:-.03em;font-variant-numeric:tabular-nums}
.cm-bc span{margin-top:12px;font-size:16px;font-weight:700;color:#444}
@media (min-width:1024px){.cm-bars{--bh:280px;margin-top:0;gap:32px}.cm-bc{width:170px}.cm-bc b{font-size:34px}}
.cm-delta{margin-top:0}

/* 말풍선 */
.cm-bub{display:flex;margin-top:14px}
.cm-bub.l{justify-content:flex-start}
.cm-bub.r{justify-content:flex-end}
.cm-bub p{max-width:86%;padding:16px 20px;border-radius:20px;font-size:19px;line-height:1.5;font-weight:700;text-align:left}
.cm-bub.l p{background:#fff;color:#111;border-bottom-left-radius:4px}
.cm-bub.r p{background:var(--gd);color:#fff;border-bottom-right-radius:4px}
.cm-bubs{margin-top:36px}

/* 박스·카드 — 외곽선 없이 면의 톤 차이 */
.cm-quote{padding:28px 24px;border-radius:18px;text-align:left;font-size:19px;line-height:1.65;font-weight:600}
.cm-dk .cm-quote{background:#1C1C1C}
.cm-wt .cm-quote{background:#F5F5F5;color:#222}
.cm-quote small{display:block;margin-top:14px;font-size:14px;color:#A9B2AD;font-weight:500}
@media (min-width:768px){.cm-quote{font-size:22px;padding:40px}}
.cm-key{padding:26px 24px;border-radius:18px;background:var(--g);color:#fff;font-size:21px;line-height:1.5;font-weight:800;text-align:left}
@media (min-width:768px){.cm-key{font-size:24px;padding:36px 40px}}
.cm-cards{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;margin-top:36px;text-align:left}
.cm-cards.c2,.cm-cards.c4{grid-template-columns:repeat(2,minmax(0,1fr))}
@media (min-width:1024px){.cm-cards{gap:16px;margin-top:48px}.cm-cards.c3{grid-template-columns:repeat(3,minmax(0,1fr))}.cm-cards.c4{grid-template-columns:repeat(4,minmax(0,1fr))}}
.cm-card{position:relative;padding:24px 22px;border-radius:18px}
.cm-wt .cm-card{background:#F5F5F5;color:#111}
.cm-dk .cm-card{background:#1C1C1C;color:#fff}
.cm-card h3{font-size:20px;line-height:1.4;font-weight:800;letter-spacing:-.02em}
.cm-card h3 em{display:block;margin-bottom:8px;font-style:normal;font-size:15px;font-weight:800;color:var(--gd)}
.cm-dk .cm-card h3 em{color:#2FBF5F}
.cm-card p,.cm-card li{margin-top:10px;font-size:16px;line-height:1.55;font-weight:500}
.cm-wt .cm-card p,.cm-wt .cm-card li{color:#333}
.cm-dk .cm-card p,.cm-dk .cm-card li{color:#D5DCD8}
.cm-card li{position:relative;padding-left:16px}
.cm-card li::before{content:"";position:absolute;left:0;top:.72em;width:6px;height:6px;border-radius:50%;background:var(--g)}
.cm-card .cm-price{margin-top:14px;font-size:28px;line-height:1.25;font-weight:900;letter-spacing:-.03em;color:var(--gd)}
.cm-dk .cm-card .cm-price{color:#2FBF5F}
.cm-badge{display:inline-block;margin-bottom:12px;padding:5px 12px;border-radius:999px;background:var(--gd);color:#fff;font-size:14px;font-weight:800}
.cm-card.rec{background:#EAF6EC;box-shadow:inset 0 0 0 2px var(--g)}
.cm-num{display:flex;align-items:center;justify-content:center;width:36px;height:36px;margin-bottom:12px;border-radius:50%;background:var(--gd);color:#fff;font-size:17px;font-weight:900}
@media (min-width:1024px){.cm-card{padding:32px 28px}.cm-card h3{font-size:24px}.cm-card p,.cm-card li{font-size:17px}.cm-card .cm-price{font-size:36px}}

/* 비교표 */
.cm-tbw{margin-top:40px;border-radius:18px;overflow:hidden;background:#F5F5F5}
.cm-tb{width:100%;border-collapse:collapse;font-size:15px;line-height:1.5;text-align:left}
.cm-tb th,.cm-tb td{padding:16px 14px;vertical-align:top}
.cm-tb tbody tr+tr th,.cm-tb tbody tr+tr td{border-top:1px solid #E1E1E1}
.cm-tb thead th{background:#111;color:#fff;font-weight:800;font-size:15px}
.cm-tb thead th:last-child{background:var(--gd)}
.cm-tb tbody th{width:26%;font-weight:800;color:#111;background:#EDEDED}
.cm-tb td{color:#444;font-weight:500;background:#F5F5F5}
.cm-tb td:last-child{color:#111;font-weight:800;background:#fff}
@media (min-width:1024px){.cm-tb{font-size:19px}.cm-tb th,.cm-tb td{padding:24px 28px}.cm-tb thead th{font-size:18px}}

/* 리스트 */
.cm-ages{margin-top:36px;text-align:left}
.cm-ages li{display:flex;gap:16px;align-items:baseline;padding:18px 0}
.cm-ages li+li{border-top:1px solid rgba(255,255,255,.16)}
.cm-ages b{flex:0 0 72px;font-size:20px;color:#2FBF5F;font-weight:900}
.cm-ages span{font-size:19px;font-weight:600;color:#fff}
@media (min-width:1024px){.cm-ages{margin-top:0}.cm-ages b{flex-basis:96px;font-size:24px}.cm-ages span{font-size:22px}}
.cm-chk{margin-top:32px;text-align:left}
.cm-chk li{position:relative;padding:14px 0 14px 40px;font-size:19px;line-height:1.5;font-weight:700}
.cm-chk li::before{content:"";position:absolute;left:4px;top:19px;width:18px;height:10px;border-left:4px solid var(--g);border-bottom:4px solid var(--g);transform:rotate(-45deg)}
.cm-steps{margin-top:36px;text-align:left;counter-reset:s}
.cm-steps li{position:relative;padding:0 0 28px 60px;font-size:20px;line-height:1.45;font-weight:800;counter-increment:s}
.cm-steps li::before{content:counter(s);position:absolute;left:0;top:-3px;width:40px;height:40px;border-radius:50%;background:var(--gd);color:#fff;text-align:center;line-height:40px;font-size:18px;font-weight:900}
.cm-steps li::after{content:"";position:absolute;left:19px;top:42px;bottom:2px;width:2px;background:rgba(0,149,25,.4)}
.cm-steps li:last-child{padding-bottom:0}
.cm-steps li:last-child::after{display:none}
.cm-steps li span{display:block;margin-top:6px;font-size:16px;font-weight:500;color:#C5CEC9}
.cm-wt .cm-steps li span{color:#555}

/* 캘린더 */
.cm-cal{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:40px}
.cm-cal div{padding:22px 0;border-radius:12px;font-size:19px;font-weight:800;background:#E4EEE9;color:#4A5C52}
.cm-cal div.on{background:var(--gd);color:#fff}
@media (min-width:1024px){.cm-cal{grid-template-columns:repeat(6,minmax(0,1fr));gap:12px}.cm-cal div{padding:34px 0;font-size:24px}}

/* 리포트 — 숫자 타일 */
.cm-rep{position:relative;margin-top:40px;padding:28px 22px;border-radius:20px;background:#fff;color:#111;text-align:left}
.cm-dk .cm-rep{background:#F5F5F5}
.cm-wt .cm-rep{background:#F5F5F5}
.cm-rep-t{padding-right:92px;font-size:20px;font-weight:900;line-height:1.4;letter-spacing:-.02em}
.cm-rep-badge{position:absolute;right:20px;top:24px;padding:5px 12px;border-radius:999px;background:#111;color:#fff;font-size:14px;font-weight:800}
.cm-rep-g{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:22px}
.cm-rep-r{padding:18px 16px;border-radius:14px;background:#fff}
.cm-rep-r span{display:block;font-size:15px;font-weight:600;color:#444}
.cm-rep-r b{display:block;margin-top:8px;font-size:34px;line-height:1.1;font-weight:900;letter-spacing:-.04em;color:var(--gd);white-space:nowrap}
@media (min-width:1024px){.cm-rep{padding:44px 44px}.cm-rep-t{font-size:26px}.cm-rep-g{grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-top:32px}.cm-rep-r{padding:26px 22px}.cm-rep-r b{font-size:52px}.cm-rep-r span{font-size:17px}}

/* 플레이스홀더 */
.cm-ph{display:flex;align-items:center;justify-content:center;min-height:140px;margin-top:16px;padding:18px;border:2px dashed #9BA7A1;border-radius:18px;font-size:18px;font-weight:700;color:#4F5A54}
.cm-dk .cm-ph{border-color:rgba(255,255,255,.34);color:#C3CCC7}
@media (min-width:1024px){.cm-ph{min-height:200px}}

/* 사진 */
.cm-photo{display:block;width:100%;height:auto;margin-top:36px;border-radius:18px;object-fit:cover}
.cm-split .cm-photo{margin-top:0}

/* FAQ */
.cm-faq{margin-top:36px;text-align:left}
.cm-faq details{border-bottom:1px solid #DADADA}
.cm-dk .cm-faq details{border-color:rgba(255,255,255,.18)}
.cm-faq summary{position:relative;padding:22px 40px 22px 0;list-style:none;cursor:pointer;font-size:19px;line-height:1.45;font-weight:800;transition:color 160ms var(--ease)}
.cm-faq summary::-webkit-details-marker{display:none}
.cm-faq summary::after{content:"+";position:absolute;right:4px;top:16px;font-size:28px;font-weight:500;color:var(--g);transition:transform 200ms var(--ease)}
.cm-faq details[open] summary::after{transform:rotate(45deg)}
.cm-faq p{padding:0 0 22px;font-size:17px;line-height:1.65;font-weight:500}
.cm-wt .cm-faq p{color:#444}
.cm-dk .cm-faq p{color:#D5DCD8}
@media (min-width:1024px){.cm-faq summary{font-size:21px}.cm-faq p{font-size:18px}}

/* 폼 */
.cm-formcard{margin-top:36px;padding:28px 22px;border-radius:20px;background:#fff;color:#111;text-align:left}
.cm-group{margin-bottom:22px}
.cm-label{display:block;margin-bottom:10px;font-size:16px;font-weight:800;color:#111}
.cm-req{color:#D6303A}
.cm-input,.cm-select,.cm-ta{width:100%;height:52px;padding:0 14px;border:1px solid #C9CFCC;border-radius:10px;background:#fff;color:#111;font:inherit;font-size:16px}
.cm-input::placeholder,.cm-ta::placeholder{color:#6B716E}
.cm-ta{height:auto;min-height:120px;padding:14px;resize:vertical;line-height:1.5}
.cm-input:focus,.cm-select:focus,.cm-ta:focus{outline:2px solid var(--g);outline-offset:0;border-color:var(--g)}
.cm-radio{display:flex;align-items:center;gap:12px;padding:13px 14px;margin-bottom:8px;border:1px solid #E1E5E3;border-radius:10px;font-size:16px;font-weight:600;cursor:pointer;transition:background-color 160ms var(--ease)}
.cm-radio input{width:20px;height:20px;accent-color:var(--g);flex:0 0 auto}
@media (hover:hover) and (pointer:fine){.cm-radio:hover{background:#F5F5F5}}
.cm-sec{margin:8px 0 22px;padding:18px;border-radius:14px;background:#F5F5F5}
.cm-sec-t{margin-bottom:14px;font-size:15px;font-weight:800;color:var(--gd)}
.cm-sec .cm-group{margin-bottom:14px}
.cm-sec .cm-group:last-child{margin-bottom:0}
.cm-agree{display:flex;gap:12px;align-items:flex-start;margin:6px 0 22px;font-size:15px;line-height:1.5;font-weight:600;color:#333}
.cm-agree input{width:20px;height:20px;margin-top:1px;accent-color:var(--g);flex:0 0 auto}
.cm-submit{display:flex;align-items:center;justify-content:center;width:100%;height:60px;border:0;border-radius:10px;background:var(--g);color:#fff;font:inherit;font-size:19px;font-weight:800;cursor:pointer;transition:transform 160ms var(--ease),background-color 160ms var(--ease)}
.cm-submit:active:not(:disabled){transform:scale(.97)}
.cm-submit:disabled{opacity:.6;cursor:default}
@media (hover:hover) and (pointer:fine){.cm-submit:hover:not(:disabled){background:var(--gd)}}
.cm-err{margin:0 0 14px;font-size:15px;font-weight:700;color:#D6303A}
.cm-done{padding:44px 8px;text-align:center}
.cm-done b{display:block;font-size:24px;font-weight:900;color:#111}
.cm-done span{display:block;margin-top:12px;font-size:17px;line-height:1.6;font-weight:600;color:#444}

/* 하단 고정 CTA (모바일) */
.cm-spacer{height:0}
.cm-bar{display:none}
@media (max-width:640px){
  .cm-spacer{height:84px;background:#111}
  .cm-bar{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:60;align-items:center;justify-content:center;height:76px;padding:0 16px;background:rgba(17,17,17,.97);transition:transform 220ms var(--ease),opacity 220ms var(--ease)}
  .cm-bar.off{transform:translateY(100%);opacity:0;pointer-events:none}
  .cm-bar a{display:flex;align-items:center;justify-content:center;width:100%;max-width:520px;height:54px;border-radius:10px;background:var(--g);color:#fff;font-size:19px;font-weight:800;text-decoration:none;transition:transform 160ms var(--ease)}
  .cm-bar a:active{transform:scale(.97)}
}
@media (max-width:360px){.cm h1,.cm h2{font-size:28px}.cm-hero h1{font-size:36px}}

/* 등장 — 기본은 전부 보이는 상태. JS 가 돌면 화면 아래 요소만 잠시 숨겼다가 들어올 때 한 번 올라온다(transform·opacity, 끝나면 원래 스타일로 복귀) */
@keyframes cm-rise{from{opacity:0;transform:translateY(18px)}}
@media (prefers-reduced-motion:no-preference){
  .cm-hero-in>*{animation:cm-rise 560ms var(--ease) backwards}
  .cm-hero-in>*:nth-child(2){animation-delay:60ms}
  .cm-hero-in>*:nth-child(3){animation-delay:120ms}
  .cm-hero-in>*:nth-child(4){animation-delay:180ms}
  .cm-hero-in>*:nth-child(5){animation-delay:240ms}
  .cm-anim .cm-b:not(.cm-hero) .cm-in>*:not([data-seen]){opacity:0}
  .cm-anim .cm-b:not(.cm-hero) .cm-in>*[data-seen]{animation:cm-rise 560ms var(--ease) var(--d,0ms) backwards}
}
`;
