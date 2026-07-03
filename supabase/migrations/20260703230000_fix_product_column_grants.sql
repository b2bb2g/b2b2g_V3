-- 6.4 열단위 마스킹 정정: 컬럼 REVOKE 는 테이블 GRANT 를 이기지 못한다.
-- anon 의 테이블 전체 SELECT 를 회수하고 안전한 컬럼만 명시 GRANT 한다.
-- (가격·거래조건 컬럼은 GRANT 하지 않음 → 비회원 조회 시 DB 가 거부.)

revoke select on public.products from anon;

grant select (
  id, title, description, detail_body, category_id, supplier_id,
  price_visible, is_featured, status, keywords, created_at, updated_at
) on public.products to anon;
