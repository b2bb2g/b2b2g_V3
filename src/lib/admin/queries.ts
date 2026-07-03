// 관리자 승인 큐 조회. RLS 로 admin 만 전체 접근 가능(is_admin). 임베딩 대신 분리조회+병합.
import { createClient } from '@/lib/supabase/server';
import type { ProductRow, ProfileRow } from '@/lib/supabase/database.types';

export type PendingProduct = Pick<ProductRow, 'id' | 'title' | 'created_at'> & {
  companyName: string | null;
};

export async function listPendingProducts(): Promise<PendingProduct[]> {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('id, title, created_at, supplier_id')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  if (!products || products.length === 0) return [];

  const supplierIds = [...new Set(products.map((p) => p.supplier_id))];
  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('id, company_name')
    .in('id', supplierIds);
  const nameById = new Map((suppliers ?? []).map((s) => [s.id, s.company_name]));

  return products.map((p) => ({
    id: p.id,
    title: p.title,
    created_at: p.created_at,
    companyName: nameById.get(p.supplier_id) ?? null,
  }));
}

export type PendingSupplier = Pick<ProfileRow, 'id' | 'display_name' | 'email' | 'created_at'> & {
  companyName: string | null;
};

export async function listPendingSuppliers(): Promise<PendingSupplier[]> {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name, email, created_at')
    .eq('role', 'supplier')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  if (!profiles || profiles.length === 0) return [];

  const { data: suppliers } = await supabase
    .from('suppliers')
    .select('profile_id, company_name')
    .in(
      'profile_id',
      profiles.map((p) => p.id),
    );
  const nameByProfile = new Map((suppliers ?? []).map((s) => [s.profile_id, s.company_name]));

  return profiles.map((p) => ({
    id: p.id,
    display_name: p.display_name,
    email: p.email,
    created_at: p.created_at,
    companyName: nameByProfile.get(p.id) ?? null,
  }));
}

export async function approvalCounts(): Promise<{ products: number; suppliers: number }> {
  const [products, suppliers] = await Promise.all([listPendingProducts(), listPendingSuppliers()]);
  return { products: products.length, suppliers: suppliers.length };
}
