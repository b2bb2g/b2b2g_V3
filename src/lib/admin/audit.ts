import 'server-only';
// 관리자 변경 감사 기록(service_role 로 삽입). 모든 관리자 회원/데이터 변경을 남긴다(5.1/7).
import { createAdminClient } from '@/lib/supabase/admin';
import type { AuditAction } from '@/lib/supabase/database.types';

export async function logAudit(params: {
  adminId: string | null;
  targetTable: string;
  targetId: string | null;
  action: AuditAction;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}): Promise<void> {
  const admin = createAdminClient();
  await admin.from('admin_audit_logs').insert({
    admin_id: params.adminId,
    target_table: params.targetTable,
    target_id: params.targetId,
    action: params.action,
    before: params.before ?? null,
    after: params.after ?? null,
  });
}
