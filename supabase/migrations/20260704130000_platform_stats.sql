-- 랜딩 익명 활동 신호(6.3 / 로드맵 17). 개인정보 없이 집계 수치만 반환하는 definer 함수.
-- 각 테이블 RLS 를 우회하되, 반환값은 count 뿐이라 신원·거래정보가 전혀 노출되지 않는다.
create or replace function public.platform_stats()
returns table(
  verified_suppliers bigint,
  listed_products bigint,
  open_requests bigint,
  recent_inquiries bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*) from public.suppliers where verified),
    (select count(*) from public.products where status = 'listed'),
    (select count(*) from public.product_requests where status = 'listed'),
    (select count(*) from public.inquiries where created_at > now() - interval '30 days');
$$;

grant execute on function public.platform_stats() to anon, authenticated;
