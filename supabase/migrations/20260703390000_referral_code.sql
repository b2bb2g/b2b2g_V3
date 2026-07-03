-- 회원별 추천 코드(5.8). /auth/signup?ref=<code> 로 연결되는 추천가입 링크·QR 의 기준값.
alter table public.profiles add column if not exists referral_code text;

-- 짧은 코드 생성 함수(기본값용).
create or replace function public.gen_referral_code()
returns text language sql volatile as $$
  select substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);
$$;

-- 기존 회원 백필 + 신규 기본값 + 고유 제약.
update public.profiles set referral_code = public.gen_referral_code() where referral_code is null;
alter table public.profiles alter column referral_code set default public.gen_referral_code();
alter table public.profiles alter column referral_code set not null;
create unique index if not exists profiles_referral_code_key on public.profiles (referral_code);
