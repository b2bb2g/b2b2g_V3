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

// 글쓰기 시작: 빈 초안(draft)을 즉시 생성해 첨부가 가능한 편집 화면으로 이동(드래프트-우선).
export async function startNoticeDraft(): Promise<void> {
  const ctx = await adminClient();
  if (!ctx) redirect('/notices');
  const { data } = await ctx!.supabase
    .from('notices')
    .insert({ title: '', author_id: ctx!.userId, status: 'draft' })
    .select('id')
    .single();
  redirect(data ? `/notices/${data.id}/edit` : '/notices');
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

  // intent: 'draft'(임시저장) | 'publish'(등록/수정완료). 없으면 status 필드 사용(하위호환).
  const intent = formData.get('intent');
  const status: ContentStatus =
    intent === 'publish' ? 'published' : intent === 'draft' ? 'draft' : statusOf(formData.get('status'));

  const row = {
    title,
    body: String(formData.get('body') ?? ''),
    category_id: (formData.get('category_id') as string) || null,
    is_pinned: formData.get('is_pinned') === 'on',
    status,
  };

  const { error } = id
    ? await ctx.supabase.from('notices').update(row).eq('id', id)
    : await ctx.supabase.from('notices').insert({ ...row, author_id: ctx.userId });
  if (error) return { ok: false, error: error.message };

  // 임시저장은 편집 화면 유지, 등록/수정완료는 상세로.
  if (id && status === 'draft') redirect(`/notices/${id}/edit`);
  redirect(id ? `/notices/${id}` : '/notices');
}

// 편집기 폼(다중 제출 버튼: intent) 용 void 래퍼.
export async function submitNotice(formData: FormData): Promise<void> {
  await saveNotice(null, formData);
}

export async function deleteNotice(id: string): Promise<void> {
  const ctx = await adminClient();
  if (!ctx) return;
  await ctx.supabase.from('notices').delete().eq('id', id);
  redirect('/notices');
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
