-- ============================================================================
-- 그로우 에듀 "오픈 알림 받기" 신청 — 아직 실행하지 않음
--
-- 이 저장소는 Supabase CLI 마이그레이션을 돌리지 않습니다. 실행은 Supabase 대시보드 →
-- SQL Editor(또는 연결된 채팅의 Supabase 도구)에서 직접 하세요.
--
-- 용도
--   /edu/{sales-ops, fc-class, startup-class, gx-class} 의 "오픈 알림 받기" 폼 신청을 저장한다.
--   과정(course)은 sales-ops | fc-class | startup-class | gx-class 만 허용한다.
--
-- 보안
--   · RLS 를 켜고 정책을 하나도 만들지 않는다 → anon/authenticated 는 읽기·쓰기 모두 불가.
--   · 쓰기는 app/api/edu-notify/route.ts 가 SUPABASE_SERVICE_ROLE_KEY(service role)로만 한다.
--     service role 은 RLS 를 우회하므로 정책이 없어도 서버에서는 insert/select 가 된다.
--   · 읽기는 관리자 화면(/admin/notify)이 같은 service role 로만 한다.
--   · 연락처·이메일이 들어 있으므로 테이블 권한도 anon/authenticated 에서 회수해 이중으로 막는다.
--
-- 되돌리기
--   drop table if exists public.edu_notify;
-- ============================================================================

create table if not exists public.edu_notify (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  course          text not null
                  check (course in ('sales-ops', 'fc-class', 'startup-class', 'gx-class')),
  name            text not null,
  phone           text not null,                 -- 숫자만 (예: 01012345678)
  email           text,
  region          text,                          -- 사는 지역
  role            text,                          -- 직책 (대표·원장 / 관리자·실장 / 트레이너·강사 / 예비 창업자)
  privacy_agree   boolean not null default false,  -- 개인정보 수집·이용 동의 (필수)
  marketing_agree boolean not null default false,  -- 광고성 정보(오픈 안내) 수신 동의 (필수)
  page            text                           -- 신청한 페이지 경로 (예: /edu/gx-class)
);

comment on table public.edu_notify is '그로우 에듀 오픈 알림 신청. 쓰기·읽기 모두 service role 전용(RLS 켜짐, 정책 없음).';

-- 24시간 중복 신청 확인(같은 과정 + 같은 연락처)과 관리자 최신순 목록용
create index if not exists edu_notify_course_phone_created_idx
  on public.edu_notify (course, phone, created_at desc);
create index if not exists edu_notify_created_idx
  on public.edu_notify (created_at desc);

alter table public.edu_notify enable row level security;
-- 정책을 만들지 않는다 (공개 읽기·쓰기 불가)

revoke all on table public.edu_notify from anon, authenticated;
