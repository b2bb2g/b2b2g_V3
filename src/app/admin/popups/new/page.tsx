// 팝업 새로 작성.
import { getTranslations } from 'next-intl/server';
import { PopupForm } from '../PopupForm';

export default async function NewPopupPage() {
  const t = await getTranslations('marketing');
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold">{t('newPopup')}</h1>
      <PopupForm />
    </main>
  );
}
