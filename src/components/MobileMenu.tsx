'use client';
// 모바일 햄버거 메뉴. 데스크톱에선 숨김(md:hidden). menu_items 를 슬라이드 패널로 노출.
import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

type NavItem = { label: string; href: string };

export function MobileMenu({ items }: { items: NavItem[] }) {
  const t = useTranslations('nav');
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={t('menu')}
        className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 hover:border-neutral-400"
      >
        <span className="flex flex-col gap-1" aria-hidden>
          <span className="h-0.5 w-4 bg-neutral-700" />
          <span className="h-0.5 w-4 bg-neutral-700" />
          <span className="h-0.5 w-4 bg-neutral-700" />
        </span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-14 z-30 cursor-default bg-black/20"
          />
          <nav className="absolute inset-x-0 top-full z-40 flex flex-col border-b border-neutral-200 bg-white shadow-lg">
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                onClick={() => setOpen(false)}
                className="border-b border-neutral-100 px-6 py-3 text-sm text-neutral-700 hover:bg-neutral-50"
              >
                {it.label}
              </Link>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}
