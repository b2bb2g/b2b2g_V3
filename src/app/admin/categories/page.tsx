// 관리자 카테고리 관리: 대분류(그룹)와 하위 카테고리 추가·수정·삭제. RLS(관리자)가 쓰기 강제.
import { getTranslations } from 'next-intl/server';
import { listCategoryTree, type CategoryGroup } from '@/lib/admin/category-queries';
import { createCategory, updateCategory, deleteCategory } from '@/lib/admin/category-actions';
import { PageShell } from '@/components/ui/PageShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { ConfirmButton } from '@/components/ui/ConfirmButton';

const input = 'rounded-md border border-neutral-300 px-3 py-2 text-sm';

export default async function AdminCategoriesPage() {
  const t = await getTranslations('categories');
  const tree = await listCategoryTree();

  return (
    <PageShell>
      <PageHeader title={t('manage')} description={t('intro')} />

      <div className="flex flex-col gap-6">
        {tree.map((g) => (
          <GroupBlock key={g.group.id} group={g} t={t} />
        ))}
      </div>

      <form
        action={createCategory}
        className="flex flex-wrap items-end gap-2 rounded-xl border border-dashed border-neutral-300 p-4"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-neutral-500">{t('newGroup')}</span>
          <input type="text" name="name" required placeholder={t('namePlaceholder')} className={input} />
        </label>
        <button type="submit" className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white">
          {t('addGroup')}
        </button>
      </form>
    </PageShell>
  );
}

function GroupBlock({
  group,
  t,
}: {
  group: CategoryGroup;
  t: Awaited<ReturnType<typeof getTranslations>>;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-4">
      <EditRow id={group.group.id} name={group.group.name} sort={group.group.sort_order} active={group.group.is_active} t={t} heading />

      <div className="flex flex-col gap-2 pl-4">
        <span className="text-xs font-semibold text-neutral-400">{t('subcategories')}</span>
        {group.children.length === 0 ? (
          <span className="text-xs text-neutral-400">{t('noSub')}</span>
        ) : (
          group.children.map((c) => (
            <EditRow key={c.id} id={c.id} name={c.name} sort={c.sort_order} active={c.is_active} t={t} />
          ))
        )}

        <form action={createCategory} className="mt-1 flex flex-wrap items-center gap-2">
          <input type="hidden" name="parent_id" value={group.group.id} />
          <input type="text" name="name" required placeholder={t('subNamePlaceholder')} className={input} />
          <input type="number" name="sort_order" defaultValue={0} className={`${input} w-20`} />
          <button type="submit" className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium">
            {t('addSub')}
          </button>
        </form>
      </div>
    </section>
  );
}

function EditRow({
  id,
  name,
  sort,
  active,
  t,
  heading = false,
}: {
  id: string;
  name: string;
  sort: number;
  active: boolean;
  t: Awaited<ReturnType<typeof getTranslations>>;
  heading?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={updateCategory.bind(null, id)} className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          name="name"
          defaultValue={name}
          className={`${input} ${heading ? 'font-semibold' : ''}`}
        />
        <input type="number" name="sort_order" defaultValue={sort} className={`${input} w-20`} />
        <label className="flex items-center gap-1 text-xs text-neutral-500">
          <input type="checkbox" name="is_active" defaultChecked={active} />
          {t('active')}
        </label>
        <button type="submit" className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium">
          {t('save')}
        </button>
      </form>
      <ConfirmButton
        action={deleteCategory.bind(null, id)}
        title={t('deleteConfirm')}
        confirmLabel={t('delete')}
        variant="danger"
      >
        {t('delete')}
      </ConfirmButton>
    </div>
  );
}
