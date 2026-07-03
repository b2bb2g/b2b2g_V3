'use client';
// 실시간 검색·필터(8.5). 입력을 디바운스해 URL(?q,&category)만 바꾸고 서버가 재조회한다.
// 서버 렌더라 권한·가격 마스킹이 그대로 유지된다. 로딩은 transition 스피너로 표시.
import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

type Category = { id: string; name: string };

export function ProductSearch({
  categories,
  currentQ,
  currentCategory,
}: {
  categories: Category[];
  currentQ: string;
  currentCategory: string;
}) {
  const t = useTranslations('products');
  const router = useRouter();
  const [value, setValue] = useState(currentQ);
  const [syncedQ, setSyncedQ] = useState(currentQ);
  const [pending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 외부(뒤로가기 등)로 q 가 바뀌면 렌더 중 동기화(effect 없이, React 권장 패턴).
  if (currentQ !== syncedQ) {
    setSyncedQ(currentQ);
    setValue(currentQ);
  }

  function pushUrl(q: string, category: string) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    const qs = params.toString();
    startTransition(() => router.replace(qs ? `/products?${qs}` : '/products'));
  }

  function onChange(next: string) {
    setValue(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // 입력이 멈춘 뒤 250ms 후 한 번만 요청(매 키 입력마다 요청 금지).
    debounceRef.current = setTimeout(() => pushUrl(next.trim(), currentCategory), 250);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchPlaceholder')}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 pr-10"
        />
        {pending && (
          <span
            aria-hidden
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent"
          />
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <FilterChip
          label={t('allCategories')}
          active={!currentCategory}
          onClick={() => pushUrl(value.trim(), '')}
        />
        {categories.map((c) => (
          <FilterChip
            key={c.id}
            label={c.name}
            active={currentCategory === c.id}
            onClick={() => pushUrl(value.trim(), c.id)}
          />
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1 ${
        active ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300'
      }`}
    >
      {label}
    </button>
  );
}
