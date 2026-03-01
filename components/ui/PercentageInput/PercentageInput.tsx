'use client';
import { useId } from 'react';
import { IconXCircle } from '@/components/icons';
import { PercentageInputProps } from '@/types/ui/percentage-input.types';
import { maskPercentageInput } from '@/utils/currency';

export function PercentageInput({
  label,
  required,
  error,
  value,
  onChange,
  placeholder = '0,00',
  className = '',
  disabled = false,
}: PercentageInputProps) {
  const id = useId();
  const hasError = !!error;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const masked = maskPercentageInput(e.target.value);
    onChange(masked);
  }

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
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
          className={[
            'w-full py-3 rounded-lg border text-foreground placeholder:text-muted transition-all font-semibold',
            'focus:outline-none focus:ring-2 focus:border-transparent',
            hasError
              ? 'pl-10 pr-10 border-destructive bg-destructive/10 focus:ring-destructive/40'
              : 'pl-4 pr-10 border-border bg-input focus:ring-ring',
            disabled ? 'opacity-60 cursor-not-allowed' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted font-semibold text-sm pointer-events-none select-none">
          %
        </span>
      </div>
      {hasError && (
        <p id={`${id}-error`} className="text-xs text-destructive mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
}
