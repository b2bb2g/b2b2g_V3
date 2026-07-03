'use client';
// 공급사 응답 폼(관리자에게 전달되는 제안 메시지). 바이어에게 직접 노출되지 않음.
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { respondToRequest, type RequestResult } from '@/lib/requests/actions';
import { FormButton } from '@/components/ui/FormButton';

export function RespondForm({ requestId }: { requestId: string }) {
  const t = useTranslations('requests');
  const action = respondToRequest.bind(null, requestId);
  const [state, formAction] = useActionState<RequestResult | null, FormData>(action, null);

  if (state?.ok) {
    return <p className="text-sm text-emerald-700">{t('respondSent')}</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">{t('respondLabel')}</span>
        <textarea
          name="message"
          rows={4}
          required
          placeholder={t('respondPlaceholder')}
          className="rounded-md border border-neutral-300 px-3 py-2"
        />
      </label>
      {state && !state.ok && (
        <p role="alert" className="text-sm text-red-600">
          {t('respondFailed')}
        </p>
      )}
      <FormButton>{t('respondCta')}</FormButton>
    </form>
  );
}
