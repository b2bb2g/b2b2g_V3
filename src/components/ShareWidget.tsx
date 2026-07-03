'use client';
// 공유 위젯: 클릭 시 단축링크 생성 + QR 표시(5.8). 로그인 사용자만.
import { useState, useTransition } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { createShortLink, type ShareLink } from '@/lib/shortlinks/actions';
import type { ShortLinkTarget } from '@/lib/supabase/database.types';

export function ShareWidget({
  targetType,
  targetId,
  refCode = null,
}: {
  targetType: ShortLinkTarget;
  targetId: string | null;
  refCode?: string | null;
}) {
  const t = useTranslations('share');
  const [link, setLink] = useState<Extract<ShareLink, { ok: true }> | null>(null);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  function onShare() {
    setError(false);
    startTransition(async () => {
      const res = await createShortLink(targetType, targetId, refCode);
      if (res.ok) setLink(res);
      else setError(true);
    });
  }

  if (link) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-lg border border-neutral-200 p-4">
        <span className="text-sm font-medium">{t('title')}</span>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={link.url}
            className="w-56 rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(link.url)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            {t('copy')}
          </button>
        </div>
        <Image src={link.qr} alt={t('qrAlt')} width={160} height={160} unoptimized />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={onShare}
        disabled={pending}
        className="w-fit rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium"
      >
        {pending ? t('loading') : t('share')}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {t('loginRequired')}
        </p>
      )}
    </div>
  );
}
