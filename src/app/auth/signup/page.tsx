// 회원가입 페이지. ?ref=<code> 추천 코드 + ?role= 프리셋을 폼에 전달한다.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { SignupForm } from './SignupForm';
import { SELF_SIGNUP_ROLES, type SelfSignupRole } from '@/lib/auth/schema';

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; role?: string }>;
}) {
  const t = await getTranslations('auth');
  const { ref, role } = await searchParams;
  const presetRole = SELF_SIGNUP_ROLES.includes(role as SelfSignupRole)
    ? (role as SelfSignupRole)
    : undefined;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="text-2xl font-bold">{t('signupTitle')}</h1>
      {ref && <p className="text-sm text-emerald-700">{t('referredBadge')}</p>}
      <SignupForm referralCode={ref} presetRole={presetRole} />
      <Link href="/auth/login" className="text-sm text-neutral-600 underline">
        {t('toLogin')}
      </Link>
    </main>
  );
}
