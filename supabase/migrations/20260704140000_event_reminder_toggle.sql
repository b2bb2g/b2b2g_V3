-- 행사 리마인더 자동 발송 여부를 관리자가 행사별로 선택. 기본 꺼짐(명시적 opt-in).
alter table public.events
  add column if not exists reminder_enabled boolean not null default false;
