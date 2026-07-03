-- 카테고리 slug(안정 식별자). 섹션 페이지(/commercial·/industrial)가 이름 대신 slug 로 조회 →
-- 관리자가 표시명을 바꿔도 라우트가 깨지지 않는다.
alter table public.categories add column if not exists slug text;

update public.categories set slug = 'commercial' where name = 'Commercial' and parent_id is null;
update public.categories set slug = 'industrial' where name = 'Industrial' and parent_id is null;

create unique index if not exists categories_slug_key on public.categories (slug) where slug is not null;
