'use client';
// 관리자 메시지 작성(중계 또는 내부메모). visible_to 로 공개/내부 구분.
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { addAdminMessage, type MessageResult } from '@/lib/admin/actions';
import { FormButton } from '@/components/ui/FormButton';

export function AdminMessageForm({ inquiryId }: { inquiryId: string }) {
  const t = useTranslations('admin');
  const action = addAdminMessage.bind(null, inquiryId);
  const [, formAction] = useActionState<MessageResult | null, FormData>(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-3 border-t border-neutral-200 pt-4">
      <p className="text-sm font-semibold text-neutral-500">{t('addMessage')}</p>
      <label className="flex flex-col gap-1 text-sm">
        <span>{t('messageBody')}</span>
        <textarea
          name="body"
          required
          rows={3}
          className="rounded-md border border-neutral-300 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>{t('visibility')}</span>
        <select
          name="visibleTo"
          defaultValue="all"
          className="rounded-md border border-neutral-300 px-3 py-2"
        >
          <option value="all">{t('visibleAll')}</option>
          <option value="admin_only">{t('visibleAdminOnly')}</option>
        </select>
      </label>
      <FormButton>{t('addMessage')}</FormButton>
    </form>
  );
}
