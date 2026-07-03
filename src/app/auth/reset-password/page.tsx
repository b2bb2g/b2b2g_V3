// 새 비밀번호 설정 페이지. 복구 링크→콜백으로 세션이 있어야 진입 가능.
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { ResetPasswordForm } from './ResetPasswordForm';

export default async function ResetPasswordPage() {
  const t = await getTranslations('auth');
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    // 유효한 복구 세션이 없으면(만료·직접 접근) 재요청으로.
    redirect('/auth/forgot-password');
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-bold">{t('resetTitle')}</h1>
      <ResetPasswordForm />
    </main>
  );
}
