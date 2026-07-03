-- 관리자 감사로그(5.1). 관리자의 회원/데이터 변경 이력(누가·언제·무엇을, before/after).
create type public.audit_action as enum (
  'create', 'update', 'approve', 'reject', 'suspend', 'delete', 'role_change'
);

create table public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.profiles (id) on delete set null,
  target_table text not null,
  target_id text,
  action public.audit_action not null,
  before jsonb,
  after jsonb,
  created_at timestamptz not null default now()
);

create index admin_audit_logs_created_idx on public.admin_audit_logs (created_at desc);
create index admin_audit_logs_target_idx on public.admin_audit_logs (target_table, target_id);

alter table public.admin_audit_logs enable row level security;

-- 관리자만 열람. 기록은 서버(service_role)가 삽입.
create policy admin_audit_logs_select_admin on public.admin_audit_logs
  for select using (public.is_admin());
