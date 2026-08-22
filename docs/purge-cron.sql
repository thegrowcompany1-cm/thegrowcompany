-- ============================================================================
-- 탈퇴 유예 30일 경과 계정 영구 삭제 (pg_cron)
--
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 직접 실행하세요.
-- 애플리케이션 코드에서는 이 스크립트를 실행하지 않습니다.
--
-- 동작
--   · profiles.scheduled_deletion_at 이 지난 계정을 auth.users 에서 삭제
--   · profiles.id 가 auth.users(id) 를 FK 로 참조하므로 ON DELETE CASCADE 로
--     profiles 행도 함께 사라집니다. (FK 설정은 아래 3단계에서 확인)
--   · 유예 기간(30일)은 app/api/withdraw/route.ts 의 GRACE_DAYS 와 같아야 합니다.
-- ============================================================================


-- ── 1단계. 확장 설치 ────────────────────────────────────────────────────────
create extension if not exists pg_cron;


-- ── 2단계. 삭제 함수 ────────────────────────────────────────────────────────
-- auth.users 를 건드려야 하므로 SECURITY DEFINER 로 만듭니다.
create or replace function public.purge_withdrawn_users()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  purged integer := 0;
begin
  with due as (
    select id
    from public.profiles
    where deleted_at is not null
      and scheduled_deletion_at is not null
      and scheduled_deletion_at <= now()
  ), gone as (
    delete from auth.users u
    using due
    where u.id = due.id
    returning u.id
  )
  select count(*) into purged from gone;

  raise notice 'purge_withdrawn_users: % 건 삭제', purged;
  return purged;
end;
$$;

-- 일반 사용자가 직접 호출하지 못하게 막습니다.
revoke all on function public.purge_withdrawn_users() from public, anon, authenticated;


-- ── 3단계. FK CASCADE 확인 ──────────────────────────────────────────────────
-- 2026-08-22 기준 profiles_id_fkey 의 delete_rule 은 이미 CASCADE 입니다.
-- 따라서 이 단계는 보통 건너뛰어도 됩니다. (아래는 확인/복구용)
--
-- 참고: orders_user_id_fkey 는 SET NULL 이라 계정을 지워도 주문 기록은 남고
--       user_id 만 NULL 이 됩니다. 결제 이력 보존 관점에서 의도된 동작입니다.
--
--   select rc.delete_rule
--   from information_schema.referential_constraints rc
--   where rc.constraint_name = 'profiles_id_fkey';
--
-- CASCADE 가 아니라면:
--
--   alter table public.profiles drop constraint profiles_id_fkey;
--   alter table public.profiles
--     add constraint profiles_id_fkey
--     foreign key (id) references auth.users(id) on delete cascade;


-- ── 4단계. 스케줄 등록 (매일 새벽 4시 KST = UTC 19시) ───────────────────────
-- pg_cron 은 UTC 기준으로 동작합니다.
select cron.schedule(
  'purge-withdrawn-users',
  '0 19 * * *',
  $$select public.purge_withdrawn_users();$$
);


-- ── 확인 / 운영용 쿼리 ──────────────────────────────────────────────────────

-- 등록된 잡 확인
--   select jobid, jobname, schedule, active from cron.job;

-- 실행 이력 확인 (최근 20건)
--   select jobid, status, return_message, start_time
--   from cron.job_run_details order by start_time desc limit 20;

-- 지금 당장 한 번 실행해보기 (삭제가 실제로 일어나므로 주의)
--   select public.purge_withdrawn_users();

-- 삭제 예정 계정 미리보기 (삭제 없이 확인만)
--   select id, username, deleted_at, scheduled_deletion_at
--   from public.profiles
--   where deleted_at is not null
--   order by scheduled_deletion_at;

-- 잡 해제
--   select cron.unschedule('purge-withdrawn-users');
