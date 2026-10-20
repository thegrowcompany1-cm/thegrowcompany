"use client";

import { useEffect, useRef, useState } from "react";
import SalesOpsPay from "@/components/edu/SalesOpsPay";
import { SO_PRICE_NORMAL, SO_PRICE_STORY } from "@/lib/salesOps";

/*
 * /edu/sales-ops2 — 리얼세일즈 측 기획안 시안(_ref/sales-ops2/l0.html)을 그대로 옮긴 페이지.
 *  · 문구·카피·섹션 순서·색·간격은 원본 그대로다. 수정·요약하지 않았다.
 *  · 원본 <style> 은 모든 선택자를 .so2-root 아래로 한정하고 클래스명에 so2- 접두사를 붙여 사이트 다른 곳에 새지 않는다.
 *  · 원본 <script> 의 세 기능(채널 태그 / .rv 등장 모션 / 하단 고정 CTA)은 아래 useEffect 로 옮겼다.
 *  · 신청서는 결제 카드 2종(components/edu/SalesOpsPay.tsx — 스토리 인증가 / 정상가)으로 교체했다.
 *    원본의 "시안이라 제출해도 접수되지 않아요" 문구와 수강료 표기는 결제 금액에 맞춰 바꿨다.
 */

const CSS = `
.so2-root{--base:#0B1426; --base-2:#14203A; --base-3:#24314D;
  --acc:#3563F0; --acc-soft:#EEF2FE; --acc-on-dark:#A9BCFF;
  --fg:#141A24; --fg-2:#3D4553; --muted:#6B7482; --subtle:#98A0AC;
  --line:#E6E8EC; --line-2:#D5D9DF; --soft:#F5F6F8; --paper:#FFFFFF; --outside:#E7E9ED;
  --warn:#B4610B;
  --sans:"Pretendard","Pretendard Variable","Noto Sans KR",system-ui,-apple-system,sans-serif;
  --col:520px; --gut:24px;
  --ease:cubic-bezier(.2,.7,.2,1);
  color-scheme:light;}
.so2-root *{box-sizing:border-box}
.so2-root{-webkit-text-size-adjust:100%}
.so2-root{margin:0;background:var(--outside);color:var(--fg);font-family:var(--sans);font-size:16px;line-height:1.7;letter-spacing:-.011em;word-break:keep-all;overflow-wrap:break-word;overflow-x:clip;-webkit-font-smoothing:antialiased;position:relative;min-height:100vh}
.so2-root img{max-width:100%;display:block}
.so2-root a{color:inherit}
.so2-root p{margin:0}
.so2-root :focus-visible{outline:2px solid var(--acc);outline-offset:3px;border-radius:4px}
.so2-root .so2-page{max-width:var(--col);margin:0 auto;background:var(--paper);position:relative}
@media (min-width:560px){.so2-root .so2-page{box-shadow:0 0 0 1px rgba(15,23,42,.04),0 24px 64px rgba(15,23,42,.10)}}
.so2-root .so2-in{padding-inline:var(--gut)}
.so2-root .so2-sec{padding:88px 0;position:relative}
.so2-root .so2-sec.so2-tight{padding:72px 0}
.so2-root .so2-dark{background:var(--base);color:#fff}
.so2-root .so2-soft-bg{background:var(--soft)}
.so2-root .so2-eyebrow{display:flex;align-items:center;flex-wrap:wrap;gap:8px;font-size:13px;font-weight:700;letter-spacing:.06em;color:var(--acc);margin:0 0 12px;line-height:1.4}
.so2-root .so2-eyebrow.so2-ko{letter-spacing:0}
.so2-root .so2-dark .so2-eyebrow{color:var(--acc-on-dark)}
.so2-root h1,.so2-root h2,.so2-root h3{font-family:var(--sans);margin:0;color:inherit;text-wrap:balance}
.so2-root h2{font-size:25px;font-weight:700;line-height:1.4;letter-spacing:-.03em}
.so2-root h3{font-size:20px;font-weight:700;line-height:1.45;letter-spacing:-.025em}
.so2-root .so2-lead{margin:16px 0 0;font-size:16px;color:var(--fg-2)}
.so2-root .so2-dark .so2-lead{color:#B8C0CF}
.so2-root .so2-body-copy p + p{margin-top:12px}
.so2-root .so2-hl{background:linear-gradient(transparent 62%,rgba(53,99,240,.16) 62%);padding:0 .06em;font-weight:700}
.so2-root .so2-dark .so2-hl{background:none;color:var(--acc-on-dark)}
.so2-root .so2-caption{margin:16px 0 0;font-size:13px;line-height:1.6;color:var(--muted)}
.so2-root .so2-dark .so2-caption{color:#8E98AA}
.so2-root .so2-rule{height:1px;background:var(--line);border:0;margin:48px 0}
.so2-root .so2-dark .so2-rule{background:var(--base-3)}
.so2-root .so2-btn{appearance:none;border:0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:52px;font-family:var(--sans);font-weight:700;font-size:16px;letter-spacing:-.01em;border-radius:12px;padding:14px 24px;text-decoration:none;line-height:1.3;transition:background-color .2s var(--ease),transform .2s var(--ease)}
.so2-root .so2-btn:active{transform:scale(.985)}
.so2-root .so2-btn-acc{background:var(--acc);color:#fff}
.so2-root .so2-btn-acc:hover{background:#2A53D6}
.so2-root .so2-btn-light{background:#fff;color:var(--base)}
.so2-root .so2-btn-light:hover{background:#EEF1F6}
.so2-root .so2-btn-ghost{background:transparent;color:var(--fg);box-shadow:inset 0 0 0 1px var(--line-2)}
.so2-root .so2-btn-block{display:flex;width:100%}
.so2-root .so2-btn .so2-ar{width:16px;height:16px;flex:none}
.so2-root .so2-top{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:56px;padding:8px var(--gut);background:var(--base);color:#fff;font-size:13px;font-weight:600;border-bottom:1px solid rgba(255,255,255,.06)}
.so2-root .so2-top .so2-hosts{color:#C9D0DC;letter-spacing:-.01em}
.so2-root .so2-top .so2-hosts b{color:#fff;font-weight:700}
.so2-root .so2-top .so2-x{color:#6F7B92;margin:0 6px}
.so2-root .so2-top a{display:inline-flex;align-items:center;min-height:44px;padding:0 4px;font-size:13px;font-weight:700;color:#fff;text-decoration:none}
.so2-root .so2-top a span{border-bottom:1px solid rgba(255,255,255,.4);padding-bottom:1px}
.so2-root .so2-hero{background:var(--base);color:#fff;padding:56px 0 64px;overflow:hidden}
.so2-root .so2-hero .so2-bg{position:absolute;inset:0 0 auto 0;height:440px;background:url(/edu/sales-ops2/img/venue2.jpg) 50% 92%/auto 190% no-repeat;opacity:.42}
.so2-root .so2-hero .so2-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,20,38,.55) 0%,rgba(11,20,38,.8) 55%,var(--base) 100%)}
.so2-root .so2-hero .so2-in{position:relative}
.so2-root .so2-h-meta{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;font-size:13px;font-weight:600;color:#C9D0DC;margin:0 0 24px}
.so2-root .so2-h-meta .so2-date{color:#fff;font-weight:700;letter-spacing:.02em}
.so2-root .so2-h-meta .so2-dot{width:3px;height:3px;border-radius:50%;background:#5D6982}
.so2-root .so2-h-hook{font-size:16px;font-weight:500;color:#C9D0DC;margin:0 0 12px}
.so2-root .so2-h-title{font-size:34px;font-weight:800;line-height:1.28;letter-spacing:-.04em}
.so2-root .so2-h-sub{margin:16px 0 0;font-size:18px;font-weight:600;color:#E3E7EE;letter-spacing:-.02em}
.so2-root .so2-h-sub em{font-style:normal;color:var(--acc-on-dark)}
.so2-root .so2-duo{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:40px 0 0}
.so2-root .so2-duo a{text-decoration:none;color:#fff;display:block}
.so2-root .so2-duo .so2-frame{position:relative;aspect-ratio:4/5;border-radius:12px;overflow:hidden;background:linear-gradient(180deg,#EEF0F4 0%,#DDE1E8 100%)}
.so2-root .so2-duo .so2-frame img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;mix-blend-mode:multiply}
.so2-root .so2-duo .so2-frame::after{content:"";position:absolute;inset:auto 0 0 0;height:46%;background:linear-gradient(180deg,rgba(11,20,38,0) 0%,rgba(11,20,38,.78) 100%)}
.so2-root .so2-duo .so2-cap{position:absolute;left:12px;right:12px;bottom:12px;z-index:1;line-height:1.35}
.so2-root .so2-duo .so2-cap .so2-p{display:block;font-size:12px;font-weight:600;color:#C9D0DC;letter-spacing:.02em}
.so2-root .so2-duo .so2-cap .so2-k{display:block;font-size:18px;font-weight:700;letter-spacing:-.03em;margin-top:2px}
.so2-root .so2-duo .so2-who{display:block;margin-top:12px;font-size:14px;font-weight:600;color:#fff;line-height:1.4}
.so2-root .so2-duo .so2-who small{display:block;font-size:12px;font-weight:500;color:#8E98AA;margin-top:2px}
.so2-root .so2-img-kim{object-position:56% 8%;transform:scale(1.18);transform-origin:56% 18%;filter:brightness(1.05)}
.so2-root .so2-img-hwang{object-position:50% 0}
.so2-root .so2-facts{margin:40px 0 0;border-top:1px solid var(--base-3)}
.so2-root .so2-facts .so2-r{display:grid;grid-template-columns:64px 1fr;gap:12px;align-items:center;min-height:52px;padding:12px 0;border-bottom:1px solid var(--base-3)}
.so2-root .so2-facts dt{font-size:13px;font-weight:600;color:#8E98AA}
.so2-root .so2-facts dd{margin:0;font-size:15px;font-weight:600;color:#fff;display:flex;flex-wrap:wrap;gap:8px;align-items:center;line-height:1.5}
.so2-root .so2-hero .so2-btn{margin-top:32px}
.so2-root .so2-hero .so2-note{margin:12px 0 0;font-size:13px;color:#8E98AA;text-align:center}
.so2-root .so2-fig{position:relative;margin:32px 0 0;aspect-ratio:16/10;border-radius:12px;overflow:hidden;background:#1B2438}
.so2-root .so2-fig img{width:100%;height:100%;object-fit:cover}
.so2-root .so2-fig::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,20,38,.05),rgba(11,20,38,.28))}
.so2-root .so2-fig figcaption{position:absolute;left:12px;bottom:10px;z-index:1;font-size:11px;font-weight:500;color:rgba(255,255,255,.8)}
.so2-root .so2-qb{position:relative;margin:0;padding:16px 0 16px 20px;border-left:2px solid var(--acc);font-size:18px;font-weight:600;line-height:1.55;letter-spacing:-.025em;color:var(--fg)}
.so2-root .so2-qb.so2-box{background:var(--soft);border-radius:0 10px 10px 0;padding:16px 20px}
.so2-root .so2-dark .so2-qb{color:#fff;border-left-color:var(--acc-on-dark)}
.so2-root .so2-scenes{margin:40px 0 0;border-top:1px solid var(--line)}
.so2-root .so2-scene{padding:24px 0;border-bottom:1px solid var(--line)}
.so2-root .so2-scene .so2-no{display:block;font-size:12px;font-weight:600;color:var(--subtle);letter-spacing:.04em;margin-bottom:8px}
.so2-root .so2-scene .so2-say{font-size:18px;font-weight:600;line-height:1.55;letter-spacing:-.025em}
.so2-root .so2-scene .so2-why{margin-top:8px;display:flex;align-items:center;gap:8px;font-size:14px;font-weight:500;color:var(--muted)}
.so2-root .so2-scene .so2-why::before{content:"";width:14px;height:14px;flex:none;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Ccircle cx='8' cy='8' r='7.25' fill='none' stroke='%23C24B3A' stroke-width='1.2'/%3E%3Cpath d='M5.6 5.6l4.8 4.8M10.4 5.6l-4.8 4.8' stroke='%23C24B3A' stroke-width='1.3' stroke-linecap='round'/%3E%3C/svg%3E") center/14px no-repeat}
.so2-root .so2-pain-ops{margin-top:56px}
.so2-root .so2-pain-ops .so2-q{margin:0}
.so2-root .so2-chips{display:flex;flex-wrap:wrap;gap:8px;margin:24px 0 0;padding:0;list-style:none}
.so2-root .so2-chips li{background:var(--soft);border-radius:999px;padding:8px 14px;font-weight:600;font-size:14px;color:var(--fg-2);line-height:1.4}
.so2-root .so2-pain-ops .so2-tail{margin:20px 0 0;color:var(--fg-2)}
.so2-root .so2-vs h2{font-size:22px;line-height:1.55}
.so2-root .so2-vs h2 .so2-em{color:var(--acc-on-dark)}
.so2-root .so2-vs-table{margin:40px 0 0;border-top:1px solid var(--base-3)}
.so2-root .so2-vs-row{display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid var(--base-3)}
.so2-root .so2-vs-row > div{padding:20px 0;font-size:17px;font-weight:600;letter-spacing:-.025em;line-height:1.45}
.so2-root .so2-vs-row .so2-lo{color:#8E98AA;padding-right:16px}
.so2-root .so2-vs-row .so2-hi{color:#fff;padding-left:16px;border-left:1px solid var(--base-3)}
.so2-root .so2-vs-row .so2-lab{display:block;font-size:12px;font-weight:600;letter-spacing:.02em;margin-bottom:4px}
.so2-root .so2-vs-row .so2-lo .so2-lab{color:#5D6982}
.so2-root .so2-vs-row .so2-hi .so2-lab{color:var(--acc-on-dark)}
.so2-root .so2-vs .so2-tail{margin:32px 0 0;font-size:17px;font-weight:500;color:#C9D0DC;line-height:1.7}
.so2-root .so2-vs .so2-tail b{color:#fff;font-weight:700}
.so2-root .so2-checks{list-style:none;margin:40px 0 0;padding:0;border-top:1px solid var(--line)}
.so2-root .so2-checks li{display:grid;grid-template-columns:24px 1fr;gap:12px;align-items:start;padding:20px 0;border-bottom:1px solid var(--line);font-size:16px;font-weight:600;letter-spacing:-.02em;line-height:1.6}
.so2-root .so2-checks li::before{content:"";width:22px;height:22px;margin-top:2px;border-radius:50%;background:var(--acc-soft) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6.5 12.5l3.5 3.5 7.5-8' fill='none' stroke='%233563F0' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/16px no-repeat}
.so2-root .so2-parts{margin:40px 0 0;border-top:1px solid var(--line)}
.so2-root .so2-parts a{display:grid;grid-template-columns:40px 1fr 20px;gap:12px;align-items:center;min-height:88px;padding:20px 0;border-bottom:1px solid var(--line);text-decoration:none;color:inherit}
.so2-root .so2-parts .so2-no{font-size:13px;font-weight:700;color:var(--acc);letter-spacing:.02em}
.so2-root .so2-parts .so2-n{display:block;font-size:20px;font-weight:700;letter-spacing:-.03em;line-height:1.35}
.so2-root .so2-parts .so2-w{display:block;font-size:14px;color:var(--muted);margin-top:2px}
.so2-root .so2-parts .so2-go{width:20px;height:20px;color:var(--subtle)}
.so2-root .so2-part-head{padding:88px 0 0}
.so2-root .so2-part-head .so2-lab{display:flex;align-items:center;flex-wrap:wrap;gap:8px 12px;font-size:13px;font-weight:700;color:var(--acc);letter-spacing:.04em}
.so2-root .so2-dark .so2-part-head .so2-lab,.so2-root .so2-part-head.so2-dark .so2-lab{color:var(--acc-on-dark)}
.so2-root .so2-part-head .so2-lab .so2-dur{color:var(--muted);font-weight:600;letter-spacing:0}
.so2-root .so2-part-head .so2-for{margin:24px 0 0;font-size:16px;font-weight:500;color:var(--fg-2);line-height:1.6}
.so2-root .so2-part-head .so2-ttl{margin:8px 0 0;font-size:32px;font-weight:800;letter-spacing:-.04em;line-height:1.25}
.so2-root .so2-part-head .so2-subt{margin:8px 0 0;font-size:18px;font-weight:600;color:var(--fg-2);letter-spacing:-.02em}
.so2-root .so2-byline{display:flex;align-items:center;gap:12px;margin:32px 0 0;padding:16px 0 0;border-top:1px solid var(--line)}
.so2-root .so2-byline .so2-av{width:48px;height:48px;border-radius:50%;overflow:hidden;flex:none;background:linear-gradient(180deg,#EEF0F4,#DDE1E8)}
.so2-root .so2-byline .so2-av img{width:100%;height:100%;object-fit:cover;mix-blend-mode:multiply}
.so2-root .so2-byline .so2-av .so2-img-kim{object-position:58% 16%;transform:scale(1.9);transform-origin:56% 22%}
.so2-root .so2-byline .so2-av .so2-img-hwang{object-position:50% 10%;transform:scale(1.5);transform-origin:50% 22%}
.so2-root .so2-byline .so2-t{font-size:14px;line-height:1.5;color:var(--muted)}
.so2-root .so2-byline .so2-t b{display:block;font-size:15px;font-weight:700;color:var(--fg)}
.so2-root .so2-part-body{padding:56px 0 88px}
.so2-root .so2-hook{margin:0;text-align:left}
.so2-root .so2-hook .so2-q{font-size:22px;font-weight:700;line-height:1.5;letter-spacing:-.03em}
.so2-root .so2-hook .so2-q .so2-m{color:var(--acc)}
.so2-root .so2-part-body .so2-body-copy{margin:24px 0 0;color:var(--fg-2)}
.so2-root .so2-part-body .so2-body-copy .so2-strong{margin-top:20px;font-size:18px;font-weight:700;line-height:1.6;letter-spacing:-.025em;color:var(--fg)}
.so2-root .so2-cur-h{margin:64px 0 0;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.so2-root .so2-key{margin-top:32px}
.so2-root .so2-key + .so2-key{margin-top:40px;padding-top:40px;border-top:1px solid var(--line)}
.so2-root .so2-key .so2-lbl{display:block;font-size:12px;font-weight:700;color:var(--acc);letter-spacing:.06em;margin-bottom:4px}
.so2-root .so2-key .so2-t{font-size:20px;font-weight:700;letter-spacing:-.03em;line-height:1.4}
.so2-root .so2-key ul{list-style:none;margin:16px 0 0;padding:0;display:grid;gap:8px}
.so2-root .so2-key li{position:relative;padding-left:16px;font-size:16px;line-height:1.65;color:var(--fg-2)}
.so2-root .so2-key li::before{content:"";position:absolute;left:2px;top:.78em;width:4px;height:4px;border-radius:50%;background:var(--fg-2)}
.so2-root .so2-key .so2-qs{display:grid;gap:12px;margin:24px 0 0}
.so2-root .so2-after{margin-top:64px}
.so2-root .so2-after ol{list-style:none;counter-reset:a;margin:20px 0 0;padding:0;border-top:1px solid var(--line)}
.so2-root .so2-after li{counter-increment:a;display:grid;grid-template-columns:36px 1fr;gap:8px;align-items:baseline;padding:16px 0;border-bottom:1px solid var(--line);font-size:16px;font-weight:600;letter-spacing:-.02em;line-height:1.6}
.so2-root .so2-after li::before{content:counter(a,decimal-leading-zero);font-size:13px;font-weight:700;color:var(--acc);letter-spacing:.02em}
.so2-root .so2-bridge{background:var(--base);color:#fff;padding:64px 0;text-align:center}
.so2-root .so2-bridge p{text-wrap:balance;font-size:19px;font-weight:600;letter-spacing:-.03em;line-height:1.6;color:#E3E7EE}
.so2-root .so2-bridge .so2-y{color:var(--acc-on-dark)}
.so2-root .so2-bridge .so2-arrow{display:block;width:20px;height:20px;margin:20px auto 0;color:#5D6982}
.so2-root .so2-closing{margin-top:64px;padding:40px 0;border-top:1px solid var(--fg);border-bottom:1px solid var(--line)}
.so2-root .so2-closing p{font-size:17px;font-weight:500;letter-spacing:-.025em;line-height:1.8;color:var(--fg-2)}
.so2-root .so2-closing b{font-weight:700;color:var(--fg);background:linear-gradient(transparent 62%,rgba(53,99,240,.16) 62%)}
.so2-root .so2-tt-list{margin:40px 0 0;border-top:1px solid var(--line-2)}
.so2-root .so2-tt-row{display:grid;grid-template-columns:104px 1fr;gap:16px;padding:20px 0;border-bottom:1px solid var(--line-2)}
.so2-root .so2-tt-row .so2-when{font-size:13px;font-weight:600;color:var(--muted);line-height:1.5;display:flex;flex-direction:column;align-items:flex-start;gap:6px}
.so2-root .so2-tt-row .so2-nm{display:block;font-size:17px;font-weight:700;letter-spacing:-.025em;line-height:1.45}
.so2-root .so2-tt-row .so2-sm{display:block;margin-top:4px;font-size:14px;color:var(--muted);line-height:1.6}
.so2-root .so2-speakers{display:grid;gap:64px;margin-top:40px}
.so2-root .so2-prof .so2-ph{position:relative;aspect-ratio:4/5;border-radius:12px;overflow:hidden;background:linear-gradient(180deg,#F1F3F6 0%,#DEE2E8 100%)}
.so2-root .so2-prof .so2-ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;mix-blend-mode:multiply}
.so2-root .so2-prof .so2-ph::after{content:"";position:absolute;inset:auto 0 0 0;height:30%;background:linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,.55))}
.so2-root .so2-prof .so2-ph .so2-tag{position:absolute;left:16px;top:16px;z-index:1;font-size:12px;font-weight:700;color:var(--base);background:rgba(255,255,255,.88);border-radius:6px;padding:4px 10px;letter-spacing:.02em}
.so2-root .so2-prof .so2-bd{padding:24px 0 0}
.so2-root .so2-prof .so2-tagline{font-size:16px;font-weight:600;letter-spacing:-.02em;line-height:1.6;color:var(--acc)}
.so2-root .so2-prof .so2-name{margin:12px 0 0;font-size:25px;font-weight:700;letter-spacing:-.03em;line-height:1.3}
.so2-root .so2-prof .so2-role{display:block;margin-top:4px;font-size:14px;font-weight:500;color:var(--muted)}
.so2-root .so2-prof ul:not(.so2-books){list-style:none;margin:20px 0 0;padding:20px 0 0;border-top:1px solid var(--line);display:grid;gap:8px}
.so2-root .so2-prof li{position:relative;padding-left:16px;font-size:15px;line-height:1.65;color:var(--fg-2)}
.so2-root .so2-prof li::before{content:"";position:absolute;left:2px;top:.75em;width:4px;height:4px;border-radius:50%;background:var(--subtle)}
.so2-root .so2-books-h{margin:20px 0 0;font-size:13px;font-weight:600;color:var(--muted);display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.so2-root .so2-books{margin:12px 0 0;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:8px}
.so2-root .so2-books li{padding:6px 12px;border-radius:999px;background:var(--soft);font-size:13px;font-weight:600;color:var(--fg-2);line-height:1.4}
.so2-root .so2-books li::before{display:none}
.so2-root .so2-ev{margin-top:40px}
.so2-root .so2-ev-top{padding:0 0 24px;border-bottom:1px solid var(--fg)}
.so2-root .so2-ev-top .so2-d{font-size:40px;font-weight:800;letter-spacing:-.04em;line-height:1}
.so2-root .so2-ev-top .so2-d small{font-size:14px;font-weight:700;color:var(--acc);margin-left:8px;letter-spacing:.06em;vertical-align:.5em}
.so2-root .so2-ev-top .so2-t{margin:12px 0 0;font-size:17px;font-weight:700;letter-spacing:-.02em}
.so2-root .so2-ev dl{margin:0}
.so2-root .so2-ev .so2-r{display:grid;grid-template-columns:64px 1fr;gap:12px;padding:16px 0;border-bottom:1px solid var(--line-2);align-items:start}
.so2-root .so2-ev dt{font-size:13px;font-weight:600;color:var(--muted);padding-top:2px}
.so2-root .so2-ev dd{margin:0;font-size:15px;font-weight:600;line-height:1.6}
.so2-root .so2-ev .so2-memo{display:block;margin-top:6px;font-size:13px;font-weight:400;color:var(--muted)}
.so2-root .so2-form-card{margin-top:48px;background:#fff;border-radius:16px;padding:32px 20px 28px;box-shadow:0 1px 2px rgba(15,23,42,.04),0 8px 24px rgba(15,23,42,.06)}
.so2-root .so2-form-card .so2-sub{margin:8px 0 24px;color:var(--muted);font-size:15px}
.so2-root .so2-field{margin-bottom:20px}
.so2-root .so2-field label,.so2-root .so2-roles legend{display:block;font-size:14px;font-weight:600;margin-bottom:8px;color:var(--fg)}
.so2-root .so2-req{color:var(--acc);margin-left:3px}
.so2-root .so2-field input{width:100%;font:inherit;font-size:16px;min-height:52px;padding:12px 14px;border:1px solid var(--line-2);border-radius:10px;background:#fff;color:var(--fg);transition:border-color .2s,box-shadow .2s}
.so2-root .so2-field input::placeholder{color:#B2B8C2}
.so2-root .so2-field input:focus{border-color:var(--acc);outline:none;box-shadow:0 0 0 3px rgba(53,99,240,.14)}
.so2-root .so2-hint{display:block;font-size:13px;color:var(--muted);margin-top:8px}
.so2-root .so2-roles{border:0;margin:0 0 24px;padding:0;min-width:0}
.so2-root .so2-roles legend{padding:0}
.so2-root .so2-role-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.so2-root .so2-role-grid label{position:relative}
.so2-root .so2-role-grid input{position:absolute;opacity:0;inset:0;cursor:pointer;margin:0}
.so2-root .so2-role-grid span{display:flex;align-items:center;justify-content:center;min-height:48px;text-align:center;border:1px solid var(--line-2);border-radius:10px;padding:8px 4px;font-weight:600;font-size:14px;line-height:1.3;transition:background-color .2s,border-color .2s,color .2s}
.so2-root .so2-role-grid input:checked + span{background:var(--acc-soft);color:var(--acc);border-color:var(--acc)}
.so2-root .so2-role-grid input:focus-visible + span{outline:2px solid var(--acc);outline-offset:2px}
.so2-root .so2-consents{margin:4px 0 24px;border:1px solid var(--line-2);border-radius:12px;overflow:hidden}
.so2-root .so2-c-all{display:flex;gap:12px;align-items:center;min-height:52px;padding:12px 16px;background:var(--soft);font-weight:700;font-size:15px;cursor:pointer}
.so2-root .so2-c-item{padding:16px;border-top:1px solid var(--line)}
.so2-root .so2-c-row{display:flex;gap:12px;align-items:flex-start;font-size:14px;font-weight:600;cursor:pointer;line-height:1.55;min-height:44px}
.so2-root .so2-cbox{width:20px;height:20px;margin:1px 0 0;accent-color:var(--acc);flex:none}
.so2-root .so2-badge{display:inline-block;font-size:11px;font-weight:700;border-radius:4px;padding:2px 6px;margin-right:6px;vertical-align:1px;line-height:1.4}
.so2-root .so2-badge.so2-must{background:var(--acc-soft);color:var(--acc)}
.so2-root .so2-badge.so2-opt{background:var(--soft);color:var(--muted)}
.so2-root .so2-c-why{margin:6px 0 0 32px;font-size:13px;color:var(--muted);line-height:1.55}
.so2-root .so2-c-item details{margin:8px 0 0 32px;font-size:13px}
.so2-root .so2-c-item summary{cursor:pointer;color:var(--muted);font-weight:600;min-height:44px;display:inline-flex;align-items:center;text-decoration:underline;text-underline-offset:3px;text-decoration-color:var(--line-2)}
.so2-root .so2-c-item table{width:100%;border-collapse:collapse;margin-top:8px}
.so2-root .so2-c-item th,.so2-root .so2-c-item td{text-align:left;border-top:1px solid var(--line);padding:8px 4px;vertical-align:top;font-size:13px;line-height:1.55}
.so2-root .so2-c-item th{width:80px;color:var(--muted);font-weight:600}
.so2-root .so2-err{display:none;margin:0 0 16px;background:#FDEEEC;color:#A2352A;border-radius:8px;padding:12px 14px;font-size:14px;font-weight:600}
.so2-root .so2-err.so2-on{display:block}
.so2-root .so2-form-foot{margin:12px 0 0;font-size:13px;color:var(--muted);text-align:center}
.so2-root .so2-done{display:none;text-align:center;padding:8px 0}
.so2-root .so2-done.so2-on{display:block}
.so2-root .so2-done .so2-ex{display:inline-block;font-size:12px;font-weight:600;color:var(--muted);border:1px dashed var(--line-2);border-radius:6px;padding:3px 8px}
.so2-root .so2-done .so2-ok{width:56px;height:56px;border-radius:50%;background:var(--acc-soft) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M6 12.5l4 4 8-8.5' fill='none' stroke='%233563F0' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/28px no-repeat;margin:20px auto 16px}
.so2-root .so2-done .so2-msg{margin:8px 0 0;color:var(--muted)}
.so2-root .so2-sum{margin:24px 0;text-align:left;background:var(--soft);border-radius:12px;padding:8px 16px}
.so2-root .so2-sum div{display:grid;grid-template-columns:104px 1fr;gap:8px;padding:10px 0;border-bottom:1px solid var(--line);font-size:14px}
.so2-root .so2-sum div:last-child{border-bottom:0}
.so2-root .so2-sum dt{color:var(--muted);font-weight:500}
.so2-root .so2-sum dd{margin:0;font-weight:600}
.so2-root .so2-soft{margin:24px 0 0;text-align:center;font-size:14px;color:var(--muted)}
.so2-root .so2-faq{margin-top:40px;border-top:1px solid var(--fg)}
.so2-root .so2-faq details{border-bottom:1px solid var(--line)}
.so2-root .so2-faq summary{list-style:none;cursor:pointer;display:grid;grid-template-columns:24px 1fr 20px;gap:8px;align-items:center;min-height:64px;padding:16px 0;font-size:16px;font-weight:600;letter-spacing:-.02em;line-height:1.5}
.so2-root .so2-faq summary::-webkit-details-marker{display:none}
.so2-root .so2-faq summary::before{content:"Q";font-weight:700;color:var(--acc);font-size:15px}
.so2-root .so2-faq summary::after{content:"";width:20px;height:20px;background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath d='M5 7.5l5 5 5-5' fill='none' stroke='%2398A0AC' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/20px no-repeat;transition:transform .25s var(--ease)}
.so2-root .so2-faq details[open] summary::after{transform:rotate(180deg)}
.so2-root .so2-faq .so2-a{padding:0 0 20px 32px;color:var(--muted);font-size:15px;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.so2-root .so2-final{background:var(--base);color:#fff;text-align:center;overflow:hidden}
.so2-root .so2-final .so2-bg{position:absolute;inset:0;opacity:.32}
.so2-root .so2-final .so2-bg::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,20,38,.82),rgba(11,20,38,.94))}
.so2-root .so2-final .so2-in{position:relative}
.so2-root .so2-final .so2-eyebrow{justify-content:center}
.so2-root .so2-final h2{font-size:28px;line-height:1.45;letter-spacing:-.035em}
.so2-root .so2-final .so2-date{margin:20px 0 0;font-size:15px;font-weight:600;color:#C9D0DC}
.so2-root .so2-final .so2-btn{margin-top:32px;min-width:240px}
.so2-root .so2-foot{background:#070D1A;color:#8E98AA;padding:48px 0 calc(120px + env(safe-area-inset-bottom));font-size:13px;line-height:1.7}
.so2-root .so2-foot .so2-hosts{display:flex;flex-wrap:wrap;align-items:center;gap:8px;color:#fff;font-size:15px;font-weight:700;letter-spacing:-.02em}
.so2-root .so2-foot .so2-hosts .so2-x{color:#5D6982;font-weight:400}
.so2-root .so2-foot .so2-co{display:flex;align-items:center;gap:12px;margin-top:16px}
.so2-root .so2-foot .so2-co img{opacity:.6}
.so2-root .so2-foot p{margin:12px 0 0;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.so2-root .so2-sticky{position:fixed;left:0;right:0;bottom:0;z-index:30;pointer-events:none;transition:transform .35s var(--ease),opacity .35s var(--ease)}
.so2-root .so2-sticky .so2-inner{pointer-events:auto;max-width:var(--col);margin:0 auto;display:flex;align-items:center;gap:16px;padding:12px var(--gut) calc(12px + env(safe-area-inset-bottom));background:rgba(255,255,255,.92);-webkit-backdrop-filter:saturate(180%) blur(16px);backdrop-filter:saturate(180%) blur(16px);border-top:1px solid rgba(15,23,42,.08)}
.so2-root .so2-sticky .so2-meta{flex:none;line-height:1.35;font-size:12px;font-weight:500;color:var(--muted)}
.so2-root .so2-sticky .so2-meta b{display:block;color:var(--fg);font-size:15px;font-weight:700;letter-spacing:-.01em}
.so2-root .so2-sticky .so2-btn{flex:1;min-height:52px}
.so2-root .so2-sticky.so2-hide{transform:translateY(110%);opacity:0}
.so2-root .so2-sticky.so2-hide .so2-inner{pointer-events:none}
.so2-root section[id]{scroll-margin-top:16px}
.so2-root.so2-js-motion .so2-rv{opacity:0;transform:translateY(16px);transition:opacity .7s var(--ease),transform .7s var(--ease)}
.so2-root.so2-js-motion .so2-rv.so2-on{opacity:1;transform:none}
@media (prefers-reduced-motion:reduce){.so2-root .so2-sticky,.so2-root .so2-btn,.so2-root .so2-faq summary::after{transition:none}
.so2-root.so2-js-motion .so2-rv{opacity:1;transform:none;transition:none}}
@media (max-width:359px){.so2-root{--gut:20px}
.so2-root .so2-h-title{font-size:30px}
.so2-root h2{font-size:23px}}
.so2-root .so2-role-grid .so2-fake-check{display:none}
.so2-root .so2-fake-input{display:block;box-sizing:border-box;width:100%;min-height:48px;border:1.5px solid #D5DDD8;border-radius:12px;padding:12px 14px;color:#8A968F;background:#fff;font:inherit;font-size:15px}
.so2-root .so2-fake-ta{min-height:96px}
.so2-root .so2-fake-check{display:inline-block;width:20px;height:20px;border:1.5px solid #8A968F;border-radius:5px;vertical-align:middle;flex:none}
.so2-root .so2-vn-box{margin:20px 0 0;padding:0}
.so2-root .so2-vn-box .so2-vn-track{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch;border-radius:12px;gap:0}
.so2-root .so2-vn-box .so2-vn-track::-webkit-scrollbar{display:none}
.so2-root .so2-vn-box .so2-vn-track img{flex:0 0 100%;width:100%!important;height:auto!important;aspect-ratio:4/3;object-fit:cover;scroll-snap-align:center;display:block;opacity:1!important;transform:none!important}
.so2-root .so2-vn-box .so2-vn-dots{display:flex;justify-content:center;gap:8px;margin-top:10px}
.so2-root .so2-vn-box .so2-vn-dots button{appearance:none;border:0;padding:0;width:8px;height:8px;border-radius:50%;background:currentColor;opacity:.25;cursor:pointer;transition:opacity .2s,transform .2s}
.so2-root .so2-vn-box .so2-vn-dots button[aria-current="true"]{opacity:.85;transform:scale(1.25)}
.so2-root .so2-vn-box figcaption{margin-top:8px;font-size:13px;opacity:.7}
.so2-root section[id]{scroll-margin-top:96px}
.so2-root .so2-pay-card{background:none;box-shadow:none;border-radius:0;padding:0;margin-top:32px}
.so2-root .so2-foot .so2-co img{height:38px}
`;

const fmt = (n: number) => `${n.toLocaleString("ko-KR")}원`;

const CHANNELS: Record<string, string> = { thegrow: "더그로우컴퍼니", realsales: "리얼세일즈" };

const VENUE_IMGS = [
  { src: "/edu/sales-ops2/img/venue1.jpg", alt: "강의장 내부, 앞쪽 스크린과 책상 배치" },
  { src: "/edu/sales-ops2/img/venue2.jpg", alt: "강의장 스크린과 강연대" },
  { src: "/edu/sales-ops2/img/venue3.jpg", alt: "강의장 뒤쪽에서 본 좌석" },
  { src: "/edu/sales-ops2/img/venue4.jpg", alt: "강의장 좌석 배치" },
];

/** 강의장 사진 1칸 슬라이드 — 스와이프(scroll-snap) + 3.5초 자동 넘김. 손대거나 마우스를 올리면 멈추고, 움직임 줄이기 설정이면 자동 넘김 없음 */
function VenueSlider() {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const [idx, setIdx] = useState(0);

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      const el = trackRef.current;
      if (!el || pausedRef.current || document.visibilityState !== "visible") return;
      const cur = Math.round(el.scrollLeft / el.clientWidth);
      el.scrollTo({ left: ((cur + 1) % VENUE_IMGS.length) * el.clientWidth, behavior: "smooth" });
    }, 3500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <>
      <div
        className="so2-vn-track"
        ref={trackRef}
        role="group"
        aria-roledescription="carousel"
        aria-label="강의장 사진"
        onScroll={(e) => setIdx(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        onMouseEnter={() => (pausedRef.current = true)}
        onMouseLeave={() => (pausedRef.current = false)}
        onTouchStart={() => (pausedRef.current = true)}
        onTouchEnd={() => window.setTimeout(() => (pausedRef.current = false), 4000)}
      >
        {VENUE_IMGS.map((im) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={im.src} src={im.src} alt={im.alt} loading="lazy" draggable={false} />
        ))}
      </div>
      <div className="so2-vn-dots">
        {VENUE_IMGS.map((im, i) => (
          <button key={im.src} type="button" aria-label={`사진 ${i + 1}`} aria-current={idx === i} onClick={() => goTo(i)} />
        ))}
      </div>
    </>
  );
}

export default function SalesOps2() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState("direct");
  const [campaign, setCampaign] = useState("");
  const [motion, setMotion] = useState(false);
  const [stickyHidden, setStickyHidden] = useState(true);

  // ① 채널 태그: ?utm_source=thegrow | realsales (또는 ?src=) → 숨은 필드
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const raw = (q.get("utm_source") || q.get("src") || "").toLowerCase().replace(/[^a-z0-9_-]/g, "");
    setSrc(CHANNELS[raw] ? raw : raw ? "other:" + raw : "direct");
    setCampaign((q.get("utm_campaign") || "").slice(0, 40));
  }, []);

  // ② 등장 모션(fade-up). 기본은 보이는 상태이고, 스크립트 실행 후에만 숨겼다가 드러낸다.
  //    모션 축소 설정이면 생략.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return;
    setMotion(true);
    const rio = new IntersectionObserver(
      (es) => {
        es.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("so2-on");
            rio.unobserve(en.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    root.querySelectorAll(".so2-rv").forEach((el) => rio.observe(el));
    return () => rio.disconnect();
  }, []);

  // ③ 하단 고정 CTA: 히어로와 신청 영역이 보이는 동안 숨김
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!("IntersectionObserver" in window)) {
      setStickyHidden(false);
      return;
    }
    const seen: Record<string, boolean> = {};
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((en) => {
          seen[en.target.id] = en.isIntersecting;
        });
        setStickyHidden(!!(seen.hero || seen.apply));
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    const hero = root.querySelector("#hero");
    const apply = root.querySelector("#apply");
    if (hero) io.observe(hero);
    if (apply) io.observe(apply);
    return () => io.disconnect();
  }, []);

  // 원본의 html{scroll-behavior:smooth} 를 이 페이지 안의 앵커에만 적용
  const onRootClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = (e.target as HTMLElement).closest("a[href^='#']") as HTMLAnchorElement | null;
    if (!a) return;
    const id = a.getAttribute("href")!.slice(1);
    const el = id ? document.getElementById(id) : null;
    if (!el) return;
    e.preventDefault();
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", "#" + id);
  };

  return (
    <div
      ref={rootRef}
      className={"so2-root" + (motion ? " so2-js-motion" : "")}
      onClick={onRootClick}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap"
      />
      <style>{CSS}</style>
      <div className="so2-page">
      <header className="so2-top">
        <span className="so2-hosts"><b>더그로우컴퍼니</b><span className="so2-x">×</span><b>리얼세일즈</b> 공동 강의</span>
        <a href="#apply"><span>신청하기</span></a>
      </header>
      <main id="top">
        <section className="so2-hero" id="hero" aria-labelledby="h-title">
          <div className="so2-bg" role="img" aria-label="이미지 예시: 세미나 홀 뒷줄에서 바라본 청중의 뒷모습과 무대"></div>
          <div className="so2-in">
            <p className="so2-h-meta"><span className="so2-date">11.21 토요일</span><span className="so2-dot" aria-hidden="true"></span><span>피트니스 대표님·관리자·트레이너</span></p>
            <p className="so2-h-hook">운동만 잘 가르치면, 매출은 따라올까요?</p>
            <h1 className="so2-h-title" id="h-title">성장<br />마스터키</h1>
            <p className="so2-h-sub">운영키 × 매출키 · 성장을 여는 <em>두 개의 열쇠</em></p>
            <div className="so2-duo" aria-label="강의 구성">
              <a href="#part1">
                <div className="so2-frame"><img className="so2-img-kim" src="/edu/sales-ops2/img/kim.jpg" alt="김재강 대표 (더그로우컴퍼니)" width="900" height="1200" /><span className="so2-cap"><span className="so2-p">1부 · 2시간</span><span className="so2-k">운영키</span></span></div>
                <span className="so2-who">김재강 대표<small>(주)더그로우컴퍼니</small></span>
              </a>
              <a href="#part2">
                <div className="so2-frame"><img className="so2-img-hwang" src="/edu/sales-ops2/img/hwang.webp" alt="황현진 대표 (리얼세일즈)" width="1024" height="1024" /><span className="so2-cap"><span className="so2-p">2부 · 2시간</span><span className="so2-k">매출키</span></span></div>
                <span className="so2-who">황현진 대표<small>리얼세일즈(주)</small></span>
              </a>
            </div>
            <dl className="so2-facts" aria-label="강의 정보 요약">
              <div className="so2-r"><dt>일시</dt><dd>11월 21일 (토) 오후 1시</dd></div>
              <div className="so2-r"><dt>장소</dt><dd>영등포 당산 · 당산로41길 11 E동 601호</dd></div>
              <div className="so2-r"><dt>구성</dt><dd>1부 운영키 2시간 + 2부 매출키 2시간</dd></div>
              <div className="so2-r"><dt>수강료</dt><dd>스토리 인증가 {fmt(SO_PRICE_STORY)} / 정상가 {fmt(SO_PRICE_NORMAL)}</dd></div>
              <div className="so2-r"><dt>정원</dt><dd>100명</dd></div>
            </dl>
            <a className="so2-btn so2-btn-light so2-btn-block" href="#apply">강의 신청하기<svg className="so2-ar" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
            <p className="so2-note">세부 일정은 신청하신 연락처로 안내드립니다.</p>
          </div>
        </section>
        <section className="so2-sec" id="pain" aria-labelledby="h-pain">
          <div className="so2-in">
            <p className="so2-eyebrow so2-ko so2-rv">대표님, 솔직하게 체크해 보세요</p>
            <h2 id="h-pain" className="so2-rv">혹시… 아직도 <span className="so2-hl">이런 상담</span>을<br />반복하고 계시진 않나요?</h2>
            <figure className="so2-fig so2-rv"><img src="/edu/sales-ops2/img/consult.jpg" alt="이미지 예시: 피트니스 센터 상담 테이블에서 마주 앉은 두 사람의 손과 태블릿" width="1600" height="1205" /><figcaption aria-hidden="true">이미지 예시</figcaption></figure>
            <div className="so2-scenes">
              <div className="so2-scene so2-rv"><span className="so2-no">상담 장면 01</span><p className="so2-say">"회원님, 가격 대비 저희 시설과 기구가 최고죠!"</p><p className="so2-why">주장만 늘어놓는 설득</p></div>
              <div className="so2-scene so2-rv"><span className="so2-no">상담 장면 02</span><p className="so2-say">"3개월보단 12개월이 훨씬 저렴하니까 이렇게 하세요."</p><p className="so2-why">이성적 설득에만 집착</p></div>
              <div className="so2-scene so2-rv"><span className="so2-no">상담 장면 03</span><p className="so2-say">"주사요? 에이~ 살 빼려면 땀을 흘리셔야죠."</p><p className="so2-why">회원의 반응에 직설적으로 반박</p></div>
            </div>
            <div className="so2-pain-ops so2-rv">
              <p className="so2-eyebrow so2-ko">그리고 상담 밖에서는</p>
              <blockquote className="so2-qb so2-q">"대표님, 오늘도 혼자 뛰고 계시지 않았나요?"</blockquote>
              <ul className="so2-chips"><li>상담도 대표가</li><li>재등록 관리도 대표가</li><li>직원 교육도 대표가</li></ul>
              <p className="so2-tail">대표가 하루 빠지면 매출이 흔들리는 센터는 커질 수 없습니다.</p>
            </div>
          </div>
        </section>
        <section className="so2-sec so2-dark so2-vs" aria-labelledby="h-vs">
          <div className="so2-in">
            <p className="so2-eyebrow so2-ko so2-rv">'장인'의 시대가 아닌, '상인'의 시대를 준비하라!</p>
            <h2 id="h-vs" className="so2-rv">쏟아지는 가격경쟁, 주사 맞고 빼겠다는 회원, 바빠서 못 한다는 회원….<br /><span className="so2-em">운동 지식만으론</span> 더 이상 회원의 결제를 이끌어낼 수 없습니다.</h2>
            <div className="so2-vs-table so2-rv">
              <div className="so2-vs-row"><div className="so2-lo"><span className="so2-lab">하수는</span>[주장]만 하지만,</div><div className="so2-hi"><span className="so2-lab">고수는</span>[주목]시킵니다.</div></div>
              <div className="so2-vs-row"><div className="so2-lo"><span className="so2-lab">하수는</span>[이성]을 향하지만,</div><div className="so2-hi"><span className="so2-lab">고수는</span>[감정]을 공략합니다.</div></div>
            </div>
            <p className="so2-tail so2-rv">지식의 높이보다, <b>'확신의 깊이'</b>를 전달하는 세일즈 언어를 장착하셔야 생존할 수 있습니다.</p>
          </div>
        </section>
        <section className="so2-sec" aria-labelledby="h-need">
          <div className="so2-in">
            <p className="so2-eyebrow so2-rv">CHECK LIST</p>
            <h2 id="h-need" className="so2-rv">이런 분들께<br /><span className="so2-hl">꼭 필요합니다</span></h2>
            <ul className="so2-checks">
              <li className="so2-rv"><span>상담에서 시설·가격 같은 주장만 늘어놓게 되는 분</span></li>
              <li className="so2-rv"><span>"12개월이 더 저렴하다" 같은 이성적 설득에만 기대고 있는 분</span></li>
              <li className="so2-rv"><span>'영업'이라는 부담감 대신, 전문가로서 당당하게 권하고 싶은 분</span></li>
              <li className="so2-rv"><span>문의는 들어오는데 상담 성공률이 얼마인지 모르는 센터</span></li>
              <li className="so2-rv"><span>신규는 들어오는데 재등록에서 회원이 빠지는 센터</span></li>
              <li className="so2-rv"><span>관리자·팀장에게 맡기고 싶은데 무엇을 맡겨야 할지 모르는 대표님</span></li>
            </ul>
          </div>
        </section>
        <section className="so2-sec so2-soft-bg" id="program" aria-labelledby="h-prog">
          <div className="so2-in">
            <p className="so2-eyebrow so2-rv">PROGRAM</p>
            <h2 id="h-prog" className="so2-rv">하루 4시간,<br />성장을 여는 두 개의 열쇠</h2>
            <p className="so2-lead so2-rv">구조를 여는 운영키, 회원의 결심을 여는 매출키.</p>
            <nav className="so2-parts so2-rv" aria-label="강의 구성">
              <a href="#part1"><span className="so2-no">1부</span><span><span className="so2-n">운영키</span><span className="so2-w">2시간 · 김재강 대표</span></span><svg className="so2-go" viewBox="0 0 20 20" aria-hidden="true"><path d="M7.5 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
              <a href="#part2"><span className="so2-no">2부</span><span><span className="so2-n">매출키</span><span className="so2-w">2시간 · 황현진 대표</span></span><svg className="so2-go" viewBox="0 0 20 20" aria-hidden="true"><path d="M7.5 5l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
            </nav>
          </div>
        </section>
        <section className="so2-part-head" id="part1" aria-labelledby="h-p1">
          <div className="so2-in">
            <p className="so2-lab so2-rv"><span>PART 1</span><span className="so2-dur">1부 · 2시간</span></p>
            <p className="so2-for so2-rv">오직 피트니스 분야를 위한,<br />매출구조 운영치트키</p>
            <h2 className="so2-ttl so2-rv" id="h-p1">〈운영키〉</h2>
            <p className="so2-subt so2-rv">대표가 없어도 돌아가는 센터</p>
            <div className="so2-byline so2-rv">
              <span className="so2-av"><img className="so2-img-kim" src="/edu/sales-ops2/img/kim.jpg" alt="" width="900" height="1200" /></span>
              <span className="so2-t"><b>김재강</b>강사 · (주)더그로우컴퍼니 대표이사</span>
            </div>
          </div>
        </section>
        <section className="so2-part-body" aria-label="1부 운영키 상세">
          <div className="so2-in">
            <blockquote className="so2-hook so2-rv"><p className="so2-q">"과연 <span className="so2-m">대표가 다 뛰어야</span><br />매출이 유지될까요?"</p></blockquote>
            <div className="so2-body-copy so2-rv">
              <p>상담도 대표가, 재등록 관리도 대표가, 직원 교육도 대표가.</p>
              <p>대표가 하루 빠지면 매출이 흔들리는 센터는 커질 수 없습니다.</p>
              <p className="so2-strong">감이 아니라 <span className="so2-hl">숫자로</span>, 사람이 아니라 <span className="so2-hl">구조로</span> 돌아가는 센터를 만드는 법을 나눕니다.</p>
            </div>
            <div className="so2-cur-h so2-rv"><h3>강의 핵심 커리큘럼</h3></div>
            <div className="so2-key so2-rv">
              <span className="so2-lbl">1ST KEY</span><p className="so2-t">숫자의 기술</p>
              <ul>
                <li>유효회원, 객단가, 상담 성공률, 유지율로 센터 보기</li>
                <li>매출 정체 구간에서 먼저 볼 지표</li>
                <li>콜 수, 방명록, CEO 보드처럼 매일 확인하는 운영판</li>
              </ul>
              <div className="so2-qs"><blockquote className="so2-qb so2-box">감이 아니라 숫자로.</blockquote></div>
            </div>
            <div className="so2-key so2-rv">
              <span className="so2-lbl">2ND KEY</span><p className="so2-t">위임의 기술</p>
              <ul>
                <li>FC·매니저의 역할을 나누고, 관리자가 스스로 판단하게 만드는 기준</li>
                <li>대표가 없어도 돌아가는 센터의 업무 분장</li>
                <li>재등록은 첫 4주에 정해진다: 고객 4분류와 첫 4주 관리 루틴</li>
              </ul>
              <div className="so2-qs"><blockquote className="so2-qb so2-box">재등록은 첫 4주에 정해진다.</blockquote></div>
            </div>
            <div className="so2-after so2-rv">
              <h3>듣고 나면 달라지는 것</h3>
              <ol>
                <li>내 센터의 숫자를 한 장으로 읽을 수 있게 됩니다.</li>
                <li>관리자·팀장에게 무엇을 맡길지 기준이 생깁니다.</li>
                <li>대표가 빠져도 돌아가는 운영 루틴을 가져갑니다.</li>
              </ol>
            </div>
          </div>
        </section>
        <div className="so2-bridge" role="note">
          <div className="so2-in">
            <p className="so2-rv">운영키로 <span className="so2-y">구조</span>를 열었다면,<br />이제 매출키로 <span className="so2-y">회원의 결심</span>을 열 차례입니다.</p>
            <svg className="so2-arrow" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 3v13M5 11l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>
        <section className="so2-part-head" id="part2" aria-labelledby="h-p2">
          <div className="so2-in">
            <p className="so2-lab so2-rv"><span>PART 2</span><span className="so2-dur">2부 · 2시간</span></p>
            <p className="so2-for so2-rv">오직 피트니스 분야를 위한,<br />매출폭발 세일즈치트키</p>
            <h2 className="so2-ttl so2-rv" id="h-p2">〈매출키〉</h2>
            <p className="so2-subt so2-rv">'장인'의 시대가 아닌, '상인'의 시대를 준비하라!</p>
            <div className="so2-byline so2-rv">
              <span className="so2-av"><img className="so2-img-hwang" src="/edu/sales-ops2/img/hwang.webp" alt="" width="1024" height="1024" /></span>
              <span className="so2-t"><b>황현진</b>강사 · 리얼세일즈(주) 대표</span>
            </div>
          </div>
        </section>
        <section className="so2-part-body" aria-label="2부 매출키 상세">
          <div className="so2-in">
            <blockquote className="so2-hook so2-rv"><p className="so2-q">"과연 <span className="so2-m">운동만 잘 가르치면</span><br />내 회원이 알아서 불어날까요?"</p></blockquote>
            <div className="so2-body-copy so2-rv">
              <p>쏟아지는 가격경쟁, 주사 맞고 빼겠다는 회원, 바빠서 못 한다는 회원….<br />운동 지식만으론 더 이상 회원의 결제를 이끌어낼 수 없습니다.</p>
              <p className="so2-strong">'장인'의 시대가 아닌, <span className="so2-hl">'상인'의 시대</span>를 준비하라!</p>
              <p>대한민국 유수 1등 기업들의 세일즈대본을 써 주는, 세일즈작가가 전하는,<br />오직 피트니스 전문가를 위한 매출폭발 세일즈치트키, <span style={{ whiteSpace: "nowrap" }}>&lt;매출키&gt;</span></p>
            </div>
            <div className="so2-cur-h so2-rv"><h3>강의 핵심 커리큘럼</h3></div>
            <div className="so2-key so2-rv">
              <span className="so2-lbl">1ST KEY</span><p className="so2-t">권유의 기술</p>
              <ul>
                <li>회원의 마음을 확 여는 거절할 수 없는 질문 한 줄.</li>
                <li>허를 찌르고 몰입시키는 한 줄 권유화법.</li>
                <li>아래와 같이 반드시 먹히는 실전 세일즈화법 대방출.</li>
              </ul>
              <div className="so2-qs">
                <blockquote className="so2-qb so2-box">"운동이 적금이라면, 주사는 대출입니다."</blockquote>
                <blockquote className="so2-qb so2-box">"도화지 10장에 그리는 그림 vs 100장에 그리는 그림, 어떤 완성도를 원하세요?"</blockquote>
                <blockquote className="so2-qb so2-box">"시간이 없는 게 아니라, 회원님의 배터리가 방전된 겁니다."</blockquote>
              </div>
            </div>
            <div className="so2-key so2-rv">
              <span className="so2-lbl">2ND KEY</span><p className="so2-t">호감의 기술</p>
              <ul>
                <li>회원은 선택합니다. '좋은 사람'이 권하는, '좋아 보이는 것'을.</li>
                <li>대한민국에서 잘 파는 사람을 가장 많이 만난, 황현진이 알려주는 세일즈초고수들의 필승 전략</li>
                <li>회원의 이탈을 막고 재등록 성공율을 높이는 피트니스분야 맞춤형 실천 전략 대방출!</li>
              </ul>
              <div className="so2-qs"><blockquote className="so2-qb so2-box">회원은 선택합니다. '좋은 사람'이 권하는, '좋아 보이는 것'을.</blockquote></div>
            </div>
            <div className="so2-after so2-rv">
              <h3>이 강의를 듣고 나면 달라지는 것</h3>
              <ol>
                <li>상담 등록률이 비약적으로 상승합니다.</li>
                <li>회원의 결심을 부르는 '한 끗 다른 첫마디'가 장착됩니다.</li>
                <li>'영업'이라는 부담감 대신, 전문가로서 당당하게 권할 수 있는 확신을 갖게 됩니다.</li>
              </ol>
            </div>
            <div className="so2-closing so2-rv">
              <p>"당신의 일은 단지 운동을 가르치는 것이 아닙니다.<br />누군가가 자신을 더 사랑할 수 있게끔 돕는 일입니다.<br />최고의 전문성을 갖춘 스스로에게<br />이제 날개를 달아줄 <b>'세일즈 언어'</b>를 선물하세요."</p>
            </div>
          </div>
        </section>
        <section className="so2-sec so2-soft-bg" aria-labelledby="h-tt">
          <div className="so2-in">
            <p className="so2-eyebrow so2-rv">TIME TABLE</p>
            <h2 id="h-tt" className="so2-rv">11월 21일 (토)<br />진행 순서</h2>
            <div className="so2-tt-list so2-rv" role="list">
              <div className="so2-tt-row" role="listitem"><div className="so2-when">13:00 전</div><div><span className="so2-nm">접수·입장</span><span className="so2-sm">입장 시작 시간은 확정 후 안내</span></div></div>
              <div className="so2-tt-row" role="listitem"><div className="so2-when">13:00 시작<br />1부 · 2시간</div><div><span className="so2-nm">운영키 · 김재강 대표</span><span className="so2-sm">1st Key 숫자의 기술 / 2nd Key 위임의 기술</span></div></div>
              <div className="so2-tt-row" role="listitem"><div className="so2-when">2부 · 2시간</div><div><span className="so2-nm">매출키 · 황현진 대표</span><span className="so2-sm">1st Key 권유의 기술 / 2nd Key 호감의 기술</span></div></div>
            </div>
            <p className="so2-caption">쉬는 시간과 질의응답 진행 여부는 확정 후 안내합니다.</p>
          </div>
        </section>
        <section className="so2-sec" id="speakers" aria-labelledby="h-sp">
          <div className="so2-in">
            <p className="so2-eyebrow so2-rv">SPEAKERS</p>
            <h2 id="h-sp" className="so2-rv">강사 소개</h2>
            <div className="so2-speakers">
              <article className="so2-prof so2-rv" aria-labelledby="sp1">
                <div className="so2-ph"><span className="so2-tag">1부 운영키</span><img className="so2-img-kim" src="/edu/sales-ops2/img/kim.jpg" alt="김재강 대표 (더그로우컴퍼니)" width="900" height="1200" /></div>
                <div className="so2-bd">
                  <p className="so2-tagline">대표가 없어도 돌아가는 센터</p>
                  <h3 className="so2-name" id="sp1">김재강<span className="so2-role">(주)더그로우컴퍼니 대표이사</span></h3>
                  <ul>
                    <li>필라테스 46개 + 대형 피트니스 6개, 총 52개 센터 총괄, 10년 운영 데이터</li>
                    <li>에이블짐·피스트X 등 21개 센터 자문</li>
                    <li>IFBB PRO NPC 심사위원 · 체형교정 강사 · 한국대학보디빌딩협회 이사</li>
                  </ul>
                </div>
              </article>
              <article className="so2-prof so2-rv" aria-labelledby="sp2">
                <div className="so2-ph"><span className="so2-tag">2부 매출키</span><img className="so2-img-hwang" src="/edu/sales-ops2/img/hwang.webp" alt="황현진 대표 (리얼세일즈)" width="1024" height="1024" /></div>
                <div className="so2-bd">
                  <p className="so2-tagline">"대한민국 세일즈교육&amp;컨설팅 섭외 0순위, 세일즈작가 황현진."</p>
                  <h3 className="so2-name" id="sp2">황현진<span className="so2-role">리얼세일즈(주) 대표</span></h3>
                  <ul>
                    <li>현 리얼세일즈(주) 대표</li>
                    <li>대한민국 1등 기업들이 찾는, 세일즈대본 개발 및 화법컨설팅 마스터</li>
                    <li>피트니스 프랜차이즈 세일즈 특강 진행 다수</li>
                    <li>전 NS홈쇼핑 (홈쇼핑 최다매출 기네스 기록)</li>
                  </ul>
                  <p className="so2-books-h">저서 · 세일즈분야 베스트셀러 다수</p>
                  <ul className="so2-books"><li>팔리는 한문장은 다르다</li><li>잘파는 사람은 이렇게 팝니다</li><li>세일즈 말부터 바꿔라</li><li>설득의 정석</li><li>세일즈문법 외</li></ul>
                </div>
              </article>
            </div>
          </div>
        </section>
        <section className="so2-sec" id="apply" aria-labelledby="h-apply">
          <div className="so2-in">
            <p className="so2-eyebrow so2-rv">APPLY</p>
            <h2 id="h-apply" className="so2-rv">11월 21일,<br /><span className="so2-hl">강의 신청</span></h2>
            <aside className="so2-ev so2-rv" aria-label="강의 정보">
              <div className="so2-ev-top">
                <div className="so2-d">11.21<small>SAT</small></div>
                <div className="so2-t">성장 마스터키</div>
              </div>
              <dl>
                <div className="so2-r"><dt>구성</dt><dd>1부 운영키 2시간 (김재강) + 2부 매출키 2시간 (황현진)</dd></div>
                <div className="so2-r"><dt>시간</dt><dd>오후 1시 시작 (1부 2시간 + 2부 2시간)</dd></div>
                <div className="so2-r"><dt>장소</dt><dd>서울 영등포구 당산로41길 11 E동 601호<span className="so2-memo">네이버 지도 등록명: 한국에너지기술인협회</span></dd></div>
                <div className="so2-r"><dt>수강료</dt><dd>스토리 인증가 {fmt(SO_PRICE_STORY)} / 정상가 {fmt(SO_PRICE_NORMAL)}</dd></div>
                <div className="so2-r"><dt>정원</dt><dd>100명</dd></div>
                <div className="so2-r"><dt>주최</dt><dd>(주)더그로우컴퍼니 × 리얼세일즈(주)</dd></div>
                      </dl>
              <figure className="so2-vn-box">
                <VenueSlider />
                <figcaption>강의장 · 서울 영등포구 당산로41길 11 E동 601호</figcaption>
              </figure>
            </aside>
            <div className="so2-form-card so2-pay-card" id="formCard">
              <input type="hidden" name="src" id="src" value={src} readOnly />
              <input type="hidden" name="campaign" id="campaign" value={campaign} readOnly />
              <SalesOpsPay stack accent="#3563F0" accentDark="#2A53D6" accentSoft="#EEF2FE" />
            </div>
            <p className="so2-soft">강의 후 2~3일 안에 12월 체험단 신청을 따로 안내드립니다.</p>
          </div>
        </section>
        <section className="so2-sec so2-soft-bg" id="faq" aria-labelledby="h-faq">
          <div className="so2-in">
            <p className="so2-eyebrow so2-rv">FAQ</p>
            <h2 id="h-faq" className="so2-rv">자주 묻는 질문</h2>
            <div className="so2-faq so2-rv">
              <details><summary>수강료와 결제 방법은 어떻게 되나요?</summary><div className="so2-a">수강료는 스토리 인증가 {fmt(SO_PRICE_STORY)}, 정상가 {fmt(SO_PRICE_NORMAL)}이에요. 결제는 신청 화면에서 바로 진행하며 카드, 간편결제, 계좌이체를 이용할 수 있습니다.</div></details>
            </div>
          </div>
        </section>
        <section className="so2-sec so2-dark so2-final" aria-labelledby="h-final">
          <div className="so2-bg" aria-hidden="true"></div>
          <div className="so2-in">
            <p className="so2-eyebrow so2-rv">LAST CALL</p>
            <h2 id="h-final" className="so2-rv">구조는 운영키로,<br />결심은 매출키로.</h2>
            <p className="so2-date so2-rv">11월 21일 (토) · 성장 마스터키</p>
            <a className="so2-btn so2-btn-light so2-rv" href="#apply">지금 강의 신청하기<svg className="so2-ar" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
          </div>
        </section>
      </main>
      <footer className="so2-foot">
        <div className="so2-in">
          <div className="so2-hosts"><span>(주)더그로우컴퍼니</span><span className="so2-x">×</span><span>리얼세일즈(주)</span></div>
          <div className="so2-co"><span>공동 주최 협력</span><img src="/edu/sales-ops2/logo/RGC_logo_mono_white.png" alt="Real Grow Club" width="64" height="38" /></div>
        </div>
      </footer>
      </div>
      <div className={"so2-sticky" + (stickyHidden ? " so2-hide" : "")} id="sticky">
        <div className="so2-inner">
          <div className="so2-meta"><b>11.21 (토)</b>운영키 × 매출키</div>
          <a className="so2-btn so2-btn-acc" href="#apply">강의 신청하기</a>
        </div>
      </div>
    </div>
  );
}
