'use server';
// 제품요청글(RFQ) 액션. 바이어 작성 / 공급사 응답 / 관리자 중개(상태 변경). RLS 가 최종 방어.
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getMySupplier } from '@/lib/supplier/queries';
import type { RequestResponseStatus, RequestStatus } from '@/lib/supabase/database.types';

export type RequestResult = { ok: true } | { ok: false; error: string };

const text = (v: FormDataEntryValue | null): string | null => String(v ?? '').trim() || null;
const num = (v: FormDataEntryValue | null): number | null => {
  const s = String(v ?? '').trim();
  return s ? Number(s) : null;
};

// 바이어/에이전트: 요청글 작성(제출 상태 → 관리자 승인 후 공개).
export async function createRequest(
  _prev: RequestResult | null,
  formData: FormData,
): Promise<RequestResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'forbidden' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'buyer' && profile?.role !== 'agent') {
    return { ok: false, error: 'forbidden' };
  }

  const title = String(formData.get('title') ?? '').trim();
  if (!title) return { ok: false, error: 'invalid_input' };

  const { error } = await supabase.from('product_requests').insert({
    requester_id: user.id,
    title,
    body: String(formData.get('body') ?? ''),
    category_id: text(formData.get('category_id')),
    target_country: text(formData.get('target_country')),
    budget: num(formData.get('budget')),
    qty: num(formData.get('qty')),
  });
  if (error) return { ok: false, error: error.message };

  redirect('/dashboard/requests');
}

// 공급사: 요청글에 "응하겠다" 표시(관리자에게 전달되는 제안 메시지). 1공급사 1응답.
export async function respondToRequest(
  requestId: string,
  _prev: RequestResult | null,
  formData: FormData,
): Promise<RequestResult> {
  const supplier = await getMySupplier();
  if (!supplier) return { ok: false, error: 'forbidden' };

  const supabase = await createClient();
  const { error } = await supabase.from('product_request_responses').upsert(
    {
      request_id: requestId,
      supplier_id: supplier.id,
      message: String(formData.get('message') ?? ''),
      status: 'submitted' as RequestResponseStatus,
    },
    { onConflict: 'request_id,supplier_id' },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/requests/${requestId}`);
  return { ok: true };
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return data?.role === 'admin' ? supabase : null;
}

// 관리자: 요청글 상태 변경(승인 listed / 반려 rejected / 종료 closed 등).
export async function updateRequestStatus(id: string, formData: FormData): Promise<void> {
  const supabase = await requireAdmin();
  if (!supabase) return;
  const status = formData.get('status') as RequestStatus;
  await supabase.from('product_requests').update({ status }).eq('id', id);
  revalidatePath(`/admin/requests/${id}`);
  revalidatePath('/admin/requests');
}

// 관리자: 공급사 응답 상태 변경(바이어에 전달/수락/거절 중개).
export async function updateResponseStatus(id: string, formData: FormData): Promise<void> {
  const supabase = await requireAdmin();
  if (!supabase) return;
  const status = formData.get('status') as RequestResponseStatus;
  const requestId = String(formData.get('request_id') ?? '');
  await supabase.from('product_request_responses').update({ status }).eq('id', id);
  if (requestId) revalidatePath(`/admin/requests/${requestId}`);
}

export async function deleteRequest(id: string): Promise<void> {
  const supabase = await requireAdmin();
  if (!supabase) return;
  await supabase.from('product_requests').delete().eq('id', id);
  redirect('/admin/requests');
}
