-- 회귀 수정: agent_buyers 마이그레이션이 guard_profile_self_update 의 "백엔드(service_role/auth.uid() null) 허용"을
-- 실수로 제거함(20260703210000 에서 넣었던 바이패스). 재적용 + referred_by/referral_code 보호 유지.
create or replace function public.guard_profile_self_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 관리자이거나, 인증 컨텍스트가 없는 백엔드 호출(service_role/SQL)이면 그대로 허용.
  if public.is_admin() or auth.uid() is null then
    return new;
  end if;
  -- 인증된 비관리자는 민감 컬럼 변경 불가(자가 승격/조작 차단).
  new.role := old.role;
  new.status := old.status;
  new.memo := old.memo;
  new.created_by := old.created_by;
  new.referred_by := old.referred_by;
  new.referral_code := old.referral_code;
  return new;
end;
$$;
