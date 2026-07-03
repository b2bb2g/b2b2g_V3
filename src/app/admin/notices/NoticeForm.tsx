'use client';
// 공지 작성/수정 공용 폼.
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { saveNotice, type ContentResult } from '@/lib/content/actions';
import type { NoticeRow } from '@/lib/supabase/database.types';
import { FormButton } from '@/components/ui/FormButton';
import { RichTextEditor } from '@/components/RichTextEditor';

const input = 'rounded-md border border-neutral-300 px-3 py-2';

export function NoticeForm({ notice }: { notice?: NoticeRow }) {
  const t = useTranslations('content');
  const [state, formAction] = useActionState<ContentResult | null, FormData>(saveNotice, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {notice && <input type="hidden" name="id" value={notice.id} />}
      <label className="flex flex-col gap-1 text-sm">
        <span>{t('fieldTitle')}</span>
        <input type="text" name="title" required defaultValue={notice?.title} className={input} />
      </label>
      <div className="flex flex-col gap-1 text-sm">
        <span>{t('fieldBody')}</span>
        <RichTextEditor name="body" defaultValue={notice?.body ?? ''} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_pinned" defaultChecked={notice?.is_pinned} />
        {t('pin')}
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>{t('fieldStatus')}</span>
        <select name="status" defaultValue={notice?.status ?? 'draft'} className={input}>
          <option value="draft">{t('statusDraft')}</option>
          <option value="published">{t('statusPublished')}</option>
        </select>
      </label>
      {state && !state.ok && (
        <p role="alert" className="text-sm text-red-600">
          {t('saveFailed')}
        </p>
      )}
      <FormButton>{t('save')}</FormButton>
    </form>
  );
}
