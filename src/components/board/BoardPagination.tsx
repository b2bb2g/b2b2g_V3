// 번호형 페이지네이션(게시판 공용). 현재 페이지 강조 + 앞뒤 화살표 + 말줄임. 서버 컴포넌트.
import Link from 'next/link';

export function BoardPagination({
  page,
  total,
  pageSize,
  basePath,
  params = {},
}: {
  page: number;
  total: number;
  pageSize: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
    if (p > 1) sp.set('page', String(p));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  // 현재 페이지 주변 최대 5개 + 양끝. 말줄임 처리.
  const window = 2;
  const nums: (number | 'gap')[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= page - window && p <= page + window)) {
      nums.push(p);
    } else if (nums[nums.length - 1] !== 'gap') {
      nums.push('gap');
    }
  }

  const arrow = 'grid h-9 w-9 place-items-center rounded-lg border border-neutral-200 text-neutral-500 hover:border-neutral-400';
  const disabled = 'pointer-events-none opacity-40';

  return (
    <nav className="flex items-center justify-center gap-1.5">
      <Link href={href(page - 1)} className={`${arrow} ${page <= 1 ? disabled : ''}`} aria-label="prev">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 6l-6 6 6 6" />
        </svg>
      </Link>
      {nums.map((n, i) =>
        n === 'gap' ? (
          <span key={`gap-${i}`} className="px-1 text-sm text-neutral-400">
            …
          </span>
        ) : (
          <Link
            key={n}
            href={href(n)}
            aria-current={n === page ? 'page' : undefined}
            className={`grid h-9 w-9 place-items-center rounded-lg text-sm ${
              n === page
                ? 'bg-blue-600 font-semibold text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {n}
          </Link>
        ),
      )}
      <Link
        href={href(page + 1)}
        className={`${arrow} ${page >= totalPages ? disabled : ''}`}
        aria-label="next"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </Link>
    </nav>
  );
}
