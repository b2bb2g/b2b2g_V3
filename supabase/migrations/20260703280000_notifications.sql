-- 앱 내 알림(5.4). 본인 알림만 열람·읽음처리. 생성은 서버(service_role)가 이벤트 시.
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,                 -- inquiry_received / inquiry_replied 등
  payload jsonb not null default '{}'::jsonb,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_profile_idx on public.notifications (profile_id, read);

alter table public.notifications enable row level security;

-- 본인 알림만 조회·읽음처리. 삽입은 서버(service_role, RLS 우회)만.
create policy notifications_select_own on public.notifications
  for select using (profile_id = auth.uid());
create policy notifications_update_own on public.notifications
  for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());
