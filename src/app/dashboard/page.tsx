// 대시보드 placeholder. 프로필을 읽어 표시하고, 미승인 사용자는 승인 대기 화면으로 보낸다.
// 역할별 상세 대시보드(7장)는 이후 슬라이스에서 구현.
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { LogoutButton } from '@/components/LogoutButton';

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');
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

  // 관리자 외 미승인 사용자는 승인 대기 화면으로.
  if (profile.role !== 'admin' && profile.status !== 'approved') {
    redirect('/auth/pending-approval');
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6">
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
      <LogoutButton />
    </main>
  );
}
