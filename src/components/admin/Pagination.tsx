// 페이지네이션(공통, URL 기반). 현재 검색 파라미터를 유지하며 page 만 바꾼다.
import Link from 'next/link';
import { btn } from '@/components/ui/button';

export function Pagination({
  page,
  total,
  pageSize,
  basePath,
  params,
  prevLabel,
  nextLabel,
}: {
  page: number;
  total: number;
  pageSize: number;
  basePath: string;
  params: Record<string, string | undefined>;
  prevLabel: string;
  nextLabel: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
    sp.set('page', String(p));
    return `${basePath}?${sp.toString()}`;
  };

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-neutral-500 tabular-nums">
        {page} / {totalPages}
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={href(page - 1)} className={btn.secondary}>
            {prevLabel}
          </Link>
        ) : (
          <span className={`${btn.secondary} pointer-events-none opacity-40`}>{prevLabel}</span>
        )}
        {page < totalPages ? (
          <Link href={href(page + 1)} className={btn.secondary}>
            {nextLabel}
          </Link>
        ) : (
          <span className={`${btn.secondary} pointer-events-none opacity-40`}>{nextLabel}</span>
        )}
      </div>
    </div>
  );
}
