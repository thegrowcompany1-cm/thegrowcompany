// 시설 위탁운영 랜딩 3종 공통 CSS (접두사 cm-) — ops3(/edu/sales-ops3) 상세페이지형 문법
export const PRETENDARD = "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css";

export const CM_CSS = `
.cm{--g:#22B573;--gd:#007A14;font-family:'Pretendard',-apple-system,BlinkMacSystemFont,system-ui,'Apple SD Gothic Neo','Noto Sans KR',sans-serif;background:#111;color:#fff;word-break:keep-all;overflow-wrap:anywhere;letter-spacing:-.01em;overflow-x:clip}
.cm *{box-sizing:border-box}
.cm-col{max-width:480px;margin:0 auto;background:#111}
.cm-b{position:relative;padding:56px 20px;text-align:center}
.cm-dk{background:#111;color:#fff}
.cm-wt{background:#fff;color:#111}
.cm-b+.cm-b::before{content:"";position:absolute;left:50%;top:-30px;width:1px;height:60px;background:var(--g);z-index:2}
.cm h1,.cm h2,.cm h3,.cm h4,.cm p,.cm ul,.cm ol,.cm figure{margin:0;padding:0}
.cm ul,.cm ol{list-style:none}
.cm h1,.cm h2{font-size:30px;line-height:1.3;font-weight:900;letter-spacing:-.03em}
.cm-sub{font-size:20px;line-height:1.4;font-weight:800}
.cm-tx{font-size:17px;line-height:1.65;font-weight:500}
.cm-cap{font-size:14px;line-height:1.5;font-weight:500}
.cm-dk .cm-cap{color:#B9C2BD}
.cm-wt .cm-cap{color:#666}
.cm-hl{display:inline;font-style:normal;background:var(--g);color:#fff;padding:2px 10px;font-weight:900;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.cm-gap{margin-top:28px}
.cm-gap2{margin-top:16px}
.cm-ey{font-size:14px;font-weight:700;color:#C8D3CD;margin-bottom:22px}
.cm-wt .cm-ey{color:var(--gd)}
.cm-btn{display:flex;align-items:center;justify-content:center;width:100%;height:58px;margin-top:36px;border-radius:8px;background:var(--g);color:#fff;font-size:18px;font-weight:800;text-decoration:none}
.cm-left{text-align:left}

/* 히어로 */
.cm-hero{padding:72px 20px 56px;background:#111;overflow:hidden}
.cm-hero-bg{position:absolute;inset:0;background-size:cover;background-position:center;opacity:.38}
.cm-hero-ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(17,17,17,.55),rgba(17,17,17,.92))}
.cm-hero-in{position:relative;z-index:1}
.cm-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:32px}
.cm-st{padding:14px 6px;border:1px solid rgba(255,255,255,.2);border-radius:12px;background:rgba(0,0,0,.35)}
.cm-st b{display:block;font-size:20px;font-weight:900;color:var(--g);line-height:1.2}
.cm-st span{display:block;margin-top:6px;font-size:12px;line-height:1.4;font-weight:600;color:#D5DCD8}

/* 탭 */
.cm-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-bottom:30px}
.cm-tab{height:44px;border:1px solid rgba(255,255,255,.25);border-radius:8px;background:transparent;color:#fff;font:inherit;font-size:15px;font-weight:700;cursor:pointer}
.cm-tab[aria-selected=true]{background:var(--g);border-color:var(--g);color:#fff}

/* 막대 그래픽 */
.cm-bars{display:flex;align-items:flex-end;justify-content:center;gap:28px;height:210px;margin-top:32px}
.cm-bc{width:112px;display:flex;flex-direction:column;justify-content:flex-end;align-items:center}
.cm-bc i{display:block;width:100%;border-radius:8px 8px 0 0;background:#C9CFCC}
.cm-bc.hi i{background:var(--g)}
.cm-bc b{font-size:18px;font-weight:900;margin-bottom:8px;white-space:nowrap}
.cm-bc span{margin-top:10px;font-size:14px;font-weight:700;color:#444}
.cm-chip{display:inline-block;margin-top:24px;padding:10px 16px;border-radius:999px;background:#F5F5F5;font-size:15px;font-weight:800;color:#111}

/* 말풍선 */
.cm-bub{display:flex;margin-top:14px}
.cm-bub.l{justify-content:flex-start}
.cm-bub.r{justify-content:flex-end}
.cm-bub p{max-width:84%;padding:14px 18px;border-radius:18px;font-size:17px;line-height:1.5;font-weight:700;text-align:left}
.cm-bub.l p{background:#fff;color:#111;border-bottom-left-radius:4px}
.cm-bub.r p{background:var(--g);color:#fff;border-bottom-right-radius:4px}
.cm-bubs{margin-top:30px}

/* 박스·카드 */
.cm-quote{padding:22px 20px;border-radius:16px;text-align:left;font-size:16px;line-height:1.65;font-weight:600}
.cm-dk .cm-quote{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16)}
.cm-wt .cm-quote{background:#F5F5F5;color:#222}
.cm-quote small{display:block;margin-top:10px;font-size:13px;color:#9FA8A3;font-weight:500}
.cm-key{padding:20px;border-radius:16px;background:var(--g);color:#fff;font-size:18px;line-height:1.5;font-weight:800;text-align:left}
.cm-cards{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;margin-top:28px;text-align:left}
.cm-cards.c2{grid-template-columns:repeat(2,minmax(0,1fr))}
.cm-card{position:relative;padding:20px;border-radius:16px}
.cm-wt .cm-card{background:#F5F5F5;color:#111}
.cm-dk .cm-card{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);color:#fff}
.cm-card h3{font-size:18px;line-height:1.4;font-weight:800}
.cm-card h3 em{display:block;margin-bottom:6px;font-style:normal;font-size:13px;font-weight:800;color:var(--gd)}
.cm-dk .cm-card h3 em{color:var(--g)}
.cm-card p,.cm-card li{margin-top:8px;font-size:15px;line-height:1.55;font-weight:500}
.cm-wt .cm-card p,.cm-wt .cm-card li{color:#333}
.cm-dk .cm-card p,.cm-dk .cm-card li{color:#D5DCD8}
.cm-card li{position:relative;padding-left:14px}
.cm-card li::before{content:"";position:absolute;left:0;top:.7em;width:5px;height:5px;border-radius:50%;background:var(--g)}
.cm-badge{display:inline-block;margin-bottom:10px;padding:4px 10px;border-radius:999px;background:var(--g);color:#fff;font-size:12px;font-weight:800}
.cm-card.rec{outline:2px solid var(--g)}
.cm-num{display:flex;align-items:center;justify-content:center;width:30px;height:30px;margin-bottom:10px;border-radius:50%;background:var(--g);color:#fff;font-size:15px;font-weight:900}

/* 비교표 */
.cm-tb{width:100%;margin-top:28px;border-collapse:separate;border-spacing:0;font-size:14px;line-height:1.5;text-align:left}
.cm-tb th,.cm-tb td{padding:12px 10px;vertical-align:top;border-bottom:1px solid #E3E3E3}
.cm-tb thead th{background:#111;color:#fff;font-weight:800;font-size:13px}
.cm-tb thead th:last-child{background:var(--g)}
.cm-tb tbody th{width:24%;font-weight:800;color:#111;background:#F5F5F5}
.cm-tb td{color:#444;font-weight:500}
.cm-tb td:last-child{color:#111;font-weight:800}

/* 리스트 */
.cm-ages{margin-top:28px;text-align:left}
.cm-ages li{display:flex;gap:12px;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.16);font-size:16px;line-height:1.5}
.cm-ages b{flex:0 0 64px;color:var(--g);font-weight:900}
.cm-ages span{font-weight:500;color:#E6EBE8}
.cm-chk{margin-top:24px;text-align:left}
.cm-chk li{position:relative;padding:12px 0 12px 34px;font-size:16px;line-height:1.5;font-weight:700}
.cm-chk li::before{content:"";position:absolute;left:4px;top:14px;width:16px;height:9px;border-left:3px solid var(--g);border-bottom:3px solid var(--g);transform:rotate(-45deg)}
.cm-steps{margin-top:28px;text-align:left;counter-reset:s}
.cm-steps li{position:relative;padding:0 0 22px 52px;font-size:17px;line-height:1.5;font-weight:700;counter-increment:s}
.cm-steps li::before{content:counter(s);position:absolute;left:0;top:-2px;width:34px;height:34px;border-radius:50%;background:var(--g);color:#fff;text-align:center;line-height:34px;font-weight:900}
.cm-steps li::after{content:"";position:absolute;left:16px;top:34px;bottom:2px;width:2px;background:rgba(34,181,115,.4)}
.cm-steps li:last-child{padding-bottom:0}
.cm-steps li:last-child::after{display:none}
.cm-steps li span{display:block;margin-top:4px;font-size:15px;font-weight:500;color:#C5CEC9}
.cm-wt .cm-steps li span{color:#555}

/* 캘린더 */
.cm-cal{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:30px}
.cm-cal div{padding:16px 0;border-radius:10px;font-size:15px;font-weight:800;background:#E4EEE9;color:#6E8077}
.cm-cal div.on{background:var(--g);color:#fff}

/* 리포트 */
.cm-rep{position:relative;margin-top:28px;padding:22px 20px;border-radius:16px;background:#fff;color:#111;text-align:left;box-shadow:0 10px 30px rgba(0,0,0,.18)}
.cm-dk .cm-rep{box-shadow:none}
.cm-rep-t{padding-right:76px;font-size:17px;font-weight:900;line-height:1.4}
.cm-rep-badge{position:absolute;right:16px;top:16px;padding:4px 10px;border-radius:999px;background:#111;color:#fff;font-size:12px;font-weight:800}
.cm-rep-r{display:flex;justify-content:space-between;gap:12px;padding:14px 0;border-bottom:1px solid #E5E5E5;font-size:16px;font-weight:600}
.cm-rep-r:last-child{border-bottom:0;padding-bottom:0}
.cm-rep-r b{font-weight:900;color:#007A14;white-space:nowrap}

/* 플레이스홀더 */
.cm-ph{display:flex;align-items:center;justify-content:center;min-height:120px;margin-top:14px;padding:16px;border:2px dashed #B8C2BD;border-radius:16px;font-size:16px;font-weight:700;color:#7A8680}
.cm-dk .cm-ph{border-color:rgba(255,255,255,.3);color:#AEB8B3}

/* 사진 */
.cm-photo{display:block;width:100%;height:auto;margin-top:28px;border-radius:16px;object-fit:cover}

/* FAQ */
.cm-faq{margin-top:28px;text-align:left}
.cm-faq details{border-bottom:1px solid #DADADA}
.cm-dk .cm-faq details{border-color:rgba(255,255,255,.18)}
.cm-faq summary{position:relative;padding:18px 34px 18px 0;list-style:none;cursor:pointer;font-size:17px;line-height:1.45;font-weight:800}
.cm-faq summary::-webkit-details-marker{display:none}
.cm-faq summary::after{content:"+";position:absolute;right:4px;top:14px;font-size:24px;font-weight:500;color:var(--g)}
.cm-faq details[open] summary::after{content:"-"}
.cm-faq p{padding:0 0 18px;font-size:16px;line-height:1.65;font-weight:500}
.cm-wt .cm-faq p{color:#444}
.cm-dk .cm-faq p{color:#D5DCD8}

/* 폼 */
.cm-formcard{margin-top:28px;padding:24px 20px;border-radius:16px;background:#fff;color:#111;text-align:left}
.cm-group{margin-bottom:20px}
.cm-label{display:block;margin-bottom:8px;font-size:15px;font-weight:800;color:#111}
.cm-req{color:#E5484D}
.cm-input,.cm-select,.cm-ta{width:100%;height:50px;padding:0 14px;border:1px solid #D0D5D2;border-radius:8px;background:#fff;color:#111;font:inherit;font-size:16px}
.cm-ta{height:auto;min-height:110px;padding:12px 14px;resize:vertical;line-height:1.5}
.cm-input:focus,.cm-select:focus,.cm-ta:focus{outline:2px solid var(--g);outline-offset:0;border-color:var(--g)}
.cm-radio{display:flex;align-items:center;gap:10px;padding:11px 12px;margin-bottom:6px;border:1px solid #E1E5E3;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer}
.cm-radio input{width:18px;height:18px;accent-color:var(--g);flex:0 0 auto}
.cm-sec{margin:6px 0 20px;padding:16px;border-radius:12px;background:#F5F5F5}
.cm-sec-t{margin-bottom:12px;font-size:14px;font-weight:800;color:#007A14}
.cm-sec .cm-group{margin-bottom:12px}
.cm-sec .cm-group:last-child{margin-bottom:0}
.cm-agree{display:flex;gap:10px;align-items:flex-start;margin:4px 0 20px;font-size:14px;line-height:1.5;font-weight:600;color:#333}
.cm-agree input{width:18px;height:18px;margin-top:2px;accent-color:var(--g);flex:0 0 auto}
.cm-submit{display:flex;align-items:center;justify-content:center;width:100%;height:58px;border:0;border-radius:8px;background:var(--g);color:#fff;font:inherit;font-size:18px;font-weight:800;cursor:pointer}
.cm-submit:disabled{opacity:.6;cursor:default}
.cm-err{margin:0 0 14px;font-size:14px;font-weight:700;color:#E5484D}
.cm-done{padding:36px 8px;text-align:center}
.cm-done b{display:block;font-size:22px;font-weight:900;color:#111}
.cm-done span{display:block;margin-top:10px;font-size:16px;line-height:1.6;font-weight:600;color:#444}

/* 하단 고정 CTA */
.cm-spacer{height:0}
.cm-bar{display:none}
@media (max-width:640px){
  .cm-spacer{height:76px;background:#111}
  .cm-bar{display:flex;position:fixed;left:0;right:0;bottom:0;z-index:60;align-items:center;justify-content:center;height:68px;padding:0 16px;background:rgba(17,17,17,.96);border-top:1px solid rgba(255,255,255,.14);transition:transform .2s,opacity .2s}
  .cm-bar.off{transform:translateY(100%);opacity:0;pointer-events:none}
  .cm-bar a{display:flex;align-items:center;justify-content:center;width:100%;max-width:448px;height:50px;border-radius:8px;background:var(--g);color:#fff;font-size:17px;font-weight:800;text-decoration:none}
}
@media (max-width:360px){
  .cm h1,.cm h2{font-size:27px}

}
`;
