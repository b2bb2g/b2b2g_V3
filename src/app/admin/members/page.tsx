// 관리자 회원 목록. 실시간 검색 + 역할·상태 필터 + 테이블·페이지네이션.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { listMembers } from '@/lib/admin/queries';
import { USER_ROLES, USER_STATUSES } from '@/lib/constants';
import { EmptyState } from '@/components/ui/EmptyState';
import { DataTable } from '@/components/admin/DataTable';
import { Pagination } from '@/components/admin/Pagination';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { MemberSearch } from './MemberSearch';

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'danger',
  suspended: 'danger',
  withdrawn: 'neutral',
};

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; status?: string; q?: string; page?: string }>;
}) {
  const t = await getTranslations('admin');
  const tc = await getTranslations('common');
  const sp = await searchParams;
  const { role, status, q } = sp;
  const { rows, total, page, pageSize } = await listMembers({
    role,
    status,
    q,
    page: Number(sp.page) || 1,
  });

  return (
    <>
      <h1 className="text-2xl font-bold">{t('members')}</h1>

      <MemberSearch
        currentQ={q ?? ''}
        currentRole={role ?? ''}
        currentStatus={status ?? ''}
        roles={USER_ROLES}
        statuses={USER_STATUSES}
      />

      {rows.length === 0 ? (
        <EmptyState message={t('queueEmpty')} />
      ) : (
        <>
          <DataTable
            columns={[
              { key: 'name', label: t('name') },
              { key: 'email', label: tc('email') },
              { key: 'role', label: t('role') },
              { key: 'status', label: t('status') },
            ]}
            rows={rows.map((m) => ({
              id: m.id,
              cells: [
                <Link key="n" href={`/admin/members/${m.id}`} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600">
                    {(m.display_name?.[0] ?? '?').toUpperCase()}
                  </span>
                  <span className="font-medium hover:underline">{m.display_name}</span>
                </Link>,
                <span key="e" className="text-neutral-500">
                  {m.email}
                </span>,
                <Badge key="r" variant="accent">
                  {m.role}
                </Badge>,
                <Badge key="s" variant={STATUS_VARIANT[m.status] ?? 'neutral'}>
                  {m.status}
                </Badge>,
              ],
            }))}
          />
          <Pagination
            page={page}
            total={total}
            pageSize={pageSize}
            basePath="/admin/members"
            params={{ role, status, q }}
            prevLabel={t('prev')}
            nextLabel={t('next')}
          />
        </>
      )}
    </>
  );
}
