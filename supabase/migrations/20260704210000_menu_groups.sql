-- 메뉴 그룹을 관리자가 관리하도록 별도 테이블화(9장). 기존 group enum 컬럼은 배포 안전 위해 유지(미사용화).
create table public.menu_groups (
  id uuid primary key default gen_random_uuid(),
  label_en text not null,
  label_ko text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_menu_groups_updated_at
  before update on public.menu_groups for each row execute function public.set_updated_at();

alter table public.menu_groups enable row level security;
create policy menu_groups_select_public on public.menu_groups for select using (true);
create policy menu_groups_admin_write on public.menu_groups
  for all using (public.is_admin()) with check (public.is_admin());

-- 기존 3개 그룹을 시드하고, menu_items 를 새 group_id 로 연결.
insert into public.menu_groups (label_en, label_ko, sort_order) values
  ('Products', '제품', 10),
  ('Projects & Requests', '프로젝트·요청', 20),
  ('Info & Services', '정보·서비스', 30);

alter table public.menu_items
  add column if not exists group_id uuid references public.menu_groups (id) on delete set null;

update public.menu_items set group_id = (select id from public.menu_groups where label_en = 'Products')
  where "group" = 'product';
update public.menu_items set group_id = (select id from public.menu_groups where label_en = 'Projects & Requests')
  where "group" = 'project_request';
update public.menu_items set group_id = (select id from public.menu_groups where label_en = 'Info & Services')
  where "group" = 'info_service';

-- 기존 group 컬럼은 신규 삽입 시 기본값으로 채워지도록 유지(NOT NULL default 'info_service').
