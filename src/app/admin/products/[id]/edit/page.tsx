// 관리자 제품 편집(모든 제품). 필드·이미지·인증·첨부까지. RLS(is_admin)로 권한 강제.
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminProduct, adminUpdateProduct } from '@/lib/admin/product-actions';
import { listActiveCategories, getProductMedia } from '@/lib/supplier/queries';
import { getProductCertifications } from '@/lib/products/queries';
import { getAttachments } from '@/lib/attachments/queries';
import { PageShell } from '@/components/ui/PageShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { AttachmentManager } from '@/components/AttachmentManager';
import { ProductForm } from '@/app/dashboard/products/ProductForm';
import { ProductImages } from '@/app/dashboard/products/[id]/edit/ProductImages';
import { Certifications } from '@/app/dashboard/products/[id]/edit/Certifications';

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations('admin');
  const { id } = await params;
  const product = await getAdminProduct(id);
  if (!product) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const [categories, media, certifications, attachments] = await Promise.all([
    listActiveCategories(),
    getProductMedia(id),
    getProductCertifications(id),
    getAttachments('product', id),
  ]);
  const boundUpdate = adminUpdateProduct.bind(null, id);

  return (
    <PageShell width="base">
      <PageHeader title={t('editProduct')} description={product.title} />

      {user && <ProductImages productId={id} userId={user.id} images={media} />}
      <ProductForm categories={categories} product={product} action={boundUpdate} />
      <Certifications productId={id} items={certifications} />
      {user && (
        <AttachmentManager
          ownerType="product"
          ownerId={id}
          userId={user.id}
          attachments={attachments}
        />
      )}
    </PageShell>
  );
}
