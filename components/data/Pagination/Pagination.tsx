'use client';
import { useState, useEffect } from 'react';
import { PaginationProps } from '@/types/ui/pagination.types';
import { IconChevronLeft, IconChevronRight } from '@/components/icons';

export function Pagination({ currentPage, totalPages, totalItems, onPageChange }: PaginationProps) {
  const [inputValue, setInputValue] = useState(String(currentPage));

  useEffect(() => {
    setInputValue(String(currentPage));
  }, [currentPage]);

  function clamp(raw: string): number {
    const n = parseInt(raw);
    if (isNaN(n) || n < 1) return 1;
    if (n > totalPages) return totalPages;
    return n;
  }

  function commit(raw: string) {
    const page = clamp(raw);
    setInputValue(String(page));
    if (page !== currentPage) onPageChange(page);
  }

  return (
    <div className="px-6 py-4 border-x border-b border-border/50 bg-secondary/50 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-b-lg">
      <p className="text-sm text-muted">
        Total de <strong className="text-foreground">{totalItems}</strong>{' '}
        {totalItems === 1 ? 'registro' : 'registros'}
      </p>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 text-muted hover:text-foreground hover:bg-secondary rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none"
          aria-label="Página anterior"
        >
          <IconChevronLeft size={18} />
        </button>

        <div className="flex items-center gap-2 text-sm text-muted">
          <span>Página</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && commit(inputValue)}
            onBlur={() => commit(inputValue)}
            className="w-14 h-8 text-center bg-input border border-border rounded-md text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand hide-arrows"
          />
          <span>de {totalPages}</span>
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 text-muted hover:text-foreground hover:bg-secondary rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none"
          aria-label="Próxima página"
        >
          <IconChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
