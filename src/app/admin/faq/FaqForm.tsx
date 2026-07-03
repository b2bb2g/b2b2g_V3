'use client';
// FAQ 작성/수정 공용 폼.
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { saveFaq, type ContentResult } from '@/lib/content/actions';
import type { FaqRow } from '@/lib/supabase/database.types';
import { FormButton } from '@/components/ui/FormButton';
import { RichTextEditor } from '@/components/RichTextEditor';

const input = 'rounded-md border border-neutral-300 px-3 py-2';

export function FaqForm({ faq }: { faq?: FaqRow }) {
  const t = useTranslations('content');
  const [state, formAction] = useActionState<ContentResult | null, FormData>(saveFaq, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {faq && <input type="hidden" name="id" value={faq.id} />}
      <label className="flex flex-col gap-1 text-sm">
        <span>{t('fieldQuestion')}</span>
        <input
          type="text"
          name="question"
          required
          defaultValue={faq?.question}
          className={input}
        />
      </label>
      <div className="flex flex-col gap-1 text-sm">
        <span>{t('fieldAnswer')}</span>
        <RichTextEditor name="answer" defaultValue={faq?.answer ?? ''} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('fieldCategory')}</span>
          <input type="text" name="category" defaultValue={faq?.category ?? ''} className={input} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('fieldSortOrder')}</span>
          <input
            type="number"
            name="sort_order"
            defaultValue={faq?.sort_order ?? 0}
            className={input}
          />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <span>{t('fieldStatus')}</span>
        <select name="status" defaultValue={faq?.status ?? 'draft'} className={input}>
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
