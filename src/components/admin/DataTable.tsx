// 관리자 데이터 테이블(공통). 헤더 + 행(셀은 ReactNode). 카드 래퍼 + 가로 스크롤.
import { type ReactNode } from 'react';

export type Column = { key: string; label: string; className?: string };
export type Row = { id: string; cells: ReactNode[] };

export function DataTable({ columns, rows }: { columns: Column[]; rows: Row[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {columns.map((c) => (
                <th key={c.key} className={`px-4 py-3 font-semibold ${c.className ?? ''}`}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-neutral-50">
                {r.cells.map((cell, i) => (
                  <td key={columns[i]?.key ?? i} className={`px-4 py-3 align-middle ${columns[i]?.className ?? ''}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
