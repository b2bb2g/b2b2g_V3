-- 프로필 가드 수정: 백엔드(service_role/SQL, auth.uid() is null)는 role·status 변경 허용.
-- 사유: 기존 가드가 service_role 로도 role 을 되돌려 최초 관리자 부트스트랩·관리자 API 승격이
--       불가능했다. 인증된 비관리자 사용자의 자가 승격 차단은 그대로 유지한다.
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
  -- 인증된 비관리자는 민감 컬럼 변경 불가(자가 승격 차단).
  new.role := old.role;
  new.status := old.status;
  new.memo := old.memo;
  new.created_by := old.created_by;
  return new;
end;
$$;
