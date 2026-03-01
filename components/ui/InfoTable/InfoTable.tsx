import { InfoTableProps } from '@/types/ui/info-table.types';

export function InfoTable<T = Record<string, unknown>>({
  title,
  columns,
  rows,
  emptyMessage = 'Nenhum dado disponível.',
}: InfoTableProps<T>) {
  return (
    <div className="flex flex-col gap-2">
      {title && (
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mt-2">
          {title}
        </p>
      )}
      <div className="bg-secondary/50 border border-border rounded-(--radius-md) overflow-hidden">
        <div
          className="text-xs font-semibold text-muted px-4 py-2 border-b border-border"
          style={{ display: 'grid', gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
        >
          {columns.map((col) => (
            <span key={col.key} className={['overflow-hidden min-w-0', col.className].filter(Boolean).join(' ')}>
              {col.header}
            </span>
          ))}
        </div>
        <div className="divide-y divide-border">
          {rows.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted">{emptyMessage}</div>
          ) : (
            rows.map((row, idx) => (
              <div
                key={idx}
                className="px-4 py-2.5 text-sm"
                style={{ display: 'grid', gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
              >
                {columns.map((col) => (
                  <span key={col.key} className={['overflow-hidden min-w-0', col.className].filter(Boolean).join(' ')}>
                    {col.render(row, idx)}
                  </span>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
