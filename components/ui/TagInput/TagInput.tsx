'use client';
import { useId, useRef } from 'react';
import { IconX } from '@/components/icons';
import { TagInputProps } from '@/types/ui/tag-input.types';

export function TagInput({
  label,
  required,
  error,
  value,
  onChange,
  placeholder = 'Digite e pressione Enter',
  className = '',
}: TagInputProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const hasError = !!error;

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const raw = inputRef.current?.value.trim();
      if (raw && !value.includes(raw)) {
        onChange([...value, raw]);
      }
      if (inputRef.current) inputRef.current.value = '';
    } else if (e.key === 'Backspace' && !inputRef.current?.value && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-brand ml-0.5">*</span>}
      </label>
      <div
        className={[
          'flex flex-wrap items-center gap-1.5 px-2 py-2 rounded-lg border transition-all cursor-text min-h-11.5',
          'focus-within:outline-none focus-within:ring-2 focus-within:border-transparent focus-within:ring-ring',
          hasError ? 'border-destructive bg-destructive/10' : 'border-border bg-input',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 bg-secondary border border-border text-foreground text-xs font-medium rounded-md"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-muted hover:text-destructive transition-colors p-0.5 rounded"
              aria-label={`Remover ${tag}`}
            >
              <IconX size={11} strokeWidth={3} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={id}
          type="text"
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : 'Adicionar...'}
          className="flex-1 min-w-30 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none px-1.5 py-0.5"
        />
      </div>
      {hasError && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
