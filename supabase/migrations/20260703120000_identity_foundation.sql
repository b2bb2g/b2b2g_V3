-- 사용자 신원·역할 기반: profiles 테이블, 역할/상태 enum, 자동 프로필 생성, RLS(3.1 권한 매트릭스)

-- ── 공통: updated_at 자동 갱신 함수 (전 테이블 재사용) ──────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ── enum: 역할 4종 · 상태 5종 (0.1 규칙: enum은 DB 단일 정의) ───────────────
create type public.user_role as enum ('admin', 'supplier', 'agent', 'buyer');
create type public.user_status as enum ('pending', 'approved', 'rejected', 'suspended', 'withdrawn');

-- ── profiles: auth.users 와 1:1 (5.1) ──────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'buyer',
  email text not null,
  display_name text not null,
  phone text,
  locale text not null default 'en',
  status public.user_status not null default 'pending',
  memo text,                                  -- 관리자 전용 내부 메모
  last_login_at timestamptz,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles (role);
create index profiles_status_idx on public.profiles (status);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ── 관리자 판별 함수: RLS 재귀 방지 위해 SECURITY DEFINER 로 RLS 우회 ────────
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── 신규 auth.users → profiles 자동 생성 ────────────────────────────────────
-- 회원가입 시 메타데이터의 role 을 쓰되 admin 자가부여는 차단(관리자 임명만 허용).
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
begin
  safe_role := case
    when requested in ('supplier', 'agent', 'buyer') then requested::public.user_role
    else 'buyer'::public.user_role
  end;

  insert into public.profiles (id, email, display_name, locale, role, status)
  values (
    new.id,
    new.email,
    coalesce(nullif(meta ->> 'display_name', ''), split_part(new.email, '@', 1)),
    coalesce(nullif(meta ->> 'locale', ''), 'en'),
    safe_role,
    'pending'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── 자기 프로필 수정 가드: 비관리자는 role·status·memo·created_by 변경 불가 ──
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
  return new;
end;
$$;

create trigger trg_guard_profile_self_update
  before update on public.profiles
  for each row execute function public.guard_profile_self_update();

-- ── RLS: 3.1 권한 매트릭스 (최종 방어선은 DB) ───────────────────────────────
alter table public.profiles enable row level security;

-- 조회: 본인 행 또는 관리자 전체
create policy profiles_select_self on public.profiles
  for select using (id = auth.uid());
create policy profiles_select_admin on public.profiles
  for select using (public.is_admin());

-- 수정: 본인 행(가드 트리거가 민감 컬럼 보호) 또는 관리자 전체
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_update_admin on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- 삽입·삭제: 관리자만(일반 사용자는 트리거로만 생성됨)
create policy profiles_insert_admin on public.profiles
  for insert with check (public.is_admin());
create policy profiles_delete_admin on public.profiles
  for delete using (public.is_admin());
