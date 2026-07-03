// 관리자 메인 메뉴 편집(9장). 메뉴 항목 + 그룹 관리(추가·수정·삭제).
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { listAllMenu, listMenuGroups } from '@/lib/menu/queries';
import { deleteMenuItem, saveMenuGroup, deleteMenuGroup } from '@/lib/menu/actions';
import { ConfirmButton } from '@/components/ui/ConfirmButton';

const input = 'rounded-md border border-neutral-300 px-3 py-2 text-sm';

export default async function AdminMenuPage() {
  const t = await getTranslations('menu');
  const [items, groups] = await Promise.all([listAllMenu(), listMenuGroups()]);
  const groupLabel = (id: string | null) => groups.find((g) => g.id === id)?.label_en ?? t('groupNone');

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('manage')}</h1>
        <Link
          href="/admin/menu/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          {t('new')}
        </Link>
      </div>

      {/* 메뉴 항목 */}
      <ul className="flex flex-col divide-y divide-neutral-200 rounded-xl border border-neutral-200">
        {items.map((it) => (
          <li key={it.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex flex-col">
              <span className="font-medium">
                {it.label_en} / {it.label_ko}
                {!it.is_active && <span className="ml-2 text-xs text-neutral-400">({t('hidden')})</span>}
              </span>
              <span className="text-xs text-neutral-500">
                {groupLabel(it.group_id)} · {it.route}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Link href={`/admin/menu/${it.id}/edit`} className="underline">
                {t('edit')}
              </Link>
              {!it.is_system && (
                <ConfirmButton
                  action={deleteMenuItem.bind(null, it.id)}
                  title={t('deleteConfirm')}
                  confirmLabel={t('delete')}
                  variant="danger"
                >
                  {t('delete')}
                </ConfirmButton>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* 그룹 관리 — 메뉴 항목 리스트와 동일한 스타일로 통일 */}
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-neutral-500">{t('groupsHeading')}</h2>
        <ul className="flex flex-col divide-y divide-neutral-200 rounded-xl border border-neutral-200">
          {groups.map((g) => (
            <li key={g.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <form action={saveMenuGroup} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={g.id} />
                <input type="text" name="label_en" defaultValue={g.label_en} className={input} />
                <input type="text" name="label_ko" defaultValue={g.label_ko} className={input} />
                <input type="number" name="sort_order" defaultValue={g.sort_order} className={`${input} w-20`} />
                <button type="submit" className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium">
                  {t('save')}
                </button>
              </form>
              <ConfirmButton
                action={deleteMenuGroup.bind(null, g.id)}
                title={t('groupDeleteConfirm')}
                confirmLabel={t('delete')}
                variant="danger"
              >
                {t('delete')}
              </ConfirmButton>
            </li>
          ))}
        </ul>

        <form
          action={saveMenuGroup}
          className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-neutral-300 p-4"
        >
          <input type="text" name="label_en" required placeholder={t('labelEn')} className={input} />
          <input type="text" name="label_ko" required placeholder={t('labelKo')} className={input} />
          <input type="number" name="sort_order" defaultValue={0} className={`${input} w-20`} />
          <button
            type="submit"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
          >
            {t('addGroup')}
          </button>
        </form>
      </div>
    </>
  );
}
