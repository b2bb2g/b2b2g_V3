'use server';
// 관리자 제품 작성. 제품은 공급사 소속이므로 관리자가 대상 공급사를 지정해 생성한다(RLS: is_admin 허용).
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { toProductColumns } from '@/lib/supplier/product-columns';
import { productSchema } from '@/lib/supplier/schema';
import type { ActionResult } from '@/lib/supplier/actions';

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
