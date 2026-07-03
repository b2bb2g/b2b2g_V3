'use client';
// 비밀번호 입력 + 표시/숨김 토글(8.2). 기본은 숨김, 접근성 라벨·키보드 포커스 지원.
import { useId, useState } from 'react';
import { useTranslations } from 'next-intl';

type PasswordInputProps = {
  name: string;
  autoComplete?: 'current-password' | 'new-password';
  required?: boolean;
  minLength?: number;
  hint?: string;
};

export function PasswordInput({
  name,
  autoComplete = 'current-password',
  required,
  minLength,
  hint,
}: PasswordInputProps) {
  const t = useTranslations('ui');
  const [visible, setVisible] = useState(false);
  const hintId = useId();

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          name={name}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          aria-describedby={hint ? hintId : undefined}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 pr-16"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? t('hidePassword') : t('showPassword')}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-neutral-600"
        >
          {visible ? t('hide') : t('show')}
        </button>
      </div>
      {hint && (
        <span id={hintId} className="text-xs text-neutral-500">
          {hint}
        </span>
      )}
    </div>
  );
}
