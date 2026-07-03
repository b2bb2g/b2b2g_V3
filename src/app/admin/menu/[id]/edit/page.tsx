// 메뉴 항목 수정.
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getMenuItem, listMenuGroups } from '@/lib/menu/queries';
import { MenuItemForm } from '../../MenuItemForm';

export default async function EditMenuItemPage({ params }: { params: Promise<{ id: string }> }) {
  const t = await getTranslations('menu');
  const { id } = await params;
  const [item, groups] = await Promise.all([getMenuItem(id), listMenuGroups()]);
  if (!item) notFound();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold">{t('edit')}</h1>
      <MenuItemForm item={item} groups={groups} />
    </main>
  );
}
