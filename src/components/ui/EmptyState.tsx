// 빈 상태(8.3). 데이터가 없을 때 안내 문구 + 유도 액션. 순수 표현 컴포넌트.
import Link from 'next/link';

type EmptyStateProps = {
  message: string;
  action?: { label: string; href: string };
};

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-neutral-300 px-6 py-12 text-center">
      <p className="text-sm text-neutral-500">{message}</p>
      {action && (
        <Link
          href={action.href}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
