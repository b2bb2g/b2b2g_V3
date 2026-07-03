-- 6.4 공개 접근 경계: 비회원(anon)은 제품 가격·거래조건을 DB 열단위로 조회 불가.
-- 회원(authenticated)은 유지(행 RLS=listed 로 제한). 최종 방어선은 DB(문서 0.2/3.1).

-- 비회원에게서 민감 컬럼 SELECT 권한 회수(가격·거래조건 일체).
revoke select (
  price, moq, moq_unit, lead_time_min, lead_time_max,
  freight_type, transport_modes, ship_from, payment_terms, hs_code
) on public.products from anon;

-- 공급사 공개정보 뷰: 사업자등록증 등 민감 컬럼을 아예 포함하지 않는다.
-- (suppliers 테이블 자체는 owner/admin 만 조회 가능하므로 공개 표시는 이 뷰로만.)
create view public.public_suppliers as
  select id, company_name, verified, tier
  from public.suppliers;

grant select on public.public_suppliers to anon, authenticated;
