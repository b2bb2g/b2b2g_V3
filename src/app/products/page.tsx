// 공개 제품 목록(6.2/6.4). 비회원도 열람 — 제품명·카테고리·공급사명까지. 가격은 노출 안 함.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { listPublicProducts } from '@/lib/products/queries';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function ProductsListPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const t = await getTranslations('products');
  const { category } = await searchParams;
  const products = await listPublicProducts(category);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-bold">{t('listTitle')}</h1>

      {products.length === 0 ? (
        <EmptyState message={t('empty')} />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <li key={p.id}>
              <Link
                href={`/products/${p.id}`}
                className="flex h-full flex-col gap-2 rounded-lg border border-neutral-200 p-5 hover:border-neutral-400"
              >
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
    </main>
  );
}
