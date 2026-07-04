// 공지 글쓰기/수정 편집기(관리자 전용, 목업의 글쓰기·수정 화면). 드래프트-우선이라 첨부도 바로 가능.
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { getNotice, listBoardCategories } from '@/lib/content/queries';
import { getAttachments } from '@/lib/attachments/queries';
import { submitNotice, deleteNotice } from '@/lib/content/actions';
import { BoardEditor } from '@/components/board/BoardEditor';

export default async function NoticeEditPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('content');
  const locale = await getLocale();
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();
  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (me?.role !== 'admin') notFound();

  const notice = await getNotice(id);
  if (!notice) notFound();

  const [categories, attachments] = await Promise.all([
    listBoardCategories('notices'),
    getAttachments('notice', id),
  ]);

  return (
    <BoardEditor
      record={{
        id: notice.id,
        title: notice.title,
        body: notice.body,
        category_id: notice.category_id,
        is_pinned: notice.is_pinned,
        status: notice.status,
      }}
      categories={categories}
      locale={locale}
      attachments={attachments}
      userId={user.id}
      ownerType="notice"
      backHref="/notices"
      boardTitle={t('notices')}
      submitAction={submitNotice}
      deleteAction={deleteNotice.bind(null, id)}
    />
  );
}
