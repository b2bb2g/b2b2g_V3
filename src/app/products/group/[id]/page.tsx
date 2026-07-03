// 대분류(Commercial/Industrial 등) 섹션 제품 목록. 상위 섹션별 독립 페이지. 하위 카테고리는 필터칩(향후).
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  getCategory,
  listChildCategories,
  listPublicProducts,
} from '@/lib/products/queries';
import { publicImageUrl } from '@/lib/products/media';
import { getTranslations } from 'next-intl/server';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageShell } from '@/components/ui/PageShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProductSearch } from '@/app/products/ProductSearch';

export default async function ProductGroupPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const t = await getTranslations('products');
  const { id } = await params;
  const { category, q } = await searchParams;

  const group = await getCategory(id);
  if (!group) notFound();

  const children = await listChildCategories(id);
  // 선택된 하위 카테고리가 있으면 그것만, 없으면 그룹 전체(그룹 + 하위).
  const groupIds = [id, ...children.map((c) => c.id)];
  const products = await listPublicProducts(
    category ? { categoryId: category, q } : { categoryIds: groupIds, q },
  );

  return (
    <PageShell width="wide">
      <PageHeader title={group.name} />

      <ProductSearch
        categories={children}
        currentQ={q ?? ''}
        currentCategory={category ?? ''}
        basePath={`/products/group/${id}`}
      />

      {products.length === 0 ? (
        <EmptyState message={q || category ? t('noResults') : t('empty')} />
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
