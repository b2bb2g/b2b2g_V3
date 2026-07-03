'use server';
// 관리자 승인/반려 액션. RLS(is_admin)가 최종 방어. 감사로그는 Phase 3에서 추가.
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  notifyInquiryForwarded,
  notifyProductApproved,
  notifyProductRejected,
  notifyMemberApproved,
  notifyMemberRejected,
} from '@/lib/notify';
import { logAudit } from '@/lib/admin/audit';
import type { UserRole, UserStatus } from '@/lib/supabase/database.types';

type AdminCtx = { supabase: Awaited<ReturnType<typeof createClient>>; adminId: string };

async function requireAdmin(): Promise<AdminCtx | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return data?.role === 'admin' ? { supabase, adminId: user.id } : null;
}

export async function approveProduct(productId: string): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  await ctx.supabase.from('products').update({ status: 'listed' }).eq('id', productId);
  await logAudit({
    adminId: ctx.adminId,
    targetTable: 'products',
    targetId: productId,
    action: 'approve',
    after: { status: 'listed' },
  });
  await notifyProductApproved(productId);
  revalidatePath('/admin/products');
}

export async function rejectProduct(productId: string): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  await ctx.supabase.from('products').update({ status: 'rejected' }).eq('id', productId);
  await logAudit({
    adminId: ctx.adminId,
    targetTable: 'products',
    targetId: productId,
    action: 'reject',
    after: { status: 'rejected' },
  });
  await notifyProductRejected(productId);
  revalidatePath('/admin/products');
}

export async function approveSupplier(profileId: string): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  await ctx.supabase.from('profiles').update({ status: 'approved' }).eq('id', profileId);
  await logAudit({
    adminId: ctx.adminId,
    targetTable: 'profiles',
    targetId: profileId,
    action: 'approve',
    after: { status: 'approved' },
  });
  await notifyMemberApproved(profileId);
  revalidatePath('/admin/suppliers');
}

export async function rejectSupplier(profileId: string): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  await ctx.supabase.from('profiles').update({ status: 'rejected' }).eq('id', profileId);
  await logAudit({
    adminId: ctx.adminId,
    targetTable: 'profiles',
    targetId: profileId,
    action: 'reject',
    after: { status: 'rejected' },
  });
  await notifyMemberRejected(profileId);
  revalidatePath('/admin/suppliers');
}

// ── 회원 전권 관리(역할·상태·메모) ─────────────────────────────────────────
export async function changeMemberRole(
  profileId: string,
  _prev: unknown,
  formData: FormData,
): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const role = formData.get('role') as UserRole;
  const { data: before } = await ctx.supabase
    .from('profiles')
    .select('role')
    .eq('id', profileId)
    .single();
  await ctx.supabase.from('profiles').update({ role }).eq('id', profileId);
  await logAudit({
    adminId: ctx.adminId,
    targetTable: 'profiles',
    targetId: profileId,
    action: 'role_change',
    before: before ?? null,
    after: { role },
  });
  revalidatePath(`/admin/members/${profileId}`);
}

export async function changeMemberStatus(
  profileId: string,
  _prev: unknown,
  formData: FormData,
): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const status = formData.get('status') as UserStatus;
  const { data: before } = await ctx.supabase
    .from('profiles')
    .select('status')
    .eq('id', profileId)
    .single();
  await ctx.supabase.from('profiles').update({ status }).eq('id', profileId);
  await logAudit({
    adminId: ctx.adminId,
    targetTable: 'profiles',
    targetId: profileId,
    action: status === 'suspended' ? 'suspend' : 'update',
    before: before ?? null,
    after: { status },
  });
  revalidatePath(`/admin/members/${profileId}`);
}

export async function updateMemberMemo(
  profileId: string,
  _prev: unknown,
  formData: FormData,
): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  const memo = String(formData.get('memo') ?? '');
  await ctx.supabase.from('profiles').update({ memo }).eq('id', profileId);
  await logAudit({
    adminId: ctx.adminId,
    targetTable: 'profiles',
    targetId: profileId,
    action: 'update',
    after: { memo },
  });
  revalidatePath(`/admin/members/${profileId}`);
}

// ── 문의 중개 ────────────────────────────────────────────────────────────────
export async function forwardInquiry(inquiryId: string): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  await ctx.supabase.from('inquiries').update({ status: 'forwarded' }).eq('id', inquiryId);
  await notifyInquiryForwarded(inquiryId);
  revalidatePath(`/admin/inquiries/${inquiryId}`);
  revalidatePath('/admin/inquiries');
}

export async function closeInquiry(inquiryId: string): Promise<void> {
  const ctx = await requireAdmin();
  if (!ctx) return;
  await ctx.supabase.from('inquiries').update({ status: 'closed' }).eq('id', inquiryId);
  revalidatePath(`/admin/inquiries/${inquiryId}`);
  revalidatePath('/admin/inquiries');
}

export type MessageResult = { ok: true } | { ok: false; error: string };

export async function addAdminMessage(
  inquiryId: string,
  _prev: MessageResult | null,
  formData: FormData,
): Promise<MessageResult> {
  const ctx = await requireAdmin();
  if (!ctx) return { ok: false, error: 'forbidden' };

  const body = String(formData.get('body') ?? '').trim();
  const visibleTo = formData.get('visibleTo') === 'admin_only' ? 'admin_only' : 'all';
  if (!body) return { ok: false, error: 'invalid_input' };

  const { error } = await ctx.supabase.from('inquiry_messages').insert({
    inquiry_id: inquiryId,
    author_id: ctx.adminId,
    author_role: 'admin',
    body,
    visible_to: visibleTo,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/inquiries/${inquiryId}`);
  return { ok: true };
}
