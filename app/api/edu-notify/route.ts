// 그로우 에듀 "오픈 알림 받기" 접수 — POST /api/edu-notify
//
//  · 폼(components/edu/OpenNotifyForm.tsx)이 JSON 으로 보낸다.
//  · 검증: 이름·연락처·두 동의 필수, 연락처는 숫자만 남겨 정규화, course 는 허용값만.
//  · 중복 방지: 같은 course + phone 이 24시간 안에 이미 있으면 저장하지 않고 성공만 돌려준다.
//  · 저장은 service role(SUPABASE_SERVICE_ROLE_KEY)로만 한다. 테이블은 RLS 가 켜져 있고 정책이 없어
//    anon 키로는 읽기·쓰기가 모두 막힌다(supabase/migrations/20261124_edu_notify.sql).
//  · 개인정보는 로그에 남기지 않는다.

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { EDU_NOTIFY_ROLES, isEduNotifyCourse } from "@/lib/eduNotify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY_MS = 24 * 60 * 60 * 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** 국내 전화번호: 0 으로 시작하는 9~11자리 숫자 */
const PHONE_RE = /^0\d{8,10}$/;

const str = (v: unknown, max: number): string => (typeof v === "string" ? v.trim().slice(0, max) : "");

// 간단한 IP별 호출 제한 (서버리스 인스턴스 단위) — 폭주 방지용
const hits = new Map<string, { n: number; at: number }>();
function limited(key: string): boolean {
  const now = Date.now();
  const h = hits.get(key);
  if (!h || now - h.at > 60_000) {
    hits.set(key, { n: 1, at: now });
    if (hits.size > 2000) hits.clear();
    return false;
  }
  h.n += 1;
  return h.n > 8;
}

const fail = (status: number, message: string) => NextResponse.json({ ok: false, message }, { status });

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) return fail(429, "요청이 많습니다. 잠시 후 다시 시도해주세요.");

  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > 5000) return fail(413, "요청이 너무 큽니다.");
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return fail(400, "요청 형식이 올바르지 않습니다.");
  }

  // 봇 함정 — 사람 눈에 안 보이는 칸이 채워져 있으면 저장하지 않고 성공처럼 응답한다
  if (str(body.website, 100)) return NextResponse.json({ ok: true });

  const course = body.course;
  if (!isEduNotifyCourse(course)) return fail(400, "신청 과정을 확인할 수 없습니다.");

  const name = str(body.name, 50);
  if (!name) return fail(400, "성함을 입력해주세요.");

  const phone = str(body.phone, 30).replace(/\D/g, "");
  if (!PHONE_RE.test(phone)) return fail(400, "연락처를 정확히 입력해주세요.");

  if (body.privacyAgree !== true) return fail(400, "개인정보 수집·이용에 동의해주세요.");
  if (body.marketingAgree !== true) return fail(400, "광고성 정보(오픈 안내) 수신에 동의해주세요.");

  const email = str(body.email, 100);
  if (email && !EMAIL_RE.test(email)) return fail(400, "이메일 형식을 확인해주세요.");

  const region = str(body.region, 50);
  const roleRaw = str(body.role, 30);
  const role = (EDU_NOTIFY_ROLES as readonly string[]).includes(roleRaw) ? roleRaw : "";
  const pageRaw = str(body.page, 120).split("?")[0];
  const page = pageRaw.startsWith("/") ? pageRaw : "";

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("edu-notify: SUPABASE_SERVICE_ROLE_KEY 또는 URL 이 설정되지 않았습니다.");
    return fail(500, "접수 설정에 문제가 있습니다. 잠시 후 다시 시도해주세요.");
  }
  const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  // 같은 과정 + 같은 연락처가 24시간 안에 이미 있으면 저장하지 않고 성공 응답만
  const since = new Date(Date.now() - DAY_MS).toISOString();
  const dup = await db
    .from("edu_notify")
    .select("id")
    .eq("course", course)
    .eq("phone", phone)
    .gte("created_at", since)
    .limit(1);
  if (dup.error) {
    console.error("edu-notify 중복 확인 실패:", dup.error.message);
    return fail(500, "접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }
  if ((dup.data?.length ?? 0) > 0) return NextResponse.json({ ok: true, duplicate: true });

  const ins = await db.from("edu_notify").insert({
    course,
    name,
    phone,
    email: email || null,
    region: region || null,
    role: role || null,
    privacy_agree: true,
    marketing_agree: true,
    page: page || null,
  });
  if (ins.error) {
    console.error("edu-notify 저장 실패:", ins.error.message);
    return fail(500, "접수 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
  }

  return NextResponse.json({ ok: true });
}
