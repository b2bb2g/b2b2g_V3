// 관리자 제품 관리. 섹션(대분류)별로 나눠 전 상태(대기·공개·초안·반려) 제품을 승인/반려/비공개 처리.
import { getTranslations } from 'next-intl/server';
import { listAdminProducts, type AdminProduct } from '@/lib/admin/queries';
import { listTopCategories } from '@/lib/products/queries';
import { approveProduct, rejectProduct, unlistProduct } from '@/lib/admin/actions';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageShell } from '@/components/ui/PageShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { ConfirmButton } from '@/components/ui/ConfirmButton';

const STATUS_KEY = {
  draft: 'statusDraft',
  pending: 'statusPending',
  listed: 'statusListed',
  rejected: 'statusRejected',
} as const;

const STATUS_STYLE: Record<string, string> = {
  draft: 'bg-neutral-100 text-neutral-600',
  pending: 'bg-amber-100 text-amber-800',
  listed: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-700',
};

export default async function AdminProductsPage() {
  const t = await getTranslations('admin');
  const ts = await getTranslations('supplier');
  const [products, sections] = await Promise.all([listAdminProducts(), listTopCategories()]);

  // 섹션 순서대로 버킷 + 미분류.
  const buckets: { id: string | null; name: string; items: AdminProduct[] }[] = [
    ...sections.map((s) => ({
      id: s.id,
      name: s.name,
      items: products.filter((p) => p.sectionId === s.id),
    })),
    { id: null, name: t('uncategorized'), items: products.filter((p) => p.sectionId === null) },
  ].filter((b) => b.items.length > 0);

  return (
    <PageShell width="wide">
      <PageHeader title={t('manageProducts')} description={t('manageProductsIntro')} />

      {products.length === 0 ? (
        <EmptyState message={t('queueEmpty')} />
      ) : (
        buckets.map((b) => (
          <section key={b.id ?? 'none'} className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-neutral-500">
              {b.name} <span className="text-neutral-400">({b.items.length})</span>
            </h2>
            <ul className="flex flex-col divide-y divide-neutral-200 rounded-xl border border-neutral-200">
              {b.items.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLE[p.status]}`}>
                        {ts(STATUS_KEY[p.status])}
                      </span>
                      <span className="font-medium">{p.title}</span>
                    </div>
                    <span className="text-xs text-neutral-500">
                      {p.companyName} · {p.created_at.slice(0, 10)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    {(p.status === 'pending' ||
                      p.status === 'draft' ||
                      p.status === 'rejected') && (
                      <form action={approveProduct.bind(null, p.id)}>
                        <button type="submit" className="font-medium text-emerald-700 underline">
                          {p.status === 'pending' ? t('approve') : t('publish')}
                        </button>
                      </form>
                    )}
                    {p.status === 'pending' && (
                      <ConfirmButton
                        action={rejectProduct.bind(null, p.id)}
                        title={t('rejectConfirmTitle')}
                        description={t('rejectConfirmBody')}
                        confirmLabel={t('reject')}
                        variant="danger"
                      >
                        {t('reject')}
                      </ConfirmButton>
                    )}
                    {p.status === 'listed' && (
                      <ConfirmButton
                        action={unlistProduct.bind(null, p.id)}
                        title={t('unlistConfirm')}
                        confirmLabel={t('unlist')}
                        variant="danger"
                      >
                        {t('unlist')}
                      </ConfirmButton>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </PageShell>
  );
}
