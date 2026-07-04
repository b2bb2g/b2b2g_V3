'use client';
// 초대 링크 복사 위젯. 읽기전용 입력 + 클립보드 복사 버튼 + QR 코드 토글(있을 때).
import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { btn } from '@/components/ui/button';

export function CopyLink({ url, qr }: { url: string; qr?: string }) {
  const t = useTranslations('admin');
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  return (
    <div className="flex flex-col gap-3">
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
        {qr && (
          <button type="button" onClick={() => setShowQr((v) => !v)} className={btn.secondary}>
            {showQr ? t('qrHide') : t('qrShow')}
          </button>
        )}
      </div>
      {qr && showQr && (
        <div className="flex flex-col items-start gap-2 rounded-lg border border-neutral-200 p-4">
          <Image src={qr} alt={t('qrShow')} width={160} height={160} unoptimized />
          <a href={qr} download="invite-qr.png" className="text-sm text-neutral-600 underline">
            {t('qrDownload')}
          </a>
        </div>
      )}
    </div>
  );
}
