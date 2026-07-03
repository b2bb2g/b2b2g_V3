// 관리자 제품 작성. 섹션(Commercial/Industrial) 지정 시 카테고리 고정, 하위 있으면 하위 선택. 공급사 지정.
import { getTranslations } from 'next-intl/server';
import { listActiveCategories } from '@/lib/supplier/queries';
import { listChildCategories } from '@/lib/products/queries';
import { listSuppliersForPicker, adminCreateProduct } from '@/lib/admin/product-actions';
import { ProductForm } from '@/app/dashboard/products/ProductForm';

export default async function AdminNewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>;
}) {
  const t = await getTranslations('supplier');
  const { group } = await searchParams;
  const [categories, suppliers] = await Promise.all([
    listActiveCategories(),
    listSuppliersForPicker(),
  ]);
  const lockedCategory = group ? categories.find((c) => c.id === group) : undefined;
  const subCategories = lockedCategory ? await listChildCategories(lockedCategory.id) : [];

  return (
    <>
      <h1 className="text-2xl font-bold">
        {lockedCategory ? t('newProductIn', { category: lockedCategory.name }) : t('productFormNew')}
      </h1>
      <ProductForm
        categories={categories}
        action={adminCreateProduct}
        suppliers={suppliers}
        lockedCategory={lockedCategory}
        subCategories={subCategories}
      />
    </>
  );
}
