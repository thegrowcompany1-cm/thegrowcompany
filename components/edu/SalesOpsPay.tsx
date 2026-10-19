"use client";

// ─────────────────────────────────────────────────────────────────────────────
// 피트니스 성장 마스터키 세미나 신청 — 결제 카드 2종 (/edu/sales-ops, /edu/sales-ops2 공용)
//
//  · 카드 A  스토리 인증가(SO_PRICE_STORY) — 인스타 아이디 + 스토리 업로드 체크 후 결제
//  · 카드 B  정상가(SO_PRICE_NORMAL)       — 조건 없이 결제
//  · 결제 흐름은 /edu/gx-class 와 같다: 이 컴포넌트가 신청 정보를 sessionStorage 에 담고
//    /checkout?product=<슬러그> 로 보낸다 → Supabase products 조회 → 토스 결제 →
//    /api/payments/confirm → CheckoutSuccess → 에듀DB 시트(결제내역) 기록.
//  · 이름·연락처·센터명·역할은 결제 전에 받고, 이메일은 결제 페이지(/checkout)에서 받는다.
//  · 인스타 아이디는 결제 승인 후 시트의 "인스타ID" 열로 전달된다 (정상가는 빈 값).
//  · 포스터는 저장 차단 대상이 아니다 — 원통 슬라이드의 차단 스타일을 쓰지 않는다.
//  · CSS 접두사 sop-. 색은 부모가 CSS 변수(--sop-acc 등)로 바꿀 수 있다.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  SO_PRICE_DIFF,
  SO_PRICE_NORMAL,
  SO_PRICE_STORY,
  SO_PRODUCT_NORMAL,
  SO_PRODUCT_STORY,
  SO_STORY_DISCOUNT_PCT,
} from "@/lib/salesOps";
import { saveCheckoutPrefill } from "@/lib/products";
import { formatPhone } from "@/lib/authStyles";

const ROLES = ["대표 · 원장", "관리자 · 팀장 · 실장", "트레이너 · 강사"] as const;
const POSTER_SRC = "/edu/sales-ops/poster.jpg";
const POSTER_FILENAME = "thegrow-seminar-poster.jpg";
const BRAND_TAG = "@thegrow.company";

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

/** 입력값에서 @ 와 공백을 걷고 영문·숫자·._ 만 남긴다 */
const cleanInstagram = (raw: string) =>
  raw.replace(/\s+/g, "").replace(/@/g, "").replace(/[^A-Za-z0-9._]/g, "").slice(0, 30);

const SOP_RAW = `
.sop{--sop-acc:#22B573;--sop-acc-dark:#0B6B3A;--sop-acc-soft:rgba(34,181,115,.12);--sop-ink:#141414;--sop-muted:#6B6B6B;--sop-line:rgba(20,20,20,.12);--sop-bg:#fff;--sop-soft:#F6F6F4;--sop-hot:#E5483A;color:var(--sop-ink);max-width:880px;margin:36px auto 0;text-align:left;letter-spacing:-.01em;word-break:keep-all}
.sop *{box-sizing:border-box}
.sop-box{background:var(--sop-bg);border:1px solid var(--sop-line);border-radius:18px;padding:26px 24px}
.sop-h{margin:0 0 4px;font-size:18px;font-weight:800}
.sop-sub{margin:0 0 18px;font-size:14px;line-height:1.6;color:var(--sop-muted)}
.sop-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 16px}
.sop-field{min-width:0}
.sop-field.is-wide{grid-column:1/-1}
.sop-label{display:block;margin:0 0 7px;font-size:13px;font-weight:700;color:#444}
.sop-req{color:var(--sop-hot);margin-left:3px}
.sop-input{width:100%;height:48px;border:1px solid #d6d6d6;border-radius:10px;padding:0 14px;font:inherit;font-size:16px;color:var(--sop-ink);background:#fff;outline:none;transition:border-color .2s,box-shadow .2s}
.sop-input:focus{border-color:var(--sop-acc);box-shadow:0 0 0 3px var(--sop-acc-soft)}
.sop-input::placeholder{color:#b4b4b4}
.sop-input.is-bad{border-color:var(--sop-hot)}
.sop-roles{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:0;padding:0;border:0;min-width:0}
.sop-role{position:relative;display:block}
.sop-role input{position:absolute;inset:0;opacity:0;margin:0;cursor:pointer}
.sop-role span{display:flex;align-items:center;justify-content:center;min-height:48px;padding:6px 4px;border:1px solid #d6d6d6;border-radius:10px;background:#fff;font-size:14px;font-weight:700;text-align:center;line-height:1.3;transition:background-color .2s,border-color .2s,color .2s}
.sop-role input:checked+span{background:var(--sop-acc-soft);border-color:var(--sop-acc);color:var(--sop-acc-dark)}
.sop-role input:focus-visible+span{outline:2px solid var(--sop-acc);outline-offset:2px}
.sop-hint{margin:7px 0 0;font-size:12.5px;line-height:1.5;color:var(--sop-muted)}
.sop-hint.is-bad{color:var(--sop-hot);font-weight:700}
.sop-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:18px;align-items:stretch}
.sop-cards.is-stack{grid-template-columns:minmax(0,1fr)}
.sop-card{position:relative;display:flex;flex-direction:column;min-width:0;background:var(--sop-bg);border:1px solid var(--sop-line);border-radius:20px;padding:28px 24px 24px}
.sop-card.is-story{border:2px solid var(--sop-acc);box-shadow:0 14px 36px rgba(0,0,0,.08)}
.sop-badges{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 14px}
.sop-badge{display:inline-block;padding:5px 11px;border-radius:50px;font-size:12.5px;font-weight:800;line-height:1.3}
.sop-badge.is-rec{background:var(--sop-acc);color:#fff}
.sop-badge.is-off{background:rgba(229,72,58,.12);color:var(--sop-hot)}
.sop-tag{margin:0 0 6px;font-size:15px;font-weight:800;color:var(--sop-muted)}
.sop-price-row{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 12px;margin:0}
.sop-was{font-size:16px;font-weight:600;color:#9a9a9a;text-decoration:line-through}
.sop-price{font-size:32px;font-weight:900;line-height:1.2}
.sop-vat{font-size:12.5px;font-weight:600;color:var(--sop-muted);margin-left:6px}
.sop-cond{margin:14px 0 0;font-size:14.5px;line-height:1.7;color:#333}
.sop-poster{margin:16px 0 0}
.sop-poster-frame{position:relative;width:100%;max-width:320px;margin:0 auto;aspect-ratio:4/5;border-radius:14px;overflow:hidden;background:#E3E3E0;border:1px solid var(--sop-line)}
.sop-poster-frame img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.sop-poster-ph{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:12px;text-align:center;font-size:13px;font-weight:700;color:#8a8a8a}
.sop-dl{display:flex;align-items:center;justify-content:center;width:100%;max-width:320px;margin:12px auto 0;min-height:46px;padding:10px 16px;border:1px solid var(--sop-ink);border-radius:50px;background:#fff;color:var(--sop-ink);font:inherit;font-size:14.5px;font-weight:800;text-decoration:none;cursor:pointer}
.sop-dl[aria-disabled="true"]{opacity:.45;pointer-events:none;border-color:#aaa}
.sop-dl-note{margin:8px 0 0;text-align:center;font-size:12.5px;line-height:1.5;color:var(--sop-muted)}
.sop-story-fields{margin:20px 0 0;padding:18px 0 0;border-top:1px solid var(--sop-line)}
.sop-check{display:flex;align-items:flex-start;gap:10px;margin:14px 0 0;font-size:14px;font-weight:700;line-height:1.55;cursor:pointer}
.sop-check input{flex:0 0 auto;width:20px;height:20px;margin:1px 0 0;accent-color:var(--sop-acc);cursor:pointer}
.sop-notice{margin:14px 0 0;font-size:12.5px;line-height:1.6;color:var(--sop-muted)}
.sop-spacer{flex:1 1 auto;min-height:16px}
.sop-pay{display:block;width:100%;min-height:56px;margin-top:18px;padding:16px 20px;border:0;border-radius:50px;background:var(--sop-acc);color:#fff;font:inherit;font-size:17px;font-weight:800;cursor:pointer;transition:opacity .2s,background-color .2s}
.sop-pay:hover{opacity:.92}
.sop-pay.is-dark{background:var(--sop-ink)}
.sop-pay:disabled{background:#CFCFCF;color:#fff;cursor:not-allowed;opacity:1}
.sop-err{margin:12px 0 0;font-size:13.5px;font-weight:700;line-height:1.5;color:var(--sop-hot);text-align:center}
.sop-refund{margin:16px 0 0;font-size:12.5px;line-height:1.6;color:var(--sop-muted);text-align:center}
@media(max-width:760px){
  .sop{margin-top:28px}
  .sop-box{padding:22px 18px}
  .sop-grid{grid-template-columns:minmax(0,1fr)}
  .sop-cards{grid-template-columns:minmax(0,1fr)}
  .sop-card{padding:24px 18px 20px}
  .sop-price{font-size:28px}
}
`;

// 부모 페이지의 요소 선택자(.so2-root p, h3 등)보다 우선하도록 모든 규칙에 .sop 접두를 붙인다
const SOP_STYLE = SOP_RAW.replace(/(^|[\n{}])(\s*)\.sop-/g, "$1$2.sop .sop-");

type Props = {
  /** true 면 화면 폭과 관계없이 카드를 위아래로 쌓는다 (좁은 단일 컬럼 페이지용) */
  stack?: boolean;
  /** 부모 페이지의 포인트 색을 맞추고 싶을 때 (예: 시안 페이지의 블루) */
  accent?: string;
  accentDark?: string;
  accentSoft?: string;
};

export default function SalesOpsPay({ stack, accent, accentDark, accentSoft }: Props) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [center, setCenter] = useState("");
  const [role, setRole] = useState("");
  const [insta, setInsta] = useState("");
  const [posted, setPosted] = useState(false);
  const [error, setError] = useState<{ card: "story" | "normal"; msg: string } | null>(null);
  const [posterOk, setPosterOk] = useState(true);
  const [coarse, setCoarse] = useState(false);

  const posterRef = useRef<HTMLImageElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const centerRef = useRef<HTMLInputElement>(null);

  // 모바일(터치)에서는 download 속성이 막히는 브라우저가 많아 새 탭으로 열어 길게 눌러 저장하게 한다
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setCoarse(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // 서버 렌더된 <img> 는 하이드레이션 전에 이미 실패했을 수 있어 onError 를 놓친다 — 마운트 시 한 번 더 확인
  useEffect(() => {
    const img = posterRef.current;
    if (img && img.complete && img.naturalWidth === 0) setPosterOk(false);
  }, []);

  const instaValid = insta.length >= 1;
  const storyReady = instaValid && posted;

  const validateCommon = (): string | null => {
    if (name.trim().length < 2) {
      nameRef.current?.focus();
      return "이름을 2자 이상 입력해주세요.";
    }
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 11) {
      phoneRef.current?.focus();
      return "휴대폰 번호를 정확히 입력해주세요.";
    }
    if (!center.trim()) {
      centerRef.current?.focus();
      return "센터명을 입력해주세요.";
    }
    if (!role) return "역할을 선택해주세요.";
    return null;
  };

  const go = (card: "story" | "normal") => {
    const common = validateCommon();
    if (common) {
      setError({ card, msg: common });
      return;
    }
    if (card === "story" && !storyReady) {
      setError({ card, msg: "인스타그램 아이디와 스토리 업로드 확인이 필요합니다." });
      return;
    }
    setError(null);
    const slug = card === "story" ? SO_PRODUCT_STORY : SO_PRODUCT_NORMAL;
    saveCheckoutPrefill(slug, {
      name: name.trim(),
      phone: formatPhone(phone.replace(/\D/g, "")),
      center: center.trim(),
      role,
      // 정상가 결제는 인스타 아이디를 싣지 않는다 (시트에는 빈 값으로 기록)
      instagram: card === "story" ? insta : "",
    });
    router.push(`/checkout?product=${slug}`);
  };

  const themeStyle = {
    ...(accent ? { ["--sop-acc" as string]: accent } : {}),
    ...(accentDark ? { ["--sop-acc-dark" as string]: accentDark } : {}),
    ...(accentSoft ? { ["--sop-acc-soft" as string]: accentSoft } : {}),
  } as React.CSSProperties;

  return (
    <div className="sop" style={themeStyle}>
      <style>{SOP_STYLE}</style>

      {/* 공통 신청자 정보 */}
      <div className="sop-box">
        <h3 className="sop-h">신청자 정보</h3>
        <p className="sop-sub">결제 전에 아래 정보를 입력해주세요. 이메일은 결제 화면에서 입력합니다.</p>
        <div className="sop-grid">
          <div className="sop-field">
            <label className="sop-label" htmlFor="sop-name">
              이름<span className="sop-req">*</span>
            </label>
            <input
              id="sop-name"
              ref={nameRef}
              className="sop-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력해주세요"
              autoComplete="name"
            />
          </div>
          <div className="sop-field">
            <label className="sop-label" htmlFor="sop-phone">
              휴대폰 번호<span className="sop-req">*</span>
            </label>
            <input
              id="sop-phone"
              ref={phoneRef}
              className="sop-input"
              type="tel"
              inputMode="numeric"
              maxLength={13}
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="010-0000-0000"
              autoComplete="tel"
            />
          </div>
          <div className="sop-field is-wide">
            <label className="sop-label" htmlFor="sop-center">
              센터명<span className="sop-req">*</span>
            </label>
            <input
              id="sop-center"
              ref={centerRef}
              className="sop-input"
              type="text"
              value={center}
              onChange={(e) => setCenter(e.target.value)}
              placeholder="예: OO 필라테스 OO점"
              autoComplete="organization"
            />
          </div>
          <fieldset className="sop-field is-wide sop-roles" aria-label="역할">
            {ROLES.map((r) => (
              <label className="sop-role" key={r}>
                <input
                  type="radio"
                  name="sop-role"
                  value={r}
                  checked={role === r}
                  onChange={() => setRole(r)}
                />
                <span>{r}</span>
              </label>
            ))}
          </fieldset>
        </div>
      </div>

      {/* 결제 카드 2개 — 인증가(위/왼쪽) · 정상가 */}
      <div className={"sop-cards" + (stack ? " is-stack" : "")}>
        <div className="sop-card is-story">
          <div className="sop-badges">
            <span className="sop-badge is-rec">추천</span>
            <span className="sop-badge is-off">{SO_STORY_DISCOUNT_PCT}% 할인</span>
          </div>
          <p className="sop-tag">스토리 인증가</p>
          <p className="sop-price-row">
            <span className="sop-was">{won(SO_PRICE_NORMAL)}</span>
            <span className="sop-price">
              {won(SO_PRICE_STORY)}
              <span className="sop-vat">(VAT포함)</span>
            </span>
          </p>
          <p className="sop-cond">
            스토리 결제하신 후 hyunjin_salessalon 혹은 thegrow_ceo 아래 포스터를 본인 인스타그램 스토리에{" "}
            {BRAND_TAG} 태그와 함께 올려주시면 되십니다
          </p>

          <div className="sop-poster">
            <div className="sop-poster-frame">
              <span className="sop-poster-ph" aria-hidden={posterOk}>
                포스터 이미지 준비 중
              </span>
              {posterOk && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  ref={posterRef}
                  src={POSTER_SRC}
                  alt="세미나 안내 포스터"
                  onError={() => setPosterOk(false)}
                />
              )}
            </div>
            <a
              className="sop-dl"
              href={POSTER_SRC}
              download={coarse ? undefined : POSTER_FILENAME}
              target={coarse ? "_blank" : undefined}
              rel={coarse ? "noopener noreferrer" : undefined}
              aria-disabled={!posterOk}
            >
              포스터 저장하기
            </a>
            {coarse && posterOk && (
              <p className="sop-dl-note">새 탭에서 포스터가 열리면 이미지를 길게 눌러 저장해주세요.</p>
            )}
          </div>

          <div className="sop-story-fields">
            <div className="sop-field">
              <label className="sop-label" htmlFor="sop-insta">
                인스타그램 아이디<span className="sop-req">*</span>
              </label>
              <input
                id="sop-insta"
                className="sop-input"
                type="text"
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={insta}
                onChange={(e) => setInsta(cleanInstagram(e.target.value))}
                placeholder="내 인스타그램 아이디"
              />
              <p className="sop-hint">@ 는 빼고 입력해주세요. 영문·숫자·밑줄(_)·점(.)만 사용할 수 있습니다.</p>
            </div>
            <label className="sop-check">
              <input type="checkbox" checked={posted} onChange={(e) => setPosted(e.target.checked)} />
              <span>포스터를 {BRAND_TAG} 태그와 함께 스토리에 올렸습니다</span>
            </label>
          </div>

          <p className="sop-notice">
            스토리 업로드는 운영팀이 태그 알림으로 확인합니다. 확인되지 않으면 정상가와의 차액{" "}
            {won(SO_PRICE_DIFF)}을 별도 안내드립니다.
          </p>
          <div className="sop-spacer" />
          <button type="button" className="sop-pay" disabled={!storyReady} onClick={() => go("story")}>
            스토리 인증가로 신청하기
          </button>
          {error?.card === "story" && <p className="sop-err">{error.msg}</p>}
        </div>

        <div className="sop-card">
          <p className="sop-tag">정상가</p>
          <p className="sop-price-row">
            <span className="sop-price">
              {won(SO_PRICE_NORMAL)}
              <span className="sop-vat">(VAT포함)</span>
            </span>
          </p>
          <p className="sop-cond">조건 없이 바로 결제할 수 있습니다</p>
          <div className="sop-spacer" />
          <button type="button" className="sop-pay is-dark" onClick={() => go("normal")}>
            정상가로 신청하기
          </button>
          {error?.card === "normal" && <p className="sop-err">{error.msg}</p>}
        </div>
      </div>
    </div>
  );
}
