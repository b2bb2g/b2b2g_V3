// 메뉴 항목 새로 추가.
import { getTranslations } from 'next-intl/server';
import { listMenuGroups } from '@/lib/menu/queries';
import { MenuItemForm } from '../MenuItemForm';

export default async function NewMenuItemPage() {
  const t = await getTranslations('menu');
  const groups = await listMenuGroups();
  return (
    <>
      <h1 className="text-2xl font-bold">{t('new')}</h1>
      <MenuItemForm groups={groups} />
    </>
  );
}
