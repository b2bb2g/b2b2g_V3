// 관리자 콘솔. 승인 대기 큐 + 관리 메뉴 그룹. 접근은 proxy(admin) + RLS 이중.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { approvalCounts } from '@/lib/admin/queries';
import { PageShell } from '@/components/ui/PageShell';
import { PageHeader } from '@/components/ui/PageHeader';

export default async function AdminPage() {
  const t = await getTranslations('admin');
  const tc = await getTranslations('content');
  const te = await getTranslations('events');
  const tp = await getTranslations('epc');
  const tr = await getTranslations('requests');
  const tm = await getTranslations('menu');
  const tsv = await getTranslations('services');
  const tmk = await getTranslations('marketing');
  const counts = await approvalCounts();

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
        { href: '/admin/menu', label: tm('manage') },
        { href: '/admin/banners', label: tmk('banners') },
        { href: '/admin/popups', label: tmk('popups') },
      ],
    },
  ];

  return (
    <PageShell width="wide">
      <PageHeader title={t('title')} description={t('overview')} />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <QueueCard href="/admin/products" label={t('pendingProducts')} count={counts.products} />
        <QueueCard href="/admin/suppliers" label={t('pendingSuppliers')} count={counts.suppliers} />
        <QueueCard href="/admin/inquiries" label={t('newInquiries')} count={counts.inquiries} />
      </section>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {groups.map((g) => (
          <section key={g.heading} className="flex flex-col gap-2 rounded-xl border border-neutral-200 p-5">
            <h2 className="text-sm font-semibold text-neutral-500">{g.heading}</h2>
            <nav className="flex flex-col">
              {g.links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-center justify-between py-1.5 text-sm hover:text-neutral-900"
                >
                  <span>{l.label}</span>
                  <span className="text-neutral-300">→</span>
                </Link>
              ))}
            </nav>
          </section>
        ))}
      </div>
    </PageShell>
  );
}

function QueueCard({ href, label, count }: { href: string; label: string; count: number }) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-1 rounded-xl border border-neutral-200 p-5 hover:border-neutral-400 hover:shadow-sm"
    >
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="text-3xl font-bold">{count}</span>
    </Link>
  );
}
