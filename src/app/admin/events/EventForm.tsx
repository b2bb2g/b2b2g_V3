'use client';
// 이벤트 작성/수정 공용 폼.
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { saveEvent, type EventResult } from '@/lib/events/actions';
import type { EventRow } from '@/lib/supabase/database.types';
import { CATEGORY_KEY } from '@/lib/events/labels';
import { FormButton } from '@/components/ui/FormButton';

const input = 'rounded-md border border-neutral-300 px-3 py-2';
const CATEGORIES = ['trade_fair', 'buyer_matching', 'briefing', 'corporate', 'etc'] as const;

export function EventForm({ event }: { event?: EventRow }) {
  const t = useTranslations('events');
  const [state, formAction] = useActionState<EventResult | null, FormData>(saveEvent, null);
  const dt = (v: string | null) => (v ? v.slice(0, 16) : '');

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {event && <input type="hidden" name="id" value={event.id} />}

      <label className="flex flex-col gap-1 text-sm">
        <span>{t('fieldName')}</span>
        <input type="text" name="name" required defaultValue={event?.name} className={input} />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span>{t('fieldCategory')}</span>
        <select name="category" defaultValue={event?.category ?? 'etc'} className={input}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {t(CATEGORY_KEY[c])}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span>{t('fieldBody')}</span>
        <textarea name="body" rows={6} defaultValue={event?.body} className={input} />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('fieldStarts')}</span>
          <input
            type="datetime-local"
            name="starts_at"
            defaultValue={dt(event?.starts_at ?? null)}
            className={input}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('fieldEnds')}</span>
          <input
            type="datetime-local"
            name="ends_at"
            defaultValue={dt(event?.ends_at ?? null)}
            className={input}
          />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('venue')}</span>
          <input type="text" name="venue" defaultValue={event?.venue ?? ''} className={input} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('location')}</span>
          <input
            type="text"
            name="location"
            defaultValue={event?.location ?? ''}
            className={input}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('country')}</span>
          <input type="text" name="country" defaultValue={event?.country ?? ''} className={input} />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span>{t('boothInfo')}</span>
        <input
          type="text"
          name="booth_info"
          defaultValue={event?.booth_info ?? ''}
          className={input}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span>{t('externalLink')}</span>
        <input
          type="url"
          name="external_link"
          defaultValue={event?.external_link ?? ''}
          className={input}
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('fieldParticipation')}</span>
          <select
            name="participation_status"
            defaultValue={event?.participation_status ?? 'open'}
            className={input}
          >
            <option value="open">{t('partOpen')}</option>
            <option value="closed">{t('partClosed')}</option>
            <option value="ended">{t('partEnded')}</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('fieldStatus')}</span>
          <select name="status" defaultValue={event?.status ?? 'draft'} className={input}>
            <option value="draft">{t('statusDraft')}</option>
            <option value="published">{t('statusPublished')}</option>
          </select>
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_pinned" defaultChecked={event?.is_pinned} />
        {t('pin')}
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="registration_enabled"
          defaultChecked={event?.registration_enabled}
        />
        {t('enableRegistration')}
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
