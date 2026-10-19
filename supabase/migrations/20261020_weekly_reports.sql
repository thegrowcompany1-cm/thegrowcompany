-- ============================================================================
-- 주간 AI 리포트 저장소 — 아직 실행하지 않음
--
-- 실행은 Supabase 대시보드 → SQL Editor 에서 직접 하세요.
--
-- 구조
--   weekly_reports  기간(period_from~period_to)당 한 줄. 같은 기간을 다시 만들면 그 줄을 덮어쓴다.
--   status          'ok' | 'error'   (error 면 error 열에 원인, summary_md 는 비어 있다)
--   input_json      AI 에 보낸 집계 숫자(개인 식별값 없음) — 리포트 근거 확인용
--
-- 보안
--   · RLS 를 켜고 select 정책은 관리자 이메일(hjyenm1@naver.com)만. ADMIN_EMAILS 를 바꾸면 이 이메일도 같이 바꿀 것.
--   · insert/update/delete 정책은 만들지 않는다 → 일반 키로는 쓸 수 없다.
--     쓰기는 service role(RLS 우회) 이거나 아래 security definer 함수 save_weekly_report() 로만 한다.
--     함수는 service role 이거나 관리자 이메일로 로그인한 세션일 때만 동작한다.
--
-- 되돌리기
--   drop function if exists public.save_weekly_report;
--   drop table if exists public.weekly_reports;
-- ============================================================================

create table if not exists public.weekly_reports (
  id           uuid primary key default gen_random_uuid(),
  period_from  date not null,
  period_to    date not null,
  created_at   timestamptz not null default now(),
  status       text not null default 'ok' check (status in ('ok', 'error')),
  summary_md   text,
  input_json   jsonb,
  error        text,
  model        text,
  unique (period_from, period_to)
);

create index if not exists weekly_reports_created_idx on public.weekly_reports (period_from desc);

alter table public.weekly_reports enable row level security;

drop policy if exists "weekly_reports_select_admin" on public.weekly_reports;
create policy "weekly_reports_select_admin"
  on public.weekly_reports for select
  to authenticated
  using ((auth.jwt() ->> 'email') = 'hjyenm1@naver.com');

-- 같은 기간이 있으면 덮어쓴다 (created_at 도 새로 찍는다)
create or replace function public.save_weekly_report(
  p_period_from date,
  p_period_to   date,
  p_status      text,
  p_summary_md  text,
  p_input_json  jsonb,
  p_error       text,
  p_model       text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if coalesce(auth.role(), '') <> 'service_role'
     and coalesce(auth.jwt() ->> 'email', '') <> 'hjyenm1@naver.com' then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  insert into public.weekly_reports (period_from, period_to, status, summary_md, input_json, error, model)
  values (p_period_from, p_period_to, p_status, p_summary_md, p_input_json, p_error, p_model)
  on conflict (period_from, period_to) do update
    set created_at = now(),
        status     = excluded.status,
        summary_md = excluded.summary_md,
        input_json = excluded.input_json,
        error      = excluded.error,
        model      = excluded.model
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.save_weekly_report(date, date, text, text, jsonb, text, text) from public, anon;
grant execute on function public.save_weekly_report(date, date, text, text, jsonb, text, text) to authenticated, service_role;
