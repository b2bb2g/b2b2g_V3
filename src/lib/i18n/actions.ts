'use server';
// 언어 전환: locale 쿠키를 설정한다(라우팅 없는 next-intl 구성). 헤더 스위처에서 호출.
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { isLocale, localeCookieName } from '@/i18n/config';

export async function setLocale(locale: string): Promise<void> {
  if (!isLocale(locale)) return;
  const cookieStore = await cookies();
  cookieStore.set(localeCookieName, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
  revalidatePath('/', 'layout');
}
