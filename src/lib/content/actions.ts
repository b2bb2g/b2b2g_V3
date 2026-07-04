'use server';
// 공지·FAQ 관리자 CRUD. RLS(관리자 전용)가 최종 방어. 저장 후 목록으로.
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { ContentStatus } from '@/lib/supabase/database.types';

export type ContentResult = { ok: true } | { ok: false; error: string };

async function adminClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return data?.role === 'admin' ? { supabase, userId: user.id } : null;
}

function statusOf(v: FormDataEntryValue | null): ContentStatus {
  return v === 'published' ? 'published' : 'draft';
}

export async function saveNotice(
  _prev: ContentResult | null,
  formData: FormData,
): Promise<ContentResult> {
  const ctx = await adminClient();
  if (!ctx) return { ok: false, error: 'forbidden' };

  const id = (formData.get('id') as string) || null;
  const title = String(formData.get('title') ?? '').trim();
  if (!title) return { ok: false, error: 'invalid_input' };
  const row = {
    title,
    body: String(formData.get('body') ?? ''),
    category_id: (formData.get('category_id') as string) || null,
    is_pinned: formData.get('is_pinned') === 'on',
    status: statusOf(formData.get('status')),
  };

  const { error } = id
    ? await ctx.supabase.from('notices').update(row).eq('id', id)
    : await ctx.supabase.from('notices').insert({ ...row, author_id: ctx.userId });
  if (error) return { ok: false, error: error.message };

  redirect('/admin/notices');
}

export async function deleteNotice(id: string): Promise<void> {
  const ctx = await adminClient();
  if (!ctx) return;
  await ctx.supabase.from('notices').delete().eq('id', id);
  redirect('/admin/notices');
}

export async function saveFaq(
  _prev: ContentResult | null,
  formData: FormData,
): Promise<ContentResult> {
  const ctx = await adminClient();
  if (!ctx) return { ok: false, error: 'forbidden' };

  const id = (formData.get('id') as string) || null;
  const question = String(formData.get('question') ?? '').trim();
  if (!question) return { ok: false, error: 'invalid_input' };
  const row = {
    question,
    answer: String(formData.get('answer') ?? ''),
    category: String(formData.get('category') ?? '').trim() || null,
    sort_order: Number(formData.get('sort_order') ?? 0) || 0,
    status: statusOf(formData.get('status')),
  };

  const { error } = id
    ? await ctx.supabase.from('faqs').update(row).eq('id', id)
    : await ctx.supabase.from('faqs').insert({ ...row, author_id: ctx.userId });
  if (error) return { ok: false, error: error.message };

  redirect('/admin/faq');
}

export async function deleteFaq(id: string): Promise<void> {
  const ctx = await adminClient();
  if (!ctx) return;
  await ctx.supabase.from('faqs').delete().eq('id', id);
  redirect('/admin/faq');
}
