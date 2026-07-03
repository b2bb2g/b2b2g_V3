// 로그인 페이지. 폼은 클라이언트 컴포넌트로 분리.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LoginForm } from './LoginForm';

export default async function LoginPage() {
  const t = await getTranslations('auth');

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-bold">{t('loginTitle')}</h1>
      <LoginForm />
      <Link href="/auth/signup" className="text-sm text-neutral-600 underline">
        {t('toSignup')}
      </Link>
    </main>
  );
}
