// 이벤트 수정.
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getEvent } from '@/lib/events/queries';
import { EventForm } from '../../EventForm';

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('events');
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold">{t('edit')}</h1>
      <EventForm event={event} />
    </main>
  );
}
