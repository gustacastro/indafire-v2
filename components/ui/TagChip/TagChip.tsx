import { TagChipProps, TagChipVariant } from '@/types/ui/tag-chip.types';

const variantClasses: Record<TagChipVariant, string> = {
  default: 'bg-secondary border-border text-foreground',
  primary: 'bg-primary/10 border-primary/20 text-primary',
  brand: 'bg-brand/10 border-brand/20 text-brand',
};

export function TagChip({ label, variant = 'default' }: TagChipProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 border text-xs font-medium rounded-md',
        variantClasses[variant],
      ].join(' ')}
    >
      {label}
    </span>
  );
}
