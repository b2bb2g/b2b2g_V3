'use client';
// 확인 다이얼로그 버튼(8.1). 파괴적·중요 동작(로그아웃·삭제·탈퇴) 전에 재확인을 받는다.
// 확인은 서버 액션 폼으로 제출해 FormButton(처리중 상태)을 재사용한다.
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { FormButton } from './FormButton';

type ConfirmButtonProps = {
  action: () => void | Promise<void>;
  children: React.ReactNode;
  title: string;
  description?: string;
  confirmLabel: string;
  variant?: 'primary' | 'danger';
};

export function ConfirmButton({
  action,
  children,
  title,
  description,
  confirmLabel,
  variant = 'primary',
}: ConfirmButtonProps) {
  const t = useTranslations('ui');
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-neutral-600 underline"
      >
        {children}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        >
          <div className="flex w-full max-w-sm flex-col gap-4 rounded-lg bg-white p-6 shadow-xl">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold">{title}</h2>
              {description && <p className="text-sm text-neutral-600">{description}</p>}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium"
              >
                {t('cancel')}
              </button>
              <form action={action}>
                <FormButton variant={variant}>{confirmLabel}</FormButton>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
