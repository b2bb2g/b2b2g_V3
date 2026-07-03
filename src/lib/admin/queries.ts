// 관리자 승인 큐 조회. RLS 로 admin 만 전체 접근 가능(is_admin). 임베딩 대신 분리조회+병합.
import { createClient } from '@/lib/supabase/server';
import type {
  InquiryMessageRow,
  InquiryRow,
  ProductRow,
  ProfileRow,
} from '@/lib/supabase/database.types';

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

export type AdminInquiry = Pick<InquiryRow, 'id' | 'type' | 'status' | 'created_at'> & {
  productTitle: string | null;
  requesterName: string | null;
};

export async function listAllInquiries(): Promise<AdminInquiry[]> {
  const supabase = await createClient();
  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('id, type, status, created_at, product_id, requester_id')
    .order('updated_at', { ascending: false });
  if (!inquiries || inquiries.length === 0) return [];

  const productIds = [...new Set(inquiries.map((i) => i.product_id))];
  const requesterIds = [...new Set(inquiries.map((i) => i.requester_id))];
  const [{ data: products }, { data: requesters }] = await Promise.all([
    supabase.from('products').select('id, title').in('id', productIds),
    supabase.from('profiles').select('id, display_name').in('id', requesterIds),
  ]);
  const title = new Map((products ?? []).map((p) => [p.id, p.title]));
  const name = new Map((requesters ?? []).map((r) => [r.id, r.display_name]));

  return inquiries.map((i) => ({
    id: i.id,
    type: i.type,
    status: i.status,
    created_at: i.created_at,
    productTitle: title.get(i.product_id) ?? null,
    requesterName: name.get(i.requester_id) ?? null,
  }));
}

export type AdminInquiryDetail = {
  inquiry: InquiryRow;
  productTitle: string | null;
  requesterName: string | null;
  requesterEmail: string | null;
  messages: InquiryMessageRow[];
};

export async function getInquiryDetail(id: string): Promise<AdminInquiryDetail | null> {
  const supabase = await createClient();
  const { data: inquiry } = await supabase.from('inquiries').select('*').eq('id', id).maybeSingle();
  if (!inquiry) return null;

  const [{ data: product }, { data: requester }, { data: messages }] = await Promise.all([
    supabase.from('products').select('title').eq('id', inquiry.product_id).maybeSingle(),
    supabase
      .from('profiles')
      .select('display_name, email')
      .eq('id', inquiry.requester_id)
      .maybeSingle(),
    supabase
      .from('inquiry_messages')
      .select('*')
      .eq('inquiry_id', id)
      .order('created_at', { ascending: true }),
  ]);

  return {
    inquiry,
    productTitle: product?.title ?? null,
    requesterName: requester?.display_name ?? null,
    requesterEmail: requester?.email ?? null,
    messages: messages ?? [],
  };
}

export async function newInquiryCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from('inquiries')
    .select('id', { count: 'exact', head: true })
    .in('status', ['submitted', 'admin_review']);
  return count ?? 0;
}

export async function approvalCounts(): Promise<{
  products: number;
  suppliers: number;
  inquiries: number;
}> {
  const [products, suppliers, inquiries] = await Promise.all([
    listPendingProducts(),
    listPendingSuppliers(),
    newInquiryCount(),
  ]);
  return { products: products.length, suppliers: suppliers.length, inquiries };
}
