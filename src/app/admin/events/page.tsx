// 관리자 이벤트 목록(전체) + 작성/수정/삭제.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { listAllEvents } from '@/lib/events/queries';
import { deleteEvent } from '@/lib/events/actions';
import { CATEGORY_KEY, formatPeriod } from '@/lib/events/labels';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmButton } from '@/components/ui/ConfirmButton';

export default async function AdminEventsPage() {
  const t = await getTranslations('events');
  const events = await listAllEvents();

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('manage')}</h1>
        <Link
          href="/admin/events/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          {t('new')}
        </Link>
      </div>

      {events.length === 0 ? (
        <EmptyState message={t('empty')} />
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white shadow-sm">
          {events.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex flex-col">
                <span className="font-medium">{e.name}</span>
                <span className="text-xs text-neutral-500">
                  {t(CATEGORY_KEY[e.category])} ·{' '}
                  {t(e.status === 'published' ? 'statusPublished' : 'statusDraft')}
                  {formatPeriod(e.starts_at, e.ends_at)
                    ? ` · ${formatPeriod(e.starts_at, e.ends_at)}`
                    : ''}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Link href={`/admin/events/${e.id}/edit`} className="underline">
                  {t('edit')}
                </Link>
                <ConfirmButton
                  action={deleteEvent.bind(null, e.id)}
                  title={t('deleteConfirm')}
                  confirmLabel={t('delete')}
                  variant="danger"
                >
                  {t('delete')}
                </ConfirmButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
