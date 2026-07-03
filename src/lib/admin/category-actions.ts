'use server';
// 관리자 카테고리 관리(대분류/하위). RLS(is_admin)가 쓰기 강제, 액션에서도 관리자 확인.
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return data?.role === 'admin' ? supabase : null;
}

export async function createCategory(formData: FormData): Promise<void> {
  const supabase = await requireAdmin();
  if (!supabase) return;

  const name = String(formData.get('name') ?? '').trim();
  if (!name) return;
  const parentId = (formData.get('parent_id') as string) || null;
  const sortOrder = Number(formData.get('sort_order') ?? 0) || 0;

  await supabase
    .from('categories')
    .insert({ name, parent_id: parentId, sort_order: sortOrder, is_active: true });
  revalidatePath('/admin/categories');
}

export async function updateCategory(id: string, formData: FormData): Promise<void> {
  const supabase = await requireAdmin();
  if (!supabase) return;
  const name = String(formData.get('name') ?? '').trim();
  if (!name) return;
  await supabase
    .from('categories')
    .update({
      name,
      sort_order: Number(formData.get('sort_order') ?? 0) || 0,
      is_active: formData.get('is_active') === 'on',
    })
    .eq('id', id);
  revalidatePath('/admin/categories');
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = await requireAdmin();
  if (!supabase) return;
  // 하위 카테고리·연결 제품이 있으면 삭제 차단(고아 방지). 대신 비활성 권장.
  const [{ count: children }, { count: products }] = await Promise.all([
    supabase.from('categories').select('id', { count: 'exact', head: true }).eq('parent_id', id),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('category_id', id),
  ]);
  if ((children ?? 0) > 0 || (products ?? 0) > 0) return;
  await supabase.from('categories').delete().eq('id', id);
  revalidatePath('/admin/categories');
}
