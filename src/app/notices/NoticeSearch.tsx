'use client';
// 공지 게시판 실시간 검색 + 기간 필터 + 정렬 토글. 카테고리는 유지한 채 q·period·sort 를 URL 로 교체. 로딩 스피너.
import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export function NoticeSearch({
  category,
  currentQ,
  currentPeriod,
  currentSort,
}: {
  category: string;
  currentQ: string;
  currentPeriod: string;
  currentSort: string;
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

  function push(q: string, period: string, sort: string) {
    const p = new URLSearchParams();
    if (category) p.set('category', category);
    if (q) p.set('q', q);
    if (period) p.set('period', period);
    if (sort && sort !== 'latest') p.set('sort', sort);
    const qs = p.toString();
    startTransition(() => router.replace(qs ? `/notices?${qs}` : '/notices'));
  }

  function onChange(next: string) {
    setValue(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => push(next.trim(), currentPeriod, currentSort), 250);
  }

  const oldest = currentSort === 'oldest';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-56 flex-1">
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('boardSearchPlaceholder')}
          aria-label={t('boardSearchPlaceholder')}
          className="w-full rounded-lg border border-neutral-300 py-2.5 pl-3.5 pr-10 text-sm"
        />
        {pending ? (
          <span
            aria-hidden
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent"
          />
        ) : (
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3-3" />
          </svg>
        )}
      </div>

      <select
        value={currentPeriod}
        onChange={(e) => push(value.trim(), e.target.value, currentSort)}
        className="rounded-lg border border-neutral-300 px-3 py-2.5 text-sm"
      >
        <option value="">{t('periodAll')}</option>
        <option value="1m">{t('period1m')}</option>
        <option value="3m">{t('period3m')}</option>
        <option value="1y">{t('period1y')}</option>
      </select>

      <button
        type="button"
        onClick={() => push(value.trim(), currentPeriod, oldest ? 'latest' : 'oldest')}
        aria-label={oldest ? t('sortOldest') : t('sortLatest')}
        title={oldest ? t('sortOldest') : t('sortLatest')}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-neutral-300 text-neutral-500 hover:border-neutral-400"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
          {oldest ? (
            <path d="M7 4v16M7 20l-3-3M7 20l3-3M12 7h8M12 12h5M12 17h3" />
          ) : (
            <path d="M7 4v16M7 4L4 7M7 4l3 3M12 7h8M12 12h5M12 17h3" />
          )}
        </svg>
      </button>
    </div>
  );
}
