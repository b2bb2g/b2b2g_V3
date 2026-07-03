'use client';
// 제품 이미지 관리(업로드·대표지정·삭제). 업로드는 브라우저→Storage, 메타는 서버 액션.
import { useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { PRODUCT_MEDIA_BUCKET, publicImageUrl } from '@/lib/products/media';
import { addProductImage, deleteProductImage, setPrimaryImage } from '@/lib/supplier/media-actions';

const MAX_BYTES = 5 * 1024 * 1024;

type MediaItem = { id: string; url: string; is_primary: boolean };

export function ProductImages({
  productId,
  userId,
  images,
}: {
  productId: string;
  userId: string;
  images: MediaItem[];
}) {
  const t = useTranslations('supplier');
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError(null);
    if (!file.type.startsWith('image/')) return setError(t('imageTypeError'));
    if (file.size > MAX_BYTES) return setError(t('imageSizeError'));

    setUploading(true);
    try {
      const supabase = createClient();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${userId}/${productId}/${crypto.randomUUID()}-${safeName}`;
      const { error: upErr } = await supabase.storage
        .from(PRODUCT_MEDIA_BUCKET)
        .upload(path, file, { contentType: file.type });
      if (upErr) return setError(t('uploadFailed'));
      await addProductImage(productId, path);
      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-neutral-500">{t('imagesTitle')}</h2>

      {images.length === 0 ? (
        <p className="text-sm text-neutral-500">{t('noImages')}</p>
      ) : (
        <ul className="flex flex-wrap gap-3">
          {images.map((img) => (
            <li key={img.id} className="flex flex-col items-center gap-1">
              <div className="relative h-24 w-24 overflow-hidden rounded-md border border-neutral-200">
                <Image
                  src={publicImageUrl(img.url)}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                />
                {img.is_primary && (
                  <span className="absolute left-0 top-0 bg-neutral-900 px-1 text-[10px] text-white">
                    {t('primaryBadge')}
                  </span>
                )}
              </div>
              <div className="flex gap-2 text-xs">
                {!img.is_primary && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await setPrimaryImage(img.id, productId);
                        router.refresh();
                      })
                    }
                    className="underline"
                  >
                    {t('setPrimary')}
                  </button>
                )}
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await deleteProductImage(img.id, productId);
                      router.refresh();
                    })
                  }
                  className="text-red-600 underline"
                >
                  {t('deleteImage')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-1">
        <label className="inline-flex w-fit cursor-pointer rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium">
          {uploading ? '…' : t('addImage')}
          <input
            type="file"
            accept="image/*"
            onChange={onSelect}
            disabled={uploading}
            className="hidden"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
