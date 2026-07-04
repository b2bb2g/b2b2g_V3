// 수평 막대 차트(CSS, 라이브러리 없음). 최대값 기준 비율로 폭을 계산.
export type Bar = { label: string; value: number; color?: string };

export function BarChart({ bars }: { bars: Bar[] }) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  return (
    <div className="flex flex-col gap-3">
      {bars.map((b) => (
        <div key={b.label} className="flex items-center gap-3 text-sm">
          <span className="w-24 shrink-0 truncate text-neutral-500">{b.label}</span>
          <div className="h-2 flex-1 rounded-full bg-neutral-100">
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${(b.value / max) * 100}%`, background: b.color ?? '#171717' }}
            />
          </div>
          <span className="w-8 shrink-0 text-right font-medium tabular-nums">{b.value}</span>
        </div>
      ))}
    </div>
  );
}
