// 제품 등록(초안) 페이지. group(대분류: Commercial/Industrial) 지정 시 카테고리 고정 — 그룹별 개별 작성.
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getMySupplier, listActiveCategories } from '@/lib/supplier/queries';
import { createProduct } from '@/lib/supplier/actions';
import { ProductForm } from '../ProductForm';

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>;
}) {
  const t = await getTranslations('supplier');
  const { group } = await searchParams;

  const supplier = await getMySupplier();
  if (!supplier) {
    redirect('/dashboard/company');
  }

  const categories = await listActiveCategories();
  const lockedCategory = group ? categories.find((c) => c.id === group) : undefined;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold">
        {lockedCategory ? t('newProductIn', { category: lockedCategory.name }) : t('productFormNew')}
      </h1>
      <ProductForm categories={categories} action={createProduct} lockedCategory={lockedCategory} />
    </main>
  );
}
