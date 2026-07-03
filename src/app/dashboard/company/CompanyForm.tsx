'use client';
// 공급사 회사정보 폼(생성/수정). 저장 성공 시 제품 목록으로 이동.
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { saveCompanyProfile, type ActionResult } from '@/lib/supplier/actions';
import { FormButton } from '@/components/ui/FormButton';

export function CompanyForm({ defaultName }: { defaultName?: string }) {
  const t = useTranslations('supplier');
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    saveCompanyProfile,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span>{t('companyName')}</span>
        <input
          type="text"
          name="companyName"
          required
          maxLength={200}
          defaultValue={defaultName}
          className="rounded-md border border-neutral-300 px-3 py-2"
        />
      </label>

      {state && !state.ok && (
        <p role="alert" className="text-sm text-red-600">
          {t('saveFailed')}
        </p>
      )}

      <FormButton>{t('companyTitle')}</FormButton>
    </form>
  );
}
