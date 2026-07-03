// 도메인(홈). 제품 둘러보기·로그인 진입. 문구는 언어팩에서만 참조(0.1 규칙).
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('home');

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6">
      <h1 className="text-4xl font-bold tracking-tight">{t('heroTitle')}</h1>
      <p className="text-lg text-neutral-600">{t('heroSubtitle')}</p>
      <div className="flex gap-3">
        <Link
          href="/products"
          className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white"
        >
          {t('browseProducts')}
        </Link>
        <Link
          href="/auth/login"
          className="rounded-md border border-neutral-300 px-5 py-2.5 text-sm font-medium"
        >
          {t('signIn')}
        </Link>
      </div>
    </main>
  );
}
