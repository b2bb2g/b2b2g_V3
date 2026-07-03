// 이벤트 새로 작성.
import { getTranslations } from 'next-intl/server';
import { EventForm } from '../EventForm';

export default async function NewEventPage() {
  const t = await getTranslations('events');
  return (
    <>
      <h1 className="text-2xl font-bold">{t('new')}</h1>
      <EventForm />
    </>
  );
}
