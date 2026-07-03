// 메뉴 항목 새로 추가.
import { getTranslations } from 'next-intl/server';
import { MenuItemForm } from '../MenuItemForm';

export default async function NewMenuItemPage() {
  const t = await getTranslations('menu');
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold">{t('new')}</h1>
      <MenuItemForm />
    </main>
  );
}
