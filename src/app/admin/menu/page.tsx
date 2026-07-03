// 관리자 메인 메뉴 편집(9장). 전 항목 라벨·링크·순서·노출·그룹 변경, 비시스템 추가/삭제.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { listAllMenu } from '@/lib/menu/queries';
import { deleteMenuItem } from '@/lib/menu/actions';
import { ConfirmButton } from '@/components/ui/ConfirmButton';

export default async function AdminMenuPage() {
  const t = await getTranslations('menu');
  const items = await listAllMenu();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('manage')}</h1>
        <Link
          href="/admin/menu/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          {t('new')}
        </Link>
      </div>

      <ul className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200">
        {items.map((it) => (
          <li key={it.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex flex-col">
              <span className="font-medium">
                {it.label_en} / {it.label_ko}
                {!it.is_active && <span className="ml-2 text-xs text-neutral-400">({t('hidden')})</span>}
              </span>
              <span className="text-xs text-neutral-500">
                {t(`group_${it.group}`)} · {it.route}
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
    </main>
  );
}
