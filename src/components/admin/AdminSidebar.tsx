'use client';
// 관리자 전용 좌측 사이드바. 그룹별 네비 + 현재 경로 강조 + 모바일 토글. 라벨은 서버에서 i18n 해 전달.
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type SidebarLink = { href: string; label: string };
export type SidebarGroup = { heading: string; links: SidebarLink[] };

export function AdminSidebar({
  title,
  home,
  groups,
  menuLabel,
}: {
  title: string;
  home: SidebarLink;
  groups: SidebarGroup[];
  menuLabel: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    const base = href.split('?')[0];
    if (base === '/admin') return pathname === '/admin';
    return pathname === base || pathname.startsWith(`${base}/`);
  };

  const linkClass = (href: string) =>
    `block rounded-md px-3 py-2 text-sm transition-colors ${
      isActive(href)
        ? 'bg-neutral-900 text-white'
        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
    }`;

  return (
    <>
      {/* 모바일 토글 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mb-3 flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-2 text-sm md:hidden"
      >
        <span className="flex flex-col gap-1" aria-hidden>
          <span className="h-0.5 w-4 bg-neutral-700" />
          <span className="h-0.5 w-4 bg-neutral-700" />
          <span className="h-0.5 w-4 bg-neutral-700" />
        </span>
        {menuLabel}
      </button>

      <aside
        className={`${open ? 'block' : 'hidden'} md:block md:w-60 md:shrink-0`}
      >
        <nav className="flex flex-col gap-5 md:sticky md:top-20">
          <Link href={home.href} className="px-3 text-lg font-bold tracking-tight">
            {title}
          </Link>
          {groups.map((g) => (
            <div key={g.heading} className="flex flex-col gap-1">
              <span className="px-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                {g.heading}
              </span>
              {g.links.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={linkClass(l.href)}>
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
