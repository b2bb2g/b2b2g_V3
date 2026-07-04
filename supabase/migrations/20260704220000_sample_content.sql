-- 공개 메뉴 초기 공백 방지용 데모 샘플 콘텐츠 12건씩 시드. idempotent(각 테이블 count<12 일 때만).
-- 실제 회원/공급사/카테고리(Commercial·Industrial)에 연결. 운영 데이터가 차오르면 자동으로 건너뜀.
do $$
declare
  v_supplier uuid := (select id from public.suppliers order by created_at limit 1);
  v_admin uuid := (select id from public.profiles where role = 'admin' order by created_at limit 1);
  v_buyer uuid := (select id from public.profiles where role in ('buyer', 'agent') order by created_at limit 1);
  v_commercial uuid := (select id from public.categories where slug = 'commercial' limit 1);
  v_industrial uuid := (select id from public.categories where slug = 'industrial' limit 1);
  i int;
begin
  -- Commercial 제품 12
  if v_supplier is not null and v_commercial is not null
     and (select count(*) from public.products where category_id = v_commercial) < 12 then
    for i in 1..12 loop
      insert into public.products
        (supplier_id, category_id, title, description, detail_body, status,
         price, price_visible, moq, moq_unit, lead_time_min, lead_time_max, ship_from, payment_terms, keywords)
      values
        (v_supplier, v_commercial,
         'Commercial Sample Product ' || i,
         'Demo commercial product #' || i || ' for catalog preview.',
         '<p>Sample detail body for commercial product #' || i || '.</p>',
         'listed', 100 + i * 10, true, 100, 'Pieces', 7, 21, 'Busan, Korea', 'T/T, L/C', 'sample, commercial');
    end loop;
  end if;

  -- Industrial 제품 12
  if v_supplier is not null and v_industrial is not null
     and (select count(*) from public.products where category_id = v_industrial) < 12 then
    for i in 1..12 loop
      insert into public.products
        (supplier_id, category_id, title, description, detail_body, status,
         price, price_visible, moq, moq_unit, lead_time_min, lead_time_max, ship_from, payment_terms, keywords)
      values
        (v_supplier, v_industrial,
         'Industrial Sample Product ' || i,
         'Demo industrial product #' || i || ' for catalog preview.',
         '<p>Sample detail body for industrial product #' || i || '.</p>',
         'listed', 500 + i * 25, false, 10, 'Set', 14, 45, 'Ulsan, Korea', 'T/T', 'sample, industrial');
    end loop;
  end if;

  -- EPC projects 12
  if v_admin is not null and (select count(*) from public.projects) < 12 then
    for i in 1..12 loop
      insert into public.projects
        (author_id, name, field, body, client, location, country, scale_amount, currency, stage, status)
      values
        (v_admin, 'Sample EPC Project ' || i, 'etc',
         '<p>Demo EPC project scope and background #' || i || '.</p>',
         'Client ' || i, 'Seoul', 'Korea', 1000000 * i, 'USD', 'planning', 'published');
    end loop;
  end if;

  -- Sourcing Requests 12
  if v_buyer is not null and (select count(*) from public.product_requests) < 12 then
    for i in 1..12 loop
      insert into public.product_requests
        (requester_id, category_id, title, body, target_country, budget, qty, status)
      values
        (v_buyer, v_commercial, 'Sample Sourcing Request ' || i,
         'Looking for a reliable supplier for item #' || i || '.',
         'USA', 5000 * i, 500, 'listed');
    end loop;
  end if;

  -- Events 12
  if v_admin is not null and (select count(*) from public.events) < 12 then
    for i in 1..12 loop
      insert into public.events
        (author_id, category, name, body, venue, location, country, participation_status, status)
      values
        (v_admin, 'trade_fair', 'Sample Event ' || i,
         '<p>Demo event description #' || i || '.</p>',
         'COEX Hall ' || i, 'Seoul', 'Korea', 'open', 'published');
    end loop;
  end if;

  -- Services 12
  if v_admin is not null and (select count(*) from public.services) < 12 then
    for i in 1..12 loop
      insert into public.services
        (author_id, title, summary, body, sort_order, status)
      values
        (v_admin, 'Sample Service ' || i, 'Service summary #' || i,
         '<p>Demo service description #' || i || '.</p>', i, 'published');
    end loop;
  end if;

  -- Notices 12
  if v_admin is not null and (select count(*) from public.notices) < 12 then
    for i in 1..12 loop
      insert into public.notices
        (author_id, title, body, status)
      values
        (v_admin, 'Sample Notice ' || i, '<p>Demo notice body #' || i || '.</p>', 'published');
    end loop;
  end if;

  -- FAQ 12
  if v_admin is not null and (select count(*) from public.faqs) < 12 then
    for i in 1..12 loop
      insert into public.faqs
        (author_id, category, question, answer, sort_order, status)
      values
        (v_admin, 'General', 'Sample question #' || i || '?',
         '<p>Demo answer #' || i || '.</p>', i, 'published');
    end loop;
  end if;
end $$;
