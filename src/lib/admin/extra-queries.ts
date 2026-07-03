// 관리자 추가 조회: 법적문서·감사로그·이메일 발송로그·단축링크. RLS(is_admin)로 전체 열람.
import { createClient } from '@/lib/supabase/server';
import type {
  AdminAuditLogRow,
  EmailOutboxRow,
  LegalDocumentRow,
  ShortLinkRow,
} from '@/lib/supabase/database.types';

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

export async function listAllAuditLogs(limit = 100): Promise<AdminAuditLogRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('admin_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function listEmailOutbox(limit = 100): Promise<EmailOutboxRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('email_outbox')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return data ?? [];
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
