-- EPC 프로젝트 게시판(5.6). 관리자 작성, 공개 열람. Event 와 필드가 달라 별도 테이블.
create type public.project_field as enum (
  'power_plant', 'construction', 'factory', 'plant', 'civil', 'etc'
);
create type public.project_stage as enum (
  'planning', 'bidding', 'in_progress', 'completed'
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles (id) on delete set null,
  name text not null,
  field public.project_field not null default 'etc',
  body text not null default '',
  cover_image text,                 -- Storage 경로(업로드 UI 는 미디어 슬라이스에서)
  client text,                      -- 발주처
  location text,
  country text,
  scale_amount numeric,             -- 사업 규모(금액)
  currency text,
  starts_on date,                   -- 공사 기간
  ends_on date,
  stage public.project_stage not null default 'planning',
  status public.content_status not null default 'draft',
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_status_idx on public.projects (status, is_pinned, starts_on);
create trigger trg_projects_updated_at
  before update on public.projects for each row execute function public.set_updated_at();

-- RLS: 공개 열람은 published 만, 작성/수정/삭제는 관리자만(events 와 동일 규칙).
alter table public.projects enable row level security;

create policy projects_select_public on public.projects
  for select using (status = 'published' or public.is_admin());
create policy projects_write_admin on public.projects
  for all using (public.is_admin()) with check (public.is_admin());
