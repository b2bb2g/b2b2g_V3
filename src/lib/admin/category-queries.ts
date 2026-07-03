// 관리자 카테고리 트리 조회(비활성 포함). 대분류(그룹) + 하위 카테고리 구조로 반환.
import { createClient } from '@/lib/supabase/server';
import type { CategoryRow } from '@/lib/supabase/database.types';

export type CategoryGroup = {
  group: Pick<CategoryRow, 'id' | 'name' | 'sort_order' | 'is_active'>;
  children: Pick<CategoryRow, 'id' | 'name' | 'sort_order' | 'is_active'>[];
};

export async function listCategoryTree(): Promise<CategoryGroup[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('categories')
    .select('id, name, parent_id, sort_order, is_active')
    .order('sort_order', { ascending: true });
  const rows = data ?? [];

  const tops = rows.filter((c) => c.parent_id === null);
  return tops.map((g) => ({
    group: { id: g.id, name: g.name, sort_order: g.sort_order, is_active: g.is_active },
    children: rows
      .filter((c) => c.parent_id === g.id)
      .map((c) => ({ id: c.id, name: c.name, sort_order: c.sort_order, is_active: c.is_active })),
  }));
}
