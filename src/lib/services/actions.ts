'use server';
// 서비스 카탈로그 관리자 CRUD. RLS 최종 방어.
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { ContentStatus } from '@/lib/supabase/database.types';

export type ServiceResult = { ok: true } | { ok: false; error: string };

const text = (v: FormDataEntryValue | null): string | null => String(v ?? '').trim() || null;

async function adminClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return data?.role === 'admin' ? { supabase, userId: user.id } : null;
}

export async function saveService(
  _prev: ServiceResult | null,
  formData: FormData,
): Promise<ServiceResult> {
  const ctx = await adminClient();
  if (!ctx) return { ok: false, error: 'forbidden' };

  const title = String(formData.get('title') ?? '').trim();
  if (!title) return { ok: false, error: 'invalid_input' };
  const id = (formData.get('id') as string) || null;

  const row = {
    title,
    summary: text(formData.get('summary')),
    body: String(formData.get('body') ?? ''),
    status: (formData.get('status') === 'published' ? 'published' : 'draft') as ContentStatus,
    sort_order: Number(formData.get('sort_order') ?? 0) || 0,
  };

  const { error } = id
    ? await ctx.supabase.from('services').update(row).eq('id', id)
    : await ctx.supabase.from('services').insert({ ...row, author_id: ctx.userId });
  if (error) return { ok: false, error: error.message };

  redirect('/admin/services');
}

export async function deleteService(id: string): Promise<void> {
  const ctx = await adminClient();
  if (!ctx) return;
  await ctx.supabase.from('services').delete().eq('id', id);
  redirect('/admin/services');
}
