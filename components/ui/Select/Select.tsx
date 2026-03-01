'use client';
import { useId } from 'react';
import { IconChevronDown, IconXCircle } from '@/components/icons';
import { SelectProps } from '@/types/ui/select.types';

export function Select({
  label,
  required,
  error,
  options,
  placeholder,
  value,
  onChange,
  className = '',
  disabled = false,
  hint,
}: SelectProps) {
  const id = useId();
  const hasError = !!error;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-brand ml-0.5">*</span>}
      </label>
      <div className="relative">
        {hasError && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-destructive pointer-events-none">
            <IconXCircle size={18} />
          </span>
        )}
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
          className={[
            'w-full py-3 pr-10 rounded-lg border text-foreground transition-all appearance-none cursor-pointer',
            'focus:outline-none focus:ring-2 focus:border-transparent',
            hasError
              ? 'pl-10 border-destructive bg-destructive/10 focus:ring-destructive/40'
              : 'pl-4 border-border bg-input focus:ring-ring',
            !value ? 'text-muted' : '',
            disabled ? 'opacity-60 cursor-not-allowed' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
          <IconChevronDown size={16} />
        </span>
      </div>
      {hint && <div>{hint}</div>}
      {hasError && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
