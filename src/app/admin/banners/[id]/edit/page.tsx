// 광고배너 수정.
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getBanner } from '@/lib/marketing/queries';
import { BannerForm } from '../../BannerForm';

export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('marketing');
  const { id } = await params;
  const banner = await getBanner(id);
  if (!banner) notFound();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold">{t('editBanner')}</h1>
      <BannerForm banner={banner} />
    </main>
  );
}
