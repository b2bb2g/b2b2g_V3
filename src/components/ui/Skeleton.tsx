// 스켈레톤(8.3 로딩 상태). 목록·상세 로딩 시 빈 골격 표시. 순수 표현 컴포넌트.
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-neutral-200 ${className}`} />;
}
