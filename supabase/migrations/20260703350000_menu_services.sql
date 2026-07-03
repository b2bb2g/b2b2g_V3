-- 메인 메뉴(데이터 관리) + 서비스 카탈로그(9장). 메뉴 전 항목은 관리자가 자유 편집(하드코딩 금지).
create type public.menu_group as enum ('product', 'project_request', 'info_service');

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  label_en text not null,
  label_ko text not null,
  "group" public.menu_group not null default 'info_service',
  route text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  is_system boolean not null default false,   -- 핵심 메뉴(삭제 방지, 이름·링크·노출은 변경 가능)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index menu_items_order_idx on public.menu_items (is_active, "group", sort_order);
create trigger trg_menu_items_updated_at
  before update on public.menu_items for each row execute function public.set_updated_at();

create table public.services (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles (id) on delete set null,
  title text not null,
  summary text,
  body text not null default '',
  cover_image text,
  status public.content_status not null default 'draft',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index services_status_idx on public.services (status, sort_order);
create trigger trg_services_updated_at
  before update on public.services for each row execute function public.set_updated_at();

-- RLS: 공개 읽기(활성 메뉴 / published 서비스), 작성/수정/삭제는 관리자.
alter table public.menu_items enable row level security;
alter table public.services enable row level security;

create policy menu_items_select_public on public.menu_items
  for select using (is_active or public.is_admin());
create policy menu_items_admin_write on public.menu_items
  for all using (public.is_admin()) with check (public.is_admin());

create policy services_select_public on public.services
  for select using (status = 'published' or public.is_admin());
create policy services_admin_write on public.services
  for all using (public.is_admin()) with check (public.is_admin());

-- 기본 메뉴 시드(초기값 — 관리자가 라벨·링크·순서·노출·그룹 자유 변경 가능).
insert into public.menu_items (label_en, label_ko, "group", route, sort_order, is_active, is_system)
values
  ('Products', '제품', 'product', '/products', 10, true, true),
  ('EPC Projects', 'EPC 프로젝트', 'project_request', '/epc', 20, true, true),
  ('Sourcing Requests', '소싱 요청', 'project_request', '/requests', 30, true, true),
  ('Events', '행사', 'info_service', '/events', 40, true, true),
  ('Services', '서비스', 'info_service', '/services', 50, true, true),
  ('Notices', '공지사항', 'info_service', '/notices', 60, true, true),
  ('FAQ', 'FAQ', 'info_service', '/faq', 70, true, true);
