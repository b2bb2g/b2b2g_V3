// 관리자 대시보드. 환영 배너 + 컬러 스탯 카드 + 처리 대기 + 최근 활동. 네비는 사이드바(layout)가 담당.
import Link from 'next/link';
import { type ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { approvalCounts, listRecentAuditLogs } from '@/lib/admin/queries';
import { getPlatformStats } from '@/lib/stats/queries';

// 단색 선 아이콘(이모지 미사용).
const IconUser = (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" strokeLinecap="round" />
  </svg>
);
const IconBox = (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 7l9-4 9 4v10l-9 4-9-4V7z" strokeLinejoin="round" />
    <path d="M3 7l9 4 9-4M12 11v10" />
  </svg>
);
const IconDoc = (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
    <path d="M6 3h8l4 4v14H6V3z" strokeLinejoin="round" />
    <path d="M14 3v4h4M9 12h6M9 16h6" strokeLinecap="round" />
  </svg>
);
const IconChat = (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 5h16v11H9l-4 3v-3H4V5z" strokeLinejoin="round" />
  </svg>
);

export default async function AdminPage() {
  const t = await getTranslations('admin');
  const th = await getTranslations('home');
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from('profiles').select('display_name').eq('id', user.id).single()
    : { data: null };

  const [counts, stats, activity] = await Promise.all([
    approvalCounts(),
    getPlatformStats(),
    listRecentAuditLogs(8),
  ]);

  const cards: { label: string; value: number; icon: ReactNode; wrap: string }[] = [
    { label: th('statSuppliers'), value: stats.verifiedSuppliers, icon: IconUser, wrap: 'bg-emerald-50 text-emerald-600' },
    { label: th('statProducts'), value: stats.listedProducts, icon: IconBox, wrap: 'bg-blue-50 text-blue-600' },
    { label: th('statRequests'), value: stats.openRequests, icon: IconDoc, wrap: 'bg-violet-50 text-violet-600' },
    { label: th('statInquiries'), value: stats.recentInquiries, icon: IconChat, wrap: 'bg-amber-50 text-amber-600' },
  ];

  const queue = [
    { href: '/admin/products', label: t('pendingProducts'), count: counts.products },
    { href: '/admin/suppliers', label: t('pendingSuppliers'), count: counts.suppliers },
    { href: '/admin/inquiries', label: t('newInquiries'), count: counts.inquiries },
  ];

  return (
    <main className="flex flex-col gap-6">
      {/* 환영 배너 */}
      <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white shadow-sm shadow-violet-600/20">
        <h1 className="text-2xl font-bold tracking-tight">
          {t('welcomeBack', { name: profile?.display_name ?? t('title') })}
        </h1>
        <p className="mt-1 text-sm text-violet-100">{t('overview')}</p>
      </div>

      {/* 스탯 카드 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className={`flex h-11 w-11 items-center justify-center rounded-full ${c.wrap}`}>
              {c.icon}
            </span>
            <div className="flex flex-col">
              <span className="text-2xl font-bold tabular-nums">{c.value.toLocaleString()}</span>
              <span className="text-xs text-neutral-500">{c.label}</span>
            </div>
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
                  className={`flex items-center justify-between rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow ${
                    active ? 'border-amber-300 bg-amber-50' : 'border-neutral-200 hover:border-neutral-400'
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
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            {activity.length === 0 ? (
              <p className="text-sm text-neutral-400">{t('noActivity')}</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {activity.map((a) => (
                  <li key={a.id} className="flex items-start gap-3 text-sm">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-500" aria-hidden />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-neutral-700">
                        {a.action} · {a.target_table}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {a.created_at.slice(5, 16).replace('T', ' ')}
                      </span>
                    </div>
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
