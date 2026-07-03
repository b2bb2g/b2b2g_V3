// 도메인(홈). 제품 둘러보기·로그인 진입 + 광고배너·팝업(6.5/6.6). 문구는 언어팩에서만 참조(0.1 규칙).
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { getTopPopup } from '@/lib/marketing/queries';
import { BannerSlot } from '@/components/BannerSlot';
import { Popup } from '@/components/Popup';
import type { PopupTarget } from '@/lib/supabase/database.types';

export default async function HomePage() {
  const t = await getTranslations('home');

  // 팝업 노출 대상(비회원/역할별) 판별.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let target: PopupTarget = 'guest';
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    const role = profile?.role;
    target = role === 'buyer' || role === 'supplier' || role === 'agent' ? role : 'all';
  }
  const popup = await getTopPopup(target);

  return (
    <>
      <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6">
        <h1 className="text-4xl font-bold tracking-tight">{t('heroTitle')}</h1>
        <p className="text-lg text-neutral-600">{t('heroSubtitle')}</p>
        <div className="flex gap-3">
          <Link
            href="/products"
            className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white"
          >
            {t('browseProducts')}
          </Link>
          <Link
            href="/auth/login"
            className="rounded-md border border-neutral-300 px-5 py-2.5 text-sm font-medium"
          >
            {t('signIn')}
          </Link>
        </div>
      </main>

      <div className="pb-16">
        <BannerSlot placement="mid" />
      </div>

      <Popup popup={popup} />
    </>
  );
}
