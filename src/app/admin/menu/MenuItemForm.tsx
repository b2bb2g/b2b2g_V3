'use client';
// 메뉴 항목 작성/수정 폼. 라벨(en/ko)·그룹·링크·순서·노출 편집.
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { saveMenuItem, type MenuResult } from '@/lib/menu/actions';
import type { MenuGroupRow, MenuItemRow } from '@/lib/supabase/database.types';
import { FormButton } from '@/components/ui/FormButton';

const input = 'rounded-md border border-neutral-300 px-3 py-2';

export function MenuItemForm({ item, groups }: { item?: MenuItemRow; groups: MenuGroupRow[] }) {
  const t = useTranslations('menu');
  const [state, formAction] = useActionState<MenuResult | null, FormData>(saveMenuItem, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {item && <input type="hidden" name="id" value={item.id} />}

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('labelEn')}</span>
          <input type="text" name="label_en" required defaultValue={item?.label_en} className={input} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('labelKo')}</span>
          <input type="text" name="label_ko" required defaultValue={item?.label_ko} className={input} />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span>{t('route')}</span>
        <input type="text" name="route" required defaultValue={item?.route} className={input} />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('group')}</span>
          <select name="group_id" defaultValue={item?.group_id ?? ''} className={input}>
            <option value="">{t('groupNone')}</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label_en} / {g.label_ko}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>{t('sortOrder')}</span>
          <input type="number" name="sort_order" defaultValue={item?.sort_order ?? 0} className={input} />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_active" defaultChecked={item?.is_active ?? true} />
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
