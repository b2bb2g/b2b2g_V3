'use client';
// 상단 MainNav 게이트. 모바일 홈(/)에서는 인사말 헤더가 대신하므로 상단 네비를 숨긴다(데스크톱은 항상 노출).
import { usePathname } from 'next/navigation';

export function TopNavGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <div className={pathname === '/' ? 'hidden md:block' : ''}>{children}</div>;
}
