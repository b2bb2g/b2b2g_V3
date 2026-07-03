// 지원 언어 목록의 단일 출처 (0.2 규칙). 언어 추가 시 여기와 messages/ 만 확장.

export const locales = ['en', 'ko'] as const;
export type Locale = (typeof locales)[number];

/** 로그인 전 기본 언어. 해외 바이어 대상이라 영어가 기본. */
export const defaultLocale: Locale = 'en';

/** 사용자가 고른 언어를 담는 쿠키 이름. 로그인 후에는 profiles.locale 로 대체 예정. */
export const localeCookieName = 'locale';

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && (locales as readonly string[]).includes(value);
}
