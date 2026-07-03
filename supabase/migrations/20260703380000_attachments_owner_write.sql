-- 첨부 작성 권한 확장: 관리자뿐 아니라 '해당 글의 작성자 본인'도 자기 글에 첨부 가능.
-- 제품→공급사 소유, RFQ→요청자 본인. 공지·FAQ·행사·서비스는 관리자만(작성자=관리자).

create or replace function public.board_owner_editable(ot public.board_owner_type, oid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select case ot
    when 'product' then exists (
      select 1 from public.products p
      join public.suppliers s on s.id = p.supplier_id
      where p.id = oid and s.profile_id = auth.uid()
    )
    when 'product_request' then exists (
      select 1 from public.product_requests r
      where r.id = oid and r.requester_id = auth.uid()
    )
    else false
  end;
$$;

drop policy if exists board_attachments_admin_write on public.board_attachments;
create policy board_attachments_write on public.board_attachments
  for all
  using (public.is_admin() or public.board_owner_editable(owner_type, owner_id))
  with check (public.is_admin() or public.board_owner_editable(owner_type, owner_id));
