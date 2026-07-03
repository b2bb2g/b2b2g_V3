// 메인 메뉴 조회. 공개는 활성 항목, 관리자는 전체.
import { createClient } from '@/lib/supabase/server';
import type { MenuItemRow } from '@/lib/supabase/database.types';

export async function listActiveMenu(): Promise<MenuItemRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_active', true)
    .order('group', { ascending: true })
    .order('sort_order', { ascending: true });
  return data ?? [];
}

export async function listAllMenu(): Promise<MenuItemRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('menu_items')
    .select('*')
    .order('group', { ascending: true })
    .order('sort_order', { ascending: true });
  return data ?? [];
}

export async function getMenuItem(id: string): Promise<MenuItemRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('menu_items').select('*').eq('id', id).maybeSingle();
  return data;
}
