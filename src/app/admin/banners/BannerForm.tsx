'use client';
// 광고배너 작성/수정 폼. 이미지 URL 또는 board-media 경로.
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { saveBanner, type MarketingResult } from '@/lib/marketing/actions';
import type { AdBannerRow, BannerPlacement } from '@/lib/supabase/database.types';
import { FormButton } from '@/components/ui/FormButton';

const input = 'rounded-md border border-neutral-300 px-3 py-2';
const PLACEMENTS: BannerPlacement[] = ['hero', 'mid', 'sidebar'];

export function BannerForm({ banner }: { banner?: AdBannerRow }) {
  const t = useTranslations('marketing');
  const [state, formAction] = useActionState<MarketingResult | null, FormData>(saveBanner, null);
  const dt = (v: string | null) => (v ? v.slice(0, 16) : '');

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {banner && <input type="hidden" name="id" value={banner.id} />}

      <label className="flex flex-col gap-1 text-sm">
        <span>{t('bTitle')}</span>
        <input type="text" name="title" required defaultValue={banner?.title} className={input} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>{t('bImage')}</span>
        <input type="text" name="image" defaultValue={banner?.image ?? ''} className={input} />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('bHeadline')}</span>
          <input type="text" name="headline" defaultValue={banner?.headline ?? ''} className={input} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('bSubtext')}</span>
          <input type="text" name="subtext" defaultValue={banner?.subtext ?? ''} className={input} />
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <span>{t('bLink')}</span>
        <input type="text" name="link_url" defaultValue={banner?.link_url ?? ''} className={input} />
      </label>
      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('bPlacement')}</span>
          <select name="placement" defaultValue={banner?.placement ?? 'mid'} className={input}>
            {PLACEMENTS.map((p) => (
              <option key={p} value={p}>
                {t(`placement_${p}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('sortOrder')}</span>
          <input type="number" name="sort_order" defaultValue={banner?.sort_order ?? 0} className={input} />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('startAt')}</span>
          <input type="datetime-local" name="start_at" defaultValue={dt(banner?.start_at ?? null)} className={input} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('endAt')}</span>
          <input type="datetime-local" name="end_at" defaultValue={dt(banner?.end_at ?? null)} className={input} />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_active" defaultChecked={banner?.is_active ?? true} />
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
