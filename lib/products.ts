// ─────────────────────────────────────────────────────────────────────────────
// 결제 상품 공용 모듈 — 결제 페이지(클라이언트)와 승인 라우트(서버)가 함께 쓴다.
//
//  · 상품의 원본(이름·가격)은 Supabase products 테이블이다. 가격을 코드 상수로
//    두면 서버 검증이 DB 와 어긋날 수 있어, 양쪽 모두 여기서 DB 를 조회한다.
//  · 주문번호(orderId)에 상품 슬러그를 심어 두어, successUrl 로 돌아온 뒤
//    서버가 "이 결제가 어느 상품의 것인지" 를 클라이언트 값 없이 판별한다.
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";

export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
};

// 상품 조회 전용 클라이언트 — 세션이 필요 없는 공개 읽기라 세션 저장을 끈다.
// (lib/supabase.ts 의 브라우저 클라이언트와 저장소를 공유하지 않게 하기 위함)
const productDb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

/** 판매중(is_active) 상품을 슬러그로 조회. 없으면 null */
export async function fetchProductBySlug(
  slug: string,
): Promise<Product | null> {
  const { data, error } = await productDb
    .from("products")
    .select("id, slug, name, price")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) return null;
  return (data as Product | null) ?? null;
}

// ── 주문번호 ────────────────────────────────────────────────────────────────
// 형식: TGC-<슬러그>-<epoch(13)><난수(4)>
// 토스 제약: 6~64자, 영문/숫자/'-'/'_'. 슬러그는 32자로 잘라 최대 54자.

const ORDER_ID_PREFIX = "TGC";
const SLUG_MAX = 32;

const sanitizeSlug = (slug: string) =>
  slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, SLUG_MAX);

export function buildOrderId(slug: string): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${ORDER_ID_PREFIX}-${sanitizeSlug(slug)}-${Date.now()}${rand}`;
}

/** 주문번호에서 상품 슬러그를 되꺼낸다. 형식이 아니면 null */
export function parseOrderIdSlug(orderId: string): string | null {
  const m = /^TGC-([a-z0-9-]+)-\d{13,}$/.exec(orderId);
  return m ? m[1] : null;
}

// ── 주문자 정보 임시 보관 ───────────────────────────────────────────────────
// 결제창 → successUrl 리다이렉트 사이에 이름/연락처/이메일을 넘겨야 하는데,
// 쿼리스트링에 실으면 개인정보가 URL·리퍼러·로그에 남는다. 같은 탭에서만 살아있고
// 탭을 닫으면 사라지는 sessionStorage 를 쓴다.

export type CheckoutCustomer = {
  name: string;
  phone: string;
  email: string;
  /** 신청 페이지에서 미리 받은 추가 정보 (없는 상품은 비어 있다) */
  center?: string;
  role?: string;
  instagram?: string;
};

const customerKey = (orderId: string) => `tgc:checkout:${orderId}`;

export function saveCheckoutCustomer(
  orderId: string,
  customer: CheckoutCustomer,
): void {
  try {
    sessionStorage.setItem(customerKey(orderId), JSON.stringify(customer));
  } catch {
    // 사파리 프라이빗 모드 등 — 주문자 정보 없이도 승인 자체는 진행된다.
  }
}

export function readCheckoutCustomer(orderId: string): CheckoutCustomer | null {
  try {
    const raw = sessionStorage.getItem(customerKey(orderId));
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<CheckoutCustomer>;
    return {
      name: String(v.name ?? ""),
      phone: String(v.phone ?? ""),
      email: String(v.email ?? ""),
      ...(v.center ? { center: String(v.center) } : {}),
      ...(v.role ? { role: String(v.role) } : {}),
      ...(v.instagram ? { instagram: String(v.instagram) } : {}),
    };
  } catch {
    return null;
  }
}

export function clearCheckoutCustomer(orderId: string): void {
  try {
    sessionStorage.removeItem(customerKey(orderId));
  } catch {
    /* 무시 */
  }
  // 신청 페이지에서 넘겨 둔 미리 입력 값도 결제가 끝나면 지운다
  const slug = parseOrderIdSlug(orderId);
  if (slug) clearCheckoutPrefill(slug);
}

// ── 신청 페이지 → 결제 페이지 미리 입력 값 ──────────────────────────────────
// /edu/sales-ops 처럼 결제 전에 신청 정보(센터명·역할·인스타 아이디)를 먼저 받는 페이지가
// 상품 슬러그를 키로 sessionStorage 에 담아 두면, 결제 페이지가 이름·연락처를 채우고
// 결제 승인 단계까지 같이 실어 보낸다. 값이 없으면 기존 흐름과 완전히 같다.

export type CheckoutPrefill = {
  name: string;
  phone: string;
  center: string;
  role: string;
  instagram: string;
};

const prefillKey = (slug: string) => `tgc:checkout:prefill:${slug}`;

export function saveCheckoutPrefill(slug: string, v: CheckoutPrefill): void {
  try {
    sessionStorage.setItem(prefillKey(slug), JSON.stringify(v));
  } catch {
    /* 무시 */
  }
}

export function readCheckoutPrefill(slug: string): CheckoutPrefill | null {
  try {
    const raw = sessionStorage.getItem(prefillKey(slug));
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<CheckoutPrefill>;
    return {
      name: String(v.name ?? ""),
      phone: String(v.phone ?? ""),
      center: String(v.center ?? ""),
      role: String(v.role ?? ""),
      instagram: String(v.instagram ?? ""),
    };
  } catch {
    return null;
  }
}

export function clearCheckoutPrefill(slug: string): void {
  try {
    sessionStorage.removeItem(prefillKey(slug));
  } catch {
    /* 무시 */
  }
}
