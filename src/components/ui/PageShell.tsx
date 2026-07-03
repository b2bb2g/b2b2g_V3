// 서브페이지 공통 컨테이너. 폭·여백·세로 간격을 한 곳에서 통일(일괄성 #4).
import { type ReactNode } from 'react';

const WIDTHS = {
  narrow: 'max-w-2xl',
  base: 'max-w-3xl',
  wide: 'max-w-5xl',
} as const;

export function PageShell({
  children,
  width = 'base',
}: {
  children: ReactNode;
  width?: keyof typeof WIDTHS;
}) {
  return (
    <main className={`mx-auto flex w-full flex-col gap-8 px-6 py-12 ${WIDTHS[width]}`}>
      {children}
    </main>
  );
}
