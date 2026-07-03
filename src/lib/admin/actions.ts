'use server';
// 관리자 승인/반려 액션. RLS(is_admin)가 최종 방어. 감사로그는 Phase 3에서 추가.
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { notifyInquiryForwarded } from '@/lib/notify';

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

// ── 문의 중개 ────────────────────────────────────────────────────────────────
export async function forwardInquiry(inquiryId: string): Promise<void> {
  const supabase = await requireAdmin();
  if (!supabase) return;
  await supabase.from('inquiries').update({ status: 'forwarded' }).eq('id', inquiryId);
  await notifyInquiryForwarded(inquiryId);
  revalidatePath(`/admin/inquiries/${inquiryId}`);
  revalidatePath('/admin/inquiries');
}

export async function closeInquiry(inquiryId: string): Promise<void> {
  const supabase = await requireAdmin();
  if (!supabase) return;
  await supabase.from('inquiries').update({ status: 'closed' }).eq('id', inquiryId);
  revalidatePath(`/admin/inquiries/${inquiryId}`);
  revalidatePath('/admin/inquiries');
}

export type MessageResult = { ok: true } | { ok: false; error: string };

export async function addAdminMessage(
  inquiryId: string,
  _prev: MessageResult | null,
  formData: FormData,
): Promise<MessageResult> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: 'forbidden' };

  const body = String(formData.get('body') ?? '').trim();
  const visibleTo = formData.get('visibleTo') === 'admin_only' ? 'admin_only' : 'all';
  if (!body) return { ok: false, error: 'invalid_input' };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase.from('inquiry_messages').insert({
    inquiry_id: inquiryId,
    author_id: user?.id ?? null,
    author_role: 'admin',
    body,
    visible_to: visibleTo,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/inquiries/${inquiryId}`);
  return { ok: true };
}
