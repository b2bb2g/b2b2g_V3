-- 행사 리마인더 발송 추적(로드맵 13). 임박 행사에 1회만 리마인더를 보내기 위해 발송 시각 기록.
alter table public.events
  add column if not exists reminder_sent_at timestamptz;
