// 공지사항 공개 목록(게시판 UI: 번호·제목·작성일, 공지 고정 상단). 관리자 작성, 누구나 열람.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { listPublishedNoticesBoard } from '@/lib/content/queries';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageShell } from '@/components/ui/PageShell';
import { PageHeader } from '@/components/ui/PageHeader';

export default async function NoticesPage() {
  const t = await getTranslations('content');
  const notices = await listPublishedNoticesBoard();

  // 고정(공지)과 일반을 분리 — 일반은 최신이 큰 번호가 되도록 내림차순 번호 부여.
  const pinned = notices.filter((n) => n.is_pinned);
  const normal = notices.filter((n) => !n.is_pinned);

  return (
    <PageShell>
      <PageHeader title={t('notices')} />
      {notices.length === 0 ? (
        <EmptyState message={t('noticesEmpty')} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="hidden w-20 px-4 py-3 text-center font-medium sm:table-cell">
                  {t('boardNo')}
                </th>
                <th className="px-4 py-3 text-left font-medium">{t('boardTitle')}</th>
                <th className="w-28 px-4 py-3 text-right font-medium sm:text-center">
                  {t('boardDate')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {[...pinned, ...normal].map((n, i) => {
                const isPinned = n.is_pinned;
                const number = normal.length - (i - pinned.length);
                const isNew = n.isNew;
                return (
                  <tr key={n.id} className={isPinned ? 'bg-blue-50/40' : 'hover:bg-neutral-50'}>
                    <td className="hidden px-4 py-3.5 text-center align-middle sm:table-cell">
                      {isPinned ? (
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
                        {isPinned && (
                          <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-medium text-white sm:hidden">
                            {t('pinned')}
                          </span>
                        )}
                        <span className="line-clamp-1">{n.title}</span>
                        {isNew && (
                          <span className="shrink-0 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            {t('boardNew')}
                          </span>
                        )}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 text-right align-middle text-xs text-neutral-400 sm:text-center">
                      {n.created_at.slice(0, 10)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
