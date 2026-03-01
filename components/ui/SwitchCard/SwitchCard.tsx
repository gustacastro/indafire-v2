'use client';
import { Toggle } from '@/components/ui/Toggle/Toggle';
import { SwitchCardProps } from '@/types/ui/switch-card.types';

export function SwitchCard({
  checked,
  onChange,
  title,
  description,
  activeDescription,
  disabled = false,
}: SwitchCardProps) {
  return (
    <label
      className={[
        'flex items-start gap-4 p-4 border rounded-(--radius-lg) transition-all',
        'bg-card border-border hover:border-primary/30 cursor-pointer',
        disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="mt-0.5 shrink-0">
        <Toggle checked={checked} onChange={onChange} disabled={disabled} size="md" label={title} />
      </div>
      <div>
        <p className="text-sm font-semibold text-heading">{title}</p>
        {activeDescription && checked ? (
          <p className="text-xs text-success mt-1 font-medium">{activeDescription}</p>
        ) : (
          <p className="text-xs text-muted mt-1">{description}</p>
        )}
      </div>
    </label>
  );
}
