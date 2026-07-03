// 공개 제품 목록·상세 조회. 비회원은 안전 컬럼만, 회원은 전체(가격·거래조건). 6.4 경계.
import { createClient } from '@/lib/supabase/server';
import type { ProductRow } from '@/lib/supabase/database.types';

// 비회원에게도 공개 가능한 제품 필드(가격·거래조건 제외).
const PUBLIC_COLUMNS =
  'id, title, description, detail_body, category_id, supplier_id, price_visible, is_featured, created_at';

export type PublicProduct = Pick<
  ProductRow,
  | 'id'
  | 'title'
  | 'description'
  | 'detail_body'
  | 'category_id'
  | 'supplier_id'
  | 'price_visible'
  | 'is_featured'
  | 'created_at'
>;

export type ProductListItem = {
  id: string;
  title: string;
  categoryName: string | null;
  companyName: string | null;
};

export async function listPublicProducts(categoryId?: string): Promise<ProductListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from('products')
    .select('id, title, category_id, supplier_id')
    .eq('status', 'listed')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });
  if (categoryId) query = query.eq('category_id', categoryId);

  const { data: products } = await query;
  if (!products || products.length === 0) return [];

  const categoryIds = [...new Set(products.map((p) => p.category_id).filter(Boolean))] as string[];
  const supplierIds = [...new Set(products.map((p) => p.supplier_id))];

  const [{ data: cats }, { data: sups }] = await Promise.all([
    categoryIds.length
      ? supabase.from('categories').select('id, name').in('id', categoryIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    supabase.from('public_suppliers').select('id, company_name').in('id', supplierIds),
  ]);
  const catName = new Map((cats ?? []).map((c) => [c.id, c.name]));
  const supName = new Map((sups ?? []).map((s) => [s.id, s.company_name]));

  return products.map((p) => ({
    id: p.id,
    title: p.title,
    categoryName: p.category_id ? (catName.get(p.category_id) ?? null) : null,
    companyName: supName.get(p.supplier_id) ?? null,
  }));
}

export type ProductDetail = {
  base: PublicProduct;
  categoryName: string | null;
  companyName: string | null;
  isMember: boolean;
  // 회원에게만 채워지는 민감 정보(가격·거래조건). 비회원은 null.
  full: ProductRow | null;
};

export async function getProductDetail(id: string): Promise<ProductDetail | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: base } = await supabase
    .from('products')
    .select(PUBLIC_COLUMNS)
    .eq('id', id)
    .maybeSingle<PublicProduct>();
  if (!base) return null;

  const [{ data: cat }, { data: sup }] = await Promise.all([
    base.category_id
      ? supabase.from('categories').select('name').eq('id', base.category_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from('public_suppliers')
      .select('company_name')
      .eq('id', base.supplier_id)
      .maybeSingle(),
  ]);

  let full: ProductRow | null = null;
  if (user) {
    const { data } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
    full = data;
  }

  return {
    base,
    categoryName: cat?.name ?? null,
    companyName: sup?.company_name ?? null,
    isMember: !!user,
    full,
  };
}
