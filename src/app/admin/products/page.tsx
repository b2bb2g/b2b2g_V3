// 관리자 제품 노출 승인 큐(pending → listed/rejected). 각 제품의 섹션(대분류) 표시.
import { getTranslations } from 'next-intl/server';
import { listPendingProducts } from '@/lib/admin/queries';
import { approveProduct, rejectProduct } from '@/lib/admin/actions';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageShell } from '@/components/ui/PageShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { ConfirmButton } from '@/components/ui/ConfirmButton';

export default async function AdminProductsPage() {
  const t = await getTranslations('admin');
  const products = await listPendingProducts();

  return (
    <PageShell>
      <PageHeader title={t('pendingProducts')} />

      {products.length === 0 ? (
        <EmptyState message={t('queueEmpty')} />
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 rounded-xl border border-neutral-200">
          {products.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  {p.sectionName && (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                      {p.sectionName}
                    </span>
                  )}
                  <span className="font-medium">{p.title}</span>
                </div>
                <span className="text-xs text-neutral-500">
                  {p.companyName} · {p.created_at.slice(0, 10)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <form action={approveProduct.bind(null, p.id)}>
                  <button type="submit" className="font-medium text-emerald-700 underline">
                    {t('approve')}
                  </button>
                </form>
                <ConfirmButton
                  action={rejectProduct.bind(null, p.id)}
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
    </PageShell>
  );
}
