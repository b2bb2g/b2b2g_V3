'use client';
// 현재 글 링크 복사 버튼(게시판 상세 공유). 클립보드 복사 후 잠시 체크 표시.
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function ShareButton() {
  const t = useTranslations('content');
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard?.writeText(window.location.href);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      aria-label={t('boardShare')}
      title={t('boardShare')}
      className="grid h-9 w-9 place-items-center rounded-lg border border-neutral-200 text-neutral-500 hover:border-neutral-400"
    >
      {done ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13" />
        </svg>
      )}
    </button>
  );
}
