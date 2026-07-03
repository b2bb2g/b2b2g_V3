'use client';
// 언어 전환 토글(EN/KO). 클릭 즉시 낙관적 하이라이트 + 스피너, 쿠키 설정 후 router.refresh 로 갱신.
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { setLocale } from '@/lib/i18n/actions';

const LOCALES = ['en', 'ko'] as const;

export function LocaleSwitch() {
  const locale = useLocale();
  const t = useTranslations('nav');
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState<string | null>(null);

  // 실제 로케일이 낙관적 선택을 따라잡으면(갱신 완료) 낙관값 해제.
  if (optimistic && locale === optimistic && !pending) setOptimistic(null);
  const active = optimistic ?? locale;

  function switchTo(next: string) {
    if (next === active) return;
    setOptimistic(next); // 즉시 하이라이트(체감 반응 개선)
    startTransition(async () => {
      await setLocale(next);
      router.refresh(); // 현재 페이지만 서버 재렌더 → 새 언어 적용
    });
  }

  return (
    <div
      className="flex items-center rounded-full border border-neutral-300 text-xs"
      role="group"
      aria-label={t('language')}
    >
      {LOCALES.map((l) => {
        const isActive = active === l;
        const isLoading = pending && optimistic === l;
        return (
          <button
            key={l}
            type="button"
            onClick={() => switchTo(l)}
            disabled={pending}
            aria-pressed={isActive}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors ${
              isActive ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-800'
            } ${pending ? 'cursor-wait' : ''}`}
          >
            {isLoading && (
              <span
                aria-hidden
                className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
              />
            )}
            {l.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
