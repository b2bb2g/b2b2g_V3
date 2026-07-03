// 제품요청글(RFQ) 조회. 공개는 마스킹 뷰(public_product_requests), 소유/관리자는 원본 테이블.
import { createClient } from '@/lib/supabase/server';
import { getMySupplier } from '@/lib/supplier/queries';
import type {
  ProductRequestResponseRow,
  ProductRequestRow,
  PublicProductRequestRow,
} from '@/lib/supabase/database.types';

// 공개 목록/상세: requester_id 등 식별정보가 제외된 마스킹 뷰만 사용(비회원 포함).
export async function listListedRequests(): Promise<PublicProductRequestRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('public_product_requests')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });
  return data ?? [];
}

export async function getPublicRequest(id: string): Promise<PublicProductRequestRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('public_product_requests')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  return data;
}

// 작성자 본인 목록(대시보드). RLS 로 본인 것만.
export async function listMyRequests(): Promise<ProductRequestRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from('product_requests')
    .select('*')
    .eq('requester_id', user.id)
    .order('created_at', { ascending: false });
  return data ?? [];
}

// 관리자 전체 목록.
export async function listAllRequests(): Promise<ProductRequestRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('product_requests')
    .select('*')
    .order('created_at', { ascending: false });
  return data ?? [];
}

// 원본 상세(작성자 본인 또는 관리자만 RLS 통과). 관리자 중개 화면·본인 상세용.
export async function getRequest(id: string): Promise<ProductRequestRow | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('product_requests').select('*').eq('id', id).maybeSingle();
  return data;
}

// 공급사가 이미 응답했는지(중복 방지 UI).
export async function getMyResponse(requestId: string): Promise<ProductRequestResponseRow | null> {
  const supplier = await getMySupplier();
  if (!supplier) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from('product_request_responses')
    .select('*')
    .eq('request_id', requestId)
    .eq('supplier_id', supplier.id)
    .maybeSingle();
  return data;
}

// 특정 요청글의 응답들(관리자 중개 화면). RLS 로 관리자만 전체 열람.
export async function listResponses(requestId: string): Promise<ProductRequestResponseRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('product_request_responses')
    .select('*')
    .eq('request_id', requestId)
    .order('created_at', { ascending: false });
  return data ?? [];
}
