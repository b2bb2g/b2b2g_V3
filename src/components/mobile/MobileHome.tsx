// 모바일 홈(모바일 전용). 로그인 전=검색 우선, 로그인 후=인사말 헤더. 실시간 검색·카테고리·프로모·Featured.
import Link from 'next/link';
import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/server';
import { listActiveMenu } from '@/lib/menu/queries';
import { unreadNotificationCount } from '@/lib/notify/queries';
import { listPublicProducts } from '@/lib/products/queries';
import { publicImageUrl } from '@/lib/products/media';
import { EmptyState } from '@/components/ui/EmptyState';
import { MobileSearch } from '@/components/mobile/MobileSearch';
import type { ProductListItem } from '@/lib/products/queries';
import type { MenuItemRow } from '@/lib/supabase/database.types';

// 라우트별 카테고리 아이콘(이모지 금지 → 인라인 SVG). 미매칭은 기본 아이콘.
function categoryIcon(route: string): ReactNode {
  const map: Record<string, ReactNode> = {
    '/commercial': <path d="M4 9h16v11H4V9zm0 0l1.5-5h13L20 9M9 20v-6h6v6" />,
    '/industrial': <path d="M4 20V10l5 3V10l5 3V6l6 4v10H4z" />,
    '/epc': (
      <>
        <path d="M14 6l4 4-8 8-4 1 1-4 7-9z" />
        <path d="M12 8l4 4" />
      </>
    ),
    '/requests': (
      <>
        <rect x="6" y="4" width="12" height="16" rx="2" />
        <path d="M9 8h6M9 12h6M9 16h4" />
      </>
    ),
    '/events': (
      <>
        <rect x="4" y="6" width="16" height="14" rx="2" />
        <path d="M4 10h16M8 4v4M16 4v4" />
      </>
    ),
    '/services': (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 4v2M12 18v2M4 12h2M18 12h2M6 6l1.5 1.5M16.5 16.5L18 18M18 6l-1.5 1.5M7.5 16.5L6 18" />
      </>
    ),
    '/faq': (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M9.5 9.5a2.5 2.5 0 0 1 4 2c0 1.5-2 2-2 3M12 17h.01" />
      </>
    ),
  };
  return map[route] ?? <path d="M4 12l8-8 8 8-8 8-8-8z" />;
}

const SCROLL_ROW = '-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

export async function MobileHome({ featured, q }: { featured: ProductListItem[]; q?: string }) {
  const t = await getTranslations('mobileHome');
  const locale = await getLocale();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName: string | null = null;
  let unread = 0;
  if (user) {
    const [{ data: profile }, count] = await Promise.all([
      supabase.from('profiles').select('display_name').eq('id', user.id).single(),
      unreadNotificationCount(),
    ]);
    displayName = profile?.display_name ?? null;
    unread = count;
  }

  const query = q?.trim() ?? '';
  const results = query ? await listPublicProducts({ q: query }) : null;

  const menu = await listActiveMenu();
  const label = (m: MenuItemRow) => (locale === 'ko' ? m.label_ko : m.label_en);
  const postHref = user ? '/dashboard/products/new' : '/auth/signup';

  return (
    <div className="flex flex-col gap-5 overflow-x-clip px-5 pt-4 md:hidden">
      {/* 로그인 후: 인사말 헤더 (로그인 전에는 검색이 첫 요소) */}
      {user && (
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-blue-600 text-base font-semibold text-white">
              {(displayName?.[0] ?? '?').toUpperCase()}
            </span>
            <div className="flex flex-col">
              <span className="flex items-center gap-1 text-xs text-neutral-500">
                {t('hello')}
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M7 11l-1 1a3 3 0 0 0 4 4l4-4M9 9l4-4a2 2 0 0 1 3 3l-3 3M11 7l3-3a2 2 0 0 1 3 3l-4 4" />
                </svg>
              </span>
              <span className="text-base font-semibold text-neutral-900">{displayName}</span>
            </div>
          </div>
          <Link
            href="/dashboard/notifications"
            className="relative grid h-10 w-10 place-items-center rounded-full border border-neutral-200"
            aria-label={t('notifications')}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0" strokeLinejoin="round" />
            </svg>
            {unread > 0 && (
              <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden />
            )}
          </Link>
        </header>
      )}

      {/* 실시간 검색 + 필터 */}
      <MobileSearch currentQ={query} />

      {results ? (
        /* 검색 결과 */
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-neutral-500">
            {t('resultsFor', { q: query })}
          </h2>
          {results.length === 0 ? (
            <EmptyState message={t('noResults')} />
          ) : (
            <ul className="flex flex-col gap-3">
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/products/${p.id}`}
                    className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                      {p.primaryImagePath && (
                        <Image
                          src={publicImageUrl(p.primaryImagePath)}
                          alt=""
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="line-clamp-1 font-medium text-neutral-900">{p.title}</span>
                      <span className="line-clamp-1 text-xs text-neutral-500">
                        {p.categoryName ? `${p.categoryName} · ` : ''}
                        {p.companyName}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <>
          {/* 카테고리 칩 */}
          <div className={SCROLL_ROW}>
            {menu.map((m) => (
              <Link
                key={m.id}
                href={m.route}
                className="flex shrink-0 snap-start flex-col items-center gap-1.5"
              >
                <span className="grid h-14 w-14 place-items-center rounded-full border border-neutral-200 text-neutral-700">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
                    {categoryIcon(m.route)}
                  </svg>
                </span>
                <span className="max-w-16 truncate text-xs text-neutral-600">{label(m)}</span>
              </Link>
            ))}
          </div>

          {/* 프로모 배너 */}
          <Link
            href={postHref}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white shadow-sm shadow-blue-600/20"
          >
            <div className="relative z-10 max-w-[72%]">
              <h3 className="text-lg font-bold leading-snug">{t('promoTitle')}</h3>
              <p className="mt-1 text-xs text-blue-100">{t('promoDesc')}</p>
              <span className="mt-3 inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700">
                {t('promoCta')}
              </span>
            </div>
            <svg viewBox="0 0 24 24" className="absolute -bottom-2 right-2 h-28 w-28 text-white/25" fill="currentColor">
              <path d="M12 3l9 7h-2v9h-5v-6h-4v6H5v-9H3l9-7z" />
            </svg>
          </Link>

          {/* Featured */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900">{t('featured')}</h2>
            <Link href="/commercial" className="text-sm font-medium text-blue-600">
              {t('seeAll')}
            </Link>
          </div>

          {featured.length === 0 ? (
            <EmptyState message={t('featuredEmpty')} />
          ) : (
            <div className={SCROLL_ROW}>
              {featured.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="w-60 shrink-0 snap-start overflow-hidden rounded-2xl border border-neutral-200 bg-white"
                >
                  <div className="relative aspect-[4/3] w-full bg-neutral-100">
                    {p.primaryImagePath && (
                      <Image
                        src={publicImageUrl(p.primaryImagePath)}
                        alt=""
                        fill
                        sizes="240px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-1 p-3">
                    <span className="line-clamp-1 font-medium text-neutral-900">{p.title}</span>
                    <span className="line-clamp-1 text-xs text-neutral-500">
                      {p.categoryName ? `${p.categoryName} · ` : ''}
                      {p.companyName}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
