// 메인 헤더(9장): menu_items 동적 메뉴 + 로그인 상태 아바타 메뉴 + 언어전환. 모든 페이지 상단.
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getLocale, getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { listActiveMenu } from '@/lib/menu/queries';
import { unreadNotificationCount } from '@/lib/notify/queries';
import { LocaleSwitch } from '@/components/LocaleSwitch';
import { UserMenu, type MenuLink } from '@/components/UserMenu';
import { WelcomeModal } from '@/components/WelcomeModal';
import { MobileMenu } from '@/components/MobileMenu';

export async function MainNav() {
  const [locale, tn, tc, items] = await Promise.all([
    getLocale(),
    getTranslations('nav'),
    getTranslations('common'),
    listActiveMenu(),
  ]);
  const label = (it: { label_en: string; label_ko: string }) =>
    locale === 'ko' ? it.label_ko : it.label_en;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let menu: { name: string; role: string; items: MenuLink[] } | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, role')
      .eq('id', user.id)
      .single();
    const role = profile?.role ?? 'buyer';
    const unread = await unreadNotificationCount();

    const links: MenuLink[] = [{ label: tn('dashboard'), href: '/dashboard' }];
    if (role === 'supplier') {
      links.push(
        { label: tn('myCompany'), href: '/dashboard/company' },
        { label: tn('myProducts'), href: '/dashboard/products' },
        { label: tn('receivedInquiries'), href: '/dashboard/supplier-inquiries' },
      );
    }
    if (role === 'buyer' || role === 'agent') {
      links.push(
        { label: tn('myInquiries'), href: '/dashboard/inquiries' },
        { label: tn('myRequests'), href: '/dashboard/requests' },
      );
    }
    if (role === 'agent') {
      links.push({ label: tn('myBuyers'), href: '/dashboard/my-buyers' });
    }
    if (role === 'admin') {
      links.push({ label: tn('adminConsole'), href: '/admin' });
    }
    links.push({ label: tn('notifications'), href: '/dashboard/notifications', badge: unread });

    menu = { name: profile?.display_name ?? tn('member'), role, items: links };
  }

  // 로그인 직후 1회성 환영 모달(전역).
  const showWelcome = menu !== null && (await cookies()).get('welcome')?.value === '1';

  return (
    <>
      {showWelcome && menu && <WelcomeModal name={menu.name} />}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <nav className="relative mx-auto flex max-w-6xl items-center gap-x-6 gap-y-2 px-6 py-3">
        <MobileMenu items={items.map((it) => ({ label: label(it), href: it.route }))} />
        <Link href="/" className="text-lg font-bold tracking-tight">
          {tc('brand')}
        </Link>
        <div className="hidden flex-wrap gap-x-5 gap-y-1 text-sm text-neutral-600 md:flex">
          {items.map((it) => (
            <Link key={it.id} href={it.route} className="hover:text-neutral-900">
              {label(it)}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <LocaleSwitch />
          {menu ? (
            <UserMenu name={menu.name} role={menu.role} items={menu.items} />
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <Link
                href="/auth/login"
                className="rounded-md border border-neutral-300 px-3 py-1.5 font-medium hover:border-neutral-400"
              >
                {tn('signIn')}
              </Link>
              <Link
                href="/auth/signup"
                className="hidden rounded-md bg-neutral-900 px-3 py-1.5 font-medium text-white sm:inline"
              >
                {tn('signUp')}
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
    </>
  );
}
