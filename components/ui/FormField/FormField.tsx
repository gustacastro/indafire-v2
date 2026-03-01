'use client';

import { useState, useId } from 'react';
import toast from 'react-hot-toast';
import { IconEye, IconEyeOff, IconXCircle, IconCopy } from '@/components/icons';
import { MiniSwitch } from '@/components/ui/MiniSwitch/MiniSwitch';
import { FormFieldProps } from '@/types/ui/form-field.types';

export function FormField({ label, required, type, error, hint, copy, showCount, inlineSwitch, className = '', ...props }: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const id = useId();
  const isPassword = type === 'password';
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const hasError = !!error;
  const hasRightIcon = isPassword || copy;

  async function handleCopy() {
    const value = String(props.value ?? '');
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success('Copiado para a área de transferência.');
    } catch {
      toast.error('Não foi possível copiar.');
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-sm font-medium text-foreground"
        >
          {label}
          {required && <span className="text-brand ml-0.5">*</span>}
        </label>
        {inlineSwitch && (
          <MiniSwitch
            checked={inlineSwitch.checked}
            onChange={inlineSwitch.onChange}
            label={inlineSwitch.label}
          />
        )}
      </div>
      <div className="relative">
        {hasError && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-destructive pointer-events-none">
            <IconXCircle size={18} />
          </span>
        )}
        <input
          id={id}
          type={resolvedType}
          required={required}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
          className={[
            'w-full py-3 rounded-lg border text-foreground placeholder:text-muted transition-all',
            'focus:outline-none focus:ring-2 focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            hasError
              ? 'pl-10 pr-4 border-destructive bg-destructive/10 focus:ring-destructive/40'
              : 'px-4 border-border bg-input focus:ring-ring',
            hasRightIcon ? 'pr-12' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-foreground transition-colors focus:outline-none"
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
          </button>
        )}
        {copy && !isPassword && (
          <button
            type="button"
            onClick={handleCopy}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-foreground transition-colors focus:outline-none"
            aria-label="Copiar"
          >
            <IconCopy size={18} />
          </button>
        )}
      </div>
      {(hint || (showCount && props.maxLength !== undefined)) && !hasError && (
        <div className="flex items-center justify-between">
          {hint ? <p className="text-xs text-muted">{hint}</p> : <span />}
          {showCount && props.maxLength !== undefined && (
            <p className="text-xs text-muted">
              {String(props.value ?? '').length}/{props.maxLength}
            </p>
          )}
        </div>
      )}
      {hasError && (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
