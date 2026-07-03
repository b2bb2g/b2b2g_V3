// 회원가입 페이지. ?ref=<code> 추천 코드를 폼에 전달한다.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { SignupForm } from './SignupForm';

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const t = await getTranslations('auth');
  const { ref } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-bold">{t('signupTitle')}</h1>
      {ref && <p className="text-sm text-emerald-700">{t('referredBadge')}</p>}
      <SignupForm referralCode={ref} />
      <Link href="/auth/login" className="text-sm text-neutral-600 underline">
        {t('toLogin')}
      </Link>
    </main>
  );
}
