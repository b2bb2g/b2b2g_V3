-- Commercial/Industrial 메뉴를 개별 상위 라우트(/Commercial, /Industrial)로 연결(EPC 처럼).
update public.menu_items set route = '/Commercial' where label_en = 'Commercial';
update public.menu_items set route = '/Industrial' where label_en = 'Industrial';
