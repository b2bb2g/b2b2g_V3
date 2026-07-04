// 관리자 게시판 설정: 카테고리 CRUD + 표시 설정(작성자/조회수 노출). 공지 게시판 대상.
import { getLocale, getTranslations } from 'next-intl/server';
import { listBoardCategories, getBoardSettings } from '@/lib/content/queries';
import {
  updateBoardSettings,
  createBoardCategory,
  updateBoardCategory,
  deleteBoardCategory,
} from '@/lib/admin/board-actions';
import { FormButton } from '@/components/ui/FormButton';
import { ConfirmButton } from '@/components/ui/ConfirmButton';

const input = 'rounded-md border border-neutral-300 px-3 py-2 text-sm';

export default async function AdminBoardPage() {
  const t = await getTranslations('content');
  const locale = await getLocale();
  const [categories, settings] = await Promise.all([
    listBoardCategories('notices'),
    getBoardSettings('notices'),
  ]);

  return (
    <>
      <h1 className="text-2xl font-bold">{t('boardSettings')}</h1>

      {/* 표시 설정 */}
      <section className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-700">{t('boardDisplaySettings')}</h2>
        <form
          action={updateBoardSettings.bind(null, 'notices')}
          className="flex flex-col items-start gap-3"
        >
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="show_author" defaultChecked={settings.show_author} />
            {t('boardShowAuthor')}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="show_view_count" defaultChecked={settings.show_view_count} />
            {t('boardShowViews')}
          </label>
          <FormButton>{t('save')}</FormButton>
        </form>
      </section>

      {/* 카테고리 관리 */}
      <section className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-700">{t('boardCategories')}</h2>

        <ul className="flex flex-col gap-3">
          {categories.map((c) => (
            <li key={c.id} className="rounded-xl border border-neutral-200 p-3">
              <form
                action={updateBoardCategory.bind(null, c.id)}
                className="flex flex-wrap items-end gap-2"
              >
                <label className="flex flex-col gap-1 text-xs text-neutral-500">
                  {t('boardCategoryEn')}
                  <input name="name_en" defaultValue={c.name_en} className={input} />
                </label>
                <label className="flex flex-col gap-1 text-xs text-neutral-500">
                  {t('boardCategoryKo')}
                  <input name="name_ko" defaultValue={c.name_ko} className={input} />
                </label>
                <label className="flex w-20 flex-col gap-1 text-xs text-neutral-500">
                  {t('boardSort')}
                  <input
                    name="sort_order"
                    type="number"
                    defaultValue={c.sort_order}
                    className={input}
                  />
                </label>
                <label className="flex items-center gap-2 pb-2 text-sm">
                  <input type="checkbox" name="is_active" defaultChecked={c.is_active} />
                  {t('boardActive')}
                </label>
                <FormButton>{t('save')}</FormButton>
                <ConfirmButton
                  action={deleteBoardCategory.bind(null, c.id)}
                  title={t('deleteConfirm')}
                  confirmLabel={t('delete')}
                  variant="danger"
                >
                  {t('delete')}
                </ConfirmButton>
              </form>
              <p className="mt-1 text-xs text-neutral-400">
                {locale === 'ko' ? c.name_ko : c.name_en}
              </p>
            </li>
          ))}
        </ul>

        {/* 새 카테고리 */}
        <form
          action={createBoardCategory.bind(null, 'notices')}
          className="flex flex-wrap items-end gap-2 border-t border-neutral-100 pt-4"
        >
          <label className="flex flex-col gap-1 text-xs text-neutral-500">
            {t('boardCategoryEn')}
            <input name="name_en" required className={input} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-500">
            {t('boardCategoryKo')}
            <input name="name_ko" required className={input} />
          </label>
          <label className="flex w-20 flex-col gap-1 text-xs text-neutral-500">
            {t('boardSort')}
            <input name="sort_order" type="number" defaultValue={0} className={input} />
          </label>
          <FormButton>{t('boardAddCategory')}</FormButton>
        </form>
      </section>
    </>
  );
}
