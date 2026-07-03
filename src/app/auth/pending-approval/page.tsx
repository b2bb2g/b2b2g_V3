// 관리자 승인 대기 안내 페이지(status=pending).
import { getTranslations } from 'next-intl/server';
import { LogoutButton } from '@/components/LogoutButton';

export default async function PendingApprovalPage() {
  const t = await getTranslations('auth');

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold">{t('pendingTitle')}</h1>
      <p className="text-neutral-600">{t('pendingBody')}</p>
      <LogoutButton />
    </main>
  );
}
