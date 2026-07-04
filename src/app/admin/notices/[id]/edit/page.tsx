// 공지 수정.
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { getNotice, listBoardCategories } from '@/lib/content/queries';
import { getAttachments } from '@/lib/attachments/queries';
import { NoticeForm } from '../../NoticeForm';
import { AttachmentManager } from '@/components/AttachmentManager';

export default async function EditNoticePage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('content');
  const locale = await getLocale();
  const { id } = await params;
  const notice = await getNotice(id);
  if (!notice) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [attachments, categories] = await Promise.all([
    getAttachments('notice', id),
    listBoardCategories('notices'),
  ]);

  return (
    <>
      <h1 className="text-2xl font-bold">{t('edit')}</h1>
      <NoticeForm notice={notice} categories={categories} locale={locale} />
      {user && (
        <AttachmentManager ownerType="notice" ownerId={id} userId={user.id} attachments={attachments} />
      )}
    </>
  );
}
