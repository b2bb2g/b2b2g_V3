'use client';
// 공급사 회신 폼. RLS·트리거가 소유·상태를 처리한다.
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { replyToInquiry, type ReplyResult } from '@/lib/supplier/inquiry-actions';
import { FormButton } from '@/components/ui/FormButton';

export function SupplierReplyForm({ inquiryId }: { inquiryId: string }) {
  const t = useTranslations('supplier');
  const action = replyToInquiry.bind(null, inquiryId);
  const [state, formAction] = useActionState<ReplyResult | null, FormData>(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-3 border-t border-neutral-200 pt-4">
      <label className="flex flex-col gap-1 text-sm">
        <span>{t('reply')}</span>
        <textarea
          name="body"
          required
          rows={3}
          placeholder={t('replyPlaceholder')}
          className="rounded-md border border-neutral-300 px-3 py-2"
        />
      </label>
      {state && !state.ok && (
        <p role="alert" className="text-sm text-red-600">
          {t('replyFailed')}
        </p>
      )}
      <FormButton>{t('reply')}</FormButton>
    </form>
  );
}
