-- ============================================================================
-- 방문 추적 중복 기록 방지 — 20261019_visit_tracking.sql 실행 후에 이어서 실행 (아직 실행하지 않음)
--
-- 증상
--   인스타그램 인앱 브라우저(모바일)에서 같은 session_id + path 의 visits 행이 수십 ms 간격으로 2개 생긴다.
--   (페이지 진입 때 추적 코드가 두 번 실행됨)
--
-- 이 파일이 하는 일
--   1) track_visit_start 를 고쳐서, 같은 session_id + path 가 3초 안에 이미 있으면 insert 하지 않는다.
--      · 두 호출이 거의 동시에 들어와도 둘 다 "없음"으로 보고 둘 다 넣는 일이 없도록
--        세션+경로 단위 advisory lock 으로 직렬화한다 (트랜잭션 끝에 자동 해제).
--      · SQL 함수 → plpgsql 함수로 바뀐다 (인자·반환형이 같아 create or replace 로 교체된다).
--   2) track_visit_ping 의 left_at 처리를 보완한다.
--      · 이전: p_end=false 일 때 left_at 을 건드리지 않음 → 새로고침 직후 이어받은 방문이
--        이전 페이지의 이탈 신호(left_at) 때문에 "끝난 방문"으로 남을 수 있었다.
--      · 이후: p_end=false 핑이 오면 left_at 을 비운다 (아직 보고 있다는 뜻). 이탈(p_end=true)이 오면 다시 채운다.
--
-- 이미 쌓인 중복 행
--   지우지 않는다. 관리자 집계(/api/admin/track)가 같은 session_id + path 를 3초 안에서 한 건으로 묶어 센다.
--   원하면 아래 "선택: 기존 중복 정리" 쿼리로 지울 수 있다 — 먼저 select 로 개수를 확인하고 실행할 것.
--
-- 되돌리기
--   20261019_visit_tracking.sql 의 track_visit_start / track_visit_ping 정의를 다시 실행하면 이전 동작으로 돌아간다.
-- ============================================================================

create or replace function public.track_visit_start(
  p_id uuid, p_visitor text, p_session text, p_path text, p_referrer text,
  p_utm_source text, p_utm_medium text, p_utm_campaign text, p_source_type text, p_device text
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_session text := left(p_session, 64);
  v_path    text := left(p_path, 300);
begin
  -- 같은 세션·경로의 동시 호출을 한 줄로 세운다 (락은 이 트랜잭션이 끝나면 풀린다)
  perform pg_advisory_xact_lock(hashtextextended(v_session || '|' || v_path, 0));

  -- 3초 안에 같은 세션·경로 진입이 이미 있으면 새 행을 만들지 않는다
  if exists (
    select 1 from public.visits
    where session_id = v_session
      and path = v_path
      and entered_at > now() - interval '3 seconds'
  ) then
    return;
  end if;

  insert into public.visits
    (id, visitor_id, session_id, path, referrer, utm_source, utm_medium, utm_campaign, source_type, device)
  values
    (p_id, left(p_visitor, 64), v_session, v_path, left(p_referrer, 300),
     left(p_utm_source, 100), left(p_utm_medium, 100), left(p_utm_campaign, 150),
     left(coalesce(p_source_type, 'direct'), 30), left(p_device, 20))
  on conflict (id) do nothing;
end;
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
    left_at        = case when p_end then now() else null end
  where id = p_id;
$$;

-- 권한은 교체 후에도 유지되지만, 확실히 하려고 다시 지정한다
revoke all on function public.track_visit_start(uuid, text, text, text, text, text, text, text, text, text) from public;
revoke all on function public.track_visit_ping(uuid, integer, integer, text, boolean) from public;
grant execute on function public.track_visit_start(uuid, text, text, text, text, text, text, text, text, text) to anon, authenticated, service_role;
grant execute on function public.track_visit_ping(uuid, integer, integer, text, boolean) to anon, authenticated, service_role;

-- ── 선택: 기존 중복 정리 ────────────────────────────────────────────────────
-- 같은 session_id + path 에서 직전 행과 3초 이내인 행(나중에 생긴 쪽)을 지운다.
-- 먼저 개수만 확인:
--   select count(*) from (
--     select id, entered_at - lag(entered_at) over (partition by session_id, path order by entered_at) as gap
--     from public.visits
--   ) t where gap is not null and gap <= interval '3 seconds';
-- 지우기:
--   delete from public.visits where id in (
--     select id from (
--       select id, entered_at - lag(entered_at) over (partition by session_id, path order by entered_at) as gap
--       from public.visits
--     ) t where gap is not null and gap <= interval '3 seconds'
--   );
