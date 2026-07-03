// 메인 메뉴·메뉴 그룹 조회. 공개는 활성 항목, 관리자는 전체.
import { createClient } from '@/lib/supabase/server';
import type { MenuGroupRow, MenuItemRow } from '@/lib/supabase/database.types';

export async function listActiveMenu(): Promise<MenuItemRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  return data ?? [];
}

export async function listAllMenu(): Promise<MenuItemRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('menu_items')
    .select('*')
    .order('sort_order', { ascending: true });
  return data ?? [];
}

export async function getMenuItem(id: string): Promise<MenuItemRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('menu_items').select('*').eq('id', id).maybeSingle();
  return data;
}

export async function listMenuGroups(): Promise<MenuGroupRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('menu_groups')
    .select('*')
    .order('sort_order', { ascending: true });
  return data ?? [];
}
