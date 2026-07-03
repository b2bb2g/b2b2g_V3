// 이벤트 새로 작성.
import { getTranslations } from 'next-intl/server';
import { EventForm } from '../EventForm';

export default async function NewEventPage() {
  const t = await getTranslations('events');
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold">{t('new')}</h1>
      <EventForm />
    </main>
  );
}
