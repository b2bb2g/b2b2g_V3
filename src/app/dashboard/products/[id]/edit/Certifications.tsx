'use client';
// 제품 인증/수상 관리(입력·삭제). 서버 액션 + RLS(소유 공급사)로 권한 강제.
import { useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { addCertification, deleteCertification } from '@/lib/supplier/actions';
import type { ProductCertificationRow } from '@/lib/supabase/database.types';

export function Certifications({
  productId,
  items,
}: {
  productId: string;
  items: ProductCertificationRow[];
}) {
  const t = useTranslations('supplier');
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  async function onAdd(formData: FormData) {
    await addCertification(productId, formData);
    formRef.current?.reset();
    router.refresh();
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-neutral-500">{t('certTitle')}</h2>

      {items.length > 0 && (
        <ul className="flex flex-col divide-y divide-neutral-200 rounded-md border border-neutral-200">
          {items.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
              <span>
                <span className="mr-2 text-xs text-neutral-400">{t(`certType_${c.type}`)}</span>
                {c.name}
              </span>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await deleteCertification(c.id, productId);
                    router.refresh();
                  })
                }
                className="text-xs text-red-600 underline"
              >
                {t('certDelete')}
              </button>
            </li>
          ))}
        </ul>
      )}

      <form ref={formRef} action={onAdd} className="flex flex-wrap items-end gap-2 text-sm">
        <select name="type" className="rounded-md border border-neutral-300 px-3 py-2">
          <option value="certification">{t('certType_certification')}</option>
          <option value="award">{t('certType_award')}</option>
        </select>
        <input
          type="text"
          name="name"
          required
          placeholder={t('certNamePlaceholder')}
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-neutral-300 px-3 py-2 font-medium"
        >
          {t('certAdd')}
        </button>
      </form>
    </section>
  );
}
