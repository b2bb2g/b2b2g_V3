// 광고배너 새로 작성.
import { getTranslations } from 'next-intl/server';
import { BannerForm } from '../BannerForm';

export default async function NewBannerPage() {
  const t = await getTranslations('marketing');
  return (
    <>
      <h1 className="text-2xl font-bold">{t('newBanner')}</h1>
      <BannerForm />
    </>
  );
}
