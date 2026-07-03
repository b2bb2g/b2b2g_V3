-- 법적 문서(약관·개인정보·쿠키정책)와 쿠키 동의 기록(5.10). 법적 문서는 관리자 편집·공개 열람.
-- [주의] 아래 문서 본문은 개발·구조용 자리 채움(placeholder). 실서비스 전 변호사 검토 필수.

create type public.legal_doc_type as enum ('terms', 'privacy', 'cookie_policy');

create table public.legal_documents (
  id uuid primary key default gen_random_uuid(),
  type public.legal_doc_type not null,
  locale text not null,                 -- en/ko
  body text not null,                   -- rich text(초기 placeholder)
  version int not null default 1,
  effective_date date not null default current_date,
  is_current boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 타입+로케일당 현재 버전은 하나만.
create unique index legal_documents_current_uidx
  on public.legal_documents (type, locale)
  where is_current;

create trigger trg_legal_documents_updated_at
  before update on public.legal_documents
  for each row execute function public.set_updated_at();

alter table public.legal_documents enable row level security;

-- 현재 버전은 비회원 포함 누구나 열람. 편집은 관리자만.
create policy legal_documents_select_current on public.legal_documents
  for select using (is_current or public.is_admin());
create policy legal_documents_write_admin on public.legal_documents
  for all using (public.is_admin()) with check (public.is_admin());

-- ── 쿠키 동의 기록(감사 가능하도록 저장) ────────────────────────────────────
create table public.cookie_consents (
  id uuid primary key default gen_random_uuid(),
  visitor_id text,                      -- 익명 방문자 식별자(쿠키)
  profile_id uuid references public.profiles (id) on delete set null,
  necessary boolean not null default true,   -- 필수 쿠키(항상 true, 고지용)
  functional boolean not null default false,
  analytics boolean not null default false,
  marketing boolean not null default false,
  policy_version text,
  consented_at timestamptz not null default now()
);

create index cookie_consents_visitor_idx on public.cookie_consents (visitor_id);
create index cookie_consents_profile_idx on public.cookie_consents (profile_id);

alter table public.cookie_consents enable row level security;

-- 동의 기록은 비회원도 남길 수 있어야 하므로 삽입 허용, 열람은 관리자만(개인 감사정보 보호).
create policy cookie_consents_insert_any on public.cookie_consents
  for insert with check (true);
create policy cookie_consents_select_admin on public.cookie_consents
  for select using (public.is_admin());

-- ── 초기 placeholder 법적 문서(en/ko) ──────────────────────────────────────
insert into public.legal_documents (type, locale, body, version) values
  ('terms', 'en', 'These Terms of Service are a placeholder pending legal review. By using this platform you agree to use it lawfully. Full terms will be provided before launch.', 1),
  ('terms', 'ko', '본 이용약관은 법률 검토 전 자리 채움입니다. 본 플랫폼을 적법하게 이용하는 데 동의합니다. 정식 약관은 출시 전 제공됩니다.', 1),
  ('privacy', 'en', 'This Privacy Policy is a placeholder pending legal review. We process personal data to operate the service. A GDPR/ePrivacy-reviewed policy will be provided before launch.', 1),
  ('privacy', 'ko', '본 개인정보처리방침은 법률 검토 전 자리 채움입니다. 서비스 운영을 위해 개인정보를 처리합니다. GDPR/ePrivacy 검토를 거친 방침은 출시 전 제공됩니다.', 1),
  ('cookie_policy', 'en', 'This Cookie Policy is a placeholder pending legal review. We use strictly necessary cookies by default; optional cookies require your opt-in consent.', 1),
  ('cookie_policy', 'ko', '본 쿠키 정책은 법률 검토 전 자리 채움입니다. 필수 쿠키만 기본 사용하며, 선택 쿠키는 사전 동의(opt-in) 후에만 사용합니다.', 1);
