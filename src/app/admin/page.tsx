// 관리자 대시보드. 현황 스탯 + 처리 대기(주의 강조) + 최근 활동. 네비는 사이드바(layout)가 담당.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { approvalCounts, listRecentAuditLogs } from '@/lib/admin/queries';
import { getPlatformStats } from '@/lib/stats/queries';

export default async function AdminPage() {
  const t = await getTranslations('admin');
  const th = await getTranslations('home');
  const [counts, stats, activity] = await Promise.all([
    approvalCounts(),
    getPlatformStats(),
    listRecentAuditLogs(8),
  ]);

  const overview = [
    { label: th('statSuppliers'), value: stats.verifiedSuppliers, accent: 'bg-emerald-500' },
    { label: th('statProducts'), value: stats.listedProducts, accent: 'bg-blue-500' },
    { label: th('statRequests'), value: stats.openRequests, accent: 'bg-violet-500' },
    { label: th('statInquiries'), value: stats.recentInquiries, accent: 'bg-amber-500' },
  ];

  const queue = [
    { href: '/admin/products', label: t('pendingProducts'), count: counts.products },
    { href: '/admin/suppliers', label: t('pendingSuppliers'), count: counts.suppliers },
    { href: '/admin/inquiries', label: t('newInquiries'), count: counts.inquiries },
  ];

  return (
    <main className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-sm text-neutral-500">{t('overview')}</p>
      </div>

      {/* 현황 스탯 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {overview.map((s) => (
          <div key={s.label} className="flex flex-col gap-2 rounded-xl border border-neutral-200 p-5">
            <span className={`h-1.5 w-8 rounded-full ${s.accent}`} aria-hidden />
            <span className="text-2xl font-bold tabular-nums">{s.value.toLocaleString()}</span>
            <span className="text-xs text-neutral-500">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 처리 대기 */}
        <section className="flex flex-col gap-3 lg:col-span-2">
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

        {/* 최근 활동 */}
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-neutral-500">{t('recentActivity')}</h2>
          <div className="flex flex-col gap-2 rounded-xl border border-neutral-200 p-4">
            {activity.length === 0 ? (
              <p className="text-sm text-neutral-400">{t('noActivity')}</p>
            ) : (
              <ul className="flex flex-col divide-y divide-neutral-100">
                {activity.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                    <span className="truncate text-neutral-700">
                      {a.action} · {a.target_table}
                    </span>
                    <span className="shrink-0 text-xs text-neutral-400">
                      {a.created_at.slice(5, 16).replace('T', ' ')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
