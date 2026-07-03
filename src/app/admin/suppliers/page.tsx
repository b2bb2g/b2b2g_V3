// 관리자 공급사 승인 큐(profiles.status pending → approved/rejected).
import { getTranslations } from 'next-intl/server';
import { listPendingSuppliers } from '@/lib/admin/queries';
import { approveSupplier, rejectSupplier } from '@/lib/admin/actions';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmButton } from '@/components/ui/ConfirmButton';

export default async function AdminSuppliersPage() {
  const t = await getTranslations('admin');
  const suppliers = await listPendingSuppliers();

  return (
    <>
      <h1 className="text-2xl font-bold">{t('pendingSuppliers')}</h1>

      {suppliers.length === 0 ? (
        <EmptyState message={t('queueEmpty')} />
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white shadow-sm">
          {suppliers.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="flex flex-col">
                <span className="font-medium">{s.companyName ?? s.display_name}</span>
                <span className="text-xs text-neutral-500">
                  {s.email} · {s.created_at.slice(0, 10)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <form action={approveSupplier.bind(null, s.id)}>
                  <button type="submit" className="font-medium text-emerald-700 underline">
                    {t('approve')}
                  </button>
                </form>
                <ConfirmButton
                  action={rejectSupplier.bind(null, s.id)}
                  title={t('rejectConfirmTitle')}
                  description={t('rejectConfirmBody')}
                  confirmLabel={t('reject')}
                  variant="danger"
                >
                  {t('reject')}
                </ConfirmButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
