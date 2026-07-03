-- 공급사 회신 정책 수정: 정책 내 EXISTS(inquiries) 서브쿼리가 inquiries RLS 에 막혀
-- 공급사가 회신을 못 넣던 문제. 판별을 SECURITY DEFINER 함수로 빼 RLS 를 우회한다.

create or replace function public.supplier_can_reply(target_inquiry uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.inquiries i
    join public.products p on p.id = i.product_id
    join public.suppliers s on s.id = p.supplier_id
    where i.id = target_inquiry
      and s.profile_id = auth.uid()
      and i.status in ('forwarded', 'replied')
  );
$$;

drop policy if exists inquiry_messages_supplier_insert on public.inquiry_messages;

create policy inquiry_messages_supplier_insert on public.inquiry_messages
  for insert with check (
    author_role = 'supplier'
    and visible_to = 'all'
    and public.supplier_can_reply(inquiry_id)
  );
