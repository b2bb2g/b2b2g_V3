// 공급사·제품 조회 헬퍼(서버 컴포넌트에서 사용). RLS 로 소유·공개 범위가 이미 강제됨.
import { createClient } from '@/lib/supabase/server';
import type { CategoryRow, ProductRow, SupplierRow } from '@/lib/supabase/database.types';

export async function getMySupplier(): Promise<SupplierRow | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('suppliers')
    .select('*')
    .eq('profile_id', user.id)
    .maybeSingle();
  return data;
}

export async function listMyProducts(): Promise<ProductRow[]> {
  const supplier = await getMySupplier();
  if (!supplier) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('supplier_id', supplier.id)
    .order('updated_at', { ascending: false });
  return data ?? [];
}

export async function getMyProduct(id: string): Promise<ProductRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
  return data;
}

export async function getProductMedia(
  productId: string,
): Promise<{ id: string; url: string; is_primary: boolean }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('product_media')
    .select('id, url, is_primary')
    .eq('product_id', productId)
    .order('sort_order');
  return data ?? [];
}

export async function listActiveCategories(): Promise<Pick<CategoryRow, 'id' | 'name'>[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('categories')
    .select('id, name')
    .eq('is_active', true)
    .order('sort_order');
  return data ?? [];
}
