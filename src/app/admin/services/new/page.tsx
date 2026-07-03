// 서비스 새로 작성.
import { getTranslations } from 'next-intl/server';
import { ServiceForm } from '../ServiceForm';

export default async function NewServicePage() {
  const t = await getTranslations('services');
  return (
    <>
      <h1 className="text-2xl font-bold">{t('new')}</h1>
      <ServiceForm />
    </>
  );
}
