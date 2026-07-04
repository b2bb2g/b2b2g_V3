// 버튼 스타일 프리미티브(공통). <button>·<Link> 양쪽에 className 으로 적용해 일관된 버튼 룩.
export const btnBase =
  'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-60';

export const btn = {
  primary: `${btnBase} bg-neutral-900 text-white hover:bg-neutral-800`,
  secondary: `${btnBase} border border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50`,
  danger: `${btnBase} border border-red-300 text-red-600 hover:bg-red-50`,
};
