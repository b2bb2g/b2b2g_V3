'use client';
// 쿠키 동의 배너(5.10). opt-in, 수락=거부 동등 배치, 카테고리 선택, 정책 링크, 언제든 재오픈.
// 클라이언트 전용 쿠키 상태는 useSyncExternalStore 로 읽어 하이드레이션 불일치를 피한다.
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  ACCEPT_ALL,
  CONSENT_CHANGED_EVENT,
  CONSENT_COOKIE_NAME,
  CONSENT_MAX_AGE_DAYS,
  OPEN_COOKIE_SETTINGS_EVENT,
  OPTIONAL_COOKIE_CATEGORIES,
  REJECT_ALL,
  parseConsent,
  serializeConsent,
  type ConsentChoice,
  type OptionalCategory,
} from '@/lib/cookies/consent';

function readConsentCookie(): string | undefined {
  return document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${CONSENT_COOKIE_NAME}=`))
    ?.split('=')[1];
}

// 저장된 동의 유무를 외부 상태로 구독(effect 내 동기 setState 회피).
function subscribeConsent(onChange: () => void) {
  window.addEventListener(CONSENT_CHANGED_EVENT, onChange);
  return () => window.removeEventListener(CONSENT_CHANGED_EVENT, onChange);
}
const hasStoredConsent = () => parseConsent(readConsentCookie()) !== null;
const serverHasConsent = () => true; // 서버 렌더에서는 배너를 숨긴다.

export function CookieConsent() {
  const t = useTranslations('cookies');
  const consented = useSyncExternalStore(subscribeConsent, hasStoredConsent, serverHasConsent);
  const [forceOpen, setForceOpen] = useState(false);
  const [choice, setChoice] = useState<ConsentChoice>(REJECT_ALL);

  useEffect(() => {
    const reopen = () => setForceOpen(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, reopen);
  }, []);

  const persist = useCallback(async (decision: ConsentChoice) => {
    // 결정 기록 쿠키(필수 쿠키 = 법적 선택 저장) + 서버 감사 기록.
    document.cookie = `${CONSENT_COOKIE_NAME}=${serializeConsent(decision)}; path=/; max-age=${CONSENT_MAX_AGE_DAYS * 24 * 60 * 60}; samesite=lax`;
    setForceOpen(false);
    window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
    try {
      await fetch('/api/cookie-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(decision),
      });
    } catch {
      // 감사 기록 실패는 사용자 흐름을 막지 않는다(결정은 쿠키에 이미 저장됨).
    }
  }, []);

  const open = forceOpen || !consented;
  if (!open) return null;

  const toggle = (cat: OptionalCategory) => setChoice((prev) => ({ ...prev, [cat]: !prev[cat] }));

  return (
    <div
      role="dialog"
      aria-label={t('title')}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white p-4 shadow-lg"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">{t('title')}</p>
          <p className="text-sm text-neutral-600">
            {t('body')}{' '}
            <Link href="/legal/cookies" className="underline">
              {t('policyLink')}
            </Link>
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-2 text-neutral-500">
            <input type="checkbox" checked disabled aria-label={t('necessary')} />
            {t('necessary')}
          </span>
          {OPTIONAL_COOKIE_CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-2">
              <input type="checkbox" checked={choice[cat]} onChange={() => toggle(cat)} />
              {t(cat)}
            </label>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {/* 수락과 거부를 동등하게 배치(다크패턴 금지) */}
          <button
            type="button"
            onClick={() => persist(ACCEPT_ALL)}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
          >
            {t('acceptAll')}
          </button>
          <button
            type="button"
            onClick={() => persist(REJECT_ALL)}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
          >
            {t('rejectAll')}
          </button>
          <button
            type="button"
            onClick={() => persist(choice)}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium"
          >
            {t('saveSelection')}
          </button>
        </div>
      </div>
    </div>
  );
}
