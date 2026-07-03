-- Commercial/Industrial 을 각각 독립 섹션 페이지(/products/group/<id>)로 연결(EPC/Events 처럼 개별).
-- 카테고리 id 를 이름으로 조회해 route 구성.
update public.menu_items
set route = '/products/group/' ||
  coalesce((select id::text from public.categories where name = 'Commercial' and parent_id is null limit 1), '')
where label_en = 'Commercial';

update public.menu_items
set route = '/products/group/' ||
  coalesce((select id::text from public.categories where name = 'Industrial' and parent_id is null limit 1), '')
where label_en = 'Industrial';
