// 팝업 새로 작성.
import { getTranslations } from 'next-intl/server';
import { PopupForm } from '../PopupForm';

export default async function NewPopupPage() {
  const t = await getTranslations('marketing');
  return (
    <>
      <h1 className="text-2xl font-bold">{t('newPopup')}</h1>
      <PopupForm />
    </>
  );
}
