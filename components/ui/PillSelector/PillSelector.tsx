'use client';

import { PillSelectorProps } from '@/types/ui/pill-selector.types';

export function PillSelector({ label, required, options, value, onChange, error, size = 'md', disabled }: PillSelectorProps) {
  const pillClass = size === 'sm'
    ? 'px-2.5 py-1 text-xs font-semibold rounded-(--radius-md)'
    : 'px-4 py-2 text-sm font-semibold rounded-(--radius-lg)';

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-brand ml-0.5">*</span>}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => !disabled && onChange(opt.value)}
            className={[
              pillClass,
              disabled ? 'opacity-60 cursor-not-allowed' : '',
              value === opt.value
                ? 'bg-primary text-primary-fg border border-primary transition-all cursor-pointer'
                : 'bg-card text-foreground border border-border hover:bg-secondary transition-all cursor-pointer',
            ].join(' ')}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-error mt-0.5">{error}</p>}
    </div>
  );
}
