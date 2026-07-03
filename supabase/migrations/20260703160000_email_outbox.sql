-- 이메일 발송 기록·로그 테이블(5.4). 모든 발송을 큐잉·상태추적해 재발송·감사에 대응.

create type public.email_template as enum (
  'signup_verify', 'password_reset', 'supplier_approved', 'supplier_rejected',
  'inquiry_received', 'inquiry_replied', 'rfq_response', 'agent_invite',
  'event_reminder', 'generic'
);
create type public.email_status as enum ('queued', 'sent', 'failed');

create table public.email_outbox (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  profile_id uuid references public.profiles (id) on delete set null,  -- 비회원 대상 가능하므로 nullable
  template public.email_template not null,
  locale text not null default 'en',                 -- 수신자 언어(en/ko)
  payload jsonb not null default '{}'::jsonb,         -- 템플릿 치환 값
  status public.email_status not null default 'queued',
  provider_message_id text,                           -- Resend 등 발송 서비스 반환 ID
  error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index email_outbox_status_idx on public.email_outbox (status);
create index email_outbox_profile_idx on public.email_outbox (profile_id);

create trigger trg_email_outbox_updated_at
  before update on public.email_outbox
  for each row execute function public.set_updated_at();

-- RLS: 발송 로그는 관리자만 열람. 실제 삽입·갱신은 서버(service_role, RLS 우회)가 담당.
alter table public.email_outbox enable row level security;

create policy email_outbox_select_admin on public.email_outbox
  for select using (public.is_admin());
