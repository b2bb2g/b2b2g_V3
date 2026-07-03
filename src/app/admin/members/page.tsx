// 관리자 회원 목록. 역할·상태 필터 + 이름/이메일 검색(native GET 폼).
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { listMembers } from '@/lib/admin/queries';
import { USER_ROLES, USER_STATUSES } from '@/lib/constants';
import { EmptyState } from '@/components/ui/EmptyState';

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; status?: string; q?: string }>;
}) {
  const t = await getTranslations('admin');
  const { role, status, q } = await searchParams;
  const members = await listMembers({ role, status, q });

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-16">
      <h1 className="text-2xl font-bold">{t('members')}</h1>

      <form method="get" className="flex flex-wrap items-end gap-2 text-sm">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder={t('searchMembers')}
          className="rounded-md border border-neutral-300 px-3 py-2"
        />
        <select
          name="role"
          defaultValue={role ?? ''}
          className="rounded-md border border-neutral-300 px-3 py-2"
        >
          <option value="">{t('allRoles')}</option>
          {USER_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={status ?? ''}
          className="rounded-md border border-neutral-300 px-3 py-2"
        >
          <option value="">{t('allStatuses')}</option>
          {USER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-4 py-2 font-medium text-white"
        >
          {t('searchMembers')}
        </button>
      </form>

      {members.length === 0 ? (
        <EmptyState message={t('queueEmpty')} />
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {members.map((m) => (
            <li key={m.id}>
              <Link
                href={`/admin/members/${m.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-neutral-50"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{m.display_name}</span>
                  <span className="text-xs text-neutral-500">{m.email}</span>
                </div>
                <span className="text-xs text-neutral-500">
                  {m.role} · {m.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
