// 내 제품 목록. 상태 표시 + 초안/반려는 검토 요청, 노출 전은 수정 가능.
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getMySupplier, listMyProducts } from '@/lib/supplier/queries';
import { submitProductForReview } from '@/lib/supplier/actions';
import type { ProductStatus } from '@/lib/supabase/database.types';
import { EmptyState } from '@/components/ui/EmptyState';

const STATUS_KEY: Record<ProductStatus, string> = {
  draft: 'statusDraft',
  pending: 'statusPending',
  listed: 'statusListed',
  rejected: 'statusRejected',
};

export default async function ProductsPage() {
  const t = await getTranslations('supplier');

  // 회사정보 없으면 온보딩 먼저.
  const supplier = await getMySupplier();
  if (!supplier) {
    redirect('/dashboard/company');
  }

  const products = await listMyProducts();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('productsTitle')}</h1>
        <Link
          href="/dashboard/products/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          {t('newProduct')}
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyState
          message={t('productsEmpty')}
          action={{ label: t('newProduct'), href: '/dashboard/products/new' }}
        />
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {products.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="flex flex-col">
                <span className="font-medium">{p.title}</span>
                <span className="text-xs text-neutral-500">{t(STATUS_KEY[p.status])}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                {p.status !== 'listed' && (
                  <Link href={`/dashboard/products/${p.id}/edit`} className="underline">
                    {t('editProduct')}
                  </Link>
                )}
                {(p.status === 'draft' || p.status === 'rejected') && (
                  <form action={submitProductForReview.bind(null, p.id)}>
                    <button type="submit" className="font-medium text-neutral-900 underline">
                      {t('submitForReview')}
                    </button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
