// 대분류 섹션(Commercial/Industrial) 제품 목록. EPC/Events 처럼 개별 페이지에서 재사용.
// 하위 카테고리는 향후용 — 있으면 필터칩으로 자동 노출.
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import {
  getTopCategoryBySlug,
  listChildCategories,
  listPublicProducts,
} from '@/lib/products/queries';
import { publicImageUrl } from '@/lib/products/media';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageShell } from '@/components/ui/PageShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProductSearch } from '@/app/products/ProductSearch';

export async function SectionProducts({
  slug,
  basePath,
  selectedChild,
  q,
}: {
  slug: string;
  basePath: string;
  selectedChild?: string;
  q?: string;
}) {
  const t = await getTranslations('products');
  const section = await getTopCategoryBySlug(slug);
  if (!section) notFound();

  const children = await listChildCategories(section.id);
  const groupIds = [section.id, ...children.map((c) => c.id)];
  const products = await listPublicProducts(
    selectedChild ? { categoryId: selectedChild, q } : { categoryIds: groupIds, q },
  );

  return (
    <PageShell width="wide">
      <PageHeader title={section.name} />

      <ProductSearch
        categories={children}
        currentQ={q ?? ''}
        currentCategory={selectedChild ?? ''}
        basePath={basePath}
      />

      {products.length === 0 ? (
        <EmptyState message={q || selectedChild ? t('noResults') : t('empty')} />
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
