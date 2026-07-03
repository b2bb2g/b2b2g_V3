'use client';
// 새 비밀번호 설정 폼(복구 세션 상태에서 호출).
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { updatePassword, type ActionResult } from '@/lib/auth/actions';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { FormButton } from '@/components/ui/FormButton';

export function ResetPasswordForm() {
  const t = useTranslations('auth');
  const [state, formAction] = useActionState<ActionResult | null, FormData>(updatePassword, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span>{t('newPassword')}</span>
        <PasswordInput
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          hint={t('passwordHint')}
        />
      </label>

      {state && !state.ok && (
        <p role="alert" className="text-sm text-red-600">
          {t('resetFailed')}
        </p>
      )}

      <FormButton>{t('resetCta')}</FormButton>
    </form>
  );
}
