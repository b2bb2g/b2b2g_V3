// Supabase Auth Send Email Hook. 인증 메일을 우리 Resend 발송으로 대체(가입확인·비번재설정 등).
// 서명 검증(Standard Webhooks) 후 email_action_type 별 템플릿으로 발송·로깅.
import { NextResponse, type NextRequest } from 'next/server';
import { Webhook } from 'standardwebhooks';
import { sendEmail } from '@/lib/email/send';
import type { EmailTemplate } from '@/lib/supabase/database.types';

type HookPayload = {
  user: { id: string; email: string; user_metadata?: { locale?: string } };
  email_data: {
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
  };
};

// 인증 액션 → 우리 이메일 템플릿.
const ACTION_TEMPLATE: Record<string, EmailTemplate> = {
  signup: 'signup_verify',
  recovery: 'password_reset',
  invite: 'signup_verify',
  magiclink: 'signup_verify',
  email_change: 'signup_verify',
};

export async function POST(request: NextRequest) {
  const secret = process.env.AUTH_EMAIL_HOOK_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!secret || !supabaseUrl) {
    return NextResponse.json({ error: 'not_configured' }, { status: 500 });
  }

  const raw = await request.text();
  let payload: HookPayload;
  try {
    // Standard Webhooks 서명 검증(위조 요청 차단).
    const wh = new Webhook(secret.replace('v1,whsec_', ''));
    payload = wh.verify(raw, {
      'webhook-id': request.headers.get('webhook-id') ?? '',
      'webhook-timestamp': request.headers.get('webhook-timestamp') ?? '',
      'webhook-signature': request.headers.get('webhook-signature') ?? '',
    }) as HookPayload;
  } catch {
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 });
  }

  const { user, email_data } = payload;
  const template = ACTION_TEMPLATE[email_data.email_action_type] ?? 'generic';

  // 클릭 시 Supabase verify → redirect_to(우리 /auth/callback)로 세션 연결.
  const confirmUrl =
    `${supabaseUrl}/auth/v1/verify?token=${email_data.token_hash}` +
    `&type=${email_data.email_action_type}` +
    `&redirect_to=${encodeURIComponent(email_data.redirect_to)}`;

  const result = await sendEmail({
    to: user.email,
    template,
    locale: user.user_metadata?.locale ?? 'en',
    payload: { url: confirmUrl, subject: 'Notification', body: '' },
    profileId: user.id,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
