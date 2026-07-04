// 관리자 초대 관리. 역할별 초대 링크 복사 + 이메일 직접 초대 + 전체 회원 초대 트리(referred_by).
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getInviteContext, getReferralTree, type TreeNode } from '@/lib/admin/invite-queries';
import { qrDataUrl } from '@/lib/shortlinks/qr';
import { CopyLink } from '@/components/admin/CopyLink';
import { InviteEmailForm } from '@/components/admin/InviteEmailForm';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'danger',
  suspended: 'danger',
  withdrawn: 'neutral',
};

function TreeList({ nodes }: { nodes: TreeNode[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {nodes.map((n) => (
        <li key={n.id}>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" aria-hidden />
            <Link href={`/admin/members/${n.id}`} className="font-medium hover:underline">
              {n.display_name}
            </Link>
            <span className="text-neutral-400">{n.email}</span>
            <Badge variant="accent">{n.role}</Badge>
            <Badge variant={STATUS_VARIANT[n.status] ?? 'neutral'}>{n.status}</Badge>
          </div>
          {n.children.length > 0 && (
            <div className="mt-2 ml-4 border-l border-neutral-200 pl-4">
              <TreeList nodes={n.children} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default async function AdminInvitesPage() {
  const t = await getTranslations('admin');
  const tn = await getTranslations('nav');
  const { referralCode, siteUrl } = await getInviteContext();
  const tree = await getReferralTree();

  const linkFor = (role: string) =>
    referralCode
      ? `${siteUrl}/auth/signup?ref=${encodeURIComponent(referralCode)}&role=${role}`
      : `${siteUrl}/auth/signup?role=${role}`;

  const linkRoles = await Promise.all(
    [
      { value: 'supplier', label: tn('role_supplier') },
      { value: 'buyer', label: tn('role_buyer') },
    ].map(async (r) => {
      const url = linkFor(r.value);
      return { ...r, url, qr: await qrDataUrl(url) };
    }),
  );
  const emailRoles = [
    { value: 'buyer', label: tn('role_buyer') },
    { value: 'supplier', label: tn('role_supplier') },
    { value: 'agent', label: tn('role_agent') },
  ];

  return (
    <>
      <h1 className="text-2xl font-bold">{t('invites')}</h1>

      <section className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-sm font-semibold text-neutral-700">{t('inviteLinkTitle')}</h2>
          <p className="mt-1 text-sm text-neutral-500">{t('inviteLinkDesc')}</p>
        </div>
        <div className="flex flex-col gap-4">
          {linkRoles.map((r) => (
            <div key={r.value} className="flex flex-col gap-1">
              <span className="text-xs font-medium text-neutral-500">{r.label}</span>
              <CopyLink url={r.url} qr={r.qr} />
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-sm font-semibold text-neutral-700">{t('inviteEmailTitle')}</h2>
          <p className="mt-1 text-sm text-neutral-500">{t('inviteEmailDesc')}</p>
        </div>
        <InviteEmailForm roles={emailRoles} />
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-700">{t('inviteTreeTitle')}</h2>
        {tree.length === 0 ? <EmptyState message={t('inviteEmpty')} /> : <TreeList nodes={tree} />}
      </section>
    </>
  );
}
