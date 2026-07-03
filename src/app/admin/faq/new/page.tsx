// FAQ 새로 작성.
import { getTranslations } from 'next-intl/server';
import { FaqForm } from '../FaqForm';

export default async function NewFaqPage() {
  const t = await getTranslations('content');
  return (
    <>
      <h1 className="text-2xl font-bold">{t('new')}</h1>
      <FaqForm />
    </>
  );
}
