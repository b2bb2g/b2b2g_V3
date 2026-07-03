'use server';
// 이메일 가입·로그인·로그아웃 서버 액션. 결과는 폼(useActionState)으로 돌려준다.
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { publicEnv } from '@/lib/env';
import { loginSchema, signupSchema } from './schema';

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

  redirect('/dashboard');
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

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
