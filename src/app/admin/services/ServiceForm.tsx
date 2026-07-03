'use client';
// 서비스 작성/수정 공용 폼.
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { saveService, type ServiceResult } from '@/lib/services/actions';
import type { ServiceRow } from '@/lib/supabase/database.types';
import { FormButton } from '@/components/ui/FormButton';

const input = 'rounded-md border border-neutral-300 px-3 py-2';

export function ServiceForm({ service }: { service?: ServiceRow }) {
  const t = useTranslations('services');
  const [state, formAction] = useActionState<ServiceResult | null, FormData>(saveService, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {service && <input type="hidden" name="id" value={service.id} />}

      <label className="flex flex-col gap-1 text-sm">
        <span>{t('fieldTitle')}</span>
        <input type="text" name="title" required defaultValue={service?.title} className={input} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span>{t('fieldSummary')}</span>
        <input type="text" name="summary" defaultValue={service?.summary ?? ''} className={input} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span>{t('fieldBody')}</span>
        <textarea name="body" rows={6} defaultValue={service?.body} className={input} />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('fieldStatus')}</span>
          <select name="status" defaultValue={service?.status ?? 'draft'} className={input}>
            <option value="draft">{t('statusDraft')}</option>
            <option value="published">{t('statusPublished')}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('fieldSortOrder')}</span>
          <input
            type="number"
            name="sort_order"
            defaultValue={service?.sort_order ?? 0}
            className={input}
          />
        </label>
      </div>

      {state && !state.ok && (
        <p role="alert" className="text-sm text-red-600">
          {t('saveFailed')}
        </p>
      )}
      <FormButton>{t('save')}</FormButton>
    </form>
  );
}
