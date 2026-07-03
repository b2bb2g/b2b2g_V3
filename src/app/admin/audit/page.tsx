// 관리자 감사 로그(전체). 관리 작업 이력 열람(읽기 전용). RLS(is_admin).
import { getTranslations } from 'next-intl/server';
import { listAllAuditLogs } from '@/lib/admin/extra-queries';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function AdminAuditPage() {
  const t = await getTranslations('admin');
  const logs = await listAllAuditLogs(150);

  return (
    <>
      <h1 className="text-2xl font-bold">{t('audit')}</h1>

      {logs.length === 0 ? (
        <EmptyState message={t('noActivity')} />
      ) : (
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <ul className="flex flex-col divide-y divide-neutral-100">
            {logs.map((l) => (
              <li key={l.id} className="flex items-start justify-between gap-3 px-4 py-3 text-sm">
                <div className="flex min-w-0 flex-col">
                  <span className="font-medium">
                    <span className="mr-2 rounded bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-600">
                      {l.action}
                    </span>
                    {l.target_table}
                  </span>
                  <span className="truncate text-xs text-neutral-400">
                    {l.target_id ?? ''} {l.after ? `· ${JSON.stringify(l.after)}` : ''}
                  </span>
                </div>
                <span className="shrink-0 text-xs text-neutral-400">
                  {l.created_at.slice(0, 16).replace('T', ' ')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
