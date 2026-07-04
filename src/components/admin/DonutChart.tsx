// 도넛 차트(SVG, 라이브러리 없음). 세그먼트 비율을 stroke-dasharray 로 그린다. 중앙에 합계.
export type DonutSegment = { label: string; value: number; color: string };

export function DonutChart({ segments }: { segments: DonutSegment[] }) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  const sum = total || 1;
  const r = 42;
  const c = 2 * Math.PI * r;
  const arcs = segments.reduce<{ seg: DonutSegment; len: number; offset: number }[]>((acc, s) => {
    const prev = acc.length ? acc[acc.length - 1] : null;
    const offset = prev ? prev.offset + prev.len : 0;
    acc.push({ seg: s, len: (s.value / sum) * c, offset });
    return acc;
  }, []);

  return (
    <div className="relative h-40 w-40 shrink-0">
      <svg viewBox="0 0 100 100" className="h-40 w-40 -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="12" />
        {arcs.map(({ seg, len, offset }) => (
          <circle
            key={seg.label}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="12"
            strokeDasharray={`${len} ${c - len}`}
            strokeDashoffset={-offset}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold tabular-nums">{total.toLocaleString()}</span>
      </div>
    </div>
  );
}
