-- 공급사·카테고리·제품 코어(5.1/5.2). buyKOREA 제품상세 구조 참고 필드 포함.
-- [주의] 열단위 마스킹(price, biz_reg_file 등 비회원/타역할 비노출)은 소비 UI 슬라이스에서
--        뷰 또는 앱 쿼리 계층으로 처리한다(6.4/5.10). 여기서는 행단위 RLS까지 세운다.

-- ── enum ───────────────────────────────────────────────────────────────────
create type public.supplier_tier as enum ('free', 'paid');
create type public.product_status as enum ('draft', 'pending', 'listed', 'rejected');
create type public.product_media_type as enum ('image', 'video_link', 'catalog_pdf');
create type public.product_cert_type as enum ('certification', 'award');

-- ── 공급사 부가정보(5.1) ────────────────────────────────────────────────────
-- 승인 여부는 profiles.status('approved') 가 단일 기준(SSoT). 여기선 등급·인증배지만.
create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  company_name text not null,
  biz_reg_file text,                    -- 사업자등록증(Storage 경로, 관리자만 열람 대상)
  tier public.supplier_tier not null default 'free',
  verified boolean not null default false,   -- 인증 배지
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_suppliers_updated_at
  before update on public.suppliers
  for each row execute function public.set_updated_at();

-- ── 카테고리(5.2, 계층 지원, 초기엔 대분류만) ───────────────────────────────
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_id uuid references public.categories (id) on delete set null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- ── 제품(5.2) ───────────────────────────────────────────────────────────────
create table public.products (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers (id) on delete cascade,
  title text not null,
  description text,
  detail_body text,                     -- 상세 설명(rich text)
  category_id uuid references public.categories (id) on delete set null,
  price numeric,
  price_visible boolean not null default false,  -- 가격 공개 선택(기본 '가격 문의')
  moq int,                              -- 최소주문수량
  moq_unit text,                        -- 단위(Pieces/Box/Set 등)
  lead_time_min int,
  lead_time_max int,
  freight_type text,                    -- 이송 조건(FOB 등)
  transport_modes text,                 -- 이송 수단
  ship_from text,                       -- 출고지
  payment_terms text,                   -- 결제 조건
  hs_code text,                         -- 품목 분류
  keywords text,                        -- 검색 키워드/태그
  status public.product_status not null default 'draft',  -- 관리자 노출 승인
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_supplier_idx on public.products (supplier_id);
create index products_category_idx on public.products (category_id);
create index products_status_idx on public.products (status);

create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ── 제품 미디어(5.2) ────────────────────────────────────────────────────────
create table public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  type public.product_media_type not null default 'image',
  url text not null,
  is_primary boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index product_media_product_idx on public.product_media (product_id);

create trigger trg_product_media_updated_at
  before update on public.product_media
  for each row execute function public.set_updated_at();

-- ── 제품 인증·수상(5.2) ─────────────────────────────────────────────────────
create table public.product_certifications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  type public.product_cert_type not null,
  name text not null,
  file text,                            -- 인증서 파일(Storage 경로)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index product_certifications_product_idx on public.product_certifications (product_id);

create trigger trg_product_certifications_updated_at
  before update on public.product_certifications
  for each row execute function public.set_updated_at();

-- ── 특정 공급사 행이 현재 사용자 소유인지 판별(RLS 재사용) ───────────────────
create or replace function public.owns_supplier(target uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.suppliers s
    where s.id = target and s.profile_id = auth.uid()
  );
$$;

-- ── RLS: 3.1 권한 매트릭스 ──────────────────────────────────────────────────
alter table public.suppliers enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_media enable row level security;
alter table public.product_certifications enable row level security;

-- suppliers: 본인 또는 관리자. (공개 미니홈용 최소정보는 이후 뷰로 노출)
create policy suppliers_select_own on public.suppliers
  for select using (profile_id = auth.uid() or public.is_admin());
create policy suppliers_insert_self on public.suppliers
  for insert with check (profile_id = auth.uid() or public.is_admin());
create policy suppliers_update_own on public.suppliers
  for update using (profile_id = auth.uid() or public.is_admin())
  with check (profile_id = auth.uid() or public.is_admin());
create policy suppliers_admin_all on public.suppliers
  for delete using (public.is_admin());

-- categories: 활성 카테고리는 누구나 열람, 편집은 관리자.
create policy categories_select_active on public.categories
  for select using (is_active or public.is_admin());
create policy categories_write_admin on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- products: listed 는 공개, 본인 것 전체, 관리자 전체.
create policy products_select_listed on public.products
  for select using (status = 'listed' or public.owns_supplier(supplier_id) or public.is_admin());
create policy products_insert_own on public.products
  for insert with check (public.owns_supplier(supplier_id) or public.is_admin());
create policy products_update_own on public.products
  for update using (public.owns_supplier(supplier_id) or public.is_admin())
  with check (public.owns_supplier(supplier_id) or public.is_admin());
create policy products_delete_own on public.products
  for delete using (public.owns_supplier(supplier_id) or public.is_admin());

-- 제품 종속 테이블: 부모 제품이 보이면(공개/소유/관리자) 함께 노출, 쓰기는 소유/관리자.
create policy product_media_select on public.product_media
  for select using (
    exists (
      select 1 from public.products p
      where p.id = product_id
        and (p.status = 'listed' or public.owns_supplier(p.supplier_id) or public.is_admin())
    )
  );
create policy product_media_write on public.product_media
  for all using (
    exists (
      select 1 from public.products p
      where p.id = product_id and (public.owns_supplier(p.supplier_id) or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.products p
      where p.id = product_id and (public.owns_supplier(p.supplier_id) or public.is_admin())
    )
  );

create policy product_certifications_select on public.product_certifications
  for select using (
    exists (
      select 1 from public.products p
      where p.id = product_id
        and (p.status = 'listed' or public.owns_supplier(p.supplier_id) or public.is_admin())
    )
  );
create policy product_certifications_write on public.product_certifications
  for all using (
    exists (
      select 1 from public.products p
      where p.id = product_id and (public.owns_supplier(p.supplier_id) or public.is_admin())
    )
  )
  with check (
    exists (
      select 1 from public.products p
      where p.id = product_id and (public.owns_supplier(p.supplier_id) or public.is_admin())
    )
  );

-- ── 초기 대분류 시드(9장: Commercial / Industrial) ──────────────────────────
insert into public.categories (name, parent_id, sort_order, is_active) values
  ('Commercial', null, 1, true),
  ('Industrial', null, 2, true);
