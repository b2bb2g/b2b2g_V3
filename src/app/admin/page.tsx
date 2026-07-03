// 관리자 대시보드. 승인 대기 개수 + 각 큐 진입점. 접근은 proxy(admin) + RLS 이중.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { approvalCounts } from '@/lib/admin/queries';

export default async function AdminPage() {
  const t = await getTranslations('admin');
  const counts = await approvalCounts();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-6 py-16">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-neutral-500">{t('overview')}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <QueueCard
            href="/admin/products"
            label={t('pendingProducts')}
            count={counts.products}
            cta={t('viewProducts')}
          />
          <QueueCard
            href="/admin/suppliers"
            label={t('pendingSuppliers')}
            count={counts.suppliers}
            cta={t('viewSuppliers')}
          />
        </div>
      </section>
    </main>
  );
}

function QueueCard({
  href,
  label,
  count,
  cta,
}: {
  href: string;
  label: string;
  count: number;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-5 hover:border-neutral-400"
    >
      <span className="text-sm text-neutral-600">{label}</span>
      <span className="text-3xl font-bold">{count}</span>
      <span className="text-sm text-neutral-900 underline">{cta}</span>
    </Link>
  );
}
