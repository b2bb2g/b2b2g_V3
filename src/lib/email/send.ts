import 'server-only';
// 트랜잭셔널 이메일 발송 + email_outbox 로깅. Resend API 사용, 연결정보는 환경변수(0.1 규칙).
import { createAdminClient } from '@/lib/supabase/admin';
import type { EmailTemplate } from '@/lib/supabase/database.types';
import { renderEmail, type EmailPayload } from './templates';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export type SendEmailParams = {
  to: string;
  template: EmailTemplate;
  locale?: string;
  payload?: EmailPayload;
  profileId?: string | null;
};

export type SendEmailResult = { ok: true; id: string } | { ok: false; error: string };

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const { to, template, locale = 'en', payload = {}, profileId = null } = params;
  const apiKey = process.env.EMAIL_API_KEY;
  const from = process.env.EMAIL_FROM;
  const admin = createAdminClient();

  // 1) 발송 전 큐잉 기록(감사·재발송 대비)
  const { data: row, error: insertError } = await admin
    .from('email_outbox')
    .insert({ to_email: to, profile_id: profileId, template, locale, payload })
    .select('id')
    .single();
  if (insertError || !row) {
    return { ok: false, error: `outbox insert 실패: ${insertError?.message ?? 'unknown'}` };
  }

  // 2) 설정 누락은 실패로 기록하고 중단
  if (!apiKey || !from) {
    await admin
      .from('email_outbox')
      .update({ status: 'failed', error: 'EMAIL_API_KEY/EMAIL_FROM 미설정' })
      .eq('id', row.id);
    return { ok: false, error: 'EMAIL_API_KEY/EMAIL_FROM 미설정' };
  }

  // 3) 렌더 후 Resend 발송
  const { subject, html } = renderEmail(template, locale, payload);
  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    const body = (await res.json()) as { id?: string; message?: string };

    if (!res.ok) {
      const message = body.message ?? `HTTP ${res.status}`;
      await admin
        .from('email_outbox')
        .update({ status: 'failed', error: message })
        .eq('id', row.id);
      return { ok: false, error: message };
    }

    await admin
      .from('email_outbox')
      .update({
        status: 'sent',
        provider_message_id: body.id ?? null,
        sent_at: new Date().toISOString(),
      })
      .eq('id', row.id);
    return { ok: true, id: row.id };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'unknown';
    await admin.from('email_outbox').update({ status: 'failed', error: message }).eq('id', row.id);
    return { ok: false, error: message };
  }
}
