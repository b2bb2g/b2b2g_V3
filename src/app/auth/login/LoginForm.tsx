'use client';
// 로그인 폼. 서버 액션(login)을 useActionState 로 호출하고 결과를 인라인 표시한다.
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { login, type ActionResult } from '@/lib/auth/actions';

export function LoginForm() {
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(login, null);

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
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="rounded-md border border-neutral-300 px-3 py-2"
        />
      </label>

      {state && !state.ok && (
        <p role="alert" className="text-sm text-red-600">
          {t('loginFailed')}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? tc('loading') : t('loginCta')}
      </button>
    </form>
  );
}
