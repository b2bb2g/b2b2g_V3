'use server';
// 이메일 가입·로그인·로그아웃 서버 액션. 결과는 폼(useActionState)으로 돌려준다.
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { publicEnv } from '@/lib/env';
import { forgotPasswordSchema, loginSchema, resetPasswordSchema, signupSchema } from './schema';

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

export async function login(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { ok: false, error: 'invalid_input' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { ok: false, error: error.message };
  }

  // 로그인 직후 환영 배너를 위한 플래그.
  redirect('/dashboard?welcome=1');
}

export async function signup(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = signupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    displayName: formData.get('displayName'),
    role: formData.get('role'),
    locale: formData.get('locale') ?? 'en',
    ref: formData.get('ref') ?? undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: 'invalid_input' };
  }

  const { email, password, displayName, role, locale, ref } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // handle_new_user 트리거가 읽는 메타데이터(role 은 admin 자가부여를 트리거가 차단).
      data: { role, display_name: displayName, locale, ref: ref ?? null },
      emailRedirectTo: `${publicEnv.siteUrl}/auth/callback?next=/dashboard`,
    },
  });
  if (error) {
    return { ok: false, error: error.message };
  }

  // 이메일 확인 메일 발송됨. 확인 안내 페이지로.
  redirect('/auth/verify-email');
}

export async function requestPasswordReset(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get('email') });
  // 사용자 존재 여부를 노출하지 않도록 항상 동일한 성공 응답을 준다(계정 열거 방지).
  if (!parsed.success) {
    return { ok: true };
  }

  // SSR 표준 방식: PKCE 재설정 메일 발송(Supabase SMTP). 링크는 /auth/callback 으로
  // 돌아와 code 를 세션으로 교환한 뒤 /auth/reset-password 로 이동한다.
  // 존재하지 않는 이메일이어도 동일한 성공 응답(계정 열거 방지).
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${publicEnv.siteUrl}/auth/callback?next=/auth/reset-password`,
  });

  return { ok: true };
}

export async function updatePassword(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse({ password: formData.get('password') });
  if (!parsed.success) {
    return { ok: false, error: 'invalid_input' };
  }

  const supabase = await createClient();
  // 복구 링크→콜백으로 세션이 설정된 상태에서 비밀번호를 갱신한다.
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { ok: false, error: error.message };
  }

  // 복구 세션을 종료하고, 새 비밀번호로 다시 로그인하도록 안내 배너와 함께 이동.
  await supabase.auth.signOut();
  redirect('/auth/login?status=password_updated');
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
