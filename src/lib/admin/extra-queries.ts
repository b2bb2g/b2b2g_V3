// 관리자 추가 조회: 법적문서·감사로그·이메일 발송로그·단축링크. RLS(is_admin)로 전체 열람.
import { createClient } from '@/lib/supabase/server';
import { ADMIN_PAGE_SIZE } from '@/lib/admin/queries';
import type {
  AdminAuditLogRow,
  EmailOutboxRow,
  LegalDocumentRow,
  ShortLinkRow,
} from '@/lib/supabase/database.types';

export type Paged<T> = { rows: T[]; total: number; page: number; pageSize: number };

function range(page: number): { from: number; to: number; page: number } {
  const p = Math.max(1, page);
  const from = (p - 1) * ADMIN_PAGE_SIZE;
  return { from, to: from + ADMIN_PAGE_SIZE - 1, page: p };
}

export async function listLegalDocuments(): Promise<LegalDocumentRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('legal_documents')
    .select('*')
    .eq('is_current', true)
    .order('type', { ascending: true })
    .order('locale', { ascending: true });
  return data ?? [];
}

export async function listAllAuditLogs(page = 1): Promise<Paged<AdminAuditLogRow>> {
  const supabase = await createClient();
  const r = range(page);
  const { data, count } = await supabase
    .from('admin_audit_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(r.from, r.to);
  return { rows: data ?? [], total: count ?? 0, page: r.page, pageSize: ADMIN_PAGE_SIZE };
}

export async function listEmailOutbox(page = 1): Promise<Paged<EmailOutboxRow>> {
  const supabase = await createClient();
  const r = range(page);
  const { data, count } = await supabase
    .from('email_outbox')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(r.from, r.to);
  return { rows: data ?? [], total: count ?? 0, page: r.page, pageSize: ADMIN_PAGE_SIZE };
}

export async function listAllShortLinks(limit = 200): Promise<ShortLinkRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('short_links')
    .select('*')
    .order('click_count', { ascending: false })
    .limit(limit);
  return data ?? [];
}
