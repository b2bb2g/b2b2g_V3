// 관리자 콘솔. 플랫폼 현황 + 처리 대기 큐(주의 강조) + 관리 메뉴 그룹. 접근은 proxy(admin) + RLS 이중.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { approvalCounts } from '@/lib/admin/queries';
import { getPlatformStats } from '@/lib/stats/queries';
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
  const [counts, stats] = await Promise.all([approvalCounts(), getPlatformStats()]);

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
      heading: t('groupContent'),
      links: [
        { href: '/admin/notices', label: tc('manageNotices') },
        { href: '/admin/faq', label: tc('manageFaq') },
        { href: '/admin/events', label: te('manage') },
        { href: '/admin/epc', label: tp('manage') },
        { href: '/admin/requests', label: tr('manage') },
        { href: '/admin/services', label: tsv('manage') },
      ],
    },
    {
      heading: t('groupCreate'),
      links: [
        { href: '/admin/products/new', label: t('createProduct') },
        { href: '/dashboard/requests/new', label: t('createRequest') },
      ],
    },
    {
      heading: t('groupSite'),
      links: [
        { href: '/admin/categories', label: tcat('manage') },
        { href: '/admin/menu', label: tm('manage') },
        { href: '/admin/banners', label: tmk('banners') },
        { href: '/admin/popups', label: tmk('popups') },
      ],
    },
  ];

  return (
    <PageShell width="wide">
      <PageHeader title={t('title')} description={t('overview')} />

      {/* 처리 대기 큐 — 건수가 있으면 주의 색으로 강조. */}
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

      {/* 관리 메뉴. */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {groups.map((g) => (
          <section key={g.heading} className="flex flex-col gap-2 rounded-xl border border-neutral-200 p-5">
            <h2 className="text-sm font-semibold text-neutral-500">{g.heading}</h2>
            <nav className="flex flex-col">
              {g.links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="py-1.5 text-sm text-neutral-600 hover:text-neutral-900"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
