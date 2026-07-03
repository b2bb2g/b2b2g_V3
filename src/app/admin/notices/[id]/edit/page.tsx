// 공지 수정.
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { getNotice } from '@/lib/content/queries';
import { getAttachments } from '@/lib/attachments/queries';
import { NoticeForm } from '../../NoticeForm';
import { AttachmentManager } from '@/components/AttachmentManager';

export default async function EditNoticePage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('content');
  const { id } = await params;
  const notice = await getNotice(id);
  if (!notice) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const attachments = await getAttachments('notice', id);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold">{t('edit')}</h1>
      <NoticeForm notice={notice} />
      {user && (
        <AttachmentManager ownerType="notice" ownerId={id} userId={user.id} attachments={attachments} />
      )}
    </main>
  );
}
