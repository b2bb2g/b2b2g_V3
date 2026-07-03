// 이메일 확인·비밀번호 복구 콜백. token_hash(verifyOtp) 또는 code(PKCE) 를 세션으로 교환.
import { type EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/dashboard';

  const supabase = await createClient();
  let reason = 'no_params';

  // 1) token_hash 방식(이메일 템플릿이 token_hash 를 넘기는 경우)
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    reason = `otp:${error.message}`;
  }

  // 2) PKCE code 방식(signUp/resetPasswordForEmail 기본)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    reason = `code:${error.message}`;
  }

  // 실패 사유를 임시로 노출(진단용). 원인 확인 후 제거 예정.
  return NextResponse.redirect(
    `${origin}/auth/login?error=auth_callback&reason=${encodeURIComponent(reason)}`,
  );
}
