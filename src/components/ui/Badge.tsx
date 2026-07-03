// 상태 배지(공통). 색상 변형으로 상태를 일관되게 표시. 이모지 미사용.
import { type ReactNode } from 'react';

const VARIANTS = {
  neutral: 'bg-neutral-100 text-neutral-600',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  accent: 'bg-violet-100 text-violet-700',
} as const;

export type BadgeVariant = keyof typeof VARIANTS;

export function Badge({
  variant = 'neutral',
  children,
}: {
  variant?: BadgeVariant;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${VARIANTS[variant]}`}
    >
      {children}
    </span>
  );
}
