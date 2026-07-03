'use client';
// 비밀번호 재설정 요청 폼. 성공 여부와 무관하게 동일 안내(계정 열거 방지).
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { requestPasswordReset, type ActionResult } from '@/lib/auth/actions';
import { FormButton } from '@/components/ui/FormButton';

export function ForgotPasswordForm() {
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    requestPasswordReset,
    null,
  );

  if (state?.ok) {
    return (
      <p role="status" className="text-sm text-emerald-700">
        {t('forgotSent')}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span>{tc('email')}</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="rounded-md border border-neutral-300 px-3 py-2"
        />
      </label>
      <FormButton>{t('forgotCta')}</FormButton>
    </form>
  );
}
