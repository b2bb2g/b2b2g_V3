// 이벤트 수정.
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { getEvent } from '@/lib/events/queries';
import { getAttachments } from '@/lib/attachments/queries';
import { EventForm } from '../../EventForm';
import { AttachmentManager } from '@/components/AttachmentManager';

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('events');
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const attachments = await getAttachments('event', id);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold">{t('edit')}</h1>
      <EventForm event={event} />
      {user && (
        <AttachmentManager ownerType="event" ownerId={id} userId={user.id} attachments={attachments} />
      )}
    </main>
  );
}
