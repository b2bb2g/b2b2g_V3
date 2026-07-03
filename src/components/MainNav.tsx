// 메인 메뉴(9장). menu_items 데이터로 렌더 — 라벨·링크·순서·노출·그룹 모두 관리자 편집. 하드코딩 금지.
import Link from 'next/link';
import { getLocale } from 'next-intl/server';
import { listActiveMenu } from '@/lib/menu/queries';

export async function MainNav() {
  const locale = await getLocale();
  const items = await listActiveMenu();
  if (items.length === 0) return null;

  const label = (it: { label_en: string; label_ko: string }) =>
    locale === 'ko' ? it.label_ko : it.label_en;

  return (
    <header className="border-b border-neutral-200 px-6 py-4">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2">
        <Link href="/" className="text-lg font-bold">
          B2BB2G
        </Link>
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-neutral-600">
          {items.map((it) => (
            <Link key={it.id} href={it.route} className="hover:text-neutral-900">
              {label(it)}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
