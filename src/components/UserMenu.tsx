'use client';
// 헤더 개인 프로필 아바타 + 역할별 펼침 메뉴(#1, #2). 로그인 상태를 항상 표시.
import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { logout } from '@/lib/auth/actions';

export type MenuLink = { label: string; href: string; badge?: number };

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const second = parts.length > 1 ? (parts[1][0] ?? '') : '';
  return (first + second).toUpperCase() || '?';
}

export function UserMenu({
  name,
  role,
  items,
}: {
  name: string;
  role: string;
  items: MenuLink[];
}) {
  const t = useTranslations('nav');
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-neutral-300 py-1 pl-1 pr-2.5 hover:border-neutral-400"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white">
          {initials(name)}
        </span>
        <span className="hidden text-sm font-medium sm:inline">{name}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden className="text-neutral-400">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            role="menu"
            className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg"
          >
            <div className="border-b border-neutral-100 px-4 py-3">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="text-xs text-neutral-400">{t(`role_${role}`)}</p>
            </div>
            <nav className="flex flex-col py-1">
              {items.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-4 py-2 text-sm hover:bg-neutral-50"
                >
                  <span>{it.label}</span>
                  {it.badge ? (
                    <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-xs text-white">
                      {it.badge}
                    </span>
                  ) : null}
                </Link>
              ))}
            </nav>
            <form action={logout} className="border-t border-neutral-100">
              <button
                type="submit"
                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
              >
                {t('logout')}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
