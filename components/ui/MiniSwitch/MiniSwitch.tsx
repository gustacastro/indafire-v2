'use client';

import { MiniSwitchProps } from '@/types/ui/mini-switch.types';

export function MiniSwitch({ checked, onChange, label, disabled = false }: MiniSwitchProps) {
  return (
    <label
      className={[
        'inline-flex items-center gap-2 cursor-pointer select-none',
        disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="text-[10px] font-bold text-muted tracking-wider uppercase">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          'relative inline-flex items-center w-7 h-3.5 rounded-full transition-colors duration-200 focus:outline-none',
          checked ? 'bg-brand' : 'bg-border',
          disabled ? 'cursor-not-allowed' : 'cursor-pointer',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label={label}
      >
        <span
          className={[
            'absolute left-0.5 inline-block w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-transform duration-200',
            checked ? 'translate-x-3.5' : 'translate-x-0',
          ]
            .filter(Boolean)
            .join(' ')}
        />
      </button>
    </label>
  );
}
