// ─────────────────────────────────────────────────────────────────────────────
// GA4 Data API 클라이언트 (서버 전용)
//
//  · /admin/ga 화면의 API 라우트(app/api/admin/ga/*)에서만 import 한다.
//    클라이언트 컴포넌트에서 import 하면 서비스 계정 키가 번들로 새어나간다.
//  · 환경변수 (모두 서버 전용 — NEXT_PUBLIC_ 금지)
//      GA_SA_CLIENT_EMAIL   서비스 계정 이메일
//      GA_SA_PRIVATE_KEY    서비스 계정 비공개 키 (줄바꿈은 \n 문자열로 넣어도 된다)
//      GA4_PROPERTY_ID      GA4 속성 ID (숫자). 측정 ID(G-XXXX)가 아니다.
//  · 서비스 계정은 GA4 속성에 "뷰어" 권한으로 추가돼 있어야 한다.
//  · BetaAnalyticsDataClient 는 인스턴스 생성 비용이 있어 모듈 단위 싱글턴으로 둔다.
// ─────────────────────────────────────────────────────────────────────────────

import { BetaAnalyticsDataClient } from "@google-analytics/data";

/** 환경변수 누락 — 어떤 값이 빠졌는지 메시지에 그대로 적는다 */
export class GaConfigError extends Error {
  constructor(public readonly missing: string[]) {
    super(`GA 환경변수가 설정되지 않았습니다: ${missing.join(", ")}`);
    this.name = "GaConfigError";
  }
}

type GaEnv = { clientEmail: string; privateKey: string; propertyId: string };

function readEnv(): GaEnv {
  const clientEmail = process.env.GA_SA_CLIENT_EMAIL?.trim();
  const rawKey = process.env.GA_SA_PRIVATE_KEY;
  const propertyId = process.env.GA4_PROPERTY_ID?.trim();

  const missing: string[] = [];
  if (!clientEmail) missing.push("GA_SA_CLIENT_EMAIL");
  if (!rawKey?.trim()) missing.push("GA_SA_PRIVATE_KEY");
  if (!propertyId) missing.push("GA4_PROPERTY_ID");
  if (missing.length) throw new GaConfigError(missing);

  return {
    clientEmail: clientEmail!,
    // 환경변수에 한 줄로 넣은 "\n" 문자열을 실제 줄바꿈으로 되돌린다
    privateKey: rawKey!.replace(/\\n/g, "\n"),
    propertyId: propertyId!,
  };
}

let client: BetaAnalyticsDataClient | null = null;

/** 싱글턴 클라이언트 + 속성 경로("properties/123456789") */
export function getGa(): { client: BetaAnalyticsDataClient; property: string } {
  const env = readEnv();
  if (!client) {
    client = new BetaAnalyticsDataClient({
      credentials: { client_email: env.clientEmail, private_key: env.privateKey },
    });
  }
  return { client, property: `properties/${env.propertyId}` };
}

/** gRPC PERMISSION_DENIED(7) 또는 HTTP 403 여부 */
export function isGaPermissionError(err: unknown): boolean {
  const e = err as { code?: number | string; message?: string } | null;
  if (!e) return false;
  if (e.code === 7 || e.code === 403 || e.code === "PERMISSION_DENIED") return true;
  return /PERMISSION_DENIED|403/.test(String(e.message ?? ""));
}

/** 라우트 공통 에러 응답 본문 */
export function gaErrorBody(err: unknown): { status: number; body: { ok: false; code: string; message: string } } {
  if (err instanceof GaConfigError) {
    return { status: 500, body: { ok: false, code: "GA_NOT_CONFIGURED", message: err.message } };
  }
  if (isGaPermissionError(err)) {
    return {
      status: 403,
      body: { ok: false, code: "PERMISSION_DENIED", message: "서비스 계정 GA 뷰어 권한 확인" },
    };
  }
  console.error("GA Data API 호출 실패:", err);
  return {
    status: 502,
    body: { ok: false, code: "GA_REQUEST_FAILED", message: "GA 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요." },
  };
}
