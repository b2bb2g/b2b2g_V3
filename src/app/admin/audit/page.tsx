// 관리자 감사 로그(전체). 관리 작업 이력(테이블·페이지네이션, 읽기 전용). RLS(is_admin).
import { getTranslations } from 'next-intl/server';
import { listAllAuditLogs } from '@/lib/admin/extra-queries';
import { EmptyState } from '@/components/ui/EmptyState';
import { DataTable } from '@/components/admin/DataTable';
import { Pagination } from '@/components/admin/Pagination';
import { Badge } from '@/components/ui/Badge';

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const t = await getTranslations('admin');
  const sp = await searchParams;
  const { rows, total, page, pageSize } = await listAllAuditLogs(Number(sp.page) || 1);

  return (
    <>
      <h1 className="text-2xl font-bold">{t('audit')}</h1>

      {rows.length === 0 ? (
        <EmptyState message={t('noActivity')} />
      ) : (
        <>
          <DataTable
            columns={[
              { key: 'action', label: t('action') },
              { key: 'target', label: t('target') },
              { key: 'time', label: t('time'), className: 'text-right' },
            ]}
            rows={rows.map((l) => ({
              id: l.id,
              cells: [
                <Badge key="a" variant="accent">
                  {l.action}
                </Badge>,
                <div key="t" className="flex min-w-0 flex-col">
                  <span className="font-medium">{l.target_table}</span>
                  <span className="truncate text-xs text-neutral-400">
                    {l.target_id ?? ''} {l.after ? `· ${JSON.stringify(l.after)}` : ''}
                  </span>
                </div>,
                <span key="d" className="block text-right text-xs text-neutral-400">
                  {l.created_at.slice(0, 16).replace('T', ' ')}
                </span>,
              ],
            }))}
          />
          <Pagination
            page={page}
            total={total}
            pageSize={pageSize}
            basePath="/admin/audit"
            params={{}}
            prevLabel={t('prev')}
            nextLabel={t('next')}
          />
        </>
      )}
    </>
  );
}
