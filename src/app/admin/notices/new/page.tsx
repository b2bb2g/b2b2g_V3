// 공지 새로 작성.
import { getLocale, getTranslations } from 'next-intl/server';
import { listBoardCategories } from '@/lib/content/queries';
import { NoticeForm } from '../NoticeForm';

export default async function NewNoticePage() {
  const t = await getTranslations('content');
  const locale = await getLocale();
  const categories = await listBoardCategories('notices');
  return (
    <>
      <h1 className="text-2xl font-bold">{t('new')}</h1>
      <NoticeForm categories={categories} locale={locale} />
    </>
  );
}
