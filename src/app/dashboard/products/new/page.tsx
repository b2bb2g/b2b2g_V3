// 제품 등록(초안) 페이지.
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getMySupplier, listActiveCategories } from '@/lib/supplier/queries';
import { createProduct } from '@/lib/supplier/actions';
import { ProductForm } from '../ProductForm';

export default async function NewProductPage() {
  const t = await getTranslations('supplier');

  const supplier = await getMySupplier();
  if (!supplier) {
    redirect('/dashboard/company');
  }

  const categories = await listActiveCategories();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold">{t('productFormNew')}</h1>
      <ProductForm categories={categories} action={createProduct} />
    </main>
  );
}
