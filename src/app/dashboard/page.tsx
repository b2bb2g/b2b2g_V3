// 대시보드. 역할별 진입점. 공급사는 승인 전에도 온보딩(회사정보·제품 준비) 가능.
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from '@/components/LogoutButton';

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');
  const ts = await getTranslations('supplier');
  const ti = await getTranslations('inquiry');
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile) {
    redirect('/auth/login');
  }

  const isSupplier = profile.role === 'supplier';
  const isBuyerOrAgent = profile.role === 'buyer' || profile.role === 'agent';
  const notApproved = profile.role !== 'admin' && profile.status !== 'approved';

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-lg">{t('welcome', { name: profile.display_name })}</p>
        <dl className="flex gap-8 text-sm">
          <div className="flex flex-col gap-1">
            <dt className="text-neutral-500">{t('roleLabel')}</dt>
            <dd className="font-medium">{profile.role}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-neutral-500">{t('statusLabel')}</dt>
            <dd className="font-medium">{profile.status}</dd>
          </div>
        </dl>
      </div>

      {notApproved && (
        <p className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {ts('pendingBanner')}
        </p>
      )}

      {isSupplier && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-neutral-500">{ts('panelTitle')}</h2>
          <div className="flex gap-3">
            <Link
              href="/dashboard/company"
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium"
            >
              {ts('goCompany')}
            </Link>
            <Link
              href="/dashboard/products"
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium"
            >
              {ts('goProducts')}
            </Link>
            <Link
              href="/dashboard/supplier-inquiries"
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium"
            >
              {ts('goInquiries')}
            </Link>
          </div>
        </section>
      )}

      {isBuyerOrAgent && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-neutral-500">{ti('myTitle')}</h2>
          <Link
            href="/dashboard/inquiries"
            className="w-fit rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium"
          >
            {ti('myTitle')}
          </Link>
        </section>
      )}

      <LogoutButton />
    </main>
  );
}
