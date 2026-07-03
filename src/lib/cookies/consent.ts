// 쿠키 동의의 단일 출처(0.2). 카테고리·쿠키명·정책버전과 파싱/직렬화를 한 곳에서 관리.

// 선택 동의 카테고리(필수(necessary)는 항상 true 라 여기 포함하지 않음).
export const OPTIONAL_COOKIE_CATEGORIES = ['functional', 'analytics', 'marketing'] as const;
export type OptionalCategory = (typeof OPTIONAL_COOKIE_CATEGORIES)[number];

export type ConsentChoice = Record<OptionalCategory, boolean>;

// 동의 결정을 담는 쿠키(법적 선택 기록용 = 필수 쿠키로 취급). 정책 개정 시 버전으로 재동의 유도.
export const CONSENT_COOKIE_NAME = 'cc_consent';
export const VISITOR_COOKIE_NAME = 'cc_visitor';
export const COOKIE_POLICY_VERSION = '1';
export const CONSENT_MAX_AGE_DAYS = 180;

export const ACCEPT_ALL: ConsentChoice = { functional: true, analytics: true, marketing: true };
export const REJECT_ALL: ConsentChoice = { functional: false, analytics: false, marketing: false };

export type StoredConsent = ConsentChoice & { version: string };

export function serializeConsent(choice: ConsentChoice): string {
  const value: StoredConsent = { ...choice, version: COOKIE_POLICY_VERSION };
  return encodeURIComponent(JSON.stringify(value));
}

export function parseConsent(raw: string | undefined): StoredConsent | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<StoredConsent>;
    if (parsed.version !== COOKIE_POLICY_VERSION) return null; // 정책 개정 시 재동의
    return {
      functional: Boolean(parsed.functional),
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      version: COOKIE_POLICY_VERSION,
    };
  } catch {
    return null;
  }
}

export const OPEN_COOKIE_SETTINGS_EVENT = 'open-cookie-settings';
export const CONSENT_CHANGED_EVENT = 'cc-consent-changed';
