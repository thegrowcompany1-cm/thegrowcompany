// ─────────────────────────────────────────────────────────────────────────────
// 구글 서치콘솔 Search Analytics (서버 전용)
//
//  · /api/admin/gsc 에서만 import 한다. 클라이언트 컴포넌트에서 import 금지.
//  · GA 와 같은 서비스 계정(GA_SA_CLIENT_EMAIL / GA_SA_PRIVATE_KEY)을 쓴다.
//    서치콘솔 속성의 "설정 > 사용자 및 권한"에 서비스 계정 이메일을 "제한됨(읽기)" 이상으로 추가해야 한다.
//  · 환경변수 GSC_SITE_URL — 도메인 속성이면 "sc-domain:thegrowcompany.kr",
//    URL 접두어 속성이면 "https://www.thegrowcompany.kr/" 처럼 끝 슬래시까지 그대로.
//  · 기간은 호출하는 쪽이 정한다(from/to, KST). 서치콘솔은 최근 2~3일 데이터가 비어 있어 종료일이
//    최근 3일 안이면 응답의 delayed=true 로 알린다. 캐시는 기간별로 1시간.
//  · 패키지는 googleapis 전체가 아니라 @googleapis/searchconsole 를 쓴다 (같은 v1 API).
//    googleapis 는 모든 구글 API 를 담고 있어 서버리스 함수 용량 한도(250MB)를 위협한다.
// ─────────────────────────────────────────────────────────────────────────────

import { auth, searchconsole } from "@googleapis/searchconsole";
import { GaConfigError, getGaCredentials, isGaPermissionError } from "@/lib/ga";
import { addDays, todayKst } from "@/lib/gaRange";
import { GSC_OPP_MIN_IMPRESSIONS, GSC_OPP_POS_MAX, GSC_OPP_POS_MIN, type GscReport, type GscRow } from "@/lib/gaTypes";

const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

const CACHE_TTL_MS = 60 * 60 * 1000;
const CACHE_MAX = 40;
const cache = new Map<string, { at: number; data: GscReport }>();

function siteUrl(): string {
  const v = process.env.GSC_SITE_URL?.trim();
  if (!v) throw new GaConfigError(["GSC_SITE_URL"]);
  return v;
}

/** 서치콘솔은 약 2~3일 지연된다 — 종료일이 최근 3일 안이면 true */
export const GSC_DELAY_DAYS = 3;

export async function fetchGsc(from: string, to: string): Promise<GscReport> {
  const key = `${from}|${to}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.data;

  const site = siteUrl();
  const authClient = new auth.GoogleAuth({ credentials: getGaCredentials(), scopes: [SCOPE] });
  const sc = searchconsole({ version: "v1", auth: authClient });

  const range = { startDate: from, endDate: to };
  const delayed = to > addDays(todayKst(), -GSC_DELAY_DAYS);

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
    delayed,
    fetchedAt: new Date().toISOString(),
  };
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value as string);
  cache.set(key, { at: Date.now(), data });
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
