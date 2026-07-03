'use client';
// 관리자 전용 좌측 사이드바(다크 테마). 그룹별 네비 + 현재 경로 강조 + 모바일 토글. 라벨은 서버에서 i18n.
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

      <aside className={`${open ? 'block' : 'hidden'} md:block md:w-60 md:shrink-0`}>
        <div className="on-dark rounded-2xl bg-slate-900 p-4 text-slate-100 shadow-sm ring-1 ring-slate-800 md:sticky md:top-20">
          <nav className="flex flex-col gap-5">
            <Link href={home.href} className="px-2 py-1 text-lg font-bold tracking-tight text-white">
              {title}
            </Link>
            {groups.map((g) => (
              <div key={g.heading} className="flex flex-col gap-1">
                <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {g.heading}
                </span>
                {g.links.map((l) => {
                  const active = isActive(l.href);
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all ${
                        active
                          ? 'bg-violet-600 font-medium text-white shadow-sm shadow-violet-900/40'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-white' : 'bg-slate-600'}`}
                      />
                      {l.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
