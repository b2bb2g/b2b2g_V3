// 전역 루트 레이아웃. next-intl 로케일·메시지를 클라이언트 트리에 주입한다.
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import { MainNav } from '@/components/MainNav';
import { TopNavGate } from '@/components/TopNavGate';
import { MobileTabBar } from '@/components/mobile/MobileTabBar';
import { Footer } from '@/components/Footer';
import { CookieConsent } from '@/components/CookieConsent';
import { ToastProvider } from '@/components/ui/Toast';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('common');
  return {
    title: t('appName'),
    description: t('tagline'),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ToastProvider>
            <TopNavGate>
              <MainNav />
            </TopNavGate>
            {children}
            <Footer />
            {/* 하단 고정 탭바가 콘텐츠를 가리지 않도록 모바일 여백 확보 */}
            <div aria-hidden className="h-16 md:hidden" />
            <MobileTabBar />
            <CookieConsent />
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
