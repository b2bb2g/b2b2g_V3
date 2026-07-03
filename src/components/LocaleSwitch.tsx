'use client';
// 언어 전환 토글(EN/KO). 쿠키 설정 후 새로고침.
import { useTransition } from 'react';
import { useLocale } from 'next-intl';
import { setLocale } from '@/lib/i18n/actions';

export function LocaleSwitch() {
  const locale = useLocale();
  const [pending, startTransition] = useTransition();

  function switchTo(next: string) {
    if (next === locale) return;
    startTransition(() => setLocale(next));
  }

  return (
    <div className="flex items-center rounded-full border border-neutral-300 text-xs" aria-busy={pending}>
      {(['en', 'ko'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => switchTo(l)}
          aria-pressed={locale === l}
          className={`rounded-full px-2.5 py-1 ${
            locale === l ? 'bg-neutral-900 text-white' : 'text-neutral-500'
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
