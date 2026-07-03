-- 제품 이미지 Storage 버킷 + 접근 정책(5.7-B). 공개 읽기, 소유자만 업로드.
-- 경로 규칙: {auth.uid()}/{product_id}/{filename} — 첫 폴더가 업로더 uid.

insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', true)
on conflict (id) do nothing;

-- 공개 읽기(제품 이미지는 공개 마켓용).
create policy "product_media_public_read" on storage.objects
  for select using (bucket_id = 'product-media');

-- 업로드: 인증 사용자, 경로 첫 폴더가 본인 uid.
create policy "product_media_owner_insert" on storage.objects
  for insert with check (
    bucket_id = 'product-media'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 삭제: 본인 업로드만.
create policy "product_media_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'product-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
