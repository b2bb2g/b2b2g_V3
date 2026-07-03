'use client';
// 새 비밀번호 설정 폼(복구 세션 상태에서 호출).
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { updatePassword, type ActionResult } from '@/lib/auth/actions';

export function ResetPasswordForm() {
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    updatePassword,
    null,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span>{t('newPassword')}</span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded-md border border-neutral-300 px-3 py-2"
        />
        <span className="text-xs text-neutral-500">{t('passwordHint')}</span>
      </label>

      {state && !state.ok && (
        <p role="alert" className="text-sm text-red-600">
          {t('resetFailed')}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? tc('loading') : t('resetCta')}
      </button>
    </form>
  );
}
