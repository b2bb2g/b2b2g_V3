// 관리자 공지 목록(전체) + 새로작성/수정/삭제.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { listAllNotices } from '@/lib/content/queries';
import { deleteNotice } from '@/lib/content/actions';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmButton } from '@/components/ui/ConfirmButton';

export default async function AdminNoticesPage() {
  const t = await getTranslations('content');
  const notices = await listAllNotices();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('manageNotices')}</h1>
        <Link
          href="/admin/notices/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          {t('new')}
        </Link>
      </div>

      {notices.length === 0 ? (
        <EmptyState message={t('noticesEmpty')} />
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {notices.map((n) => (
            <li key={n.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex flex-col">
                <span className="font-medium">{n.title}</span>
                <span className="text-xs text-neutral-500">
                  {t(n.status === 'published' ? 'statusPublished' : 'statusDraft')}
                  {n.is_pinned ? ` · ${t('pinned')}` : ''}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Link href={`/admin/notices/${n.id}/edit`} className="underline">
                  {t('edit')}
                </Link>
                <ConfirmButton
                  action={deleteNotice.bind(null, n.id)}
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
    </main>
  );
}
