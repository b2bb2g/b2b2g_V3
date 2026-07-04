// 공지사항 게시판(카테고리 탭·실시간 검색·기간필터·번호/제목/첨부/날짜/조회수 테이블·페이지네이션).
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import {
  listNoticeBoard,
  listBoardCategories,
  getBoardSettings,
  type NoticeBoardRow,
} from '@/lib/content/queries';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageShell } from '@/components/ui/PageShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/admin/Pagination';
import { NoticeSearch } from './NoticeSearch';

function Clip() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M8 12l6-6a3 3 0 0 1 4 4l-8 8a5 5 0 0 1-7-7l8-8" />
    </svg>
  );
}

export default async function NoticesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; period?: string; page?: string }>;
}) {
  const t = await getTranslations('content');
  const locale = await getLocale();
  const sp = await searchParams;
  const category = sp.category ?? '';
  const q = sp.q ?? '';
  const period = sp.period ?? '';

  const [{ rows, total, page, pageSize }, categories, settings] = await Promise.all([
    listNoticeBoard({ category, q, period, page: Number(sp.page) || 1 }),
    listBoardCategories('notices'),
    getBoardSettings('notices'),
  ]);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    isAdmin = data?.role === 'admin';
  }

  const catName = (c: NoticeBoardRow['category']) =>
    c ? (locale === 'ko' ? c.name_ko : c.name_en) : '';
  const tabHref = (id: string) => {
    const p = new URLSearchParams();
    if (id) p.set('category', id);
    if (q) p.set('q', q);
    if (period) p.set('period', period);
    const s = p.toString();
    return s ? `/notices?${s}` : '/notices';
  };

  const tabs = [{ id: '', label: t('categoryAll') }].concat(
    categories.map((c) => ({ id: c.id, label: locale === 'ko' ? c.name_ko : c.name_en })),
  );

  return (
    <PageShell>
      <PageHeader title={t('notices')} />

      {/* 카테고리 탭 */}
      <div className="flex flex-wrap gap-1 border-b border-neutral-200">
        {tabs.map((tab) => {
          const active = tab.id === category;
          return (
            <Link
              key={tab.id || 'all'}
              href={tabHref(tab.id)}
              className={`-mb-px border-b-2 px-3 py-2 text-sm ${
                active
                  ? 'border-blue-600 font-medium text-blue-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* 검색 + 기간 + 글쓰기 */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-56 flex-1">
          <NoticeSearch category={category} currentQ={q} currentPeriod={period} />
        </div>
        {isAdmin && (
          <Link
            href="/admin/notices/new"
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {t('boardWrite')}
          </Link>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyState message={t('noticesEmpty')} />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-neutral-200">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="hidden w-20 px-4 py-3 text-center font-medium sm:table-cell">
                    {t('boardNo')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium">{t('boardTitle')}</th>
                  <th className="hidden w-16 px-4 py-3 text-center font-medium sm:table-cell">
                    {t('boardAttach')}
                  </th>
                  <th className="w-28 px-4 py-3 text-right font-medium sm:text-center">
                    {t('boardDate')}
                  </th>
                  {settings.show_view_count && (
                    <th className="hidden w-20 px-4 py-3 text-right font-medium sm:table-cell">
                      {t('boardViews')}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {rows.map((n, i) => {
                  const number = total - ((page - 1) * pageSize + i);
                  return (
                    <tr key={n.id} className={n.is_pinned ? 'bg-blue-50/40' : 'hover:bg-neutral-50'}>
                      <td className="hidden px-4 py-3.5 text-center align-middle sm:table-cell">
                        {n.is_pinned ? (
                          <span className="rounded-md bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                            {t('pinned')}
                          </span>
                        ) : (
                          <span className="tabular-nums text-neutral-400">{number}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <Link
                          href={`/notices/${n.id}`}
                          className="flex items-center gap-2 font-medium text-neutral-800 hover:text-blue-700 hover:underline"
                        >
                          {n.category && (
                            <span className="shrink-0 rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] font-medium text-neutral-500">
                              {catName(n.category)}
                            </span>
                          )}
                          <span className="line-clamp-1">{n.title}</span>
                          {n.hasAttachment && (
                            <span className="shrink-0 sm:hidden">
                              <Clip />
                            </span>
                          )}
                          {n.isNew && (
                            <span className="shrink-0 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                              {t('boardNew')}
                            </span>
                          )}
                        </Link>
                      </td>
                      <td className="hidden px-4 py-3.5 text-center align-middle sm:table-cell">
                        {n.hasAttachment && (
                          <span className="inline-flex">
                            <Clip />
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right align-middle text-xs text-neutral-400 sm:text-center">
                        {n.created_at.slice(0, 10)}
                      </td>
                      {settings.show_view_count && (
                        <td className="hidden px-4 py-3.5 text-right align-middle text-xs tabular-nums text-neutral-400 sm:table-cell">
                          {n.view_count.toLocaleString()}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            total={total}
            pageSize={pageSize}
            basePath="/notices"
            params={{ category: category || undefined, q: q || undefined, period: period || undefined }}
            prevLabel={t('prev')}
            nextLabel={t('next')}
          />
        </>
      )}
    </PageShell>
  );
}
