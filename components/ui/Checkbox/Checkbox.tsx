'use client';
import { CheckboxProps } from '@/types/ui/checkbox.types';

export function Checkbox({ checked, onChange, label, disabled = false, className = '' }: CheckboxProps) {
  return (
    <label
      className={[
        'flex items-center gap-3 cursor-pointer select-none',
        disabled ? 'opacity-60 cursor-not-allowed' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={[
          'w-5 h-5 flex items-center justify-center border rounded-sm transition-colors shrink-0',
          checked ? 'bg-primary border-primary' : 'bg-input border-border',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {checked && (
          <svg
            className="w-3.5 h-3.5 text-primary-fg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
      </div>
      {label && (
        <span className="text-sm font-semibold text-foreground leading-snug">{label}</span>
      )}
    </label>
  );
}
