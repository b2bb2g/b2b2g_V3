'use server';
// EPC 프로젝트 관리자 CRUD. RLS 가 최종 방어, 액션에서도 관리자 확인.
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { ContentStatus, ProjectField, ProjectStage } from '@/lib/supabase/database.types';

export type ProjectResult = { ok: true } | { ok: false; error: string };

async function adminClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return data?.role === 'admin' ? { supabase, userId: user.id } : null;
}

const text = (v: FormDataEntryValue | null): string | null => String(v ?? '').trim() || null;
const num = (v: FormDataEntryValue | null): number | null => {
  const s = String(v ?? '').trim();
  return s ? Number(s) : null;
};

export async function saveProject(
  _prev: ProjectResult | null,
  formData: FormData,
): Promise<ProjectResult> {
  const ctx = await adminClient();
  if (!ctx) return { ok: false, error: 'forbidden' };

  const name = String(formData.get('name') ?? '').trim();
  if (!name) return { ok: false, error: 'invalid_input' };
  const id = (formData.get('id') as string) || null;

  const row = {
    name,
    field: (formData.get('field') as ProjectField) || 'etc',
    body: String(formData.get('body') ?? ''),
    client: text(formData.get('client')),
    location: text(formData.get('location')),
    country: text(formData.get('country')),
    scale_amount: num(formData.get('scale_amount')),
    currency: text(formData.get('currency')),
    starts_on: text(formData.get('starts_on')),
    ends_on: text(formData.get('ends_on')),
    stage: (formData.get('stage') as ProjectStage) || 'planning',
    status: (formData.get('status') as ContentStatus) || 'draft',
    is_pinned: formData.get('is_pinned') === 'on',
  };

  const { error } = id
    ? await ctx.supabase.from('projects').update(row).eq('id', id)
    : await ctx.supabase.from('projects').insert({ ...row, author_id: ctx.userId });
  if (error) return { ok: false, error: error.message };

  redirect('/admin/epc');
}

export async function deleteProject(id: string): Promise<void> {
  const ctx = await adminClient();
  if (!ctx) return;
  await ctx.supabase.from('projects').delete().eq('id', id);
  redirect('/admin/epc');
}
