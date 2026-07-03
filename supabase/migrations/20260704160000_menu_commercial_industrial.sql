-- 상단 메뉴 재구성(9장): Products → Commercial + Industrial 로 분리, FAQ 는 상단 메뉴에서 숨김.
-- 카테고리 id 를 이름으로 조회해 route 를 구성(환경 간 id 상이해도 안전).

-- 기존 'Products' 항목을 Commercial 로 전환.
update public.menu_items
set
  label_en = 'Commercial',
  label_ko = 'Commercial',
  sort_order = 10,
  route = '/products?category=' ||
    coalesce((select id::text from public.categories where name = 'Commercial' and parent_id is null limit 1), '')
where route = '/products';

-- Industrial 항목 추가(중복 방지).
insert into public.menu_items (label_en, label_ko, "group", route, sort_order, is_active, is_system)
select
  'Industrial',
  'Industrial',
  'product',
  '/products?category=' || c.id::text,
  15,
  true,
  true
from public.categories c
where c.name = 'Industrial' and c.parent_id is null
  and not exists (select 1 from public.menu_items m where m.label_en = 'Industrial');

-- FAQ 는 상단 메뉴에서 숨김(시스템 항목이라 삭제 대신 비활성).
update public.menu_items set is_active = false where route = '/faq';
