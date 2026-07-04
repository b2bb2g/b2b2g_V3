// 라우트별 카테고리 아이콘(이모지 금지 → 인라인 SVG). 모바일·데스크톱 공용. 미매칭은 기본 아이콘.
import type { ReactNode } from 'react';

const PATHS: Record<string, ReactNode> = {
  '/commercial': <path d="M4 9h16v11H4V9zm0 0l1.5-5h13L20 9M9 20v-6h6v6" />,
  '/industrial': <path d="M4 20V10l5 3V10l5 3V6l6 4v10H4z" />,
  '/epc': (
    <>
      <path d="M14 6l4 4-8 8-4 1 1-4 7-9z" />
      <path d="M12 8l4 4" />
    </>
  ),
  '/requests': (
    <>
      <rect x="6" y="4" width="12" height="16" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </>
  ),
  '/events': (
    <>
      <rect x="4" y="6" width="16" height="14" rx="2" />
      <path d="M4 10h16M8 4v4M16 4v4" />
    </>
  ),
  '/services': (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4v2M12 18v2M4 12h2M18 12h2M6 6l1.5 1.5M16.5 16.5L18 18M18 6l-1.5 1.5M7.5 16.5L6 18" />
    </>
  ),
  '/faq': (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M9.5 9.5a2.5 2.5 0 0 1 4 2c0 1.5-2 2-2 3M12 17h.01" />
    </>
  ),
};

export function CategoryIcon({ route, className }: { route: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
      {PATHS[route] ?? <path d="M4 12l8-8 8 8-8 8-8-8z" />}
    </svg>
  );
}
