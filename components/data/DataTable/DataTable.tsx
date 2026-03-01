'use client';
import { DataTableProps } from '@/types/ui/data-table.types';

export function DataTable<T extends { id: string }>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'Nenhum item encontrado.',
  visibleColumns,
}: DataTableProps<T>) {
  const visible = columns.filter((c) => visibleColumns.includes(c.key));

  return (
    <div className="bg-card/80 border border-border/50 rounded-t-lg shadow-sm">
      <div className="overflow-x-auto overflow-y-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/50 bg-secondary/50">
              {visible.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-4 text-xs font-semibold text-muted uppercase tracking-wider whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {visible.map((col) => (
                      <td key={col.key} className="px-6 py-4">
                        <div className="h-4 bg-secondary rounded-md animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : data.length === 0
                ? (
                  <tr>
                    <td
                      colSpan={visible.length}
                      className="px-6 py-12 text-center text-sm text-muted"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                )
                : data.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-secondary/40 transition-colors"
                  >
                    {visible.map((col) => (
                      <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                        {col.render
                          ? col.render(row)
                          : String((row as Record<string, unknown>)[col.key] ?? '')}
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
