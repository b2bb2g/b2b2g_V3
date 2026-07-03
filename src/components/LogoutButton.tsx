// 로그아웃 버튼(공통). 파괴적 동작이라 확인 다이얼로그로 재확인한다(8.1).
import { getTranslations } from 'next-intl/server';
import { logout } from '@/lib/auth/actions';
import { ConfirmButton } from '@/components/ui/ConfirmButton';

export async function LogoutButton() {
  const t = await getTranslations('auth');

  return (
    <ConfirmButton
      action={logout}
      title={t('logoutConfirmTitle')}
      description={t('logoutConfirmBody')}
      confirmLabel={t('logout')}
    >
      {t('logout')}
    </ConfirmButton>
  );
}
