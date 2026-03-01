'use client';
import { useState, useRef, useEffect } from 'react';
import { PerPageSelectProps, DEFAULT_PAGE_OPTIONS } from '@/types/ui/per-page-select.types';
import { Tooltip } from '@/components/ui/Tooltip/Tooltip';
import { IconChevronDown } from '@/components/icons';

export function PerPageSelect({ value, onChange, options = DEFAULT_PAGE_OPTIONS }: PerPageSelectProps) {
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

  return (
    <div ref={containerRef} className="relative">
      <Tooltip content="Itens por página" side="top">
        <button
          onClick={() => setOpen((v) => !v)}
          className={[
            'flex items-center gap-1.5 px-3 py-2 bg-card/60 backdrop-blur-sm border rounded-lg text-sm transition-colors shadow-sm',
            open
              ? 'border-brand text-brand bg-brand/5'
              : 'border-border text-secondary-fg hover:text-foreground hover:bg-card',
          ].join(' ')}
        >
          <span className="hidden sm:inline">Itens por página</span>
          <span>{value}</span>
          <IconChevronDown size={14} className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
        </button>
      </Tooltip>

      <div
        className={[
          'absolute right-0 top-full mt-2 z-50 bg-card border border-border rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.12)] dark:shadow-black/40 py-1.5 min-w-28 transition-all duration-150',
          open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none',
        ].join(' ')}
        style={{ transformOrigin: 'top right' }}
      >
        <p className="px-3 pb-1.5 text-xs font-semibold text-muted uppercase tracking-wider border-b border-border mb-1">
          Por página
        </p>
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => {
              onChange(opt);
              setOpen(false);
            }}
            className={[
              'w-full flex items-center justify-between px-3 py-2 text-sm transition-colors',
              value === opt
                ? 'text-brand font-medium'
                : 'text-foreground hover:bg-secondary',
            ].join(' ')}
          >
            <span>{opt} itens</span>
            {value === opt && <span className="w-1.5 h-1.5 rounded-full bg-brand" />}
          </button>
        ))}
      </div>
    </div>
  );
}
