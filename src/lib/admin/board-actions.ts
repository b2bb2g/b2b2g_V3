'use server';
// 관리자 게시판 설정: 카테고리 CRUD + 설정(작성자/조회수 노출) 토글. RLS(is_admin) 로 권한 강제.
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

export async function updateBoardSettings(board: string, formData: FormData): Promise<void> {
  const supabase = await requireAdmin();
  if (!supabase) return;
  await supabase
    .from('board_settings')
    .update({
      show_author: formData.get('show_author') === 'on',
      show_view_count: formData.get('show_view_count') === 'on',
      updated_at: new Date().toISOString(),
    })
    .eq('board', board);
  revalidatePath('/admin/board');
}

export async function createBoardCategory(board: string, formData: FormData): Promise<void> {
  const supabase = await requireAdmin();
  if (!supabase) return;
  const nameEn = String(formData.get('name_en') ?? '').trim();
  const nameKo = String(formData.get('name_ko') ?? '').trim();
  if (!nameEn || !nameKo) return;
  const sort = Number(formData.get('sort_order')) || 0;
  await supabase
    .from('board_categories')
    .insert({ board, name_en: nameEn, name_ko: nameKo, sort_order: sort });
  revalidatePath('/admin/board');
}

export async function updateBoardCategory(id: string, formData: FormData): Promise<void> {
  const supabase = await requireAdmin();
  if (!supabase) return;
  const nameEn = String(formData.get('name_en') ?? '').trim();
  const nameKo = String(formData.get('name_ko') ?? '').trim();
  if (!nameEn || !nameKo) return;
  await supabase
    .from('board_categories')
    .update({
      name_en: nameEn,
      name_ko: nameKo,
      sort_order: Number(formData.get('sort_order')) || 0,
      is_active: formData.get('is_active') === 'on',
    })
    .eq('id', id);
  revalidatePath('/admin/board');
}

export async function deleteBoardCategory(id: string): Promise<void> {
  const supabase = await requireAdmin();
  if (!supabase) return;
  await supabase.from('board_categories').delete().eq('id', id);
  revalidatePath('/admin/board');
}
