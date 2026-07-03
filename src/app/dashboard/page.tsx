// 역할별 대시보드(#5). 환영 헤더 + 승인상태 + 역할별 빠른작업 카드 + 추천 초대.
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { unreadNotificationCount } from '@/lib/notify/queries';
import { PageShell } from '@/components/ui/PageShell';
import { PageHeader } from '@/components/ui/PageHeader';
import { ShareWidget } from '@/components/ShareWidget';

type Card = { href: string; title: string; desc: string; badge?: number };

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');
  const tn = await getTranslations('nav');
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile) redirect('/auth/login');

  const notApproved = profile.role !== 'admin' && profile.status !== 'approved';
  const unread = await unreadNotificationCount();

  const cards: Card[] = [];
  if (profile.role === 'supplier') {
    cards.push(
      { href: '/dashboard/company', title: tn('myCompany'), desc: t('cardCompany') },
      { href: '/dashboard/products', title: tn('myProducts'), desc: t('cardProducts') },
      { href: '/dashboard/supplier-inquiries', title: tn('receivedInquiries'), desc: t('cardReceived') },
    );
  }
  if (profile.role === 'buyer' || profile.role === 'agent') {
    cards.push(
      { href: '/dashboard/inquiries', title: tn('myInquiries'), desc: t('cardInquiries') },
      { href: '/dashboard/requests', title: tn('myRequests'), desc: t('cardRequests') },
    );
  }
  if (profile.role === 'admin') {
    cards.push({ href: '/admin', title: tn('adminConsole'), desc: t('cardAdmin') });
  }
  cards.push({
    href: '/dashboard/notifications',
    title: tn('notifications'),
    desc: t('cardNotifications'),
    badge: unread,
  });

  return (
    <PageShell>
      <PageHeader
        title={t('greeting', { name: profile.display_name })}
        description={t('greetingSub')}
        action={
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
            {tn(`role_${profile.role}`)}
          </span>
        }
      />

      {notApproved && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t('pendingBanner')}
        </p>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group flex flex-col gap-1 rounded-xl border border-neutral-200 p-5 transition hover:border-neutral-400 hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{c.title}</span>
              {c.badge ? (
                <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-xs text-white">
                  {c.badge}
                </span>
              ) : (
                <span className="text-neutral-300 transition group-hover:text-neutral-500">→</span>
              )}
            </div>
            <span className="text-sm text-neutral-500">{c.desc}</span>
          </Link>
        ))}
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-5">
        <div className="flex flex-col gap-1">
          <h2 className="font-semibold">{t('referralTitle')}</h2>
          <p className="text-sm text-neutral-500">{t('referralDesc')}</p>
        </div>
        <ShareWidget targetType="signup_referral" targetId={null} refCode={profile.referral_code} />
      </section>
    </PageShell>
  );
}
