'use server';
// 공급사 회사정보 저장 + 제품 초안 CRUD·검토제출 서버 액션. 미디어는 슬라이스 2.3.
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { ProductUpdate } from '@/lib/supabase/database.types';
import { companyProfileSchema, productSchema } from './schema';
import { toProductColumns } from './product-columns';

export type ActionResult = { ok: true } | { ok: false; error: string };

async function currentSupplierId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('suppliers')
    .select('id')
    .eq('profile_id', user.id)
    .maybeSingle();
  return data?.id ?? null;
}

export async function saveCompanyProfile(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = companyProfileSchema.safeParse({ companyName: formData.get('companyName') });
  if (!parsed.success) return { ok: false, error: 'invalid_input' };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'unauthenticated' };

  // 있으면 갱신, 없으면 생성(공급사 1인 1행, profile_id unique).
  const { error } = await supabase
    .from('suppliers')
    .upsert(
      { profile_id: user.id, company_name: parsed.data.companyName },
      { onConflict: 'profile_id' },
    );
  if (error) return { ok: false, error: error.message };

  redirect('/dashboard/products');
}

export async function createProduct(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: 'invalid_input' };

  const supplierId = await currentSupplierId();
  if (!supplierId) redirect('/dashboard/company');

  const supabase = await createClient();
  const { error } = await supabase
    .from('products')
    .insert({ supplier_id: supplierId, ...toProductColumns(parsed.data) });
  if (error) return { ok: false, error: error.message };

  redirect('/dashboard/products');
}

export async function updateProduct(
  productId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: 'invalid_input' };

  const supabase = await createClient();
  const update: ProductUpdate = toProductColumns(parsed.data);
  const { error } = await supabase.from('products').update(update).eq('id', productId);
  if (error) return { ok: false, error: error.message };

  redirect('/dashboard/products');
}

export async function submitProductForReview(productId: string): Promise<void> {
  const supabase = await createClient();
  // 초안만 검토 대기로 전환(관리자 노출 승인 대상). 거절본 재제출도 허용.
  await supabase
    .from('products')
    .update({ status: 'pending' })
    .eq('id', productId)
    .in('status', ['draft', 'rejected']);
  redirect('/dashboard/products');
}
