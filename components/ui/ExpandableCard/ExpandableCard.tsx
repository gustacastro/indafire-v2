'use client';
import { Toggle } from '@/components/ui/Toggle/Toggle';
import { ExpandableCardProps } from '@/types/ui/expandable-card.types';

export function ExpandableCard({
  title,
  description,
  icon,
  checked,
  onChange,
  children,
}: ExpandableCardProps) {
  return (
    <div
      className={[
        'bg-card border rounded-(--radius-lg) overflow-hidden transition-colors duration-200',
        checked ? 'border-primary/50' : 'border-border',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className={[
          'flex items-center justify-between gap-4 px-6 py-5 cursor-pointer transition-colors bg-primary/5',
          checked ? 'border-b border-border' : 'hover:bg-secondary/40',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => onChange(!checked)}
      >
        <div className="flex items-center gap-4">
          {icon && 
            <div
                className={[
                'flex items-center justify-center w-10 h-10 rounded-(--radius-lg) border transition-colors',
                checked
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-secondary border-border text-muted',
                ]
                .filter(Boolean)
                .join(' ')}
            >
                {icon}
            </div>
          }
          <div>
            <p className="text-sm font-semibold text-heading">{title}</p>
            <p className="text-xs text-muted mt-0.5">{description}</p>
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <Toggle checked={checked} onChange={onChange} size="md" label={title} />
        </div>
      </div>

      {checked && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  );
}
