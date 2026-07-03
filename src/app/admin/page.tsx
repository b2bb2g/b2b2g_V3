// 관리자 콘솔. 전 기능 관리 허브: 현황 + 처리 대기 + 모든 관리 화면 진입점. 접근은 proxy(admin) + RLS 이중.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { approvalCounts } from '@/lib/admin/queries';
import { getPlatformStats } from '@/lib/stats/queries';
import { listTopCategories } from '@/lib/products/queries';
import { PageShell } from '@/components/ui/PageShell';
import { PageHeader } from '@/components/ui/PageHeader';

export default async function AdminPage() {
  const t = await getTranslations('admin');
  const th = await getTranslations('home');
  const tc = await getTranslations('content');
  const te = await getTranslations('events');
  const tp = await getTranslations('epc');
  const tr = await getTranslations('requests');
  const tm = await getTranslations('menu');
  const tsv = await getTranslations('services');
  const tmk = await getTranslations('marketing');
  const tcat = await getTranslations('categories');
  const [counts, stats, sections] = await Promise.all([
    approvalCounts(),
    getPlatformStats(),
    listTopCategories(),
  ]);

  const queue = [
    { href: '/admin/products', label: t('pendingProducts'), count: counts.products },
    { href: '/admin/suppliers', label: t('pendingSuppliers'), count: counts.suppliers },
    { href: '/admin/inquiries', label: t('newInquiries'), count: counts.inquiries },
  ];

  const overview = [
    { label: th('statSuppliers'), value: stats.verifiedSuppliers },
    { label: th('statProducts'), value: stats.listedProducts },
    { label: th('statRequests'), value: stats.openRequests },
    { label: th('statInquiries'), value: stats.recentInquiries },
  ];

  const groups: { heading: string; links: { href: string; label: string }[] }[] = [
    {
      heading: t('groupMembers'),
      links: [
        { href: '/admin/members', label: t('manageMembers') },
        { href: '/admin/suppliers', label: t('pendingSuppliers') },
      ],
    },
    {
      heading: t('groupCatalog'),
      links: [
        { href: '/admin/products', label: t('manageProducts') },
        // 섹션(Commercial/Industrial 등)별 등록 링크.
        ...sections.map((s) => ({
          href: `/admin/products/new?group=${s.id}`,
          label: t('createProductIn', { section: s.name }),
        })),
        { href: '/admin/categories', label: tcat('manage') },
      ],
    },
    {
      heading: t('groupContent'),
      links: [
        { href: '/admin/notices', label: tc('manageNotices') },
        { href: '/admin/faq', label: tc('manageFaq') },
        { href: '/admin/events', label: te('manage') },
        { href: '/admin/epc', label: tp('manage') },
        { href: '/admin/services', label: tsv('manage') },
      ],
    },
    {
      heading: t('groupSourcing'),
      links: [
        { href: '/admin/requests', label: tr('manage') },
        { href: '/dashboard/requests/new', label: t('createRequest') },
        { href: '/admin/inquiries', label: t('manageInquiries') },
      ],
    },
    {
      heading: t('groupSite'),
      links: [
        { href: '/admin/menu', label: tm('manage') },
        { href: '/admin/banners', label: tmk('banners') },
        { href: '/admin/popups', label: tmk('popups') },
      ],
    },
  ];

  return (
    <PageShell width="wide">
      <PageHeader title={t('title')} description={t('overview')} />

      {/* 처리 대기 — 건수>0 이면 주의 색으로 강조. */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-neutral-500">{t('pendingHeading')}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {queue.map((c) => {
            const active = c.count > 0;
            return (
              <Link
                key={c.href}
                href={c.href}
                className={`flex items-center justify-between rounded-xl border p-5 transition hover:shadow-sm ${
                  active
                    ? 'border-amber-300 bg-amber-50 hover:border-amber-400'
                    : 'border-neutral-200 hover:border-neutral-400'
                }`}
              >
                <span className={`text-sm ${active ? 'text-amber-800' : 'text-neutral-500'}`}>
                  {c.label}
                </span>
                <span className={`text-3xl font-bold ${active ? 'text-amber-700' : 'text-neutral-300'}`}>
                  {c.count}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 플랫폼 현황(집계). */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-neutral-500">{t('statsHeading')}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {overview.map((s) => (
            <div key={s.label} className="rounded-xl border border-neutral-200 p-5">
              <div className="text-2xl font-bold tabular-nums">{s.value.toLocaleString()}</div>
              <div className="text-xs text-neutral-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 전 기능 관리 진입점. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <section key={g.heading} className="flex flex-col gap-1 rounded-xl border border-neutral-200 p-5">
            <h2 className="mb-1 text-sm font-semibold text-neutral-500">{g.heading}</h2>
            {g.links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-md px-2 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
              >
                {l.label}
              </Link>
            ))}
          </section>
        ))}
      </div>
    </PageShell>
  );
}
