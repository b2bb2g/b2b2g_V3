// 관리자 이메일 발송 로그(email_outbox). 발송 상태·실패 사유 열람(읽기 전용). RLS(is_admin).
import { getTranslations } from 'next-intl/server';
import { listEmailOutbox } from '@/lib/admin/extra-queries';
import { EmptyState } from '@/components/ui/EmptyState';

const STATUS_STYLE: Record<string, string> = {
  queued: 'bg-neutral-100 text-neutral-600',
  sent: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-100 text-red-700',
};

export default async function AdminEmailsPage() {
  const t = await getTranslations('admin');
  const rows = await listEmailOutbox(100);

  return (
    <>
      <h1 className="text-2xl font-bold">{t('emails')}</h1>

      {rows.length === 0 ? (
        <EmptyState message={t('queueEmpty')} />
      ) : (
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <ul className="flex flex-col divide-y divide-neutral-100">
            {rows.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-3 px-4 py-3 text-sm">
                <div className="flex min-w-0 flex-col">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLE[e.status] ?? ''}`}>
                      {e.status}
                    </span>
                    <span className="truncate font-medium">{e.to_email}</span>
                  </div>
                  <span className="truncate text-xs text-neutral-400">
                    {e.template}
                    {e.error ? ` · ${e.error}` : ''}
                  </span>
                </div>
                <span className="shrink-0 text-xs text-neutral-400">
                  {e.created_at.slice(0, 16).replace('T', ' ')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
