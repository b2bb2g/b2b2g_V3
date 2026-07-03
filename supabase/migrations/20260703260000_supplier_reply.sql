-- 공급사 회신: 전달된 문의에 공급사가 공유(all) 메시지 추가. 바이어 식별정보는 계속 비노출.
-- 메시지 열람은 author_id 를 뺀 마스킹 뷰로만. 회신 시 문의 status→replied(트리거).

-- 공급사가 본인 제품의 전달된 문의에 회신 메시지 삽입 허용(공유 메시지만).
create policy inquiry_messages_supplier_insert on public.inquiry_messages
  for insert with check (
    author_role = 'supplier'
    and visible_to = 'all'
    and exists (
      select 1
      from public.inquiries i
      join public.products p on p.id = i.product_id
      join public.suppliers s on s.id = p.supplier_id
      where i.id = inquiry_id
        and s.profile_id = auth.uid()
        and i.status in ('forwarded', 'replied')
    )
  );

-- 공급사용 메시지 마스킹 뷰: author_id 제외, 공유(all) 메시지만, 본인 제품의 전달 문의만.
create view public.supplier_inquiry_messages as
  select m.id, m.inquiry_id, m.author_role, m.body, m.created_at
  from public.inquiry_messages m
  join public.inquiries i on i.id = m.inquiry_id
  join public.products p on p.id = i.product_id
  join public.suppliers s on s.id = p.supplier_id
  where s.profile_id = auth.uid()
    and m.visible_to = 'all'
    and i.status in ('forwarded', 'replied', 'closed');

grant select on public.supplier_inquiry_messages to authenticated;

-- 공급사 메시지 삽입 시 문의 status 를 replied 로(공급사는 inquiries update 권한이 없으므로 트리거로).
create or replace function public.mark_inquiry_replied()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.author_role = 'supplier' then
    update public.inquiries
    set status = 'replied'
    where id = new.inquiry_id and status = 'forwarded';
  end if;
  return new;
end;
$$;

create trigger trg_mark_inquiry_replied
  after insert on public.inquiry_messages
  for each row execute function public.mark_inquiry_replied();
