-- 바이어 참여형 제품요청글(RFQ, 5.7). 역방향 소싱: 바이어 작성 → 관리자 승인/중개 → 공급사 응답.
-- 핵심: 작성자(바이어) 식별정보는 관리자 외 절대 비노출. 공개 열람은 마스킹 뷰로만.

create type public.request_status as enum (
  'submitted', 'admin_review', 'listed', 'closed', 'rejected'
);
create type public.request_response_status as enum (
  'submitted', 'forwarded_to_buyer', 'accepted', 'declined'
);

create table public.product_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,  -- 바이어/에이전트
  title text not null,
  body text not null default '',
  category_id uuid references public.categories (id) on delete set null,  -- products 와 동일 분류
  target_country text,
  budget numeric,
  qty numeric,
  status public.request_status not null default 'submitted',  -- 관리자 승인 후 listed
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index product_requests_status_idx on public.product_requests (status, is_pinned, created_at);
create index product_requests_requester_idx on public.product_requests (requester_id);
create trigger trg_product_requests_updated_at
  before update on public.product_requests for each row execute function public.set_updated_at();

create table public.product_request_responses (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.product_requests (id) on delete cascade,
  supplier_id uuid not null references public.suppliers (id) on delete cascade,
  message text not null default '',           -- 관리자에게 전달되는 제안 내용(직접 연락 아님)
  status public.request_response_status not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (request_id, supplier_id)            -- 1공급사 1응답
);
create index product_request_responses_request_idx on public.product_request_responses (request_id);
create trigger trg_prr_updated_at
  before update on public.product_request_responses for each row execute function public.set_updated_at();

-- ── RLS ────────────────────────────────────────────────────────────────────
alter table public.product_requests enable row level security;
alter table public.product_request_responses enable row level security;

-- product_requests: 작성자 본인 + 관리자만 직접 조회(requester_id 보호). 그 외엔 아래 마스킹 뷰로만.
create policy product_requests_select_own on public.product_requests
  for select using (requester_id = auth.uid() or public.is_admin());
create policy product_requests_insert_own on public.product_requests
  for insert with check (requester_id = auth.uid());
create policy product_requests_admin_update on public.product_requests
  for update using (public.is_admin()) with check (public.is_admin());
create policy product_requests_admin_delete on public.product_requests
  for delete using (public.is_admin());

-- responses: 공급사 본인 것 + 관리자. 바이어에겐 비노출(연결은 관리자 중개).
create policy prr_select_own on public.product_request_responses
  for select using (public.owns_supplier(supplier_id) or public.is_admin());
create policy prr_insert_own on public.product_request_responses
  for insert with check (public.owns_supplier(supplier_id));
create policy prr_admin_update on public.product_request_responses
  for update using (public.is_admin()) with check (public.is_admin());

-- ── 공개 마스킹 뷰: requester_id 등 식별정보 제외, listed 만. 배지 신호(buyer_verified)만 노출. ──
create view public.public_product_requests as
  select
    r.id,
    r.title,
    r.body,
    r.category_id,
    r.target_country,
    r.budget,
    r.qty,
    r.is_pinned,
    r.created_at,
    (pr.status = 'approved') as buyer_verified
  from public.product_requests r
  join public.profiles pr on pr.id = r.requester_id
  where r.status = 'listed';

grant select on public.public_product_requests to anon, authenticated;
