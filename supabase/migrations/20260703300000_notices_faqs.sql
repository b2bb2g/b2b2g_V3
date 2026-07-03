-- 관리자 공지형 게시판: 공지사항·FAQ(5.5). 관리자만 작성, 공개(published)는 누구나 열람.
-- 본문은 우선 text(rich text는 공통 에디터 슬라이스에서). 공유 상태 enum.

create type public.content_status as enum ('draft', 'published', 'closed');

create table public.notices (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles (id) on delete set null,
  title text not null,
  body text not null default '',
  is_pinned boolean not null default false,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index notices_status_idx on public.notices (status, is_pinned, created_at desc);
create trigger trg_notices_updated_at
  before update on public.notices for each row execute function public.set_updated_at();

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles (id) on delete set null,
  category text,
  question text not null,
  answer text not null default '',
  sort_order int not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index faqs_status_idx on public.faqs (status, sort_order);
create trigger trg_faqs_updated_at
  before update on public.faqs for each row execute function public.set_updated_at();

-- RLS: 공개(published)는 누구나, 편집은 관리자만.
alter table public.notices enable row level security;
alter table public.faqs enable row level security;

create policy notices_select_public on public.notices
  for select using (status = 'published' or public.is_admin());
create policy notices_write_admin on public.notices
  for all using (public.is_admin()) with check (public.is_admin());

create policy faqs_select_public on public.faqs
  for select using (status = 'published' or public.is_admin());
create policy faqs_write_admin on public.faqs
  for all using (public.is_admin()) with check (public.is_admin());
