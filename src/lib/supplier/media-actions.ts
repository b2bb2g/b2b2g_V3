'use server';
// 제품 이미지 메타 등록/삭제/대표지정 서버 액션. 업로드 자체는 클라이언트가 Storage 로.
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { PRODUCT_MEDIA_BUCKET } from '@/lib/products/media';

// 업로드된 Storage 경로를 product_media 로 기록. 첫 이미지는 대표로.
export async function addProductImage(productId: string, storagePath: string): Promise<void> {
  const supabase = await createClient();

  const { count } = await supabase
    .from('product_media')
    .select('id', { count: 'exact', head: true })
    .eq('product_id', productId);

  const { error } = await supabase.from('product_media').insert({
    product_id: productId,
    type: 'image',
    url: storagePath,
    is_primary: (count ?? 0) === 0,
    sort_order: count ?? 0,
  });
  if (!error) revalidatePath(`/dashboard/products/${productId}/edit`);
}

export async function deleteProductImage(mediaId: string, productId: string): Promise<void> {
  const supabase = await createClient();
  const { data: media } = await supabase
    .from('product_media')
    .select('url, is_primary')
    .eq('id', mediaId)
    .maybeSingle();
  if (!media) return;

  await supabase.storage.from(PRODUCT_MEDIA_BUCKET).remove([media.url]);
  await supabase.from('product_media').delete().eq('id', mediaId);

  // 대표 이미지를 지웠으면 남은 것 중 하나를 대표로 승격.
  if (media.is_primary) {
    const { data: next } = await supabase
      .from('product_media')
      .select('id')
      .eq('product_id', productId)
      .order('sort_order')
      .limit(1)
      .maybeSingle();
    if (next) await supabase.from('product_media').update({ is_primary: true }).eq('id', next.id);
  }
  revalidatePath(`/dashboard/products/${productId}/edit`);
}

export async function setPrimaryImage(mediaId: string, productId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from('product_media').update({ is_primary: false }).eq('product_id', productId);
  await supabase.from('product_media').update({ is_primary: true }).eq('id', mediaId);
  revalidatePath(`/dashboard/products/${productId}/edit`);
}
