// 관리자 단축링크 관리(short_links). 클릭 수·활성 상태 열람 + 활성 토글. RLS(is_admin).
import { getTranslations } from 'next-intl/server';
import { listAllShortLinks } from '@/lib/admin/extra-queries';
import { toggleShortLink } from '@/lib/admin/extra-actions';
import { publicEnv } from '@/lib/env';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function AdminLinksPage() {
  const t = await getTranslations('admin');
  const links = await listAllShortLinks();

  return (
    <>
      <h1 className="text-2xl font-bold">{t('links')}</h1>

      {links.length === 0 ? (
        <EmptyState message={t('queueEmpty')} />
      ) : (
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <ul className="flex flex-col divide-y divide-neutral-100">
            {links.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">
                    {publicEnv.siteUrl}/s/{l.slug}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {l.target_type} · {t('clicks')} {l.click_count}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {!l.is_active && (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                      {t('deactivate')}
                    </span>
                  )}
                  <form action={toggleShortLink.bind(null, l.id, l.is_active)}>
                    <button type="submit" className="text-xs underline">
                      {l.is_active ? t('deactivate') : t('activate')}
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
