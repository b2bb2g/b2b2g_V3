// 내 제품요청글 목록(바이어/에이전트). 상태 표시 + 새 요청 진입점.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { listMyRequests } from '@/lib/requests/queries';
import { STATUS_KEY, formatBudget } from '@/lib/requests/labels';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function MyRequestsPage() {
  const t = await getTranslations('requests');
  const requests = await listMyRequests();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('myTitle')}</h1>
        <Link
          href="/dashboard/requests/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          {t('new')}
        </Link>
      </div>

      {requests.length === 0 ? (
        <EmptyState message={t('myEmpty')} />
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {requests.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex flex-col">
                <span className="font-medium">{r.title}</span>
                <span className="text-xs text-neutral-500">
                  {t(STATUS_KEY[r.status])}
                  {formatBudget(r.budget, r.qty) ? ` · ${formatBudget(r.budget, r.qty)}` : ''}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
