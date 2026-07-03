'use client';
// 바이어/에이전트 제품요청글 작성 폼. 제출 후 관리자 승인 대기(submitted).
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { createRequest, type RequestResult } from '@/lib/requests/actions';
import { FormButton } from '@/components/ui/FormButton';
import { RichTextEditor } from '@/components/RichTextEditor';

const input = 'rounded-md border border-neutral-300 px-3 py-2';

export function RequestForm({ categories }: { categories: { id: string; name: string }[] }) {
  const t = useTranslations('requests');
  const [state, formAction] = useActionState<RequestResult | null, FormData>(createRequest, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span>{t('fieldTitle')}</span>
        <input type="text" name="title" required className={input} />
      </label>

      <div className="flex flex-col gap-1 text-sm">
        <span>{t('fieldBody')}</span>
        <RichTextEditor name="body" />
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span>{t('fieldCategory')}</span>
        <select name="category_id" defaultValue="" className={input}>
          <option value="">{t('categoryAny')}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-3 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('fieldTargetCountry')}</span>
          <input type="text" name="target_country" className={input} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('fieldBudget')}</span>
          <input type="number" name="budget" step="any" className={input} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('fieldQty')}</span>
          <input type="number" name="qty" step="any" className={input} />
        </label>
      </div>

      {state && !state.ok && (
        <p role="alert" className="text-sm text-red-600">
          {t('createFailed')}
        </p>
      )}
      <FormButton>{t('submitCta')}</FormButton>
    </form>
  );
}
