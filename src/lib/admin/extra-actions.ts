'use server';
// 관리자: 법적문서 본문 편집 + 단축링크 활성 토글. RLS(is_admin)로 권한 강제.
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

export async function updateLegalDocument(id: string, formData: FormData): Promise<void> {
  const supabase = await requireAdmin();
  if (!supabase) return;
  const body = String(formData.get('body') ?? '');
  await supabase.from('legal_documents').update({ body }).eq('id', id);
  revalidatePath('/admin/legal');
}

export async function toggleShortLink(id: string, isActive: boolean): Promise<void> {
  const supabase = await requireAdmin();
  if (!supabase) return;
  await supabase.from('short_links').update({ is_active: !isActive }).eq('id', id);
  revalidatePath('/admin/links');
}
