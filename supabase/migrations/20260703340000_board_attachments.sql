-- 게시판/제품 본문 공통 첨부·미디어(5.7-B). 하나의 테이블을 owner_type 으로 다형 관리.
-- 인라인(본문 삽입)과 하단 첨부목록을 inline 플래그로 구분. 외부 영상은 화이트리스트 도메인만.

create type public.board_owner_type as enum (
  'notice', 'faq', 'event', 'project', 'product_request', 'product'
);
create type public.attachment_kind as enum ('image', 'video_file', 'video_link', 'file');

create table public.board_attachments (
  id uuid primary key default gen_random_uuid(),
  owner_type public.board_owner_type not null,
  owner_id uuid not null,
  kind public.attachment_kind not null,
  storage_path text,                -- 업로드 파일(image/video_file/file)
  external_url text,                -- 동영상 링크(YouTube/Vimeo 등)
  file_name text,
  mime_type text,
  size_bytes bigint,
  thumbnail_path text,
  inline boolean not null default false,   -- true=본문 삽입, false=하단 첨부목록
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index board_attachments_owner_idx on public.board_attachments (owner_type, owner_id, sort_order);

-- 소유 게시물이 공개 상태인지 판별(다형). definer 로 각 테이블 RLS 우회해 상태만 확인.
create or replace function public.board_owner_visible(ot public.board_owner_type, oid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select case ot
    when 'notice' then exists (select 1 from public.notices where id = oid and status = 'published')
    when 'faq' then exists (select 1 from public.faqs where id = oid and status = 'published')
    when 'event' then exists (select 1 from public.events where id = oid and status = 'published')
    when 'project' then exists (select 1 from public.projects where id = oid and status = 'published')
    when 'product_request' then exists (select 1 from public.product_requests where id = oid and status = 'listed')
    when 'product' then exists (select 1 from public.products where id = oid and status = 'listed')
    else false
  end;
$$;

-- RLS: 공개 게시물의 첨부는 누구나 열람, 그 외 관리자만. 작성/수정/삭제는 관리자(현재 관리자 보드 대상).
alter table public.board_attachments enable row level security;

create policy board_attachments_select on public.board_attachments
  for select using (public.is_admin() or public.board_owner_visible(owner_type, owner_id));
create policy board_attachments_admin_write on public.board_attachments
  for all using (public.is_admin()) with check (public.is_admin());

-- 공통 미디어 Storage 버킷(공개 읽기, 소유자 uid 폴더 업로드).
insert into storage.buckets (id, name, public)
values ('board-media', 'board-media', true)
on conflict (id) do nothing;

create policy "board_media_public_read" on storage.objects
  for select using (bucket_id = 'board-media');
create policy "board_media_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'board-media'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "board_media_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'board-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
