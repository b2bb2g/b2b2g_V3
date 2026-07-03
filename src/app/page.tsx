// 도메인(홈) placeholder. 슬라이스 1 검증용 최소 화면. 문구는 언어팩에서만 참조(0.1 규칙).
import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('home');

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6">
      <h1 className="text-4xl font-bold tracking-tight">{t('heroTitle')}</h1>
      <p className="text-lg text-neutral-600">{t('heroSubtitle')}</p>
      <div className="flex gap-3">
        <a
          href="/products"
          className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white"
        >
          {t('browseProducts')}
        </a>
        <a
          href="/auth/login"
          className="rounded-md border border-neutral-300 px-5 py-2.5 text-sm font-medium"
        >
          {t('signIn')}
        </a>
      </div>
    </main>
  );
}
