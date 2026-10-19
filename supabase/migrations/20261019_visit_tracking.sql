-- ============================================================================
-- 자체 방문 추적 (실시간 방문자 · 여정 · 섹션 이탈) — 아직 실행하지 않음
--
-- 이 저장소는 Supabase CLI 마이그레이션을 돌리지 않습니다. 실행은 Supabase 대시보드 →
-- SQL Editor 에서 직접 하세요. (profiles.phone 마이그레이션과 같은 방식)
--
-- 구조
--   visits         페이지 한 번 열 때마다 한 줄 (진입 시 insert, 이후 핑·이탈 때 update)
--   section_views  세션 안에서 주요 섹션을 50% 이상 본 기록 (세션·경로·섹션당 1건)
--
-- 보안
--   · 두 테이블 모두 RLS 를 켜고, anon/authenticated 에는 insert·update 정책을 주지 않는다.
--     anon 키는 브라우저 번들에 공개되므로 "아무나 아무 행이나 고치는" 정책을 열지 않기 위해서다.
--   · 기록은 아래 security definer 함수(track_*) 로만 한다. 함수는 id 를 아는 행 하나만
--     갱신할 수 있고, 입력 길이를 잘라서 넣는다. /api/track 라우트가 이 함수를 부른다.
--   · 조회(select)는 관리자만: service role(관리자 화면이 SUPABASE_SERVICE_ROLE_KEY 로 조회)
--     또는 아래 정책의 관리자 이메일로 로그인한 세션. ADMIN_EMAILS 를 바꾸면 이 정책의
--     이메일도 같이 바꿔야 한다.
--   · 개인정보(이름·전화·이메일)는 어디에도 저장하지 않는다. IP 도 저장하지 않는다.
--
-- 되돌리기
--   drop function if exists public.track_visit_start, public.track_visit_ping, public.track_section;
--   drop table if exists public.section_views, public.visits;
-- ============================================================================

create table if not exists public.visits (
  id              uuid primary key default gen_random_uuid(),
  visitor_id      text not null,                 -- localStorage 익명 UUID
  session_id      text not null,                 -- 30분 무활동 시 갱신
  path            text not null,                 -- 쿼리스트링 제외 경로
  referrer        text,
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  source_type     text not null default 'direct', -- paid_meta / organic_google / organic_naver / organic_other / ai / direct / referral
  device          text,                          -- mobile / tablet / desktop
  entered_at      timestamptz not null default now(),
  left_at         timestamptz,                   -- 페이지를 떠난 시각 (탭 닫기·이동). 비정상 종료면 null
  last_seen_at    timestamptz not null default now(), -- 15초 핑으로 갱신 — "지금 접속 중" 판정용 (명세 외 추가 열)
  duration_sec    integer,
  max_scroll_pct  integer,
  last_section    text
);

create index if not exists visits_entered_idx on public.visits (entered_at desc);
create index if not exists visits_session_idx on public.visits (session_id, entered_at);
create index if not exists visits_seen_idx    on public.visits (last_seen_at desc);
create index if not exists visits_path_idx    on public.visits (path, entered_at desc);

create table if not exists public.section_views (
  id          uuid primary key default gen_random_uuid(),
  session_id  text not null,
  path        text not null,
  section     text not null,
  seen_at     timestamptz not null default now(),
  unique (session_id, path, section)             -- 같은 섹션 중복 기록 금지
);

create index if not exists section_views_path_idx on public.section_views (path, seen_at desc);

alter table public.visits        enable row level security;
alter table public.section_views enable row level security;

-- 조회: 관리자 이메일만 (service role 은 RLS 를 우회하므로 정책이 필요 없다)
drop policy if exists visits_admin_select on public.visits;
create policy visits_admin_select on public.visits
  for select to authenticated
  using ((auth.jwt() ->> 'email') = any (array['hjyenm1@naver.com']));

drop policy if exists section_views_admin_select on public.section_views;
create policy section_views_admin_select on public.section_views
  for select to authenticated
  using ((auth.jwt() ->> 'email') = any (array['hjyenm1@naver.com']));

-- ── 기록용 함수 (security definer) ──────────────────────────────────────────

create or replace function public.track_visit_start(
  p_id uuid, p_visitor text, p_session text, p_path text, p_referrer text,
  p_utm_source text, p_utm_medium text, p_utm_campaign text, p_source_type text, p_device text
) returns void
language sql security definer set search_path = public as $$
  insert into public.visits
    (id, visitor_id, session_id, path, referrer, utm_source, utm_medium, utm_campaign, source_type, device)
  values
    (p_id, left(p_visitor, 64), left(p_session, 64), left(p_path, 300), left(p_referrer, 300),
     left(p_utm_source, 100), left(p_utm_medium, 100), left(p_utm_campaign, 150),
     left(coalesce(p_source_type, 'direct'), 30), left(p_device, 20))
  on conflict (id) do nothing;
$$;

create or replace function public.track_visit_ping(
  p_id uuid, p_duration integer, p_scroll integer, p_section text, p_end boolean
) returns void
language sql security definer set search_path = public as $$
  update public.visits set
    last_seen_at   = now(),
    duration_sec   = greatest(coalesce(duration_sec, 0), least(greatest(coalesce(p_duration, 0), 0), 86400)),
    max_scroll_pct = greatest(coalesce(max_scroll_pct, 0), least(greatest(coalesce(p_scroll, 0), 0), 100)),
    last_section   = coalesce(left(p_section, 60), last_section),
    left_at        = case when p_end then now() else left_at end
  where id = p_id;
$$;

create or replace function public.track_section(p_session text, p_path text, p_section text)
returns void
language sql security definer set search_path = public as $$
  insert into public.section_views (session_id, path, section)
  values (left(p_session, 64), left(p_path, 300), left(p_section, 60))
  on conflict (session_id, path, section) do nothing;
$$;

revoke all on function public.track_visit_start(uuid, text, text, text, text, text, text, text, text, text) from public;
revoke all on function public.track_visit_ping(uuid, integer, integer, text, boolean) from public;
revoke all on function public.track_section(text, text, text) from public;
grant execute on function public.track_visit_start(uuid, text, text, text, text, text, text, text, text, text) to anon, authenticated, service_role;
grant execute on function public.track_visit_ping(uuid, integer, integer, text, boolean) to anon, authenticated, service_role;
grant execute on function public.track_section(text, text, text) to anon, authenticated, service_role;

-- 오래된 데이터 정리(선택): 90일 지난 행 삭제 예시
--   delete from public.section_views where seen_at < now() - interval '90 days';
--   delete from public.visits        where entered_at < now() - interval '90 days';
