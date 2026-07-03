// 가입 직후 이메일 확인 안내 페이지.
import { getTranslations } from 'next-intl/server';

export default async function VerifyEmailPage() {
  const t = await getTranslations('auth');

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold">{t('verifyEmailTitle')}</h1>
      <p className="text-neutral-600">{t('verifyEmailBody')}</p>
    </main>
  );
}
