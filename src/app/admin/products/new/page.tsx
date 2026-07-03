// 관리자 제품 작성. 대상 공급사를 지정해 제품을 생성(관리자는 모든 글 작성 가능).
import { getTranslations } from 'next-intl/server';
import { listActiveCategories } from '@/lib/supplier/queries';
import { listSuppliersForPicker, adminCreateProduct } from '@/lib/admin/product-actions';
import { ProductForm } from '@/app/dashboard/products/ProductForm';

export default async function AdminNewProductPage() {
  const t = await getTranslations('supplier');
  const [categories, suppliers] = await Promise.all([
    listActiveCategories(),
    listSuppliersForPicker(),
  ]);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold">{t('productFormNew')}</h1>
      <ProductForm categories={categories} action={adminCreateProduct} suppliers={suppliers} />
    </main>
  );
}
