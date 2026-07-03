// 제품 수정 페이지. updateProduct 를 제품 id 로 bind 해 폼에 전달.
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import {
  getMyProduct,
  getMySupplier,
  getProductMedia,
  listActiveCategories,
} from '@/lib/supplier/queries';
import { updateProduct } from '@/lib/supplier/actions';
import { getAttachments } from '@/lib/attachments/queries';
import { ProductForm } from '../../ProductForm';
import { ProductImages } from './ProductImages';
import { AttachmentManager } from '@/components/AttachmentManager';

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

  const [categories, media, attachments] = await Promise.all([
    listActiveCategories(),
    getProductMedia(id),
    getAttachments('product', id),
  ]);
  const boundUpdate = updateProduct.bind(null, id);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-16">
      <h1 className="text-2xl font-bold">{t('editProduct')}</h1>
      <ProductImages productId={id} userId={supplier.profile_id} images={media} />
      <ProductForm categories={categories} product={product} action={boundUpdate} />
      <AttachmentManager
        ownerType="product"
        ownerId={id}
        userId={supplier.profile_id}
        attachments={attachments}
      />
    </main>
  );
}
