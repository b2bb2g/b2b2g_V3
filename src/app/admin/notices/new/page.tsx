// 공지 새로 작성.
import { getTranslations } from 'next-intl/server';
import { NoticeForm } from '../NoticeForm';

export default async function NewNoticePage() {
  const t = await getTranslations('content');
  return (
    <>
      <h1 className="text-2xl font-bold">{t('new')}</h1>
      <NoticeForm />
    </>
  );
}
