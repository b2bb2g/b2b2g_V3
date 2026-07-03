// 관리자 회원 목록. 실시간 검색(#3) + 역할·상태 필터.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { listMembers } from '@/lib/admin/queries';
import { USER_ROLES, USER_STATUSES } from '@/lib/constants';
import { EmptyState } from '@/components/ui/EmptyState';
import { MemberSearch } from './MemberSearch';

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; status?: string; q?: string }>;
}) {
  const t = await getTranslations('admin');
  const { role, status, q } = await searchParams;
  const members = await listMembers({ role, status, q });

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

      {members.length === 0 ? (
        <EmptyState message={t('queueEmpty')} />
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 rounded-xl border border-neutral-200">
          {members.map((m) => (
            <li key={m.id}>
              <Link
                href={`/admin/members/${m.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-neutral-50"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600">
                    {(m.display_name?.[0] ?? '?').toUpperCase()}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-medium">{m.display_name}</span>
                    <span className="text-xs text-neutral-500">{m.email}</span>
                  </div>
                </div>
                <span className="text-xs text-neutral-500">
                  {m.role} · {m.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
