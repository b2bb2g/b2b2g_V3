'use client';
// 로그인 직후 전역 환영 모달. 잠깐 인사하고 페이드아웃. 1회성(쿠키 즉시 삭제)이라 새로고침 시 재노출 없음.
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export function WelcomeModal({ name }: { name: string }) {
  const t = useTranslations('dashboard');
  const [mounted, setMounted] = useState(true);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    // 재노출 방지: 표시하는 즉시 플래그 쿠키 삭제.
    document.cookie = 'welcome=; path=/; max-age=0';
    const inId = requestAnimationFrame(() => setOpacity(1)); // 페이드 인
    const fadeId = setTimeout(() => setOpacity(0), 2200); // 페이드 아웃 시작
    const offId = setTimeout(() => setMounted(false), 2700); // 언마운트
    return () => {
      cancelAnimationFrame(inId);
      clearTimeout(fadeId);
      clearTimeout(offId);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[60] flex items-start justify-center pt-24 transition-opacity duration-500"
      style={{ opacity }}
      aria-live="polite"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-6 py-4 shadow-xl">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-lg text-white">
          👋
        </span>
        <p className="text-sm font-medium text-neutral-800">{t('loginWelcome', { name })}</p>
      </div>
    </div>
  );
}
