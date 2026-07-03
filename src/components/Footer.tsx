// 공통 푸터(6.3): 법적 문서 링크 + 쿠키 설정 재오픈.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { CookieSettingsButton } from './CookieSettingsButton';

export async function Footer() {
  const t = await getTranslations('legal');
  const tc = await getTranslations('content');

  return (
    <footer className="border-t border-neutral-200 px-6 py-6 text-sm text-neutral-500">
      <nav className="mx-auto flex max-w-4xl flex-wrap gap-4">
        <Link href="/notices" className="underline">
          {tc('notices')}
        </Link>
        <Link href="/faq" className="underline">
          {tc('faq')}
        </Link>
        <Link href="/legal/terms" className="underline">
          {t('terms')}
        </Link>
        <Link href="/legal/privacy" className="underline">
          {t('privacy')}
        </Link>
        <Link href="/legal/cookies" className="underline">
          {t('cookies')}
        </Link>
        <CookieSettingsButton />
      </nav>
    </footer>
  );
}
