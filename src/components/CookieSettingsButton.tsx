'use client';
// 쿠키 설정 재오픈 버튼. 배너의 재오픈 이벤트를 발생시킨다(언제든 철회 가능, 5.10).
import { useTranslations } from 'next-intl';
import { OPEN_COOKIE_SETTINGS_EVENT } from '@/lib/cookies/consent';

export function CookieSettingsButton() {
  const t = useTranslations('cookies');
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))}
      className="underline"
    >
      {t('settings')}
    </button>
  );
}
