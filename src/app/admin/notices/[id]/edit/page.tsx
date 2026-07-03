// 공지 수정.
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getNotice } from '@/lib/content/queries';
import { NoticeForm } from '../../NoticeForm';

export default async function EditNoticePage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('content');
  const { id } = await params;
  const notice = await getNotice(id);
  if (!notice) notFound();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold">{t('edit')}</h1>
      <NoticeForm notice={notice} />
    </main>
  );
}
