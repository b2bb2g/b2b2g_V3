// 로그인 페이지. 폼은 클라이언트 컴포넌트로 분리.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LoginForm } from './LoginForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; error?: string }>;
}) {
  const t = await getTranslations('auth');
  const { status, error } = await searchParams;

  const notice =
    status === 'password_updated'
      ? t('passwordUpdatedNotice')
      : status === 'email_confirmed'
        ? t('emailConfirmedNotice')
        : null;

  const warning = status === 'ip_changed' ? t('ipChangedNotice') : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-bold">{t('loginTitle')}</h1>
      {notice && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</p>
      )}
      {warning && (
        <p role="alert" className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
          {warning}
        </p>
      )}
      {error === 'auth_callback' && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {t('callbackError')}
        </p>
      )}
      <LoginForm />
      <div className="flex flex-col gap-2">
        <Link href="/auth/forgot-password" className="text-sm text-neutral-600 underline">
          {t('forgotPassword')}
        </Link>
        <Link href="/auth/signup" className="text-sm text-neutral-600 underline">
          {t('toSignup')}
        </Link>
      </div>
    </main>
  );
}
