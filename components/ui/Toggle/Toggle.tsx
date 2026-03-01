'use client';
import { ToggleProps, ToggleSize } from '@/types/ui/toggle.types';

const trackSize: Record<ToggleSize, string> = {
  sm: 'w-8 h-4',
  md: 'w-10 h-6',
};

const thumbSize: Record<ToggleSize, string> = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
};

const thumbTranslate: Record<ToggleSize, string> = {
  sm: 'translate-x-4',
  md: 'translate-x-[1.125rem]',
};

export function Toggle({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  label,
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
        trackSize[size],
        checked ? 'bg-primary' : 'bg-border',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={label}
    >
      <span
        className={[
          'absolute left-0.5 inline-block rounded-full bg-white shadow-sm transition-transform duration-200',
          thumbSize[size],
          checked ? thumbTranslate[size] : 'translate-x-0',
        ]
          .filter(Boolean)
          .join(' ')}
      />
    </button>
  );
}
