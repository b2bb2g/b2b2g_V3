'use client';
// 편집기 제출 버튼. 폼 외부에 있어도 requestSubmit()로 확실히 제출(서버 액션 트리거). intent 는 히든 인풋에 주입.
export function EditorSubmit({
  formId,
  intent,
  primary,
  children,
}: {
  formId: string;
  intent: 'draft' | 'publish';
  primary?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        const form = document.getElementById(formId) as HTMLFormElement | null;
        if (!form) return;
        const inp = form.querySelector('input[name="intent"]') as HTMLInputElement | null;
        if (inp) inp.value = intent;
        form.requestSubmit();
      }}
      className={
        primary
          ? 'rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700'
          : 'rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:border-neutral-400'
      }
    >
      {children}
    </button>
  );
}
