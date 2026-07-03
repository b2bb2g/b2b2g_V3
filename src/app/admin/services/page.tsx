// 관리자 서비스 목록(전체) + 작성/수정/삭제.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { listAllServices } from '@/lib/services/queries';
import { deleteService } from '@/lib/services/actions';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmButton } from '@/components/ui/ConfirmButton';

export default async function AdminServicesPage() {
  const t = await getTranslations('services');
  const services = await listAllServices();

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('manage')}</h1>
        <Link
          href="/admin/services/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          {t('new')}
        </Link>
      </div>

      {services.length === 0 ? (
        <EmptyState message={t('empty')} />
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white shadow-sm">
          {services.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex flex-col">
                <span className="font-medium">{s.title}</span>
                <span className="text-xs text-neutral-500">
                  {t(s.status === 'published' ? 'statusPublished' : 'statusDraft')}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Link href={`/admin/services/${s.id}/edit`} className="underline">
                  {t('edit')}
                </Link>
                <ConfirmButton
                  action={deleteService.bind(null, s.id)}
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
