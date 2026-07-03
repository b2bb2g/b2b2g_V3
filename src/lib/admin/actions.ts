'use server';
// 관리자 승인/반려 액션. RLS(is_admin)가 최종 방어. 감사로그는 Phase 3에서 추가.
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

export async function approveProduct(productId: string): Promise<void> {
  const supabase = await requireAdmin();
  if (!supabase) return;
  await supabase.from('products').update({ status: 'listed' }).eq('id', productId);
  revalidatePath('/admin/products');
}

export async function rejectProduct(productId: string): Promise<void> {
  const supabase = await requireAdmin();
  if (!supabase) return;
  await supabase.from('products').update({ status: 'rejected' }).eq('id', productId);
  revalidatePath('/admin/products');
}

export async function approveSupplier(profileId: string): Promise<void> {
  const supabase = await requireAdmin();
  if (!supabase) return;
  await supabase.from('profiles').update({ status: 'approved' }).eq('id', profileId);
  revalidatePath('/admin/suppliers');
}

export async function rejectSupplier(profileId: string): Promise<void> {
  const supabase = await requireAdmin();
  if (!supabase) return;
  await supabase.from('profiles').update({ status: 'rejected' }).eq('id', profileId);
  revalidatePath('/admin/suppliers');
}
