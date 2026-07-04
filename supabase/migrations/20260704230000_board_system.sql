-- 게시판 시스템: 카테고리(bilingual)·게시판 설정(작성자/조회수 노출)·공지 카테고리·조회수.
-- 카테고리·설정은 관리자 페이지에서 관리(하드코딩 금지). 초기 시드는 데이터일 뿐 UI 문구 아님.

-- 게시판별 카테고리(공지 등). name_en/name_ko 로 로케일 대응.
create table public.board_categories (
  id uuid primary key default gen_random_uuid(),
  board text not null,
  name_en text not null,
  name_ko text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index board_categories_board_idx on public.board_categories (board, sort_order);

alter table public.board_categories enable row level security;
create policy board_categories_select on public.board_categories
  for select using (is_active or public.is_admin());
create policy board_categories_write on public.board_categories
  for all using (public.is_admin()) with check (public.is_admin());

-- 게시판별 설정(작성자 노출/조회수 노출 등).
create table public.board_settings (
  board text primary key,
  show_author boolean not null default false,
  show_view_count boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.board_settings enable row level security;
create policy board_settings_select on public.board_settings for select using (true);
create policy board_settings_write on public.board_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- 공지: 카테고리 연결 + 조회수.
alter table public.notices
  add column if not exists category_id uuid references public.board_categories (id) on delete set null;
alter table public.notices add column if not exists view_count int not null default 0;

-- 조회수 증가(anon 도 호출 가능, definer). published 만 증가.
create or replace function public.increment_notice_view(p_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.notices set view_count = view_count + 1 where id = p_id and status = 'published';
$$;
grant execute on function public.increment_notice_view(uuid) to anon, authenticated;

-- 초기 설정 + 공지 기본 카테고리 시드(중복 방지 가드).
insert into public.board_settings (board) values ('notices') on conflict (board) do nothing;

do $$
begin
  if not exists (select 1 from public.board_categories where board = 'notices') then
    insert into public.board_categories (board, name_en, name_ko, sort_order) values
      ('notices', 'Service', '서비스', 1),
      ('notices', 'Event', '이벤트', 2),
      ('notices', 'Update', '업데이트', 3),
      ('notices', 'Etc', '기타', 4);
  end if;
end $$;
