'use client';
// EPC 프로젝트 작성/수정 공용 폼.
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { saveProject, type ProjectResult } from '@/lib/projects/actions';
import type { ProjectRow } from '@/lib/supabase/database.types';
import { FIELD_KEY, STAGE_KEY } from '@/lib/projects/labels';
import { FormButton } from '@/components/ui/FormButton';
import { RichTextEditor } from '@/components/RichTextEditor';

const input = 'rounded-md border border-neutral-300 px-3 py-2';
const FIELDS = ['power_plant', 'construction', 'factory', 'plant', 'civil', 'etc'] as const;
const STAGES = ['planning', 'bidding', 'in_progress', 'completed'] as const;

export function ProjectForm({ project }: { project?: ProjectRow }) {
  const t = useTranslations('epc');
  const [state, formAction] = useActionState<ProjectResult | null, FormData>(saveProject, null);
  const d = (v: string | null) => v ?? '';

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {project && <input type="hidden" name="id" value={project.id} />}

      <label className="flex flex-col gap-1 text-sm">
        <span>{t('fieldName')}</span>
        <input type="text" name="name" required defaultValue={project?.name} className={input} />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('fieldField')}</span>
          <select name="field" defaultValue={project?.field ?? 'etc'} className={input}>
            {FIELDS.map((f) => (
              <option key={f} value={f}>
                {t(FIELD_KEY[f])}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('fieldStage')}</span>
          <select name="stage" defaultValue={project?.stage ?? 'planning'} className={input}>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {t(STAGE_KEY[s])}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-col gap-1 text-sm">
        <span>{t('fieldBody')}</span>
        <RichTextEditor name="body" defaultValue={project?.body ?? ''} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('client')}</span>
          <input type="text" name="client" defaultValue={d(project?.client ?? null)} className={input} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('location')}</span>
          <input
            type="text"
            name="location"
            defaultValue={d(project?.location ?? null)}
            className={input}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('country')}</span>
          <input
            type="text"
            name="country"
            defaultValue={d(project?.country ?? null)}
            className={input}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('scaleAmount')}</span>
          <input
            type="number"
            name="scale_amount"
            step="any"
            defaultValue={project?.scale_amount ?? ''}
            className={input}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('currency')}</span>
          <input
            type="text"
            name="currency"
            defaultValue={d(project?.currency ?? null)}
            className={input}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('fieldStarts')}</span>
          <input
            type="date"
            name="starts_on"
            defaultValue={d(project?.starts_on ?? null)}
            className={input}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('fieldEnds')}</span>
          <input
            type="date"
            name="ends_on"
            defaultValue={d(project?.ends_on ?? null)}
            className={input}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span>{t('fieldStatus')}</span>
        <select name="status" defaultValue={project?.status ?? 'draft'} className={input}>
          <option value="draft">{t('statusDraft')}</option>
          <option value="published">{t('statusPublished')}</option>
          <option value="closed">{t('statusClosed')}</option>
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_pinned" defaultChecked={project?.is_pinned} />
        {t('pin')}
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
