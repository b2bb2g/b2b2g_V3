'use client';
// 문의·견적 작성 폼(제품 상세, 회원 전용). 제출 후 내 문의 목록으로 이동.
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { createInquiry, type ActionResult } from '@/lib/inquiry/actions';
import { FormButton } from '@/components/ui/FormButton';

export function InquiryForm({ productId }: { productId: string }) {
  const t = useTranslations('inquiry');
  const action = createInquiry.bind(null, productId);
  const [state, formAction] = useActionState<ActionResult | null, FormData>(action, null);

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-3 border-t border-neutral-200 pt-4">
      <p className="text-sm font-medium">{t('title')}</p>

      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="radio" name="type" value="inquiry" defaultChecked />
          {t('typeInquiry')}
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="type" value="quote" />
          {t('typeQuote')}
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span>{t('contentLabel')}</span>
        <textarea
          name="content"
          required
          rows={4}
          maxLength={5000}
          placeholder={t('contentPlaceholder')}
          className="rounded-md border border-neutral-300 px-3 py-2"
        />
      </label>

      {state && !state.ok && (
        <p role="alert" className="text-sm text-red-600">
          {t('sendFailed')}
        </p>
      )}

      <FormButton>{t('send')}</FormButton>
    </form>
  );
}
