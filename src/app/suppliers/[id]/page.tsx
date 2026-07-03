// 공급사 미니홈(공개). 회사명·인증배지 + 해당 공급사의 노출(listed) 제품 목록.
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getPublicSupplier, listPublicProducts } from '@/lib/products/queries';
import { publicImageUrl } from '@/lib/products/media';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function SupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('products');
  const { id } = await params;

  const supplier = await getPublicSupplier(id);
  if (!supplier) notFound();

  const products = await listPublicProducts({ supplierId: id });

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-6 py-16">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold">{supplier.companyName}</h1>
        {supplier.verified && (
          <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">
            {t('verifiedBadge')}
          </span>
        )}
      </div>

      {products.length === 0 ? (
        <EmptyState message={t('empty')} />
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
                <span className="text-xs text-neutral-500">{p.categoryName}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
