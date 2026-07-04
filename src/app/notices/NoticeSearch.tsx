'use client';
// 공지 게시판 실시간 검색 + 기간 필터. 카테고리는 유지한 채 q·period 를 URL 로 교체. 로딩 스피너.
import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export function NoticeSearch({
  category,
  currentQ,
  currentPeriod,
}: {
  category: string;
  currentQ: string;
  currentPeriod: string;
}) {
  const t = useTranslations('content');
  const router = useRouter();
  const [value, setValue] = useState(currentQ);
  const [synced, setSynced] = useState(currentQ);
  const [pending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (currentQ !== synced) {
    setSynced(currentQ);
    setValue(currentQ);
  }

  function push(q: string, period: string) {
    const p = new URLSearchParams();
    if (category) p.set('category', category);
    if (q) p.set('q', q);
    if (period) p.set('period', period);
    const qs = p.toString();
    startTransition(() => router.replace(qs ? `/notices?${qs}` : '/notices'));
  }

  function onChange(next: string) {
    setValue(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => push(next.trim(), currentPeriod), 250);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-56 flex-1">
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
          placeholder={t('boardSearchPlaceholder')}
          aria-label={t('boardSearchPlaceholder')}
          className="w-full rounded-lg border border-neutral-300 py-2.5 pl-10 pr-10 text-sm"
        />
        {pending && (
          <span
            aria-hidden
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent"
          />
        )}
      </div>
      <select
        value={currentPeriod}
        onChange={(e) => push(value.trim(), e.target.value)}
        className="rounded-lg border border-neutral-300 px-3 py-2.5 text-sm"
      >
        <option value="">{t('periodAll')}</option>
        <option value="1m">{t('period1m')}</option>
        <option value="3m">{t('period3m')}</option>
        <option value="1y">{t('period1y')}</option>
      </select>
    </div>
  );
}
