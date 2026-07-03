-- 광고배너(6.5) + 팝업(6.6). 관리자 제작, 기간·대상·우선순위로 노출 제어. 유료 공급사 홍보용.
create type public.banner_placement as enum ('hero', 'mid', 'sidebar');
create type public.popup_content_type as enum ('image', 'rich_text', 'image_with_text');
create type public.popup_target as enum ('all', 'guest', 'buyer', 'supplier', 'agent');
create type public.popup_dismiss as enum ('close_only', 'today_off', 'week_off');

create table public.ad_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,               -- 관리자 식별용
  image text,                        -- Storage 경로
  headline text,
  subtext text,
  link_url text,
  placement public.banner_placement not null default 'mid',
  supplier_id uuid references public.suppliers (id) on delete set null,
  sort_order int not null default 0,
  start_at timestamptz,
  end_at timestamptz,
  is_active boolean not null default true,
  click_count int not null default 0,
  impression_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index ad_banners_active_idx on public.ad_banners (is_active, placement, sort_order);
create trigger trg_ad_banners_updated_at
  before update on public.ad_banners for each row execute function public.set_updated_at();

create table public.popups (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content_type public.popup_content_type not null default 'image_with_text',
  image text,
  body text,
  link_url text,
  target public.popup_target not null default 'all',
  pages text,
  start_at timestamptz,
  end_at timestamptz,
  priority int not null default 0,
  dismiss_option public.popup_dismiss not null default 'close_only',
  is_active boolean not null default true,
  view_count int not null default 0,
  click_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index popups_active_idx on public.popups (is_active, priority);
create trigger trg_popups_updated_at
  before update on public.popups for each row execute function public.set_updated_at();

-- RLS: 공개 읽기(활성 + 게재기간 내), 작성/수정/삭제는 관리자.
alter table public.ad_banners enable row level security;
alter table public.popups enable row level security;

create policy ad_banners_select_public on public.ad_banners
  for select using (
    public.is_admin()
    or (is_active
        and (start_at is null or start_at <= now())
        and (end_at is null or end_at >= now()))
  );
create policy ad_banners_admin_write on public.ad_banners
  for all using (public.is_admin()) with check (public.is_admin());

create policy popups_select_public on public.popups
  for select using (
    public.is_admin()
    or (is_active
        and (start_at is null or start_at <= now())
        and (end_at is null or end_at >= now()))
  );
create policy popups_admin_write on public.popups
  for all using (public.is_admin()) with check (public.is_admin());
