// ─────────────────────────────────────────────────────────────────────────────
// 구글 서치콘솔 Search Analytics (서버 전용)
//
//  · /api/admin/gsc 에서만 import 한다. 클라이언트 컴포넌트에서 import 금지.
//  · GA 와 같은 서비스 계정(GA_SA_CLIENT_EMAIL / GA_SA_PRIVATE_KEY)을 쓴다.
//    서치콘솔 속성의 "설정 > 사용자 및 권한"에 서비스 계정 이메일을 "제한됨(읽기)" 이상으로 추가해야 한다.
//  · 환경변수 GSC_SITE_URL — 도메인 속성이면 "sc-domain:thegrowcompany.kr",
//    URL 접두어 속성이면 "https://www.thegrowcompany.kr/" 처럼 끝 슬래시까지 그대로.
//  · 패키지는 googleapis 전체가 아니라 @googleapis/searchconsole 를 쓴다 (같은 v1 API).
//    googleapis 는 모든 구글 API 를 담고 있어 서버리스 함수 용량 한도(250MB)를 위협한다.
// ─────────────────────────────────────────────────────────────────────────────

import { auth, searchconsole } from "@googleapis/searchconsole";
import { GaConfigError, getGaCredentials, isGaPermissionError } from "@/lib/ga";
import { GSC_OPP_MIN_IMPRESSIONS, GSC_OPP_POS_MAX, GSC_OPP_POS_MIN, type GscReport, type GscRow } from "@/lib/gaTypes";

const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

const CACHE_TTL_MS = 60 * 60 * 1000;
let cache: { at: number; data: GscReport } | null = null;

const ymd = (d: Date) => d.toISOString().slice(0, 10);

function siteUrl(): string {
  const v = process.env.GSC_SITE_URL?.trim();
  if (!v) throw new GaConfigError(["GSC_SITE_URL"]);
  return v;
}

export async function fetchGsc(): Promise<GscReport> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.data;

  const site = siteUrl();
  const authClient = new auth.GoogleAuth({ credentials: getGaCredentials(), scopes: [SCOPE] });
  const sc = searchconsole({ version: "v1", auth: authClient });

  const end = new Date(Date.now() - 3 * 86400000);
  const start = new Date(end.getTime() - 27 * 86400000);
  const range = { startDate: ymd(start), endDate: ymd(end) };

  const run = async (dimension: "query" | "page", rowLimit: number): Promise<GscRow[]> => {
    const res = await sc.searchanalytics.query({
      siteUrl: site,
      requestBody: { ...range, dimensions: [dimension], rowLimit },
    });
    return (res.data.rows ?? []).map((r) => ({
      key: r.keys?.[0] ?? "",
      clicks: r.clicks ?? 0,
      impressions: r.impressions ?? 0,
      ctr: r.ctr ?? 0,
      position: r.position ?? 0,
    }));
  };

  // 기회 키워드는 클릭이 적은 검색어에서 나오므로 상위 50 보다 넓게(250) 받아 거른다
  const [queryRows, pageRows] = await Promise.all([run("query", 250), run("page", 30)]);

  const opportunities = queryRows
    .filter(
      (r) =>
        r.impressions >= GSC_OPP_MIN_IMPRESSIONS &&
        r.position >= GSC_OPP_POS_MIN &&
        r.position <= GSC_OPP_POS_MAX,
    )
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 20);

  const data: GscReport = {
    ok: true,
    ...range,
    queries: queryRows.slice(0, 50),
    pages: pageRows,
    opportunities,
    fetchedAt: new Date().toISOString(),
  };
  cache = { at: Date.now(), data };
  return data;
}

/** 라우트 공통 에러 응답 — GA 와 같은 형식 */
export function gscErrorBody(err: unknown): { status: number; body: { ok: false; code: string; message: string } } {
  if (err instanceof GaConfigError) {
    return { status: 500, body: { ok: false, code: "GSC_NOT_CONFIGURED", message: err.message } };
  }
  if (isGaPermissionError(err)) {
    return {
      status: 403,
      body: {
        ok: false,
        code: "PERMISSION_DENIED",
        message: "서치콘솔 속성에 서비스 계정 이메일이 추가돼 있는지, GSC_SITE_URL 이 속성 유형과 맞는지 확인",
      },
    };
  }
  console.error("서치콘솔 호출 실패:", err);
  return {
    status: 502,
    body: { ok: false, code: "GSC_REQUEST_FAILED", message: "서치콘솔 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요." },
  };
}
