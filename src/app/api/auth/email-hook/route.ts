// Supabase Send Email Hook 수신 엔드포인트. 가입 인증·복구 메일을 우리 파이프라인(sendEmail→email_outbox)으로 일원화.
// Supabase 가 인증 메일을 직접 보내는 대신 이 엔드포인트를 호출 → 서명 검증 후 우리 템플릿으로 발송.
import { Webhook } from 'standardwebhooks';
import { NextResponse, type NextRequest } from 'next/server';
import { publicEnv } from '@/lib/env';
import { sendEmail } from '@/lib/email/send';
import type { EmailTemplate } from '@/lib/supabase/database.types';

type HookPayload = {
  user: { email: string; user_metadata?: { locale?: string } };
  email_data: {
    token_hash: string;
    email_action_type: string;
    redirect_to?: string;
    site_url?: string;
  };
};

// email_action_type → 우리 템플릿 + 콜백 이동경로(next). token_hash 는 OTP 라 콜백 verifyOtp 로 처리.
function mapAction(type: string): { template: EmailTemplate; otpType: string; next: string } | null {
  switch (type) {
    case 'signup':
      return { template: 'signup_verify', otpType: 'signup', next: '/dashboard' };
    case 'recovery':
      return { template: 'password_reset', otpType: 'recovery', next: '/auth/reset-password' };
    case 'email_change':
      return { template: 'signup_verify', otpType: 'email_change', next: '/dashboard' };
    case 'magiclink':
      return { template: 'signup_verify', otpType: 'magiclink', next: '/dashboard' };
    case 'invite':
      return { template: 'signup_verify', otpType: 'invite', next: '/dashboard' };
    default:
      return null;
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.AUTH_EMAIL_HOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'hook secret not configured' }, { status: 500 });
  }

  const body = await request.text();
  const headers = {
    'webhook-id': request.headers.get('webhook-id') ?? '',
    'webhook-timestamp': request.headers.get('webhook-timestamp') ?? '',
    'webhook-signature': request.headers.get('webhook-signature') ?? '',
  };

  let payload: HookPayload;
  try {
    // Supabase 시크릿 형식 'v1,whsec_<base64>' → standardwebhooks 는 base64 부분만 사용.
    const wh = new Webhook(secret.replace('v1,whsec_', ''));
    payload = wh.verify(body, headers) as HookPayload;
  } catch (e) {
    const message = e instanceof Error ? e.message : 'invalid signature';
    return NextResponse.json({ error: `signature verify failed: ${message}` }, { status: 401 });
  }

  const mapped = mapAction(payload.email_data.email_action_type);
  if (!mapped) {
    // 처리 대상이 아닌 액션은 조용히 성공 처리(발송 없음).
    return NextResponse.json({});
  }

  const url = `${publicEnv.siteUrl}/auth/callback?token_hash=${encodeURIComponent(
    payload.email_data.token_hash,
  )}&type=${mapped.otpType}&next=${encodeURIComponent(mapped.next)}`;

  const result = await sendEmail({
    to: payload.user.email,
    template: mapped.template,
    locale: payload.user.user_metadata?.locale ?? 'en',
    payload: { url },
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({});
}
