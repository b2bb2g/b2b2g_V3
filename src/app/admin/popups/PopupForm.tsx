'use client';
// 팝업 작성/수정 폼. 대상·기간·우선순위·재노출억제 설정.
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { savePopup, type MarketingResult } from '@/lib/marketing/actions';
import type {
  PopupRow,
  PopupContentType,
  PopupDismiss,
  PopupTarget,
} from '@/lib/supabase/database.types';
import { FormButton } from '@/components/ui/FormButton';

const input = 'rounded-md border border-neutral-300 px-3 py-2';
const TYPES: PopupContentType[] = ['image', 'rich_text', 'image_with_text'];
const TARGETS: PopupTarget[] = ['all', 'guest', 'buyer', 'supplier', 'agent'];
const DISMISS: PopupDismiss[] = ['close_only', 'today_off', 'week_off'];

export function PopupForm({ popup }: { popup?: PopupRow }) {
  const t = useTranslations('marketing');
  const [state, formAction] = useActionState<MarketingResult | null, FormData>(savePopup, null);
  const dt = (v: string | null) => (v ? v.slice(0, 16) : '');

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {popup && <input type="hidden" name="id" value={popup.id} />}

      <label className="flex flex-col gap-1 text-sm">
        <span>{t('bTitle')}</span>
        <input type="text" name="title" required defaultValue={popup?.title} className={input} />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('pContentType')}</span>
          <select name="content_type" defaultValue={popup?.content_type ?? 'image_with_text'} className={input}>
            {TYPES.map((c) => (
              <option key={c} value={c}>
                {t(`ctype_${c}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('pTarget')}</span>
          <select name="target" defaultValue={popup?.target ?? 'all'} className={input}>
            {TARGETS.map((c) => (
              <option key={c} value={c}>
                {t(`target_${c}`)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <span>{t('bImage')}</span>
        <input type="text" name="image" defaultValue={popup?.image ?? ''} className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>{t('pBody')}</span>
        <textarea name="body" rows={4} defaultValue={popup?.body ?? ''} className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>{t('bLink')}</span>
        <input type="text" name="link_url" defaultValue={popup?.link_url ?? ''} className={input} />
      </label>
      <div className="grid grid-cols-3 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('startAt')}</span>
          <input type="datetime-local" name="start_at" defaultValue={dt(popup?.start_at ?? null)} className={input} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('endAt')}</span>
          <input type="datetime-local" name="end_at" defaultValue={dt(popup?.end_at ?? null)} className={input} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('pPriority')}</span>
          <input type="number" name="priority" defaultValue={popup?.priority ?? 0} className={input} />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <span>{t('pDismiss')}</span>
        <select name="dismiss_option" defaultValue={popup?.dismiss_option ?? 'close_only'} className={input}>
          {DISMISS.map((c) => (
            <option key={c} value={c}>
              {t(`dismiss_${c}`)}
            </option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_active" defaultChecked={popup?.is_active ?? true} />
        {t('isActive')}
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
