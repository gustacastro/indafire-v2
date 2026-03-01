'use client';
import { useId } from 'react';
import { IconXCircle } from '@/components/icons';
import { TextAreaProps } from '@/types/ui/textarea.types';

export function TextArea({ label, required, error, className = '', ...props }: TextAreaProps) {
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
          <span className="absolute left-3 top-3 text-destructive pointer-events-none">
            <IconXCircle size={18} />
          </span>
        )}
        <textarea
          id={id}
          required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
          className={[
            'w-full py-3 rounded-lg border text-foreground placeholder:text-muted transition-all resize-none',
            'focus:outline-none focus:ring-2 focus:border-transparent',
            hasError
              ? 'pl-10 pr-4 border-destructive bg-destructive/10 focus:ring-destructive/40'
              : 'px-4 border-border bg-input focus:ring-ring',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
      </div>
      {hasError && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
