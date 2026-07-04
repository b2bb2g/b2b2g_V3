// 공지 상세(게시판): 브레드크럼·목록 + 카테고리/공지 배지 + 등록일·조회수·작성자(설정) + 본문 + 첨부. 진입 시 조회수 증가.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { getNotice, getBoardSettings, listBoardCategories, bumpNoticeView } from '@/lib/content/queries';
import { BoardAttachments } from '@/components/BoardAttachments';
import { SafeHtml } from '@/components/SafeHtml';

export default async function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('content');
  const locale = await getLocale();
  const { id } = await params;

  const notice = await getNotice(id);
  if (!notice || notice.status !== 'published') notFound();

  await bumpNoticeView(id);

  const [settings, categories] = await Promise.all([
    getBoardSettings('notices'),
    listBoardCategories('notices'),
  ]);
  const category = categories.find((c) => c.id === notice.category_id) ?? null;
  const categoryName = category ? (locale === 'ko' ? category.name_ko : category.name_en) : null;

  let authorName: string | null = null;
  if (settings.show_author && notice.author_id) {
    const supabase = await createClient();
    const { data } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', notice.author_id)
      .maybeSingle();
    authorName = data?.display_name ?? null;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-10">
      {/* 브레드크럼 + 목록 */}
      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-1.5 text-sm text-neutral-500">
          <Link href="/" className="hover:text-neutral-800" aria-label={t('home')}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-5H9v5H5a1 1 0 0 1-1-1v-8z" />
            </svg>
          </Link>
          <span className="text-neutral-300">/</span>
          <Link href="/notices" className="hover:text-neutral-800">
            {t('notices')}
          </Link>
        </nav>
        <Link
          href="/notices"
          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:border-neutral-400"
        >
          {t('boardList')}
        </Link>
      </div>

      {/* 제목 영역 */}
      <div className="flex flex-col gap-3 border-b border-neutral-200 pb-6">
        <div className="flex items-center gap-2">
          {notice.is_pinned && (
            <span className="rounded-md bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
              {t('pinned')}
            </span>
          )}
          {categoryName && (
            <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
              {categoryName}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">{notice.title}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400">
          <span>
            {t('boardPostedAt')} {notice.created_at.slice(0, 10)}
          </span>
          {settings.show_view_count && (
            <span>
              {t('boardViews')} {notice.view_count.toLocaleString()}
            </span>
          )}
          {authorName && (
            <span>
              {t('boardAuthor')} {authorName}
            </span>
          )}
        </div>
      </div>

      <SafeHtml html={notice.body} />
      <BoardAttachments ownerType="notice" ownerId={notice.id} />
    </main>
  );
}
