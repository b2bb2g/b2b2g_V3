// 이벤트/행사 공개 목록. 관리자 작성, 누구나 열람.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { listPublishedEvents } from '@/lib/events/queries';
import { CATEGORY_KEY, formatPeriod } from '@/lib/events/labels';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function EventsPage() {
  const t = await getTranslations('events');
  const events = await listPublishedEvents();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      {events.length === 0 ? (
        <EmptyState message={t('empty')} />
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {events.map((e) => (
            <li key={e.id}>
              <Link
                href={`/events/${e.id}`}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-neutral-50"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{e.name}</span>
                  <span className="text-xs text-neutral-500">
                    {t(CATEGORY_KEY[e.category])}
                    {e.location ? ` · ${e.location}` : ''}
                  </span>
                </div>
                <span className="text-xs text-neutral-400">
                  {formatPeriod(e.starts_at, e.ends_at)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
