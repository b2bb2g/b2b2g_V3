// 제품요청글(RFQ) 공개 목록(5.7). 마스킹 뷰로 listed 만, 작성자 식별정보 비노출.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { listListedRequests } from '@/lib/requests/queries';
import { formatBudget } from '@/lib/requests/labels';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageShell } from '@/components/ui/PageShell';
import { PageHeader } from '@/components/ui/PageHeader';

export default async function RequestsPage() {
  const t = await getTranslations('requests');
  const requests = await listListedRequests();

  return (
    <PageShell>
      <PageHeader title={t('title')} description={t('intro')} />

      {requests.length === 0 ? (
        <EmptyState message={t('empty')} />
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {requests.map((r) => (
            <li key={r.id}>
              <Link
                href={`/requests/${r.id}`}
                className="flex flex-col gap-1 px-4 py-4 hover:bg-neutral-50"
              >
                <div className="flex items-center gap-2">
                  {r.is_pinned && (
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  )}
                  <span className="font-medium">{r.title}</span>
                  {r.buyer_verified && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">
                      {t('verifiedBuyer')}
                    </span>
                  )}
                </div>
                <span className="text-xs text-neutral-500">
                  {[r.target_country, formatBudget(r.budget, r.qty)].filter(Boolean).join(' · ')}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}
