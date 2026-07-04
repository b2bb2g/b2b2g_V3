'use client';
// 초대 링크 복사 위젯. 읽기전용 입력 + 클립보드 복사 버튼.
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { btn } from '@/components/ui/button';

export function CopyLink({ url }: { url: string }) {
  const t = useTranslations('admin');
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.currentTarget.select()}
        className="min-w-0 flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-600"
      />
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard?.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className={btn.secondary}
      >
        {copied ? t('copied') : t('copy')}
      </button>
    </div>
  );
}
