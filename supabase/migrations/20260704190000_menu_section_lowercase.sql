-- 섹션 라우트를 다른 메뉴와 동일하게 소문자로 통일(/commercial, /industrial).
update public.menu_items set route = '/commercial' where label_en = 'Commercial';
update public.menu_items set route = '/industrial' where label_en = 'Industrial';
