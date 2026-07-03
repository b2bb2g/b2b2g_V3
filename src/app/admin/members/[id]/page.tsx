// 관리자 회원 상세·전권. 역할·상태·메모·공급사 등급 변경(각 변경 감사로그), 변경 이력. 카드 UI로 통일.
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
import { Badge, type BadgeVariant } from '@/components/ui/Badge';

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'danger',
  suspended: 'danger',
  withdrawn: 'neutral',
};

const input = 'rounded-md border border-neutral-300 px-3 py-2 text-sm';
const card = 'flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm';
const saveBtn = 'rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white';

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
    <>
      <Link href="/admin/members" className="text-sm text-neutral-500 underline">
        {t('backToMembers')}
      </Link>

      {/* 헤더: 아바타 + 이름·이메일 + 역할/상태 배지 */}
      <div className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-lg font-semibold text-neutral-600">
          {(member.display_name?.[0] ?? '?').toUpperCase()}
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="truncate text-xl font-bold">{member.display_name}</h1>
          <p className="truncate text-sm text-neutral-500">{member.email}</p>
          <div className="mt-1 flex flex-wrap gap-2">
            <Badge variant="accent">{member.role}</Badge>
            <Badge variant={STATUS_VARIANT[member.status] ?? 'neutral'}>{member.status}</Badge>
          </div>
        </div>
      </div>

      {/* 역할·상태 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form action={changeMemberRole.bind(null, id, null)} className={card}>
          <span className="text-sm font-semibold text-neutral-500">{t('role')}</span>
          <div className="flex gap-2">
            <select name="role" defaultValue={member.role} className={`${input} flex-1`}>
              {USER_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <button type="submit" className={saveBtn}>
              {t('save')}
            </button>
          </div>
        </form>

        <form action={changeMemberStatus.bind(null, id, null)} className={card}>
          <span className="text-sm font-semibold text-neutral-500">{t('status')}</span>
          <div className="flex gap-2">
            <select name="status" defaultValue={member.status} className={`${input} flex-1`}>
              {USER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button type="submit" className={saveBtn}>
              {t('save')}
            </button>
          </div>
        </form>
      </div>

      {/* 공급사 등급·인증 */}
      {supplier && (
        <form action={updateSupplierGrade.bind(null, supplier.id, id, null)} className={card}>
          <span className="text-sm font-semibold text-neutral-500">{t('supplierGrade')}</span>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-neutral-500">{t('tier')}</span>
              <select name="tier" defaultValue={supplier.tier} className={input}>
                <option value="free">{t('tierFree')}</option>
                <option value="paid">{t('tierPaid')}</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="verified" defaultChecked={supplier.verified} />
              {t('verifiedBadge')}
            </label>
            <button type="submit" className={saveBtn}>
              {t('save')}
            </button>
          </div>
        </form>
      )}

      {/* 메모 */}
      <form action={updateMemberMemo.bind(null, id, null)} className={card}>
        <span className="text-sm font-semibold text-neutral-500">{t('memo')}</span>
        <textarea name="memo" rows={3} defaultValue={member.memo ?? ''} className={input} />
        <button type="submit" className={`${saveBtn} w-fit`}>
          {t('save')}
        </button>
      </form>

      {/* 변경 이력 */}
      <section className={card}>
        <span className="text-sm font-semibold text-neutral-500">{t('auditLog')}</span>
        {logs.length === 0 ? (
          <p className="text-sm text-neutral-400">{t('noActivity')}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-neutral-100 text-xs text-neutral-600">
            {logs.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-2 py-2">
                <span className="truncate">
                  {l.action} · {JSON.stringify(l.after)}
                </span>
                <span className="shrink-0 text-neutral-400">
                  {l.created_at.slice(0, 16).replace('T', ' ')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
