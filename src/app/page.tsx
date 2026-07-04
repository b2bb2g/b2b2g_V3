// 랜딩(홈). 모바일 앱 셸 + 데스크톱 랜딩 + 팝업(6.3/6.5/6.6). 문구는 언어팩에서만 참조(0.1 규칙).
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { listPublicProducts } from '@/lib/products/queries';
import { getTopPopup } from '@/lib/marketing/queries';
import { getPlatformStats } from '@/lib/stats/queries';
import { Popup } from '@/components/Popup';
import { MobileHome } from '@/components/mobile/MobileHome';
import { DesktopHome } from '@/components/home/DesktopHome';
import type { PopupTarget } from '@/lib/supabase/database.types';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const t = await getTranslations('home');
  const { q } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 팝업 노출 대상(비회원/역할별) 판별.
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

  const [popup, products, stats] = await Promise.all([
    getTopPopup(target),
    listPublicProducts(),
    getPlatformStats(),
  ]);
  const featured = products.slice(0, 8);

  // 개인정보 없는 집계 신호. 0 인 항목은 숨겨 초기 단계에도 자연스럽게.
  const signals = [
    { value: stats.verifiedSuppliers, label: t('statSuppliers') },
    { value: stats.listedProducts, label: t('statProducts') },
    { value: stats.openRequests, label: t('statRequests') },
    { value: stats.recentInquiries, label: t('statInquiries') },
  ].filter((s) => s.value > 0);

  return (
    <>
      {/* 모바일: 앱 셸 홈(로그인 전/후 분기·실시간 검색·카테고리·프로모·Featured) */}
      <MobileHome featured={featured} q={q} />

      {/* 데스크톱: 개선된 랜딩 */}
      <DesktopHome
        featured={featured}
        signals={signals}
        stats={stats}
        isLoggedIn={Boolean(user)}
        q={q}
      />

      <Popup popup={popup} />
    </>
  );
}
