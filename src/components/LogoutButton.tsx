// 로그아웃 버튼(공통). 서버 액션 logout 을 폼으로 호출한다.
import { getTranslations } from 'next-intl/server';
import { logout } from '@/lib/auth/actions';

export async function LogoutButton() {
  const t = await getTranslations('auth');

  return (
    <form action={logout}>
      <button type="submit" className="text-sm text-neutral-600 underline">
        {t('logout')}
      </button>
    </form>
  );
}
