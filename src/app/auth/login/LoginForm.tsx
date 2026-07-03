'use client';
// 로그인 폼. 서버 액션(login)을 useActionState 로 호출하고 결과를 인라인 표시한다.
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { login, type ActionResult } from '@/lib/auth/actions';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { FormButton } from '@/components/ui/FormButton';

export function LoginForm() {
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const [state, formAction] = useActionState<ActionResult | null, FormData>(login, null);

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
      <label className="flex flex-col gap-1 text-sm">
        <span>{tc('password')}</span>
        <PasswordInput name="password" autoComplete="current-password" required />
      </label>

      {state && !state.ok && (
        <p role="alert" className="text-sm text-red-600">
          {t('loginFailed')}
        </p>
      )}

      <FormButton>{t('loginCta')}</FormButton>
    </form>
  );
}
