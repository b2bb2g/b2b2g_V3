// 공개 제품 목록·상세 조회. 비회원은 안전 컬럼만, 회원은 전체(가격·거래조건). 6.4 경계.
import { createClient } from '@/lib/supabase/server';
import type { ProductCertificationRow, ProductRow } from '@/lib/supabase/database.types';

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
  primaryImagePath: string | null;
};

export async function listPublicProducts(opts?: {
  categoryId?: string;
  supplierId?: string;
  q?: string;
}): Promise<ProductListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from('products')
    .select('id, title, category_id, supplier_id')
    .eq('status', 'listed')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });
  if (opts?.categoryId) query = query.eq('category_id', opts.categoryId);
  if (opts?.supplierId) query = query.eq('supplier_id', opts.supplierId);

  // 실시간 검색(8.5): 제품명·키워드·설명 + 공급사명. PostgREST or-필터 파싱 보호 위해 정규화.
  const safe = opts?.q?.replace(/[,()%\\*]/g, ' ').trim();
  if (safe) {
    const { data: matchedSuppliers } = await supabase
      .from('public_suppliers')
      .select('id')
      .ilike('company_name', `%${safe}%`);
    const orParts = [
      `title.ilike.%${safe}%`,
      `keywords.ilike.%${safe}%`,
      `description.ilike.%${safe}%`,
    ];
    const supIds = (matchedSuppliers ?? []).map((s) => s.id);
    if (supIds.length) orParts.push(`supplier_id.in.(${supIds.join(',')})`);
    query = query.or(orParts.join(','));
  }

  const { data: products } = await query;
  if (!products || products.length === 0) return [];

  const productIds = products.map((p) => p.id);
  const categoryIds = [...new Set(products.map((p) => p.category_id).filter(Boolean))] as string[];
  const supplierIds = [...new Set(products.map((p) => p.supplier_id))];

  const [{ data: cats }, { data: sups }, { data: media }] = await Promise.all([
    categoryIds.length
      ? supabase.from('categories').select('id, name').in('id', categoryIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    supabase.from('public_suppliers').select('id, company_name').in('id', supplierIds),
    supabase
      .from('product_media')
      .select('product_id, url')
      .eq('is_primary', true)
      .in('product_id', productIds),
  ]);
  const catName = new Map((cats ?? []).map((c) => [c.id, c.name]));
  const supName = new Map((sups ?? []).map((s) => [s.id, s.company_name]));
  const primaryImage = new Map((media ?? []).map((m) => [m.product_id, m.url]));

  return products.map((p) => ({
    id: p.id,
    title: p.title,
    categoryName: p.category_id ? (catName.get(p.category_id) ?? null) : null,
    companyName: supName.get(p.supplier_id) ?? null,
    primaryImagePath: primaryImage.get(p.id) ?? null,
  }));
}

export type ProductImage = { id: string; path: string; isPrimary: boolean };

export type ProductDetail = {
  base: PublicProduct;
  categoryName: string | null;
  companyName: string | null;
  images: ProductImage[];
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

  const [{ data: cat }, { data: sup }, { data: media }] = await Promise.all([
    base.category_id
      ? supabase.from('categories').select('name').eq('id', base.category_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from('public_suppliers')
      .select('company_name')
      .eq('id', base.supplier_id)
      .maybeSingle(),
    supabase
      .from('product_media')
      .select('id, url, is_primary')
      .eq('product_id', id)
      .order('sort_order'),
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
    images: (media ?? []).map((m) => ({ id: m.id, path: m.url, isPrimary: m.is_primary })),
    isMember: !!user,
    full,
  };
}

export async function listTopCategories(): Promise<{ id: string; name: string }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('categories')
    .select('id, name')
    .is('parent_id', null)
    .eq('is_active', true)
    .order('sort_order');
  return data ?? [];
}

export async function getProductCertifications(
  productId: string,
): Promise<ProductCertificationRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('product_certifications')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: true });
  return data ?? [];
}

export type PublicSupplier = { id: string; companyName: string; verified: boolean };

export async function getPublicSupplier(id: string): Promise<PublicSupplier | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('public_suppliers')
    .select('id, company_name, verified')
    .eq('id', id)
    .maybeSingle();
  if (!data) return null;
  return { id: data.id, companyName: data.company_name, verified: data.verified };
}
