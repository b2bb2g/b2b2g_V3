-- 공유 단축 URL + QR(5.8). /s/<slug> 로 접근 → 대상으로 리다이렉트, 유입(click_count) 추적.
create type public.short_link_target as enum (
  'product', 'signup_referral', 'supplier_page', 'event', 'project', 'request', 'service'
);

create table public.short_links (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  target_type public.short_link_target not null,
  target_id uuid,
  ref_code text,
  created_by uuid references public.profiles (id) on delete set null,
  click_count int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index short_links_slug_idx on public.short_links (slug);

-- RLS: 활성 링크는 공개 조회(리다이렉트 해석), 생성은 본인, 수정/삭제는 본인·관리자.
alter table public.short_links enable row level security;

create policy short_links_select on public.short_links
  for select using (is_active or created_by = auth.uid() or public.is_admin());
create policy short_links_insert_own on public.short_links
  for insert with check (created_by = auth.uid());
create policy short_links_update_own on public.short_links
  for update using (created_by = auth.uid() or public.is_admin())
  with check (created_by = auth.uid() or public.is_admin());
create policy short_links_delete_own on public.short_links
  for delete using (created_by = auth.uid() or public.is_admin());

-- 슬러그 해석 + 클릭 증가(definer). anon 도 호출 가능하되 arbitrary UPDATE 권한은 주지 않음.
create or replace function public.resolve_short_link(p_slug text)
returns table(target_type public.short_link_target, target_id uuid, ref_code text)
language plpgsql security definer set search_path = public as $$
begin
  update public.short_links set click_count = click_count + 1
    where slug = p_slug and is_active = true;
  return query
    select sl.target_type, sl.target_id, sl.ref_code
    from public.short_links sl
    where sl.slug = p_slug and sl.is_active = true;
end;
$$;
grant execute on function public.resolve_short_link(text) to anon, authenticated;
