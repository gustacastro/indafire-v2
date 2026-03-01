'use client';
import { useState, useRef, useEffect } from 'react';
import { ColumnToggleProps } from '@/types/ui/data-table.types';
import { Tooltip } from '@/components/ui/Tooltip/Tooltip';
import { IconColumns, IconCheck } from '@/components/icons';

export function ColumnToggle<T>({ columns, visibleColumns, onChange }: ColumnToggleProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  function toggle(key: string) {
    const col = columns.find((c) => c.key === key);
    if (col?.canHide === false) return;
    const next = visibleColumns.includes(key)
      ? visibleColumns.filter((k) => k !== key)
      : [...visibleColumns, key];
    onChange(next);
  }

  function selectAll() {
    onChange(columns.map((c) => c.key));
  }

  function deselectAll() {
    onChange(columns.filter((c) => c.canHide === false).map((c) => c.key));
  }

  const hiddenCount = columns.filter((c) => c.canHide !== false && !visibleColumns.includes(c.key)).length;
  const hideableColumns = columns.filter((c) => c.canHide !== false);
  const allSelected = hideableColumns.every((c) => visibleColumns.includes(c.key));
  const noneSelected = hideableColumns.every((c) => !visibleColumns.includes(c.key));
  const isCustom = !allSelected && !noneSelected;

  return (
    <div ref={containerRef} className="relative">
      <Tooltip content="Colunas visíveis" side="top">
        <button
          onClick={() => setOpen((v) => !v)}
          className={[
            'flex items-center gap-2 px-3 py-2 bg-card border rounded-lg text-sm transition-colors shadow-sm',
            open
              ? 'border-brand text-brand bg-brand/5'
              : 'border-border text-secondary-fg hover:text-foreground hover:bg-secondary',
          ].join(' ')}
        >
              <span>Colunas</span>

          <IconColumns size={16} />
          {hiddenCount > 0 && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-brand text-primary-fg text-[10px] font-bold leading-none">
              {hiddenCount}
            </span>
          )}
        </button>
      </Tooltip>

      <div
        className={[
          'absolute right-0 top-full mt-2 z-50 bg-card border border-border rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.12)] dark:shadow-black/40 w-max min-w-40 py-2 transition-all duration-200',
          open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none',
        ].join(' ')}
        style={{ transformOrigin: 'top right' }}
      >
        <div className="px-3 pb-2 border-b border-border mb-1 flex items-center justify-between gap-4">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">Colunas</p>
          <div className="flex items-center gap-1">
            <button
              onClick={selectAll}
              disabled={allSelected}
              className={[
                'text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors cursor-pointer',
                allSelected
                  ? 'text-muted cursor-default'
                  : 'text-foreground hover:bg-secondary',
              ].join(' ')}
            >
              Todas
            </button>
            <span className="text-border">|</span>
            <button
              onClick={deselectAll}
              disabled={noneSelected}
              className={[
                'text-[11px] font-medium px-2 py-0.5 rounded-md transition-colors cursor-pointer',
                noneSelected
                  ? 'text-muted cursor-default'
                  : 'text-foreground hover:bg-secondary',
              ].join(' ')}
            >
              Nenhuma
            </button>
          </div>
        </div>
        {columns.map((col) => {
          const isVisible = visibleColumns.includes(col.key);
          const isFixed = col.canHide === false;
          return (
            <button
              key={col.key}
              onClick={() => toggle(col.key)}
              disabled={isFixed}
              className={[
                'w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                isFixed
                  ? 'text-muted cursor-default'
                  : 'text-foreground hover:bg-secondary cursor-pointer',
              ].join(' ')}
            >
              <span
                className={[
                  'w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors',
                  isVisible
                    ? 'bg-brand border-brand'
                    : 'border-border',
                ].join(' ')}
              >
                {isVisible && <IconCheck size={10} className="text-primary-fg" strokeWidth={3} />}
              </span>
              <span className="whitespace-nowrap">{col.label}</span>
              {isFixed && <span className="ml-auto text-[10px] text-muted">fixo</span>}
            </button>
          );
        })}
        <p className="px-3 pt-2 text-[11px] text-muted border-t border-border mt-1">
          {columns.length - hiddenCount} de {columns.length} visíve{columns.length - hiddenCount !== 1 ? 'is' : ''}
        </p>
      </div>
    </div>
  );
}
