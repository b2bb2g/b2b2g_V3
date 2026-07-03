// next-intl 요청별 설정. 쿠키의 locale 을 읽어 언어팩을 주입한다(라우팅 없는 구성).
import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, isLocale, localeCookieName, type Locale } from './config';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(localeCookieName)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return { locale, messages };
});
