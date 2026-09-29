-- ============================================================================
-- profiles.phone 비공개 전환 — 참고용 SQL (아직 실행하지 않음)
--
-- 이 저장소는 Supabase CLI 마이그레이션을 돌리지 않습니다. 이 파일은 DB 에서
-- 무엇을 바꿀 예정인지 코드와 같은 자리에 남겨두기 위한 기록입니다.
-- 실행은 Supabase 대시보드 → SQL Editor 에서 직접 하세요.
--
-- 배경
--   profiles 의 SELECT 정책이 공개라 anon 키로도 전 회원의 phone 을 읽을 수
--   있었습니다. 컬럼 단위 권한으로 phone 만 빼서 그 경로를 막습니다.
--
-- 실행 전 확인
--   · phone 을 읽는 코드가 남아 있지 않은지 (2026-09-29 기준 정리 완료)
--       - app/mypage/page.tsx : 본인 phone 을 service role 로 조회하도록 변경
--       - app/admin/_lib/members.ts : service role 일 때만 phone 을 요청
--       - 그 외 profiles 조회는 모두 phone 을 포함하지 않음
--   · UPDATE 권한은 건드리지 않습니다. 마이페이지의 본인 연락처 수정은
--     그대로 동작해야 합니다 (RLS: auth.uid() = id).
--   · service_role 은 grant/revoke 대상이 아니므로 관리자 화면과
--     마이페이지의 본인 연락처 조회는 영향을 받지 않습니다.
--
-- 되돌리기
--   grant select on public.profiles to anon, authenticated;
-- ============================================================================

revoke select on public.profiles from anon, authenticated;

grant select (
  id,
  username,
  nickname,
  role,
  created_at,
  updated_at,
  deleted_at,
  scheduled_deletion_at
) on public.profiles to anon, authenticated;
