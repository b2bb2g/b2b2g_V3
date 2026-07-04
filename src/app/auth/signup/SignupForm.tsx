'use client';
// 회원가입 폼. role·locale·ref 를 함께 제출한다(ref 는 추천 링크에서 전달).
import { useActionState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { signup, type ActionResult } from '@/lib/auth/actions';
import { SELF_SIGNUP_ROLES } from '@/lib/auth/schema';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { FormButton } from '@/components/ui/FormButton';

export function SignupForm({
  referralCode,
  presetRole,
}: {
  referralCode?: string;
  presetRole?: (typeof SELF_SIGNUP_ROLES)[number];
}) {
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [state, formAction] = useActionState<ActionResult | null, FormData>(signup, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      {referralCode && <input type="hidden" name="ref" value={referralCode} />}

      <label className="flex flex-col gap-1 text-sm">
        <span>{t('displayName')}</span>
        <input
          type="text"
          name="displayName"
          required
          maxLength={120}
          className="rounded-md border border-neutral-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span>{t('memberType')}</span>
        <select
          name="role"
          defaultValue={presetRole ?? (referralCode ? 'buyer' : 'supplier')}
          className="rounded-md border border-neutral-300 px-3 py-2"
        >
          {SELF_SIGNUP_ROLES.map((role) => (
            <option key={role} value={role}>
              {role === 'supplier' ? t('roleSupplier') : t('roleBuyer')}
            </option>
          ))}
        </select>
      </label>

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
          {t('signupFailed')}
        </p>
      )}

      <FormButton>{t('signupCta')}</FormButton>
    </form>
  );
}
