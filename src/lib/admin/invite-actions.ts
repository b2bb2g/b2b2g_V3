'use server';
// 관리자 이메일 직접 초대: Supabase Admin API 로 초대 메일 발송. role·ref 메타데이터를 가입 트리거가 반영.
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { publicEnv } from '@/lib/env';
import { logAudit } from '@/lib/admin/audit';

const INVITE_ROLES = ['buyer', 'supplier', 'agent'] as const;
type InviteRole = (typeof INVITE_ROLES)[number];

export type InviteResult = { ok: true } | { ok: false; error: string };

export async function adminInviteByEmail(
  _prev: InviteResult | null,
  formData: FormData,
): Promise<InviteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'unauthorized' };

  const { data: me } = await supabase
    .from('profiles')
    .select('role, referral_code')
    .eq('id', user.id)
    .single();
  if (me?.role !== 'admin') return { ok: false, error: 'unauthorized' };

  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const role = String(formData.get('role') ?? '') as InviteRole;
  if (!email.includes('@')) return { ok: false, error: 'invalid_email' };
  if (!INVITE_ROLES.includes(role)) return { ok: false, error: 'invalid_role' };

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { role, ref: me.referral_code, locale: 'en' },
    redirectTo: `${publicEnv.siteUrl}/auth/callback?next=/auth/reset-password`,
  });
  if (error) return { ok: false, error: error.message };

  await logAudit({
    adminId: user.id,
    targetTable: 'invite',
    targetId: data.user?.id ?? null,
    action: 'create',
    after: { email, role },
  });
  revalidatePath('/admin/invites');
  return { ok: true };
}
