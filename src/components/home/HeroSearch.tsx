'use client';
// 데스크톱 히어로 실시간 검색. 250ms 디바운스 → /?q= 교체, 서버가 결과 재조회. 로딩은 스피너.
import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export function HeroSearch({ currentQ }: { currentQ: string }) {
  const t = useTranslations('home');
  const router = useRouter();
  const [value, setValue] = useState(currentQ);
  const [synced, setSynced] = useState(currentQ);
  const [pending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (currentQ !== synced) {
    setSynced(currentQ);
    setValue(currentQ);
  }

  function go(q: string) {
    startTransition(() => router.replace(q ? `/?q=${encodeURIComponent(q)}` : '/'));
  }

  function onChange(next: string) {
    setValue(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => go(next.trim()), 250);
  }

  return (
    <div className="flex max-w-md items-center gap-2">
      <div className="relative flex-1">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3-3" />
        </svg>
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchPlaceholder')}
          className="w-full rounded-xl border border-neutral-300 bg-white py-3 pl-11 pr-10 text-sm shadow-sm"
        />
        {pending && (
          <span
            aria-hidden
            className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent"
          />
        )}
      </div>
      <button
        type="button"
        onClick={() => go(value.trim())}
        className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
      >
        {t('searchButton')}
      </button>
    </div>
  );
}
