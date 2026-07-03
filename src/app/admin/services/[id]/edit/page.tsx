// 서비스 수정.
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getService } from '@/lib/services/queries';
import { ServiceForm } from '../../ServiceForm';

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('services');
  const { id } = await params;
  const service = await getService(id);
  if (!service) notFound();

  return (
    <>
      <h1 className="text-2xl font-bold">{t('edit')}</h1>
      <ServiceForm service={service} />
    </>
  );
}
