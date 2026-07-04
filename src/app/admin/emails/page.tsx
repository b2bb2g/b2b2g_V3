// 관리자 이메일 발송 로그(email_outbox). 상태·실패 사유 열람(테이블·페이지네이션). RLS(is_admin).
import { getTranslations } from 'next-intl/server';
import { listEmailOutbox } from '@/lib/admin/extra-queries';
import { EmptyState } from '@/components/ui/EmptyState';
import { DataTable } from '@/components/admin/DataTable';
import { Pagination } from '@/components/admin/Pagination';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  queued: 'neutral',
  sent: 'success',
  failed: 'danger',
};

export default async function AdminEmailsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const t = await getTranslations('admin');
  const sp = await searchParams;
  const { rows, total, page, pageSize } = await listEmailOutbox(Number(sp.page) || 1);

  return (
    <>
      <h1 className="text-2xl font-bold">{t('emails')}</h1>

      {rows.length === 0 ? (
        <EmptyState message={t('queueEmpty')} />
      ) : (
        <>
          <DataTable
            columns={[
              { key: 'status', label: t('status') },
              { key: 'to', label: t('recipient') },
              { key: 'template', label: t('template') },
              { key: 'time', label: t('time'), className: 'text-right' },
            ]}
            rows={rows.map((e) => ({
              id: e.id,
              cells: [
                <Badge key="s" variant={STATUS_VARIANT[e.status] ?? 'neutral'}>
                  {e.status}
                </Badge>,
                <span key="to" className="font-medium">
                  {e.to_email}
                </span>,
                <span key="t" className="text-neutral-500">
                  {e.template}
                  {e.error ? <span className="ml-2 text-red-500">{e.error}</span> : null}
                </span>,
                <span key="d" className="block text-right text-xs text-neutral-400">
                  {e.created_at.slice(0, 16).replace('T', ' ')}
                </span>,
              ],
            }))}
          />
          <Pagination
            page={page}
            total={total}
            pageSize={pageSize}
            basePath="/admin/emails"
            params={{}}
            prevLabel={t('prev')}
            nextLabel={t('next')}
          />
        </>
      )}
    </>
  );
}
