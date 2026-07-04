// 모바일 하단 탭바 서버 래퍼. 로그인·미읽음 알림 수를 조회해 탭 구성을 넘긴다.
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { unreadNotificationCount } from '@/lib/notify/queries';
import { MobileTabBarClient, type Tab } from './MobileTabBarClient';

export async function MobileTabBar() {
  const tn = await getTranslations('mobileNav');
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let unread = 0;
  if (user) unread = await unreadNotificationCount();

  const tabs: Tab[] = [
    { href: '/', label: tn('home'), icon: 'home' },
    { href: '/commercial', label: tn('browse'), icon: 'grid' },
    {
      href: user ? '/dashboard/notifications' : '/auth/login',
      label: tn('messages'),
      icon: 'chat',
      badge: unread || undefined,
    },
    { href: user ? '/dashboard' : '/auth/login', label: tn('profile'), icon: 'user' },
  ];

  return <MobileTabBarClient tabs={tabs} />;
}
