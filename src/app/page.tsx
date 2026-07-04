// 랜딩(홈). 히어로 + 추천제품 진열 + 광고배너·팝업(6.3/6.5/6.6). 문구는 언어팩에서만 참조(0.1 규칙).
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { listPublicProducts } from '@/lib/products/queries';
import { publicImageUrl } from '@/lib/products/media';
import { getTopPopup } from '@/lib/marketing/queries';
import { getPlatformStats } from '@/lib/stats/queries';
import { BannerSlot } from '@/components/BannerSlot';
import { Popup } from '@/components/Popup';
import { MobileHome } from '@/components/mobile/MobileHome';
import type { PopupTarget } from '@/lib/supabase/database.types';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const t = await getTranslations('home');
  const { q } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 팝업 노출 대상(비회원/역할별) 판별.
  let target: PopupTarget = 'guest';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    const role = profile?.role;
    target = role === 'buyer' || role === 'supplier' || role === 'agent' ? role : 'all';
  }

  const [popup, products, stats] = await Promise.all([
    getTopPopup(target),
    listPublicProducts(),
    getPlatformStats(),
  ]);
  const featured = products.slice(0, 8);

  // 개인정보 없는 집계 신호. 0 인 항목은 숨겨 초기 단계에도 자연스럽게.
  const signals = [
    { value: stats.verifiedSuppliers, label: t('statSuppliers') },
    { value: stats.listedProducts, label: t('statProducts') },
    { value: stats.openRequests, label: t('statRequests') },
    { value: stats.recentInquiries, label: t('statInquiries') },
  ].filter((s) => s.value > 0);

  return (
    <>
      {/* 모바일: 앱 셸 홈(로그인 전/후 분기·실시간 검색·카테고리·프로모·Featured) */}
      <MobileHome featured={featured} q={q} />

      {/* 데스크톱: 기존 랜딩 유지 */}
      <div className="hidden md:block">
      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="mx-auto flex max-w-5xl flex-col gap-5 px-6 py-16">
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            {t('heroTitle')}
          </h1>
          <p className="max-w-xl text-lg text-neutral-600">{t('heroSubtitle')}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/commercial"
              className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white"
            >
              {t('browseProducts')}
            </Link>
            {!user && (
              <Link
                href="/auth/login"
                className="rounded-md border border-neutral-300 px-5 py-2.5 text-sm font-medium hover:border-neutral-400"
              >
                {t('signIn')}
              </Link>
            )}
          </div>

          {signals.length > 0 && (
            <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
              {signals.map((s) => (
                <div key={s.label} className="flex flex-col">
                  <dt className="text-2xl font-bold tabular-nums">{s.value.toLocaleString()}</dt>
                  <dd className="text-xs text-neutral-500">{s.label}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      <BannerSlot placement="hero" />

      {featured.length > 0 && (
        <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-12">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-semibold">{t('featured')}</h2>
            <Link href="/commercial" className="text-sm text-neutral-500 underline">
              {t('viewAll')}
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/products/${p.id}`}
                  className="flex h-full flex-col gap-2 rounded-xl border border-neutral-200 p-3 transition hover:border-neutral-400 hover:shadow-sm"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-100">
                    {p.primaryImagePath && (
                      <Image
                        src={publicImageUrl(p.primaryImagePath)}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 50vw, 220px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <span className="line-clamp-1 text-sm font-medium">{p.title}</span>
                  <span className="line-clamp-1 text-xs text-neutral-500">{p.companyName}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="pb-16">
        <BannerSlot placement="mid" />
      </div>
      </div>

      <Popup popup={popup} />
    </>
  );
}
