// 공급사 문의함(마스킹 뷰) 조회. 바이어 식별정보·author_id 는 뷰에서 제외됨.
import { createClient } from '@/lib/supabase/server';
import type { SupplierInquiryRow, MessageAuthorRole } from '@/lib/supabase/database.types';

export type SupplierMessage = {
  id: string;
  author_role: MessageAuthorRole;
  body: string;
  created_at: string;
};

export async function listSupplierInquiries(): Promise<SupplierInquiryRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('supplier_inquiries')
    .select('*')
    .order('updated_at', { ascending: false });
  return data ?? [];
}

export async function getSupplierInquiry(
  id: string,
): Promise<{ inquiry: SupplierInquiryRow; messages: SupplierMessage[] } | null> {
  const supabase = await createClient();
  const { data: inquiry } = await supabase
    .from('supplier_inquiries')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (!inquiry) return null;

  const { data: messages } = await supabase
    .from('supplier_inquiry_messages')
    .select('id, author_role, body, created_at')
    .eq('inquiry_id', id)
    .order('created_at', { ascending: true });

  return { inquiry, messages: messages ?? [] };
}
