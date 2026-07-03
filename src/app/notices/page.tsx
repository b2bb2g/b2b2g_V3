// 공지사항 공개 목록(고정 우선). 관리자 작성, 누구나 열람.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { listPublishedNotices } from '@/lib/content/queries';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function NoticesPage() {
  const t = await getTranslations('content');
  const notices = await listPublishedNotices();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-bold">{t('notices')}</h1>
      {notices.length === 0 ? (
        <EmptyState message={t('noticesEmpty')} />
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {notices.map((n) => (
            <li key={n.id}>
              <Link
                href={`/notices/${n.id}`}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-neutral-50"
              >
                <span className="font-medium">
                  {n.is_pinned && (
                    <span className="mr-2 rounded bg-neutral-900 px-1.5 py-0.5 text-xs text-white">
                      {t('pinned')}
                    </span>
                  )}
                  {n.title}
                </span>
                <span className="text-xs text-neutral-400">{n.created_at.slice(0, 10)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
