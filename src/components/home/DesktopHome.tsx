// 데스크톱 랜딩(md 이상). 히어로 + 카테고리 그리드 + 가치 3카드 + Featured + 배너 + 무료등록 CTA.
import Link from 'next/link';
import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { listActiveMenu } from '@/lib/menu/queries';
import { listPublicProducts, type ProductListItem } from '@/lib/products/queries';
import { publicImageUrl } from '@/lib/products/media';
import { BannerSlot } from '@/components/BannerSlot';
import { CategoryIcon } from '@/components/CategoryIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import { HeroSearch } from '@/components/home/HeroSearch';
import type { PlatformStats } from '@/lib/stats/queries';
import type { MenuItemRow } from '@/lib/supabase/database.types';

type Signal = { value: number; label: string };

const VALUE_ICONS = [
  <path key="v" d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z M9 12l2 2 4-4" />,
  <path key="c" d="M4 5h16v10H9l-4 3v-3H4V5z M8 9h8M8 12h5" />,
  <path key="t" d="M4 12V6a2 2 0 0 1 2-2h6l8 8-8 8-8-8z M8.5 8.5h.01" />,
];

export async function DesktopHome({
  featured,
  signals,
  stats,
  isLoggedIn,
  q,
}: {
  featured: ProductListItem[];
  signals: Signal[];
  stats: PlatformStats;
  isLoggedIn: boolean;
  q?: string;
}) {
  const t = await getTranslations('home');
  const locale = await getLocale();
  const menu = await listActiveMenu();
  const label = (m: MenuItemRow) => (locale === 'ko' ? m.label_ko : m.label_en);
  const postHref = isLoggedIn ? '/dashboard/products/new' : '/auth/signup';

  const badge = signals[0] ?? { value: stats.listedProducts, label: t('statProducts') };
  const preview = featured.slice(0, 3);

  const query = q?.trim() ?? '';
  const results = query ? await listPublicProducts({ q: query }) : null;

  // 검색 중: 히어로 검색 + 결과 그리드만(랜딩 섹션 숨김).
  if (results) {
    return (
      <div className="hidden md:block">
        <div className="mx-auto w-full max-w-6xl px-6 py-12">
          <HeroSearch currentQ={query} />
          <h2 className="mt-8 text-lg font-semibold text-neutral-500">
            {t('resultsFor', { q: query })}
          </h2>
          {results.length === 0 ? (
            <div className="mt-4">
              <EmptyState message={t('noResults')} />
            </div>
          ) : (
            <ul className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/products/${p.id}`}
                    className="flex h-full flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-3 transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md"
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-100">
                      {p.primaryImagePath && (
                        <Image
                          src={publicImageUrl(p.primaryImagePath)}
                          alt=""
                          fill
                          sizes="(max-width: 1024px) 33vw, 260px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5 px-1 pb-1">
                      <span className="line-clamp-1 text-sm font-medium text-neutral-900">
                        {p.title}
                      </span>
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
        </div>
      </div>
    );
  }

  return (
    <div className="hidden md:block">
      {/* 히어로 */}
      <section className="border-b border-neutral-200 bg-gradient-to-b from-blue-50/70 to-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-medium text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600" aria-hidden />
              {t('heroBadge')}
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl lg:text-[3.3rem] lg:leading-[1.08]">
              {t('heroTitle')}
            </h1>
            <p className="max-w-md text-lg text-neutral-600">{t('heroSubtitle')}</p>

            <HeroSearch currentQ={query} />

            <div className="flex flex-wrap gap-3">
              <Link
                href="/commercial"
                className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                {t('browseProducts')}
              </Link>
              <Link
                href={postHref}
                className="rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium transition hover:border-neutral-400"
              >
                {t('heroCtaPost')}
              </Link>
            </div>

            {signals.length > 0 && (
              <dl className="mt-2 flex flex-wrap gap-x-10 gap-y-3">
                {signals.map((s) => (
                  <div key={s.label} className="flex flex-col">
                    <dt className="text-2xl font-bold tabular-nums text-neutral-900">
                      {s.value.toLocaleString()}
                    </dt>
                    <dd className="text-xs text-neutral-500">{s.label}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {/* 히어로 비주얼: 실데이터 프리뷰 카드 + 플로팅 지표 */}
          <div className="relative hidden lg:block">
            <div className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-xl shadow-blue-600/5">
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-neutral-100 px-3.5 py-2.5 text-sm text-neutral-400">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3-3" />
                </svg>
                {t('searchPlaceholder')}
              </div>
              <ul className="flex flex-col gap-3">
                {preview.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 rounded-2xl border border-neutral-100 p-3"
                  >
                    <div className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                      {p.primaryImagePath ? (
                        <Image
                          src={publicImageUrl(p.primaryImagePath)}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M4 9h16v11H4V9zm2-1l1-4h10l1 4" />
                        </svg>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="line-clamp-1 text-sm font-medium text-neutral-900">
                        {p.title}
                      </span>
                      <span className="line-clamp-1 text-xs text-neutral-500">{p.companyName}</span>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                      {t('verifiedBadge')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="absolute -bottom-5 -left-5 rounded-2xl bg-blue-600 px-5 py-4 text-white shadow-lg shadow-blue-600/30">
              <div className="text-2xl font-bold tabular-nums">{badge.value.toLocaleString()}+</div>
              <div className="text-xs text-blue-100">{badge.label}</div>
            </div>
          </div>
        </div>
      </section>

      <BannerSlot placement="hero" />

      {/* 카테고리 그리드 */}
      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-bold tracking-tight">{t('browseByCategory')}</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {menu.map((m) => (
            <Link
              key={m.id}
              href={m.route}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-5 text-center transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                <CategoryIcon route={m.route} className="h-6 w-6" />
              </span>
              <span className="text-sm font-medium text-neutral-700">{label(m)}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 가치 제안 */}
      <section className="border-y border-neutral-200 bg-neutral-50">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-bold tracking-tight">{t('whyTitle')}</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
              >
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                    {VALUE_ICONS[i]}
                  </svg>
                </span>
                <h3 className="text-base font-semibold text-neutral-900">{t(`why${i + 1}Title`)}</h3>
                <p className="text-sm text-neutral-600">{t(`why${i + 1}Desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured 제품 */}
      {featured.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold tracking-tight">{t('featured')}</h2>
            <Link href="/commercial" className="text-sm font-medium text-blue-600 hover:underline">
              {t('viewAll')}
            </Link>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/products/${p.id}`}
                  className="flex h-full flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-3 transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-100">
                    {p.primaryImagePath && (
                      <Image
                        src={publicImageUrl(p.primaryImagePath)}
                        alt=""
                        fill
                        sizes="(max-width: 1024px) 33vw, 260px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5 px-1 pb-1">
                    <span className="line-clamp-1 text-sm font-medium text-neutral-900">
                      {p.title}
                    </span>
                    <span className="line-clamp-1 text-xs text-neutral-500">
                      {p.categoryName ? `${p.categoryName} · ` : ''}
                      {p.companyName}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <BannerSlot placement="mid" />

      {/* 무료 등록 CTA 밴드 */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-20 pt-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 px-10 py-14 text-white">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-2xl font-bold sm:text-3xl">{t('ctaTitle')}</h2>
            <p className="mt-2 text-blue-100">{t('ctaDesc')}</p>
            <Link
              href={postHref}
              className="mt-6 inline-block rounded-xl bg-white px-6 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              {t('ctaButton')}
            </Link>
          </div>
          <svg
            viewBox="0 0 24 24"
            className="absolute -bottom-6 right-6 h-48 w-48 text-white/15"
            fill="currentColor"
          >
            <path d="M12 3l9 7h-2v9h-5v-6h-4v6H5v-9H3l9-7z" />
          </svg>
        </div>
      </section>
    </div>
  );
}
