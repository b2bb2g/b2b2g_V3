// 관리자 회원 상세·전권. 역할·상태·메모 변경(각 변경은 감사로그 기록), 변경 이력 표시.
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import {
  getMemberDetail,
  getSupplierByProfile,
  listMemberAuditLogs,
} from '@/lib/admin/queries';
import {
  changeMemberRole,
  changeMemberStatus,
  updateMemberMemo,
  updateSupplierGrade,
} from '@/lib/admin/actions';
import { USER_ROLES, USER_STATUSES } from '@/lib/constants';

export default async function AdminMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations('admin');
  const { id } = await params;
  const [member, logs] = await Promise.all([getMemberDetail(id), listMemberAuditLogs(id)]);
  if (!member) notFound();

  const supplier = member.role === 'supplier' ? await getSupplierByProfile(id) : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-16">
      <Link href="/admin/members" className="text-sm text-neutral-500 underline">
        {t('backToMembers')}
      </Link>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">{member.display_name}</h1>
        <p className="text-sm text-neutral-500">{member.email}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form
          action={changeMemberRole.bind(null, id, null)}
          className="flex flex-col gap-1 text-sm"
        >
          <span className="text-neutral-500">{t('role')}</span>
          <div className="flex gap-2">
            <select
              name="role"
              defaultValue={member.role}
              className="rounded-md border border-neutral-300 px-3 py-2"
            >
              {USER_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-md border border-neutral-300 px-3 py-2 font-medium"
            >
              {t('save')}
            </button>
          </div>
        </form>

        <form
          action={changeMemberStatus.bind(null, id, null)}
          className="flex flex-col gap-1 text-sm"
        >
          <span className="text-neutral-500">{t('status')}</span>
          <div className="flex gap-2">
            <select
              name="status"
              defaultValue={member.status}
              className="rounded-md border border-neutral-300 px-3 py-2"
            >
              {USER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-md border border-neutral-300 px-3 py-2 font-medium"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </div>

      {supplier && (
        <form
          action={updateSupplierGrade.bind(null, supplier.id, id, null)}
          className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-4 text-sm"
        >
          <span className="font-semibold text-neutral-600">{t('supplierGrade')}</span>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2">
              <span className="text-neutral-500">{t('tier')}</span>
              <select
                name="tier"
                defaultValue={supplier.tier}
                className="rounded-md border border-neutral-300 px-3 py-2"
              >
                <option value="free">{t('tierFree')}</option>
                <option value="paid">{t('tierPaid')}</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="verified" defaultChecked={supplier.verified} />
              {t('verifiedBadge')}
            </label>
            <button
              type="submit"
              className="rounded-md border border-neutral-300 px-3 py-2 font-medium"
            >
              {t('save')}
            </button>
          </div>
        </form>
      )}

      <form action={updateMemberMemo.bind(null, id, null)} className="flex flex-col gap-1 text-sm">
        <span className="text-neutral-500">{t('memo')}</span>
        <textarea
          name="memo"
          rows={3}
          defaultValue={member.memo ?? ''}
          className="rounded-md border border-neutral-300 px-3 py-2"
        />
        <button
          type="submit"
          className="w-fit rounded-md border border-neutral-300 px-3 py-2 font-medium"
        >
          {t('save')}
        </button>
      </form>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-neutral-500">{t('auditLog')}</h2>
        {logs.length > 0 && (
          <ul className="flex flex-col gap-1 text-xs text-neutral-600">
            {logs.map((l) => (
              <li key={l.id} className="rounded bg-neutral-50 px-3 py-2">
                {l.created_at.slice(0, 19).replace('T', ' ')} · {l.action} ·{' '}
                {JSON.stringify(l.after)}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
