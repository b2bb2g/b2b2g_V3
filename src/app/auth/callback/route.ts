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

  // 검증 성공 후 이동 처리.
  // - 복구(비밀번호 재설정): 세션을 유지한 채 재설정 페이지로 보낸다.
  // - 이메일 확인(가입): 세션을 종료하고 안내 배너와 함께 로그인 페이지로 보낸다.
  const onVerified = async () => {
    if (next === '/auth/reset-password') {
      return NextResponse.redirect(`${origin}${next}`);
    }
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/auth/login?status=email_confirmed`);
  };

  // 1) token_hash 방식(이메일 템플릿이 token_hash 를 넘기는 경우)
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return onVerified();
  }

  // 2) PKCE code 방식(signUp/resetPasswordForEmail 기본)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return onVerified();
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback`);
}
