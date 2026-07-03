// 에이전트 산하 바이어 목록. 에이전트 전용. 거래금액·연락처는 노출하지 않음(관리자 중개).
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { listMyBuyers } from '@/lib/agent/queries';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageShell } from '@/components/ui/PageShell';
import { PageHeader } from '@/components/ui/PageHeader';

export default async function MyBuyersPage() {
  const t = await getTranslations('buyers');
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'agent') redirect('/dashboard');

  const buyers = await listMyBuyers();

  return (
    <PageShell>
      <PageHeader title={t('title')} description={t('intro')} />

      {buyers.length === 0 ? (
        <EmptyState message={t('empty')} />
      ) : (
        <ul className="flex flex-col divide-y divide-neutral-200 rounded-xl border border-neutral-200">
          {buyers.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600">
                  {(b.display_name?.[0] ?? '').toUpperCase()}
                </span>
                <div className="flex flex-col">
                  <span className="font-medium">{b.display_name}</span>
                  <span className="text-xs text-neutral-500">{b.created_at.slice(0, 10)}</span>
                </div>
              </div>
              <span className="text-xs text-neutral-500">{t(`status_${b.status}`)}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-neutral-400">{t('privacyNote')}</p>
    </PageShell>
  );
}
