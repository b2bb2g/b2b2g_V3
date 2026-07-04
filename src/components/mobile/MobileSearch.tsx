'use client';
// 모바일 홈 실시간 검색(8.5). 입력을 250ms 디바운스해 /?q= 로 교체 → 서버가 결과 재조회. 로딩은 스피너.
import { useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export function MobileSearch({ currentQ }: { currentQ: string }) {
  const t = useTranslations('mobileHome');
  const router = useRouter();
  const [value, setValue] = useState(currentQ);
  const [syncedQ, setSyncedQ] = useState(currentQ);
  const [pending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 뒤로가기 등 외부에서 q 가 바뀌면 렌더 중 동기화(effect 없이).
  if (currentQ !== syncedQ) {
    setSyncedQ(currentQ);
    setValue(currentQ);
  }

  function onChange(next: string) {
    setValue(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const q = next.trim();
      startTransition(() => router.replace(q ? `/?q=${encodeURIComponent(q)}` : '/'));
    }, 250);
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
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
          className="w-full rounded-xl bg-neutral-100 py-3 pl-10 pr-10 text-sm text-neutral-700 placeholder:text-neutral-400"
        />
        {pending && (
          <span
            aria-hidden
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent"
          />
        )}
      </div>
      <Link
        href="/commercial"
        className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-600 text-white"
        aria-label={t('filter')}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 7h16M7 12h10M10 17h4" />
        </svg>
      </Link>
    </div>
  );
}
