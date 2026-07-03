// 광고배너 새로 작성.
import { getTranslations } from 'next-intl/server';
import { BannerForm } from '../BannerForm';

export default async function NewBannerPage() {
  const t = await getTranslations('marketing');
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold">{t('newBanner')}</h1>
      <BannerForm />
    </main>
  );
}
