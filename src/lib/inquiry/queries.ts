// 내 문의 목록 조회(요청자 본인). RLS 로 본인 것만 조회됨.
import { createClient } from '@/lib/supabase/server';
import type { InquiryRow } from '@/lib/supabase/database.types';

export type MyInquiry = Pick<InquiryRow, 'id' | 'type' | 'content' | 'status' | 'created_at'> & {
  productTitle: string | null;
};

export async function listMyInquiries(): Promise<MyInquiry[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('id, type, content, status, created_at, product_id')
    .eq('requester_id', user.id)
    .order('created_at', { ascending: false });
  if (!inquiries || inquiries.length === 0) return [];

  const productIds = [...new Set(inquiries.map((i) => i.product_id))];
  const { data: products } = await supabase
    .from('products')
    .select('id, title')
    .in('id', productIds);
  const titleById = new Map((products ?? []).map((p) => [p.id, p.title]));

  return inquiries.map((i) => ({
    id: i.id,
    type: i.type,
    content: i.content,
    status: i.status,
    created_at: i.created_at,
    productTitle: titleById.get(i.product_id) ?? null,
  }));
}
