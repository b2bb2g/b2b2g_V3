-- 에이전트 산하 바이어 관계(5.1, 로드맵 17). 바이어가 에이전트 추천링크로 가입하면 소속 에이전트를 기록.
-- 단일 profiles 아키텍처에 맞춰 별도 buyers/agents 테이블 대신 profiles.referred_by 로 표현.

alter table public.profiles
  add column if not exists referred_by uuid references public.profiles (id) on delete set null;
create index if not exists profiles_referred_by_idx on public.profiles (referred_by);

-- 가입 트리거: ref(추천 코드) 를 추천인 profile 로 해석해 referred_by 설정.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  requested text := coalesce(nullif(meta ->> 'role', ''), 'buyer');
  safe_role public.user_role;
  ref_code text := nullif(meta ->> 'ref', '');
  ref_id uuid;
begin
  safe_role := case
    when requested in ('supplier', 'agent', 'buyer') then requested::public.user_role
    else 'buyer'::public.user_role
  end;

  if ref_code is not null then
    select id into ref_id from public.profiles where referral_code = ref_code limit 1;
  end if;

  insert into public.profiles (id, email, display_name, locale, role, status, referred_by)
  values (
    new.id,
    new.email,
    coalesce(nullif(meta ->> 'display_name', ''), split_part(new.email, '@', 1)),
    coalesce(nullif(meta ->> 'locale', ''), 'en'),
    safe_role,
    'pending',
    ref_id
  );
  return new;
end;
$$;

-- 자기수정 가드: 비관리자는 referred_by·referral_code 도 변경 불가(임의 조작 방지).
create or replace function public.guard_profile_self_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;
  end if;
  new.role := old.role;
  new.status := old.status;
  new.memo := old.memo;
  new.created_by := old.created_by;
  new.referred_by := old.referred_by;
  new.referral_code := old.referral_code;
  return new;
end;
$$;

-- 에이전트용 산하 바이어 마스킹 뷰: 거래금액·이메일 등 식별/거래정보 제외, 기본 신호만(5.1 매트릭스).
create view public.agent_buyers as
  select
    b.id,
    b.display_name,
    b.status,
    b.created_at
  from public.profiles b
  where b.referred_by = auth.uid()
    and b.role = 'buyer';

grant select on public.agent_buyers to authenticated;
