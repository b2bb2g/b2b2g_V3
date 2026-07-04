'use client';
// 모바일 하단 탭 내비게이션(모바일 전용). 최장 프리픽스로 활성 탭 판정 + 메시지 배지.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export type TabIcon = 'home' | 'grid' | 'chat' | 'user';
export type Tab = { href: string; label: string; icon: TabIcon; badge?: number };

const ICONS: Record<TabIcon, ReactNode> = {
  home: <path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-5H9v5H5a1 1 0 0 1-1-1v-8z" />,
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </>
  ),
  chat: <path d="M4 5h16v10H9l-4 3v-3H4V5z" strokeLinejoin="round" />,
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
};

export function MobileTabBarClient({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();
  const matches = tabs.filter((t) =>
    t.href === '/' ? pathname === '/' : pathname === t.href || pathname.startsWith(`${t.href}/`),
  );
  const activeHref = matches.sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 backdrop-blur md:hidden">
      <ul className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {tabs.map((t) => {
          const active = t.href === activeHref;
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                className={`flex flex-col items-center gap-1 py-2 text-[11px] transition-colors ${
                  active ? 'text-blue-600' : 'text-neutral-400'
                }`}
              >
                <span className="relative">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    {ICONS[t.icon]}
                  </svg>
                  {t.badge ? (
                    <span className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                      {t.badge}
                    </span>
                  ) : null}
                </span>
                <span className={active ? 'font-medium' : ''}>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
