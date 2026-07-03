// 팝업 수정.
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getPopup } from '@/lib/marketing/queries';
import { PopupForm } from '../../PopupForm';

export default async function EditPopupPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('marketing');
  const { id } = await params;
  const popup = await getPopup(id);
  if (!popup) notFound();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold">{t('editPopup')}</h1>
      <PopupForm popup={popup} />
    </main>
  );
}
