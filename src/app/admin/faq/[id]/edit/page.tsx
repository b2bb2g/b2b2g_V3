// FAQ 수정.
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { getFaq } from '@/lib/content/queries';
import { getAttachments } from '@/lib/attachments/queries';
import { FaqForm } from '../../FaqForm';
import { AttachmentManager } from '@/components/AttachmentManager';

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('content');
  const { id } = await params;
  const faq = await getFaq(id);
  if (!faq) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const attachments = await getAttachments('faq', id);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold">{t('edit')}</h1>
      <FaqForm faq={faq} />
      {user && (
        <AttachmentManager ownerType="faq" ownerId={id} userId={user.id} attachments={attachments} />
      )}
    </main>
  );
}
