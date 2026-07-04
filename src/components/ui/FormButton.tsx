'use client';
// 폼 제출 버튼(8.3). useFormStatus 로 처리중 상태를 감지해 스피너·중복클릭 차단.
import { useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';

type FormButtonProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'danger';
};

const VARIANTS: Record<NonNullable<FormButtonProps['variant']>, string> = {
  primary: 'bg-neutral-900 text-white hover:bg-neutral-800',
  outline: 'border border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50',
  danger: 'bg-red-600 text-white hover:bg-red-500',
};

export function FormButton({ children, variant = 'primary' }: FormButtonProps) {
  const t = useTranslations('common');
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition disabled:opacity-60 ${VARIANTS[variant]}`}
    >
      {pending && (
        <span
          aria-hidden
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {pending ? t('loading') : children}
    </button>
  );
}
