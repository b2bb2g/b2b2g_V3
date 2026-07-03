// 관리자 팝업 목록 + 작성/수정/삭제.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { listAllPopups } from '@/lib/marketing/queries';
import { deletePopup } from '@/lib/marketing/actions';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmButton } from '@/components/ui/ConfirmButton';

export default async function AdminPopupsPage() {
  const t = await getTranslations('marketing');
  const popups = await listAllPopups();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('popups')}</h1>
        <Link href="/admin/popups/new" className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white">
          {t('newPopup')}
        </Link>
      </div>

      {popups.length === 0 ? (
        <EmptyState message={t('noPopups')} />
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {popups.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex flex-col">
                <span className="font-medium">{p.title}</span>
                <span className="text-xs text-neutral-500">
                  {t(`target_${p.target}`)} · {p.is_active ? t('on') : t('off')} · {t('priority')}{' '}
                  {p.priority}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Link href={`/admin/popups/${p.id}/edit`} className="underline">
                  {t('edit')}
                </Link>
                <ConfirmButton
                  action={deletePopup.bind(null, p.id)}
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
