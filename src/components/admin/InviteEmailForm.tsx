'use client';
// 관리자 이메일 초대 폼. 이메일 + 역할 선택 → 서버 액션으로 초대 메일 발송.
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { adminInviteByEmail, type InviteResult } from '@/lib/admin/invite-actions';
import { FormButton } from '@/components/ui/FormButton';

export function InviteEmailForm({ roles }: { roles: { value: string; label: string }[] }) {
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const [state, action] = useActionState<InviteResult | null, FormData>(adminInviteByEmail, null);

  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          <span className="text-neutral-500">{tc('email')}</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="off"
            className="rounded-md border border-neutral-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:w-40">
          <span className="text-neutral-500">{t('inviteRole')}</span>
          <select name="role" className="rounded-md border border-neutral-300 px-3 py-2">
            {roles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </label>
        <FormButton>{t('inviteSend')}</FormButton>
      </div>
      {state?.ok && (
        <p role="status" className="text-sm text-emerald-600">
          {t('inviteSent')}
        </p>
      )}
      {state && !state.ok && (
        <p role="alert" className="text-sm text-red-600">
          {t('inviteFailed')}
        </p>
      )}
    </form>
  );
}
