// 공개 제품 목록(6.2/6.4). 비회원도 열람 — 제품명·카테고리·공급사명까지. 가격은 노출 안 함.
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { listPublicProducts, listTopCategories } from '@/lib/products/queries';
import { publicImageUrl } from '@/lib/products/media';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageShell } from '@/components/ui/PageShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProductSearch } from './ProductSearch';

export default async function ProductsListPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const t = await getTranslations('products');
  const { category, q } = await searchParams;
  const [products, categories] = await Promise.all([
    listPublicProducts({ categoryId: category, q }),
    listTopCategories(),
  ]);

  return (
    <PageShell width="wide">
      <PageHeader title={t('listTitle')} />

      <ProductSearch categories={categories} currentQ={q ?? ''} currentCategory={category ?? ''} />

      {products.length === 0 ? (
        <EmptyState
          message={q || category ? t('noResults') : t('empty')}
          action={q || category ? { label: t('resetFilters'), href: '/products' } : undefined}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <li key={p.id}>
              <Link
                href={`/products/${p.id}`}
                className="flex h-full flex-col gap-2 rounded-lg border border-neutral-200 p-3 hover:border-neutral-400"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-md bg-neutral-100">
                  {p.primaryImagePath && (
                    <Image
                      src={publicImageUrl(p.primaryImagePath)}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 300px"
                      className="object-cover"
                    />
                  )}
                </div>
                <span className="font-medium">{p.title}</span>
                <span className="text-xs text-neutral-500">
                  {p.categoryName ? `${p.categoryName} · ` : ''}
                  {p.companyName}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
