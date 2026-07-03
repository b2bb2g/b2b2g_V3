'use server';
// 관리자 제품 작성. 제품은 공급사 소속이므로 관리자가 대상 공급사를 지정해 생성한다(RLS: is_admin 허용).
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { toProductColumns } from '@/lib/supplier/product-columns';
import { productSchema } from '@/lib/supplier/schema';
import type { ActionResult } from '@/lib/supplier/actions';
import type { ProductRow, ProductUpdate } from '@/lib/supabase/database.types';

// 관리자 제품 단건 조회(RLS: is_admin 은 전 제품 열람 가능).
export async function getAdminProduct(id: string): Promise<ProductRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
  return data;
}

// 관리자 제품 수정(모든 제품). RLS: is_admin 허용. 저장 후 관리 목록으로.
export async function adminUpdateProduct(
  productId: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'forbidden' };
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { ok: false, error: 'forbidden' };

  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: 'invalid_input' };
  const update: ProductUpdate = toProductColumns(parsed.data);
  const { error } = await supabase.from('products').update(update).eq('id', productId);
  if (error) return { ok: false, error: error.message };

  redirect('/admin/products');
}

export async function listSuppliersForPicker(): Promise<{ id: string; company_name: string }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('suppliers')
    .select('id, company_name')
    .order('company_name', { ascending: true });
  return data ?? [];
}

export async function adminCreateProduct(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'forbidden' };
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { ok: false, error: 'forbidden' };

  const supplierId = String(formData.get('supplier_id') ?? '').trim();
  if (!supplierId) return { ok: false, error: 'invalid_input' };

  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: 'invalid_input' };

  const { error } = await supabase
    .from('products')
    .insert({ supplier_id: supplierId, ...toProductColumns(parsed.data) });
  if (error) return { ok: false, error: error.message };

  redirect('/admin/products');
}
