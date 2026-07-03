// 제품 수정 페이지. updateProduct 를 제품 id 로 bind 해 폼에 전달.
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getMyProduct, getMySupplier, listActiveCategories } from '@/lib/supplier/queries';
import { updateProduct } from '@/lib/supplier/actions';
import { ProductForm } from '../../ProductForm';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('supplier');
  const { id } = await params;

  const supplier = await getMySupplier();
  if (!supplier) {
    redirect('/dashboard/company');
  }

  const product = await getMyProduct(id);
  // RLS 로 본인 제품만 조회되므로 없으면 접근 불가/미존재.
  if (!product) {
    notFound();
  }

  const categories = await listActiveCategories();
  const boundUpdate = updateProduct.bind(null, id);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold">{t('editProduct')}</h1>
      <ProductForm categories={categories} product={product} action={boundUpdate} />
    </main>
  );
}
