// 통합 검색 결과(포털형). 유형별 섹션 + 결과 링크 + 유형별 전체보기. 섹션 타이틀은 메뉴 이름 사용.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { CategoryIcon } from '@/components/CategoryIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import type { SearchGroup } from '@/lib/search/queries';

export async function SearchResults({ groups, query }: { groups: SearchGroup[]; query: string }) {
  const t = await getTranslations('search');
  const total = groups.reduce((n, g) => n + g.hits.length, 0);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-sm font-semibold text-neutral-500">{t('resultsFor', { q: query })}</h2>

      {total === 0 ? (
        <EmptyState message={t('noResults')} />
      ) : (
        groups.map((g) => (
          <section key={g.route} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                <CategoryIcon route={g.route} className="h-4 w-4 text-blue-600" />
                {g.title}
              </h3>
              <Link href={g.moreHref} className="text-xs font-medium text-blue-600 hover:underline">
                {t('viewAllType')}
              </Link>
            </div>
            <ul className="divide-y divide-neutral-100 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
              {g.hits.map((h) => (
                <li key={`${g.route}-${h.id}`}>
                  <Link href={h.href} className="flex items-center gap-3 px-4 py-3 transition hover:bg-neutral-50">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
                      <CategoryIcon route={g.route} className="h-5 w-5" />
                    </span>
                    <div className="flex min-w-0 flex-col">
                      <span className="line-clamp-1 text-sm font-medium text-neutral-900">{h.title}</span>
                      {h.subtitle && (
                        <span className="line-clamp-1 text-xs text-neutral-500">{h.subtitle}</span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
