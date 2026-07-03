-- 이벤트/행사 게시판(5.5). 관리자 작성, 공개 열람. 선택적으로 플랫폼 내 참가신청.
create type public.event_category as enum (
  'trade_fair', 'buyer_matching', 'briefing', 'corporate', 'etc'
);
create type public.event_participation as enum ('open', 'closed', 'ended');
create type public.registration_status as enum ('applied', 'confirmed', 'cancelled');

create table public.events (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles (id) on delete set null,
  category public.event_category not null default 'etc',
  name text not null,
  body text not null default '',
  cover_image text,                 -- Storage 경로(업로드 UI는 미디어 슬라이스에서)
  venue text,
  location text,
  country text,
  starts_at timestamptz,
  ends_at timestamptz,
  booth_info text,
  external_link text,
  participation_status public.event_participation not null default 'open',
  status public.content_status not null default 'draft',
  is_pinned boolean not null default false,
  registration_enabled boolean not null default false,  -- 플랫폼 내 신청 사용 여부
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index events_status_idx on public.events (status, is_pinned, starts_at);
create trigger trg_events_updated_at
  before update on public.events for each row execute function public.set_updated_at();

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  status public.registration_status not null default 'applied',
  note text,
  created_at timestamptz not null default now(),
  unique (event_id, profile_id)     -- 1인 1신청
);
create index event_registrations_event_idx on public.event_registrations (event_id);

-- RLS
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;

create policy events_select_public on public.events
  for select using (status = 'published' or public.is_admin());
create policy events_write_admin on public.events
  for all using (public.is_admin()) with check (public.is_admin());

-- 참가신청: 본인 것 조회/생성/취소, 관리자 전체.
create policy event_reg_select on public.event_registrations
  for select using (profile_id = auth.uid() or public.is_admin());
create policy event_reg_insert_self on public.event_registrations
  for insert with check (profile_id = auth.uid());
create policy event_reg_update_own on public.event_registrations
  for update using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());
create policy event_reg_admin_all on public.event_registrations
  for delete using (public.is_admin());
