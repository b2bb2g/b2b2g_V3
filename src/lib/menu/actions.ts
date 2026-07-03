'use server';
// 메인 메뉴 편집(관리자 전용). 라벨·링크·순서·노출·그룹 변경, 비시스템 항목 추가/삭제. RLS 최종 방어.
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { MenuGroup } from '@/lib/supabase/database.types';

export type MenuResult = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return data?.role === 'admin' ? supabase : null;
}

export async function saveMenuItem(
  _prev: MenuResult | null,
  formData: FormData,
): Promise<MenuResult> {
  const supabase = await requireAdmin();
  if (!supabase) return { ok: false, error: 'forbidden' };

  const labelEn = String(formData.get('label_en') ?? '').trim();
  const labelKo = String(formData.get('label_ko') ?? '').trim();
  const route = String(formData.get('route') ?? '').trim();
  if (!labelEn || !labelKo || !route) return { ok: false, error: 'invalid_input' };
  const id = (formData.get('id') as string) || null;

  const row = {
    label_en: labelEn,
    label_ko: labelKo,
    group: (formData.get('group') as MenuGroup) || 'info_service',
    route,
    sort_order: Number(formData.get('sort_order') ?? 0) || 0,
    is_active: formData.get('is_active') === 'on',
  };

  const { error } = id
    ? await supabase.from('menu_items').update(row).eq('id', id)
    : await supabase.from('menu_items').insert(row);
  if (error) return { ok: false, error: error.message };

  redirect('/admin/menu');
}

export async function deleteMenuItem(id: string): Promise<void> {
  const supabase = await requireAdmin();
  if (!supabase) return;
  // 시스템 항목은 삭제 방지(노출만 끌 수 있음).
  await supabase.from('menu_items').delete().eq('id', id).eq('is_system', false);
  revalidatePath('/admin/menu');
  redirect('/admin/menu');
}
