'use client';
// 팝업 표시(6.6). 대상 역할별 최상위 1건. "오늘/이번주 그만보기" 는 localStorage 로 재노출 억제.
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { boardMediaUrl } from '@/lib/attachments/media';
import type { PopupRow } from '@/lib/supabase/database.types';

function imgSrc(image: string): string {
  return image.startsWith('http') ? image : boardMediaUrl(image);
}

function dismissedKey(id: string) {
  return `popup_dismissed_${id}`;
}

export function Popup({ popup }: { popup: PopupRow | null }) {
  const t = useTranslations('marketing');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!popup) return;
    const until = localStorage.getItem(dismissedKey(popup.id));
    if (until && Number(until) > Date.now()) return;
    // 마운트 시 localStorage(외부 상태) 확인 후 1회 노출 — 정당한 동기화 용도.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(true);
  }, [popup]);

  if (!popup || !open) return null;

  function dismiss(remember: boolean) {
    if (remember && popup) {
      const days = popup.dismiss_option === 'week_off' ? 7 : 1;
      localStorage.setItem(dismissedKey(popup.id), String(Date.now() + days * 86400_000));
    }
    setOpen(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-w-sm flex-col overflow-hidden rounded-lg bg-white">
        {popup.image && popup.content_type !== 'rich_text' && (
          <a href={popup.link_url ?? undefined}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgSrc(popup.image)} alt={popup.title} className="w-full object-cover" />
          </a>
        )}
        {popup.body && popup.content_type !== 'image' && (
          <div className="whitespace-pre-line p-4 text-sm text-neutral-700">{popup.body}</div>
        )}
        <div className="flex items-center justify-between gap-2 border-t border-neutral-200 p-3 text-sm">
          {popup.dismiss_option !== 'close_only' ? (
            <button type="button" onClick={() => dismiss(true)} className="text-neutral-500 underline">
              {popup.dismiss_option === 'week_off' ? t('dismissWeek') : t('dismissToday')}
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={() => dismiss(false)}
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-white"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
}
