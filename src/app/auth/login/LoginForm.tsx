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

      <div className="flex items-center justify-between">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-neutral-600">
          <input
            type="checkbox"
            name="remember"
            defaultChecked
            className="h-4 w-4 rounded border-neutral-300"
          />
          <span>{t('keepSignedIn')}</span>
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-neutral-600">
          <span>{t('ipSecurity')}</span>
          <input type="checkbox" name="ipSecurity" className="peer sr-only" />
          <span
            aria-hidden="true"
            className="relative h-6 w-11 rounded-full bg-neutral-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-5"
          />
        </label>
      </div>

      {state && !state.ok && (
        <p role="alert" className="text-sm text-red-600">
          {t('loginFailed')}
        </p>
      )}

      <FormButton>{t('loginCta')}</FormButton>
    </form>
  );
}
