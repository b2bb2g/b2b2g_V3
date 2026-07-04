// 관리자 승인 큐 조회. RLS 로 admin 만 전체 접근 가능(is_admin). 임베딩 대신 분리조회+병합.
import { createClient } from '@/lib/supabase/server';
import type {
  AdminAuditLogRow,
  InquiryMessageRow,
  InquiryRow,
  ProductRow,
  ProfileRow,
  SupplierRow,
} from '@/lib/supabase/database.types';

// 회원이 공급사면 등급·인증 관리를 위해 supplier 레코드 조회(관리자 RLS).
export async function getSupplierByProfile(profileId: string): Promise<SupplierRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('suppliers')
    .select('*')
    .eq('profile_id', profileId)
    .maybeSingle();
  return data;
}

export const ADMIN_PAGE_SIZE = 20;

// 대시보드 차트용 집계(회원 역할 분포 + 콘텐츠 발행 현황). head count 로 가볍게.
export type DashboardCharts = {
  roles: { role: string; count: number }[];
  content: { key: string; count: number }[];
};

export async function getDashboardCharts(): Promise<DashboardCharts> {
  const supabase = await createClient();
  const roleCount = (role: ProfileRow['role']) =>
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', role);

  const [buyer, supplier, agent, admin, products, requests, events, services, notices] =
    await Promise.all([
      roleCount('buyer'),
      roleCount('supplier'),
      roleCount('agent'),
      roleCount('admin'),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'listed'),
      supabase
        .from('product_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'listed'),
      supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase
        .from('services')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published'),
      supabase.from('notices').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    ]);

  return {
    roles: [
      { role: 'buyer', count: buyer.count ?? 0 },
      { role: 'supplier', count: supplier.count ?? 0 },
      { role: 'agent', count: agent.count ?? 0 },
      { role: 'admin', count: admin.count ?? 0 },
    ],
    content: [
      { key: 'products', count: products.count ?? 0 },
      { key: 'requests', count: requests.count ?? 0 },
      { key: 'events', count: events.count ?? 0 },
      { key: 'services', count: services.count ?? 0 },
      { key: 'notices', count: notices.count ?? 0 },
    ],
  };
}

export type MemberListItem = Pick<ProfileRow, 'id' | 'display_name' | 'email' | 'role' | 'status'>;

export async function listMembers(filter?: {
  role?: string;
  status?: string;
  q?: string;
  page?: number;
}): Promise<{ rows: MemberListItem[]; total: number; page: number; pageSize: number }> {
  const supabase = await createClient();
  const page = Math.max(1, filter?.page ?? 1);
  const from = (page - 1) * ADMIN_PAGE_SIZE;
  let query = supabase
    .from('profiles')
    .select('id, display_name, email, role, status', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + ADMIN_PAGE_SIZE - 1);
  if (filter?.role) query = query.eq('role', filter.role as ProfileRow['role']);
  if (filter?.status) query = query.eq('status', filter.status as ProfileRow['status']);
  const safe = filter?.q?.replace(/[,()%\\*]/g, ' ').trim();
  if (safe) query = query.or(`display_name.ilike.%${safe}%,email.ilike.%${safe}%`);
  const { data, count } = await query;
  return { rows: data ?? [], total: count ?? 0, page, pageSize: ADMIN_PAGE_SIZE };
}

export async function getMemberDetail(id: string): Promise<ProfileRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
  return data;
}

// 최근 관리자 활동(감사로그) — 대시보드 활동 피드용.
export async function listRecentAuditLogs(limit = 8): Promise<AdminAuditLogRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('admin_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function listMemberAuditLogs(profileId: string): Promise<AdminAuditLogRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('admin_audit_logs')
    .select('*')
    .eq('target_table', 'profiles')
    .eq('target_id', profileId)
    .order('created_at', { ascending: false })
    .limit(50);
  return data ?? [];
}

export type PendingProduct = Pick<ProductRow, 'id' | 'title' | 'created_at'> & {
  companyName: string | null;
  sectionName: string | null;
};

export type AdminProduct = Pick<ProductRow, 'id' | 'title' | 'status' | 'created_at'> & {
  companyName: string | null;
  sectionId: string | null;
  sectionName: string | null;
};

// 전 상태 제품(대기·공개·초안·반려) + 섹션 정보. 관리자 제품 관리 화면용.
export async function listAdminProducts(): Promise<AdminProduct[]> {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('id, title, status, created_at, supplier_id, category_id')
    .order('created_at', { ascending: false });
  if (!products || products.length === 0) return [];

  const supplierIds = [...new Set(products.map((p) => p.supplier_id))];
  const [{ data: suppliers }, { data: cats }] = await Promise.all([
    supabase.from('suppliers').select('id, company_name').in('id', supplierIds),
    supabase.from('categories').select('id, name, parent_id'),
  ]);
  const nameById = new Map((suppliers ?? []).map((s) => [s.id, s.company_name]));
  const catById = new Map((cats ?? []).map((c) => [c.id, c]));

  const sectionOf = (categoryId: string | null): { id: string | null; name: string | null } => {
    const c = categoryId ? catById.get(categoryId) : null;
    if (!c) return { id: null, name: null };
    if (c.parent_id) {
      const parent = catById.get(c.parent_id);
      return { id: c.parent_id, name: parent?.name ?? c.name };
    }
    return { id: c.id, name: c.name };
  };

  return products.map((p) => {
    const sec = sectionOf(p.category_id);
    return {
      id: p.id,
      title: p.title,
      status: p.status,
      created_at: p.created_at,
      companyName: nameById.get(p.supplier_id) ?? null,
      sectionId: sec.id,
      sectionName: sec.name,
    };
  });
}

export async function listPendingProducts(): Promise<PendingProduct[]> {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('id, title, created_at, supplier_id, category_id')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });
  if (!products || products.length === 0) return [];

  const supplierIds = [...new Set(products.map((p) => p.supplier_id))];
  const [{ data: suppliers }, { data: cats }] = await Promise.all([
    supabase.from('suppliers').select('id, company_name').in('id', supplierIds),
    supabase.from('categories').select('id, name, parent_id'),
  ]);
  const nameById = new Map((suppliers ?? []).map((s) => [s.id, s.company_name]));
  const catById = new Map((cats ?? []).map((c) => [c.id, c]));

  // 제품의 카테고리 → 상위 섹션 이름(하위 카테고리면 부모 섹션으로).
  const sectionOf = (categoryId: string | null): string | null => {
    const c = categoryId ? catById.get(categoryId) : null;
    if (!c) return null;
    return c.parent_id ? (catById.get(c.parent_id)?.name ?? c.name) : c.name;
  };

  return products.map((p) => ({
    id: p.id,
    title: p.title,
    created_at: p.created_at,
    companyName: nameById.get(p.supplier_id) ?? null,
    sectionName: sectionOf(p.category_id),
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
