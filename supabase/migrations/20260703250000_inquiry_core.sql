-- 문의·견적 중개 데이터 모델(5.3, 플로우 C). 핵심: 공급사는 바이어 식별정보 절대 열람 불가.
-- 중개 구조 — 바이어/에이전트 작성 → 관리자 중개 → 공급사 익명 전달 → 회신.

create type public.inquiry_type as enum ('inquiry', 'quote');
create type public.inquiry_status as enum (
  'submitted', 'admin_review', 'forwarded', 'replied', 'closed'
);
create type public.message_author_role as enum ('buyer', 'admin', 'supplier');
create type public.message_visibility as enum ('all', 'admin_only');

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  requester_id uuid not null references public.profiles (id) on delete cascade,  -- 바이어/에이전트
  type public.inquiry_type not null default 'inquiry',
  content text not null,
  status public.inquiry_status not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index inquiries_product_idx on public.inquiries (product_id);
create index inquiries_requester_idx on public.inquiries (requester_id);
create index inquiries_status_idx on public.inquiries (status);

create trigger trg_inquiries_updated_at
  before update on public.inquiries
  for each row execute function public.set_updated_at();

create table public.inquiry_messages (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries (id) on delete cascade,
  author_id uuid references public.profiles (id) on delete set null,  -- 작성자(공급사에겐 마스킹)
  author_role public.message_author_role not null,
  body text not null,
  visible_to public.message_visibility not null default 'all',  -- admin_only=내부메모
  created_at timestamptz not null default now()
);

create index inquiry_messages_inquiry_idx on public.inquiry_messages (inquiry_id);

-- ── RLS: 3.1 권한 매트릭스 + 5.3 마스킹 지침 ────────────────────────────────
alter table public.inquiries enable row level security;
alter table public.inquiry_messages enable row level security;

-- inquiries: 요청자 본인 + 관리자. 공급사는 직접 접근 불가(아래 마스킹 뷰로만).
create policy inquiries_select_own on public.inquiries
  for select using (requester_id = auth.uid() or public.is_admin());
create policy inquiries_insert_own on public.inquiries
  for insert with check (requester_id = auth.uid());
create policy inquiries_admin_update on public.inquiries
  for update using (public.is_admin()) with check (public.is_admin());

-- inquiry_messages: 요청자는 자기 문의의 공개(all) 메시지만, 관리자는 전체.
create policy inquiry_messages_select_own on public.inquiry_messages
  for select using (
    public.is_admin()
    or (
      visible_to = 'all'
      and exists (
        select 1 from public.inquiries i
        where i.id = inquiry_id and i.requester_id = auth.uid()
      )
    )
  );
create policy inquiry_messages_admin_write on public.inquiry_messages
  for all using (public.is_admin()) with check (public.is_admin());

-- ── 공급사용 마스킹 뷰: requester_id·바이어 식별정보 제외, 전달된 문의만 ────────
-- definer 뷰 + auth.uid() 필터 → 공급사 본인 제품의 forwarded 이후 문의만, 익명으로.
create view public.supplier_inquiries as
  select
    i.id,
    i.product_id,
    p.title as product_title,
    i.type,
    i.content,
    i.status,
    i.created_at,
    i.updated_at
  from public.inquiries i
  join public.products p on p.id = i.product_id
  join public.suppliers s on s.id = p.supplier_id
  where s.profile_id = auth.uid()
    and i.status in ('forwarded', 'replied', 'closed');

grant select on public.supplier_inquiries to authenticated;
