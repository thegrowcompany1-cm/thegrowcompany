"use client";

// ─────────────────────────────────────────────────────────────────────────────
// GA 대시보드 데이터 훅 — 요청 합치기 + 짧은 캐시 + 폴링 공유
//
//  · 같은 URL 을 여러 컴포넌트가 동시에 요청해도 네트워크 호출은 한 번이다 (진행 중 요청 공유).
//  · 성공 응답은 staleMs 동안 재사용한다 — 탭을 오가거나 다시 마운트해도 재요청하지 않는다.
//    오류 응답은 캐시하지 않는다 (다음 마운트에서 다시 시도).
//  · keepPrevious: URL 이 바뀌어 새 응답이 오기 전까지 직전 응답을 그대로 돌려주고 placeholder=true 를 켠다.
//  · active=false 면 요청도 폴링도 하지 않는다 (비활성 탭).
//  · 캐시는 브라우저 메모리(모듈 변수)에만 있고, 키 앞에 관리자 scope(이메일)를 붙인다.
//    scope 가 바뀌면 전부 비운다 — 다른 관리자 계정의 데이터가 섞이지 않는다.
//    서버 쪽 /api/admin/** 의 인증·권한·캐시 동작은 바꾸지 않는다.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { ApiError } from "./ga-shared";

type Entry = { data: unknown | null; err: ApiError | null; at: number };
const EMPTY: Entry = { data: null, err: null, at: 0 };

let scope = "";
const entries = new Map<string, Entry>();
const inflight = new Map<string, Promise<void>>();
const listeners = new Map<string, Set<() => void>>();

const keyOf = (url: string) => `${scope}\n${url}`;

/** 관리자 계정이 바뀌면 캐시를 모두 비운다 */
export function setGaScope(next: string) {
  if (next === scope) return;
  scope = next;
  entries.clear();
  inflight.clear();
}

function emit(key: string) {
  listeners.get(key)?.forEach((f) => f());
}

function subscribe(key: string, fn: () => void) {
  let set = listeners.get(key);
  if (!set) listeners.set(key, (set = new Set()));
  set.add(fn);
  return () => {
    set!.delete(fn);
    if (!set!.size) listeners.delete(key);
  };
}

/** url 을 불러온다. maxAge 안의 성공 캐시가 있으면 건너뛰고, 진행 중이면 그 요청에 합류한다. */
function load(url: string, maxAge: number, netMsg: string): Promise<void> {
  const key = keyOf(url);
  const hit = entries.get(key);
  if (hit && hit.data && Date.now() - hit.at < maxAge) return Promise.resolve();
  const running = inflight.get(key);
  if (running) return running;
  const mine = scope;
  const p = (async () => {
    let next: Entry;
    try {
      const res = await fetch(url, { cache: "no-store" });
      const body = (await res.json().catch(() => null)) as ({ ok?: boolean } & Record<string, unknown>) | null;
      if (!body) next = { data: null, err: { ok: false, code: "BAD_RESPONSE", message: `응답을 읽을 수 없습니다 (HTTP ${res.status})` }, at: Date.now() };
      else if (body.ok === false) next = { data: null, err: body as unknown as ApiError, at: Date.now() };
      else next = { data: body, err: null, at: Date.now() };
    } catch {
      next = { data: null, err: { ok: false, code: "NETWORK", message: netMsg }, at: Date.now() };
    }
    if (mine !== scope) return; // 요청 중에 관리자 scope 가 바뀌었다면 결과를 버린다
    // 갱신 실패 시에는 마지막 성공 응답을 지우지 않고 오류만 얹는다
    const prev = entries.get(key);
    entries.set(key, next.err && prev?.data ? { data: prev.data, err: next.err, at: prev.at } : next);
    emit(key);
  })().finally(() => {
    if (inflight.get(key) === p) inflight.delete(key);
  });
  inflight.set(key, p);
  return p;
}

export type GaOpts = {
  /** 성공 응답을 재사용하는 시간 (기본 60초) */
  staleMs?: number;
  /** 주기적 갱신 간격. 탭이 보일 때(visible)·active 일 때만 돈다 */
  pollMs?: number;
  /** false 면 요청·폴링 중지 (비활성 탭) */
  active?: boolean;
  /** 새 URL 응답이 오기 전까지 직전 응답을 유지 */
  keepPrevious?: boolean;
  netMsg?: string;
};

export type GaResult<T> = {
  data: T | null;
  error: ApiError | null;
  /** 지금 URL 의 새 응답을 기다리는 중 */
  loading: boolean;
  /** data 가 현재 URL 이 아니라 이전 URL 의 응답이다 */
  placeholder: boolean;
  /** 마지막 성공 응답을 받은 시각 (ms) — 없으면 0 */
  at: number;
};

export function useGaData<T>(url: string | null, opts: GaOpts = {}): GaResult<T> {
  const { staleMs = 60_000, pollMs, active = true, keepPrevious = false, netMsg = "네트워크 오류로 데이터를 불러오지 못했습니다." } = opts;
  const key = url ? keyOf(url) : "";
  const entry = useSyncExternalStore(
    useCallback((fn) => (key ? subscribe(key, fn) : () => {}), [key]),
    () => (key ? entries.get(key) ?? EMPTY : EMPTY),
    () => EMPTY,
  );

  // 직전 URL 의 성공 응답 (keepPrevious) — 새 응답이 올 때마다 렌더 중에 갱신한다 (파생 상태)
  const [last, setLast] = useState<{ key: string; data: unknown } | null>(null);
  if (keepPrevious && entry.data && key && (!last || last.key !== key || last.data !== entry.data)) setLast({ key, data: entry.data });

  useEffect(() => {
    if (!url || !active) return;
    load(url, staleMs, netMsg);
    if (!pollMs) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") load(url, pollMs * 0.5, netMsg);
    }, pollMs);
    return () => window.clearInterval(id);
  }, [url, key, active, staleMs, pollMs, netMsg]); // key 에는 관리자 scope 가 들어 있어, 계정이 바뀌면 같은 URL 도 새로 받는다

  const placeholder = keepPrevious && !entry.data && !!last && last.key !== key;
  const data = (entry.data ?? (placeholder ? last!.data : null)) as T | null;
  const loading = !!url && !entry.data && !entry.err;
  return { data, error: entry.err, loading, placeholder, at: entry.data ? entry.at : 0 };
}
